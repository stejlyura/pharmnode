import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET } from "./route";
import { getServerSession } from "next-auth/next";

// Mock getServerSession
vi.mock("next-auth/next", () => ({
  getServerSession: vi.fn(),
}));

// Mock prisma client
vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: { count: vi.fn().mockResolvedValue(0), findMany: vi.fn().mockResolvedValue([]) },
    recipe: { count: vi.fn().mockResolvedValue(0), findMany: vi.fn().mockResolvedValue([]) },
    customIngredient: { count: vi.fn().mockResolvedValue(0), findMany: vi.fn().mockResolvedValue([]) },
  },
}));

// Mock rateLimit module
const mockRateLimit = vi.fn();
vi.mock("@/lib/rateLimit", () => ({
  rateLimit: (key: string, options: unknown) => mockRateLimit(key, options),
}));

// Mock encryption module
vi.mock("@/lib/encryption", () => ({
  decrypt: vi.fn((val) => val),
}));

describe("Admin Data API Route - Rate Limiting & Auth", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default rate limits to succeed
    mockRateLimit.mockResolvedValue({
      success: true,
      limit: 20,
      remaining: 19,
      reset: Date.now() + 60000,
    });
  });

  it("should return 429 when global admin_data rate limit is exceeded", async () => {
    // Mock the global rate limiter to fail
    mockRateLimit.mockImplementation((key) => {
      if (key === "admin_data") {
        return Promise.resolve({
          success: false,
          limit: 20,
          remaining: 0,
          reset: Date.now() + 60000,
        });
      }
      return Promise.resolve({ success: true });
    });

    const request = new Request("http://localhost:3000/api/admin/data");
    const response = await GET(request);

    expect(response.status).toBe(429);
    const body = await response.json();
    expect(body.error).toContain("Too many admin requests");
    expect(mockRateLimit).toHaveBeenCalledWith("admin_data", expect.any(Object));
  });

  it("should return 429 when failed basic auth attempts exceed rate limit", async () => {
    // No valid session
    vi.mocked(getServerSession).mockResolvedValue(null);

    // Mock failedBasicAuth rate limiter to fail
    mockRateLimit.mockImplementation((key) => {
      if (key === "admin_data") {
        return Promise.resolve({ success: true, remaining: 19 });
      }
      if (key === "admin_basic_auth_failed") {
        return Promise.resolve({
          success: false,
          limit: 5,
          remaining: 0,
          reset: Date.now() + 60000,
        });
      }
      return Promise.resolve({ success: true });
    });

    // Request with invalid authorization header
    const request = new Request("http://localhost:3000/api/admin/data", {
      headers: {
        authorization: "Basic wrong-credentials-hash",
      },
    });
    const response = await GET(request);

    expect(response.status).toBe(429);
    const bodyText = await response.text();
    expect(bodyText).toContain("Too many failed auth attempts");
    expect(mockRateLimit).toHaveBeenCalledWith("admin_basic_auth_failed", {
      limit: 5,
      windowMs: 15 * 60 * 1000,
    });
  });

  it("should return 401 and request Basic Auth if session is not admin and Basic Auth header is missing", async () => {
    vi.mocked(getServerSession).mockResolvedValue(null);

    const request = new Request("http://localhost:3000/api/admin/data");
    const response = await GET(request);

    expect(response.status).toBe(401);
    expect(response.headers.get("WWW-Authenticate")).toBe('Basic realm="Admin Portal"');
    // It should have registered a failed attempt rate limit count
    expect(mockRateLimit).toHaveBeenCalledWith("admin_basic_auth_failed", {
      limit: 5,
      windowMs: 15 * 60 * 1000,
    });
  });

  it("should allow access if session admin is found", async () => {
    vi.mocked(getServerSession).mockResolvedValue({
      user: { email: "admin@pharmnode.com" },
    });

    const request = new Request("http://localhost:3000/api/admin/data");
    const response = await GET(request);

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.databaseOnline).toBe(true);
    // Should not check basic auth rate limiter
    expect(mockRateLimit).not.toHaveBeenCalledWith("admin_basic_auth_failed", expect.any(Object));
  });

  it("should allow access if correct Basic Auth is provided", async () => {
    vi.mocked(getServerSession).mockResolvedValue(null);

    // Save and configure environment variables
    const originalUsername = process.env.ADMIN_USERNAME;
    const originalPassword = process.env.ADMIN_PASSWORD;

    process.env.ADMIN_USERNAME = "admin";
    process.env.ADMIN_PASSWORD = "PasswordforAdmin123";

    const expectedAuth = "Basic " + Buffer.from("admin:PasswordforAdmin123").toString("base64");

    const request = new Request("http://localhost:3000/api/admin/data", {
      headers: {
        authorization: expectedAuth,
      },
    });
    const response = await GET(request);

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.databaseOnline).toBe(true);

    // Restore env
    process.env.ADMIN_USERNAME = originalUsername;
    process.env.ADMIN_PASSWORD = originalPassword;
  });
});
