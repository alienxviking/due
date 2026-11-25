"use client";

import { Children } from "react";
import { motion, useReducedMotion } from "motion/react";

/** Children slide up one after another. Works around server-rendered children. */
export function Stagger({ children, className, delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const reduce = useReducedMotion();
  return (
    <div className={className}>
      {Children.toArray(children).map((child, i) => (
        <motion.div
          key={(child as { key?: string }).key ?? i}
          initial={reduce ? false : { opacity: 0, y: 14, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ type: "spring", stiffness: 380, damping: 30, delay: delay + Math.min(i, 8) * 0.045 }}
        >
          {child}
        </motion.div>
      ))}
    </div>
  );
}

/** Fades and lifts any block in. */
export function Rise({ children, className, delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduce ? false : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 28, delay }}
    >
      {children}
    </motion.div>
  );
}
