import { GlassCard } from "@/components/glass/glass-card";
import { PageHead } from "@/components/glass/page-head";
import { NotificationSettings } from "@/components/notifications";
import { getMe } from "@/lib/me";

export const metadata = { title: "Settings · Due" };

export default async function Settings() {
  const { profile, isAdmin } = await getMe();
  const name = profile.name ?? profile.email.split("@")[0];
  const initials = name
    .split(/\s+/)
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="mx-auto max-w-2xl">
      <PageHead title="Settings" />
      <div className="flex flex-col gap-4">
        <GlassCard>
          <div className="flex items-center gap-4 p-5 md:p-6">
            <span className="relative flex size-14 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-gradient-to-br from-neutral-700 to-neutral-900 text-lg font-bold text-white">
              {initials}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-lg font-semibold text-neutral-100">{name}</p>
              <p className="truncate text-sm text-neutral-500">{profile.email}</p>
            </div>
            <div className="hidden gap-2 sm:flex">
              <span className="rounded-full border border-white/10 px-2.5 py-0.5 text-xs text-neutral-400">{profile.batch.toUpperCase()}</span>
              {isAdmin && <span className="rounded-full border border-tint/30 bg-tint/10 px-2.5 py-0.5 text-xs text-tint">Admin</span>}
            </div>
          </div>
        </GlassCard>

        <NotificationSettings />

        <form action="/auth/signout" method="post">
          <button className="w-full rounded-full border border-red/20 bg-red/[0.05] py-3 text-[15px] font-medium text-red transition-colors hover:bg-red/10">Sign out</button>
        </form>
      </div>
    </div>
  );
}
