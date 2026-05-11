import { NextResponse, type NextRequest } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const next = searchParams.get("next") ?? "/";

  const safeNext = next.startsWith("/") ? next : "/";
  const supabase = await createSupabaseServerClient();

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) return failRedirect(origin, error.message);
    return NextResponse.redirect(`${origin}${safeNext}`);
  }

  if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type,
    });
    if (error) return failRedirect(origin, error.message);
    return NextResponse.redirect(`${origin}${safeNext}`);
  }

  return failRedirect(origin, "missing-auth-params");
}

function failRedirect(origin: string, message: string) {
  return NextResponse.redirect(
    `${origin}/logg-inn?error=${encodeURIComponent(message)}`,
  );
}
