import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Radar } from "lucide-react";
import { JURISDICTIONS, SEARCH_COMPANIES, jurisdictionByCode, type Company } from "../data/model";
import { useStore } from "../state/store";
import { CreateMonitorDialog } from "../components/CreateMonitorDialog";
import { Button, Flag, cx } from "../components/ui";

export function SearchPage() {
  const [params, setParams] = useSearchParams();
  const q = params.get("q") ?? "Shenzhen";
  const [draft, setDraft] = useState(q);
  const [jur, setJur] = useState("all");
  const [filter, setFilter] = useState<string>("all");
  const [creating, setCreating] = useState<Company | null>(null);
  const { monitors } = useStore();
  const fromPkyb = params.get("from") === "pkyb";

  const results = useMemo(
    () => SEARCH_COMPANIES.filter((c) => (c.name + (c.localName ?? "") + c.regNo).toLowerCase().includes(q.toLowerCase()) && (jur === "all" || c.jurisdiction === jur)),
    [q, jur],
  );
  const groups = useMemo(() => {
    const m = new Map<string, number>();
    results.forEach((r) => m.set(r.jurisdiction, (m.get(r.jurisdiction) ?? 0) + 1));
    return [...m.entries()];
  }, [results]);
  const shown = filter === "all" ? results : results.filter((r) => r.jurisdiction === filter);

  return (
    <div className="mx-auto max-w-[1280px] px-4 pt-6 pb-16 lg:px-8">
      {fromPkyb && (
        <div className="mb-4 flex items-center gap-3 rounded-[6px] border border-brand-300 bg-brand-50 px-4 py-3 text-[13px] text-brand-800">
          <Radar className="size-4 shrink-0" />
          <span>
            Find the company you want to monitor, then choose <span className="font-semibold">Create pKYB monitor</span> in its row.
          </span>
        </div>
      )}
      <form
        className="rounded-[6px] border border-line bg-white p-5 lg:p-6"
        onSubmit={(e) => {
          e.preventDefault();
          const next = new URLSearchParams(params);
          next.set("q", draft);
          setParams(next);
          setFilter("all");
        }}
      >
        <h1 className="text-[26px] font-semibold tracking-[-0.01em]">Search for a business to verify</h1>
        <div className="mt-4 grid gap-3 sm:grid-cols-[220px_minmax(0,1fr)_auto] sm:items-end">
          <label className="flex flex-col gap-1">
            <span className="text-[12px] font-medium text-ink-2">Jurisdiction</span>
            <select value={jur} onChange={(e) => setJur(e.target.value)} className="h-10 rounded-[4px] border border-line-strong bg-white px-2.5 text-[14px] focus:border-brand-600 max-sm:h-11 max-sm:text-[16px]">
              <option value="all">All jurisdictions</option>
              {JURISDICTIONS.map((j) => (
                <option key={j.code} value={j.code}>
                  {j.name}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-[12px] font-medium text-ink-2">Business Name / Registration No.</span>
            <input value={draft} onChange={(e) => setDraft(e.target.value)} className="h-10 rounded-[4px] border border-line-strong px-3 text-[14px] focus:border-brand-600 max-sm:h-11 max-sm:text-[16px]" />
          </label>
          <Button variant="primary" type="submit" className="h-10 px-6">
            Search
          </Button>
        </div>
      </form>

      <h2 className="mt-8 mb-4 text-[18px] font-semibold">
        {results.length} {results.length === 1 ? "company" : "companies"} found for ‘{q}’
      </h2>

      <div className="grid gap-6 lg:grid-cols-[200px_minmax(0,1fr)]">
        <div className="min-w-0">
          <p className="mb-2 text-[12px] font-semibold text-ink-2">Filter by jurisdiction</p>
          <div className="flex gap-1 overflow-x-auto lg:flex-col">
            {[["all", results.length] as [string, number], ...groups].map(([code, n]) => (
              <button
                key={code}
                aria-pressed={filter === code}
                onClick={() => setFilter(code)}
                className={cx(
                  "flex h-9 shrink-0 items-center justify-between gap-3 rounded-[4px] px-3 text-left text-[13px]",
                  filter === code ? "bg-brand-50 font-semibold text-brand-800" : "text-ink-2 hover:bg-wash",
                )}
              >
                <span>{code === "all" ? "All jurisdictions" : jurisdictionByCode[code].name}</span>
                <span className="tnum text-ink-3">{n}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="min-w-0 overflow-hidden rounded-[6px] border border-line bg-white">
          <ul className="divide-y divide-line md:hidden">
            {shown.map((c) => {
              const mon = monitors.find((m) => m.regNo === c.regNo && m.status === "active");
              return (
                <li key={c.id} className="px-4 py-3.5">
                  <p className="font-semibold text-ink">{c.name}</p>
                  {c.localName && <p className="text-[13px] text-ink-2">{c.localName}</p>}
                  <p className="mt-1 flex items-center gap-1.5 text-[12px] text-ink-3">
                    <Flag code={c.jurisdiction} /> {jurisdictionByCode[c.jurisdiction].name} · <span className="tnum">{c.regNo}</span>
                  </p>
                  <div className="mt-3 flex items-center gap-2">
                    {mon ? (
                      <Link to={`/pkyb/monitoring/${mon.id}`} className="inline-flex h-8 items-center gap-1.5 rounded-full bg-brand-50 px-3 text-[12px] font-semibold text-brand-800">
                        <span className="size-1.5 rounded-full bg-brand-600" /> Monitoring
                      </Link>
                    ) : (
                      <Button size="sm" variant="secondary" onClick={() => setCreating(c)}>
                        <Radar className="size-3.5" /> Create pKYB monitor
                      </Button>
                    )}
                    <Link to={`/report/${c.id}`} className="inline-flex h-8 items-center px-2 text-[13px] font-semibold text-brand-700">
                      View
                    </Link>
                  </div>
                </li>
              );
            })}
          </ul>
          <div className="overflow-x-auto max-md:hidden">
          <table className="w-full min-w-[720px] text-left text-[13px]">
            <thead className="border-b border-line bg-wash text-[12px] text-ink-2">
              <tr>
                <th className="px-4 py-2.5 font-semibold">Country</th>
                <th className="px-4 py-2.5 font-semibold">Business name</th>
                <th className="px-4 py-2.5 font-semibold">Reg. No.</th>
                <th className="px-4 py-2.5 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {shown.map((c) => {
                const mon = monitors.find((m) => m.regNo === c.regNo && m.status === "active");
                return (
                  <tr key={c.id} className="hover:bg-canvas">
                    <td className="px-4 py-3">
                      <span className="flex items-center gap-2">
                        <Flag code={c.jurisdiction} />
                        {jurisdictionByCode[c.jurisdiction].name}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="block font-semibold text-ink">{c.name}</span>
                      {c.localName && <span className="block text-ink-2">{c.localName}</span>}
                    </td>
                    <td className="px-4 py-3 tnum text-ink-2">{c.regNo}</td>
                    <td className="px-4 py-3">
                      <span className="flex items-center justify-end gap-2">
                        {mon ? (
                          <Link to={`/pkyb/monitoring/${mon.id}`} className="inline-flex h-8 items-center gap-1.5 rounded-full bg-brand-50 px-3 text-[12px] font-semibold text-brand-800 hover:bg-brand-100">
                            <span className="size-1.5 rounded-full bg-brand-600" /> Monitoring
                          </Link>
                        ) : (
                          <Button size="sm" variant="secondary" onClick={() => setCreating(c)}>
                            <Radar className="size-3.5" /> Create pKYB monitor
                          </Button>
                        )}
                        <Link to={`/report/${c.id}`} className="inline-flex h-8 items-center px-2 text-[13px] font-semibold text-brand-700 hover:underline">
                          View
                        </Link>
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          </div>
        </div>
      </div>
      <CreateMonitorDialog company={creating} onClose={() => setCreating(null)} />
    </div>
  );
}
