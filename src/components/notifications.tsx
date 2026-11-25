"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { sendTestPush } from "@/app/(app)/push-actions";

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
    <button
      onClick={async () => {
        await window.__installPrompt?.prompt();
        window.__installPrompt = undefined;
        setCan(false);
      }}
      className="w-full rounded-xl bg-surface-2 px-4 py-3 font-semibold"
    >
      Install Due as an app
    </button>
  );
}

const primary = "rounded-xl bg-accent px-4 py-3 font-semibold text-white transition active:scale-[0.98] disabled:opacity-60";

/** Full controls, for the Settings page. */
export function NotificationSettings() {
  const { status, busy, error, enable, disable } = usePush();
  const [testMsg, setTestMsg] = useState<string | null>(null);

  return (
    <section className="flex flex-col gap-3 rounded-2xl border border-line bg-surface p-4 shadow-card">
      <div>
        <h2 className="font-semibold">Notifications</h2>
        <p className="text-sm text-muted">New deadlines, plus reminders 24 hours and 2 hours before.</p>
      </div>

      {status === "loading" && <p className="text-sm text-muted">Checking…</p>}
      {status === "ios-install" && (
        <div className="rounded-xl bg-surface-2 p-3">
          <p className="text-sm font-medium">On iPhone, notifications only work once Due is on your home screen.</p>
          <IOSSteps />
        </div>
      )}
      {status === "unsupported" && <p className="text-sm text-muted">This browser can&apos;t receive notifications. Try Chrome on Android or Safari on iPhone.</p>}
      {status === "denied" && (
        <p className="text-sm text-muted">
          Notifications are blocked for Due. Allow them in your phone&apos;s settings (or the browser&apos;s site settings), then come back.
        </p>
      )}
      {status === "off" && (
        <button onClick={enable} disabled={busy} className={primary}>
          {busy ? "Turning on…" : "Turn on notifications"}
        </button>
      )}
      {status === "on" && (
        <div className="flex flex-col gap-2">
          <p className="text-sm text-ok">On for this device.</p>
          <div className="flex gap-2">
            <button
              onClick={async () => {
                setTestMsg("Sending…");
                const n = await sendTestPush();
                setTestMsg(n > 0 ? "Sent. It should arrive in a few seconds." : "No devices found. Try turning notifications off and on.");
              }}
              className="flex-1 rounded-xl bg-surface-2 px-4 py-2.5 text-sm font-semibold"
            >
              Send a test
            </button>
            <button onClick={disable} disabled={busy} className="flex-1 rounded-xl bg-surface-2 px-4 py-2.5 text-sm font-semibold text-muted">
              Turn off
            </button>
          </div>
          {testMsg && <p className="text-sm text-muted">{testMsg}</p>}
        </div>
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
    <div className="rise mb-5 rounded-2xl border border-line bg-surface p-4 shadow-card">
      <div className="flex items-start justify-between gap-3">
        <p className="font-medium">{status === "ios-install" ? "Add Due to your home screen" : "Get reminders before things are due"}</p>
        <button onClick={dismiss} aria-label="Dismiss" className="-mt-1 -mr-1 px-1 text-lg leading-none text-muted">
          ×
        </button>
      </div>
      {status === "ios-install" ? (
        <IOSSteps />
      ) : (
        <button onClick={enable} disabled={busy} className={`${primary} mt-3 w-full`}>
          {busy ? "Turning on…" : "Turn on notifications"}
        </button>
      )}
      {error && <p className="mt-2 text-sm text-accent">{error}</p>}
    </div>
  );
}
