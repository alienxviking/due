"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Count } from "@/components/count";
import { DeadlineCard } from "@/components/deadline-card";
import { GlowingEffect } from "@/components/ui/glowing-effect";
import { NextUp } from "@/components/next-up";
import { subjectOf } from "@/lib/subject";
import { tap } from "@/lib/haptics";
import { formatDeadline, GROUPS, groupOf, type Group } from "@/lib/time";
import type { Post } from "@/lib/types";

type Filter = "today" | "week" | "all" | "tba";

const TILES: { key: Filter; label: string; dot: string }[] = [
  { key: "today", label: "Due today", dot: "var(--red)" },
  { key: "week", label: "This week", dot: "var(--orange)" },
  { key: "all", label: "All upcoming", dot: "var(--tint)" },
  { key: "tba", label: "Date TBA", dot: "var(--yellow)" },
];


function Tile({ label, dot, count, on, onClick }: { label: string; dot: string; count: number; on: boolean; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="relative h-full rounded-[20px] border border-sep p-1 text-left">
      <GlowingEffect spread={30} glow disabled={false} proximity={48} inactiveZone={0.01} borderWidth={2} />
      <span
        className={`relative flex h-full flex-col justify-between gap-5 rounded-[16px] border p-4 transition-colors ${
          on ? "border-white/20 bg-white/[0.09]" : "border-white/[0.06] bg-[#0c0c0e]/80 hover:bg-white/[0.04]"
        }`}
      >
        <span className="flex items-center justify-between">
          <span className="size-2 rounded-full" style={{ background: dot, boxShadow: `0 0 12px 2px ${dot}` }} />
          {on && <span className="text-[10px] font-semibold tracking-[0.18em] text-neutral-400">SHOWING</span>}
        </span>
        <span>
          <Count value={count} className="block text-4xl leading-none font-bold text-neutral-50 tabular-nums" />
          <span className="mt-1.5 block text-sm text-neutral-400">{label}</span>
        </span>
      </span>
    </button>
  );
}

export function HomeView({ posts, isAdmin, now }: { posts: Post[]; isAdmin: boolean; now: number }) {
  const [filter, setFilter] = useState<Filter>("all");

  const { groups, counts } = useMemo(() => {
    const groups = new Map<Group, Post[]>();
    for (const p of posts) {
      const g = groupOf(p.deadline, now);
      groups.set(g, [...(groups.get(g) ?? []), p]);
    }
    const n = (g: Group) => groups.get(g)?.length ?? 0;
    return { groups, counts: { today: n("Today"), week: n("Today") + n("Tomorrow") + n("This week"), all: posts.length, tba: n("Date TBA") } as Record<Filter, number> };
  }, [posts, now]);

  const next = posts.find((p) => p.deadline);
  const visible: Group[] = filter === "today" ? ["Today"] : filter === "week" ? ["Today", "Tomorrow", "This week"] : filter === "tba" ? ["Date TBA"] : [...GROUPS];
  const shown = visible.filter((g) => groups.has(g));
  const editHref = (p: Post) => (isAdmin ? `/posts/${p.id}/edit` : undefined);

  return (
    <>
      {/* Bento: hero + four filter tiles */}
      <div className="grid gap-3 md:grid-cols-3 md:gap-4">
        <div className="md:col-span-2 md:row-span-2">
          {next ? (
            <NextUp title={next.title} url={next.url} deadline={next.deadline!} when={formatDeadline(next.deadline)} subject={subjectOf(next.title, next.note)} />
          ) : (
            <div className="flex h-full min-h-56 flex-col items-center justify-center rounded-[22px] border border-dashed border-white/10 p-8 text-center">
              <p className="text-chrome text-2xl font-bold">You&apos;re all clear.</p>
              <p className="mt-2 text-sm text-neutral-400">Nothing&apos;s due. Seen a deadline others might miss?</p>
              <Link href="/new" className="mt-5 rounded-full bg-white px-5 py-2 text-sm font-semibold text-black transition-transform active:scale-95">
                Post a deadline
              </Link>
            </div>
          )}
        </div>
        <div className="grid grid-cols-2 gap-3 md:col-span-1 md:row-span-2 md:gap-4">
          {TILES.map((t) => (
            <Tile key={t.key} label={t.label} dot={t.dot} count={counts[t.key]} on={filter === t.key} onClick={() => (tap(6), setFilter(t.key))} />
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait" initial={false}>
        <motion.div key={filter} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }} className="mt-10">
          {posts.length > 0 && shown.length === 0 && <p className="py-12 text-center text-sm text-neutral-500">Nothing in this list right now.</p>}
          {shown.length > 0 && (
            <>
              <h3 className="mb-4 flex items-center gap-3 text-sm font-medium text-neutral-400">
                {TILES.find((t) => t.key === filter)?.label}
                <span className="h-px flex-1 bg-gradient-to-r from-white/15 to-transparent" />
                <span className="tabular-nums text-neutral-600">{counts[filter]}</span>
              </h3>
              {/* One grid, soonest first: each card already shows its date and countdown. */}
              <div className="grid gap-3 sm:grid-cols-2 md:gap-4 lg:grid-cols-3">
                {shown
                  .flatMap((g) => groups.get(g)!)
                  .map((p, i) => (
                    <motion.div
                      key={p.id}
                      initial={{ opacity: 0, y: 14 }}
                      animate={{ opacity: 1, y: 0 }}
                      whileHover={{ y: -3 }}
                      transition={{ delay: Math.min(i, 8) * 0.04, type: "spring", stiffness: 300, damping: 28 }}
                    >
                      <DeadlineCard post={p} editHref={editHref(p)} />
                    </motion.div>
                  ))}
              </div>
            </>
          )}
        </motion.div>
      </AnimatePresence>
    </>
  );
}
