import { InviteAccept } from "@/components/invite-accept";
import { BrandMark } from "@/components/design-system";
export default async function Invite({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  return (
    <main className="auth panel stack">
      <BrandMark />
      <h1>Join a project</h1>
      <p>Sign in using the email address this invitation was sent to.</p>
      <InviteAccept token={token} />
    </main>
  );
}
