import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";
import { Shell } from "@/components/shell";
export const dynamic = "force-dynamic";
export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY &&
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )
    return (
      <main className="auth panel">
        <h1>Connect Supabase</h1>
        <p>
          Add the Supabase URL and publishable key to .env.local. See the
          application README for setup instructions.
        </p>
      </main>
    );
  const client = await supabaseServer();
  const { data } = await client.auth.getClaims();
  if (!data?.claims) redirect("/login");
  const { data: projects } = await client
    .from("projects")
    .select("id,name,currency,code")
    .order("name");
  return <Shell projects={projects || []}>{children}</Shell>;
}
