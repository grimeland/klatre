/**
 * Single source of truth for Supabase env values.
 *
 * Pasted env values from a dashboard (Vercel especially) can carry
 * stray whitespace or newlines, which makes them invalid as HTTP header
 * tokens: `Headers.append("Authorization", "Bearer <key>\n")` throws
 * "invalid header value". JWTs and URLs are ASCII without whitespace,
 * so we strip every whitespace + control character defensively.
 */

function readEnv(name: string): string {
  const raw = process.env[name];
  if (!raw) throw new Error(`Missing env: ${name}`);
  // eslint-disable-next-line no-control-regex
  return raw.replace(/[\s\x00-\x1f\x7f]/g, "");
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
