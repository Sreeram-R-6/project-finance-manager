import Link from "next/link";
import { EmptyState, BrandMark } from "@/components/design-system";
export default function NotFound() {
  return (
    <main className="auth panel stack">
      <BrandMark />
      <h1>This page is out of reach</h1>
      <EmptyState
        title="Let’s get you back on track"
        description="This page is unavailable, or your account doesn’t have access."
      />
      <Link className="button" href="/app">
        Return to workspace
      </Link>
    </main>
  );
}
