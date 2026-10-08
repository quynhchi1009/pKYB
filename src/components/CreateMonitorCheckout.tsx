// The Create pKYB monitor order, laid out as a checkout: the white panel is what's being set up,
// the navy column is the order, its total and the commit.
import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, BellRing, CircleCheck, FileCheck2, Radar, SlidersHorizontal, X } from "lucide-react";
import { CATEGORIES, CATEGORY_LABEL, PRICING, TODAY, balanceAfterLabel, creditsLabel, iso, totalTodayLabel, type Company, type Jurisdiction, type Severity } from "../data/model";
import { Button, CATEGORY_ICON, Flag, SEV_STYLE, cx, formatDate } from "./ui";

export type OrderProps = {
  company: Company;
  j: Jurisdiction;
  title: string;
  customised: boolean;
  tierCount: (lv: Severity) => number;
  onClose: () => void;
  confirm: () => void;
};

const STEPS = [
  { when: "Today", what: "KYB Basic baseline report attached", icon: FileCheck2 },
  { when: "Ongoing", what: "Automatic checks until you stop", icon: Radar },
  { when: "On change", what: "Alerts based on your severity", icon: BellRing },
];

const balance = () => balanceAfterLabel(PRICING.kybBasicCredits === null ? null : PRICING.monitorCredits + PRICING.kybBasicCredits);
const monitorPrice = `${PRICING.monitorCredits} credits / year`;
const monitorSub = `From ${formatDate(iso(TODAY))} · until you stop it`;
const NAVY = "bg-[linear-gradient(170deg,var(--color-navy-700),var(--color-navy-900)_60%,var(--color-navy-950))]";

function SeverityCounts({ tierCount, className }: { tierCount: OrderProps["tierCount"]; className?: string }) {
  return (
    <span className={cx("inline-flex flex-wrap items-center gap-x-3 gap-y-1 tnum", className)}>
      {(["high", "medium", "low"] as Severity[]).map((s) => (
        <span key={s} className="inline-flex items-center gap-1.5">
          <span className={cx("size-1.5 rounded-full", SEV_STYLE[s].dot)} aria-hidden />
          <span className="font-semibold text-content-primary">{tierCount(s)}</span> {s[0].toUpperCase() + s.slice(1)}
        </span>
      ))}
    </span>
  );
}

function SettingsLink({ onClose, children = "Severity Settings" }: { onClose: () => void; children?: ReactNode }) {
  return (
    <Link to="/pkyb/settings" onClick={onClose} className="font-semibold text-content-link hover:underline">
      {children}
    </Link>
  );
}

/** The severity sentence, in the current dialog's words. */
function SeverityNote({ customised, tierCount, onClose }: Pick<OrderProps, "customised" | "tierCount" | "onClose">) {
  return customised ? (
    <>
      Your team's settings: <SeverityCounts tierCount={tierCount} className="align-baseline" />. Change in <SettingsLink onClose={onClose} />.
    </>
  ) : (
    <>
      All start at <span className="font-semibold text-content-primary">Medium</span>. Change in <SettingsLink onClose={onClose} />.
    </>
  );
}

function CloseButton({ onClose }: { onClose: () => void }) {
  return (
    <button
      onClick={onClose}
      aria-label="Close"
      className="absolute top-3 right-3 z-10 grid size-9 place-items-center rounded-[4px] text-chrome-content-main hover:bg-chrome-control-hover hover:text-white"
    >
      <X className="size-4" />
    </button>
  );
}

function Actions({ onClose, confirm }: { onClose: () => void; confirm: () => void }) {
  return (
    <div className="flex flex-col-reverse gap-2">
      {/* An order spends credits, so Enter on open must not place it: Cancel takes focus first.
          On navy the ghost button's content-main text would vanish, so Cancel uses the chrome text colours. */}
      <button
        onClick={onClose}
        data-autofocus=""
        className="inline-flex h-9 items-center justify-center rounded-[4px] px-4 text-[14px] font-semibold text-chrome-content-main hover:bg-chrome-control-hover hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-chrome-accent"
      >
        Cancel
      </button>
      <Button variant="primary" onClick={confirm} className="w-full">
        Start monitoring <ArrowRight className="size-4" />
      </Button>
    </div>
  );
}

/**
 * The white panel is what you're setting up (company, scope, severity, how it runs), and the navy
 * column is the checkout. Line items, total, balance and the commit share one
 * column, so the price and the button that spends it are never apart.
 */
export function CheckoutOrder(p: OrderProps) {
  const { company, j, title } = p;
  return (
    <div className="relative grid max-h-[calc(100dvh-32px)] overflow-y-auto md:grid-cols-[minmax(0,1fr)_296px] md:overflow-hidden">
      <CloseButton onClose={p.onClose} />
      <div className="flex min-h-0 flex-col gap-5 bg-white px-6 pt-6 pb-6 md:max-h-[calc(100dvh-32px)] md:overflow-y-auto">
        <h2 id="create-monitor-title" className="pr-10 text-[18px] leading-snug font-semibold tracking-[-0.01em] md:pr-0">
          {title}
        </h2>

        <div className="flex items-start gap-3 rounded-[6px] border border-border-subtle p-4">
          <Flag code={company.jurisdiction} className="mt-1 h-4 w-6 shrink-0" />
          <div className="min-w-0 flex-1">
            <p className="text-[16px] leading-snug font-semibold text-content-primary">{company.name}</p>
            {company.localName && <p className="text-[14px] text-content-main">{company.localName}</p>}
            <p className="mt-1 text-[12px] text-content-tertiary">
              {j.name} · {j.regLabel} <span className="tnum text-content-main">{company.regNo}</span>
            </p>
          </div>
          <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-border-accent bg-interactive-accent px-2 py-0.5 text-[11px] font-semibold text-interactive-control max-sm:hidden">
            <CircleCheck className="size-3" aria-hidden /> {j.regLabel} verified
          </span>
        </div>
        <p className="-mt-3 flex items-center gap-1 text-[12px] font-semibold text-interactive-primary sm:hidden">
          <CircleCheck className="size-3" aria-hidden /> {j.regLabel} verified
        </p>

        <section aria-labelledby="c-watch-h">
          <h3 id="c-watch-h" className="text-[14px] font-semibold text-content-primary">
            9 change categories monitored
          </h3>
          <ul className="mt-2.5 flex flex-wrap gap-1.5">
            {CATEGORIES.map((c) => {
              const Icon = CATEGORY_ICON[c];
              return (
                <li key={c} className="inline-flex h-7 items-center gap-1.5 rounded-[4px] border border-border-subtle bg-white px-2 text-[12px] text-content-main">
                  <Icon className="size-3.5 text-interactive-primary" strokeWidth={2} aria-hidden />
                  {CATEGORY_LABEL[c]}
                </li>
              );
            })}
          </ul>
        </section>

        <section aria-labelledby="c-sev-h" className="text-[13px] text-content-main">
          <h3 id="c-sev-h" className="flex items-center gap-1.5 text-[14px] font-semibold text-content-primary">
            <SlidersHorizontal className="size-4 text-interactive-primary" aria-hidden /> Severity
          </h3>
          <p className="mt-1">
            <SeverityNote {...p} />
          </p>
        </section>

        <ol aria-label="What happens" className="grid gap-3 border-t border-border-subtle pt-5 sm:grid-cols-3">
          {STEPS.map((s) => (
            <li key={s.when} className="flex gap-2.5 text-[12px] leading-snug sm:flex-col sm:gap-2">
              <s.icon className="size-4 shrink-0 text-interactive-primary" strokeWidth={1.75} aria-hidden />
              <span>
                <span className="block text-[13px] font-semibold text-content-primary">{s.when}</span>
                <span className="block text-content-main">{s.what}</span>
              </span>
            </li>
          ))}
        </ol>
      </div>

      <aside aria-labelledby="c-order-h" className={cx(NAVY, "flex flex-col px-6 pt-6 pb-6 text-white md:pt-14")}>
        <h3 id="c-order-h" className="text-[13px] font-semibold text-chrome-content-tertiary">
          Your order
        </h3>
        <dl className="mt-3 flex flex-col gap-4 text-[13px]">
          <div>
            <dt className="flex items-start justify-between gap-4">
              <span className="font-semibold">pKYB monitor</span>
              <span className="tnum text-chrome-content-main">{monitorPrice}</span>
            </dt>
            <dd className="mt-0.5 text-[12px] text-chrome-content-tertiary tnum">{monitorSub}</dd>
          </div>
          <div>
            <dt className="flex items-start justify-between gap-4">
              <span className="flex flex-wrap items-center gap-2 font-semibold">
                KYB Basic report
                <span className="rounded-[3px] px-1.5 text-[11px] font-semibold text-chrome-content-main shadow-[inset_0_0_0_1px_var(--color-chrome-border)]">Required</span>
              </span>
              <span className="tnum text-chrome-content-main">{creditsLabel(PRICING.kybBasicCredits)}</span>
            </dt>
            <dd className="mt-0.5 text-[12px] text-chrome-content-tertiary">Your baseline for spotting changes</dd>
          </div>
        </dl>
        <p className="mt-4 text-[12px] text-chrome-content-tertiary">Charged once. Later reports are charged separately.</p>

        <div className="mt-6 border-t border-chrome-border pt-4 md:mt-auto">
          <p className="text-[13px] text-chrome-content-tertiary">Total today</p>
          <p className="text-[24px] leading-tight font-semibold tracking-[-0.015em] tnum">{totalTodayLabel()}</p>
          <p className="mt-0.5 text-[12px] text-chrome-content-tertiary tnum">Balance {balance()}</p>
          <div className="mt-5">
            <Actions onClose={p.onClose} confirm={p.confirm} />
          </div>
        </div>
      </aside>
    </div>
  );
}
