import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";
import { escapeHtml } from "@/lib/documents";
import { formatMoney } from "@/lib/money";
export async function POST(
  request: Request,
  { params }: { params: Promise<{ projectId: string }> },
) {
  if (request.headers.get("origin") !== new URL(request.url).origin)
    return NextResponse.json({ error: "Invalid origin." }, { status: 403 });
  const { projectId } = await params;
  const c = await supabaseServer();
  const { data: p } = await c
    .from("projects")
    .select("*")
    .eq("id", projectId)
    .single();
  if (!p)
    return NextResponse.json({ error: "Project not found." }, { status: 404 });
  const types = [
    "funding_tranches",
    "financial_events",
    "purchases",
    "budget_lines",
    "reimbursement_claims",
    "bills",
    "assets",
  ];
  const result = await Promise.all(
    types.map(async (type) => ({
      type,
      ...(await c.rpc("report_data", { p_project: projectId, p_report: type })),
    })),
  );
  if (result.some((r) => r.error))
    return NextResponse.json(
      { error: "Unable to load complete finance pack." },
      { status: 400 },
    );
  const [
    { data: s },
    { data: issues },
    { data: analytics },
    { data: docs },
    { data: template },
  ] = await Promise.all([
    c.rpc("project_summary", { p_project: projectId }),
    c.rpc("finance_issues", { p_project: projectId }),
    c.rpc("project_analytics", { p_project: projectId }),
    c.rpc("project_records", {
      p_project: projectId,
      p_table: "documents",
      p_limit: 200,
    }),
    c
      .from("document_templates")
      .select("id")
      .eq("template_type", "project_financial_summary")
      .limit(1)
      .single(),
  ]);
  if (!s || !analytics || !docs || !template)
    return NextResponse.json(
      { error: "Unable to resolve all finance-pack sections." },
      { status: 400 },
    );
  const indexRows = docs.rows || [];
  for (let offset = 200; offset < docs.total; offset += 200) {
    const page = await c.rpc("project_records", {
      p_project: projectId,
      p_table: "documents",
      p_limit: 200,
      p_offset: offset,
    });
    if (page.error)
      return NextResponse.json(
        { error: "Unable to load complete document index." },
        { status: 400 },
      );
    indexRows.push(...(page.data?.rows || []));
  }
  let html = `<h1>${escapeHtml(p.name)} — Finance pack</h1><p>Generated ${new Date().toISOString()}</p><p>Project code: ${escapeHtml(p.code)} | Currency: ${escapeHtml(p.currency)} | Status: ${escapeHtml(p.status)}</p><h2>Financial position</h2>`;
  for (const [key, value] of Object.entries(s || {}))
    html += `<p>${escapeHtml(key)}: ${escapeHtml(formatMoney(String(value), p.currency))}</p>`;
  html +=
    "<h2>Category summary</h2><table><thead><tr><th>Category</th><th>Net recognized expense</th></tr></thead><tbody>" +
    (
      (analytics?.categories || []) as {
        category: string;
        amount_minor: string;
      }[]
    )
      .map(
        (r) =>
          `<tr><td>${escapeHtml(r.category)}</td><td>${escapeHtml(formatMoney(r.amount_minor, p.currency))}</td></tr>`,
      )
      .join("") +
    "</tbody></table>";
  for (const report of result) {
    const rows = report.data as Record<string, unknown>[];
    const cols = [...new Set(rows.flatMap((r) => Object.keys(r)))].filter(
      (k) =>
        ![
          "metadata",
          "command_hash",
          "idempotency_key",
          "project_id",
          "created_by",
          "posted_by",
        ].includes(k),
    );
    html += `<h2>${escapeHtml(report.type.replaceAll("_", " "))}</h2><table><thead><tr>${cols.map((k) => `<th>${escapeHtml(k.replaceAll("_", " "))}</th>`).join("")}</tr></thead><tbody>${rows.map((r) => "<tr>" + cols.map((k) => `<td>${escapeHtml(k.endsWith("_minor") && r[k] !== null ? formatMoney(String(r[k]), p.currency) : typeof r[k] === "object" ? JSON.stringify(r[k]) : r[k])}</td>`).join("") + "</tr>").join("")}</tbody></table>`;
  }
  html +=
    "<h2>Document index</h2>" +
    (
      indexRows as {
        original_filename: string;
        document_type: string;
      }[]
    )
      .map(
        (d) =>
          `<p>${escapeHtml(d.original_filename)} — ${escapeHtml(d.document_type)}</p>`,
      )
      .join("") +
    "<h2>Unresolved issues</h2>" +
    ((issues || []) as { title: string }[])
      .map((i) => `<p>${escapeHtml(i.title)}</p>`)
      .join("");
  const saved = await c.rpc("save_generated", {
    p_project: projectId,
    p_template: template?.id,
    p_entity_type: "projects",
    p_entity_id: projectId,
    p_html: html,
    p_snapshot: {
      summary: s,
      categories: analytics?.categories || [],
      reports: result.map((r) => ({ type: r.type, data: r.data })),
      issues,
      documents: indexRows,
    },
  });
  if (saved.error)
    return NextResponse.json(
      { error: "Unable to save finance pack." },
      { status: 400 },
    );
  return NextResponse.json({ id: saved.data });
}
