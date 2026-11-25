"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { useId } from "react";
import { tap } from "@/lib/haptics";
import { cn } from "@/lib/utils";

type Option = { value: string; label: React.ReactNode; href?: string };

/** UISegmentedControl: grey track, white thumb that slides. */
export function Segmented({ options, value, onChange, className }: { options: Option[]; value: string | null; onChange?: (v: string) => void; className?: string }) {
  const id = useId();
  return (
    <div className={cn("relative flex h-8 rounded-[9px] bg-fill p-0.5", className)}>
      {options.map((o) => {
        const active = o.value === value;
        const inner = (
          <>
            {active && (
              <motion.span
                layoutId={`seg-${id}`}
                className="absolute inset-0 rounded-[7px] bg-cell shadow-[0_3px_8px_rgb(0_0_0/0.12),0_3px_1px_rgb(0_0_0/0.04)] dark:bg-[#636366]"
                transition={{ type: "spring", stiffness: 600, damping: 45 }}
              />
            )}
            <span className="relative">{o.label}</span>
          </>
        );
        const cls = cn("relative flex flex-1 items-center justify-center text-[13px]", active ? "font-semibold" : "font-medium");
        return o.href ? (
          <Link key={o.value} href={o.href} className={cls} onClick={() => tap(5)}>
            {inner}
          </Link>
        ) : (
          <button key={o.value} type="button" className={cls} onClick={() => (tap(5), onChange?.(o.value))}>
            {inner}
          </button>
        );
      })}
    </div>
  );
}
