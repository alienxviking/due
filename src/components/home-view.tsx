"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Count } from "@/components/count";
import { CalendarIcon, ClockIcon, ListIcon, QuestionIcon } from "@/components/ios/icons";
import { Section } from "@/components/ios/list";
import { FeedRow } from "@/components/post-actions";
import { tap } from "@/lib/haptics";
import { GROUPS, groupOf, type Group } from "@/lib/time";
import type { Post } from "@/lib/types";

type Filter = "today" | "week" | "all" | "tba";

const TILES: { key: Filter; label: string; color: string; Icon: typeof ListIcon }[] = [
  { key: "today", label: "Today", color: "var(--tint)", Icon: CalendarIcon },
  { key: "week", label: "This Week", color: "var(--red)", Icon: ClockIcon },
  { key: "all", label: "All", color: "#5c5c60", Icon: ListIcon },
  { key: "tba", label: "No Date", color: "var(--orange)", Icon: QuestionIcon },
];

const HEADERS: Record<Group, string> = { Today: "Today", Tomorrow: "Tomorrow", "This week": "This Week", Later: "Later", "Date TBA": "No Date Yet" };

/** Reminders-style smart list tiles that filter the list below. */
export function HomeView({ posts, isAdmin, now }: { posts: Post[]; isAdmin: boolean; now: number }) {
  const [filter, setFilter] = useState<Filter>("all");

  const { groups, counts } = useMemo(() => {
    const groups = new Map<Group, Post[]>();
    for (const p of posts) {
      const g = groupOf(p.deadline, now);
      groups.set(g, [...(groups.get(g) ?? []), p]);
    }
    const n = (g: Group) => groups.get(g)?.length ?? 0;
    return {
      groups,
      counts: { today: n("Today"), week: n("Today") + n("Tomorrow") + n("This week"), all: posts.length, tba: n("Date TBA") } as Record<Filter, number>,
    };
  }, [posts, now]);

  const visible: Group[] =
    filter === "today" ? ["Today"] : filter === "week" ? ["Today", "Tomorrow", "This week"] : filter === "tba" ? ["Date TBA"] : [...GROUPS];
  const shown = visible.filter((g) => groups.has(g));

  return (
    <>
      <div className="mx-4 mb-7 grid grid-cols-2 gap-3">
        {TILES.map(({ key, label, color, Icon }) => {
          const on = filter === key;
          return (
            <motion.button
              key={key}
              type="button"
              whileTap={{ scale: 0.97 }}
              onClick={() => (tap(6), setFilter(key))}
              className="flex flex-col rounded-[12px] px-3 pt-2.5 pb-2 text-left transition-colors duration-200"
              style={{ background: on ? color : "var(--cell)" }}
            >
              <span className="flex w-full items-start justify-between">
                <span className="flex size-[30px] items-center justify-center rounded-full" style={{ background: on ? "white" : color, color: on ? color : "white" }}>
                  <Icon size={18} filled={key === "today"} />
                </span>
                <span className={`text-[28px] leading-8 font-bold ${on ? "text-white" : ""}`}>
                  <Count value={counts[key]} className="tabular-nums" />
                </span>
              </span>
              <span className={`mt-1.5 text-[15px] font-semibold ${on ? "text-white" : "text-label-2"}`}>{label}</span>
            </motion.button>
          );
        })}
      </div>

      <AnimatePresence mode="wait" initial={false}>
        <motion.div key={filter} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
          {shown.length === 0 ? (
            <div className="flex flex-col items-center px-8 pt-10 text-center">
              <CalendarIcon size={44} className="text-label-3" />
              <p className="mt-3 text-[22px] font-bold">{posts.length === 0 ? "No Deadlines" : "Nothing Here"}</p>
              <p className="mt-1 text-[15px] text-label-2">
                {posts.length === 0 ? "When someone posts a deadline and it's approved, it shows up here." : "Nothing matches this list right now."}
              </p>
            </div>
          ) : (
            shown.map((g) => (
              <Section key={g} header={HEADERS[g]}>
                {groups.get(g)!.map((p) => (
                  <FeedRow key={p.id} post={p} isAdmin={isAdmin} />
                ))}
              </Section>
            ))
          )}
        </motion.div>
      </AnimatePresence>
    </>
  );
}
