import { useEffect, useMemo, useRef, useState } from "react";
import { TODAY, addDays, iso, type Monitor } from "../data/model";
import { cx, formatDate, nf } from "./ui";

/** Monday of the week containing d. */
const weekStart = (d: Date) => addDays(d, -((d.getDay() + 6) % 7));

type Week = { start: string; added: number };

/** Changes detected per week across the portfolio, so a busy week stands out against the usual volume. */
export function QueueTrend({ monitors, weeks = 12 }: { monitors: Monitor[]; weeks?: number }) {
  const data = useMemo<Week[]>(() => {
    const first = weekStart(addDays(TODAY, -(weeks - 1) * 7));
    const out: Week[] = Array.from({ length: weeks }, (_, i) => ({ start: iso(addDays(first, i * 7)), added: 0 }));
    const at = (date: string) => Math.floor((new Date(`${date}T12:00:00`).getTime() - first.getTime()) / (7 * 86400000));
    for (const m of monitors)
      for (const e of m.events) {
        const a = at(e.date);
        if (a >= 0 && a < weeks) out[a].added++;
      }
    return out;
  }, [monitors, weeks]);

  const [hover, setHover] = useState<number | null>(null);
  // Drawn at the container's real pixel width, so axis text stays 11px on a phone instead of scaling down with the SVG.
  const box = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(560);
  useEffect(() => {
    const el = box.current;
    if (!el) return;
    // Measure once now, so the first paint is right even before the observer reports.
    if (el.clientWidth) setWidth(Math.max(260, el.clientWidth));
    const ro = new ResizeObserver(([entry]) => setWidth(Math.max(260, Math.round(entry.contentRect.width))));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const max = Math.max(1, ...data.map((w) => w.added));
  const step = max <= 5 ? 1 : max <= 20 ? 5 : max <= 50 ? 10 : max <= 100 ? 25 : 50;
  const top = Math.ceil(max / step) * step;
  const ticks = Array.from({ length: Math.floor(top / step) + 1 }, (_, i) => i * step).filter((t, i, a) => a.length <= 5 || i % 2 === 0 || t === top);

  // Geometry in viewBox units; the SVG scales to its container width.
  const W = width;
  const H = 168;
  const left = 32;
  const bottom = 22;
  const plotH = H - bottom - 8;
  const slot = (W - left) / weeks;
  const bar = Math.min(20, slot - 10);
  const y = (v: number) => 8 + plotH - (v / top) * plotH;
  const last = data[data.length - 1];
  const prev = data[data.length - 2];
  const shown = hover ?? data.length - 1;

  // A column with a 4px rounded data-end and a square base.
  const column = (x: number, v: number) => {
    if (v === 0) return null;
    const h = Math.max(2, (v / top) * plotH);
    const r = Math.min(4, h / 2, bar / 2);
    const yt = 8 + plotH - h;
    return `M${x},${8 + plotH} V${yt + r} Q${x},${yt} ${x + r},${yt} H${x + bar - r} Q${x + bar},${yt} ${x + bar},${yt + r} V${8 + plotH} Z`;
  };

  return (
    <figure className="m-0">
      <figcaption className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <span className="text-[13px] font-semibold text-content-main">Changes detected per week</span>
      </figcaption>

      <p className="mt-1 text-[13px] text-content-main tnum">
        This week so far:{" "}
        <span className="font-semibold text-content-primary">{nf.format(last.added)} new</span>
        {prev && <span className="text-content-tertiary"> · last week {nf.format(prev.added)}</span>}
      </p>

      <div ref={box} className="relative mt-3">
        <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} className="block max-w-full overflow-visible" role="img" aria-label={`Changes detected per week for the last ${weeks} weeks. Table follows.`} onMouseLeave={() => setHover(null)}>
          {ticks.map((t) => (
            <g key={t}>
              <line x1={left} x2={W} y1={y(t)} y2={y(t)} className="stroke-border-subtle" strokeWidth={1} />
              <text x={left - 6} y={y(t) + 3.5} textAnchor="end" className="fill-content-tertiary" fontSize={11}>
                {nf.format(t)}
              </text>
            </g>
          ))}
          {data.map((w, i) => {
            const x0 = left + i * slot + (slot - bar) / 2;
            // As many week labels as fit at ~64px apart, always including the current week.
            const every = Math.max(1, Math.ceil(weeks / Math.max(2, Math.floor((W - left) / 64))));
            const showLabel = i === data.length - 1 || (i % every === 0 && data.length - 1 - i >= every / 2);
            return (
              <g key={w.start} onMouseEnter={() => setHover(i)}>
                <rect x={left + i * slot} y={0} width={slot} height={H - bottom} fill="transparent" />
                {hover === i && <rect x={left + i * slot + 2} y={4} width={slot - 4} height={plotH + 6} rx={4} className="fill-background-subtle" />}
                <path d={column(x0, w.added) ?? ""} className="fill-chart-new" />
                {showLabel && (
                  <text x={left + i * slot + slot / 2} y={H - 6} textAnchor="middle" className="fill-content-tertiary" fontSize={11}>
                    {formatDate(w.start).replace(/ \d{4}$/, "")}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
        {/* The readout sits under the chart rather than floating over it, so it never covers a bar and works without hover. */}
        <p className={cx("mt-1 text-[12px] text-content-main tnum", hover === null && "text-content-tertiary")} aria-hidden>
          Week of {formatDate(data[shown].start)}: {nf.format(data[shown].added)} new
        </p>
      </div>

      <table className="sr-only">
        <caption>Changes detected per week</caption>
        <thead>
          <tr>
            <th scope="col">Week of</th>
            <th scope="col">Changes</th>
          </tr>
        </thead>
        <tbody>
          {data.map((w) => (
            <tr key={w.start}>
              <th scope="row">{formatDate(w.start)}</th>
              <td>{w.added}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
}
