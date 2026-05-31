import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getFinanceSnapshot, buildMemoryFacts } from "@/lib/finance";
import { getKravaIdentity } from "@/lib/krava";
import { deriveUserKey } from "@/lib/chat-store";
import { getMemories } from "@/lib/memory-store";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [snap, remembered] = await Promise.all([
    getFinanceSnapshot(),
    (async () => {
      const { userId: kravaUserId } = await getKravaIdentity(user.id);
      return getMemories(supabase, user.id, deriveUserKey(kravaUserId));
    })(),
  ]);

  return NextResponse.json({
    remembered,
    facts: snap ? buildMemoryFacts(snap) : [],
  });
}

export async function DELETE() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await supabase.from("advisor_memories").delete().eq("user_id", user.id);
  return NextResponse.json({ ok: true });
}
