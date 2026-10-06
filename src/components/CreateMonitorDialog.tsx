import { Link, useNavigate } from "react-router-dom";
import { CircleAlert, CircleCheck, FileCheck2, SlidersHorizontal } from "lucide-react";
import { CATEGORIES, DEFAULT_SEVERITY, PKYB_UNSUPPORTED, TODAY, iso, jurisdictionByCode, type Company, type Severity } from "../data/model";
import { useStore } from "../state/store";
import { Button, CategoryChip, Dialog, Flag, SeverityPill, formatDate } from "./ui";

const TIERS: Array<{ level: Severity; desc: string }> = [
  { level: "low", desc: "Keep for your records." },
  { level: "medium", desc: "Review when you can." },
  { level: "high", desc: "Act now, usually with a fresh KYB report." },
];

/**
 * Confirmation for a new pKYB monitor, in three chunks: who (and whether pKYB can watch them) →
 * what gets watched and who sets severity → what it costs, including the required baseline.
 */
export function CreateMonitorDialog({ company, onClose }: { company: Company | null; onClose: () => void }) {
  const { createMonitor, toast, monitors, severity } = useStore();
  const customised = CATEGORIES.some((c) => severity[c] !== DEFAULT_SEVERITY[c]);
  const tierCount = (lv: Severity) => CATEGORIES.filter((c) => severity[c] === lv).length;
  const navigate = useNavigate();
  const j = company ? jurisdictionByCode[company.jurisdiction] : null;
  const existing = company ? monitors.find((m) => m.regNo === company.regNo && m.status === "active") : undefined;
  const unsupported = !!company && PKYB_UNSUPPORTED.has(company.jurisdiction);

  const confirm = () => {
    if (!company || unsupported) return;
    const m = createMonitor(company);
    onClose();
    toast({ title: "Monitoring started", body: `Your KYB Basic baseline report for ${company.name} is being generated.` });
    navigate(`/pkyb/monitoring/${m.id}?new=1`);
  };
  const openExisting = () => {
    if (!existing) return;
    onClose();
    navigate(`/pkyb/monitoring/${existing.id}`);
  };

  return (
    <Dialog
      open={!!company}
      onClose={onClose}
      title={existing ? "Already monitored" : unsupported ? "pKYB isn't available here yet" : "Create a Perpetual KYB Monitor"}
      width={600}
      labelledBy="create-monitor-title"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          {existing ? (
            <Button variant="primary" onClick={openExisting} autoFocus>
              Open existing monitor
            </Button>
          ) : unsupported ? (
            <Button
              variant="primary"
              autoFocus
              onClick={() => {
                onClose();
                navigate(`/report/${company!.id}`);
              }}
            >
              Choose a one-off KYB report
            </Button>
          ) : (
            <Button variant="primary" onClick={confirm} autoFocus>
              Confirm & start monitoring
            </Button>
          )}
        </>
      }
    >
      {company && j && (
        <div className="flex flex-col gap-6">
          <section aria-label="Company">
            <div className="rounded-[6px] border border-line">
              <div className="flex items-start gap-3 p-4">
                <Flag code={company.jurisdiction} className="mt-1 h-4 w-6" />
                <div className="min-w-0">
                  <p className="text-[16px] leading-snug font-semibold text-ink">{company.name}</p>
                  {company.localName && <p className="text-[14px] text-ink-2">{company.localName}</p>}
                  <p className="mt-1 text-[12px] text-ink-3">
                    {j.name} · {j.regLabel} <span className="tnum text-ink-2">{company.regNo}</span>
                  </p>
                </div>
              </div>
              <p className="flex items-start gap-2 border-t border-line bg-canvas px-4 py-2.5 text-[13px]">
                {existing ? (
                  <>
                    <CircleCheck className="mt-0.5 size-4 shrink-0 text-brand-700" />
                    <span className="text-ink-2">
                      Monitored since {formatDate(existing.createdAt)}. Opening it won't place a new order or use credits.
                    </span>
                  </>
                ) : unsupported ? (
                  <>
                    <CircleAlert className="mt-0.5 size-4 shrink-0 text-high" />
                    <span className="text-ink">
                      Perpetual KYB doesn't cover {j.name} companies yet. You can still order a one-off KYB report for this company.
                    </span>
                  </>
                ) : (
                  <>
                    <CircleCheck className="mt-0.5 size-4 shrink-0 text-brand-700" />
                    <span className="text-ink-2">
                      {j.regLabel} verified. This company can be monitored in {j.name}.
                    </span>
                  </>
                )}
              </p>
            </div>
          </section>

          {!existing && !unsupported && (
            <>
              <section aria-labelledby="watch-h">
                <h3 id="watch-h" className="text-[14px] font-semibold text-ink">
                  We'll watch 9 change categories for you
                </h3>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {CATEGORIES.map((c) => (
                    <CategoryChip key={c} category={c} showSeverity={false} />
                  ))}
                </div>
                <div className="mt-4 rounded-[6px] bg-canvas px-4 py-3">
                  <h4 className="flex items-center gap-2 text-[13px] font-semibold text-ink">
                    <SlidersHorizontal className="size-4 text-brand-700" /> You define the severity
                  </h4>
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
                  <ul className="mt-2.5 grid gap-x-4 gap-y-2 sm:grid-cols-3">
                    {TIERS.map((t) => (
                      <li key={t.level} className="flex flex-col items-start gap-1">
                        <SeverityPill level={t.level} size="sm" />
                        <span className="text-[12px] text-ink-2">{t.desc}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </section>

              <section aria-labelledby="terms-h">
                <h3 id="terms-h" className="text-[14px] font-semibold text-ink">
                  Order summary
                </h3>
                <dl className="mt-2 divide-y divide-line rounded-[6px] border border-line">
                  <div className="flex items-center justify-between gap-4 px-4 py-3">
                    <dt className="text-[13px]">
                      pKYB monitor
                      <span className="block text-[12px] text-ink-3">
                        Starts {formatDate(iso(TODAY))} · runs until you stop it
                      </span>
                    </dt>
                    <dd className="text-[13px] tnum">10 credits / year</dd>
                  </div>
                  <div className="flex items-start justify-between gap-4 px-4 py-3">
                    <dt className="text-[13px]">
                      <span className="flex flex-wrap items-center gap-2">
                        <FileCheck2 className="size-4 text-brand-700" />
                        KYB Basic report
                        <span className="rounded-[3px] border border-line-strong bg-wash px-1.5 text-[11px] font-semibold text-ink-2">Required</span>
                      </span>
                      <span className="mt-1 block max-w-[40ch] text-[12px] text-ink-2">
                        Attached to this monitor as your baseline and downloaded when monitoring starts. Every later change is compared against it.
                      </span>
                    </dt>
                    <dd className="text-[13px] tnum">xx credits</dd>
                  </div>
                  <div className="flex items-center justify-between gap-4 bg-canvas px-4 py-3">
                    <dt className="text-[14px] font-semibold">Total today</dt>
                    <dd className="text-[14px] font-semibold tnum">10 + xx credits</dd>
                  </div>
                </dl>
              </section>
            </>
          )}
        </div>
      )}
    </Dialog>
  );
}
