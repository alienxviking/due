"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRef, useState } from "react";
import { AnimatePresence, motion, useMotionValue, useSpring, useTransform, type MotionValue } from "motion/react";
import { CalendarIcon, GearIcon, PersonIcon, PlusIcon, TrayIcon } from "@/components/ios/icons";
import { tap } from "@/lib/haptics";

type Item = { href: string; title: string; Icon: typeof CalendarIcon; active: boolean; badge?: number; primary?: boolean };

function useItems(isAdmin: boolean, pending: number): Item[] {
  const p = usePathname();
  return [
    { href: "/", title: "Deadlines", Icon: CalendarIcon, active: p === "/" || p === "/past" },
    { href: "/mine", title: "My posts", Icon: PersonIcon, active: p === "/mine" },
    { href: "/new", title: "New deadline", Icon: PlusIcon, active: p === "/new", primary: true },
    ...(isAdmin ? [{ href: "/admin", title: "Queue", Icon: TrayIcon, active: p === "/admin", badge: pending }] : []),
    { href: "/settings", title: "Settings", Icon: GearIcon, active: p === "/settings" },
  ];
}

function Badge({ n }: { n?: number }) {
  if (!n) return null;
  return (
    <span className="absolute -top-1 -right-1 min-w-[18px] rounded-full bg-red px-1 text-center text-[10px] leading-[18px] font-bold text-black ring-2 ring-bg">{n}</span>
  );
}

/** Aceternity Floating Dock (desktop), using Next links so navigation stays instant. */
function DockIcon({ mouseX, item }: { mouseX: MotionValue<number>; item: Item }) {
  const ref = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState(false);
  const distance = useTransform(mouseX, (v) => {
    const b = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0 };
    return v - b.x - b.width / 2;
  });
  const spring = { mass: 0.1, stiffness: 150, damping: 12 };
  const size = useSpring(useTransform(distance, [-150, 0, 150], [44, 72, 44]), spring);
  const icon = useSpring(useTransform(distance, [-150, 0, 150], [20, 32, 20]), spring);
  const { Icon } = item;

  return (
    <Link href={item.href} aria-label={item.title}>
      <motion.div
        ref={ref}
        style={{ width: size, height: size }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className={`relative flex aspect-square items-center justify-center rounded-full transition-colors ${
          item.primary ? "bg-white text-black" : item.active ? "bg-white/15 text-white" : "bg-white/[0.06] text-neutral-400 hover:text-white"
        }`}
      >
        <AnimatePresence>
          {hovered && (
            <motion.div
              initial={{ opacity: 0, y: 10, x: "-50%" }}
              animate={{ opacity: 1, y: 0, x: "-50%" }}
              exit={{ opacity: 0, y: 2, x: "-50%" }}
              className="absolute -top-9 left-1/2 w-fit rounded-md border border-white/10 bg-neutral-900 px-2 py-0.5 text-xs whitespace-pre text-white"
            >
              {item.title}
            </motion.div>
          )}
        </AnimatePresence>
        <motion.div style={{ width: icon, height: icon }} className="flex items-center justify-center [&>svg]:size-full">
          <Icon filled={item.active && !item.primary} />
        </motion.div>
        <Badge n={item.badge} />
        {item.active && !item.primary && <span className="absolute -bottom-2 size-1 rounded-full bg-white" />}
      </motion.div>
    </Link>
  );
}

export function Nav({ isAdmin, pending }: { isAdmin: boolean; pending: number }) {
  const items = useItems(isAdmin, pending);
  const mouseX = useMotionValue(Infinity);

  return (
    <>
      {/* Desktop: floating dock with magnification */}
      <motion.nav
        onMouseMove={(e) => mouseX.set(e.pageX)}
        onMouseLeave={() => mouseX.set(Infinity)}
        className="fixed bottom-6 left-1/2 z-30 hidden h-[68px] -translate-x-1/2 items-end gap-3 rounded-2xl border border-white/10 bg-bar px-4 pb-3 shadow-[0_20px_50px_-20px_rgb(0_0_0/0.8)] backdrop-blur-xl md:flex"
      >
        {items.map((item) => (
          <DockIcon key={item.href} mouseX={mouseX} item={item} />
        ))}
      </motion.nav>

      {/* Phone: glass tab bar with a sliding highlight */}
      <nav className="fixed inset-x-0 bottom-0 z-30 px-3 pb-[max(10px,env(safe-area-inset-bottom))] md:hidden">
        <ul className="mx-auto flex max-w-md items-center rounded-[22px] border border-white/10 bg-bar p-1.5 shadow-[0_16px_40px_-16px_rgb(0_0_0/0.9)] backdrop-blur-xl">
          {items.map(({ href, title, Icon, active, badge, primary }) => (
            <li key={href} className="flex flex-1 justify-center">
              <Link
                href={href}
                aria-label={title}
                onClick={() => tap(6)}
                className={`relative flex h-12 items-center justify-center ${primary ? "w-12" : "w-full"}`}
              >
                {primary ? (
                  <span className="flex size-11 items-center justify-center rounded-full bg-white text-black shadow-[0_0_24px_-4px_rgb(255_255_255/0.5)] transition-transform active:scale-90">
                    <PlusIcon size={22} />
                  </span>
                ) : (
                  <>
                    {active && (
                      <motion.span layoutId="tab-pill" className="absolute inset-0 rounded-[16px] bg-white/10" transition={{ type: "spring", stiffness: 500, damping: 40 }} />
                    )}
                    <span className={`relative ${active ? "text-white" : "text-neutral-500"}`}>
                      <Icon size={22} filled={active} />
                      <Badge n={badge} />
                    </span>
                  </>
                )}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </>
  );
}
