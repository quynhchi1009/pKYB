// Shared triage logic: the Monitoring table and the company page's queue bar must agree on
// which monitors match a filter and in what order, so both read from here.
import { CATEGORY_LABEL, SEVERITY_LABEL, SEVERITY_RANK, worstSeverity, type Category, type ChangeEvent, type Monitor, type Severity, type SeverityMap } from "./model";

export type Row = {
  m: Monitor;
  latest?: ChangeEvent;
  latestSev?: Severity;
  unreviewed: number;
  unreviewedSev?: Severity;
};

export type Filters = {
  q: string;
  jur: string;
  sev: "all" | Severity;
  cat: string;
  unrev: boolean;
  sort: "severity" | "date";
};

export function filtersFromParams(p: URLSearchParams): Filters {
  return {
    q: p.get("q") ?? "",
    jur: p.get("jur") ?? "all",
    sev: (p.get("sev") as Severity | null) ?? "all",
    cat: p.get("cat") ?? "all",
    unrev: p.get("unrev") === "1",
    sort: p.get("sort") === "date" ? "date" : "severity",
  };
}

/** The row features the most severe unreviewed change; once everything is reviewed, the latest one. */
export function buildRow(m: Monitor, severity: SeverityMap): Row {
  const un = m.events.filter((e) => !e.reviewed);
  let focus: ChangeEvent | undefined;
  let unSev: Severity | undefined;
  for (const e of un) {
    const s = worstSeverity(e.categories, severity);
    if (!unSev || SEVERITY_RANK[s] > SEVERITY_RANK[unSev]) (unSev = s), (focus = e);
  }
  const latest = focus ?? m.events[0];
  return { m, latest, latestSev: latest && worstSeverity(latest.categories, severity), unreviewed: un.length, unreviewedSev: unSev };
}

export function applyFilters(rows: Row[], f: Filters): Row[] {
  const needle = f.q.trim().toLowerCase();
  const out = rows.filter((r) => {
    if (needle && !(r.m.name.toLowerCase().includes(needle) || r.m.regNo.toLowerCase().includes(needle) || (r.m.localName ?? "").includes(needle))) return false;
    if (f.jur !== "all" && r.m.jurisdiction !== f.jur) return false;
    if (f.unrev && !r.unreviewed) return false;
    if (f.sev !== "all" && r.latestSev !== f.sev) return false;
    if (f.cat !== "all" && !r.latest?.categories.includes(f.cat as Category)) return false;
    return true;
  });
  const rank = (r: Row) => (r.unreviewedSev ? 10 + SEVERITY_RANK[r.unreviewedSev] : r.latestSev ? SEVERITY_RANK[r.latestSev] : 0);
  const byDate = (a: Row, b: Row) => ((b.latest?.date ?? "") > (a.latest?.date ?? "") ? 1 : (b.latest?.date ?? "") < (a.latest?.date ?? "") ? -1 : 0);
  out.sort((a, b) => (f.sort === "severity" ? rank(b) - rank(a) || byDate(a, b) : byDate(a, b)));
  return out;
}

/** Short human label for a filter set, e.g. "High · Unreviewed". */
export function describeFilters(f: Filters): string {
  const parts: string[] = [];
  if (f.sev !== "all") parts.push(SEVERITY_LABEL[f.sev]);
  if (f.cat !== "all") parts.push(CATEGORY_LABEL[f.cat as Category]);
  if (f.unrev) parts.push("Unreviewed");
  if (f.jur !== "all") parts.push(f.jur);
  if (f.q.trim()) parts.push(`“${f.q.trim()}”`);
  return parts.length ? parts.join(" · ") : "All active monitors";
}
