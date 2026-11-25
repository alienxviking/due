import { notFound } from "next/navigation";
import { Empty, PageHeader } from "@/components/page-header";
import { AdminActions, Removable } from "@/components/post-actions";
import { PostCard } from "@/components/post-card";
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
    <>
      <PageHeader title="Queue" subtitle={posts.length ? `${posts.length} waiting for approval` : "Approved posts notify everyone"} />
      {posts.length === 0 ? (
        <Empty title="All caught up">New submissions will show up here, and you&apos;ll get a notification.</Empty>
      ) : (
        <div className="flex flex-col gap-2.5">
          {posts.map((p) => (
            <Removable key={p.id}>
              <PostCard post={p}>
                <AdminActions id={p.id} />
              </PostCard>
            </Removable>
          ))}
        </div>
      )}
    </>
  );
}
