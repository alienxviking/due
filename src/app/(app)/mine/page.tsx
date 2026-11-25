import Link from "next/link";
import { Empty, PageHeader } from "@/components/page-header";
import { DeleteButton } from "@/components/post-actions";
import { PostCard } from "@/components/post-card";
import { getMe } from "@/lib/me";
import type { Post } from "@/lib/types";

export const metadata = { title: "My posts · Due" };

const BADGE = {
  pending: "bg-warn/15 text-warn",
  approved: "bg-ok/15 text-ok",
  rejected: "bg-accent/15 text-accent",
} as const;
const LABEL = { pending: "Waiting for approval", approved: "Live", rejected: "Rejected" } as const;

export default async function Mine() {
  const { supabase, profile } = await getMe();
  const { data } = await supabase
    .from("posts")
    .select("*")
    .eq("author_id", profile.id)
    .order("created_at", { ascending: false })
    .limit(50)
    .returns<Post[]>();
  const posts = data ?? [];

  return (
    <>
      <PageHeader title="My posts" />
      {posts.length === 0 ? (
        <Empty>
          You haven&apos;t posted anything yet.
          <br />
          <Link href="/new" className="mt-2 inline-block font-medium text-text underline underline-offset-2">
            Post a deadline
          </Link>
        </Empty>
      ) : (
        <div className="flex flex-col gap-3">
          {posts.map((p) => (
            <div key={p.id} className="flex flex-col gap-1.5">
              <span className={`self-start rounded-full px-2.5 py-0.5 text-xs font-medium ${BADGE[p.status]}`}>{LABEL[p.status]}</span>
              <PostCard post={p}>
                {p.status === "rejected" && p.reject_reason && (
                  <p className="mt-3 rounded-lg bg-accent/10 px-3 py-2 text-sm">Reason: {p.reject_reason}</p>
                )}
                {p.status !== "approved" && (
                  <div className="mt-3 flex gap-2 border-t border-line pt-3">
                    {p.status === "pending" && (
                      <Link href={`/posts/${p.id}/edit?back=/mine`} className="rounded-lg border border-line px-3 py-2 text-sm font-medium">
                        Edit
                      </Link>
                    )}
                    <DeleteButton id={p.id} label={p.status === "pending" ? "Withdraw" : "Delete"} />
                  </div>
                )}
              </PostCard>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
