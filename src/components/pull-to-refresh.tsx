"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { animate, motion, useMotionValue, useTransform } from "motion/react";
import { tap } from "@/lib/haptics";

const THRESHOLD = 72;

/**
 * Pull down at the top of the page to refresh. Installed iPhone web apps have no
 * built-in pull-to-refresh, so this gives everyone the same gesture.
 */
export function PullToRefresh({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [refreshing, start] = useTransition();
  const [armed, setArmed] = useState(false);
  const y = useMotionValue(0);
  const rotate = useTransform(y, [0, THRESHOLD], [0, 270]);
  const opacity = useTransform(y, [0, 24, THRESHOLD], [0, 0.6, 1]);
  const startY = useRef<number | null>(null);

  useEffect(() => {
    const onStart = (e: TouchEvent) => {
      startY.current = window.scrollY <= 0 ? e.touches[0].clientY : null;
    };
    const onMove = (e: TouchEvent) => {
      if (startY.current === null) return;
      const dy = e.touches[0].clientY - startY.current;
      if (dy <= 0) return y.set(0);
      const pulled = Math.min(THRESHOLD * 1.4, dy * 0.5);
      y.set(pulled);
      const nowArmed = pulled >= THRESHOLD;
      setArmed((was) => {
        if (nowArmed && !was) tap(10);
        return nowArmed;
      });
    };
    const onEnd = () => {
      if (startY.current === null) return;
      startY.current = null;
      if (y.get() >= THRESHOLD) {
        animate(y, 48, { type: "spring", stiffness: 400, damping: 30 });
        start(() => router.refresh());
      } else {
        animate(y, 0, { type: "spring", stiffness: 400, damping: 30 });
      }
      setArmed(false);
    };
    window.addEventListener("touchstart", onStart, { passive: true });
    window.addEventListener("touchmove", onMove, { passive: true });
    window.addEventListener("touchend", onEnd);
    return () => {
      window.removeEventListener("touchstart", onStart);
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("touchend", onEnd);
    };
  }, [router, y]);

  useEffect(() => {
    if (!refreshing) animate(y, 0, { type: "spring", stiffness: 400, damping: 30 });
  }, [refreshing, y]);

  return (
    <>
      <motion.div style={{ height: y }} className="flex items-end justify-center overflow-hidden">
        <motion.svg
          style={{ rotate: refreshing ? undefined : rotate, opacity }}
          animate={refreshing ? { rotate: 360 } : undefined}
          transition={refreshing ? { repeat: Infinity, duration: 0.8, ease: "linear" } : undefined}
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke={armed || refreshing ? "var(--accent)" : "var(--muted)"}
          strokeWidth="2.4"
          strokeLinecap="round"
          className="mb-3"
        >
          <path d="M21 12a9 9 0 1 1-3-6.7L21 8M21 3v5h-5" />
        </motion.svg>
      </motion.div>
      {children}
    </>
  );
}
