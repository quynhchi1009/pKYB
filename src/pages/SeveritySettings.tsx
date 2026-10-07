import { useEffect, useMemo, useState } from "react";
import { Bell, ChevronDown, RotateCcw } from "lucide-react";
import { CATEGORIES, CATEGORY_LABEL, DEFAULT_SEVERITY, SEVERITIES, SEVERITY_LABEL, worstSeverity, type Severity, type SeverityMap } from "../data/model";
import { buildRow } from "../data/queue";
import { useStore, type NotifyPrefs } from "../state/store";
import { Button, CATEGORY_ICON, SEV_STYLE, cx, formatDate, nf } from "../components/ui";

const CHANNELS: Array<{ key: keyof NotifyPrefs; title: string; desc: string }> = [
  { key: "inApp", title: "In-app alerts", desc: "Receive alerts inside the app for selected severities." },
  { key: "daily", title: "Daily email digest", desc: "Receive a daily summary for selected severities." },
  { key: "weekly", title: "Weekly email digest", desc: "Receive a weekly summary for selected severities." },
];
const TIERS_HIGH_FIRST: Severity[] = ["high", "medium", "low"];
const plural = (n: number, one: string, many: string) => `${nf.format(n)} ${n === 1 ? one : many}`;

export function SeveritySettings() {
  const { severity, saveSeverity, severityChange, prefs, savePrefs, toast, monitors } = useStore();
  // Both halves of the page share one save model: edit freely, see the impact, then save together.
  const [draftMap, setDraftMap] = useState<SeverityMap>(severity);
  const [draft, setDraft] = useState<NotifyPrefs>(prefs);
  // Follow the saved values when they change elsewhere (an Undo from a toast, for instance).
  useEffect(() => setDraftMap(severity), [severity]);
  useEffect(() => setDraft(prefs), [prefs]);

  const changed = CATEGORIES.filter((c) => draftMap[c] !== severity[c]);
  const prefChanges = CHANNELS.reduce((n, ch) => n + SEVERITIES.filter((s) => draft[ch.key][s] !== prefs[ch.key][s]).length, 0);
  const pending = changed.length + prefChanges;
  const mappingChanged = changed.length > 0;

  // What saving would do, before it does it: companies whose headline severity moves, and in-app alert volume.
  const preview = useMemo(() => {
    if (!pending) return null;
    let companies = 0;
    let before = 0;
    let after = 0;
    for (const m of monitors) {
      if (m.status !== "active") continue;
      if (mappingChanged && m.events.length && buildRow(m, severity).latestSev !== buildRow(m, draftMap).latestSev) companies++;
      for (const e of m.events) {
        if (e.reviewed) continue;
        if (prefs.inApp[worstSeverity(e.categories, severity)]) before++;
        if (draft.inApp[worstSeverity(e.categories, draftMap)]) after++;
      }
    }
    return { companies, before, after };
  }, [monitors, severity, draftMap, prefs, draft, pending, mappingChanged]);

  const tierCounts = useMemo(() => {
    const c: Record<Severity, number> = { high: 0, medium: 0, low: 0 };
    CATEGORIES.forEach((k) => c[draftMap[k]]++);
    return c;
  }, [draftMap]);
  const customised = CATEGORIES.some((c) => severity[c] !== DEFAULT_SEVERITY[c]);
  const draftIsDefault = CATEGORIES.every((c) => draftMap[c] === DEFAULT_SEVERITY[c]);

  const discard = () => {
    setDraftMap(severity);
    setDraft(prefs);
  };
  const save = () => {
    const prevMap = severity;
    const prevPrefs = prefs;
    const first = changed[0];
    const summary = changed.length === 1 ? `${CATEGORY_LABEL[first]}: ${SEVERITY_LABEL[severity[first]]} → ${SEVERITY_LABEL[draftMap[first]]}` : `${changed.length} categories changed`;
    const prefsChanged = prefChanges > 0;
    if (mappingChanged) saveSeverity(draftMap, summary);
    if (prefsChanged) savePrefs(draft);
    const moved = preview?.companies ?? 0;
    toast({
      title:
        mappingChanged && prefsChanged
          ? "Changes saved"
          : mappingChanged
            ? changed.length === 1
              ? `${CATEGORY_LABEL[first]} is now ${SEVERITY_LABEL[draftMap[first]]}`
              : `${changed.length} severity changes saved`
            : "Notification preferences saved",
      body: mappingChanged ? (moved ? `${plural(moved, "company changes", "companies change")} severity in Monitoring.` : "No company changes severity right now.") : undefined,
      action: {
        label: "Undo",
        onClick: () => {
          if (mappingChanged) saveSeverity(prevMap, "Restored the previous mapping");
          if (prefsChanged) savePrefs(prevPrefs);
        },
      },
    });
  };

  const details: string[] = [];
  if (preview) {
    if (mappingChanged) details.push(`${plural(preview.companies, "company changes", "companies change")} severity`);
    if (preview.before !== preview.after) details.push(`in-app alerts ${nf.format(preview.before)} → ${nf.format(preview.after)}`);
    if (!details.length) details.push("notification preferences change");
  }

  return (
    <div className="mx-auto max-w-[1280px] px-4 pt-6 pb-16 lg:px-8">
      <header className="max-w-[72ch]">
        <h1 className="text-[26px] leading-tight font-semibold tracking-[-0.015em]">Severity Settings</h1>
        <p className="mt-1 text-[14px] text-ink-2">
          Set a severity for each change category, and choose which severities notify you. Severity drives the colours in the monitoring table, heatmaps and change feed.
          Nothing changes until you save.
        </p>
      </header>

      {/* Two columns only from xl: at lg the 380px notifications column squeezed the category names to a few letters. */}
      <div className="mt-8 grid gap-8 xl:grid-cols-[minmax(0,1fr)_380px]">
        <section aria-labelledby="map-h">
          <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
            <div className="max-w-[60ch]">
              <h2 id="map-h" className="text-[18px] font-semibold">
                Category severity
              </h2>
              <p className="mt-0.5 text-[13px] text-ink-2">
                Applies to all your monitors. When one change touches several categories, it takes the most severe tier. Earlier changes keep the severity they had when detected, shown as “was Low”.
              </p>
            </div>
            <div className="flex items-center gap-1.5">
              {TIERS_HIGH_FIRST.map((s) => (
                <span key={s} className={cx("inline-flex h-7 items-center gap-1.5 rounded-full border px-2.5 text-[12px]", SEV_STYLE[s].bg, SEV_STYLE[s].line, SEV_STYLE[s].text)}>
                  <span className="font-semibold tnum">{tierCounts[s]}</span> {SEVERITY_LABEL[s]}
                </span>
              ))}
            </div>
          </div>

          <div className="overflow-hidden rounded-[6px] border border-line bg-white">
            <div className="grid grid-cols-[minmax(132px,1fr)_minmax(124px,200px)] gap-4 border-b border-line bg-wash px-5 py-2.5 text-[12px] font-semibold text-ink-2">
              <span>Change category</span>
              <span>Severity</span>
            </div>
            <ul className="divide-y divide-line">
              {CATEGORIES.map((c) => {
                const Icon = CATEGORY_ICON[c];
                const cur = draftMap[c];
                const unsaved = cur !== severity[c];
                return (
                  <li key={c} className="grid grid-cols-[minmax(132px,1fr)_minmax(124px,200px)] items-center gap-4 px-5 py-3">
                    <span className="flex min-w-0 items-start gap-3">
                      <Icon className="mt-0.5 size-[18px] shrink-0 text-brand-700" aria-hidden />
                      <span className="min-w-0">
                        <span className="block text-[14px] font-medium">{CATEGORY_LABEL[c]}</span>
                        {unsaved ? (
                          <span className="block text-[11px] font-medium text-ink">Unsaved · was {SEVERITY_LABEL[severity[c]]}</span>
                        ) : (
                          cur !== DEFAULT_SEVERITY[c] && <span className="block text-[11px] text-ink-3">Default: Medium</span>
                        )}
                      </span>
                    </span>
                    <span className="relative w-full">
                      <select
                        aria-label={`${CATEGORY_LABEL[c]} severity`}
                        value={cur}
                        onChange={(e) => setDraftMap((d) => ({ ...d, [c]: e.target.value as Severity }))}
                        className={cx(
                          "h-9 w-full cursor-pointer appearance-none rounded-[4px] border bg-no-repeat pr-9 pl-3 text-[14px] font-semibold max-sm:h-11 max-sm:text-[16px]",
                          SEV_STYLE[cur].bg,
                          SEV_STYLE[cur].line,
                          SEV_STYLE[cur].text,
                        )}
                      >
                        {TIERS_HIGH_FIRST.map((s) => (
                          <option key={s} value={s} className="bg-white text-ink">
                            {SEVERITY_LABEL[s]}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className={cx("pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2", SEV_STYLE[cur].text)} aria-hidden />
                    </span>
                  </li>
                );
              })}
            </ul>
            <div className="flex items-center justify-between gap-3 border-t border-line bg-canvas px-5 py-3">
              <span className="text-[12px] text-ink-3">
                {customised ? "Your team has customised this mapping." : "Every category is at the default, Medium."}
                {severityChange && (
                  <span className="block">
                    Last change: {severityChange.summary} · by {severityChange.by.toLowerCase()} · {formatDate(severityChange.at)}
                  </span>
                )}
              </span>
              <Button variant="ghost" size="sm" disabled={draftIsDefault} onClick={() => setDraftMap(DEFAULT_SEVERITY)}>
                <RotateCcw className="size-3.5" /> Reset to defaults
              </Button>
            </div>
          </div>
        </section>

        <section aria-labelledby="notif-h" className="self-start rounded-[6px] border border-line bg-white xl:sticky xl:top-[80px]">
          <div className="flex items-center gap-2 border-b border-line px-5 py-4">
            <Bell className="size-5 text-brand-700" aria-hidden />
            <h2 id="notif-h" className="text-[18px] font-semibold">
              Notifications
            </h2>
          </div>
          {/* Stacked under the mapping (below xl), the three channels sit side by side instead of as a tall column. */}
          <div className="divide-y divide-line md:grid md:grid-cols-3 md:divide-x md:divide-y-0 xl:block xl:divide-x-0 xl:divide-y">
            {CHANNELS.map((ch) => (
              <fieldset key={ch.key} className="px-5 py-4">
                <legend className="sr-only">{ch.title}</legend>
                <p className="text-[14px] font-semibold">{ch.title}</p>
                <p className="text-[13px] text-ink-2">{ch.desc}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {TIERS_HIGH_FIRST.map((s) => {
                    const on = draft[ch.key][s];
                    return (
                      <label
                        key={s}
                        className={cx(
                          "inline-flex h-8 cursor-pointer items-center gap-2 rounded-[4px] border px-3 text-[13px] transition-colors select-none max-sm:h-11",
                          on ? cx(SEV_STYLE[s].bg, SEV_STYLE[s].line, SEV_STYLE[s].text, "font-semibold") : "border-line-strong text-ink-3 hover:border-ink-3",
                        )}
                      >
                        <input
                          type="checkbox"
                          checked={on}
                          aria-label={`${ch.title}, ${SEVERITY_LABEL[s]}`}
                          onChange={(e) => setDraft((d) => ({ ...d, [ch.key]: { ...d[ch.key], [s]: e.target.checked } }))}
                          className={cx("size-3.5", s === "high" ? "accent-high" : s === "medium" ? "accent-medium" : "accent-low")}
                        />
                        {SEVERITY_LABEL[s]}
                      </label>
                    );
                  })}
                </div>
              </fieldset>
            ))}
          </div>
        </section>
      </div>

      {preview && (
        <div role="region" aria-label="Unsaved changes" className="sticky bottom-4 z-20 mt-8 flex flex-wrap items-center gap-x-4 gap-y-2 rounded-[6px] bg-navy-900 px-4 py-3 text-[13px] text-white shadow-pop">
          <p className="min-w-0 flex-1 max-sm:basis-full" aria-live="polite">
            <span className="font-semibold tnum">
              {nf.format(pending)} unsaved {pending === 1 ? "change" : "changes"}
            </span>
            <span className="text-white/75"> · {details.join(" · ")}</span>
          </p>
          <span className="ml-auto flex items-center gap-2 max-sm:w-full max-sm:justify-end">
            <button onClick={discard} className="inline-flex h-9 items-center rounded-[4px] px-3 font-semibold text-white/85 hover:bg-white/10 hover:text-white max-sm:h-11">
              Discard
            </button>
            <button onClick={save} className="inline-flex h-9 items-center rounded-[4px] bg-white px-4 font-semibold text-navy-900 hover:bg-brand-50 max-sm:h-11">
              Save changes
            </button>
          </span>
        </div>
      )}
    </div>
  );
}
