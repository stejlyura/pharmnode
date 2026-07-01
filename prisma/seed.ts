import { PrismaClient } from '@prisma/client';
import { baseIngredientsMatrix } from '../src/data/baseIngredients';

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding standard ingredients with relational tables...');

  // Clear existing standard ingredients and relational data
  await prisma.synergy.deleteMany({});
  await prisma.ingredientEffect.deleteMany({});
  await prisma.ingredientContraindication.deleteMany({});
  await prisma.activeMolecule.deleteMany({});
  await prisma.ingredientStability.deleteMany({});
  await prisma.ingredientRegulatory.deleteMany({});
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
        stabilityScore: ing.stability || 0,
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
  // Seed IngredientStability for all 26 base ingredients
  console.log('Seeding IngredientStability records...');
  const stabilityData: Record<number, { ph: number | null; hygroscopicity: number; lightSensitive: boolean; heatDegradation: number | null }> = {
    1:  { ph: null, hygroscopicity: 5,  lightSensitive: false, heatDegradation: null },  // Amlodipine Besylate
    2:  { ph: 5.0,  hygroscopicity: 10, lightSensitive: false, heatDegradation: null },  // Lactose Monohydrate
    3:  { ph: 6.0,  hygroscopicity: 5,  lightSensitive: false, heatDegradation: null },  // Microcrystalline Cellulose
    4:  { ph: 8.5,  hygroscopicity: 5,  lightSensitive: false, heatDegradation: null },  // Magnesium Stearate
    5:  { ph: null, hygroscopicity: 3,  lightSensitive: false, heatDegradation: null },  // Aerosil 200
    6:  { ph: null, hygroscopicity: 10, lightSensitive: false, heatDegradation: 168 },   // Paracetamol
    7:  { ph: null, hygroscopicity: 8,  lightSensitive: false, heatDegradation: 76  },   // Ibuprofen
    8:  { ph: 3.0,  hygroscopicity: 15, lightSensitive: true,  heatDegradation: 190 },   // Ascorbic Acid (Vitamin C)
    9:  { ph: 5.5,  hygroscopicity: 5,  lightSensitive: false, heatDegradation: null },  // Mannitol
    10: { ph: null, hygroscopicity: 3,  lightSensitive: false, heatDegradation: null },  // Dicalcium Phosphate
    11: { ph: 6.5,  hygroscopicity: 30, lightSensitive: false, heatDegradation: null },  // Croscarmellose Sodium
    12: { ph: null, hygroscopicity: 2,  lightSensitive: false, heatDegradation: 68  },   // Stearic Acid
    13: { ph: null, hygroscopicity: 2,  lightSensitive: false, heatDegradation: null },  // Talc
    14: { ph: null, hygroscopicity: 8,  lightSensitive: false, heatDegradation: 135 },   // Aspirin
    15: { ph: null, hygroscopicity: 5,  lightSensitive: false, heatDegradation: 238 },   // Caffeine Anhydrous
    16: { ph: 6.5,  hygroscopicity: 25, lightSensitive: false, heatDegradation: null },  // Metformin HCl
    17: { ph: null, hygroscopicity: 10, lightSensitive: true,  heatDegradation: 84  },   // Vitamin D3
    18: { ph: 9.0,  hygroscopicity: 5,  lightSensitive: false, heatDegradation: null },  // Calcium Carbonate
    19: { ph: 5.0,  hygroscopicity: 20, lightSensitive: false, heatDegradation: null },  // Sorbitol
    20: { ph: 7.0,  hygroscopicity: 35, lightSensitive: false, heatDegradation: null },  // Sucrose
    21: { ph: 4.0,  hygroscopicity: 75, lightSensitive: false, heatDegradation: null },  // Povidone K30 (PVP)
    22: { ph: 6.5,  hygroscopicity: 20, lightSensitive: false, heatDegradation: null },  // HPMC
    23: { ph: 5.5,  hygroscopicity: 15, lightSensitive: false, heatDegradation: null },  // Pregelatinized Starch
    24: { ph: 6.0,  hygroscopicity: 30, lightSensitive: false, heatDegradation: null },  // Sodium Starch Glycolate
    25: { ph: null, hygroscopicity: 4,  lightSensitive: false, heatDegradation: null },  // Sodium Stearyl Fumarate
    26: { ph: null, hygroscopicity: 20, lightSensitive: false, heatDegradation: 55  },   // Macrogol 6000 (PEG 6000)
  };
  for (const [idStr, data] of Object.entries(stabilityData)) {
    await prisma.ingredientStability.create({
      data: {
        ingredientId: Number(idStr),
        ph: data.ph,
        hygroscopicity: data.hygroscopicity,
        lightSensitive: data.lightSensitive,
        heatDegradation: data.heatDegradation,
      },
    });
  }
  console.log('IngredientStability records seeded.');

  // Seed IngredientRegulatory for all 26 base ingredients
  console.log('Seeding IngredientRegulatory records...');
  const regulatoryData: Record<number, { pharmacopoeiaGrade: string | null; allergenStatus: string | null }> = {
    1:  { pharmacopoeiaGrade: 'USP-NF',  allergenStatus: null },       // Amlodipine Besylate
    2:  { pharmacopoeiaGrade: 'USP-NF',  allergenStatus: 'Lactose' },  // Lactose Monohydrate
    3:  { pharmacopoeiaGrade: 'USP-NF',  allergenStatus: null },       // Microcrystalline Cellulose
    4:  { pharmacopoeiaGrade: 'USP-NF',  allergenStatus: null },       // Magnesium Stearate
    5:  { pharmacopoeiaGrade: 'EP',       allergenStatus: null },       // Aerosil 200 (Colloidal Silicon Dioxide)
    6:  { pharmacopoeiaGrade: 'USP-NF',  allergenStatus: null },       // Paracetamol
    7:  { pharmacopoeiaGrade: 'USP-NF',  allergenStatus: null },       // Ibuprofen
    8:  { pharmacopoeiaGrade: 'USP-NF',  allergenStatus: null },       // Ascorbic Acid (Vitamin C)
    9:  { pharmacopoeiaGrade: 'USP-NF',  allergenStatus: null },       // Mannitol
    10: { pharmacopoeiaGrade: 'USP-NF',  allergenStatus: null },       // Dicalcium Phosphate
    11: { pharmacopoeiaGrade: 'USP-NF',  allergenStatus: null },       // Croscarmellose Sodium
    12: { pharmacopoeiaGrade: 'USP-NF',  allergenStatus: null },       // Stearic Acid
    13: { pharmacopoeiaGrade: 'EP',       allergenStatus: null },       // Talc
    14: { pharmacopoeiaGrade: 'USP-NF',  allergenStatus: null },       // Aspirin
    15: { pharmacopoeiaGrade: 'USP-NF',  allergenStatus: null },       // Caffeine Anhydrous
    16: { pharmacopoeiaGrade: 'USP-NF',  allergenStatus: null },       // Metformin HCl
    17: { pharmacopoeiaGrade: 'EP',       allergenStatus: null },       // Vitamin D3
    18: { pharmacopoeiaGrade: 'USP-NF',  allergenStatus: null },       // Calcium Carbonate
    19: { pharmacopoeiaGrade: 'USP-NF',  allergenStatus: null },       // Sorbitol
    20: { pharmacopoeiaGrade: 'USP-NF',  allergenStatus: null },       // Sucrose
    21: { pharmacopoeiaGrade: 'USP-NF',  allergenStatus: null },       // Povidone K30 (PVP)
    22: { pharmacopoeiaGrade: 'USP-NF',  allergenStatus: null },       // HPMC
    23: { pharmacopoeiaGrade: 'USP-NF',  allergenStatus: 'Gluten' },   // Pregelatinized Starch
    24: { pharmacopoeiaGrade: 'USP-NF',  allergenStatus: null },       // Sodium Starch Glycolate
    25: { pharmacopoeiaGrade: 'USP-NF',  allergenStatus: null },       // Sodium Stearyl Fumarate
    26: { pharmacopoeiaGrade: 'USP-NF',  allergenStatus: null },       // Macrogol 6000 (PEG 6000)
  };
  for (const [idStr, data] of Object.entries(regulatoryData)) {
    await prisma.ingredientRegulatory.create({
      data: {
        ingredientId: Number(idStr),
        pharmacopoeiaGrade: data.pharmacopoeiaGrade,
        allergenStatus: data.allergenStatus,
      },
    });
  }
  console.log('IngredientRegulatory records seeded.');

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
