import {
  ArrowDownRight,
  ArrowUpRight,
  Banknote,
  CreditCard,
  Landmark,
  LineChart as LineChartIcon,
  PiggyBank,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { getFinanceSnapshot } from "@/lib/finance";
import type { Account } from "@/lib/types";
import { fmtMoney, fmtPct, fmtDate, categoryColor } from "@/lib/format";
import { NetWorthChart } from "@/components/dashboard/networth-chart";
import { SpendingChart, type SpendSlice } from "@/components/dashboard/spending-chart";
import { LoadSampleButton } from "@/components/dashboard/load-sample-button";
import { ConnectBankButton } from "@/components/dashboard/connect-bank-button";
import { NumberTicker } from "@/components/ui/number-ticker";
import { PrivacyPill } from "@/components/privacy-pill";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

export const dynamic = "force-dynamic";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function trendSeries(netWorth: number) {
  const factors = [0.9, 0.927, 0.951, 0.969, 0.987, 1];
  const now = new Date();
  return factors.map((f, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    return { month: MONTHS[d.getMonth()], value: Math.round(netWorth * f) };
  });
}

const ACCOUNT_ICON: Record<string, React.ComponentType<{ className?: string }>> = {
  checking: Wallet,
  savings: PiggyBank,
  brokerage: TrendingUp,
  retirement: Landmark,
  credit_card: CreditCard,
  loan: Banknote,
  mortgage: Landmark,
};

export default async function DashboardPage() {
  const snap = await getFinanceSnapshot();

  if (!snap || snap.accounts.length === 0) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
        <div className="rounded-2xl border border-border bg-card p-10">
          <h1 className="text-2xl font-semibold tracking-tight">
            Your vault is empty
          </h1>
          <p className="mx-auto mt-2 max-w-sm text-muted-foreground">
            Connect a bank with Plaid to pull in your real accounts — or load a
            realistic sample portfolio to explore Vault and its private advisor.
          </p>
          <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <ConnectBankButton label="Connect a bank" size="lg" />
            <LoadSampleButton label="Load sample data" size="lg" variant="outline" />
          </div>
        </div>
      </div>
    );
  }

  const { totals, accounts, holdings, goals, transactions, profile } = snap;
  const firstName = profile?.full_name?.split(" ")[0] ?? "there";

  const trend = trendSeries(totals.netWorth);
  const delta = trend[0].value
    ? ((trend[trend.length - 1].value - trend[0].value) / trend[0].value) * 100
    : 0;

  // --- spending by category (last 30 days, excluding income & transfers) ---
  const since = new Date();
  since.setDate(since.getDate() - 30);
  const spendByCat = new Map<string, number>();
  for (const t of transactions) {
    if (t.amount >= 0) continue;
    if (t.category === "Transfers" || t.category === "Income") continue;
    if (new Date(t.posted_at + "T00:00:00") < since) continue;
    spendByCat.set(t.category, (spendByCat.get(t.category) ?? 0) + Math.abs(t.amount));
  }
  const ranked = [...spendByCat.entries()].sort((a, b) => b[1] - a[1]);
  const top = ranked.slice(0, 7);
  const otherTotal = ranked.slice(7).reduce((s, [, v]) => s + v, 0);
  const slices: SpendSlice[] = [
    ...top.map(([category, amount]) => ({ category, amount: Math.round(amount), fill: categoryColor(category) })),
    ...(otherTotal > 0 ? [{ category: "Other", amount: Math.round(otherTotal), fill: categoryColor("Other") }] : []),
  ];
  const spendTotal = slices.reduce((s, d) => s + d.amount, 0);

  const assetAccounts = accounts.filter((a) => a.kind === "asset");
  const liabilityAccounts = accounts.filter((a) => a.kind === "liability");
  const recentTx = transactions.slice(0, 12);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">Welcome back, {firstName}</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight">Your money, privately</h1>
        </div>
        <div className="flex items-center gap-3">
          <ConnectBankButton variant="outline" size="sm" />
          <PrivacyPill icon="shield">Private vault</PrivacyPill>
        </div>
      </div>

      {/* Top row: net worth + spending */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-start justify-between space-y-0">
            <div>
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Net worth
              </CardTitle>
              <div className="mt-1 flex items-baseline gap-3">
                <span className="flex items-baseline text-4xl font-semibold tracking-tight">
                  <span className="text-muted-foreground">$</span>
                  <NumberTicker
                    value={Math.round(totals.netWorth)}
                    className="text-foreground"
                  />
                </span>
                <Badge
                  variant="secondary"
                  className={
                    delta >= 0
                      ? "bg-primary/15 text-primary"
                      : "bg-destructive/15 text-destructive"
                  }
                >
                  {delta >= 0 ? <ArrowUpRight className="size-3.5" /> : <ArrowDownRight className="size-3.5" />}
                  {fmtPct(delta)} · 6mo
                </Badge>
              </div>
            </div>
            <LineChartIcon className="size-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <NetWorthChart data={trend} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Spending
            </CardTitle>
          </CardHeader>
          <CardContent>
            {slices.length ? (
              <>
                <SpendingChart data={slices} total={spendTotal} />
                <div className="mt-4 space-y-1.5">
                  {slices.slice(0, 5).map((s) => (
                    <div key={s.category} className="flex items-center gap-2 text-sm">
                      <span className="size-2.5 rounded-full" style={{ background: s.fill }} />
                      <span className="flex-1 text-muted-foreground">{s.category}</span>
                      <span className="font-medium">{fmtMoney(s.amount)}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <p className="py-10 text-center text-sm text-muted-foreground">
                No spending in the last 30 days.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Stat tiles */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile label="Assets" value={fmtMoney(totals.assets)} icon={Wallet} />
        <StatTile label="Liabilities" value={fmtMoney(totals.liabilities)} icon={CreditCard} tone="warn" />
        <StatTile label="Investments" value={fmtMoney(totals.investments)} icon={TrendingUp} />
        <StatTile label="Spend · 30d" value={fmtMoney(spendTotal)} icon={Banknote} />
      </div>

      {/* Accounts + side column */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Accounts</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <AccountGroup title="Assets" accounts={assetAccounts} />
            {liabilityAccounts.length > 0 && (
              <AccountGroup title="Liabilities" accounts={liabilityAccounts} negative />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Goals</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            {goals.length === 0 && (
              <p className="text-sm text-muted-foreground">No goals yet.</p>
            )}
            {goals.map((g) => {
              const pct = Math.min(100, Math.round((g.current_amount / g.target_amount) * 100));
              return (
                <div key={g.id}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{g.name}</span>
                    <span className="text-muted-foreground">{pct}%</span>
                  </div>
                  <Progress value={pct} className="mt-2" />
                  <div className="mt-1.5 flex justify-between text-xs text-muted-foreground">
                    <span>{fmtMoney(g.current_amount)}</span>
                    <span>{fmtMoney(g.target_amount)}</span>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>

      {/* Holdings + transactions */}
      <div className="grid gap-6 lg:grid-cols-3">
        {holdings.length > 0 && (
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Holdings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {holdings.map((h) => {
                const mv = h.shares * h.price;
                const gain = mv - h.cost_basis;
                const gainPct = h.cost_basis ? (gain / h.cost_basis) * 100 : 0;
                return (
                  <div key={h.id} className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{h.symbol}</div>
                      <div className="text-xs text-muted-foreground">
                        {h.shares} sh · {fmtMoney(h.price, { cents: true })}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{fmtMoney(mv)}</div>
                      <div className={gain >= 0 ? "text-xs text-primary" : "text-xs text-destructive"}>
                        {fmtPct(gainPct)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        )}

        <Card className={holdings.length > 0 ? "lg:col-span-2" : "lg:col-span-3"}>
          <CardHeader>
            <CardTitle>Recent activity</CardTitle>
          </CardHeader>
          <CardContent className="divide-y divide-border">
            {recentTx.map((t) => (
              <div key={t.id} className="flex items-center justify-between py-2.5">
                <div className="flex items-center gap-3">
                  <span
                    className="size-2 rounded-full"
                    style={{ background: categoryColor(t.category) }}
                  />
                  <div>
                    <div className="text-sm font-medium">{t.description}</div>
                    <div className="text-xs text-muted-foreground">
                      {fmtDate(t.posted_at)} · {t.category}
                    </div>
                  </div>
                </div>
                <span
                  className={
                    t.amount >= 0
                      ? "text-sm font-medium text-primary"
                      : "text-sm font-medium"
                  }
                >
                  {t.amount >= 0 ? fmtMoney(t.amount, { sign: true }) : fmtMoney(t.amount)}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatTile({
  label,
  value,
  icon: Icon,
  tone,
}: {
  label: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  tone?: "warn";
}) {
  return (
    <Card>
      <CardContent className="flex items-center justify-between py-5">
        <div>
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="mt-1 text-2xl font-semibold tracking-tight">{value}</p>
        </div>
        <span
          className={`flex size-10 items-center justify-center rounded-xl ${
            tone === "warn" ? "bg-destructive/10 text-destructive" : "bg-primary/10 text-primary"
          }`}
        >
          <Icon className="size-5" />
        </span>
      </CardContent>
    </Card>
  );
}

function AccountGroup({
  title,
  accounts,
  negative,
}: {
  title: string;
  accounts: Account[];
  negative?: boolean;
}) {
  return (
    <div>
      <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {title}
      </p>
      <div className="space-y-1">
        {accounts.map((a) => {
          const Icon = ACCOUNT_ICON[a.type] ?? Wallet;
          return (
            <div
              key={a.id}
              className="flex items-center justify-between rounded-xl px-2 py-2.5 transition hover:bg-secondary/50"
            >
              <div className="flex items-center gap-3">
                <span className="flex size-9 items-center justify-center rounded-lg bg-secondary text-muted-foreground">
                  <Icon className="size-[18px]" />
                </span>
                <div>
                  <div className="text-sm font-medium">{a.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {a.institution}
                    {a.apr ? ` · ${a.apr}% APR` : ""}
                  </div>
                </div>
              </div>
              <span className={`font-medium ${negative ? "text-destructive" : ""}`}>
                {negative ? `−${fmtMoney(a.balance)}` : fmtMoney(a.balance)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
