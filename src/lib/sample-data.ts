// Deterministic sample portfolio. Used by the demo seed script and by the
// "Load sample portfolio" action so any new user can get a rich dashboard.

type Row = Record<string, unknown>;

export type SamplePortfolio = {
  profile: { id: string; full_name: string; monthly_income: number };
  accounts: Row[];
  holdings: Row[];
  goals: Row[];
  transactions: Row[];
};

// Small deterministic PRNG so re-seeds produce stable data.
function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const uuid = () => globalThis.crypto.randomUUID();
const iso = (d: Date) => d.toISOString().slice(0, 10);

export function buildSamplePortfolio(userId: string): SamplePortfolio {
  const rand = mulberry32(0x7a17ed);
  const now = new Date();

  const checking = {
    id: uuid(),
    user_id: userId,
    name: "Everyday Checking",
    institution: "Chase",
    kind: "asset",
    type: "checking",
    balance: 8210.42,
    apr: null,
  };
  const savings = {
    id: uuid(),
    user_id: userId,
    name: "High-Yield Savings",
    institution: "Ally",
    kind: "asset",
    type: "savings",
    balance: 54000,
    apr: null,
  };
  const brokerage = {
    id: uuid(),
    user_id: userId,
    name: "Taxable Brokerage",
    institution: "Fidelity",
    kind: "asset",
    type: "brokerage",
    balance: 0, // set from holdings below
    apr: null,
  };
  const retirement = {
    id: uuid(),
    user_id: userId,
    name: "401(k)",
    institution: "Vanguard",
    kind: "asset",
    type: "retirement",
    balance: 71400,
    apr: null,
  };
  const amex = {
    id: uuid(),
    user_id: userId,
    name: "Amex Gold",
    institution: "American Express",
    kind: "liability",
    type: "credit_card",
    balance: 2140.18,
    apr: 22.9,
  };
  const studentLoan = {
    id: uuid(),
    user_id: userId,
    name: "Student Loan",
    institution: "SoFi",
    kind: "liability",
    type: "loan",
    balance: 18400,
    apr: 5.2,
  };
  const autoLoan = {
    id: uuid(),
    user_id: userId,
    name: "Auto Loan",
    institution: "Capital One",
    kind: "liability",
    type: "loan",
    balance: 11300,
    apr: 6.4,
  };

  const holdingsRaw = [
    { symbol: "VOO", name: "Vanguard S&P 500 ETF", shares: 42, price: 512.3, cost_basis: 16800 },
    { symbol: "AAPL", name: "Apple Inc.", shares: 60, price: 232.15, cost_basis: 9500 },
    { symbol: "NVDA", name: "NVIDIA Corp.", shares: 25, price: 134.8, cost_basis: 2050 },
    { symbol: "VXUS", name: "Vanguard Total Intl Stock", shares: 80, price: 62.4, cost_basis: 4600 },
    { symbol: "MSFT", name: "Microsoft Corp.", shares: 14, price: 438.9, cost_basis: 4100 },
  ];
  const holdings = holdingsRaw.map((h) => ({
    id: uuid(),
    user_id: userId,
    account_id: brokerage.id,
    ...h,
  }));
  brokerage.balance = Number(
    holdings.reduce((s, h) => s + h.shares * h.price, 0).toFixed(2),
  );

  const accounts = [checking, savings, brokerage, retirement, amex, studentLoan, autoLoan];

  const goals = [
    {
      id: uuid(),
      user_id: userId,
      name: "Emergency Fund",
      target_amount: 30000,
      current_amount: 24500,
      target_date: iso(new Date(now.getFullYear(), 11, 31)),
    },
    {
      id: uuid(),
      user_id: userId,
      name: "House Down Payment",
      target_amount: 80000,
      current_amount: 28000,
      target_date: iso(new Date(now.getFullYear() + 2, 5, 1)),
    },
    {
      id: uuid(),
      user_id: userId,
      name: "Japan Trip",
      target_amount: 6000,
      current_amount: 1850,
      target_date: iso(new Date(now.getFullYear() + 1, 2, 15)),
    },
  ];

  // ---- transactions: ~3 months, recurring + variable ----
  const tx: Row[] = [];
  const push = (
    daysAgo: number,
    description: string,
    category: string,
    amount: number,
    account_id = checking.id,
  ) => {
    const d = new Date(now);
    d.setDate(d.getDate() - daysAgo);
    tx.push({
      id: uuid(),
      user_id: userId,
      account_id,
      posted_at: iso(d),
      description,
      category,
      amount: Number(amount.toFixed(2)),
    });
  };
  const jitter = (base: number, pct = 0.18) =>
    base * (1 + (rand() - 0.5) * 2 * pct);

  for (let m = 0; m < 3; m++) {
    const base = m * 30;
    // income — biweekly paychecks
    push(base + 1, "Paycheck — Northwind Labs", "Income", 4380);
    push(base + 15, "Paycheck — Northwind Labs", "Income", 4380);
    // fixed
    push(base + 1, "Rent — Sunset Apartments", "Housing", -2400);
    push(base + 3, "PG&E Electric", "Utilities", -jitter(98));
    push(base + 4, "Comcast Internet", "Utilities", -79.99);
    push(base + 2, "Spotify", "Subscriptions", -11.99);
    push(base + 6, "Netflix", "Subscriptions", -22.99);
    push(base + 9, "iCloud + ChatGPT", "Subscriptions", -32.0);
    push(base + 5, "Equinox", "Health", -215);
    push(base + 16, "Transfer → Savings", "Transfers", -1500, checking.id);
    push(base + 12, "Student Loan Payment", "Debt", -240);
    push(base + 18, "Auto Loan Payment", "Debt", -310);
    push(base + 20, "Amex Payment", "Debt", -400);
    // groceries weekly
    for (let w = 0; w < 4; w++)
      push(base + 2 + w * 7, w % 2 ? "Whole Foods" : "Trader Joe's", "Groceries", -jitter(132));
    // dining a few times
    const diners = ["Tartine", "Sushi Ran", "Blue Bottle", "Tacos El Farolito", "Philz Coffee"];
    for (let i = 0; i < 5; i++)
      push(base + 3 + i * 5, diners[i], "Dining", -jitter(i % 2 ? 19 : 64));
    // transport
    push(base + 7, "Uber", "Transport", -jitter(24));
    push(base + 13, "Shell Gas", "Transport", -jitter(52));
    push(base + 22, "Clipper Transit", "Transport", -30);
    // shopping / fun (varies)
    push(base + 10, "Amazon", "Shopping", -jitter(86));
    if (m === 0) push(8, "Apple Store — AirPods", "Shopping", -179);
    push(base + 17, "AMC Theatres", "Entertainment", -jitter(38));
    push(base + 25, "REI", "Shopping", -jitter(120));
  }

  return {
    profile: { id: userId, full_name: "Alex Rivera", monthly_income: 8760 },
    accounts,
    holdings,
    goals,
    transactions: tx,
  };
}
