"use client";

import { Toaster as Sonner } from "sonner";

/** Toasts styled like an iOS notification banner. */
export function Toaster() {
  return (
    <Sonner
      position="top-center"
      offset={12}
      mobileOffset={{ top: "max(10px, env(safe-area-inset-top))" }}
      toastOptions={{
        classNames: {
          toast:
            "!rounded-[18px] !border-0 !bg-bar !text-label !shadow-[0_8px_30px_rgb(0_0_0/0.16)] !backdrop-blur-2xl !backdrop-saturate-150 !font-sans !text-[15px] !py-3",
          success: "[&_[data-icon]]:!text-green",
          error: "[&_[data-icon]]:!text-red",
        },
      }}
    />
  );
}
