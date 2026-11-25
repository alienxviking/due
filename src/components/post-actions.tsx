"use client";

import Link from "next/link";
import { createContext, useContext, useState, useTransition } from "react";
import { approvePost, deletePost, rejectPost } from "@/app/(app)/actions";

/**
 * Wraps a card so actions can hide it the moment they're tapped (optimistic UI).
 * If the server call fails, the card comes back and an error shows.
 */
const RemovableCtx = createContext<{ run: (fn: () => Promise<void>) => void; pending: boolean }>({
  run: () => {},
  pending: false,
});

export function Removable({ children }: { children: React.ReactNode }) {
  const [gone, setGone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  const run = (fn: () => Promise<void>) => {
    setError(null);
    setGone(true);
    start(async () => {
      try {
        await fn();
      } catch (e) {
        setGone(false);
        setError((e as Error).message || "Something went wrong. Try again.");
      }
    });
  };

  if (gone) return null;
  return (
    <RemovableCtx.Provider value={{ run, pending }}>
      <div className="rise">
        {children}
        {error && <p className="mt-1.5 px-1 text-sm text-accent">{error}</p>}
      </div>
    </RemovableCtx.Provider>
  );
}

const btn = "rounded-xl px-3 py-2.5 text-sm font-semibold transition active:scale-[0.97] disabled:opacity-50";

export function AdminActions({ id }: { id: string }) {
  const { run, pending } = useContext(RemovableCtx);
  const [rejecting, setRejecting] = useState(false);
  const [reason, setReason] = useState("");

  if (rejecting) {
    return (
      <form
        onSubmit={(e) => {
          e.preventDefault();
          run(() => rejectPost(id, reason));
        }}
        className="mt-3 flex flex-col gap-2 border-t border-line pt-3"
      >
        <input
          autoFocus
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          maxLength={300}
          placeholder="Reason (the poster will see this)"
          className="rounded-xl border border-line bg-bg px-3 py-2.5 text-base outline-none focus:border-muted"
        />
        <div className="flex gap-2">
          <button disabled={pending} className={`${btn} flex-1 bg-accent text-white`}>
            Reject
          </button>
          <button type="button" onClick={() => setRejecting(false)} className={`${btn} flex-1 bg-surface-2`}>
            Cancel
          </button>
        </div>
      </form>
    );
  }

  return (
    <div className="mt-3 flex gap-2 border-t border-line pt-3">
      <button disabled={pending} onClick={() => run(() => approvePost(id))} className={`${btn} flex-1 bg-ok text-white dark:text-bg`}>
        Approve
      </button>
      <Link href={`/posts/${id}/edit?back=/admin`} className={`${btn} bg-surface-2 text-center`}>
        Edit
      </Link>
      <button disabled={pending} onClick={() => setRejecting(true)} className={`${btn} bg-surface-2`}>
        Reject
      </button>
    </div>
  );
}

export function DeleteButton({ id, label = "Delete" }: { id: string; label?: string }) {
  const { run, pending } = useContext(RemovableCtx);
  return (
    <button
      disabled={pending}
      onClick={() => {
        if (confirm(`${label} this post?`)) run(() => deletePost(id));
      }}
      className={`${btn} flex-1 bg-surface-2 text-muted`}
    >
      {label}
    </button>
  );
}
