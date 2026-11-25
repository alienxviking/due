import { FeedTabs, NewPostButton } from "@/components/feed-tabs";
import { HomeView } from "@/components/home-view";
import { NavBar } from "@/components/ios/nav-bar";
import { NotificationBanner } from "@/components/notifications";
import { PullToRefresh } from "@/components/pull-to-refresh";
import { getMe, getSession } from "@/lib/me";
import type { Post } from "@/lib/types";

export default async function Home() {
  const { supabase, batch } = await getSession();
  const now = Date.now();

  const [{ isAdmin }, { data }] = await Promise.all([
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

  return (
    <>
      <NavBar title="Deadlines" right={<NewPostButton />} />
      <PullToRefresh>
        <FeedTabs active="upcoming" />
        <NotificationBanner />
        <HomeView posts={data ?? []} isAdmin={isAdmin} now={now} />
      </PullToRefresh>
    </>
  );
}
