"use client";

import { useEffect, useState } from "react";
import { timeLeft } from "@/lib/time";

const TONES = {
  urgent: "bg-accent/15 text-accent",
  soon: "bg-warn/15 text-warn",
  calm: "bg-line text-muted",
  past: "bg-line text-muted",
} as const;

/** "2d 4h left" chip. Rendered after mount so server and client clocks never disagree. */
export function Countdown({ deadline }: { deadline: string }) {
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    setNow(Date.now());
    const t = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(t);
  }, []);

  if (now === null) return <span className="inline-block h-6 w-16" aria-hidden />;
  const { label, tone } = timeLeft(deadline, now);
  return (
    <span className={`inline-flex h-6 items-center rounded-full px-2.5 text-xs font-medium tabular-nums ${TONES[tone]}`}>
      {label}
    </span>
  );
}
