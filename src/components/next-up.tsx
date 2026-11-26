"use client";

import { useEffect, useState } from "react";
import { NumberTicker } from "@/components/motion/number-ticker";
import { Beam } from "@/components/glass/beam";
import { GlassCard } from "@/components/glass/glass-card";
import { Meteors } from "@/components/ui/meteors";
import type { Subject } from "@/lib/subject";

function parts(ms: number) {
  const s = Math.max(0, Math.floor(ms / 1000));
  return { d: Math.floor(s / 86400), h: Math.floor((s % 86400) / 3600), m: Math.floor((s % 3600) / 60), s: s % 60 };
}

function Unit({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col">
      <NumberTicker value={value} pad={2} duration={0.6} className="text-4xl leading-none font-bold text-neutral-50 md:text-6xl" />
      <span className="mt-2 text-[11px] font-medium tracking-[0.2em] text-neutral-500 uppercase">{label}</span>
    </div>
  );
}

/** The soonest deadline as a hero tile: meteors, glowing border, live countdown. */
export function NextUp({ title, url, deadline, when, subject, initialNow }: { title: string; url: string; deadline: string; when: string; subject: Subject; initialNow: number }) {
  // Start from the server's timestamp so server and browser render identical digits.
  const [now, setNow] = useState(initialNow);
  useEffect(() => {
    setNow(Date.now());
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  const left = new Date(deadline).getTime() - now;
  const { d, h, m, s } = parts(left);

  return (
    <Beam size="md" color={left < 24 * 3600e3 ? "sunset" : "ocean"} duration={4} className="h-full">
    <GlassCard className="h-full" glow={false}>
      <a href={url} target="_blank" rel="noopener noreferrer" className="relative flex h-full flex-col justify-between gap-8 p-6 md:p-8">
        <Meteors number={14} />
        <div
          aria-hidden
          className="pointer-events-none absolute -top-24 -right-24 size-64 rounded-full opacity-30 blur-3xl"
          style={{ background: subject.color }}
        />
        <div className="relative">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs font-medium tracking-wide text-neutral-300">
            <span className="relative flex size-2">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-red opacity-70" />
              <span className="relative inline-flex size-2 rounded-full bg-red" />
            </span>
            NEXT UP · {subject.label.toUpperCase()}
          </span>
          <h2 className="mt-4 text-2xl leading-tight font-bold text-neutral-50 md:text-3xl">{title}</h2>
          <p className="mt-1 text-sm text-neutral-400">{when}</p>
        </div>
        <div className="relative flex gap-6 md:gap-10">
          {d > 0 && <Unit value={d} label={d === 1 ? "day" : "days"} />}
          <Unit value={h} label="hrs" />
          <Unit value={m} label="min" />
          <Unit value={s} label="sec" />
        </div>
      </a>
    </GlassCard>
    </Beam>
  );
}
