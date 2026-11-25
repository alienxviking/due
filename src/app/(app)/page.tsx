import Link from "next/link";
import { Count } from "@/components/count";
import { Stagger } from "@/components/motion/stagger";
import { NextUp } from "@/components/next-up";
import { NotificationBanner } from "@/components/notifications";
import { Empty, FeedTabs, PageHeader, SectionLabel } from "@/components/page-header";
import { PostCard } from "@/components/post-card";
import { PullToRefresh } from "@/components/pull-to-refresh";
import { getMe, getSession } from "@/lib/me";
import { formatDeadline, GROUPS, groupOf, type Group } from "@/lib/time";
import type { Post } from "@/lib/types";

function greeting(now: number) {
  const h = Number(new Intl.DateTimeFormat("en-IN", { timeZone: "Asia/Kolkata", hour: "numeric", hourCycle: "h23" }).format(now));
  return h < 5 ? "Up late" : h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
}

export default async function Home() {
  const { supabase, batch } = await getSession();
  const now = Date.now();

  const [{ profile, isAdmin }, { data }] = await Promise.all([
    getMe(),
    supabase
      .from("posts")
      .select("*")
      .eq("status", "approved")
      .eq("batch", batch)
      .or(`deadline.gte.${new Date(now).toISOString()},deadline.is.null`)
      .order("deadline", { ascending: true, nullsFirst: false })
      .returns<Post[]>(),
  ]);
  const posts = data ?? [];
  const next = posts.find((p) => p.deadline);
  const rest = posts.filter((p) => p !== next);

  const groups = new Map<Group, Post[]>();
  for (const p of rest) {
    const g = groupOf(p.deadline, now);
    groups.set(g, [...(groups.get(g) ?? []), p]);
  }
  const thisWeek = posts.filter((p) => p.deadline && ["Today", "Tomorrow", "This week"].includes(groupOf(p.deadline, now))).length;
  const first = profile.name?.split(" ")[0] ?? "there";
  const editHref = (p: Post) => (isAdmin ? `/posts/${p.id}/edit` : undefined);

  return (
    <PullToRefresh>
      <PageHeader
        title={
          <>
            {greeting(now)},
            <br />
            <span className="text-accent">{first}</span>
          </>
        }
        subtitle={
          thisWeek === 0 ? (
            "Nothing due this week."
          ) : (
            <span className="inline-flex items-baseline gap-1">
              <Count value={thisWeek} className="font-semibold text-text tabular-nums" />
              {thisWeek === 1 ? "deadline" : "deadlines"} this week
            </span>
          )
        }
      />
      <NotificationBanner />
      <FeedTabs active="upcoming" />

      {posts.length === 0 ? (
        <Empty icon="🎉" title="All clear">
          Nothing due right now.{" "}
          <Link href="/new" className="font-semibold text-accent">
            Post a deadline
          </Link>
        </Empty>
      ) : (
        <>
          {next && <NextUp title={next.title} url={next.url} deadline={next.deadline!} when={formatDeadline(next.deadline)} />}
          {GROUPS.filter((g) => groups.has(g)).map((g, gi) => (
            <section key={g} className="mb-7">
              <SectionLabel count={groups.get(g)!.length}>{g}</SectionLabel>
              <Stagger className="flex flex-col gap-2.5" delay={0.08 + gi * 0.05}>
                {groups.get(g)!.map((p) => (
                  <PostCard key={p.id} post={p} editHref={editHref(p)} />
                ))}
              </Stagger>
            </section>
          ))}
        </>
      )}
    </PullToRefresh>
  );
}
