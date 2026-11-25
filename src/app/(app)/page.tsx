import Link from "next/link";
import { Empty, FeedTabs, PageHeader } from "@/components/page-header";
import { PostCard } from "@/components/post-card";
import { getMe } from "@/lib/me";
import type { Post } from "@/lib/types";

export default async function Home() {
  const { supabase, profile, isAdmin } = await getMe();
  const now = new Date().toISOString();

  const { data } = await supabase
    .from("posts")
    .select("*")
    .eq("status", "approved")
    .eq("batch", profile.batch)
    .or(`deadline.gte.${now},deadline.is.null`)
    .order("deadline", { ascending: true, nullsFirst: false })
    .returns<Post[]>();
  const posts = data ?? [];

  return (
    <>
      <PageHeader title="Due" subtitle={`Hi ${profile.name?.split(" ")[0] ?? "there"}`} />
      <FeedTabs active="upcoming" />
      {posts.length === 0 ? (
        <Empty>
          Nothing due. Enjoy it while it lasts.
          <br />
          <Link href="/new" className="mt-2 inline-block font-medium text-text underline underline-offset-2">
            Post a deadline
          </Link>
        </Empty>
      ) : (
        <div className="flex flex-col gap-3">
          {posts.map((p) => (
            <PostCard key={p.id} post={p} canEdit={isAdmin} />
          ))}
        </div>
      )}
    </>
  );
}
