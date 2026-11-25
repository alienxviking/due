"use client";

import { SlidingNumber } from "@/components/animate-ui/primitives/texts/sliding-number";

/** A number that rolls up from 0 on first view (Animate UI SlidingNumber). */
export function Count({ value, className }: { value: number; className?: string }) {
  return <SlidingNumber number={value} fromNumber={0} className={className} />;
}
