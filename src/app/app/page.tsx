import { supabaseServer } from "@/lib/supabase/server";
import Link from "next/link";
import { formatMoney } from "@/lib/money";
import type { Summary } from "@/lib/domain";
import {
  PageHeader,
  StatusBadge,
  TextLink,
  EmptyState,
  BrandMark,
  AmbientBackground,
} from "@/components/design-system";
import { Plus, ArrowUpRight } from "lucide-react";
export default async function Overview() {
  const client = await supabaseServer();
  const { data: projects } = await client
    .from("projects")
    .select("id,name,code,currency,status");
  const summaries = await Promise.all(
    (projects || []).map(async (p) => ({
      project: p,
      summary: (await client.rpc("project_summary", { p_project: p.id }))
        .data as Summary | null,
    })),
  );
  const totals = new Map<string, bigint>();
  for (const { project, summary } of summaries)
    totals.set(
      project.currency,
      (totals.get(project.currency) || 0n) + BigInt(summary?.cash || "0"),
    );
  return (
    <div className="stack">
      <PageHeader
        context="Your workspace"
        title="Good things start together."
        description="A clear view of every project you’re part of."
        action={
          <Link className="button primary" href="/app/projects/new">
            <Plus size={16} />
            Create project
          </Link>
        }
      />
      {projects?.length ? (
        <>
          <section className="hero-balance" style={{ minHeight: 200 }}>
            <AmbientBackground />
            <div className="hero-content">
              <div className="eyebrow">Money across your projects</div>
              <div className="hero-number" style={{ fontSize: 48 }}>
                {[...totals].map(([currency, n]) => (
                  <div key={currency}>{formatMoney(n, currency)}</div>
                ))}
              </div>
              <p>
                Cash held by your teams. Open a project to see what’s available
                after bills and reimbursements.
              </p>
            </div>
            <div className="hero-emblem" aria-hidden="true">
              <span />
              <span />
              <BrandMark />
            </div>
          </section>
          <div className="section-heading">
            <h2>Your projects</h2>
            <span className="muted" style={{ fontSize: 12 }}>
              {projects.length} workspaces
            </span>
          </div>
          <div className="grid">
            {summaries.map(({ project: p, summary: s }) => (
              <Link
                className="panel project-card"
                href={`/app/projects/${p.id}`}
                key={p.id}
              >
                <div className="row between">
                  <div className="row">
                    <span className="project-monogram">
                      {p.name
                        .replace(/^Project /, "")
                        .slice(0, 2)
                        .toUpperCase()}
                    </span>
                    <div>
                      <h2>{p.name}</h2>
                      <small className="muted">{p.code}</small>
                    </div>
                  </div>
                  <StatusBadge status={p.status} />
                </div>
                <div>
                  <span className="muted" style={{ fontSize: 12 }}>
                    Available to spend
                  </span>
                  <div className="metric">
                    {formatMoney(s?.available || "0", p.currency)}
                  </div>
                </div>
                <div className="project-card-footer">
                  <span>
                    {BigInt(s?.payable || "0") > 0n
                      ? `${formatMoney(s?.payable || "0", p.currency)} owed to team`
                      : "Team reimbursements settled"}
                  </span>
                  <ArrowUpRight size={15} />
                </div>
              </Link>
            ))}
          </div>
          <TextLink href="/app/inbox">See what needs your attention</TextLink>
        </>
      ) : (
        <section className="panel">
          <EmptyState
            title="Make room for your next idea"
            description="Create a project, bring your team together and start tracking the money behind your work."
            href="/app/projects/new"
            action="Create your first project"
          />
        </section>
      )}
    </div>
  );
}
