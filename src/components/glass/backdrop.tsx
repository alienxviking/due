"use client";

import { useEffect, useState } from "react";
import { BackgroundBeams } from "@/components/ui/background-beams";
import { Spotlight } from "@/components/ui/spotlight-new";

/**
 * Fixed scene behind every page: dot grid + Aceternity spotlight beams + background beams.
 * Beams are skipped when the user prefers reduced motion.
 */
export function Backdrop({ beams = true }: { beams?: boolean }) {
  const [motionOk, setMotionOk] = useState(false);
  useEffect(() => {
    setMotionOk(!window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="dot-grid absolute inset-0" />
      {motionOk && <Spotlight />}
      {motionOk && beams && <BackgroundBeams className="opacity-100" />}
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-bg to-transparent" />
    </div>
  );
}
