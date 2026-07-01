import { describe, it, expect, vi, beforeEach } from "vitest";
import { authOptions } from "./auth";
import { prisma } from "./prisma";

vi.mock("./prisma", () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
    },
    userSession: {
      create: vi.fn(),
    },
  },
}));

vi.mock("./auditLogger", () => ({
  logAuditEvent: vi.fn(),
}));

describe("authOptions callbacks", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("jwt callback", () => {
    it("should look up OAuth user by email and use DB UUID on initial sign in", async () => {
      const mockDbUser = {
        id: "db-uuid-12345",
        email: "user@example.com",
        tariff: "professional",
        emailVerified: true,
        renewsAt: new Date("2026-12-31"),
      };

      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockDbUser as any);
      vi.mocked(prisma.userSession.create).mockResolvedValue({} as any);

      // Raw OAuth user object
      const rawOAuthUser = {
        id: "google-sub-id-9999",
        email: "user@example.com",
        name: "Test User",
      };

      const jwtCallback = authOptions.callbacks?.jwt;
      if (!jwtCallback) {
        throw new Error("jwt callback is not defined");
      }

      const resultToken = await jwtCallback({
        token: {},
        user: rawOAuthUser as any,
        trigger: "signIn",
      } as any);

      // Verify it mapped the database UUID
      expect(resultToken.id).toBe("db-uuid-12345");
      expect(resultToken.tariff).toBe("professional");
      expect(resultToken.emailVerified).toBe(true);

      // Verify it queried the database using the email
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: "user@example.com" },
      });

      // Verify it created a UserSession with the database UUID
      expect(prisma.userSession.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            userId: "db-uuid-12345",
          }),
        })
      );
    });
  });
});
