"use client";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase/browser";
export function InviteAccept({ token }: { token: string }) {
  const [error, setError] = useState("");
  const router = useRouter();
  return (
    <>
      <Link className="button" href="/login">
        Sign in
      </Link>
      <button
        className="primary"
        onClick={async () => {
          const { data, error } = await supabaseBrowser().rpc("accept_invite", {
            p_token: token,
          });
          if (error)
            setError(
              "Invitation is expired, already used, or does not match your verified email.",
            );
          else {
            router.push(`/app/projects/${data}`);
            router.refresh();
          }
        }}
      >
        Accept invitation
      </button>
      {error && (
        <p role="alert" className="error">
          {error}
        </p>
      )}
    </>
  );
}
