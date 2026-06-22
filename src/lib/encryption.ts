import crypto from "node:crypto";

const ALGORITHM = "aes-256-gcm";
const KEY = crypto
  .createHash("sha256")
  .update(process.env.ENCRYPTION_KEY || "default-secret-key-change-me-in-prod-12345678")
  .digest();

/**
 * Encrypts a plaintext string using AES-256-GCM.
 * Returns format `iv:ciphertext:authTag` in hex format.
 */
export function encrypt(text: string): string {
  if (!text) return text;
  
  // If it's already encrypted format, don't encrypt again
  if (text.split(":").length === 3 && text.length > 50) {
    return text;
  }

  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALGORITHM, KEY, iv);
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  const authTag = cipher.getAuthTag().toString("hex");
  return `${iv.toString("hex")}:${encrypted}:${authTag}`;
}

/**
 * Decrypts a ciphertext string in `iv:ciphertext:authTag` format.
 * Falls back to returning input if not in encrypted format.
 */
export function decrypt(ciphertext: string): string {
  if (!ciphertext) return ciphertext;
  try {
    const parts = ciphertext.split(":");
    if (parts.length !== 3) {
      // Return as is if it doesn't match the encrypted format (legacy plaintext support)
      return ciphertext;
    }
    const [ivHex, encryptedHex, authTagHex] = parts;
    if (ivHex.length !== 24 || authTagHex.length !== 32) {
      // Basic sanity check to avoid parsing non-crypto strings containing colons
      return ciphertext;
    }

    const iv = Buffer.from(ivHex, "hex");
    const authTag = Buffer.from(authTagHex, "hex");
    const decipher = crypto.createDecipheriv(ALGORITHM, KEY, iv);
    decipher.setAuthTag(authTag);
    let decrypted = decipher.update(encryptedHex, "hex", "utf8");
    decrypted += decipher.final("utf8");
    return decrypted;
  } catch (e) {
    // If decryption fails, return legacy plaintext
    return ciphertext;
  }
}

/**
 * Helper to encrypt any JSON-serializable object into a wrapper object:
 * `{ encrypted: "iv:ciphertext:authTag" }`
 */
export function encryptJson(data: unknown): unknown {
  if (!data) return data;
  
  // If already wrapped in encrypted object, return it
  if (typeof data === "object" && data !== null && "encrypted" in data) {
    return data;
  }

  const jsonStr = JSON.stringify(data);
  return { encrypted: encrypt(jsonStr) };
}

/**
 * Helper to decrypt a JSON object wrapped by encryptJson or stored as a raw JSON string.
 */
export function decryptJson(data: unknown): unknown {
  if (!data) return data;

  try {
    // Handle parsed object format: { encrypted: "..." }
    if (typeof data === "object" && data !== null && "encrypted" in data) {
      const obj = data as Record<string, unknown>;
      if (typeof obj.encrypted === "string") {
        const decryptedStr = decrypt(obj.encrypted);
        return JSON.parse(decryptedStr);
      }
    }

    // Handle JSON string format: '{"encrypted":"..."}' or legacy raw JSON string
    if (typeof data === "string") {
      try {
        const parsed = JSON.parse(data) as Record<string, unknown>;
        if (parsed && typeof parsed === "object" && "encrypted" in parsed && typeof parsed.encrypted === "string") {
          const decryptedStr = decrypt(parsed.encrypted);
          return JSON.parse(decryptedStr);
        }
        return parsed;
      } catch {
        // Not a JSON string, return as is
        return data;
      }
    }
  } catch (err) {
    console.error("JSON Decryption failed:", err);
  }

  return data;
}
