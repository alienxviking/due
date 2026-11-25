"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const icons = {
  home: "M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z",
  new: "M12 5v14M5 12h14",
  mine: "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm-7 9a7 7 0 0 1 14 0",
  queue: "M4 6h16M4 12h16M4 18h10",
  settings:
    "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm7.4-3a7.4 7.4 0 0 0-.1-1.2l2-1.6-2-3.4-2.4 1a7.6 7.6 0 0 0-2-1.2L14.5 3h-4l-.4 2.6a7.6 7.6 0 0 0-2 1.2l-2.4-1-2 3.4 2 1.6a7.4 7.4 0 0 0 0 2.4l-2 1.6 2 3.4 2.4-1a7.6 7.6 0 0 0 2 1.2l.4 2.6h4l.4-2.6a7.6 7.6 0 0 0 2-1.2l2.4 1 2-3.4-2-1.6c.1-.4.1-.8.1-1.2z",
};

export function Nav({ isAdmin, pending }: { isAdmin: boolean; pending: number }) {
  const path = usePathname();
  const items = [
    { href: "/", label: "Home", icon: icons.home, active: path === "/" || path === "/past" },
    { href: "/new", label: "Post", icon: icons.new, active: path === "/new" },
    { href: "/mine", label: "Mine", icon: icons.mine, active: path === "/mine" },
    ...(isAdmin ? [{ href: "/admin", label: "Queue", icon: icons.queue, active: path === "/admin", badge: pending }] : []),
    { href: "/settings", label: "Settings", icon: icons.settings, active: path === "/settings" },
  ];

  return (
    <nav className="fixed inset-x-0 bottom-0 z-10 border-t border-line bg-bg/90 pb-[env(safe-area-inset-bottom)] backdrop-blur">
      <ul className="mx-auto flex max-w-md">
        {items.map((it) => (
          <li key={it.href} className="flex-1">
            <Link
              href={it.href}
              className={`relative flex flex-col items-center gap-1 py-2.5 text-[11px] ${it.active ? "text-text" : "text-muted"}`}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d={it.icon} />
              </svg>
              {it.label}
              {"badge" in it && it.badge ? (
                <span className="absolute top-1.5 left-1/2 ml-2 min-w-4 rounded-full bg-accent px-1 text-center text-[10px] font-semibold leading-4 text-bg">
                  {it.badge}
                </span>
              ) : null}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
