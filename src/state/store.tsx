import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from "react";
import {
  DEFAULT_SEVERITY,
  DEMO_ORG_SEVERITY,
  TODAY,
  iso,
  generateMonitors,
  type Category,
  type Company,
  type Monitor,
  type Severity,
  type SeverityMap,
} from "../data/model";

export type NotifyPrefs = {
  inApp: Record<Severity, boolean>;
  weekly: Record<Severity, boolean>;
  daily: Record<Severity, boolean>;
};

export type Queue = { ids: string[]; label: string; search: string };

export type Toast = { id: number; title: string; body?: string; tone?: "success" | "neutral"; action?: { label: string; onClick: () => void } };

type Store = {
  monitors: Monitor[];
  severity: SeverityMap;
  setSeverity: (c: Category, s: Severity) => void;
  resetSeverity: () => void;
  prefs: NotifyPrefs;
  savePrefs: (p: NotifyPrefs) => void;
  createMonitor: (c: Company) => Monitor;
  stopMonitors: (ids: string[]) => void;
  markReviewed: (monitorId: string, eventId?: string) => void;
  /** Set reviewed state on many events at once. Returns nothing; callers keep the ids for Undo. */
  setReviewed: (eventIds: string[], reviewed: boolean) => void;
  /** Marks events reviewed and shows a toast with Undo. */
  reviewWithUndo: (eventIds: string[], label?: string) => void;
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
  const [prefs, setPrefs] = useState<NotifyPrefs>({
    inApp: { low: false, medium: true, high: true },
    weekly: { low: true, medium: true, high: true },
    daily: { low: false, medium: false, high: false },
  });
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [reports, setReports] = useState<Record<string, "generating" | "ready">>({});
  const [queue, setQueue] = useState<Queue | null>(null);
  const seq = useRef(0);

  const toast = useCallback((t: Omit<Toast, "id">) => {
    const id = ++seq.current;
    setToasts((all) => [...all, { ...t, id }]);
    window.setTimeout(() => setToasts((all) => all.filter((x) => x.id !== id)), t.action ? 8000 : 5200);
  }, []);
  const dismissToast = useCallback((id: number) => setToasts((all) => all.filter((x) => x.id !== id)), []);

  const setReviewed = useCallback((eventIds: string[], reviewed: boolean) => {
    const ids = new Set(eventIds);
    setMonitors((all) =>
      all.map((m) =>
        m.events.some((e) => ids.has(e.id))
          ? {
              ...m,
              events: m.events.map((e) =>
                ids.has(e.id) ? { ...e, reviewed, reviewedBy: reviewed ? "You" : undefined, reviewedAt: reviewed ? iso(TODAY) : undefined } : e,
              ),
            }
          : m,
      ),
    );
  }, []);
  const reviewWithUndo = useCallback(
    (eventIds: string[], label?: string) => {
      if (!eventIds.length) return;
      setReviewed(eventIds, true);
      toast({
        title: label ?? (eventIds.length === 1 ? "Marked as reviewed" : `${eventIds.length} changes marked as reviewed`),
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
      setSeverity: (c, s) => setSeverityMap((m) => ({ ...m, [c]: s })),
      resetSeverity: () => setSeverityMap(DEFAULT_SEVERITY),
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
      markReviewed: (monitorId, eventId) =>
        setMonitors((all) =>
          all.map((m) =>
            m.id !== monitorId
              ? m
              : { ...m, events: m.events.map((e) => (!eventId || e.id === eventId ? { ...e, reviewed: true } : e)) },
          ),
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
    [monitors, severity, prefs, toasts, toast, dismissToast, setReviewed, reviewWithUndo, reports, requestReport, queue],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore() {
  const s = useContext(Ctx);
  if (!s) throw new Error("useStore outside StoreProvider");
  return s;
}
