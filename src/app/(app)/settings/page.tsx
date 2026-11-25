import { NotificationSettings } from "@/components/notifications";
import { Stagger } from "@/components/motion/stagger";
import { PageHeader } from "@/components/page-header";
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
    <>
      <PageHeader title="Settings" />
      <Stagger className="flex flex-col gap-3">
      <section className="flex items-center gap-3.5 rounded-[22px] border border-line bg-surface p-4 shadow-card">
        <span className="font-display flex size-14 shrink-0 items-center justify-center rounded-[18px] bg-[linear-gradient(135deg,#ff7a45,#e8401c)] text-lg font-bold text-white shadow-[0_8px_20px_-8px_var(--accent)]">{initials}</span>
        <div className="min-w-0">
          <p className="font-display truncate text-lg font-semibold">{name}</p>
          <p className="truncate text-sm text-muted">{profile.email}</p>
          <p className="mt-1 flex gap-1.5 text-xs">
            <span className="rounded-full bg-surface-2 px-2 py-0.5 font-medium uppercase">{profile.batch}</span>
            {isAdmin && <span className="rounded-full bg-accent-soft px-2 py-0.5 font-semibold text-accent">Admin</span>}
          </p>
        </div>
      </section>

      <NotificationSettings />
      </Stagger>

      <form action="/auth/signout" method="post" className="mt-6">
        <button className="w-full rounded-2xl px-4 py-3.5 font-semibold text-accent transition active:bg-accent-soft">Sign out</button>
      </form>
    </>
  );
}
