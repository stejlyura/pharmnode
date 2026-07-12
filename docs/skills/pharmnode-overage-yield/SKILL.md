---
name: pharmnode-overage-yield
description: |
  Guides implementation of Overage and Yield calculations for pharmaceutical batches.
  Covers database columns, formula adjustments in calculator.ts, UI inputs in recipe canvas, and PDF Master Formula generation.
---

# PharmNode Overage & Yield Skill

## Математическая модель технологических потерь

В фармацевтическом производстве финальная масса сырья для закладки на партию корректируется с учетом:
1. **Overage (Технологический избыток)** для компенсации деградации/потерь конкретного ингредиента ($o_i$).
2. **Production Yield (Выход серии)** для компенсации потерь всей смеси в процессе производства ($\text{Yield}$).

### 1. Расчет количества доз (таблеток/капсул) в серии
Количество доз ($N$) рассчитывается по целевой массе активного вещества на входе (без учета оверейджа для самого расчета количества, так как количество доз определяется номинальной дозировкой):
$$N = \text{floor}\left( \frac{M_{active\_raw} \times 1000}{W_{tablet\_rec} \times \frac{API\%}{100}} \right)$$

### 2. Номинальный вес ингредиента на партию (без потерь)
Для каждого ингредиента $i$ с процентом в рецептуре $p_i$:
$$W_{nominal, i} \text{ (кг)} = \frac{N \times W_{tablet\_rec} \text{ (мг)} \times \frac{p_i}{100}}{1,000,000}$$

### 3. Расчет фактической закладки ингредиента с учетом Overage & Yield
Для каждого ингредиента $i$, имеющего индивидуальный избыток $o_i$ (%) и ожидаемый выход серии $\text{Yield}$ (%):
$$W_{final, i} \text{ (кг)} = W_{nominal, i} \times \frac{1 + \frac{o_i}{100}}{\text{Yield} / 100}$$

### 4. Итоговая масса партии сырья
Суммарная масса загрузки сырья на партию:
$$\text{Total Batch Weight (кг)} = \sum_{i} W_{final, i}$$

---

## Изменения в БД (Prisma)

1. `Recipe`:
   - `productionYield` (`Float`, по умолчанию `100.0`).
2. `Ingredient` и `CustomIngredient`:
   - `overagePercent` (`Float`, по умолчанию `0.0`).

---

## Логика расчетов (`src/lib/calculator.ts`)

Функция `calculateBatch` обновляется:
```typescript
export interface IngredientBatchWeight {
  ingredientId: string | number;
  name: string;
  nominalWeightKg: number;
  finalWeightKg: number;
  overagePercent: number;
}

export interface BatchResult {
  totalTablets: number;
  totalBatchWeightKg: number;      // Итоговый вес с учетом потерь
  nominalBatchWeightKg: number;    // Номинальный вес без потерь
  costPerTabletUsd: number;
  totalBatchCostUsd: number;
  ingredientsBreakdown: IngredientBatchWeight[];
}
```

---

## UI требования

1. **Рецепт / Настройки (OutputNode)**:
   - Поле ввода "Ожидаемые технологические потери" (Expected loss, %). Диапазон `0%` - `20%`.
   - При изменении пересчитывается `productionYield = 100 - lossPercent`.
   - Значение сохраняется в рецепте в БД.
2. **Ингредиенты (AddIngredientModal)**:
   - Поле ввода "Технологический избыток" (Overage, %). Диапазон `0%` - `50%`.
   - Отображается в карточке ингредиента.

---

## PDF Экспорт (Master Formula)

В PDF отчете `src/lib/pdfGenerator.ts` должна выводиться таблица "Master Formula" со следующими столбцами:
- Название компонента (Ingredient Name)
- Номинальный % (Nominal %)
- Избыток % (Overage %)
- Номинальный вес партии (Nominal Qty, кг)
- Фактический вес партии с учетом Yield & Overage (Actual Qty, кг)
