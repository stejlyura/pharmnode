export type IngredientRole = 'active' | 'filler' | 'lubricant' | 'glidant' | 'dry-binder';

export interface Ingredient {
  id: number | string;
  name: string;
  casNumber?: string;
  role: IngredientRole;
  chemicalClassId: number;
  looseBulkDensity: number;
  tappedBulkDensity: number;
  trueDensity?: number;
  averageParticleSizeUm?: number;
  isAllergen?: boolean;
  costPerKgUsd: number;
  maxSafePercentage: number;
  
  // Knowledge Base fields
  benefit?: number;
  risk?: number;
  cost?: number;
  stability?: number;
  manufacturability?: number;
}

export const baseIngredientsMatrix: Ingredient[] = [
  {
    id: 1,
    name: "Amlodipine Besylate",
    casNumber: "111470-99-6",
    role: "active",
    chemicalClassId: 1, // Primary/Secondary Amines
    looseBulkDensity: 0.35,
    tappedBulkDensity: 0.48,
    trueDensity: 1.38,
    averageParticleSizeUm: 50,
    isAllergen: false,
    costPerKgUsd: 450.00,
    maxSafePercentage: 20.00,
    benefit: 80,
    risk: 20,
    cost: 450.00,
    stability: 75,
    manufacturability: 70
  },
  {
    id: 2,
    name: "Lactose Monohydrate",
    casNumber: "10039-26-6",
    role: "filler",
    chemicalClassId: 14, // Reducing Sugars
    looseBulkDensity: 0.60,
    tappedBulkDensity: 0.90,
    trueDensity: 1.54,
    averageParticleSizeUm: 75,
    isAllergen: true,
    costPerKgUsd: 4.50,
    maxSafePercentage: 90.00,
    benefit: 5,
    risk: 15,
    cost: 4.50,
    stability: 85,
    manufacturability: 90
  },
  {
    id: 3,
    name: "Microcrystalline Cellulose PH-102",
    casNumber: "9004-34-6",
    role: "dry-binder",
    chemicalClassId: 16, // Polysaccharides
    looseBulkDensity: 0.30,
    tappedBulkDensity: 0.45,
    trueDensity: 1.56,
    averageParticleSizeUm: 100,
    isAllergen: false,
    costPerKgUsd: 8.20,
    maxSafePercentage: 95.00,
    benefit: 10,
    risk: 5,
    cost: 8.20,
    stability: 95,
    manufacturability: 95
  },
  {
    id: 4,
    name: "Magnesium Stearate",
    casNumber: "557-04-0",
    role: "lubricant",
    chemicalClassId: 9, // Alkaline salts of fatty acids
    looseBulkDensity: 0.15,
    tappedBulkDensity: 0.28,
    trueDensity: 1.03,
    averageParticleSizeUm: 10,
    isAllergen: false,
    costPerKgUsd: 12.00,
    maxSafePercentage: 1.50,
    benefit: 5,
    risk: 10,
    cost: 12.00,
    stability: 90,
    manufacturability: 85
  },
  {
    id: 5,
    name: "Aerosil 200",
    casNumber: "7631-86-9",
    role: "glidant",
    chemicalClassId: 28, // Silicates/Silicon dioxide
    looseBulkDensity: 0.05,
    tappedBulkDensity: 0.12,
    trueDensity: 2.20,
    averageParticleSizeUm: 0.015,
    isAllergen: false,
    costPerKgUsd: 18.50,
    maxSafePercentage: 2.00,
    benefit: 5,
    risk: 5,
    cost: 18.50,
    stability: 95,
    manufacturability: 90
  },
  {
    id: 6,
    name: "Paracetamol (Acetaminophen)",
    casNumber: "103-90-2",
    role: "active",
    chemicalClassId: 21, // Phenols
    looseBulkDensity: 0.45,
    tappedBulkDensity: 0.65,
    trueDensity: 1.29,
    averageParticleSizeUm: 60,
    isAllergen: false,
    costPerKgUsd: 15.00,
    maxSafePercentage: 50.00,
    benefit: 85,
    risk: 15,
    cost: 15.00,
    stability: 80,
    manufacturability: 85
  },
  {
    id: 7,
    name: "Ibuprofen",
    casNumber: "15687-27-1",
    role: "active",
    chemicalClassId: 7, // Aromatic organic acids
    looseBulkDensity: 0.38,
    tappedBulkDensity: 0.55,
    trueDensity: 1.18,
    averageParticleSizeUm: 50,
    isAllergen: false,
    costPerKgUsd: 22.00,
    maxSafePercentage: 40.00,
    benefit: 80,
    risk: 20,
    cost: 22.00,
    stability: 80,
    manufacturability: 80
  },
  {
    id: 8,
    name: "Ascorbic Acid (Vitamin C)",
    casNumber: "50-81-7",
    role: "active",
    chemicalClassId: 6, // Aliphatic organic acids
    looseBulkDensity: 0.55,
    tappedBulkDensity: 0.82,
    trueDensity: 1.65,
    averageParticleSizeUm: 80,
    isAllergen: false,
    costPerKgUsd: 18.00,
    maxSafePercentage: 30.00,
    benefit: 85,
    risk: 10,
    cost: 18.00,
    stability: 70,
    manufacturability: 75
  },
  {
    id: 9,
    name: "Mannitol (Direct Compression)",
    casNumber: "69-65-8",
    role: "filler",
    chemicalClassId: 17, // Polyols
    looseBulkDensity: 0.52,
    tappedBulkDensity: 0.70,
    trueDensity: 1.52,
    averageParticleSizeUm: 150,
    isAllergen: false,
    costPerKgUsd: 7.50,
    maxSafePercentage: 85.00,
    benefit: 10,
    risk: 5,
    cost: 7.50,
    stability: 90,
    manufacturability: 85
  },
  {
    id: 10,
    name: "Dicalcium Phosphate Dihydrate",
    casNumber: "7789-77-7",
    role: "filler",
    chemicalClassId: 13, // Phosphates
    looseBulkDensity: 0.85,
    tappedBulkDensity: 1.15,
    trueDensity: 2.89,
    averageParticleSizeUm: 90,
    isAllergen: false,
    costPerKgUsd: 3.80,
    maxSafePercentage: 80.00,
    benefit: 5,
    risk: 10,
    cost: 3.80,
    stability: 90,
    manufacturability: 85
  },
  {
    id: 11,
    name: "Croscarmellose Sodium",
    casNumber: "74811-65-7",
    role: "dry-binder",
    chemicalClassId: 18, // Modified celluloses
    looseBulkDensity: 0.40,
    tappedBulkDensity: 0.58,
    trueDensity: 1.50,
    averageParticleSizeUm: 50,
    isAllergen: false,
    costPerKgUsd: 14.50,
    maxSafePercentage: 6.00,
    benefit: 10,
    risk: 5,
    cost: 14.50,
    stability: 90,
    manufacturability: 85
  },
  {
    id: 12,
    name: "Stearic Acid",
    casNumber: "57-11-4",
    role: "lubricant",
    chemicalClassId: 26, // Fatty acids
    looseBulkDensity: 0.30,
    tappedBulkDensity: 0.48,
    trueDensity: 0.94,
    averageParticleSizeUm: 20,
    isAllergen: false,
    costPerKgUsd: 9.80,
    maxSafePercentage: 3.00,
    benefit: 5,
    risk: 10,
    cost: 9.80,
    stability: 90,
    manufacturability: 85
  },
  {
    id: 13,
    name: "Talc (Ph. Eur.)",
    casNumber: "14807-96-6",
    role: "glidant",
    chemicalClassId: 28, // Silicates
    looseBulkDensity: 0.35,
    tappedBulkDensity: 0.52,
    trueDensity: 2.70,
    averageParticleSizeUm: 25,
    isAllergen: false,
    costPerKgUsd: 5.20,
    maxSafePercentage: 5.00,
    benefit: 5,
    risk: 10,
    cost: 5.20,
    stability: 90,
    manufacturability: 85
  },
  {
    id: 14,
    name: "Aspirin (Acetylsalicylic Acid)",
    casNumber: "50-78-2",
    role: "active",
    chemicalClassId: 7, // Aromatic organic acids
    looseBulkDensity: 0.40,
    tappedBulkDensity: 0.60,
    trueDensity: 1.40,
    averageParticleSizeUm: 70,
    isAllergen: false,
    costPerKgUsd: 10.00,
    maxSafePercentage: 40.00,
    benefit: 75,
    risk: 25,
    cost: 10.00,
    stability: 75,
    manufacturability: 80
  },
  {
    id: 15,
    name: "Caffeine Anhydrous",
    casNumber: "58-08-2",
    role: "active",
    chemicalClassId: 5, // Alkaloids / Xanthines
    looseBulkDensity: 0.35,
    tappedBulkDensity: 0.55,
    trueDensity: 1.23,
    averageParticleSizeUm: 50,
    isAllergen: false,
    costPerKgUsd: 25.00,
    maxSafePercentage: 30.00,
    benefit: 70,
    risk: 20,
    cost: 25.00,
    stability: 85,
    manufacturability: 85
  },
  {
    id: 16,
    name: "Metformin Hydrochloride",
    casNumber: "1115-70-4",
    role: "active",
    chemicalClassId: 2, // Tertiary amines / Salts
    looseBulkDensity: 0.50,
    tappedBulkDensity: 0.70,
    trueDensity: 1.36,
    averageParticleSizeUm: 80,
    isAllergen: false,
    costPerKgUsd: 12.00,
    maxSafePercentage: 85.00,
    benefit: 85,
    risk: 15,
    cost: 12.00,
    stability: 85,
    manufacturability: 80
  },
  {
    id: 17,
    name: "Vitamin D3 (Cholecalciferol)",
    casNumber: "67-97-0",
    role: "active",
    chemicalClassId: 23, // Fat-soluble vitamins
    looseBulkDensity: 0.45,
    tappedBulkDensity: 0.65,
    trueDensity: 1.05,
    averageParticleSizeUm: 30,
    isAllergen: false,
    costPerKgUsd: 1200.00,
    maxSafePercentage: 1.00,
    benefit: 90,
    risk: 5,
    cost: 1200.00,
    stability: 65,
    manufacturability: 70
  },
  {
    id: 18,
    name: "Calcium Carbonate",
    casNumber: "471-34-1",
    role: "filler",
    chemicalClassId: 10, // Alkaline inorganic salts
    looseBulkDensity: 0.70,
    tappedBulkDensity: 1.10,
    trueDensity: 2.71,
    averageParticleSizeUm: 15,
    isAllergen: false,
    costPerKgUsd: 2.50,
    maxSafePercentage: 80.00,
    benefit: 5,
    risk: 5,
    cost: 2.50,
    stability: 95,
    manufacturability: 85
  },
  {
    id: 19,
    name: "Sorbitol",
    casNumber: "50-70-4",
    role: "filler",
    chemicalClassId: 17, // Polyols
    looseBulkDensity: 0.60,
    tappedBulkDensity: 0.75,
    trueDensity: 1.49,
    averageParticleSizeUm: 150,
    isAllergen: false,
    costPerKgUsd: 6.00,
    maxSafePercentage: 70.00,
    benefit: 10,
    risk: 5,
    cost: 6.00,
    stability: 85,
    manufacturability: 80
  },
  {
    id: 20,
    name: "Sucrose",
    casNumber: "57-50-1",
    role: "filler",
    chemicalClassId: 15, // Non-reducing sugars
    looseBulkDensity: 0.65,
    tappedBulkDensity: 0.85,
    trueDensity: 1.59,
    averageParticleSizeUm: 100,
    isAllergen: false,
    costPerKgUsd: 2.00,
    maxSafePercentage: 80.00,
    benefit: 5,
    risk: 5,
    cost: 2.00,
    stability: 90,
    manufacturability: 85
  },
  {
    id: 21,
    name: "Povidone K30 (PVP)",
    casNumber: "9003-39-8",
    role: "dry-binder",
    chemicalClassId: 19, // Synthetic polymers
    looseBulkDensity: 0.30,
    tappedBulkDensity: 0.40,
    trueDensity: 1.18,
    averageParticleSizeUm: 50,
    isAllergen: false,
    costPerKgUsd: 28.00,
    maxSafePercentage: 10.00,
    benefit: 10,
    risk: 5,
    cost: 28.00,
    stability: 90,
    manufacturability: 85
  },
  {
    id: 22,
    name: "Hydroxypropyl Methylcellulose (HPMC)",
    casNumber: "9004-65-3",
    role: "dry-binder",
    chemicalClassId: 18, // Modified cellulose
    looseBulkDensity: 0.35,
    tappedBulkDensity: 0.50,
    trueDensity: 1.33,
    averageParticleSizeUm: 80,
    isAllergen: false,
    costPerKgUsd: 32.00,
    maxSafePercentage: 30.00,
    benefit: 10,
    risk: 5,
    cost: 32.00,
    stability: 90,
    manufacturability: 85
  },
  {
    id: 23,
    name: "Pregelatinized Starch",
    casNumber: "9005-25-8",
    role: "dry-binder",
    chemicalClassId: 16, // Polysaccharides
    looseBulkDensity: 0.50,
    tappedBulkDensity: 0.70,
    trueDensity: 1.50,
    averageParticleSizeUm: 65,
    isAllergen: false,
    costPerKgUsd: 6.50,
    maxSafePercentage: 20.00,
    benefit: 10,
    risk: 5,
    cost: 6.50,
    stability: 90,
    manufacturability: 85
  },
  {
    id: 24,
    name: "Sodium Starch Glycolate",
    casNumber: "9063-38-1",
    role: "dry-binder",
    chemicalClassId: 18, // Modified cellulose/polysaccharides
    looseBulkDensity: 0.43,
    tappedBulkDensity: 0.60,
    trueDensity: 1.49,
    averageParticleSizeUm: 40,
    isAllergen: false,
    costPerKgUsd: 16.00,
    maxSafePercentage: 8.00,
    benefit: 10,
    risk: 5,
    cost: 16.00,
    stability: 90,
    manufacturability: 85
  },
  {
    id: 25,
    name: "Sodium Stearyl Fumarate",
    casNumber: "4070-80-8",
    role: "lubricant",
    chemicalClassId: 9, // Alkaline salts of fatty acids
    looseBulkDensity: 0.25,
    tappedBulkDensity: 0.40,
    trueDensity: 1.20,
    averageParticleSizeUm: 20,
    isAllergen: false,
    costPerKgUsd: 45.00,
    maxSafePercentage: 2.00,
    benefit: 5,
    risk: 5,
    cost: 45.00,
    stability: 90,
    manufacturability: 85
  },
  {
    id: 26,
    name: "Macrogol 6000 (PEG 6000)",
    casNumber: "25322-68-3",
    role: "lubricant",
    chemicalClassId: 19, // Synthetic polymers
    looseBulkDensity: 0.40,
    tappedBulkDensity: 0.60,
    trueDensity: 1.15,
    averageParticleSizeUm: 100,
    isAllergen: false,
    costPerKgUsd: 14.00,
    maxSafePercentage: 5.00,
    benefit: 5,
    risk: 5,
    cost: 14.00,
    stability: 90,
    manufacturability: 85
  }
];
