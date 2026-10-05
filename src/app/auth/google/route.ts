import { createServerClient, serializeCookieHeader } from "@supabase/ssr";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const headers = new Headers();
  const client = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "http://127.0.0.1:54321",
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
      "not-configured",
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookies, cacheHeaders) => {
          cookies.forEach(({ name, value, options }) =>
            headers.append(
              "Set-Cookie",
              serializeCookieHeader(name, value, options),
            ),
          );
          Object.entries(cacheHeaders ?? {}).forEach(([name, value]) =>
            headers.set(name, value),
          );
        },
      },
    },
  );

  const appOrigin = process.env.NEXT_PUBLIC_APP_URL || request.nextUrl.origin;
  const { data, error } = await client.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: new URL("/auth/callback", appOrigin).toString() },
  });

  if (error || !data.url) {
    return NextResponse.redirect(new URL("/login?error=provider", appOrigin));
  }

  headers.set("Location", data.url);
  headers.set("Cache-Control", "no-store");
  return new Response(null, { status: 303, headers });
}
