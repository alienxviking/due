import { notFound } from "next/navigation";
import { PostForm } from "@/components/post-form";
import { getMe, getSession } from "@/lib/me";
import { toISTParts } from "@/lib/time";
import type { Post } from "@/lib/types";

export const metadata = { title: "Edit · Due" };

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
  const safeBack = back && back.startsWith("/") && !back.startsWith("//") ? back : "/";

  return (
    <PostForm
      heading="Edit"
      minDate="2000-01-01" // editing may keep an earlier date
      submitLabel="Save"
      back={safeBack}
      hint={post.status === "approved" ? (post.deadline ? "Changing the date notifies everyone." : "Adding a date notifies everyone.") : undefined}
      defaults={{ id: post.id, title: post.title, url: post.url, note: post.note, date: parts?.date, time: parts?.time, tba: !post.deadline }}
    />
  );
}
