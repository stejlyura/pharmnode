import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { isProdEnv, getMockUser } from "./authHelpers";

describe("authHelpers", () => {
  const originalEnv = process.env.NODE_ENV;
  const originalPaddleEnv = process.env.NEXT_PUBLIC_PADDLE_ENVIRONMENT;

  beforeEach(() => {
    process.env.NODE_ENV = "development";
    process.env.NEXT_PUBLIC_PADDLE_ENVIRONMENT = "sandbox";
  });

  afterEach(() => {
    process.env.NODE_ENV = originalEnv;
    process.env.NEXT_PUBLIC_PADDLE_ENVIRONMENT = originalPaddleEnv;
  });

  describe("isProdEnv", () => {
    it("returns false in dev/sandbox", () => {
      expect(isProdEnv()).toBe(false);
    });

    it("returns true when NODE_ENV is production", () => {
      process.env.NODE_ENV = "production";
      expect(isProdEnv()).toBe(true);
    });

    it("returns true when NEXT_PUBLIC_PADDLE_ENVIRONMENT is production", () => {
      process.env.NEXT_PUBLIC_PADDLE_ENVIRONMENT = "production";
      expect(isProdEnv()).toBe(true);
    });
  });

  describe("getMockUser", () => {
    it("returns unauthenticated for undefined cookie", () => {
      const result = getMockUser(undefined);
      expect(result.isAuthenticated).toBe(false);
      expect(result.email).toBe("");
    });

    it("returns unauthenticated in production", () => {
      process.env.NODE_ENV = "production";
      const cookie = encodeURIComponent(JSON.stringify({ id: "mock-1", email: "mock@example.com", tariff: "professional" }));
      const result = getMockUser(cookie);
      expect(result.isAuthenticated).toBe(false);
    });

    it("parses valid mock user cookie in dev", () => {
      const mockObj = { id: "mock-1", email: "mock@example.com", tariff: "professional" };
      const cookie = encodeURIComponent(JSON.stringify(mockObj));
      const result = getMockUser(cookie);
      expect(result.isAuthenticated).toBe(true);
      expect(result.email).toBe("mock@example.com");
      expect(result.tariff).toBe("professional");
    });

    it("defaults to hobby tariff if missing in cookie", () => {
      const mockObj = { id: "mock-1", email: "mock@example.com" };
      const cookie = encodeURIComponent(JSON.stringify(mockObj));
      const result = getMockUser(cookie);
      expect(result.isAuthenticated).toBe(true);
      expect(result.tariff).toBe("hobby");
    });

    it("handles malformed JSON gracefully", () => {
      const result = getMockUser("malformed%JSON");
      expect(result.isAuthenticated).toBe(false);
    });
  });
});
