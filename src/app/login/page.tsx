import { LoginForm } from "@/components/login-form";
import {
  AmbientBackground,
  BrandMark,
  PersonChip,
} from "@/components/design-system";
import { ArrowDownLeft, Check, ShieldCheck } from "lucide-react";
import Link from "next/link";
export default async function Login({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const query = await searchParams;
  return (
    <main className="login-layout">
      <section className="login-left">
        <Link className="brand" href="/">
          <BrandMark />
          <span>
            Project Finance<small>A little more clarity.</small>
          </span>
        </Link>
        <div className="login-copy">
          <div className="eyebrow">A workspace for what’s next</div>
          <h1>
            Big ideas.
            <br />
            Clearer money.
          </h1>
          <p>
            Bring your project, your people and every expense into one calm
            workspace.
          </p>
        </div>
        <LoginForm
          oauthError={Boolean(query.error)}
          demo={
            process.env.LOCAL_DEMO_AUTH === "true" &&
            process.env.NODE_ENV !== "production"
          }
        />
        <p className="login-footer">
          <ShieldCheck
            size={13}
            style={{
              display: "inline",
              verticalAlign: "middle",
              marginRight: 6,
            }}
          />
          Your project data stays with your team.
        </p>
      </section>
      <section
        className="login-scene"
        aria-label="Illustration of an example project workspace"
      >
        <AmbientBackground />
        <div className="scene-orbit" aria-hidden="true" />
        <div className="scene-card">
          <div className="row">
            <span className="project-monogram">AU</span>
            <div>
              <strong>Project Aurora</strong>
              <small
                className="muted"
                style={{ display: "block", fontSize: 10 }}
              >
                An example workspace
              </small>
            </div>
          </div>
          <div className="eyebrow" style={{ marginTop: 28 }}>
            Available to spend
          </div>
          <div className="metric">
            ₹83,800<span style={{ fontSize: 20 }}>.00</span>
          </div>
          <div className="budget-track">
            <span style={{ width: "56%" }} />
          </div>
          <p className="muted" style={{ fontSize: 11, marginTop: 12 }}>
            A clear path from funding to your next idea.
          </p>
        </div>
        <div className="scene-mini top">
          <span className="attention-icon">
            <ArrowDownLeft size={17} />
          </span>
          <span>
            <strong>Funding received</strong>
            <small>Ready to move your project forward</small>
          </span>
        </div>
        <div className="scene-mini bottom">
          <PersonChip name="Rahul Nair" detail="Personal purchase reimbursed" />
          <Check size={17} style={{ color: "var(--positive)" }} />
        </div>
        <div className="scene-caption">
          Built around projects. Designed around people.
        </div>
      </section>
    </main>
  );
}
