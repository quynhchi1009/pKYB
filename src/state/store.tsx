import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from "react";
import {
  DEMO_ORG_SEVERITY,
  TODAY,
  iso,
  generateMonitors,
  type Company,
  DECISION_LABEL,
  type Monitor,
  type ReviewDecision,
  type Severity,
  type SeverityMap,
} from "../data/model";

export type NotifyPrefs = {
  inApp: Record<Severity, boolean>;
  weekly: Record<Severity, boolean>;
  daily: Record<Severity, boolean>;
};

export type Queue = { ids: string[]; label: string; search: string };

/** Who changed the org-wide severity mapping last, and what they changed. */
export type SeverityChange = { summary: string; by: string; at: string };

/** Every review records a decision, so the change log reads as an audit trail, not a checklist. */
export type ReviewInput = { decision: ReviewDecision; note?: string };

export type Toast = { id: number; title: string; body?: string; tone?: "success" | "neutral"; action?: { label: string; onClick: () => void } };

type Store = {
  monitors: Monitor[];
  severity: SeverityMap;
  /** Replaces the whole mapping and records who changed it, so the page can show attribution. */
  saveSeverity: (map: SeverityMap, summary: string) => void;
  severityChange: SeverityChange | null;
  prefs: NotifyPrefs;
  savePrefs: (p: NotifyPrefs) => void;
  createMonitor: (c: Company) => Monitor;
  stopMonitors: (ids: string[]) => void;
  /** Set reviewed state on many events at once. Returns nothing; callers keep the ids for Undo. */
  setReviewed: (eventIds: string[], reviewed: boolean, review?: ReviewInput) => void;
  /** Records a review decision on events and shows a toast with Undo. */
  reviewWithUndo: (eventIds: string[], review: ReviewInput & { title?: string; body?: string }) => void;
  reports: Record<string, "generating" | "ready">;
  /** The list the analyst opened a company from, so the company page can offer "Next". */
  queue: Queue | null;
  setQueue: (q: Queue | null) => void;
  requestReport: (monitorId: string) => void;
  toasts: Toast[];
  toast: (t: Omit<Toast, "id">) => void;
  dismissToast: (id: number) => void;
};

const Ctx = createContext<Store | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [monitors, setMonitors] = useState<Monitor[]>(() => generateMonitors());
  const [severity, setSeverityMap] = useState<SeverityMap>(DEMO_ORG_SEVERITY);
  const [severityChange, setSeverityChange] = useState<SeverityChange | null>(null);
  const [prefs, setPrefs] = useState<NotifyPrefs>({
    inApp: { low: false, medium: true, high: true },
    weekly: { low: true, medium: true, high: true },
    daily: { low: false, medium: false, high: false },
  });
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [reports, setReports] = useState<Record<string, "generating" | "ready">>({});
  const [queue, setQueue] = useState<Queue | null>(null);
  const seq = useRef(0);

  // Toasts dismiss themselves (see Toasts in ui.tsx) so a hover or focus can pause the timer.
  const toast = useCallback((t: Omit<Toast, "id">) => {
    const id = ++seq.current;
    setToasts((all) => [...all, { ...t, id }]);
  }, []);
  const dismissToast = useCallback((id: number) => setToasts((all) => all.filter((x) => x.id !== id)), []);

  const setReviewed = useCallback((eventIds: string[], reviewed: boolean, review?: ReviewInput) => {
    const ids = new Set(eventIds);
    setMonitors((all) =>
      all.map((m) =>
        m.events.some((e) => ids.has(e.id))
          ? {
              ...m,
              events: m.events.map((e) =>
                ids.has(e.id)
                  ? {
                      ...e,
                      reviewed,
                      reviewedBy: reviewed ? "You" : undefined,
                      reviewedAt: reviewed ? iso(TODAY) : undefined,
                      decision: reviewed ? review?.decision : undefined,
                      note: reviewed ? review?.note?.trim() || undefined : undefined,
                    }
                  : e,
              ),
            }
          : m,
      ),
    );
  }, []);
  const reviewWithUndo = useCallback(
    (eventIds: string[], { title, body, ...review }: ReviewInput & { title?: string; body?: string }) => {
      if (!eventIds.length) return;
      setReviewed(eventIds, true, review);
      const what = eventIds.length === 1 ? "Reviewed" : `${eventIds.length.toLocaleString("en-GB")} changes reviewed`;
      toast({
        title: title ?? `${what} · ${DECISION_LABEL[review.decision].toLowerCase()}`,
        body,
        action: { label: "Undo", onClick: () => setReviewed(eventIds, false) },
      });
    },
    [setReviewed, toast],
  );
  const requestReport = useCallback((monitorId: string) => {
    setReports((r) => ({ ...r, [monitorId]: "generating" }));
    window.setTimeout(() => setReports((r) => ({ ...r, [monitorId]: "ready" })), 3000);
  }, []);

  const value = useMemo<Store>(
    () => ({
      monitors,
      severity,
      saveSeverity: (map, summary) => {
        setSeverityMap(map);
        setSeverityChange({ summary, by: "You", at: iso(TODAY) });
      },
      severityChange,
      prefs,
      savePrefs: setPrefs,
      createMonitor: (c) => {
        const existing = monitors.find((m) => m.regNo === c.regNo && m.status === "active");
        if (existing) return existing;
        const m: Monitor = {
          id: `new-${c.id}`,
          name: c.name,
          localName: c.localName,
          regNo: c.regNo,
          jurisdiction: c.jurisdiction,
          createdAt: iso(TODAY),
          lastChecked: iso(TODAY),
          status: "active",
          events: [],
        };
        setMonitors((all) => [m, ...all]);
        return m;
      },
      stopMonitors: (ids) =>
        setMonitors((all) =>
          all.map((m) => (ids.includes(m.id) && m.status === "active" ? { ...m, status: "stopped", endedAt: iso(TODAY) } : m)),
        ),
      setReviewed,
      reviewWithUndo,
      reports,
      requestReport,
      queue,
      setQueue,
      toasts,
      toast,
      dismissToast,
    }),
    [monitors, severity, severityChange, prefs, toasts, toast, dismissToast, setReviewed, reviewWithUndo, reports, requestReport, queue],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore() {
  const s = useContext(Ctx);
  if (!s) throw new Error("useStore outside StoreProvider");
  return s;
}
