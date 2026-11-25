import Link from "next/link";
import { NotificationBanner } from "@/components/notifications";
import { Empty, FeedTabs, PageHeader, SectionLabel } from "@/components/page-header";
import { PostCard } from "@/components/post-card";
import { getMe, getSession } from "@/lib/me";
import { GROUPS, groupOf, type Group } from "@/lib/time";
import type { Post } from "@/lib/types";

export default async function Home() {
  const { supabase, batch } = await getSession();
  const now = Date.now();

  const [{ profile, isAdmin }, { data }] = await Promise.all([
    getMe(),
    supabase
      .from("posts")
      .select("*")
      .eq("status", "approved")
      .eq("batch", batch)
      .or(`deadline.gte.${new Date(now).toISOString()},deadline.is.null`)
      .order("deadline", { ascending: true, nullsFirst: false })
      .returns<Post[]>(),
  ]);
  const posts = data ?? [];

  const groups = new Map<Group, Post[]>();
  for (const p of posts) {
    const g = groupOf(p.deadline, now);
    groups.set(g, [...(groups.get(g) ?? []), p]);
  }
  const thisWeek = (groups.get("Today")?.length ?? 0) + (groups.get("Tomorrow")?.length ?? 0) + (groups.get("This week")?.length ?? 0);
  const first = profile.name?.split(" ")[0] ?? "there";

  return (
    <>
      <PageHeader
        title={`Hi, ${first}`}
        subtitle={thisWeek === 0 ? "Nothing due this week" : `${thisWeek} due this week`}
      />
      <NotificationBanner />
      <FeedTabs active="upcoming" />
      {posts.length === 0 ? (
        <Empty icon="🎉" title="Nothing due">
          Enjoy it while it lasts.{" "}
          <Link href="/new" className="font-medium text-accent">
            Post a deadline
          </Link>
        </Empty>
      ) : (
        GROUPS.filter((g) => groups.has(g)).map((g) => (
          <section key={g} className="rise mt-7 first-of-type:mt-0">
            <SectionLabel count={groups.get(g)!.length}>{g}</SectionLabel>
            <div className="flex flex-col gap-2.5">
              {groups.get(g)!.map((p) => (
                <PostCard key={p.id} post={p} editHref={isAdmin ? `/posts/${p.id}/edit` : undefined} />
              ))}
            </div>
          </section>
        ))
      )}
    </>
  );
}
