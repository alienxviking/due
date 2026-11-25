import { Nav } from "@/components/nav";
import { getMe, getSession } from "@/lib/me";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const { supabase } = await getSession();
  // Both in parallel. Only admins can see others' pending posts, so the count only matters for them.
  const [{ isAdmin }, { count }] = await Promise.all([
    getMe(),
    supabase.from("posts").select("id", { count: "exact", head: true }).eq("status", "pending"),
  ]);

  return (
    <>
      <main className="mx-auto max-w-md px-4 pt-4 pb-32">{children}</main>
      <Nav isAdmin={isAdmin} pending={isAdmin ? (count ?? 0) : 0} />
    </>
  );
}
