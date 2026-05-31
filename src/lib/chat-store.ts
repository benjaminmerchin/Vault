import "server-only";
import crypto from "node:crypto";

// Per-user AES-256-GCM. The key is derived from the user's stable Krava
// identity (their own key) salted with a server secret, so every user's data
// is encrypted under a distinct key — the database only ever stores ciphertext.
const SALT = process.env.CHAT_ENC_KEY ?? "vault-dev-key";

export function deriveUserKey(kravaUserId: string): Buffer {
  return crypto.createHash("sha256").update(`${SALT}:${kravaUserId}`).digest();
}

export function encryptJSON(
  value: unknown,
  key: Buffer,
): { payload: string; iv: string } {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  const data = Buffer.concat([
    cipher.update(Buffer.from(JSON.stringify(value), "utf8")),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();
  return {
    payload: Buffer.concat([data, tag]).toString("base64"),
    iv: iv.toString("base64"),
  };
}

export function decryptJSON<T>(payload: string, iv: string, key: Buffer): T {
  const buf = Buffer.from(payload, "base64");
  const tag = buf.subarray(buf.length - 16);
  const data = buf.subarray(0, buf.length - 16);
  const decipher = crypto.createDecipheriv(
    "aes-256-gcm",
    key,
    Buffer.from(iv, "base64"),
  );
  decipher.setAuthTag(tag);
  const dec = Buffer.concat([decipher.update(data), decipher.final()]);
  return JSON.parse(dec.toString("utf8")) as T;
}
