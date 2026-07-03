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

## Новые научно-математические модели (реализованы)

### 1. Модель Соне (Sonnergaard Log-Exp Model)
Описывает уплотнение порошков под давлением, учитывая одновременно логарифмическую осадку (хрупкое разрушение/фрагментацию) и экспоненциальный спад (пластическую деформацию).

```typescript
// V = V_l - w * log10(P) + V_e * exp(-P / P_m)
function calculateSonnergaardCompaction(
  pressure: number, // P (давление в MPa)
  vL: number,       // V_l (константа логарифмического процесса)
  w: number,        // w (скорость логарифмического спада)
  vE: number,       // V_e (константа экспоненциального процесса)
  pM: number        // P_m (среднее давление текучести / предел пластичности)
): number
```

### 2. Гомогенность и сегрегация (Homogeneity & Segregation Risk)
Анализирует риск расслоения порошковой смеси на основе разности насыпных плотностей ($\Delta D_b$) и разности размеров частиц ($\Delta D_{50}$).

- **Отношение плотностей ($R_{Db} = D_{b,\max} / D_{b,\min}$)**:
  - $R_{Db} \le 3.5$: Хорошая стабильность смеси (Low risk)
  - $3.5 < R_{Db} \le 6.0$: Риск расслоения (Medium risk)
  - $R_{Db} > 6.0$: Высокий риск расслоения (High risk)
- **Отношение размеров частиц ($R_{D50} = D_{50,\max} / D_{50,\min}$)**:
  - $R_{D50} \le 4.5$: Хорошее качество перемешивания (Low risk)
  - $4.5 < R_{D50} \le 10.0$: Повышенный риск (Medium risk)
  - $R_{D50} > 10.0$: Высокий риск (High risk)

```typescript
calculateSegregationRisk(ingredients: { ingredient: Ingredient; percentage: number }[])
  → SegregationRiskResult
```

### 3. Термодинамика смесей: Уравнение Ву (Wu's Spreading Coefficient)
Оценка эффективности покрытия лубрикантов (например, стеарата магния) на поверхности наполнителей с использованием гармонического среднего для межфазного натяжения:

$$\gamma_{SL} = \gamma_S + \gamma_L - 4 \cdot \left( \frac{\gamma_S^d \gamma_L^d}{\gamma_S^d + \gamma_L^d} + \frac{\gamma_S^p \gamma_L^p}{\gamma_S^p + \gamma_L^p} \right)$$
$$S_{12} = \gamma_S - \gamma_L - \gamma_{SL} = -2\gamma_L + 4 \cdot \left( \frac{\gamma_S^d \gamma_L^d}{\gamma_S^d + \gamma_L^d} + \frac{\gamma_S^p \gamma_L^p}{\gamma_S^p + \gamma_L^p} \right)$$

- **$S_{12} > 0$**: Самопроизвольное растекание лубриканта (Spontaneous)
- **$S_{12} \le 0$**: Отсутствие самопроизвольного растекания (Non-Spontaneous)

```typescript
calculateSpreadingCoefficientWu(gammaSd: number, gammaSp: number, gammaLd: number, gammaLp: number)
  → { spreadingCoefficient: number, rating: 'Spontaneous' | 'Non-Spontaneous' }
```

### 4. Фармакокинетика и пролонгированное дозирование (PK Dosing)
Расчет дозы быстрого высвобождения ($D_{IR}$) и пролонгированного высвобождения ($D_{SR}$) с учетом периода полувыведения ($t_{1/2}$) и длительности действия ($T_d$):

$$D_{SR} = D_{IR} \cdot \left(1 + \frac{0.693 \cdot T_d}{t_{1/2}}\right)$$
$$ReleaseRate = \frac{D_{IR} \cdot 0.693}{t_{1/2}}$$

```typescript
calculatePharmacokineticDose(dIR: number, tHalf: number, tDuration: number)
  → { dSR: number, releaseRate: number, loadingDose: number, maintenanceDose: number }
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

calculateSonnergaardCompaction(pressure: number, vL: number, w: number, vE: number, pM: number)
  → number

calculateSegregationRisk(ingredients: { ingredient: Ingredient; percentage: number }[])
  → SegregationRiskResult

calculateSpreadingCoefficientWu(gammaSd: number, gammaSp: number, gammaLd: number, gammaLp: number)
  → { spreadingCoefficient: number, rating: 'Spontaneous' | 'Non-Spontaneous' }

calculatePharmacokineticDose(dIR: number, tHalf: number, tDuration: number)
  → { dSR: number, releaseRate: number, loadingDose: number, maintenanceDose: number }
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

---
⬅️ [Вернуться к индексу документации](../../index.md)
