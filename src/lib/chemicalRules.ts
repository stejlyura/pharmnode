export interface ChemicalClass {
  id: number;
  name: string;
  category: string;
}

export interface CompatibilityRule {
  classA: number;
  classB: number;
  type: 'incompatible' | 'synergy';
  severity: 'error' | 'warning';
  title: string;
  message: string;
  suggestion: string;
}

export const CHEMICAL_CLASSES: ChemicalClass[] = [
  // Amines
  { id: 1, category: "Amines and Nitrogen-containing", name: "Primary and secondary amines" },
  { id: 2, category: "Amines and Nitrogen-containing", name: "Tertiary amines and quaternary salts" },
  { id: 3, category: "Amines and Nitrogen-containing", name: "Amides and Imides" },
  { id: 4, category: "Amines and Nitrogen-containing", name: "Sulfonamides / Thiazides" },
  { id: 5, category: "Amines and Nitrogen-containing", name: "Alkaloids / Xanthines" },

  // Acids and Salts
  { id: 6, category: "Acids, Salts and Esters", name: "Organic acids (aliphatic)" },
  { id: 7, category: "Acids, Salts and Esters", name: "Organic acids (aromatic)" },
  { id: 8, category: "Acids, Salts and Esters", name: "Esters" },
  { id: 9, category: "Acids, Salts and Esters", name: "Alkaline salts of fatty acids (Stearates)" },
  { id: 10, category: "Acids, Salts and Esters", name: "Alkaline inorganic salts (Carbonates)" },
  { id: 11, category: "Acids, Salts and Esters", name: "Neutral inorganic salts" },
  { id: 12, category: "Acids, Salts and Esters", name: "Acid inorganic salts" },
  { id: 13, category: "Acids, Salts and Esters", name: "Calcium phosphates" },

  // Carbohydrates and Polymers
  { id: 14, category: "Carbohydrates and Polymers", name: "Reducing sugars (Lactose)" },
  { id: 15, category: "Carbohydrates and Polymers", name: "Non-reducing sugars (Sucrose)" },
  { id: 16, category: "Carbohydrates and Polymers", name: "Polysaccharides (MCC, Starch)" },
  { id: 17, category: "Carbohydrates and Polymers", name: "Polyols (Mannitol, Sorbitol)" },
  { id: 18, category: "Carbohydrates and Polymers", name: "Modified celluloses / SSG" },
  { id: 19, category: "Carbohydrates and Polymers", name: "Water-soluble synthetic polymers (PVP, PEG)" },
  { id: 20, category: "Carbohydrates and Polymers", name: "Insoluble synthetic polymers" },

  // Specific groups
  { id: 21, category: "Specific organic groups", name: "Phenols" },
  { id: 22, category: "Specific organic groups", name: "Steroids / Hormones" },
  { id: 23, category: "Specific organic groups", name: "Fat-soluble vitamins" },
  { id: 24, category: "Specific organic groups", name: "Water-soluble vitamins" },
  { id: 25, category: "Specific organic groups", name: "Glycosides" },
  { id: 26, category: "Specific organic groups", name: "Lipids, waxes, fatty acids" },
  { id: 27, category: "Specific organic groups", name: "Proteins, peptides, enzymes" },

  // Minerals and Others
  { id: 28, category: "Minerals and Others", name: "Silicates and silicon dioxide" },
  { id: 29, category: "Minerals and Others", name: "Metal oxides" },
  { id: 30, category: "Minerals and Others", name: "Peroxides / Oxidizers" },
  { id: 31, category: "Minerals and Others", name: "Reducing agents / Antioxidants" },
  { id: 32, category: "Minerals and Others", name: "Halogenated compounds" },
  { id: 33, category: "Minerals and Others", name: "Essential oils / Terpenes" },
  { id: 34, category: "Minerals and Others", name: "Sorbents" },
  { id: 35, category: "Minerals and Others", name: "Inert / Other" },
];

export const COMPATIBILITY_RULES: CompatibilityRule[] = [
  // Maillard Reaction
  { classA: 1, classB: 14, type: 'incompatible', severity: 'error', title: 'Maillard Reaction', message: 'Primary amine group reacts with the aldehyde (reducing) group of sugar. In the presence of moisture, this causes browning of the blend, formation of toxic adducts, and loss of API activity.', suggestion: 'Replace the reducing sugar with inert one (Sucrose), Mannitol, or MCC.' },

  // Alkaline degradation of amines
  { classA: 1, classB: 9, type: 'incompatible', severity: 'error', title: 'Alkaline Degradation', message: 'Alkaline salts (Stearates) create a local alkaline microenvironment, accelerating hydrolytic cleavage of amines in a moist environment.', suggestion: 'Replace magnesium stearate with stearic acid or PRUV (SSF).' },
  { classA: 1, classB: 10, type: 'incompatible', severity: 'error', title: 'Alkaline Degradation', message: 'Carbonates and other alkaline inorganic salts degrade primary amines.', suggestion: 'Avoid strong alkaline agents.' },

  // Acid-Base reactions
  { classA: 6, classB: 9, type: 'incompatible', severity: 'warning', title: 'Acid-Base Interaction', message: 'Aliphatic organic acid reacts with alkaline lubricant, disrupting the lubricating grid of the stearate.', suggestion: 'Use an acidic or neutral lubricant.' },
  { classA: 7, classB: 9, type: 'incompatible', severity: 'warning', title: 'Acid-Base Interaction', message: 'Aromatic organic acid reacts with alkaline lubricant, disrupting the lubricating grid of the stearate.', suggestion: 'Use an acidic or neutral lubricant.' },
  { classA: 6, classB: 10, type: 'incompatible', severity: 'error', title: 'Gas Formation', message: 'Organic acids react with carbonates releasing carbon dioxide in a moist environment, which will lead to swelling and destruction of the tablet.', suggestion: 'Avoid carbonates unless it is an effervescent tablet.' },

  // Phenols and polymers complexation
  { classA: 21, classB: 19, type: 'incompatible', severity: 'warning', title: 'Complexation', message: 'Phenolic groups are capable of forming hydrogen bonds with polymer chains (PVP, PEG), which may delay dissolution in vitro.', suggestion: 'Check dissolution kinetics; it may be necessary to increase the disintegrant share.' },

  // Vitamins and Metals/Alkalis
  { classA: 23, classB: 9, type: 'incompatible', severity: 'error', title: 'Vitamin Degradation', message: 'Fat-soluble vitamins are extremely sensitive to the alkaline environment of stearates.', suggestion: 'Use antioxidants and neutral fillers.' },
  { classA: 23, classB: 10, type: 'incompatible', severity: 'error', title: 'Vitamin Degradation', message: 'Fat-soluble vitamins oxidize in the alkaline environment of inorganic salts.', suggestion: 'Use antioxidants and neutral fillers.' },
  { classA: 23, classB: 28, type: 'incompatible', severity: 'error', title: 'Vitamin Degradation', message: 'Trace amounts of heavy metals in silicates (Talc) catalyze vitamin oxidation.', suggestion: 'Avoid talc or use chelating agents (EDTA).' },
  { classA: 23, classB: 13, type: 'incompatible', severity: 'error', title: 'Vitamin Degradation', message: 'Calcium ions and trace metals in phosphates catalyze vitamin degradation.', suggestion: 'Avoid inorganic salts.' },
  { classA: 6, classB: 13, type: 'incompatible', severity: 'error', title: 'Metal-Catalyzed Oxidation', message: 'Divalent calcium ions in the phosphate catalyze the oxidation of aliphatic organic acids (e.g. Vitamin C).', suggestion: 'Use Mannitol or MCC.' },

  // Calcium salts and organic acids
  { classA: 7, classB: 13, type: 'incompatible', severity: 'warning', title: 'Insoluble Salt Formation', message: 'Interaction of an aromatic organic acid with a calcium salt forms poorly soluble complexes, reducing bioavailability.', suggestion: 'Replace with a neutral filler.' },
  { classA: 26, classB: 13, type: 'incompatible', severity: 'warning', title: 'In situ Saponification', message: 'Fatty acids (Stearic acid) form insoluble calcium salts upon contact with phosphates.', suggestion: 'Consider replacing the lubricant.' },

  // Amines and polyols
  { classA: 1, classB: 17, type: 'incompatible', severity: 'warning', title: 'Reaction with Microimpurities', message: 'Polyols (Sorbitol) may contain trace amounts of reducing sugars that react with primary amines.', suggestion: 'Use purified Mannitol or MCC.' },

  // Proteins
  { classA: 27, classB: 9, type: 'incompatible', severity: 'warning', title: 'Denaturation in Alkaline Medium', message: 'Proteins and enzymes are prone to alkaline hydrolysis in the presence of alkaline salts.', suggestion: 'Use a neutral environment.' }
];

export function getCompatibilityRule(classA: number, classB: number): CompatibilityRule | null {
  for (const rule of COMPATIBILITY_RULES) {
    if ((rule.classA === classA && rule.classB === classB) || (rule.classA === classB && rule.classB === classA)) {
      return rule;
    }
  }
  return null;
}

export function getIngredientsCompatibilityRule(
  ingA: { chemicalClassId: number; activeMolecules?: { chemicalClassId: number }[] | null },
  ingB: { chemicalClassId: number; activeMolecules?: { chemicalClassId: number }[] | null }
): CompatibilityRule | null {
  const moleculesA = ingA.activeMolecules && ingA.activeMolecules.length > 0
    ? ingA.activeMolecules
    : [{ chemicalClassId: ingA.chemicalClassId }];

  const moleculesB = ingB.activeMolecules && ingB.activeMolecules.length > 0
    ? ingB.activeMolecules
    : [{ chemicalClassId: ingB.chemicalClassId }];

  for (const mA of moleculesA) {
    for (const mB of moleculesB) {
      const rule = getCompatibilityRule(mA.chemicalClassId, mB.chemicalClassId);
      if (rule) return rule;
    }
  }
  return null;
}
