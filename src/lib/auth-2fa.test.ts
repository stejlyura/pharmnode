import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import type { User } from "@prisma/client";

// Define mocks first to ensure they are registered before importing code
vi.mock("./prisma", () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      update: vi.fn().mockResolvedValue({}),
    },
  },
}));

vi.mock("./rateLimit", () => ({
  rateLimit: vi.fn().mockResolvedValue({
    success: true,
    limit: 10,
    remaining: 9,
    reset: Date.now() + 60000,
  }),
}));

vi.mock("./totp", () => ({
  verifyTOTP: vi.fn(),
}));

vi.mock("./password", () => ({
  verifyPassword: vi.fn(),
  needsUpgrade: vi.fn().mockReturnValue(false),
  hashPassword: vi.fn(),
}));

// Now import modules
import { authOptions } from "./auth";
import { prisma } from "./prisma";
import { encrypt } from "./encryption";
import { verifyTOTP } from "./totp";
import { verifyPassword, needsUpgrade } from "./password";

describe("Credentials Provider 2FA Authorization Flow", () => {
  const credentialsProvider = authOptions.providers.find(
    (p) => p.id === "credentials"
  );
  
  // NextAuth stores the actual developer-defined authorize callback in options.authorize
  const authorize = (credentialsProvider as unknown as Record<string, Record<string, unknown>>).options.authorize as (
    credentials: Record<string, string>
  ) => Promise<{ id: string; email: string; name: string; tariff: string } | null>;

  let originalUsername: string | undefined;
  let originalPassword: string | undefined;

  beforeEach(() => {
    vi.clearAllMocks();
    originalUsername = process.env.ADMIN_USERNAME;
    originalPassword = process.env.ADMIN_PASSWORD;
    process.env.ADMIN_USERNAME = "admin";
    process.env.ADMIN_PASSWORD = "admin-password";

    // Set default mock implementations
    vi.mocked(verifyPassword).mockImplementation(
      (password) => password === "correct-password"
    );
    vi.mocked(verifyTOTP).mockImplementation((code, secret) => {
      return secret === "MY_DECRYPTED_2FA_SECRET" && code === "123456";
    });
    vi.mocked(needsUpgrade).mockReturnValue(false);
  });

  afterEach(() => {
    process.env.ADMIN_USERNAME = originalUsername;
    process.env.ADMIN_PASSWORD = originalPassword;
  });

  it("should fail authorize if user is not found in database", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null);

    const user = await authorize({
      username: "nonexistent@example.com",
      password: "correct-password",
    });

    expect(user).toBeNull();
  });

  it("should successfully authorize if password is valid and 2FA is not enabled", async () => {
    const mockUser = {
      id: "user-123",
      email: "user@example.com",
      name: "Test User",
      passwordHash: "somehash",
      twoFactorEnabled: false,
      twoFactorSecret: null,
      tariff: "hobby",
      renewsAt: null,
      emailVerified: true,
    };
    vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as unknown as User);

    const user = await authorize({
      username: "user@example.com",
      password: "correct-password",
    });

    expect(user).not.toBeNull();
    expect(user!.id).toBe("user-123");
    expect(user!.email).toBe("user@example.com");
  });

  it("should fail authorize if 2FA is enabled but TOTP code is missing", async () => {
    const mockUser = {
      id: "user-123",
      email: "user@example.com",
      name: "Test User",
      passwordHash: "somehash",
      twoFactorEnabled: true,
      twoFactorSecret: encrypt("MY_DECRYPTED_2FA_SECRET"),
      tariff: "hobby",
      renewsAt: null,
      emailVerified: true,
    };
    vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as unknown as User);

    const user = await authorize({
      username: "user@example.com",
      password: "correct-password",
    });

    expect(user).toBeNull();
  });

  it("should fail authorize if 2FA is enabled but TOTP code is incorrect", async () => {
    const mockUser = {
      id: "user-123",
      email: "user@example.com",
      name: "Test User",
      passwordHash: "somehash",
      twoFactorEnabled: true,
      twoFactorSecret: encrypt("MY_DECRYPTED_2FA_SECRET"),
      tariff: "hobby",
      renewsAt: null,
      emailVerified: true,
    };
    vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as unknown as User);

    const user = await authorize({
      username: "user@example.com",
      password: "correct-password",
      totpCode: "000000", // incorrect code
    });

    expect(user).toBeNull();
    expect(verifyTOTP).toHaveBeenCalledWith("000000", "MY_DECRYPTED_2FA_SECRET");
  });

  it("should successfully authorize and decrypt secret if 2FA is enabled and correct TOTP code is supplied", async () => {
    // Encrypt the plain text secret as it would be in the database
    const encryptedSecret = encrypt("MY_DECRYPTED_2FA_SECRET");

    const mockUser = {
      id: "user-123",
      email: "user@example.com",
      name: "Test User",
      passwordHash: "somehash",
      twoFactorEnabled: true,
      twoFactorSecret: encryptedSecret,
      tariff: "hobby",
      renewsAt: null,
      emailVerified: true,
    };
    vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as unknown as User);

    const user = await authorize({
      username: "user@example.com",
      password: "correct-password",
      totpCode: "123456", // correct code
    });

    expect(user).not.toBeNull();
    expect(user!.id).toBe("user-123");
    // Verify that verifyTOTP was called with the decrypted secret
    expect(verifyTOTP).toHaveBeenCalledWith("123456", "MY_DECRYPTED_2FA_SECRET");
  });
});
