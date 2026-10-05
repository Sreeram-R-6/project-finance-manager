import { z } from "zod";
export const commandSchema = z
  .object({
    type: z.enum([
      "FUNDING",
      "PURCHASE",
      "BILL",
      "BILL_PAYMENT",
      "REIMBURSEMENT",
      "ADVANCE",
      "ADVANCE_TOPUP",
      "ADVANCE_RETURN",
      "REFUND",
      "TRANSFER",
      "REVERSAL",
      "ADJUSTMENT",
      "RECOVERY",
      "NONREIMBURSABLE",
      "VENDOR_CREDIT",
    ]),
    idempotency_key: z.string().uuid(),
    source_id: z.string().uuid().optional(),
    amount_minor: z.string().regex(/^\d+$/).optional(),
    account_id: z.string().uuid().optional(),
    description: z.string().max(1000).optional(),
    reason: z.string().max(2000).optional(),
  })
  .passthrough();
export const purchaseSchema = z
  .object({
    items: z
      .array(
        z.object({
          description: z.string().min(1),
          quantity: z.string().regex(/^\d+(\.\d{1,6})?$/),
          unit_price_minor: z.string().regex(/^\d+$/),
          tax_minor: z.string().regex(/^\d+$/).optional(),
          discount_minor: z.string().regex(/^\d+$/).optional(),
          mark_as_asset: z.boolean().optional(),
        }),
      )
      .min(1),
    allocations: z
      .array(
        z
          .object({
            source_type: z.enum([
              "PROJECT_ACCOUNT",
              "MEMBER",
              "ADVANCE",
              "EXTERNAL",
            ]),
            amount_minor: z.string().regex(/^\d+$/),
          })
          .passthrough(),
      )
      .min(1),
  })
  .passthrough();
export const errors: Record<string, string> = {
  PERMISSION_DENIED: "Your role does not allow this action.",
  PROJECT_CLOSED: "This project is closed to new financial entries.",
  ALLOCATION_MISMATCH: "Funding splits must equal the purchase total.",
  PAYMENT_EXCEEDS_OUTSTANDING: "Payment exceeds the remaining balance.",
  APPROVAL_REQUIRED: "Submit this record for approval before posting.",
  BUDGET_EXCEEDED: "This would exceed a budget with a hard stop.",
  SELF_APPROVAL_FORBIDDEN: "Another eligible person must approve this record.",
  REVERSE_DEPENDENCIES_FIRST: "Reverse linked payments or settlements first.",
  ENTITLEMENT_RESERVED: "This expense is already reserved in another claim.",
  NO_ELIGIBLE_APPROVER: "The approval policy has no eligible approver.",
  SOLE_OWNER: "Transfer ownership before removing the only owner.",
};
export function friendlyError(message: string) {
  return (
    Object.entries(errors).find(([code]) => message.includes(code))?.[1] ??
    "The operation could not be completed. Check the values and your permissions, then try again."
  );
}
export type Row = Record<
  string,
  string | number | boolean | null | Record<string, unknown>
>;
export type Summary = Record<
  | "cash"
  | "expense"
  | "payable"
  | "bills"
  | "advances"
  | "funding"
  | "reserved"
  | "available",
  string
>;
