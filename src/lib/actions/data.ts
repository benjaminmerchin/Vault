"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { buildSamplePortfolio } from "@/lib/sample-data";

/** Insert a rich sample portfolio for the current user (idempotent-ish: clears first). */
export async function loadSampleData(): Promise<{ error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not signed in." };

  // Clear existing rows so this is safe to re-run.
  await Promise.all([
    supabase.from("transactions").delete().eq("user_id", user.id),
    supabase.from("holdings").delete().eq("user_id", user.id),
    supabase.from("goals").delete().eq("user_id", user.id),
  ]);
  await supabase.from("accounts").delete().eq("user_id", user.id);

  const p = buildSamplePortfolio(user.id);

  await supabase
    .from("profiles")
    .upsert({ id: user.id, full_name: p.profile.full_name, monthly_income: p.profile.monthly_income });

  const ins = async (table: string, rows: unknown[]) => {
    if (!rows.length) return null;
    const { error } = await supabase.from(table).insert(rows);
    return error?.message ?? null;
  };

  const e1 = await ins("accounts", p.accounts);
  const e2 = await ins("holdings", p.holdings);
  const e3 = await ins("goals", p.goals);
  const e4 = await ins("transactions", p.transactions);
  const err = e1 || e2 || e3 || e4;
  if (err) return { error: err };

  revalidatePath("/dashboard");
  return {};
}
