import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendToUsers, type PushMessage } from "@/lib/push";
import { formatDeadline } from "@/lib/time";
import type { Post } from "@/lib/types";

// Called by Supabase (pg_net) whenever notifications are queued, and every 5 minutes as a retry.
export const dynamic = "force-dynamic";
export const maxDuration = 30;

type Event = { id: number; kind: string; post_id: string };

function message(kind: string, p: Post): PushMessage | null {
  const due = p.deadline ? `due ${formatDeadline(p.deadline)}` : "deadline TBA";
  const tag = `${p.id}:${kind}`;
  switch (kind) {
    case "submitted":
      return { title: "New post to review", body: `${p.title} · by ${p.author_name ?? "someone"}`, url: "/admin", tag };
    case "approved":
      return { title: "📌 New deadline", body: `${p.title} · ${due}`, url: "/", tag };
    case "rejected":
      return {
        title: "Your post wasn't approved",
        body: p.reject_reason ? `${p.title}: ${p.reject_reason}` : p.title,
        url: "/mine",
        tag,
      };
    case "deadline_set":
      return { title: "Deadline announced", body: `${p.title} · ${due}`, url: "/", tag };
    case "deadline_changed":
      return { title: "Deadline changed", body: `${p.title} · now ${due}`, url: "/", tag };
    case "reminder_24h":
      return { title: "Due in 24 hours", body: `${p.title} · ${formatDeadline(p.deadline)}`, url: "/", tag };
    case "reminder_2h":
      return { title: "⏰ Due in 2 hours", body: `${p.title} · ${formatDeadline(p.deadline)}`, url: "/", tag };
    default:
      return null;
  }
}

export async function POST(request: NextRequest) {
  const secret = process.env.DISPATCH_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const admin = createAdminClient();
  let processed = 0;
  let devices = 0;

  for (let round = 0; round < 5; round++) {
    const { data: events, error } = await admin.rpc("claim_outbox", { max_rows: 20 });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    if (!events?.length) break;

    for (const ev of events as Event[]) {
      try {
        const { data: post } = await admin.from("posts").select("*").eq("id", ev.post_id).maybeSingle<Post>();
        const msg = post && message(ev.kind, post);
        // Skip stale events: e.g. a reminder for a post that was un-approved meanwhile.
        const stillRelevant = post && (ev.kind === "submitted" || ev.kind === "rejected" || post.status === "approved");

        if (post && msg && stillRelevant) {
          let audience: string[] = [];
          if (ev.kind === "submitted") {
            const { data } = await admin.from("profiles").select("id").eq("role", "admin");
            audience = (data ?? []).map((r) => r.id).filter((id) => id !== post.author_id);
          } else if (ev.kind === "rejected") {
            audience = post.author_id ? [post.author_id] : [];
          } else {
            const { data } = await admin.from("profiles").select("id").eq("batch", post.batch);
            audience = (data ?? []).map((r) => r.id);
          }
          devices += await sendToUsers(admin, audience, msg);
        }
        await admin.rpc("finish_outbox", { ids: [ev.id] });
      } catch (e) {
        // Left claimed; it will be retried after 2 minutes (up to 5 attempts).
        console.error("dispatch failed for event", ev.id, (e as Error).message);
      }
      processed++;
    }
  }

  return NextResponse.json({ processed, devices });
}
