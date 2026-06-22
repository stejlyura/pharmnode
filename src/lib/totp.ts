import crypto from "node:crypto";

/**
 * Decodes a base32 encoded string into a Buffer.
 * Supports standard RFC 4648 base32 alphabet (A-Z, 2-7).
 */
export function base32ToBytes(base32: string): Buffer {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  const clean = base32.replace(/=+$/, "").replace(/\s/g, "").toUpperCase();
  const len = clean.length;
  const bytes = new Uint8Array(Math.floor((len * 5) / 8));
  
  let bits = 0;
  let val = 0;
  let index = 0;

  for (let i = 0; i < len; i++) {
    const dec = alphabet.indexOf(clean[i]);
    if (dec === -1) {
      throw new Error(`Invalid base32 character: ${clean[i]}`);
    }
    val = (val << 5) | dec;
    bits += 5;
    if (bits >= 8) {
      bytes[index++] = (val >>> (bits - 8)) & 255;
      bits -= 8;
    }
  }

  return Buffer.from(bytes);
}

/**
 * Generates a random 16-character base32 secret.
 */
export function generateTOTPSecret(): string {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  let secret = "";
  for (let i = 0; i < 16; i++) {
    secret += alphabet[crypto.randomInt(0, alphabet.length)];
  }
  return secret;
}

/**
 * Verifies a 6-digit TOTP token against a base32 secret.
 * Automatically checks adjacent time windows (drift) of size `window` (default 1 = ±30s).
 */
export function verifyTOTP(token: string, secret: string, window = 1): boolean {
  try {
    const key = base32ToBytes(secret);
    const epoch = Math.floor(Date.now() / 1000);
    const counter = Math.floor(epoch / 30);

    for (let i = -window; i <= window; i++) {
      const c = counter + i;
      
      // Convert 64-bit integer counter to 8-byte big-endian Buffer
      const buffer = Buffer.alloc(8);
      let temp = BigInt(c);
      for (let j = 7; j >= 0; j--) {
        buffer[j] = Number(temp & BigInt(0xff));
        temp >>= BigInt(8);
      }

      // Compute HMAC-SHA1
      const hmac = crypto.createHmac("sha1", key);
      hmac.update(buffer);
      const hmacResult = hmac.digest();

      // Dynamic Truncation (RFC 4226)
      const offset = hmacResult[hmacResult.length - 1] & 0xf;
      const binCode =
        ((hmacResult[offset] & 0x7f) << 24) |
        ((hmacResult[offset + 1] & 0xff) << 16) |
        ((hmacResult[offset + 2] & 0xff) << 8) |
        (hmacResult[offset + 3] & 0xff);

      const code = String(binCode % 1000000).padStart(6, "0");
      if (code === token.trim()) {
        return true;
      }
    }
  } catch (err) {
    console.error("TOTP verification error:", err);
  }
  return false;
}

/**
 * Returns an otpauth URL for generating a QR code.
 */
export function getTOTPUri(email: string, secret: string): string {
  const issuer = "PharmNode";
  return `otpauth://totp/${encodeURIComponent(issuer)}:${encodeURIComponent(email)}?secret=${secret}&issuer=${encodeURIComponent(issuer)}`;
}
