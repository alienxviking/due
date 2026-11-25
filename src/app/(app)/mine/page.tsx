import Link from "next/link";
import { NewPostButton } from "@/components/feed-tabs";
import { PersonIcon } from "@/components/ios/icons";
import { NavBar } from "@/components/ios/nav-bar";
import { Section } from "@/components/ios/list";
import { MineRow } from "@/components/post-actions";
import { PullToRefresh } from "@/components/pull-to-refresh";
import { getSession } from "@/lib/me";
import type { Post, PostStatus } from "@/lib/types";

export const metadata = { title: "My Posts · Due" };

const SECTIONS: { status: PostStatus; header: string; footer?: string }[] = [
  { status: "pending", header: "Waiting for Approval", footer: "Swipe left to edit or withdraw." },
  { status: "approved", header: "Live" },
  { status: "rejected", header: "Not Approved", footer: "Swipe left to delete." },
];

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
    <>
      <NavBar title="My Posts" right={<NewPostButton />} />
      <PullToRefresh>
        {posts.length === 0 ? (
          <div className="flex flex-col items-center px-8 pt-16 text-center">
            <PersonIcon size={48} className="text-label-3" />
            <p className="mt-3 text-[22px] font-bold">No Posts Yet</p>
            <p className="mt-1 text-[15px] text-label-2">Seen a deadline others might miss? Post it and an admin will check it.</p>
            <Link href="/new" className="mt-4 text-[17px] text-tint active:opacity-30">
              Post a Deadline
            </Link>
          </div>
        ) : (
          SECTIONS.map(({ status, header, footer }) => {
            const list = posts.filter((p) => p.status === status);
            if (list.length === 0) return null;
            return (
              <Section key={status} header={header} footer={footer}>
                {list.map((p) => (
                  <MineRow key={p.id} post={p} />
                ))}
              </Section>
            );
          })
        )}
      </PullToRefresh>
    </>
  );
}
