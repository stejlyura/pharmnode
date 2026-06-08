import { Ingredient } from '../types/pharm';
import { getCompatibilityRule } from './chemicalRules';

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

  for (const item of ingredients) {
    const normalizedPercentage = item.percentage * scale; // Adjust percentages so they sum to 100%
    const fraction = normalizedPercentage / 100;
    
    looseDensitySum += item.ingredient.looseBulkDensity * fraction;
    tappedDensitySum += item.ingredient.tappedBulkDensity * fraction;
    trueDensitySum += (item.ingredient.trueDensity || item.ingredient.tappedBulkDensity) * fraction;
    costSum += item.ingredient.costPerKgUsd * fraction;
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
  ingredients: { ingredient: Ingredient; percentage: number }[]
): CompatibilityWarning[] {
  const warnings: CompatibilityWarning[] = [];
  const activeIngredients = ingredients.filter(item => item.percentage > 0);

  // 1. Check percentage limits
  for (const item of activeIngredients) {
    if (item.percentage > item.ingredient.maxSafePercentage) {
      if (item.ingredient.id === 4) { // Magnesium Stearate specific warning
        warnings.push({
          type: 'limit',
          severity: 'error',
          ingredientId: item.ingredient.id,
          message: `Превышение лимита: Содержание Magnesium Stearate (${item.percentage.toFixed(2)}%) превышает максимальный безопасный предел в ${item.ingredient.maxSafePercentage.toFixed(2)}%. Таблетка может получиться слишком гидрофобной и не пройти тест на растворимость (Dissolution Test USP).`,
          suggestion: 'Используйте минимально необходимое количество лубриканта (0.5% - 1.5%).'
        });
      } else {
        warnings.push({
          type: 'limit',
          severity: 'warning',
          ingredientId: item.ingredient.id,
          message: `Превышение предела: Содержание ${item.ingredient.name} (${item.percentage.toFixed(2)}%) превышает максимально рекомендуемый ввод (${item.ingredient.maxSafePercentage.toFixed(2)}%).`,
          suggestion: `Снизьте содержание ${item.ingredient.name} ниже ${item.ingredient.maxSafePercentage.toFixed(2)}% для обеспечения технологической стабильности.`
        });
      }
    }
  }

  // 2. Check chemical compatibility conflicts
  for (let i = 0; i < activeIngredients.length; i++) {
    for (let j = i + 1; j < activeIngredients.length; j++) {
      const itemA = activeIngredients[i];
      const itemB = activeIngredients[j];

      const classA = itemA.ingredient.chemicalClassId;
      const classB = itemB.ingredient.chemicalClassId;

      // Check if A is incompatible with B's class, or B is incompatible with A's class
      const rule = getCompatibilityRule(classA, classB);
      if (rule && rule.type === 'incompatible') {
        const msg = rule.message.replace(/{nameA}/g, itemA.ingredient.name).replace(/{nameB}/g, itemB.ingredient.name);
        const sugg = rule.suggestion.replace(/{nameA}/g, itemA.ingredient.name).replace(/{nameB}/g, itemB.ingredient.name);
        
        warnings.push({
          type: 'compatibility',
          severity: rule.severity,
          ingredientId: itemA.ingredient.id,
          relatedIngredientId: itemB.ingredient.id,
          message: `⚠️ ${rule.title}: ${msg}`,
          suggestion: `💡 Рекомендация ИИ: ${sugg}`
        });
      }
    }
  }

  return warnings;
}
