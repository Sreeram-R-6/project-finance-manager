"use client";
import { useState, useEffect } from "react";
import { supabaseBrowser } from "@/lib/supabase/browser";
import { operation } from "./entry-form";
import { useRouter } from "next/navigation";
import { PersonChip, MoneyAmount, EmptyState } from "./design-system";
type Entitlement = {
  id: string;
  member_user_id: string;
  full_name: string;
  notes: string;
  outstanding_minor: string;
  available_minor: string;
};
export function Entitlements({
  project,
  currency,
}: {
  project: string;
  currency: string;
}) {
  const [rows, setRows] = useState<Entitlement[]>([]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState("");
  const router = useRouter();
  useEffect(() => {
    supabaseBrowser()
      .rpc("member_entitlements", { p_project: project })
      .then(({ data }) => setRows(data || []));
  }, [project]);
  const people = [
    ...new Set(
      rows
        .filter((r) => BigInt(r.outstanding_minor) > 0n)
        .map((r) => r.member_user_id),
    ),
  ];
  return (
    <section className="panel">
      <div className="section-heading">
        <div>
          <h2>Money owed to your team</h2>
          <p className="muted">
            These people paid for your project from their own pocket.
          </p>
        </div>
      </div>
      {people.map((member) => {
        const expenses = rows.filter(
          (r) =>
            r.member_user_id === member && BigInt(r.outstanding_minor) > 0n,
        );
        const available = expenses.filter(
          (r) => BigInt(r.available_minor) > 0n,
        );
        const owed = expenses.reduce(
          (n, r) => n + BigInt(r.outstanding_minor),
          0n,
        );
        return (
          <div className="reimbursement-person" key={member}>
            <div className="row between">
              <PersonChip
                name={expenses[0].full_name}
                detail={`${expenses.length} personal ${expenses.length === 1 ? "purchase" : "purchases"}`}
              />
              <div className="row">
                <div>
                  <MoneyAmount
                    value={owed}
                    currency={currency}
                    className="metric"
                  />
                  <small className="muted" style={{ display: "block" }}>
                    owed to {expenses[0].full_name.split(" ")[0]}
                  </small>
                </div>
                {available.length > 0 && (
                  <button
                    disabled={busy === member}
                    onClick={async () => {
                      setBusy(member);
                      try {
                        const id = await operation(
                          project,
                          "reimbursement_claims",
                          {
                            member_user_id: member,
                            items: available.map((r) => ({
                              allocation_id: r.id,
                              amount_minor: r.available_minor,
                            })),
                          },
                        );
                        router.push(
                          `/app/projects/${project}/reimbursements/${id}`,
                        );
                      } catch (e) {
                        setError(
                          e instanceof Error
                            ? e.message
                            : "Unable to request reimbursement.",
                        );
                      } finally {
                        setBusy("");
                      }
                    }}
                  >
                    Request reimbursement
                  </button>
                )}
              </div>
            </div>
            <details>
              <summary>View personal purchases</summary>
              {expenses.map((r) => (
                <div
                  className="row between"
                  key={r.id}
                  style={{ padding: "10px 0" }}
                >
                  <span>{r.notes || "Personal project purchase"}</span>
                  <MoneyAmount
                    value={r.outstanding_minor}
                    currency={currency}
                  />
                </div>
              ))}
            </details>
          </div>
        );
      })}
      {!people.length && (
        <EmptyState
          title="Everyone’s settled up"
          description="When a teammate pays personally for a project purchase, you’ll see the amount owed here."
        />
      )}
      {error && (
        <p role="alert" className="error">
          {error}
        </p>
      )}
    </section>
  );
}
