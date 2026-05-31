import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getFinanceSnapshot, buildMemoryFacts } from "@/lib/finance";
import { getKravaUserToken } from "@/lib/krava";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const BASE = process.env.KRAVA_BASE_URL ?? "https://krava.io";

type KravaMemory = { id: string; content: string; contentType: string; createdAt: string };

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Run the local snapshot and the Krava memory round-trip in parallel.
  const [snap, krava] = await Promise.all([
    getFinanceSnapshot(),
    (async (): Promise<{ memories: KravaMemory[]; note?: string }> => {
      try {
        const token = await getKravaUserToken(user.id);
        const res = await fetch(`${BASE}/api/memory?limit=50`, {
          headers: { "x-privy-token": token },
        });
        if (res.ok) {
          const d = (await res.json()) as { memories?: KravaMemory[]; message?: string };
          return { memories: Array.isArray(d.memories) ? d.memories : [], note: d.message };
        }
      } catch {
        /* memory is best-effort */
      }
      return { memories: [] };
    })(),
  ]);

  return NextResponse.json({
    facts: snap ? buildMemoryFacts(snap) : [],
    memories: krava.memories,
    note: krava.note,
  });
}
