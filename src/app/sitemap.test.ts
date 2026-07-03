import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import sitemap from "./sitemap";

describe("sitemap.xml configuration", () => {
  const originalEnv = process.env.NEXT_PUBLIC_BASE_URL;

  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    process.env.NEXT_PUBLIC_BASE_URL = originalEnv;
  });

  it("should return correct list of public URLs with fallback base URL", () => {
    delete process.env.NEXT_PUBLIC_BASE_URL;
    const result = sitemap();

    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBe(11);

    const paths = result.map((item) => item.url);
    expect(paths).toContain("https://pharmnode.com");
    expect(paths).toContain("https://pharmnode.com/features");
    expect(paths).toContain("https://pharmnode.com/workflow");
    expect(paths).toContain("https://pharmnode.com/about");
    expect(paths).toContain("https://pharmnode.com/use-cases");
    expect(paths).toContain("https://pharmnode.com/technologies");
    expect(paths).toContain("https://pharmnode.com/regulatory");
    expect(paths).toContain("https://pharmnode.com/pricing");
    expect(paths).toContain("https://pharmnode.com/knowledge-base/compatibility-matrix");
    expect(paths).toContain("https://pharmnode.com/knowledge-base/excipients");
    expect(paths).toContain("https://pharmnode.com/api-reference");

    // Check priorities
    const landing = result.find((item) => item.url === "https://pharmnode.com");
    expect(landing?.priority).toBe(1.0);
    expect(landing?.changeFrequency).toBe("daily");

    const features = result.find((item) => item.url === "https://pharmnode.com/features");
    expect(features?.priority).toBe(0.9);
    expect(features?.changeFrequency).toBe("weekly");
  });

  it("should respect NEXT_PUBLIC_BASE_URL environment variable", () => {
    process.env.NEXT_PUBLIC_BASE_URL = "https://staging.pharmnode.com";
    const result = sitemap();

    expect(result[0].url).toBe("https://staging.pharmnode.com");
    expect(result[1].url).toBe("https://staging.pharmnode.com/features");
  });
});
