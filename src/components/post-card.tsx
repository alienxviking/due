import Link from "next/link";
import type { Post } from "@/lib/types";
import { formatTime, tileParts, timeLeft } from "@/lib/time";
import { Countdown } from "./countdown";

function host(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

const TILE = {
  urgent: "bg-accent text-white",
  soon: "bg-warn-soft text-warn",
  calm: "bg-surface-2 text-text",
  past: "bg-surface-2 text-muted",
} as const;

function DateTile({ deadline }: { deadline: string | null }) {
  if (!deadline) {
    return (
      <div className="flex size-[58px] shrink-0 flex-col items-center justify-center rounded-2xl border border-dashed border-line text-muted">
        <span className="text-xs font-semibold tracking-wide">TBA</span>
      </div>
    );
  }
  const { weekday, day, month } = tileParts(deadline);
  const tone = timeLeft(deadline).tone;
  return (
    <div className={`flex size-[58px] shrink-0 flex-col items-center justify-center rounded-2xl leading-none ${TILE[tone]}`}>
      <span className="text-[10px] font-semibold uppercase tracking-wider opacity-80">{weekday}</span>
      <span className="font-display mt-0.5 text-[22px] font-bold tabular-nums">{day}</span>
      <span className="text-[10px] font-medium uppercase opacity-70">{month}</span>
    </div>
  );
}

export function PostCard({
  post,
  editHref,
  children,
}: {
  post: Post;
  /** Shows an Edit button linking here (admins on the feed, authors on pending posts). */
  editHref?: string;
  children?: React.ReactNode;
}) {
  const urgent = post.deadline && timeLeft(post.deadline).tone === "urgent";
  return (
    <article
      className={`relative rounded-[22px] border bg-surface p-4 shadow-card transition-transform duration-150 active:scale-[0.985] ${
        urgent ? "border-accent/35 shadow-[0_8px_24px_-14px_var(--accent)]" : "border-line"
      }`}
    >
      <div className="flex gap-3.5">
        <DateTile deadline={post.deadline} />
        <div className="min-w-0 flex-1">
          <h2 className="font-display text-[17px] font-semibold leading-snug">
            {/* Stretched link: the whole card opens the post's link. */}
            <a href={post.url} target="_blank" rel="noopener noreferrer" className="after:absolute after:inset-0 after:rounded-[22px]">
              {post.title}
            </a>
          </h2>
          <p className="mt-0.5 truncate text-sm text-muted">
            {host(post.url)} <span aria-hidden>↗</span>
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted">
            {post.deadline ? (
              <>
                <Countdown deadline={post.deadline} />
                <span>{formatTime(post.deadline)}</span>
              </>
            ) : (
              <span className="font-medium text-warn">Deadline not announced</span>
            )}
          </div>
        </div>
      </div>

      {post.note && <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-text/80">{post.note}</p>}

      {(post.author_name || editHref) && (
        <div className="mt-3 flex items-center justify-between gap-3 text-xs text-muted">
          <span className="truncate">{post.author_name && `Posted by ${post.author_name}`}</span>
          {editHref && (
            <Link href={editHref} className="relative z-10 -my-1 rounded-lg px-2 py-1 font-medium text-text hover:bg-surface-2">
              Edit
            </Link>
          )}
        </div>
      )}

      {children && <div className="relative z-10">{children}</div>}
    </article>
  );
}

export function PostCardSkeleton() {
  return (
    <div className="flex gap-3.5 rounded-[22px] border border-line bg-surface p-4">
      <div className="size-[58px] shrink-0 animate-pulse rounded-2xl bg-surface-2" />
      <div className="flex-1 space-y-2 pt-1">
        <div className="h-4 w-3/4 animate-pulse rounded bg-surface-2" />
        <div className="h-3 w-1/3 animate-pulse rounded bg-surface-2" />
        <div className="h-5 w-24 animate-pulse rounded-full bg-surface-2" />
      </div>
    </div>
  );
}
