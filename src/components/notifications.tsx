"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { AnimatePresence, motion } from "motion/react";
import { toast } from "sonner";
import { sendTestPush } from "@/app/(app)/push-actions";
import { Switch } from "@/components/animate-ui/components/radix/switch";
import { BellIcon, PhoneIcon, PaperplaneIcon, ShareIcon, XIcon } from "@/components/ios/icons";
import { Row, RowIcon, Section } from "@/components/ios/list";
import { Spinner } from "@/components/ios/spinner";

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
      <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-fill text-[13px] font-semibold">{n}</span>
      <span className="pt-0.5">{body}</span>
    </li>
  );
  return (
    <ol className="flex flex-col gap-2.5 px-4 py-3 text-[15px] leading-5">
      {step(1, <>In Safari, tap <ShareIcon size={16} className="inline -mt-1 text-tint" /> <b>Share</b></>)}
      {step(2, <>Choose <b>Add to Home Screen</b></>)}
      {step(3, <>Open Due from your Home Screen and turn on notifications here</>)}
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

/** Settings: Notifications section (iOS Settings rows). */
export function NotificationSettings() {
  const { status, busy, error, enable, disable } = usePush();
  const [testing, setTesting] = useState(false);
  const { can, install } = useInstallPrompt();

  const footer =
    error ??
    (status === "denied"
      ? "Notifications are blocked for Due. Allow them in your phone's settings, then come back."
      : status === "unsupported"
        ? "This browser can't receive notifications. Use Chrome on Android or Safari on iPhone."
        : status === "ios-install"
          ? "On iPhone, notifications only work after adding Due to your Home Screen."
          : "New deadlines, plus reminders 24 hours and 2 hours before each one.");

  return (
    <>
      <Section header="Notifications" footer={footer}>
        <Row
          icon={<RowIcon color="var(--red)"><BellIcon size={18} /></RowIcon>}
          title="Allow Notifications"
          accessory={
            status === "loading" ? (
              <Spinner size={18} className="text-label-2" />
            ) : status === "on" || status === "off" ? (
              <Switch checked={status === "on"} disabled={busy} onCheckedChange={(v) => (v ? enable() : disable())} aria-label="Notifications" />
            ) : (
              <span className="text-[17px] text-label-2">{status === "denied" ? "Blocked" : "Unavailable"}</span>
            )
          }
        />
        {status === "on" && (
          <Row
            icon={<RowIcon color="var(--tint)"><PaperplaneIcon size={16} /></RowIcon>}
            title="Send Test Notification"
            tinted
            accessory={testing ? <Spinner size={18} className="text-label-2" /> : undefined}
            onClick={async () => {
              setTesting(true);
              const n = await sendTestPush().catch(() => 0);
              setTesting(false);
              if (n > 0) toast.success("Sent. It should arrive in a few seconds.");
              else toast.error("No devices found. Turn notifications off and on again.");
            }}
          />
        )}
        {status === "ios-install" && <IOSSteps />}
      </Section>
      {can && (
        <Section>
          <Row icon={<RowIcon color="var(--green)"><PhoneIcon size={17} /></RowIcon>} title="Install Due as an App" tinted onClick={install} />
        </Section>
      )}
    </>
  );
}

/** Inset card at the top of the feed until notifications are on. Dismissible. */
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
        <motion.div exit={{ opacity: 0, height: 0, marginBottom: 0 }} className="mx-4 mb-6 overflow-hidden rounded-[12px] bg-cell">
          <div className="flex items-start gap-3 px-4 pt-3.5 pb-3">
            <RowIcon color="var(--red)"><BellIcon size={18} /></RowIcon>
            <div className="min-w-0 flex-1">
              <p className="text-[17px] font-semibold leading-[22px]">{status === "ios-install" ? "Add Due to Home Screen" : "Turn On Notifications"}</p>
              <p className="mt-0.5 text-[15px] leading-5 text-label-2">
                {status === "ios-install" ? "iPhone only sends reminders to apps on the Home Screen." : "Get reminders 24 hours and 2 hours before deadlines."}
              </p>
            </div>
            <button onClick={dismiss} aria-label="Dismiss" className="-mt-1 -mr-1.5 flex size-7 items-center justify-center rounded-full bg-fill text-label-2 active:opacity-50">
              <XIcon size={14} />
            </button>
          </div>
          {status === "ios-install" ? (
            <div className="hairline-t"><IOSSteps /></div>
          ) : (
            <button onClick={enable} disabled={busy} className="hairline-t flex h-11 w-full items-center justify-center text-[17px] text-tint active:bg-cell-2">
              {busy ? <Spinner size={18} /> : "Turn On"}
            </button>
          )}
          {error && <p className="px-4 pb-3 text-[13px] text-red">{error}</p>}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
