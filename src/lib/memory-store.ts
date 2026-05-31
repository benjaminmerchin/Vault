import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { encryptJSON, decryptJSON } from "@/lib/chat-store";

/** The advisor's long-term memory across all chats — an encrypted list of facts. */
export async function getMemories(
  supabase: SupabaseClient,
  userId: string,
  key: Buffer,
): Promise<string[]> {
  const { data } = await supabase
    .from("advisor_memories")
    .select("payload, iv")
    .eq("user_id", userId)
    .maybeSingle();
  if (!data) return [];
  try {
    const list = decryptJSON<string[]>(data.payload, data.iv, key);
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

export async function saveMemories(
  supabase: SupabaseClient,
  userId: string,
  key: Buffer,
  list: string[],
): Promise<void> {
  const { payload, iv } = encryptJSON(list, key);
  await supabase.from("advisor_memories").upsert({
    user_id: userId,
    payload,
    iv,
    updated_at: new Date().toISOString(),
  });
}
