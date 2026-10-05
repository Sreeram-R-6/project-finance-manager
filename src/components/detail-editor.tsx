"use client";
import { fieldLabel } from "./page-copy";
import type { Row } from "@/lib/domain";
import { operation } from "./entry-form";
import { useRouter } from "next/navigation";
import { useState } from "react";
export function DetailEditor({
  project,
  table,
  row,
  members,
}: {
  project: string;
  table: string;
  row: Row;
  members: Row[];
}) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const fields: Record<string, string[]> = {
    vendors: [
      "name",
      "gstin",
      "contact_person",
      "email",
      "phone",
      "website",
      "address",
      "notes",
    ],
    assets: [
      "serial_number",
      "asset_tag",
      "status",
      "assigned_user_id",
      "warranty_expires_at",
      "location",
      "notes",
    ],
    purchases: ["notes"],
    projects: ["name", "description"],
  };
  if (!fields[table]) return null;
  return (
    <section className="panel stack">
      <h2>
        Edit {table === "purchases" ? "nonfinancial notes" : "record details"}
      </h2>
      <form
        action={async (f) => {
          try {
            const values = Object.fromEntries(
              fields[table].map((k) => [k, String(f.get(k) || "")]),
            );
            await operation(project, "update", { table, id: row.id, values });
            setMessage("Saved with audit history.");
            router.refresh();
          } catch (e) {
            setMessage(e instanceof Error ? e.message : "Unable to save.");
          }
        }}
      >
        {fields[table].map((k) => (
          <label key={k}>
            {fieldLabel(k)}
            {k === "status" ? (
              <select name={k} defaultValue={String(row[k] || "available")}>
                {["available", "assigned", "repair", "retired", "lost"].map(
                  (s) => (
                    <option key={s}>{s}</option>
                  ),
                )}
              </select>
            ) : k === "assigned_user_id" ? (
              <select name={k} defaultValue={String(row[k] || "")}>
                <option value="">Unassigned</option>
                {members.map((m) => (
                  <option key={String(m.user_id)} value={String(m.user_id)}>
                    {String(m.full_name || m.user_id)}
                  </option>
                ))}
              </select>
            ) : (
              <input
                name={k}
                type={k.endsWith("_at") ? "date" : "text"}
                defaultValue={String(row[k] || "")}
              />
            )}
          </label>
        ))}
        <button>Save details</button>
      </form>
      {message && (
        <p role="status" className="notice">
          {message}
        </p>
      )}
    </section>
  );
}
