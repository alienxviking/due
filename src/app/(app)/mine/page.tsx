import Link from "next/link";
import { PageHead } from "@/components/glass/page-head";
import { MineCard } from "@/components/post-actions";
import { PullToRefresh } from "@/components/pull-to-refresh";
import { getSession } from "@/lib/me";
import type { Post } from "@/lib/types";

export const metadata = { title: "My posts · Due" };

export default async function Mine() {
  const { supabase, userId } = await getSession();
  const { data } = await supabase
    .from("posts")
    .select("*")
    .eq("author_id", userId)
    .order("created_at", { ascending: false })
    .limit(50)
    .returns<Post[]>();
  const posts = data ?? [];

  return (
    <PullToRefresh>
      <PageHead title="My posts" subtitle="What you've submitted and where it stands." />
      {posts.length === 0 ? (
        <div className="flex min-h-56 flex-col items-center justify-center rounded-[22px] border border-dashed border-white/10 p-8 text-center">
          <p className="text-chrome text-2xl font-bold">Nothing posted yet</p>
          <p className="mt-2 text-sm text-neutral-400">Seen a deadline others might miss? Post it and an admin will check it.</p>
          <Link href="/new" className="mt-5 rounded-full bg-white px-5 py-2 text-sm font-semibold text-black">
            Post a deadline
          </Link>
        </div>
      ) : (
        <div className="grid gap-x-4 gap-y-6 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((p) => (
            <MineCard key={p.id} post={p} />
          ))}
        </div>
      )}
    </PullToRefresh>
  );
}
