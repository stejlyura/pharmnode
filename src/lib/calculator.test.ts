import { describe, it, expect } from 'vitest';
import {
  calculateFlowability,
  calculatePorosity,
  calculateBlendProperties,
  calculateTableting,
  calculateBatch,
  checkCompatibilityAndLimits,
  calculateSonnergaardCompaction,
  calculateSegregationRisk,
  calculateSpreadingCoefficientWu,
  calculatePharmacokineticDose,
  calculateWetGranulation,
  calculateFillCamSize,
  calculatePressPresets,
  validateProcessCompatibility,
  calculateFormulaScore,
  getPackagingRecommendations,
  getCapsuleSizes,
  getTabletSizes,
  calculateDosageFormFit,
} from './calculator';
import { Ingredient } from '../types/pharm';

describe('calculateFlowability', () => {
  it('should calculate Excellent rating for low tapped-to-bulk density ratio', () => {
    // loose = 0.5, tapped = 0.55 -> Hausner = 1.10, Carr = 9.09%
    const res = calculateFlowability(0.5, 0.55);
    expect(res.hausner).toBeCloseTo(1.10, 4);
    expect(res.carr).toBeCloseTo(9.0909, 4);
    expect(res.rating).toBe('Excellent');
  });

  it('should calculate Good rating', () => {
    // loose = 0.45, tapped = 0.52 -> Hausner = 1.155, Carr = 13.46%
    const res = calculateFlowability(0.45, 0.52);
    expect(res.rating).toBe('Good');
  });

  it('should calculate Fair rating', () => {
    // loose = 0.4, tapped = 0.49 -> Hausner = 1.225, Carr = 18.36%
    const res = calculateFlowability(0.4, 0.49);
    expect(res.rating).toBe('Fair');
  });

  it('should calculate Passable rating', () => {
    // loose = 0.35, tapped = 0.46 -> Hausner = 1.314, Carr = 23.91%
    const res = calculateFlowability(0.35, 0.46);
    expect(res.rating).toBe('Passable');
  });

  it('should calculate Poor rating', () => {
    // loose = 0.3, tapped = 0.42 -> Hausner = 1.40, Carr = 28.57%
    const res = calculateFlowability(0.3, 0.42);
    expect(res.rating).toBe('Poor');
  });

  it('should calculate Very Poor rating', () => {
    // loose = 0.25, tapped = 0.40 -> Hausner = 1.60, Carr = 37.50%
    const res = calculateFlowability(0.25, 0.40);
    expect(res.rating).toBe('Very Poor');
  });

  it('should handle invalid densities gracefully', () => {
    expect(calculateFlowability(0, 0.5).rating).toBe('Unknown');
    expect(calculateFlowability(0.5, 0).rating).toBe('Unknown');
    expect(calculateFlowability(0.5, 0.4).rating).toBe('Unknown'); // tapped cannot be smaller than loose bulk
  });
});

describe('calculatePorosity', () => {
  it('should calculate porosity correctly', () => {
    // massMg = 500, volumeCm3 = 0.4, trueDensityBlend = 1.5
    // apparentDensity = 0.5 / 0.4 = 1.25
    // porosity = 1 - (1.25 / 1.5) = 1 - 0.83333 = 0.16667
    const porosity = calculatePorosity(500, 0.4, 1.5);
    expect(porosity).toBeCloseTo(0.1667, 4);
  });

  it('should clamp porosity between 0 and 1', () => {
    // apparent density > true density -> negative porosity -> clamps to 0
    expect(calculatePorosity(1000, 0.2, 1.5)).toBe(0);
    // apparent density <= 0 -> clamps to 1
    expect(calculatePorosity(0, 0.4, 1.5)).toBe(0);
  });
});

describe('calculateBlendProperties', () => {
  const ingA: Ingredient = {
    id: 1,
    name: 'Substance A',
    role: 'active',
    chemicalClassId: 1,
    looseBulkDensity: 0.35,
    tappedBulkDensity: 0.45,
    trueDensity: 1.4,
    costPerKgUsd: 100,
    maxSafePercentage: 50
  };

  const ingB: Ingredient = {
    id: 2,
    name: 'Substance B',
    role: 'filler',
    chemicalClassId: 2,
    looseBulkDensity: 0.45,
    tappedBulkDensity: 0.55,
    trueDensity: 1.5,
    costPerKgUsd: 50,
    maxSafePercentage: 100
  };

  it('should calculate normalized weighted average densities and costs', () => {
    const ingredients = [
      { ingredient: ingA, percentage: 20 }, // Weight scale normalized to 20%
      { ingredient: ingB, percentage: 80 }  // Weight scale normalized to 80%
    ];

    const res = calculateBlendProperties(ingredients);
    // loose: 0.35 * 0.2 + 0.45 * 0.8 = 0.07 + 0.36 = 0.43
    expect(res.looseDensity).toBeCloseTo(0.43, 4);
    // tapped: 0.45 * 0.2 + 0.55 * 0.8 = 0.09 + 0.44 = 0.53
    expect(res.tappedDensity).toBeCloseTo(0.53, 4);
    // cost: 100 * 0.2 + 50 * 0.8 = 20 + 40 = 60
    expect(res.costPerKg).toBeCloseTo(60, 4);
    // true: 1.4 * 0.2 + 1.5 * 0.8 = 0.28 + 1.2 = 1.48
    expect(res.trueDensity).toBeCloseTo(1.48, 4);
    // flowability: loose 0.43, tapped 0.53 -> Hausner = 1.2326 -> Fair
    expect(res.flowability.rating).toBe('Fair');
  });

  it('should exclude homeopathic dilution scale ingredients from density calculations', () => {
    const ingHomeo: Ingredient = {
      id: 3,
      name: 'Arnica 30C',
      role: 'active',
      chemicalClassId: 5,
      looseBulkDensity: 0.1,
      tappedBulkDensity: 0.2,
      costPerKgUsd: 20,
      maxSafePercentage: 100,
      dilutionScale: '30C'
    };

    const ingredients = [
      { ingredient: ingB, percentage: 99 },
      { ingredient: ingHomeo, percentage: 1 } // dilution scale -> excluded from densities
    ];

    const res = calculateBlendProperties(ingredients);
    // densities should match ingB perfectly because ingHomeo is excluded from density calculations
    expect(res.looseDensity).toBe(ingB.looseBulkDensity);
    expect(res.tappedDensity).toBe(ingB.tappedBulkDensity);
    // cost is still calculated including all components
    // cost = 50 * 0.99 + 20 * 0.01 = 49.5 + 0.2 = 49.7
    expect(res.costPerKg).toBeCloseTo(49.7, 4);
  });
});

describe('calculateTableting', () => {
  it('should calculate tablet mass volume based on punch geometry', () => {
    // r = 0.4 cm (diameter = 0.8), depth = 0.5 cm
    // volume = pi * r^2 * h = 3.14159 * 0.16 * 0.5 = 0.251327 cm3
    // loose density = 0.5 g/cm3 -> maxWeightMg = 0.251327 * 0.5 * 1000 = 125.66 mg
    // recommendedWeightMg = 0.9 * maxWeightMg = 113.1 mg
    const res = calculateTableting(0.8, 0.5, 0.5);
    expect(res.volume).toBeCloseTo(0.2513, 4);
    expect(res.maxWeightMg).toBeCloseTo(125.66, 2);
    expect(res.recommendedWeightMg).toBeCloseTo(113.1, 2);
  });

  it('should handle zero or negative dimensions correctly', () => {
    const res = calculateTableting(0, 0.5, 0.5);
    expect(res.volume).toBe(0);
    expect(res.maxWeightMg).toBe(0);
  });
});

describe('calculateBatch', () => {
  it('should calculate batch metrics correctly', () => {
    // activeRawWeightG = 10, recommendedWeightMg = 100, activePercentage = 10%, costPerKg = 200
    // activeFraction = 0.10. recommendedWeightG = 0.1g
    // divisor = 0.1 * 0.1 = 0.010000000000000002 (in JS float)
    // totalTablets = Math.floor(10 / 0.010000000000000002) = 999 tablets
    // totalBatchWeight = 999 * 100mg / 1e6 = 0.0999 kg
    // costPerTablet = 100mg / 1e6 * 200 = 0.02 USD
    // totalBatchCost = 0.0999 * 200 = 19.98 USD
    const res = calculateBatch(10, 100, 10, 200);
    expect(res.totalTablets).toBe(999);
    expect(res.totalBatchWeightKg).toBeCloseTo(0.0999, 4);
    expect(res.costPerTabletUsd).toBeCloseTo(0.02, 4);
    expect(res.totalBatchCostUsd).toBeCloseTo(19.98, 4);
  });
});

describe('checkCompatibilityAndLimits', () => {
  const activeIng: Ingredient = {
    id: 1,
    name: 'Active Substance',
    role: 'active',
    chemicalClassId: 1, // class 1
    looseBulkDensity: 0.4,
    tappedBulkDensity: 0.5,
    costPerKgUsd: 100,
    maxSafePercentage: 20 // Max limit is 20%
  };

  it('should report warnings when ingredients exceed their maximum safe percentage limits', () => {
    const ingredients = [
      { ingredient: activeIng, percentage: 25 }
    ];
    const warnings = checkCompatibilityAndLimits(ingredients);
    expect(warnings.length).toBe(1);
    expect(warnings[0].type).toBe('limit');
    expect(warnings[0].ingredientId).toBe(1);
  });

  it('should report warning when Carr Index > 25 and there is no Granulator node between Blending and Press', () => {
    // Carr Index = (0.45 - 0.3) / 0.45 = 33.3% (> 25)
    const ingredients = [
      {
        ingredient: {
          id: 2,
          name: 'Poor Flow Ingredient',
          role: 'active',
          chemicalClassId: 2,
          looseBulkDensity: 0.3,
          tappedBulkDensity: 0.45,
          costPerKgUsd: 10,
          maxSafePercentage: 100
        },
        percentage: 100
      }
    ];

    const nodes = [
      { id: 'node-blending', type: 'blending' },
      { id: 'node-press', type: 'press' }
    ];
    const connections = [
      { source: 'node-blending', target: 'node-press' }
    ];

    const warnings = checkCompatibilityAndLimits(ingredients, undefined, nodes, connections);
    expect(warnings.length).toBe(1);
    expect(warnings[0].type).toBe('compatibility');
    expect(warnings[0].message).toContain('Carr Index > 25: poor flowability');
  });

  it('should NOT report warning when Carr Index > 25 and there IS a Granulator node between Blending and Press', () => {
    const ingredients = [
      {
        ingredient: {
          id: 2,
          name: 'Poor Flow Ingredient',
          role: 'active',
          chemicalClassId: 2,
          looseBulkDensity: 0.3,
          tappedBulkDensity: 0.45,
          costPerKgUsd: 10,
          maxSafePercentage: 100
        },
        percentage: 100
      }
    ];

    const nodes = [
      { id: 'node-blending', type: 'blending' },
      { id: 'node-tech-granulator', type: 'granulator' },
      { id: 'node-press', type: 'press' }
    ];
    const connections = [
      { source: 'node-blending', target: 'node-tech-granulator' },
      { source: 'node-tech-granulator', target: 'node-press' }
    ];

    const warnings = checkCompatibilityAndLimits(ingredients, undefined, nodes, connections);
    expect(warnings.length).toBe(0);
  });
});


describe('calculateSonnergaardCompaction', () => {
  it('should compute the correct compaction volume using Sonnergaard log-exp equation', () => {
    // P = 50 MPa, V_l = 2.0, w = 0.3, V_e = 0.5, P_m = 30
    // log10(50) = 1.69897
    // exp(-50 / 30) = exp(-1.66667) = 0.1888756
    // V = 2.0 - 0.3 * 1.69897 + 0.5 * 0.1888756 = 2.0 - 0.509691 + 0.0944378 = 1.5847468
    const volume = calculateSonnergaardCompaction(50, 2.0, 0.3, 0.5, 30);
    expect(volume).toBeCloseTo(1.5847, 4);
  });

  it('should handle zero or negative pressure gracefully by returning V_l + V_e', () => {
    const volume = calculateSonnergaardCompaction(0, 2.0, 0.3, 0.5, 30);
    expect(volume).toBe(2.5);
  });

  it('should handle zero or negative P_m without division by zero errors', () => {
    const volume = calculateSonnergaardCompaction(50, 2.0, 0.3, 0.5, 0);
    // V = V_l - w * log10(P)
    expect(volume).toBeCloseTo(2.0 - 0.3 * Math.log10(50), 4);
  });
});

describe('calculateSegregationRisk', () => {
  const ingA: Ingredient = {
    id: 1,
    name: 'Active A',
    role: 'active',
    chemicalClassId: 1,
    looseBulkDensity: 0.40,
    tappedBulkDensity: 0.50,
    averageParticleSizeUm: 50,
    costPerKgUsd: 100,
    maxSafePercentage: 50
  };

  const ingB: Ingredient = {
    id: 2,
    name: 'Filler B',
    role: 'filler',
    chemicalClassId: 2,
    looseBulkDensity: 0.42,
    tappedBulkDensity: 0.55,
    averageParticleSizeUm: 55,
    costPerKgUsd: 10,
    maxSafePercentage: 100
  };

  const ingC: Ingredient = {
    id: 3,
    name: 'Glidant C',
    role: 'glidant',
    chemicalClassId: 3,
    looseBulkDensity: 0.05, // very light density
    tappedBulkDensity: 0.12,
    averageParticleSizeUm: 2, // very small size
    costPerKgUsd: 25,
    maxSafePercentage: 5
  };

  it('should return Low risk for a single active ingredient or empty mixture', () => {
    const result = calculateSegregationRisk([{ ingredient: ingA, percentage: 100 }]);
    expect(result.riskLevel).toBe('Low');
    expect(result.warnings.length).toBe(0);
  });

  it('should return Low risk for ingredients with similar densities and sizes', () => {
    const result = calculateSegregationRisk([
      { ingredient: ingA, percentage: 20 },
      { ingredient: ingB, percentage: 80 }
    ]);
    // ratio: 0.42 / 0.40 = 1.05 (< 3.5)
    // sizes: 55 / 50 = 1.10 (< 4.5)
    expect(result.riskLevel).toBe('Low');
    expect(result.warnings.length).toBe(0);
  });

  it('should return Medium risk when ratios exceed medium thresholds', () => {
    const ingMed: Ingredient = {
      id: 4,
      name: 'Filler Med',
      role: 'filler',
      chemicalClassId: 2,
      looseBulkDensity: 1.6, // ratio to 0.40 is 4.0 (> 3.5)
      tappedBulkDensity: 2.0,
      averageParticleSizeUm: 250, // ratio to 50 is 5.0 (> 4.5)
      costPerKgUsd: 5,
      maxSafePercentage: 100
    };

    const result = calculateSegregationRisk([
      { ingredient: ingA, percentage: 50 },
      { ingredient: ingMed, percentage: 50 }
    ]);

    expect(result.riskLevel).toBe('Medium');
    expect(result.warnings.length).toBe(2);
  });

  it('should return High risk when ratios exceed high thresholds', () => {
    const result = calculateSegregationRisk([
      { ingredient: ingA, percentage: 95 },
      { ingredient: ingC, percentage: 5 }
    ]);
    // densities: 0.40 / 0.05 = 8.0 (> 6.0)
    // sizes: 50 / 2 = 25.0 (> 10.0)
    expect(result.riskLevel).toBe('High');
    expect(result.warnings.length).toBe(2);
  });
});

describe('calculateSpreadingCoefficientWu', () => {
  it('should calculate Spontaneous rating for positive spreading coefficient', () => {
    // Substrate: Lactose (gamma_S^d = 35, gamma_S^p = 10)
    // Lubricant: Mag Stearate (gamma_L^d = 20, gamma_L^p = 2)
    // termD = 35 * 20 / 55 = 12.7273
    // termP = 10 * 2 / 12 = 1.6667
    // gamma_L = 20 + 2 = 22
    // S_12 = -2 * 22 + 4 * (12.7273 + 1.6667) = -44 + 4 * 14.394 = -44 + 57.576 = 13.576
    const res = calculateSpreadingCoefficientWu(35, 10, 20, 2);
    expect(res.spreadingCoefficient).toBeCloseTo(13.5758, 4);
    expect(res.rating).toBe('Spontaneous');
  });

  it('should calculate Non-Spontaneous rating for negative spreading coefficient', () => {
    // High cohesive lubricant forces, poor wetting
    const res = calculateSpreadingCoefficientWu(20, 2, 40, 5);
    expect(res.spreadingCoefficient).toBeLessThan(0);
    expect(res.rating).toBe('Non-Spontaneous');
  });
});

describe('calculatePharmacokineticDose', () => {
  it('should compute correct sustained release dose and release rate', () => {
    // D_IR = 100 mg, t_1/2 = 4 h, T_d = 12 h
    // ke = 0.693 / 4 = 0.17325
    // D_SR = 100 * (1 + 0.17325 * 12) = 100 * (1 + 2.079) = 307.9 mg
    // releaseRate = 100 * 0.17325 = 17.325 mg/h
    const res = calculatePharmacokineticDose(100, 4, 12);
    expect(res.dSR).toBeCloseTo(307.9, 4);
    expect(res.releaseRate).toBeCloseTo(17.325, 4);
    expect(res.loadingDose).toBe(100);
    expect(res.maintenanceDose).toBeCloseTo(207.9, 4);
  });

  it('should return zeros for invalid input bounds', () => {
    const res = calculatePharmacokineticDose(0, 4, 12);
    expect(res.dSR).toBe(0);
    expect(res.releaseRate).toBe(0);
  });
});

describe('calculateWetGranulation', () => {
  it('should calculate correct dry masses, wet mass, LOD raw fill weights, and losses', () => {
    // Inputs:
    // Target tablet weight = 500 mg
    // API% = 10%
    // Intragranular% = 90% (extragranular% = 10%)
    // LOD% = 5%
    // Binder liquid added% = 15% (of intragranular dry mass)
    // Expected loss% = 2%
    // Batch size = 10000 tablets
    const inputs = {
      targetTabletWeightMg: 500,
      apiPercentage: 10,
      intragranularPercentage: 90,
      moistureContentLod: 5,
      binderSolutionAddedPercentage: 15,
      expectedLossPercentage: 2,
      batchSizeTablets: 10000
    };

    const res = calculateWetGranulation(inputs);
    
    // total dry mass: 500 * 10000 / 1e6 = 5 kg
    expect(res.totalDryBatchWeightKg).toBeCloseTo(5.0, 4);
    // API mass: 5 * 0.1 = 0.5 kg
    expect(res.pureApiWeightKg).toBeCloseTo(0.5, 4);
    // intragranular dry mass: 5 * 0.9 = 4.5 kg
    expect(res.intragranularDryWeightKg).toBeCloseTo(4.5, 4);
    // extragranular dry mass: 5 * 0.1 = 0.5 kg
    expect(res.extragranularDryWeightKg).toBeCloseTo(0.5, 4);
    
    // wet granules before drying: 4.5 * 1.15 = 5.175 kg
    expect(res.wetGranulesWeightBeforeDryingKg).toBeCloseTo(5.175, 4);
    
    // granule fill weight per tablet with LOD:
    // Dry granules per tablet = 500 * 0.9 = 450 mg
    // with 5% LOD: 450 / (1 - 0.05) = 450 / 0.95 = 473.6842 mg
    expect(res.granuleFillWeightPerTabletMg).toBeCloseTo(473.6842, 4);
    
    // final fill weight (FW) per tablet:
    // 473.6842 + extragranular dry per tablet (500 * 0.1 = 50 mg) = 523.6842 mg
    expect(res.finalFillWeightPerTabletMg).toBeCloseTo(523.6842, 4);
    
    // expected loss weight: 5 * 0.02 = 0.1 kg
    expect(res.expectedLossWeightKg).toBeCloseTo(0.1, 4);
  });
});

describe('calculateFillCamSize', () => {
  it('should calculate punch area, theoretical fill depth, and select standard fill cam for round punch', () => {
    // Round punch: D = 10 mm
    // area = pi * 10^2 / 4 = 78.5398 mm2
    // target weight = 400 mg
    // loose density = 0.5 g/ml (g/cm3 = mg/mm3)
    // theoretical FD = 400 / (0.5 * 78.5398) = 400 / 39.2699 = 10.1859 mm
    // recommended FD = 10.1859 + 3 = 13.1859 mm
    // closest standard cam in [4, 6, 8, 10, 12, 14, 16, 18, 20] is 14 mm
    const punch = {
      shape: 'round' as const,
      diameterMm: 10
    };
    
    const res = calculateFillCamSize(400, 0.5, punch);
    expect(res.punchAreaMm2).toBeCloseTo(78.5398, 4);
    expect(res.theoreticalFillDepthMm).toBeCloseTo(10.1859, 4);
    expect(res.recommendedFillDepthMm).toBeCloseTo(13.1859, 4);
    expect(res.closestStandardCamMm).toBe(14);
  });

  it('should calculate punch area and select standard fill cam for capsule/shaped punch', () => {
    // Shaped punch: L = 15 mm, W = 6 mm
    // area = width * (length - width) + pi * width^2 / 4 = 6 * 9 + pi * 36 / 4 = 54 + 28.2743 = 82.2743 mm2
    // target weight = 600 mg
    // loose density = 0.6 g/ml
    // theoretical FD = 600 / (0.6 * 82.2743) = 600 / 49.3646 = 12.1545 mm
    // recommended FD = 12.1545 + 3 = 15.1545 mm
    // closest standard cam is 16 mm
    const punch = {
      shape: 'shaped' as const,
      lengthMm: 15,
      widthMm: 6
    };

    const res = calculateFillCamSize(600, 0.6, punch);
    expect(res.punchAreaMm2).toBeCloseTo(82.2743, 4);
    expect(res.theoreticalFillDepthMm).toBeCloseTo(12.1545, 4);
    expect(res.recommendedFillDepthMm).toBeCloseTo(15.1545, 4);
    expect(res.closestStandardCamMm).toBe(16);
  });
});

describe('calculatePressPresets', () => {
  it('should calculate Fette and GEA Courtoy fill depths correctly', () => {
    // Thickness = 4.5 mm, PCH = 6.0 mm
    // Fette = 2 * 4.5 + 2 = 11.0 mm
    // GEA Courtoy = 1.8 * 6.0 = 10.8 mm
    const res = calculatePressPresets(4.5, 6.0);
    expect(res.fetteFillDepthMm).toBeCloseTo(11.0, 4);
    expect(res.geaCourtoyFillDepthMm).toBeCloseTo(10.8, 4);
  });
});

describe('Explicit Math Precision & Edge Case Validations', () => {
  describe('Hausner Ratio & Carr Index', () => {
    it('verifies 4-decimal precision on standard inputs', () => {
      const res = calculateFlowability(0.4851, 0.5892);
      // Hausner = 0.5892 / 0.4851 = 1.214595... -> 1.2146
      // Carr = 100 * (0.5892 - 0.4851) / 0.5892 = 17.668024... -> 17.6680%
      expect(res.hausner).toBeCloseTo(1.2146, 4);
      expect(res.carr).toBeCloseTo(17.6680, 4);
    });

    it('handles boundary and extreme values correctly', () => {
      // Very close values
      const resClose = calculateFlowability(0.5, 0.5001);
      expect(resClose.hausner).toBeCloseTo(1.0002, 4);
      expect(resClose.carr).toBeCloseTo(0.0200, 4);

      // Huge densities
      const resHuge = calculateFlowability(1000.1234, 1200.5678);
      expect(resHuge.hausner).toBeCloseTo(1.2004, 4);
      expect(resHuge.carr).toBeCloseTo(16.6958, 4);
    });

    it('returns default/unknown ratings on invalid input data', () => {
      // Tapped density smaller than loose bulk density
      expect(calculateFlowability(0.5, 0.4).rating).toBe('Unknown');
      expect(calculateFlowability(0.5, 0.4).hausner).toBe(1.0);
      expect(calculateFlowability(0.5, 0.4).carr).toBe(0.0);

      // Zero or negative values
      expect(calculateFlowability(0, 0.5).rating).toBe('Unknown');
      expect(calculateFlowability(0.5, -0.5).rating).toBe('Unknown');
    });
  });

  describe('Porosity', () => {
    it('verifies 4-decimal precision on standard inputs', () => {
      // massMg = 325.45, volumeCm3 = 0.2852, trueDensityBlend = 1.4582
      // apparentDensity = (325.45 / 1000) / 0.2852 = 1.141129...
      // porosity = 1 - (1.141129... / 1.4582) = 1 - 0.782560... = 0.217439... -> 0.2174
      const porosity = calculatePorosity(325.45, 0.2852, 1.4582);
      expect(porosity).toBeCloseTo(0.2174, 4);
    });

    it('handles boundary/extreme values and clamps correctly', () => {
      // Negative parameters
      expect(calculatePorosity(-100, 0.2, 1.5)).toBe(0);
      expect(calculatePorosity(100, -0.2, 1.5)).toBe(0);
      expect(calculatePorosity(100, 0.2, -1.5)).toBe(0);

      // Zero values
      expect(calculatePorosity(0, 0.2, 1.5)).toBe(0);
      expect(calculatePorosity(100, 0, 1.5)).toBe(0);
      expect(calculatePorosity(100, 0.2, 0)).toBe(0);

      // Clamping: apparent density > true density blend -> clamps to 0
      expect(calculatePorosity(500, 0.1, 1.2)).toBe(0); // apparent density is 5.0, true density is 1.2
    });
  });

  describe('Die Volume (Объем матрицы)', () => {
    it('verifies 4-decimal precision for round punch volume', () => {
      // diameter = 0.7523 cm, depth = 0.4852 cm
      // radius = 0.37615 cm
      // volume = pi * r^2 * h = 3.14159265... * 0.141488... * 0.4852 = 0.215682... cm3 -> 0.2157
      const res = calculateTableting(0.7523, 0.4852, 0.5);
      expect(res.volume).toBeCloseTo(0.2157, 4);
    });

    it('handles boundary and negative/zero dimensions gracefully', () => {
      expect(calculateTableting(0, 0.5, 0.5).volume).toBe(0);
      expect(calculateTableting(0.5, 0, 0.5).volume).toBe(0);
      expect(calculateTableting(0.5, 0.5, 0).maxWeightMg).toBe(0);

      expect(calculateTableting(-0.5, 0.5, 0.5).volume).toBe(0);
      expect(calculateTableting(0.5, -0.5, 0.5).volume).toBe(0);
      expect(calculateTableting(0.5, 0.5, -0.5).maxWeightMg).toBe(0);
    });
  });

  describe('Unit Cost & Batch Cost (Себестоимость)', () => {
    it('verifies 4-decimal precision on standard inputs', () => {
      // activeRawWeightG = 12.5, recommendedWeightMg = 185.2, activePercentage = 12.5%, costPerKg = 152.3
      // recommendedWeightG = 0.1852g
      // divisor = 0.1852 * 0.125 = 0.02315
      // totalTablets = Math.floor(12.5 / 0.02315) = 539 tablets
      // totalBatchWeight = 539 * 185.2mg / 1e6 = 0.0998228 kg
      // costPerTablet = 185.2mg / 1e6 * 152.3 = 0.02820596 USD -> 0.0282 USD
      // totalBatchCost = 0.0998228 * 152.3 = 15.20301244 USD -> 15.2030 USD
      const res = calculateBatch(12.5, 185.2, 12.5, 152.3);
      expect(res.totalTablets).toBe(539);
      expect(res.costPerTabletUsd).toBeCloseTo(0.0282, 4);
      expect(res.totalBatchCostUsd).toBeCloseTo(15.2030, 4);
    });

    it('handles negative, zero, and malformed inputs gracefully', () => {
      // Zero active raw weight
      const resZeroActive = calculateBatch(0, 185.2, 12.5, 152.3);
      expect(resZeroActive.totalTablets).toBe(0);
      expect(resZeroActive.totalBatchWeightKg).toBe(0);
      expect(resZeroActive.totalBatchCostUsd).toBe(0);

      // Zero active percentage (prevents division by zero)
      const resZeroPct = calculateBatch(12.5, 185.2, 0, 152.3);
      expect(resZeroPct.totalTablets).toBe(0);
      expect(resZeroPct.totalBatchWeightKg).toBe(0);
      expect(resZeroPct.totalBatchCostUsd).toBe(0);

      // Negative values
      const resNeg = calculateBatch(-12.5, 185.2, 12.5, 152.3);
      expect(resNeg.totalTablets).toBe(0);
      expect(resNeg.totalBatchWeightKg).toBe(0);
      expect(resNeg.totalBatchCostUsd).toBe(0);
    });
  });
});


// ──────────────────────────────────────────────────────────────────────────────
// Helper: minimal Ingredient stub
// ──────────────────────────────────────────────────────────────────────────────
function makeIngredient(overrides: Partial<Ingredient> = {}): Ingredient {
  return {
    id: 1,
    name: 'Test Ingredient',
    role: 'filler',
    chemicalClassId: 1,
    looseBulkDensity: 0.5,
    tappedBulkDensity: 0.6,
    costPerKgUsd: 10,
    maxSafePercentage: 100,
    benefit: 50,
    risk: 10,
    stability: 70,
    manufacturability: 80,
    ...overrides,
  };
}

// ──────────────────────────────────────────────────────────────────────────────
// Task 7.1 — validateProcessCompatibility
// ──────────────────────────────────────────────────────────────────────────────
describe('validateProcessCompatibility', () => {
  it('wet_granulation: warns for hygroscopic ingredient (hygroscopicity > 70)', () => {
    const ing = makeIngredient({
      name: 'PVP',
      stabilityProfile: { ph: null, hygroscopicity: 75, lightSensitive: false, heatDegradation: null },
    });
    const result = validateProcessCompatibility([{ ingredient: ing, percentage: 20 }], 'wet_granulation');
    expect(result.isValid).toBe(false);
    expect(result.warnings.length).toBeGreaterThan(0);
    expect(result.warnings[0]).toContain('гигроскопичен');
  });

  it('wet_granulation: warns for heat-sensitive ingredient (heatDegradation < 60)', () => {
    const ing = makeIngredient({
      name: 'Ibuprofen',
      stabilityProfile: { ph: null, hygroscopicity: 5, lightSensitive: false, heatDegradation: 50 },
    });
    const result = validateProcessCompatibility([{ ingredient: ing, percentage: 50 }], 'wet_granulation');
    expect(result.isValid).toBe(false);
    expect(result.warnings.some(w => w.includes('термочувствителен'))).toBe(true);
  });

  it('direct_compression: warns for poor flowability blend', () => {
    // loose=0.2, tapped=0.4 → Hausner=2.0 → Very Poor
    const ing = makeIngredient({ looseBulkDensity: 0.2, tappedBulkDensity: 0.4 });
    const result = validateProcessCompatibility([{ ingredient: ing, percentage: 100 }], 'direct_compression');
    expect(result.isValid).toBe(false);
    expect(result.warnings.some(w => w.includes('Сыпучесть'))).toBe(true);
  });

  it('dry_granulation: no warnings for standard ingredient, recommendation for very hygroscopic', () => {
    const standard = makeIngredient({ name: 'Lactose' });
    const r1 = validateProcessCompatibility([{ ingredient: standard, percentage: 100 }], 'dry_granulation');
    expect(r1.warnings).toHaveLength(0);

    const veryHygro = makeIngredient({
      name: 'SuperHygro',
      stabilityProfile: { ph: null, hygroscopicity: 90, lightSensitive: false, heatDegradation: null },
    });
    const r2 = validateProcessCompatibility([{ ingredient: veryHygro, percentage: 100 }], 'dry_granulation');
    expect(r2.recommendations.some(r => r.includes('гигроскопичен'))).toBe(true);
  });

  it('returns isValid=true and empty arrays for compatible ingredients', () => {
    const ing = makeIngredient({
      stabilityProfile: { ph: 6, hygroscopicity: 10, lightSensitive: false, heatDegradation: null },
    });
    const result = validateProcessCompatibility([{ ingredient: ing, percentage: 100 }], 'wet_granulation');
    expect(result.isValid).toBe(true);
    expect(result.warnings).toHaveLength(0);
  });

  it('skips check gracefully when stabilityProfile is undefined', () => {
    const ing = makeIngredient(); // no stabilityProfile
    const result = validateProcessCompatibility([{ ingredient: ing, percentage: 100 }], 'wet_granulation');
    expect(result.warnings).toHaveLength(0);
    expect(result.isValid).toBe(true);
  });
});

// ──────────────────────────────────────────────────────────────────────────────
// Task 7.1 — calculateFormulaScore
// ──────────────────────────────────────────────────────────────────────────────
describe('calculateFormulaScore', () => {
  it('returns zero score for empty array', () => {
    const result = calculateFormulaScore([]);
    expect(result.totalScore).toBe(0);
    expect(result.breakdown).toHaveLength(0);
  });

  it('calculates correct score for a single ingredient with known KB values', () => {
    // benefit=80, stability=70, manufacturability=80, risk=10
    // score = 80*0.4 + 70*0.2 + 80*0.2 - 10*0.2 = 32 + 14 + 16 - 2 = 60
    const ing = makeIngredient({ benefit: 80, stability: 70, manufacturability: 80, risk: 10 });
    const result = calculateFormulaScore([{ ingredient: ing, percentage: 100 }]);
    expect(result.totalScore).toBeCloseTo(60, 4);
    expect(result.breakdown).toHaveLength(1);
  });

  it('calculates weighted score correctly for a 3-ingredient blend', () => {
    const a = makeIngredient({ name: 'A', benefit: 80, stability: 70, manufacturability: 80, risk: 10 });
    const b = makeIngredient({ name: 'B', benefit: 60, stability: 80, manufacturability: 70, risk: 5  });
    const c = makeIngredient({ name: 'C', benefit: 40, stability: 90, manufacturability: 90, risk: 20 });
    const result = calculateFormulaScore([
      { ingredient: a, percentage: 50 },
      { ingredient: b, percentage: 30 },
      { ingredient: c, percentage: 20 },
    ]);
    // score_A = 80*0.4+70*0.2+80*0.2−10*0.2 = 32+14+16−2 = 60
    // score_B = 60*0.4+80*0.2+70*0.2−5*0.2  = 24+16+14−1 = 53
    // score_C = 40*0.4+90*0.2+90*0.2−20*0.2 = 16+18+18−4 = 48
    // totalScore = weighted sum → 55.5
    expect(result.totalScore).toBeCloseTo(55.5, 1);
    expect(result.breakdown).toHaveLength(3);
  });

  it('uses default KB values when fields are undefined', () => {
    const ing: Ingredient = {
      id: 99, name: 'Unknown', role: 'active',
      chemicalClassId: 1, looseBulkDensity: 0.5, tappedBulkDensity: 0.6,
      costPerKgUsd: 0, maxSafePercentage: 100,
      // no benefit/risk/stability/manufacturability
    };
    const result = calculateFormulaScore([{ ingredient: ing, percentage: 100 }]);
    // active defaults: benefit=80, risk=15, stability=85, manufacturability=85
    // score = 80*0.4 + 85*0.2 + 85*0.2 - 15*0.2 = 32+17+17-3 = 63
    expect(result.totalScore).toBeCloseTo(63, 4);
  });
});

// ──────────────────────────────────────────────────────────────────────────────
// Task 7.1 — getPackagingRecommendations
// ──────────────────────────────────────────────────────────────────────────────
describe('getPackagingRecommendations', () => {
  it('returns standard packaging for empty ingredient list', () => {
    const result = getPackagingRecommendations([]);
    expect(result).toHaveLength(1);
    expect(result[0].type).toBe('standard');
  });

  it('skips ingredient without stabilityProfile (graceful fallback)', () => {
    const ing = makeIngredient(); // no stabilityProfile
    const result = getPackagingRecommendations([{ ingredient: ing, percentage: 100 }]);
    expect(result).toHaveLength(1);
    expect(result[0].type).toBe('standard');
  });

  it('recommends moisture_protection for hygroscopicity > 70', () => {
    const ing = makeIngredient({
      name: 'PVP',
      stabilityProfile: { ph: null, hygroscopicity: 75, lightSensitive: false, heatDegradation: null },
    });
    const result = getPackagingRecommendations([{ ingredient: ing, percentage: 20 }]);
    const moisture = result.find(r => r.type === 'moisture_protection');
    expect(moisture).toBeDefined();
    expect(moisture?.details).toContain('PVP');
  });

  it('recommends light_protection for lightSensitive ingredient', () => {
    const ing = makeIngredient({
      name: 'Vitamin C',
      stabilityProfile: { ph: 3.0, hygroscopicity: 15, lightSensitive: true, heatDegradation: 190 },
    });
    const result = getPackagingRecommendations([{ ingredient: ing, percentage: 30 }]);
    const light = result.find(r => r.type === 'light_protection');
    expect(light).toBeDefined();
    expect(light?.details).toContain('Vitamin C');
  });

  it('recommends heat_protection for heatDegradation < 40°C', () => {
    const ing = makeIngredient({
      name: 'Heat Labile API',
      stabilityProfile: { ph: null, hygroscopicity: 5, lightSensitive: false, heatDegradation: 30 },
    });
    const result = getPackagingRecommendations([{ ingredient: ing, percentage: 10 }]);
    const heat = result.find(r => r.type === 'heat_protection');
    expect(heat).toBeDefined();
    expect(heat?.details).toContain('Heat Labile API');
  });

  it('can return multiple recommendations for complex formulas', () => {
    const hygro = makeIngredient({
      name: 'PVP',
      stabilityProfile: { ph: null, hygroscopicity: 80, lightSensitive: false, heatDegradation: null },
    });
    const light = makeIngredient({
      name: 'Vitamin C',
      stabilityProfile: { ph: 3.0, hygroscopicity: 15, lightSensitive: true, heatDegradation: null },
    });
    const result = getPackagingRecommendations([
      { ingredient: hygro, percentage: 20 },
      { ingredient: light, percentage: 30 },
    ]);
    expect(result.some(r => r.type === 'moisture_protection')).toBe(true);
    expect(result.some(r => r.type === 'light_protection')).toBe(true);
  });
});

// ──────────────────────────────────────────────────────────────────────────────
// Task 2.1 — getCapsuleSizes & getTabletSizes Reference Data
// ──────────────────────────────────────────────────────────────────────────────
describe('Dosage form reference tables (Task 2.1)', () => {
  it('getCapsuleSizes returns non-empty array with positive volumes', () => {
    const sizes = getCapsuleSizes();
    expect(sizes.length).toBeGreaterThan(0);
    for (const item of sizes) {
      expect(typeof item.size).toBe('string');
      expect(item.volumeMl).toBeGreaterThan(0);
      expect(item.maxFillMg).toBeGreaterThan(0);
    }
  });

  it('getTabletSizes returns non-empty array with valid ranges', () => {
    const sizes = getTabletSizes();
    expect(sizes.length).toBeGreaterThan(0);
    for (const item of sizes) {
      expect(item.diameterMm).toBeGreaterThan(0);
      expect(item.typicalWeightRangeMg[0]).toBeGreaterThan(0);
      expect(item.typicalWeightRangeMg[1]).toBeGreaterThan(item.typicalWeightRangeMg[0]);
    }
  });
});

// ──────────────────────────────────────────────────────────────────────────────
// Task 2.2 — calculateDosageFormFit
// ──────────────────────────────────────────────────────────────────────────────
describe('calculateDosageFormFit', () => {
  it('handles negative or zero values gracefully', () => {
    const res = calculateDosageFormFit(0, 0.5);
    expect(res.recommendedCapsuleSize).toBeNull();
    expect(res.capsuleCount).toBe(0);
    expect(res.fitsInSingleCapsule).toBe(false);

    const res2 = calculateDosageFormFit(500, -0.1);
    expect(res2.recommendedCapsuleSize).toBeNull();
    expect(res2.capsuleCount).toBe(0);
  });

  it('fits in a single capsule (matches exact size #1)', () => {
    // 400 mg at 0.8 g/mL (800 mg/mL) -> 0.5 mL volume.
    // Fits exactly in #1 (volumeMl: 0.50)
    const res = calculateDosageFormFit(400, 0.8);
    expect(res.recommendedCapsuleSize).toBe('#1');
    expect(res.capsuleCount).toBe(1);
    expect(res.fitsInSingleCapsule).toBe(true);
    expect(res.volumeMl).toBeCloseTo(0.50, 4);
    expect(res.fillPercentage).toBeCloseTo(100, 4);
    // Alternative sizes: #000, #00, #0 (which are larger and can fit 0.5 mL)
    expect(res.alternativeSizes.map(s => s.size)).toEqual(['#000', '#00', '#0']);
    expect(res.warnings).toHaveLength(0);
  });

  it('fits in a single capsule (smaller volume fits in #5)', () => {
    // 80 mg at 0.8 g/mL -> 0.1 mL volume.
    // Smallest capsule is #5 (0.13 mL).
    const res = calculateDosageFormFit(80, 0.8);
    expect(res.recommendedCapsuleSize).toBe('#5');
    expect(res.capsuleCount).toBe(1);
    expect(res.fillPercentage).toBeCloseTo(76.923, 3);
    expect(res.alternativeSizes.length).toBe(7); // #000, #00, #0, #1, #2, #3, #4
  });

  it('requires 2 capsules when volume exceeds largest single capsule size', () => {
    // 1500 mg at 0.8 g/mL -> 1.875 mL volume.
    // Largest capsule #000 has 1.37 mL volume.
    // 1.875 / 1.37 = 1.368 -> ceil is 2 capsules.
    const res = calculateDosageFormFit(1500, 0.8);
    expect(res.recommendedCapsuleSize).toBeNull();
    expect(res.capsuleCount).toBe(2);
    expect(res.fitsInSingleCapsule).toBe(false);
    expect(res.volumeMl).toBeCloseTo(1.875, 4);
    expect(res.fillPercentage).toBeCloseTo(((1.875 / 2) / 1.37) * 100, 4);
    expect(res.alternativeSizes).toHaveLength(0);
    expect(res.warnings[0]).toBe('Порцию придётся разбить на 2 капсулы');
  });

  it('requires 6 capsules and formats Russian plural suffix correctly', () => {
    // 6000 mg at 0.8 g/mL -> 7.5 mL volume.
    // 7.5 / 1.37 = 5.474 -> ceil is 6 capsules.
    const res = calculateDosageFormFit(6000, 0.8);
    expect(res.capsuleCount).toBe(6);
    expect(res.warnings[0]).toBe('Порцию придётся разбить на 6 капсул');
  });
});


