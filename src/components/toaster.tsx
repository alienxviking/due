"use client";

import { Toaster as Sonner } from "sonner";

/** Dark glass toasts. */
export function Toaster() {
  return (
    <Sonner
      theme="dark"
      position="top-center"
      offset={16}
      mobileOffset={{ top: "max(58px, calc(env(safe-area-inset-top) + 54px))" }}
      toastOptions={{
        classNames: {
          toast: "!rounded-2xl !border !border-white/10 !bg-neutral-950/85 !text-neutral-100 !shadow-[0_20px_50px_-20px_rgb(0_0_0/0.9)] !backdrop-blur-xl !font-sans",
          success: "[&_[data-icon]]:!text-green",
          error: "[&_[data-icon]]:!text-red",
        },
      }}
    />
  );
}
