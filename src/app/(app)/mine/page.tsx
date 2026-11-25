import Link from "next/link";
import { Stagger } from "@/components/motion/stagger";
import { Empty, PageHeader } from "@/components/page-header";
import { DeleteButton, Removable } from "@/components/post-actions";
import { PostCard } from "@/components/post-card";
import { PullToRefresh } from "@/components/pull-to-refresh";
import { getSession } from "@/lib/me";
import type { Post } from "@/lib/types";

export const metadata = { title: "My posts · Due" };

const STATUS = {
  pending: { label: "Waiting for approval", cls: "bg-warn-soft text-warn", dot: "bg-warn animate-pulse" },
  approved: { label: "Live", cls: "bg-ok-soft text-ok", dot: "bg-ok" },
  rejected: { label: "Not approved", cls: "bg-accent-soft text-accent", dot: "bg-accent" },
} as const;

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
      <PageHeader title="My posts" subtitle="What you've submitted and where it stands." />
      {posts.length === 0 ? (
        <Empty icon="✏️" title="Nothing posted yet">
          Seen a deadline others might miss?{" "}
          <Link href="/new" className="font-semibold text-accent">
            Post it
          </Link>
        </Empty>
      ) : (
        <Stagger className="flex flex-col gap-4">
          {posts.map((p) => {
            const s = STATUS[p.status];
            return (
              <Removable key={p.id}>
                <span className={`mb-2 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${s.cls}`}>
                  <span className={`size-1.5 rounded-full ${s.dot}`} />
                  {s.label}
                </span>
                <PostCard post={{ ...p, author_name: null }}>
                  {p.status === "rejected" && p.reject_reason && (
                    <p className="mt-3 rounded-xl bg-accent-soft px-3 py-2.5 text-sm">
                      <span className="font-semibold text-accent">Reason:</span> {p.reject_reason}
                    </p>
                  )}
                  {p.status !== "approved" && (
                    <div className="mt-3 flex gap-2 border-t border-line pt-3">
                      {p.status === "pending" && (
                        <Link
                          href={`/posts/${p.id}/edit?back=/mine`}
                          className="flex-1 rounded-xl bg-surface-2 px-3 py-2.5 text-center text-sm font-semibold transition active:scale-95"
                        >
                          Edit
                        </Link>
                      )}
                      <DeleteButton id={p.id} label={p.status === "pending" ? "Withdraw" : "Delete"} />
                    </div>
                  )}
                </PostCard>
              </Removable>
            );
          })}
        </Stagger>
      )}
    </PullToRefresh>
  );
}
