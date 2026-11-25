import { Backdrop } from "@/components/glass/backdrop";
import { TextGenerateEffect } from "@/components/ui/text-generate-effect";
import { GoogleButton } from "./google-button";

export const metadata = { title: "Sign in · Due" };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  return (
    <main className="relative mx-auto flex min-h-dvh max-w-3xl flex-col items-center justify-center px-6 py-16 text-center">
      <Backdrop />
      <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs tracking-wide text-neutral-400 backdrop-blur">
        <span className="size-1.5 rounded-full bg-tint shadow-[0_0_10px_2px_var(--tint)]" />
        For SST 24BCS
      </span>
      <h1 className="text-chrome text-7xl font-bold tracking-tight md:text-9xl">Due</h1>
      <TextGenerateEffect
        words="Every deadline in one place. Reminders before it's too late."
        duration={0.5}
        className="mt-4 max-w-md [&_div]:!mt-0 [&_div]:text-lg [&_div]:!leading-snug [&_div]:font-normal [&_span]:!text-neutral-400 md:[&_div]:text-xl"
      />
      <div className="mt-10 flex w-full max-w-xs flex-col items-center gap-3">
        {error && <p className="rounded-xl border border-red/25 bg-red/[0.07] px-4 py-2.5 text-sm text-red">{error}</p>}
        <GoogleButton />
        <p className="text-xs text-neutral-500">Sign in with your @sst.scaler.com account</p>
      </div>
    </main>
  );
}
