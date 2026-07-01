// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render } from "@testing-library/react";
import React from "react";
import ProtectedLayout from "./layout";
import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

// Hoisted mock variables
const { mockCookieGet } = vi.hoisted(() => ({
  mockCookieGet: vi.fn(),
}));

// Mock next/navigation
vi.mock("next/navigation", () => ({
  redirect: vi.fn((url) => {
    throw new Error(`Redirect: ${url}`);
  }),
}));

// Mock next/headers
vi.mock("next/headers", () => ({
  cookies: vi.fn().mockResolvedValue({
    get: mockCookieGet,
  }),
}));

// Mock next-auth/next
vi.mock("next-auth/next", () => ({
  getServerSession: vi.fn(),
}));

// Mock @/lib/auth
vi.mock("@/lib/auth", () => ({
  authOptions: {},
}));

// Mock @/lib/prisma
vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
    },
  },
}));

// Mock TariffSynchronizer component
vi.mock("@/components/TariffSynchronizer", () => ({
  TariffSynchronizer: () => <div data-testid="tariff-sync" />,
}));

describe("ProtectedLayout", () => {
  const originalEnv = process.env.NODE_ENV;
  const originalPaddleEnv = process.env.NEXT_PUBLIC_PADDLE_ENVIRONMENT;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.NODE_ENV = "development";
    process.env.NEXT_PUBLIC_PADDLE_ENVIRONMENT = "sandbox";
  });

  afterEach(() => {
    process.env.NODE_ENV = originalEnv;
    process.env.NEXT_PUBLIC_PADDLE_ENVIRONMENT = originalPaddleEnv;
  });

  it("should verify email and render children when authenticated with NextAuth and email is verified", async () => {
    vi.mocked(getServerSession).mockResolvedValue({
      user: { email: "user@example.com" },
    });
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      emailVerified: true,
      tariff: "professional",
    } as any);

    const children = <div data-testid="child">Protected Content</div>;
    const result = await ProtectedLayout({ children });

    // Since it's a server component returning React elements, we can render it or inspect it
    const { getByTestId, getByText } = render(result);
    expect(getByTestId("tariff-sync")).toBeDefined();
    expect(getByText("Protected Content")).toBeDefined();
    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { email: "user@example.com" },
      select: { emailVerified: true, tariff: true },
    });
  });

  it("should redirect to /verify-email if user is authenticated with NextAuth but email is not verified", async () => {
    vi.mocked(getServerSession).mockResolvedValue({
      user: { email: "user@example.com" },
    });
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      emailVerified: false,
      tariff: "hobby",
    } as any);

    const children = <div>Protected Content</div>;
    await expect(ProtectedLayout({ children })).rejects.toThrow("Redirect: /verify-email");
  });

  it("should bypass NextAuth check and render children when mock user cookie is valid in dev environment", async () => {
    vi.mocked(getServerSession).mockResolvedValue(null);
    const mockUser = {
      id: "mock-123",
      email: "mock@example.com",
      tariff: "professional",
    };
    mockCookieGet.mockReturnValue({
      value: encodeURIComponent(JSON.stringify(mockUser)),
    });

    const children = <div data-testid="child">Mock User Protected Content</div>;
    const result = await ProtectedLayout({ children });

    const { getByText } = render(result);
    expect(getByText("Mock User Protected Content")).toBeDefined();
    expect(redirect).not.toHaveBeenCalled();
  });

  it("should redirect to /login in production even if mock user cookie is present", async () => {
    process.env.NODE_ENV = "production";
    process.env.NEXT_PUBLIC_PADDLE_ENVIRONMENT = "production";
    vi.mocked(getServerSession).mockResolvedValue(null);
    const mockUser = {
      id: "mock-123",
      email: "mock@example.com",
      tariff: "professional",
    };
    mockCookieGet.mockReturnValue({
      value: encodeURIComponent(JSON.stringify(mockUser)),
    });

    const children = <div>Protected Content</div>;
    await expect(ProtectedLayout({ children })).rejects.toThrow("Redirect: /login");
  });

  it("should redirect to /login when no session is active and no mock user cookie is present", async () => {
    vi.mocked(getServerSession).mockResolvedValue(null);
    mockCookieGet.mockReturnValue(undefined);

    const children = <div>Protected Content</div>;
    await expect(ProtectedLayout({ children })).rejects.toThrow("Redirect: /login");
  });
});
