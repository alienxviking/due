import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/types";

/** The signed-in user's profile plus a Supabase client acting as them. Cached per request. */
export const getMe = cache(async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, email, name, batch, role")
    .eq("id", user.id)
    .single<Profile>();
  if (!profile) redirect("/login?error=" + encodeURIComponent("Your account isn't set up. Try signing in again."));

  return { supabase, profile, isAdmin: profile.role === "admin" };
});
