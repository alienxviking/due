import { Stagger } from "@/components/motion/stagger";
import { Empty, FeedTabs, PageHeader } from "@/components/page-header";
import { PostCard } from "@/components/post-card";
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
      <PageHeader title="Past" subtitle="Deadlines that have closed." />
      <FeedTabs active="past" />
      {posts.length === 0 ? (
        <Empty icon="🗂" title="Nothing here yet" />
      ) : (
        <Stagger className="flex flex-col gap-2.5 opacity-70 grayscale-[30%]">
          {posts.map((p) => (
            <PostCard key={p.id} post={p} editHref={isAdmin ? `/posts/${p.id}/edit` : undefined} />
          ))}
        </Stagger>
      )}
    </PullToRefresh>
  );
}
