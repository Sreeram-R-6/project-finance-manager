"use client";
import { useState } from "react";
import { operation } from "./entry-form";
import { useRouter } from "next/navigation";
import type { Row } from "@/lib/domain";
import { formatMoney } from "@/lib/money";
import { supabaseBrowser } from "@/lib/supabase/browser";
import { useEffect } from "react";
import { PersonChip, MoneyAmount, humanLabel } from "./design-system";
const roles = [
  "OWNER",
  "ADMIN",
  "FINANCE_MANAGER",
  "APPROVER",
  "MEMBER",
  "VIEWER",
];
export function Team({
  project,
  rows,
  currency,
}: {
  project: string;
  rows: Row[];
  currency: string;
}) {
  const [inviteLink, setInviteLink] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("MEMBER");
  const [message, setMessage] = useState("");
  const router = useRouter();
  const [invites, setInvites] = useState<Row[]>([]);
  useEffect(() => {
    supabaseBrowser()
      .from("project_invites")
      .select("id,email,role,expires_at,accepted_at,revoked_at")
      .eq("project_id", project)
      .then(({ data }) => setInvites(data || []));
  }, [project]);
  async function run(action: string, data: Record<string, unknown>) {
    try {
      await operation(project, action, data);
      router.refresh();
      setMessage("Membership updated.");
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Unable to update.");
    }
  }
  return (
    <div className="stack">
      <details className="disclosure">
        <summary>Invite a teammate</summary>
        <div className="stack">
          <div className="formgrid">
            <label>
              Email
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </label>
            <label>
              Role
              <select value={role} onChange={(e) => setRole(e.target.value)}>
                {roles
                  .filter((r) => r !== "OWNER")
                  .map((r) => (
                    <option key={r} value={r}>
                      {humanLabel(r)}
                    </option>
                  ))}
              </select>
            </label>
          </div>
          <button
            onClick={async () => {
              try {
                const token = await operation(project, "invite", {
                  email,
                  role,
                });
                const url = location.origin + "/invite/" + token;
                setInviteLink(url);
                try {
                  await navigator.clipboard.writeText(url);
                } catch {}
                const { data } = await supabaseBrowser()
                  .from("project_invites")
                  .select("id,email,role,expires_at,accepted_at,revoked_at")
                  .eq("project_id", project);
                setInvites(data || []);
                setMessage("Invitation link copied. It expires in seven days.");
              } catch (e) {
                setMessage(e instanceof Error ? e.message : "Invite failed.");
              }
            }}
          >
            Create and copy invite link
          </button>
        </div>
      </details>
      {inviteLink && (
        <label>
          Invitation link
          <input readOnly value={inviteLink} />
        </label>
      )}
      <section className="panel team-list">
        {rows.map((r) => (
          <div className="team-person" key={String(r.id)}>
            <div className="person-heading">
              <PersonChip
                name={String(r.full_name || "Team member")}
                detail={humanLabel(String(r.role))}
              />
              <div style={{ textAlign: "right" }}>
                <MoneyAmount
                  value={String(r.reimbursement_outstanding_minor || "0")}
                  currency={currency}
                />
                <small
                  className="muted"
                  style={{ display: "block", fontSize: 10 }}
                >
                  owed to this person
                </small>
              </div>
            </div>
            <details>
              <summary>Balances & membership settings</summary>
              <div>
                <strong>{String(r.full_name || r.user_id)}</strong>
                <p>
                  Personal spend{" "}
                  {formatMoney(String(r.personal_spend_minor || "0"), currency)}{" "}
                  · Reimbursed{" "}
                  {formatMoney(String(r.reimbursed_minor || "0"), currency)}
                </p>
                <p>
                  Owed{" "}
                  {formatMoney(
                    String(r.reimbursement_outstanding_minor || "0"),
                    currency,
                  )}{" "}
                  · Advance outstanding{" "}
                  {formatMoney(
                    String(r.advance_outstanding_minor || "0"),
                    currency,
                  )}
                </p>
                <p className="muted">
                  Joined {String(r.joined_at).slice(0, 10)} ·{" "}
                  {r.is_active ? "Active" : "Inactive"}
                </p>
              </div>
              <div className="row">
                <select
                  aria-label="Member role"
                  style={{ width: "auto" }}
                  value={String(r.role)}
                  onChange={(e) =>
                    run("member", {
                      user_id: r.user_id,
                      role: e.target.value,
                      active: r.is_active,
                    })
                  }
                >
                  {roles.map((role) => (
                    <option key={role} value={role}>
                      {humanLabel(role)}
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => {
                    if (confirm("Transfer ownership to this member?"))
                      run("owner", { user_id: r.user_id });
                  }}
                >
                  Transfer ownership
                </button>
                <button
                  onClick={() =>
                    run("member", {
                      user_id: r.user_id,
                      role: r.role,
                      active: !r.is_active,
                    })
                  }
                >
                  {r.is_active ? "Deactivate" : "Reactivate"}
                </button>
              </div>
            </details>
          </div>
        ))}
      </section>
      <details className="disclosure">
        <summary>Invitations</summary>
        <div className="stack">
          {invites.map((i) => (
            <div className="row between" key={String(i.id)}>
              <span>
                {String(i.email)} · {String(i.role)} ·{" "}
                {i.accepted_at
                  ? "Accepted"
                  : i.revoked_at
                    ? "Revoked"
                    : "Pending"}
              </span>
              {!i.accepted_at && !i.revoked_at && (
                <button onClick={() => run("revoke", { id: i.id })}>
                  Revoke
                </button>
              )}
            </div>
          ))}
        </div>
      </details>
      {message && (
        <p role="status" className="notice">
          {message}
        </p>
      )}
    </div>
  );
}
