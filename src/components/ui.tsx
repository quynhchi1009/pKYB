import { forwardRef, useEffect, useLayoutEffect, useRef, useState, type ButtonHTMLAttributes, type KeyboardEvent, type ReactNode } from "react";
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
import { CATEGORY_LABEL, SEVERITY_LABEL, jurisdictionByCode, worstSeverity, type Category, type ChangeEvent, type Severity } from "../data/model";
import { useStore, type Toast } from "../state/store";

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
        variant === "link"
          ? size === "md"
            ? "text-[14px]"
            : "text-[13px]"
          : size === "md"
            ? "h-9 px-4 text-[14px] max-sm:h-11"
            : "h-8 px-3 text-[13px] max-sm:h-10",
        variant === "primary" && "bg-interactive-primary text-white hover:bg-interactive-control active:bg-interactive-inverse",
        variant === "secondary" && "border border-interactive-primary bg-white text-interactive-primary hover:bg-interactive-accent",
        variant === "ghost" && "text-content-main hover:bg-background-subtle hover:text-content-primary",
        variant === "danger" && "bg-sentiment-negative text-white hover:bg-sentiment-negative-hover",
        variant === "link" && "min-h-8 text-content-link underline-offset-4 hover:underline",
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

/**
 * A change's severity under the client's current mapping. Severity is a lens the client can re-aim, so when
 * today's mapping reads differently from the day the change was detected, the original stays visible as a note.
 */
export function EventSeverity({ event, size = "md" }: { event: ChangeEvent; size?: "sm" | "md" }) {
  const { severity } = useStore();
  const now = worstSeverity(event.categories, severity);
  const was = event.detectedSeverity;
  return (
    <span className="inline-flex flex-wrap items-center gap-x-2 gap-y-0.5">
      <SeverityPill level={now} size={size} />
      {was !== now && (
        <>
          <span className="sr-only">Detected as {SEVERITY_LABEL[was]}.</span>
          <span aria-hidden className="text-[11px] whitespace-nowrap text-content-tertiary">
            was {SEVERITY_LABEL[was]}
          </span>
        </>
      )}
    </span>
  );
}

export function CategoryChip({ category, showSeverity = true }: { category: Category; showSeverity?: boolean }) {
  const { severity } = useStore();
  const Icon = CATEGORY_ICON[category];
  const sev = severity[category];
  return (
    <span
      className={cx("inline-flex h-6 items-center gap-1.5 rounded-[4px] border border-border-subtle px-2 text-[12px] text-content-main", showSeverity ? "bg-white" : "bg-background-subtle")}
      title={showSeverity ? `${CATEGORY_LABEL[category]} · ${SEVERITY_LABEL[sev]} severity` : undefined}
    >
      <Icon className={cx("size-3.5", showSeverity ? "text-interactive-primary" : "text-content-tertiary")} strokeWidth={2} aria-hidden />
      {CATEGORY_LABEL[category]}
      {showSeverity && (
        <>
          <span className={cx("size-1.5 rounded-full", SEV_STYLE[sev].dot)} aria-hidden />
          <span className="sr-only">, {SEVERITY_LABEL[sev]} severity</span>
        </>
      )}
    </span>
  );
}

export function Flag({ code, className }: { code: string; className?: string }) {
  const F = (Flags as Record<string, (p: { title?: string; className?: string }) => ReactNode>)[code];
  if (!F) return null;
  return (
    <span className={cx("inline-flex overflow-hidden rounded-[2px] shadow-[0_0_0_1px_var(--color-background-overlay)]", className ?? "h-3 w-[18px]")}>
      <F title={jurisdictionByCode[code]?.name} className="h-full w-full" />
    </span>
  );
}

export function NewTag({ dark }: { dark?: boolean }) {
  return (
    <span
      className={cx(
        "inline-flex h-[18px] items-center rounded-[3px] border px-1.5 text-[11px] font-semibold",
        dark ? "border-border-accent/60 bg-interactive-accent text-interactive-control" : "border-border-accent bg-interactive-accent text-interactive-primary",
      )}
    >
      New
    </span>
  );
}

/**
 * Focus something once every modal dialog has closed. While a modal is open the rest of the page is inert,
 * so focusing it earlier silently fails and focus falls to <body> when the dialog closes.
 */
export function focusAfterDialogs(target: () => HTMLElement | null | undefined, tries = 30) {
  requestAnimationFrame(() => {
    if (document.querySelector("dialog[open]") && tries > 0) focusAfterDialogs(target, tries - 1);
    else target()?.focus();
  });
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
    if (open && !d.open) {
      d.showModal();
      // Children mount before the dialog opens, so React's autoFocus runs on a hidden node and is lost.
      // `data-autofocus` marks the control that should take focus once the dialog is actually showing.
      d.querySelector<HTMLElement>("[data-autofocus]")?.focus();
    }
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
      className="m-auto max-h-[calc(100dvh-32px)] w-[calc(100vw-32px)] overflow-hidden rounded-[8px] bg-white p-0 text-content-primary shadow-dialog"
      style={{ maxWidth: width }}
    >
      {open && bare && children}
      {open && !bare && (
        <div className="flex max-h-[calc(100dvh-32px)] flex-col">
          <header className="flex items-start justify-between gap-4 border-b border-border-subtle px-6 pt-5 pb-4">
            <h2 id={labelledBy} className="text-[18px] leading-snug font-semibold text-content-primary">
              {title}
            </h2>
            <button
              onClick={onClose}
              className="-mr-2 grid size-8 place-items-center rounded-[4px] text-content-tertiary hover:bg-background-subtle hover:text-content-primary"
              aria-label="Close"
            >
              <X className="size-4" />
            </button>
          </header>
          <div className="overflow-y-auto px-6 py-5">{children}</div>
          {footer && <footer className="flex items-center justify-end gap-3 border-t border-border-subtle bg-base-contrast px-6 py-4">{footer}</footer>}
        </div>
      )}
    </dialog>
  );
}

/**
 * Small action menu rendered in a portal so table overflow never clips it. Arrow keys move, Escape returns focus to the trigger.
 * It follows its trigger while the page or a table scrolls, and closes only once the trigger leaves the viewport.
 */
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
  const list = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const place = () => {
    if (!btn.current) return;
    const r = btn.current.getBoundingClientRect();
    if (r.bottom < 0 || r.top > window.innerHeight) return setOpen(false);
    // Open upward when there's no room below for the list.
    const h = list.current?.offsetHeight ?? 0;
    const below = r.bottom + 4 + h <= window.innerHeight - 8;
    setPos({ top: below || !h ? r.bottom + 4 : r.top - 4 - h, left: Math.max(8, Math.min(r.right - 200, window.innerWidth - 208)) });
  };
  useLayoutEffect(() => {
    if (open) place();
  }, [open]);
  useEffect(() => {
    if (!open) return;
    const close = () => setOpen(false);
    const key = (e: globalThis.KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setOpen(false);
      btn.current?.focus();
    };
    window.addEventListener("scroll", place, true);
    window.addEventListener("resize", close);
    window.addEventListener("keydown", key);
    return () => {
      window.removeEventListener("scroll", place, true);
      window.removeEventListener("resize", close);
      window.removeEventListener("keydown", key);
    };
  }, [open]);
  const move = (e: KeyboardEvent<HTMLDivElement>) => {
    const els = Array.from(list.current?.querySelectorAll<HTMLElement>('[role="menuitem"]') ?? []);
    if (!els.length) return;
    const i = els.indexOf(document.activeElement as HTMLElement);
    const to = e.key === "ArrowDown" ? (i + 1) % els.length : e.key === "ArrowUp" ? (i - 1 + els.length) % els.length : e.key === "Home" ? 0 : e.key === "End" ? els.length - 1 : -1;
    if (to < 0) {
      if (e.key === "Tab") setOpen(false);
      return;
    }
    e.preventDefault();
    els[to].focus();
  };
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
        className={triggerClassName ?? "grid size-8 place-items-center rounded-[4px] text-content-tertiary hover:bg-background-subtle hover:text-content-primary max-sm:size-11"}
      >
        {trigger}
      </button>
      {open &&
        createPortal(
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <div
              ref={list}
              role="menu"
              aria-label={label}
              onKeyDown={move}
              className="fixed z-50 w-[200px] rounded-[6px] border border-border-subtle bg-white py-1 shadow-pop"
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
                    btn.current?.focus();
                    it.onSelect();
                  }}
                  className={cx(
                    "flex min-h-9 w-full items-center gap-2 px-3 py-2 text-left text-[13px] hover:bg-background-subtle focus-visible:bg-background-subtle focus-visible:outline-none",
                    it.danger ? "text-high" : "text-content-primary",
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

/** One toast. Its timer pauses while the pointer or keyboard focus is on it, so Undo is never snatched away mid-reach. */
function ToastItem({ t, onDismiss }: { t: Toast; onDismiss: () => void }) {
  const remaining = useRef(t.action ? 8000 : 5200);
  const started = useRef(0);
  const timer = useRef<number | undefined>(undefined);
  const running = useRef(false);
  const resume = () => {
    if (running.current) return;
    running.current = true;
    started.current = Date.now();
    timer.current = window.setTimeout(onDismiss, Math.max(remaining.current, 2000));
  };
  const pause = () => {
    if (!running.current) return;
    running.current = false;
    window.clearTimeout(timer.current);
    remaining.current -= Date.now() - started.current;
  };
  useEffect(() => {
    resume();
    return () => {
      window.clearTimeout(timer.current);
      running.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <div
      onMouseEnter={pause}
      onMouseLeave={resume}
      onFocus={pause}
      onBlur={(e) => !e.currentTarget.contains(e.relatedTarget as Node | null) && resume()}
      className="toast-in pointer-events-auto flex gap-3 rounded-[6px] bg-background-system px-4 py-3 text-white shadow-pop"
    >
      <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-chrome-accent" aria-hidden />
      <div className="min-w-0 flex-1">
        <p className="text-[13px] font-semibold">{t.title}</p>
        {t.body && <p className="mt-0.5 text-[13px] text-chrome-content-tertiary">{t.body}</p>}
      </div>
      {t.action && (
        <button
          onClick={() => {
            t.action!.onClick();
            onDismiss();
          }}
          className="-my-1 h-8 shrink-0 rounded-[4px] px-2 text-[13px] font-semibold text-chrome-accent hover:bg-chrome-control-hover"
        >
          {t.action.label}
        </button>
      )}
      <button onClick={onDismiss} aria-label="Dismiss" className="grid size-6 shrink-0 place-items-center rounded-[4px] text-chrome-content-tertiary hover:text-white">
        <X className="size-4" />
      </button>
    </div>
  );
}

export function Toasts() {
  const { toasts, dismissToast } = useStore();
  return (
    <div className="pointer-events-none fixed right-4 bottom-4 z-[60] flex w-[min(380px,calc(100vw-32px))] flex-col gap-2" aria-live="polite">
      {toasts.map((t) => (
        <ToastItem key={t.id} t={t} onDismiss={() => dismissToast(t.id)} />
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
      <span className="text-[12px] font-medium text-content-main">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-9 rounded-[4px] border border-interactive-secondary bg-white px-2.5 text-[13px] text-content-primary hover:border-content-main focus:border-interactive-primary max-sm:h-11 max-sm:text-[16px]"
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
