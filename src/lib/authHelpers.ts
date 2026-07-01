/**
 * Checks if the current environment is production.
 * Mock authentication features are strictly disabled in production.
 */
export function isProdEnv(): boolean {
  return (
    process.env.NODE_ENV === "production" ||
    process.env.NEXT_PUBLIC_PADDLE_ENVIRONMENT === "production"
  );
}

/**
 * Parses and validates the mock user cookie.
 * Returns information about the mock authentication state.
 */
export function getMockUser(cookieValue: string | undefined): {
  isAuthenticated: boolean;
  email: string;
  tariff: string;
} {
  if (!cookieValue || isProdEnv()) {
    return { isAuthenticated: false, email: "", tariff: "hobby" };
  }

  try {
    const mockUser = JSON.parse(decodeURIComponent(cookieValue));
    if (mockUser && mockUser.id) {
      return {
        isAuthenticated: true,
        email: mockUser.email || "",
        tariff: mockUser.tariff || "hobby",
      };
    }
  } catch {
    // Ignore malformed cookie
  }

  return { isAuthenticated: false, email: "", tariff: "hobby" };
}
