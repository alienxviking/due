import { FeedView } from "@/components/feed-view";
import { NotificationBanner } from "@/components/notifications";
import { FeedTabs, PageHeader } from "@/components/page-header";
import { PullToRefresh } from "@/components/pull-to-refresh";
import type { Day } from "@/components/week-strip";
import { getMe, getSession } from "@/lib/me";
import { subjectOf } from "@/lib/subject";
import { addDaysIST, tileParts, toISTParts } from "@/lib/time";
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

  // Next 14 days (IST) with the subject colours of whatever is due each day.
  const byDay = new Map<string, string[]>();
  for (const p of posts) {
    if (!p.deadline) continue;
    const d = toISTParts(p.deadline).date;
    byDay.set(d, [...(byDay.get(d) ?? []), subjectOf(p.title, p.note).color]);
  }
  const days: Day[] = Array.from({ length: 14 }, (_, i) => {
    const date = addDaysIST(i);
    const t = tileParts(`${date}T12:00:00+05:30`);
    return { date, weekday: t.weekday, day: t.day, month: t.month, colors: byDay.get(date) ?? [], isToday: i === 0 };
  });

  const first = profile.name?.split(" ")[0] ?? "there";

  return (
    <PullToRefresh>
      <PageHeader
        title={
          <>
            {greeting(now)},
            <br />
            <span className="bg-[linear-gradient(90deg,#ff6b3d,#7c5cff)] bg-clip-text text-transparent">{first}</span>
          </>
        }
      />
      <NotificationBanner />
      <FeedTabs active="upcoming" />
      <FeedView posts={posts} days={days} isAdmin={isAdmin} now={now} />
    </PullToRefresh>
  );
}
