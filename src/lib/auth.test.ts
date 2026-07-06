import { describe, it, expect, vi, beforeEach } from "vitest";
import { authOptions } from "./auth";
import { prisma } from "./prisma";

vi.mock("./prisma", () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    userSession: {
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn().mockReturnValue(Promise.resolve({})),
    },
  },
}));

vi.mock("./auditLogger", () => ({
  logAuditEvent: vi.fn(),
}));

describe("authOptions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.ADMIN_USERNAME = "admin";
    process.env.ADMIN_PASSWORD = "secret_password";
  });

  describe("CredentialsProvider authorize", () => {
    it("should authorize admin with correct credentials", async () => {
      const credentialsProvider = authOptions.providers.find(
        (p) => p.id === "credentials"
      ) as any;
      expect(credentialsProvider).toBeDefined();

      const authorize = credentialsProvider.options.authorize;
      expect(authorize).toBeDefined();

      const mockAdminDbUser = {
        id: "admin-uuid",
        name: "Administrator",
        email: "admin@pharmnode.com",
        tariff: "professional",
        renewsAt: null,
      };

      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockAdminDbUser as any);

      const user = await authorize({
        username: "admin",
        password: "secret_password",
      });

      expect(user).toEqual({
        id: "admin-uuid",
        name: "Administrator",
        email: "admin@pharmnode.com",
        tariff: "professional",
        renewsAt: null,
        emailVerified: true,
      });
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: "admin@pharmnode.com" },
      });
    });

    it("should reject admin with incorrect password", async () => {
      const credentialsProvider = authOptions.providers.find(
        (p) => p.id === "credentials"
      ) as any;
      const authorize = credentialsProvider.options.authorize;
      
      const user = await authorize({
        username: "admin",
        password: "wrong_password",
      });

      expect(user).toBeNull();
    });

    it("should reject regular user credentials login", async () => {
      const credentialsProvider = authOptions.providers.find(
        (p) => p.id === "credentials"
      ) as any;
      const authorize = credentialsProvider.options.authorize;
      
      const user = await authorize({
        username: "user@example.com",
        password: "userpassword123",
      });

      expect(user).toBeNull();
    });
  });

  describe("callbacks", () => {
    describe("signIn callback", () => {
      it("should return false if user email is missing", async () => {
        const signInCallback = authOptions.callbacks?.signIn;
        expect(signInCallback).toBeDefined();

        const result = await signInCallback!({
          user: { name: "No Email User" },
        } as any);

        expect(result).toBe(false);
      });

      it("should create new user with hobby tariff and isSubscribed false if user does not exist", async () => {
        const signInCallback = authOptions.callbacks?.signIn;
        vi.mocked(prisma.user.findUnique).mockResolvedValue(null);
        vi.mocked(prisma.user.create).mockResolvedValue({
          id: "new-user-id",
          email: "new@example.com",
          tariff: "hobby",
        } as any);

        const result = await signInCallback!({
          user: { email: "new@example.com", name: "New User" },
        } as any);

        expect(result).toBe(true);
        expect(prisma.user.create).toHaveBeenCalledWith({
          data: {
            name: "New User",
            email: "new@example.com",
            image: "",
            tariff: "hobby",
            isSubscribed: false,
            emailVerified: true,
          },
        });
      });

      it("should not create user if user already exists", async () => {
        const signInCallback = authOptions.callbacks?.signIn;
        vi.mocked(prisma.user.findUnique).mockResolvedValue({
          id: "existing-id",
          email: "existing@example.com",
        } as any);

        const result = await signInCallback!({
          user: { email: "existing@example.com" },
        } as any);

        expect(result).toBe(true);
        expect(prisma.user.create).not.toHaveBeenCalled();
      });
    });

    describe("jwt callback", () => {
      it("should look up OAuth user by email and use DB details on initial sign in", async () => {
        const mockDbUser = {
          id: "db-uuid-12345",
          email: "user@example.com",
          tariff: "professional",
          emailVerified: true,
          renewsAt: new Date("2026-12-31"),
        };

        vi.mocked(prisma.user.findUnique).mockResolvedValue(mockDbUser as any);
        vi.mocked(prisma.userSession.create).mockResolvedValue({} as any);

        const rawOAuthUser = {
          id: "google-sub-id-9999",
          email: "user@example.com",
          name: "Test User",
        };

        const jwtCallback = authOptions.callbacks?.jwt;
        expect(jwtCallback).toBeDefined();

        const resultToken = await jwtCallback!({
          token: {},
          user: rawOAuthUser as any,
          trigger: "signIn",
        } as any);

        expect(resultToken.id).toBe("db-uuid-12345");
        expect(resultToken.tariff).toBe("professional");
        expect(resultToken.emailVerified).toBe(true);
        expect(resultToken.renewsAt).toBe(mockDbUser.renewsAt.toISOString());
      });

      it("should fetch fresh user subscription tariff on subsequent calls", async () => {
        const mockDbUser = {
          id: "db-uuid-12345",
          email: "user@example.com",
          tariff: "enterprise",
          emailVerified: true,
          renewsAt: new Date("2027-01-01"),
        };

        vi.mocked(prisma.user.findUnique).mockResolvedValue(mockDbUser as any);
        vi.mocked(prisma.userSession.findUnique).mockResolvedValue({ id: "session-id" } as any);

        const jwtCallback = authOptions.callbacks?.jwt;

        const resultToken = await jwtCallback!({
          token: { id: "db-uuid-12345", email: "user@example.com", sessionToken: "session-123" },
          user: undefined,
        } as any);

        expect(resultToken.tariff).toBe("enterprise");
        expect(resultToken.renewsAt).toBe(mockDbUser.renewsAt.toISOString());
        expect(prisma.user.findUnique).toHaveBeenCalledWith({
          where: { email: "user@example.com" },
        });
      });
    });
  });
});
