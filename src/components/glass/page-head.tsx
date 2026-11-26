import Link from "next/link";
import { TextGenerateEffect } from "@/components/ui/text-generate-effect";
import { cn } from "@/lib/utils";

/** Big chrome-gradient title with an optional typed-in subtitle (Aceternity Text Generate). */
export function PageHead({ title, subtitle, generate, right, className }: { title: string; subtitle?: string; generate?: boolean; right?: React.ReactNode; className?: string }) {
  return (
    <header className={cn("flex items-end justify-between gap-4 pt-[max(64px,calc(env(safe-area-inset-top)+56px))] pb-6 md:pt-14 md:pb-8", className)}>
      <div className="min-w-0">
        <Link href="/" className="mb-3 inline-flex items-center gap-2 text-[13px] font-medium tracking-wide text-neutral-500">
          <span className="size-1.5 rounded-full bg-tint shadow-[0_0_10px_2px_var(--tint)]" />
          DUE · 24BCS
        </Link>
        <h1 className="text-chrome text-[40px] leading-[1.05] font-bold tracking-tight md:text-6xl">{title}</h1>
        {subtitle &&
          (generate ? (
            <TextGenerateEffect words={subtitle} duration={0.4} className="mt-2 [&_div]:!mt-0 [&_div]:text-base [&_div]:!leading-snug [&_div]:font-normal [&_span]:!text-neutral-400 md:[&_div]:text-lg" />
          ) : (
            <p className="mt-2 text-base text-neutral-400 md:text-lg">{subtitle}</p>
          ))}
      </div>
      {right}
    </header>
  );
}
