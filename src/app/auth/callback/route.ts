import { supabaseServer } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const next = url.searchParams.get("next") || "/app";
  const safe =
    next.startsWith("/") && !next.startsWith("//") && !next.includes("\\")
      ? next
      : "/app";
  if (code) {
    const client = await supabaseServer();
    const { error } = await client.auth.exchangeCodeForSession(code);
    if (!error)
      return NextResponse.redirect(
        new URL(safe, process.env.NEXT_PUBLIC_APP_URL || url.origin),
      );
  }
  return NextResponse.redirect(
    new URL(
      process.env.NODE_ENV === "development"
        ? "/auth/refresh"
        : "/login?error=callback",
      url.origin,
    ),
  );
}
