import { humanLabel } from "./page-copy";
import Link from "next/link";
import {
  ArrowUpRight,
  Check,
  ChevronRight,
  CircleHelp,
  FileText,
  Plus,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import { formatMoney } from "@/lib/money";

export const motionPresets = {
  fadeUp: "motion-fade-up",
  fadeIn: "motion-fade-in",
  scaleIn: "motion-scale-in",
  slideFromRight: "motion-slide-right",
  staggerChildren: "motion-stagger",
  numberChange: "motion-number-change",
};
export function BrandMark() {
  return (
    <span className="brand-mark" aria-hidden="true">
      <i />
      <i />
      <i />
    </span>
  );
}
export function DotGrid() {
  return <span className="dot-grid" aria-hidden="true" />;
}
export function NoiseTexture() {
  return (
    <svg className="noise-texture" aria-hidden="true">
      <filter id="ambient-noise">
        <feTurbulence
          type="fractalNoise"
          baseFrequency=".8"
          numOctaves="3"
          stitchTiles="stitch"
        />
      </filter>
      <rect width="100%" height="100%" filter="url(#ambient-noise)" />
    </svg>
  );
}
export function FlowLines() {
  return (
    <svg
      className="flow-lines"
      viewBox="0 0 600 280"
      fill="none"
      aria-hidden="true"
    >
      <path d="M0 240C160 240 150 40 310 40S460 200 600 160" />
      <path d="M0 270C180 270 130 80 320 80S470 240 600 190" />
      <circle cx="310" cy="40" r="5" />
      <circle cx="485" cy="180" r="4" />
    </svg>
  );
}
export function AmbientBackground() {
  return (
    <div className="ambient" aria-hidden="true">
      <DotGrid />
      <span className="ambient-blob" />
      <span className="ambient-orbit" />
      <FlowLines />
    </div>
  );
}
export function PageHeader({
  context,
  title,
  description,
  action,
}: {
  context?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <header className="page-header motion-fade-up">
      <div>
        <div className="eyebrow">{context || "Your workspace"}</div>
        <h1>{title}</h1>
        {description && <p className="muted">{description}</p>}
      </div>
      {action && <div className="header-action">{action}</div>}
    </header>
  );
}
export function MoneyAmount({
  value,
  currency = "INR",
  className = "",
}: {
  value: string | bigint;
  currency?: string;
  className?: string;
}) {
  return (
    <span className={`money ${className}`}>{formatMoney(value, currency)}</span>
  );
}
export function AnimatedNumber({
  value,
  currency = "INR",
}: {
  value: string;
  currency?: string;
}) {
  return (
    <span className={motionPresets.numberChange} key={value}>
      {formatMoney(value, currency)}
    </span>
  );
}
export function FinanceTooltip({ text }: { text: string }) {
  return (
    <span className="finance-tooltip">
      <button type="button" className="icon-button" aria-label={text}>
        <CircleHelp size={15} />
      </button>
      <span role="tooltip">{text}</span>
    </span>
  );
}
export function HeroBalance({
  value,
  currency,
  title = "Available to spend",
  children,
}: {
  value: string;
  currency: string;
  title?: string;
  children?: React.ReactNode;
}) {
  return (
    <section className="hero-balance motion-fade-up">
      <AmbientBackground />
      <div className="hero-content">
        <div className="row">
          <span className="eyebrow">{title}</span>
          <FinanceTooltip text="Project cash after unpaid bills, money owed to the team and approved spending requests are set aside." />
        </div>
        <div className="hero-number">
          <AnimatedNumber value={value} currency={currency} />
        </div>
        {children}
      </div>
      <div className="hero-emblem" aria-hidden="true">
        <span />
        <span />
        <span />
        <BrandMark />
      </div>
    </section>
  );
}
export function Metric({
  label,
  value,
  currency,
  href,
}: {
  label: string;
  value: string;
  currency: string;
  href?: string;
}) {
  const content = (
    <>
      <span className="muted">{label}</span>
      <MoneyAmount value={value} currency={currency} className="metric-value" />
    </>
  );
  return href ? (
    <Link className="metric-cell" href={href}>
      {content}
      <ChevronRight size={14} />
    </Link>
  ) : (
    <div className="metric-cell">{content}</div>
  );
}
export function QuickAction({
  href,
  label,
  icon: Icon = Plus,
  primary = false,
}: {
  href: string;
  label: string;
  icon?: LucideIcon;
  primary?: boolean;
}) {
  return (
    <Link href={href} className={`button ${primary ? "primary" : ""}`}>
      <Icon size={16} />
      {label}
    </Link>
  );
}
export function Section({
  title,
  description,
  action,
  children,
  className = "",
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={`section-block ${className}`}>
      <div className="section-heading">
        <div>
          <h2>{title}</h2>
          {description && <p className="muted">{description}</p>}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}
export function AttentionItem({
  href,
  title,
  detail,
  icon: Icon = CircleHelp,
}: {
  href: string;
  title: string;
  detail?: string;
  icon?: LucideIcon;
}) {
  return (
    <Link className="attention-item" href={href}>
      <span className="attention-icon">
        <Icon size={17} />
      </span>
      <span>
        <strong>{title}</strong>
        {detail && <small>{detail}</small>}
      </span>
      <ChevronRight size={16} />
    </Link>
  );
}
export function PersonChip({
  name,
  detail,
}: {
  name: string;
  detail?: string;
}) {
  return (
    <span className="person-chip">
      <span className="avatar">
        {name
          .split(" ")
          .map((n) => n[0])
          .slice(0, 2)
          .join("")}
      </span>
      <span>
        <strong>{name}</strong>
        {detail && <small>{detail}</small>}
      </span>
    </span>
  );
}
export { humanLabel } from "./page-copy";
export function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`badge status-${status.toLowerCase()}`}>
      {humanLabel(status)}
    </span>
  );
}
export function EmptyState({
  title,
  description,
  href,
  action,
}: {
  title: string;
  description: string;
  href?: string;
  action?: string;
}) {
  return (
    <div className="empty-state">
      <div className="empty-illustration" aria-hidden="true">
        <span />
        <FileText size={30} />
        <i />
      </div>
      <h3>{title}</h3>
      <p className="muted">{description}</p>
      {href && (
        <QuickAction href={href} label={action || "Get started"} primary />
      )}
    </div>
  );
}
export function BudgetBar({
  name,
  actual,
  planned,
  currency,
}: {
  name: string;
  actual: string;
  planned: string;
  currency: string;
}) {
  const denominator = BigInt(planned);
  const percent = denominator
    ? Number((BigInt(actual) * 100n) / denominator)
    : 0;
  return (
    <div className="budget-bar">
      <div className="row between">
        <strong>{name}</strong>
        <span className="muted">{percent}% used</span>
      </div>
      <div className="budget-track">
        <span
          style={{ width: `${Math.max(0, Math.min(100, percent))}%` }}
          className={percent >= 100 ? "over-budget" : ""}
        />
      </div>
      <small className="muted">
        <MoneyAmount value={actual} currency={currency} /> of{" "}
        <MoneyAmount value={planned} currency={currency} />
      </small>
    </div>
  );
}
export function SuccessMessage({ children }: { children: React.ReactNode }) {
  return (
    <div className="success" role="status">
      <Check size={18} />
      {children}
    </div>
  );
}
export function TextLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link className="text-link" href={href}>
      {children}
      <ArrowUpRight size={14} />
    </Link>
  );
}
export function Onboarding({ base }: { base: string }) {
  return (
    <section className="onboarding panel">
      <span className="attention-icon">
        <Sparkles size={20} />
      </span>
      <div>
        <h2>A great project starts here</h2>
        <p className="muted">
          Your project is ready. Add funds, invite your team, then record your
          first purchase.
        </p>
        <ol>
          <li className="done">
            <Check size={14} />
            Project created
          </li>
          <li>
            <Link href={`${base}/transactions/new`}>Add starting funds</Link>
          </li>
          <li>
            <Link href={`${base}/people`}>Invite your team</Link>
          </li>
          <li>
            <Link href={`${base}/purchases/new`}>Add a purchase</Link>
          </li>
        </ol>
      </div>
    </section>
  );
}
