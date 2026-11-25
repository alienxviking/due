"use client";

import { useState, useTransition } from "react";
import { AnimatePresence, motion } from "motion/react";
import { toast } from "sonner";
import { approvePost, deletePost, rejectPost } from "@/app/(app)/actions";
import { PromptAlert } from "@/components/ios/alert";
import { SwipeRow } from "@/components/ios/swipe-row";
import { PostRow } from "@/components/post-row";
import { success } from "@/lib/haptics";
import type { Post } from "@/lib/types";

/** Removes a row the moment an action starts (optimistic); brings it back if the server says no. */
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

function Collapse({ gone, children }: { gone: boolean; children: React.ReactNode }) {
  return (
    <AnimatePresence initial={false}>
      {!gone && (
        <motion.div exit={{ height: 0, opacity: 0, transition: { duration: 0.25, ease: [0.4, 0, 0.2, 1] } }} className="overflow-hidden">
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/** Feed row. Admins can swipe left to edit. */
export function FeedRow({ post, isAdmin, muted }: { post: Post; isAdmin: boolean; muted?: boolean }) {
  const row = <PostRow post={post} muted={muted} />;
  if (!isAdmin) return row;
  return <SwipeRow trailing={[{ label: "Edit", color: "var(--gray)", href: `/posts/${post.id}/edit` }]}>{row}</SwipeRow>;
}

/** Approval queue row: swipe right to approve, left to reject, or use the buttons. */
export function QueueRow({ post }: { post: Post }) {
  const { gone, run } = useRemovable();
  const [rejecting, setRejecting] = useState(false);
  const approve = () => run(() => approvePost(post.id), "Approved. Everyone's being notified.");

  return (
    <Collapse gone={gone}>
      <SwipeRow
        leading={{ label: "Approve", color: "var(--green)", onAction: approve, full: true }}
        trailing={[
          { label: "Edit", color: "var(--gray)", href: `/posts/${post.id}/edit?back=/admin` },
          { label: "Reject", color: "var(--red)", onAction: () => setRejecting(true) },
        ]}
      >
        <PostRow
          post={post}
          extra={
            <div className="mt-2.5 mb-0.5 flex gap-2">
              <button
                type="button"
                onClick={approve}
                className="rounded-full bg-tint px-4 py-[5px] text-[15px] font-semibold text-white transition-opacity active:opacity-60"
              >
                Approve
              </button>
              <button
                type="button"
                onClick={() => setRejecting(true)}
                className="rounded-full bg-fill px-4 py-[5px] text-[15px] font-semibold text-tint transition-opacity active:opacity-60"
              >
                Reject
              </button>
            </div>
          }
        />
      </SwipeRow>
      <PromptAlert
        open={rejecting}
        title="Reject Post?"
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
    </Collapse>
  );
}

/** "My posts" row: swipe left to edit (while pending) or withdraw/delete. */
export function MineRow({ post }: { post: Post }) {
  const { gone, run } = useRemovable();
  const actions =
    post.status === "approved"
      ? []
      : [
          ...(post.status === "pending" ? [{ label: "Edit", color: "var(--gray)", href: `/posts/${post.id}/edit?back=/mine` }] : []),
          {
            label: post.status === "pending" ? "Withdraw" : "Delete",
            color: "var(--red)",
            onAction: () => run(() => deletePost(post.id), post.status === "pending" ? "Withdrawn" : "Deleted"),
          },
        ];

  return (
    <Collapse gone={gone}>
      <SwipeRow trailing={actions}>
        <PostRow
          post={post}
          showAuthor={false}
          muted={post.status === "rejected"}
          extra={post.status === "rejected" && post.reject_reason ? <p className="mt-1 text-[15px] leading-5 text-red">Reason: {post.reject_reason}</p> : null}
        />
      </SwipeRow>
    </Collapse>
  );
}
