import type { Post } from "@/lib/types";
import { subjectOf } from "@/lib/subject";
import { formatDeadline } from "@/lib/time";
import { Countdown } from "./countdown";
import { ChevronRight } from "./ios/icons";

function host(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

/**
 * One deadline as a grouped-list cell (Reminders style). Tapping opens the link.
 * `extra` renders under the text (reject reason, admin buttons).
 */
export function PostRow({ post, showAuthor = true, extra, muted }: { post: Post; showAuthor?: boolean; extra?: React.ReactNode; muted?: boolean }) {
  const s = subjectOf(post.title, post.note);
  const meta = [host(post.url), showAuthor && post.author_name].filter(Boolean).join(" · ");

  return (
    <div className="flex gap-3 pl-4 transition-colors has-[a:active]:bg-cell-2">
      <span aria-hidden className="mt-[17px] size-[9px] shrink-0 rounded-full" style={{ background: muted ? "var(--label-3)" : s.color }} />
      <div className="row-sep flex min-w-0 flex-1 gap-2 py-[11px] pr-4">
        <div className="min-w-0 flex-1">
        <a href={post.url} target="_blank" rel="noopener noreferrer" className="block">
          <p className={`text-[17px] leading-[22px] ${muted ? "text-label-2" : ""}`}>{post.title}</p>
          <p className={`mt-0.5 text-[15px] leading-5 ${post.deadline ? "text-label-2" : "text-orange"}`}>
            {post.deadline ? formatDeadline(post.deadline) : "Date not announced"}
          </p>
          {post.note && <p className="mt-0.5 line-clamp-2 text-[15px] leading-5 text-label-2">{post.note}</p>}
          <p className="mt-0.5 truncate text-[13px] leading-[18px] text-label-3">{meta}</p>
        </a>
          {extra}
        </div>
        <span className="flex shrink-0 items-start gap-2 pt-px text-[15px]">
          {post.deadline && !muted && <Countdown deadline={post.deadline} />}
          <ChevronRight className="mt-1 text-label-3" />
        </span>
      </div>
    </div>
  );
}

export function PostRowSkeleton() {
  return (
    <div className="flex gap-3 pl-4">
      <span className="mt-[17px] size-[9px] shrink-0 rounded-full bg-fill" />
      <div className="row-sep flex-1 space-y-2 py-3 pr-4">
        <div className="h-4 w-2/3 animate-pulse rounded bg-fill" />
        <div className="h-3.5 w-1/3 animate-pulse rounded bg-fill" />
      </div>
    </div>
  );
}
