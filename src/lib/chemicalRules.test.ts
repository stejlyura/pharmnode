import { describe, it, expect } from 'vitest';
import {
  CHEMICAL_CLASSES,
  COMPATIBILITY_RULES,
  getCompatibilityRule,
  getIngredientsCompatibilityRule
} from './chemicalRules';

describe('Chemical Compatibility Rules', () => {
  describe('CHEMICAL_CLASSES list validation', () => {
    it('should contain exactly 35 chemical classes', () => {
      expect(CHEMICAL_CLASSES.length).toBe(35);
    });

    it('should have valid properties for all classes', () => {
      CHEMICAL_CLASSES.forEach(c => {
        expect(c.id).toBeGreaterThanOrEqual(1);
        expect(c.id).toBeLessThanOrEqual(35);
        expect(c.name).toBeTruthy();
        expect(c.category).toBeTruthy();
      });
    });

    it('should have unique IDs for all classes', () => {
      const ids = CHEMICAL_CLASSES.map(c => c.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(35);
    });
  });

  describe('getCompatibilityRule symmetric lookup', () => {
    it('should look up rules symmetrically (order-independent)', () => {
      // Maillard reaction (class 1 + class 14)
      const ruleForward = getCompatibilityRule(1, 14);
      const ruleBackward = getCompatibilityRule(14, 1);

      expect(ruleForward).not.toBeNull();
      expect(ruleBackward).not.toBeNull();
      expect(ruleForward).toEqual(ruleBackward);

      expect(ruleForward?.title).toBe('Реакция Майяра');
      expect(ruleForward?.type).toBe('incompatible');
      expect(ruleForward?.severity).toBe('error');
    });

    it('should return null for compatible classes', () => {
      // Class 1 (Primary/Secondary Amines) and Class 35 (Inert/Other) should be compatible
      const rule = getCompatibilityRule(1, 35);
      expect(rule).toBeNull();
    });
  });

  describe('getIngredientsCompatibilityRule logic', () => {
    it('should resolve compatibility for standard simple ingredients', () => {
      const ingAmines = { chemicalClassId: 1 };
      const ingLactose = { chemicalClassId: 14 };
      const ingInert = { chemicalClassId: 35 };

      // Incompatible
      const incompatibleRule = getIngredientsCompatibilityRule(ingAmines, ingLactose);
      expect(incompatibleRule).not.toBeNull();
      expect(incompatibleRule?.title).toBe('Реакция Майяра');

      // Compatible
      const compatibleRule = getIngredientsCompatibilityRule(ingAmines, ingInert);
      expect(compatibleRule).toBeNull();
    });

    it('should resolve compatibility using nested activeMolecules when present', () => {
      // Ingredient with chemicalClassId 35 (inert) but contains active molecules of class 1 (primary amines)
      const ingComplexAmines = {
        chemicalClassId: 35,
        activeMolecules: [
          { chemicalClassId: 1 }
        ]
      };
      const ingLactose = { chemicalClassId: 14 };

      const rule = getIngredientsCompatibilityRule(ingComplexAmines, ingLactose);
      expect(rule).not.toBeNull();
      expect(rule?.title).toBe('Реакция Майяра');
    });

    it('should fallback to base chemicalClassId when activeMolecules is empty or null', () => {
      const ingEmptyList = {
        chemicalClassId: 1,
        activeMolecules: []
      };
      const ingNullList = {
        chemicalClassId: 1,
        activeMolecules: null
      };
      const ingLactose = { chemicalClassId: 14 };

      const rule1 = getIngredientsCompatibilityRule(ingEmptyList, ingLactose);
      expect(rule1).not.toBeNull();
      expect(rule1?.title).toBe('Реакция Майяра');

      const rule2 = getIngredientsCompatibilityRule(ingNullList, ingLactose);
      expect(rule2).not.toBeNull();
      expect(rule2?.title).toBe('Реакция Майяра');
    });

    it('should resolve correctly when both ingredients have multiple activeMolecules', () => {
      const ingMultiA = {
        chemicalClassId: 35,
        activeMolecules: [
          { chemicalClassId: 5 },
          { chemicalClassId: 21 } // Phenol
        ]
      };
      const ingMultiB = {
        chemicalClassId: 35,
        activeMolecules: [
          { chemicalClassId: 19 } // PVP/PEG (polymer)
        ]
      };

      // Phenols (21) + Polymers (19) -> Complexation warning
      const rule = getIngredientsCompatibilityRule(ingMultiA, ingMultiB);
      expect(rule).not.toBeNull();
      expect(rule?.title).toBe('Комплексообразование');
      expect(rule?.severity).toBe('warning');
    });
  });

  describe('Specific Compatibility Matrix Rules verification', () => {
    // Helper to assert rule properties
    const verifyRule = (classA: number, classB: number, expectedTitle: string, expectedSeverity: 'error' | 'warning') => {
      const rule = getCompatibilityRule(classA, classB);
      expect(rule).not.toBeNull();
      expect(rule?.title).toBe(expectedTitle);
      expect(rule?.severity).toBe(expectedSeverity);
      expect(rule?.message).toBeTruthy();
      expect(rule?.suggestion).toBeTruthy();
    };

    it('verifies Maillard Reaction rule', () => {
      verifyRule(1, 14, 'Реакция Майяра', 'error');
    });

    it('verifies Alkaline degradation rules', () => {
      verifyRule(1, 9, 'Щелочная деградация', 'error');
      verifyRule(1, 10, 'Щелочная деградация', 'error');
    });

    it('verifies Acid-Base reaction rules', () => {
      verifyRule(6, 9, 'Кислотно-основное взаимодействие', 'warning');
      verifyRule(7, 9, 'Кислотно-основное взаимодействие', 'warning');
      verifyRule(6, 10, 'Газообразование', 'error');
    });

    it('verifies Phenols and polymers complexation rule', () => {
      verifyRule(21, 19, 'Комплексообразование', 'warning');
    });

    it('verifies Vitamin degradation rules', () => {
      verifyRule(23, 9, 'Деградация витамина', 'error');
      verifyRule(23, 10, 'Деградация витамина', 'error');
      verifyRule(23, 28, 'Деградация витамина', 'error');
      verifyRule(23, 13, 'Деградация витамина', 'error');
      verifyRule(6, 13, 'Металл-катализируемое окисление', 'error');
    });

    it('verifies Calcium salts and organic/fatty acids rules', () => {
      verifyRule(7, 13, 'Образование нерастворимых солей', 'warning');
      verifyRule(26, 13, 'Омыление in situ', 'warning');
    });

    it('verifies Amines and polyols warning', () => {
      verifyRule(1, 17, 'Реакция с микропримесями', 'warning');
    });

    it('verifies Protein denaturation rule', () => {
      verifyRule(27, 9, 'Денатурация в щелочной среде', 'warning');
    });
  });
});
