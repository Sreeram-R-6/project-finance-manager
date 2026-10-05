"use client";
import { useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/browser";
import type { Row } from "@/lib/domain";
import { parseMoney } from "@/lib/money";
import { operation } from "./entry-form";
import { uploadDocument } from "@/lib/storage";
export function DocumentGenerator({ project }: { project: string }) {
  const [history, setHistory] = useState<Row[]>([]);
  const [templates, setTemplates] = useState<Row[]>([]);
  const [purchases, setPurchases] = useState<Row[]>([]);
  const [template, setTemplate] = useState("");
  const [recipient, setRecipient] = useState("");
  const [prose, setProse] = useState(
    "Please consider the attached statement for the project.",
  );
  const [amount, setAmount] = useState("0");
  const [selected, setSelected] = useState<string[]>([]);
  const [html, setHtml] = useState("");
  const [id, setId] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [profiles, setProfiles] = useState<Row[]>([]);
  const [member, setMember] = useState("");
  const [entitlements, setEntitlements] = useState<
    { purchase_id: string; member_user_id: string; outstanding_minor: string }[]
  >([]);
  useEffect(() => {
    const c = supabaseBrowser();
    c.rpc("project_records", {
      p_project: project,
      p_table: "generated_documents",
      p_limit: 50,
      p_order: "generated_at",
      p_desc: true,
    }).then(({ data }) => setHistory(data?.rows || []));
    Promise.all([
      c
        .from("document_templates")
        .select("*")
        .or(`project_id.is.null,project_id.eq.${project}`),
      c.rpc("project_records", {
        p_project: project,
        p_table: "purchases",
        p_limit: 200,
      }),
    ]).then(([t, p]) => {
      setTemplates(t.data || []);
      setTemplate(t.data?.[0]?.id || "");
      setPurchases(p.data?.rows || []);
    });
  }, [project]);
  useEffect(() => {
    const c = supabaseBrowser();
    Promise.all([
      c.from("profiles").select("id,full_name"),
      c
        .from("project_members")
        .select("user_id")
        .eq("project_id", project)
        .eq("is_active", true),
    ]).then(([profiles, members]) =>
      setProfiles(
        (profiles.data || []).filter((p) =>
          members.data?.some((m) => m.user_id === p.id),
        ),
      ),
    );
    c.auth.getUser().then(({ data }) => setMember(data.user?.id || ""));
    c.rpc("member_entitlements", { p_project: project }).then(({ data }) =>
      setEntitlements(data || []),
    );
  }, [project]);
  const type = String(
    templates.find((t) => t.id === template)?.template_type || "",
  );
  useEffect(() => {
    const table =
      type === "vendor_payment_request"
        ? "bills"
        : type === "purchase_approval"
          ? "purchase_requests"
          : type === "advance_request"
            ? "advances"
            : "purchases";
    supabaseBrowser()
      .rpc("project_records", {
        p_project: project,
        p_table: table,
        p_limit: 200,
      })
      .then(({ data }) => setPurchases(data?.rows || []));
  }, [project, type]);
  return (
    <section className="panel stack document-generator">
      <div>
        <div className="form-step">A little less paperwork</div>
        <h2>Create a letter or statement</h2>
        <p className="muted" style={{ fontSize: 12 }}>
          Choose a template, include your records, then preview a ready-to-share
          document.
        </p>
      </div>
      <label>
        Template
        <select
          value={template}
          onChange={(e) => {
            setTemplate(e.target.value);
            setSelected([]);
          }}
        >
          {templates.map((t) => (
            <option key={String(t.id)} value={String(t.id)}>
              {String(t.name)}
            </option>
          ))}
        </select>
      </label>
      <label>
        Member named in document
        <select
          value={member}
          onChange={(e) => {
            setMember(e.target.value);
            setSelected([]);
          }}
        >
          {profiles.map((p) => (
            <option key={String(p.id)} value={String(p.id)}>
              {String(p.full_name)}
            </option>
          ))}
        </select>
      </label>
      <label>
        Recipient
        <input
          value={recipient}
          onChange={(e) => setRecipient(e.target.value)}
        />
      </label>
      <details className="disclosure">
        <summary>Personalize the message</summary>
        <label>
          Message
          <textarea
            rows={4}
            value={prose}
            onChange={(e) => setProse(e.target.value)}
          />
        </label>
      </details>
      <label>
        Requested amount (when needed)
        <input
          inputMode="decimal"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
      </label>
      <fieldset>
        <legend>Include source records</legend>
        {purchases
          .filter((p) =>
            type === "reimbursement_request"
              ? p.status === "posted" &&
                entitlements.some(
                  (e) =>
                    e.purchase_id === p.id &&
                    e.member_user_id === member &&
                    BigInt(e.outstanding_minor) > 0n,
                )
              : type === "vendor_payment_request"
                ? ["unpaid", "partially_paid", "paid"].includes(
                    String(p.status),
                  )
                : type === "purchase_approval" || type === "advance_request"
                  ? true
                  : p.status === "posted",
          )
          .map((p) => (
            <label className="row" key={String(p.id)}>
              <input
                type="checkbox"
                style={{ width: "auto" }}
                checked={selected.includes(String(p.id))}
                onChange={(e) =>
                  setSelected((old) =>
                    e.target.checked
                      ? [...old, String(p.id)]
                      : old.filter((i) => i !== p.id),
                  )
                }
              />
              {String(
                p.title ||
                  p.purpose ||
                  p.invoice_number ||
                  p.notes ||
                  p.item_summary ||
                  String(p.id).slice(0, 8),
              )}
            </label>
          ))}
      </fieldset>
      <button
        className="primary"
        onClick={async () => {
          try {
            const res = await fetch(`/api/projects/${project}/documents`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                template,
                recipient,
                prose,
                selected,
                requested_minor: parseMoney(amount).toString(),
                member_id: member || undefined,
              }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            setHtml(data.html);
            setId(data.id);
            const list = await supabaseBrowser().rpc("project_records", {
              p_project: project,
              p_table: "generated_documents",
              p_limit: 50,
              p_order: "generated_at",
              p_desc: true,
            });
            setHistory(list.data?.rows || []);
          } catch (e) {
            setError(e instanceof Error ? e.message : "Generation failed.");
          }
        }}
      >
        Generate preview
      </button>
      {success && (
        <p className="success" role="status">
          {success}
        </p>
      )}
      {error && (
        <div role="alert" className="error">
          {error}
        </div>
      )}
      {html && (
        <>
          <div
            className="document-preview print-document"
            dangerouslySetInnerHTML={{ __html: html }}
          />
          <div className="row">
            <a className="button primary" href={`/api/documents/${id}/pdf`}>
              Download PDF
            </a>
            <button onClick={() => window.print()}>Print</button>
            <button
              onClick={async () => {
                try {
                  const r = await fetch(`/api/documents/${id}/pdf`);
                  if (!r.ok) throw new Error("PDF generation failed.");
                  const blob = await r.blob();
                  await uploadDocument(
                    project,
                    "generated_documents",
                    id,
                    new File([blob], `document-${id}.pdf`, {
                      type: "application/pdf",
                    }),
                    "generated_letter",
                  );
                  setError("");
                  setSuccess("PDF saved in your private project documents.");
                } catch (e) {
                  setError(
                    e instanceof Error ? e.message : "Unable to save PDF.",
                  );
                }
              }}
            >
              Save PDF to project documents
            </button>
          </div>
        </>
      )}
      <details>
        <summary>Your generated documents</summary>
        {history.map((d) => (
          <p key={String(d.id)}>
            <a className="button" href={`/api/documents/${d.id}/pdf`}>
              {String(d.reference_number)} /{" "}
              {String(d.generated_at).slice(0, 10)}
            </a>
          </p>
        ))}
      </details>
      <details>
        <summary>Create a custom template</summary>
        <form
          action={async (f) => {
            try {
              await operation(project, "document_templates", {
                name: f.get("name"),
                subject_template: f.get("subject"),
                body_template: f.get("body"),
              });
              const { data } = await supabaseBrowser()
                .from("document_templates")
                .select("*")
                .or(`project_id.is.null,project_id.eq.${project}`);
              setTemplates(data || []);
            } catch (e) {
              setError(
                e instanceof Error ? e.message : "Unable to save template.",
              );
            }
          }}
        >
          <label>
            Template name
            <input name="name" required />
          </label>
          <label>
            Subject
            <input name="subject" />
          </label>
          <label>
            Template body
            <textarea
              name="body"
              rows={7}
              defaultValue={
                "<h1>{{project.name}}</h1><p>{{prose}}</p>{{expenses}}"
              }
            />
            <small>
              Use project.name, project.code, member.name, amount, amount_words,
              today and expenses placeholders. Scripts and unsafe HTML are
              removed.
            </small>
          </label>
          <button>Save custom template</button>
        </form>
      </details>
    </section>
  );
}
