"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { motion } from "motion/react";
import { toast } from "sonner";
import { sendTestPush } from "@/app/(app)/push-actions";
import { Switch } from "@/components/animate-ui/components/radix/switch";
import { Button } from "@/components/ui/button";

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
  return (
    <ol className="mt-3 flex flex-col gap-2 text-sm">
      <li className="flex gap-2">
        <span className="font-semibold text-accent">1.</span>
        <span>
          In Safari, tap the <b>Share</b> button{" "}
          <svg className="inline -mt-1" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-label="share icon">
            <path d="M12 3v12M8 7l4-4 4 4M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7" />
          </svg>{" "}
          at the bottom.
        </span>
      </li>
      <li className="flex gap-2">
        <span className="font-semibold text-accent">2.</span>
        <span>
          Scroll down and tap <b>Add to Home Screen</b>.
        </span>
      </li>
      <li className="flex gap-2">
        <span className="font-semibold text-accent">3.</span>
        <span>Open Due from your home screen and turn on notifications.</span>
      </li>
    </ol>
  );
}

function InstallButton() {
  const [can, setCan] = useState(false);
  useEffect(() => {
    const check = () => setCan(!!window.__installPrompt && !isStandalone());
    check();
    window.addEventListener("due:installable", check);
    return () => window.removeEventListener("due:installable", check);
  }, []);
  if (!can) return null;
  return (
    <Button
      variant="soft"
      onClick={async () => {
        await window.__installPrompt?.prompt();
        window.__installPrompt = undefined;
        setCan(false);
      }}
    >
      Install Due as an app
    </Button>
  );
}

/** Full controls, for the Settings page. */
export function NotificationSettings() {
  const { status, busy, error, enable, disable } = usePush();
  const [testing, setTesting] = useState(false);
  const toggleable = status === "on" || status === "off";

  return (
    <section className="flex flex-col gap-3 rounded-[22px] border border-line bg-surface p-4 shadow-card">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-xl bg-accent-soft text-accent">
            <motion.svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
              animate={status === "on" ? { rotate: [0, -16, 14, -10, 8, 0] } : { rotate: 0 }} transition={{ duration: 0.7 }} style={{ originY: "4px" }}>
              <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9M10.3 21a1.94 1.94 0 0 0 3.4 0" />
            </motion.svg>
          </span>
          <div>
            <h2 className="font-semibold">Notifications</h2>
            <p className="text-[13px] text-muted">{status === "on" ? "On for this device" : "New deadlines + reminders"}</p>
          </div>
        </div>
        {toggleable && (
          <Switch checked={status === "on"} disabled={busy} onCheckedChange={(v) => (v ? enable() : disable())} aria-label="Notifications" />
        )}
      </div>

      {status === "loading" && <p className="text-sm text-muted">Checking…</p>}
      {status === "ios-install" && (
        <div className="rounded-2xl bg-surface-2 p-3.5">
          <p className="text-sm font-medium">On iPhone, notifications only work once Due is on your home screen.</p>
          <IOSSteps />
        </div>
      )}
      {status === "unsupported" && <p className="text-sm text-muted">This browser can&apos;t receive notifications. Try Chrome on Android or Safari on iPhone.</p>}
      {status === "denied" && (
        <p className="rounded-2xl bg-surface-2 p-3.5 text-sm text-muted">
          Notifications are blocked for Due. Allow them in your phone&apos;s settings (or the browser&apos;s site settings), then come back.
        </p>
      )}
      {status === "on" && (
        <Button
          variant="soft"
          loading={testing}
          loadingText="Sending…"
          onClick={async () => {
            setTesting(true);
            const n = await sendTestPush().catch(() => 0);
            setTesting(false);
            if (n > 0) toast.success("Test sent. It should arrive in a few seconds.");
            else toast.error("No devices found. Turn notifications off and on again.");
          }}
        >
          Send a test notification
        </Button>
      )}
      {error && <p className="text-sm text-accent">{error}</p>}
      <InstallButton />
    </section>
  );
}

/** Nudge at the top of the feed until notifications are on. Dismissible. */
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

  if (dismissed || !["ios-install", "off"].includes(status)) return null;
  const dismiss = () => {
    try {
      localStorage.setItem(DISMISS_KEY, "1");
    } catch {}
    setDismissed(true);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -8, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 26, delay: 0.25 }}
      className="mb-5 rounded-[22px] border border-line bg-surface p-4 shadow-card"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-accent-soft text-lg">{status === "ios-install" ? "📲" : "🔔"}</span>
          <div>
            <p className="font-semibold leading-tight">{status === "ios-install" ? "Add Due to your home screen" : "Never miss a deadline"}</p>
            <p className="text-[13px] text-muted">{status === "ios-install" ? "Needed for reminders on iPhone" : "Reminders 24h and 2h before"}</p>
          </div>
        </div>
        <button onClick={dismiss} aria-label="Dismiss" className="-mt-1 -mr-1 rounded-lg p-1 text-muted active:bg-surface-2">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18" /></svg>
        </button>
      </div>
      {status === "ios-install" ? (
        <IOSSteps />
      ) : (
        <Button onClick={enable} loading={busy} loadingText="Turning on…" className="mt-3 w-full">
          Turn on notifications
        </Button>
      )}
      {error && <p className="mt-2 text-sm text-accent">{error}</p>}
    </motion.div>
  );
}
