"use client";
import { useState, useEffect } from "react";
import { operation } from "./entry-form";
import type { Row } from "@/lib/domain";
import { parseMoney } from "@/lib/money";
import { Recurring } from "./recurring";
import { supabaseBrowser } from "@/lib/supabase/browser";
export function Settings({ project, rows }: { project: string; rows: Row[] }) {
  const [message, setMessage] = useState("");
  const [checks, setChecks] = useState<Record<string, boolean>>({});
  const [closeReason, setCloseReason] = useState("");
  useEffect(() => {
    supabaseBrowser()
      .rpc("closeout_checks", { p_project: project })
      .then(({ data }) => setChecks(data || {}));
  }, [project]);
  return (
    <div className="settings-layout">
      <details className="disclosure">
        <summary>Project status</summary>
        <div className="stack">
          <form
            action={async (f) => {
              try {
                await operation(project, "status", {
                  status: f.get("status"),
                  reason: f.get("reason"),
                });
                setMessage("Project status updated.");
              } catch (e) {
                setMessage(
                  e instanceof Error ? e.message : "Unable to update.",
                );
              }
            }}
          >
            <label>
              Status
              <select name="status">
                <option>active</option>
                <option>paused</option>
                <option>closing</option>
                <option>archived</option>
              </select>
            </label>
            <label>
              Reason
              <input name="reason" required minLength={5} />
            </label>
            <button>Update status</button>
          </form>
        </div>
      </details>
      <details className="disclosure">
        <summary>Spending approvals</summary>
        <div className="stack">
          <p className="muted">
            Choose when a purchase needs approval and who reviews it.
          </p>
          <form
            action={async (f) => {
              try {
                await operation(project, "approval_policies", {
                  name: f.get("name"),
                  entity_type: f.get("entity"),
                  priority: Number(f.get("priority")),
                  rule_json: {
                    minimum_minor: parseMoney(
                      String(f.get("minimum")),
                    ).toString(),
                    steps: String(f.get("roles"))
                      .split(",")
                      .map((role) => ({ role: role.trim() })),
                  },
                });
                setMessage("Policy saved.");
              } catch (e) {
                setMessage(e instanceof Error ? e.message : "Unable to save.");
              }
            }}
          >
            <label>
              Name
              <input name="name" required />
            </label>
            <label>
              Applies to
              <select name="entity">
                {[
                  "purchases",
                  "bills",
                  "reimbursement_claims",
                  "purchase_requests",
                  "advances",
                ].map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </label>
            <div className="formgrid">
              <label>
                Minimum amount requiring approval
                <input name="minimum" defaultValue="0" inputMode="decimal" />
              </label>
              <label>
                Priority
                <input name="priority" type="number" defaultValue="0" />
              </label>
            </div>
            <label>
              Sequential approver roles
              <input name="roles" defaultValue="APPROVER" />
              <small>
                Comma separated, for example APPROVER,FINANCE_MANAGER. Self
                approval is forbidden.
              </small>
            </label>
            <button>Save policy</button>
          </form>
          {rows.map((r) => (
            <p key={String(r.id)}>
              {String(r.name)} · {String(r.entity_type)}
              <button
                onClick={async () => {
                  try {
                    await operation(project, "update", {
                      table: "approval_policies",
                      id: r.id,
                      values: { is_active: !r.is_active },
                    });
                    setMessage(
                      "Policy updated. Reload to see its current state.",
                    );
                  } catch (e) {
                    setMessage(
                      e instanceof Error ? e.message : "Unable to update.",
                    );
                  }
                }}
              >
                {r.is_active ? "Deactivate" : "Activate"}
              </button>
            </p>
          ))}
        </div>
      </details>
      <details className="disclosure">
        <summary>Funding sources & money accounts</summary>
        <div className="stack">
          <form
            action={async (f) => {
              try {
                await operation(project, "funding_sources", {
                  name: f.get("name"),
                  type: f.get("type"),
                });
                setMessage("Funding source saved.");
              } catch (e) {
                setMessage(e instanceof Error ? e.message : "Unable to save.");
              }
            }}
          >
            <label>
              Source name
              <input name="name" required />
            </label>
            <label>
              Source type
              <select name="type">
                {[
                  "grant",
                  "sponsor",
                  "member_contribution",
                  "donation",
                  "revenue",
                  "other",
                ].map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </label>
            <button>Add funding source</button>
          </form>
          <form
            action={async (f) => {
              try {
                await operation(project, "financial_accounts", {
                  name: f.get("name"),
                  account_type: f.get("type"),
                });
                setMessage("Cash account saved.");
              } catch (e) {
                setMessage(e instanceof Error ? e.message : "Unable to save.");
              }
            }}
          >
            <label>
              Account name
              <input name="name" required />
            </label>
            <label>
              Account type
              <select name="type">
                <option>BANK</option>
                <option>CASH</option>
                <option>WALLET</option>
              </select>
            </label>
            <button>Add cash account</button>
          </form>
        </div>
      </details>
      <details className="disclosure">
        <summary>Finish & close this project</summary>
        <div className="stack">
          {Object.entries(checks).map(([name, ok]) => (
            <p key={name}>
              {ok ? "✓" : "Action required:"} {name.replaceAll("_", " ")}
            </p>
          ))}
          <label>
            Reason for a nonfinancial closeout exception
            <textarea
              value={closeReason}
              onChange={(e) => setCloseReason(e.target.value)}
            />
            <small>
              Money must be settled. Missing receipts or assignments require an
              explicit owner reason.
            </small>
          </label>
          <button
            onClick={async () => {
              try {
                const r = await fetch(`/api/projects/${project}/finance-pack`, {
                  method: "POST",
                });
                const data = await r.json();
                if (!r.ok) throw new Error(data.error);
                window.open(
                  `/api/documents/${data.id}/pdf`,
                  "_blank",
                  "noopener",
                );
                setMessage("Finance pack generated and saved.");
              } catch (e) {
                setMessage(
                  e instanceof Error ? e.message : "Unable to generate pack.",
                );
              }
            }}
          >
            Generate final finance pack
          </button>
          <p>
            Closure is blocked while bills, member payables, advances, requests
            or approvals remain unsettled.
          </p>
          <button
            onClick={async () => {
              if (
                confirm(
                  "Close this project and make normal finances read-only?",
                )
              ) {
                try {
                  const pack = await fetch(
                    `/api/projects/${project}/finance-pack`,
                    { method: "POST" },
                  );
                  if (!pack.ok)
                    throw new Error(
                      "Generate the final finance pack before closing.",
                    );
                  await operation(project, "close", { reason: closeReason });
                  setMessage("Project closed.");
                } catch (e) {
                  setMessage(
                    e instanceof Error ? e.message : "Unable to close.",
                  );
                }
              }
            }}
          >
            Close project
          </button>
        </div>
      </details>
      <details className="disclosure">
        <summary>Recurring reminders</summary>
        <Recurring project={project} />
      </details>
      {message && (
        <p role="status" className="notice">
          {message}
        </p>
      )}
    </div>
  );
}
