import { useLayoutEffect, useMemo, useRef, useState } from "react";
import { TODAY, addDays, iso } from "../data/model";

export type HeatCell = { fill: string; label: string; active?: boolean };

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/**
 * Calendar grid, one cell per day, weeks as columns (Mon at top), ending today.
 * Colour is decided by the caller so the same grid serves company and portfolio views.
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
  // Open on the most recent weeks when the grid is wider than its card.
  useLayoutEffect(() => {
    const el = scroller.current;
    if (el) el.scrollLeft = el.scrollWidth;
  }, [weeks]);
  const [hover, setHover] = useState<{ x: number; y: number; label: string } | null>(null);

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

  return (
    <div className="relative" ref={wrap}>
      <div ref={scroller} className="-mx-1 overflow-x-auto px-1 pb-1">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        width="100%"
        style={{ maxWidth: width * 1.25, minWidth: Math.min(width, weeks > 30 ? 640 : 0) }}
        role="img"
        aria-label={ariaLabel}
        onMouseLeave={() => setHover(null)}
      >
        {monthMarks.map((m) => (
          <text key={m.col} x={left + m.col * step} y={11} className="fill-ink-3" fontSize={10}>
            {m.label}
          </text>
        ))}
        {["Mon", "Wed", "Fri"].map((d, i) => (
          <text key={d} x={0} y={top + (i * 2) * step + size - 2} className="fill-ink-3" fontSize={9}>
            {d}
          </text>
        ))}
        {columns.map((col, w) =>
          col.map((date, d) => {
            const c = cell(date);
            const isSel = selected === date;
            return (
              <rect
                key={date}
                x={left + w * step}
                y={top + d * step}
                width={size}
                height={size}
                rx={2}
                fill={c.fill}
                stroke={isSel ? "var(--color-navy-900)" : "transparent"}
                strokeWidth={isSel ? 1.5 : 0}
                style={{ cursor: onSelect && c.active ? "pointer" : "default" }}
                onMouseEnter={(e) => {
                  const cellBox = (e.target as SVGRectElement).getBoundingClientRect();
                  const base = wrap.current!.getBoundingClientRect();
                  setHover({ x: cellBox.left - base.left + cellBox.width / 2, y: cellBox.top - base.top, label: c.label });
                }}
                onClick={() => onSelect && c.active && onSelect(isSel ? null : date)}
              />
            );
          }),
        )}
      </svg>
      </div>
      {hover && (
        <div
          className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full rounded-[4px] bg-navy-900 px-2 py-1 text-[12px] whitespace-nowrap text-white shadow-pop"
          style={{ left: hover.x, top: hover.y - 6 }}
        >
          {hover.label}
        </div>
      )}
    </div>
  );
}
