import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowDown, ArrowRight, ArrowUpDown, Check, ChevronDown, ChevronLeft, ChevronRight, Download, Ellipsis, Keyboard, Plus, Search, Square, SquareCheck, SquareMinus, X } from "lucide-react";
import {
  CATEGORIES,
  CATEGORY_LABEL,
  JURISDICTIONS,
  SEVERITIES,
  SEVERITY_LABEL,
  SEVERITY_RANK,
  STATUS_COPY,
  RECENT_DAYS,
  TODAY,
  addDays,
  fieldChanges,
  isRecent,
  iso,
  jurisdictionByCode,
  worstSeverity,
  type ChangeEvent,
  type Company,
  type Monitor,
  type MonitorStatus,
  type Severity,
} from "../data/model";
import { useStore } from "../state/store";
import { applyFilters, buildRow, describeFilters, filtersFromParams, moreRecent, type Filters, type Row } from "../data/queue";
import { QueueTrend } from "../components/QueueTrend";
import { StopDialog } from "../components/StopDialog";
import { CreateMonitorDialog } from "../components/CreateMonitorDialog";
import { Button, CategoryChip, Dialog, EventSeverity, focusAfterDialogs, Flag, Menu, SEV_STYLE, Select, cx, formatDate, formatDateLong, nf } from "../components/ui";
import { FieldDiff } from "../components/Review";
import { downloadCsv } from "../data/csv";

type Tab = "active" | "feed" | "history";
type Update = (patch: Record<string, string | null>) => void;
const FILTER_KEYS = ["q", "jur", "sev", "cat", "recent", "sort", "day", "status", "alerts"];
const TABS: Array<[Tab, string, string]> = [
  ["active", "Active monitors", "Active"],
  ["feed", "Change feed", "Feed"],
  ["history", "Order history", "History"],
];

const PAGE = 25;
function useMedia(query: string) {
  const [match, setMatch] = useState(() => window.matchMedia(query).matches);
  useEffect(() => {
    const mq = window.matchMedia(query);
    const on = () => setMatch(mq.matches);
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, [query]);
  return match;
}

const asCompany = (m: Monitor): Company => ({ id: m.id, name: m.name, localName: m.localName, regNo: m.regNo, jurisdiction: m.jurisdiction, status: "Registered" });

export function Monitoring() {
  const { monitors, severity, setQueue, prefs } = useStore();
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();
  const tab = (params.get("tab") as Tab) || "active";
  // Filters live in the URL so Back from a company page returns to the same view.
  const update: Update = (patch) =>
    setParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        for (const [k, v] of Object.entries(patch)) {
          if (v === null || v === "" || v === "all") next.delete(k);
          else next.set(k, v);
        }
        if (Object.keys(patch).some((k) => FILTER_KEYS.includes(k) || k === "tab")) next.delete("page");
        return next;
      },
      { replace: true },
    );
  const setTab = (t: Tab) => update({ tab: t === "active" ? null : t });
  const day = params.get("day");
  // On phones the 26-week grid would push the table below the fold, so it waits behind a toggle.
  const narrow = useMedia("(max-width: 767px)");
  const [showHeat, setShowHeat] = useState(false);
  const status = (params.get("status") as MonitorStatus | null) ?? "all";

  const active = useMemo(() => monitors.filter((m) => m.status === "active"), [monitors]);

  const rows = useMemo<Row[]>(
    () =>
      active.map((m) => buildRow(m, severity)),
    [active, severity],
  );

  const triage = useMemo(() => {
    const by: Record<Severity, number> = { high: 0, medium: 0, low: 0 };
    let companies = 0;
    for (const r of rows) if (r.recentSev) (by[r.recentSev]++, companies++);
    // Companies are the headline unit; the change count lives on the Change feed tab, where changes are the unit.
    let changes = 0;
    for (const r of rows) changes += r.m.events.length;
    return { by, companies, changes };
  }, [rows]);

  // Start at the most severe recent company and walk down: the queue is every company that changed recently, High first.
  const firstSeverity = triage.by.high ? "High" : triage.by.medium ? "Medium" : triage.by.low ? "Low" : null;
  const startQueue = () => {
    const list = applyFilters(rows, { q: "", jur: "all", sev: "all", cat: "all", recent: true, sort: "severity" });
    if (!list.length) return;
    setQueue({ ids: list.map((r) => r.m.id), label: "Recent changes", search: "recent=1" });
    navigate(`/pkyb/monitoring/${list[0].m.id}`);
  };
  const f = filtersFromParams(params);
  const onTabKey = (e: React.KeyboardEvent) => {
    const i = TABS.findIndex(([t]) => t === tab);
    const to = e.key === "ArrowRight" ? (i + 1) % TABS.length : e.key === "ArrowLeft" ? (i + TABS.length - 1) % TABS.length : e.key === "Home" ? 0 : e.key === "End" ? TABS.length - 1 : -1;
    if (to < 0) return;
    e.preventDefault();
    setTab(TABS[to][0]);
    document.getElementById(`tab-${TABS[to][0]}`)?.focus();
  };

  return (
    <div className="mx-auto max-w-[1360px] px-4 pt-6 pb-16 lg:px-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-[26px] leading-tight font-semibold tracking-[-0.015em]">Monitoring</h1>
          <p className="mt-1 text-[14px] text-content-main">Registry changes across the companies you monitor. Checks run automatically.</p>
        </div>
        <Button variant="secondary" onClick={() => navigate("/search?from=pkyb")}>
          <Plus className="size-4" /> New monitor
        </Button>
      </header>

      {/* Triage band: one surface, three jobs, in reading order. */}
      <section aria-label="Triage" className="mt-6 grid overflow-hidden rounded-[6px] border border-border-subtle bg-white lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1.4fr)]">
        <div className="flex flex-col justify-between gap-5 p-5 lg:p-6">
          <div>
            <p className="text-[13px] font-semibold text-content-main">Changed in the last {RECENT_DAYS} days</p>
            <p className="mt-1 flex items-baseline gap-2">
              <span className="text-[44px] leading-none font-semibold tracking-[-0.03em] tnum">{nf.format(triage.companies)}</span>
              <span className="text-[14px] text-content-main">{triage.companies === 1 ? "company" : "companies"}</span>
            </p>
            {/* The chips are the severity filter for the table below: press one to narrow to it, press it again to clear. */}
            <div role="group" aria-label={`Filter companies by their most severe change in the last ${RECENT_DAYS} days`} className="mt-4 flex flex-wrap gap-2">
              {(["high", "medium", "low"] as Severity[]).map((s) => {
                // A chip filters to companies whose most severe recent change is this tier, so it sets both filters and clears both.
                const pressed = tab === "active" && f.sev === s && f.recent;
                return (
                  <button
                    key={s}
                    aria-pressed={pressed}
                    onClick={() => (pressed ? update({ sev: null, recent: null }) : update({ tab: null, recent: "1", sev: s }))}
                    className={cx(
                      "inline-flex h-8 items-center gap-2 rounded-full border px-3 text-[13px] transition-colors hover:brightness-[0.97] max-sm:h-10",
                      SEV_STYLE[s].bg,
                      SEV_STYLE[s].line,
                      SEV_STYLE[s].text,
                      pressed && "shadow-[inset_0_0_0_1px_currentColor]",
                    )}
                  >
                    {pressed ? <Check className="size-3.5" strokeWidth={2.5} aria-hidden /> : <span className={cx("size-2 rounded-full", SEV_STYLE[s].dot)} aria-hidden />}
                    <span className="font-semibold tnum">{nf.format(triage.by[s])}</span> {SEVERITY_LABEL[s]}
                    <span className="sr-only"> {triage.by[s] === 1 ? "company" : "companies"}</span>
                  </button>
                );
              })}
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
            <Button variant="primary" onClick={startQueue} disabled={!firstSeverity}>
              {firstSeverity ? `Start with ${firstSeverity}` : `No changes in the last ${RECENT_DAYS} days`} {firstSeverity && <ArrowRight className="size-4" />}
            </Button>
          </div>
        </div>
        {narrow && !showHeat ? (
          <button onClick={() => setShowHeat(true)} aria-expanded={false} className="flex h-11 items-center justify-between gap-2 border-t border-border-subtle bg-base-contrast/60 px-5 text-left text-[13px] font-semibold text-interactive-primary">
            Show changes detected per week
            <ChevronDown className="size-4" aria-hidden />
          </button>
        ) : (
          <div className="border-t border-border-subtle bg-white p-5 lg:border-t-0 lg:border-l lg:p-6">
            <QueueTrend monitors={active} />
          </div>
        )}
      </section>

      <div role="tablist" aria-label="Monitoring views" onKeyDown={onTabKey} className="mt-8 flex gap-1 overflow-x-auto overflow-y-hidden border-b border-border-subtle">
        {TABS.map(([t, label, short]) => {
          const n = t === "active" ? active.length : t === "history" ? monitors.length : triage.changes;
          return (
            <button
              key={t}
              id={`tab-${t}`}
              role="tab"
              aria-selected={tab === t}
              aria-controls={`panel-${t}`}
              tabIndex={tab === t ? 0 : -1}
              onClick={() => setTab(t)}
              className={cx(
                "-mb-px flex h-11 shrink-0 items-center gap-2 border-b-2 px-3 text-[14px] transition-colors",
                tab === t ? "border-interactive-primary font-semibold text-content-primary" : "border-transparent text-content-main hover:text-content-primary",
              )}
            >
              <span className="max-sm:hidden">{label}</span>
              <span className="sm:hidden">{short}</span>
              {n !== null && <span className={cx("rounded-full px-1.5 text-[11px] tnum", tab === t ? "bg-interactive-accent text-interactive-control" : "bg-background-subtle text-content-tertiary")}>{nf.format(n)}</span>}
            </button>
          );
        })}
      </div>

      <div role="tabpanel" id={`panel-${tab}`} aria-labelledby={`tab-${tab}`}>
        {tab === "active" && <ActiveTable rows={rows} f={f} update={update} page={Number(params.get("page") ?? 0)} per={PAGE_SIZES.includes(Number(params.get("per"))) ? Number(params.get("per")) : PAGE} search={params.toString()} />}
        {tab === "feed" && (
          <ChangeFeed
            rows={rows}
            day={day}
            setDay={(d) => update({ day: d })}
            jur={f.jur}
            setJur={(v) => update({ jur: v })}
            sev={f.sev}
            setSev={(v) => update({ sev: v })}
            cat={f.cat}
            setCat={(v) => update({ cat: v })}
            alertsOnly={params.get("alerts") === "1"}
            clearAlerts={() => update({ alerts: null })}
            search={params.toString()}
          />
        )}
        {tab === "history" && <OrderHistory status={status} setStatus={(v) => update({ status: v })} />}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------- Active monitors */

function FilterBar({
  q,
  setQ,
  jur,
  setJur,
  sev,
  setSev,
  cat,
  setCat,
  children,
}: {
  q?: string;
  setQ?: (v: string) => void;
  jur: string;
  setJur: (v: string) => void;
  sev?: "all" | Severity;
  setSev?: (v: "all" | Severity) => void;
  cat?: string;
  setCat?: (v: string) => void;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end gap-3 py-4">
      {setQ && (
        <label className="flex min-w-[220px] flex-1 flex-col gap-1 sm:max-w-[320px]">
          <span className="text-[12px] font-medium text-content-main">Search company</span>
          <span className="relative">
            <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-content-tertiary" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Company name or registration no."
              className="h-9 w-full rounded-[4px] border border-interactive-secondary bg-white pr-3 pl-8 text-[13px] placeholder:text-content-tertiary focus:border-interactive-primary max-sm:h-11 max-sm:text-[16px]"
            />
          </span>
        </label>
      )}
      <Select
        label="Jurisdiction"
        value={jur}
        onChange={setJur}
        className="w-[160px]"
        options={[{ value: "all", label: "All jurisdictions" }, ...JURISDICTIONS.map((j) => ({ value: j.code, label: j.name }))]}
      />
      {setSev && (
        <Select
          label="Severity"
          value={sev!}
          onChange={(v) => setSev(v as "all" | Severity)}
          className="w-[140px]"
          options={[{ value: "all", label: "All severities" }, ...SEVERITIES.slice().reverse().map((s) => ({ value: s, label: SEVERITY_LABEL[s] }))]}
        />
      )}
      {setCat && (
        <Select
          label="Change category"
          value={cat!}
          onChange={setCat}
          className="w-[170px]"
          options={[{ value: "all", label: "All categories" }, ...CATEGORIES.map((c) => ({ value: c, label: CATEGORY_LABEL[c] }))]}
        />
      )}
      {children}
    </div>
  );
}

const PAGE_SIZES = [25, 50, 100];

function Pager({
  page,
  setPage,
  total,
  per = PAGE,
  setPer,
}: {
  page: number;
  setPage: (n: number) => void;
  total: number;
  per?: number;
  /** When set, the pager also offers a page size and a page jump. */
  setPer?: (n: number) => void;
}) {
  const pages = Math.max(1, Math.ceil(total / per));
  return (
    <div className="flex flex-wrap items-center justify-end gap-x-4 gap-y-2 px-4 py-3 text-[13px] text-content-main">
      {setPer && (
        <label className="flex items-center gap-2">
          Rows
          <select value={per} onChange={(e) => setPer(Number(e.target.value))} className="h-8 rounded-[4px] border border-interactive-secondary bg-white px-2 text-[13px] focus:border-interactive-primary max-sm:h-10">
            {PAGE_SIZES.map((n) => (
              <option key={n}>{n}</option>
            ))}
          </select>
        </label>
      )}
      {setPer && pages > 1 && (
        <label className="flex items-center gap-2">
          Page
          <select value={page} onChange={(e) => setPage(Number(e.target.value))} className="h-8 rounded-[4px] border border-interactive-secondary bg-white px-2 text-[13px] tnum focus:border-interactive-primary max-sm:h-10">
            {Array.from({ length: pages }, (_, i) => (
              <option key={i} value={i}>
                {i + 1}
              </option>
            ))}
          </select>
          <span className="tnum">of {nf.format(pages)}</span>
        </label>
      )}
      <span className="tnum">
        {total === 0 ? 0 : nf.format(page * per + 1)}–{nf.format(Math.min(total, (page + 1) * per))} of {nf.format(total)}
      </span>
      <div className="flex gap-1">
        <button aria-label="Previous page" disabled={page === 0} onClick={() => setPage(page - 1)} className="grid size-8 place-items-center rounded-[4px] border border-border-subtle hover:bg-background-subtle disabled:opacity-40">
          <ChevronLeft className="size-4" />
        </button>
        <button aria-label="Next page" disabled={page >= pages - 1} onClick={() => setPage(page + 1)} className="grid size-8 place-items-center rounded-[4px] border border-border-subtle hover:bg-background-subtle disabled:opacity-40">
          <ChevronRight className="size-4" />
        </button>
      </div>
    </div>
  );
}

/** "+2 more recent": the row shows one change, so say how many others landed in the same window. */
function MoreRecent({ r }: { r: Row }) {
  const n = moreRecent(r);
  if (n <= 0) return null;
  return <span className="text-[12px] text-content-tertiary tnum">+{n} more recent</span>;
}

function ActiveTable({ rows, f, update, page, per, search }: { rows: Row[]; f: Filters; update: Update; page: number; per: number; search: string }) {
  const navigate = useNavigate();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [stopping, setStopping] = useState<Array<{ id: string; name: string }>>([]);
  const { q, jur, sev, cat, recent: onlyRecent, sort } = f;
  const { setQueue, severity } = useStore();
  const setPage = (n: number) => update({ page: n ? String(n) : null });
  const setSort = (v: "severity" | "date") => update({ sort: v === "severity" ? null : v });

  const filtered = useMemo(() => applyFilters(rows, f, severity), [rows, q, jur, sev, cat, onlyRecent, sort, severity]);
  // Opening a company from here remembers this list, so the company page can step through it.
  const remember = () => setQueue({ ids: filtered.map((r) => r.m.id), label: describeFilters(f), search });
  const open = (id: string) => {
    remember();
    navigate(`/pkyb/monitoring/${id}`);
  };
  const pageRows = filtered.slice(page * per, (page + 1) * per);
  const setPer = (n: number) => update({ per: n === PAGE ? null : String(n), page: null });
  const tableRef = useRef<HTMLDivElement>(null);
  const [showKeys, setShowKeys] = useState(false);
  const selectedMix = useMemo(() => {
    const mix: Record<Severity, number> = { high: 0, medium: 0, low: 0 };
    for (const r of rows) if (selected.has(r.m.id)) for (const e of r.m.events) if (isRecent(e)) mix[worstSeverity(e.categories, severity)]++;
    return mix;
  }, [rows, selected, severity]);
  const allOnPage = pageRows.length > 0 && pageRows.every((r) => selected.has(r.m.id));
  const someOnPage = pageRows.some((r) => selected.has(r.m.id));
  // Shift-click selects (or clears) every row between the last checkbox clicked and this one.
  const anchor = useRef<string | null>(null);
  const toggle = (id: string, range = false) => {
    const ids = pageRows.map((r) => r.m.id);
    const from = anchor.current ? ids.indexOf(anchor.current) : -1;
    const to = ids.indexOf(id);
    setSelected((s) => {
      const n = new Set(s);
      const on = !n.has(id);
      const span = range && from >= 0 && to >= 0 ? ids.slice(Math.min(from, to), Math.max(from, to) + 1) : [id];
      span.forEach((x) => (on ? n.add(x) : n.delete(x)));
      return n;
    });
    anchor.current = id;
  };

  // Keyboard: j/k move between rows, x selects, Enter opens, ? lists the keys.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey || e.defaultPrevented) return;
      const t = e.target instanceof Element ? e.target : null;
      if (t?.closest("input, textarea, select, [contenteditable], dialog, [role=menu]")) return;
      if (e.key === "?") {
        e.preventDefault();
        setShowKeys(true);
        return;
      }
      const links = Array.from(tableRef.current?.querySelectorAll<HTMLElement>("[data-row-link]") ?? []).filter((el) => el.offsetParent);
      if (!links.length) return;
      const cur = links.indexOf(document.activeElement as HTMLElement);
      const row = cur >= 0 ? pageRows[cur] : undefined;
      if (e.key === "j" || e.key === "k") {
        e.preventDefault();
        const next = cur < 0 ? 0 : Math.min(links.length - 1, Math.max(0, cur + (e.key === "j" ? 1 : -1)));
        links[next].focus();
        links[next].scrollIntoView({ block: "nearest" });
      } else if (e.key === "x" && row) {
        e.preventDefault();
        toggle(row.m.id, e.shiftKey);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  });

  // After a bulk action the bar unmounts; focus returns to the select-all checkbox instead of falling to <body>.
  const focusAfterBulk = () =>
    focusAfterDialogs(() => tableRef.current?.querySelector<HTMLElement>("[data-select-all]") ?? tableRef.current?.querySelector<HTMLElement>("[data-row-link]"));

  const exportActive = () =>
    downloadCsv(
      `pkyb-active-monitors-${iso(TODAY)}.csv`,
      ["Company", "Registration no.", "Jurisdiction", `Changes, last ${RECENT_DAYS} days`, `Worst severity, last ${RECENT_DAYS} days`, "Shown change", "Shown change detected", "Newest change detected", "Last checked", "Monitoring since"],
      filtered.map((r) => [
        r.m.name,
        r.m.regNo,
        jurisdictionByCode[r.m.jurisdiction]?.name ?? r.m.jurisdiction,
        String(r.recent),
        r.recentSev ? SEVERITY_LABEL[r.recentSev] : "",
        r.latest ? r.latest.categories.map((c) => CATEGORY_LABEL[c]).join(" + ") : "",
        r.latest?.date ?? "",
        r.newest ?? "",
        r.m.lastChecked,
        r.m.createdAt,
      ]),
    );
  const filtersOn = q || jur !== "all" || sev !== "all" || cat !== "all" || onlyRecent;

  return (
    <>
      {/* Severity is filtered by the triage chips above, so the bar carries no second severity control; it echoes the active one so it stays visible. */}
      <FilterBar q={q} setQ={(v) => update({ q: v })} jur={jur} setJur={(v) => update({ jur: v })} cat={cat} setCat={(v) => update({ cat: v })}>
        {sev !== "all" && (
          <span className={cx("inline-flex h-9 items-center gap-2 rounded-full border pr-1.5 pl-3 text-[13px] font-semibold max-sm:h-11", SEV_STYLE[sev].bg, SEV_STYLE[sev].line, SEV_STYLE[sev].text)}>
            <span className={cx("size-2 rounded-full", SEV_STYLE[sev].dot)} aria-hidden />
            {SEVERITY_LABEL[sev]} severity
            <button aria-label={`Clear ${SEVERITY_LABEL[sev]} severity filter`} onClick={() => update({ sev: null })} className="grid size-6 place-items-center rounded-full hover:bg-white/70">
              <X className="size-3.5" />
            </button>
          </span>
        )}
        <label className="flex h-9 cursor-pointer items-center gap-2 rounded-[4px] border border-interactive-secondary bg-white px-3 text-[13px] select-none max-sm:h-11">
          <input type="checkbox" checked={onlyRecent} onChange={(e) => update({ recent: e.target.checked ? "1" : null })} className="size-4 accent-interactive-primary" />
          Changed in last {RECENT_DAYS} days
        </label>
        {filtersOn && (
          <button
            onClick={() => update({ q: null, jur: null, sev: null, cat: null, recent: null })}
            className="inline-flex h-9 items-center gap-1 px-1 text-[13px] font-semibold text-content-link hover:underline max-sm:h-11"
          >
            <X className="size-3.5" /> Clear filters
          </button>
        )}
      </FilterBar>

      <p className="sr-only" aria-live="polite">
        {`${nf.format(filtered.length)} ${filtered.length === 1 ? "company" : "companies"}`}
        {selected.size > 0 && `, ${nf.format(selected.size)} selected${selectedMix.high ? `, including ${nf.format(selectedMix.high)} High` : ""}`}
      </p>
      <div ref={tableRef} className="rounded-[6px] border border-border-subtle bg-white">
        {selected.size > 0 && (
          <div className="sticky top-14 z-10 flex flex-wrap items-center gap-x-3 gap-y-2 rounded-t-[5px] border-b border-border-subtle bg-background-system px-4 py-2 text-[13px] text-white">
            <span className="font-semibold tnum">{nf.format(selected.size)} selected</span>
            {selectedMix.high > 0 && (
              <span className="inline-flex items-center gap-1.5 text-high-on-dark">
                <span className="size-1.5 rounded-full bg-high-cell" /> includes {nf.format(selectedMix.high)} High
              </span>
            )}
            {allOnPage && selected.size < filtered.length && (
              <button onClick={() => setSelected(new Set(filtered.map((r) => r.m.id)))} className="rounded-[4px] px-2 py-1 font-semibold text-chrome-accent hover:bg-chrome-control-hover">
                Select all {nf.format(filtered.length)} matching
              </button>
            )}
            <span className="ml-auto flex items-center gap-1">
              <button onClick={() => (setSelected(new Set()), focusAfterBulk())} className="inline-flex h-8 items-center rounded-[4px] px-2 font-semibold text-chrome-content-main hover:bg-chrome-control-hover hover:text-white max-sm:h-10">
                Clear selection
              </button>
              {/* Stopping is the only bulk action, so it sits on the bar rather than behind a one-item menu. It still confirms first. */}
              <button
                onClick={() => setStopping(rows.filter((r) => selected.has(r.m.id)).map((r) => ({ id: r.m.id, name: r.m.name })))}
                className="inline-flex h-8 items-center rounded-[4px] bg-white px-3 font-semibold text-content-primary hover:bg-interactive-accent max-sm:h-10"
              >
                Stop monitoring {nf.format(selected.size)}…
              </button>
            </span>
          </div>
        )}
        <ul className="divide-y divide-border-subtle md:hidden">
          {pageRows.map((r) => {
            const j = jurisdictionByCode[r.m.jurisdiction];
            const isSel = selected.has(r.m.id);
            return (
              <li key={r.m.id} className={cx("flex gap-3 px-4 py-3.5", isSel && "bg-interactive-selected")}>
                <button role="checkbox" aria-checked={isSel} aria-label={`Select ${r.m.name}`} onClick={(e) => toggle(r.m.id, e.shiftKey)} className="-mx-3 -my-2.5 grid size-11 shrink-0 place-items-center text-content-tertiary">
                  {isSel ? <SquareCheck className="size-4 text-interactive-primary" aria-hidden /> : <Square className="size-4" aria-hidden />}
                </button>
                <Link to={`/pkyb/monitoring/${r.m.id}`} onClick={remember} data-row-link="" className="min-w-0 flex-1">
                  <span className="flex items-center gap-2">
                    <span className={cx("truncate text-[14px] text-content-primary", r.recent > 0 ? "font-semibold" : "font-medium")}>{r.m.name}</span>
                  </span>
                  <span className="mt-0.5 flex items-center gap-1.5 text-[12px] text-content-tertiary">
                    <Flag code={j.code} /> {j.name} · <span className="tnum">{r.latest ? `Detected ${formatDate(r.latest.date)}${r.newest && r.newest > r.latest.date ? ` · newest ${formatDate(r.newest)}` : ""}` : `Checked ${formatDate(r.m.lastChecked)}`}</span>
                  </span>
                  {r.latest && r.latestSev ? (
                    <span className="mt-2 flex flex-wrap items-center gap-1.5">
                      <EventSeverity event={r.latest} size="sm" />
                      {r.latest.categories.map((c) => (
                        <CategoryChip key={c} category={c} />
                      ))}
                      <MoreRecent r={r} />
                    </span>
                  ) : (
                    <span className="mt-2 block text-[12px] text-content-tertiary">No changes since baseline</span>
                  )}
                </Link>
                <Menu
                  label={`More actions for ${r.m.name}`}
                  trigger={<Ellipsis className="size-4" />}
                  items={[{ label: "Stop monitoring", danger: true, onSelect: () => setStopping([{ id: r.m.id, name: r.m.name }]) }]}
                />
              </li>
            );
          })}
          {pageRows.length === 0 && (
            <li className="px-4 py-12 text-center">
              <p className="text-[14px] font-semibold">No monitors match these filters</p>
              <p className="mt-1 text-[13px] text-content-main">Clear filters to see all {nf.format(rows.length)} active monitors.</p>
            </li>
          )}
        </ul>
        <div className="overflow-x-auto max-md:hidden">
          {/* The checkbox and Company columns stay pinned, so a row is still identifiable when the table scrolls sideways. */}
          <table className="w-full min-w-[820px] border-separate border-spacing-0 text-left text-[13px] [&_td]:border-b [&_td]:border-border-subtle [&_tr:last-child_td]:border-b-0">
            <thead className="text-[12px] text-content-main">
              <tr className="[&>th]:border-b [&>th]:border-border-subtle">
                <th className="sticky left-0 z-[2] w-10 bg-white py-1.5 pl-3">
                  <button
                    role="checkbox"
                    aria-checked={allOnPage ? true : someOnPage ? "mixed" : false}
                    aria-label="Select all companies on this page"
                    data-select-all=""
                    onClick={() =>
                      setSelected((s) => {
                        const n = new Set(s);
                        pageRows.forEach((r) => (allOnPage ? n.delete(r.m.id) : n.add(r.m.id)));
                        return n;
                      })
                    }
                    className="grid size-6 place-items-center text-content-tertiary hover:text-content-primary"
                  >
                    {allOnPage ? <SquareCheck className="size-4 text-interactive-primary" aria-hidden /> : someOnPage ? <SquareMinus className="size-4 text-interactive-primary" aria-hidden /> : <Square className="size-4" aria-hidden />}
                  </button>
                </th>
                <th className="sticky left-10 z-[2] bg-white px-3 py-2.5 font-semibold shadow-[inset_-1px_0_0_var(--color-border-subtle)]">Company</th>
                <th className="px-3 py-2.5 font-semibold">Jurisdiction</th>
                <th className="px-3 py-1.5 font-semibold" aria-sort={sort === "severity" ? "descending" : "none"}>
                  <button onClick={() => setSort("severity")} title="Sort by severity, most severe first" className={cx("inline-flex h-6 items-center gap-1", sort === "severity" && "text-content-primary")}>
                    Change <span className="sr-only">, sorted by severity</span> {sort === "severity" ? <ArrowDown className="size-3.5" aria-hidden /> : <ArrowUpDown className="size-3.5 text-content-tertiary" aria-hidden />}
                  </button>
                </th>
                <th className="px-3 py-1.5 font-semibold" aria-sort={sort === "date" ? "descending" : "none"}>
                  <button onClick={() => setSort("date")} title="Sort by each company’s newest detected change" className={cx("inline-flex h-6 items-center gap-1", sort === "date" && "text-content-primary")}>
                    Detected {sort === "date" ? <ArrowDown className="size-3.5" aria-hidden /> : <ArrowUpDown className="size-3.5 text-content-tertiary" aria-hidden />}
                  </button>
                </th>
                <th className="w-[112px] py-2.5 pr-4" />
              </tr>
            </thead>
            <tbody>
              {pageRows.map((r) => {
                const j = jurisdictionByCode[r.m.jurisdiction];
                const isSel = selected.has(r.m.id);
                // Pinned cells need a solid fill of their own, so every cell takes the row state rather than the <tr>.
                const fill = isSel ? "bg-interactive-selected" : "bg-white group-hover:bg-base-contrast";
                return (
                  <tr key={r.m.id} onClick={() => open(r.m.id)} className="group cursor-pointer align-top [&>td]:transition-colors">
                    <td className={cx("sticky left-0 z-[1] py-3 pl-3", fill)} onClick={(e) => e.stopPropagation()}>
                      <button role="checkbox" aria-checked={isSel} aria-label={`Select ${r.m.name}`} onClick={(e) => toggle(r.m.id, e.shiftKey)} className="grid size-6 place-items-center text-content-tertiary hover:text-content-primary">
                        {isSel ? <SquareCheck className="size-4 text-interactive-primary" aria-hidden /> : <Square className="size-4" aria-hidden />}
                      </button>
                    </td>
                    <td className={cx("sticky left-10 z-[1] max-w-[300px] min-w-[220px] px-3 py-3 shadow-[inset_-1px_0_0_var(--color-border-subtle)]", fill)}>
                      <span className="flex items-center gap-2">
                        <span className={cx("truncate text-[14px] text-content-primary", r.recent > 0 ? "font-semibold" : "font-medium")}>{r.m.name}</span>
                      </span>
                      <span className="block text-[12px] text-content-tertiary tnum">
                        {r.m.regNo} · Checked {formatDate(r.m.lastChecked)}
                      </span>
                    </td>
                    <td className={cx("px-3 py-3.5 whitespace-nowrap", fill)}>
                      <span className="flex items-center gap-2 text-content-main">
                        <Flag code={j.code} /> {j.name}
                      </span>
                    </td>
                    <td className={cx("px-3 py-3", fill)}>
                      {r.latest && r.latestSev ? (
                        <span className="flex flex-wrap items-center gap-1.5">
                          <EventSeverity event={r.latest} size="sm" />
                          {r.latest.categories.map((c) => (
                            <CategoryChip key={c} category={c} />
                          ))}
                          <MoreRecent r={r} />
                        </span>
                      ) : (
                        <span className="text-content-tertiary">No changes since baseline</span>
                      )}
                    </td>
                    <td className={cx("px-3 py-3.5 whitespace-nowrap text-content-main tnum", fill)}>
                      {r.latest ? formatDate(r.latest.date) : "—"}
                      {r.newest && r.latest && r.newest > r.latest.date && <span className="block text-[12px] text-content-tertiary">Newest {formatDate(r.newest)}</span>}
                    </td>
                    <td className={cx("py-2.5 pr-3", fill)} onClick={(e) => e.stopPropagation()}>
                      <span className="flex items-center justify-end gap-1">
                        <Link to={`/pkyb/monitoring/${r.m.id}`} onClick={remember} data-row-link="" aria-label={`View ${r.m.name}`} className="inline-flex h-8 items-center px-2 text-[13px] font-semibold text-content-link hover:underline">
                          View
                        </Link>
                        <Menu
                          label={`More actions for ${r.m.name}`}
                          trigger={<Ellipsis className="size-4" />}
                          items={[{ label: "Stop monitoring", danger: true, onSelect: () => setStopping([{ id: r.m.id, name: r.m.name }]) }]}
                        />
                      </span>
                    </td>
                  </tr>
                );
              })}
              {pageRows.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-14 text-center">
                    <p className="text-[14px] font-semibold">No monitors match these filters</p>
                    <p className="mt-1 text-[13px] text-content-main">Try another jurisdiction or severity, or clear filters to see all {nf.format(rows.length)} active monitors.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="flex flex-wrap items-center justify-between border-t border-border-subtle">
          <span className="flex items-center gap-1 pl-2">
            {filtered.length > 0 && (
              <Button variant="ghost" size="sm" onClick={exportActive}>
                <Download className="size-3.5" /> Export {nf.format(filtered.length)} as CSV
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={() => setShowKeys(true)} className="max-md:hidden">
              <Keyboard className="size-3.5" /> Shortcuts
            </Button>
          </span>
          <Pager page={page} setPage={setPage} total={filtered.length} per={per} setPer={setPer} />
        </div>
      </div>
      <Dialog open={showKeys} onClose={() => setShowKeys(false)} width={420} labelledBy="keys-title" title="Keyboard shortcuts" footer={<Button variant="ghost" onClick={() => setShowKeys(false)} data-autofocus="">Close</Button>}>
        <dl className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-4 gap-y-2.5 text-[13px] text-content-main">
          {[
            ["j / k", "Next / previous company"],
            ["Enter", "Open the company"],
            ["x", "Select the company (Shift+x or Shift-click selects a range)"],
            ["?", "Show these shortcuts"],
          ].map(([k, v]) => (
            <Fragment key={k}>
              <dt>
                <kbd className="rounded-[3px] border border-border-neutral bg-background-subtle px-1.5 py-0.5 font-sans text-[12px] font-semibold text-content-primary">{k}</kbd>
              </dt>
              <dd>{v}</dd>
            </Fragment>
          ))}
        </dl>
      </Dialog>
      <StopDialog targets={stopping} onClose={() => setStopping([])} onDone={() => (setSelected(new Set()), focusAfterBulk())} />
    </>
  );
}

/* ---------------------------------------------------------------- Change feed */

function ChangeFeed({
  rows,
  day,
  setDay,
  jur,
  setJur,
  sev,
  setSev,
  cat,
  setCat,
  alertsOnly,
  clearAlerts,
  search,
}: {
  rows: Row[];
  day: string | null;
  setDay: (d: string | null) => void;
  jur: string;
  setJur: (v: string) => void;
  sev: "all" | Severity;
  setSev: (v: "all" | Severity) => void;
  cat: string;
  setCat: (v: string) => void;
  /** Only recent changes at the severities the analyst gets in-app alerts for: exactly what the bell counts. */
  alertsOnly: boolean;
  clearAlerts: () => void;
  search: string;
}) {
  const { severity, prefs } = useStore();
  const [page, setPage] = useState(0);
  const events = useMemo(() => {
    const out: Array<{ e: ChangeEvent; m: Monitor; s: Severity }> = [];
    for (const r of rows)
      for (const e of r.m.events) {
        if (alertsOnly && !isRecent(e)) continue;
        if (day && e.date !== day) continue;
        if (jur !== "all" && r.m.jurisdiction !== jur) continue;
        if (cat !== "all" && !e.categories.includes(cat as never)) continue;
        const s = worstSeverity(e.categories, severity);
        if (alertsOnly && !prefs.inApp[s]) continue;
        if (sev !== "all" && s !== sev) continue;
        out.push({ e, m: r.m, s });
      }
    return out.sort((a, b) => (a.e.date === b.e.date ? SEVERITY_RANK[b.s] - SEVERITY_RANK[a.s] : a.e.date < b.e.date ? 1 : -1));
  }, [rows, day, jur, sev, cat, severity, alertsOnly, prefs]);
  useEffect(() => setPage(0), [day, jur, sev, cat, alertsOnly]);
  const { setQueue } = useStore();
  const rememberFeed = () =>
    setQueue({ ids: [...new Set(events.map((x) => x.m.id))], label: day ? `Change feed · ${formatDate(day)}` : "Change feed", search });
  const slice = events.slice(page * PAGE, (page + 1) * PAGE);
  const exportFeed = () =>
    downloadCsv(
      `pkyb-change-feed-${iso(TODAY)}.csv`,
      ["Detected", "Company", "Registration no.", "Jurisdiction", "Categories", "Severity now", "Severity when detected", "Fields changed"],
      events.map(({ e, m, s }) => [
        e.date,
        m.name,
        m.regNo,
        jurisdictionByCode[m.jurisdiction].name,
        e.categories.map((c) => CATEGORY_LABEL[c]).join("; "),
        SEVERITY_LABEL[s],
        SEVERITY_LABEL[e.detectedSeverity],
        fieldChanges(e, m).map((fc) => `${fc.field}: ${fc.before} → ${fc.after}`).join("; "),
      ]),
    );
  const groups: Array<[string, typeof slice]> = [];
  for (const it of slice) {
    const g = groups[groups.length - 1];
    if (g && g[0] === it.e.date) g[1].push(it);
    else groups.push([it.e.date, [it]]);
  }

  return (
    <>
      <FilterBar jur={jur} setJur={setJur} sev={sev} setSev={setSev} cat={cat} setCat={setCat}>
        {alertsOnly && (
          <span className="inline-flex h-9 items-center gap-2 rounded-full border border-border-accent bg-interactive-accent pr-1.5 pl-3 text-[13px] font-semibold text-interactive-control">
            Your in-app alerts
            <button aria-label="Show all changes" onClick={clearAlerts} className="grid size-6 place-items-center rounded-full hover:bg-interactive-accent-hover">
              <X className="size-3.5" />
            </button>
          </span>
        )}
        {day && (
          <span className="inline-flex h-9 items-center gap-2 rounded-full border border-border-accent bg-interactive-accent pr-1.5 pl-3 text-[13px] font-semibold text-interactive-control">
            {formatDateLong(day)}
            <button aria-label="Clear day" onClick={() => setDay(null)} className="grid size-6 place-items-center rounded-full hover:bg-interactive-accent-hover">
              <X className="size-3.5" />
            </button>
          </span>
        )}
      </FilterBar>
      <div className="rounded-[6px] border border-border-subtle bg-white">
        {events.length > 0 && (
          <p className="rounded-t-[6px] border-b border-border-subtle px-4 py-2.5 text-[13px] text-content-main">
            <span className="font-semibold text-content-primary tnum">{nf.format(events.length)}</span> {events.length === 1 ? "change" : "changes"}
          </p>
        )}
        {groups.map(([date, items]) => (
          <section key={date} aria-label={formatDateLong(date)}>
            <h2 className="sticky top-14 z-[1] border-b border-border-subtle bg-base-contrast px-4 py-2 text-[12px] font-semibold text-content-main">{formatDateLong(date)}</h2>
            <ul className="divide-y divide-border-subtle">
              {items.map(({ e, m }) => (
                <li key={e.id} className="relative grid gap-2 px-4 py-3 hover:bg-base-contrast sm:grid-cols-[104px_minmax(0,1fr)] sm:items-center sm:gap-4">
                    <span>
                      <EventSeverity event={e} size="sm" />
                    </span>
                    <span className="min-w-0">
                      <span className="flex items-center gap-2">
                        <Flag code={m.jurisdiction} />
                        <Link
                          to={`/pkyb/monitoring/${m.id}`}
                          onClick={rememberFeed}
                          title={m.name}
                          className="truncate text-[14px] font-semibold text-content-primary hover:underline after:absolute after:inset-0"
                        >
                          {m.name}
                        </Link>
                      </span>
                      <span className="mt-1.5 flex flex-wrap gap-1.5">
                        {e.categories.map((c) => (
                          <CategoryChip key={c} category={c} />
                        ))}
                      </span>
                      <FieldDiff event={e} monitor={m} className="mt-2" />
                    </span>
                </li>
              ))}
            </ul>
          </section>
        ))}
        {events.length === 0 && (
          <div className="px-4 py-14 text-center">
            <p className="text-[14px] font-semibold">{day || jur !== "all" || sev !== "all" || cat !== "all" || alertsOnly ? "No changes match" : "No changes yet"}</p>
            <p className="mt-1 text-[13px] text-content-main">
              {day
                ? "Nothing was detected on this day for these filters."
                : jur !== "all" || sev !== "all" || cat !== "all" || alertsOnly
                  ? "Adjust the filters to see more of the feed."
                  : "Registry changes across your monitored companies will be listed here as they're detected."}
            </p>
          </div>
        )}
        <div className="flex flex-wrap items-center justify-between border-t border-border-subtle">
          {events.length > 0 ? (
            <Button variant="ghost" size="sm" onClick={exportFeed} className="ml-2">
              <Download className="size-3.5" /> Export {nf.format(events.length)} as CSV
            </Button>
          ) : (
            <span />
          )}
          <Pager page={page} setPage={setPage} total={events.length} />
        </div>
      </div>
    </>
  );
}

/* ---------------------------------------------------------------- Order history */

function OrderHistory({ status, setStatus }: { status: "all" | MonitorStatus; setStatus: (s: "all" | MonitorStatus) => void }) {
  const { monitors } = useStore();
  const [jur, setJur] = useState("all");
  const [q, setQ] = useState("");
  const [page, setPage] = useState(0);
  const [creating, setCreating] = useState<Company | null>(null);
  const counts = useMemo(() => {
    const c: Record<MonitorStatus, number> = { active: 0, stopped: 0, inactive: 0 };
    monitors.forEach((m) => c[m.status]++);
    return c;
  }, [monitors]);
  const list = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return monitors
      .filter((m) => (status === "all" || m.status === status) && (jur === "all" || m.jurisdiction === jur) && (!needle || m.name.toLowerCase().includes(needle) || m.regNo.includes(needle)))
      .sort((a, b) => ((a.endedAt ?? a.createdAt) < (b.endedAt ?? b.createdAt) ? 1 : -1));
  }, [monitors, status, jur, q]);
  useEffect(() => setPage(0), [status, jur, q]);

  const exportCsv = () =>
    downloadCsv(
      `pkyb-order-history-${iso(TODAY)}.csv`,
      ["Company", "Registration no.", "Jurisdiction", "Status", "Created", "Ended", "Changes recorded"],
      list.map((m) => [m.name, m.regNo, jurisdictionByCode[m.jurisdiction].name, STATUS_COPY[m.status].label, m.createdAt, m.endedAt ?? "", String(m.events.length)]),
    );
  const pageList = list.slice(page * PAGE, (page + 1) * PAGE);

  return (
    <>
      <div className="flex flex-wrap items-center gap-2 pt-4" role="radiogroup" aria-label="Order status">
        {(["all", "active", "stopped", "inactive"] as const).map((s) => (
          <button
            key={s}
            role="radio"
            aria-checked={status === s}
            onClick={() => setStatus(s)}
            className={cx(
              "inline-flex h-8 items-center gap-2 rounded-full border px-3 text-[13px] transition-colors",
              status === s ? "border-interactive-inverse bg-interactive-inverse font-semibold text-white" : "border-interactive-secondary bg-white text-content-main hover:border-content-main",
            )}
          >
            {s === "all" ? "All orders" : STATUS_COPY[s].label}
            <span className="tnum opacity-70">{nf.format(s === "all" ? monitors.length : counts[s])}</span>
          </button>
        ))}
      </div>
      {status === "all" ? (
        <dl className="mt-3 grid max-w-[980px] gap-x-6 gap-y-2 text-[13px] md:grid-cols-3">
          {(["active", "stopped", "inactive"] as const).map((s) => (
            <div key={s}>
              <dt className="font-semibold text-content-primary">{STATUS_COPY[s].label}</dt>
              <dd className="text-content-main">{STATUS_COPY[s].explain}</dd>
            </div>
          ))}
        </dl>
      ) : (
        <p className="mt-3 max-w-[70ch] text-[13px] text-content-main">
          <span className="font-semibold text-content-primary">{STATUS_COPY[status].label}:</span> {STATUS_COPY[status].explain}
        </p>
      )}
      <FilterBar q={q} setQ={setQ} jur={jur} setJur={setJur}>
        <Button variant="secondary" className="ml-auto" onClick={exportCsv}>
          <Download className="size-4" /> Export CSV
        </Button>
      </FilterBar>
      <div className="overflow-hidden rounded-[6px] border border-border-subtle bg-white">
        {/* Below md the same rows render as a stacked list (the Stacked Rows Rule). */}
        <ul className="divide-y divide-border-subtle md:hidden">
          {pageList.map((m) => (
            <li key={m.id} className="px-4 py-3.5">
              <Link to={`/pkyb/monitoring/${m.id}`} className="block truncate text-[14px] font-medium text-content-primary hover:underline">
                {m.name}
              </Link>
              <span className="mt-0.5 flex items-center gap-1.5 text-[12px] text-content-tertiary">
                <Flag code={m.jurisdiction} /> {jurisdictionByCode[m.jurisdiction].name} · <span className="tnum">{m.regNo}</span>
              </span>
              <span className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] text-content-main">
                <StatusBadge status={m.status} />
                <span className="tnum">
                  {formatDate(m.createdAt)} – {m.endedAt ? formatDate(m.endedAt) : "runs until stopped"}
                </span>
                <span className="tnum">
                  {nf.format(m.events.length)} {m.events.length === 1 ? "change" : "changes"}
                </span>
              </span>
              {m.status !== "active" && (
                <Button variant="link" size="sm" className="mt-1" onClick={() => setCreating(asCompany(m))} aria-label={`Create pKYB monitor for ${m.name}`}>
                  Create pKYB monitor
                </Button>
              )}
            </li>
          ))}
          {list.length === 0 && (
            <li className="px-4 py-12 text-center">
              <p className="text-[14px] font-semibold">No orders match</p>
              <p className="mt-1 text-[13px] text-content-main">Try another status or jurisdiction, or clear the search.</p>
            </li>
          )}
        </ul>
        <div className="overflow-x-auto max-md:hidden">
          <table className="w-full min-w-[940px] text-left text-[13px]">
            <thead className="border-b border-border-subtle text-[12px] text-content-main">
              <tr>
                <th className="px-4 py-2.5 font-semibold">Company</th>
                <th className="px-3 py-2.5 font-semibold">Jurisdiction</th>
                <th className="px-3 py-2.5 font-semibold">Status</th>
                <th className="px-3 py-2.5 font-semibold">Created</th>
                <th className="px-3 py-2.5 font-semibold">Ended</th>
                <th className="px-3 py-2.5 text-right font-semibold">Changes recorded</th>
                <th className="w-[1%] px-4 py-2.5">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {pageList.map((m) => (
                <tr key={m.id} className="hover:bg-base-contrast">
                  <td className="px-4 py-3">
                    <Link to={`/pkyb/monitoring/${m.id}`} className="block font-medium text-content-primary hover:text-content-link hover:underline">
                      {m.name}
                    </Link>
                    <span className="text-[12px] text-content-tertiary tnum">{m.regNo}</span>
                  </td>
                  <td className="px-3 py-3 whitespace-nowrap">
                    <span className="flex items-center gap-2 text-content-main">
                      <Flag code={m.jurisdiction} /> {jurisdictionByCode[m.jurisdiction].name}
                    </span>
                  </td>
                  <td className="px-3 py-3">
                    <StatusBadge status={m.status} />
                  </td>
                  <td className="px-3 py-3 whitespace-nowrap text-content-main tnum">{formatDate(m.createdAt)}</td>
                  <td className="px-3 py-3 whitespace-nowrap text-content-main tnum">{m.endedAt ? formatDate(m.endedAt) : <span className="text-content-tertiary">Runs until stopped</span>}</td>
                  <td className="px-3 py-3 text-right tnum">{m.events.length}</td>
                  <td className="px-4 py-1.5 text-right whitespace-nowrap">
                    {m.status !== "active" && (
                      <Button variant="link" size="sm" onClick={() => setCreating(asCompany(m))} aria-label={`Create pKYB monitor for ${m.name}`}>
                        Create pKYB monitor
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
              {list.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-14 text-center">
                    <p className="text-[14px] font-semibold">No orders match</p>
                    <p className="mt-1 text-[13px] text-content-main">Try another status or jurisdiction, or clear the search.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="border-t border-border-subtle">
          <Pager page={page} setPage={setPage} total={list.length} />
        </div>
      </div>
      <CreateMonitorDialog company={creating} onClose={() => setCreating(null)} />
    </>
  );
}

export function StatusBadge({ status }: { status: MonitorStatus }) {
  return (
    <span
      className={cx(
        "inline-flex h-6 items-center gap-1.5 rounded-[4px] border px-2 text-[12px] font-semibold",
        status === "active" && "border-border-accent bg-interactive-accent text-interactive-control",
        status === "stopped" && "border-border-neutral bg-background-subtle text-content-main",
        // Amber is Medium severity and nothing else. Inactive reads as "never ran": neutral, with a hollow dot.
        status === "inactive" && "border-border-neutral bg-white text-content-main",
      )}
    >
      <span
        aria-hidden
        className={cx("size-1.5 rounded-full", status === "active" ? "bg-interactive-primary" : status === "stopped" ? "bg-content-tertiary" : "border border-content-tertiary bg-transparent")}
      />
      {STATUS_COPY[status].label}
    </span>
  );
}
