import Link from "next/link";
import { Empty, PageHeader } from "@/components/page-header";
import { DeleteButton, Removable } from "@/components/post-actions";
import { PostCard } from "@/components/post-card";
import { getSession } from "@/lib/me";
import type { Post } from "@/lib/types";

export const metadata = { title: "My posts · Due" };

const BADGE = {
  pending: "bg-warn-soft text-warn",
  approved: "bg-ok-soft text-ok",
  rejected: "bg-accent-soft text-accent",
} as const;
const LABEL = { pending: "Waiting for approval", approved: "Live", rejected: "Not approved" } as const;

export default async function Mine({ searchParams }: { searchParams: Promise<{ sent?: string }> }) {
  const [{ supabase, userId }, { sent }] = await Promise.all([getSession(), searchParams]);
  const { data } = await supabase
    .from("posts")
    .select("*")
    .eq("author_id", userId)
    .order("created_at", { ascending: false })
    .limit(50)
    .returns<Post[]>();
  const posts = data ?? [];

  return (
    <>
      <PageHeader title="My posts" subtitle="What you've submitted and where it stands" />
      {sent && (
        <p className="rise mb-4 rounded-2xl bg-ok-soft px-4 py-3 text-sm font-medium text-ok">
          Sent for approval. You&apos;ll be notified if it isn&apos;t approved.
        </p>
      )}
      {posts.length === 0 ? (
        <Empty icon="✎" title="Nothing posted yet">
          <Link href="/new" className="font-medium text-accent">
            Post a deadline
          </Link>
        </Empty>
      ) : (
        <div className="flex flex-col gap-4">
          {posts.map((p) => (
            <Removable key={p.id}>
              <span className={`mb-1.5 inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${BADGE[p.status]}`}>{LABEL[p.status]}</span>
              <PostCard post={{ ...p, author_name: null }}>
                {p.status === "rejected" && p.reject_reason && (
                  <p className="mt-3 rounded-xl bg-accent-soft px-3 py-2 text-sm text-text">
                    <span className="font-semibold">Reason:</span> {p.reject_reason}
                  </p>
                )}
                {p.status !== "approved" && (
                  <div className="mt-3 flex gap-2 border-t border-line pt-3">
                    {p.status === "pending" && (
                      <Link href={`/posts/${p.id}/edit?back=/mine`} className="flex-1 rounded-xl bg-surface-2 px-3 py-2.5 text-center text-sm font-semibold transition active:scale-[0.97]">
                        Edit
                      </Link>
                    )}
                    <DeleteButton id={p.id} label={p.status === "pending" ? "Withdraw" : "Delete"} />
                  </div>
                )}
              </PostCard>
            </Removable>
          ))}
        </div>
      )}
    </>
  );
}
