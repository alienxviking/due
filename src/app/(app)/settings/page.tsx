import { NavBar } from "@/components/ios/nav-bar";
import { Row, Section } from "@/components/ios/list";
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
    <>
      <NavBar title="Settings" />

      <Section>
        <div className="flex items-center gap-4 px-4 py-3">
          {/* Contacts-style monogram */}
          <span className="flex size-[60px] shrink-0 items-center justify-center rounded-full bg-[linear-gradient(180deg,#a5abb8,#858994)] text-[24px] font-medium text-white">
            {initials}
          </span>
          <div className="min-w-0">
            <p className="truncate text-[22px] leading-7">{name}</p>
            <p className="truncate text-[15px] text-label-2">{profile.email}</p>
          </div>
        </div>
      </Section>

      <NotificationSettings />

      <Section header="Account">
        <Row title="Batch" value={profile.batch.toUpperCase()} />
        <Row title="Role" value={isAdmin ? "Admin" : "Member"} />
      </Section>

      <form action="/auth/signout" method="post">
        <Section>
          <button className="block w-full py-[11px] text-center text-[17px] text-red active:bg-cell-2">Sign Out</button>
        </Section>
      </form>

      <p className="pb-4 text-center text-[13px] text-label-3">Due</p>
    </>
  );
}
