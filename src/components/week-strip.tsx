"use client";

import { motion } from "motion/react";
import { tap } from "@/lib/haptics";

export type Day = { date: string; weekday: string; day: string; month: string; colors: string[]; isToday: boolean };

/** Two-week calendar strip. Dots show subject colours of deadlines that day; tap to filter. */
export function WeekStrip({ days, selected, onSelect }: { days: Day[]; selected: string | null; onSelect: (d: string | null) => void }) {
  return (
    <div className="no-scrollbar -mx-4 mb-4 flex snap-x scroll-px-4 gap-2 overflow-x-auto px-4 py-1.5">
      {days.map((d, i) => {
        const on = selected === d.date;
        const has = d.colors.length > 0;
        return (
          <motion.button
            key={d.date}
            type="button"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.03 * Math.min(i, 8), type: "spring", stiffness: 400, damping: 30 }}
            whileTap={{ scale: 0.92 }}
            onClick={() => {
              tap();
              onSelect(on ? null : d.date);
            }}
            className={`relative flex w-[52px] shrink-0 snap-start flex-col items-center rounded-[18px] py-2.5 transition-colors ${
              on ? "text-white" : d.isToday ? "bg-surface text-text ring-2 ring-accent/50" : "bg-surface/70 text-text"
            } ${!has && !on ? "opacity-60" : ""}`}
          >
            {on && (
              <motion.span
                layoutId="day-pill"
                className="absolute inset-0 rounded-[18px] bg-[linear-gradient(160deg,#ff7a45,#e8401c)] shadow-[0_10px_22px_-10px_var(--accent)]"
                transition={{ type: "spring", stiffness: 500, damping: 38 }}
              />
            )}
            <span className={`relative text-[10px] font-bold uppercase tracking-wider ${on ? "opacity-85" : "text-muted"}`}>{d.isToday ? "Today" : d.weekday}</span>
            <span className="font-display relative mt-0.5 text-xl font-bold tabular-nums">{d.day}</span>
            <span className="relative mt-1 flex h-1.5 gap-0.5">
              {d.colors.slice(0, 3).map((c, j) => (
                <span key={j} className="size-1.5 rounded-full" style={{ background: on ? "white" : c }} />
              ))}
            </span>
          </motion.button>
        );
      })}
    </div>
  );
}
