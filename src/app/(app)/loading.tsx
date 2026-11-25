import { PostRowSkeleton } from "@/components/post-row";

// Shown instantly on tab switches while the server fetches.
export default function Loading() {
  return (
    <div aria-busy className="pt-[calc(44px+env(safe-area-inset-top))]">
      <div className="mx-4 mt-1 mb-4 h-9 w-40 animate-pulse rounded-lg bg-fill" />
      <div className="ios-group mx-4 overflow-hidden rounded-[10px] bg-cell">
        <PostRowSkeleton />
        <PostRowSkeleton />
        <PostRowSkeleton />
      </div>
    </div>
  );
}
