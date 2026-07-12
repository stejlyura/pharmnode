import { describe, it, expect, vi, beforeEach } from "vitest";
import { proxy } from "./proxy";
import { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { getMockUser } from "./lib/authHelpers";

vi.mock("next-auth/jwt", () => ({
  getToken: vi.fn(),
}));

vi.mock("./lib/authHelpers", () => ({
  getMockUser: vi.fn().mockReturnValue({ isAuthenticated: false, email: "", tariff: "hobby" }),
  isProdEnv: vi.fn().mockReturnValue(false),
}));

// Helper to create mock NextRequest
function createRequest(url: string, cookies: Record<string, string> = {}) {
  const req = new NextRequest(new URL(url));
  for (const [key, val] of Object.entries(cookies)) {
    req.cookies.set(key, val);
  }
  return req;
}

describe("Proxy Authentication and Routing", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("allows public/whitelisted API routes without authentication", async () => {
    const req = createRequest("http://localhost:3000/api/auth/session");
    const res = await proxy(req);
    expect(res).toBeDefined();
    // Default NextResponse.next() response status is 200 (or rewrite status)
    expect(res?.status).toBe(200);
  });

  it("returns 401 for protected API routes when not authenticated", async () => {
    vi.mocked(getToken).mockResolvedValue(null);
    vi.mocked(getMockUser).mockReturnValue({ isAuthenticated: false, email: "", tariff: "hobby" });

    const req = createRequest("http://localhost:3000/api/recipes");
    const res = await proxy(req);
    expect(res?.status).toBe(401);
  });

  it("redirects private page routes to /login when not authenticated", async () => {
    vi.mocked(getToken).mockResolvedValue(null);
    vi.mocked(getMockUser).mockReturnValue({ isAuthenticated: false, email: "", tariff: "hobby" });

    const req = createRequest("http://localhost:3000/projects");
    const res = await proxy(req);
    expect(res?.status).toBe(307);
    expect(res?.headers.get("location")).toContain("/login?callbackUrl=%2Fprojects");
  });

  it("allows access to private page routes when authenticated with NextAuth", async () => {
    vi.mocked(getToken).mockResolvedValue({ email: "user@example.com", tariff: "hobby" });
    vi.mocked(getMockUser).mockReturnValue({ isAuthenticated: false, email: "", tariff: "hobby" });

    const req = createRequest("http://localhost:3000/projects");
    const res = await proxy(req);
    expect(res?.status).toBe(200);
  });

  it("allows access to private page routes when authenticated as mock user in dev environment", async () => {
    vi.mocked(getToken).mockResolvedValue(null);
    vi.mocked(getMockUser).mockReturnValue({ isAuthenticated: true, email: "mock@example.com", tariff: "hobby" });

    const req = createRequest("http://localhost:3000/projects", { pharmnode_mock_user: "exists" });
    const res = await proxy(req);
    expect(res?.status).toBe(200);
  });

  it("redirects to premium-required for premium routes when tariff is invalid", async () => {
    vi.mocked(getToken).mockResolvedValue({ email: "user@example.com", tariff: "free" });
    vi.mocked(getMockUser).mockReturnValue({ isAuthenticated: false, email: "", tariff: "hobby" });

    const req = createRequest("http://localhost:3000/configurator");
    const res = await proxy(req);
    expect(res?.status).toBe(307);
    expect(res?.headers.get("location")).toContain("/premium-required");
  });

  it("allows access to premium routes when tariff is professional, enterprise, or hobby", async () => {
    vi.mocked(getToken).mockResolvedValue({ email: "user@example.com", tariff: "hobby" });
    vi.mocked(getMockUser).mockReturnValue({ isAuthenticated: false, email: "", tariff: "hobby" });

    const req = createRequest("http://localhost:3000/configurator");
    const res = await proxy(req);
    expect(res?.status).toBe(200);
  });

  it("rewrites admin route to /_not-found for non-admin user email", async () => {
    vi.mocked(getToken).mockResolvedValue({ email: "user@example.com", tariff: "hobby" });
    vi.mocked(getMockUser).mockReturnValue({ isAuthenticated: false, email: "", tariff: "hobby" });

    const req = createRequest("http://localhost:3000/admin");
    const res = await proxy(req);
    // Rewrite is indicated by internal next.js header or rewrite status
    expect(res?.status).toBe(200);
    expect(res?.headers.get("x-middleware-rewrite")).toContain("/_not-found");
  });

  it("allows admin route access for admin email", async () => {
    vi.mocked(getToken).mockResolvedValue({ email: "admin@pharmnode.com", tariff: "hobby" });
    vi.mocked(getMockUser).mockReturnValue({ isAuthenticated: false, email: "", tariff: "hobby" });

    const req = createRequest("http://localhost:3000/admin");
    const res = await proxy(req);
    expect(res?.status).toBe(200);
    expect(res?.headers.get("x-middleware-rewrite")).toBeNull();
  });
});
