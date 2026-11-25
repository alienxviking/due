"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { animate, motion, useMotionValue, useTransform } from "motion/react";
import { Spinner } from "@/components/ios/spinner";
import { tap } from "@/lib/haptics";

const THRESHOLD = 70;

/**
 * UIRefreshControl: pull down at the top to refresh. Installed iPhone web apps
 * don't get this from the browser, so it's done here.
 */
export function PullToRefresh({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [refreshing, start] = useTransition();
  const y = useMotionValue(0);
  const opacity = useTransform(y, [10, THRESHOLD], [0, 1]);
  const scale = useTransform(y, [10, THRESHOLD], [0.6, 1]);
  const startY = useRef<number | null>(null);
  const armed = useRef(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const onStart = (e: TouchEvent) => {
      startY.current = window.scrollY <= 0 ? e.touches[0].clientY : null;
    };
    const onMove = (e: TouchEvent) => {
      if (startY.current === null) return;
      const dy = e.touches[0].clientY - startY.current;
      if (dy <= 0) return y.set(0);
      const pulled = Math.min(THRESHOLD * 1.5, dy * 0.45);
      y.set(pulled);
      if (pulled >= THRESHOLD && !armed.current) {
        armed.current = true;
        tap(10);
      } else if (pulled < THRESHOLD) armed.current = false;
    };
    const onEnd = () => {
      if (startY.current === null) return;
      startY.current = null;
      if (armed.current) {
        armed.current = false;
        setBusy(true);
        animate(y, 52, { type: "spring", stiffness: 400, damping: 34 });
        start(() => router.refresh());
      } else {
        animate(y, 0, { type: "spring", stiffness: 400, damping: 34 });
      }
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
    if (!refreshing && busy) {
      setBusy(false);
      animate(y, 0, { type: "spring", stiffness: 400, damping: 34 });
    }
  }, [refreshing, busy, y]);

  return (
    <>
      <motion.div style={{ height: y }} className="flex items-center justify-center overflow-hidden">
        <motion.span style={{ opacity, scale }} className="text-label-2">
          <Spinner size={22} className={busy ? "" : "[animation-play-state:paused]"} />
        </motion.span>
      </motion.div>
      {children}
    </>
  );
}
