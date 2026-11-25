import { PostCardSkeleton } from "@/components/post-card";

// Shown instantly on every tab switch while the server fetches, so taps never feel dead.
export default function Loading() {
  return (
    <div aria-busy className="pt-2">
      <div className="mb-5 space-y-2">
        <div className="h-8 w-32 animate-pulse rounded-lg bg-surface-2" />
        <div className="h-4 w-48 animate-pulse rounded bg-surface-2" />
      </div>
      <div className="flex flex-col gap-3">
        <PostCardSkeleton />
        <PostCardSkeleton />
        <PostCardSkeleton />
      </div>
    </div>
  );
}
