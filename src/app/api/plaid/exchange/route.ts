import { type NextRequest, NextResponse } from "next/server";
import type { Transaction } from "plaid";
import { plaid, mapAccount, mapCategory } from "@/lib/plaid";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const uuid = () => globalThis.crypto.randomUUID();
const round2 = (n: number) => Math.round(n * 100) / 100;

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = (await req.json().catch(() => ({}))) as {
    public_token?: string;
    institution_name?: string;
  };
  if (!body.public_token)
    return NextResponse.json({ error: "public_token required" }, { status: 400 });

  try {
    // 1) Exchange public_token -> access_token
    const ex = await plaid.itemPublicTokenExchange({
      public_token: body.public_token,
    });
    const accessToken = ex.data.access_token;
    const itemId = ex.data.item_id;
    const institution = body.institution_name ?? "Connected bank";

    // 2) Accounts
    const acctRes = await plaid.accountsGet({ access_token: accessToken });
    const plaidAccounts = acctRes.data.accounts;

    // 3) Transactions (sync, retry while the product warms up in sandbox)
    const added: Transaction[] = [];
    let cursor: string | undefined = undefined;
    for (let tries = 0; ; ) {
      try {
        const sync = await plaid.transactionsSync({
          access_token: accessToken,
          cursor,
          count: 500,
        });
        added.push(...sync.data.added);
        cursor = sync.data.next_cursor;
        if (!sync.data.has_more) break;
      } catch (e: unknown) {
        const code = (e as { response?: { data?: { error_code?: string } } })
          ?.response?.data?.error_code;
        if (code === "PRODUCT_NOT_READY" && tries++ < 6) {
          await sleep(1500);
          continue;
        }
        break; // give up on transactions; accounts still useful
      }
    }

    // 4) Investment holdings (optional)
    type H = {
      plaidAccountId: string;
      symbol: string;
      name: string | null;
      shares: number;
      price: number;
      cost_basis: number;
    };
    let holdingsRaw: H[] = [];
    try {
      const h = await plaid.investmentsHoldingsGet({ access_token: accessToken });
      const sec = new Map(h.data.securities.map((s) => [s.security_id, s]));
      holdingsRaw = h.data.holdings.map((p) => {
        const s = sec.get(p.security_id);
        return {
          plaidAccountId: p.account_id,
          symbol: s?.ticker_symbol || s?.name?.slice(0, 8) || "—",
          name: s?.name ?? null,
          shares: p.quantity,
          price: p.institution_price,
          cost_basis: p.cost_basis ?? 0,
        };
      });
    } catch {
      /* investments not available for this item */
    }

    // 5) Map to our schema
    const acctMap = new Map<string, string>();
    const accountRows = plaidAccounts.map((a) => {
      const id = uuid();
      acctMap.set(a.account_id, id);
      const { kind, type } = mapAccount(a);
      return {
        id,
        user_id: user.id,
        name: a.name || a.official_name || "Account",
        institution,
        kind,
        type,
        balance: round2(Math.abs(a.balances.current ?? a.balances.available ?? 0)),
        apr: null as number | null,
      };
    });

    const txRows = added
      .slice(0, 300)
      .map((t) => ({
        id: uuid(),
        user_id: user.id,
        account_id: acctMap.get(t.account_id) ?? null,
        posted_at: t.date,
        description: t.merchant_name || t.name || "Transaction",
        category: mapCategory(t),
        amount: round2(-t.amount), // Plaid: +amount = money out; we use -outflow
      }));

    const holdingRows = holdingsRaw.map((h) => ({
      id: uuid(),
      user_id: user.id,
      account_id: acctMap.get(h.plaidAccountId) ?? null,
      symbol: h.symbol,
      name: h.name,
      shares: round2(h.shares),
      price: round2(h.price),
      cost_basis: round2(h.cost_basis),
    }));

    // 6) Persist: store the item, then replace finance rows with the connected bank's data
    await supabase.from("plaid_items").insert({
      user_id: user.id,
      item_id: itemId,
      access_token: accessToken,
      institution_name: institution,
      cursor: cursor ?? null,
    });

    await supabase.from("transactions").delete().eq("user_id", user.id);
    await supabase.from("holdings").delete().eq("user_id", user.id);
    await supabase.from("accounts").delete().eq("user_id", user.id);

    if (accountRows.length) await supabase.from("accounts").insert(accountRows);
    if (txRows.length) await supabase.from("transactions").insert(txRows);
    if (holdingRows.length) await supabase.from("holdings").insert(holdingRows);

    return NextResponse.json({
      ok: true,
      institution,
      accounts: accountRows.length,
      transactions: txRows.length,
      holdings: holdingRows.length,
    });
  } catch (e: unknown) {
    const detail =
      (e as { response?: { data?: unknown } })?.response?.data ??
      (e as Error).message;
    return NextResponse.json(
      { error: "Could not connect bank", detail },
      { status: 502 },
    );
  }
}
