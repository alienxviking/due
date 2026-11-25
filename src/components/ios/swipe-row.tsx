"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { animate, motion, useMotionValue, useTransform } from "motion/react";
import { tap } from "@/lib/haptics";

export type SwipeAction = {
  label: string;
  color: string;
  onAction?: () => void;
  href?: string;
  /** A long swipe fires this action without tapping (like Mail's full-swipe delete). */
  full?: boolean;
};

const W = 78;

/** UITableView-style swipe actions: leading (swipe right) and trailing (swipe left). */
export function SwipeRow({ leading, trailing = [], children }: { leading?: SwipeAction; trailing?: SwipeAction[]; children: React.ReactNode }) {
  const router = useRouter();
  const x = useMotionValue(0);
  const ref = useRef<HTMLDivElement>(null);
  const dragged = useRef(false);
  const [open, setOpen] = useState(0);
  const lw = leading ? W : 0;
  const tw = trailing.length * W;

  const leadW = useTransform(x, (v) => Math.max(v, 0));
  const trailW = useTransform(x, (v) => Math.max(-v, 0));

  const settle = (to: number) => {
    setOpen(to);
    animate(x, to, { type: "spring", stiffness: 520, damping: 42 });
  };
  const fire = (a: SwipeAction) => {
    tap(12);
    settle(0);
    if (a.href) router.push(a.href);
    else a.onAction?.();
  };

  return (
    <div ref={ref} className="relative overflow-hidden">
      {leading && (
        <motion.button
          type="button"
          style={{ width: leadW, background: leading.color }}
          onClick={() => fire(leading)}
          className="absolute inset-y-0 left-0 flex items-center justify-end overflow-hidden text-[15px] font-medium text-white"
        >
          <span className="w-[78px] shrink-0 text-center">{leading.label}</span>
        </motion.button>
      )}
      {tw > 0 && (
        <motion.div style={{ width: trailW }} className="absolute inset-y-0 right-0 flex overflow-hidden">
          {trailing.map((a) => (
            <button
              key={a.label}
              type="button"
              onClick={() => fire(a)}
              style={{ background: a.color }}
              className="flex min-w-0 flex-1 items-center justify-center text-[15px] font-medium text-white"
            >
              <span className="truncate px-1">{a.label}</span>
            </button>
          ))}
        </motion.div>
      )}
      <motion.div
        drag="x"
        dragDirectionLock
        dragElastic={0.08}
        dragMomentum={false}
        dragConstraints={{ left: tw ? -(ref.current?.offsetWidth ?? 400) : 0, right: leading ? (ref.current?.offsetWidth ?? 400) : 0 }}
        style={{ x, touchAction: "pan-y" }}
        onPointerDown={() => (dragged.current = false)}
        onDragStart={() => (dragged.current = true)}
        onDragEnd={() => {
          const width = ref.current?.offsetWidth ?? 400;
          const v = x.get();
          if (leading?.full && v > width * 0.45) return fire(leading);
          if (trailing[0]?.full && v < -width * 0.55) return fire(trailing[0]);
          if (leading && v > lw / 2) return settle(lw);
          if (tw && v < -tw / 2) return settle(-tw);
          settle(0);
        }}
        onClickCapture={(e) => {
          // A swipe, or a tap on an open row, closes the row instead of opening the link.
          if (dragged.current || open !== 0) {
            e.preventDefault();
            e.stopPropagation();
            if (!dragged.current) settle(0);
          }
        }}
        className="relative bg-cell"
      >
        {children}
      </motion.div>
    </div>
  );
}
