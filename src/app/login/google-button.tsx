"use client";

import { useState } from "react";
import { FilledButton } from "@/components/ios/button";
import { createClient } from "@/lib/supabase/client";

export function GoogleButton() {
  const [busy, setBusy] = useState(false);

  async function signIn() {
    setBusy(true);
    const { error } = await createClient().auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        // Pre-selects college accounts in Google's account picker.
        queryParams: { hd: "sst.scaler.com", prompt: "select_account" },
      },
    });
    if (error) setBusy(false);
  }

  return (
    <FilledButton onClick={signIn} loading={busy}>
      Continue with Google
    </FilledButton>
  );
}
