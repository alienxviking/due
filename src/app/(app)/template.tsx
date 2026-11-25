"use client";

import { motion, useReducedMotion } from "motion/react";

// Re-mounts on every navigation: a short cross-fade between tabs, like UITabBarController.
export default function Template({ children }: { children: React.ReactNode }) {
  const reduce = useReducedMotion();
  return (
    <motion.div initial={reduce ? false : { opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.14 }}>
      {children}
    </motion.div>
  );
}
