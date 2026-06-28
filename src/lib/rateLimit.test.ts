import { describe, it, expect, beforeEach, vi } from "vitest";
import { rateLimit } from "./rateLimit";

describe("Rate Limiting System", () => {
  beforeEach(() => {
    // Clear next/headers mocks or other side effects if any
    vi.resetModules();
  });

  it("should allow requests under the limit", async () => {
    const key = `test_action_${Math.random()}`;
    const options = { limit: 3, windowMs: 60 * 1000 };

    const res1 = await rateLimit(key, options);
    expect(res1.success).toBe(true);
    expect(res1.remaining).toBe(2);

    const res2 = await rateLimit(key, options);
    expect(res2.success).toBe(true);
    expect(res2.remaining).toBe(1);

    const res3 = await rateLimit(key, options);
    expect(res3.success).toBe(true);
    expect(res3.remaining).toBe(0);
  });

  it("should block requests exceeding the limit", async () => {
    const key = `test_action_${Math.random()}`;
    const options = { limit: 2, windowMs: 60 * 1000 };

    await rateLimit(key, options);
    await rateLimit(key, options);
    const resBlocked = await rateLimit(key, options);

    expect(resBlocked.success).toBe(false);
    expect(resBlocked.remaining).toBe(0);
  });
});
