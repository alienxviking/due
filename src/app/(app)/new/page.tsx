import { PostForm } from "@/components/post-form";
import { getMe } from "@/lib/me";
import { todayIST } from "@/lib/time";

export const metadata = { title: "New deadline · Due" };

export default async function NewPost() {
  const { isAdmin } = await getMe();
  return (
    <PostForm
      heading="New deadline"
      minDate={todayIST()}
      submitLabel={isAdmin ? "Post to everyone" : "Submit for approval"}
      hint={isAdmin ? "You're an admin, so this goes live right away." : "An admin checks it before everyone sees it."}
    />
  );
}
