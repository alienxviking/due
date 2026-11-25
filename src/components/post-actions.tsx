"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { AnimatePresence, motion } from "motion/react";
import { toast } from "sonner";
import { approvePost, deletePost, rejectPost } from "@/app/(app)/actions";
import { DeadlineCard } from "@/components/deadline-card";
import { GhostButton, GlowButton } from "@/components/glass/buttons";
import { PromptAlert } from "@/components/ios/alert";
import { HoldToConfirmButton } from "@/components/spectrumui/hold-to-confirm";
import { success } from "@/lib/haptics";
import type { Post } from "@/lib/types";

/** Removes a card the moment an action starts (optimistic); brings it back if the server says no. */
function useRemovable() {
  const [gone, setGone] = useState(false);
  const [, start] = useTransition();
  const run = (fn: () => Promise<void>, done: string) => {
    setGone(true);
    start(async () => {
      try {
        await fn();
        success();
        toast.success(done);
      } catch (e) {
        setGone(false);
        toast.error((e as Error).message || "Something went wrong. Try again.");
      }
    });
  };
  return { gone, run };
}

function Exit({ gone, children }: { gone: boolean; children: React.ReactNode }) {
  return (
    <AnimatePresence initial={false}>
      {!gone && (
        <motion.div layout exit={{ opacity: 0, scale: 0.94, filter: "blur(6px)", transition: { duration: 0.25 } }}>
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/** Approval queue card with Approve / Edit / Reject. */
export function QueueCard({ post }: { post: Post }) {
  const { gone, run } = useRemovable();
  const [rejecting, setRejecting] = useState(false);

  return (
    <Exit gone={gone}>
      <DeadlineCard
        post={post}
        footer={
          <div className="flex gap-2">
            <GlowButton className="flex-1" onClick={() => run(() => approvePost(post.id), "Approved. Everyone's being notified.")}>
              Approve
            </GlowButton>
            <Link
              href={`/posts/${post.id}/edit?back=/admin`}
              className="inline-flex min-h-11 items-center rounded-full border border-white/10 bg-white/[0.04] px-4 text-[15px] font-medium text-neutral-200 hover:bg-white/[0.08]"
            >
              Edit
            </Link>
            <GhostButton tone="danger" onClick={() => setRejecting(true)}>
              Reject
            </GhostButton>
          </div>
        }
      />
      <PromptAlert
        open={rejecting}
        title="Reject this post?"
        message={`“${post.title}” won't be shown. ${post.author_name ?? "The poster"} will see your reason.`}
        placeholder="Reason (optional)"
        confirmLabel="Reject"
        destructive
        onCancel={() => setRejecting(false)}
        onConfirm={(reason) => {
          setRejecting(false);
          run(() => rejectPost(post.id, reason), "Rejected");
        }}
      />
    </Exit>
  );
}

const STATUS = {
  pending: { label: "Waiting for approval", cls: "border-yellow/30 bg-yellow/10 text-yellow" },
  approved: { label: "Live", cls: "border-green/30 bg-green/10 text-green" },
  rejected: { label: "Not approved", cls: "border-red/30 bg-red/10 text-red" },
} as const;

/** "My posts" card: status, reason, and Edit / Withdraw. */
export function MineCard({ post }: { post: Post }) {
  const { gone, run } = useRemovable();
  const s = STATUS[post.status];
  const verb = post.status === "pending" ? "Withdraw" : "Delete";

  return (
    <Exit gone={gone}>
      <div className="mb-2 px-1">
        <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${s.cls}`}>
          <span className={`size-1.5 rounded-full bg-current ${post.status === "pending" ? "animate-pulse" : ""}`} />
          {s.label}
        </span>
      </div>
      <DeadlineCard
        post={post}
        showAuthor={false}
        muted={post.status === "rejected"}
        footer={
          post.status === "approved" ? null : (
            <div className="space-y-3">
              {post.status === "rejected" && post.reject_reason && (
                <p className="rounded-xl border border-red/20 bg-red/[0.06] px-3 py-2 text-sm text-red">Reason: {post.reject_reason}</p>
              )}
              <div className="flex gap-2">
                {post.status === "pending" && (
                  <Link
                    href={`/posts/${post.id}/edit?back=/mine`}
                    className="inline-flex min-h-11 flex-1 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-[15px] font-medium text-neutral-200 hover:bg-white/[0.08]"
                  >
                    Edit
                  </Link>
                )}
                {/* Spectrum UI hold-to-confirm: press and hold, so it can't happen by accident. */}
                <HoldToConfirmButton
                  size="lg"
                  label={`Hold to ${verb.toLowerCase()}`}
                  confirmedLabel={post.status === "pending" ? "Withdrawn" : "Deleted"}
                  resetDelay={0}
                  className="flex-1 justify-center rounded-full"
                  onConfirm={() => run(() => deletePost(post.id), post.status === "pending" ? "Withdrawn" : "Deleted")}
                />
              </div>
            </div>
          )
        }
      />
    </Exit>
  );
}
