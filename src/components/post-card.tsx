import Link from "next/link";
import type { Post } from "@/lib/types";
import { formatDeadline } from "@/lib/time";
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
  canEdit = false,
  children,
}: {
  post: Post;
  canEdit?: boolean;
  children?: React.ReactNode;
}) {
  return (
    <article className="rounded-2xl border border-line bg-surface p-4">
      <div className="flex items-start justify-between gap-3">
        <a href={post.url} target="_blank" rel="noopener noreferrer" className="group min-w-0 flex-1">
          <h2 className="font-semibold leading-snug group-active:text-accent">{post.title}</h2>
          <p className="mt-0.5 truncate text-sm text-muted">{host(post.url)} ↗</p>
        </a>
        {post.deadline && <Countdown deadline={post.deadline} />}
      </div>

      {post.note && <p className="mt-3 whitespace-pre-line text-sm text-text/85">{post.note}</p>}

      <div className="mt-3 flex items-center justify-between gap-3 text-xs text-muted">
        <span className={post.deadline ? "" : "font-medium text-warn"}>{formatDeadline(post.deadline)}</span>
        <span className="flex items-center gap-3">
          {post.author_name && <span className="truncate">by {post.author_name}</span>}
          {canEdit && (
            <Link href={`/posts/${post.id}/edit`} className="font-medium text-text underline-offset-2 hover:underline">
              Edit
            </Link>
          )}
        </span>
      </div>

      {children}
    </article>
  );
}
