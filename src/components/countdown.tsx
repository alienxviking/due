"use client";

import { useEffect, useState } from "react";
import { timeLeft } from "@/lib/time";

const TONES = { urgent: "text-red", soon: "text-orange", calm: "text-label-2", past: "text-label-3" } as const;

/** "4h 59m" in the row's trailing slot: red under 24h, orange under 3 days. Ticks every 30s. */
export function Countdown({ deadline, className = "" }: { deadline: string; className?: string }) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    setNow(Date.now());
    const t = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(t);
  }, []);
  const { label, tone } = timeLeft(deadline, now);
  return (
    <span suppressHydrationWarning className={`tabular-nums ${TONES[tone]} ${className}`}>
      {label.replace(" left", "")}
    </span>
  );
}
