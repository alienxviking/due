"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { SlidingNumber } from "@/components/animate-ui/primitives/texts/sliding-number";

function parts(ms: number) {
  const s = Math.max(0, Math.floor(ms / 1000));
  return { d: Math.floor(s / 86400), h: Math.floor((s % 86400) / 3600), m: Math.floor((s % 3600) / 60), s: s % 60 };
}

function Unit({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex min-w-[52px] flex-col items-center rounded-2xl bg-white/15 px-2 py-2 backdrop-blur-sm">
      <SlidingNumber number={value} padStart className="font-display text-[28px] font-bold leading-none tabular-nums" />
      <span className="mt-1 text-[10px] font-semibold uppercase tracking-widest opacity-75">{label}</span>
    </div>
  );
}

/** The most urgent deadline, big, with a live ticking countdown. */
export function NextUp({ title, url, deadline, when }: { title: string; url: string; deadline: string; when: string }) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  const left = new Date(deadline).getTime() - now;
  const { d, h, m, s } = parts(left);
  const urgent = left < 24 * 3600e3;

  return (
    <motion.a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ opacity: 0, y: 16, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 300, damping: 26 }}
      className={`relative mb-6 block overflow-hidden rounded-[28px] p-5 text-white shadow-[0_20px_40px_-18px_var(--accent)] ${
        urgent ? "bg-[linear-gradient(135deg,#ff7a45,#e8401c_55%,#c42d12)]" : "bg-[linear-gradient(135deg,#2b2f3a,#17181c)]"
      }`}
    >
      {/* soft moving glow */}
      <motion.span
        aria-hidden
        className="pointer-events-none absolute -top-16 -right-10 size-48 rounded-full bg-white/20 blur-3xl"
        animate={{ x: [0, -20, 0], y: [0, 12, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      <div className="relative">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest opacity-85">
          <span className="relative flex size-2">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-white opacity-70" />
            <span className="relative inline-flex size-2 rounded-full bg-white" />
          </span>
          Next up
        </div>
        <h2 className="font-display mt-2 text-[22px] font-bold leading-tight">{title}</h2>
        <p className="mt-0.5 text-sm opacity-80">{when}</p>
        <div className="mt-4 flex gap-2">
          {d > 0 && <Unit value={d} label={d === 1 ? "day" : "days"} />}
          <Unit value={h} label="hrs" />
          <Unit value={m} label="min" />
          <Unit value={s} label="sec" />
        </div>
      </div>
    </motion.a>
  );
}
