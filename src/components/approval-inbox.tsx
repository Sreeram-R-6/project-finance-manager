"use client";
import { EmptyState, humanLabel } from "./design-system";
import type { Row } from "@/lib/domain";
import { operation } from "./entry-form";
import { useRouter } from "next/navigation";
import { useState } from "react";
export function ApprovalInbox({
  steps,
  instances,
  projects,
}: {
  steps: Row[];
  instances: Row[];
  projects: { id: string; name: string }[];
}) {
  const router = useRouter();
  const [project, setProject] = useState("");
  const [type, setType] = useState("");
  const [error, setError] = useState("");
  return (
    <div className="stack">
      <div className="formgrid">
        <label>
          Project
          <select value={project} onChange={(e) => setProject(e.target.value)}>
            <option value="">All projects</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Approval type
          <select value={type} onChange={(e) => setType(e.target.value)}>
            <option value="">All types</option>
            {[...new Set(instances.map((i) => String(i.entity_type)))].map(
              (t) => (
                <option key={t} value={t}>
                  {humanLabel(t)}
                </option>
              ),
            )}
          </select>
        </label>
      </div>
      {steps
        .filter(
          (s) =>
            (!project || s.project_id === project) &&
            (!type ||
              instances.some(
                (i) =>
                  i.id === s.approval_instance_id && i.entity_type === type,
              )),
        )
        .map((s) => {
          const i = instances.find((i) => i.id === s.approval_instance_id);
          if (!i) return null;
          return (
            <section className="panel stack" key={String(s.id)}>
              <h2>
                {humanLabel(String(i.entity_type))} · step{" "}
                {String(s.step_order)}
              </h2>
              <p>{projects.find((p) => p.id === s.project_id)?.name}</p>
              <p className="muted">
                Assigned to{" "}
                {s.approver_role ? humanLabel(String(s.approver_role)) : "you"}
              </p>
              <div className="row">
                {["approved", "rejected", "needs_info"].map((decision) => (
                  <button
                    key={decision}
                    onClick={async () => {
                      const comment =
                        prompt("Decision comment (optional)") || "";
                      try {
                        await operation(String(s.project_id), "decide", {
                          id: s.id,
                          decision,
                          comment,
                        });
                        router.refresh();
                      } catch (e) {
                        setError(
                          e instanceof Error ? e.message : "Decision failed.",
                        );
                      }
                    }}
                  >
                    {decision === "approved"
                      ? "Approve"
                      : decision === "rejected"
                        ? "Decline"
                        : "Ask for details"}
                  </button>
                ))}
              </div>
            </section>
          );
        })}
      {!steps.length && (
        <EmptyState
          title="Nothing waiting on you"
          description="New requests that need your approval will appear here."
        />
      )}
      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
