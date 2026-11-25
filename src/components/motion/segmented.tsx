"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { useId } from "react";
import { tap } from "@/lib/haptics";
import { cn } from "@/lib/utils";

type Option = { value: string; label: React.ReactNode; href?: string };

/** Glass pill tabs with a white thumb that slides. */
export function Segmented({ options, value, onChange, className }: { options: Option[]; value: string | null; onChange?: (v: string) => void; className?: string }) {
  const id = useId();
  return (
    <div className={cn("relative inline-flex rounded-full border border-white/10 bg-white/[0.03] p-1 backdrop-blur", className)}>
      {options.map((o) => {
        const active = o.value === value;
        const inner = (
          <>
            {active && <motion.span layoutId={`seg-${id}`} className="absolute inset-0 rounded-full bg-white" transition={{ type: "spring", stiffness: 500, damping: 40 }} />}
            <span className="relative">{o.label}</span>
          </>
        );
        const cls = cn("relative rounded-full px-5 py-1.5 text-sm font-medium transition-colors", active ? "text-black" : "text-neutral-400 hover:text-white");
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
