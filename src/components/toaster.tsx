"use client";

import { Toaster as Sonner } from "sonner";

export function Toaster() {
  return (
    <Sonner
      position="top-center"
      offset={16}
      mobileOffset={{ top: "max(12px, env(safe-area-inset-top))" }}
      toastOptions={{
        classNames: {
          toast: "!rounded-2xl !border-line !bg-surface !text-text !shadow-[0_12px_32px_-12px_rgb(0_0_0/0.3)] !font-sans",
          description: "!text-muted",
          success: "[&_[data-icon]]:!text-ok",
          error: "[&_[data-icon]]:!text-accent",
        },
      }}
    />
  );
}
