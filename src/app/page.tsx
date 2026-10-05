import Link from "next/link";
import { BrandMark, AmbientBackground } from "@/components/design-system";
export default function Home() {
  return (
    <main className="landing stack">
      <Link href="/" className="brand">
        <BrandMark />
        <span>
          Project Finance<small>A little more clarity.</small>
        </span>
      </Link>
      <h1>
        Bring your ideas.
        <br />
        We’ll bring the clarity.
      </h1>
      <p className="muted" style={{ fontSize: 18, lineHeight: 1.7 }}>
        One thoughtful workspace for your team’s money, purchases and next big
        project.
      </p>
      <div className="row">
        <Link className="button primary" href="/login">
          Open your workspace
        </Link>
        <Link className="button" href="/offline">
          Start an offline draft
        </Link>
      </div>
      <section className="hero-balance">
        <AmbientBackground />
        <div className="hero-content">
          <h2>Less paperwork. More possibility.</h2>
          <p>
            See what you can spend, take care of the people who paid personally,
            and keep every receipt where it belongs.
          </p>
        </div>
      </section>
    </main>
  );
}
