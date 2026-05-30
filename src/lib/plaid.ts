import "server-only";
import {
  Configuration,
  PlaidApi,
  PlaidEnvironments,
  type AccountBase,
  type Transaction,
} from "plaid";

const env = (process.env.PLAID_ENV ?? "sandbox") as keyof typeof PlaidEnvironments;

export const plaid = new PlaidApi(
  new Configuration({
    basePath: PlaidEnvironments[env],
    baseOptions: {
      headers: {
        "PLAID-CLIENT-ID": process.env.PLAID_CLIENT_ID,
        "PLAID-SECRET": process.env.PLAID_SECRET,
      },
    },
  }),
);

/** Map a Plaid account to our { kind, type }. */
export function mapAccount(a: AccountBase): { kind: "asset" | "liability"; type: string } {
  const type = a.type as string;
  const sub = (a.subtype ?? "") as string;
  if (type === "depository")
    return { kind: "asset", type: sub === "savings" ? "savings" : "checking" };
  if (type === "investment")
    return {
      kind: "asset",
      type: /401k|ira|roth|retirement|tsp|pension|403b/i.test(sub) ? "retirement" : "brokerage",
    };
  if (type === "credit") return { kind: "liability", type: "credit_card" };
  if (type === "loan")
    return { kind: "liability", type: sub === "mortgage" ? "mortgage" : "loan" };
  return { kind: "asset", type: "cash" };
}

/** Map Plaid's personal-finance category to our display categories. */
export function mapCategory(t: Transaction): string {
  const primary = t.personal_finance_category?.primary ?? "";
  const detailed = t.personal_finance_category?.detailed ?? "";
  switch (primary) {
    case "INCOME":
      return "Income";
    case "TRANSFER_IN":
    case "TRANSFER_OUT":
      return "Transfers";
    case "LOAN_PAYMENTS":
      return "Debt";
    case "RENT_AND_UTILITIES":
      return /RENT|MORTGAGE/.test(detailed) ? "Housing" : "Utilities";
    case "HOME_IMPROVEMENT":
      return "Housing";
    case "FOOD_AND_DRINK":
      return /GROCER/.test(detailed) ? "Groceries" : "Dining";
    case "GENERAL_MERCHANDISE":
      return "Shopping";
    case "TRANSPORTATION":
    case "TRAVEL":
      return "Transport";
    case "ENTERTAINMENT":
      return "Entertainment";
    case "MEDICAL":
    case "PERSONAL_CARE":
      return "Health";
    case "GENERAL_SERVICES":
      return "Subscriptions";
    default:
      return "Other";
  }
}
