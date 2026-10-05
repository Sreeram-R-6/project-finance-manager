"use client";
import { supabaseBrowser } from "@/lib/supabase/browser";
import { useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
export function LoginForm({
  demo,
  oauthError,
}: {
  demo: boolean;
  oauthError?: boolean;
}) {
  const ready = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const router = useRouter();
  async function password(form: FormData) {
    setBusy(true);
    setError("");
    const { error } = await supabaseBrowser().auth.signInWithPassword({
      email: String(form.get("email")),
      password: String(form.get("password")),
    });
    if (error) {
      setError("Sign-in failed. Check your email and password.");
      setBusy(false);
    } else {
      router.push("/app");
      router.refresh();
    }
  }
  return (
    <>
      <a className="button primary" href="/auth/google">
        <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
          <path
            fill="currentColor"
            d="M21.6 12.23c0-.71-.06-1.39-.18-2.05H12v3.88h5.38a4.6 4.6 0 0 1-2 3.02v2.51h3.24c1.9-1.75 2.98-4.33 2.98-7.36M12 22c2.7 0 4.96-.9 6.62-2.41l-3.24-2.51c-.9.6-2.06.97-3.38.97-2.61 0-4.83-1.76-5.62-4.13H3.04v2.59A10 10 0 0 0 12 22M6.38 13.92a6 6 0 0 1 0-3.84V7.49H3.04a10 10 0 0 0 0 9.02M12 5.95c1.47 0 2.78.5 3.82 1.5l2.86-2.86A9.58 9.58 0 0 0 12 2a10 10 0 0 0-8.96 5.49l3.34 2.59C7.17 7.71 9.39 5.95 12 5.95"
          />
        </svg>
        Continue with Google
      </a>
      {demo && (
        <form action={password}>
          <p className="muted" style={{ fontSize: 11 }}>
            Explore the local demo
          </p>
          <label>
            Email
            <input
              name="email"
              type="email"
              defaultValue="alex@example.test"
              required
              autoComplete="username"
            />
          </label>
          <label>
            Password
            <input
              name="password"
              type="password"
              defaultValue="LocalDemo-Only-2026!"
              required
              autoComplete="current-password"
            />
          </label>
          <button disabled={busy || !ready}>Sign in locally</button>
        </form>
      )}
      {error && (
        <p role="alert" className="error">
          {error}
        </p>
      )}
      {oauthError && !error && (
        <p role="alert" className="error">
          Google sign-in could not finish. Close any older Google sign-in tab and
          start again from this page.
        </p>
      )}
    </>
  );
}
