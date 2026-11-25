import { FeedTabs, NewPostButton } from "@/components/feed-tabs";
import { NavBar } from "@/components/ios/nav-bar";
import { Section } from "@/components/ios/list";
import { FeedRow } from "@/components/post-actions";
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
    <>
      <NavBar title="Deadlines" right={<NewPostButton />} />
      <PullToRefresh>
        <FeedTabs active="past" />
        {posts.length === 0 ? (
          <p className="px-8 pt-10 text-center text-[15px] text-label-2">Deadlines move here once they close.</p>
        ) : (
          <Section header="Closed">
            {posts.map((p) => (
              <FeedRow key={p.id} post={p} isAdmin={isAdmin} muted />
            ))}
          </Section>
        )}
      </PullToRefresh>
    </>
  );
}
