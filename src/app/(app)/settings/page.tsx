import { NotificationSettings } from "@/components/notifications";
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
      <section className="flex items-center gap-3.5 rounded-2xl border border-line bg-surface p-4 shadow-card">
        <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-accent text-base font-bold text-white">{initials}</span>
        <div className="min-w-0">
          <p className="truncate font-semibold">{name}</p>
          <p className="truncate text-sm text-muted">{profile.email}</p>
          <p className="mt-1 flex gap-1.5 text-xs">
            <span className="rounded-full bg-surface-2 px-2 py-0.5 font-medium uppercase">{profile.batch}</span>
            {isAdmin && <span className="rounded-full bg-accent-soft px-2 py-0.5 font-semibold text-accent">Admin</span>}
          </p>
        </div>
      </section>

      <div className="mt-3">
        <NotificationSettings />
      </div>

      <form action="/auth/signout" method="post" className="mt-6">
        <button className="w-full rounded-xl px-4 py-3 font-semibold text-accent transition active:bg-accent-soft">Sign out</button>
      </form>
    </>
  );
}
