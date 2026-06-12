import { PrismaClient } from '@prisma/client';
import { baseIngredientsMatrix } from '../src/types/pharm';

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding standard ingredients...');
  
  // Clear existing standard ingredients
  await prisma.ingredient.deleteMany({});
  
  // Seed the 26 base ingredients
  for (const ing of baseIngredientsMatrix) {
    await prisma.ingredient.create({
      data: {
        id: Number(ing.id),
        name: ing.name,
        casNumber: ing.casNumber || null,
        role: ing.role,
        chemicalClassId: ing.chemicalClassId,
        looseBulkDensity: ing.looseBulkDensity,
        tappedBulkDensity: ing.tappedBulkDensity,
        trueDensity: ing.trueDensity || null,
        averageParticleSizeUm: ing.averageParticleSizeUm || null,
        isAllergen: ing.isAllergen || false,
        benefit: ing.benefit || 0,
        risk: ing.risk || 0,
        cost: ing.cost || 0,
        costPerKgUsd: ing.costPerKgUsd || 0,
        stability: ing.stability || 0,
        manufacturability: ing.manufacturability || 0,
        maxSafePercentage: ing.maxSafePercentage || 100,
        source: (ing as any).source || null,
        dilutionScale: (ing as any).dilutionScale || null,
        dosageForm: (ing as any).dosageForm || null,
        applicationArea: (ing as any).applicationArea || null,
        processingTech: (ing as any).processingTech || null,
      },
    });
  }
  
  console.log(`Successfully seeded ${baseIngredientsMatrix.length} ingredients.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
