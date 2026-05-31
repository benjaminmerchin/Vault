import type { NextRequest } from "next/server";
import { getFinanceSnapshot, buildAdvisorSystem } from "@/lib/finance";
import { getKravaIdentity, streamKravaChat } from "@/lib/krava";
import { deriveUserKey } from "@/lib/chat-store";
import { getMemories } from "@/lib/memory-store";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return new Response("Unauthorized", { status: 401 });

  let body: { message?: unknown; chatId?: unknown };
  try {
    body = await req.json();
  } catch {
    return new Response("Bad request", { status: 400 });
  }
  const message = typeof body.message === "string" ? body.message.trim() : "";
  const chatId = typeof body.chatId === "string" ? body.chatId : undefined;
  if (!message) return new Response("Message required", { status: 400 });

  let kravaUserId: string;
  let userToken: string;
  try {
    ({ userId: kravaUserId, userToken } = await getKravaIdentity(user.id));
  } catch (e) {
    return new Response(
      `Could not provision Krava session: ${(e as Error).message}`,
      { status: 502 },
    );
  }

  const [snap, remembered] = await Promise.all([
    getFinanceSnapshot(),
    getMemories(supabase, user.id, deriveUserKey(kravaUserId)),
  ]);
  let system = snap
    ? buildAdvisorSystem(snap)
    : "You are Vault, a private, privacy-first financial advisor.";
  if (remembered.length) {
    system +=
      `\n\n=== What you remember about this user from past conversations ===\n` +
      remembered.map((m) => `- ${m}`).join("\n") +
      `\nUse these naturally when relevant; don't recite them back unless asked.`;
  }

  const upstream = await streamKravaChat(
    userToken,
    { message, chatId, system },
    req.signal,
  );

  if (!upstream.ok || !upstream.body) {
    const detail = await upstream.text().catch(() => "");
    return new Response(`Advisor upstream error (${upstream.status}) ${detail}`, {
      status: 502,
    });
  }

  // Pipe Krava's SSE straight to the browser.
  return new Response(upstream.body, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
