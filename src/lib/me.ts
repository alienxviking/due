import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/types";

/**
 * The signed-in user, from the session JWT. getClaims() verifies the token locally
 * against the project's public key, so this costs no network round trip.
 * The batch comes from the email (name.24bcs10155@…), so feed queries can start
 * right away without waiting for the profile.
 */
export const getSession = cache(async () => {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims;
  if (!claims?.sub) redirect("/login");
  const email = String(claims.email ?? "").toLowerCase();
  const batch = email.match(/\.([0-9]{2}[a-z]+)[0-9]+@sst\.scaler\.com$/)?.[1] ?? "";
  return { supabase, userId: claims.sub as string, email, batch };
});

/** Profile (role, name). One small query, cached per request; run it in parallel with page queries. */
export const getMe = cache(async () => {
  const { supabase, userId } = await getSession();
  const { data: profile } = await supabase
    .from("profiles")
    .select("id, email, name, batch, role")
    .eq("id", userId)
    .single<Profile>();
  if (!profile) redirect("/login?error=" + encodeURIComponent("Your account isn't set up. Try signing in again."));
  return { supabase, profile, isAdmin: profile.role === "admin" };
});
