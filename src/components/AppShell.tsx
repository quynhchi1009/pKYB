import { useMemo, useRef, useState, type ReactNode } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  ArrowLeftToLine,
  Bell,
  ChevronDown,
  CircleArrowLeft,
  CodeXml,
  Gem,
  KeyRound,
  List,
  LogOut,
  Menu as MenuIcon,
  Radar,
  Search,
  Settings,
  Store,
  Tag,
  X,
} from "lucide-react";
import { useStore } from "../state/store";
import { CATEGORY_LABEL, SEVERITY_LABEL, SEVERITY_RANK, worstSeverity } from "../data/model";
import { NewTag, SEV_STYLE, Toasts, cx, formatDate } from "./ui";

function Logo() {
  return (
    <span className="text-[18px] font-bold tracking-[-0.01em]">
      <span className="text-chrome-accent">Asia</span>
      <span className="text-white">Verify</span>
    </span>
  );
}

function titleFor(path: string) {
  if (path.startsWith("/search")) return "Search";
  if (path.startsWith("/reports/")) return "View Report";
  if (path.startsWith("/report")) return "Choose report";
  return "Perpetual KYB (pKYB)";
}

function NotificationBell() {
  const { monitors, severity, prefs } = useStore();
  const [open, setOpen] = useState(false);
  const trigger = useRef<HTMLButtonElement>(null);
  const items = useMemo(() => {
    const out: Array<{ id: string; monitorId: string; name: string; date: string; label: string; sev: ReturnType<typeof worstSeverity> }> = [];
    for (const m of monitors) {
      if (m.status !== "active") continue;
      for (const e of m.events) {
        if (e.reviewed) continue;
        const sev = worstSeverity(e.categories, severity);
        if (!prefs.inApp[sev]) continue;
        out.push({ id: e.id, monitorId: m.id, name: m.name, date: e.date, sev, label: e.categories.map((c) => CATEGORY_LABEL[c]).join(", ") });
      }
    }
    return out.sort((a, b) => (a.date === b.date ? SEVERITY_RANK[b.sev] - SEVERITY_RANK[a.sev] : a.date < b.date ? 1 : -1));
  }, [monitors, severity, prefs]);

  const close = () => {
    setOpen(false);
    trigger.current?.focus();
  };

  return (
    <div
      className="relative"
      onKeyDown={(e) => {
        if (e.key === "Escape" && open) {
          e.stopPropagation();
          close();
        }
      }}
    >
      <button
        ref={trigger}
        onClick={() => setOpen((o) => !o)}
        aria-label={`pKYB alerts, ${items.length} unread`}
        aria-expanded={open}
        className="relative grid size-9 place-items-center rounded-[4px] text-chrome-content-main hover:bg-chrome-control-hover hover:text-white"
      >
        <Bell className="size-5" aria-hidden />
        {items.length > 0 && (
          <span aria-hidden className="absolute -top-0.5 -right-1 grid h-[18px] min-w-[18px] place-items-center rounded-full bg-chrome-accent px-1 text-[11px] font-bold text-navy-950 tnum">
            {items.length > 99 ? "99+" : items.length}
          </span>
        )}
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute top-11 right-0 z-50 w-[min(380px,calc(100vw-24px))] overflow-hidden rounded-[6px] border border-border-subtle bg-white text-content-primary shadow-pop">
            <div className="flex items-baseline justify-between border-b border-border-subtle px-4 py-3">
              <p className="text-[14px] font-semibold">
                pKYB alerts{items.length > 0 && <span className="font-normal text-content-main tnum"> · {items.length} unread</span>}
              </p>
              <Link to="/pkyb/settings" onClick={() => setOpen(false)} className="text-[12px] text-content-link hover:underline">
                Severity Settings
              </Link>
            </div>
            <ul className="max-h-[360px] overflow-y-auto">
              {items.length === 0 && <li className="px-4 py-6 text-center text-[13px] text-content-main">No unread alerts at the severities you chose in Severity Settings.</li>}
              {items.slice(0, 8).map((n) => (
                <li key={n.id}>
                  <Link
                    to={`/pkyb/monitoring/${n.monitorId}`}
                    onClick={() => setOpen(false)}
                    className="flex gap-3 border-b border-border-subtle/70 px-4 py-3 hover:bg-base-contrast"
                  >
                    <span className={cx("mt-1.5 size-2 shrink-0 rounded-full", SEV_STYLE[n.sev].dot)} aria-hidden />
                    <span className="min-w-0">
                      <span className="block truncate text-[13px] font-semibold">
                        <span className="sr-only">{SEVERITY_LABEL[n.sev]} severity. </span>
                        {n.name}
                      </span>
                      <span className="block text-[12px] text-content-main">
                        {n.label} changed · {formatDate(n.date)}
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
            {/* The feed opens on the same set the bell counts: unreviewed changes at the severities you get alerts for. */}
            <Link
              to="/pkyb/monitoring?tab=feed&alerts=1"
              onClick={() => setOpen(false)}
              className="block px-4 py-2.5 text-center text-[13px] font-semibold text-interactive-primary hover:bg-interactive-accent"
            >
              {items.length ? `See all ${items.length} unread alerts in the change feed` : "Open the change feed"}
            </Link>
          </div>
        </>
      )}
    </div>
  );
}

type NavItem = { to: string; label: string; icon: typeof Search; tag?: boolean };
const NAV_TOP: NavItem[] = [
  { to: "/search", label: "Search", icon: Search },
  { to: "/reports", label: "View Reports", icon: List },
  { to: "/onboarding", label: "Onboarding Management", icon: Store },
];
const NAV_BOTTOM: NavItem[] = [
  { to: "/plan", label: "My Plan", icon: Gem },
  { to: "/pricing", label: "Products & Pricing", icon: Tag },
  { to: "/api-key", label: "API Key", icon: KeyRound, tag: true },
  { to: "/mcp", label: "MCP", icon: CodeXml, tag: true },
  { to: "/account", label: "Account Settings", icon: Settings },
];

function Sidebar({ collapsed, onCollapse, onNavigate }: { collapsed: boolean; onCollapse: () => void; onNavigate?: () => void }) {
  const navigate = useNavigate();
  const loc = useLocation();
  const inPkyb = loc.pathname.startsWith("/pkyb");
  const [pkybOpen, setPkybOpen] = useState(true);

  const row = (active: boolean) =>
    cx(
      "group relative flex h-10 items-center gap-3 rounded-[4px] px-3 text-[14px] transition-colors",
      active ? "bg-chrome-selected text-white" : "text-chrome-content-tertiary hover:bg-chrome-hover hover:text-white",
      collapsed && "justify-center px-0",
    );

  const item = (n: NavItem) => (
    <NavLink key={n.to} to={n.to} onClick={onNavigate} className={({ isActive }) => row(isActive)} title={collapsed ? n.label : undefined}>
      <n.icon className="size-[18px] shrink-0" strokeWidth={1.75} />
      {!collapsed && <span className="truncate">{n.label}</span>}
      {!collapsed && n.tag && <NewTag dark />}
    </NavLink>
  );

  return (
    <nav aria-label="Portal" className="nav-scroll flex h-full flex-col overflow-y-auto px-3 py-4">
      <div className="flex flex-col gap-0.5">
        <button className={row(false)} onClick={() => navigate(-1)} title={collapsed ? "Previous Page" : undefined}>
          <CircleArrowLeft className="size-[18px] shrink-0" strokeWidth={1.75} />
          {!collapsed && "Previous Page"}
        </button>
        <button className={cx(row(false), "max-lg:hidden")} onClick={onCollapse} title={collapsed ? "Expand Sidebar" : undefined}>
          <ArrowLeftToLine className={cx("size-[18px] shrink-0 transition-transform", collapsed && "rotate-180")} strokeWidth={1.75} />
          {!collapsed && "Collapse Sidebar"}
        </button>
      </div>
      <div className="my-3 h-px bg-chrome-border" />
      <div className="flex flex-col gap-0.5">
        {NAV_TOP.map(item)}
        <button
          className={row(inPkyb && collapsed)}
          aria-expanded={pkybOpen}
          onClick={() => (collapsed ? navigate("/pkyb/monitoring") : setPkybOpen((o) => !o))}
          title={collapsed ? "pKYB" : undefined}
        >
          <Radar className={cx("size-[18px] shrink-0", inPkyb && "text-chrome-accent")} strokeWidth={1.75} />
          {!collapsed && (
            <>
              <span className={cx(inPkyb && "font-semibold text-white")}>pKYB</span>
              <NewTag dark />
              <ChevronDown className={cx("ml-auto size-4 transition-transform", !pkybOpen && "-rotate-90")} />
            </>
          )}
        </button>
        {pkybOpen && !collapsed && (
          <div className="ml-[21px] flex flex-col gap-0.5 border-l border-chrome-border py-0.5 pl-3">
            {[
              { to: "/pkyb/monitoring", label: "Monitoring" },
              { to: "/pkyb/settings", label: "Severity Settings" },
            ].map((s) => (
              <NavLink
                key={s.to}
                to={s.to}
                onClick={onNavigate}
                className={({ isActive }) =>
                  cx(
                    "relative flex h-9 items-center rounded-[4px] px-3 text-[14px] transition-colors",
                    isActive
                      ? "bg-chrome-selected font-semibold text-white before:absolute before:top-2 before:bottom-2 before:-left-[13px] before:w-[2px] before:rounded-full before:bg-chrome-accent"
                      : "text-chrome-content-tertiary hover:bg-chrome-hover hover:text-white",
                  )
                }
              >
                {s.label}
              </NavLink>
            ))}
          </div>
        )}
        {NAV_BOTTOM.map(item)}
      </div>
      <div className="mt-auto pt-6">
        <button className={row(false)} title={collapsed ? "Logout" : undefined}>
          <LogOut className="size-[18px] shrink-0" strokeWidth={1.75} />
          {!collapsed && "Logout"}
        </button>
      </div>
    </nav>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const loc = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [drawer, setDrawer] = useState(false);

  return (
    <div className="min-h-dvh bg-base-contrast">
      <a
        href="#main"
        className="sr-only z-[70] rounded-[4px] bg-white px-4 py-2 text-[14px] font-semibold text-interactive-primary shadow-pop focus:not-sr-only focus:fixed focus:top-2 focus:left-2"
      >
        Skip to main content
      </a>
      <header className="sticky top-0 z-30 flex h-14 items-center gap-4 bg-[linear-gradient(90deg,var(--color-navy-700),var(--color-navy-900)_55%,var(--color-navy-950))] px-4 text-white lg:px-6">
        <button className="-ml-1 grid size-9 place-items-center rounded-[4px] hover:bg-chrome-control-hover lg:hidden" onClick={() => setDrawer(true)} aria-label="Open navigation">
          <MenuIcon className="size-5" />
        </button>
        <Link to="/pkyb/monitoring" aria-label="AsiaVerify home" className={cx("shrink-0", collapsed ? "lg:w-[40px]" : "lg:w-[212px]")}>
          <Logo />
        </Link>
        <span className="truncate text-[16px] font-semibold max-sm:hidden">{titleFor(loc.pathname)}</span>
        <div className="ml-auto flex items-center gap-1">
          <NotificationBell />
        </div>
      </header>

      <div className="flex">
        <aside
          className={cx(
            "sticky top-14 h-[calc(100dvh-56px)] shrink-0 bg-[linear-gradient(180deg,var(--color-navy-700),var(--color-navy-900)_55%,var(--color-navy-950))] max-lg:hidden",
            collapsed ? "w-[72px]" : "w-[252px]",
          )}
        >
          <Sidebar collapsed={collapsed} onCollapse={() => setCollapsed((c) => !c)} />
        </aside>

        {drawer && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div className="absolute inset-0 bg-background-scrim" onClick={() => setDrawer(false)} />
            <aside className="absolute inset-y-0 left-0 w-[280px] bg-[linear-gradient(180deg,var(--color-navy-700),var(--color-navy-950))] shadow-dialog">
              <div className="flex h-14 items-center justify-between px-4">
                <Logo />
                <button className="grid size-9 place-items-center rounded-[4px] text-white hover:bg-chrome-control-hover" onClick={() => setDrawer(false)} aria-label="Close navigation">
                  <X className="size-5" />
                </button>
              </div>
              <div className="h-[calc(100%-56px)]">
                <Sidebar collapsed={false} onCollapse={() => {}} onNavigate={() => setDrawer(false)} />
              </div>
            </aside>
          </div>
        )}

        <main id="main" tabIndex={-1} className="min-w-0 flex-1 focus:outline-none">
          {children}
        </main>
      </div>
      <Toasts />
    </div>
  );
}
