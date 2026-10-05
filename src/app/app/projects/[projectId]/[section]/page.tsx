import { transactionAmounts } from "@/components/transaction-presentation";
import { supabaseServer } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { tables, names } from "@/lib/sections";
import { RecordsTable } from "@/components/records-table";
import { Reports } from "@/components/reports";
import { DocumentGenerator } from "@/components/document-generator";
import { Team } from "@/components/team";
import { Settings } from "@/components/settings";
import type { Row } from "@/lib/domain";
import Link from "next/link";
import { Entitlements } from "@/components/entitlements";
import { PageHeader, BudgetBar } from "@/components/design-system";
import { descriptions, addLabels, sourceLabels } from "@/components/page-copy";
import { Plus } from "lucide-react";
export default async function Section({
  params,
  searchParams,
}: {
  params: Promise<{ projectId: string; section: string }>;
  searchParams: Promise<{
    page?: string;
    q?: string;
    order?: string;
    desc?: string;
    status?: string;
    from?: string;
    to?: string;
  }>;
}) {
  const { projectId, section } = await params;
  const search = await searchParams;
  if (!names[section]) notFound();
  const client = await supabaseServer();
  const { data: p } = await client
    .from("projects")
    .select("*")
    .eq("id", projectId)
    .single();
  if (!p) notFound();
  const page = Math.max(1, Number(search.page) || 1);
  const { data: r, error } =
    section === "reports"
      ? { data: null, error: null }
      : await client.rpc("project_records", {
          p_project: projectId,
          p_table: tables[section],
          p_limit: 50,
          p_offset: (page - 1) * 50,
          p_search: search.q || "",
          p_order:
            search.order ||
            (section === "transactions"
              ? "event_date"
              : section === "purchases"
                ? "purchase_date"
                : "id"),
          p_desc: search.desc
            ? search.desc === "true"
            : ["transactions", "purchases"].includes(section),
          p_filters: {
            status: search.status || "",
            from: search.from || "",
            to: search.to || "",
          },
        });
  const rows = (r?.rows || []) as Row[];
  const [{ data: vendors }, { data: profiles }, { data: allocations }] = [
    "purchases",
    "bills",
    "reimbursements",
    "advances",
  ].includes(section)
    ? await Promise.all([
        client.from("vendors").select("id,name").eq("project_id", projectId),
        client.from("profiles").select("id,full_name"),
        section === "purchases" && rows.length
          ? client
              .from("purchase_funding_allocations")
              .select("purchase_id,source_type,member_user_id")
              .in(
                "purchase_id",
                rows.map((row) => String(row.id)),
              )
          : Promise.resolve({ data: [] }),
      ])
    : [{ data: [] }, { data: [] }, { data: [] }];
  for (const row of rows) {
    const vendor = vendors?.find((v) => v.id === row.vendor_id);
    if (vendor) row.vendor_name = vendor.name;
    const member = profiles?.find(
      (p) =>
        p.id ===
        (row.claimant_user_id ||
          row.member_user_id ||
          row.purchased_by_user_id),
    );
    if (section === "reimbursements" && member) row.name = member.full_name;
    const funding = (allocations || []).filter((a) => a.purchase_id === row.id);
    if (funding.length)
      row.payer_label = funding
        .map((a) =>
          a.source_type === "MEMBER"
            ? `${profiles?.find((p) => p.id === a.member_user_id)?.full_name || "Team member"} paid personally`
            : sourceLabels[a.source_type] || a.source_type,
        )
        .join(" + ");
    else if (member) row.payer_label = member.full_name;
  }
  if (section === "purchases" && rows.length) {
    const { data: items } = await client
      .from("purchase_items")
      .select("purchase_id,description")
      .in(
        "purchase_id",
        rows.map((row) => String(row.id)),
      );
    for (const row of rows) {
      const descriptions = (items || [])
        .filter((item) => item.purchase_id === row.id)
        .map((item) => item.description);
      if (descriptions.length) row.item_summary = descriptions.join(", ");
    }
  }
  if (section === "transactions" && rows.length) {
    const { data: entries } = await client
      .from("ledger_entries")
      .select("financial_event_id,amount_minor::text")
      .eq("project_id", projectId)
      .eq("direction", "DEBIT")
      .in(
        "financial_event_id",
        rows.map((row) => String(row.id)),
      );
    const amounts = transactionAmounts(entries || []);
    for (const row of rows)
      if (amounts.has(String(row.id)))
        row.transaction_total_minor = amounts.get(String(row.id))!.toString();
  }
  const purchaseIds = rows
    .filter(
      (row) =>
        row.event_type === "PURCHASE" && typeof row.source_id === "string",
    )
    .map((row) => String(row.source_id));
  if (purchaseIds.length) {
    const [{ data: items }, { data: payers }, { data: names }] =
      await Promise.all([
        client
          .from("purchase_items")
          .select("purchase_id,description")
          .in("purchase_id", purchaseIds),
        client
          .from("purchase_funding_allocations")
          .select("purchase_id,source_type,member_user_id")
          .in("purchase_id", purchaseIds),
        client.from("profiles").select("id,full_name"),
      ]);
    for (const row of rows) {
      const descriptions = (items || [])
        .filter((item) => item.purchase_id === row.source_id)
        .map((item) => item.description);
      if (descriptions.length) row.item_summary = descriptions.join(", ");
      const funding = (payers || []).filter(
        (payer) => payer.purchase_id === row.source_id,
      );
      if (funding.length)
        row.payer_label = funding
          .map((payer) =>
            payer.source_type === "MEMBER"
              ? `${names?.find((person) => person.id === payer.member_user_id)?.full_name || "Team member"} paid personally`
              : payer.source_type === "PROJECT_ACCOUNT"
                ? "Project funds"
                : payer.source_type === "ADVANCE"
                  ? "Advance funds"
                  : "Sponsor paid directly",
          )
          .join(" + ");
    }
  }
  const { data: billBalances } =
    section === "bills"
      ? await client.rpc("report_data", {
          p_project: projectId,
          p_report: "bills",
        })
      : { data: [] };
  if (section === "bills")
    for (const row of rows) {
      const balance = ((billBalances || []) as Row[]).find(
        (b) => b.id === row.id,
      );
      if (balance) row.outstanding_minor = balance.outstanding_minor;
    }
  const { data: budgetLines } =
    section === "budgets"
      ? await client.rpc("report_data", {
          p_project: projectId,
          p_report: "budget_lines",
        })
      : { data: [] };
  if (section === "people") {
    const { data: balances } = await client.rpc("report_data", {
      p_project: projectId,
      p_report: "project_members",
    });
    for (const row of rows)
      Object.assign(
        row,
        ((balances as Row[]) || []).find((b) => b.id === row.id) || {},
      );
  }
  const base = `/app/projects/${projectId}/${section}`;
  return (
    <div className="stack">
      <PageHeader
        context={p.name}
        title={names[section]}
        description={descriptions[section]}
        action={
          addLabels[section] ? (
            <Link className="button primary" href={`${base}/new`}>
              <Plus size={16} />
              {addLabels[section]}
            </Link>
          ) : undefined
        }
      />
      {["transactions", "reimbursements", "advances"].includes(section) && (
        <nav className="money-tabs" aria-label="Money pages">
          {[
            ["transactions", "Transactions"],
            ["reimbursements", "Reimbursements"],
            ["advances", "Advances"],
          ].map(([slug, label]) => (
            <Link
              key={slug}
              aria-current={section === slug ? "page" : undefined}
              href={`/app/projects/${projectId}/${slug}`}
            >
              {label}
            </Link>
          ))}
        </nav>
      )}
      {section === "budgets" && budgetLines?.length > 0 && (
        <section className="panel budget-grid">
          {(budgetLines as Row[]).map((b) => (
            <BudgetBar
              key={String(b.id)}
              name={String(b.category)}
              actual={String(b.actual_minor)}
              planned={String(b.planned_minor)}
              currency={p.currency}
            />
          ))}
        </section>
      )}
      {section === "reimbursements" && (
        <Entitlements project={projectId} currency={p.currency} />
      )}
      {section === "reports" ? (
        <Reports project={projectId} currency={p.currency} />
      ) : section === "people" ? (
        <Team project={projectId} rows={rows} currency={p.currency} />
      ) : section === "settings" ? (
        <Settings project={projectId} rows={rows} />
      ) : section === "documents" ? (
        <>
          <DocumentGenerator project={projectId} />
          <details className="disclosure">
            <summary>Uploaded project documents</summary>
            <RecordsTable
              rows={rows}
              base={base}
              currency={p.currency}
              total={r?.total || 0}
              page={page}
            />
          </details>
        </>
      ) : (
        <>
          <form className="filter-bar">
            <input
              style={{ maxWidth: 360 }}
              name="q"
              placeholder={`Search ${names[section].toLowerCase()}`}
              aria-label="Search records"
              defaultValue={search.q}
            />
            <button>Search</button>
            <details>
              <summary>Filters</summary>
              <div className="filter-fields">
                <label>
                  Status
                  <input
                    name="status"
                    defaultValue={search.status}
                    placeholder="Any status"
                  />
                </label>
                <label>
                  From
                  <input type="date" name="from" defaultValue={search.from} />
                </label>
                <label>
                  To
                  <input type="date" name="to" defaultValue={search.to} />
                </label>
                <button>Apply filters</button>
              </div>
            </details>
          </form>
          {error ? (
            <div className="error">
              Unable to load records. Check your connection and permissions.
            </div>
          ) : (
            <div className="panel records-container">
              <RecordsTable
                rows={rows}
                base={base}
                currency={p.currency}
                total={r?.total || 0}
                page={page}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}
