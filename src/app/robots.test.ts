import { describe, it, expect } from "vitest";
import robots from "./robots";

describe("robots.txt configuration", () => {
  it("should return the correct metadata route configuration", () => {
    const result = robots();
    
    // Check that we have the rules array
    expect(Array.isArray(result.rules)).toBe(true);
    
    // Check rules structure
    const rules = result.rules as any[];
    expect(rules.length).toBe(2);

    // Rule 1: AI Search Bots
    const aiRule = rules[0];
    expect(aiRule.userAgent).toContain("OAI-SearchBot");
    expect(aiRule.userAgent).toContain("Claude-SearchBot");
    expect(aiRule.userAgent).toContain("PerplexityBot");
    expect(aiRule.userAgent).toContain("ChatGPT-User");
    expect(aiRule.userAgent).toContain("GPTBot");
    expect(aiRule.userAgent).toContain("ClaudeBot");
    expect(aiRule.allow).toBe("/");
    expect(aiRule.disallow).toContain("/api/");
    expect(aiRule.disallow).toContain("/admin/");
    expect(aiRule.disallow).toContain("/projects/");
    expect(aiRule.disallow).toContain("/configurator/");
    expect(aiRule.disallow).toContain("/settings/");

    // Rule 2: All other user agents
    const allRule = rules[1];
    expect(allRule.userAgent).toBe("*");
    expect(allRule.allow).toBe("/");
    expect(allRule.disallow).toContain("/api/");
    expect(allRule.disallow5).toBeUndefined(); // helper check
    expect(allRule.disallow).toContain("/admin/");
    expect(allRule.disallow).toContain("/projects/");
    expect(allRule.disallow).toContain("/configurator/");
    expect(allRule.disallow).toContain("/settings/");

    // Check sitemap
    expect(result.sitemap).toContain("/sitemap.xml");
  });
});
