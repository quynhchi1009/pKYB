import { useStore } from "../state/store";
import { Button, Dialog, nf } from "./ui";

export function StopDialog({ targets, onClose, onDone }: { targets: Array<{ id: string; name: string }>; onClose: () => void; onDone?: () => void }) {
  const { stopMonitors, toast, monitors } = useStore();
  const single = targets.length === 1;
  const ids = new Set(targets.map((t) => t.id));
  const unreviewed = monitors.filter((m) => ids.has(m.id)).reduce((n, m) => n + m.events.filter((e) => !e.reviewed).length, 0);
  const shown = targets.slice(0, 5);

  const confirm = () => {
    stopMonitors(targets.map((t) => t.id));
    toast({
      title: single ? `Stopped monitoring ${targets[0].name}` : `Stopped ${nf.format(targets.length)} monitors`,
      body: "History stays available under Order history.",
    });
    onClose();
    onDone?.();
  };
  return (
    <Dialog
      open={targets.length > 0}
      onClose={onClose}
      width={480}
      labelledBy="stop-title"
      title={single ? `Stop monitoring ${targets[0]?.name}?` : `Stop monitoring ${nf.format(targets.length)} companies?`}
      footer={
        <>
          <Button variant="ghost" onClick={onClose} data-autofocus="">
            Cancel
          </Button>
          <Button variant="danger" onClick={confirm}>
            {single ? "Stop monitoring" : `Stop ${nf.format(targets.length)} monitors`}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-3 text-[14px] text-ink-2">
        {!single && (
          <ul className="rounded-[6px] border border-line bg-canvas px-4 py-2.5 text-[13px] text-ink">
            {shown.map((t) => (
              <li key={t.id} className="truncate py-0.5">
                {t.name}
              </li>
            ))}
            {targets.length > shown.length && <li className="py-0.5 text-ink-2">and {nf.format(targets.length - shown.length)} more</li>}
          </ul>
        )}
        <p>
          We'll stop checking {single ? "this company's" : "these companies'"} registry record. {single ? "Its" : "Their"} change history and baseline report stay
          available under Order history. Monitoring {single ? "it" : "them"} again means creating a new monitor, with a new baseline report.
        </p>
        {unreviewed > 0 && (
          <p className="font-medium text-ink">
            {nf.format(unreviewed)} {unreviewed === 1 ? "change is" : "changes are"} still unreviewed. {unreviewed === 1 ? "It stays" : "They stay"} in the history,
            unreviewed.
          </p>
        )}
      </div>
    </Dialog>
  );
}
