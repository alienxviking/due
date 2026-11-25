import Image from "next/image";
import { BellIcon, CalendarIcon, CheckIcon } from "@/components/ios/icons";
import { GoogleButton } from "./google-button";

export const metadata = { title: "Welcome · Due" };

const FEATURES = [
  { Icon: CalendarIcon, color: "var(--red)", title: "Every Deadline in One Place", text: "Assignments, forms and registrations for your batch, soonest first." },
  { Icon: BellIcon, color: "var(--tint)", title: "Reminders That Arrive", text: "A notification when something's posted, then 24 hours and 2 hours before it's due." },
  { Icon: CheckIcon, color: "var(--green)", title: "Checked Before It's Shared", text: "An admin approves every post, so the list stays accurate and spam-free." },
];

/** Apple-style "Welcome" sheet. */
export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col bg-cell px-8 pt-[max(56px,env(safe-area-inset-top))] pb-[max(24px,env(safe-area-inset-bottom))] dark:bg-bg">
      <div className="flex flex-col items-center text-center">
        <Image src="/icons/due-192.png" alt="" width={84} height={84} className="rounded-[19px]" priority />
        <h1 className="mt-6 text-[34px] leading-[41px] font-bold">
          Welcome to
          <br />
          Due
        </h1>
      </div>

      <ul className="mt-10 flex flex-col gap-7">
        {FEATURES.map(({ Icon, color, title, text }) => (
          <li key={title} className="flex items-start gap-4">
            <span className="mt-0.5 flex w-11 shrink-0 justify-center" style={{ color }}>
              <Icon size={36} filled />
            </span>
            <div>
              <p className="text-[15px] font-semibold leading-5">{title}</p>
              <p className="text-[15px] leading-5 text-label-2">{text}</p>
            </div>
          </li>
        ))}
      </ul>

      <div className="mt-auto flex flex-col gap-3 pt-10">
        {error && <p className="text-center text-[13px] leading-[18px] text-red">{error}</p>}
        <p className="text-center text-[13px] leading-[18px] text-label-2">Sign in with your @sst.scaler.com college account.</p>
        <GoogleButton />
      </div>
    </main>
  );
}
