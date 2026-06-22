import {
  Ingredient,
  SegregationRiskResult,
  SpreadingCoefficientResult,
  PKDoseResult,
  WetGranulationInputs,
  WetGranulationResult,
  PunchDimensions,
  FillCamResult,
  PressPresetsResult
} from '../types/pharm';
import { getIngredientsCompatibilityRule } from './chemicalRules';

export interface FlowabilityResult {
  hausner: number;
  carr: number;
  rating: string;
}

export interface BlendProperties {
  looseDensity: number;
  tappedDensity: number;
  trueDensity: number;
  costPerKg: number;
  flowability: FlowabilityResult;
}

export interface TabletingResult {
  volume: number;
  maxWeightMg: number;
  recommendedWeightMg: number;
}

export interface BatchResult {
  totalTablets: number;
  totalBatchWeightKg: number;
  costPerTabletUsd: number;
  totalBatchCostUsd: number;
}

export interface CompatibilityWarning {
  type: 'compatibility' | 'limit';
  severity: 'error' | 'warning';
  message: string;
  suggestion?: string;
  ingredientId?: number | string;
  relatedIngredientId?: number | string;
}

/**
 * Calculates Hausner ratio, Carr index, and flowability rating.
 */
export function calculateFlowability(loose: number, tapped: number): FlowabilityResult {
  if (loose <= 0 || tapped <= 0 || loose > tapped) {
    return { hausner: 1.0, carr: 0.0, rating: 'Unknown' };
  }

  const hausner = tapped / loose;
  const carr = 100 * (tapped - loose) / tapped;

  let rating = 'Unknown';
  if (hausner < 1.12) {
    rating = 'Excellent';
  } else if (hausner <= 1.18) {
    rating = 'Good';
  } else if (hausner <= 1.25) {
    rating = 'Fair';
  } else if (hausner <= 1.34) {
    rating = 'Passable';
  } else if (hausner <= 1.45) {
    rating = 'Poor';
  } else {
    rating = 'Very Poor';
  }

  return { hausner, carr, rating };
}

/**
 * Calculates porosity of the tablet as a fraction (0 to 1).
 */
export function calculatePorosity(massMg: number, volumeCm3: number, trueDensityBlend: number): number {
  if (massMg <= 0 || volumeCm3 <= 0 || trueDensityBlend <= 0) {
    return 0;
  }

  // Apparent density of tablet = mass (g) / volume (cm3)
  const massG = massMg / 1000;
  const apparentDensity = massG / volumeCm3;

  // Porosity = 1 - (apparentDensity / trueDensity)
  const porosity = 1 - (apparentDensity / trueDensityBlend);

  // Ensure porosity stays within realistic bounds [0, 1]
  return Math.max(0, Math.min(1, porosity));
}

/**
 * Computes average densities, costs, and flowability of the blend based on ingredient percentages.
 */
export function calculateBlendProperties(
  ingredients: { ingredient: Ingredient; percentage: number }[]
): BlendProperties {
  if (ingredients.length === 0) {
    return {
      looseDensity: 0,
      tappedDensity: 0,
      trueDensity: 0,
      costPerKg: 0,
      flowability: { hausner: 1.0, carr: 0.0, rating: 'Unknown' }
    };
  }

  const totalPercentage = ingredients.reduce((sum, item) => sum + item.percentage, 0);
  const scale = totalPercentage > 0 ? 100 / totalPercentage : 0;

  let looseDensitySum = 0;
  let tappedDensitySum = 0;
  let trueDensitySum = 0;
  let costSum = 0;

  // Filter out ingredients with dilutionScale for density calculation, as they don't linearly contribute to bulk densities
  const standardIngredientsForDensity = ingredients.filter(item => !item.ingredient.dilutionScale);
  const densityTotalPercentage = standardIngredientsForDensity.reduce((sum, item) => sum + item.percentage, 0);
  const densityScale = densityTotalPercentage > 0 ? 100 / densityTotalPercentage : 0;

  for (const item of ingredients) {
    const normalizedPercentage = item.percentage * scale; // Adjust percentages so they sum to 100%
    const fraction = normalizedPercentage / 100;

    costSum += item.ingredient.costPerKgUsd * fraction;
  }

  if (standardIngredientsForDensity.length > 0) {
    for (const item of standardIngredientsForDensity) {
      const normalizedPercentage = item.percentage * densityScale;
      const fraction = normalizedPercentage / 100;

      looseDensitySum += item.ingredient.looseBulkDensity * fraction;
      tappedDensitySum += item.ingredient.tappedBulkDensity * fraction;
      trueDensitySum += (item.ingredient.trueDensity || item.ingredient.tappedBulkDensity) * fraction;
    }
  } else {
    for (const item of ingredients) {
      const normalizedPercentage = item.percentage * scale;
      const fraction = normalizedPercentage / 100;

      looseDensitySum += item.ingredient.looseBulkDensity * fraction;
      tappedDensitySum += item.ingredient.tappedBulkDensity * fraction;
      trueDensitySum += (item.ingredient.trueDensity || item.ingredient.tappedBulkDensity) * fraction;
    }
  }

  const flowability = calculateFlowability(looseDensitySum, tappedDensitySum);

  return {
    looseDensity: looseDensitySum,
    tappedDensity: tappedDensitySum,
    trueDensity: trueDensitySum,
    costPerKg: costSum,
    flowability
  };
}

/**
 * Calculates volume of punch cavity, max powder mass, and recommended tablet weight.
 */
export function calculateTableting(
  diameterCm: number,
  depthCm: number,
  looseDensity: number
): TabletingResult {
  if (diameterCm <= 0 || depthCm <= 0 || looseDensity <= 0) {
    return { volume: 0, maxWeightMg: 0, recommendedWeightMg: 0 };
  }

  const radiusCm = diameterCm / 2;
  const volume = Math.PI * Math.pow(radiusCm, 2) * depthCm; // in cm3 (mL)

  // maxWeight in mg = volume (mL) * looseDensity (g/mL) * 1000
  const maxWeightMg = volume * looseDensity * 1000;
  const recommendedWeightMg = 0.9 * maxWeightMg;

  return {
    volume,
    maxWeightMg,
    recommendedWeightMg
  };
}

/**
 * Calculates total tablets, total batch weight, and costs.
 */
export function calculateBatch(
  activeRawWeightG: number,
  recommendedWeightMg: number,
  activePercentage: number,
  costPerKgBlend: number
): BatchResult {
  if (activeRawWeightG <= 0 || recommendedWeightMg <= 0 || activePercentage <= 0) {
    return {
      totalTablets: 0,
      totalBatchWeightKg: 0,
      costPerTabletUsd: 0,
      totalBatchCostUsd: 0
    };
  }

  const activeFraction = activePercentage / 100;
  const recommendedWeightG = recommendedWeightMg / 1000;

  // Total tablets = activeRawWeightG / (recommendedWeightG * activeFraction)
  const totalTablets = Math.floor(activeRawWeightG / (recommendedWeightG * activeFraction));

  // Total batch weight in kg
  const totalBatchWeightKg = (totalTablets * recommendedWeightMg) / 1000000;

  // Cost per tablet in USD = weight in kg * cost per kg
  const costPerTabletUsd = (recommendedWeightMg / 1000000) * costPerKgBlend;

  // Total batch cost in USD
  const totalBatchCostUsd = totalBatchWeightKg * costPerKgBlend;

  return {
    totalTablets,
    totalBatchWeightKg,
    costPerTabletUsd,
    totalBatchCostUsd
  };
}

/**
 * Analyzes cross-incompatibilities and safe percentage limits for the blend.
 */
export function checkCompatibilityAndLimits(
  ingredients: { ingredient: Ingredient; percentage: number }[],
  t?: (key: string) => string
): CompatibilityWarning[] {
  const warnings: CompatibilityWarning[] = [];
  const activeIngredients = ingredients.filter(item => item.percentage > 0);
  const translate = t || ((key: string) => key);

  // 1. Check percentage limits
  for (const item of activeIngredients) {
    if (item.percentage > item.ingredient.maxSafePercentage) {
      if (item.ingredient.id === 4) { // Magnesium Stearate specific warning
        const msg = translate('warning_magnesium_stearate_limit')
          .replace('{pct}', item.percentage.toFixed(2))
          .replace('{maxPct}', item.ingredient.maxSafePercentage.toFixed(2));
        const sugg = translate('warning_magnesium_stearate_limit_sugg');
        warnings.push({
          type: 'limit',
          severity: 'error',
          ingredientId: item.ingredient.id,
          message: msg,
          suggestion: sugg
        });
      } else {
        const msg = translate('warning_generic_limit')
          .replace('{name}', item.ingredient.name)
          .replace('{pct}', item.percentage.toFixed(2))
          .replace('{maxPct}', item.ingredient.maxSafePercentage.toFixed(2));
        const sugg = translate('warning_generic_limit_sugg')
          .replace('{name}', item.ingredient.name)
          .replace('{maxPct}', item.ingredient.maxSafePercentage.toFixed(2));
        warnings.push({
          type: 'limit',
          severity: 'warning',
          ingredientId: item.ingredient.id,
          message: msg,
          suggestion: sugg
        });
      }
    }
  }

  // 2. Check chemical compatibility conflicts
  for (let i = 0; i < activeIngredients.length; i++) {
    for (let j = i + 1; j < activeIngredients.length; j++) {
      const itemA = activeIngredients[i];
      const itemB = activeIngredients[j];

      // Check if A is incompatible with B's class, or B is incompatible with A's class
      const rule = getIngredientsCompatibilityRule(itemA.ingredient, itemB.ingredient);
      if (rule && rule.type === 'incompatible') {
        const ruleKeyBase = `rule_${rule.classA}_${rule.classB}`;
        let ruleTitle = translate(`${ruleKeyBase}_title`);
        let ruleMsg = translate(`${ruleKeyBase}_message`);
        let ruleSugg = translate(`${ruleKeyBase}_suggestion`);

        // fallback if key not found
        if (ruleTitle === `${ruleKeyBase}_title`) ruleTitle = rule.title;
        if (ruleMsg === `${ruleKeyBase}_message`) ruleMsg = rule.message;
        if (ruleSugg === `${ruleKeyBase}_suggestion`) ruleSugg = rule.suggestion;

        const msg = ruleMsg.replace(/{nameA}/g, itemA.ingredient.name).replace(/{nameB}/g, itemB.ingredient.name);
        const sugg = ruleSugg.replace(/{nameA}/g, itemA.ingredient.name).replace(/{nameB}/g, itemB.ingredient.name);

        warnings.push({
          type: 'compatibility',
          severity: rule.severity,
          ingredientId: itemA.ingredient.id,
          relatedIngredientId: itemB.ingredient.id,
          message: `⚠️ ${ruleTitle}: ${msg}`,
          suggestion: `💡 ${translate('card_suggestion')} ${sugg}`
        });
      }
    }
  }

  return warnings;
}

/**
 * Performs specific calculations for complex or homeopathic components with non-standard concentration/dilution.
 * Homeopathic components might not participate in standard mass/volume calculations directly.
 */
export function calculateComplexComponent(
  ingredient: Ingredient,
  _percentage: number
): {
  isComplex: boolean;
  dilutionScale?: string;
  effectiveActiveDoseMg: number;
  note: string;
} {
  const isComplex = !!ingredient.dilutionScale;
  if (!isComplex) {
    return { isComplex: false, effectiveActiveDoseMg: 0, note: "Standard ingredient" };
  }

  const scale = ingredient.dilutionScale || "";

  return {
    isComplex: true,
    dilutionScale: scale,
    effectiveActiveDoseMg: 0,
    note: `Компонент ${ingredient.name} разведен по шкале ${scale}. Химическая масса действующего вещества пренебрежимо мала.`
  };
}

/**
 * Calculates powder compaction using the Sonnergaard log-exp model.
 * V = V_l - w * log10(P) + V_e * exp(-P / P_m)
 */
export function calculateSonnergaardCompaction(
  pressure: number,
  vL: number,
  w: number,
  vE: number,
  pM: number
): number {
  if (pressure <= 0) {
    return vL + vE;
  }
  if (pM <= 0) {
    // Prevent division by zero
    return vL - w * Math.log10(pressure);
  }
  return vL - w * Math.log10(pressure) + vE * Math.exp(-pressure / pM);
}

/**
 * Analyzes segregation risk of a blend of ingredients based on bulk density and particle size ratios.
 */
export function calculateSegregationRisk(
  ingredients: { ingredient: Ingredient; percentage: number }[]
): SegregationRiskResult {
  const activeComponents = ingredients.filter(item => item.percentage > 0);
  if (activeComponents.length <= 1) {
    return {
      maxBulkDensityDifference: 0,
      bulkDensityRatio: 1.0,
      maxParticleSizeDifference: 0,
      particleSizeRatio: 1.0,
      riskLevel: 'Low',
      warnings: []
    };
  }

  const densities = activeComponents
    .map(item => item.ingredient.looseBulkDensity)
    .filter(d => d !== undefined && d > 0);

  const sizes = activeComponents
    .map(item => item.ingredient.averageParticleSizeUm)
    .filter((s): s is number => s !== undefined && s > 0);

  let maxBulkDensityDifference = 0;
  let bulkDensityRatio = 1.0;
  if (densities.length > 1) {
    const maxD = Math.max(...densities);
    const minD = Math.min(...densities);
    maxBulkDensityDifference = maxD - minD;
    bulkDensityRatio = minD > 0 ? maxD / minD : 1.0;
  }

  let maxParticleSizeDifference = 0;
  let particleSizeRatio = 1.0;
  if (sizes.length > 1) {
    const maxS = Math.max(...sizes);
    const minS = Math.min(...sizes);
    maxParticleSizeDifference = maxS - minS;
    particleSizeRatio = minS > 0 ? maxS / minS : 1.0;
  }

  let riskLevel: 'Low' | 'Medium' | 'High' = 'Low';
  const warnings: string[] = [];

  if (bulkDensityRatio > 6.0 || particleSizeRatio > 10.0) {
    riskLevel = 'High';
  } else if (bulkDensityRatio > 3.5 || particleSizeRatio > 4.5) {
    riskLevel = 'Medium';
  }

  if (bulkDensityRatio > 6.0) {
    warnings.push(`High density segregation risk: ratio of bulk densities is ${bulkDensityRatio.toFixed(2)} (threshold > 6.0).`);
  } else if (bulkDensityRatio > 3.5) {
    warnings.push(`Medium density segregation risk: ratio of bulk densities is ${bulkDensityRatio.toFixed(2)} (threshold > 3.5).`);
  }

  if (particleSizeRatio > 10.0) {
    warnings.push(`High particle size segregation risk: ratio of sizes is ${particleSizeRatio.toFixed(2)} (threshold > 10.0).`);
  } else if (particleSizeRatio > 4.5) {
    warnings.push(`Medium particle size segregation risk: ratio of sizes is ${particleSizeRatio.toFixed(2)} (threshold > 4.5).`);
  }

  return {
    maxBulkDensityDifference,
    bulkDensityRatio,
    maxParticleSizeDifference,
    particleSizeRatio,
    riskLevel,
    warnings
  };
}

/**
 * Calculates Wu's spreading coefficient of a lubricant over a substrate.
 * S_12 = -2 * gamma_L + 4 * ( (gamma_S^d * gamma_L^d)/(gamma_S^d + gamma_L^d) + (gamma_S^p * gamma_L^p)/(gamma_S^p + gamma_L^p) )
 */
export function calculateSpreadingCoefficientWu(
  gammaSd: number,
  gammaSp: number,
  gammaLd: number,
  gammaLp: number
): SpreadingCoefficientResult {
  const termD = (gammaSd + gammaLd) > 0 ? (gammaSd * gammaLd) / (gammaSd + gammaLd) : 0;
  const termP = (gammaSp + gammaLp) > 0 ? (gammaSp * gammaLp) / (gammaSp + gammaLp) : 0;

  const gammaL = gammaLd + gammaLp;

  const spreadingCoefficient = -2 * gammaL + 4 * (termD + termP);
  const rating = spreadingCoefficient > 0 ? 'Spontaneous' : 'Non-Spontaneous';

  return {
    spreadingCoefficient,
    rating
  };
}

/**
 * Calculates sustained-release vs. immediate-release pharmacokinetic dosing parameters.
 * D_SR = D_IR * (1 + (0.693 * T_d) / t_1/2)
 */
export function calculatePharmacokineticDose(
  dIR: number,
  tHalf: number,
  tDuration: number
): PKDoseResult {
  if (dIR <= 0 || tHalf <= 0 || tDuration <= 0) {
    return { dSR: 0, releaseRate: 0, loadingDose: 0, maintenanceDose: 0 };
  }

  const ke = 0.693 / tHalf;
  const dSR = dIR * (1 + ke * tDuration);
  const releaseRate = dIR * ke;

  return {
    dSR,
    releaseRate,
    loadingDose: dIR,
    maintenanceDose: dSR - dIR
  };
}

/**
 * Calculates wet granulation batch weights, raw fill weight with LOD, wet mass, and expected losses.
 */
export function calculateWetGranulation(inputs: WetGranulationInputs): WetGranulationResult {
  const totalDryBatchWeightKg = (inputs.targetTabletWeightMg * inputs.batchSizeTablets) / 1000000;
  const pureApiWeightKg = totalDryBatchWeightKg * (inputs.apiPercentage / 100);
  const intragranularDryWeightKg = totalDryBatchWeightKg * (inputs.intragranularPercentage / 100);
  
  const extragranularPercentage = 100 - inputs.intragranularPercentage;
  const extragranularDryWeightKg = totalDryBatchWeightKg * (extragranularPercentage / 100);
  
  const wetGranulesWeightBeforeDryingKg = intragranularDryWeightKg * (1 + inputs.binderSolutionAddedPercentage / 100);
  
  // LOD calculations
  const lodFraction = inputs.moistureContentLod / 100;
  const dryFraction = Math.max(0.01, 1 - lodFraction); // Prevent division by zero
  const granuleFillWeightPerTabletMg = (inputs.targetTabletWeightMg * (inputs.intragranularPercentage / 100)) / dryFraction;
  
  const finalFillWeightPerTabletMg = granuleFillWeightPerTabletMg + (inputs.targetTabletWeightMg * (extragranularPercentage / 100));
  
  const expectedLossWeightKg = totalDryBatchWeightKg * (inputs.expectedLossPercentage / 100);

  return {
    totalDryBatchWeightKg,
    pureApiWeightKg,
    intragranularDryWeightKg,
    extragranularDryWeightKg,
    wetGranulesWeightBeforeDryingKg,
    granuleFillWeightPerTabletMg,
    finalFillWeightPerTabletMg,
    expectedLossWeightKg
  };
}

/**
 * Calculates required Fill Cam size based on tablet weight, density, and punch dimensions.
 */
export function calculateFillCamSize(
  targetWeightMg: number,
  looseDensity: number,
  punch: PunchDimensions
): FillCamResult {
  let punchAreaMm2 = 0;
  if (punch.shape === 'round') {
    const diameter = punch.diameterMm ?? 0;
    punchAreaMm2 = (Math.PI * Math.pow(diameter, 2)) / 4;
  } else {
    const length = punch.lengthMm ?? 0;
    const width = punch.widthMm ?? 0;
    if (length > width) {
      punchAreaMm2 = width * (length - width) + (Math.PI * Math.pow(width, 2)) / 4;
    } else {
      punchAreaMm2 = length * width;
    }
  }

  const theoreticalFillDepthMm =
    looseDensity > 0 && punchAreaMm2 > 0 ? targetWeightMg / (looseDensity * punchAreaMm2) : 0;

  const recommendedFillDepthMm = theoreticalFillDepthMm > 0 ? theoreticalFillDepthMm + 3.0 : 0;

  const standardCams = [4, 6, 8, 10, 12, 14, 16, 18, 20];
  let closestStandardCamMm = 4;
  if (recommendedFillDepthMm > 0) {
    const found = standardCams.find(cam => cam >= recommendedFillDepthMm);
    closestStandardCamMm = found !== undefined ? found : 20;
  }

  return {
    punchAreaMm2,
    theoreticalFillDepthMm,
    recommendedFillDepthMm,
    closestStandardCamMm
  };
}

/**
 * Calculates Fette and GEA Courtoy fill depth settings/presets.
 */
export function calculatePressPresets(
  tabletThicknessMm: number,
  preCompressionHeightMm: number
): PressPresetsResult {
  const fetteFillDepthMm = 2 * tabletThicknessMm + 2;
  const geaCourtoyFillDepthMm = 1.8 * preCompressionHeightMm;

  return {
    fetteFillDepthMm,
    geaCourtoyFillDepthMm
  };
}


