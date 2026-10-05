"use client";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table";
import { useState } from "react";
import type { Row } from "@/lib/domain";
import { formatMoney } from "@/lib/money";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ShoppingBag,
  ArrowLeftRight,
  ArrowUpRight,
  FileText,
  ChevronRight,
} from "lucide-react";
import {
  StatusBadge,
  MoneyAmount,
  EmptyState,
  humanLabel,
} from "./design-system";
import { fieldLabel, recordTitle, addLabels } from "./page-copy";
import { DetailDrawer } from "./detail-drawer";
export function RecordsTable({
  rows,
  base,
  currency,
  total,
  page,
}: {
  rows: Row[];
  base: string;
  currency: string;
  total: number;
  page: number;
}) {
  "use no memo";
  // TanStack's mutable row model must retain its own callbacks and state.
  const router = useRouter();
  const query = useSearchParams();
  const section = base.split("/").at(-1) || "";
  const [selected, setSelected] = useState<Row | null>(null);
  const sorting: SortingState = query.get("order")
    ? [{ id: query.get("order")!, desc: query.get("desc") === "true" }]
    : [];
  const [columnVisibility, setColumnVisibility] = useState<
    Record<string, boolean>
  >({ invoice_number: false });
  const keys = [
    "vendor_name",
    "payer_label",
    "transaction_total_minor",
    "total_minor",
    "requested_minor",
    "estimated_minor",
    "amount_minor",
    "purchase_value_minor",
    "status",
    "purchase_date",
    "due_date",
    "event_date",
    "start_date",
    "end_date",
    "invoice_number",
  ].filter((k) => rows.some((r) => r[k] !== undefined));
  const amount = (r: Row) =>
    r.transaction_total_minor ||
    r.total_minor ||
    r.requested_minor ||
    r.estimated_minor ||
    r.amount_minor ||
    r.purchase_value_minor;
  const subtitle = (r: Row) =>
    String(
      r.vendor_name ||
        r.payer_label ||
        r.invoice_number ||
        (r.event_type && humanLabel(String(r.event_type))) ||
        (r.document_type && humanLabel(String(r.document_type))) ||
        "",
    );
  const columns: ColumnDef<Row>[] = [
    {
      id: "record",
      header:
        section === "purchases"
          ? "What was bought"
          : section === "transactions"
            ? "What happened"
            : "Name",
      enableSorting: false,
      cell: ({ row }) => (
        <>
          <button
            className="record-title"
            onClick={() => setSelected(row.original)}
          >
            {recordTitle(row.original)}
          </button>
          <small className="record-subtitle">{subtitle(row.original)}</small>
        </>
      ),
    },
    ...keys.map((k) => ({
      accessorKey: k,
      enableSorting: !["vendor_name", "payer_label"].includes(k),
      header:
        k === "vendor_name"
          ? "Vendor"
          : k === "payer_label"
            ? "Who paid"
            : fieldLabel(k),
      cell: ({ getValue }: { getValue: () => unknown }) =>
        k === "status" ? (
          <StatusBadge status={String(getValue())} />
        ) : k.endsWith("_minor") ? (
          <span className="money">
            {formatMoney(String(getValue() ?? "0"), currency)}
          </span>
        ) : (
          String(getValue() || "—")
        ),
    })),
  ];
  const table = useReactTable({
    data: rows,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualSorting: true,
    state: { sorting, columnVisibility },
    onSortingChange: (updater) => {
      const next = typeof updater === "function" ? updater(sorting) : updater;
      const p = new URLSearchParams(query.toString());
      p.set("order", next[0]?.id || "id");
      p.set("desc", String(next[0]?.desc || false));
      p.delete("page");
      router.push(`${base}?${p}`);
    },
    onColumnVisibilityChange: setColumnVisibility,
  });
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const week = new Date(today);
  week.setDate(week.getDate() + 7);
  const groups = [
    {
      title: "Overdue",
      test: (r: Row) =>
        !["paid", "cancelled"].includes(String(r.status)) &&
        !!r.due_date &&
        new Date(String(r.due_date) + "T00:00:00") < today,
    },
    {
      title: "Due this week",
      test: (r: Row) =>
        !["paid", "cancelled"].includes(String(r.status)) &&
        !!r.due_date &&
        new Date(String(r.due_date) + "T00:00:00") >= today &&
        new Date(String(r.due_date) + "T00:00:00") <= week,
    },
    {
      title: "Upcoming & drafts",
      test: (r: Row) =>
        !["paid", "cancelled"].includes(String(r.status)) &&
        (!r.due_date || new Date(String(r.due_date) + "T00:00:00") > week),
    },
    {
      title: "Paid & cancelled",
      test: (r: Row) => ["paid", "cancelled"].includes(String(r.status)),
    },
  ];
  return (
    <>
      {section === "bills" ? (
        <>
          {groups.map((g) => {
            const bills = rows.filter(g.test);
            return (
              bills.length > 0 && (
                <section key={g.title}>
                  <div className="eyebrow bill-group">
                    {g.title} · {bills.length}
                  </div>
                  {bills.map((r) => (
                    <div className="bill-card" key={String(r.id)}>
                      <div>
                        <button
                          className="record-title"
                          onClick={() => setSelected(r)}
                        >
                          {String(
                            r.vendor_name ||
                              r.notes ||
                              r.invoice_number ||
                              "Vendor bill",
                          )}
                        </button>
                        <small>
                          {r.due_date
                            ? "Due " +
                              new Date(
                                String(r.due_date) + "T00:00:00",
                              ).toLocaleDateString("en-IN", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })
                            : "Date not set"}{" "}
                          · <StatusBadge status={String(r.status)} />
                        </small>
                      </div>
                      <div>
                        <MoneyAmount
                          value={String(
                            r.outstanding_minor ?? r.total_minor ?? "0",
                          )}
                          currency={currency}
                        />
                        <small>
                          {r.outstanding_minor !== undefined
                            ? "Remaining to pay"
                            : "Bill total"}
                        </small>
                      </div>
                      <Link className="button" href={`${base}/${r.id}`}>
                        {["paid", "cancelled"].includes(String(r.status))
                          ? "View bill"
                          : "Pay bill"}
                        <ArrowUpRight size={14} />
                      </Link>
                    </div>
                  ))}
                </section>
              )
            );
          })}
        </>
      ) : (
        <>
          {rows.length > 0 && (
            <div className="table-tools">
              <span className="muted" style={{ fontSize: 11 }}>
                {total} {section === "purchases" ? "purchases" : "records"}
              </span>
              <details>
                <summary>Customize columns</summary>
                <div className="row">
                  {table
                    .getAllLeafColumns()
                    .filter((c) => c.id !== "record")
                    .map((c) => (
                      <label className="row" key={c.id}>
                        <input
                          type="checkbox"
                          checked={c.getIsVisible()}
                          onChange={c.getToggleVisibilityHandler()}
                        />
                        {fieldLabel(c.id)}
                      </label>
                    ))}
                </div>
              </details>
            </div>
          )}
          <div
            className="desktoptable"
            tabIndex={0}
            role="region"
            aria-label="Project records"
          >
            <table>
              <thead>
                {table.getHeaderGroups().map((g) => (
                  <tr key={g.id}>
                    {g.headers.map((h) => (
                      <th key={h.id}>
                        {h.column.getCanSort() ? (
                          <button
                            style={{ border: 0, padding: 0 }}
                            onClick={h.column.getToggleSortingHandler()}
                          >
                            {flexRender(
                              h.column.columnDef.header,
                              h.getContext(),
                            )}
                            {h.column.getIsSorted()
                              ? h.column.getIsSorted() === "desc"
                                ? " ↓"
                                : " ↑"
                              : ""}
                          </button>
                        ) : (
                          flexRender(h.column.columnDef.header, h.getContext())
                        )}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody>
                {table.getRowModel().rows.map((r) => (
                  <tr key={r.id}>
                    {r.getVisibleCells().map((c) => (
                      <td
                        key={c.id}
                        className={
                          c.column.id.endsWith("_minor") ? "table-amount" : ""
                        }
                      >
                        {flexRender(c.column.columnDef.cell, c.getContext())}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div
            className={`mobilecards ${section === "transactions" ? "mobile-timeline" : ""}`}
          >
            {rows.map((r) => (
              <button
                className="mobile-record"
                onClick={() => setSelected(r)}
                key={String(r.id)}
              >
                <span className="transaction-icon">
                  {section === "purchases" ? (
                    <ShoppingBag size={16} />
                  ) : section === "documents" ? (
                    <FileText size={16} />
                  ) : (
                    <ArrowLeftRight size={16} />
                  )}
                </span>
                <span>
                  <strong>{recordTitle(r)}</strong>
                  <small>
                    {subtitle(r)}
                    {subtitle(r) ? " · " : ""}
                    {String(
                      r.purchase_date || r.due_date || r.event_date || "",
                    )}
                  </small>
                  <small>{r.status && humanLabel(String(r.status))}</small>
                </span>
                {amount(r) ? (
                  <MoneyAmount value={String(amount(r))} currency={currency} />
                ) : (
                  <ChevronRight size={15} />
                )}
              </button>
            ))}
          </div>
        </>
      )}
      {!rows.length && (
        <EmptyState
          title={`No ${section === "activity" ? "activity" : section} to show`}
          description={
            query.get("q") || query.get("status")
              ? "Try a different search or clear your filters."
              : section === "documents"
                ? "Keep receipts with their purchases, or create a letter below."
                : `Add your first ${section === "purchases" ? "purchase" : "record"} to start this part of your project.`
          }
          href={addLabels[section] ? `${base}/new` : undefined}
          action={addLabels[section]}
        />
      )}
      {rows.length > 0 && (
        <div className="row between pagination">
          <small className="muted">
            Page {page} · {total} records
          </small>
          <div className="row">
            {page > 1 && (
              <Link
                className="button"
                href={`${base}?${new URLSearchParams({ ...Object.fromEntries(query), page: String(page - 1) })}`}
              >
                Previous
              </Link>
            )}
            {page * 50 < total && (
              <Link
                className="button"
                href={`${base}?${new URLSearchParams({ ...Object.fromEntries(query), page: String(page + 1) })}`}
              >
                Next
              </Link>
            )}
          </div>
        </div>
      )}
      <DetailDrawer
        row={selected}
        base={base}
        currency={currency}
        onClose={() => setSelected(null)}
      />
    </>
  );
}
