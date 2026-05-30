import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { encryptJSON, decryptJSON } from "@/lib/chat-store";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type Msg = { role: "user" | "assistant"; text: string };

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return { supabase, user };
}

export async function GET() {
  const { supabase, user } = await requireUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data } = await supabase
    .from("advisor_chats")
    .select("chat_id, payload, iv")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!data) return NextResponse.json({ chatId: null, messages: [] });
  try {
    const messages = decryptJSON<Msg[]>(data.payload, data.iv);
    return NextResponse.json({ chatId: data.chat_id ?? null, messages });
  } catch {
    return NextResponse.json({ chatId: null, messages: [] });
  }
}

export async function POST(req: NextRequest) {
  const { supabase, user } = await requireUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = (await req.json().catch(() => ({}))) as {
    chatId?: unknown;
    messages?: unknown;
  };
  const messages = Array.isArray(body.messages) ? (body.messages as Msg[]) : [];
  const chatId = typeof body.chatId === "string" ? body.chatId : null;

  const { payload, iv } = encryptJSON(messages);
  const { error } = await supabase.from("advisor_chats").upsert({
    user_id: user.id,
    chat_id: chatId,
    payload,
    iv,
    updated_at: new Date().toISOString(),
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

export async function DELETE() {
  const { supabase, user } = await requireUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await supabase.from("advisor_chats").delete().eq("user_id", user.id);
  return NextResponse.json({ ok: true });
}
