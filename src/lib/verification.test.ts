import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET } from "../app/api/auth/verify-email/route";
import { validatePassword } from "./password";
import { prisma } from "@/lib/prisma";
import { logAuditEvent } from "@/lib/auditLogger";
import type { User } from "@prisma/client";

// Mock the dependencies
vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findFirst: vi.fn(),
      update: vi.fn(),
    },
  },
  default: {
    user: {
      findFirst: vi.fn(),
      update: vi.fn(),
    },
  },
}));

vi.mock("@/lib/auditLogger", () => ({
  logAuditEvent: vi.fn(),
}));

describe("Password validation rules", () => {
  it("should validate strong passwords conforming to all requirements", () => {
    expect(validatePassword("ValidPass123")).toBe(true);
    expect(validatePassword("SecureP@ssw0rd")).toBe(true);
  });

  it("should reject invalid passwords", () => {
    expect(validatePassword("short")).toBe(false);
    expect(validatePassword("lowercaseonly")).toBe(false);
    expect(validatePassword("UPPERCASEONLY")).toBe(false);
    expect(validatePassword("NoNumbersHere")).toBe(false);
  });
});

describe("Verify-email API endpoint", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return 400 if verification token is missing", async () => {
    const request = new Request("http://localhost:3000/api/auth/verify-email");
    const response = await GET(request);
    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toBe("Verification token is required");
  });

  it("should return 400 if verification token is invalid or expired", async () => {
    const findFirstMock = vi.mocked(prisma.user.findFirst);
    findFirstMock.mockResolvedValueOnce(null);

    const request = new Request("http://localhost:3000/api/auth/verify-email?token=invalid-token");
    const response = await GET(request);
    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toBe("Invalid or expired verification token");
    expect(findFirstMock).toHaveBeenCalledWith({
      where: { emailVerificationToken: "invalid-token" }
    });
  });

  it("should successfully verify email and update database", async () => {
    const mockUser: User = {
      id: "user-123",
      name: "Test User",
      email: "user@example.com",
      image: null,
      tariff: "hobby",
      isSubscribed: false,
      paddleSubId: null,
      paddleCustomerId: null,
      variantId: null,
      renewsAt: null,
      billingPortalUrl: null,
      twoFactorEnabled: false,
      twoFactorSecret: null,
      passwordHash: "somehash",
      emailVerified: false,
      emailVerificationToken: "valid-token",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const findFirstMock = vi.mocked(prisma.user.findFirst);
    findFirstMock.mockResolvedValueOnce(mockUser);

    const updateMock = vi.mocked(prisma.user.update);
    updateMock.mockResolvedValueOnce(mockUser);

    const request = new Request("http://localhost:3000/api/auth/verify-email?token=valid-token");
    const response = await GET(request);
    expect(response.status).toBe(200);

    const data = await response.json();
    expect(data.success).toBe(true);

    expect(findFirstMock).toHaveBeenCalledWith({
      where: { emailVerificationToken: "valid-token" }
    });

    expect(updateMock).toHaveBeenCalledWith({
      where: { id: "user-123" },
      data: {
        emailVerified: true,
        emailVerificationToken: null,
      }
    });

    expect(logAuditEvent).toHaveBeenCalledWith({
      userId: "user-123",
      email: "user@example.com",
      action: "user_verify_email",
      details: "Email address successfully verified via token link.",
    });
  });
});
