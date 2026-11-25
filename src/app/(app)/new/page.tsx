import { PageHeader } from "@/components/page-header";
import { PostForm } from "@/components/post-form";
import { getMe } from "@/lib/me";
import { todayIST } from "@/lib/time";

export const metadata = { title: "New post · Due" };

export default async function NewPost() {
  const { isAdmin } = await getMe();
  return (
    <>
      <PageHeader
        title="New post"
        subtitle={isAdmin ? "You're an admin, so this goes live right away." : "An admin will check it before everyone sees it."}
      />
      <PostForm minDate={todayIST()} submitLabel={isAdmin ? "Post" : "Submit for approval"} />
    </>
  );
}
