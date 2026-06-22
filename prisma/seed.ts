import { PrismaClient } from '@prisma/client';
import { baseIngredientsMatrix } from '../src/types/pharm';

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding standard ingredients with relational tables...');

  // Clear existing standard ingredients and relational data
  await prisma.synergy.deleteMany({});
  await prisma.ingredientEffect.deleteMany({});
  await prisma.ingredientContraindication.deleteMany({});
  await prisma.activeMolecule.deleteMany({});
  await prisma.effect.deleteMany({});
  await prisma.contraindication.deleteMany({});
  await prisma.ingredient.deleteMany({});

  // Seed the 26 base ingredients
  for (const ing of baseIngredientsMatrix) {
    const ingredientId = Number(ing.id);

    // Create main Ingredient
    await prisma.ingredient.create({
      data: {
        id: ingredientId,
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
        source: (ing as unknown as Record<string, unknown>).source as string || null,
        dilutionScale: (ing as unknown as Record<string, unknown>).dilutionScale as string || null,
        dosageForm: (ing as unknown as Record<string, unknown>).dosageForm as string || null,
        applicationArea: (ing as unknown as Record<string, unknown>).applicationArea as string || null,
        processingTech: (ing as unknown as Record<string, unknown>).processingTech as string || null,
        sideEffects: (ing.sideEffects || []) as unknown as object,
      },
    });

    // Seed ActiveMolecule records for active roles
    if (ing.role === 'active') {
      // Every active ingredient has at least one active molecule
      await prisma.activeMolecule.create({
        data: {
          name: ing.name,
          casNumber: ing.casNumber || null,
          chemicalClassId: ing.chemicalClassId,
          ingredientId,
        },
      });

      // Composite demonstration: Add secondary active molecules for extracts / complex APIs
      if (ingredientId === 8) { // Vitamin C
        await prisma.activeMolecule.create({
          data: {
            name: "Dehydroascorbic Acid",
            casNumber: "490-83-5",
            chemicalClassId: 6, // Aliphatic organic acids
            ingredientId,
          },
        });
      } else if (ingredientId === 17) { // Vitamin D3
        await prisma.activeMolecule.create({
          data: {
            name: "Pre-vitamin D3",
            casNumber: null,
            chemicalClassId: 23, // Fat-soluble vitamins
            ingredientId,
          },
        });
      }
    }

    // Seed Effects
    if (ing.effects && ing.effects.length > 0) {
      for (const effectName of ing.effects) {
        const effect = await prisma.effect.upsert({
          where: { name: effectName },
          update: {},
          create: { name: effectName },
        });

        await prisma.ingredientEffect.create({
          data: {
            ingredientId,
            effectId: effect.id,
          },
        });
      }
    }

    // Seed Contraindications
    if (ing.contraindications && ing.contraindications.length > 0) {
      for (const contraName of ing.contraindications) {
        const contra = await prisma.contraindication.upsert({
          where: { name: contraName },
          update: {},
          create: { name: contraName },
        });

        await prisma.ingredientContraindication.create({
          data: {
            ingredientId,
            contraindicationId: contra.id,
          },
        });
      }
    }
  }

  // Seed synergies
  const synergies = [
    { a: 8, b: 15, val: 15.0 },  // Vitamin C + Caffeine
    { a: 6, b: 7, val: 30.0 },   // Paracetamol + Ibuprofen
    { a: 6, b: 15, val: 20.0 }   // Paracetamol + Caffeine
  ];
  for (const syn of synergies) {
    await prisma.synergy.create({
      data: {
        ingredientAId: syn.a,
        ingredientBId: syn.b,
        value: syn.val,
      },
    });
  }

  console.log('Seeding admin account...');
  await prisma.user.upsert({
    where: { email: 'admin@pharmnode.com' },
    update: {
      name: 'Administrator',
      tariff: 'professional',
    },
    create: {
      name: 'Administrator',
      email: 'admin@pharmnode.com',
      image: '',
      tariff: 'professional',
    },
  });
  console.log('Admin account seeded.');

  console.log(`Successfully seeded standard ingredients & relations.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
