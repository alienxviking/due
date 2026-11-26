"use client";

import { NumberTicker } from "@/components/motion/number-ticker";

/** A number whose digits roll into place on first view (Spectrum UI Number Ticker). */
export function Count({ value, className }: { value: number; className?: string }) {
  return <NumberTicker value={value} className={className} />;
}
