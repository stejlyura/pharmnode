import { describe, it, expect } from "vitest";
import { encrypt, decrypt } from "./encryption";
import { generateTOTPSecret } from "./totp";

describe("2FA Secret Encryption & Decryption", () => {
  it("should encrypt the TOTP secret and decrypt it back to original", () => {
    const originalSecret = generateTOTPSecret();
    const encryptedSecret = encrypt(originalSecret);

    // Verify it is encrypted (should not equal the original secret and should match the encrypted format)
    expect(encryptedSecret).not.toBe(originalSecret);
    expect(encryptedSecret.split(":").length).toBe(3);

    // Decrypt it back
    const decryptedSecret = decrypt(encryptedSecret);
    expect(decryptedSecret).toBe(originalSecret);
  });
});
