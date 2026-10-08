import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowRight, BellRing, FileCheck2, Radar } from "lucide-react";
import { PRICING, SEARCH_COMPANIES, jurisdictionByCode, type Company } from "../data/model";
import { useStore } from "../state/store";
import { CreateMonitorDialog } from "../components/CreateMonitorDialog";
import { Button, Flag, NewTag, cx } from "../components/ui";

const REPORTS = [
  { id: "lite", name: "KYB Lite", desc: "Business overview, basic information" },
  { id: "basic", name: "KYB Basic", desc: "Lite Report, in-depth business information" },
  { id: "basic-plus", name: "KYB Basic Plus", desc: "Basic Report, in-depth business information" },
  { id: "advanced", name: "KYB Advanced", desc: "Basic Report, in-depth business information" },
  { id: "complete", name: "KYB Complete", desc: "Advanced report, risk assessment, compliance checks (AML) and UBO" },
];
const ADDONS = [{ id: "aml", name: "AML Report", desc: "Sanctions, PEP and adverse media screening for the company" }];

export function ChooseReport() {
  const { id } = useParams();
  const company = SEARCH_COMPANIES.find((c) => c.id === id);
  if (!company) {
    return (
      <div className="mx-auto max-w-[640px] px-4 py-24 text-center">
        <h1 className="text-[16px] font-semibold">We couldn't find that company</h1>
        <p className="mt-1 text-[14px] text-content-main">The link may be out of date. Search for the company to choose a report.</p>
        <Link to="/search" className="mt-4 inline-block font-semibold text-content-link hover:underline">
          Search for a company
        </Link>
      </div>
    );
  }
  return <ReportPage company={company} />;
}

function ReportPage({ company }: { company: Company }) {
  const j = jurisdictionByCode[company.jurisdiction];
  const { monitors } = useStore();
  const monitor = monitors.find((m) => m.regNo === company.regNo && m.status === "active");
  const [report, setReport] = useState("basic");
  const [addons, setAddons] = useState<string[]>([]);
  const [lang, setLang] = useState({ en: true, cn: false });
  const [creating, setCreating] = useState(false);
  const selected = REPORTS.find((r) => r.id === report)!;

  return (
    <div className="mx-auto max-w-[1280px] px-4 pt-4 pb-16 lg:px-8">
      <nav aria-label="Report types" className="-mx-4 mb-6 flex gap-6 overflow-x-auto border-b border-border-subtle px-4 text-[13px] lg:mx-0 lg:px-0">
        {["Our Products", "Know Your Business (KYB)", "Ultimate Beneficial Owner (UBO)", "Legal Documents"].map((t, i) => (
          <span
            key={t}
            className={cx("shrink-0 border-b-2 py-2.5 whitespace-nowrap", i === 1 ? "border-interactive-primary font-semibold text-interactive-primary" : "border-transparent text-content-main")}
          >
            {t}
          </span>
        ))}
      </nav>

      <header className="mb-8 flex flex-wrap items-start justify-between gap-x-6 gap-y-4">
        <div className="min-w-0">
        <div className="flex items-center gap-3">
          <h1 className="text-[26px] leading-tight font-semibold tracking-[-0.01em] text-content-primary">{company.name}</h1>
          <Flag code={company.jurisdiction} className="h-4 w-6 shrink-0" />
        </div>
        {company.localName && <p className="mt-0.5 text-[16px] text-content-main">{company.localName}</p>}
        <p className="mt-1 text-[13px] text-content-tertiary">
          {j.regLabel} <span className="tnum">{company.regNo}</span>
        </p>
        </div>
        {monitor ? (
          <Link
            to={`/pkyb/monitoring/${monitor.id}`}
            className="inline-flex h-9 items-center gap-2 rounded-[4px] border border-interactive-primary px-4 text-[14px] font-semibold text-interactive-primary hover:bg-interactive-accent"
          >
            <span className="size-1.5 rounded-full bg-interactive-primary" /> Monitoring · View pKYB
          </Link>
        ) : (
          <div className="flex flex-col items-end gap-1 max-sm:items-start">
            <Button variant="secondary" onClick={() => setCreating(true)}>
              <Radar className="size-4" /> Create pKYB monitor
            </Button>
            <span className="text-[12px] text-content-tertiary">{PRICING.monitorCredits} credits / year · KYB Basic baseline required</span>
          </div>
        )}
      </header>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="flex flex-col gap-8">
          <section aria-labelledby="kyb-h">
            <div className="mb-3 flex items-baseline justify-between">
              <h2 id="kyb-h" tabIndex={-1} className="text-[16px] font-semibold focus:outline-none">
                Know Your Business (KYB) Reports
              </h2>
              <div className="flex gap-4 text-[13px]">
                <button className="font-semibold text-content-link hover:underline">Configure</button>
                <button className="text-content-main hover:text-content-primary">Compare</button>
              </div>
            </div>
            <div role="radiogroup" aria-labelledby="kyb-h" className="divide-y divide-border-subtle overflow-hidden rounded-[6px] border border-border-subtle bg-white">
              {REPORTS.map((r) => (
                <label key={r.id} className={cx("flex cursor-pointer items-start gap-4 px-4 py-4 transition-colors", report === r.id ? "bg-interactive-accent/60" : "hover:bg-base-contrast")}>
                  <input
                    type="radio"
                    name="report"
                    checked={report === r.id}
                    onChange={() => setReport(r.id)}
                    className="mt-1 size-4 accent-interactive-primary"
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block text-[14px] font-semibold text-content-primary">{r.name}</span>
                    <span className="block text-[13px] text-content-main">{r.desc}</span>
                  </span>
                  <span className="text-[13px] font-semibold text-interactive-primary">Preview</span>
                </label>
              ))}
            </div>
          </section>

          <section aria-labelledby="addon-h">
            <h2 id="addon-h" className="text-[16px] font-semibold">
              Report Add-Ons
            </h2>
            <p className="mb-3 text-[13px] text-content-main">Choose multiple add-ons for your selected report.</p>
            <div className="divide-y divide-border-subtle overflow-hidden rounded-[6px] border border-border-subtle bg-white">
              {ADDONS.map((a) => (
                <label key={a.id} className="flex cursor-pointer items-start gap-4 px-4 py-4 hover:bg-base-contrast">
                  <input
                    type="checkbox"
                    checked={addons.includes(a.id)}
                    onChange={(e) => setAddons((x) => (e.target.checked ? [...x, a.id] : x.filter((y) => y !== a.id)))}
                    className="mt-1 size-4 accent-interactive-primary"
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block text-[14px] font-semibold">{a.name}</span>
                    <span className="block text-[13px] text-content-main">{a.desc}</span>
                  </span>
                  <span className="text-[13px] font-semibold text-interactive-primary">Preview</span>
                </label>
              ))}
            </div>
          </section>
        </div>

        <aside className="flex flex-col gap-4 lg:sticky lg:top-[80px] lg:self-start">
          <section aria-labelledby="your-h" className="rounded-[6px] border border-border-subtle bg-white p-5">
            <h2 id="your-h" className="text-[16px] font-semibold">
              Your Report
            </h2>
            <p className="mt-0.5 text-[13px] text-content-main">
              {selected.name}
              {addons.length > 0 && " + AML Report"}
            </p>
            <div className="mt-4 flex items-center justify-between border-t border-border-subtle pt-4">
              <span className="text-[13px] text-content-main">Language</span>
              <div className="flex gap-4">
                {(["en", "cn"] as const).map((l) => (
                  <label key={l} className="flex items-center gap-1.5 text-[13px]">
                    <input type="checkbox" checked={lang[l]} onChange={(e) => setLang((s) => ({ ...s, [l]: e.target.checked }))} className="size-4 accent-interactive-primary" />
                    {l.toUpperCase()}
                  </label>
                ))}
              </div>
            </div>
            <div className="mt-5 grid grid-cols-2 gap-3">
              <Button variant="secondary">Add to cart</Button>
              <Button variant="primary">Generate report</Button>
            </div>
          </section>

          <section aria-labelledby="pkyb-h" className="overflow-hidden rounded-[6px] border border-border-accent bg-white">
            <div className="flex items-center gap-2 bg-interactive-accent px-5 py-3">
              <Radar className="size-4 text-interactive-primary" />
              <h2 id="pkyb-h" className="text-[14px] font-semibold text-interactive-control">
                Keep watching this company
              </h2>
              <NewTag />
            </div>
            <div className="px-5 pt-4 pb-5">
              {monitor ? (
                <>
                  <p className="text-[13px] text-content-main">
                    This company is already being monitored. Checks run automatically and changes appear in Monitoring.
                  </p>
                  <Link
                    to={`/pkyb/monitoring/${monitor.id}`}
                    className="mt-4 inline-flex h-9 w-full items-center justify-center gap-1.5 rounded-[4px] border border-interactive-primary text-[14px] font-semibold text-interactive-primary hover:bg-interactive-accent"
                  >
                    View pKYB monitor <ArrowRight className="size-4" />
                  </Link>
                </>
              ) : (
                <>
                  <p className="text-[13px] text-content-main">Perpetual KYB flags registry changes after today's check, so you don't have to re-run reports.</p>
                  <ol className="mt-4 flex flex-col gap-3">
                    <li className="flex gap-3">
                      <FileCheck2 className="mt-0.5 size-4 shrink-0 text-interactive-primary" />
                      <span className="text-[13px]">
                        <span className="font-semibold">KYB Basic baseline</span>
                        <span className="block text-content-main">Required. Generated when you start.</span>
                      </span>
                    </li>
                    <li className="flex gap-3">
                      <Radar className="mt-0.5 size-4 shrink-0 text-interactive-primary" />
                      <span className="text-[13px]">
                        <span className="font-semibold">9 change categories watched</span>
                        <span className="block text-content-main">Checks run automatically until you stop.</span>
                      </span>
                    </li>
                    <li className="flex gap-3">
                      <BellRing className="mt-0.5 size-4 shrink-0 text-interactive-primary" />
                      <span className="text-[13px]">
                        <span className="font-semibold">Alerts by your severity</span>
                        <span className="block text-content-main">In-app and email digests.</span>
                      </span>
                    </li>
                  </ol>
                  <div className="mt-4 flex items-baseline justify-between border-t border-border-subtle pt-3 text-[13px]">
                    <span className="text-content-main">Monitor</span>
                    <span className="font-semibold tnum">{PRICING.monitorCredits} credits / year</span>
                  </div>
                  <Button variant="link" className="mt-3" onClick={() => setCreating(true)}>
                    Create pKYB monitor <ArrowRight className="size-4" />
                  </Button>
                </>
              )}
            </div>
          </section>
        </aside>
      </div>

      <CreateMonitorDialog company={creating ? company : null} onClose={() => setCreating(false)} />
    </div>
  );
}
