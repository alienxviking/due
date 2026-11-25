import { notFound } from "next/navigation";
import { Empty, PageHeader } from "@/components/page-header";
import { AdminActions } from "@/components/post-actions";
import { PostCard } from "@/components/post-card";
import { getMe } from "@/lib/me";
import type { Post } from "@/lib/types";

export const metadata = { title: "Queue · Due" };

export default async function AdminQueue() {
  const { supabase, isAdmin } = await getMe();
  if (!isAdmin) notFound();

  const { data } = await supabase
    .from("posts")
    .select("*")
    .eq("status", "pending")
    .order("created_at", { ascending: true })
    .returns<Post[]>();
  const posts = data ?? [];

  return (
    <>
      <PageHeader title="Approval queue" subtitle="Approved posts go live and notify everyone." />
      {posts.length === 0 ? (
        <Empty>All caught up.</Empty>
      ) : (
        <div className="flex flex-col gap-3">
          {posts.map((p) => (
            <PostCard key={p.id} post={p}>
              <AdminActions id={p.id} />
            </PostCard>
          ))}
        </div>
      )}
    </>
  );
}
