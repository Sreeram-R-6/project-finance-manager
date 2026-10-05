"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { operation } from "./entry-form";
import type { Row } from "@/lib/domain";
import { parseMoney, formatMoney } from "@/lib/money";
import { tables } from "@/lib/sections";
import { uploadDocument } from "@/lib/storage";
import { supabaseBrowser } from "@/lib/supabase/browser";
import { DetailEditor } from "./detail-editor";
import { BudgetEditor } from "./budget-editor";
import Link from "next/link";
import { RefundEditor } from "./refund-editor";
import { FinancialPosition } from "./financial-position";
import {
  PageHeader,
  StatusBadge,
  MoneyAmount,
  PersonChip,
  humanLabel,
  SuccessMessage,
} from "./design-system";
import { fieldLabel, recordTitle } from "./page-copy";
import { ChevronLeft, Check, Clock, FileText } from "lucide-react";
export function RecordDetail({
  project,
  section,
  row,
  currency,
  lookups,
  comments,
  documents,
  financialPosition,
}: {
  project: string;
  section: string;
  row: Row;
  currency: string;
  lookups: Record<string, Row[]>;
  comments: Row[];
  documents: Row[];
  financialPosition: Record<string, unknown>;
}) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const [amount, setAmount] = useState("");
  const [account, setAccount] = useState(
    String(
      lookups.financial_accounts?.find((a) => a.account_type === "BANK")?.id ||
        "",
    ),
  );
  const [reference, setReference] = useState("");
  const [reason, setReason] = useState("");
  const [comment, setComment] = useState("");
  const [documentType, setDocumentType] = useState("receipt");
  const [key, setKey] = useState(() => crypto.randomUUID());
  async function run(action: string, data: Record<string, unknown>) {
    setBusy(true);
    setError("");
    try {
      await operation(project, action, data);
      setKey(crypto.randomUUID());
      setNotice("Saved. The financial history has been updated.");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to save.");
    } finally {
      setBusy(false);
    }
  }
  const source = String(row.id);
  const memberName = String(
    lookups.profiles?.find(
      (p) =>
        p.id ===
        (row.claimant_user_id ||
          row.member_user_id ||
          row.purchased_by_user_id),
    )?.full_name || "Team member",
  );
  const vendorName = lookups.vendors?.find((v) => v.id === row.vendor_id)?.name;
  const primaryAmount =
    section === "advances" && !row.financial_event_id
      ? row.requested_minor
      : (financialPosition.remaining_minor ??
        financialPosition.outstanding_minor ??
        financialPosition.net_minor ??
        row.total_minor ??
        row.requested_minor ??
        row.estimated_minor ??
        row.issued_minor ??
        row.transaction_total_minor ??
        row.purchase_value_minor);
  const kind: Record<string, string> = {
    purchases: "PURCHASE",
    bills: "BILL",
    reimbursements: "REIMBURSEMENT",
    advances: "ADVANCE",
  };
  async function post(type: string) {
    try {
      const data: Record<string, unknown> = {
        type,
        idempotency_key: key,
        source_id: source,
        description: String(row.name || row.purpose || row.notes || type),
        reference,
      };
      if (!["PURCHASE", "BILL"].includes(type)) {
        data.amount_minor = parseMoney(amount).toString();
        data.account_id = account;
      }
      await run("post", data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Check amount.");
    }
  }
  return (
    <div className="stack">
      <Link className="text-link" href={`/app/projects/${project}/${section}`}>
        <ChevronLeft size={14} />
        Back to {humanLabel(section).toLowerCase()}
      </Link>
      <PageHeader
        context={humanLabel(section)}
        title={
          section === "reimbursements"
            ? `Reimburse ${memberName}`
            : recordTitle(row)
        }
        description={String(row.notes || row.purpose || "")}
        action={<StatusBadge status={String(row.status || "Record")} />}
      />
      <section className="panel">
        <div className="detail-summary">
          <div>
            <small className="muted">
              {section === "bills"
                ? "Still to pay"
                : section === "reimbursements"
                  ? "Still to reimburse"
                  : section === "advances"
                    ? row.financial_event_id
                      ? "Advance to settle"
                      : "Requested advance"
                    : section === "transactions"
                      ? "Transaction amount"
                      : "Purchase amount"}
            </small>
            {primaryAmount !== undefined && (
              <div className="metric">
                <MoneyAmount
                  value={String(primaryAmount || "0")}
                  currency={currency}
                />
              </div>
            )}
          </div>
          {(row.claimant_user_id ||
            row.member_user_id ||
            row.purchased_by_user_id) && (
            <PersonChip
              name={memberName}
              detail={
                section === "reimbursements" ? "Paid personally" : "Team member"
              }
            />
          )}
        </div>
        <dl className="detail-meta">
          {vendorName && (
            <div>
              <dt>Vendor</dt>
              <dd>{String(vendorName)}</dd>
            </div>
          )}
          {[
            "purchase_date",
            "due_date",
            "event_date",
            "invoice_number",
            "payment_method",
            "transaction_reference",
          ]
            .filter((k) => row[k])
            .map((k) => (
              <div key={k}>
                <dt>{fieldLabel(k)}</dt>
                <dd>{String(row[k])}</dd>
              </div>
            ))}
        </dl>
        {section === "reimbursements" && (
          <div className="lifecycle">
            <span className={row.status !== "draft" ? "done" : ""}>
              <Check size={13} />
              Requested
            </span>
            <i />
            <span
              className={
                ["approved", "partially_paid", "paid"].includes(
                  String(row.status),
                )
                  ? "done"
                  : ""
              }
            >
              <Check size={13} />
              Approved
            </span>
            <i />
            <span className={row.status === "paid" ? "done" : ""}>
              {row.status === "paid" ? (
                <Check size={13} />
              ) : (
                <Clock size={13} />
              )}
              {row.status === "paid"
                ? "Paid"
                : row.status === "partially_paid"
                  ? "Partly paid"
                  : "Payment pending"}
            </span>
          </div>
        )}
      </section>
      <details className="disclosure">
        <summary>Record details & history references</summary>
        <dl className="grid">
          {Object.entries(row)
            .filter(
              ([k, v]) =>
                !["metadata", "command_hash", "idempotency_key"].includes(k) &&
                v !== null &&
                typeof v !== "object",
            )
            .map(([k, v]) => (
              <div key={k}>
                <dt className="muted">{fieldLabel(k)}</dt>
                <dd style={{ margin: "8px 0", overflowWrap: "anywhere" }}>
                  {k.endsWith("_minor")
                    ? formatMoney(String(v), currency)
                    : String(v)}
                </dd>
              </div>
            ))}
        </dl>
      </details>
      {["purchases", "bills", "reimbursements", "advances"].includes(
        section,
      ) && (
        <details className="disclosure">
          <summary>Items, payments & who paid</summary>
          <FinancialPosition
            key={key}
            currency={currency}
            position={financialPosition}
            items={(
              lookups[section === "bills" ? "bill_items" : "purchase_items"] ||
              []
            ).filter(
              (i) =>
                (section === "bills" ? i.bill_id : i.purchase_id) === source,
            )}
          />
        </details>
      )}
      {["draft", "needs_info"].includes(String(row.status)) &&
        ["purchases", "bills", "requests", "advances"].includes(section) && (
          <Link
            className="button"
            href={`/app/projects/${project}/${section}/${source}/edit`}
          >
            Edit draft
          </Link>
        )}
      {["draft", "needs_info"].includes(String(row.status)) &&
        [
          "purchases",
          "bills",
          "advances",
          "requests",
          "reimbursements",
        ].includes(section) && (
          <button
            disabled={busy}
            onClick={() =>
              run("submit", { table: tables[section], id: source })
            }
          >
            Submit for approval
          </button>
        )}
      {["purchases", "bills"].includes(section) &&
        ["draft", "approved"].includes(String(row.status)) && (
          <button
            disabled={busy}
            className="primary"
            onClick={() => post(kind[section])}
          >
            {section === "bills" ? "Confirm bill" : "Complete purchase"}
          </button>
        )}
      {["bills", "reimbursements", "advances"].includes(section) && (
        <details
          className="disclosure"
          open={section === "advances" && !row.financial_event_id}
        >
          <summary>
            {section === "advances"
              ? "Manage this advance"
              : "Record a payment"}
          </summary>
          <section className="stack">
            <h2>
              {section === "advances"
                ? "Issue, top up or return an advance"
                : "How much would you like to pay?"}
            </h2>
            <div className="formgrid">
              <label>
                Amount ({currency})
                <input
                  inputMode="decimal"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </label>
              <label>
                Project account
                <select
                  value={account}
                  onChange={(e) => setAccount(e.target.value)}
                >
                  {lookups.financial_accounts
                    ?.filter((a) =>
                      ["BANK", "CASH", "WALLET"].includes(
                        String(a.account_type),
                      ),
                    )
                    .map((a) => (
                      <option key={String(a.id)} value={String(a.id)}>
                        {String(a.name)}
                      </option>
                    ))}
                </select>
              </label>
              <label>
                Payment reference
                <input
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                />
              </label>
            </div>
            <div className="row">
              <button
                disabled={busy}
                className="primary"
                onClick={() =>
                  post(
                    section === "bills"
                      ? "BILL_PAYMENT"
                      : section === "reimbursements"
                        ? "REIMBURSEMENT"
                        : row.financial_event_id
                          ? "ADVANCE_TOPUP"
                          : "ADVANCE",
                  )
                }
              >
                {section === "advances"
                  ? row.financial_event_id
                    ? "Top up"
                    : "Issue advance"
                  : "Record payment"}
              </button>
              {section === "advances" && (
                <button disabled={busy} onClick={() => post("ADVANCE_RETURN")}>
                  Return unused funds
                </button>
              )}
              {section === "advances" && row.financial_event_id && (
                <button
                  disabled={busy}
                  onClick={() => {
                    try {
                      const reason =
                        prompt("Purpose of additional advance") || "";
                      run("topup_request", {
                        id: source,
                        amount_minor: parseMoney(amount).toString(),
                        reason,
                      });
                    } catch (e) {
                      setError(
                        e instanceof Error ? e.message : "Enter an amount.",
                      );
                    }
                  }}
                >
                  Request top-up approval
                </button>
              )}
            </div>
          </section>
        </details>
      )}
      {section === "purchases" && row.status === "posted" && (
        <details className="disclosure">
          <summary>Record a refund</summary>
          <RefundEditor
            project={project}
            purchase={source}
            currency={currency}
            lookups={lookups}
          />
        </details>
      )}
      {section === "transactions" && row.status === "POSTED" && (
        <details className="disclosure">
          <summary>Reverse this transaction</summary>
          <section className="stack">
            <h2>Reverse this event</h2>
            <p className="muted">
              The original stays in the ledger. Opposite entries restore its
              effects.
            </p>
            <label>
              Reason
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
            </label>
            <button
              disabled={busy || reason.length < 5}
              onClick={() => {
                if (window.confirm("Append a reversal for this event?"))
                  run("post", {
                    type: "REVERSAL",
                    source_id: source,
                    idempotency_key: key,
                    reason,
                  });
              }}
            >
              Confirm reversal
            </button>
          </section>
        </details>
      )}
      <section className="panel stack">
        <h2>Receipts & documents</h2>
        {documents.map((d) => (
          <button
            key={String(d.id)}
            onClick={async () => {
              const { data, error } = await supabaseBrowser()
                .storage.from(String(d.storage_bucket))
                .createSignedUrl(String(d.storage_path), 60);
              if (error) setError("Document is unavailable.");
              else window.open(data.signedUrl, "_blank", "noopener");
            }}
          >
            <FileText size={16} />
            {String(d.original_filename)} · {humanLabel(String(d.status))}
          </button>
        ))}
        <label>
          Add receipt or payment proof
          <select
            aria-label="Document type"
            value={documentType}
            onChange={(e) => setDocumentType(e.target.value)}
          >
            {[
              "receipt",
              "invoice",
              "quotation",
              "purchase_order",
              "payment_proof",
              "warranty",
              "approval_document",
              "other",
            ].map((t) => (
              <option key={t} value={t}>
                {humanLabel(t)}
              </option>
            ))}
          </select>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,application/pdf"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (file) {
                try {
                  await uploadDocument(
                    project,
                    tables[section],
                    source,
                    file,
                    documentType,
                  );
                  router.refresh();
                } catch (err) {
                  setError(
                    err instanceof Error ? err.message : "Upload failed.",
                  );
                }
              }
            }}
          />
        </label>
      </section>
      {["purchases", "bills", "reimbursements", "requests", "assets"].includes(
        section,
      ) && (
        <details className="disclosure">
          <summary>
            Comments {comments.length ? `(${comments.length})` : ""}
          </summary>
          <section className="stack">
            <h2>Comments</h2>
            {comments.map((c) => (
              <p key={String(c.id)}>{String(c.body)}</p>
            ))}
            <label>
              Comment
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
            </label>
            <button
              disabled={!comment || busy}
              onClick={() =>
                run("comments", {
                  entity_type: tables[section],
                  entity_id: source,
                  body: comment,
                })
              }
            >
              Add comment
            </button>
          </section>
        </details>
      )}
      {["purchases", "vendors", "assets"].includes(section) && (
        <details className="disclosure">
          <summary>Edit details</summary>
          <DetailEditor
            project={project}
            table={tables[section]}
            row={row}
            members={lookups.project_members || []}
          />
        </details>
      )}
      {section === "budgets" && (
        <BudgetEditor project={project} budget={source} currency={currency} />
      )}
      {row.status === "draft" &&
        [
          "purchases",
          "bills",
          "advances",
          "requests",
          "reimbursements",
        ].includes(section) && (
          <button
            disabled={busy}
            onClick={async () => {
              if (confirm("Delete this unposted draft?")) {
                await run("delete", { table: tables[section], id: source });
                router.push(`/app/projects/${project}/${section}`);
              }
            }}
          >
            Delete draft
          </button>
        )}
      {section === "advances" && row.status !== "closed" && (
        <button
          disabled={busy}
          onClick={() =>
            run("update", {
              table: "advances",
              id: source,
              values: { status: "closed" },
            })
          }
        >
          Close settled advance
        </button>
      )}
      {section === "requests" && row.status === "approved" && (
        <div className="row">
          <button
            onClick={() =>
              run("update", {
                table: "purchase_requests",
                id: source,
                values: { status: "completed" },
              })
            }
          >
            Mark completed
          </button>
          <button
            onClick={() =>
              run("update", {
                table: "purchase_requests",
                id: source,
                values: { status: "cancelled" },
              })
            }
          >
            Cancel request
          </button>
        </div>
      )}
      {error && (
        <div role="alert" className="error">
          {error}
        </div>
      )}
      {notice && <SuccessMessage>{notice}</SuccessMessage>}
    </div>
  );
}
