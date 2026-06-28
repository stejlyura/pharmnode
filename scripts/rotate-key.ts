import crypto from "node:crypto";
import { PrismaClient } from "@prisma/client";

const ALGORITHM = "aes-256-gcm";

function getKeyBuffer(rawKey: string): Buffer {
  return crypto.createHash("sha256").update(rawKey).digest();
}

function encryptWithKey(text: string, rawKey: string): string {
  if (!text) return text;
  const key = getKeyBuffer(rawKey);
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  const authTag = cipher.getAuthTag().toString("hex");
  return `${iv.toString("hex")}:${encrypted}:${authTag}`;
}

function decryptWithKey(ciphertext: string, rawKey: string): string {
  if (!ciphertext) return ciphertext;
  const parts = ciphertext.split(":");
  if (parts.length !== 3) {
    return ciphertext; // plain text fallback
  }
  const [ivHex, encryptedHex, authTagHex] = parts;
  if (ivHex.length !== 24 || authTagHex.length !== 32) {
    return ciphertext;
  }
  const key = getKeyBuffer(rawKey);
  const iv = Buffer.from(ivHex, "hex");
  const authTag = Buffer.from(authTagHex, "hex");
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);
  let decrypted = decipher.update(encryptedHex, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
}

async function main() {
  const oldKey = process.env.OLD_ENCRYPTION_KEY;
  const newKey = process.env.NEW_ENCRYPTION_KEY;

  if (!oldKey || !newKey) {
    console.error("Error: Both OLD_ENCRYPTION_KEY and NEW_ENCRYPTION_KEY environment variables are required.");
    console.log("Usage: OLD_ENCRYPTION_KEY='...' NEW_ENCRYPTION_KEY='...' npx tsx scripts/rotate-key.ts");
    process.exit(1);
  }

  if (oldKey === newKey) {
    console.error("Error: OLD_ENCRYPTION_KEY and NEW_ENCRYPTION_KEY must be different.");
    process.exit(1);
  }

  console.log("Starting ENCRYPTION_KEY rotation process...");

  const prisma = new PrismaClient();
  try {
    const users = await prisma.user.findMany({
      where: {
        twoFactorSecret: {
          not: null,
        },
      },
    });

    console.log(`Found ${users.length} users with 2FA secrets.`);
    let successCount = 0;
    let failCount = 0;

    for (const user of users) {
      if (!user.twoFactorSecret) continue;

      try {
        const decryptedSecret = decryptWithKey(user.twoFactorSecret, oldKey);
        
        // Sanity check: verify that if it was encrypted, decryption succeeded.
        // If it was encrypted, the decrypted text should not contain colons (standard base32 TOTP secret is alphabetic)
        if (user.twoFactorSecret.includes(":") && decryptedSecret === user.twoFactorSecret) {
          throw new Error("Decryption failed or output matched ciphertext on an encrypted-format string.");
        }

        const reEncryptedSecret = encryptWithKey(decryptedSecret, newKey);

        await prisma.user.update({
          where: { id: user.id },
          data: {
            twoFactorSecret: reEncryptedSecret,
          },
        });

        successCount++;
      } catch (err) {
        console.error(`Failed to rotate 2FA secret for user ${user.id} (${user.email}):`, err);
        failCount++;
      }
    }

    console.log("-----------------------------------------");
    console.log("Rotation process finished!");
    console.log(`Successfully rotated: ${successCount} user(s).`);
    console.log(`Failed: ${failCount} user(s).`);
  } catch (err) {
    console.error("Fatal error during rotation:", err);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
