import { supabaseServer } from "@/lib/supabase/server";
import { ApprovalInbox } from "@/components/approval-inbox";
import { Notifications } from "@/components/notifications";
import { PageHeader } from "@/components/design-system";
export default async function Inbox() {
  const c = await supabaseServer();
  const { data: identity } = await c.auth.getClaims();
  const { data: memberships } = await c
    .from("project_members")
    .select("project_id,role")
    .eq("user_id", identity?.claims?.sub)
    .eq("is_active", true);
  await Promise.all(
    (memberships || []).map((m) =>
      c.rpc("refresh_reminders", { p_project: m.project_id }),
    ),
  );
  const { data: notifications } = await c
    .from("notifications")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(50);
  const { data: steps } = await c
    .from("approval_steps")
    .select("*")
    .eq("status", "pending")
    .order("step_order");
  const { data: instances } = await c
    .from("approval_instances")
    .select("*")
    .eq("status", "pending");
  const { data: projects } = await c.from("projects").select("id,name");
  return (
    <div className="stack">
      <PageHeader
        context="Your workspace"
        title="Your inbox"
        description="Decisions to make. Things to know. All in one place."
      />
      <ApprovalInbox
        steps={(steps || []).filter(
          (s) =>
            (s.approver_user_id === identity?.claims?.sub ||
              memberships?.some(
                (m) =>
                  m.project_id === s.project_id && m.role === s.approver_role,
              )) &&
            !(steps || []).some(
              (t) =>
                t.approval_instance_id === s.approval_instance_id &&
                t.step_order < s.step_order,
            ),
        )}
        instances={instances || []}
        projects={projects || []}
      />
      <Notifications rows={notifications || []} />
    </div>
  );
}
