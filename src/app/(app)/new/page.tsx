import { PostForm } from "@/components/post-form";
import { getMe } from "@/lib/me";
import { todayIST } from "@/lib/time";

export const metadata = { title: "New Deadline · Due" };

export default async function NewPost() {
  const { isAdmin } = await getMe();
  return (
    <PostForm
      heading="New Deadline"
      minDate={todayIST()}
      submitLabel={isAdmin ? "Post" : "Submit"}
      hint={isAdmin ? "You're an admin, so this goes live right away and notifies everyone." : "An admin checks posts before everyone sees them. You'll find it under My Posts."}
    />
  );
}
