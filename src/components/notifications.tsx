"use client";

import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { toast } from "sonner";
import { sendTestPush } from "@/app/(app)/push-actions";
import { Switch } from "@/components/animate-ui/components/radix/switch";
import { GhostButton, WhiteButton } from "@/components/glass/buttons";
import { GlassCard } from "@/components/glass/glass-card";
import { BellIcon, ShareIcon, XIcon } from "@/components/ios/icons";
import { Spinner } from "@/components/ios/spinner";
import { createClient } from "@/lib/supabase/client";

type Status = "loading" | "ios-install" | "unsupported" | "denied" | "off" | "on";

const DISMISS_KEY = "due:push-banner-dismissed";

function isIOS() {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
}
function isStandalone() {
  return window.matchMedia("(display-mode: standalone)").matches || (navigator as { standalone?: boolean }).standalone === true;
}
function keyBytes(base64: string) {
  const pad = "=".repeat((4 - (base64.length % 4)) % 4);
  const raw = atob((base64 + pad).replace(/-/g, "+").replace(/_/g, "/"));
  return Uint8Array.from(raw, (c) => c.charCodeAt(0));
}

async function saveSubscription(sub: PushSubscription) {
  const json = sub.toJSON();
  const { error } = await createClient().rpc("save_push_subscription", {
    p_endpoint: sub.endpoint,
    p_p256dh: json.keys?.p256dh,
    p_auth: json.keys?.auth,
  });
  if (error) throw new Error(error.message);
}

function usePush() {
  const [status, setStatus] = useState<Status>("loading");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const supported = "serviceWorker" in navigator && "PushManager" in window && "Notification" in window;
      if (!supported) return setStatus(isIOS() && !isStandalone() ? "ios-install" : "unsupported");
      if (Notification.permission === "denied") return setStatus("denied");
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (sub && Notification.permission === "granted") {
        setStatus("on");
        saveSubscription(sub).catch(() => {}); // re-link in case someone else used this device
      } else {
        setStatus("off");
      }
    })().catch(() => setStatus("unsupported"));
  }, []);

  const enable = useCallback(async () => {
    setBusy(true);
    setError(null);
    try {
      const perm = await Notification.requestPermission();
      if (perm !== "granted") {
        setStatus(perm === "denied" ? "denied" : "off");
        return;
      }
      const reg = await navigator.serviceWorker.ready;
      const sub =
        (await reg.pushManager.getSubscription()) ??
        (await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: keyBytes(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!),
        }));
      await saveSubscription(sub);
      setStatus("on");
    } catch (e) {
      setError((e as Error).message || "Couldn't turn on notifications.");
    } finally {
      setBusy(false);
    }
  }, []);

  const disable = useCallback(async () => {
    setBusy(true);
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (sub) {
        await createClient().from("push_subscriptions").delete().eq("endpoint", sub.endpoint);
        await sub.unsubscribe();
      }
      setStatus("off");
    } finally {
      setBusy(false);
    }
  }, []);

  return { status, busy, error, enable, disable };
}

function IOSSteps() {
  const step = (n: number, body: React.ReactNode) => (
    <li className="flex gap-3">
      <span className="flex size-6 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.06] text-xs font-semibold text-neutral-300">{n}</span>
      <span className="pt-0.5 text-neutral-300">{body}</span>
    </li>
  );
  return (
    <ol className="mt-4 flex flex-col gap-2.5 text-sm">
      {step(
        1,
        <>
          In Safari, tap <ShareIcon size={15} className="-mt-1 inline text-tint" /> <b className="text-white">Share</b>
        </>,
      )}
      {step(
        2,
        <>
          Choose <b className="text-white">Add to Home Screen</b>
        </>,
      )}
      {step(3, <>Open Due from your Home Screen and turn on notifications</>)}
    </ol>
  );
}

function useInstallPrompt() {
  const [can, setCan] = useState(false);
  useEffect(() => {
    const check = () => setCan(!!window.__installPrompt && !isStandalone());
    check();
    window.addEventListener("due:installable", check);
    return () => window.removeEventListener("due:installable", check);
  }, []);
  const install = async () => {
    await window.__installPrompt?.prompt();
    window.__installPrompt = undefined;
    setCan(false);
  };
  return { can, install };
}

/** Settings card for notifications. */
export function NotificationSettings() {
  const { status, busy, error, enable, disable } = usePush();
  const [testing, setTesting] = useState(false);
  const { can, install } = useInstallPrompt();

  const note =
    error ??
    (status === "denied"
      ? "Blocked for Due. Allow notifications in your phone or browser settings, then come back."
      : status === "unsupported"
        ? "This browser can't receive notifications. Use Chrome on Android or Safari on iPhone."
        : status === "ios-install"
          ? "On iPhone, notifications only work after adding Due to your Home Screen."
          : "New deadlines, plus reminders 24 hours and 2 hours before each one.");

  return (
    <GlassCard>
      <div className="p-5 md:p-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.05] text-tint">
              <BellIcon size={20} />
            </span>
            <div>
              <p className="font-semibold text-neutral-100">Notifications</p>
              <p className="text-sm text-neutral-500">{status === "on" ? "On for this device" : status === "loading" ? "Checking…" : "Off"}</p>
            </div>
          </div>
          {(status === "on" || status === "off") && (
            <Switch checked={status === "on"} disabled={busy} onCheckedChange={(v) => (v ? enable() : disable())} aria-label="Notifications" />
          )}
        </div>
        <p className={`mt-4 text-sm ${error ? "text-red" : "text-neutral-400"}`}>{note}</p>
        {status === "ios-install" && <IOSSteps />}
        {(status === "on" || can) && (
          <div className="mt-5 flex flex-wrap gap-2">
            {status === "on" && (
              <GhostButton
                disabled={testing}
                onClick={async () => {
                  setTesting(true);
                  const n = await sendTestPush().catch(() => 0);
                  setTesting(false);
                  if (n > 0) toast.success("Sent. It should arrive in a few seconds.");
                  else toast.error("No devices found. Turn notifications off and on again.");
                }}
              >
                {testing ? <Spinner size={16} /> : "Send a test"}
              </GhostButton>
            )}
            {can && <GhostButton onClick={install}>Install Due as an app</GhostButton>}
          </div>
        )}
      </div>
    </GlassCard>
  );
}

/** Card at the top of the feed until notifications are on. Dismissible. */
export function NotificationBanner() {
  const { status, busy, error, enable } = usePush();
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    try {
      setDismissed(localStorage.getItem(DISMISS_KEY) === "1");
    } catch {
      setDismissed(false);
    }
  }, []);

  const show = !dismissed && (status === "ios-install" || status === "off");
  const dismiss = () => {
    try {
      localStorage.setItem(DISMISS_KEY, "1");
    } catch {}
    setDismissed(true);
  };

  return (
    <AnimatePresence initial={false}>
      {show && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, height: 0, marginBottom: 0 }} className="mb-6">
          <GlassCard>
            <div className="flex flex-col gap-4 p-5 md:flex-row md:items-center">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.05] text-tint">
                <BellIcon size={20} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-neutral-100">{status === "ios-install" ? "Add Due to your Home Screen" : "Never miss a deadline"}</p>
                <p className="text-sm text-neutral-400">
                  {status === "ios-install" ? "iPhone only sends reminders to apps on the Home Screen." : "Turn on reminders for 24 hours and 2 hours before."}
                </p>
                {status === "ios-install" && <IOSSteps />}
              </div>
              <div className="flex items-center gap-2">
                {status === "off" && (
                  <WhiteButton onClick={enable} loading={busy}>
                    Turn on
                  </WhiteButton>
                )}
                <button onClick={dismiss} aria-label="Dismiss" className="flex size-11 items-center justify-center rounded-full text-neutral-500 hover:bg-white/[0.06] hover:text-white">
                  <XIcon size={16} />
                </button>
              </div>
            </div>
            {error && <p className="px-5 pb-4 text-sm text-red">{error}</p>}
          </GlassCard>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
