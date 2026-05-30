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
