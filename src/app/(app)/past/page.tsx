import { Empty, FeedTabs, PageHeader } from "@/components/page-header";
import { PostCard } from "@/components/post-card";
import { getMe } from "@/lib/me";
import type { Post } from "@/lib/types";

export const metadata = { title: "Past · Due" };

export default async function Past() {
  const { supabase, profile, isAdmin } = await getMe();

  const { data } = await supabase
    .from("posts")
    .select("*")
    .eq("status", "approved")
    .eq("batch", profile.batch)
    .lt("deadline", new Date().toISOString())
    .order("deadline", { ascending: false })
    .limit(50)
    .returns<Post[]>();
  const posts = data ?? [];

  return (
    <>
      <PageHeader title="Due" subtitle="Deadlines that have passed" />
      <FeedTabs active="past" />
      {posts.length === 0 ? (
        <Empty>No past deadlines yet.</Empty>
      ) : (
        <div className="flex flex-col gap-3 opacity-80">
          {posts.map((p) => (
            <PostCard key={p.id} post={p} canEdit={isAdmin} />
          ))}
        </div>
      )}
    </>
  );
}
