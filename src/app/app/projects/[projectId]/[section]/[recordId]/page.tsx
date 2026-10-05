import { transactionAmounts } from "@/components/transaction-presentation";
import { supabaseServer } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { tables, names } from "@/lib/sections";
import { EntryForm } from "@/components/entry-form";
import { RecordDetail } from "@/components/record-detail";
import type { Row } from "@/lib/domain";
import { PageHeader } from "@/components/design-system";
import { addLabels } from "@/components/page-copy";
export default async function RecordPage({
  params,
  searchParams,
}: {
  params: Promise<{ projectId: string; section: string; recordId: string }>;
  searchParams: Promise<{ type?: string; source?: string }>;
}) {
  const { projectId, section, recordId } = await params;
  if (!tables[section]) notFound();
  const query = await searchParams;
  const c = await supabaseServer();
  const { data: p } = await c
    .from("projects")
    .select("*")
    .eq("id", projectId)
    .single();
  if (!p) notFound();
  const lookupTables = [
    "financial_accounts",
    "categories",
    "vendors",
    "project_members",
    "advances",
    "funding_sources",
    "purchase_funding_allocations",
    "purchase_requests",
    "purchase_items",
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
            p_search:
              recordId !== "new" &&
              [
                "purchase_items",
                "bill_items",
                "purchase_funding_allocations",
              ].includes(table)
                ? recordId
                : "",
          })
        ).data?.rows || [],
      ]),
    ),
  );
  const { data: profiles } = await c
    .from("profiles")
    .select("id,full_name,email");
  lookups.profiles = profiles || [];
  const { data: claims } = await c.auth.getClaims();
  const user = String(claims?.claims?.sub || "");
  if (recordId === "new")
    return (
      <div className="stack entry-layout">
        <PageHeader
          context={p.name}
          title={addLabels[section] || `Add ${names[section]?.toLowerCase()}`}
          description={
            section === "purchases"
              ? "Start with the purchase. We’ll keep track of who paid."
              : "Save the details, then review the next step."
          }
        />
        <EntryForm
          project={projectId}
          section={section}
          currency={p.currency}
          lookups={lookups}
          user={user}
          initial={{
            ...(query.type === "TRANSFER" ? { type: "TRANSFER" } : {}),
            ...(query.source === "MEMBER"
              ? {
                  allocations: [
                    { source_type: "MEMBER", target: user, amount: "0" },
                  ],
                }
              : {}),
          }}
        />
      </div>
    );
  const { data: raw } = await c
    .from(tables[section])
    .select("*")
    .eq("id", recordId)
    .eq("project_id", projectId)
    .single();
  if (!raw) notFound();
  const { data: safe } = await c.rpc("project_records", {
    p_project: projectId,
    p_table: tables[section],
    p_search: recordId,
    p_limit: 1,
  });
  const row = (safe?.rows?.[0] || raw) as Row;
  if (section === "transactions") {
    const { data: entries } = await c
      .from("ledger_entries")
      .select("financial_event_id,amount_minor::text")
      .eq("project_id", projectId)
      .eq("financial_event_id", recordId)
      .eq("direction", "DEBIT");
    row.transaction_total_minor =
      transactionAmounts(entries || [])
        .get(recordId)
        ?.toString() ?? null;
  }
  const { data: comments } = await c
    .from("comments")
    .select("*")
    .eq("entity_id", recordId)
    .eq("project_id", projectId);
  const { data: documents } = await c
    .from("documents")
    .select("*")
    .eq("entity_id", recordId)
    .eq("project_id", projectId);
  const { data: position } = [
    "purchases",
    "bills",
    "advances",
    "reimbursements",
  ].includes(section)
    ? await c.rpc("record_position", {
        p_project: projectId,
        p_table: tables[section],
        p_id: recordId,
      })
    : { data: {} };
  return (
    <RecordDetail
      project={projectId}
      section={section}
      row={row}
      currency={p.currency}
      lookups={lookups}
      comments={comments || []}
      documents={documents || []}
      financialPosition={position || {}}
    />
  );
}
