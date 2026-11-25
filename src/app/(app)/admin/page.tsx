import { notFound } from "next/navigation";
import { PageHead } from "@/components/glass/page-head";
import { QueueCard } from "@/components/post-actions";
import { InboxEmpty } from "@/components/spectrumui/blocks/empty-states/inbox-empty";
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
        <div className="mx-auto max-w-xl">
          <InboxEmpty
            panelTitle="Approval queue"
            title="All caught up"
            description="Nothing is waiting for approval. When someone submits a deadline, it lands here and you get a notification."
            stats={[{ label: "Waiting", value: "0" }]}
            variant="Cleared"
            archiveLabel="Back to deadlines"
            archiveHref="/"
          />
        </div>
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
