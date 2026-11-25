"use client";

import { useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { success } from "@/lib/haptics";

const MESSAGES: Record<string, { text: string; confetti?: boolean }> = {
  sent: { text: "Sent for approval", confetti: true },
  posted: { text: "Posted. Everyone's been notified.", confetti: true },
  saved: { text: "Changes saved" },
};

export async function burst() {
  const { default: confetti } = await import("canvas-confetti");
  const colors = ["#ff6b3d", "#fbbf24", "#4ade80", "#ffffff"];
  confetti({ particleCount: 70, spread: 75, startVelocity: 38, origin: { y: 0.75 }, colors, disableForReducedMotion: true, scalar: 0.9 });
}

/** Shows a toast (and confetti for new posts) after a redirect with ?flash=…, then cleans the URL. */
export function Flash() {
  const params = useSearchParams();
  const router = useRouter();
  const path = usePathname();
  const flash = params.get("flash");

  useEffect(() => {
    if (!flash || !MESSAGES[flash]) return;
    const m = MESSAGES[flash];
    toast.success(m.text);
    if (m.confetti) {
      burst();
      success();
    }
    router.replace(path, { scroll: false });
  }, [flash, path, router]);

  return null;
}
