import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowRight, BadgeCheck, Bookmark, BookmarkCheck, ChevronDown, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Download, Radar, Share2 } from "lucide-react";
import { jurisdictionByCode, reportFacts, type Monitor, type ReportFacts } from "../data/model";
import { useStore } from "../state/store";
import { Flag, cx, formatDate, nf } from "../components/ui";

type Section = { id: string; label: string; page: number; children?: Array<{ id: string; label: string }> };

// Section names and order follow the Portal's KYB Basic report viewer.
const SECTIONS: Section[] = [
  { id: "cover", label: "Cover Page", page: 1 },
  { id: "risk-overview", label: "Risk Overview", page: 2 },
  {
    id: "company",
    label: "Company Information",
    page: 2,
    children: [
      { id: "company-registration", label: "Registration" },
      { id: "company-activity", label: "Business activity" },
      { id: "company-capital", label: "Capital" },
    ],
  },
  { id: "directors", label: "Directors & Officers", page: 3 },
  { id: "shareholders", label: "Shareholders", page: 3 },
  { id: "joint-shareholders", label: "Joint Shareholders", page: 3 },
  { id: "risk-assessment", label: "Risk Assessment", page: 3 },
  { id: "ubo", label: "UBO (Ultimate Beneficial Owner)", page: 3 },
  { id: "history", label: "Historical Changes", page: 3 },
  { id: "branches", label: "Branches", page: 3 },
  { id: "legal-alerts", label: "Legal Alerts", page: 3 },
  { id: "sources", label: "Data Source & Disclaimers", page: 3 },
];
const PAGES = 3;
const pageOf = (id: string) => SECTIONS.find((s) => s.id === id || s.children?.some((c) => c.id === id))?.page ?? 1;

const RECOMMENDATIONS = ["Onboard", "Review before onboarding", "Risk identified"] as const;

/** The KYB Basic report a pKYB monitor was ordered with. It is the baseline every later change is compared against. */
export function ViewReport() {
  const { id } = useParams();
  const { monitors } = useStore();
  const m = monitors.find((x) => x.id === id);
  if (!m || m.status === "inactive") {
    return (
      <div className="mx-auto max-w-[640px] px-4 py-24 text-center">
        <p className="text-[16px] font-semibold">{m ? "This monitor has no baseline report" : "We couldn't find that report"}</p>
        <p className="mt-1 text-[14px] text-ink-2">
          {m ? "Setup failed before the KYB Basic report was generated." : "The link may be out of date. Open the company from Monitoring to find its report."}
        </p>
        <Link to={m ? `/pkyb/monitoring/${m.id}` : "/pkyb/monitoring"} className="mt-4 inline-block font-semibold text-brand-700 hover:underline">
          {m ? "View pKYB" : "Go to Monitoring"}
        </Link>
      </div>
    );
  }
  return <Report m={m} />;
}

function Report({ m }: { m: Monitor }) {
  const { toast } = useStore();
  const j = jurisdictionByCode[m.jurisdiction];
  const facts = useMemo(() => reportFacts(m), [m]);
  const [page, setPage] = useState(1);
  const [active, setActive] = useState("cover");
  const [companyOpen, setCompanyOpen] = useState(true);
  const [lang, setLang] = useState<"en" | "og">("en");
  const [recommendation, setRecommendation] = useState<(typeof RECOMMENDATIONS)[number] | null>(null);
  const pending = useRef<string | null>(null);
  const showLocal = lang === "og" && !!m.localName;

  const jump = (sectionId: string) => {
    pending.current = sectionId;
    setActive(sectionId);
    setPage(pageOf(sectionId));
  };
  const goPage = (p: number) => {
    const next = Math.min(PAGES, Math.max(1, p));
    jump(SECTIONS.find((s) => s.page === next)!.id);
  };

  // After a page change, bring the requested section to the top of the viewport.
  useEffect(() => {
    const target = pending.current;
    if (!target) return;
    pending.current = null;
    const el = document.getElementById(`sec-${target}`);
    el?.scrollIntoView({ block: "start" });
  }, [page, active]);

  // Keep "Jump to section" in step with what the reader is looking at.
  useEffect(() => {
    const els = SECTIONS.filter((s) => s.page === page).flatMap((s) => [s.id, ...(s.children?.map((c) => c.id) ?? [])]).map((sid) => document.getElementById(`sec-${sid}`)).filter(Boolean) as HTMLElement[];
    const io = new IntersectionObserver(
      (entries) => {
        if (pending.current) return;
        const top = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (top) setActive(top.target.id.replace(/^sec-/, ""));
      },
      { rootMargin: "-120px 0px -60% 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [page]);

  const name = showLocal ? m.localName! : m.name;

  return (
    <div className="mx-auto max-w-[1360px] px-4 pt-6 pb-16 lg:px-8">
      <header className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between lg:gap-8">
        <div className="min-w-0 lg:flex-1">
          <h1 className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[24px] leading-tight font-semibold tracking-[-0.01em] text-ink">
            <span>
              {m.name}
              {m.localName && (
                <>
                  <span className="mx-2 font-normal text-ink-3" aria-hidden>
                    |
                  </span>
                  <span lang="zh">{m.localName}</span>
                </>
              )}
            </span>
            <Flag code={m.jurisdiction} className="h-5 w-[30px] shrink-0" />
          </h1>
          <p className="mt-1.5 text-[13px] tracking-[0.04em] text-ink-2 uppercase">
            {j.regLabel} <span className="tnum tracking-normal text-ink">{m.regNo}</span>
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-4 max-lg:flex-row-reverse max-lg:justify-end max-sm:flex-col max-sm:items-stretch max-sm:gap-2">
          <p className="text-[12px] leading-snug max-sm:order-2 lg:text-right">
            <span className="flex items-center gap-1.5 font-semibold text-ink-2 lg:justify-end">
              <span className={cx("size-1.5 rounded-full", m.status === "active" ? "bg-brand-600" : "bg-ink-3")} aria-hidden />
              {m.status === "active" ? "pKYB baseline report" : "pKYB monitor stopped"}
            </span>
            <span className="text-ink-3">
              {m.status === "active" ? `Monitoring since ${formatDate(m.createdAt)}` : `Baseline from ${formatDate(m.createdAt)}`}
            </span>
          </p>
          <Link
            to={`/pkyb/monitoring/${m.id}`}
            className="inline-flex h-9 items-center justify-center gap-1.5 rounded-[4px] bg-brand-700 px-4 text-[14px] font-semibold text-white transition-colors duration-150 hover:bg-brand-800 active:bg-navy-800 max-sm:h-11"
          >
            <Radar className="size-4" aria-hidden /> View pKYB <ArrowRight className="size-4" aria-hidden />
          </Link>
        </div>
      </header>

      <div className="rounded-[6px] border border-line bg-white">
        {/* Viewer toolbar */}
        <div className="flex flex-wrap items-center gap-x-6 gap-y-3 border-b border-line px-4 py-3 lg:px-6">
          <div className="flex items-center gap-3">
            <span className="text-[16px] font-semibold text-ink">View report:</span>
            <span className="inline-flex h-9 items-center rounded-[4px] bg-navy-900 px-4 text-[14px] font-semibold text-white">KYB Basic</span>
          </div>

          <div className="ml-auto flex flex-wrap items-center gap-x-4 gap-y-2">
            <nav aria-label="Report pages" className="flex items-center gap-1">
              <span className="mr-2 text-[13px] text-ink-2 tnum" aria-live="polite">
                Page {page} of {PAGES}
              </span>
              <IconBtn label="First page" disabled={page === 1} onClick={() => goPage(1)}>
                <ChevronsLeft className="size-4" />
              </IconBtn>
              <IconBtn label="Previous page" disabled={page === 1} onClick={() => goPage(page - 1)}>
                <ChevronLeft className="size-4" />
              </IconBtn>
              <IconBtn label="Next page" disabled={page === PAGES} onClick={() => goPage(page + 1)}>
                <ChevronRight className="size-4" />
              </IconBtn>
              <IconBtn label="Last page" disabled={page === PAGES} onClick={() => goPage(PAGES)}>
                <ChevronsRight className="size-4" />
              </IconBtn>
            </nav>
            <span className="h-6 w-px bg-line max-sm:hidden" aria-hidden />
            <div className="flex items-center gap-1">
              <IconBtn label="Share report" onClick={() => toast({ title: "Share link copied", body: `Anyone in your organisation can open the KYB Basic report for ${m.name}.` })}>
                <Share2 className="size-[18px]" />
              </IconBtn>
              <IconBtn label="Download report" onClick={() => toast({ title: "Downloading KYB Basic report", body: `${m.name} · generated ${formatDate(facts.generated)}` })}>
                <Download className="size-[18px]" />
              </IconBtn>
              <div role="group" aria-label="Report language" className="ml-1 flex rounded-[4px] bg-wash p-0.5">
                {(["en", "og"] as const).map((l) => (
                  <button
                    key={l}
                    aria-pressed={lang === l}
                    title={l === "en" ? "English" : "Original language"}
                    onClick={() => setLang(l)}
                    className={cx(
                      "h-8 rounded-[3px] px-3 text-[13px] font-semibold transition-colors",
                      lang === l ? "bg-white text-brand-700 shadow-[0_0_0_1px_var(--color-line)]" : "text-ink-2 hover:text-ink",
                    )}
                  >
                    {l.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-[272px_minmax(0,1fr)]">
          {/* Section rail */}
          <aside className="border-line bg-canvas/70 max-lg:border-b lg:border-r">
            <div className="lg:sticky lg:top-14 lg:max-h-[calc(100dvh-56px)] lg:overflow-y-auto">
              <div className="px-4 py-4 lg:hidden">
                <label htmlFor="jump" className="mb-1 block text-[12px] font-medium text-ink-2">
                  Jump to section
                </label>
                <select
                  id="jump"
                  value={active}
                  onChange={(e) => jump(e.target.value)}
                  className="h-11 w-full rounded-[4px] border border-line-strong bg-white px-2.5 text-[16px] text-ink"
                >
                  {SECTIONS.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>

              <nav aria-labelledby="jump-h" className="px-3 pt-5 pb-4 max-lg:hidden">
                <h2 id="jump-h" className="px-3 pb-2 text-[12px] font-semibold tracking-[0.06em] text-ink-3 uppercase">
                  Jump to section
                </h2>
                <ul className="flex flex-col">
                  {SECTIONS.map((s) => {
                    const isActive = active === s.id || !!s.children?.some((c) => c.id === active);
                    return (
                      <li key={s.id}>
                        <div className="relative flex items-center">
                          <button
                            onClick={() => jump(s.id)}
                            aria-current={isActive ? "location" : undefined}
                            className={cx(
                              "relative flex min-h-10 flex-1 items-center rounded-[4px] px-3 py-2 text-left text-[14px] transition-colors",
                              isActive
                                ? "bg-brand-50 font-semibold text-brand-800 before:absolute before:inset-y-1.5 before:left-0 before:w-[2px] before:rounded-full before:bg-brand-700"
                                : "text-ink-2 hover:bg-wash hover:text-ink",
                            )}
                          >
                            {s.label}
                          </button>
                          {s.children && (
                            <button
                              onClick={() => setCompanyOpen((o) => !o)}
                              aria-expanded={companyOpen}
                              aria-label={`${companyOpen ? "Hide" : "Show"} ${s.label} subsections`}
                              className="absolute right-1 grid size-8 place-items-center rounded-[4px] text-ink-3 hover:bg-wash hover:text-ink"
                            >
                              <ChevronDown className={cx("size-4 transition-transform", !companyOpen && "-rotate-90")} />
                            </button>
                          )}
                        </div>
                        {s.children && companyOpen && (
                          <ul className="mb-1 ml-6 border-l border-line pl-2">
                            {s.children.map((c) => (
                              <li key={c.id}>
                                <button
                                  onClick={() => jump(c.id)}
                                  aria-current={active === c.id ? "location" : undefined}
                                  className={cx(
                                    "flex min-h-8 w-full items-center rounded-[4px] px-3 text-left text-[13px] transition-colors",
                                    active === c.id ? "font-semibold text-brand-800" : "text-ink-2 hover:bg-wash hover:text-ink",
                                  )}
                                >
                                  {c.label}
                                </button>
                              </li>
                            ))}
                          </ul>
                        )}
                      </li>
                    );
                  })}
                </ul>

                <div className="mt-4 border-t border-line pt-5">
                  <h2 id="rec-h" className="px-3 pb-2 text-[12px] font-semibold tracking-[0.06em] text-ink-3 uppercase">
                    Share recommendation
                  </h2>
                  <ul aria-labelledby="rec-h" className="flex flex-col">
                    {RECOMMENDATIONS.map((r) => {
                      const on = recommendation === r;
                      const Icon = on ? BookmarkCheck : Bookmark;
                      return (
                        <li key={r}>
                          <button
                            aria-pressed={on}
                            onClick={() => {
                              setRecommendation(on ? null : r);
                              if (!on) toast({ title: "Recommendation saved", body: `"${r}" is attached to this report for your team.` });
                            }}
                            className={cx(
                              "flex min-h-10 w-full items-center gap-2.5 rounded-[4px] px-3 text-left text-[14px] transition-colors",
                              on ? "font-semibold text-brand-800" : "text-ink-2 hover:bg-wash hover:text-ink",
                            )}
                          >
                            <Icon className={cx("size-[18px] shrink-0", on ? "text-brand-700" : "text-ink-3")} strokeWidth={1.75} />
                            {r}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>

                <div className="mt-4 border-t border-line pt-5">
                  <h2 className="px-3 pb-2 text-[12px] font-semibold tracking-[0.06em] text-ink-3 uppercase">Add-ons</h2>
                  <div className="flex items-start justify-between gap-3 px-3 py-1">
                    <span className="text-[13px]">
                      <span className="block font-semibold text-ink">AML Report</span>
                      <span className="block text-ink-2">Sanctions, PEP and adverse media</span>
                    </span>
                    <button
                      onClick={() => toast({ title: "AML Report added to cart", body: `For ${m.name}. You'll see the price at checkout.` })}
                      className="-mr-1 inline-flex h-8 shrink-0 items-center px-1 text-[13px] font-semibold text-brand-700 hover:underline"
                    >
                      Add
                    </button>
                  </div>
                </div>
              </nav>
            </div>
          </aside>

          {/* Report pages */}
          <div className="min-w-0 px-4 py-5 lg:px-6 lg:py-6">
            {page === 1 && (
              <ReportSection id="cover" title="Cover Page">
                <Cover m={m} facts={facts} name={name} showLocal={showLocal} />
              </ReportSection>
            )}
            {page === 2 && <PageTwo m={m} facts={facts} name={name} />}
            {page === 3 && <PageThree m={m} facts={facts} />}

            <div className="mt-8 flex items-center justify-between border-t border-line pt-4">
              <button
                onClick={() => goPage(page - 1)}
                disabled={page === 1}
                className="inline-flex h-9 items-center gap-1.5 rounded-[4px] px-3 text-[14px] font-semibold whitespace-nowrap text-ink-2 hover:bg-wash hover:text-ink disabled:invisible"
              >
                <ChevronLeft className="size-4" /> Previous page
              </button>
              <span className="text-[12px] whitespace-nowrap text-ink-3 tnum max-sm:hidden">
                Page {page} of {PAGES}
              </span>
              <button
                onClick={() => goPage(page + 1)}
                disabled={page === PAGES}
                className="inline-flex h-9 items-center gap-1.5 rounded-[4px] px-3 text-[14px] font-semibold whitespace-nowrap text-brand-700 hover:bg-brand-50 disabled:invisible"
              >
                Next page <ChevronRight className="size-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function IconBtn({ label, children, ...rest }: { label: string; children: ReactNode; disabled?: boolean; onClick?: () => void }) {
  return (
    <button
      aria-label={label}
      title={label}
      className="grid size-9 place-items-center rounded-[4px] text-ink-2 transition-colors hover:bg-wash hover:text-ink disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent"
      {...rest}
    >
      {children}
    </button>
  );
}

function ReportSection({ id, title, children, level = 2 }: { id: string; title: string; children: ReactNode; level?: 2 | 3 }) {
  const H = level === 2 ? "h2" : "h3";
  return (
    <section id={`sec-${id}`} aria-labelledby={`h-${id}`} className="scroll-mt-[72px]">
      {level === 2 ? (
        <H id={`h-${id}`} className="border-b-2 border-brand-700 bg-brand-50 px-4 py-2.5 text-[18px] font-semibold text-brand-800">
          {title}
        </H>
      ) : (
        <H id={`h-${id}`} className="mb-2 text-[14px] font-semibold text-ink">
          {title}
        </H>
      )}
      <div className={level === 2 ? "pt-4" : undefined}>{children}</div>
    </section>
  );
}

/** The printed cover: a typographic sheet in the report's mint-to-sky wash, with the vertical REPORT band. */
function Cover({ m, facts, name, showLocal }: { m: Monitor; facts: ReportFacts; name: string; showLocal: boolean }) {
  return (
    <div className="@container relative mx-auto aspect-[1/1.32] w-full max-w-[780px] overflow-hidden border border-line bg-[linear-gradient(165deg,#eef6f1_0%,#e7eff3_58%,#eef6e9_100%)]">
      {/* Façade band: a window grid under the vertical REPORT lettering. Decorative. */}
      <div
        aria-hidden
        className="absolute inset-y-0 left-[9%] w-[24%]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(90deg, rgb(255 255 255 / 0.22) 0 1px, transparent 1px 11.5%), repeating-linear-gradient(0deg, rgb(255 255 255 / 0.16) 0 1px, transparent 1px 3.2%), linear-gradient(180deg,#c3d3db 0%,#9db3c0 55%,#7f98a7 100%)",
        }}
      >
        <span className="absolute -bottom-[2%] left-1/2 -translate-x-1/2 rotate-180 text-[26cqw] leading-[0.8] font-bold tracking-[-0.02em] text-white/90 [writing-mode:vertical-rl]">
          REPORT
        </span>
      </div>
      <p aria-hidden className="absolute top-[6%] left-[35.5%] rotate-180 text-[max(11px,1.7cqw)] tracking-[0.3em] text-ink [writing-mode:vertical-rl] tnum">
        No. {facts.reportNo}
      </p>

      <p className="absolute top-[6%] right-[8%] flex items-center gap-1.5 text-[max(13px,2.6cqw)] font-bold tracking-[-0.01em]">
        <BadgeCheck className="size-[1.3em] text-brand-700" strokeWidth={2} aria-hidden />
        <span className="text-brand-700">Asia</span>
        <span className="-ml-1.5 text-navy-900">Verify</span>
      </p>

      <div className="absolute right-[8%] bottom-[7%] left-[42%] text-right">
        <p className="text-[max(12px,1.7cqw)] font-semibold tracking-[0.12em] text-brand-800 uppercase">KYB Basic Report</p>
        <p className="mt-[1.2cqw] text-[max(18px,4.2cqw)] leading-tight font-semibold tracking-[-0.015em] text-ink [text-wrap:balance]" lang={showLocal ? "zh" : undefined}>
          {name}
        </p>
        {m.localName && !showLocal && (
          <p className="mt-[0.6cqw] text-[max(15px,3.4cqw)] leading-tight font-semibold text-ink" lang="zh">
            {m.localName}
          </p>
        )}
        <p className="mt-[2.4cqw] border-t border-ink/15 pt-[1.6cqw] text-[max(11px,1.6cqw)] text-ink-2 tnum">
          {jurisdictionByCode[m.jurisdiction].name} · <span className="whitespace-nowrap">Generated {formatDate(facts.generated)}</span>
        </p>
      </div>
    </div>
  );
}

function Facts({ rows }: { rows: Array<[string, ReactNode]> }) {
  return (
    <dl className="divide-y divide-line rounded-[6px] border border-line text-[13px]">
      {rows.map(([k, v]) => (
        <div key={k} className="grid gap-1 px-4 py-3 sm:grid-cols-[220px_minmax(0,1fr)] sm:gap-4">
          <dt className="text-ink-2">{k}</dt>
          <dd className="font-medium text-ink">{v}</dd>
        </div>
      ))}
    </dl>
  );
}

/** A small data table that becomes stacked rows below md. */
function Rows<T>({ cols, rows, empty }: { cols: Array<{ label: string; cell: (r: T) => ReactNode; className?: string }>; rows: T[]; empty: string }) {
  if (rows.length === 0) return <p className="rounded-[6px] border border-line px-4 py-3 text-[13px] text-ink-2">{empty}</p>;
  const grid = { gridTemplateColumns: `minmax(0,1.6fr) ${cols.slice(1).map(() => "minmax(0,1fr)").join(" ")}` };
  return (
    <div role="table" className="rounded-[6px] border border-line text-[13px]">
      <div role="row" className="grid gap-4 border-b border-line px-4 py-2.5 text-[12px] font-semibold text-ink-2 max-md:hidden" style={grid}>
        {cols.map((c) => (
          <span key={c.label} role="columnheader" className={c.className}>
            {c.label}
          </span>
        ))}
      </div>
      <div role="rowgroup" className="divide-y divide-line">
        {rows.map((r, i) => (
          <div key={i} role="row" className="grid gap-x-4 gap-y-0.5 px-4 py-3 max-md:!grid-cols-1" style={grid}>
            {cols.map((c, ci) => (
              <span key={c.label} role="cell" className={cx(ci === 0 ? "font-medium text-ink" : "text-ink-2 max-md:text-[12px]", c.className)}>
                {ci > 0 && <span className="text-ink-3 md:hidden">{c.label}: </span>}
                {c.cell(r)}
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function PageTwo({ m, facts, name }: { m: Monitor; facts: ReportFacts; name: string }) {
  const j = jurisdictionByCode[m.jurisdiction];
  const years = Math.floor((new Date(facts.generated).getTime() - new Date(facts.incorporated).getTime()) / (365.25 * 86400000));
  const ubo = facts.shareholders.filter((s) => s.kind === "Individual" && s.pct >= 25);
  return (
    <div className="flex flex-col gap-8">
      <ReportSection id="risk-overview" title="Risk Overview">
        <p className="mb-4 max-w-[64ch] text-[14px] text-ink-2">
          A summary of the registry record on {formatDate(facts.generated)}. It reflects what the {j.name} registry holds, not a credit or compliance rating.
        </p>
        <Facts
          rows={[
            ["Company status", facts.status],
            ["Years since incorporation", `${nf.format(years)} years`],
            ["Legal alerts", "None found in registry sources"],
            ["Ultimate beneficial owners", ubo.length ? `${ubo.length} individual${ubo.length > 1 ? "s" : ""} with 25% or more` : "None identified at 25% or more"],
            ["Sanctions, PEP and adverse media", "Not included in KYB Basic. Add the AML Report to screen."],
          ]}
        />
      </ReportSection>

      <ReportSection id="company" title="Company Information">
        <div className="flex flex-col gap-6">
          <ReportSection id="company-registration" title="Registration" level={3}>
            <Facts
              rows={[
                ["Registered name", <span lang={name === m.localName ? "zh" : undefined}>{name}</span>],
                ...(m.localName && name !== m.localName ? [["Name in original language", <span lang="zh">{m.localName}</span>] as [string, ReactNode]] : []),
                [j.regLabel, <span className="tnum">{m.regNo}</span>],
                ["Jurisdiction", j.name],
                ["Company type", facts.companyType],
                ["Date of incorporation", <span className="tnum">{formatDate(facts.incorporated)}</span>],
                ["Status", facts.status],
                ["Registered address", facts.address],
              ]}
            />
          </ReportSection>
          <ReportSection id="company-activity" title="Business activity" level={3}>
            <Facts rows={[["Principal activity", facts.activity]]} />
          </ReportSection>
          <ReportSection id="company-capital" title="Capital" level={3}>
            <Facts rows={[[m.jurisdiction === "CN" ? "Registered capital" : "Issued share capital", <span className="tnum">{facts.capital}</span>]]} />
          </ReportSection>
        </div>
      </ReportSection>
    </div>
  );
}

function PageThree({ m, facts }: { m: Monitor; facts: ReportFacts }) {
  const j = jurisdictionByCode[m.jurisdiction];
  const ubo = facts.shareholders.filter((s) => s.kind === "Individual" && s.pct >= 25);
  const years = Math.floor((new Date(facts.generated).getTime() - new Date(facts.incorporated).getTime()) / (365.25 * 86400000));
  const recentOfficers = facts.directors.filter((d) => new Date(facts.generated).getTime() - new Date(d.appointed).getTime() < 365 * 86400000).length;
  return (
    <div className="flex flex-col gap-8">
      <ReportSection id="directors" title="Directors & Officers">
        <Rows
          rows={facts.directors}
          empty="No directors or officers recorded."
          cols={[
            { label: "Name", cell: (d) => d.name },
            { label: "Role", cell: (d) => d.role },
            { label: "Appointed", cell: (d) => <span className="tnum">{formatDate(d.appointed)}</span> },
          ]}
        />
      </ReportSection>

      <ReportSection id="shareholders" title="Shareholders">
        <Rows
          rows={facts.shareholders}
          empty="No shareholders recorded."
          cols={[
            { label: "Name", cell: (s) => s.name },
            { label: "Type", cell: (s) => s.kind },
            { label: "Shareholding", cell: (s) => <span className="tnum">{s.pct}%</span> },
          ]}
        />
      </ReportSection>

      <ReportSection id="joint-shareholders" title="Joint Shareholders">
        <Rows rows={[]} empty="No joint shareholdings recorded." cols={[{ label: "Name", cell: () => null }]} />
      </ReportSection>

      <ReportSection id="risk-assessment" title="Risk Assessment">
        <Facts
          rows={[
            ["Company age", `${nf.format(years)} years`],
            ["Officer appointments in the last 12 months", nf.format(recentOfficers)],
            ["Corporate shareholders", nf.format(facts.shareholders.filter((s) => s.kind === "Corporate").length)],
            ["Registered branches", nf.format(facts.branches.length)],
          ]}
        />
      </ReportSection>

      <ReportSection id="ubo" title="UBO (Ultimate Beneficial Owner)">
        <Rows
          rows={ubo}
          empty="No individual holds 25% or more, directly, in the registry record."
          cols={[
            { label: "Name", cell: (s) => s.name },
            { label: "Basis", cell: () => "Direct shareholding" },
            { label: "Ownership", cell: (s) => <span className="tnum">{s.pct}%</span> },
          ]}
        />
      </ReportSection>

      <ReportSection id="history" title="Historical Changes">
        <Rows
          rows={facts.history}
          empty="No changes recorded before this report."
          cols={[
            { label: "Change", cell: (h) => h.detail },
            { label: "Field", cell: (h) => h.field },
            { label: "Date", cell: (h) => <span className="tnum">{formatDate(h.date)}</span> },
          ]}
        />
        {m.status === "active" && (
          <p className="mt-3 flex flex-wrap items-center gap-x-2 text-[13px] text-ink-2">
            <Radar className="size-4 text-brand-700" aria-hidden />
            Changes after {formatDate(facts.generated)} are tracked by your pKYB monitor.
            <Link to={`/pkyb/monitoring/${m.id}`} className="font-semibold text-brand-700 hover:underline">
              View pKYB
            </Link>
          </p>
        )}
      </ReportSection>

      <ReportSection id="branches" title="Branches">
        <Rows rows={facts.branches} empty="No branches registered." cols={[{ label: "Branch address", cell: (b) => b }]} />
      </ReportSection>

      <ReportSection id="legal-alerts" title="Legal Alerts">
        <p className="rounded-[6px] border border-line px-4 py-3 text-[13px] text-ink-2">No legal alerts found in the registry sources searched for this report.</p>
      </ReportSection>

      <ReportSection id="sources" title="Data Source & Disclaimers">
        <div className="max-w-[68ch] space-y-2 text-[13px] text-ink-2">
          <p>
            Data retrieved from the {j.name} company registry on {formatDate(facts.generated)}. Report No. <span className="tnum">{facts.reportNo}</span>.
          </p>
          <p>This report reflects the registry record at the time of retrieval. Fields the registry does not publish are not shown.</p>
        </div>
      </ReportSection>
    </div>
  );
}
