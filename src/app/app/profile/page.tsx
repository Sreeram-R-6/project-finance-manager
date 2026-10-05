import { supabaseServer } from "@/lib/supabase/server";
import { ProfileForm } from "@/components/profile-form";
import { PageHeader, PersonChip } from "@/components/design-system";
export default async function Profile() {
  const c = await supabaseServer();
  const { data } = await c.auth.getClaims();
  const { data: p } = await c
    .from("profiles")
    .select("*")
    .eq("id", data?.claims?.sub)
    .single();
  return (
    <div className="stack" style={{ maxWidth: 700 }}>
      <PageHeader
        context="Your workspace"
        title="Make yourself at home."
        description="Your name and preferences across all your projects."
      />
      <PersonChip name={p?.full_name || "Your profile"} detail={p?.email} />
      <ProfileForm profile={p} />
    </div>
  );
}
