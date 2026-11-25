import { notFound } from "next/navigation";
import { PageHeader } from "@/components/page-header";
import { PostForm } from "@/components/post-form";
import { getMe, getSession } from "@/lib/me";
import { addDaysIST, toISTParts } from "@/lib/time";
import type { Post } from "@/lib/types";

export const metadata = { title: "Edit post · Due" };

export default async function EditPost({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ back?: string }>;
}) {
  const [{ id }, { back }] = await Promise.all([params, searchParams]);
  const { supabase } = await getSession();
  const [{ profile, isAdmin }, { data: post }] = await Promise.all([
    getMe(),
    supabase.from("posts").select("*").eq("id", id).maybeSingle<Post>(),
  ]);
  if (!post) notFound();
  const canEdit = isAdmin || (post.author_id === profile.id && post.status === "pending");
  if (!canEdit) notFound();

  const parts = post.deadline ? toISTParts(post.deadline) : undefined;
  const minDate = "2000-01-01"; // editing may keep an earlier date
  const safeBack = back && back.startsWith("/") && !back.startsWith("//") ? back : "/";

  return (
    <>
      <PageHeader
        title="Edit post"
        subtitle={
          post.status === "approved" && !post.deadline
            ? "Setting the deadline will notify everyone."
            : post.status === "approved"
              ? "Changing the deadline will notify everyone."
              : undefined
        }
      />
      <PostForm
        minDate={minDate}
        quickDates={[["Today", addDaysIST(0)], ["Tomorrow", addDaysIST(1)], ["In 3 days", addDaysIST(3)], ["Next week", addDaysIST(7)]]}
        submitLabel="Save"
        back={safeBack}
        defaults={{ id: post.id, title: post.title, url: post.url, note: post.note, date: parts?.date, time: parts?.time, tba: !post.deadline }}
      />
    </>
  );
}
