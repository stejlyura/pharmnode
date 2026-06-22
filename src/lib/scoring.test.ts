import { describe, it, expect } from 'vitest';
import { analyzeRecipe } from './scoring';
import { Ingredient } from '../types/pharm';
import { CompatibilityWarning } from './calculator';

describe('analyzeRecipe scoring logic', () => {
  const mockActive: Ingredient = {
    id: 1,
    name: 'Active Herb',
    role: 'active',
    chemicalClassId: 1,
    looseBulkDensity: 0.4,
    tappedBulkDensity: 0.5,
    costPerKgUsd: 100,
    maxSafePercentage: 50,
    benefit: 80,
    stability: 90,
    manufacturability: 85,
    risk: 10,
    isAllergen: false,
    effects: ['Energy Boost'],
    contraindications: ['High Blood Pressure'],
    sideEffects: [
      { name: 'Insomnia', frequency: 'common', severity: 'low' }
    ]
  };

  const mockFiller: Ingredient = {
    id: 2,
    name: 'Standard Filler',
    role: 'filler',
    chemicalClassId: 2,
    looseBulkDensity: 0.5,
    tappedBulkDensity: 0.6,
    costPerKgUsd: 5,
    maxSafePercentage: 100,
    benefit: 5,
    stability: 95,
    manufacturability: 95,
    risk: 5,
    isAllergen: true // Allergen triggers -10 deduction
  };

  it('should calculate weighted base score correctly and apply allergen deduction', () => {
    // 50% Active Herb + 50% Standard Filler
    // Weighted values:
    // benefit = 80*0.5 + 5*0.5 = 42.5 -> normalized = 0.425
    // stability = 90*0.5 + 95*0.5 = 92.5 -> normalized = 0.925
    // manufacturability = 85*0.5 + 95*0.5 = 90.0 -> normalized = 0.900
    // risk = 10*0.5 + 5*0.5 = 7.5 -> normalized = 0.075
    //
    // Base score = (0.425 * 0.4 + 0.925 * 0.2 + 0.900 * 0.2 - 0.075 * 0.2) * 100
    //            = (0.170 + 0.185 + 0.180 - 0.015) * 100 = 0.520 * 100 = 52.0
    // Deductions:
    // - Allergen present (mockFiller): -10 points
    // Expected final score = 52 - 10 = 42
    
    const recipe = [
      { ingredient: mockActive, percentage: 50 },
      { ingredient: mockFiller, percentage: 50 }
    ];

    const result = analyzeRecipe(recipe, 500, []);
    expect(result.score).toBe(42);
    expect(result.benefitScore).toBe(43); // rounded 42.5
    expect(result.stabilityScore).toBe(93); // rounded 92.5
    expect(result.manufacturabilityScore).toBe(90);
    expect(result.riskScore).toBe(8); // rounded 7.5
    
    // Check aggregated lists
    expect(result.aggregatedEffects).toContain('Energy Boost');
    expect(result.aggregatedContraindications).toContain('High Blood Pressure');
    expect(result.aggregatedSideEffects[0].name).toBe('Insomnia');
  });

  it('should apply deductions for compatibility warnings', () => {
    const recipe = [
      { ingredient: mockActive, percentage: 100 }
    ];

    // Base score for 100% mockActive:
    // benefit = 80 -> 0.8
    // stability = 90 -> 0.9
    // manufacturability = 85 -> 0.85
    // risk = 10 -> 0.1
    // Base score = (0.8 * 0.4 + 0.9 * 0.2 + 0.85 * 0.2 - 0.1 * 0.2) * 100
    //            = (0.32 + 0.18 + 0.17 - 0.02) * 100 = 0.65 * 100 = 65
    //
    // Deductions:
    // - Compatibility error: -20 points
    // - Compatibility warning: -10 points
    // - Limit warning: -15 points
    // Total deductions = 45 points
    // Expected score = 65 - 45 = 20

    const warnings: CompatibilityWarning[] = [
      { type: 'compatibility', severity: 'error', message: 'Severe conflict' },
      { type: 'compatibility', severity: 'warning', message: 'Mild conflict' },
      { type: 'limit', severity: 'warning', message: 'Exceeds limit' }
    ];

    const result = analyzeRecipe(recipe, 500, warnings);
    expect(result.score).toBe(20);
    expect(result.penalties.length).toBe(3);
  });

  it('should apply overdose deductions for exceeding maximum safe dose', () => {
    // Paracetamol max safe dose in ACTIVE_MAX_DOSAGE_MG is 1000 mg
    const paracetamol: Ingredient = {
      id: 5,
      name: 'Paracetamol (Acetaminophen)',
      role: 'active',
      chemicalClassId: 21,
      looseBulkDensity: 0.45,
      tappedBulkDensity: 0.65,
      costPerKgUsd: 15,
      maxSafePercentage: 50,
      benefit: 85,
      stability: 80,
      manufacturability: 85,
      risk: 15
    };

    // Recipe has 100% Paracetamol with tablet weight of 1200 mg
    // Calculated dose = 1200 mg * 100% = 1200 mg (> 1000 mg limit)
    // Deduction: -15 points
    // Base score: (0.85*0.4 + 0.80*0.2 + 0.85*0.2 - 0.15*0.2) * 100
    //            = (0.34 + 0.16 + 0.17 - 0.03) * 100 = 64
    // Expected score = 64 - 15 = 49
    const recipe = [
      { ingredient: paracetamol, percentage: 100 }
    ];

    const result = analyzeRecipe(recipe, 1200, []);
    expect(result.overdoses.length).toBe(1);
    expect(result.overdoses[0].name).toBe('Paracetamol (Acetaminophen)');
    expect(result.score).toBe(49);
  });

  it('should clamp the final score between 0 and 100', () => {
    // Highly penalized recipe should clamp to 0
    const recipe = [
      { ingredient: mockActive, percentage: 100 }
    ];
    
    const warnings: CompatibilityWarning[] = [
      { type: 'compatibility', severity: 'error', message: 'C1' },
      { type: 'compatibility', severity: 'error', message: 'C2' },
      { type: 'compatibility', severity: 'error', message: 'C3' },
      { type: 'compatibility', severity: 'error', message: 'C4' }
    ]; // -80 points from base 65 -> negative -> clamp to 0

    const result = analyzeRecipe(recipe, 500, warnings);
    expect(result.score).toBe(0);
  });
});
