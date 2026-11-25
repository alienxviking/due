"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Count } from "@/components/count";
import { Stagger } from "@/components/motion/stagger";
import { NextUp } from "@/components/next-up";
import { Empty, SectionLabel } from "@/components/page-header";
import { PostCard } from "@/components/post-card";
import { WeekStrip, type Day } from "@/components/week-strip";
import { subjectOf } from "@/lib/subject";
import { formatDeadline, GROUPS, groupOf, toISTParts, type Group } from "@/lib/time";
import type { Post } from "@/lib/types";

function Stat({ value, label, color, delay }: { value: number; label: string; color: string; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: "spring", stiffness: 400, damping: 28, delay }}
      className="flex flex-1 flex-col rounded-[20px] border border-line bg-surface/80 px-3.5 py-3 backdrop-blur"
    >
      <span className="font-display text-[26px] font-bold leading-none" style={{ color }}>
        <Count value={value} className="tabular-nums" />
      </span>
      <span className="mt-1 text-xs font-semibold text-muted">{label}</span>
    </motion.div>
  );
}

export function FeedView({ posts, days, isAdmin, now }: { posts: Post[]; days: Day[]; isAdmin: boolean; now: number }) {
  const [selected, setSelected] = useState<string | null>(null);

  const stats = useMemo(() => {
    let today = 0, week = 0, tba = 0;
    for (const p of posts) {
      if (!p.deadline) { tba++; continue; }
      const g = groupOf(p.deadline, now);
      if (g === "Today") today++;
      if (g === "Today" || g === "Tomorrow" || g === "This week") week++;
    }
    return { today, week, tba };
  }, [posts, now]);

  const editHref = (p: Post) => (isAdmin ? `/posts/${p.id}/edit` : undefined);
  const next = posts.find((p) => p.deadline);

  if (posts.length === 0) {
    return (
      <Empty icon="🎉" title="All clear">
        Nothing due right now.{" "}
        <Link href="/new" className="font-semibold text-accent">
          Post a deadline
        </Link>
      </Empty>
    );
  }

  const dayPosts = selected ? posts.filter((p) => p.deadline && toISTParts(p.deadline).date === selected) : [];
  const groups = new Map<Group, Post[]>();
  for (const p of posts) {
    if (p === next) continue;
    const g = groupOf(p.deadline, now);
    groups.set(g, [...(groups.get(g) ?? []), p]);
  }
  const selectedDay = days.find((d) => d.date === selected);

  return (
    <>
      <div className="mb-5 flex gap-2.5">
        <Stat value={stats.today} label="Due today" color="var(--accent)" delay={0.05} />
        <Stat value={stats.week} label="This week" color="#7c5cff" delay={0.1} />
        <Stat value={stats.tba} label="Date TBA" color="var(--warn)" delay={0.15} />
      </div>

      <WeekStrip days={days} selected={selected} onSelect={setSelected} />

      <AnimatePresence mode="wait" initial={false}>
        {selected ? (
          <motion.section key={selected} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.18 }}>
            <div className="mb-2.5 flex items-center justify-between px-1">
              <h3 className="text-[13px] font-semibold text-muted">
                {selectedDay?.isToday ? "Today" : `${selectedDay?.weekday}, ${selectedDay?.day} ${selectedDay?.month}`}
              </h3>
              <button onClick={() => setSelected(null)} className="text-[13px] font-semibold text-accent">
                Show all
              </button>
            </div>
            {dayPosts.length === 0 ? (
              <Empty icon="🌤" title="Nothing due this day" />
            ) : (
              <Stagger className="flex flex-col gap-3">
                {dayPosts.map((p) => (
                  <PostCard key={p.id} post={p} editHref={editHref(p)} />
                ))}
              </Stagger>
            )}
          </motion.section>
        ) : (
          <motion.div key="all" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
            {next && (
              <NextUp title={next.title} url={next.url} deadline={next.deadline!} when={formatDeadline(next.deadline)} subject={subjectOf(next.title, next.note)} />
            )}
            {GROUPS.filter((g) => groups.has(g)).map((g, gi) => (
              <section key={g} className="mb-7">
                <SectionLabel count={groups.get(g)!.length}>{g}</SectionLabel>
                <Stagger className="flex flex-col gap-3" delay={0.08 + gi * 0.05}>
                  {groups.get(g)!.map((p) => (
                    <PostCard key={p.id} post={p} editHref={editHref(p)} />
                  ))}
                </Stagger>
              </section>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
