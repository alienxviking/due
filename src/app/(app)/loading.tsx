import { DeadlineCardSkeleton } from "@/components/deadline-card";

// Shown instantly on tab switches while the server fetches.
export default function Loading() {
  return (
    <div aria-busy className="pt-[max(28px,calc(env(safe-area-inset-top)+16px))] md:pt-14">
      <div className="mb-3 h-3 w-24 animate-pulse rounded bg-white/10" />
      <div className="mb-8 h-11 w-56 animate-pulse rounded-lg bg-white/10" />
      <div className="grid gap-3 sm:grid-cols-2 md:gap-4 lg:grid-cols-3">
        <DeadlineCardSkeleton />
        <DeadlineCardSkeleton />
        <DeadlineCardSkeleton />
      </div>
    </div>
  );
}
