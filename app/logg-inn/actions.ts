"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";

type Result = { ok: true } | { ok: false; error: string };

export async function requestEmailOtp(
  email: string,
  inviteCode: string,
): Promise<Result> {
  const trimmedEmail = email.trim().toLowerCase();
  const trimmedCode = inviteCode.trim();

  if (!trimmedEmail) return { ok: false, error: "Skriv inn e-posten din." };
  if (!trimmedCode) return { ok: false, error: "Invite-kode mangler." };

  const expected = process.env.FELT_INVITE_CODE;
  if (!expected) {
    return {
      ok: false,
      error: "Serveren er ikke konfigurert. Si fra til Erlend.",
    };
  }

  if (trimmedCode !== expected) {
    return { ok: false, error: "Feil invite-kode." };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithOtp({
    email: trimmedEmail,
    options: { shouldCreateUser: true },
  });

  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function verifyEmailOtp(
  email: string,
  token: string,
): Promise<Result> {
  const trimmedEmail = email.trim().toLowerCase();
  const trimmedToken = token.trim();

  if (!trimmedEmail || !trimmedToken) {
    return { ok: false, error: "Skriv inn både e-post og kode." };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.verifyOtp({
    email: trimmedEmail,
    token: trimmedToken,
    type: "email",
  });

  if (error) return { ok: false, error: error.message };
  return { ok: true };
}
