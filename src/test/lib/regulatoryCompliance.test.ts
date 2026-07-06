import { describe, it, expect } from 'vitest';
import { checkRegulatoryCompliance } from '@/lib/calculator';
import type { Ingredient } from '@/types/pharm';

describe('checkRegulatoryCompliance', () => {
  const vitaminB6: Ingredient = {
    id: 'ing-b6',
    name: 'Vitamin B6 (Pyridoxine)',
    casNumber: '58-56-0',
    role: 'active',
    chemicalClassId: 23,
    looseBulkDensity: 0.4,
    tappedBulkDensity: 0.5,
    trueDensity: 1.2,
    averageParticleSizeUm: 50,
    isAllergen: false,
    costPerKgUsd: 150,
    maxSafePercentage: 100,
  } as any;

  const nmn: Ingredient = {
    id: 'ing-nmn',
    name: 'Nicotinamide Mononucleotide (NMN)',
    casNumber: '1094-61-7',
    role: 'active',
    chemicalClassId: 23,
    looseBulkDensity: 0.4,
    tappedBulkDensity: 0.5,
    trueDensity: 1.2,
    averageParticleSizeUm: 50,
    isAllergen: false,
    costPerKgUsd: 150,
    maxSafePercentage: 100,
  } as any;

  it('should report no warnings for safe doses', () => {
    const ingredients = [
      { ingredient: vitaminB6, percentage: 5 } // 5% of 200mg = 10mg dose
    ];
    const warnings = checkRegulatoryCompliance(ingredients, 200, 1, 'both');
    expect(warnings.length).toBe(0);
  });

  it('should report warning when dose exceeds 80% of UL (EFSA limit 25mg)', () => {
    const ingredients = [
      { ingredient: vitaminB6, percentage: 11 } // 11% of 200mg = 22mg dose (> 20mg / 80% of 25mg)
    ];
    // Under EU/EFSA guidelines, 22mg is close to 25mg UL (exceeds 80%)
    const warnings = checkRegulatoryCompliance(ingredients, 200, 1, 'eu');
    expect(warnings.length).toBe(1);
    expect(warnings[0].severity).toBe('warning');
    expect(warnings[0].message).toContain('close to the EFSA UL limit');
  });

  it('should report error when dose exceeds 100% of UL (EFSA limit 25mg)', () => {
    const ingredients = [
      { ingredient: vitaminB6, percentage: 15 } // 15% of 200mg = 30mg dose (> 25mg UL)
    ];
    const warnings = checkRegulatoryCompliance(ingredients, 200, 1, 'eu');
    expect(warnings.length).toBe(1);
    expect(warnings[0].severity).toBe('error');
    expect(warnings[0].message).toContain('exceeds the EFSA UL limit');
  });

  it('should report Novel Food warning for NMN in EU market', () => {
    const ingredients = [
      { ingredient: nmn, percentage: 50 }
    ];
    // EU market
    const warningsEu = checkRegulatoryCompliance(ingredients, 500, 1, 'eu');
    expect(warningsEu.some(w => w.message.includes('Novel Food'))).toBe(true);

    // US market (should NOT report EU Novel Food warning, but might report non-GRAS warning!)
    const warningsUs = checkRegulatoryCompliance(ingredients, 500, 1, 'usa');
    expect(warningsUs.some(w => w.message.includes('Novel Food'))).toBe(false);
  });

  it('should report non-GRAS warning for NMN in US market', () => {
    const ingredients = [
      { ingredient: nmn, percentage: 50 }
    ];
    const warnings = checkRegulatoryCompliance(ingredients, 500, 1, 'usa');
    expect(warnings.some(w => w.message.includes('does not have FDA GRAS status'))).toBe(true);
  });
});
