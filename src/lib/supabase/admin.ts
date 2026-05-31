import "server-only";
import { createClient } from "@supabase/supabase-js";

/**
 * Service-role client (uses the Supabase secret key). Returns null when the
 * key isn't configured. Used to create users pre-confirmed via the admin API,
 * which sends NO confirmation email — so signup works regardless of the
 * project's "Confirm email" setting and isn't subject to email rate limits.
 */
export function createAdminClient() {
  const key = (process.env.SUPABASE_SECRET_KEY ?? "").trim();
  if (!key) return null;
  return createClient(
    (process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").trim(),
    key,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
}
