"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import {
  Home,
  Wallet,
  Plus,
  Users,
  Menu,
  Search,
  Sun,
  LogOut,
  ChevronDown,
  PanelLeftClose,
  PanelLeftOpen,
  Inbox,
  Folder,
  ShoppingBag,
  Receipt,
  FileText,
  ChartNoAxesCombined,
  Settings,
  Clock,
  Building2,
  Package,
  Target,
  ClipboardList,
  ArrowUpRight,
  ArrowLeftRight,
  X,
  UserRound,
  HandCoins,
} from "lucide-react";
import * as Dialog from "@radix-ui/react-dialog";
import { supabaseBrowser } from "@/lib/supabase/browser";
import { clearDrafts } from "@/lib/offline";
import { GlobalSearch } from "./global-search";
import { formatMoney } from "@/lib/money";
import { BrandMark } from "./design-system";
export const sections = [
  "transactions",
  "purchases",
  "bills",
  "reimbursements",
  "advances",
  "requests",
  "people",
  "budgets",
  "vendors",
  "assets",
  "documents",
  "reports",
  "activity",
  "settings",
];
const navigation = [
  { slug: "", label: "Overview", icon: Home },
  { slug: "purchases", label: "Purchases", icon: ShoppingBag },
  { slug: "bills", label: "Bills", icon: Receipt },
  { slug: "people", label: "People", icon: Users },
  { slug: "documents", label: "Documents", icon: FileText },
  { slug: "reports", label: "Reports", icon: ChartNoAxesCombined },
];
const money = [
  { slug: "transactions", label: "Transactions", icon: ArrowLeftRight },
  { slug: "reimbursements", label: "Reimbursements", icon: HandCoins },
  { slug: "advances", label: "Advances", icon: Wallet },
];
const more = [
  { slug: "requests", label: "Requests", icon: ClipboardList },
  { slug: "budgets", label: "Budgets", icon: Target },
  { slug: "vendors", label: "Vendors", icon: Building2 },
  { slug: "assets", label: "Assets", icon: Package },
  { slug: "activity", label: "Activity", icon: Clock },
  { slug: "settings", label: "Settings", icon: Settings },
];
type Project = { id: string; name: string; currency: string; code?: string };
export function Shell({
  projects,
  children,
}: {
  projects: Project[];
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const project = pathname.match(/\/projects\/([^/]+)/)?.[1];
  const selected = projects.find((p) => p.id === project);
  const [command, setCommand] = useState(false);
  const [add, setAdd] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [balances, setBalances] = useState<Record<string, string>>({});
  const { theme, setTheme } = useTheme();
  useEffect(() => {
    localStorage.setItem("pfm-projects", JSON.stringify(projects));
    supabaseBrowser()
      .auth.getClaims()
      .then(({ data }) => {
        if (data?.claims?.sub)
          localStorage.setItem("pfm-user", String(data.claims.sub));
      });
    const key = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setCommand((v) => !v);
      }
    };
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, [projects]);
  const base = selected ? `/app/projects/${project}` : "/app";
  const current = pathname.slice(base.length + 1).split("/")[0];
  async function signOut() {
    await clearDrafts();
    localStorage.removeItem("pfm-user");
    localStorage.removeItem("pfm-projects");
    await supabaseBrowser().auth.signOut();
    router.push("/login");
    router.refresh();
  }
  const nav = (items: typeof navigation) =>
    items.map(({ slug, label, icon: Icon }) => (
      <Link
        className="nav-link"
        title={label}
        aria-current={
          pathname === (slug ? `${base}/${slug}` : base) ||
          (!!slug && pathname.startsWith(`${base}/${slug}/`))
            ? "page"
            : undefined
        }
        key={slug}
        href={slug ? `${base}/${slug}` : base}
      >
        <Icon size={17} />
        <span className="nav-text">{label}</span>
      </Link>
    ));
  async function loadBalances() {
    const entries = await Promise.all(
      projects.map(async (p) => {
        const { data } = await supabaseBrowser().rpc("project_summary", {
          p_project: p.id,
        });
        return [p.id, data?.available] as const;
      }),
    );
    setBalances(
      Object.fromEntries(
        entries.filter(
          (e): e is readonly [string, string] => typeof e[1] === "string",
        ),
      ),
    );
  }
  const closeButton = (
    <Dialog.Close asChild>
      <button className="icon-button dialog-close" aria-label="Close">
        <X size={18} />
      </button>
    </Dialog.Close>
  );
  return (
    <div className={collapsed ? "shell-collapsed" : ""}>
      <a href="#workspace-content" className="skip-link">
        Skip to content
      </a>
      <aside className="sidebar">
        <Link href="/app" className="brand">
          <BrandMark />
          <span>
            Project Finance<small>A little more clarity.</small>
          </span>
        </Link>
        <nav aria-label="Workspace navigation">
          <Link
            className="nav-link"
            href="/app"
            aria-current={pathname === "/app" ? "page" : undefined}
          >
            <Folder size={17} />
            <span className="nav-text">Your projects</span>
          </Link>
          <Link
            className="nav-link"
            href="/app/inbox"
            aria-current={pathname === "/app/inbox" ? "page" : undefined}
          >
            <Inbox size={17} />
            <span className="nav-text">Inbox</span>
          </Link>
          {selected && (
            <>
              <p className="nav-label">Project workspace</p>
              {nav(navigation.slice(0, 1))}
              <details
                className={`nav-disclosure ${money.some((m) => m.slug === current) ? "active" : ""}`}
                open={money.some((m) => m.slug === current)}
              >
                <summary title="Money">
                  <Wallet size={17} />
                  <span className="nav-text">Money</span>
                  <ChevronDown />
                </summary>
                <div>{nav(money)}</div>
              </details>
              {nav(navigation.slice(1))}
              <details
                className={`nav-disclosure ${more.some((m) => m.slug === current) ? "active" : ""}`}
                open={more.some((m) => m.slug === current)}
              >
                <summary title="More">
                  <Menu size={17} />
                  <span className="nav-text">More</span>
                  <ChevronDown />
                </summary>
                <div>{nav(more)}</div>
              </details>
            </>
          )}
        </nav>
        <div className="sidebar-bottom">
          <Link className="nav-link" href="/app/profile" title="Your profile">
            <UserRound size={17} />
            <span className="nav-text">Your profile</span>
          </Link>
          <button
            className="sidebar-collapse"
            onClick={() => setCollapsed(!collapsed)}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? (
              <PanelLeftOpen size={16} />
            ) : (
              <PanelLeftClose size={16} />
            )}
          </button>
        </div>
      </aside>
      <div className="workspace">
        <header className="topbar">
          <details
            className="project-switcher"
            onToggle={(e) => {
              if (e.currentTarget.open) void loadBalances();
            }}
          >
            <summary aria-label="Switch project">
              <span className="project-monogram">
                {selected
                  ? selected.name
                      .replace(/^Project /, "")
                      .slice(0, 2)
                      .toUpperCase()
                  : "PF"}
              </span>
              <span>
                {selected?.name || "Your workspace"}
                <small>{selected?.code || "All your projects, together"}</small>
              </span>
              <ChevronDown size={14} />
            </summary>
            <div className="switcher-menu">
              <Link
                href="/app"
                onClick={(e) =>
                  e.currentTarget.closest("details")?.removeAttribute("open")
                }
              >
                <Folder size={17} />
                <span>All projects</span>
              </Link>
              {projects.map((p) => (
                <Link
                  key={p.id}
                  href={`/app/projects/${p.id}`}
                  onClick={(e) =>
                    e.currentTarget.closest("details")?.removeAttribute("open")
                  }
                >
                  <span className="project-monogram">
                    {p.name
                      .replace(/^Project /, "")
                      .slice(0, 2)
                      .toUpperCase()}
                  </span>
                  <span>
                    {p.name}
                    <small>{p.code || p.currency}</small>
                  </span>
                  {balances[p.id] && (
                    <span className="switcher-balance">
                      {formatMoney(balances[p.id], p.currency)}
                      <small>Available</small>
                    </span>
                  )}
                </Link>
              ))}
              <Link href="/app/projects/new">
                <Plus size={16} />
                Create project
              </Link>
            </div>
          </details>
          <div className="topbar-actions">
            <button className="search-button" onClick={() => setCommand(true)}>
              <Search size={16} />
              Search<kbd>Ctrl K</kbd>
            </button>
            <button className="primary" onClick={() => setAdd(true)}>
              <Plus size={16} />
              Add
            </button>
            <Link
              className="icon-button"
              href="/app/inbox"
              aria-label="Open inbox"
            >
              <Inbox size={17} />
            </Link>
            <button
              className="icon-button"
              aria-label="Toggle theme"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            >
              <Sun size={17} />
            </button>
            <button
              className="icon-button sign-out"
              aria-label="Sign out"
              onClick={signOut}
            >
              <LogOut size={17} />
            </button>
          </div>
        </header>
        <main className="content" id="workspace-content">
          <div key={pathname} className="motion-fade-in">
            {children}
          </div>
        </main>
      </div>
      <nav className="bottomnav" aria-label="Mobile navigation">
        <Link href={base} aria-current={pathname === base ? "page" : undefined}>
          <Home size={19} />
          Home
        </Link>
        <Link
          href={selected ? `${base}/transactions` : "/app/projects"}
          aria-current={current === "transactions" ? "page" : undefined}
        >
          <Wallet size={19} />
          Money
        </Link>
        <button className="mobile-add" onClick={() => setAdd(true)}>
          <Plus size={21} />
          Add
        </button>
        <Link href={selected ? `${base}/people` : "/app/projects"}>
          <Users size={19} />
          People
        </Link>
        <button onClick={() => setMobileMenu(true)}>
          <Menu size={19} />
          More
        </button>
      </nav>
      <Dialog.Root open={mobileMenu} onOpenChange={setMobileMenu}>
        <Dialog.Portal>
          <Dialog.Overlay className="dialog-overlay" />
          <Dialog.Content className="dialog-content">
            <Dialog.Title className="dialog-title">Your workspace</Dialog.Title>
            <Dialog.Description className="dialog-description">
              Everything you need, one place away.
            </Dialog.Description>
            {closeButton}
            <button
              onClick={() => {
                setMobileMenu(false);
                setCommand(true);
              }}
            >
              <Search size={16} />
              Search
            </button>
            <div className="dialog-nav">
              {[...navigation, ...money, ...more].map((n) => (
                <Link
                  key={n.slug}
                  href={
                    selected ? (n.slug ? `${base}/${n.slug}` : base) : "/app"
                  }
                  onClick={() => setMobileMenu(false)}
                >
                  {n.label}
                </Link>
              ))}
              <Link href="/app/inbox" onClick={() => setMobileMenu(false)}>
                Inbox
              </Link>
              <Link href="/app/profile" onClick={() => setMobileMenu(false)}>
                Your profile
              </Link>
            </div>
            <button onClick={signOut}>
              <LogOut size={16} />
              Sign out
            </button>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
      <Dialog.Root open={command} onOpenChange={setCommand}>
        <Dialog.Portal>
          <Dialog.Overlay className="dialog-overlay" />
          <Dialog.Content className="dialog-content">
            <Dialog.Title className="dialog-title">
              Find your next step
            </Dialog.Title>
            <Dialog.Description className="dialog-description">
              Search, switch projects or jump to a page.
            </Dialog.Description>
            {closeButton}
            <GlobalSearch
              project={selected?.id}
              close={() => setCommand(false)}
            />
            <div className="dialog-nav">
              {projects.map((p) => (
                <Link
                  onClick={() => setCommand(false)}
                  key={p.id}
                  href={`/app/projects/${p.id}`}
                >
                  {p.name}
                </Link>
              ))}
              {selected &&
                [...navigation, ...money, ...more].map((n) => (
                  <Link
                    onClick={() => setCommand(false)}
                    key={n.slug}
                    href={n.slug ? `${base}/${n.slug}` : base}
                  >
                    {n.label}
                  </Link>
                ))}
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
      <Dialog.Root open={add} onOpenChange={setAdd}>
        <Dialog.Portal>
          <Dialog.Overlay className="dialog-overlay" />
          <Dialog.Content className="dialog-content">
            <Dialog.Title className="dialog-title">
              A new step for {selected?.name || "your project"}
            </Dialog.Title>
            <Dialog.Description className="dialog-description">
              What would you like to do?
            </Dialog.Description>
            {closeButton}
            <div className="quick-action-grid">
              {[
                { label: "Purchase", slug: "purchases/new", icon: ShoppingBag },
                {
                  label: "Add funding",
                  slug: "transactions/new",
                  icon: ArrowUpRight,
                },
                { label: "Reimburse", slug: "reimbursements", icon: HandCoins },
                { label: "Pay a bill", slug: "bills", icon: Receipt },
              ].map(({ label, slug, icon: Icon }) => (
                <Link
                  className="button"
                  onClick={() => setAdd(false)}
                  key={label}
                  href={selected ? `${base}/${slug}` : "/app/projects"}
                >
                  <Icon size={19} />
                  {label}
                </Link>
              ))}
            </div>
            <details style={{ marginTop: 20 }}>
              <summary>More actions</summary>
              <div className="dialog-nav">
                {[
                  ["Personal expense", "purchases/new?source=MEMBER"],
                  ["New bill", "bills/new"],
                  ["Transfer", "transactions/new?type=TRANSFER"],
                  ["Refund", "purchases"],
                  ["Advance", "advances/new"],
                  ["Purchase request", "requests/new"],
                ].map(([label, slug]) => (
                  <Link
                    onClick={() => setAdd(false)}
                    key={label}
                    href={selected ? `${base}/${slug}` : "/app/projects"}
                  >
                    {label}
                  </Link>
                ))}
              </div>
            </details>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}
