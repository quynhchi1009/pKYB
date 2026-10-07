import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowDown, ArrowRight, ArrowUpDown, Check, ChevronDown, ChevronLeft, ChevronRight, Download, Ellipsis, Plus, Search, Square, SquareCheck, SquareMinus, X } from "lucide-react";
import {
  CATEGORIES,
  CATEGORY_LABEL,
  JURISDICTIONS,
  SEVERITIES,
  SEVERITY_LABEL,
  SEVERITY_RANK,
  STATUS_COPY,
  DECISION_LABEL,
  TODAY,
  addDays,
  fieldChanges,
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
import { applyFilters, buildRow, describeFilters, filtersFromParams, type Filters, type Row } from "../data/queue";
import { Heatmap } from "../components/Heatmap";
import { StopDialog } from "../components/StopDialog";
import { CreateMonitorDialog } from "../components/CreateMonitorDialog";
import { Button, CategoryChip, EventSeverity, Flag, Menu, SEV_STYLE, Select, SeverityPill, cx, formatDate, formatDateLong, nf } from "../components/ui";
import { ReviewDialog, ReviewMenu, ReviewStatus } from "../components/Review";
import { downloadCsv } from "../data/csv";

type Tab = "active" | "feed" | "history";
type Update = (patch: Record<string, string | null>) => void;
const FILTER_KEYS = ["q", "jur", "sev", "cat", "unrev", "sort", "day", "status", "rev", "alerts"];
const TABS: Array<[Tab, string, string]> = [
  ["active", "Active monitors", "Active"],
  ["feed", "Change feed", "Feed"],
  ["history", "Order history", "History"],
];

const PAGE = 25;
const HIGH_RAMP = ["var(--color-wash)", "var(--color-high-ramp-1)", "var(--color-high-ramp-2)", "var(--color-high-cell)"];
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
    for (const r of rows) if (r.unreviewedSev) (by[r.unreviewedSev]++, companies++);
    const heatSince = iso(addDays(TODAY, -26 * 7));
    // Two counts of changes, each with one meaning: every unreviewed change, and the subset the bell counts as alerts.
    let unreviewed = 0;
    let alerts = 0;
    let peak = 1;
    // The heatmap shares the headline's lens: unreviewed High changes, so it lightens as the queue shrinks.
    const highByDay = new Map<string, number>();
    for (const r of rows)
      for (const e of r.m.events) {
        if (e.reviewed) continue;
        const s = worstSeverity(e.categories, severity);
        unreviewed++;
        if (prefs.inApp[s]) alerts++;
        if (s !== "high") continue;
        const n = (highByDay.get(e.date) ?? 0) + 1;
        highByDay.set(e.date, n);
        if (e.date >= heatSince && n > peak) peak = n;
      }
    return { by, companies, unreviewed, alerts, highByDay, peak };
  }, [rows, severity, prefs]);
  // The ramp scales to the busiest day on screen, so it never saturates into one flat colour.
  const rampStep = (n: number) => (n === 0 ? 0 : n <= triage.peak / 3 ? 1 : n <= (2 * triage.peak) / 3 ? 2 : 3);

  // Start at the most severe unreviewed company and walk down: the queue is every unreviewed company, High first.
  const firstSeverity = triage.by.high ? "High" : triage.by.medium ? "Medium" : triage.by.low ? "Low" : null;
  const startReview = () => {
    const list = applyFilters(rows, { q: "", jur: "all", sev: "all", cat: "all", unrev: true, sort: "severity" });
    if (!list.length) return;
    setQueue({ ids: list.map((r) => r.m.id), label: "Needs review", search: "unrev=1" });
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
          <p className="mt-1 text-[14px] text-ink-2">Registry changes across the companies you monitor. Checks run automatically.</p>
        </div>
        <Button variant="secondary" onClick={() => navigate("/search?from=pkyb")}>
          <Plus className="size-4" /> New monitor
        </Button>
      </header>

      {/* Triage band: one surface, three jobs, in reading order. */}
      <section aria-label="Triage" className="mt-6 grid overflow-hidden rounded-[6px] border border-line bg-white lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1.4fr)]">
        <div className="flex flex-col justify-between gap-5 p-5 lg:p-6">
          <div>
            <p className="text-[13px] font-semibold text-ink-2">Needs review</p>
            <p className="mt-1 flex items-baseline gap-2">
              <span className="text-[44px] leading-none font-semibold tracking-[-0.03em] tnum">{nf.format(triage.companies)}</span>
              <span className="text-[14px] text-ink-2">companies with unreviewed changes</span>
            </p>
            {/* The chips are the severity filter for the table below: press one to narrow to it, press it again to clear. */}
            <div role="group" aria-label="Filter companies by their most severe unreviewed change" className="mt-4 flex flex-wrap gap-2">
              {(["high", "medium", "low"] as Severity[]).map((s) => {
                // A chip filters to companies whose most severe unreviewed change is this tier, so it sets both filters and clears both.
                const pressed = tab === "active" && f.sev === s && f.unrev;
                return (
                  <button
                    key={s}
                    aria-pressed={pressed}
                    onClick={() => (pressed ? update({ sev: null, unrev: null }) : update({ tab: null, unrev: "1", sev: s }))}
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
            <Button variant="primary" onClick={startReview} disabled={!firstSeverity}>
              {firstSeverity ? `Review ${firstSeverity} first` : "Nothing to review"} {firstSeverity && <ArrowRight className="size-4" />}
            </Button>
            <dl className="flex gap-x-6 text-[13px]">
              <div>
                <dt className="text-ink-3">Unreviewed changes</dt>
                <dd className="font-semibold tnum">{nf.format(triage.unreviewed)}</dd>
              </div>
              <div>
                <dt className="text-ink-3">Your in-app alerts</dt>
                <dd>
                  <Link to="/pkyb/monitoring?tab=feed&alerts=1" className="font-semibold text-brand-700 tnum hover:underline">
                    {nf.format(triage.alerts)} unread
                  </Link>
                </dd>
              </div>
            </dl>
          </div>
        </div>
        {narrow && !showHeat ? (
          <button onClick={() => setShowHeat(true)} aria-expanded={false} className="flex h-11 items-center justify-between gap-2 border-t border-line bg-canvas/60 px-5 text-left text-[13px] font-semibold text-brand-700">
            Show unreviewed High changes per day
            <ChevronDown className="size-4" aria-hidden />
          </button>
        ) : (
        <div className="border-t border-line bg-canvas/60 p-5 lg:border-t-0 lg:border-l lg:p-6">
          <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
            <p className="text-[13px] font-semibold text-ink-2">Unreviewed High-severity changes per day · last 26 weeks</p>
            <span className="flex items-center gap-1.5 text-[11px] text-ink-3">
              None
              {HIGH_RAMP.map((c) => (
                <span key={c} className="size-2.5 rounded-[2px]" style={{ background: c }} />
              ))}
              <span className="tnum">{triage.peak}</span>
            </span>
          </div>
          <Heatmap
            weeks={26}
            size={13}
            gap={3}
            ariaLabel="Unreviewed High-severity changes per day across your portfolio"
            selected={tab === "feed" && f.sev === "high" ? day : null}
            onSelect={(d) => update(d ? { day: d, tab: "feed", sev: "high", rev: null, alerts: null } : { day: null })}
            cell={(d) => {
              const n = triage.highByDay.get(d) ?? 0;
              return {
                fill: HIGH_RAMP[rampStep(n)],
                label: `${n === 0 ? "No" : n} unreviewed High-severity change${n === 1 ? "" : "s"} · ${formatDate(d)}`,
                active: n > 0,
              };
            }}
          />
          <p className="mt-2 text-[12px] text-ink-3">Select a day to open its unreviewed High changes in the feed.</p>
        </div>
        )}
      </section>

      <div role="tablist" aria-label="Monitoring views" onKeyDown={onTabKey} className="mt-8 flex gap-1 overflow-x-auto overflow-y-hidden border-b border-line">
        {TABS.map(([t, label, short]) => {
          const n = t === "active" ? active.length : t === "history" ? monitors.length : null;
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
                tab === t ? "border-brand-700 font-semibold text-ink" : "border-transparent text-ink-2 hover:text-ink",
              )}
            >
              <span className="max-sm:hidden">{label}</span>
              <span className="sm:hidden">{short}</span>
              {n !== null && <span className={cx("rounded-full px-1.5 text-[11px] tnum", tab === t ? "bg-brand-50 text-brand-800" : "bg-wash text-ink-3")}>{nf.format(n)}</span>}
            </button>
          );
        })}
      </div>

      <div role="tabpanel" id={`panel-${tab}`} aria-labelledby={`tab-${tab}`}>
        {tab === "active" && <ActiveTable rows={rows} f={f} update={update} page={Number(params.get("page") ?? 0)} search={params.toString()} />}
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
            includeReviewed={params.get("rev") === "1"}
            setIncludeReviewed={(v) => update({ rev: v ? "1" : null })}
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
          <span className="text-[12px] font-medium text-ink-2">Search company</span>
          <span className="relative">
            <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-ink-3" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Company name or registration no."
              className="h-9 w-full rounded-[4px] border border-line-strong bg-white pr-3 pl-8 text-[13px] placeholder:text-ink-3 focus:border-brand-600 max-sm:h-11 max-sm:text-[16px]"
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

function Pager({ page, setPage, total }: { page: number; setPage: (n: number) => void; total: number }) {
  const pages = Math.max(1, Math.ceil(total / PAGE));
  return (
    <div className="flex items-center justify-end gap-3 px-4 py-3 text-[13px] text-ink-2">
      <span className="tnum">
        {total === 0 ? 0 : nf.format(page * PAGE + 1)}–{nf.format(Math.min(total, (page + 1) * PAGE))} of {nf.format(total)}
      </span>
      <div className="flex gap-1">
        <button aria-label="Previous page" disabled={page === 0} onClick={() => setPage(page - 1)} className="grid size-8 place-items-center rounded-[4px] border border-line hover:bg-wash disabled:opacity-40">
          <ChevronLeft className="size-4" />
        </button>
        <button aria-label="Next page" disabled={page >= pages - 1} onClick={() => setPage(page + 1)} className="grid size-8 place-items-center rounded-[4px] border border-line hover:bg-wash disabled:opacity-40">
          <ChevronRight className="size-4" />
        </button>
      </div>
    </div>
  );
}

function ActiveTable({ rows, f, update, page, search }: { rows: Row[]; f: Filters; update: Update; page: number; search: string }) {
  const navigate = useNavigate();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [stopping, setStopping] = useState<Array<{ id: string; name: string }>>([]);
  const [confirmReview, setConfirmReview] = useState(false);
  const [rowReview, setRowReview] = useState<{ ids: string[]; name: string } | null>(null);
  const { q, jur, sev, cat, unrev: onlyUnreviewed, sort } = f;
  const { setQueue, severity } = useStore();
  const setPage = (n: number) => update({ page: n ? String(n) : null });
  const setSort = (v: "severity" | "date") => update({ sort: v === "severity" ? null : v });

  const filtered = useMemo(() => applyFilters(rows, f), [rows, q, jur, sev, cat, onlyUnreviewed, sort]);
  // Opening a company from here remembers this list as the review queue.
  const remember = () => setQueue({ ids: filtered.map((r) => r.m.id), label: describeFilters(f), search });
  const open = (id: string) => {
    remember();
    navigate(`/pkyb/monitoring/${id}`);
  };
  const pageRows = filtered.slice(page * PAGE, (page + 1) * PAGE);
  const selectedUnreviewed = useMemo(
    () => rows.filter((r) => selected.has(r.m.id)).flatMap((r) => r.m.events.filter((e) => !e.reviewed).map((e) => e.id)),
    [rows, selected],
  );
  const selectedMix = useMemo(() => {
    const mix: Record<Severity, number> = { high: 0, medium: 0, low: 0 };
    for (const r of rows) if (selected.has(r.m.id)) for (const e of r.m.events) if (!e.reviewed) mix[worstSeverity(e.categories, severity)]++;
    return mix;
  }, [rows, selected, severity]);
  const allOnPage = pageRows.length > 0 && pageRows.every((r) => selected.has(r.m.id));
  const someOnPage = pageRows.some((r) => selected.has(r.m.id));
  const toggle = (id: string) =>
    setSelected((s) => {
      const n = new Set(s);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });
  const filtersOn = q || jur !== "all" || sev !== "all" || cat !== "all" || onlyUnreviewed;

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
        <label className="flex h-9 cursor-pointer items-center gap-2 rounded-[4px] border border-line-strong bg-white px-3 text-[13px] select-none max-sm:h-11">
          <input type="checkbox" checked={onlyUnreviewed} onChange={(e) => update({ unrev: e.target.checked ? "1" : null })} className="size-4 accent-brand-700" />
          Unreviewed only
        </label>
        {filtersOn && (
          <button
            onClick={() => update({ q: null, jur: null, sev: null, cat: null, unrev: null })}
            className="inline-flex h-9 items-center gap-1 px-1 text-[13px] font-semibold text-brand-700 hover:underline max-sm:h-11"
          >
            <X className="size-3.5" /> Clear filters
          </button>
        )}
      </FilterBar>

      <div className="rounded-[6px] border border-line bg-white">
        {selected.size > 0 && (
          <div className="sticky top-14 z-10 flex flex-wrap items-center gap-x-3 gap-y-2 rounded-t-[5px] border-b border-line bg-navy-900 px-4 py-2 text-[13px] text-white">
            <span className="font-semibold tnum">{nf.format(selected.size)} selected</span>
            {selectedMix.high > 0 && (
              <span className="inline-flex items-center gap-1.5 text-high-on-dark">
                <span className="size-1.5 rounded-full bg-high-cell" /> includes {nf.format(selectedMix.high)} High
              </span>
            )}
            {allOnPage && selected.size < filtered.length && (
              <button onClick={() => setSelected(new Set(filtered.map((r) => r.m.id)))} className="rounded-[4px] px-2 py-1 font-semibold text-brand-400 hover:bg-white/10">
                Select all {nf.format(filtered.length)} matching
              </button>
            )}
            <span className="ml-auto flex items-center gap-1">
              <button onClick={() => setSelected(new Set())} className="inline-flex h-8 items-center rounded-[4px] px-2 font-semibold text-white/85 hover:bg-white/10 hover:text-white max-sm:h-10">
                Clear selection
              </button>
              <button
                disabled={selectedUnreviewed.length === 0}
                onClick={() => setConfirmReview(true)}
                className="inline-flex h-8 items-center gap-1.5 rounded-[4px] bg-white px-3 font-semibold text-navy-900 hover:bg-brand-50 disabled:opacity-50 max-sm:h-10"
              >
                <Check className="size-4" />
                {selectedUnreviewed.length ? `Review ${nf.format(selectedUnreviewed.length)} changes…` : "Nothing to review"}
              </button>
              <Menu
                label="More bulk actions"
                trigger={<Ellipsis className="size-4" />}
                triggerClassName="grid size-8 place-items-center rounded-[4px] text-white/80 hover:bg-white/10 hover:text-white max-sm:size-10"
                items={[
                  { label: `Stop monitoring ${nf.format(selected.size)}`, danger: true, onSelect: () => setStopping(rows.filter((r) => selected.has(r.m.id)).map((r) => ({ id: r.m.id, name: r.m.name }))) },
                ]}
              />
            </span>
          </div>
        )}
        <ul className="divide-y divide-line md:hidden">
          {pageRows.map((r) => {
            const j = jurisdictionByCode[r.m.jurisdiction];
            const isSel = selected.has(r.m.id);
            return (
              <li key={r.m.id} className={cx("flex gap-3 px-4 py-3.5", isSel && "bg-row-selected")}>
                <button role="checkbox" aria-checked={isSel} aria-label={`Select ${r.m.name}`} onClick={() => toggle(r.m.id)} className="-mx-3 -my-2.5 grid size-11 shrink-0 place-items-center text-ink-3">
                  {isSel ? <SquareCheck className="size-4 text-brand-700" aria-hidden /> : <Square className="size-4" aria-hidden />}
                </button>
                <Link to={`/pkyb/monitoring/${r.m.id}`} onClick={remember} className="min-w-0 flex-1">
                  <span className="flex items-center gap-2">
                    {r.unreviewed > 0 && <span className="size-2 shrink-0 rounded-full bg-navy-900" aria-label={`${r.unreviewed} unreviewed changes`} />}
                    <span className={cx("truncate text-[14px] text-ink", r.unreviewed > 0 ? "font-semibold" : "font-medium")}>{r.m.name}</span>
                  </span>
                  <span className="mt-0.5 flex items-center gap-1.5 text-[12px] text-ink-3">
                    <Flag code={j.code} /> {j.name} · <span className="tnum">{r.latest ? `Detected ${formatDate(r.latest.date)}` : `Checked ${formatDate(r.m.lastChecked)}`}</span>
                  </span>
                  {r.latest && r.latestSev ? (
                    <span className="mt-2 flex flex-wrap items-center gap-1.5">
                      <EventSeverity event={r.latest} size="sm" />
                      {r.latest.categories.map((c) => (
                        <CategoryChip key={c} category={c} />
                      ))}
                    </span>
                  ) : (
                    <span className="mt-2 block text-[12px] text-ink-3">No changes since baseline</span>
                  )}
                </Link>
                <Menu
                  label={`More actions for ${r.m.name}`}
                  trigger={<Ellipsis className="size-4" />}
                  items={[
                    ...(r.unreviewed
                      ? [{ label: `Review ${r.unreviewed} ${r.unreviewed === 1 ? "change" : "changes"}…`, onSelect: () => setRowReview({ ids: r.m.events.filter((e) => !e.reviewed).map((e) => e.id), name: r.m.name }) }]
                      : []),
                    { label: "Stop monitoring", danger: true, onSelect: () => setStopping([{ id: r.m.id, name: r.m.name }]) },
                  ]}
                />
              </li>
            );
          })}
          {pageRows.length === 0 && (
            <li className="px-4 py-12 text-center">
              <p className="text-[14px] font-semibold">No monitors match these filters</p>
              <p className="mt-1 text-[13px] text-ink-2">Clear filters to see all {nf.format(rows.length)} active monitors.</p>
            </li>
          )}
        </ul>
        <div className="overflow-x-auto max-md:hidden">
          {/* The checkbox and Company columns stay pinned, so a row is still identifiable when the table scrolls sideways. */}
          <table className="w-full min-w-[820px] border-separate border-spacing-0 text-left text-[13px] [&_td]:border-b [&_td]:border-line [&_tr:last-child_td]:border-b-0">
            <thead className="text-[12px] text-ink-2">
              <tr className="[&>th]:border-b [&>th]:border-line">
                <th className="sticky left-0 z-[2] w-10 bg-white py-1.5 pl-3">
                  <button
                    role="checkbox"
                    aria-checked={allOnPage ? true : someOnPage ? "mixed" : false}
                    aria-label="Select all companies on this page"
                    onClick={() =>
                      setSelected((s) => {
                        const n = new Set(s);
                        pageRows.forEach((r) => (allOnPage ? n.delete(r.m.id) : n.add(r.m.id)));
                        return n;
                      })
                    }
                    className="grid size-6 place-items-center text-ink-3 hover:text-ink"
                  >
                    {allOnPage ? <SquareCheck className="size-4 text-brand-700" aria-hidden /> : someOnPage ? <SquareMinus className="size-4 text-brand-700" aria-hidden /> : <Square className="size-4" aria-hidden />}
                  </button>
                </th>
                <th className="sticky left-10 z-[2] bg-white px-3 py-2.5 font-semibold shadow-[inset_-1px_0_0_var(--color-line)]">Company</th>
                <th className="px-3 py-2.5 font-semibold">Jurisdiction</th>
                <th className="px-3 py-1.5 font-semibold" aria-sort={sort === "severity" ? "descending" : "none"}>
                  <button onClick={() => setSort("severity")} title="Sort by severity, most severe first" className={cx("inline-flex h-6 items-center gap-1", sort === "severity" && "text-ink")}>
                    Change <span className="sr-only">, sorted by severity</span> {sort === "severity" ? <ArrowDown className="size-3.5" aria-hidden /> : <ArrowUpDown className="size-3.5 text-ink-3" aria-hidden />}
                  </button>
                </th>
                <th className="px-3 py-1.5 font-semibold" aria-sort={sort === "date" ? "descending" : "none"}>
                  <button onClick={() => setSort("date")} title="Sort by date detected, newest first" className={cx("inline-flex h-6 items-center gap-1", sort === "date" && "text-ink")}>
                    Detected {sort === "date" ? <ArrowDown className="size-3.5" aria-hidden /> : <ArrowUpDown className="size-3.5 text-ink-3" aria-hidden />}
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
                const fill = isSel ? "bg-row-selected" : "bg-white group-hover:bg-canvas";
                return (
                  <tr key={r.m.id} onClick={() => open(r.m.id)} className="group cursor-pointer align-top [&>td]:transition-colors">
                    <td className={cx("sticky left-0 z-[1] py-3 pl-3", fill)} onClick={(e) => e.stopPropagation()}>
                      <button role="checkbox" aria-checked={isSel} aria-label={`Select ${r.m.name}`} onClick={() => toggle(r.m.id)} className="grid size-6 place-items-center text-ink-3 hover:text-ink">
                        {isSel ? <SquareCheck className="size-4 text-brand-700" aria-hidden /> : <Square className="size-4" aria-hidden />}
                      </button>
                    </td>
                    <td className={cx("sticky left-10 z-[1] max-w-[300px] min-w-[220px] px-3 py-3 shadow-[inset_-1px_0_0_var(--color-line)]", fill)}>
                      <span className="flex items-center gap-2">
                        {r.unreviewed > 0 && <span className="size-2 shrink-0 rounded-full bg-navy-900" title={`${r.unreviewed} unreviewed`} aria-label={`${r.unreviewed} unreviewed changes`} />}
                        <span className={cx("truncate text-[14px] text-ink", r.unreviewed > 0 ? "font-semibold" : "font-medium")}>{r.m.name}</span>
                      </span>
                      <span className={cx("block text-[12px] text-ink-3 tnum", r.unreviewed > 0 && "pl-4")}>
                        {r.m.regNo} · Checked {formatDate(r.m.lastChecked)}
                      </span>
                    </td>
                    <td className={cx("px-3 py-3.5 whitespace-nowrap", fill)}>
                      <span className="flex items-center gap-2 text-ink-2">
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
                        </span>
                      ) : (
                        <span className="text-ink-3">No changes since baseline</span>
                      )}
                    </td>
                    <td className={cx("px-3 py-3.5 whitespace-nowrap text-ink-2 tnum", fill)}>{r.latest ? formatDate(r.latest.date) : "—"}</td>
                    <td className={cx("py-2.5 pr-3", fill)} onClick={(e) => e.stopPropagation()}>
                      <span className="flex items-center justify-end gap-1">
                        <Link to={`/pkyb/monitoring/${r.m.id}`} onClick={remember} className="inline-flex h-8 items-center px-2 text-[13px] font-semibold text-brand-700 hover:underline">
                          {r.unreviewed > 0 ? "Review" : "View"}
                        </Link>
                        <Menu
                          label={`More actions for ${r.m.name}`}
                          trigger={<Ellipsis className="size-4" />}
                          items={[
                            ...(r.unreviewed
                              ? [{ label: `Review ${r.unreviewed} ${r.unreviewed === 1 ? "change" : "changes"}…`, onSelect: () => setRowReview({ ids: r.m.events.filter((e) => !e.reviewed).map((e) => e.id), name: r.m.name }) }]
                              : []),
                            { label: "Stop monitoring", danger: true, onSelect: () => setStopping([{ id: r.m.id, name: r.m.name }]) },
                          ]}
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
                    <p className="mt-1 text-[13px] text-ink-2">Try another jurisdiction or severity, or clear filters to see all {nf.format(rows.length)} active monitors.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="border-t border-line">
          <Pager page={page} setPage={setPage} total={filtered.length} />
        </div>
      </div>
      <StopDialog targets={stopping} onClose={() => setStopping([])} onDone={() => setSelected(new Set())} />
      <ReviewDialog
        eventIds={confirmReview ? selectedUnreviewed : []}
        title={`Review ${nf.format(selectedUnreviewed.length)} ${selectedUnreviewed.length === 1 ? "change" : "changes"}`}
        onClose={() => setConfirmReview(false)}
        onDone={() => setSelected(new Set())}
      >
        <p>
          Across {nf.format(selected.size)} {selected.size === 1 ? "company" : "companies"}.
          {selectedMix.high > 0 && (
            <>
              {" "}
              <span className="font-semibold text-high">
                {nf.format(selectedMix.high)} {selectedMix.high === 1 ? "is" : "are"} High severity
              </span>
              , so review {selectedMix.high === 1 ? "it" : "them"} one by one unless a single decision fits all of them.
            </>
          )}
        </p>
        <div className="flex flex-wrap gap-3">
          {(["high", "medium", "low"] as Severity[]).map((lv) =>
            selectedMix[lv] ? (
              <span key={lv} className="inline-flex items-center gap-1.5 text-[13px]">
                <SeverityPill level={lv} size="sm" /> <span className="tnum">{nf.format(selectedMix[lv])}</span>
              </span>
            ) : null,
          )}
        </div>
      </ReviewDialog>
      <ReviewDialog
        eventIds={rowReview?.ids ?? []}
        title={`Review ${rowReview?.ids.length === 1 ? "change" : `${nf.format(rowReview?.ids.length ?? 0)} changes`} for ${rowReview?.name ?? ""}`}
        body={rowReview?.name}
        onClose={() => setRowReview(null)}
      />
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
  includeReviewed,
  setIncludeReviewed,
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
  includeReviewed: boolean;
  setIncludeReviewed: (v: boolean) => void;
  /** Only unreviewed changes at the severities the analyst gets in-app alerts for: exactly what the bell counts. */
  alertsOnly: boolean;
  clearAlerts: () => void;
  search: string;
}) {
  const { severity, prefs } = useStore();
  const [page, setPage] = useState(0);
  // The feed opens on the work still to do. Reviewed changes are one toggle away.
  const showReviewed = includeReviewed && !alertsOnly;
  const events = useMemo(() => {
    const out: Array<{ e: ChangeEvent; m: Monitor; s: Severity }> = [];
    for (const r of rows)
      for (const e of r.m.events) {
        if (!showReviewed && e.reviewed) continue;
        if (day && e.date !== day) continue;
        if (jur !== "all" && r.m.jurisdiction !== jur) continue;
        if (cat !== "all" && !e.categories.includes(cat as never)) continue;
        const s = worstSeverity(e.categories, severity);
        if (alertsOnly && !prefs.inApp[s]) continue;
        if (sev !== "all" && s !== sev) continue;
        out.push({ e, m: r.m, s });
      }
    return out.sort((a, b) => (a.e.date === b.e.date ? SEVERITY_RANK[b.s] - SEVERITY_RANK[a.s] : a.e.date < b.e.date ? 1 : -1));
  }, [rows, day, jur, sev, cat, severity, showReviewed, alertsOnly, prefs]);
  useEffect(() => setPage(0), [day, jur, sev, cat, showReviewed, alertsOnly]);
  const { setQueue } = useStore();
  const [reviewAll, setReviewAll] = useState(false);
  const rememberFeed = () =>
    setQueue({ ids: [...new Set(events.map((x) => x.m.id))], label: day ? `Change feed · ${formatDate(day)}` : "Change feed", search });
  const unreviewedHere = useMemo(() => events.filter((x) => !x.e.reviewed).map((x) => x.e.id), [events]);
  const slice = events.slice(page * PAGE, (page + 1) * PAGE);
  const exportFeed = () =>
    downloadCsv(
      `pkyb-change-feed-${iso(TODAY)}.csv`,
      ["Detected", "Company", "Registration no.", "Jurisdiction", "Categories", "Severity now", "Severity when detected", "Fields changed", "Review", "Reviewed by", "Reviewed on", "Note"],
      events.map(({ e, m, s }) => [
        e.date,
        m.name,
        m.regNo,
        jurisdictionByCode[m.jurisdiction].name,
        e.categories.map((c) => CATEGORY_LABEL[c]).join("; "),
        SEVERITY_LABEL[s],
        SEVERITY_LABEL[e.detectedSeverity],
        fieldChanges(e, m).map((fc) => `${fc.field}: ${fc.before} → ${fc.after}`).join("; "),
        e.reviewed ? (e.decision ? DECISION_LABEL[e.decision] : "Reviewed") : "Unreviewed",
        e.reviewedBy ?? "",
        e.reviewedAt ?? "",
        e.note ?? "",
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
        <label className={cx("flex h-9 items-center gap-2 rounded-[4px] border border-line-strong bg-white px-3 text-[13px] select-none max-sm:h-11", alertsOnly ? "cursor-not-allowed opacity-50" : "cursor-pointer")}>
          <input type="checkbox" checked={showReviewed} disabled={alertsOnly} onChange={(e) => setIncludeReviewed(e.target.checked)} className="size-4 accent-brand-700" />
          Include reviewed
        </label>
        {alertsOnly && (
          <span className="inline-flex h-9 items-center gap-2 rounded-full border border-brand-300 bg-brand-50 pr-1.5 pl-3 text-[13px] font-semibold text-brand-800">
            Your in-app alerts
            <button aria-label="Show all unreviewed changes" onClick={clearAlerts} className="grid size-6 place-items-center rounded-full hover:bg-brand-100">
              <X className="size-3.5" />
            </button>
          </span>
        )}
        {day && (
          <span className="inline-flex h-9 items-center gap-2 rounded-full border border-brand-300 bg-brand-50 pr-1.5 pl-3 text-[13px] font-semibold text-brand-800">
            {formatDateLong(day)}
            <button aria-label="Clear day" onClick={() => setDay(null)} className="grid size-6 place-items-center rounded-full hover:bg-brand-100">
              <X className="size-3.5" />
            </button>
          </span>
        )}
      </FilterBar>
      <div className="rounded-[6px] border border-line bg-white">
        {/* Acting on the whole result sits with the result, not among the filters. */}
        {events.length > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 rounded-t-[6px] border-b border-line px-4 py-2.5">
            <p className="text-[13px] text-ink-2">
              <span className="font-semibold text-ink tnum">{nf.format(events.length)}</span> {events.length === 1 ? "change" : "changes"}
              {unreviewedHere.length !== events.length && <span className="tnum"> · {nf.format(unreviewedHere.length)} unreviewed</span>}
            </p>
            {unreviewedHere.length > 1 && (day || jur !== "all" || sev !== "all" || cat !== "all" || alertsOnly) && (
              <Button variant="secondary" size="sm" onClick={() => setReviewAll(true)}>
                <Check className="size-3.5" /> Review all {nf.format(unreviewedHere.length)}…
              </Button>
            )}
          </div>
        )}
        {groups.map(([date, items]) => (
          <section key={date} aria-label={formatDateLong(date)}>
            <h2 className="sticky top-14 z-[1] border-b border-line bg-canvas px-4 py-2 text-[12px] font-semibold text-ink-2">{formatDateLong(date)}</h2>
            <ul className="divide-y divide-line">
              {items.map(({ e, m }) => (
                <li key={e.id} className="relative grid gap-2 px-4 py-3 hover:bg-canvas sm:grid-cols-[104px_minmax(0,1fr)_auto] sm:items-center sm:gap-4">
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
                          className={cx("truncate text-[14px] hover:underline after:absolute after:inset-0", e.reviewed ? "font-medium text-ink-2" : "font-semibold text-ink")}
                        >
                          {m.name}
                        </Link>
                      </span>
                      <span className="mt-1.5 flex flex-wrap gap-1.5">
                        {e.categories.map((c) => (
                          <CategoryChip key={c} category={c} />
                        ))}
                      </span>
                    </span>
                    {e.reviewed ? (
                      <span className="relative z-[1]">
                        <ReviewStatus event={e} />
                      </span>
                    ) : (
                      <ReviewMenu event={e} name={m.name} />
                    )}
                </li>
              ))}
            </ul>
          </section>
        ))}
        {events.length === 0 && (
          <div className="px-4 py-14 text-center">
            <p className="text-[14px] font-semibold">{showReviewed || day || jur !== "all" || sev !== "all" || cat !== "all" || alertsOnly ? "No changes match" : "No unreviewed changes"}</p>
            <p className="mt-1 text-[13px] text-ink-2">
              {day
                ? "Nothing was detected on this day for these filters."
                : showReviewed || jur !== "all" || sev !== "all" || cat !== "all" || alertsOnly
                  ? "Adjust the filters to see more of the feed."
                  : "Everything detected so far has been reviewed. Include reviewed to see the full history."}
            </p>
          </div>
        )}
        <div className="flex flex-wrap items-center justify-between border-t border-line">
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
      <ReviewDialog
        eventIds={reviewAll ? unreviewedHere : []}
        title={`Review ${nf.format(unreviewedHere.length)} changes`}
        onClose={() => setReviewAll(false)}
      >
        <p>Every unreviewed change matching these filters, across {nf.format(new Set(events.filter((x) => !x.e.reviewed).map((x) => x.m.id)).size)} companies.</p>
      </ReviewDialog>
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
              status === s ? "border-navy-800 bg-navy-800 font-semibold text-white" : "border-line-strong bg-white text-ink-2 hover:border-ink-3",
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
              <dt className="font-semibold text-ink">{STATUS_COPY[s].label}</dt>
              <dd className="text-ink-2">{STATUS_COPY[s].explain}</dd>
            </div>
          ))}
        </dl>
      ) : (
        <p className="mt-3 max-w-[70ch] text-[13px] text-ink-2">
          <span className="font-semibold text-ink">{STATUS_COPY[status].label}:</span> {STATUS_COPY[status].explain}
        </p>
      )}
      <FilterBar q={q} setQ={setQ} jur={jur} setJur={setJur}>
        <Button variant="secondary" className="ml-auto" onClick={exportCsv}>
          <Download className="size-4" /> Export CSV
        </Button>
      </FilterBar>
      <div className="overflow-hidden rounded-[6px] border border-line bg-white">
        {/* Below md the same rows render as a stacked list (the Stacked Rows Rule). */}
        <ul className="divide-y divide-line md:hidden">
          {pageList.map((m) => (
            <li key={m.id} className="px-4 py-3.5">
              <Link to={`/pkyb/monitoring/${m.id}`} className="block truncate text-[14px] font-medium text-ink hover:underline">
                {m.name}
              </Link>
              <span className="mt-0.5 flex items-center gap-1.5 text-[12px] text-ink-3">
                <Flag code={m.jurisdiction} /> {jurisdictionByCode[m.jurisdiction].name} · <span className="tnum">{m.regNo}</span>
              </span>
              <span className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] text-ink-2">
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
              <p className="mt-1 text-[13px] text-ink-2">Try another status or jurisdiction, or clear the search.</p>
            </li>
          )}
        </ul>
        <div className="overflow-x-auto max-md:hidden">
          <table className="w-full min-w-[940px] text-left text-[13px]">
            <thead className="border-b border-line text-[12px] text-ink-2">
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
            <tbody className="divide-y divide-line">
              {pageList.map((m) => (
                <tr key={m.id} className="hover:bg-canvas">
                  <td className="px-4 py-3">
                    <Link to={`/pkyb/monitoring/${m.id}`} className="block font-medium text-ink hover:text-brand-700 hover:underline">
                      {m.name}
                    </Link>
                    <span className="text-[12px] text-ink-3 tnum">{m.regNo}</span>
                  </td>
                  <td className="px-3 py-3 whitespace-nowrap">
                    <span className="flex items-center gap-2 text-ink-2">
                      <Flag code={m.jurisdiction} /> {jurisdictionByCode[m.jurisdiction].name}
                    </span>
                  </td>
                  <td className="px-3 py-3">
                    <StatusBadge status={m.status} />
                  </td>
                  <td className="px-3 py-3 whitespace-nowrap text-ink-2 tnum">{formatDate(m.createdAt)}</td>
                  <td className="px-3 py-3 whitespace-nowrap text-ink-2 tnum">{m.endedAt ? formatDate(m.endedAt) : <span className="text-ink-3">Runs until stopped</span>}</td>
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
                    <p className="mt-1 text-[13px] text-ink-2">Try another status or jurisdiction, or clear the search.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="border-t border-line">
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
        status === "active" && "border-brand-300 bg-brand-50 text-brand-800",
        status === "stopped" && "border-line-strong bg-wash text-ink-2",
        // Amber is Medium severity and nothing else. Inactive reads as "never ran": neutral, with a hollow dot.
        status === "inactive" && "border-line-strong bg-white text-ink-2",
      )}
    >
      <span
        aria-hidden
        className={cx("size-1.5 rounded-full", status === "active" ? "bg-brand-600" : status === "stopped" ? "bg-ink-3" : "border border-ink-3 bg-transparent")}
      />
      {STATUS_COPY[status].label}
    </span>
  );
}
