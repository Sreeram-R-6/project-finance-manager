"use client";
import { useState, useEffect } from "react";
import { supabaseBrowser } from "@/lib/supabase/browser";
import { formatMoney, csvCell } from "@/lib/money";
import type { Row } from "@/lib/domain";
import { fieldLabel } from "./page-copy";
import { humanLabel } from "./design-system";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
const reports: Record<string, string> = {
  "Project statement": "financial_events",
  "Expense report": "purchases",
  "Member report": "project_members",
  "Reimbursement report": "reimbursement_claims",
  "Vendor report": "vendors",
  "Budget report": "budget_lines",
  "Funding report": "funding_tranches",
  "Bill register": "bills",
  "Asset register": "assets",
  "Audit report": "audit_logs",
};
export function Reports({
  project,
  currency,
}: {
  project: string;
  currency: string;
}) {
  const [report, setReport] = useState("Expense report");
  const [rows, setRows] = useState<Row[]>([]);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [showAll, setShowAll] = useState(false);
  const [lookups, setLookups] = useState<Record<string, Row[]>>({});
  useEffect(() => {
    const c = supabaseBrowser();
    Promise.all(
      ["categories", "vendors", "project_members"].map(
        async (t) =>
          [
            t,
            (
              await c.rpc("project_records", {
                p_project: project,
                p_table: t,
                p_limit: 200,
              })
            ).data?.rows || [],
          ] as const,
      ),
    ).then((entries) => setLookups(Object.fromEntries(entries)));
  }, [project]);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  useEffect(() => {
    let active = true;
    supabaseBrowser()
      .rpc("report_data", {
        p_project: project,
        p_report: reports[report],
        p_from: from || null,
        p_to: to || null,
        p_filters: filters,
      })
      .then(({ data, error }) => {
        if (active) {
          setRows(data || []);
          setError("");
          if (error)
            setError("Report unavailable for your role or connection.");
        }
      });
    return () => {
      active = false;
    };
  }, [project, report, from, to, filters]);
  const columns = [...new Set(rows.flatMap((r) => Object.keys(r)))].filter(
    (k) => k !== "metadata",
  );
  const visibleColumns = showAll
    ? columns
    : columns
        .filter(
          (k) =>
            !k.endsWith("_id") &&
            ![
              "id",
              "project_id",
              "created_by",
              "posted_by",
              "command_hash",
              "idempotency_key",
              "snapshot_json",
              "rendered_html",
              "rule_json",
              "created_at",
              "updated_at",
              "version",
              "metadata",
              "event_type",
            ].includes(k),
        )
        .slice(0, 8);
  function csv() {
    const text = [
      columns.map(csvCell).join(","),
      ...rows.map((r) => columns.map((k) => csvCell(r[k])).join(",")),
    ].join("\r\n");
    const url = URL.createObjectURL(
      new Blob(["\ufeff" + text], { type: "text/csv;charset=utf-8" }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = report.toLowerCase().replaceAll(" ", "-") + ".csv";
    a.click();
    URL.revokeObjectURL(url);
  }
  const chart = rows
    .filter((r) => r.total_minor)
    .slice(0, 20)
    .map((r) => ({
      label: String(r.date || r.purchase_date || r.name || "Expense").slice(
        0,
        10,
      ),
      amount: Number(BigInt(String(r.total_minor))) / 100,
      exact: String(r.total_minor),
    }));
  return (
    <div className="stack">
      <section className="panel report-controls">
        <div className="formgrid">
          <label>
            Report
            <select value={report} onChange={(e) => setReport(e.target.value)}>
              {Object.keys(reports).map((r) => (
                <option key={r}>{r}</option>
              ))}
            </select>
          </label>
          <div className="formgrid">
            <label>
              From
              <input
                type="date"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
              />
            </label>
            <label>
              To
              <input
                type="date"
                value={to}
                onChange={(e) => setTo(e.target.value)}
              />
            </label>
          </div>
        </div>
        {report === "Expense report" && (
          <details className="disclosure">
            <summary>Filter by person, vendor or category</summary>
            <div className="formgrid">
              {[
                ["category", "categories"],
                ["vendor", "vendors"],
                ["member", "project_members"],
              ].map(([key, table]) => (
                <label key={key}>
                  {key}
                  <select
                    value={filters[key] || ""}
                    onChange={(e) =>
                      setFilters({ ...filters, [key]: e.target.value })
                    }
                  >
                    <option value="">All</option>
                    {(lookups[table] || []).map((r) => (
                      <option
                        key={String(r.id)}
                        value={String(key === "member" ? r.user_id : r.id)}
                      >
                        {String(r.name || r.full_name || r.role || r.user_id)}
                      </option>
                    ))}
                  </select>
                </label>
              ))}
              <label>
                Payment source
                <select
                  value={filters.source || ""}
                  onChange={(e) =>
                    setFilters({ ...filters, source: e.target.value })
                  }
                >
                  <option value="">All</option>
                  {["PROJECT_ACCOUNT", "MEMBER", "ADVANCE", "EXTERNAL"].map(
                    (t) => (
                      <option key={t}>{t}</option>
                    ),
                  )}
                </select>
              </label>
              <label>
                Status
                <select
                  value={filters.status || ""}
                  onChange={(e) =>
                    setFilters({ ...filters, status: e.target.value })
                  }
                >
                  <option value="">All</option>
                  <option>POSTED</option>
                  <option>REVERSED</option>
                </select>
              </label>
            </div>
          </details>
        )}
        <div className="row" style={{ marginTop: 16 }}>
          <button onClick={csv}>Export complete CSV</button>
          <button onClick={() => window.print()}>Print / Save PDF</button>
        </div>
      </section>
      {error && (
        <div role="alert" className="error">
          {error}
        </div>
      )}
      {chart.length > 0 && (
        <section className="panel">
          <h2>Expenses in this view</h2>
          <div className="chart">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chart}>
                <XAxis dataKey="label" axisLine={false} tickLine={false} />
                <YAxis hide />
                <Tooltip
                  formatter={(_value, _name, item) =>
                    formatMoney(
                      String((item.payload as { exact: string }).exact),
                      currency,
                    )
                  }
                />
                <Bar
                  dataKey="amount"
                  fill="var(--accent)"
                  radius={[4, 4, 0, 0]}
                  isAnimationActive={false}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="muted">
            Exact amounts are available in the table below. Chart values are for
            visualization only.
          </p>
        </section>
      )}
      <section
        className="panel report-table"
        style={{ overflow: "auto" }}
        tabIndex={0}
        aria-label="Report table"
      >
        <h2>{report}</h2>
        <label className="row" style={{ margin: "16px 0", fontSize: 11 }}>
          <input
            type="checkbox"
            checked={showAll}
            onChange={(e) => setShowAll(e.target.checked)}
          />
          Show advanced columns
        </label>
        <table>
          <thead>
            <tr>
              {visibleColumns.map((k) => (
                <th key={k}>{fieldLabel(k)}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={String(r.id || i)}>
                {visibleColumns.map((k) => (
                  <td key={k}>
                    {k.endsWith("_minor")
                      ? formatMoney(String(r[k] || "0"), currency)
                      : r[k] === null || r[k] === undefined
                        ? "\u2014"
                        : typeof r[k] === "object"
                          ? JSON.stringify(r[k])
                          : k === "status" ||
                              k === "role" ||
                              k === "event_type" ||
                              (k === "description" &&
                                String(r[k]) === String(r.event_type))
                            ? humanLabel(String(r[k] ?? "—"))
                            : String(r[k] ?? "—")}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        {!rows.length && <p className="muted">No matching records.</p>}
      </section>
    </div>
  );
}
