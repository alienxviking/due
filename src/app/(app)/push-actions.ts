"use server";

import { getMe } from "@/lib/me";
import { sendToUsers } from "@/lib/push";
import { createAdminClient } from "@/lib/supabase/admin";

/** Sends a test notification to the current user's devices. Returns how many were reached. */
export async function sendTestPush(): Promise<number> {
  const { profile } = await getMe();
  return sendToUsers(createAdminClient(), [profile.id], {
    title: "Due",
    body: "Notifications are working 🎉",
    url: "/settings",
    tag: "test",
  });
}
