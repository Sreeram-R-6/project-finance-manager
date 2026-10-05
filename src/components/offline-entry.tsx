"use client";
import { useState, useEffect } from "react";
import { drafts, saveDraft, deleteDraft, type Draft } from "@/lib/offline";
import { supabaseBrowser } from "@/lib/supabase/browser";
import { parseMoney } from "@/lib/money";
import { operation } from "./entry-form";
import { uploadDocument } from "@/lib/storage";
import { purchasePayload } from "@/lib/purchase-input";
import Link from "next/link";
export function OfflineEntry() {
  const [projects, setProjects] = useState<{ id: string; name: string }[]>([]);
  const [user, setUser] = useState("");
  const [list, setList] = useState<Draft[]>([]);
  const [message, setMessage] = useState("");
  useEffect(() => {
    const last = localStorage.getItem("pfm-user") || "offline-local";
    drafts(last).then((rows) => {
      try {
        setProjects(JSON.parse(localStorage.getItem("pfm-projects") || "[]"));
      } catch {}
      setUser(last);
      setList(rows);
    });
    supabaseBrowser()
      .auth.getUser()
      .then(({ data }) => {
        if (data.user) {
          localStorage.setItem("pfm-user", data.user.id);
          setUser(data.user.id);
          drafts(data.user.id).then(setList);
        }
      });
  }, []);
  return (
    <>
      <form
        action={async (f) => {
          try {
            const d: Draft = {
              id: crypto.randomUUID(),
              user,
              project: String(f.get("project")),
              data: {
                description: String(f.get("description")),
                amount: String(f.get("amount")),
              },
              files: Array.from(f.getAll("receipt")).filter(
                (x): x is File => x instanceof File && x.size > 0,
              ),
              updated: new Date().toISOString(),
            };
            await saveDraft(d);
            setList(await drafts(user));
            setMessage("Saved on this device.");
          } catch {
            setMessage("Device storage is unavailable.");
          }
        }}
      >
        <label>
          Project
          {projects.length ? (
            <select name="project" required>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          ) : (
            <input name="project" required placeholder="Project reference" />
          )}
        </label>
        <label>
          Receipt
          <input
            type="file"
            name="receipt"
            accept="image/*,application/pdf"
            capture="environment"
            multiple
          />
        </label>
        <label>
          Description
          <input name="description" required />
        </label>
        <label>
          Amount
          <input name="amount" inputMode="decimal" required />
        </label>
        <button>Save offline draft</button>
      </form>
      <h2>Saved drafts</h2>
      {list.map((d) => (
        <section className="panel stack" key={d.id}>
          <strong>{String(d.data.description || "Purchase draft")}</strong>
          <small>
            {d.updated} · {d.files.length} receipt(s)
          </small>
          <button
            onClick={async () => {
              if (!navigator.onLine) {
                setMessage("Reconnect before reviewing and submitting.");
                return;
              }
              if (
                !confirm(
                  "Review complete? Submit this as an online draft, without posting money?",
                )
              )
                return;
              try {
                const c = supabaseBrowser();
                const { data: u } = await c.auth.getUser();
                if (
                  !u.user ||
                  (u.user.id !== d.user && d.user !== "offline-local")
                )
                  throw new Error("Sign in as the draft owner.");
                const { data: accounts } = await c.rpc("project_records", {
                  p_project: d.project,
                  p_table: "financial_accounts",
                });
                const amount = d.data.items
                  ? 0n
                  : parseMoney(String(d.data.amount));
                const account = accounts?.rows?.find(
                  (r: { account_type: string }) => r.account_type === "BANK",
                );
                const id = await operation(
                  d.project,
                  "purchase",
                  d.data.items
                    ? { ...purchasePayload(d.data), id: d.id }
                    : {
                        id: d.id,
                        items: [
                          {
                            description: String(d.data.description),
                            quantity: "1",
                            unit_price_minor: amount.toString(),
                          },
                        ],
                        allocations: [
                          {
                            source_type: "PROJECT_ACCOUNT",
                            project_account_id: account.id,
                            amount_minor: amount.toString(),
                          },
                        ],
                      },
                );
                for (const file of d.files)
                  await uploadDocument(
                    d.project,
                    "purchases",
                    id,
                    file,
                    "receipt",
                  );
                await deleteDraft(d.id);
                setList(await drafts(user));
                setMessage(
                  "Online draft created. Open the project to review receipts, approvals and posting.",
                );
              } catch (e) {
                setMessage(
                  e instanceof Error ? e.message : "Unable to submit.",
                );
              }
            }}
          >
            Review and submit online
          </button>
          <button
            onClick={async () => {
              await deleteDraft(d.id);
              setList(await drafts(user));
            }}
          >
            Delete local draft
          </button>
        </section>
      ))}
      <Link className="button" href="/app">
        Return to workspace
      </Link>
      {message && (
        <p role="status" className="notice">
          {message}
        </p>
      )}
    </>
  );
}
