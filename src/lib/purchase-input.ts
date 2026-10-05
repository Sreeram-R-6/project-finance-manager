import { parseMoney } from "./money";
type Item = {
  description: string;
  quantity: string;
  price: string;
  tax: string;
  discount: string;
  asset: boolean;
};
type Allocation = { source_type: string; target: string; amount: string };
export function purchasePayload(values: Record<string, unknown>) {
  const clean = Object.fromEntries(
    Object.entries(values).filter(([, v]) => v !== ""),
  );
  return {
    ...clean,
    tags: String(values.tags || "")
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean),
    shipping_minor: parseMoney(String(values.shipping || "0")).toString(),
    items: (values.items as Item[]).map((i) => ({
      description: i.description,
      quantity: i.quantity,
      unit_price_minor: parseMoney(i.price).toString(),
      tax_minor: parseMoney(i.tax || "0").toString(),
      discount_minor: parseMoney(i.discount || "0").toString(),
      mark_as_asset: i.asset,
    })),
    allocations: (values.allocations as Allocation[]).map((a) => ({
      source_type: a.source_type,
      amount_minor: parseMoney(a.amount).toString(),
      [a.source_type === "MEMBER"
        ? "member_user_id"
        : a.source_type === "ADVANCE"
          ? "advance_id"
          : a.source_type === "EXTERNAL"
            ? "funding_source_id"
            : "project_account_id"]: a.target,
    })),
  };
}
