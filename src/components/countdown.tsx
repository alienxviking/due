"use client";

import { useEffect, useState } from "react";
import { timeLeft } from "@/lib/time";

const TONES = {
  urgent: "border-red/30 bg-red/10 text-red",
  soon: "border-orange/30 bg-orange/10 text-orange",
  calm: "border-white/10 bg-white/[0.04] text-neutral-300",
  past: "border-white/10 bg-white/[0.03] text-neutral-500",
} as const;

/** "4h 59m left" pill. Red under 24h, orange under 3 days. Ticks every 30s. */
export function Countdown({ deadline, className = "" }: { deadline: string; className?: string }) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    setNow(Date.now());
    const t = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(t);
  }, []);
  const { label, tone } = timeLeft(deadline, now);
  return (
    <span suppressHydrationWarning className={`inline-flex h-6 shrink-0 items-center gap-1.5 rounded-full border px-2.5 text-xs font-medium tabular-nums ${TONES[tone]} ${className}`}>
      {tone === "urgent" && <span className="size-1.5 animate-pulse rounded-full bg-current" />}
      {label}
    </span>
  );
}
