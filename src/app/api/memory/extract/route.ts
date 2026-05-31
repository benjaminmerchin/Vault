import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getKravaIdentity, collectKravaChat } from "@/lib/krava";
import { deriveUserKey } from "@/lib/chat-store";
import { getMemories, saveMemories } from "@/lib/memory-store";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type Msg = { role: string; text: string };

const EXTRACT_SYSTEM = `You extract durable facts a USER revealed about themselves, for a financial advisor's long-term memory.
Return ONLY a JSON array of short strings — goals, plans, timelines, risk tolerance, preferences, life events, constraints.
Phrase each as a concise user fact, e.g. ["Plans to retire at 50","Prefers low-risk index funds","Wants to buy a home in 2 years"].
Ignore one-off questions, pleasantries, and anything already in their account data.
Return [] if the user revealed nothing durable.`;

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { userId: kravaUserId, userToken } = await getKravaIdentity(user.id);
  const key = deriveUserKey(kravaUserId);

  const body = (await req.json().catch(() => ({}))) as { messages?: Msg[] };
  const msgs = Array.isArray(body.messages) ? body.messages.slice(-8) : [];
  // Extract from what the USER said only — the advisor's reply just adds noise.
  const userText = msgs
    .filter((m) => m.role === "user")
    .map((m) => m.text)
    .join("\n")
    .trim();
  if (!userText)
    return NextResponse.json({ remembered: await getMemories(supabase, user.id, key) });

  let extracted: string[] = [];
  try {
    const text = await collectKravaChat(userToken, {
      system: EXTRACT_SYSTEM,
      message: `User said:\n${userText}`,
    });
    const match = text.match(/\[[\s\S]*\]/);
    if (match) {
      const arr = JSON.parse(match[0]);
      if (Array.isArray(arr))
        extracted = arr
          .filter((x) => typeof x === "string")
          .map((s: string) => s.trim())
          .filter(Boolean)
          .slice(0, 8);
    }
  } catch {
    /* extraction is best-effort */
  }

  const existing = await getMemories(supabase, user.id, key);
  const seen = new Set(existing.map((m) => m.toLowerCase()));
  const merged = [...existing];
  for (const e of extracted) {
    if (!seen.has(e.toLowerCase())) {
      seen.add(e.toLowerCase());
      merged.push(e);
    }
  }
  const capped = merged.slice(-40);
  if (capped.length !== existing.length)
    await saveMemories(supabase, user.id, key, capped);

  return NextResponse.json({ remembered: capped });
}
