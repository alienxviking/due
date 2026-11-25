"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { savePost, type FormState } from "@/app/(app)/actions";
import { AutoHeight } from "@/components/animate-ui/primitives/effects/auto-height";
import { Switch } from "@/components/animate-ui/components/radix/switch";
import { GlowButton } from "@/components/glass/buttons";
import { GlassCard } from "@/components/glass/glass-card";
import { fieldClass, GlowField, Label } from "@/components/glass/input";
import { PageHead } from "@/components/glass/page-head";
import { DEFAULT_SUBJECT, subjectOf } from "@/lib/subject";

type Defaults = { id?: string; title?: string; url?: string; note?: string | null; date?: string; time?: string; tba?: boolean };

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
    <div className="mx-auto max-w-2xl">
      <PageHead
        title={heading}
        subtitle={hint}
        right={
          <Link href={back} className="mb-1 shrink-0 rounded-full border border-white/10 px-4 py-1.5 text-sm text-neutral-300 hover:bg-white/[0.06]">
            Cancel
          </Link>
        }
      />
      <GlassCard>
        <form action={action} className="flex flex-col gap-6 p-5 md:p-8">
          {defaults.id && <input type="hidden" name="id" value={defaults.id} />}
          <input type="hidden" name="back" value={back} />
          <input type="hidden" name="tba" value={hasDate ? "" : "on"} />

          <div>
            <Label htmlFor="title">What&apos;s due?</Label>
            <GlowField>
              <input id="title" name="title" required maxLength={120} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="DSA Assignment 4" className={`${fieldClass} text-lg font-medium`} autoFocus={!defaults.id} />
            </GlowField>
            <AnimatePresence initial={false}>
              {subject !== DEFAULT_SUBJECT && (
                <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="mt-2 flex items-center gap-2 text-xs text-neutral-400">
                  <span className="size-1.5 rounded-full" style={{ background: subject.color, boxShadow: `0 0 8px 1px ${subject.color}` }} />
                  Tagged {subject.label}
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          <div>
            <Label htmlFor="url">Link</Label>
            <GlowField>
              <input id="url" name="url" required inputMode="url" autoCapitalize="none" autoCorrect="off" spellCheck={false} defaultValue={defaults.url} placeholder="forms.gle/… or a classroom link" className={fieldClass} />
            </GlowField>
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-medium text-neutral-300">Deadline</span>
              <label className="flex cursor-pointer items-center gap-3 text-sm text-neutral-400">
                Has a date
                <Switch checked={hasDate} onCheckedChange={setHasDate} aria-label="Has a deadline date" />
              </label>
            </div>
            <AutoHeight deps={[hasDate]}>
              <AnimatePresence mode="popLayout" initial={false}>
                {hasDate ? (
                  <motion.div key="d" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="grid grid-cols-[1fr_auto] gap-3 p-0.5">
                    <GlowField>
                      <input type="date" name="date" aria-label="Date" min={minDate} value={date} onChange={(e) => setDate(e.target.value)} required className={`${fieldClass} glass-picker`} />
                    </GlowField>
                    <GlowField>
                      <input type="time" name="time" aria-label="Time" value={time} onChange={(e) => setTime(e.target.value)} required className={`${fieldClass} glass-picker`} />
                    </GlowField>
                  </motion.div>
                ) : (
                  <motion.p key="t" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="rounded-xl border border-dashed border-yellow/30 bg-yellow/[0.05] px-4 py-3 text-sm text-yellow">
                    Posted as <b>date TBA</b>. When you add the date later, everyone is notified.
                  </motion.p>
                )}
              </AnimatePresence>
            </AutoHeight>
            {hasDate && <p className="mt-2 text-xs text-neutral-500">Indian time. Reminders go out 24 hours and 2 hours before.</p>}
          </div>

          <div>
            <Label htmlFor="note">
              Note <span className="text-neutral-500">· optional</span>
            </Label>
            <GlowField>
              <textarea id="note" name="note" rows={3} maxLength={500} defaultValue={defaults.note ?? ""} placeholder="Submit as PDF, one per group…" className={`${fieldClass} resize-none`} />
            </GlowField>
          </div>

          <AnimatePresence>
            {state.error && (
              <motion.p role="alert" initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0, x: [0, -6, 6, -3, 3, 0] }} exit={{ opacity: 0 }} className="rounded-xl border border-red/25 bg-red/[0.07] px-4 py-3 text-sm text-red">
                {state.error}
              </motion.p>
            )}
          </AnimatePresence>

          <GlowButton type="submit" loading={pending} disabled={!title.trim()} className="w-full">
            {submitLabel} →
          </GlowButton>
        </form>
      </GlassCard>
    </div>
  );
}
