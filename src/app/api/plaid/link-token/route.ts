import { NextResponse } from "next/server";
import { Products, CountryCode } from "plaid";
import { plaid } from "@/lib/plaid";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const res = await plaid.linkTokenCreate({
      user: { client_user_id: user.id },
      client_name: "Vault",
      language: "en",
      products: [Products.Transactions],
      additional_consented_products: [Products.Investments, Products.Liabilities],
      country_codes: [CountryCode.Us],
    });
    return NextResponse.json({ link_token: res.data.link_token });
  } catch (e: unknown) {
    const detail =
      (e as { response?: { data?: unknown } })?.response?.data ??
      (e as Error).message;
    return NextResponse.json(
      { error: "Could not create link token", detail },
      { status: 502 },
    );
  }
}
