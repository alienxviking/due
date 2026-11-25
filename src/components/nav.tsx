"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const icons = {
  home: "M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z",
  mine: "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm-7 9a7 7 0 0 1 14 0",
  queue: "M9 11l3 3 8-8M20 12v6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h9",
  settings:
    "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm7.4-3a7.4 7.4 0 0 0-.1-1.2l2-1.6-2-3.4-2.4 1a7.6 7.6 0 0 0-2-1.2L14.5 3h-4l-.4 2.6a7.6 7.6 0 0 0-2 1.2l-2.4-1-2 3.4 2 1.6a7.4 7.4 0 0 0 0 2.4l-2 1.6 2 3.4 2.4-1a7.6 7.6 0 0 0 2 1.2l.4 2.6h4l.4-2.6a7.6 7.6 0 0 0 2-1.2l2.4 1 2-3.4-2-1.6c.1-.4.1-.8.1-1.2z",
};

function Tab({ href, label, icon, active, badge }: { href: string; label: string; icon: string; active: boolean; badge?: number }) {
  return (
    <Link
      href={href}
      className={`relative flex flex-1 flex-col items-center gap-0.5 py-2 text-[11px] font-medium transition-colors ${active ? "text-text" : "text-muted"}`}
    >
      <span className={`flex h-7 w-12 items-center justify-center rounded-full transition-colors ${active ? "bg-surface-2" : ""}`}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.2 : 1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d={icon} />
        </svg>
      </span>
      {label}
      {badge ? (
        <span className="absolute top-0.5 left-1/2 ml-2.5 min-w-[18px] rounded-full bg-accent px-1 text-center text-[10px] font-bold leading-[18px] text-white">
          {badge}
        </span>
      ) : null}
    </Link>
  );
}

export function Nav({ isAdmin, pending }: { isAdmin: boolean; pending: number }) {
  const path = usePathname();
  return (
    <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-line bg-bg/85 pb-[env(safe-area-inset-bottom)] backdrop-blur-lg">
      <div className="mx-auto flex max-w-md items-center px-2">
        <Tab href="/" label="Home" icon={icons.home} active={path === "/" || path === "/past"} />
        <Tab href="/mine" label="Mine" icon={icons.mine} active={path === "/mine"} />
        <div className="flex flex-1 justify-center">
          <Link
            href="/new"
            aria-label="New post"
            className={`flex size-12 items-center justify-center rounded-2xl bg-accent text-white shadow-lg shadow-accent/25 transition active:scale-90 ${path === "/new" ? "ring-4 ring-accent/20" : ""}`}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden>
              <path d="M12 5v14M5 12h14" />
            </svg>
          </Link>
        </div>
        {isAdmin && <Tab href="/admin" label="Queue" icon={icons.queue} active={path === "/admin"} badge={pending} />}
        <Tab href="/settings" label="Settings" icon={icons.settings} active={path === "/settings"} />
      </div>
    </nav>
  );
}
