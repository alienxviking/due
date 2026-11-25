import { notFound } from "next/navigation";
import { TrayIcon } from "@/components/ios/icons";
import { NavBar } from "@/components/ios/nav-bar";
import { Section } from "@/components/ios/list";
import { QueueRow } from "@/components/post-actions";
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
    <>
      <NavBar title="Queue" />
      <PullToRefresh>
        {posts.length === 0 ? (
          <div className="flex flex-col items-center px-8 pt-16 text-center">
            <TrayIcon size={48} className="text-label-3" />
            <p className="mt-3 text-[22px] font-bold">All Caught Up</p>
            <p className="mt-1 text-[15px] text-label-2">New submissions appear here, and you&apos;ll get a notification.</p>
          </div>
        ) : (
          <Section
            header={`Waiting for Approval · ${posts.length}`}
            footer="Swipe right to approve, or left to edit or reject. Approved posts notify everyone."
          >
            {posts.map((p) => (
              <QueueRow key={p.id} post={p} />
            ))}
          </Section>
        )}
      </PullToRefresh>
    </>
  );
}
