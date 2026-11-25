"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { tap } from "@/lib/haptics";

type IconProps = { active: boolean };
const stroke = (active: boolean) => (active ? 2.2 : 1.8);

// Small hand-animated icons: each does a little move when its tab becomes active.
function HomeIcon({ active }: IconProps) {
  return (
    <motion.svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={stroke(active)} strokeLinecap="round" strokeLinejoin="round"
      animate={active ? { y: [0, -3, 0] } : { y: 0 }} transition={{ duration: 0.35 }}>
      <path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z" />
    </motion.svg>
  );
}
function MineIcon({ active }: IconProps) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={stroke(active)} strokeLinecap="round" strokeLinejoin="round">
      <motion.circle cx="12" cy="8" r="4" animate={active ? { scale: [1, 1.15, 1] } : { scale: 1 }} transition={{ duration: 0.35 }} style={{ originX: "12px", originY: "8px" }} />
      <path d="M5 21a7 7 0 0 1 14 0" />
    </svg>
  );
}
function QueueIcon({ active }: IconProps) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={stroke(active)} strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 12v6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h9" />
      <motion.path d="M9 11l3 3 8-8" initial={false} animate={{ pathLength: active ? [0, 1] : 1 }} transition={{ duration: 0.4 }} />
    </svg>
  );
}
function SettingsIcon({ active }: IconProps) {
  return (
    <motion.svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={stroke(active)} strokeLinecap="round" strokeLinejoin="round"
      animate={{ rotate: active ? 90 : 0 }} transition={{ type: "spring", stiffness: 200, damping: 15 }}>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 12a7.4 7.4 0 0 0-.1-1.2l2-1.6-2-3.4-2.4 1a7.6 7.6 0 0 0-2-1.2L14.5 3h-4l-.4 2.6a7.6 7.6 0 0 0-2 1.2l-2.4-1-2 3.4 2 1.6a7.4 7.4 0 0 0 0 2.4l-2 1.6 2 3.4 2.4-1a7.6 7.6 0 0 0 2 1.2l.4 2.6h4l.4-2.6a7.6 7.6 0 0 0 2-1.2l2.4 1 2-3.4-2-1.6c.1-.4.1-.8.1-1.2z" />
    </motion.svg>
  );
}

function Tab({ href, label, Icon, active, badge }: { href: string; label: string; Icon: (p: IconProps) => React.ReactNode; active: boolean; badge?: number }) {
  return (
    <Link href={href} onClick={() => tap()} aria-label={label} className={`relative flex h-14 flex-1 flex-col items-center justify-center gap-0.5 text-[10px] font-semibold transition-colors ${active ? "text-text" : "text-muted"}`}>
      {active && (
        <motion.span layoutId="nav-pill" className="absolute inset-x-1 inset-y-1 rounded-[18px] bg-surface-2" transition={{ type: "spring", stiffness: 500, damping: 40 }} />
      )}
      <span className="relative">
        <Icon active={active} />
        <AnimatePresence>
          {badge ? (
            <motion.span
              key={badge}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              transition={{ type: "spring", stiffness: 600, damping: 20 }}
              className="absolute -top-1.5 -right-2.5 min-w-[18px] rounded-full bg-accent px-1 text-center text-[10px] font-bold leading-[18px] text-white ring-2 ring-surface"
            >
              {badge}
            </motion.span>
          ) : null}
        </AnimatePresence>
      </span>
      <span className="relative">{label}</span>
    </Link>
  );
}

/** Floating dock with a sliding active pill and a raised Post button. */
export function Nav({ isAdmin, pending }: { isAdmin: boolean; pending: number }) {
  const path = usePathname();
  return (
    <nav className="pointer-events-none fixed inset-x-0 bottom-0 z-30 px-3 pb-[max(12px,env(safe-area-inset-bottom))]">
      <div className="pointer-events-auto mx-auto flex max-w-md items-center gap-1 rounded-[24px] border border-line/80 bg-surface/80 p-1 shadow-[0_12px_40px_-12px_rgb(0_0_0/0.25)] backdrop-blur-xl">
        <Tab href="/" label="Home" Icon={HomeIcon} active={path === "/" || path === "/past"} />
        <Tab href="/mine" label="Mine" Icon={MineIcon} active={path === "/mine"} />
        <div className="flex flex-1 justify-center">
          <motion.div whileTap={{ scale: 0.88, rotate: 90 }} transition={{ type: "spring", stiffness: 500, damping: 18 }}>
            <Link
              href="/new"
              onClick={() => tap(12)}
              aria-label="New post"
              className="flex size-12 items-center justify-center rounded-[18px] bg-accent text-white shadow-[0_8px_20px_-6px_var(--accent)]"
            >
              <motion.svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" animate={{ rotate: path === "/new" ? 45 : 0 }} transition={{ type: "spring", stiffness: 300, damping: 18 }}>
                <path d="M12 5v14M5 12h14" />
              </motion.svg>
            </Link>
          </motion.div>
        </div>
        {isAdmin && <Tab href="/admin" label="Queue" Icon={QueueIcon} active={path === "/admin"} badge={pending} />}
        <Tab href="/settings" label="Settings" Icon={SettingsIcon} active={path === "/settings"} />
      </div>
    </nav>
  );
}
