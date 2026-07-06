import { describe, it, expect } from 'vitest';
import { REGULATORY_LIMITS } from '@/lib/regulatoryLimits';

describe('Regulatory Limits Directory', () => {
  it('should have at least 15 valid regulatory limits', () => {
    expect(REGULATORY_LIMITS.length).toBeGreaterThanOrEqual(15);
  });

  it('should contain correct values (no NaN, non-negative limits)', () => {
    for (const limit of REGULATORY_LIMITS) {
      // Check names
      expect(limit.ingredientName).toBeDefined();
      expect(limit.ingredientName.length).toBeGreaterThan(0);

      // FDA UL check
      if (limit.fdaUlMgPerDay !== null) {
        expect(Number.isNaN(limit.fdaUlMgPerDay)).toBe(false);
        expect(limit.fdaUlMgPerDay).toBeGreaterThanOrEqual(0);
      }

      // EFSA UL check
      if (limit.efsaUlMgPerDay !== null) {
        expect(Number.isNaN(limit.efsaUlMgPerDay)).toBe(false);
        expect(limit.efsaUlMgPerDay).toBeGreaterThanOrEqual(0);
      }

      // Check booleans
      expect(typeof limit.isGras).toBe('boolean');
      expect(typeof limit.isNovelFood).toBe('boolean');
    }
  });

  it('should find specific standard substances in the directory', () => {
    const vitaminC = REGULATORY_LIMITS.find(l => l.ingredientName === "Vitamin C");
    expect(vitaminC).toBeDefined();
    expect(vitaminC?.fdaUlMgPerDay).toBe(2000);
    expect(vitaminC?.efsaUlMgPerDay).toBeNull();

    const vitaminD = REGULATORY_LIMITS.find(l => l.ingredientName === "Vitamin D");
    expect(vitaminD).toBeDefined();
    expect(vitaminD?.fdaUlMgPerDay).toBe(0.1);
    expect(vitaminD?.efsaUlMgPerDay).toBe(0.1);

    const zinc = REGULATORY_LIMITS.find(l => l.ingredientName === "Zinc");
    expect(zinc).toBeDefined();
    expect(zinc?.fdaUlMgPerDay).toBe(40);
    expect(zinc?.efsaUlMgPerDay).toBe(25);
  });
});
