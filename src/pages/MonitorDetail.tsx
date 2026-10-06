import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, Check, ChevronLeft, ChevronRight, Download, Ellipsis, FileCheck2, LoaderCircle, Radar, SlidersHorizontal, X } from "lucide-react";
import { CATEGORY_LABEL, CATEGORY_SECTION, SEVERITY_RANK, TODAY, addDays, iso, jurisdictionByCode, worstSeverity, type Severity } from "../data/model";
import { useStore } from "../state/store";
import { Heatmap } from "../components/Heatmap";
import { StopDialog } from "../components/StopDialog";
import { StatusBadge } from "./Monitoring";
import { Button, CategoryChip, Flag, Menu, SEV_STYLE, SeverityPill, cx, formatDate, formatDateLong, nf } from "../components/ui";

const CELL: Record<Severity | "none", string> = {
  none: "var(--color-wash)",
  low: "var(--color-low-cell)",
  medium: "var(--color-medium-cell)",
  high: "var(--color-high-cell)",
};
const LOG_PAGE = 12;

export function MonitorDetail() {
  const { id } = useParams();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { monitors, severity, reviewWithUndo, toast, reports, requestReport, queue } = useStore();
  const m = monitors.find((x) => x.id === id);
  const [stopping, setStopping] = useState(false);
  const [day, setDay] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const isNew = params.get("new") === "1";
  const [baselineReady, setBaselineReady] = useState(!isNew);

  useEffect(() => {
    if (baselineReady) return;
    const t = window.setTimeout(() => setBaselineReady(true), 3500);
    return () => window.clearTimeout(t);
  }, [baselineReady]);
  useEffect(() => setPage(0), [day]);

  const yearAgo = iso(addDays(TODAY, -365));
  const stats = useMemo(() => {
    const byDay = new Map<string, { sev: Severity; n: number }>();
    const counts: Record<Severity, number> = { high: 0, medium: 0, low: 0 };
    for (const e of m?.events ?? []) {
      const s = worstSeverity(e.categories, severity);
      if (e.date >= yearAgo) counts[s]++;
      const cur = byDay.get(e.date);
      if (!cur) byDay.set(e.date, { sev: s, n: 1 });
      else byDay.set(e.date, { sev: SEVERITY_RANK[s] > SEVERITY_RANK[cur.sev] ? s : cur.sev, n: cur.n + 1 });
    }
    return { byDay, counts };
  }, [m, severity, yearAgo]);

  if (!m) {
    return (
      <div className="mx-auto max-w-[720px] px-4 py-20 text-center">
        <p className="text-[16px] font-semibold">This monitor doesn't exist</p>
        <Link to="/pkyb/monitoring" className="mt-2 inline-block text-brand-700 hover:underline">
          Back to Monitoring
        </Link>
      </div>
    );
  }

  const j = jurisdictionByCode[m.jurisdiction];
  // Review queue: the list this company was opened from. "Next" skips companies already fully reviewed.
  const pos = queue ? queue.ids.indexOf(m.id) : -1;
  const inQueue = pos >= 0;
  const hasUnreviewed = (id: string) => monitors.find((x) => x.id === id)?.events.some((e) => !e.reviewed);
  const nextId = inQueue ? queue!.ids.slice(pos + 1).find(hasUnreviewed) ?? queue!.ids[pos + 1] : undefined;
  const prevId = inQueue && pos > 0 ? queue!.ids[pos - 1] : undefined;
  const nextUnreviewed = inQueue ? queue!.ids.slice(pos + 1).find(hasUnreviewed) : undefined;
  const nextName = nextUnreviewed && monitors.find((x) => x.id === nextUnreviewed)?.name;
  const backTo = inQueue && queue!.search ? `/pkyb/monitoring?${queue!.search}` : "/pkyb/monitoring";
  const unreviewed = m.events.filter((e) => !e.reviewed);
  const lead = unreviewed.length
    ? [...unreviewed].sort((a, b) => SEVERITY_RANK[worstSeverity(b.categories, severity)] - SEVERITY_RANK[worstSeverity(a.categories, severity)] || (a.date < b.date ? 1 : -1))[0]
    : null;
  const leadSev = lead ? worstSeverity(lead.categories, severity) : null;
  const log = day ? m.events.filter((e) => e.date === day) : m.events;
  const pages = Math.max(1, Math.ceil(log.length / LOG_PAGE));
  const reportState = reports[m.id];
  const freshReport = (variant: "primary" | "secondary") =>
    reportState === "generating" ? (
      <Button variant={variant} disabled aria-live="polite">
        <LoaderCircle className="size-4 animate-spin" /> Generating fresh report…
      </Button>
    ) : reportState === "ready" ? (
      <Button variant={variant} onClick={() => toast({ title: "Downloading KYB Basic report", body: `${m.name}, generated ${formatDate(iso(TODAY))}.` })}>
        <Download className="size-4" /> Download fresh report
      </Button>
    ) : (
      <Button variant={variant} onClick={() => requestReport(m.id)}>
        <FileCheck2 className="size-4" /> Get fresh KYB Basic report
      </Button>
    );
  const downloadBaseline = () => toast({ title: "Downloading baseline report", body: `KYB Basic for ${m.name}, generated ${formatDate(m.createdAt)}.` });

  return (
    <div className="mx-auto max-w-[1360px] px-4 pt-5 pb-16 lg:px-8">
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
        <Link to={backTo} className="inline-flex h-8 items-center gap-1.5 text-[13px] font-semibold text-brand-700 hover:underline">
          <ArrowLeft className="size-4" /> Back to {inQueue ? queue!.label : "Monitoring"}
        </Link>
        {inQueue && (
          <nav aria-label="Review queue" className="flex items-center gap-1 text-[13px] text-ink-2">
            <span className="mr-1 tnum">
              {nf.format(pos + 1)} of {nf.format(queue!.ids.length)}
            </span>
            <Link
              to={prevId ? `/pkyb/monitoring/${prevId}` : "#"}
              aria-disabled={!prevId}
              aria-label="Previous company in queue"
              className={cx("grid size-8 place-items-center rounded-[4px] border border-line", prevId ? "hover:bg-wash" : "pointer-events-none opacity-40")}
            >
              <ChevronLeft className="size-4" />
            </Link>
            <Link
              to={nextId ? `/pkyb/monitoring/${nextId}` : "#"}
              aria-disabled={!nextId}
              aria-label="Next company in queue"
              className={cx("grid size-8 place-items-center rounded-[4px] border border-line", nextId ? "hover:bg-wash" : "pointer-events-none opacity-40")}
            >
              <ChevronRight className="size-4" />
            </Link>
          </nav>
        )}
      </div>

      <header className="mt-4 flex flex-wrap items-start justify-between gap-x-6 gap-y-4">
        <div className="min-w-0">
          <div className="flex items-center gap-3">
            <h1 className="text-[26px] leading-tight font-semibold tracking-[-0.015em]">{m.name}</h1>
            <Flag code={m.jurisdiction} className="h-4 w-6 shrink-0" />
          </div>
          {m.localName && <p className="text-[16px] text-ink-2">{m.localName}</p>}
          <p className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] text-ink-2">
            <StatusBadge status={m.status} />
            <span>
              {j.regLabel} <span className="tnum">{m.regNo}</span> · {j.name}
            </span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          {!lead && m.events.length > 0 && freshReport("secondary")}
          {m.status === "active" && (
            <Menu
              label="More monitor actions"
              trigger={<Ellipsis className="size-5" />}
              items={[
                { label: "Severity settings", icon: SlidersHorizontal, onSelect: () => navigate("/pkyb/settings") },
                { label: "Stop monitoring", icon: X, danger: true, onSelect: () => setStopping(true) },
              ]}
            />
          )}
        </div>
      </header>

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div className="flex min-w-0 flex-col gap-6">
          {/* Lead: what needs attention on this company right now. */}
          {m.events.length === 0 ? (
            <section className="rounded-[6px] border border-brand-300 bg-brand-50/60 p-5 lg:p-6">
              <div className="flex items-center gap-2 text-brand-800">
                <Radar className="size-5" />
                <h2 className="text-[18px] font-semibold">{m.status === "active" ? "Monitoring is running" : "No changes were recorded"}</h2>
              </div>
              <p className="mt-2 max-w-[62ch] text-[14px] text-ink-2">
                No changes since the baseline. Checks run automatically, and you'll be alerted in-app and by email based on your{" "}
                <Link to="/pkyb/settings" className="font-semibold text-brand-700 hover:underline">
                  severity settings
                </Link>
                .
              </p>
            </section>
          ) : lead && leadSev ? (
            <section aria-labelledby="lead-h" className={cx("rounded-[6px] border bg-white p-5 lg:p-6", SEV_STYLE[leadSev].line)}>
              <div className="flex flex-wrap items-center gap-3">
                <SeverityPill level={leadSev} />
                <span className="text-[13px] text-ink-2">
                  Detected {formatDate(lead.date)}
                  {unreviewed.length > 1 && ` · ${unreviewed.length - 1} more unreviewed`}
                </span>
              </div>
              <h2 id="lead-h" className="mt-3 text-[18px] leading-snug font-semibold tracking-[-0.01em]">
                {lead.categories.map((c) => CATEGORY_LABEL[c]).join(" and ")} changed since your baseline
              </h2>
              <p className="mt-1 text-[13px] text-ink-2">
                Registry record on {formatDate(lead.date)} compared with your KYB Basic baseline from {formatDate(m.createdAt)}.
              </p>

              <div className="mt-4 overflow-hidden rounded-[6px] border border-line">
                <p className="border-b border-line bg-canvas px-4 py-2 text-[12px] font-semibold text-ink-2">Where to check in the fresh report</p>
                <ul className="divide-y divide-line">
                  {lead.categories.map((c) => (
                    <li key={c} className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 px-4 py-2.5">
                      <CategoryChip category={c} />
                      <span className="text-[13px] text-ink-2">{CATEGORY_SECTION[c]}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <p className="mt-3 max-w-[64ch] text-[13px] text-ink-3">
                pKYB tells you which part of the record changed. The fresh report shows the current values to compare with your baseline.
              </p>

              <div className="mt-4 flex flex-wrap items-center gap-3">
                {freshReport("primary")}
                <Button variant="secondary" onClick={() => reviewWithUndo([lead.id])}>
                  <Check className="size-4" /> Mark as reviewed
                </Button>
                {reportState === "ready" && <span className="text-[12px] text-brand-700">Ready · generated {formatDate(iso(TODAY))}</span>}
              </div>
            </section>
          ) : (
            <section className="flex flex-wrap items-center gap-x-4 gap-y-3 rounded-[6px] border border-line bg-white px-5 py-4">
              <Check className="size-5 shrink-0 text-brand-700" />
              <p className="min-w-0 flex-1 text-[14px]">
                <span className="font-semibold">All changes reviewed.</span>{" "}
                {inQueue && !nextUnreviewed ? (
                  <span className="text-ink-2">That was the last company to review in {queue!.label}.</span>
                ) : (
                  <span className="text-ink-2">Latest detected {formatDate(m.events[0].date)}.</span>
                )}
              </p>
              {inQueue &&
                (nextUnreviewed ? (
                  <Button variant="primary" onClick={() => navigate(`/pkyb/monitoring/${nextUnreviewed}`)}>
                    Next: {nextName} <ArrowRight className="size-4" />
                  </Button>
                ) : (
                  <Button variant="secondary" onClick={() => navigate(backTo)}>
                    Back to {queue!.label}
                  </Button>
                ))}
            </section>
          )}

          <section aria-labelledby="heat-h" className="rounded-[6px] border border-line bg-white p-5">
            <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
              <h2 id="heat-h" className="text-[16px] font-semibold">
                Activity, last 365 days
              </h2>
              <span className="flex items-center gap-3 text-[11px] text-ink-3">
                {(["low", "medium", "high"] as Severity[]).map((s) => (
                  <span key={s} className="flex items-center gap-1">
                    <span className="size-2.5 rounded-[2px]" style={{ background: CELL[s] }} />
                    {s[0].toUpperCase() + s.slice(1)}
                  </span>
                ))}
              </span>
            </div>
            <Heatmap
              weeks={53}
              size={12}
              gap={3}
              ariaLabel={`Changes detected for ${m.name} over the last year, coloured by severity`}
              selected={day}
              onSelect={setDay}
              cell={(d) => {
                const c = stats.byDay.get(d);
                return {
                  fill: CELL[c?.sev ?? "none"],
                  label: c ? `${c.n} change${c.n > 1 ? "s" : ""} · ${c.sev[0].toUpperCase() + c.sev.slice(1)} · ${formatDate(d)}` : `No changes · ${formatDate(d)}`,
                  active: !!c,
                };
              }}
            />
            <p className="mt-2 text-[12px] text-ink-3">Each day takes the colour of its most severe change. Select a coloured day to filter the log.</p>
          </section>

          <section aria-labelledby="log-h" className="overflow-hidden rounded-[6px] border border-line bg-white">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-3.5">
              <h2 id="log-h" className="text-[16px] font-semibold">
                Change log <span className="font-normal text-ink-3 tnum">({nf.format(log.length)})</span>
              </h2>
              {day && (
                <span className="inline-flex h-7 items-center gap-1.5 rounded-full border border-brand-300 bg-brand-50 pr-1 pl-3 text-[12px] font-semibold text-brand-800">
                  {formatDateLong(day)}
                  <button aria-label="Show all dates" onClick={() => setDay(null)} className="grid size-5 place-items-center rounded-full hover:bg-brand-100">
                    <X className="size-3" />
                  </button>
                </span>
              )}
            </div>
            {log.length === 0 ? (
              <p className="px-5 py-10 text-center text-[13px] text-ink-2">Changes will be listed here as they are detected.</p>
            ) : (
              <>
              <ul className="divide-y divide-line md:hidden">
                {log.slice(page * LOG_PAGE, (page + 1) * LOG_PAGE).map((e) => (
                  <li key={e.id} className={cx("px-5 py-3.5", lead?.id === e.id && "bg-canvas")}>
                    <div className="flex items-center justify-between gap-3">
                      <span className="flex items-center gap-2">
                        <SeverityPill level={worstSeverity(e.categories, severity)} size="sm" />
                        <span className="text-[13px] tnum text-ink-2">{formatDate(e.date)}</span>
                      </span>
                      {e.reviewed ? (
                        <span className="text-[12px] text-ink-3">{e.reviewedBy ? `Reviewed by ${e.reviewedBy.toLowerCase() === "you" ? "you" : e.reviewedBy} · ${formatDate(e.reviewedAt!)}` : "Reviewed"}</span>
                      ) : (
                        <button onClick={() => reviewWithUndo([e.id])} className="h-8 text-[13px] font-semibold text-brand-700 hover:underline">
                          Mark reviewed
                        </button>
                      )}
                    </div>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {e.categories.map((c) => (
                        <CategoryChip key={c} category={c} />
                      ))}
                    </div>
                  </li>
                ))}
              </ul>
              <div className="overflow-x-auto max-md:hidden">
                <table className="w-full min-w-[620px] text-left text-[13px]">
                  <thead className="border-b border-line text-[12px] text-ink-2">
                    <tr>
                      <th className="px-5 py-2.5 font-semibold">Detected</th>
                      <th className="px-3 py-2.5 font-semibold">Severity</th>
                      <th className="px-3 py-2.5 font-semibold">Change category</th>
                      <th className="px-5 py-2.5 text-right font-semibold">Review</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    {log.slice(page * LOG_PAGE, (page + 1) * LOG_PAGE).map((e) => (
                      <tr key={e.id} className={cx(lead?.id === e.id && "bg-canvas")}>
                        <td className="px-5 py-3 whitespace-nowrap tnum">{formatDate(e.date)}</td>
                        <td className="px-3 py-3">
                          <SeverityPill level={worstSeverity(e.categories, severity)} size="sm" />
                        </td>
                        <td className="px-3 py-3">
                          <span className="flex flex-wrap gap-1.5">
                            {e.categories.map((c) => (
                              <CategoryChip key={c} category={c} />
                            ))}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-right whitespace-nowrap">
                          {e.reviewed ? (
                            <span className="text-[12px] text-ink-3">{e.reviewedBy ? `Reviewed by ${e.reviewedBy.toLowerCase() === "you" ? "you" : e.reviewedBy} · ${formatDate(e.reviewedAt!)}` : "Reviewed"}</span>
                          ) : (
                            <button onClick={() => reviewWithUndo([e.id])} className="text-[12px] font-semibold text-brand-700 hover:underline">
                              Mark reviewed
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              </>
            )}
            {pages > 1 && (
              <div className="flex items-center justify-end gap-3 border-t border-line px-5 py-3 text-[13px] text-ink-2">
                <span className="tnum">
                  Page {page + 1} of {pages}
                </span>
                <button aria-label="Previous page" disabled={page === 0} onClick={() => setPage(page - 1)} className="grid size-8 place-items-center rounded-[4px] border border-line hover:bg-wash disabled:opacity-40">
                  <ChevronLeft className="size-4" />
                </button>
                <button aria-label="Next page" disabled={page >= pages - 1} onClick={() => setPage(page + 1)} className="grid size-8 place-items-center rounded-[4px] border border-line hover:bg-wash disabled:opacity-40">
                  <ChevronRight className="size-4" />
                </button>
              </div>
            )}
          </section>
        </div>

        <aside className="flex flex-col gap-4 lg:sticky lg:top-[80px] lg:self-start">
          <section aria-labelledby="facts-h" className="rounded-[6px] border border-line bg-white">
            <h2 id="facts-h" className="border-b border-line px-5 py-3.5 text-[16px] font-semibold">
              Monitor
            </h2>
            <dl className="divide-y divide-line text-[13px]">
              <div className="flex justify-between gap-4 px-5 py-3">
                <dt className="text-ink-2">Monitoring since</dt>
                <dd className="font-medium tnum">{formatDate(m.createdAt)}</dd>
              </div>
              <div className="flex justify-between gap-4 px-5 py-3">
                <dt className="text-ink-2">{m.status === "active" ? "Last checked" : "Ended"}</dt>
                <dd className="font-medium tnum">{formatDate(m.status === "active" ? m.lastChecked : m.endedAt ?? m.lastChecked)}</dd>
              </div>
              <div className="flex justify-between gap-4 px-5 py-3">
                <dt className="text-ink-2">Duration</dt>
                <dd className="font-medium">{m.status === "active" ? "Until you stop it" : "Ended"}</dd>
              </div>
              <div className="flex justify-between gap-4 px-5 py-3">
                <dt className="text-ink-2">Cost</dt>
                <dd className="font-medium tnum">10 credits / year</dd>
              </div>
            </dl>
            <div className="border-t border-line px-5 py-4">
              <p className="text-[12px] font-semibold text-ink-2">Baseline report · attached</p>
              <div className="mt-2 flex items-center gap-3">
                {baselineReady ? <FileCheck2 className="size-5 shrink-0 text-brand-700" /> : <LoaderCircle className="size-5 shrink-0 animate-spin text-ink-3" />}
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] font-semibold">KYB Basic</p>
                  <p className="text-[12px] text-ink-3">{baselineReady ? `Generated ${formatDate(m.createdAt)}` : "Generating…"}</p>
                </div>
                {baselineReady && (
                  <button onClick={downloadBaseline} className="text-[13px] font-semibold text-brand-700 hover:underline">
                    Download
                  </button>
                )}
              </div>
            </div>
          </section>

          <section aria-labelledby="mix-h" className="rounded-[6px] border border-line bg-white p-5">
            <h2 id="mix-h" className="text-[16px] font-semibold">
              Last 365 days
            </h2>
            <ul className="mt-3 flex flex-col gap-2.5">
              {(["high", "medium", "low"] as Severity[]).map((s) => {
                const total = stats.counts.high + stats.counts.medium + stats.counts.low || 1;
                return (
                  <li key={s} className="grid grid-cols-[72px_minmax(0,1fr)_28px] items-center gap-3 text-[13px]">
                    <span className={cx("font-medium", SEV_STYLE[s].text)}>{s[0].toUpperCase() + s.slice(1)}</span>
                    <span className="h-2 overflow-hidden rounded-full bg-wash">
                      <span className="block h-full rounded-full" style={{ width: `${(stats.counts[s] / total) * 100}%`, background: CELL[s] }} />
                    </span>
                    <span className="text-right font-semibold tnum">{stats.counts[s]}</span>
                  </li>
                );
              })}
            </ul>
            <Link to="/pkyb/settings" className="mt-4 inline-flex items-center gap-1.5 text-[13px] font-semibold text-brand-700 hover:underline">
              <SlidersHorizontal className="size-3.5" /> Adjust severity mapping
            </Link>
          </section>
        </aside>
      </div>

      <StopDialog targets={stopping ? [{ id: m.id, name: m.name }] : []} onClose={() => setStopping(false)} />
    </div>
  );
}
