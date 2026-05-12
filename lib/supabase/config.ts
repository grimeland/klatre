/**
 * Single source of truth for Supabase env values.
 *
 * Next.js inlines NEXT_PUBLIC_* env vars in the client bundle only when
 * accessed by direct property syntax (`process.env.NEXT_PUBLIC_X`), NOT
 * dynamic lookup (`process.env[name]`). Each call site below must use
 * direct access or the client bundle will see `undefined`.
 *
 * We sanitize because pasted env values from a dashboard (Vercel
 * especially) can carry stray whitespace or newlines, which makes them
 * invalid as HTTP header tokens.
 */

function sanitize(name: string, raw: string | undefined): string {
  if (!raw) throw new Error(`Missing env: ${name}`);
  // eslint-disable-next-line no-control-regex
  return raw.replace(/[\s\x00-\x1f\x7f]/g, "");
}

export function supabaseUrl(): string {
  return sanitize(
    "NEXT_PUBLIC_SUPABASE_URL",
    process.env.NEXT_PUBLIC_SUPABASE_URL,
  );
}

export function supabaseAnonKey(): string {
  return sanitize(
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}

export function supabaseServiceRoleKey(): string {
  return sanitize(
    "SUPABASE_SERVICE_ROLE_KEY",
    process.env.SUPABASE_SERVICE_ROLE_KEY,
  );
}
