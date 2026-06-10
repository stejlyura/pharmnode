---
name: pharmnode-calculator
description: |
  Guides implementation of pharmaceutical calculations in PharmNode.
  Use when writing or modifying: calculator.ts, flowability formulas, tableting press simulation,
  batch yield, porosity, Carr index, Hausner ratio, or any numeric pharmaceutical computation.
  Also triggers when user mentions: "расчет", "формула", "плотность", "таблетирование", "партия".
---

# PharmNode Calculator Skill

## Единственный источник формул

**ВСЯ** бизнес-логика расчётов живёт в [`src/lib/calculator.ts`](../../../src/lib/calculator.ts).
Никогда не дублируй формулы в компонентах, хуках или API-роутах.

## Обязательные формулы (реализованы)

### Сыпучесть порошка (Flowability)

```typescript
// Коэффициент Хауснера
const hausner = tappedDensity / looseDensity;

// Индекс Карра
const carr = 100 * (tappedDensity - looseDensity) / tappedDensity;

// Шкала сыпучести по коэффициенту Хауснера
function getFlowabilityRating(h: number): string {
  if (h < 1.11) return 'Excellent';
  if (h <= 1.18) return 'Good';
  if (h <= 1.25) return 'Fair';
  if (h <= 1.34) return 'Passable';
  if (h <= 1.45) return 'Poor';
  return 'Very Poor';
}
```

### Геометрия матрицы пуансона

```typescript
// Объём цилиндрической матрицы (см³)
const volume = Math.PI * Math.pow(diameterCm / 2, 2) * depthCm;

// Максимальная масса засыпки
const maxWeightMg = volume * looseDensityBlend * 1000; // г → мг

// Рабочий вес (90% от макс., чтобы избежать брака)
const recommendedWeightMg = maxWeightMg * 0.9;
```

### Пористость таблетки

```typescript
// ε = 1 - (ρ_apparent / ρ_true)
// ρ_apparent = масса таблетки / геометрический объём
const porosity = 1 - (apparentDensity / trueDensityBlend);
```

### Расчёт партии

```typescript
// Количество таблеток из имеющегося сырья
const totalTablets = (activeRawWeightG * 1000) / (recommendedWeightMg * activePercentage / 100);

// Себестоимость таблетки
const totalBatchWeightKg = (totalTablets * recommendedWeightMg) / 1_000_000;
const costPerTabletUsd = (totalBatchWeightKg * costPerKgBlend) / totalTablets;
```

## Правила точности

- Все промежуточные расчёты — без округления (полная точность float)
- Округление **только в UI**, до 2–3 знаков для отображения пользователю
- Результаты функций возвращают значения с полной точностью

## Экспортируемые функции `calculator.ts`

```typescript
calculateFlowability(loose: number, tapped: number)
  → { hausner: number, carr: number, rating: string }

calculatePorosity(massMg: number, volumeCm3: number, trueDensityBlend: number)
  → number

calculateBlendProperties(ingredients: { ingredient: Ingredient, percentage: number }[])
  → { looseDensity: number, tappedDensity: number, flowability: ReturnType<typeof calculateFlowability> }

calculateTableting(diameterCm: number, depthCm: number, looseDensity: number)
  → { volume: number, maxWeightMg: number, recommendedWeightMg: number }

calculateBatch(activeRawWeightG: number, recommendedWeightMg: number, activePercentage: number, costPerKgBlend: number)
  → { totalTablets: number, totalBatchWeightKg: number, costPerTabletUsd: number, totalBatchCostUsd: number }

checkCompatibilityAndLimits(ingredients: { ingredient: Ingredient, percentage: number }[])
  → CompatibilityWarning[]
```

## Частые ошибки — НЕ делать так

```typescript
// ❌ НЕЛЬЗЯ: формулы прямо в компоненте
const hausner = tapped / loose; // в NodeCard.tsx

// ✅ НАДО: импортировать из calculator.ts
import { calculateFlowability } from '@/lib/calculator';
const { hausner, carr, rating } = calculateFlowability(loose, tapped);
```

## Ссылки на документацию

- Полная архитектура: [`docs/architecture/knowledge-base.md`](../../knowledge-base.md)
- Матрица совместимости: [`src/lib/chemicalRules.ts`](../../../src/lib/chemicalRules.ts)
