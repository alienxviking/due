"use client";

import { motion, useMotionTemplate, useMotionValue } from "motion/react";
import { useState } from "react";
import { cn } from "@/lib/utils";

/**
 * Aceternity-style input: a soft blue glow in the border follows the cursor.
 * Wraps any field (input / textarea) passed as children.
 */
export function GlowField({ children, className }: { children: React.ReactNode; className?: string }) {
  const [visible, setVisible] = useState(false);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const radius = 120;

  return (
    <motion.div
      style={{
        background: useMotionTemplate`radial-gradient(${visible ? radius + "px" : "0px"} circle at ${mouseX}px ${mouseY}px, #3b82f6, transparent 80%)`,
      }}
      onMouseMove={({ currentTarget, clientX, clientY }) => {
        const r = currentTarget.getBoundingClientRect();
        mouseX.set(clientX - r.left);
        mouseY.set(clientY - r.top);
      }}
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      className={cn("group/field rounded-xl p-[2px] transition duration-300", className)}
    >
      {children}
    </motion.div>
  );
}

export const fieldClass =
  "w-full rounded-[10px] border-none bg-neutral-900 px-3.5 py-3 text-base text-white shadow-[0px_0px_1px_1px_#404040] outline-none transition duration-300 placeholder:text-neutral-600 focus-visible:ring-2 focus-visible:ring-neutral-500 group-hover/field:shadow-none";

export function Label({ children, htmlFor }: { children: React.ReactNode; htmlFor?: string }) {
  return (
    <label htmlFor={htmlFor} className="mb-2 block text-sm font-medium text-neutral-300">
      {children}
    </label>
  );
}
