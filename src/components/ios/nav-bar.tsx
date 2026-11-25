"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";

/**
 * UIKit-style navigation bar: a large title in the page, and a compact translucent
 * bar that fades in (with a hairline) once the large title scrolls away.
 */
export function NavBar({ title, left, right, large = true }: { title: string; left?: React.ReactNode; right?: React.ReactNode; large?: boolean }) {
  const [scrolled, setScrolled] = useState(!large);

  useEffect(() => {
    if (!large) return;
    const on = () => setScrolled(window.scrollY > 38);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, [large]);

  return (
    <>
      <div
        className={`fixed inset-x-0 top-0 z-30 pt-[env(safe-area-inset-top)] transition-[background-color,box-shadow,backdrop-filter] duration-200 ${
          scrolled ? "hairline-b bg-bar backdrop-blur-xl backdrop-saturate-150" : "bg-transparent"
        }`}
      >
        <div className="mx-auto grid h-11 max-w-xl grid-cols-[1fr_auto_1fr] items-center px-4">
          <div className="flex justify-start">{left}</div>
          <motion.span
            initial={false}
            animate={{ opacity: scrolled ? 1 : 0, y: scrolled ? 0 : 4 }}
            transition={{ duration: 0.18 }}
            className="truncate text-[17px] font-semibold"
          >
            {title}
          </motion.span>
          <div className="flex justify-end">{right}</div>
        </div>
      </div>
      <div className="h-[calc(44px+env(safe-area-inset-top))]" />
      {large && <h1 className="px-4 pt-0.5 pb-2 text-[34px] leading-[41px] font-bold tracking-[0.01em]">{title}</h1>}
    </>
  );
}

/** Text or icon button for the nav bar, tinted like UIKit bar buttons. */
export function BarButton({ children, bold, className = "", ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { bold?: boolean }) {
  return (
    <button
      {...props}
      className={`-mx-2 flex min-h-11 min-w-11 items-center justify-center px-2 text-[17px] text-tint transition-opacity active:opacity-30 disabled:text-label-3 ${bold ? "font-semibold" : ""} ${className}`}
    >
      {children}
    </button>
  );
}
