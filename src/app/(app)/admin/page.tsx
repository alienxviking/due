import { notFound } from "next/navigation";
import { Count } from "@/components/count";
import { Stagger } from "@/components/motion/stagger";
import { Empty, PageHeader } from "@/components/page-header";
import { AdminActions, Removable, SwipeId } from "@/components/post-actions";
import { PostCard } from "@/components/post-card";
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
      <PageHeader
        title="Queue"
        subtitle={
          posts.length ? (
            <span className="inline-flex items-baseline gap-1">
              <Count value={posts.length} className="font-semibold text-text tabular-nums" /> waiting · swipe right to approve, left to reject
            </span>
          ) : (
            "Approved posts notify everyone."
          )
        }
      />
      {posts.length === 0 ? (
        <Empty icon="☕" title="All caught up">
          New submissions show up here, and you&apos;ll get a notification.
        </Empty>
      ) : (
        <Stagger className="flex flex-col gap-3">
          {posts.map((p) => (
            <SwipeId key={p.id} id={p.id}>
              <Removable swipe>
                <PostCard post={p}>
                  <AdminActions id={p.id} />
                </PostCard>
              </Removable>
            </SwipeId>
          ))}
        </Stagger>
      )}
    </PullToRefresh>
  );
}
