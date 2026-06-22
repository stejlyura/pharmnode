import { prisma } from "../src/lib/prisma";
import { checkTariffLimit } from "../src/lib/tariffLimits";

async function main() {
  const userId = "83d1917d-1802-45eb-a50e-2de052ec1423";
  const userEmail = "test-dev@pharmnode.com";

  console.log("=== Testing Hobby Tariff Limits Programmatically ===");

  // 1. Initial State
  const ingredientsCountBefore = await prisma.customIngredient.count({ where: { userId } });
  const recipesCountBefore = await prisma.recipe.count({ where: { userId } });
  
  console.log(`Current state for user ${userEmail}:`);
  console.log(`- Recipes count: ${recipesCountBefore}`);
  console.log(`- Custom ingredients count: ${ingredientsCountBefore}`);

  // 2. Test Recipe limits
  console.log("\n--- Testing Recipe Limits ---");
  const recipeLimit1 = await checkTariffLimit(userId, "hobby", "recipes");
  console.log(`Hobby Recipe limit check (1 existing): allowed = ${recipeLimit1.allowed}, limit = ${recipeLimit1.limit}, current = ${recipeLimit1.current}`);
  
  if (recipeLimit1.allowed !== false) {
    console.error("FAIL: Expected recipes to be blocked (allowed: false) because current count (1) >= limit (1)");
    process.exit(1);
  }

  // 3. Test Custom Ingredient limits
  console.log("\n--- Testing Custom Ingredient Limits ---");
  const ingLimit1 = await checkTariffLimit(userId, "hobby", "ingredients");
  console.log(`Hobby Ingredient limit check (1 existing): allowed = ${ingLimit1.allowed}, limit = ${ingLimit1.limit}, current = ${ingLimit1.current}`);
  
  if (ingLimit1.allowed !== true) {
    console.error("FAIL: Expected custom ingredients to be allowed (allowed: true) since current count (1) < limit (3)");
    process.exit(1);
  }

  // Create two more custom ingredients to reach the limit of 3
  console.log("Creating 2 more custom ingredients...");
  const tempIngIds: string[] = [];
  for (let i = 2; i <= 3; i++) {
    const ing = await prisma.customIngredient.create({
      data: {
        userId,
        name: `Encrypted_Temp_Custom_Active_${i}`,
        role: "active",
        looseBulkDensity: 0.45,
        tappedBulkDensity: 0.65,
        costPerKgUsd: 10,
        maxSafePercentage: 100,
      }
    });
    tempIngIds.push(ing.id);
  }

  const ingLimit3 = await checkTariffLimit(userId, "hobby", "ingredients");
  console.log(`Hobby Ingredient limit check (3 existing): allowed = ${ingLimit3.allowed}, limit = ${ingLimit3.limit}, current = ${ingLimit3.current}`);

  if (ingLimit3.allowed !== false) {
    console.error("FAIL: Expected custom ingredients to be blocked (allowed: false) because current count (3) >= limit (3)");
    // Cleanup
    await prisma.customIngredient.deleteMany({ where: { id: { in: tempIngIds } } });
    process.exit(1);
  }

  // 4. Test Professional Plan Limit Bypass
  console.log("\n--- Testing Professional Plan Limits Bypass ---");
  const proRecipeLimit = await checkTariffLimit(userId, "professional", "recipes");
  console.log(`Pro Recipe limit check: allowed = ${proRecipeLimit.allowed}, limit = ${proRecipeLimit.limit}`);
  
  const proIngLimit = await checkTariffLimit(userId, "professional", "ingredients");
  console.log(`Pro Ingredient limit check: allowed = ${proIngLimit.allowed}, limit = ${proIngLimit.limit}`);

  if (proRecipeLimit.allowed !== true || proIngLimit.allowed !== true) {
    console.error("FAIL: Professional plan should allow everything");
    // Cleanup
    await prisma.customIngredient.deleteMany({ where: { id: { in: tempIngIds } } });
    process.exit(1);
  }

  // 5. Cleanup
  console.log("\nCleaning up temp ingredients...");
  await prisma.customIngredient.deleteMany({ where: { id: { in: tempIngIds } } });
  console.log("Cleanup complete!");
  console.log("\nVERIFICATION SUCCESSFUL: All limits behave exactly as specified for Hobby vs Professional!");
}

main()
  .catch(err => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
