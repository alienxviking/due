import { notFound } from "next/navigation";
import { PageHead } from "@/components/glass/page-head";
import { QueueCard } from "@/components/post-actions";
import { PullToRefresh } from "@/components/pull-to-refresh";
import { getMe, getSession } from "@/lib/me";
import type { Post } from "@/lib/types";

export const metadata = { title: "Queue · Due" };

export default async function AdminQueue() {
  const { supabase } = await getSession();
  const [{ isAdmin }, { data }] = await Promise.all([
    getMe(),
    supabase.from("posts").select("*").eq("status", "pending").order("created_at", { ascending: true }).returns<Post[]>(),
  ]);
  if (!isAdmin) notFound();
  const posts = data ?? [];

  return (
    <PullToRefresh>
      <PageHead
        title="Queue"
        subtitle={posts.length ? `${posts.length} waiting for your approval. Approved posts notify everyone.` : "All caught up. New submissions land here."}
      />
      {posts.length === 0 ? (
        <div className="flex min-h-56 items-center justify-center rounded-[22px] border border-dashed border-white/10 text-sm text-neutral-500">Nothing to review ☕</div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 md:gap-4 lg:grid-cols-3">
          {posts.map((p) => (
            <QueueCard key={p.id} post={p} />
          ))}
        </div>
      )}
    </PullToRefresh>
  );
}
