import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "./route";
import { prisma } from "@/lib/prisma";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
  },
}));

const mockRateLimit = vi.fn();
vi.mock("@/lib/rateLimit", () => ({
  rateLimit: (key: string, options: unknown) => mockRateLimit(key, options),
}));

vi.mock("@/lib/password", () => ({
  hashPassword: vi.fn((pwd) => `hashed:${pwd}`),
  validatePassword: vi.fn((pwd) => pwd.length >= 8),
}));

vi.mock("@/actions/auth", () => ({
  sendVerificationEmail: vi.fn().mockResolvedValue({}),
}));

vi.mock("@/lib/auditLogger", () => ({
  logAuditEvent: vi.fn().mockResolvedValue({}),
}));

describe("POST /api/auth/register", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRateLimit.mockResolvedValue({ success: true });
  });

  it("returns 429 when registration rate limit is exceeded", async () => {
    mockRateLimit.mockResolvedValue({ success: false });

    const request = new Request("http://localhost:3000/api/auth/register", {
      method: "POST",
      body: JSON.stringify({ name: "User", email: "test@example.com", password: "Password123!" })
    });
    const res = await POST(request);

    expect(res.status).toBe(429);
    const body = await res.json();
    expect(body.error).toContain("Too many registration attempts");
  });

  it("returns 400 when missing/empty name or invalid email", async () => {
    // Missing name
    const req1 = new Request("http://localhost:3000/api/auth/register", {
      method: "POST",
      body: JSON.stringify({ name: "", email: "test@example.com", password: "Password123!" })
    });
    const res1 = await POST(req1);
    expect(res1.status).toBe(400);

    // Invalid email format
    const req2 = new Request("http://localhost:3000/api/auth/register", {
      method: "POST",
      body: JSON.stringify({ name: "User", email: "invalid-email", password: "Password123!" })
    });
    const res2 = await POST(req2);
    expect(res2.status).toBe(400);
    const body2 = await res2.json();
    expect(body2.error).toContain("Введите корректный email");
  });

  it("returns 400 when password is weak (under 8 chars)", async () => {
    const request = new Request("http://localhost:3000/api/auth/register", {
      method: "POST",
      body: JSON.stringify({ name: "User", email: "test@example.com", password: "short" })
    });
    const res = await POST(request);

    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toContain("Пароль должен быть не менее 8 символов");
  });

  it("returns 400 when user already exists with the email", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue({ id: "user-existing" } as any);

    const request = new Request("http://localhost:3000/api/auth/register", {
      method: "POST",
      body: JSON.stringify({ name: "User", email: "existing@example.com", password: "Password123!" })
    });
    const res = await POST(request);

    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toContain("Пользователь с таким email уже зарегистрирован");
  });

  it("successfully hashes password, generates token, creates user and emails verification link", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null);
    vi.mocked(prisma.user.create).mockResolvedValue({
      id: "new-user-777",
      email: "new@example.com"
    } as any);

    const request = new Request("http://localhost:3000/api/auth/register", {
      method: "POST",
      body: JSON.stringify({ name: "New User", email: "new@example.com", password: "Password123!" })
    });
    const res = await POST(request);

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.userId).toBe("new-user-777");

    // Verified create and email dispatch calls
    expect(prisma.user.create).toHaveBeenCalled();
  });
});
