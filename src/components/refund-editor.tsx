"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { operation } from "./entry-form";
import { parseMoney, formatMoney } from "@/lib/money";
import type { Row } from "@/lib/domain";
export function RefundEditor({
  project,
  purchase,
  currency,
  lookups,
}: {
  project: string;
  purchase: string;
  currency: string;
  lookups: Record<string, Row[]>;
}) {
  const router = useRouter();
  const [key, setKey] = useState(() => crypto.randomUUID());
  const [splits, setSplits] = useState([
    { destination: "PROJECT_ACCOUNT", target: "", amount: "" },
  ]);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  let total = 0n;
  try {
    total = splits.reduce((n, s) => n + parseMoney(s.amount || "0"), 0n);
  } catch {}
  const change = (i: number, k: string, v: string) =>
    setSplits((s) => s.map((r, index) => (index === i ? { ...r, [k]: v } : r)));
  const sources = (destination: string) =>
    destination === "PROJECT_ACCOUNT"
      ? (lookups.financial_accounts || []).filter((a) =>
          ["BANK", "CASH", "WALLET"].includes(String(a.account_type)),
        )
      : (lookups.purchase_funding_allocations || []).filter(
          (a) => a.purchase_id === purchase && a.source_type === destination,
        );
  return (
    <section className="panel stack">
      <h2>Linked refund</h2>
      <p>
        Split the refund by its actual destination. A refund to an already
        reimbursed member creates a recovery amount owed back to the project.
      </p>
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          setBusy(true);
          try {
            await operation(project, "post", {
              type: "REFUND",
              source_id: purchase,
              idempotency_key: key,
              amount_minor: total.toString(),
              allocations: splits.map((s) => ({
                destination: s.destination,
                amount_minor: parseMoney(s.amount).toString(),
                ...(s.destination === "PROJECT_ACCOUNT"
                  ? { account_id: s.target }
                  : s.destination === "MEMBER"
                    ? { allocation_id: s.target }
                    : s.destination === "ADVANCE"
                      ? { advance_id: s.target }
                      : {}),
              })),
            });
            setKey(crypto.randomUUID());
            setMessage("Refund posted.");
            router.refresh();
          } catch (error) {
            setMessage(
              error instanceof Error ? error.message : "Unable to refund.",
            );
          } finally {
            setBusy(false);
          }
        }}
      >
        {splits.map((s, i) => (
          <div className="formgrid" key={i}>
            <label>
              Refund destination
              <select
                value={s.destination}
                onChange={(e) => {
                  change(i, "destination", e.target.value);
                  change(i, "target", "");
                }}
              >
                {["PROJECT_ACCOUNT", "MEMBER", "ADVANCE", "EXTERNAL"].map(
                  (d) => (
                    <option key={d}>{d}</option>
                  ),
                )}
              </select>
            </label>
            <label>
              Original payer / account
              <select
                required={s.destination !== "EXTERNAL"}
                value={s.target}
                onChange={(e) => change(i, "target", e.target.value)}
              >
                <option value="">Choose destination</option>
                {sources(s.destination).map((a) => (
                  <option
                    key={String(a.id)}
                    value={String(
                      s.destination === "ADVANCE" ? a.advance_id : a.id,
                    )}
                  >
                    {String(
                      a.name ||
                        (lookups.profiles || []).find(
                          (p) => p.id === a.member_user_id,
                        )?.full_name ||
                        a.source_type,
                    )}
                    {a.amount_minor
                      ? " · " + formatMoney(String(a.amount_minor), currency)
                      : ""}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Refund amount
              <input
                required
                inputMode="decimal"
                value={s.amount}
                onChange={(e) => change(i, "amount", e.target.value)}
              />
            </label>
            {splits.length > 1 && (
              <button
                type="button"
                onClick={() =>
                  setSplits((old) => old.filter((_, j) => i !== j))
                }
              >
                Remove split
              </button>
            )}
          </div>
        ))}
        <p>Total refund: {formatMoney(total, currency)}</p>
        <div className="row">
          <button
            type="button"
            onClick={() =>
              setSplits((old) => [
                ...old,
                { destination: "PROJECT_ACCOUNT", target: "", amount: "" },
              ])
            }
          >
            Add refund split
          </button>
          <button disabled={busy || total <= 0n}>Post linked refund</button>
        </div>
      </form>
      {message && <p role="status">{message}</p>}
    </section>
  );
}
