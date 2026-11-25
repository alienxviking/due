"use client";

import { useActionState, useState } from "react";
import { savePost, type FormState } from "@/app/(app)/actions";

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
  "w-full rounded-xl border border-line bg-surface px-3.5 py-3 text-base outline-none transition-colors placeholder:text-muted/60 focus:border-muted disabled:opacity-40";
const label = "text-sm font-semibold";

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

  return (
    <form action={action} className="flex flex-col gap-5">
      {defaults.id && <input type="hidden" name="id" value={defaults.id} />}
      {back && <input type="hidden" name="back" value={back} />}

      <label className="flex flex-col gap-1.5">
        <span className={label}>What&apos;s due?</span>
        <input name="title" required maxLength={120} defaultValue={defaults.title} placeholder="DSA Assignment 4" className={input} />
      </label>

      <label className="flex flex-col gap-1.5">
        <span className={label}>Link</span>
        <input
          name="url"
          required
          inputMode="url"
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          defaultValue={defaults.url}
          placeholder="forms.gle/… or classroom link"
          className={input}
        />
      </label>

      <fieldset className="flex flex-col gap-2">
        <legend className={`${label} mb-1.5`}>Deadline</legend>
        <div className="flex flex-wrap gap-1.5">
          {quickDates.map(([name, value]) => {
            const on = !tba && date === value;
            return (
              <button
                key={name}
                type="button"
                onClick={() => {
                  setTba(false);
                  setDate(value);
                }}
                className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${on ? "bg-text text-bg" : "bg-surface-2 text-text"}`}
              >
                {name}
              </button>
            );
          })}
          <button
            type="button"
            onClick={() => setTba(!tba)}
            className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${tba ? "bg-warn text-bg" : "bg-surface-2 text-text"}`}
          >
            TBA
          </button>
        </div>
        <input type="hidden" name="tba" value={tba ? "on" : ""} />
        <div className="grid grid-cols-[1fr_auto] gap-2">
          <input
            type="date"
            name="date"
            aria-label="Date"
            min={minDate}
            value={date}
            onChange={(e) => setDate(e.target.value)}
            disabled={tba}
            required={!tba}
            className={input}
          />
          <input
            type="time"
            name="time"
            aria-label="Time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            disabled={tba}
            required={!tba}
            className={input}
          />
        </div>
        <p className="text-xs text-muted">{tba ? "You can add the date later. Everyone gets notified when you do." : "Indian time. Defaults to 11:59 PM."}</p>
      </fieldset>

      <label className="flex flex-col gap-1.5">
        <span className={label}>
          Note <span className="font-normal text-muted">· optional</span>
        </span>
        <textarea name="note" rows={3} maxLength={500} defaultValue={defaults.note ?? ""} placeholder="Submit as PDF, one per group…" className={`${input} resize-none`} />
      </label>

      {state.error && (
        <p role="alert" className="rise rounded-xl bg-accent-soft px-3.5 py-2.5 text-sm font-medium text-accent">
          {state.error}
        </p>
      )}

      <button
        disabled={pending}
        className="rounded-xl bg-accent px-4 py-3.5 font-semibold text-white shadow-lg shadow-accent/20 transition active:scale-[0.98] disabled:opacity-60"
      >
        {pending ? "Saving…" : submitLabel}
      </button>
    </form>
  );
}
