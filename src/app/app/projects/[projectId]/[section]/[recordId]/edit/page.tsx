import { notFound } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";
import { tables } from "@/lib/sections";
import { EntryForm } from "@/components/entry-form";
import type { Row } from "@/lib/domain";
import type { EntryInput } from "@/lib/entry-schema";
import { PageHeader } from "@/components/design-system";
const input = (value: unknown) => {
  const n = BigInt(String(value || "0"));
  return (n / 100n).toString() + "." + (n % 100n).toString().padStart(2, "0");
};
export default async function Edit({
  params,
}: {
  params: Promise<{ projectId: string; section: string; recordId: string }>;
}) {
  const { projectId, section, recordId } = await params;
  if (!["purchases", "bills", "requests", "advances"].includes(section))
    notFound();
  const c = await supabaseServer();
  const [{ data: project }, { data: identity }, { data: records }] =
    await Promise.all([
      c.from("projects").select("*").eq("id", projectId).single(),
      c.auth.getClaims(),
      c.rpc("project_records", {
        p_project: projectId,
        p_table: tables[section],
        p_search: recordId,
        p_limit: 1,
      }),
    ]);
  const row = records?.rows?.find((r: Row) => r.id === recordId);
  if (!project || !row || !["draft", "needs_info"].includes(row.status))
    notFound();
  const lookupTables = [
    "financial_accounts",
    "categories",
    "vendors",
    "project_members",
    "advances",
    "funding_sources",
    "purchase_requests",
    "purchase_items",
    "purchase_funding_allocations",
    "bill_items",
    "financial_events",
  ];
  const lookups = Object.fromEntries(
    await Promise.all(
      lookupTables.map(async (table) => [
        table,
        (
          await c.rpc("project_records", {
            p_project: projectId,
            p_table: table,
            p_limit: 200,
          })
        ).data?.rows || [],
      ]),
    ),
  );
  const { data: profiles } = await c.from("profiles").select("id,full_name");
  lookups.profiles = profiles || [];
  const initial: Partial<EntryInput> = {
    tags: Array.isArray(row.tags) ? row.tags.join(", ") : "",
    corrects_event_id: row.corrects_event_id || "",
    shipping: input(row.shipping_minor),
    name: String(row.name || row.notes || ""),
    title: row.title || "",
    purpose: row.purpose || "",
    date: row.purchase_date || row.issue_date || "",
    due_date: row.due_date || "",
    amount: input(
      row.total_minor || row.estimated_minor || row.requested_minor,
    ),
    vendor_id: row.vendor_id || "",
    category_id: row.category_id || "",
    notes: row.notes || row.reason || "",
    invoice_number: row.invoice_number || "",
    purchased_by_user_id: row.purchased_by_user_id || "",
    member_user_id: row.member_user_id || String(identity?.claims?.sub),
    linked_request_id: row.linked_request_id || "",
    payment_method: row.payment_method || "",
    transaction_reference: row.transaction_reference || "",
  };
  const itemRows = (
    lookups[section === "bills" ? "bill_items" : "purchase_items"] as Row[]
  ).filter(
    (i) => (section === "bills" ? i.bill_id : i.purchase_id) === recordId,
  );
  if (itemRows.length)
    initial.items = itemRows.map((i) => ({
      description: String(i.description),
      quantity: String(i.quantity),
      price: input(i.unit_price_minor),
      tax: input(i.tax_minor),
      discount: input(i.discount_minor),
      asset: Boolean(i.mark_as_asset),
    }));
  if (section === "purchases")
    initial.allocations = (lookups.purchase_funding_allocations as Row[])
      .filter((a) => a.purchase_id === recordId)
      .map((a) => ({
        source_type: String(a.source_type),
        target: String(
          a.project_account_id ||
            a.member_user_id ||
            a.advance_id ||
            a.funding_source_id,
        ),
        amount: input(a.amount_minor),
      }));
  return (
    <div className="stack entry-layout">
      <PageHeader
        context={project.name}
        title="Edit this draft"
        description="Update the details before completing the transaction."
      />
      <EntryForm
        project={projectId}
        section={section}
        currency={project.currency}
        lookups={lookups}
        user={String(identity?.claims?.sub)}
        recordId={recordId}
        recordVersion={Number(row.version)}
        initial={initial}
      />
    </div>
  );
}
