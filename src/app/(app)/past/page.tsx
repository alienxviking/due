import { DeadlineCard } from "@/components/deadline-card";
import { FeedTabs } from "@/components/feed-tabs";
import { PageHead } from "@/components/glass/page-head";
import { PullToRefresh } from "@/components/pull-to-refresh";
import { getMe, getSession } from "@/lib/me";
import type { Post } from "@/lib/types";

export const metadata = { title: "Past · Due" };

export default async function Past() {
  const { supabase, batch } = await getSession();
  const [{ isAdmin }, { data }] = await Promise.all([
    getMe(),
    supabase
      .from("posts")
      .select("*")
      .eq("status", "approved")
      .eq("batch", batch)
      .lt("deadline", new Date().toISOString())
      .order("deadline", { ascending: false })
      .limit(50)
      .returns<Post[]>(),
  ]);
  const posts = data ?? [];

  return (
    <PullToRefresh>
      <PageHead title="Deadlines" subtitle="Closed deadlines, newest first." right={<FeedTabs active="past" />} className="flex-col items-start md:flex-row md:items-end" />
      {posts.length === 0 ? (
        <p className="py-16 text-center text-sm text-neutral-500">Deadlines move here once they close.</p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 md:gap-4 lg:grid-cols-3">
          {posts.map((p) => (
            <DeadlineCard key={p.id} post={p} muted editHref={isAdmin ? `/posts/${p.id}/edit` : undefined} />
          ))}
        </div>
      )}
    </PullToRefresh>
  );
}
