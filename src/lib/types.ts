export type AccountKind = "asset" | "liability";

export type Account = {
  id: string;
  name: string;
  institution: string | null;
  kind: AccountKind;
  type: string;
  balance: number;
  apr: number | null;
};

export type Transaction = {
  id: string;
  account_id: string | null;
  posted_at: string;
  description: string;
  category: string;
  amount: number;
};

export type Holding = {
  id: string;
  account_id: string | null;
  symbol: string;
  name: string | null;
  shares: number;
  price: number;
  cost_basis: number;
};

export type Goal = {
  id: string;
  name: string;
  target_amount: number;
  current_amount: number;
  target_date: string | null;
};

export type Profile = {
  id: string;
  full_name: string | null;
  monthly_income: number;
};

export type FinanceSnapshot = {
  profile: Profile | null;
  accounts: Account[];
  transactions: Transaction[];
  holdings: Holding[];
  goals: Goal[];
  totals: {
    assets: number;
    liabilities: number;
    netWorth: number;
    investments: number;
    monthlyIncome: number;
    monthlySpend: number;
  };
};
