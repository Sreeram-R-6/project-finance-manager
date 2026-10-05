"use client";
import { AmbientBackground, BrandMark } from "@/components/design-system";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <main className="auth panel stack">
      <BrandMark />
      <AmbientBackground />
      <h1>Unable to load this page</h1>
      <p>Check your connection and try again.</p>
      <button className="primary" onClick={reset}>
        Try again
      </button>
    </main>
  );
}
