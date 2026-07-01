// @vitest-environment jsdom
import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, waitFor } from "@testing-library/react";
import { AuthProvider, useAuth } from "./AuthContext";
import { useSession, signOut } from "next-auth/react";

// Mock next-auth/react
vi.mock("next-auth/react", () => ({
  useSession: vi.fn(),
  signOut: vi.fn(),
  SessionProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

// Mock @/lib/analytics
vi.mock("@/lib/analytics", () => ({
  initAnalytics: vi.fn(),
  identifyUser: vi.fn(),
  resetAnalytics: vi.fn(),
}));

// Helper component to consume AuthContext
const TestConsumer = () => {
  const auth = useAuth();
  return (
    <div>
      <span data-testid="status">{auth.status}</span>
      <span data-testid="user-email">{auth.user?.email || "none"}</span>
    </div>
  );
};

describe("AuthContext SessionExpired Handling", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should trigger signOut and clear state when session.error is SessionExpired", async () => {
    // Initial render with session containing the SessionExpired error
    vi.mocked(useSession).mockReturnValue({
      data: {
        user: { id: "123", email: "user@example.com", name: "User", tariff: "hobby", emailVerified: true },
        error: "SessionExpired",
      },
      status: "authenticated",
      update: vi.fn(),
    } as any);

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    // Verify that signOut was called with the correct callbackUrl
    await waitFor(() => {
      expect(signOut).toHaveBeenCalledWith({ callbackUrl: "/login" });
    });
  });

  it("should not trigger signOut when session is active and has no error", async () => {
    vi.mocked(useSession).mockReturnValue({
      data: {
        user: { id: "123", email: "user@example.com", name: "User", tariff: "hobby", emailVerified: true },
      },
      status: "authenticated",
      update: vi.fn(),
    } as any);

    const { getByTestId } = render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(getByTestId("status").textContent).toBe("authenticated");
    });
    expect(getByTestId("user-email").textContent).toBe("user@example.com");
    expect(signOut).not.toHaveBeenCalled();
  });
});
