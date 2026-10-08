import type { ReactNode } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowDown, ArrowRight, CircleAlert, CircleCheck, X } from "lucide-react";
import { CATEGORIES, DEFAULT_SEVERITY, PKYB_UNSUPPORTED, jurisdictionByCode, type Company, type Severity } from "../data/model";
import { useStore } from "../state/store";
import { Button, Dialog, Flag, cx, formatDate } from "./ui";
import { CheckoutOrder } from "./CreateMonitorCheckout";

/**
 * Create a pKYB monitor. A new order opens the checkout layout (CreateMonitorCheckout). A company
 * that is already monitored, or in a jurisdiction pKYB doesn't cover, gets a short notice instead:
 * the navy panel names the company and the white panel says what to do.
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

  if (ordering && company && j) {
    return (
      <Dialog open onClose={onClose} title={title} width={860} labelledBy="create-monitor-title" bare>
        <CheckoutOrder company={company} j={j} title={title} customised={customised} tierCount={tierCount} onClose={onClose} confirm={confirm} />
      </Dialog>
    );
  }

  return (
    <Dialog open={!!company} onClose={onClose} title={title} width={720} labelledBy="create-monitor-title" bare>
      {company && j && (
        <div className="relative grid max-h-[calc(100dvh-32px)] overflow-y-auto md:grid-cols-[300px_minmax(0,1fr)] md:overflow-hidden">
          <button
            onClick={onClose}
            aria-label="Close"
            className="absolute top-3 right-3 z-10 grid size-9 place-items-center rounded-[4px] text-chrome-content-main hover:bg-chrome-control-hover hover:text-white md:text-content-tertiary md:hover:bg-background-subtle md:hover:text-content-primary"
          >
            <X className="size-4" />
          </button>

          {/* Which company, in the Portal's navy chrome. */}
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
                {unsupported ? <CircleAlert className="mt-0.5 size-4 shrink-0 text-chrome-content-main" /> : <CircleCheck className="mt-0.5 size-4 shrink-0" />}
                {existing ? `Monitored since ${formatDate(existing.createdAt)}` : `Not covered by pKYB in ${j.name}`}
              </p>
            </div>
          </aside>

          <div className="flex min-h-0 flex-col bg-white">
            <div className="flex-1 px-6 pt-6 pb-4 md:max-h-[calc(100dvh-32px-76px)] md:overflow-y-auto md:pt-14">
              {existing ? <Note>Already monitored. Opening it uses no credits.</Note> : <Note>pKYB doesn't cover {j.name} yet. You can still order a one-off KYB report.</Note>}
            </div>

            <footer className="flex flex-col-reverse gap-2 border-t border-border-subtle bg-white px-6 py-4 sm:flex-row sm:items-center sm:justify-end">
              <Button variant="ghost" onClick={onClose}>
                Cancel
              </Button>
              {existing ? (
                <Button variant="primary" data-autofocus="" onClick={() => go(`/pkyb/monitoring/${existing.id}`)}>
                  Open monitor <ArrowRight className="size-4" />
                </Button>
              ) : reportsHere ? (
                <Button variant="primary" data-autofocus="" onClick={showReports}>
                  Choose a report <ArrowDown className="size-4" />
                </Button>
              ) : (
                <Button variant="primary" data-autofocus="" onClick={() => go(`/report/${company.id}`)}>
                  Choose a report <ArrowRight className="size-4" />
                </Button>
              )}
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
