"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { savePost, type FormState } from "@/app/(app)/actions";
import { AutoHeight } from "@/components/animate-ui/primitives/effects/auto-height";
import { Switch } from "@/components/animate-ui/components/radix/switch";
import { CalendarIcon, ClockIcon } from "@/components/ios/icons";
import { RowIcon, Section } from "@/components/ios/list";
import { Spinner } from "@/components/ios/spinner";
import { subjectOf } from "@/lib/subject";

type Defaults = { id?: string; title?: string; url?: string; note?: string | null; date?: string; time?: string; tba?: boolean };

const field = "w-full bg-transparent text-[17px] leading-[22px] outline-none placeholder:text-label-3";

function prettyDate(date: string) {
  if (!date) return "";
  return new Intl.DateTimeFormat("en-IN", { weekday: "long", day: "numeric", month: "long", timeZone: "UTC" }).format(new Date(`${date}T00:00:00Z`));
}

/** New / edit post, laid out like an iOS modal sheet (Cancel · Title · Post). */
export function PostForm({
  defaults = {},
  minDate,
  heading,
  submitLabel,
  back = "/",
  hint,
}: {
  defaults?: Defaults;
  minDate: string;
  heading: string;
  submitLabel: string;
  back?: string;
  hint?: string;
}) {
  const [state, action, pending] = useActionState<FormState, FormData>(savePost, {});
  const [hasDate, setHasDate] = useState(!(defaults.tba ?? false));
  const [date, setDate] = useState(defaults.date ?? "");
  const [time, setTime] = useState(defaults.time ?? "23:59");
  const [title, setTitle] = useState(defaults.title ?? "");
  const subject = subjectOf(title);

  return (
    <form id="post-form" action={action}>
      {/* Sheet header */}
      <div className="hairline-b sticky top-0 z-30 bg-bar pt-[env(safe-area-inset-top)] backdrop-blur-xl backdrop-saturate-150">
        <div className="mx-auto grid h-14 max-w-xl grid-cols-[1fr_auto_1fr] items-center px-4">
          <Link href={back} className="justify-self-start text-[17px] text-tint active:opacity-30">
            Cancel
          </Link>
          <span className="text-[17px] font-semibold">{heading}</span>
          <button disabled={pending || !title.trim()} className="justify-self-end text-[17px] font-semibold text-tint active:opacity-30 disabled:text-label-3">
            {pending ? <Spinner size={18} className="text-label-2" /> : submitLabel}
          </button>
        </div>
      </div>

      <div className="pt-6">
        {defaults.id && <input type="hidden" name="id" value={defaults.id} />}
        <input type="hidden" name="back" value={back} />
        <input type="hidden" name="tba" value={hasDate ? "" : "on"} />

        <Section>
          <div className="flex items-center gap-3 pl-4">
            <span aria-hidden className="size-[9px] shrink-0 rounded-full transition-colors" style={{ background: title ? subject.color : "var(--label-3)" }} />
            <div className="row-sep flex-1 py-[11px] pr-4">
              <input name="title" required maxLength={120} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" className={field} autoFocus={!defaults.id} />
            </div>
          </div>
          <div className="pl-[37px]">
            <div className="row-sep py-[11px] pr-4">
              <input
                name="url"
                required
                inputMode="url"
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
                defaultValue={defaults.url}
                placeholder="Link"
                className={field}
              />
            </div>
          </div>
          <div className="pl-[37px]">
            <div className="py-[11px] pr-4">
              <textarea name="note" rows={3} maxLength={500} defaultValue={defaults.note ?? ""} placeholder="Notes" className={`${field} resize-none`} />
            </div>
          </div>
        </Section>

        <Section
          footer={
            hasDate
              ? "Times are in Indian time. Everyone gets reminders 24 hours and 2 hours before."
              : "It'll show as “date not announced”. When you add the date later, everyone is notified."
          }
        >
          <div className="flex items-center gap-3 pl-4">
            <RowIcon color="var(--red)">
              <CalendarIcon size={18} filled />
            </RowIcon>
            <div className="row-sep flex flex-1 items-center gap-3 py-2 pr-4">
              <div className="min-w-0 flex-1">
                <p className="text-[17px] leading-[22px]">Date</p>
                {hasDate && date && <p className="text-[13px] leading-4 text-tint">{prettyDate(date)}</p>}
              </div>
              <Switch checked={hasDate} onCheckedChange={setHasDate} aria-label="Has a deadline date" />
            </div>
          </div>
          <AutoHeight deps={[hasDate]}>
            <AnimatePresence initial={false}>
              {hasDate && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <div className="flex items-center gap-3 pl-4">
                    <span className="w-[29px]" />
                    <div className="row-sep flex flex-1 items-center justify-between gap-3 py-[7px] pr-4">
                      <span className="text-[17px]">Day</span>
                      <input type="date" name="date" aria-label="Date" min={minDate} value={date} onChange={(e) => setDate(e.target.value)} required={hasDate} className="ios-picker" />
                    </div>
                  </div>
                  <div className="flex items-center gap-3 pl-4">
                    <RowIcon color="var(--tint)">
                      <ClockIcon size={18} />
                    </RowIcon>
                    <div className="flex flex-1 items-center justify-between gap-3 py-[7px] pr-4">
                      <span className="text-[17px]">Time</span>
                      <input type="time" name="time" aria-label="Time" value={time} onChange={(e) => setTime(e.target.value)} required={hasDate} className="ios-picker" />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </AutoHeight>
        </Section>

        {(state.error || hint) && (
          <p className={`mx-8 -mt-4 mb-8 text-[13px] leading-[18px] ${state.error ? "text-red" : "text-label-2"}`} role={state.error ? "alert" : undefined}>
            {state.error ?? hint}
          </p>
        )}
      </div>
    </form>
  );
}
