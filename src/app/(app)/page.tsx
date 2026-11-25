import { FeedTabs } from "@/components/feed-tabs";
import { PageHead } from "@/components/glass/page-head";
import { HomeView } from "@/components/home-view";
import { NotificationBanner } from "@/components/notifications";
import { PullToRefresh } from "@/components/pull-to-refresh";
import { getMe, getSession } from "@/lib/me";
import { groupOf } from "@/lib/time";
import type { Post } from "@/lib/types";

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
  const week = posts.filter((p) => p.deadline && ["Today", "Tomorrow", "This week"].includes(groupOf(p.deadline, now))).length;
  const first = profile.name?.split(" ")[0] ?? "there";

  return (
    <PullToRefresh>
      <PageHead
        title="Deadlines"
        generate
        subtitle={week === 0 ? `Nothing due this week, ${first}. Enjoy it.` : `${first}, you have ${week} ${week === 1 ? "deadline" : "deadlines"} this week.`}
        right={<FeedTabs active="upcoming" />}
        className="flex-col items-start md:flex-row md:items-end"
      />
      <NotificationBanner />
      <HomeView posts={posts} isAdmin={isAdmin} now={now} />
    </PullToRefresh>
  );
}
