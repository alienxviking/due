import { PageHeader } from "@/components/page-header";
import { getMe } from "@/lib/me";

export const metadata = { title: "Settings · Due" };

export default async function Settings() {
  const { profile, isAdmin } = await getMe();
  return (
    <>
      <PageHeader title="Settings" />
      <section className="rounded-2xl border border-line bg-surface p-4">
        <p className="font-medium">{profile.name ?? profile.email}</p>
        <p className="text-sm text-muted">{profile.email}</p>
        <p className="mt-2 text-xs text-muted">
          Batch {profile.batch}
          {isAdmin && " · Admin"}
        </p>
      </section>

      <form action="/auth/signout" method="post" className="mt-6">
        <button className="w-full rounded-xl border border-line px-4 py-3 font-medium text-muted">Sign out</button>
      </form>
    </>
  );
}
