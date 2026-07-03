---
name: pharmnode-stability-packaging
description: |
  Guides implementation and rules for Stability Profile and Packaging Recommendations.
  Use when modifying or validating: stability profile fields, packaging recommendation logic,
  process compatibility rules based on physical properties, or related components.
  Also triggers when user mentions: "stability profile", "packaging", "упаковка", "стабильность".
---

# PharmNode Stability & Packaging Skill

This skill documents the physical-chemical stability profile rules, process compatibility checks, and packaging recommendation logic in PharmNode.

## 1. Stability Profile (`IngredientStability`)

The `IngredientStability` model represents a 1:1 extension of the `Ingredient` model. It contains physical and chemical parameters determining the ingredient's susceptibility to ambient factors and its processing behavior.

### Fields

| Field | Type | Unit / Range | Description |
| --- | --- | --- | --- |
| `ph` | `Float?` | `0.0 - 14.0` | pH of a 10% aqueous solution (e.g. 3.0 for Ascorbic Acid, 8.5 for Magnesium Stearate). |
| `hygroscopicity` | `Int` | `0 - 100` | Hygroscopicity rating (0 = none, 100 = extreme moisture absorption). |
| `lightSensitive` | `Boolean` | `true / false` | Indicates sensitivity to UV / visible light degradation. |
| `heatDegradation` | `Float?` | `°C` | Temperature threshold above which thermal degradation occurs (e.g. 190°C for Paracetamol). |

---

## 2. Process Compatibility Validation

Manufacturing processes are validated against ingredient properties in `validateProcessCompatibility()`.

### Rules

1. **Wet Granulation (`wet_granulation`)**:
   - **Hygroscopicity Warn**: If any active ingredient has `hygroscopicity > 70`, warn that wet granulation could cause moisture-induced degradation:
     > "Ингредиент {name} гигроскопичен (hygroscopicity={hygro}). Влажная грануляция может привести к деградации."
   - **Heat Degradation Warn**: If any active ingredient has `heatDegradation < 60°C`, warn that drying granules at standard temperatures (50–60°C) could cause degradation:
     > "Ингредиент {name} термочувствителен (деградация при {temp}°C). Сушка гранулята при стандартных температурах (50–60°C) может вызвать деградацию."

2. **Direct Compression (`direct_compression`)**:
   - **Flowability Warn**: If the blend flowability rating is `'Poor'` or `'Very Poor'`, warn that flow properties are insufficient for direct compression and recommend granulation:
     > "Сыпучесть смеси недостаточна для прямого прессования ({rating}, Hausner={hausner}). Рассмотрите грануляцию."
   - **Particle Size Warn**: If the average particle size across all active ingredients is `< 50` microns, warn that fine particles impede direct compression:
     > "Средний размер частиц ({avgSize} мкм) < 50 мкм. Мелкодисперсные частицы затрудняют прямое прессование."

3. **Dry Granulation / Roller Compaction (`dry_granulation` / `roller_compaction`)**:
   - **Hygroscopicity Recommendation**: If any active ingredient has `hygroscopicity > 80`, recommend maintaining low relative humidity:
     > "Ингредиент {name} очень гигроскопичен ({hygro}). Работайте в условиях контролируемой влажности (<40% RH)."

---

## 3. Packaging Recommendations

Packaging recommendations are determined deterministically based on stability parameters.

### Rules

| Stability Condition | Packaging Type | Recommended Action / Message | Details / Ingredients |
| --- | --- | --- | --- |
| `hygroscopicity > 70` | `moisture_protection` | Требуется влагозащитный блистер (ALU/ALU) | List of hygroscopic ingredients |
| `lightSensitive === true` | `light_protection` | Требуется светонепроницаемая упаковка | List of light sensitive ingredients |
| `heatDegradation < 40` | `heat_protection` | Рекомендуется хранение при контролируемой температуре (2–8°C) | List of thermolabile ingredients |
| Default (None of above) | `standard` | Стандартная упаковка (PVC/PVDC блистер) | Особых требований к упаковке не выявлено. |

---

## 4. Code Implementation Examples

### Process Compatibility Checking
```typescript
import { Ingredient, ProcessType } from '@/types/pharm';

export interface ProcessValidationResult {
  isValid: boolean;
  warnings: string[];
  recommendations: string[];
}

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

  // Other processTypes follow similar rules...
  return {
    isValid: warnings.length === 0,
    warnings,
    recommendations,
  };
}
```

### Packaging Recommendation Generation
```typescript
export interface PackagingRecommendation {
  type: 'moisture_protection' | 'light_protection' | 'heat_protection' | 'standard';
  message: string;
  details: string;
}

export function getPackagingRecommendations(
  ingredients: { ingredient: Ingredient; percentage: number }[]
): PackagingRecommendation[] {
  const recommendations: PackagingRecommendation[] = [];
  const active = ingredients.filter(i => i.percentage > 0);

  // 1. Hygroscopicity check
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

  // 3. Heat degradation check
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

  // 4. Default standard fallback
  if (recommendations.length === 0) {
    recommendations.push({
      type: 'standard',
      message: 'Стандартная упаковка (PVC/PVDC блистер)',
      details: 'Особых требований к упаковке не выявлено.',
    });
  }

  return recommendations;
}
```

---
⬅️ [Вернуться к индексу документации](../../index.md)
