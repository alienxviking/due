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
  "w-full rounded-xl border border-line bg-surface px-3.5 py-3 text-base outline-none placeholder:text-muted/70 focus:border-text/50";

export function PostForm({
  defaults = {},
  minDate,
  submitLabel,
  back,
}: {
  defaults?: Defaults;
  minDate: string;
  submitLabel: string;
  back?: string;
}) {
  const [state, action, pending] = useActionState<FormState, FormData>(savePost, {});
  const [tba, setTba] = useState(defaults.tba ?? false);

  return (
    <form action={action} className="flex flex-col gap-4">
      {defaults.id && <input type="hidden" name="id" value={defaults.id} />}
      {back && <input type="hidden" name="back" value={back} />}

      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-medium">Title</span>
        <input name="title" required maxLength={120} defaultValue={defaults.title} placeholder="DSA Assignment 4" className={input} />
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-medium">Link</span>
        <input
          name="url"
          required
          inputMode="url"
          autoCapitalize="none"
          autoCorrect="off"
          defaultValue={defaults.url}
          placeholder="https://forms.gle/…"
          className={input}
        />
      </label>

      <fieldset className="flex flex-col gap-1.5">
        <legend className="mb-1.5 text-sm font-medium">Deadline (IST)</legend>
        <div className={`grid grid-cols-[1fr_auto] gap-2 ${tba ? "opacity-40" : ""}`}>
          <input type="date" name="date" min={minDate} defaultValue={defaults.date} disabled={tba} required={!tba} className={input} />
          <input type="time" name="time" defaultValue={defaults.time ?? "23:59"} disabled={tba} required={!tba} className={input} />
        </div>
        <label className="mt-1 flex items-center gap-2.5 text-sm">
          <input type="checkbox" name="tba" checked={tba} onChange={(e) => setTba(e.target.checked)} className="size-4 accent-[var(--accent)]" />
          Deadline not announced yet (TBA)
        </label>
      </fieldset>

      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-medium">
          Note <span className="font-normal text-muted">(optional)</span>
        </span>
        <textarea name="note" rows={3} maxLength={500} defaultValue={defaults.note ?? ""} placeholder="Submit as PDF, one per group…" className={input} />
      </label>

      {state.error && (
        <p role="alert" className="rounded-xl border border-accent/40 bg-accent/10 px-3.5 py-2.5 text-sm">
          {state.error}
        </p>
      )}

      <button
        disabled={pending}
        className="rounded-xl bg-accent px-4 py-3.5 font-semibold text-bg transition active:scale-[0.98] disabled:opacity-60"
      >
        {pending ? "Saving…" : submitLabel}
      </button>
    </form>
  );
}
