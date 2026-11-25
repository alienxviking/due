"use client";

import { useActionState, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { savePost, type FormState } from "@/app/(app)/actions";
import { AutoHeight } from "@/components/animate-ui/primitives/effects/auto-height";
import { Switch } from "@/components/animate-ui/components/radix/switch";
import { Segmented } from "@/components/motion/segmented";
import { Button } from "@/components/ui/button";
import { DEFAULT_SUBJECT, subjectOf, subjectVars } from "@/lib/subject";

type Defaults = {
  id?: string;
  title?: string;
  url?: string;
  note?: string | null;
  date?: string;
  time?: string;
  tba?: boolean;
};

const input =
  "w-full rounded-2xl border border-line bg-surface px-4 py-3.5 text-base outline-none transition-[border-color,box-shadow] placeholder:text-muted/55 focus:border-accent focus:shadow-[0_0_0_4px_color-mix(in_oklab,var(--accent)_15%,transparent)]";
const label = "px-1 text-[13px] font-semibold text-muted";

const TIMES: [string, string][] = [
  ["9 AM", "09:00"],
  ["Noon", "12:00"],
  ["6 PM", "18:00"],
  ["11:59 PM", "23:59"],
];

export function PostForm({
  defaults = {},
  minDate,
  quickDates,
  submitLabel,
  back,
}: {
  defaults?: Defaults;
  minDate: string;
  /** [label, yyyy-mm-dd] chips, computed on the server in IST. */
  quickDates: [string, string][];
  submitLabel: string;
  back?: string;
}) {
  const [state, action, pending] = useActionState<FormState, FormData>(savePost, {});
  const [tba, setTba] = useState(defaults.tba ?? false);
  const [date, setDate] = useState(defaults.date ?? "");
  const [time, setTime] = useState(defaults.time ?? "23:59");
  const [title, setTitle] = useState(defaults.title ?? "");
  const subject = subjectOf(title);

  const dateChip = quickDates.find(([, v]) => v === date)?.[1] ?? null;
  const timeChip = TIMES.find(([, v]) => v === time)?.[1] ?? null;

  return (
    <form action={action} className="flex flex-col gap-6">
      {defaults.id && <input type="hidden" name="id" value={defaults.id} />}
      {back && <input type="hidden" name="back" value={back} />}
      <input type="hidden" name="tba" value={tba ? "on" : ""} />

      <label className="flex flex-col gap-2">
        <span className={label}>What&apos;s due?</span>
        <div className="relative" style={subjectVars(subject)}>
          <span className="sub-tile pointer-events-none absolute top-1/2 left-2.5 flex size-10 -translate-y-1/2 items-center justify-center rounded-xl text-xl transition-colors">
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.span key={subject.key} initial={{ scale: 0.3, rotate: -30, opacity: 0 }} animate={{ scale: 1, rotate: 0, opacity: 1 }} exit={{ scale: 0.3, opacity: 0 }} transition={{ type: "spring", stiffness: 500, damping: 22 }}>
                {subject.emoji}
              </motion.span>
            </AnimatePresence>
          </span>
          <input name="title" required maxLength={120} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="DSA Assignment 4" className={`${input} font-display pl-15 text-lg font-semibold`} />
        </div>
        <AnimatePresence initial={false}>
          {subject !== DEFAULT_SUBJECT && (
            <motion.span
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              style={subjectVars(subject)}
              className="sub-text px-1 text-xs font-semibold"
            >
              Tagged as {subject.label}. It gets this colour in the feed.
            </motion.span>
          )}
        </AnimatePresence>
      </label>

      <label className="flex flex-col gap-2">
        <span className={label}>Link</span>
        <div className="relative">
          <svg className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-muted" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M10 14a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1M14 10a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1" />
          </svg>
          <input
            name="url"
            required
            inputMode="url"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            defaultValue={defaults.url}
            placeholder="forms.gle/… or a classroom link"
            className={`${input} pl-11`}
          />
        </div>
      </label>

      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between px-1">
          <span className={label.replace("px-1 ", "")}>Deadline</span>
          <label className="flex items-center gap-2.5 text-sm font-medium">
            Not announced yet
            <Switch checked={tba} onCheckedChange={setTba} aria-label="Deadline to be announced" />
          </label>
        </div>

        <AutoHeight deps={[tba]}>
          <AnimatePresence mode="popLayout" initial={false}>
            {tba ? (
              <motion.p
                key="tba"
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.97 }}
                className="rounded-2xl border border-dashed border-warn/50 bg-warn-soft px-4 py-3.5 text-sm text-warn"
              >
                Posted as <b>TBA</b>. Add the date later and everyone gets notified.
              </motion.p>
            ) : (
              <motion.div key="date" initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.97 }} className="flex flex-col gap-2">
                <Segmented size="sm" value={dateChip} onChange={setDate} options={quickDates.map(([l, v]) => ({ value: v, label: l }))} />
                <Segmented size="sm" value={timeChip} onChange={setTime} options={TIMES.map(([l, v]) => ({ value: v, label: l }))} />
                <div className="grid grid-cols-[1fr_auto] gap-2">
                  <input type="date" name="date" aria-label="Date" min={minDate} value={date} onChange={(e) => setDate(e.target.value)} required className={input} />
                  <input type="time" name="time" aria-label="Time" value={time} onChange={(e) => setTime(e.target.value)} required className={input} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </AutoHeight>
      </div>

      <label className="flex flex-col gap-2">
        <span className={label}>
          Note <span className="font-normal opacity-70">· optional</span>
        </span>
        <textarea name="note" rows={3} maxLength={500} defaultValue={defaults.note ?? ""} placeholder="Submit as PDF, one per group…" className={`${input} resize-none`} />
      </label>

      <AnimatePresence>
        {state.error && (
          <motion.p
            role="alert"
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1, x: [0, -6, 6, -3, 3, 0] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="rounded-2xl bg-accent-soft px-4 py-3 text-sm font-medium text-accent"
          >
            {state.error}
          </motion.p>
        )}
      </AnimatePresence>

      <Button type="submit" size="lg" loading={pending} loadingText={defaults.id ? "Saving…" : "Posting…"}>
        {submitLabel}
      </Button>
    </form>
  );
}
