import Link from "next/link";
import type { Post } from "@/lib/types";
import { subjectOf, subjectVars } from "@/lib/subject";
import { formatDeadline, timeLeft } from "@/lib/time";
import { Countdown } from "./countdown";

function host(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
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
  const s = subjectOf(post.title, post.note);
  const urgent = post.deadline && timeLeft(post.deadline).tone === "urgent";

  return (
    <article
      style={subjectVars(s)}
      className={`sub-glow relative overflow-hidden rounded-[26px] border bg-surface p-4 transition-transform duration-150 active:scale-[0.985] ${
        urgent ? "border-accent/40" : "border-line"
      }`}
    >
      {/* subject colour strip */}
      <span aria-hidden className="sub-solid absolute top-4 bottom-4 left-0 w-1 rounded-r-full opacity-80" />

      <div className="flex gap-3.5">
        <div className="sub-tile flex size-[54px] shrink-0 items-center justify-center rounded-[18px] text-[26px]">
          <span aria-hidden>{s.emoji}</span>
        </div>
        <div className="min-w-0 flex-1">
          <p className="sub-text flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider">
            {s.label}
            <span className="size-0.5 rounded-full bg-muted/60" />
            <span className="inline-flex min-w-0 items-center gap-0.5 font-medium normal-case tracking-normal text-muted">
              <span className="truncate">{host(post.url)}</span>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden className="shrink-0"><path d="M7 17L17 7M8 7h9v9" /></svg>
            </span>
          </p>
          <h2 className="font-display mt-0.5 text-[17px] font-semibold leading-snug">
            {/* Stretched link: the whole card opens the post's link. */}
            <a href={post.url} target="_blank" rel="noopener noreferrer" className="after:absolute after:inset-0 after:rounded-[26px]">
              {post.title}
            </a>
          </h2>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted">
            {post.deadline ? (
              <>
                <Countdown deadline={post.deadline} />
                <span>{formatDeadline(post.deadline)}</span>
              </>
            ) : (
              <span className="inline-flex h-6 items-center rounded-full bg-warn-soft px-2.5 font-semibold text-warn">Date TBA</span>
            )}
          </div>
        </div>
      </div>

      {post.note && <p className="mt-3 whitespace-pre-line rounded-2xl bg-surface-2/70 px-3.5 py-2.5 text-sm leading-relaxed text-text/85">{post.note}</p>}

      {(post.author_name || editHref) && (
        <div className="mt-3 flex items-center justify-between gap-3 text-xs text-muted">
          <span className="truncate">{post.author_name && `Posted by ${post.author_name}`}</span>
          {editHref && (
            <Link href={editHref} className="relative z-10 -my-1 rounded-lg px-2 py-1 font-semibold text-text hover:bg-surface-2">
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
    <div className="flex gap-3.5 rounded-[26px] border border-line bg-surface p-4">
      <div className="size-[54px] shrink-0 animate-pulse rounded-[18px] bg-surface-2" />
      <div className="flex-1 space-y-2 pt-1">
        <div className="h-3 w-1/4 animate-pulse rounded bg-surface-2" />
        <div className="h-4 w-3/4 animate-pulse rounded bg-surface-2" />
        <div className="h-5 w-28 animate-pulse rounded-full bg-surface-2" />
      </div>
    </div>
  );
}
