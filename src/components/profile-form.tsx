"use client";
import { supabaseBrowser } from "@/lib/supabase/browser";
import type { Row } from "@/lib/domain";
import { useState } from "react";
export function ProfileForm({ profile }: { profile: Row | null }) {
  const [message, setMessage] = useState("");
  return (
    <form
      className="panel"
      action={async (f) => {
        const { error } = await supabaseBrowser()
          .from("profiles")
          .update({
            full_name: f.get("name"),
            locale: f.get("locale"),
            timezone: f.get("timezone"),
          })
          .eq("id", profile?.id);
        setMessage(error ? "Unable to update profile." : "Profile saved.");
      }}
    >
      <label>
        Name
        <input name="name" defaultValue={String(profile?.full_name || "")} />
      </label>
      <label>
        Email
        <input readOnly value={String(profile?.email || "")} />
      </label>
      <label>
        Language / region
        <input
          name="locale"
          defaultValue={String(profile?.locale || "en-IN")}
        />
      </label>
      <label>
        Timezone
        <input
          name="timezone"
          defaultValue={String(profile?.timezone || "Asia/Kolkata")}
        />
      </label>
      <button>Save profile</button>
      {message && <p role="status">{message}</p>}
    </form>
  );
}
