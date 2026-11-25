"use client";

import { useEffect } from "react";

declare global {
  interface Window {
    __installPrompt?: Event & { prompt: () => Promise<void> };
  }
}

export function RegisterSW() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }
    // Android Chrome: keep the install prompt so an "Install app" button can show it later.
    const onPrompt = (e: Event) => {
      e.preventDefault();
      window.__installPrompt = e as Window["__installPrompt"];
      window.dispatchEvent(new Event("due:installable"));
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    return () => window.removeEventListener("beforeinstallprompt", onPrompt);
  }, []);
  return null;
}
