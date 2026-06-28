import crypto from "node:crypto";
import bcrypt from "bcryptjs";

/**
 * Hash a password using bcrypt.
 */
export function hashPassword(password: string): string {
  return bcrypt.hashSync(password, 10);
}

/**
 * Verify a password against a stored hashed password.
 * Automatically handles both bcrypt and legacy PBKDF2 hashes.
 */
export function verifyPassword(password: string, storedValue: string): boolean {
  try {
    // Check if it's a bcrypt hash
    if (storedValue.startsWith("$2a$") || storedValue.startsWith("$2b$") || storedValue.startsWith("$2y$")) {
      return bcrypt.compareSync(password, storedValue);
    }

    // Legacy PBKDF2 fallback
    const [salt, originalHash] = storedValue.split(":");
    if (!salt || !originalHash) return false;

    const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, "sha512").toString("hex");
    const hashBuffer = Buffer.from(hash);
    const originalHashBuffer = Buffer.from(originalHash);

    if (hashBuffer.length !== originalHashBuffer.length) {
      return false;
    }

    return crypto.timingSafeEqual(hashBuffer, originalHashBuffer);
  } catch (e) {
    console.error("Password verification error:", e);
    return false;
  }
}

/**
 * Check if the stored password hash needs an upgrade to bcrypt.
 */
export function needsUpgrade(storedValue: string): boolean {
  return !(storedValue.startsWith("$2a$") || storedValue.startsWith("$2b$") || storedValue.startsWith("$2y$"));
}

/**
 * Validates a password against safety requirements:
 * - Minimum 8 characters
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one digit
 */
export function validatePassword(password: string): boolean {
  if (!password || password.length < 8) return false;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  return hasUpperCase && hasLowerCase && hasNumber;
}
