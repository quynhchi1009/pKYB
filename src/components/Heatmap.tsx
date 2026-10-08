import { useId, useLayoutEffect, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { TODAY, addDays, iso } from "../data/model";

export type HeatCell = { fill: string; label: string; active?: boolean };

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/**
 * Calendar grid, one cell per day, weeks as columns (Mon at top), ending today.
 * Colour is decided by the caller so the same grid serves company and portfolio views.
 *
 * Days with changes (`active`) are the interactive cells. They form one keyboard stop: Tab enters on the
 * selected or latest day, arrow keys step between days that have changes, Enter or Space selects.
 */
export function Heatmap({
  weeks,
  cell,
  size = 12,
  gap = 3,
  selected,
  onSelect,
  ariaLabel,
}: {
  weeks: number;
  cell: (date: string) => HeatCell;
  size?: number;
  gap?: number;
  selected?: string | null;
  onSelect?: (date: string | null) => void;
  ariaLabel: string;
}) {
  const wrap = useRef<HTMLDivElement>(null);
  const scroller = useRef<HTMLDivElement>(null);
  const cellRefs = useRef(new Map<string, SVGRectElement>());
  const descId = useId();
  // Open on the most recent weeks when the grid is wider than its card.
  useLayoutEffect(() => {
    const el = scroller.current;
    if (el) el.scrollLeft = el.scrollWidth;
  }, [weeks]);
  const [hover, setHover] = useState<{ x: number; y: number; label: string } | null>(null);
  const [focusDate, setFocusDate] = useState<string | null>(null);
  const [ringDate, setRingDate] = useState<string | null>(null);

  const { columns, monthMarks } = useMemo(() => {
    const dow = (TODAY.getDay() + 6) % 7; // Monday = 0
    const start = addDays(TODAY, -(weeks - 1) * 7 - dow);
    const cols: string[][] = [];
    const marks: Array<{ col: number; label: string }> = [];
    let lastMonth = -1;
    for (let w = 0; w < weeks; w++) {
      const col: string[] = [];
      for (let d = 0; d < 7; d++) {
        const date = addDays(start, w * 7 + d);
        if (date > TODAY) break;
        col.push(iso(date));
        if (d === 0 && date.getMonth() !== lastMonth) {
          if (w < weeks - 2) marks.push({ col: w, label: MONTHS[date.getMonth()] });
          lastMonth = date.getMonth();
        }
      }
      cols.push(col);
    }
    return { columns: cols, monthMarks: marks };
  }, [weeks]);

  const step = size + gap;
  const top = 18;
  const left = 26;
  const width = left + weeks * step;
  const height = top + 7 * step;

  const cells: Array<{ date: string; x: number; y: number; c: HeatCell }> = [];
  columns.forEach((col, w) => col.forEach((date, d) => cells.push({ date, x: left + w * step, y: top + d * step, c: cell(date) })));
  const activeDates = onSelect ? cells.filter((k) => k.c.active).map((k) => k.date) : [];
  const tabStop = selected && activeDates.includes(selected) ? selected : activeDates[activeDates.length - 1];
  const current = focusDate && activeDates.includes(focusDate) ? focusDate : tabStop;
  const ring = cells.find((k) => k.date === ringDate);

  const showTip = (el: Element, label: string) => {
    const box = el.getBoundingClientRect();
    const base = wrap.current!.getBoundingClientRect();
    setHover({ x: box.left - base.left + box.width / 2, y: box.top - base.top, label });
  };
  const onKey = (e: KeyboardEvent<SVGRectElement>, date: string, isSel: boolean) => {
    const i = activeDates.indexOf(date);
    let to: number;
    if (e.key === "ArrowRight" || e.key === "ArrowDown") to = Math.min(activeDates.length - 1, i + 1);
    else if (e.key === "ArrowLeft" || e.key === "ArrowUp") to = Math.max(0, i - 1);
    else if (e.key === "Home") to = 0;
    else if (e.key === "End") to = activeDates.length - 1;
    else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onSelect?.(isSel ? null : date);
      return;
    } else return;
    e.preventDefault();
    const next = activeDates[to];
    setFocusDate(next);
    cellRefs.current.get(next)?.focus();
  };

  return (
    <div className="relative" ref={wrap}>
      <div ref={scroller} className="-mx-1 overflow-x-auto px-1 pb-1">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          width="100%"
          style={{ maxWidth: width * 1.25, minWidth: Math.min(width, weeks > 30 ? 640 : 0) }}
          role={onSelect ? "group" : "img"}
          aria-label={ariaLabel}
          aria-describedby={onSelect ? descId : undefined}
          onMouseLeave={() => setHover(null)}
        >
          {monthMarks.map((m) => (
            <text key={m.col} x={left + m.col * step} y={11} className="fill-content-tertiary" fontSize={10}>
              {m.label}
            </text>
          ))}
          {["Mon", "Wed", "Fri"].map((d, i) => (
            <text key={d} x={0} y={top + i * 2 * step + size - 2} className="fill-content-tertiary" fontSize={9}>
              {d}
            </text>
          ))}
          {cells.map(({ date, x, y, c }) => {
            const isSel = selected === date;
            const interactive = !!onSelect && !!c.active;
            return (
              <rect
                key={date}
                ref={(el) => {
                  if (el) cellRefs.current.set(date, el);
                  else cellRefs.current.delete(date);
                }}
                x={x}
                y={y}
                width={size}
                height={size}
                rx={2}
                fill={c.fill}
                stroke={isSel ? "var(--color-background-system)" : "transparent"}
                strokeWidth={isSel ? 1.5 : 0}
                style={{ cursor: interactive ? "pointer" : "default" }}
                className={interactive ? "focus-visible:outline-none" : undefined}
                role={interactive ? "button" : undefined}
                aria-label={interactive ? c.label : undefined}
                aria-pressed={interactive ? isSel : undefined}
                tabIndex={interactive ? (date === current ? 0 : -1) : undefined}
                onMouseEnter={(e) => showTip(e.currentTarget, c.label)}
                onFocus={interactive ? (e) => (setRingDate(date), setFocusDate(date), showTip(e.currentTarget, c.label)) : undefined}
                onBlur={interactive ? () => (setRingDate(null), setHover(null)) : undefined}
                onKeyDown={interactive ? (e) => onKey(e, date, isSel) : undefined}
                onClick={() => interactive && onSelect!(isSel ? null : date)}
              />
            );
          })}
          {ring && (
            <rect
              x={ring.x - 2.5}
              y={ring.y - 2.5}
              width={size + 5}
              height={size + 5}
              rx={3.5}
              fill="none"
              stroke="var(--color-interactive-primary)"
              strokeWidth={2}
              pointerEvents="none"
            />
          )}
        </svg>
      </div>
      {onSelect && (
        <p id={descId} className="sr-only">
          Use the arrow keys to move between days with changes. Press Enter to select a day.
        </p>
      )}
      {hover && (
        <div
          className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full rounded-[4px] bg-background-system px-2 py-1 text-[12px] whitespace-nowrap text-white shadow-pop"
          style={{ left: hover.x, top: hover.y - 6 }}
        >
          {hover.label}
        </div>
      )}
    </div>
  );
}
