import { transactionAmounts } from "@/components/transaction-presentation";
import { humanLabel } from "@/components/page-copy";
import { formatMoney } from "@/lib/money";
import { notFound } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";
import type { Summary, Row } from "@/lib/domain";
import Link from "next/link";
import { DashboardCharts } from "@/components/dashboard-charts";
import {
  PageHeader,
  HeroBalance,
  Metric,
  QuickAction,
  Section,
  AttentionItem,
  MoneyAmount,
  StatusBadge,
  TextLink,
  Onboarding,
  EmptyState,
} from "@/components/design-system";
import {
  ArrowDownLeft,
  ArrowUpRight,
  Receipt,
  HandCoins,
  FileWarning,
  CheckCircle2,
  ShoppingBag,
} from "lucide-react";
export default async function Project({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  const c = await supabaseServer();
  const [
    { data: p },
    { data: s },
    { data: records },
    { data: analytics },
    { data: entitlements },
  ] = await Promise.all([
    c.from("projects").select("*").eq("id", projectId).single(),
    c.rpc("project_summary", { p_project: projectId }),
    c.rpc("project_records", {
      p_project: projectId,
      p_table: "financial_events",
      p_limit: 6,
      p_order: "event_date",
      p_desc: true,
    }),
    c.rpc("project_analytics", { p_project: projectId }),
    c.rpc("member_entitlements", { p_project: projectId }),
  ]);
  if (!p) notFound();
  const summary = s as Summary;
  const base = `/app/projects/${projectId}`;
  const people = new Set(
    (entitlements || [])
      .filter(
        (r: { outstanding_minor: string }) => BigInt(r.outstanding_minor) > 0n,
      )
      .map((r: { member_user_id: string }) => r.member_user_id),
  ).size;
  const issues = (analytics?.issues || []) as {
    id: string;
    section: string;
    title: string;
  }[];
  const missing = issues.filter((i) =>
    i.title.toLowerCase().includes("receipt"),
  );
  const other = issues.filter(
    (i) => !i.title.toLowerCase().includes("receipt"),
  );
  const recent = (records?.rows || []) as Row[];
  const { data: recentEntries } = recent.length
    ? await c
        .from("ledger_entries")
        .select("financial_event_id,amount_minor::text")
        .eq("project_id", projectId)
        .eq("direction", "DEBIT")
        .in(
          "financial_event_id",
          recent.map((row) => String(row.id)),
        )
    : { data: [] };
  const recentAmounts = transactionAmounts(recentEntries || []);
  const purchaseIds = recent
    .filter(
      (row) =>
        row.event_type === "PURCHASE" && typeof row.source_id === "string",
    )
    .map((row) => String(row.source_id));
  if (purchaseIds.length) {
    const [{ data: items }, { data: payers }, { data: names }] =
      await Promise.all([
        c
          .from("purchase_items")
          .select("purchase_id,description")
          .in("purchase_id", purchaseIds),
        c
          .from("purchase_funding_allocations")
          .select("purchase_id,source_type,member_user_id")
          .in("purchase_id", purchaseIds),
        c.from("profiles").select("id,full_name"),
      ]);
    for (const row of recent) {
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
  return (
    <div className="stack motion-stagger">
      <PageHeader
        context={`${p.code} / Overview`}
        title={p.name}
        description="Here’s where your project money stands."
        action={<StatusBadge status={p.status} />}
      />
      <HeroBalance value={summary.available} currency={p.currency}>
        <p>
          <MoneyAmount value={summary.funding} currency={p.currency} /> received
          to support your next big idea.
        </p>
        <div className="row">
          <QuickAction
            href={`${base}/purchases/new`}
            label="Add purchase"
            icon={ShoppingBag}
            primary
          />
          <QuickAction
            href={`${base}/transactions/new`}
            label="Add funding"
            icon={ArrowDownLeft}
          />
        </div>
      </HeroBalance>
      <div className="metric-strip">
        <Metric
          label="Spent so far"
          value={summary.expense}
          currency={p.currency}
          href={`${base}/reports`}
        />
        <Metric
          label="Bills to pay"
          value={summary.bills}
          currency={p.currency}
          href={`${base}/bills`}
        />
        <Metric
          label="Owed to your team"
          value={summary.payable}
          currency={p.currency}
          href={`${base}/reimbursements`}
        />
      </div>
      {!(records?.rows || []).length && <Onboarding base={base} />}
      <div className="dashboard-grid">
        <Section
          title="Needs your attention"
          action={<TextLink href="/app/inbox">Open inbox</TextLink>}
        >
          <div className="attention-panel">
            {BigInt(summary.bills) > 0n && (
              <AttentionItem
                href={`${base}/bills`}
                icon={Receipt}
                title="Bills are waiting to be paid"
                detail={`${formatMoney(summary.bills, p.currency)} to settle with your vendors`}
              />
            )}
            {BigInt(summary.payable) > 0n && (
              <AttentionItem
                href={`${base}/reimbursements`}
                icon={HandCoins}
                title={`You owe ${people || "your"} team ${people === 1 ? "member" : "members"}`}
                detail={`${formatMoney(summary.payable, p.currency)} for purchases paid personally.`}
              />
            )}
            {missing.length > 0 && (
              <AttentionItem
                href={`${base}/${missing[0].section}/${missing[0].id}`}
                icon={FileWarning}
                title={`${missing.length} ${missing.length === 1 ? "purchase needs a receipt" : "purchases need receipts"}`}
                detail="Keep the paperwork with the purchase."
              />
            )}
            {other.slice(0, 2).map((i) => (
              <AttentionItem
                key={i.id + i.title}
                href={`${base}/${i.section}/${i.id}`}
                title={i.title}
              />
            ))}
            {!issues.length &&
              BigInt(summary.bills) === 0n &&
              BigInt(summary.payable) === 0n && (
                <div className="row">
                  <CheckCircle2
                    size={19}
                    style={{ color: "var(--positive)" }}
                  />
                  <span>You’re all caught up.</span>
                </div>
              )}
            {other.length > 2 && (
              <details>
                <summary>{other.length - 2} more things to review</summary>
                {other.slice(2).map((i) => (
                  <AttentionItem
                    key={i.id + i.title}
                    href={`${base}/${i.section}/${i.id}`}
                    title={i.title}
                  />
                ))}
              </details>
            )}
          </div>
        </Section>
        <Section
          title="Recently in your project"
          action={<TextLink href={`${base}/transactions`}>View all</TextLink>}
        >
          <div className="panel" style={{ padding: "8px 22px" }}>
            {((records?.rows as Row[]) || []).map((r) => (
              <Link
                className="timeline-row"
                key={String(r.id)}
                href={`${base}/transactions/${r.id}`}
              >
                <span className="transaction-icon">
                  {r.event_type === "FUNDING" ? (
                    <ArrowDownLeft size={16} />
                  ) : (
                    <ArrowUpRight size={16} />
                  )}
                </span>
                <span>
                  <strong>
                    {r.item_summary
                      ? String(r.item_summary)
                      : r.description &&
                          String(r.description).replaceAll("_", " ") !==
                            String(r.event_type).replaceAll("_", " ")
                        ? String(r.description)
                        : humanLabel(String(r.event_type))}
                  </strong>
                  <small>
                    {String(r.event_date)} · {humanLabel(String(r.event_type))}
                  </small>
                </span>
                {recentAmounts.has(String(r.id)) && (
                  <MoneyAmount
                    value={recentAmounts.get(String(r.id))!}
                    currency={p.currency}
                  />
                )}
              </Link>
            ))}
            {!(records?.rows || []).length && (
              <EmptyState
                title="Your story starts here"
                description="Add your first purchase or funding to see it here."
              />
            )}
          </div>
        </Section>
      </div>
      {analytics && (
        <DashboardCharts
          project={projectId}
          currency={p.currency}
          data={analytics}
        />
      )}
      <details className="disclosure">
        <summary>How your available money is calculated</summary>
        <p className="muted">
          Available money starts with project cash, then sets aside unpaid
          bills, money owed to your team and approved requests. Spending can
          include bills and personal purchases that have not reduced cash yet.
        </p>
        <div className="money-flow">
          {[
            ["Project cash", summary.cash],
            [
              "Bills + team",
              (BigInt(summary.bills) + BigInt(summary.payable)).toString(),
            ],
            ["Approved requests", summary.reserved],
            ["Available", summary.available],
          ].map(([label, value]) => (
            <div key={label}>
              <small>{label}</small>
              <strong>
                <MoneyAmount value={value} currency={p.currency} />
              </strong>
            </div>
          ))}
        </div>
        <p className="muted">
          Outstanding advances:{" "}
          <MoneyAmount value={summary.advances} currency={p.currency} /> ·{" "}
          <TextLink href={`${base}/advances`}>View advances</TextLink>
        </p>
      </details>
    </div>
  );
}
