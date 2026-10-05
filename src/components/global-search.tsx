"use client";
import { useState, useEffect } from "react";
import { supabaseBrowser } from "@/lib/supabase/browser";
import Link from "next/link";
export function GlobalSearch({
  project,
  close,
}: {
  project?: string;
  close: () => void;
}) {
  const [query, setQuery] = useState("");
  const [rows, setRows] = useState<
    { id: string; project_id: string; section: string; label: string }[]
  >([]);
  useEffect(() => {
    let active = true;
    const timer = setTimeout(() => {
      supabaseBrowser()
        .rpc("search_records", { p_query: query, p_project: project || null })
        .then(({ data }) => {
          if (active) setRows(data || []);
        });
    }, 250);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [query, project]);
  return (
    <div className="stack">
      <label>
        Search project records
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Items, vendors, invoices, members, references…"
        />
      </label>
      {rows.map((r) => (
        <Link
          key={r.section + r.id}
          onClick={close}
          href={`/app/projects/${r.project_id}${r.section ? "/" + r.section + "/" + r.id : ""}`}
        >
          <strong>{r.label}</strong>
          <span className="muted"> · {r.section || "Project"}</span>
        </Link>
      ))}
      {query.length > 1 && !rows.length && (
        <p className="muted">No matching accessible records.</p>
      )}
    </div>
  );
}
