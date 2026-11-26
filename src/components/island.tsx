"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { DynamicIsland, DynamicIslandView } from "@/components/motion/dynamic-island";
import { tap } from "@/lib/haptics";
import { timeLeft } from "@/lib/time";

export type IslandNext = { title: string; url: string; deadline: string; when: string; label: string; color: string };

type Ctx = { setNext: (n: IslandNext | null) => void; flash: (msg: string) => void };
const IslandCtx = createContext<Ctx | null>(null);

/** The home page hands its soonest deadline to the island while it's on screen. */
export function useIslandNext(next: IslandNext | null) {
  const ctx = useContext(IslandCtx);
  const key = next ? `${next.title}|${next.deadline}` : "";
  useEffect(() => {
    if (!ctx) return;
    ctx.setNext(next);
    return () => ctx.setNext(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- keyed on the deadline's identity
  }, [ctx, key]);
}

export function useIslandFlash() {
  return useContext(IslandCtx)?.flash;
}

/** Spectrum UI Dynamic Island, pinned to the top centre of every screen. */
export function IslandProvider({ children }: { children: React.ReactNode }) {
  const [next, setNext] = useState<IslandNext | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [now, setNow] = useState(() => Date.now());
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const shell = useRef<HTMLDivElement>(null);

  const flash = useCallback((msg: string) => {
    setMessage(msg);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setMessage(null), 2600);
  }, []);

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(t);
  }, []);

  // Tap anywhere else to fold it back into the pill.
  useEffect(() => {
    if (!open) return;
    const close = (e: PointerEvent) => !shell.current?.contains(e.target as Node) && setOpen(false);
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, [open]);

  const view = message ? "flash" : open && next ? "next" : null;
  const visible = !!message || !!next;
  const left = next ? timeLeft(next.deadline, now) : null;
  const hot = left?.tone === "urgent";

  return (
    <IslandCtx.Provider value={{ setNext, flash }}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 top-[max(10px,env(safe-area-inset-top))] z-50 flex justify-center md:top-4">
        <AnimatePresence>
          {visible && (
            <motion.div
              ref={shell}
              initial={{ opacity: 0, y: -12, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -12, scale: 0.9 }}
              className="pointer-events-auto"
            >
              <DynamicIsland
                view={view}
                className="bg-black text-white shadow-[0_10px_40px_-10px_rgb(0_0_0/0.9)] ring-1 ring-white/10"
                compact={
                  next ? (
                    <button type="button" onClick={() => (tap(6), setOpen(true))} className="flex items-center gap-2" aria-label={`Next up: ${next.title}, ${left?.label}`}>
                      <span className="relative flex size-2">
                        {hot && <span className="absolute inline-flex size-full animate-ping rounded-full bg-red opacity-70" />}
                        <span className="relative inline-flex size-2 rounded-full" style={{ background: hot ? "var(--red)" : next.color }} />
                      </span>
                      <span className="max-w-[9rem] truncate text-neutral-300">{next.title}</span>
                      <span className={`whitespace-nowrap tabular-nums ${hot ? "text-red" : "text-white"}`}>{left?.label.replace(" left", "")}</span>
                    </button>
                  ) : (
                    <span className="text-neutral-400">Due</span>
                  )
                }
              >
                <DynamicIslandView id="flash" className="gap-3 py-3">
                  <span className="grid size-7 place-items-center rounded-full bg-green/20 text-green">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                      <path d="M5 12.5 10 17l9-10" />
                    </svg>
                  </span>
                  <span className="text-sm font-medium whitespace-nowrap">{message}</span>
                </DynamicIslandView>
                {next && (
                  <DynamicIslandView id="next" className="block w-[min(20rem,calc(100vw-2rem))] p-5 text-left">
                    <span className="flex items-center justify-between text-[11px] font-semibold tracking-[0.18em] text-neutral-500 uppercase">
                      <span className="inline-flex items-center gap-2">
                        <span className="size-1.5 rounded-full" style={{ background: next.color }} />
                        Next up · {next.label}
                      </span>
                      <span className={hot ? "text-red" : "text-neutral-300"}>{left?.label}</span>
                    </span>
                    <span className="mt-3 block text-lg leading-snug font-semibold">{next.title}</span>
                    <span className="mt-1 block text-sm text-neutral-400">{next.when}</span>
                    <span className="mt-4 flex gap-2">
                      <a
                        href={next.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex min-h-10 flex-1 items-center justify-center rounded-full bg-white text-sm font-semibold text-black active:scale-95"
                      >
                        Open link
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden className="ml-1.5">
                          <path d="M7 17 17 7M8 7h9v9" />
                        </svg>
                      </a>
                      <button
                        type="button"
                        onClick={() => setOpen(false)}
                        className="inline-flex min-h-10 items-center rounded-full border border-white/15 px-4 text-sm font-medium text-neutral-300"
                      >
                        Close
                      </button>
                    </span>
                  </DynamicIslandView>
                )}
              </DynamicIsland>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </IslandCtx.Provider>
  );
}
