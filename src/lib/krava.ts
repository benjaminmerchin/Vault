import "server-only";
import { createKravaPlatformClient } from "@kravalabs/api-client";

const BASE_URL = process.env.KRAVA_BASE_URL ?? "https://krava.io";

const platform = createKravaPlatformClient({
  baseUrl: BASE_URL,
  appKey: process.env.KRAVA_APP_KEY,
});

/**
 * Map our Supabase user id -> an encrypted Krava userToken.
 * getOrCreate creates the user on first call and returns the same identity
 * (with a fresh token) on subsequent calls. Server-side only — uses appKey.
 */
export async function getKravaUserToken(externalUserId: string): Promise<string> {
  const { userToken } = await platform.users.getOrCreate(externalUserId);
  return userToken;
}

/**
 * Returns the user's stable Krava identity (userId never changes) plus a fresh
 * userToken. The userId is what we derive the per-user encryption key from.
 */
export async function getKravaIdentity(
  externalUserId: string,
): Promise<{ userId: string; userToken: string }> {
  const { userId, userToken } = await platform.users.getOrCreate(externalUserId);
  return { userId, userToken };
}

export type KravaChatInput = {
  message: string;
  chatId?: string;
  system?: string;
};

/**
 * POST /api/platform/chat with the user's token. Returns the raw streaming
 * Response (SSE) so callers can pipe it straight to the browser. Messages are
 * AES-256-GCM encrypted at rest; even Krava can't read them.
 */
export async function streamKravaChat(
  userToken: string,
  input: KravaChatInput,
  signal?: AbortSignal,
): Promise<Response> {
  return fetch(`${BASE_URL}/api/platform/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${userToken}`,
    },
    body: JSON.stringify({
      message: input.message,
      chatId: input.chatId,
      system: input.system,
    }),
    signal,
  });
}

/** Run a Krava chat and accumulate the full text (non-streaming use, e.g. memory extraction). */
export async function collectKravaChat(
  userToken: string,
  input: KravaChatInput,
): Promise<string> {
  const res = await streamKravaChat(userToken, input);
  if (!res.ok || !res.body) return "";
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buf = "";
  let out = "";
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buf += decoder.decode(value, { stream: true });
    const lines = buf.split("\n");
    buf = lines.pop() ?? "";
    for (const line of lines) {
      if (!line.startsWith("data: ")) continue;
      const p = line.slice(6).trim();
      if (p === "[DONE]") continue;
      try {
        const e = JSON.parse(p);
        if (e.text) out += e.text;
      } catch {
        /* ignore */
      }
    }
  }
  return out;
}
