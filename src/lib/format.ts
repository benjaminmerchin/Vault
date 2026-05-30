export function fmtMoney(n: number, opts: { cents?: boolean; sign?: boolean } = {}) {
  const s = n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: opts.cents ? 2 : 0,
    maximumFractionDigits: opts.cents ? 2 : 0,
  });
  if (opts.sign && n > 0) return `+${s}`;
  return s;
}

export function fmtCompact(n: number) {
  return n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    notation: "compact",
    maximumFractionDigits: 1,
  });
}

export function fmtPct(n: number, digits = 1) {
  return `${n >= 0 ? "+" : ""}${n.toFixed(digits)}%`;
}

export function fmtDate(d: string | Date) {
  const date = typeof d === "string" ? new Date(d + "T00:00:00") : d;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

// Stable color assignment for spending categories, mapped to --chart-N.
const CATEGORY_ORDER = [
  "Housing",
  "Groceries",
  "Dining",
  "Transport",
  "Shopping",
  "Subscriptions",
  "Utilities",
  "Health",
  "Entertainment",
  "Debt",
  "Transfers",
  "Other",
];

export function categoryColor(category: string) {
  const i = CATEGORY_ORDER.indexOf(category);
  const idx = (i < 0 ? CATEGORY_ORDER.length : i) % 8;
  return `var(--chart-${idx + 1})`;
}

export const CATEGORY_RANK = (c: string) => {
  const i = CATEGORY_ORDER.indexOf(c);
  return i < 0 ? 999 : i;
};
