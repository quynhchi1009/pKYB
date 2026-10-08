import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import { DECISION_HINT, DECISION_LABEL, type ChangeEvent, type ReviewDecision } from "../data/model";
import { useStore } from "../state/store";
import { Button, Dialog, Menu, cx, formatDate } from "./ui";

const DECISIONS: ReviewDecision[] = ["no-action", "actioned"];

const TRIGGER = 'button[aria-haspopup="menu"][aria-label^="Review change for"]';

/**
 * After a review, the control that was focused unmounts. Focus moves to the recorded outcome; where the list hides reviewed
 * changes (the feed), it moves to the neighbouring row's Review button instead of falling to <body>.
 */
export const focusReviewed = (eventId: string, fallback?: HTMLElement | null) =>
  requestAnimationFrame(() => {
    const target = document.getElementById(`rev-${eventId}`) ?? (fallback?.isConnected ? fallback : null);
    target?.focus();
  });

/** The two decisions as a radio pair with their meaning spelled out, plus an optional note. Shared by the lead card and the dialog. */
export function DecisionFields({
  decision,
  setDecision,
  note,
  setNote,
  noteRows = 2,
}: {
  decision: ReviewDecision | null;
  setDecision: (d: ReviewDecision) => void;
  note: string;
  setNote: (v: string) => void;
  noteRows?: number;
}) {
  const name = useId();
  return (
    <div className="flex flex-col gap-3">
      <fieldset>
        <legend className="mb-2 text-[12px] font-semibold text-content-main">Decision</legend>
        <div className="grid gap-2 sm:grid-cols-2">
          {DECISIONS.map((d) => (
            <label
              key={d}
              className={cx(
                "flex cursor-pointer gap-2.5 rounded-[4px] border px-3 py-2.5 transition-colors",
                decision === d ? "border-interactive-primary bg-interactive-accent" : "border-interactive-secondary bg-white hover:border-content-main",
              )}
            >
              <input type="radio" name={name} checked={decision === d} onChange={() => setDecision(d)} className="mt-0.5 size-4 shrink-0 accent-interactive-primary" />
              <span className="min-w-0">
                <span className="block text-[13px] font-semibold text-content-primary">{DECISION_LABEL[d]}</span>
                <span className="block text-[12px] text-content-main">{DECISION_HINT[d]}</span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>
      <label className="flex flex-col gap-1">
        <span className="text-[12px] font-medium text-content-main">
          Note <span className="font-normal text-content-tertiary">(optional, kept in the change log)</span>
        </span>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={noteRows}
          maxLength={500}
          placeholder="For example: ownership change expected after the restructuring call."
          className="resize-y rounded-[4px] border border-interactive-secondary bg-white px-3 py-2 text-[13px] placeholder:text-content-tertiary hover:border-content-main focus:border-interactive-primary max-sm:text-[16px]"
        />
      </label>
    </div>
  );
}

/** Review several changes, or one change with a note. Always asks for the decision so bulk review still leaves an audit trail. */
export function ReviewDialog({
  eventIds,
  title,
  children,
  onClose,
  onDone,
  defaultDecision = null,
  body,
}: {
  eventIds: string[];
  title: string;
  children?: ReactNode;
  onClose: () => void;
  onDone?: () => void;
  defaultDecision?: ReviewDecision | null;
  /** Toast body, usually the company name. */
  body?: string;
}) {
  const { reviewWithUndo } = useStore();
  const open = eventIds.length > 0;
  const [decision, setDecision] = useState<ReviewDecision | null>(defaultDecision);
  const [note, setNote] = useState("");
  useEffect(() => {
    if (open) {
      setDecision(defaultDecision);
      setNote("");
    }
  }, [open, defaultDecision]);
  const submit = () => {
    if (!decision) return;
    reviewWithUndo(eventIds, { decision, note, body });
    onClose();
    onDone?.();
  };
  return (
    <Dialog
      open={open}
      onClose={onClose}
      width={520}
      labelledBy="review-title"
      title={title}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={submit} disabled={!decision}>
            Record review
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4 text-[14px] text-content-main">
        {children}
        <DecisionFields decision={decision} setDecision={setDecision} note={note} setNote={setNote} />
        <p className="text-[12px] text-content-tertiary">Your name, today's date and this decision are recorded in each company's change log.</p>
      </div>
    </Dialog>
  );
}

/** Inline review for one change in a list: pick the decision straight from the menu, or open the dialog to add a note. */
export function ReviewMenu({ event, name, compact }: { event: ChangeEvent; name: string; compact?: boolean }) {
  const { reviewWithUndo } = useStore();
  const [withNote, setWithNote] = useState(false);
  const wrap = useRef<HTMLSpanElement>(null);
  // The neighbouring row's trigger, found before this row can disappear from the list.
  const neighbour = () => {
    const all = Array.from(document.querySelectorAll<HTMLElement>(TRIGGER));
    const i = all.indexOf(wrap.current?.querySelector<HTMLElement>(TRIGGER) as HTMLElement);
    return i < 0 ? null : (all[i + 1] ?? all[i - 1] ?? null);
  };
  const record = (decision: ReviewDecision) => {
    const next = neighbour();
    reviewWithUndo([event.id], { decision, body: name });
    focusReviewed(event.id, next);
  };
  return (
    <span ref={wrap} className="contents">
      <Menu
        label={`Review change for ${name}`}
        trigger={
          <>
            Review <ChevronDown className="size-3.5" aria-hidden />
          </>
        }
        triggerClassName={cx(
          "relative z-[1] inline-flex w-fit items-center gap-1 rounded-[4px] border border-interactive-primary bg-white font-semibold text-interactive-primary hover:bg-interactive-accent",
          compact ? "h-8 px-2.5 text-[12px] max-sm:h-10" : "h-8 px-3 text-[13px] max-sm:h-10",
        )}
        items={[
          { label: DECISION_LABEL["no-action"], onSelect: () => record("no-action") },
          { label: DECISION_LABEL.actioned, onSelect: () => record("actioned") },
          { label: "Add a note…", onSelect: () => setWithNote(true) },
        ]}
      />
      <ReviewDialog
        eventIds={withNote ? [event.id] : []}
        title={`Review change for ${name}`}
        body={name}
        onClose={() => setWithNote(false)}
        onDone={() => focusReviewed(event.id, neighbour())}
      />
    </span>
  );
}

/** The recorded outcome of a review. Focusable by script only, so focus can land here after the review control disappears. */
export function ReviewStatus({ event, align = "start" }: { event: ChangeEvent; align?: "start" | "end" }) {
  const by = event.reviewedBy && (event.reviewedBy.toLowerCase() === "you" ? "you" : event.reviewedBy);
  return (
    <span id={`rev-${event.id}`} tabIndex={-1} className={cx("inline-flex max-w-[44ch] flex-col text-[12px] focus:outline-none", align === "end" && "items-end text-right")}>
      <span className="font-semibold text-content-main">{event.decision ? DECISION_LABEL[event.decision] : "Reviewed"}</span>
      {by && (
        <span className="text-content-tertiary tnum">
          {by} · {formatDate(event.reviewedAt!)}
        </span>
      )}
      {event.note && <span className="mt-0.5 text-content-main">Note: {event.note}</span>}
    </span>
  );
}
