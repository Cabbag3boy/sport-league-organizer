import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";

// Prefer publishable key (Supabase SDK ≥2.x), fall back to legacy anon key name.
// Both are safe public keys; RLS is always enforced with these keys.
const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "";

function makeClient(key: string, accessToken?: string): SupabaseClient {
  return createClient(SUPABASE_URL, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: accessToken
      ? { headers: { Authorization: `Bearer ${accessToken}` } }
      : undefined,
  });
}

/**
 * RLS-enforced client scoped to the authenticated user.
 * Requires a valid Bearer token. Use for all authenticated API routes.
 */
export function createUserServerSupabase(accessToken: string): SupabaseClient {
  if (!SUPABASE_URL)
    throw new Error("Missing env var: NEXT_PUBLIC_SUPABASE_URL");
  if (!SUPABASE_ANON_KEY)
    throw new Error(
      "Missing env var: NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY (or NEXT_PUBLIC_SUPABASE_ANON_KEY)",
    );
  return makeClient(SUPABASE_ANON_KEY, accessToken);
}

/**
 * RLS-enforced client with optional user context.
 * Injects the Bearer token when present; falls back to anonymous access.
 * Use for read routes that serve data with or without authentication.
 */
export function createPublicServerSupabase(
  accessToken?: string,
): SupabaseClient {
  if (!SUPABASE_URL)
    throw new Error("Missing env var: NEXT_PUBLIC_SUPABASE_URL");
  if (!SUPABASE_ANON_KEY)
    throw new Error(
      "Missing env var: NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY (or NEXT_PUBLIC_SUPABASE_ANON_KEY)",
    );
  return makeClient(SUPABASE_ANON_KEY, accessToken);
}
