import Image from "next/image";
import { GoogleButton } from "./google-button";

export const metadata = { title: "Sign in · Due" };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  return (
    <main className="mx-auto flex min-h-dvh max-w-sm flex-col justify-center gap-8 px-6">
      <div className="flex flex-col items-center gap-3 text-center">
        <Image src="/icons/icon-192.png" alt="" width={72} height={72} className="rounded-2xl" priority />
        <h1 className="text-4xl font-semibold tracking-tight">Due</h1>
        <p className="text-muted">Assignment and form deadlines for your batch, with reminders.</p>
      </div>
      {error && (
        <p role="alert" className="rounded-xl border border-accent/40 bg-accent/10 px-4 py-3 text-sm">
          {error}
        </p>
      )}
      <div className="flex flex-col gap-3">
        <GoogleButton />
        <p className="text-center text-xs text-muted">Use your @sst.scaler.com college account.</p>
      </div>
    </main>
  );
}
