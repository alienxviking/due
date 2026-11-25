"use client";

import { BorderBeam, type BorderBeamColorVariant, type BorderBeamSize } from "border-beam";

/**
 * Spectrum UI's border beam (the engine behind its Beam Card), as a client wrapper
 * so server components can use it. Light travels or pulses around the child's border.
 */
export function Beam({
  children,
  size = "md",
  color = "ocean",
  duration,
  className,
}: {
  children: React.ReactNode;
  size?: BorderBeamSize;
  color?: BorderBeamColorVariant;
  duration?: number;
  className?: string;
}) {
  return (
    <BorderBeam size={size} colorVariant={color} theme="dark" duration={duration} className={className}>
      {children}
    </BorderBeam>
  );
}
