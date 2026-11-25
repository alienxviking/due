"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { useId } from "react";
import { tap } from "@/lib/haptics";
import { cn } from "@/lib/utils";

type Option = { value: string; label: React.ReactNode; href?: string };

/** Segmented control with a spring pill that slides to the active option. */
export function Segmented({
  options,
  value,
  onChange,
  className,
  size = "md",
}: {
  options: Option[];
  value: string | null;
  onChange?: (v: string) => void;
  className?: string;
  size?: "sm" | "md";
}) {
  const id = useId();
  return (
    <div className={cn("relative flex gap-1 rounded-2xl bg-surface-2 p-1", className)}>
      {options.map((o) => {
        const active = o.value === value;
        const inner = (
          <>
            {active && (
              <motion.span
                layoutId={`seg-${id}`}
                className="absolute inset-0 rounded-xl bg-surface shadow-card"
                transition={{ type: "spring", stiffness: 500, damping: 38 }}
              />
            )}
            <span className="relative">{o.label}</span>
          </>
        );
        const cls = cn(
          "relative flex-1 rounded-xl text-center font-semibold transition-colors",
          size === "sm" ? "py-1.5 text-[13px]" : "py-2 text-sm",
          active ? "text-text" : "text-muted",
        );
        return o.href ? (
          <Link key={o.value} href={o.href} className={cls} onClick={() => tap()}>
            {inner}
          </Link>
        ) : (
          <button
            key={o.value}
            type="button"
            className={cls}
            onClick={() => {
              tap();
              onChange?.(o.value);
            }}
          >
            {inner}
          </button>
        );
      })}
    </div>
  );
}
