"use client";

import { useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { useIslandFlash } from "@/components/island";
import { success } from "@/lib/haptics";

const MESSAGES: Record<string, string> = {
  sent: "Sent for approval",
  posted: "Posted. Everyone's been notified.",
  saved: "Changes saved",
};

/** After a redirect with ?flash=…, the Dynamic Island expands with the message (toast as a fallback), then the URL is cleaned. */
export function Flash() {
  const params = useSearchParams();
  const router = useRouter();
  const path = usePathname();
  const flash = params.get("flash");
  const island = useIslandFlash();

  useEffect(() => {
    if (!flash || !MESSAGES[flash]) return;
    if (island) island(MESSAGES[flash]);
    else toast.success(MESSAGES[flash]);
    success();
    router.replace(path, { scroll: false });
  }, [flash, path, router, island]);

  return null;
}
