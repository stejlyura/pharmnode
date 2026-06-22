import { Ingredient, SideEffect } from '../types/pharm';
import { CompatibilityWarning } from './calculator';

export interface OverdoseWarning {
  ingredientId: string | number;
  name: string;
  doseMg: number;
  maxDoseMg: number;
}

export interface PenaltyDetail {
  reason: string;
  deduction: number;
}

export interface ScoringResult {
  score: number;
  aggregatedEffects: string[];
  aggregatedContraindications: string[];
  aggregatedSideEffects: SideEffect[];
  overdoses: OverdoseWarning[];
  benefitScore: number;
  stabilityScore: number;
  manufacturabilityScore: number;
  riskScore: number;
  penalties: PenaltyDetail[];
}

// Maximum safe active dosages in mg per single tablet
const ACTIVE_MAX_DOSAGE_MG: Record<string, number> = {
  "Vitamin C (Ascorbic Acid)": 2000,
  "Ascorbic Acid (Vitamin C)": 2000,
  "Paracetamol (Acetaminophen)": 1000,
  "Paracetamol": 1000,
  "Ibuprofen": 400,
  "Caffeine Anhydrous": 200,
  "Caffeine": 200,
  "Aspirin (Acetylsalicylic Acid)": 500,
  "Aspirin": 500,
  "Metformin Hydrochloride": 1000,
  "Metformin": 1000,
  "Vitamin D3 (Cholecalciferol)": 0.1, // 100 mcg
  "Vitamin D3": 0.1,
  "Amlodipine Besylate": 10,
  "Amlodipine": 10
};

/**
 * Calculates overall formulation score, checks overdoses, and aggregates Level 2 properties.
 */
export function analyzeRecipe(
  ingredients: { ingredient: Ingredient; percentage: number }[],
  recommendedWeightMg: number,
  compatibilityWarnings: CompatibilityWarning[]
): ScoringResult {
  const aggregatedEffectsSet = new Set<string>();
  const aggregatedContraindicationsSet = new Set<string>();
  const sideEffectsMap = new Map<string, { frequency: string; severity: 'low' | 'medium' | 'high' }>();
  const overdoses: OverdoseWarning[] = [];
  const penalties: PenaltyDetail[] = [];

  let totalPercentage = 0;
  let weightedBenefit = 0;
  let weightedStability = 0;
  let weightedManufacturability = 0;
  let weightedRisk = 0;
  let hasAllergens = false;

  for (const item of ingredients) {
    const ing = item.ingredient;
    const pct = item.percentage;
    if (pct <= 0) continue;

    totalPercentage += pct;

    // Default values if not specified (e.g. for custom ingredients)
    const benefit = ing.benefit ?? (ing.role === 'active' ? 80 : 10);
    const stability = ing.stability ?? 85;
    const manufacturability = ing.manufacturability ?? 85;
    const risk = ing.risk ?? (ing.role === 'active' ? 15 : 5);

    weightedBenefit += benefit * pct;
    weightedStability += stability * pct;
    weightedManufacturability += manufacturability * pct;
    weightedRisk += risk * pct;

    if (ing.isAllergen) {
      hasAllergens = true;
    }

    // Level 2 supplement logic
    // Effects
    if (ing.effects && Array.isArray(ing.effects)) {
      ing.effects.forEach(eff => aggregatedEffectsSet.add(eff));
    }
    // Contraindications
    if (ing.contraindications && Array.isArray(ing.contraindications)) {
      ing.contraindications.forEach(contra => aggregatedContraindicationsSet.add(contra));
    }
    // Side effects
    if (ing.sideEffects && Array.isArray(ing.sideEffects)) {
      ing.sideEffects.forEach((se: SideEffect) => {
        const existing = sideEffectsMap.get(se.name);
        if (!existing) {
          sideEffectsMap.set(se.name, { frequency: se.frequency, severity: se.severity });
        } else {
          // Severity order: high > medium > low
          const severityLevels = { low: 1, medium: 2, high: 3 };
          const existingLevel = severityLevels[existing.severity] || 1;
          const currentLevel = severityLevels[se.severity] || 1;

          if (currentLevel > existingLevel) {
            sideEffectsMap.set(se.name, {
              frequency: se.frequency,
              severity: se.severity
            });
          }
        }
      });
    }

    // Overdose checks (Skip homeopathic dilution scale)
    if (ing.role === 'active' && !ing.dilutionScale && recommendedWeightMg > 0) {
      const doseMg = recommendedWeightMg * (pct / 100);

      // Look up dose limits by name match
      let limit = Infinity;
      for (const [key, maxDose] of Object.entries(ACTIVE_MAX_DOSAGE_MG)) {
        if (ing.name.toLowerCase().includes(key.toLowerCase())) {
          limit = maxDose;
          break;
        }
      }

      if (doseMg > limit) {
        overdoses.push({
          ingredientId: ing.id,
          name: ing.name,
          doseMg,
          maxDoseMg: limit
        });
      }
    }
  }

  // Normalize metrics
  const scale = totalPercentage > 0 ? 100 / totalPercentage : 1;
  const finalBenefit = (weightedBenefit * scale) / 10000;
  const finalStability = (weightedStability * scale) / 10000;
  const finalManufacturability = (weightedManufacturability * scale) / 10000;
  const finalRisk = (weightedRisk * scale) / 10000;

  // Base score calculation
  // score = benefit * 0.4 + stability * 0.2 + manufacturability * 0.2 - risk * 0.2
  // We multiply by 100 to scale it to 0-100 range
  let score = (finalBenefit * 0.4 + finalStability * 0.2 + finalManufacturability * 0.2 - finalRisk * 0.2) * 100;
  if (isNaN(score)) score = 0;

  // Deductions (Penalties)
  // 1. Compatibility warnings
  compatibilityWarnings.forEach(w => {
    if (w.type === 'compatibility') {
      if (w.severity === 'error') {
        penalties.push({ reason: `Химический конфликт: ${w.message}`, deduction: 20 });
        score -= 20;
      } else {
        penalties.push({ reason: `Предупреждение совместимости: ${w.message}`, deduction: 10 });
        score -= 10;
      }
    } else if (w.type === 'limit') {
      penalties.push({ reason: `Превышение предела ввода: ${w.message}`, deduction: 15 });
      score -= 15;
    }
  });

  // 2. Overdoses
  overdoses.forEach(o => {
    penalties.push({
      reason: `Передозировка active сырья: ${o.name} (${o.doseMg.toFixed(1)} мг > лимит ${o.maxDoseMg} мг)`,
      deduction: 15
    });
    score -= 15;
  });

  // 3. Allergens
  if (hasAllergens) {
    penalties.push({ reason: "Наличие аллергенов в составе", deduction: 10 });
    score -= 10;
  }

  // Clamp score
  score = Math.max(0, Math.min(100, Math.round(score)));

  // Aggregate side effects to list
  const aggregatedSideEffects: SideEffect[] = [];
  sideEffectsMap.forEach((val, key) => {
    aggregatedSideEffects.push({
      name: key,
      frequency: val.frequency,
      severity: val.severity
    });
  });

  return {
    score,
    aggregatedEffects: Array.from(aggregatedEffectsSet),
    aggregatedContraindications: Array.from(aggregatedContraindicationsSet),
    aggregatedSideEffects,
    overdoses,
    benefitScore: Math.round(finalBenefit * 100),
    stabilityScore: Math.round(finalStability * 100),
    manufacturabilityScore: Math.round(finalManufacturability * 100),
    riskScore: Math.round(finalRisk * 100),
    penalties
  };
}
