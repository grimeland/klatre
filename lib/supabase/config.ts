/**
 * Single source of truth for Supabase env values.
 *
 * We trim because pasted env values from a dashboard (Vercel especially)
 * can carry trailing newlines, which makes the values invalid as HTTP
 * header tokens: `Headers.append("Authorization", "Bearer <key>\n")`
 * throws TypeError: invalid header value.
 */

function readEnv(name: string): string {
  const raw = process.env[name];
  if (!raw) throw new Error(`Missing env: ${name}`);
  return raw.trim();
}

export function supabaseUrl(): string {
  return readEnv("NEXT_PUBLIC_SUPABASE_URL");
}

export function supabaseAnonKey(): string {
  return readEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY");
}

export function supabaseServiceRoleKey(): string {
  return readEnv("SUPABASE_SERVICE_ROLE_KEY");
}
