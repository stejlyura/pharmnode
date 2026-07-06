import {
  Ingredient,
  SegregationRiskResult,
  SpreadingCoefficientResult,
  PKDoseResult,
  WetGranulationInputs,
  WetGranulationResult,
  PunchDimensions,
  FillCamResult,
  PressPresetsResult,
  CompatibilityWarning,
  ProcessType,
  ExcipientRecommendation,
  DosageFormFitResult,
} from '../types/pharm';
import { getIngredientsCompatibilityRule } from './chemicalRules';
import { REGULATORY_LIMITS } from './regulatoryLimits';

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
  t?: (key: string) => string,
  nodes?: { id: string; type: string }[],
  connections?: { source: string; target: string }[]
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

  // 3. Process Graph Validation: Carr Index > 25 and no Granulator node between Blending and Press
  if (nodes && connections) {
    const blendProps = calculateBlendProperties(ingredients);
    const carr = blendProps.flowability.carr;
    if (carr > 25) {
      const adj = new Map<string, string[]>();
      for (const conn of connections) {
        if (!adj.has(conn.source)) adj.set(conn.source, []);
        adj.get(conn.source)!.push(conn.target);
      }

      let hasPath = false;
      let hasGranulatorInPath = false;

      const queue: { current: string; pathHasGranulator: boolean }[] = [
        { current: 'node-blending', pathHasGranulator: false }
      ];
      const visited = new Set<string>();

      while (queue.length > 0) {
        const { current, pathHasGranulator } = queue.shift()!;
        if (current === 'node-press') {
          hasPath = true;
          if (pathHasGranulator) {
            hasGranulatorInPath = true;
          }
          continue;
        }
        visited.add(current);
        const neighbors = adj.get(current) || [];
        for (const next of neighbors) {
          if (!visited.has(next)) {
            const nextNode = nodes.find(n => n.id === next);
            const isGranulator = nextNode?.type === 'granulator';
            queue.push({
              current: next,
              pathHasGranulator: pathHasGranulator || isGranulator
            });
          }
        }
      }

      if (hasPath && !hasGranulatorInPath) {
        warnings.push({
          type: 'compatibility',
          severity: 'warning',
          message: 'Carr Index > 25: poor flowability. Add a Granulator node before tableting.',
          suggestion: 'Insert a Granulation node between Blending and Press to improve powder flow.'
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


// ─── Task 3.1 — Process Compatibility Validation ────────────────────────────

export interface ProcessValidationResult {
  isValid: boolean;
  warnings: string[];
  recommendations: string[];
}

/**
 * Validates whether the selected manufacturing process is compatible with
 * the ingredient set based on stability profiles and flowability data.
 * Deterministic expert-system rules — no AI/ML.
 */
export function validateProcessCompatibility(
  ingredients: { ingredient: Ingredient; percentage: number }[],
  processType: ProcessType
): ProcessValidationResult {
  const warnings: string[] = [];
  const recommendations: string[] = [];

  const active = ingredients.filter(i => i.percentage > 0);

  if (processType === 'wet_granulation') {
    for (const { ingredient } of active) {
      const sp = ingredient.stabilityProfile;
      if (!sp) continue;

      if (sp.hygroscopicity > 70) {
        warnings.push(
          `Ингредиент ${ingredient.name} гигроскопичен (hygroscopicity=${sp.hygroscopicity}). ` +
          `Влажная грануляция может привести к деградации.`
        );
      }

      if (sp.heatDegradation !== null && sp.heatDegradation !== undefined && sp.heatDegradation < 60) {
        warnings.push(
          `Ингредиент ${ingredient.name} термочувствителен (деградация при ${sp.heatDegradation}°C). ` +
          `Сушка гранулята при стандартных температурах (50–60°C) может вызвать деградацию.`
        );
      }
    }
  }

  if (processType === 'direct_compression') {
    const blend = calculateBlendProperties(active);
    if (blend.flowability.rating === 'Poor' || blend.flowability.rating === 'Very Poor') {
      warnings.push(
        `Сыпучесть смеси недостаточна для прямого прессования (${blend.flowability.rating}, ` +
        `Hausner=${blend.flowability.hausner.toFixed(3)}). Рассмотрите грануляцию.`
      );
    }

    const particleSizes = active
      .map(i => i.ingredient.averageParticleSizeUm)
      .filter((s): s is number => s !== undefined && s > 0);

    if (particleSizes.length > 0) {
      const avgSize = particleSizes.reduce((a, b) => a + b, 0) / particleSizes.length;
      if (avgSize < 50) {
        warnings.push(
          `Средний размер частиц (${avgSize.toFixed(1)} мкм) < 50 мкм. ` +
          `Мелкодисперсные частицы затрудняют прямое прессование.`
        );
      }
    }
  }

  if (processType === 'dry_granulation' || processType === 'roller_compaction') {
    for (const { ingredient } of active) {
      const sp = ingredient.stabilityProfile;
      if (!sp) continue;
      if (sp.hygroscopicity > 80) {
        recommendations.push(
          `Ингредиент ${ingredient.name} очень гигроскопичен (${sp.hygroscopicity}). ` +
          `Работайте в условиях контролируемой влажности (<40% RH).`
        );
      }
    }
  }

  return {
    isValid: warnings.length === 0,
    warnings,
    recommendations,
  };
}

// ─── Task 3.2 — Formula Score Engine ────────────────────────────────────────

export interface FormulaScoreResult {
  totalScore: number;           // 0–100
  benefitScore: number;
  stabilityScore: number;
  manufacturabilityScore: number;
  riskPenalty: number;
  breakdown: { ingredientName: string; score: number }[];
}

/**
 * Calculates a composite quality score for the formula.
 * score_i = benefit*0.4 + stability*0.2 + manufacturability*0.2 - risk*0.2
 * totalScore = Σ (score_i * fraction_i)   — weighted by percentage
 */
export function calculateFormulaScore(
  ingredients: { ingredient: Ingredient; percentage: number }[]
): FormulaScoreResult {
  const empty: FormulaScoreResult = {
    totalScore: 0,
    benefitScore: 0,
    stabilityScore: 0,
    manufacturabilityScore: 0,
    riskPenalty: 0,
    breakdown: [],
  };

  const active = ingredients.filter(i => i.percentage > 0);
  if (active.length === 0) return empty;

  const totalPct = active.reduce((s, i) => s + i.percentage, 0);
  if (totalPct <= 0) return empty;

  let weightedBenefit = 0;
  let weightedStability = 0;
  let weightedManufacturability = 0;
  let weightedRisk = 0;
  const breakdown: { ingredientName: string; score: number }[] = [];

  for (const { ingredient, percentage } of active) {
    const fraction = percentage / totalPct;

    const benefit           = ingredient.benefit           ?? (ingredient.role === 'active' ? 80 : 10);
    const stability         = ingredient.stability         ?? 85;
    const manufacturability = ingredient.manufacturability ?? 85;
    const risk              = ingredient.risk              ?? (ingredient.role === 'active' ? 15 : 5);

    const score_i = benefit * 0.4 + stability * 0.2 + manufacturability * 0.2 - risk * 0.2;

    weightedBenefit           += benefit           * fraction;
    weightedStability         += stability         * fraction;
    weightedManufacturability += manufacturability * fraction;
    weightedRisk              += risk              * fraction;
    breakdown.push({ ingredientName: ingredient.name, score: score_i * fraction });
  }

  const totalScore =
    weightedBenefit * 0.4 +
    weightedStability * 0.2 +
    weightedManufacturability * 0.2 -
    weightedRisk * 0.2;

  return {
    totalScore,
    benefitScore: weightedBenefit,
    stabilityScore: weightedStability,
    manufacturabilityScore: weightedManufacturability,
    riskPenalty: weightedRisk,
    breakdown,
  };
}

// ─── Task 3.3 — Packaging Recommendations Engine ────────────────────────────

export interface PackagingRecommendation {
  type: 'moisture_protection' | 'light_protection' | 'heat_protection' | 'standard';
  message: string;
  details: string;
}

/**
 * Returns packaging recommendations based on ingredient stability profiles.
 * Pure deterministic function — no side effects. Gracefully skips ingredients
 * without a stabilityProfile.
 */
export function getPackagingRecommendations(
  ingredients: { ingredient: Ingredient; percentage: number }[]
): PackagingRecommendation[] {
  const recommendations: PackagingRecommendation[] = [];
  const active = ingredients.filter(i => i.percentage > 0);

  // 1. Hygroscopicity check (> 70 → moisture protection)
  const hygroscopicItems = active.filter(
    i => i.ingredient.stabilityProfile?.hygroscopicity !== undefined
      && i.ingredient.stabilityProfile.hygroscopicity > 70
  );
  if (hygroscopicItems.length > 0) {
    recommendations.push({
      type: 'moisture_protection',
      message: 'Требуется влагозащитный блистер (ALU/ALU)',
      details: `Ингредиенты с высокой гигроскопичностью: ${hygroscopicItems.map(i => i.ingredient.name).join(', ')}`,
    });
  }

  // 2. Light sensitivity check
  const lightSensitiveItems = active.filter(
    i => i.ingredient.stabilityProfile?.lightSensitive === true
  );
  if (lightSensitiveItems.length > 0) {
    recommendations.push({
      type: 'light_protection',
      message: 'Требуется светонепроницаемая упаковка',
      details: `Светочувствительные ингредиенты: ${lightSensitiveItems.map(i => i.ingredient.name).join(', ')}`,
    });
  }

  // 3. Heat degradation check (< 40°C → cold chain required)
  const heatSensitiveItems = active.filter(
    i => i.ingredient.stabilityProfile?.heatDegradation !== null
      && i.ingredient.stabilityProfile?.heatDegradation !== undefined
      && i.ingredient.stabilityProfile.heatDegradation < 40
  );
  if (heatSensitiveItems.length > 0) {
    recommendations.push({
      type: 'heat_protection',
      message: 'Рекомендуется хранение при контролируемой температуре (2–8°C)',
      details: `Термолабильные ингредиенты: ${heatSensitiveItems.map(i => i.ingredient.name).join(', ')}`,
    });
  }

  // 4. Standard packaging if no special requirements
  if (recommendations.length === 0) {
    recommendations.push({
      type: 'standard',
      message: 'Стандартная упаковка (PVC/PVDC блистер)',
      details: 'Особых требований к упаковке не выявлено.',
    });
  }

  return recommendations;
}


// ─── Task 2.1 — Dosage Form Reference Data ──────────────────────────────────

/**
 * Standard hard-gelatin capsule sizes per USP/NF.
 * Volumes are nominal body+cap values (ml).
 * `maxFillMg` is pre-computed at the reference bulk density of 0.800 g/mL:
 *   maxFillMg = volumeMl * 0.800 g/mL * 1000 mg/g
 *
 * In practice, `maxFillMg` should be recalculated using the actual
 * `looseBulkDensity` of the blend (see `calculateDosageFormFit()`).
 *
 * Source: USP/NF capsule monograph; Capsugel / ACG Technical Reference.
 */
export interface CapsuleSize {
  /** USP size designation, e.g. '#0', '#00', '#000' */
  size: string;
  /** Nominal internal volume in mL (body + cap) */
  volumeMl: number;
  /**
   * Reference maximum fill in mg at ρ = 0.800 g/mL.
   * Actual capacity = volumeMl * looseBulkDensity * 1000.
   */
  maxFillMg: number;
}

/**
 * Standard tablet diameters with typical weight ranges.
 * Ranges are indicative values for direct compression blends
 * with looseBulkDensity ≈ 0.40–0.65 g/mL.
 *
 * Source: Pharmaceutical Technology, common industry practice.
 */
export interface TabletSize {
  /** Nominal punch diameter in mm */
  diameterMm: number;
  /** Typical tablet weight range [min, max] in mg */
  typicalWeightRangeMg: [number, number];
}

/**
 * USP standard capsule size table (#000 → #5), sorted largest → smallest.
 * Kept private; access via `getCapsuleSizes()`.
 */
const CAPSULE_SIZES: readonly CapsuleSize[] = Object.freeze([
  { size: '#000', volumeMl: 1.37, maxFillMg: 1096 },
  { size: '#00',  volumeMl: 0.91, maxFillMg: 728  },
  { size: '#0',   volumeMl: 0.68, maxFillMg: 544  },
  { size: '#1',   volumeMl: 0.50, maxFillMg: 400  },
  { size: '#2',   volumeMl: 0.37, maxFillMg: 296  },
  { size: '#3',   volumeMl: 0.30, maxFillMg: 240  },
  { size: '#4',   volumeMl: 0.21, maxFillMg: 168  },
  { size: '#5',   volumeMl: 0.13, maxFillMg: 104  },
]);

/**
 * Standard tablet diameters with typical weight ranges.
 * Sorted smallest → largest diameter.
 * Kept private; access via `getTabletSizes()`.
 */
const TABLET_SIZES: readonly TabletSize[] = Object.freeze([
  { diameterMm: 6,  typicalWeightRangeMg: [80,  150]  },
  { diameterMm: 8,  typicalWeightRangeMg: [150, 350]  },
  { diameterMm: 10, typicalWeightRangeMg: [300, 600]  },
  { diameterMm: 12, typicalWeightRangeMg: [500, 1000] },
  { diameterMm: 13, typicalWeightRangeMg: [700, 1200] },
]);

/**
 * Returns an immutable copy of the USP capsule size reference table.
 * Sorted from largest (#000) to smallest (#5).
 */
export function getCapsuleSizes(): readonly CapsuleSize[] {
  return CAPSULE_SIZES;
}

/**
 * Returns an immutable copy of the standard tablet size reference table.
 * Sorted from smallest (6 mm) to largest (13 mm) diameter.
 */
export function getTabletSizes(): readonly TabletSize[] {
  return TABLET_SIZES;
}

/**
 * Calculates how the blend volume per unit fits into standard USP capsules.
 * 
 * @param totalBlendMassMg Recommended weight of a single dose in mg.
 * @param looseBulkDensity Loose bulk density of the blend in g/mL.
 * @param t Optional translator function.
 */
export function calculateDosageFormFit(
  totalBlendMassMg: number,
  looseBulkDensity: number,
  t?: (key: string) => string
): DosageFormFitResult {
  if (totalBlendMassMg <= 0 || looseBulkDensity <= 0) {
    return {
      recommendedCapsuleSize: null,
      capsuleCount: 0,
      fitsInSingleCapsule: false,
      volumeMl: 0,
      fillPercentage: 0,
      alternativeSizes: [],
      warnings: [],
    };
  }

  // Volume in mL = mass in mg / (loose bulk density in g/mL * 1000 mg/g)
  const volumeMl = totalBlendMassMg / (looseBulkDensity * 1000);

  // Find all capsule sizes that can fit the volume
  const fittingCapsules = CAPSULE_SIZES.filter(c => volumeMl <= c.volumeMl);

  if (fittingCapsules.length > 0) {
    // Since CAPSULE_SIZES is sorted from largest (#000) to smallest (#5),
    // the last one in fittingCapsules is the smallest capsule that fits.
    const recommended = fittingCapsules[fittingCapsules.length - 1];
    const fillPercentage = (volumeMl / recommended.volumeMl) * 100;

    // Alternative sizes: all other fitting capsules
    const alternativeSizes = fittingCapsules
      .filter(c => c.size !== recommended.size)
      .map(c => ({
        size: c.size,
        fillPercentage: (volumeMl / c.volumeMl) * 100,
      }));

    return {
      recommendedCapsuleSize: recommended.size,
      capsuleCount: 1,
      fitsInSingleCapsule: true,
      volumeMl,
      fillPercentage,
      alternativeSizes,
      warnings: [],
    };
  }

  // Does not fit in any single capsule
  const largestCapsule = CAPSULE_SIZES[0];
  const capsuleCount = Math.ceil(volumeMl / largestCapsule.volumeMl);
  const fillPercentage = ((volumeMl / capsuleCount) / largestCapsule.volumeMl) * 100;

  // Warning translation / formatting
  let warningMessage = '';
  if (t) {
    const key = 'warning_split_capsules';
    const translated = t(key);
    if (translated !== key) {
      warningMessage = translated.replace('{count}', String(capsuleCount));
    }
  }

  if (!warningMessage) {
    let suffix = 'капсул';
    const mod10 = capsuleCount % 10;
    const mod100 = capsuleCount % 100;
    if (mod10 === 1 && mod100 !== 11) {
      suffix = 'капсулу';
    } else if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) {
      suffix = 'капсулы';
    }
    warningMessage = `Порцию придётся разбить на ${capsuleCount} ${suffix}`;
  }

  return {
    recommendedCapsuleSize: null,
    capsuleCount,
    fitsInSingleCapsule: false,
    volumeMl,
    fillPercentage,
    alternativeSizes: [],
    warnings: [warningMessage],
  };
}



// ─── Task 1.2 — Excipient Auto-Selection Engine ──────────────────────────────


/**
 * Dosage form types supported by the excipient recommendation engine.
 * Kept here (not in pharm.ts) because it is specific to this calculation context.
 */
export type DosageFormType = 'tablet' | 'capsule' | 'powder' | 'syrup';

/**
 * Candidate excipient IDs that correspond to the seed data defined in Задача 1.4.
 * These IDs are stable references to pre-seeded ingredients in the database.
 *
 * ID mapping (matches baseIngredients.ts and prisma/seed.ts):
 *   27 – Avicel PH-102 / MCC Filler (filler)
 *   28 – Magnesium Stearate (lubricant)
 *   29 – Croscarmellose Sodium Ac-Di-Sol (disintegrant)
 *   30 – Colloidal Silicon Dioxide / Aerosil 200 Pharma (glidant)
 */
const EXCIPIENT_CANDIDATES = {
  lubricant: {
    ingredientId: 28,            // Magnesium Stearate
    minPercentage: 0.5,
    maxPercentage: 2.0,
    defaultPercentage: 1.0,
    reason:
      'Смазывающее вещество предотвращает налипание порошка на пуансоны и матрицу при прессовании.',
  },
  filler: {
    ingredientId: 27,            // Avicel PH-102 (MCC Filler)
    minPercentage: 5.0,
    maxPercentage: 95.0,
    defaultPercentage: 0,        // computed dynamically as the gap to 100 %
    reason:
      'Наполнитель МКЦ добавляет объём и улучшает прессуемость при низком содержании активных веществ.',
  },
  disintegrant: {
    ingredientId: 29,            // Croscarmellose Sodium (Ac-Di-Sol)
    minPercentage: 2.0,
    maxPercentage: 8.0,
    defaultPercentage: 4.0,
    reason:
      'Разрыхлитель обеспечивает распадаемость таблетки в желудочно-кишечном тракте в течение 15 мин.',
  },
  glidant: {
    ingredientId: 30,            // Colloidal Silicon Dioxide (Aerosil 200 Pharma)
    minPercentage: 0.1,
    maxPercentage: 1.0,
    defaultPercentage: 0.5,
    reason:
      'Глидант (коллоидный SiO₂) улучшает сыпучесть порошка при Индексе Карра > 20.',
  },
} as const;


/**
 * Automatically generates a list of excipient recommendations for an in-development
 * pharmaceutical blend, based on pharmaceutical technology rules.
 *
 * Rules applied (deterministic expert-system, no AI/ML):
 *  1. Lubricant — recommended when no lubricant is present in the blend.
 *  2. Filler    — recommended when total active-ingredient percentage < 80 %
 *                 and no filler is already present.
 *  3. Disintegrant — recommended for tablets and capsules when no disintegrant
 *                    is already present.
 *  4. Glidant   — recommended when Carr Index > 20 and no glidant is present.
 *
 * @param blendIngredients  Current list of ingredients with their percentages.
 * @param dosageForm        Target dosage form ('tablet' | 'capsule' | 'powder' | 'syrup').
 * @param totalWeightMg     Target unit weight in mg (used for contextual calculations;
 *                          does not affect role-based logic directly).
 * @returns An array of ExcipientRecommendation objects. Returns an empty array when
 *          all relevant excipient roles are already covered.
 */
export function calculateExcipientRequirements(
  blendIngredients: { ingredient: Ingredient; percentage: number }[],
  dosageForm: DosageFormType,
  totalWeightMg: number,
): ExcipientRecommendation[] {
  // Guard: nonsensical inputs
  if (blendIngredients.length === 0 || totalWeightMg <= 0) {
    return [];
  }

  const recommendations: ExcipientRecommendation[] = [];

  // Build a quick lookup of roles already present (only those with percentage > 0)
  const existingRoles = new Set(
    blendIngredients
      .filter(item => item.percentage > 0)
      .map(item => item.ingredient.role),
  );

  // ── Rule 1: Lubricant ────────────────────────────────────────────────────
  if (!existingRoles.has('lubricant')) {
    const cand = EXCIPIENT_CANDIDATES.lubricant;
    recommendations.push({
      role: 'lubricant',
      ingredientId: cand.ingredientId,
      minPercentage: cand.minPercentage,
      maxPercentage: cand.maxPercentage,
      defaultPercentage: cand.defaultPercentage,
      reason: cand.reason,
    });
  }

  // ── Rule 2: Filler ───────────────────────────────────────────────────────
  // Active percentage = sum of all 'active' role ingredient percentages
  const activePercentage = blendIngredients
    .filter(item => item.ingredient.role === 'active' && item.percentage > 0)
    .reduce((sum, item) => sum + item.percentage, 0);

  if (!existingRoles.has('filler') && activePercentage < 80) {
    const cand = EXCIPIENT_CANDIDATES.filler;
    const totalExistingPercentage = blendIngredients
      .filter(item => item.percentage > 0)
      .reduce((sum, item) => sum + item.percentage, 0);

    if (totalExistingPercentage < 100) {
      // Fill the gap to 100 % — clamp within [minPercentage, maxPercentage]
      const rawDefault = Math.max(0, 100 - totalExistingPercentage);
      const defaultPercentage = Math.min(
        cand.maxPercentage,
        Math.max(cand.minPercentage, rawDefault),
      );

      recommendations.push({
        role: 'filler',
        ingredientId: cand.ingredientId,
        minPercentage: cand.minPercentage,
        maxPercentage: cand.maxPercentage,
        defaultPercentage,
        reason: cand.reason,
      });
    }
  }

  // ── Rule 3: Disintegrant (tablets and capsules only) ─────────────────────
  if (
    (dosageForm === 'tablet' || dosageForm === 'capsule') &&
    !existingRoles.has('disintegrant')
  ) {
    const cand = EXCIPIENT_CANDIDATES.disintegrant;
    recommendations.push({
      role: 'disintegrant',
      ingredientId: cand.ingredientId,
      minPercentage: cand.minPercentage,
      maxPercentage: cand.maxPercentage,
      defaultPercentage: cand.defaultPercentage,
      reason: cand.reason,
    });
  }

  // ── Rule 4: Glidant (Carr Index > 20) ────────────────────────────────────
  if (!existingRoles.has('glidant')) {
    const blendProps = calculateBlendProperties(blendIngredients);
    const carr = blendProps.flowability.carr;

    if (carr > 20) {
      const cand = EXCIPIENT_CANDIDATES.glidant;
      recommendations.push({
        role: 'glidant',
        ingredientId: cand.ingredientId,
        minPercentage: cand.minPercentage,
        maxPercentage: cand.maxPercentage,
        defaultPercentage: cand.defaultPercentage,
        reason: `${cand.reason} (Текущий Индекс Карра: ${carr.toFixed(4)} %)`,
      });
    }
  }

  return recommendations;
}

/**
 * Validates daily intake levels against FDA and EFSA Tolerable Upper Intake Levels (UL),
 * and checks FDA GRAS / EFSA Novel Food compliance status.
 */
export function checkRegulatoryCompliance(
  ingredients: { ingredient: Ingredient; percentage: number }[],
  servingSizeMg: number,
  servingsPerDay: number = 1,
  market: 'usa' | 'eu' | 'both' = 'both'
): CompatibilityWarning[] {
  const warnings: CompatibilityWarning[] = [];

  for (const item of ingredients) {
    if (item.percentage <= 0) continue;

    const ing = item.ingredient;
    const dailyDoseMg = (item.percentage / 100) * servingSizeMg * servingsPerDay;

    // Look up in regulatory limits by CAS or name/synonyms
    const limit = REGULATORY_LIMITS.find(r => {
      // 1. Match by CAS number if both have it
      if (r.casNumber && ing.casNumber && r.casNumber === ing.casNumber) {
        return true;
      }
      // 2. Match by exact name (case-insensitive)
      const ingNameLower = ing.name.toLowerCase();
      if (r.ingredientName.toLowerCase() === ingNameLower) {
        return true;
      }
      // 3. Match by synonyms
      if (r.synonyms && r.synonyms.some(s => s.toLowerCase() === ingNameLower)) {
        return true;
      }
      // 4. Substring match for convenience
      if (ingNameLower.includes(r.ingredientName.toLowerCase()) || r.ingredientName.toLowerCase().includes(ingNameLower)) {
        return true;
      }
      return false;
    });

    if (!limit) continue;

    const checkLimit = (ul: number | null, limitName: string) => {
      if (ul === null) return;
      if (dailyDoseMg > ul) {
        warnings.push({
          type: 'limit',
          severity: 'error',
          ingredientId: ing.id,
          message: `Daily dose of ${ing.name} (${dailyDoseMg.toFixed(2)} mg) exceeds the ${limitName} UL limit of ${ul.toFixed(2)} mg/day. Not allowed for sale as a dietary supplement.`,
          suggestion: `Reduce the percentage of ${ing.name} or lower the serving size to comply with ${limitName} guidelines.`
        });
      } else if (dailyDoseMg > ul * 0.8) {
        warnings.push({
          type: 'limit',
          severity: 'warning',
          ingredientId: ing.id,
          message: `Daily dose of ${ing.name} (${dailyDoseMg.toFixed(2)} mg) is close to the ${limitName} UL limit of ${ul.toFixed(2)} mg/day (exceeds 80%).`,
          suggestion: `Consider reducing the concentration of ${ing.name} to maintain a safe margin.`
        });
      }
    };

    // Check FDA UL (USA)
    if (market === 'usa' || market === 'both') {
      checkLimit(limit.fdaUlMgPerDay, 'FDA');
    }

    // Check EFSA UL (EU)
    if (market === 'eu' || market === 'both') {
      checkLimit(limit.efsaUlMgPerDay, 'EFSA');
    }

    // Check Novel Food (EU)
    if (limit.isNovelFood && (market === 'eu' || market === 'both')) {
      warnings.push({
        type: 'compatibility',
        severity: 'warning',
        ingredientId: ing.id,
        message: `Ingredient "${ing.name}" is classified as a Novel Food in the European Union.`,
        suggestion: `Separate pre-market authorization is required before selling in the EU market.`
      });
    }

    // Check GRAS (USA)
    if (!limit.isGras && (market === 'usa' || market === 'both')) {
      warnings.push({
        type: 'compatibility',
        severity: 'warning',
        ingredientId: ing.id,
        message: `Ingredient "${ing.name}" does not have FDA GRAS status.`,
        suggestion: `Verify regulatory pathways or use an alternative ingredient with GRAS status.`
      });
    }
  }

  return warnings;
}

