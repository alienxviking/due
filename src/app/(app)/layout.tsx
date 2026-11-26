import { Suspense } from "react";
import { Flash } from "@/components/flash";
import { IslandProvider } from "@/components/island";
import { Backdrop } from "@/components/glass/backdrop";
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
    <IslandProvider>
      <Backdrop />
      <main className="mx-auto max-w-6xl px-4 pb-[calc(96px+env(safe-area-inset-bottom))] md:px-8 md:pb-36">{children}</main>
      <Nav isAdmin={isAdmin} pending={isAdmin ? (count ?? 0) : 0} />
      <Toaster />
      <Suspense>
        <Flash />
      </Suspense>
    </IslandProvider>
  );
}
