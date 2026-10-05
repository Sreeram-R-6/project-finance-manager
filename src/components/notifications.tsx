"use client";
import type { Row } from "@/lib/domain";
import { supabaseBrowser } from "@/lib/supabase/browser";
import { useRouter } from "next/navigation";
export function Notifications({ rows }: { rows: Row[] }) {
  const router = useRouter();
  return (
    <section className="panel stack">
      <h2>Notifications</h2>
      {rows.map((r) => (
        <div className="row between" key={String(r.id)}>
          <div>
            <strong>{String(r.title)}</strong>
            <p className="muted">
              {String(r.body || "Review the linked project record.")}
            </p>
          </div>
          {!r.read_at && (
            <button
              onClick={async () => {
                await supabaseBrowser()
                  .from("notifications")
                  .update({ read_at: new Date().toISOString() })
                  .eq("id", r.id);
                router.refresh();
              }}
            >
              Mark read
            </button>
          )}
        </div>
      ))}
      {!rows.length && <p className="muted">No notifications.</p>}
    </section>
  );
}
