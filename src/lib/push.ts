import "server-only";
import webpush from "web-push";
import type { SupabaseClient } from "@supabase/supabase-js";

export type PushMessage = { title: string; body: string; url: string; tag?: string };

let configured = false;
function configure() {
  if (configured) return;
  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT!,
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
    process.env.VAPID_PRIVATE_KEY!,
  );
  configured = true;
}

/** Sends to every device of the given users. Expired devices are removed. Returns devices reached. */
export async function sendToUsers(admin: SupabaseClient, userIds: string[], msg: PushMessage): Promise<number> {
  if (userIds.length === 0) return 0;
  configure();

  const { data: subs, error } = await admin
    .from("push_subscriptions")
    .select("endpoint, p256dh, auth")
    .in("user_id", userIds);
  if (error) throw new Error(error.message);

  const payload = JSON.stringify(msg);
  const dead: string[] = [];
  let sent = 0;

  await Promise.all(
    (subs ?? []).map(async (s) => {
      try {
        await webpush.sendNotification({ endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } }, payload, {
          TTL: 60 * 60 * 24,
          urgency: "high",
        });
        sent++;
      } catch (e) {
        const code = (e as { statusCode?: number }).statusCode;
        if (code === 404 || code === 410) dead.push(s.endpoint);
        else console.error("push failed", code, (e as Error).message);
      }
    }),
  );

  if (dead.length) await admin.from("push_subscriptions").delete().in("endpoint", dead);
  return sent;
}
