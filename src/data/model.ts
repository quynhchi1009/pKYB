// Domain model and synthetic demo data for the pKYB prototype.
// Every company, number and event here is generated demo content, not client data.

export const CATEGORIES = [
  "Identity",
  "Address",
  "BusinessActivity",
  "Officers",
  "Ownership",
  "Capital",
  "Status",
  "AnnualReturn",
  "Other",
] as const;
export type Category = (typeof CATEGORIES)[number];

export const CATEGORY_LABEL: Record<Category, string> = {
  Identity: "Identity",
  Address: "Address",
  BusinessActivity: "Business activity",
  Officers: "Officers",
  Ownership: "Ownership",
  Capital: "Capital",
  Status: "Status",
  AnnualReturn: "Annual return",
  Other: "Other",
};

// Where each category's current values appear in a KYB Basic report (section names from the Portal report viewer).
export const CATEGORY_SECTION: Record<Category, string> = {
  Identity: "Company Information",
  Address: "Company Information",
  BusinessActivity: "Company Information",
  Officers: "Directors & Officers",
  Ownership: "Shareholders · UBO",
  Capital: "Company Information",
  Status: "Company Information · Legal Alerts",
  AnnualReturn: "Historical Changes",
  Other: "Historical Changes",
};

export const SEVERITIES = ["low", "medium", "high"] as const;
export type Severity = (typeof SEVERITIES)[number];
export const SEVERITY_RANK: Record<Severity, number> = { low: 1, medium: 2, high: 3 };
export const SEVERITY_LABEL: Record<Severity, string> = { low: "Low", medium: "Medium", high: "High" };

export type SeverityMap = Record<Category, Severity>;
export const DEFAULT_SEVERITY: SeverityMap = Object.fromEntries(
  CATEGORIES.map((c) => [c, "medium"]),
) as SeverityMap;
// The demo organisation has already tuned its mapping; "Reset to defaults" returns everything to Medium.
export const DEMO_ORG_SEVERITY: SeverityMap = {
  ...DEFAULT_SEVERITY,
  Ownership: "high",
  Status: "high",
  Officers: "medium",
  Capital: "medium",
  Identity: "medium",
  BusinessActivity: "low",
  Address: "low",
  AnnualReturn: "low",
  Other: "low",
};

export function worstSeverity(categories: Category[], map: SeverityMap): Severity {
  let worst: Severity = "low";
  for (const c of categories) if (SEVERITY_RANK[map[c]] > SEVERITY_RANK[worst]) worst = map[c];
  return worst;
}

export type Jurisdiction = { code: string; name: string; regLabel: string };
export const JURISDICTIONS: Jurisdiction[] = [
  { code: "CN", name: "China", regLabel: "Unified Social Credit Code" },
  { code: "HK", name: "Hong Kong", regLabel: "CR No." },
  { code: "SG", name: "Singapore", regLabel: "UEN" },
  { code: "AU", name: "Australia", regLabel: "ACN" },
  { code: "NZ", name: "New Zealand", regLabel: "NZBN" },
  { code: "JP", name: "Japan", regLabel: "Corporate No." },
  { code: "TH", name: "Thailand", regLabel: "Registration No." },
  { code: "MY", name: "Malaysia", regLabel: "SSM No." },
  { code: "TW", name: "Taiwan", regLabel: "Unified Business No." },
];
// Demo assumption: pKYB is not yet available in Taiwan, to show the blocked path. Replace with the real coverage list.
export const PKYB_UNSUPPORTED = new Set(["TW"]);

export const jurisdictionByCode = Object.fromEntries(JURISDICTIONS.map((j) => [j.code, j])) as Record<
  string,
  Jurisdiction
>;

// Credit pricing. The KYB Basic price is not confirmed yet, so it renders as "xx credits" until
// `kybBasicCredits` is set (see PRODUCT.md, "Unresolved"). Every price in the UI reads from here.
export const PRICING = {
  /** Per company, per year of monitoring. */
  monitorCredits: 10,
  kybBasicCredits: null as number | null,
};
export const creditsLabel = (n: number | null) => (n === null ? "xx credits" : `${n} ${n === 1 ? "credit" : "credits"}`);
/** "10 + xx credits" until the KYB Basic price is known, then a single sum. */
export const totalTodayLabel = () =>
  PRICING.kybBasicCredits === null ? `${PRICING.monitorCredits} + xx credits` : creditsLabel(PRICING.monitorCredits + PRICING.kybBasicCredits);

/** What the analyst decided when they reviewed a change. Recorded in the change log and its CSV export for audit. */
export type ReviewDecision = "no-action" | "actioned";
export const DECISION_LABEL: Record<ReviewDecision, string> = {
  "no-action": "No action needed",
  actioned: "Actioned",
};
export const DECISION_HINT: Record<ReviewDecision, string> = {
  "no-action": "The change doesn't affect your risk view. Nothing to follow up.",
  actioned: "You followed up, for example by ordering a fresh report or contacting the customer.",
};

/** One registry field that differs from the baseline. */
export type FieldChange = { category: Category; field: string; before: string; after: string };

export type ChangeEvent = {
  id: string;
  monitorId: string;
  date: string; // ISO date
  categories: Category[];
  /** Severity under the client's mapping on the day the change was detected. The live mapping can differ later. */
  detectedSeverity: Severity;
  reviewed: boolean;
  reviewedBy?: string;
  reviewedAt?: string;
  decision?: ReviewDecision;
  note?: string;
};

export type MonitorStatus = "active" | "stopped" | "inactive";
export const STATUS_COPY: Record<MonitorStatus, { label: string; explain: string }> = {
  active: {
    label: "Active",
    explain: "Checks run automatically. You are notified when the registry record changes.",
  },
  stopped: {
    label: "Stopped",
    explain: "You stopped this monitor. Its change history stays here for your audit records.",
  },
  inactive: {
    label: "Inactive",
    explain: "Setup failed, so monitoring never started. Inactive orders can't be reactivated; create a new one.",
  },
};

export type Monitor = {
  id: string;
  name: string;
  localName?: string;
  regNo: string;
  jurisdiction: string;
  createdAt: string;
  endedAt?: string;
  lastChecked: string;
  status: MonitorStatus;
  events: ChangeEvent[];
};

export const TODAY = new Date("2026-10-06T09:00:00");
export const iso = (d: Date) => d.toISOString().slice(0, 10);
export const addDays = (d: Date, n: number) => new Date(d.getTime() + n * 86400000);

function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const FIGMA_COMPANIES: Array<[string, string, string?]> = [
  ["Silver Pine Traders", "AU"],
  ["Pro Property Maintenance", "JP"],
  ["Seamans Furniture", "SG"],
  ["Johnson's General Stores", "AU"],
  ["Auto Works", "AU"],
  ["Britches of Georgetown", "CN"],
  ["Western Auto", "NZ"],
  ["Cala Foods", "NZ"],
  ["Cut Rite Lawn Care", "TH"],
  ["Pacific Stores", "SG"],
  ["Magna Architectural Design", "AU"],
  ["Rainbow Bay Crafts", "CN"],
  ["Sofa Express", "NZ"],
  ["Grey Fade", "TH"],
  ["Echo Source", "JP"],
  ["Total Network Development", "SG"],
  ["J. Brannam", "NZ"],
  ["Bugle Boy", "NZ"],
  ["Fortune Link Group", "HK", "財富聯結集團"],
];

const A = ["Silver", "Harbour", "Jade", "Golden", "Pacific", "Northern", "Lotus", "Summit", "Bright", "Red Lantern", "Coral", "Evergreen", "Orchid", "Granite", "Bamboo", "Sterling", "Meridian", "Crescent", "Kingfisher", "Monsoon", "Blue Reef", "Sakura", "Peak", "Riverstone", "Banyan"];
const B = ["Logistics", "Trading", "Payments", "Textiles", "Foods", "Electronics", "Holdings", "Ventures", "Imports", "Retail", "Pharma", "Freight", "Merchants", "Digital", "Manufacturing", "Supply", "Capital", "Engineering", "Apparel", "Packaging"];
const SUFFIX: Record<string, string[]> = {
  CN: ["Co., Ltd", "Technology Co., Ltd"],
  HK: ["Limited", "Holdings Limited"],
  SG: ["Pte. Ltd.", "Pte. Ltd."],
  AU: ["Pty Ltd", "Pty Ltd"],
  NZ: ["Limited", "Limited"],
  JP: ["K.K.", "Co., Ltd."],
  TH: ["Co., Ltd.", "Public Co., Ltd."],
  MY: ["Sdn. Bhd.", "Berhad"],
  TW: ["Co., Ltd.", "Corporation"],
};
const CN_LOCAL = ["深圳市", "广州", "上海", "杭州", "东莞"];

function regNoFor(code: string, r: () => number) {
  const d = (n: number) => Array.from({ length: n }, () => Math.floor(r() * 10)).join("");
  switch (code) {
    case "CN":
      return `9144${d(4)}MA${d(7)}${"ABCDEFGHJKLMNPQRTUWXY"[Math.floor(r() * 21)]}`;
    case "HK":
      return d(7);
    case "SG":
      return `20${d(7)}${"ABCDEKMNRZ"[Math.floor(r() * 10)]}`;
    case "AU":
      return `${d(3)} ${d(3)} ${d(3)}`;
    case "NZ":
      return `94290${d(8)}`;
    case "JP":
      return d(13);
    case "TW":
      return d(8);
    default:
      return d(13);
  }
}

const WEIGHTED: Category[] = [
  "Officers", "Officers", "Officers", "AnnualReturn", "AnnualReturn", "AnnualReturn", "Address", "Address",
  "BusinessActivity", "BusinessActivity", "Ownership", "Ownership", "Status", "Capital", "Capital", "Identity", "Other",
];

const hashSeed = (s: string) => {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return h >>> 0;
};
const pickFrom = <T,>(r: () => number, list: readonly T[]) => list[Math.floor(r() * list.length)];

// Demo teammates for seeded review history. Reviews made in this session are recorded as "You".
const REVIEWERS = ["A. Tan", "M. Lim", "R. Chen", "S. Nair"];

/** Seeded history: reviewed changes carry a reviewer, a date and a decision, drawn from the event id so the main data stays stable. */
function seedReview(e: ChangeEvent, end: Date): ChangeEvent {
  if (!e.reviewed) return e;
  const r = mulberry32(hashSeed(e.id));
  const at = addDays(new Date(e.date + "T09:00:00"), 1 + Math.floor(r() * 6));
  return {
    ...e,
    reviewedBy: pickFrom(r, REVIEWERS),
    reviewedAt: iso(at > end ? end : at),
    decision: r() < 0.84 ? "no-action" : "actioned",
    note: r() < 0.22 ? pickFrom(r, ["Expected after onboarding call.", "Fresh KYB Basic report ordered and filed.", "Customer confirmed by email.", "Routine filing, no risk impact."]) : undefined,
  };
}

const CITY: Record<string, string> = { CN: "Shenzhen", HK: "Hong Kong", SG: "Singapore", AU: "Sydney NSW", NZ: "Auckland", JP: "Tokyo", TH: "Bangkok", MY: "Kuala Lumpur", TW: "Taipei" };
const CURRENCY: Record<string, string> = { CN: "CNY", HK: "HKD", SG: "SGD", AU: "AUD", NZ: "NZD", JP: "JPY", TH: "THB", MY: "MYR", TW: "TWD" };
const STREETS = ["Level 12, 88 Harbour Road", "Unit 5, 21 Kingsford Avenue", "18/F, Tower 2, 1 Science Park Road", "Room 1203, 45 Queen's Road", "3 Marina Boulevard, #20-01", "45 Collins Street", "7 Nanhai Avenue, Block B", "2-1 Marunouchi, 9F"];
const PEOPLE = ["Wei Chen", "Sarah Lim", "Daniel Ong", "Kenji Sato", "Priya Raman", "Tom Walker", "Mei Ling Wong", "Arun Pillai", "Grace Ho", "Liam Brooks"];
const ACTIVITIES = ["Wholesale of electronic components", "Software development and IT services", "Freight forwarding and logistics", "Retail of household furniture", "Payment processing services", "Import and export trading", "Management consultancy"];
const STATUS_AFTER = ["Under external administration", "Strike-off action in progress", "In liquidation", "Dormant"];

/**
 * The fields that differ from the baseline for one change. Demo values, derived from the event id.
 * Assumes the change-detection API returns before and after values per field; PRODUCT.md lists this as open.
 */
export function fieldChanges(e: ChangeEvent, m: Pick<Monitor, "name" | "jurisdiction">): FieldChange[] {
  const r = mulberry32(hashSeed(e.id + "fields"));
  const cur = CURRENCY[m.jurisdiction] ?? "USD";
  const money = (n: number) => `${cur} ${nfDemo.format(n)}`;
  return e.categories.map((category): FieldChange => {
    switch (category) {
      case "Identity":
        return { category, field: "Registered name", before: m.name.replace(/^\S+/, pickFrom(r, A)), after: m.name };
      case "Address": {
        const [a, b] = twoOf(r, STREETS);
        const city = CITY[m.jurisdiction] ?? "";
        return { category, field: "Registered address", before: `${a}, ${city}`, after: `${b}, ${city}` };
      }
      case "BusinessActivity": {
        const [a, b] = twoOf(r, ACTIVITIES);
        return { category, field: "Principal activity", before: a, after: b };
      }
      case "Officers": {
        const [a, b, c] = threeOf(r, PEOPLE);
        return r() < 0.5
          ? { category, field: "Directors", before: `${a}, ${b}`, after: `${a}, ${b}, ${c} (appointed)` }
          : { category, field: "Directors", before: `${a}, ${b}`, after: `${a} (${b} resigned)` };
      }
      case "Ownership": {
        const [a, b] = twoOf(r, PEOPLE);
        const holdco = `${pickFrom(r, A)} ${pickFrom(r, ["Holdings", "Capital", "Ventures"])} Ltd`;
        const keep = 40 + Math.floor(r() * 3) * 10;
        const sold = 15 + Math.floor(r() * 3) * 5;
        return { category, field: "Shareholders", before: `${a} ${keep}% · ${b} ${100 - keep}%`, after: `${a} ${keep - sold}% · ${b} ${100 - keep}% · ${holdco} ${sold}%` };
      }
      case "Capital": {
        const base = (1 + Math.floor(r() * 9)) * 1_000_000;
        return { category, field: m.jurisdiction === "CN" ? "Registered capital" : "Issued share capital", before: money(base), after: money(base * pickFrom(r, [2, 2.5, 3, 5])) };
      }
      case "Status":
        return { category, field: "Company status", before: m.jurisdiction === "HK" || m.jurisdiction === "SG" ? "Live" : "Registered", after: pickFrom(r, STATUS_AFTER) };
      case "AnnualReturn": {
        const filed = iso(addDays(new Date(e.date + "T00:00:00"), -Math.floor(r() * 10)));
        const last = iso(addDays(new Date(filed + "T00:00:00"), -365));
        return { category, field: "Annual return", before: `Last filed ${demoDate(last)}`, after: `Filed ${demoDate(filed)}` };
      }
      default: {
        const [a, b] = twoOf(r, PEOPLE);
        return { category, field: "Company secretary", before: a, after: b };
      }
    }
  });
}
const nfDemo = new Intl.NumberFormat("en-GB");
const demoDate = (d: string) => new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(d + "T00:00:00"));
function twoOf<T>(r: () => number, list: readonly T[]): [T, T] {
  const i = Math.floor(r() * list.length);
  const j = (i + 1 + Math.floor(r() * (list.length - 1))) % list.length;
  return [list[i], list[j]];
}
function threeOf<T>(r: () => number, list: readonly T[]): [T, T, T] {
  const [a, b] = twoOf(r, list);
  const rest = list.filter((x) => x !== a && x !== b);
  return [a, b, pickFrom(r, rest)];
}

function buildEvents(monitorId: string, created: Date, end: Date, r: () => number, density: number): ChangeEvent[] {
  const events: ChangeEvent[] = [];
  const span = Math.max(1, Math.round((end.getTime() - created.getTime()) / 86400000));
  const windowStart = Math.max(0, span - 365);
  const count = Math.floor(r() * density);
  for (let i = 0; i < count; i++) {
    const offset = windowStart + Math.floor(Math.pow(r(), 0.8) * (span - windowStart));
    const date = addDays(created, offset);
    const n = r() < 0.62 ? 1 : r() < 0.8 ? 2 : 3;
    const cats = new Set<Category>();
    while (cats.size < n) cats.add(WEIGHTED[Math.floor(r() * WEIGHTED.length)]);
    const age = (end.getTime() - date.getTime()) / 86400000;
    const categories = CATEGORIES.filter((c) => cats.has(c));
    events.push(
      seedReview(
        {
          id: `${monitorId}-e${i}`,
          monitorId,
          date: iso(date),
          categories,
          detectedSeverity: worstSeverity(categories, DEMO_ORG_SEVERITY),
          reviewed: age > 14 || r() < 0.3,
        },
        end,
      ),
    );
  }
  return events.sort((a, b) => (a.date < b.date ? 1 : -1));
}

export function generateMonitors(): Monitor[] {
  const r = mulberry32(20261006);
  const list: Monitor[] = [];
  const used = new Set<string>();
  const total = 1248 + 64 + 14;

  for (let i = 0; i < total; i++) {
    let name: string;
    let code: string;
    let localName: string | undefined;
    if (i < FIGMA_COMPANIES.length) {
      [name, code, localName] = FIGMA_COMPANIES[i];
    } else {
      code = JURISDICTIONS[Math.floor(r() * JURISDICTIONS.length)].code;
      do {
        const sfx = SUFFIX[code][Math.floor(r() * 2)];
        name = `${A[Math.floor(r() * A.length)]} ${B[Math.floor(r() * B.length)]} ${sfx}`;
      } while (used.has(name));
      if (code === "CN" && r() < 0.7) localName = `${CN_LOCAL[Math.floor(r() * CN_LOCAL.length)]}${["贸易", "科技", "物流", "电子", "实业"][Math.floor(r() * 5)]}有限公司`;
    }
    used.add(name);

    const status: MonitorStatus = i < 1248 ? "active" : i < 1248 + 64 ? "stopped" : "inactive";
    const created = addDays(TODAY, -Math.floor(40 + r() * 700));
    const span = Math.max(1, Math.round((TODAY.getTime() - created.getTime()) / 86400000) - 1);
    const ended =
      status === "active" ? undefined : addDays(created, status === "inactive" ? 0 : 1 + Math.floor(r() * span));
    const end = ended ?? TODAY;
    const id = `m${String(i + 1).padStart(4, "0")}`;
    const hot = i < 12 ? 14 : 5;
    const events = status === "inactive" ? [] : buildEvents(id, created, end, r, hot);
    if (id === "m0001") {
      // Silver Pine Traders carries a recent, unreviewed ownership + status change for the walkthrough.
      const hot: Category[] = ["Ownership", "Status"];
      events.unshift({ id: `${id}-hot`, monitorId: id, date: iso(addDays(TODAY, -1)), categories: hot, detectedSeverity: worstSeverity(hot, DEMO_ORG_SEVERITY), reviewed: false });
    }
    list.push({
      id,
      name,
      localName,
      regNo: id === "m0001" ? "634 321 987" : regNoFor(code, r),
      jurisdiction: code,
      createdAt: iso(created),
      endedAt: ended ? iso(ended) : undefined,
      lastChecked: iso(addDays(end, -Math.floor(r() * 5))),
      status,
      events,
    });
  }
  return list;
}

// Companies that exist in KYB Search but are not monitored yet.
export type Company = {
  id: string;
  name: string;
  localName?: string;
  regNo: string;
  jurisdiction: string;
  status: string;
};
export const SEARCH_COMPANIES: Company[] = [
  { id: "c-tencent", name: "Shenzhen Tencent Computer System Co., Ltd", localName: "深圳市腾讯计算机系统有限公司", regNo: "91440300708461136T", jurisdiction: "CN", status: "Registered" },
  { id: "c-tencent-tech", name: "Tencent Technology (Shenzhen) Co., Ltd", localName: "腾讯科技（深圳）有限公司", regNo: "9144030071526726XG", jurisdiction: "CN", status: "Registered" },
  { id: "c-sz-energy", name: "Shenzhen Energy Group Co., Ltd", localName: "深圳能源集团股份有限公司", regNo: "91440300192241158P", jurisdiction: "CN", status: "Registered" },
  { id: "c-sz-airport", name: "Shenzhen Airport Co., Ltd", localName: "深圳市机场股份有限公司", regNo: "914403001922517431", jurisdiction: "CN", status: "Registered" },
  { id: "c-sz-metro", name: "Shenzhen Metro Group Co., Ltd", localName: "深圳市地铁集团有限公司", regNo: "91440300192217527A", jurisdiction: "CN", status: "Registered" },
  { id: "c-sz-hk", name: "Shenzhen Investment Limited", localName: "深圳控股有限公司", regNo: "0221234", jurisdiction: "HK", status: "Live" },
  { id: "c-sz-intl", name: "Shenzhen International Holdings Limited", localName: "深圳國際控股有限公司", regNo: "0302018", jurisdiction: "HK", status: "Live" },
  { id: "c-sz-sg", name: "Shenzhen Trading Pte. Ltd.", regNo: "201912345K", jurisdiction: "SG", status: "Live company" },
  { id: "c-sz-tw", name: "Shenzhen Precision Taiwan Co., Ltd.", localName: "深圳精密台灣股份有限公司", regNo: "53812947", jurisdiction: "TW", status: "Active" },
];
