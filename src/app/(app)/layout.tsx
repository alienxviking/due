import { Suspense } from "react";
import { Flash } from "@/components/flash";
import { Nav } from "@/components/nav";
import { Toaster } from "@/components/toaster";
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
      <main className="mx-auto max-w-xl pb-[calc(49px+env(safe-area-inset-bottom)+24px)]">{children}</main>
      <Nav isAdmin={isAdmin} pending={isAdmin ? (count ?? 0) : 0} />
      <Toaster />
      <Suspense>
        <Flash />
      </Suspense>
    </>
  );
}
