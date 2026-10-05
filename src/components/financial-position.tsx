"use client";
import { formatMoney } from "@/lib/money";
import type { Row } from "@/lib/domain";
import { fieldLabel, sourceLabels } from "./page-copy";
export function FinancialPosition({
  currency,
  items,
  position,
}: {
  currency: string;
  items: Row[];
  position: Record<string, unknown>;
}) {
  return (
    <section className="stack">
      <h2>Amount breakdown</h2>
      <div className="grid">
        {Object.entries(position)
          .filter(([k]) => k.endsWith("_minor"))
          .map(([k, v]) => (
            <div key={k}>
              <small className="muted">{fieldLabel(k)}</small>
              <p>{formatMoney(String(v || "0"), currency)}</p>
            </div>
          ))}
      </div>
      {items.length > 0 && (
        <div
          style={{ overflowX: "auto" }}
          tabIndex={0}
          role="region"
          aria-label="Line items"
        >
          <table>
            <thead>
              <tr>
                <th>Item</th>
                <th>Quantity</th>
                <th>Unit price</th>
                <th>Tax</th>
                <th>Discount</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {items.map((i) => (
                <tr key={String(i.id)}>
                  <td>{String(i.description)}</td>
                  <td>{String(i.quantity)}</td>
                  {[
                    "unit_price_minor",
                    "tax_minor",
                    "discount_minor",
                    "line_total_minor",
                  ].map((k) => (
                    <td key={k}>
                      {formatMoney(String(i[k] || "0"), currency)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {Array.isArray(position.allocations) && (
        <>
          <h3>Who paid</h3>
          {(position.allocations as Row[]).map((a) => (
            <p key={String(a.id)}>
              {sourceLabels[String(a.source_type)] || String(a.source_type)}:{" "}
              {formatMoney(String(a.amount_minor), currency)}
              {a.outstanding_minor !== null
                ? " / still owed " +
                  formatMoney(String(a.outstanding_minor), currency)
                : ""}
            </p>
          ))}
        </>
      )}
    </section>
  );
}
