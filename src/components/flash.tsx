"use client";

import { useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { success } from "@/lib/haptics";

const MESSAGES: Record<string, string> = {
  sent: "Sent for approval",
  posted: "Posted. Everyone's been notified.",
  saved: "Changes saved",
};

/** Shows a toast after a redirect with ?flash=…, then cleans the URL. */
export function Flash() {
  const params = useSearchParams();
  const router = useRouter();
  const path = usePathname();
  const flash = params.get("flash");

  useEffect(() => {
    if (!flash || !MESSAGES[flash]) return;
    toast.success(MESSAGES[flash]);
    success();
    router.replace(path, { scroll: false });
  }, [flash, path, router]);

  return null;
}
