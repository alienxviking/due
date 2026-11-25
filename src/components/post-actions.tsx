"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { approvePost, deletePost, rejectPost } from "@/app/(app)/actions";

const btn = "rounded-lg px-3 py-2 text-sm font-medium transition active:scale-[0.97] disabled:opacity-50";

export function AdminActions({ id }: { id: string }) {
  const [pending, start] = useTransition();
  const [rejecting, setRejecting] = useState(false);
  const [reason, setReason] = useState("");

  if (rejecting) {
    return (
      <div className="mt-3 flex flex-col gap-2 border-t border-line pt-3">
        <input
          autoFocus
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          maxLength={300}
          placeholder="Reason (the poster will see this)"
          className="rounded-lg border border-line bg-bg px-3 py-2 text-sm outline-none focus:border-text/50"
        />
        <div className="flex gap-2">
          <button disabled={pending} onClick={() => start(() => rejectPost(id, reason))} className={`${btn} flex-1 bg-accent text-bg`}>
            Reject
          </button>
          <button disabled={pending} onClick={() => setRejecting(false)} className={`${btn} flex-1 border border-line`}>
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-3 flex gap-2 border-t border-line pt-3">
      <button disabled={pending} onClick={() => start(() => approvePost(id))} className={`${btn} flex-1 bg-ok text-bg`}>
        {pending ? "…" : "Approve"}
      </button>
      <Link href={`/posts/${id}/edit?back=/admin`} className={`${btn} border border-line text-center`}>
        Edit
      </Link>
      <button disabled={pending} onClick={() => setRejecting(true)} className={`${btn} border border-line`}>
        Reject
      </button>
    </div>
  );
}

export function DeleteButton({ id, label = "Delete" }: { id: string; label?: string }) {
  const [pending, start] = useTransition();
  return (
    <button
      disabled={pending}
      onClick={() => {
        if (confirm("Delete this post?")) start(() => deletePost(id));
      }}
      className={`${btn} border border-line text-muted`}
    >
      {pending ? "Deleting…" : label}
    </button>
  );
}
