import { describe, it, expect } from "vitest";
import { execSync } from "child_process";
import { prisma } from "./prisma";

describe("Database Seed Integration Test", () => {
  it("successfully runs the seed script and validates standard ingredients data", async () => {
    // 1. Run the seed script
    console.log("Running seed script via child_process...");
    execSync("npx tsx prisma/seed.ts", { stdio: "inherit" });

    // 2. Query all ingredients with relations
    const ingredients = await prisma.ingredient.findMany({
      include: {
        stabilityData: true,
        activeMolecules: true,
      },
    });

    // 3. Assertions
    expect(ingredients.length).toBe(30);

    // All ingredients must have an IngredientStability record
    for (const ing of ingredients) {
      expect(ing.stabilityData).not.toBeNull();
      expect(ing.stabilityData?.id).toBeDefined();
    }

    // All active ingredients must have at least one ActiveMolecule
    const activeIngredients = ingredients.filter(ing => ing.role === 'active');
    expect(activeIngredients.length).toBeGreaterThan(0);
    for (const ing of activeIngredients) {
      expect(ing.activeMolecules.length).toBeGreaterThanOrEqual(1);
    }
  }, 30000);
});
