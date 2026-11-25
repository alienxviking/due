import { PageHeader } from "@/components/page-header";
import { PostForm } from "@/components/post-form";
import { getMe } from "@/lib/me";
import { addDaysIST, todayIST } from "@/lib/time";

export const metadata = { title: "New post · Due" };

export default async function NewPost() {
  const { isAdmin } = await getMe();
  return (
    <>
      <PageHeader
        title="New post"
        subtitle={isAdmin ? "You're an admin, so this goes live right away." : "An admin checks it before everyone sees it."}
      />
      <PostForm minDate={todayIST()} quickDates={[["Today", addDaysIST(0)], ["Tomorrow", addDaysIST(1)], ["In 3 days", addDaysIST(3)], ["Next week", addDaysIST(7)]]} submitLabel={isAdmin ? "Post to everyone" : "Submit for approval"} />
    </>
  );
}
