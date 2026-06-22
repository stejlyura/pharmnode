import crypto from "node:crypto";

/**
 * Hash a password using PBKDF2/SHA-512.
 * Returns a string formatted as "salt:hash".
 */
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, "sha512").toString("hex");
  return `${salt}:${hash}`;
}

/**
 * Verify a password against a stored hashed password.
 */
export function verifyPassword(password: string, storedValue: string): boolean {
  try {
    const [salt, originalHash] = storedValue.split(":");
    if (!salt || !originalHash) return false;
    const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, "sha512").toString("hex");
    return hash === originalHash;
  } catch (e) {
    console.error("Password verification error:", e);
    return false;
  }
}
