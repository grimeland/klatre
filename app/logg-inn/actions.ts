"use server";

import { headers } from "next/headers";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type Result = { ok: true } | { ok: false; error: string };

export async function requestMagicLink(
  email: string,
  inviteCode: string,
  next: string,
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

  const headerStore = await headers();
  const host = headerStore.get("host");
  const protocol = headerStore.get("x-forwarded-proto") ?? "http";
  const origin = host ? `${protocol}://${host}` : "";
  const safeNext = next.startsWith("/") ? next : "/";
  const redirectTo = `${origin}/auth/callback?next=${encodeURIComponent(safeNext)}`;

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithOtp({
    email: trimmedEmail,
    options: { emailRedirectTo: redirectTo },
  });

  if (error) return { ok: false, error: error.message };
  return { ok: true };
}
