import { Nav } from "@/components/nav";
import { getMe } from "@/lib/me";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const { supabase, isAdmin } = await getMe();

  let pending = 0;
  if (isAdmin) {
    const { count } = await supabase
      .from("posts")
      .select("id", { count: "exact", head: true })
      .eq("status", "pending");
    pending = count ?? 0;
  }

  return (
    <>
      <div className="mx-auto max-w-md px-4 pt-4 pb-28">{children}</div>
      <Nav isAdmin={isAdmin} pending={pending} />
    </>
  );
}
