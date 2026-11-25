"use client";

import { useEffect, useState } from "react";
import { timeLeft } from "@/lib/time";

const TONES = {
  urgent: "bg-accent-soft text-accent",
  soon: "bg-warn-soft text-warn",
  calm: "bg-surface-2 text-muted",
  past: "bg-surface-2 text-muted",
} as const;

/** "2d 4h left" chip. Server renders it with its clock; the client takes over and ticks. */
export function Countdown({ deadline }: { deadline: string }) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    setNow(Date.now());
    const t = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(t);
  }, []);

  const { label, tone } = timeLeft(deadline, now);
  return (
    <span
      suppressHydrationWarning
      className={`inline-flex h-6 shrink-0 items-center rounded-full px-2.5 text-xs font-semibold tabular-nums ${TONES[tone]}`}
    >
      {label}
    </span>
  );
}
