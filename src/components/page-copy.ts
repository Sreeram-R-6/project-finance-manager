export const descriptions: Record<string, string> = {
  transactions: "Every money movement, in one clear history.",
  purchases: "What you bought, how much it cost and who paid.",
  bills: "Know who needs paying, and when.",
  reimbursements: "Take care of the people who paid for your project.",
  advances: "Money given to your team, ready to account for.",
  requests: "Plan a purchase before your team spends.",
  people: "The people behind your project, and what you owe them.",
  budgets: "Make room for what matters, without overspending.",
  vendors: "The suppliers helping your project take shape.",
  assets: "Keep track of the things your project owns.",
  documents: "Receipts, letters and statements, all together.",
  reports: "Understand your money. Share a clear picture.",
  activity: "A shared history of what’s happened in your project.",
  settings: "Set up the way your project works.",
};
export const addLabels: Record<string, string> = {
  transactions: "Add funding",
  purchases: "Add purchase",
  bills: "Add bill",
  reimbursements: "Request reimbursement",
  advances: "New advance",
  requests: "New request",
  budgets: "Add budget",
  vendors: "Add vendor",
  assets: "Add asset",
};
export const fieldLabels: Record<string, string> = {
  transaction_total_minor: "Amount",
  total_minor: "Total",
  requested_minor: "Requested",
  amount_minor: "Amount",
  estimated_minor: "Estimate",
  gross_minor: "Original amount",
  net_minor: "After refunds",
  refunds_minor: "Refunded",
  credits_minor: "Credits",
  outstanding_minor: "Still to settle",
  remaining_minor: "Still to reimburse",
  purchase_date: "Purchased",
  due_date: "Due",
  event_date: "Date",
  invoice_number: "Invoice",
  full_name: "Name",
  member_user_id: "Team member",
  purchased_by_user_id: "Purchased by",
  project_account_id: "Project account",
  financial_event_id: "Transaction",
  created_by: "Created by",
  posted_by: "Completed by",
  source_type: "Who paid",
  paid_minor: "Paid",
  approved_minor: "Approved",
  personal_spend_minor: "Paid personally",
  reimbursement_outstanding_minor: "Owed to member",
  advance_outstanding_minor: "Advance to settle",
  planned_minor: "Budget",
  actual_minor: "Spent",
  committed_minor: "Set aside",
  sanctioned_amount_minor: "Approved funding",
  start_date: "Starts",
  end_date: "Ends",
  created_at: "Created",
  joined_at: "Joined",
  reference_number: "Reference",
  entity_type: "Type",
  is_active: "Active",
  rule_json: "Approval rules",
  command_hash: "Internal reference",
  id: "Reference",
  project_id: "Project",
  description: "Description",
  reverses_event_id: "Reverses transaction",
  corrects_event_id: "Corrects transaction",
  unit_price_minor: "Unit price",
  line_total_minor: "Total",
  tax_minor: "Tax",
  discount_minor: "Discount",
  payment_method: "Payment method",
  transaction_reference: "Payment reference",
};
export function fieldLabel(key: string) {
  return (
    fieldLabels[key] ||
    key
      .replaceAll("_minor", "")
      .replaceAll("_", " ")
      .replace(/^./, (c) => c.toUpperCase())
  );
}
export function recordTitle(r: Record<string, unknown>) {
  return String(
    r.item_summary ||
      r.name ||
      r.title ||
      (r.description &&
      String(r.description).replaceAll("_", " ") ===
        String(r.event_type).replaceAll("_", " ")
        ? humanLabel(String(r.event_type))
        : r.description) ||
      r.purpose ||
      r.item_summary ||
      r.original_filename ||
      r.summary ||
      r.notes ||
      r.invoice_number ||
      "Project record",
  );
}
export const sourceLabels: Record<string, string> = {
  PROJECT_ACCOUNT: "Project funds",
  MEMBER: "Paid personally",
  ADVANCE: "Advance funds",
  EXTERNAL: "Sponsor paid directly",
};

const statuses: Record<string, string> = {
  POSTED: "Completed",
  posted: "Completed",
  partially_paid: "Partly paid",
  needs_info: "Needs information",
  payment_pending: "Ready to pay",
  REVERSED: "Reversed",
  VOIDED: "Voided",
  submitted: "Awaiting approval",
  unpaid: "To pay",
};
export function humanLabel(value: string) {
  return (
    statuses[value] ||
    value
      .replaceAll("_minor", "")
      .replaceAll("_", " ")
      .toLowerCase()
      .replace(/^./, (c) => c.toUpperCase())
  );
}
