// Shared triage logic: the Monitoring table and the company page's queue bar must agree on
// which monitors match a filter and in what order, so both read from here.
import { CATEGORY_LABEL, RECENT_DAYS, SEVERITY_LABEL, SEVERITY_RANK, isRecent, worstSeverity, type Category, type ChangeEvent, type Monitor, type Severity, type SeverityMap } from "./model";

export type Row = {
  m: Monitor;
  /** The change the row shows: the most severe recent one (within the category filter, when set), else the latest. */
  latest?: ChangeEvent;
  latestSev?: Severity;
  /** Changes detected in the last RECENT_DAYS days. */
  recent: number;
  /** The company's worst recent severity. The triage chips and the severity filter both use it, so each company counts once. */
  recentSev?: Severity;
  /** Date of the company's newest detected change, which the date sort uses. */
  newest?: string;
};

export type Filters = {
  q: string;
  jur: string;
  sev: "all" | Severity;
  cat: string;
  recent: boolean;
  sort: "severity" | "date";
};

export function filtersFromParams(p: URLSearchParams): Filters {
  return {
    q: p.get("q") ?? "",
    jur: p.get("jur") ?? "all",
    sev: (p.get("sev") as Severity | null) ?? "all",
    cat: p.get("cat") ?? "all",
    recent: p.get("recent") === "1",
    sort: p.get("sort") === "date" ? "date" : "severity",
  };
}

/** The most severe of these changes (ties go to the newest, since events are newest first). */
function mostSevere(events: ChangeEvent[], severity: SeverityMap): { event?: ChangeEvent; sev?: Severity } {
  let event: ChangeEvent | undefined;
  let sev: Severity | undefined;
  for (const e of events) {
    const s = worstSeverity(e.categories, severity);
    if (!sev || SEVERITY_RANK[s] > SEVERITY_RANK[sev]) (sev = s), (event = e);
  }
  return { event, sev };
}

/** The row features the most severe recent change; with nothing recent, the latest one. */
export function buildRow(m: Monitor, severity: SeverityMap, category?: Category): Row {
  const rec = m.events.filter(isRecent);
  const { sev: recSev } = mostSevere(rec, severity);
  const pool = category ? rec.filter((e) => e.categories.includes(category)) : rec;
  const focus = mostSevere(pool, severity).event;
  const latest = focus ?? (category ? m.events.find((e) => e.categories.includes(category)) : m.events[0]);
  return { m, latest, latestSev: latest && worstSeverity(latest.categories, severity), recent: rec.length, recentSev: recSev, newest: m.events[0]?.date };
}

/** Recent changes besides the one the row shows. */
export function moreRecent(r: Row): number {
  return r.latest && isRecent(r.latest) ? r.recent - 1 : r.recent;
}

/**
 * Severity matches a company's worst recent severity (its latest change's, when nothing is recent), so each
 * company sits in exactly one tier and the triage chips add up. Category matches any recent change, and the
 * row then features the matching change, so a sweep for one category never misses a company whose worst change
 * is something else.
 */
export function applyFilters(rows: Row[], f: Filters, severity?: SeverityMap): Row[] {
  const needle = f.q.trim().toLowerCase();
  const cat = f.cat !== "all" ? (f.cat as Category) : undefined;
  const out: Row[] = [];
  for (const row of rows) {
    const r = cat && severity ? buildRow(row.m, severity, cat) : row;
    if (needle && !(r.m.name.toLowerCase().includes(needle) || r.m.regNo.toLowerCase().includes(needle) || (r.m.localName ?? "").includes(needle))) continue;
    if (f.jur !== "all" && r.m.jurisdiction !== f.jur) continue;
    if (f.recent && !r.recent) continue;
    if (f.sev !== "all" && (r.recentSev ?? r.latestSev) !== f.sev) continue;
    if (cat) {
      const hasRecent = r.m.events.some((e) => isRecent(e) && e.categories.includes(cat));
      const latestMatches = !r.recent && r.m.events[0]?.categories.includes(cat);
      if (!hasRecent && !latestMatches) continue;
    }
    out.push(r);
  }
  const rank = (r: Row) => (r.recentSev ? 10 + SEVERITY_RANK[r.recentSev] : r.latestSev ? SEVERITY_RANK[r.latestSev] : 0);
  const byDate = (a: Row, b: Row) => ((b.newest ?? "") > (a.newest ?? "") ? 1 : (b.newest ?? "") < (a.newest ?? "") ? -1 : 0);
  out.sort((a, b) => (f.sort === "severity" ? rank(b) - rank(a) || byDate(a, b) : byDate(a, b)));
  return out;
}

/** Short human label for a filter set, e.g. "High · Last 30 days". */
export function describeFilters(f: Filters): string {
  const parts: string[] = [];
  if (f.sev !== "all") parts.push(SEVERITY_LABEL[f.sev]);
  if (f.cat !== "all") parts.push(CATEGORY_LABEL[f.cat as Category]);
  if (f.recent) parts.push(`Last ${RECENT_DAYS} days`);
  if (f.jur !== "all") parts.push(f.jur);
  if (f.q.trim()) parts.push(`“${f.q.trim()}”`);
  return parts.length ? parts.join(" · ") : "All active monitors";
}
