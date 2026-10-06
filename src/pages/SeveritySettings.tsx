import { useMemo, useState } from "react";
import { Bell, Check, ChevronDown, RotateCcw } from "lucide-react";
import { CATEGORIES, CATEGORY_LABEL, DEFAULT_SEVERITY, SEVERITIES, SEVERITY_LABEL, type Category, type Severity, type SeverityMap } from "../data/model";
import { buildRow } from "../data/queue";
import { useStore, type NotifyPrefs } from "../state/store";
import { Button, CATEGORY_ICON, SEV_STYLE, cx, nf } from "../components/ui";

const CHANNELS: Array<{ key: keyof NotifyPrefs; title: string; desc: string }> = [
  { key: "inApp", title: "In-app alerts", desc: "Receive alerts inside the app for selected severities." },
  { key: "daily", title: "Daily email digest", desc: "Receive a daily summary for selected severities." },
  { key: "weekly", title: "Weekly email digest", desc: "Receive a weekly summary for selected severities." },
];

export function SeveritySettings() {
  const { severity, setSeverity, resetSeverity, prefs, savePrefs, toast, monitors } = useStore();
  // How many active companies would show a different severity in Monitoring under a new mapping.
  const impact = (next: SeverityMap) => {
    let n = 0;
    for (const m of monitors) if (m.status === "active" && m.events.length && buildRow(m, severity).latestSev !== buildRow(m, next).latestSev) n++;
    return n;
  };
  const change = (c: Category, s: Severity) => {
    const prev = severity[c];
    if (prev === s) return;
    const moved = impact({ ...severity, [c]: s });
    setSeverity(c, s);
    toast({
      title: `${CATEGORY_LABEL[c]} is now ${SEVERITY_LABEL[s]}`,
      body: moved ? `${nf.format(moved)} ${moved === 1 ? "company changes" : "companies change"} severity in Monitoring.` : "No company changes severity right now.",
      action: { label: "Undo", onClick: () => setSeverity(c, prev) },
    });
  };
  const [draft, setDraft] = useState<NotifyPrefs>(prefs);
  const dirty = JSON.stringify(draft) !== JSON.stringify(prefs);
  const tierCounts = useMemo(() => {
    const c: Record<Severity, number> = { high: 0, medium: 0, low: 0 };
    CATEGORIES.forEach((k) => c[severity[k]]++);
    return c;
  }, [severity]);
  const customised = CATEGORIES.some((c) => severity[c] !== DEFAULT_SEVERITY[c]);
  const summary = (k: keyof NotifyPrefs) => {
    const on = (["high", "medium", "low"] as Severity[]).filter((s) => draft[k][s]).map((s) => SEVERITY_LABEL[s]);
    return on.length ? on.join(", ") : "Off";
  };

  return (
    <div className="mx-auto max-w-[1280px] px-4 pt-6 pb-16 lg:px-8">
      <header className="max-w-[72ch]">
        <h1 className="text-[26px] leading-tight font-semibold tracking-[-0.015em]">Severity & Notification Settings</h1>
        <p className="mt-1 text-[14px] text-ink-2">
          Map each change category to a severity tier. This mapping drives colour-coding across the monitoring table, heatmap and activity feed.
        </p>
      </header>

      <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_380px]">
        <section aria-labelledby="map-h">
          <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 id="map-h" className="text-[18px] font-semibold">
                Category Severity Mapping
              </h2>
              <p className="mt-0.5 text-[13px] text-ink-2">Applies to all your monitors. When one change touches several categories, it takes the most severe tier. Changes apply immediately and can be undone.</p>
            </div>
            <div className="flex items-center gap-1.5">
              {(["high", "medium", "low"] as Severity[]).map((s) => (
                <span key={s} className={cx("inline-flex h-7 items-center gap-1.5 rounded-full border px-2.5 text-[12px]", SEV_STYLE[s].bg, SEV_STYLE[s].line, SEV_STYLE[s].text)}>
                  <span className="font-semibold tnum">{tierCounts[s]}</span> {SEVERITY_LABEL[s]}
                </span>
              ))}
            </div>
          </div>

          <div className="overflow-hidden rounded-[6px] border border-line bg-white">
            <div className="grid grid-cols-[minmax(0,1fr)_minmax(124px,200px)] gap-4 border-b border-line bg-wash px-5 py-2.5 text-[12px] font-semibold text-ink-2">
              <span>Change category</span>
              <span>Severity</span>
            </div>
            <ul className="divide-y divide-line">
              {CATEGORIES.map((c) => {
                const Icon = CATEGORY_ICON[c];
                const cur = severity[c];
                return (
                  <li key={c} className="grid grid-cols-[minmax(0,1fr)_minmax(124px,200px)] items-center gap-4 px-5 py-3">
                    <span className="flex min-w-0 items-start gap-3">
                      <Icon className="mt-0.5 size-[18px] shrink-0 text-brand-700" />
                      <span className="min-w-0">
                        <span className="block text-[14px] font-medium">{CATEGORY_LABEL[c]}</span>
                        {cur !== DEFAULT_SEVERITY[c] && <span className="block text-[11px] text-ink-3">Default: Medium</span>}
                      </span>
                    </span>
                    <span className="relative w-full">
                      <select
                        aria-label={`${CATEGORY_LABEL[c]} severity`}
                        value={cur}
                        onChange={(e) => change(c, e.target.value as Severity)}
                        className={cx(
                          "h-9 w-full cursor-pointer appearance-none rounded-[4px] border bg-no-repeat pr-9 pl-3 text-[14px] font-semibold focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-600",
                          SEV_STYLE[cur].bg,
                          SEV_STYLE[cur].line,
                          SEV_STYLE[cur].text,
                        )}
                      >
                        {SEVERITIES.map((s) => (
                          <option key={s} value={s} className="bg-white text-ink">
                            {SEVERITY_LABEL[s]}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className={cx("pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2", SEV_STYLE[cur].text)} />
                    </span>
                  </li>
                );
              })}
            </ul>
            <div className="flex items-center justify-between gap-3 border-t border-line bg-canvas px-5 py-3">
              <span className="text-[12px] text-ink-3">{customised ? "Your team has customised this mapping." : "Every category is at the default, Medium."}</span>
              <Button
                variant="ghost"
                size="sm"
                disabled={!customised}
                onClick={() => {
                  const before = { ...severity };
                  const moved = impact(DEFAULT_SEVERITY);
                  resetSeverity();
                  toast({
                    title: "Severity reset to defaults",
                    body: `Every category is now Medium. ${nf.format(moved)} ${moved === 1 ? "company changes" : "companies change"} severity.`,
                    action: { label: "Undo", onClick: () => CATEGORIES.forEach((k) => setSeverity(k, before[k])) },
                  });
                }}
              >
                <RotateCcw className="size-3.5" /> Reset to defaults
              </Button>
            </div>
          </div>
        </section>

        <section aria-labelledby="notif-h" className="self-start rounded-[6px] border border-line bg-white lg:sticky lg:top-[80px]">
          <div className="flex items-center gap-2 border-b border-line px-5 py-4">
            <Bell className="size-5 text-brand-700" />
            <h2 id="notif-h" className="text-[18px] font-semibold">
              Notifications
            </h2>
          </div>
          <div className="divide-y divide-line">
            {CHANNELS.map((ch) => (
              <fieldset key={ch.key} className="px-5 py-4">
                <legend className="sr-only">{ch.title}</legend>
                <p className="text-[14px] font-semibold">{ch.title}</p>
                <p className="text-[13px] text-ink-2">{ch.desc}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {(["low", "medium", "high"] as Severity[]).map((s) => {
                    const on = draft[ch.key][s];
                    return (
                      <label
                        key={s}
                        className={cx(
                          "inline-flex h-8 cursor-pointer items-center gap-2 rounded-[4px] border px-3 text-[13px] transition-colors select-none",
                          on ? cx(SEV_STYLE[s].bg, SEV_STYLE[s].line, SEV_STYLE[s].text, "font-semibold") : "border-line-strong text-ink-3 hover:border-ink-3",
                        )}
                      >
                        <input
                          type="checkbox"
                          checked={on}
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
          <div className="border-t border-line bg-canvas px-5 py-4">
            <dl className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-3 gap-y-1 text-[13px]">
              {CHANNELS.map((ch) => (
                <div key={ch.key} className="contents">
                  <dt className="text-ink-3">{ch.title.replace(" email digest", " email").replace(" alerts", "")}</dt>
                  <dd className="font-medium">{summary(ch.key)}</dd>
                </div>
              ))}
            </dl>
            {dirty ? (
              <Button
                variant="primary"
                className="mt-4 w-full"
                onClick={() => {
                  savePrefs(draft);
                  toast({ title: "Notification preferences saved" });
                }}
              >
                Save notification preferences
              </Button>
            ) : (
              <p className="mt-4 flex h-9 items-center justify-center gap-1.5 text-[13px] font-semibold text-brand-700">
                <Check className="size-4" /> Preferences saved
              </p>
            )}
          </div>
        </section>
      </div>

    </div>
  );
}
