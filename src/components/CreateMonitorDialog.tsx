import type { ReactNode } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, BellRing, CircleAlert, CircleCheck, FileCheck2, Radar, SlidersHorizontal, X } from "lucide-react";
import { CATEGORIES, DEFAULT_SEVERITY, PKYB_UNSUPPORTED, TODAY, iso, jurisdictionByCode, type Company, type Severity } from "../data/model";
import { useStore } from "../state/store";
import { Button, CategoryChip, Dialog, Flag, SeverityPill, cx, formatDate } from "./ui";

const TIERS: Array<{ level: Severity; desc: string }> = [
  { level: "low", desc: "Keep for your records." },
  { level: "medium", desc: "Review when you can." },
  { level: "high", desc: "Act now, usually with a fresh KYB report." },
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

  return (
    <Dialog open={!!company} onClose={onClose} title={title} width={ordering ? 880 : 720} labelledBy="create-monitor-title" bare>
      {company && j && (
        <div className="relative grid max-h-[calc(100dvh-32px)] overflow-y-auto md:grid-cols-[300px_minmax(0,1fr)] md:overflow-hidden">
          <button
            onClick={onClose}
            aria-label="Close"
            className="absolute top-3 right-3 z-10 grid size-9 place-items-center rounded-[4px] text-white/80 hover:bg-white/10 hover:text-white md:text-ink-3 md:hover:bg-wash md:hover:text-ink"
          >
            <X className="size-4" />
          </button>

          {/* Who is being watched and what will happen, in the Portal's navy chrome. */}
          <aside className="flex flex-col gap-6 bg-[linear-gradient(170deg,var(--color-navy-700),var(--color-navy-900)_60%,var(--color-navy-950))] px-6 pt-6 pb-7 text-white md:pb-8">
            <h2 id="create-monitor-title" className="pr-10 text-[18px] leading-snug font-semibold tracking-[-0.01em] md:pr-0">
              {title}
            </h2>

            <div className="rounded-[6px] bg-white/[0.06] p-4 shadow-[inset_0_0_0_1px_rgb(255_255_255/0.1)]">
              <div className="flex items-start gap-3">
                <Flag code={company.jurisdiction} className="mt-1 h-4 w-6 shrink-0" />
                <div className="min-w-0">
                  <p className="text-[16px] leading-snug font-semibold">{company.name}</p>
                  {company.localName && <p className="mt-0.5 text-[14px] text-white/75">{company.localName}</p>}
                </div>
              </div>
              <dl className="mt-3 border-t border-white/10 pt-3 text-[12px]">
                <dt className="text-white/65">
                  {j.name} · {j.regLabel}
                </dt>
                <dd className="mt-0.5 font-medium tnum text-white/90">{company.regNo}</dd>
              </dl>
              <p className={cx("mt-3 flex items-start gap-2 text-[13px]", unsupported ? "text-white" : "text-brand-300")}>
                {unsupported ? (
                  <CircleAlert className="mt-0.5 size-4 shrink-0 text-white/80" />
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
                <span aria-hidden className="absolute top-4 bottom-4 left-[15px] w-px bg-white/15" />
                {STEPS.map((s) => (
                  <li key={s.when} className="relative flex gap-3">
                    <span className="grid size-8 shrink-0 place-items-center rounded-full bg-navy-900 shadow-[inset_0_0_0_1px_rgb(47_191_135/0.55)]">
                      <s.icon className="size-4 text-brand-400" strokeWidth={1.75} />
                    </span>
                    <span className="pt-1 text-[13px] leading-snug">
                      <span className="block font-semibold text-white">{s.when}</span>
                      <span className="block text-white/75">{s.what}</span>
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
                    <h3 id="watch-h" className="text-[16px] font-semibold text-ink">
                      We'll watch 9 change categories for you
                    </h3>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {CATEGORIES.map((c) => (
                        <CategoryChip key={c} category={c} showSeverity={false} />
                      ))}
                    </div>
                  </section>

                  <section aria-labelledby="sev-h" className="border-t border-line pt-5">
                    <h3 id="sev-h" className="flex items-center gap-2 text-[14px] font-semibold text-ink">
                      <SlidersHorizontal className="size-4 text-brand-700" /> You define the severity
                    </h3>
                    {customised ? (
                      <p className="mt-1 text-[13px] text-ink-2">
                        Your team's mapping applies to this monitor:{" "}
                        <span className="font-semibold text-ink tnum">
                          {tierCount("high")} High · {tierCount("medium")} Medium · {tierCount("low")} Low
                        </span>
                        . Severity is set once for all your monitors in{" "}
                        <Link to="/pkyb/settings" onClick={onClose} className="font-semibold text-brand-700 hover:underline">
                          Severity Settings
                        </Link>
                        .
                      </p>
                    ) : (
                      <p className="mt-1 text-[13px] text-ink-2">
                        Every category starts at <span className="font-semibold text-ink">Medium</span>. Set each one to Low, Medium or High in{" "}
                        <Link to="/pkyb/settings" onClick={onClose} className="font-semibold text-brand-700 hover:underline">
                          Severity Settings
                        </Link>
                        ; it applies to all your monitors.
                      </p>
                    )}
                    <ul className="mt-3 grid gap-x-4 gap-y-2 sm:grid-cols-3">
                      {TIERS.map((t) => (
                        <li key={t.level} className="flex flex-col items-start gap-1">
                          <SeverityPill level={t.level} size="sm" />
                          <span className="text-[12px] text-ink-2">{t.desc}</span>
                        </li>
                      ))}
                    </ul>
                  </section>

                  <section aria-labelledby="order-h" className="border-t border-dashed border-line-strong pt-5">
                    <h3 id="order-h" className="mb-3 text-[14px] font-semibold text-ink">
                      Your order
                    </h3>
                    <dl className="flex flex-col gap-3 text-[13px]">
                      <Line label="pKYB monitor" sub={`Starts ${formatDate(iso(TODAY))} · runs until you stop it`} value="10 credits / year" />
                      <Line
                        label={
                          <span className="flex flex-wrap items-center gap-2">
                            KYB Basic report
                            <span className="rounded-[3px] border border-line-strong bg-wash px-1.5 text-[11px] font-semibold text-ink-2">Required</span>
                          </span>
                        }
                        sub="Attached to this monitor as your baseline and downloaded when monitoring starts. Every later change is compared against it."
                        value="xx credits"
                      />
                    </dl>
                  </section>
                </div>
              )}
            </div>

            <footer className="flex flex-col gap-3 border-t border-line bg-white px-6 py-4 sm:flex-row sm:items-center">
              {ordering && (
                <p className="flex shrink-0 items-baseline gap-2 whitespace-nowrap">
                  <span className="text-[13px] text-ink-2">Total today</span>
                  <span className="text-[18px] font-semibold tracking-[-0.01em] tnum text-ink">10 + xx credits</span>
                </p>
              )}
              <div className="flex flex-col-reverse gap-2 sm:ml-auto sm:flex-row sm:items-center">
                <Button variant="ghost" onClick={onClose}>
                  Cancel
                </Button>
                {existing ? (
                  <Button variant="primary" autoFocus onClick={() => go(`/pkyb/monitoring/${existing.id}`)}>
                    Open existing monitor <ArrowRight className="size-4" />
                  </Button>
                ) : unsupported ? (
                  <Button variant="primary" autoFocus onClick={() => go(`/report/${company.id}`)}>
                    Choose a one-off KYB report <ArrowRight className="size-4" />
                  </Button>
                ) : (
                  <Button variant="primary" autoFocus onClick={confirm}>
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
  return <p className="max-w-[48ch] text-[14px] leading-relaxed text-ink-2">{children}</p>;
}

function Line({ label, sub, value }: { label: ReactNode; sub: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-6">
      <dt className="min-w-0">
        <span className="block font-medium text-ink">{label}</span>
        <span className="mt-0.5 block max-w-[46ch] text-[12px] text-ink-2">{sub}</span>
      </dt>
      <dd className="shrink-0 pt-px tnum text-ink">{value}</dd>
    </div>
  );
}
