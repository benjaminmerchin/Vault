import "server-only";
import crypto from "node:crypto";

// AES-256-GCM. The key is derived from CHAT_ENC_KEY so the value can be any
// string; the database only ever stores the resulting ciphertext.
const key = crypto
  .createHash("sha256")
  .update(process.env.CHAT_ENC_KEY ?? "vault-dev-key")
  .digest();

export function encryptJSON(value: unknown): { payload: string; iv: string } {
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

export function decryptJSON<T>(payload: string, iv: string): T {
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
