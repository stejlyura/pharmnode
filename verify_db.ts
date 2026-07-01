import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Querying ingredients from the database...');
  const ingredients = await prisma.ingredient.findMany({
    orderBy: { id: 'asc' },
  });

  console.log(`Found ${ingredients.length} ingredients.`);
  if (ingredients.length !== 26) {
    console.error(`Error: Expected 26 ingredients, but found ${ingredients.length}`);
    process.exit(1);
  }

  // Print a summary of the first 3 ingredients to verify the new fields
  console.log('\nSample Ingredients Verification:');
  for (const ing of ingredients.slice(0, 3)) {
    console.log(`- ID ${ing.id}: ${ing.name}`);
    console.log(`  Role: ${ing.role}`);
    console.log(`  Chemical Class ID: ${ing.chemicalClassId}`);
    console.log(`  Bulk Density: loose=${ing.looseBulkDensity}, tapped=${ing.tappedBulkDensity}`);
    console.log(`  True Density: ${ing.trueDensity}`);
    console.log(`  Average Particle Size: ${ing.averageParticleSizeUm} um`);
    console.log(`  Is Allergen: ${ing.isAllergen}`);
    console.log(`  Benefit: ${ing.benefit}`);
    console.log(`  Risk: ${ing.risk}`);
    console.log(`  Cost (KB): ${ing.cost}`);
    console.log(`  Cost per KG (USD): ${ing.costPerKgUsd}`);
    console.log(`  Stability Score: ${ing.stabilityScore}`);
    console.log(`  Manufacturability: ${ing.manufacturability}`);
    console.log(`  Max Safe %: ${ing.maxSafePercentage}`);
  }

  // Verify that benefit, risk, cost, stability, and manufacturability are numbers (and not all zero)
  const nonZeroBenefit = ingredients.some(ing => ing.benefit > 0);
  const nonZeroStability = ingredients.some(ing => ing.stabilityScore > 0);
  
  if (nonZeroBenefit && nonZeroStability) {
    console.log('\nVerification SUCCESS: New fields are populated with correct non-zero values.');
  } else {
    console.error('\nVerification FAILURE: New fields (benefit, stability, etc.) appear to be empty or zero.');
    process.exit(1);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
