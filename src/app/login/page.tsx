import Image from "next/image";
import { Rise, Stagger } from "@/components/motion/stagger";
import { GoogleButton } from "./google-button";

export const metadata = { title: "Sign in · Due" };

const points = [
  ["📌", "Every assignment and form deadline in one place"],
  ["⏰", "Reminders 24 hours and 2 hours before"],
  ["✅", "Checked by an admin, so no spam"],
];

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  return (
    <main className="mx-auto flex min-h-dvh max-w-sm flex-col justify-between px-6 py-10">
      <div />
      <div className="flex flex-col gap-8">
        <Rise className="flex flex-col items-start gap-4">
          <Image src="/icons/icon-192.png" alt="" width={64} height={64} className="rounded-2xl shadow-lg" priority />
          <div>
            <h1 className="text-5xl font-bold">Due</h1>
            <p className="mt-1 text-lg text-muted">Never miss a deadline again.</p>
          </div>
        </Rise>
        <Stagger className="flex flex-col gap-3" delay={0.15}>
          {points.map(([icon, text]) => (
            <div key={text} className="flex items-center gap-3 text-[15px]">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-surface-2">{icon}</span>
              {text}
            </div>
          ))}
        </Stagger>
      </div>
      <div className="flex flex-col gap-3 pt-10">
        {error && (
          <p role="alert" className="rounded-xl bg-accent-soft px-4 py-3 text-sm font-medium text-accent">
            {error}
          </p>
        )}
        <GoogleButton />
        <p className="text-center text-xs text-muted">Use your @sst.scaler.com college account.</p>
      </div>
    </main>
  );
}
