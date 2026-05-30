import "server-only";
import { createClient } from "@/lib/supabase/server";
import type {
  Account,
  FinanceSnapshot,
  Goal,
  Holding,
  Profile,
  Transaction,
} from "@/lib/types";

const num = (v: unknown) => Number(v ?? 0);

/** Load the signed-in user's full financial picture (RLS-scoped). */
export async function getFinanceSnapshot(): Promise<FinanceSnapshot | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const [profileRes, accountsRes, txRes, holdingsRes, goalsRes] =
    await Promise.all([
      supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
      supabase.from("accounts").select("*").order("balance", { ascending: false }),
      supabase
        .from("transactions")
        .select("*")
        .order("posted_at", { ascending: false })
        .limit(300),
      supabase.from("holdings").select("*"),
      supabase.from("goals").select("*"),
    ]);

  const profile = (profileRes.data as Profile | null) ?? null;
  const accounts = ((accountsRes.data as Account[]) ?? []).map((a) => ({
    ...a,
    balance: num(a.balance),
    apr: a.apr == null ? null : num(a.apr),
  }));
  const transactions = ((txRes.data as Transaction[]) ?? []).map((t) => ({
    ...t,
    amount: num(t.amount),
  }));
  const holdings = ((holdingsRes.data as Holding[]) ?? []).map((h) => ({
    ...h,
    shares: num(h.shares),
    price: num(h.price),
    cost_basis: num(h.cost_basis),
  }));
  const goals = ((goalsRes.data as Goal[]) ?? []).map((g) => ({
    ...g,
    target_amount: num(g.target_amount),
    current_amount: num(g.current_amount),
  }));

  const assets = accounts
    .filter((a) => a.kind === "asset")
    .reduce((s, a) => s + a.balance, 0);
  const liabilities = accounts
    .filter((a) => a.kind === "liability")
    .reduce((s, a) => s + a.balance, 0);
  const investments = holdings.reduce((s, h) => s + h.shares * h.price, 0);

  const since = new Date();
  since.setDate(since.getDate() - 30);
  const monthlySpend = transactions
    .filter((t) => t.amount < 0 && new Date(t.posted_at) >= since)
    .reduce((s, t) => s + Math.abs(t.amount), 0);

  return {
    profile,
    accounts,
    transactions,
    holdings,
    goals,
    totals: {
      assets,
      liabilities,
      netWorth: assets - liabilities,
      investments,
      monthlyIncome: num(profile?.monthly_income),
      monthlySpend,
    },
  };
}

const money = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

/** Build the advisor's system prompt with the user's private financial context. */
export function buildAdvisorSystem(snap: FinanceSnapshot): string {
  const { totals, accounts, holdings, goals, transactions } = snap;
  const name = snap.profile?.full_name?.split(" ")[0] ?? "there";

  const accountLines = accounts
    .map(
      (a) =>
        `- ${a.name} (${a.type}${a.kind === "liability" ? ", debt" : ""}): ${money(
          a.balance,
        )}${a.apr ? ` @ ${a.apr}% APR` : ""}`,
    )
    .join("\n");

  const holdingLines = holdings.length
    ? holdings
        .map(
          (h) =>
            `- ${h.symbol} ${h.shares} sh @ ${money(h.price)} = ${money(
              h.shares * h.price,
            )} (cost ${money(h.cost_basis)})`,
        )
        .join("\n")
    : "- (none)";

  const goalLines = goals.length
    ? goals
        .map(
          (g) =>
            `- ${g.name}: ${money(g.current_amount)} / ${money(g.target_amount)}${
              g.target_date ? ` by ${g.target_date}` : ""
            }`,
        )
        .join("\n")
    : "- (none)";

  // Spend by category over the loaded window
  const byCat = new Map<string, number>();
  for (const t of transactions) {
    if (t.amount < 0) byCat.set(t.category, (byCat.get(t.category) ?? 0) + Math.abs(t.amount));
  }
  const topCats = [...byCat.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([c, v]) => `- ${c}: ${money(v)}`)
    .join("\n");

  return `You are Vault, ${name}'s private financial advisor.

You run on Krava's privacy infrastructure: this conversation is end-to-end encrypted (AES-256-GCM), the underlying model is zero-retention, and ${name}'s identity is anonymized from the model provider. Reassure the user about this only if they ask — otherwise just be a genuinely useful advisor.

Always respond in English. Be concrete, warm, and concise. Use the numbers below. Give specific, actionable guidance (debt payoff order, savings rate, goal pacing, spending patterns). Use plain language and short paragraphs or tight bullet lists. Never invent accounts or numbers that aren't here. You are not a licensed fiduciary; add a one-line disclaimer only when giving investment-specific recommendations.

=== ${name}'s finances (live snapshot, private) ===
Net worth: ${money(totals.netWorth)}  (assets ${money(totals.assets)} − liabilities ${money(
    totals.liabilities,
  )})
Investments (market value): ${money(totals.investments)}
Monthly income: ${money(totals.monthlyIncome)}
Spend (last 30d): ${money(totals.monthlySpend)}

Accounts:
${accountLines || "- (none)"}

Holdings:
${holdingLines}

Goals:
${goalLines}

Top spending categories (recent):
${topCats || "- (none)"}
`;
}
