"use client";

import Link from "next/link";
import { createContext, useContext, useRef, useState, useTransition } from "react";
import { AnimatePresence, animate, motion, useMotionValue, useTransform } from "motion/react";
import { toast } from "sonner";
import { approvePost, deletePost, rejectPost } from "@/app/(app)/actions";
import { AutoHeight } from "@/components/animate-ui/primitives/effects/auto-height";
import { Button } from "@/components/ui/button";
import { success, tap } from "@/lib/haptics";

type Ctx = {
  run: (fn: () => Promise<void>, opts: { done: string; exitX?: number }) => void;
  pending: boolean;
  rejecting: boolean;
  setRejecting: (v: boolean) => void;
};
const RemovableCtx = createContext<Ctx>({ run: () => {}, pending: false, rejecting: false, setRejecting: () => {} });

/**
 * Wraps a card so actions remove it instantly (optimistic) with a collapse animation.
 * If the server call fails, the card comes back and an error toast shows.
 */
export function Removable({ children, swipe = false }: { children: React.ReactNode; swipe?: boolean }) {
  const [gone, setGone] = useState(false);
  const [exitX, setExitX] = useState(0);
  const [rejecting, setRejecting] = useState(false);
  const [pending, start] = useTransition();

  const run: Ctx["run"] = (fn, { done, exitX = 0 }) => {
    setExitX(exitX);
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

  return (
    <RemovableCtx.Provider value={{ run, pending, rejecting, setRejecting }}>
      <AnimatePresence initial={false}>
        {!gone && (
          <motion.div
            exit={{ opacity: 0, height: 0, x: exitX, marginBottom: 0, transition: { duration: 0.28, ease: [0.4, 0, 0.2, 1] } }}
            style={{ overflow: "visible" }}
          >
            {swipe ? <Swipe>{children}</Swipe> : children}
          </motion.div>
        )}
      </AnimatePresence>
    </RemovableCtx.Provider>
  );
}

/** Swipe right to approve, left to reject (opens the reason box). */
function Swipe({ children }: { children: React.ReactNode }) {
  const { run, setRejecting } = useContext(RemovableCtx);
  const id = useContext(SwipeIdCtx);
  const x = useMotionValue(0);
  const dragged = useRef(false);
  const approveOpacity = useTransform(x, [20, 110], [0, 1]);
  const rejectOpacity = useTransform(x, [-110, -20], [1, 0]);
  const approveScale = useTransform(x, [20, 110], [0.6, 1]);
  const rejectScale = useTransform(x, [-110, -20], [1, 0.6]);

  return (
    <div className="relative">
      <div className="absolute inset-0 flex items-center justify-between overflow-hidden rounded-[22px] px-6">
        <motion.div style={{ opacity: approveOpacity, scale: approveScale }} className="flex items-center gap-2 font-semibold text-ok">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12l5 5L20 7" /></svg>
          Approve
        </motion.div>
        <motion.div style={{ opacity: rejectOpacity, scale: rejectScale }} className="flex items-center gap-2 font-semibold text-accent">
          Reject
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18" /></svg>
        </motion.div>
      </div>
      <motion.div
        drag="x"
        dragDirectionLock
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.6}
        style={{ x, touchAction: "pan-y" }}
        onPointerDown={() => (dragged.current = false)}
        onDragStart={() => (dragged.current = true)}
        onClickCapture={(e) => {
          // A swipe shouldn't also count as tapping the card's link.
          if (dragged.current) {
            e.preventDefault();
            e.stopPropagation();
          }
        }}
        onDragEnd={(_, info) => {
          if (info.offset.x > 110 && id) {
            run(() => approvePost(id), { done: "Approved. Everyone's being notified.", exitX: 400 });
          } else if (info.offset.x < -110) {
            tap(12);
            setRejecting(true);
            animate(x, 0, { type: "spring", stiffness: 500, damping: 35 });
          }
        }}
        className="relative"
      >
        {children}
      </motion.div>
    </div>
  );
}

const SwipeIdCtx = createContext<string | null>(null);
/** Lets the swipe gesture know which post it belongs to. */
export function SwipeId({ id, children }: { id: string; children: React.ReactNode }) {
  return <SwipeIdCtx.Provider value={id}>{children}</SwipeIdCtx.Provider>;
}

export function AdminActions({ id }: { id: string }) {
  const { run, pending, rejecting, setRejecting } = useContext(RemovableCtx);
  const [reason, setReason] = useState("");

  return (
    <AutoHeight deps={[rejecting]} className="mt-3 border-t border-line">
      <AnimatePresence mode="popLayout" initial={false}>
        {rejecting ? (
          <motion.form
            key="reject"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            onSubmit={(e) => {
              e.preventDefault();
              run(() => rejectPost(id, reason), { done: "Rejected. The poster will be told why.", exitX: -400 });
            }}
            className="flex flex-col gap-2 pt-3"
          >
            <input
              autoFocus
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              maxLength={300}
              placeholder="Reason (the poster will see this)"
              className="rounded-xl border border-line bg-bg px-3 py-2.5 text-base outline-none transition-colors focus:border-accent"
            />
            <div className="flex gap-2">
              <Button type="submit" disabled={pending} className="flex-1">Reject</Button>
              <Button type="button" variant="soft" onClick={() => setRejecting(false)} className="flex-1">Cancel</Button>
            </div>
          </motion.form>
        ) : (
          <motion.div
            key="actions"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            className="flex gap-2 pt-3"
          >
            <Button variant="success" disabled={pending} onClick={() => run(() => approvePost(id), { done: "Approved. Everyone's being notified.", exitX: 400 })} className="flex-1">
              Approve
            </Button>
            <Link href={`/posts/${id}/edit?back=/admin`} className="rounded-xl bg-surface-2 px-3.5 py-2.5 text-sm font-semibold transition active:scale-95">
              Edit
            </Link>
            <Button variant="soft" disabled={pending} onClick={() => setRejecting(true)}>
              Reject
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </AutoHeight>
  );
}

export function DeleteButton({ id, label = "Delete" }: { id: string; label?: string }) {
  const { run, pending } = useContext(RemovableCtx);
  const [confirming, setConfirming] = useState(false);
  return confirming ? (
    <div className="flex flex-1 gap-2">
      <Button
        disabled={pending}
        onClick={() => run(() => deletePost(id), { done: label === "Withdraw" ? "Withdrawn" : "Deleted" })}
        className="flex-1"
      >
        Yes, {label.toLowerCase()}
      </Button>
      <Button variant="soft" onClick={() => setConfirming(false)}>
        No
      </Button>
    </div>
  ) : (
    <Button variant="soft" onClick={() => setConfirming(true)} className="flex-1 text-muted">
      {label}
    </Button>
  );
}
