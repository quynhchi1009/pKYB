import { forwardRef, useEffect, useLayoutEffect, useRef, useState, type ButtonHTMLAttributes, type ReactNode } from "react";
import { createPortal } from "react-dom";
import * as Flags from "country-flag-icons/react/3x2";
import {
  BriefcaseBusiness,
  CalendarDays,
  ChartPie,
  CircleCheck,
  Ellipsis,
  Landmark,
  MapPin,
  User,
  Users,
  X,
  CheckCircle2,
  type LucideIcon,
} from "lucide-react";
import { CATEGORY_LABEL, SEVERITY_LABEL, jurisdictionByCode, type Category, type Severity } from "../data/model";
import { useStore } from "../state/store";

export const cx = (...c: Array<string | false | null | undefined>) => c.filter(Boolean).join(" ");

const fmt = new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short", year: "numeric" });
const fmtLong = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric" });
export const formatDate = (d: string) => fmt.format(new Date(d + "T00:00:00"));
export const formatDateLong = (d: string) => fmtLong.format(new Date(d + "T00:00:00"));
export const nf = new Intl.NumberFormat("en-GB");

export const CATEGORY_ICON: Record<Category, LucideIcon> = {
  Identity: User,
  Address: MapPin,
  BusinessActivity: BriefcaseBusiness,
  Officers: Users,
  Ownership: ChartPie,
  Capital: Landmark,
  Status: CircleCheck,
  AnnualReturn: CalendarDays,
  Other: Ellipsis,
};

export const SEV_STYLE: Record<Severity, { text: string; bg: string; line: string; dot: string }> = {
  high: { text: "text-high", bg: "bg-high-bg", line: "border-high-line", dot: "bg-high-cell" },
  medium: { text: "text-medium", bg: "bg-medium-bg", line: "border-medium-line", dot: "bg-medium-cell" },
  low: { text: "text-low", bg: "bg-low-bg", line: "border-low-line", dot: "bg-low-cell" },
};

type BtnProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger" | "link";
  size?: "sm" | "md";
};
export const Button = forwardRef<HTMLButtonElement, BtnProps>(function Button(
  { variant = "secondary", size = "md", className, ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      className={cx(
        "inline-flex shrink-0 items-center justify-center gap-1.5 rounded-[4px] font-semibold whitespace-nowrap transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-50",
        variant === "link" ? (size === "md" ? "text-[14px]" : "text-[13px]") : size === "md" ? "h-9 px-4 text-[14px]" : "h-8 px-3 text-[13px]",
        variant === "primary" && "bg-brand-700 text-white hover:bg-brand-800 active:bg-navy-800",
        variant === "secondary" && "border border-brand-700 bg-white text-brand-700 hover:bg-brand-50",
        variant === "ghost" && "text-ink-2 hover:bg-wash hover:text-ink",
        variant === "danger" && "bg-high text-white hover:bg-high-hover",
        variant === "link" && "min-h-8 text-brand-700 underline-offset-4 hover:underline",
        className,
      )}
      {...rest}
    />
  );
});

export function SeverityPill({ level, size = "md" }: { level: Severity; size?: "sm" | "md" }) {
  const s = SEV_STYLE[level];
  return (
    <span
      className={cx(
        "inline-flex items-center gap-1.5 rounded-full border font-semibold",
        size === "md" ? "h-6 px-2.5 text-[12px]" : "h-5 px-2 text-[11px]",
        s.text,
        s.bg,
        s.line,
      )}
    >
      <span className={cx("size-1.5 rounded-full", s.dot)} aria-hidden />
      {SEVERITY_LABEL[level]}
    </span>
  );
}

export function CategoryChip({ category, showSeverity = true }: { category: Category; showSeverity?: boolean }) {
  const { severity } = useStore();
  const Icon = CATEGORY_ICON[category];
  const sev = severity[category];
  return (
    <span
      className={cx("inline-flex h-6 items-center gap-1.5 rounded-[4px] border border-line px-2 text-[12px] text-ink-2", showSeverity ? "bg-white" : "bg-wash")}
      title={showSeverity ? `${CATEGORY_LABEL[category]} · ${SEVERITY_LABEL[sev]} severity` : undefined}
    >
      <Icon className={cx("size-3.5", showSeverity ? "text-brand-700" : "text-ink-3")} strokeWidth={2} aria-hidden />
      {CATEGORY_LABEL[category]}
      {showSeverity && <span className={cx("size-1.5 rounded-full", SEV_STYLE[sev].dot)} aria-label={`${sev} severity`} />}
    </span>
  );
}

export function Flag({ code, className }: { code: string; className?: string }) {
  const F = (Flags as Record<string, (p: { title?: string; className?: string }) => ReactNode>)[code];
  if (!F) return null;
  return (
    <span className={cx("inline-flex overflow-hidden rounded-[2px] shadow-[0_0_0_1px_rgb(0_0_0/0.08)]", className ?? "h-3 w-[18px]")}>
      <F title={jurisdictionByCode[code]?.name} className="h-full w-full" />
    </span>
  );
}

export function NewTag({ dark }: { dark?: boolean }) {
  return (
    <span
      className={cx(
        "inline-flex h-[18px] items-center rounded-[3px] border px-1.5 text-[11px] font-semibold",
        dark ? "border-brand-300/60 bg-brand-50 text-brand-800" : "border-brand-300 bg-brand-50 text-brand-700",
      )}
    >
      New
    </span>
  );
}

export function Dialog({
  open,
  onClose,
  title,
  children,
  footer,
  width = 560,
  labelledBy = "dialog-title",
  bare = false,
}: {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  width?: number;
  labelledBy?: string;
  /** Render children edge to edge, without the standard header and footer. */
  bare?: boolean;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);
  return (
    <dialog
      ref={ref}
      aria-labelledby={labelledBy}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onClick={(e) => e.target === ref.current && onClose()}
      className="m-auto max-h-[calc(100dvh-32px)] w-[calc(100vw-32px)] overflow-hidden rounded-[8px] bg-white p-0 text-ink shadow-dialog"
      style={{ maxWidth: width }}
    >
      {open && bare && children}
      {open && !bare && (
        <div className="flex max-h-[calc(100dvh-32px)] flex-col">
          <header className="flex items-start justify-between gap-4 border-b border-line px-6 pt-5 pb-4">
            <h2 id={labelledBy} className="text-[18px] leading-snug font-semibold text-ink">
              {title}
            </h2>
            <button
              onClick={onClose}
              className="-mr-2 grid size-8 place-items-center rounded-[4px] text-ink-3 hover:bg-wash hover:text-ink"
              aria-label="Close"
            >
              <X className="size-4" />
            </button>
          </header>
          <div className="overflow-y-auto px-6 py-5">{children}</div>
          {footer && <footer className="flex items-center justify-end gap-3 border-t border-line bg-canvas px-6 py-4">{footer}</footer>}
        </div>
      )}
    </dialog>
  );
}

/** Small action menu rendered in a portal so table overflow never clips it. */
export function Menu({
  label,
  trigger,
  items,
  triggerClassName,
}: {
  label: string;
  trigger: ReactNode;
  triggerClassName?: string;
  items: Array<{ label: string; onSelect: () => void; danger?: boolean; icon?: LucideIcon }>;
}) {
  const [open, setOpen] = useState(false);
  const btn = useRef<HTMLButtonElement>(null);
  const [pos, setPos] = useState({ top: 0, left: 0 });
  useLayoutEffect(() => {
    if (!open || !btn.current) return;
    const r = btn.current.getBoundingClientRect();
    setPos({ top: r.bottom + 4, left: Math.max(8, r.right - 200) });
  }, [open]);
  useEffect(() => {
    if (!open) return;
    const close = () => setOpen(false);
    const key = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("scroll", close, true);
    window.addEventListener("resize", close);
    window.addEventListener("keydown", key);
    return () => {
      window.removeEventListener("scroll", close, true);
      window.removeEventListener("resize", close);
      window.removeEventListener("keydown", key);
    };
  }, [open]);
  return (
    <>
      <button
        ref={btn}
        aria-label={label}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={(e) => {
          e.stopPropagation();
          setOpen((o) => !o);
        }}
        className={triggerClassName ?? "grid size-8 place-items-center rounded-[4px] text-ink-3 hover:bg-wash hover:text-ink"}
      >
        {trigger}
      </button>
      {open &&
        createPortal(
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <div
              role="menu"
              className="fixed z-50 w-[200px] rounded-[6px] border border-line bg-white py-1 shadow-pop"
              style={pos}
            >
              {items.map((it) => (
                <button
                  key={it.label}
                  role="menuitem"
                  autoFocus={it === items[0]}
                  onClick={(e) => {
                    e.stopPropagation();
                    setOpen(false);
                    it.onSelect();
                  }}
                  className={cx(
                    "flex w-full items-center gap-2 px-3 py-2 text-left text-[13px] hover:bg-wash focus-visible:bg-wash focus-visible:outline-none",
                    it.danger ? "text-high" : "text-ink",
                  )}
                >
                  {it.icon && <it.icon className="size-4" />}
                  {it.label}
                </button>
              ))}
            </div>
          </>,
          document.body,
        )}
    </>
  );
}

export function Toasts() {
  const { toasts, dismissToast } = useStore();
  return (
    <div className="pointer-events-none fixed right-4 bottom-4 z-[60] flex w-[min(380px,calc(100vw-32px))] flex-col gap-2" aria-live="polite">
      {toasts.map((t) => (
        <div key={t.id} className="toast-in pointer-events-auto flex gap-3 rounded-[6px] bg-navy-900 px-4 py-3 text-white shadow-pop">
          <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-brand-400" />
          <div className="min-w-0 flex-1">
            <p className="text-[13px] font-semibold">{t.title}</p>
            {t.body && <p className="mt-0.5 text-[13px] text-white/70">{t.body}</p>}
          </div>
          {t.action && (
            <button
              onClick={() => {
                t.action!.onClick();
                dismissToast(t.id);
              }}
              className="-my-1 h-8 shrink-0 rounded-[4px] px-2 text-[13px] font-semibold text-brand-400 hover:bg-white/10"
            >
              {t.action.label}
            </button>
          )}
          <button onClick={() => dismissToast(t.id)} aria-label="Dismiss" className="text-white/60 hover:text-white">
            <X className="size-4" />
          </button>
        </div>
      ))}
    </div>
  );
}

export function Select({
  label,
  value,
  onChange,
  options,
  className,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: Array<{ value: string; label: string }>;
  className?: string;
}) {
  return (
    <label className={cx("flex flex-col gap-1", className)}>
      <span className="text-[12px] font-medium text-ink-2">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-9 rounded-[4px] border border-line-strong bg-white px-2.5 text-[13px] text-ink hover:border-ink-3 focus:border-brand-600 focus:outline-none"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}
