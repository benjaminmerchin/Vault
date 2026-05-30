// Seed the one-click demo account. Run: pnpm seed
// Creates demo@vault.app (via Supabase Auth), force-confirms it through the
// Postgres pooler, then inserts the sample portfolio (RLS bypassed as owner).
import pg from "pg";
import { createClient } from "@supabase/supabase-js";
import { buildSamplePortfolio } from "../src/lib/sample-data";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const PUBLISHABLE = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;
const DEMO_EMAIL = process.env.DEMO_EMAIL!;
const DEMO_PASSWORD = process.env.DEMO_PASSWORD!;

async function main() {
  const supabase = createClient(SUPABASE_URL, PUBLISHABLE);

  // 1) Create the demo auth user (ignore "already registered").
  const { error: signUpErr } = await supabase.auth.signUp({
    email: DEMO_EMAIL,
    password: DEMO_PASSWORD,
    options: { data: { full_name: "Alex Rivera" } },
  });
  if (signUpErr && !/already|registered|exists/i.test(signUpErr.message)) {
    throw new Error(`signUp failed: ${signUpErr.message}`);
  }

  const db = new pg.Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 10000,
  });
  await db.connect();

  // 2) Force-confirm the email so password login works regardless of project settings.
  const { rows } = await db.query(
    `update auth.users set email_confirmed_at = coalesce(email_confirmed_at, now())
     where email = $1 returning id`,
    [DEMO_EMAIL],
  );
  if (!rows.length) throw new Error("Demo user not found after signUp.");
  const userId: string = rows[0].id;
  console.log("demo user:", userId);

  // 3) Reset + insert the sample portfolio (owner role bypasses RLS).
  for (const t of ["transactions", "holdings", "goals"]) {
    await db.query(`delete from public.${t} where user_id = $1`, [userId]);
  }
  await db.query(`delete from public.accounts where user_id = $1`, [userId]);

  const p = buildSamplePortfolio(userId);

  await db.query(
    `insert into public.profiles (id, full_name, monthly_income)
     values ($1,$2,$3)
     on conflict (id) do update set full_name = excluded.full_name, monthly_income = excluded.monthly_income`,
    [p.profile.id, p.profile.full_name, p.profile.monthly_income],
  );

  await insertRows(db, "accounts", p.accounts);
  await insertRows(db, "holdings", p.holdings);
  await insertRows(db, "goals", p.goals);
  await insertRows(db, "transactions", p.transactions);

  console.log(
    `✓ seeded ${p.accounts.length} accounts, ${p.holdings.length} holdings, ${p.goals.length} goals, ${p.transactions.length} transactions`,
  );
  await db.end();
}

async function insertRows(
  db: pg.Client,
  table: string,
  rows: Record<string, unknown>[],
) {
  if (!rows.length) return;
  const cols = Object.keys(rows[0]);
  const values: unknown[] = [];
  const tuples = rows.map((r, i) => {
    const ph = cols.map((_, j) => `$${i * cols.length + j + 1}`);
    cols.forEach((c) => values.push(r[c]));
    return `(${ph.join(",")})`;
  });
  await db.query(
    `insert into public.${table} (${cols.map((c) => `"${c}"`).join(",")}) values ${tuples.join(",")}`,
    values,
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
