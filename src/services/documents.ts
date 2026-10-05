import { supabaseServer } from "@/lib/supabase/server";
import { renderDocument, amountWords } from "@/lib/documents";
import { formatMoney } from "@/lib/money";
import type { Row, Summary } from "@/lib/domain";
export type DocumentInput = {
  template: string;
  recipient: string;
  prose: string;
  selected: string[];
  requested_minor: string;
  member_id?: string;
};
export async function generateDocument(project: string, input: DocumentInput) {
  const c = await supabaseServer();
  const { data: identity } = await c.auth.getClaims();
  if (!identity?.claims) throw new Error("Sign in to continue.");
  const [{ data: p }, { data: t }, { data: s }] = await Promise.all([
    c.from("projects").select("*").eq("id", project).single(),
    c.from("document_templates").select("*").eq("id", input.template).single(),
    c.rpc("project_summary", { p_project: project }),
  ]);
  if (!p || !t || !s) throw new Error("Permission denied.");
  const member = input.member_id || String(identity.claims.sub);
  const membership = await c
    .from("project_members")
    .select("user_id")
    .eq("project_id", project)
    .eq("user_id", member)
    .eq("is_active", true)
    .maybeSingle();
  if (!membership.data) throw new Error("Select an active project member.");
  const { data: profile } = await c
    .from("profiles")
    .select("full_name,email,timezone")
    .eq("id", member)
    .single();
  const today = new Intl.DateTimeFormat("en-CA", {
    timeZone: profile?.timezone || "Asia/Kolkata",
  }).format(new Date());
  const summary = s as Summary;
  const type = String(t.template_type);
  if (
    [
      "reimbursement_request",
      "vendor_payment_request",
      "purchase_approval",
      "advance_request",
    ].includes(type) &&
    !input.selected.length
  )
    throw new Error("Select at least one eligible source record.");
  if (type === "fund_request" && BigInt(input.requested_minor) <= 0n)
    throw new Error("Enter the amount of funding requested.");
  const reference = `PFM-${new Date().toISOString().slice(0, 10).replaceAll("-", "")}-${crypto.randomUUID().slice(0, 8)}`;
  let table = "purchases";
  if (type === "vendor_payment_request") table = "bills";
  if (type === "purchase_approval") table = "purchase_requests";
  if (type === "advance_request") table = "advances";
  const { data: records } = await c.rpc("project_records", {
    p_project: project,
    p_table: table,
    p_limit: 200,
  });
  const selected = ((records?.rows || []) as Row[]).filter((r) =>
    input.selected.includes(String(r.id)),
  );
  if (selected.length !== input.selected.length)
    throw new Error("Selected records must belong to this project.");
  let amount = BigInt(input.requested_minor);
  const expenses: {
    date: string;
    item: string;
    vendor: string;
    invoice: string;
    amount: string;
  }[] = [];
  const { data: vendors } = await c
    .from("vendors")
    .select("id,name,gstin")
    .eq("project_id", project);
  if (type === "reimbursement_request") {
    const { data: entitlements } = await c.rpc("member_entitlements", {
      p_project: project,
    });
    const eligible = (entitlements || []) as {
      purchase_id: string;
      member_user_id: string;
      outstanding_minor: string;
    }[];
    amount = 0n;
    for (const row of selected) {
      const n = eligible
        .filter((e) => e.purchase_id === row.id && e.member_user_id === member)
        .reduce((sum, e) => sum + BigInt(e.outstanding_minor), 0n);
      if (n <= 0n)
        throw new Error(
          "Select posted personal expenses with an outstanding entitlement for this member.",
        );
      amount += n;
      expenses.push({
        date: String(row.purchase_date),
        item: String(
          row.item_summary || row.notes || "Personal project expense",
        ),
        vendor: vendors?.find((v) => v.id === row.vendor_id)?.name || "—",
        invoice: String(row.invoice_number || "—"),
        amount: n.toString(),
      });
    }
  } else if (type === "vendor_payment_request") {
    const { data: balances } = await c.rpc("report_data", {
      p_project: project,
      p_report: "bills",
    });
    amount = 0n;
    for (const row of selected) {
      const b = (
        (balances as { id: string; outstanding_minor: string }[]) || []
      ).find((b) => b.id === row.id);
      const n = BigInt(b?.outstanding_minor || "0");
      if (n <= 0n)
        throw new Error("Select posted bills with an outstanding amount.");
      amount += n;
      expenses.push({
        date: String(row.issue_date),
        item: "Vendor bill · due " + row.due_date,
        vendor: vendors?.find((v) => v.id === row.vendor_id)?.name || "—",
        invoice: String(row.invoice_number || "—"),
        amount: n.toString(),
      });
    }
  } else if (type === "purchase_approval") {
    amount = 0n;
    for (const row of selected) {
      amount += BigInt(String(row.estimated_minor));
      expenses.push({
        date: String(row.desired_by_date || ""),
        item: String(row.title),
        vendor: "Suggested vendor",
        invoice: "Request",
        amount: String(row.estimated_minor),
      });
    }
  } else if (type === "advance_request") {
    amount = 0n;
    for (const row of selected) {
      const n = BigInt(String(row.requested_minor || "0"));
      if (n <= 0n)
        throw new Error("Select an advance with a requested amount.");
      amount += n;
      expenses.push({
        date: String(row.created_at || "").slice(0, 10),
        item: String(row.purpose),
        vendor: "Member advance",
        invoice: "Request",
        amount: n.toString(),
      });
    }
  } else if (
    ["project_financial_summary", "fund_utilization_statement"].includes(type)
  ) {
    amount = BigInt(summary.expense);
    for (const [label, key] of [
      ["Funding received", "funding"],
      ["Net recognized expense", "expense"],
      ["Bills payable", "bills"],
      ["Members owed", "payable"],
      ["Advances outstanding", "advances"],
      ["Project cash", "cash"],
      ["Available to spend", "available"],
    ] as const)
      expenses.push({
        date: "As of " + today,
        item: label,
        vendor: "—",
        invoice: "Ledger summary",
        amount: summary[key],
      });
  } else if (selected.length && table === "purchases") {
    amount = 0n;
    const { data: reports } = await c.rpc("report_data", {
      p_project: project,
      p_report: "purchase_register",
    });
    for (const row of selected) {
      if (row.status !== "posted")
        throw new Error("Only posted purchases can be included.");
      const refund =
        ((reports as Row[]) || []).find((p) => p.id === row.id)
          ?.refunds_minor || "0";
      const n = BigInt(String(row.total_minor)) - BigInt(String(refund));
      amount += n;
      expenses.push({
        date: String(row.purchase_date),
        item: String(row.item_summary || row.notes || "Project purchase"),
        vendor: vendors?.find((v) => v.id === row.vendor_id)?.name || "—",
        invoice: String(row.invoice_number || "—"),
        amount: n.toString(),
      });
    }
  }
  const vendor = selected.length
    ? vendors?.find((v) => v.id === selected[0].vendor_id)
    : null;
  const values: Record<string, string> = {
    "project.name": p.name,
    "project.code": p.code,
    "project.start_date": p.start_date || "",
    "project.cash": formatMoney(summary.cash, p.currency),
    "project.available_balance": formatMoney(summary.available, p.currency),
    "member.name": profile?.full_name || "",
    "member.email": profile?.email || "",
    "vendor.name": vendor?.name || "",
    "vendor.gstin": vendor?.gstin || "",
    "funding.received": formatMoney(summary.funding, p.currency),
    reference_number: reference,
    today,
    recipient: input.recipient,
    prose: input.prose,
    amount: formatMoney(amount, p.currency),
    amount_words:
      p.currency === "INR"
        ? amountWords(amount)
        : formatMoney(amount, p.currency),
    "reimbursement.total": formatMoney(amount, p.currency),
  };
  const html = renderDocument(t.body_template, values, expenses, p.currency);
  const snapshot = {
    reference_number: reference,
    values,
    selected,
    expenses,
    template: t,
    summary,
  };
  const saved = await c.rpc("save_generated", {
    p_project: project,
    p_template: input.template,
    p_entity_type: "projects",
    p_entity_id: project,
    p_html: html,
    p_snapshot: snapshot,
  });
  if (saved.error) throw new Error("Unable to save document.");
  return { id: saved.data, html };
}
