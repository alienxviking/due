"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getMe, getSession } from "@/lib/me";
import { fromISTParts } from "@/lib/time";

export type FormState = { error?: string };

function normaliseUrl(raw: string): string | null {
  const v = raw.trim();
  if (!v) return null;
  const withScheme = /^https?:\/\//i.test(v) ? v : `https://${v}`;
  try {
    const u = new URL(withScheme);
    return u.hostname.includes(".") ? u.toString() : null;
  } catch {
    return null;
  }
}

export async function savePost(_: FormState, form: FormData): Promise<FormState> {
  const { supabase, isAdmin } = await getMe();
  const id = String(form.get("id") ?? "") || null;
  const title = String(form.get("title") ?? "").trim();
  const url = normaliseUrl(String(form.get("url") ?? ""));
  const note = String(form.get("note") ?? "").trim() || null;
  const tba = form.get("tba") === "on";

  if (!title) return { error: "Give it a title." };
  if (title.length > 120) return { error: "Title is too long (120 characters max)." };
  if (!url) return { error: "That link doesn't look right." };
  if (note && note.length > 500) return { error: "Note is too long (500 characters max)." };

  let deadline: string | null = null;
  if (!tba) {
    deadline = fromISTParts(String(form.get("date") ?? ""), String(form.get("time") ?? ""));
    if (!deadline) return { error: "Pick a deadline date and time, or mark it TBA." };
    if (!id && new Date(deadline).getTime() < Date.now()) return { error: "That deadline has already passed." };
  }

  const fields = { title, url, note, deadline };
  if (id) {
    const { data, error } = await supabase.from("posts").update(fields).eq("id", id).select("id");
    if (error) return { error: error.message };
    if (!data?.length) return { error: "You can't edit this post anymore (it may have been approved)." };
  } else {
    const { error } = await supabase.from("posts").insert(fields);
    if (error) return { error: error.message };
  }

  revalidatePath("/", "layout");
  const back = String(form.get("back") || "");
  const safeBack = back.startsWith("/") && !back.startsWith("//") ? back : "/";
  redirect(id ? `${safeBack}${safeBack.includes("?") ? "&" : "?"}flash=saved` : isAdmin ? "/?flash=posted" : "/mine?flash=sent");
}

export async function approvePost(id: string) {
  const { supabase } = await getSession();
  const { error } = await supabase.from("posts").update({ status: "approved" }).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/", "layout");
}

export async function rejectPost(id: string, reason: string) {
  const { supabase } = await getSession();
  const { error } = await supabase
    .from("posts")
    .update({ status: "rejected", reject_reason: reason.trim().slice(0, 300) || null })
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/", "layout");
}

export async function deletePost(id: string) {
  const { supabase } = await getSession();
  const { error } = await supabase.from("posts").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/", "layout");
}
