import Link from "next/link";
import { GlassCard } from "@/components/glass/glass-card";
import type { Post } from "@/lib/types";
import { subjectOf } from "@/lib/subject";
import { formatDeadline } from "@/lib/time";
import { Countdown } from "./countdown";

function host(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

/** One deadline as a glass card. The whole card opens the link; `footer` holds actions. */
export function DeadlineCard({ post, editHref, footer, muted, showAuthor = true }: { post: Post; editHref?: string; footer?: React.ReactNode; muted?: boolean; showAuthor?: boolean }) {
  const s = subjectOf(post.title, post.note);
  return (
    <GlassCard className={muted ? "opacity-60" : ""} glow={!muted}>
      <div className="relative flex h-full flex-col p-5">
        <div className="flex items-center justify-between gap-3">
          <span className="inline-flex items-center gap-2 text-xs font-medium tracking-wide text-neutral-400 uppercase">
            <span className="size-2 rounded-full" style={{ background: s.color, boxShadow: `0 0 10px 1px ${s.color}` }} />
            {s.label}
          </span>
          {post.deadline && !muted ? (
            <Countdown deadline={post.deadline} />
          ) : !post.deadline ? (
            <span className="inline-flex h-6 items-center rounded-full border border-yellow/30 bg-yellow/10 px-2.5 text-xs font-medium text-yellow">Date TBA</span>
          ) : null}
        </div>

        <h2 className="mt-3 text-lg leading-snug font-semibold text-neutral-100">
          {/* Stretched link: the whole card opens the deadline's link. */}
          <a href={post.url} target="_blank" rel="noopener noreferrer" className="after:absolute after:inset-0 after:rounded-[17px] focus:outline-none">
            {post.title}
          </a>
        </h2>
        <p className="mt-1 text-sm text-neutral-400">{post.deadline ? formatDeadline(post.deadline) : "Date not announced yet"}</p>
        {post.note && <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-neutral-400">{post.note}</p>}

        <div className="mt-auto flex items-center justify-between gap-3 pt-4 text-xs text-neutral-500">
          <span className="inline-flex min-w-0 items-center gap-1">
            <span className="truncate">{host(post.url)}</span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden className="shrink-0">
              <path d="M7 17 17 7M8 7h9v9" />
            </svg>
            {showAuthor && post.author_name && <span className="truncate">· {post.author_name}</span>}
          </span>
          {editHref && (
            <Link href={editHref} className="relative z-10 -my-1 rounded-full border border-white/10 px-3 py-1 font-medium text-neutral-300 transition-colors hover:bg-white/10">
              Edit
            </Link>
          )}
        </div>
        {footer && <div className="relative z-10 mt-4">{footer}</div>}
      </div>
    </GlassCard>
  );
}

export function DeadlineCardSkeleton() {
  return (
    <div className="rounded-[22px] border border-sep p-1.5">
      <div className="space-y-3 rounded-[17px] border border-white/[0.06] bg-white/[0.02] p-5">
        <div className="h-3 w-20 animate-pulse rounded bg-white/10" />
        <div className="h-5 w-3/4 animate-pulse rounded bg-white/10" />
        <div className="h-3.5 w-1/3 animate-pulse rounded bg-white/10" />
      </div>
    </div>
  );
}
