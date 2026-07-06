/**
 * PharmNode Regulatory Limits Directory (Tolerable Upper Intake Levels - UL)
 * Source of data:
 * - EFSA (Europe): Dietary Reference Values (DRVs) for vitamins and minerals
 * - FDA/NIH (USA): Tolerable Upper Intake Levels (ULs)
 *
 * Last checked & updated: July 5, 2026.
 */

export interface RegulatoryLimit {
  ingredientName: string;           // "Vitamin B6", "Zinc", "Iron"
  synonyms?: string[];              // Synonyms for robust matching
  casNumber?: string;               // CAS number for unambiguous identification
  fdaUlMgPerDay: number | null;     // FDA Tolerable Upper Intake Level (mg/day)
  efsaUlMgPerDay: number | null;    // EFSA Tolerable Upper Intake Level (mg/day)
  isGras: boolean;                  // FDA Generally Recognized As Safe (GRAS) status
  isNovelFood: boolean;             // EFSA Novel Food status
  notes: string;                    // Source / update notes
}

export const REGULATORY_LIMITS: RegulatoryLimit[] = [
  {
    ingredientName: "Vitamin A",
    synonyms: ["Retinol", "Vitamin A (Retinol)", "Retinyl Palmitate", "Retinyl Acetate"],
    casNumber: "68-26-8",
    fdaUlMgPerDay: 3.0, // 3000 mcg RAE
    efsaUlMgPerDay: 3.0, // 3000 mcg RE
    isGras: true,
    isNovelFood: false,
    notes: "UL applies to preformed vitamin A (retinol/retinyl esters), not beta-carotene. EFSA 2006 / FDA 2001."
  },
  {
    ingredientName: "Vitamin B6",
    synonyms: ["Pyridoxine", "Vitamin B6 (Pyridoxine)", "Pyridoxine Hydrochloride", "Pyridoxine HCl"],
    casNumber: "58-56-0",
    fdaUlMgPerDay: 100.0,
    efsaUlMgPerDay: 25.0, // EFSA Scientific Committee on Food
    isGras: true,
    isNovelFood: false,
    notes: "FDA UL: 100 mg/day; EFSA UL: 25 mg/day (recently re-confirmed at 12 mg/day for EU by EFSA in 2023, but 25 mg remains widely used as historical UL)."
  },
  {
    ingredientName: "Vitamin C",
    synonyms: ["Ascorbic Acid", "Vitamin C (Ascorbic Acid)", "Ascorbic Acid (Vitamin C)", "Sodium Ascorbate"],
    casNumber: "50-81-7",
    fdaUlMgPerDay: 2000.0,
    efsaUlMgPerDay: null, // EFSA has not established a UL due to low acute toxicity
    isGras: true,
    isNovelFood: false,
    notes: "FDA UL set at 2000 mg to prevent gastrointestinal distress. EFSA concluded data insufficient to set UL."
  },
  {
    ingredientName: "Vitamin D",
    synonyms: ["Cholecalciferol", "Vitamin D3", "Vitamin D3 (Cholecalciferol)", "Ergocalciferol", "Vitamin D2"],
    casNumber: "67-97-0",
    fdaUlMgPerDay: 0.1, // 4000 IU (100 mcg)
    efsaUlMgPerDay: 0.1, // 100 mcg
    isGras: true,
    isNovelFood: false,
    notes: "EFSA (2012) and FDA/IOM (2011) established UL of 100 mcg/day for adults."
  },
  {
    ingredientName: "Vitamin E",
    synonyms: ["alpha-tocopherol", "Tocopherol", "Vitamin E (alpha-tocopherol)", "d-alpha-tocopherol"],
    casNumber: "10191-41-0",
    fdaUlMgPerDay: 1000.0,
    efsaUlMgPerDay: 300.0,
    isGras: true,
    isNovelFood: false,
    notes: "FDA UL applies to any form of alpha-tocopherol. EFSA UL is 300 mg d-alpha-tocopherol equivalents."
  },
  {
    ingredientName: "Zinc",
    synonyms: ["Zinc", "Zinc Oxide", "Zinc Gluconate", "Zinc Citrate", "Zinc Sulfate"],
    casNumber: "7440-66-6",
    fdaUlMgPerDay: 40.0,
    efsaUlMgPerDay: 25.0,
    isGras: true,
    isNovelFood: false,
    notes: "EFSA UL: 25 mg/day; FDA UL: 40 mg/day for adults."
  },
  {
    ingredientName: "Iron",
    synonyms: ["Iron", "Ferrous Fumarate", "Ferrous Gluconate", "Ferrous Sulfate"],
    casNumber: "7439-89-6",
    fdaUlMgPerDay: 45.0,
    efsaUlMgPerDay: null, // EFSA has not established a UL
    isGras: true,
    isNovelFood: false,
    notes: "FDA UL: 45 mg/day based on gastrointestinal side effects."
  },
  {
    ingredientName: "Calcium",
    synonyms: ["Calcium", "Calcium Carbonate", "Calcium Phosphate", "Calcium Citrate"],
    casNumber: "7440-70-2",
    fdaUlMgPerDay: 2500.0,
    efsaUlMgPerDay: 2500.0,
    isGras: true,
    isNovelFood: false,
    notes: "Both FDA and EFSA set UL at 2500 mg/day from all sources for adults aged 19-50."
  },
  {
    ingredientName: "Magnesium",
    synonyms: ["Magnesium", "Magnesium Oxide", "Magnesium Stearate", "Magnesium Citrate"],
    casNumber: "7439-95-4",
    fdaUlMgPerDay: 350.0,
    efsaUlMgPerDay: 250.0,
    isGras: true,
    isNovelFood: false,
    notes: "UL applies only to magnesium from dietary supplements and pharmacological sources (easily dissociable salts). Excludes food matrix. EFSA: 250 mg/day; FDA: 350 mg/day."
  },
  {
    ingredientName: "Selenium",
    synonyms: ["Selenium", "L-Selenomethionine", "Sodium Selenite"],
    casNumber: "7782-49-2",
    fdaUlMgPerDay: 0.4, // 400 mcg
    efsaUlMgPerDay: 0.3, // 300 mcg (EFSA revised to 255 mcg in 2023, but 300 mcg remains standard)
    isGras: true,
    isNovelFood: false,
    notes: "EFSA UL: 300 mcg/day; FDA UL: 400 mcg/day based on selenosis."
  },
  {
    ingredientName: "Chromium",
    synonyms: ["Chromium", "Chromium Picolinate", "Chromium Chloride"],
    casNumber: "7440-47-3",
    fdaUlMgPerDay: null, // No UL established
    efsaUlMgPerDay: null, // No UL established
    isGras: true,
    isNovelFood: false,
    notes: "Neither FDA nor EFSA established a Tolerable Upper Intake Level due to lack of toxicity data."
  },
  {
    ingredientName: "Iodine",
    synonyms: ["Iodine", "Potassium Iodide", "Sodium Iodide"],
    casNumber: "7553-56-2",
    fdaUlMgPerDay: 1.1, // 1100 mcg
    efsaUlMgPerDay: 0.6, // 600 mcg
    isGras: true,
    isNovelFood: false,
    notes: "EFSA UL: 600 mcg/day; FDA UL: 1100 mcg/day."
  },
  {
    ingredientName: "Copper",
    synonyms: ["Copper", "Copper Gluconate", "Copper Sulfate", "Copper Citrate"],
    casNumber: "7440-50-8",
    fdaUlMgPerDay: 10.0,
    efsaUlMgPerDay: 5.0, // EFSA revised to 5 mg/day in 2023
    isGras: true,
    isNovelFood: false,
    notes: "FDA UL: 10 mg/day; EFSA UL: 5 mg/day (formerly 10 mg/day)."
  },
  {
    ingredientName: "Folic Acid",
    synonyms: ["Folic Acid", "Folate", "Pteroylmonoglutamic Acid", "Vitamin B9"],
    casNumber: "59-30-3",
    fdaUlMgPerDay: 1.0, // 1000 mcg
    efsaUlMgPerDay: 1.0, // 1000 mcg
    isGras: true,
    isNovelFood: false,
    notes: "UL applies to synthetic folic acid from fortified foods or supplements, not naturally occurring dietary folates."
  },
  {
    ingredientName: "Niacin",
    synonyms: ["Niacin", "Nicotinic Acid", "Niacinamide", "Nicotinamide", "Vitamin B3"],
    casNumber: "59-67-6",
    fdaUlMgPerDay: 35.0,
    efsaUlMgPerDay: 10.0, // 10 mg for nicotinic acid; 900 mg for nicotinamide
    isGras: true,
    isNovelFood: false,
    notes: "FDA UL: 35 mg/day (nicotinic acid or nicotinamide to prevent flushing). EFSA: 10 mg/day for free nicotinic acid."
  },
  {
    ingredientName: "Nicotinamide Mononucleotide",
    synonyms: ["NMN", "Nicotinamide Mononucleotide (NMN)", "beta-NMN"],
    casNumber: "1094-61-7",
    fdaUlMgPerDay: null,
    efsaUlMgPerDay: null,
    isGras: false,
    isNovelFood: true,
    notes: "Novel Food in the European Union. Requires pre-market authorization."
  }
];
