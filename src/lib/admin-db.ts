import "server-only";
import pg from "pg";

/**
 * Force-confirm a freshly signed-up user so they can log in immediately,
 * regardless of the project's "Confirm email" setting. Uses the Postgres
 * connection (DATABASE_URL) — this is exactly what Supabase's admin
 * `email_confirm` does under the hood (sets auth.users.email_confirmed_at).
 * Best-effort: returns false if no connection is configured.
 */
export async function confirmUserEmail(email: string): Promise<boolean> {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) return false;

  const client = new pg.Client({
    connectionString,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 8000,
  });
  try {
    await client.connect();
    await client.query(
      `update auth.users
         set email_confirmed_at = coalesce(email_confirmed_at, now())
       where email = $1`,
      [email],
    );
    return true;
  } catch {
    return false;
  } finally {
    await client.end().catch(() => {});
  }
}
