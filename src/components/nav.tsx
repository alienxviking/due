"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarIcon, GearIcon, PersonIcon, TrayIcon } from "@/components/ios/icons";
import { tap } from "@/lib/haptics";

type Item = { href: string; label: string; Icon: typeof CalendarIcon; match: (p: string) => boolean; badge?: number };

/** UITabBar: translucent, hairline on top, tinted selected item, red badge. */
export function Nav({ isAdmin, pending }: { isAdmin: boolean; pending: number }) {
  const path = usePathname();
  const items: Item[] = [
    { href: "/", label: "Deadlines", Icon: CalendarIcon, match: (p) => p === "/" || p === "/past" },
    { href: "/mine", label: "My Posts", Icon: PersonIcon, match: (p) => p === "/mine" },
    ...(isAdmin ? [{ href: "/admin", label: "Queue", Icon: TrayIcon, match: (p: string) => p === "/admin", badge: pending }] : []),
    { href: "/settings", label: "Settings", Icon: GearIcon, match: (p) => p === "/settings" },
  ];

  return (
    <nav className="hairline-t fixed inset-x-0 bottom-0 z-30 bg-bar pb-[env(safe-area-inset-bottom)] backdrop-blur-xl backdrop-saturate-150">
      <ul className="mx-auto flex h-[49px] max-w-xl">
        {items.map(({ href, label, Icon, match, badge }) => {
          const on = match(path);
          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                onClick={() => tap(6)}
                className={`relative flex h-full flex-col items-center justify-center gap-[3px] pt-1 text-[10px] font-medium ${on ? "text-tint" : "text-gray"}`}
              >
                <span className="relative">
                  <Icon size={25} filled={on} />
                  {badge ? (
                    <span className="absolute -top-1 -right-2.5 min-w-[18px] rounded-full bg-red px-[5px] text-center text-[13px] leading-[18px] font-normal text-white">
                      {badge}
                    </span>
                  ) : null}
                </span>
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
