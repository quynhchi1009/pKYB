import type { ReactNode } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ArrowDown, ArrowRight, BellRing, CircleAlert, CircleCheck, FileCheck2, Radar, SlidersHorizontal, X } from "lucide-react";
import { CATEGORIES, DEFAULT_SEVERITY, PKYB_UNSUPPORTED, PRICING, TODAY, creditsLabel, iso, jurisdictionByCode, totalTodayLabel, type Company, type Severity } from "../data/model";
import { useStore } from "../state/store";
import { Button, CategoryChip, Dialog, Flag, SeverityPill, cx, formatDate } from "./ui";

// Tiers lead with High, as Monitoring does. The copy describes the tier as the client's own intent,
// because the client decides what each tier means.
const TIERS: Array<{ level: Severity; desc: string }> = [
  { level: "high", desc: "Changes you want to act on first." },
  { level: "medium", desc: "Changes to review when you can." },
  { level: "low", desc: "Changes to keep on record." },
];

const STEPS: Array<{ when: string; what: string; icon: typeof Radar }> = [
  { when: "Today", what: "A KYB Basic report is generated and attached as your baseline.", icon: FileCheck2 },
  { when: "From then on", what: "Checks run automatically, until you stop the monitor.", icon: Radar },
  { when: "When something changes", what: "You're alerted based on the severity you set.", icon: BellRing },
];

/**
 * Create a pKYB monitor, laid out as an order slip: the navy panel says who is being watched and
 * what will happen; the white panel is the order itself (what's watched, who sets severity, the
 * required baseline and the total), ending in the commit.
 */
export function CreateMonitorDialog({ company, onClose }: { company: Company | null; onClose: () => void }) {
  const { createMonitor, toast, monitors, severity } = useStore();
  const navigate = useNavigate();
  const loc = useLocation();
  const customised = CATEGORIES.some((c) => severity[c] !== DEFAULT_SEVERITY[c]);
  const tierCount = (lv: Severity) => CATEGORIES.filter((c) => severity[c] === lv).length;
  const j = company ? jurisdictionByCode[company.jurisdiction] : null;
  const existing = company ? monitors.find((m) => m.regNo === company.regNo && m.status === "active") : undefined;
  const unsupported = !!company && PKYB_UNSUPPORTED.has(company.jurisdiction);
  const ordering = !existing && !unsupported;
  const title = existing ? "Already monitored" : unsupported ? "pKYB isn't available here yet" : "Create a Perpetual KYB Monitor";

  const confirm = () => {
    if (!company || unsupported) return;
    const m = createMonitor(company);
    onClose();
    toast({ title: "Monitoring started", body: `Your KYB Basic baseline report for ${company.name} is being generated.` });
    navigate(`/pkyb/monitoring/${m.id}?new=1`);
  };
  const go = (to: string) => {
    onClose();
    navigate(to);
  };
  // The report list this dialog offers as the alternative may be the page it was opened from.
  const reportsHere = !!company && loc.pathname === `/report/${company.id}`;
  const showReports = () => {
    onClose();
    window.requestAnimationFrame(() => {
      const h = document.getElementById("kyb-h");
      h?.scrollIntoView({ behavior: "smooth", block: "start" });
      h?.focus({ preventScroll: true });
    });
  };

  return (
    <Dialog open={!!company} onClose={onClose} title={title} width={ordering ? 880 : 720} labelledBy="create-monitor-title" bare>
      {company && j && (
        <div className="relative grid max-h-[calc(100dvh-32px)] overflow-y-auto md:grid-cols-[300px_minmax(0,1fr)] md:overflow-hidden">
          <button
            onClick={onClose}
            aria-label="Close"
            className="absolute top-3 right-3 z-10 grid size-9 place-items-center rounded-[4px] text-chrome-content-main hover:bg-chrome-control-hover hover:text-white md:text-content-tertiary md:hover:bg-background-subtle md:hover:text-content-primary"
          >
            <X className="size-4" />
          </button>

          {/* Who is being watched and what will happen, in the Portal's navy chrome. */}
          <aside className="flex flex-col gap-6 bg-[linear-gradient(170deg,var(--color-navy-700),var(--color-navy-900)_60%,var(--color-navy-950))] px-6 pt-6 pb-7 text-white md:pb-8">
            <h2 id="create-monitor-title" className="pr-10 text-[18px] leading-snug font-semibold tracking-[-0.01em] md:pr-0">
              {title}
            </h2>

            <div className="rounded-[6px] bg-chrome-selected p-4 shadow-[inset_0_0_0_1px_var(--color-chrome-border)]">
              <div className="flex items-start gap-3">
                <Flag code={company.jurisdiction} className="mt-1 h-4 w-6 shrink-0" />
                <div className="min-w-0">
                  <p className="text-[16px] leading-snug font-semibold">{company.name}</p>
                  {company.localName && <p className="mt-0.5 text-[14px] text-chrome-content-tertiary">{company.localName}</p>}
                </div>
              </div>
              <dl className="mt-3 border-t border-chrome-border pt-3 text-[12px]">
                <dt className="text-chrome-content-tertiary">
                  {j.name} · {j.regLabel}
                </dt>
                <dd className="mt-0.5 font-medium tnum text-chrome-content-main">{company.regNo}</dd>
              </dl>
              <p className={cx("mt-3 flex items-start gap-2 text-[13px]", unsupported ? "text-white" : "text-border-accent")}>
                {unsupported ? (
                  <CircleAlert className="mt-0.5 size-4 shrink-0 text-chrome-content-main" />
                ) : (
                  <CircleCheck className="mt-0.5 size-4 shrink-0" />
                )}
                {existing
                  ? `Monitored since ${formatDate(existing.createdAt)}`
                  : unsupported
                    ? `Not covered by pKYB in ${j.name}`
                    : `${j.regLabel} verified for monitoring`}
              </p>
            </div>

            {ordering && (
              <ol aria-label="What happens" className="relative flex flex-col gap-5 max-md:hidden">
                <span aria-hidden className="absolute top-4 bottom-4 left-[15px] w-px bg-chrome-border" />
                {STEPS.map((s) => (
                  <li key={s.when} className="relative flex gap-3">
                    <span className="grid size-8 shrink-0 place-items-center rounded-full bg-background-system shadow-[inset_0_0_0_1px_rgb(47_191_135/0.55)]">
                      <s.icon className="size-4 text-chrome-accent" strokeWidth={1.75} />
                    </span>
                    <span className="pt-1 text-[13px] leading-snug">
                      <span className="block font-semibold text-white">{s.when}</span>
                      <span className="block text-chrome-content-tertiary">{s.what}</span>
                    </span>
                  </li>
                ))}
              </ol>
            )}
          </aside>

          {/* The order itself. */}
          <div className="flex min-h-0 flex-col bg-white">
            <div className="flex-1 px-6 pt-6 pb-4 md:max-h-[calc(100dvh-32px-76px)] md:overflow-y-auto md:pt-14">
              {existing ? (
                <Note>This company already has an active monitor, so there's nothing new to order. Opening it won't place an order or use credits.</Note>
              ) : unsupported ? (
                <Note>Perpetual KYB doesn't cover {j.name} companies yet. You can still order a one-off KYB report for this company.</Note>
              ) : (
                <div className="flex flex-col gap-6">
                  <section aria-labelledby="watch-h">
                    <h3 id="watch-h" className="text-[16px] font-semibold text-content-primary">
                      We'll watch 9 change categories for you
                    </h3>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {CATEGORIES.map((c) => (
                        <CategoryChip key={c} category={c} showSeverity={false} />
                      ))}
                    </div>
                  </section>

                  <section aria-labelledby="sev-h" className="border-t border-border-subtle pt-5">
                    <h3 id="sev-h" className="flex items-center gap-2 text-[14px] font-semibold text-content-primary">
                      <SlidersHorizontal className="size-4 text-interactive-primary" /> You define the severity
                    </h3>
                    {customised ? (
                      <p className="mt-1 text-[13px] text-content-main">
                        Your team's mapping applies to this monitor:{" "}
                        <span className="font-semibold text-content-primary tnum">
                          {tierCount("high")} High · {tierCount("medium")} Medium · {tierCount("low")} Low
                        </span>
                        . Severity is set once for all your monitors in{" "}
                        <Link to="/pkyb/settings" onClick={onClose} className="font-semibold text-content-link hover:underline">
                          Severity Settings
                        </Link>
                        .
                      </p>
                    ) : (
                      <p className="mt-1 text-[13px] text-content-main">
                        Every category starts at <span className="font-semibold text-content-primary">Medium</span>. Set each one to Low, Medium or High in{" "}
                        <Link to="/pkyb/settings" onClick={onClose} className="font-semibold text-content-link hover:underline">
                          Severity Settings
                        </Link>
                        ; it applies to all your monitors.
                      </p>
                    )}
                    <ul className="mt-3 grid gap-x-4 gap-y-2 sm:grid-cols-3">
                      {TIERS.map((t) => (
                        <li key={t.level} className="flex flex-col items-start gap-1">
                          <SeverityPill level={t.level} size="sm" />
                          <span className="text-[12px] text-content-main">{t.desc}</span>
                        </li>
                      ))}
                    </ul>
                  </section>

                  <section aria-labelledby="order-h" className="border-t border-dashed border-border-neutral pt-5">
                    <h3 id="order-h" className="mb-3 text-[14px] font-semibold text-content-primary">
                      Your order
                    </h3>
                    <dl className="flex flex-col gap-3 text-[13px]">
                      <Line label="pKYB monitor" sub={`Starts ${formatDate(iso(TODAY))} · runs until you stop it`} value={`${PRICING.monitorCredits} credits / year`} />
                      <Line
                        label={
                          <span className="flex flex-wrap items-center gap-2">
                            KYB Basic report
                            <span className="rounded-[3px] border border-border-neutral bg-background-subtle px-1.5 text-[11px] font-semibold text-content-main">Required</span>
                          </span>
                        }
                        sub="Attached to this monitor as your baseline and downloaded when monitoring starts. Every later change is compared against it."
                        value={creditsLabel(PRICING.kybBasicCredits)}
                      />
                    </dl>
                    <p className="mt-3 max-w-[52ch] text-[12px] text-content-main">
                      The baseline is charged once, today. Fresh KYB Basic reports you request later are charged separately.
                    </p>
                  </section>
                </div>
              )}
            </div>

            <footer className="flex flex-col gap-3 border-t border-border-subtle bg-white px-6 py-4 sm:flex-row sm:items-center">
              {ordering && (
                <p className="flex shrink-0 items-baseline gap-2 whitespace-nowrap">
                  <span className="text-[13px] text-content-main">Total today</span>
                  <span className="text-[18px] font-semibold tracking-[-0.01em] tnum text-content-primary">{totalTodayLabel()}</span>
                </p>
              )}
              <div className="flex flex-col-reverse gap-2 sm:ml-auto sm:flex-row sm:items-center">
                {/* An order spends credits, so Enter on open must not place it: Cancel takes focus first. */}
                <Button variant="ghost" onClick={onClose} data-autofocus={ordering ? "" : undefined}>
                  Cancel
                </Button>
                {existing ? (
                  <Button variant="primary" data-autofocus="" onClick={() => go(`/pkyb/monitoring/${existing.id}`)}>
                    Open existing monitor <ArrowRight className="size-4" />
                  </Button>
                ) : unsupported ? (
                  reportsHere ? (
                    <Button variant="primary" data-autofocus="" onClick={showReports}>
                      Choose a report on this page <ArrowDown className="size-4" />
                    </Button>
                  ) : (
                    <Button variant="primary" data-autofocus="" onClick={() => go(`/report/${company.id}`)}>
                      Choose a one-off KYB report <ArrowRight className="size-4" />
                    </Button>
                  )
                ) : (
                  <Button variant="primary" onClick={confirm}>
                    Confirm & start monitoring <ArrowRight className="size-4" />
                  </Button>
                )}
              </div>
            </footer>
          </div>
        </div>
      )}
    </Dialog>
  );
}

function Note({ children }: { children: ReactNode }) {
  return <p className="max-w-[48ch] text-[14px] leading-relaxed text-content-main">{children}</p>;
}

function Line({ label, sub, value }: { label: ReactNode; sub: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-6">
      <dt className="min-w-0">
        <span className="block font-medium text-content-primary">{label}</span>
        <span className="mt-0.5 block max-w-[46ch] text-[12px] text-content-main">{sub}</span>
      </dt>
      <dd className="shrink-0 pt-px tnum text-content-primary">{value}</dd>
    </div>
  );
}
