/**
 * Задача 1.2 — тесты функции `calculateExcipientRequirements()`.
 *
 * Покрытие:
 *  - Правило 1: отсутствие lubricant → рекомендуется стеарат магния
 *  - Правило 2: активные < 80 % и отсутствие filler → рекомендуется МКЦ
 *  - Правило 3: форма tablet/capsule и отсутствие disintegrant → кроскармелоза
 *  - Правило 4: Карр > 20 и отсутствие glidant → коллоидный SiO₂
 *  - Edge case: все роли уже присутствуют → пустой массив
 *  - Edge case: пустой список ингредиентов → пустой массив
 *  - Edge case: powder/syrup → разрыхлитель НЕ рекомендуется
 */

import { describe, it, expect } from 'vitest';
import { calculateExcipientRequirements } from '@/lib/calculator';
import type { Ingredient } from '@/types/pharm';

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Creates a minimal Ingredient stub with only the fields required by the calculator. */
function makeIngredient(
  overrides: Partial<Ingredient> & Pick<Ingredient, 'id' | 'role' | 'looseBulkDensity' | 'tappedBulkDensity'>,
): Ingredient {
  return {
    name: `Ingredient_${overrides.id}`,
    casNumber: undefined,
    chemicalClassId: 1,
    costPerKgUsd: 10,
    maxSafePercentage: 100,
    benefit: 80,
    risk: 10,
    stability: 85,
    manufacturability: 85,
    ...overrides,
  } as Ingredient;
}

// ─── Fixture ingredients ──────────────────────────────────────────────────────

/** Active ingredient with good flowability (low Carr Index) */
const vitaminC = makeIngredient({
  id: 1,
  role: 'active',
  looseBulkDensity: 0.80,   // g/mL
  tappedBulkDensity: 0.90,  // → Carr ≈ 11 % (below 20)
});

/** Active ingredient with poor flowability (high Carr Index) */
const poorFlow = makeIngredient({
  id: 10,
  role: 'active',
  looseBulkDensity: 0.30,
  tappedBulkDensity: 0.45,  // → Carr = (0.45-0.30)/0.45 * 100 ≈ 33 % (above 20)
});

const lubricant = makeIngredient({
  id: 28,  // Magnesium Stearate (Задача 1.4, seed ID)
  role: 'lubricant',
  looseBulkDensity: 0.15,
  tappedBulkDensity: 0.25,
});

const filler = makeIngredient({
  id: 27,  // Avicel PH-102 MCC Filler (Задача 1.4, seed ID)
  role: 'filler',
  looseBulkDensity: 0.28,
  tappedBulkDensity: 0.43,
});

const disintegrant = makeIngredient({
  id: 29,  // Croscarmellose Sodium Ac-Di-Sol (Задача 1.4, seed ID)
  role: 'disintegrant',
  looseBulkDensity: 0.50,
  tappedBulkDensity: 0.80,
});

const glidant = makeIngredient({
  id: 30,  // Colloidal Silicon Dioxide Aerosil 200 Pharma (Задача 1.4, seed ID)
  role: 'glidant',
  looseBulkDensity: 0.04,
  tappedBulkDensity: 0.07,
});

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('calculateExcipientRequirements — edge cases', () => {
  it('возвращает [] при пустом списке ингредиентов', () => {
    const result = calculateExcipientRequirements([], 'tablet', 500);
    expect(result).toEqual([]);
  });

  it('возвращает [] при totalWeightMg <= 0', () => {
    const result = calculateExcipientRequirements(
      [{ ingredient: vitaminC, percentage: 30 }],
      'tablet',
      0,
    );
    expect(result).toEqual([]);
  });
});

describe('Правило 1 — Lubricant (смазывающее)', () => {
  it('рекомендует стеарат магния (id=4), когда lubricant отсутствует', () => {
    const result = calculateExcipientRequirements(
      [{ ingredient: vitaminC, percentage: 30 }],
      'tablet',
      500,
    );
    const rec = result.find(r => r.role === 'lubricant');
    expect(rec).toBeDefined();
    expect(rec!.ingredientId).toBe(28);
    expect(rec!.minPercentage).toBe(0.5);
    expect(rec!.maxPercentage).toBe(2.0);
    expect(rec!.defaultPercentage).toBe(1.0);
    expect(rec!.reason.length).toBeGreaterThan(0);
  });

  it('НЕ рекомендует lubricant, когда lubricant уже есть', () => {
    const result = calculateExcipientRequirements(
      [
        { ingredient: vitaminC, percentage: 30 },
        { ingredient: lubricant, percentage: 1 },
      ],
      'tablet',
      500,
    );
    expect(result.find(r => r.role === 'lubricant')).toBeUndefined();
  });
});

describe('Правило 2 — Filler (наполнитель)', () => {
  it('рекомендует МКЦ (id=5), когда active < 80 % и filler отсутствует', () => {
    const result = calculateExcipientRequirements(
      [{ ingredient: vitaminC, percentage: 30 }],
      'tablet',
      500,
    );
    const rec = result.find(r => r.role === 'filler');
    expect(rec).toBeDefined();
    expect(rec!.ingredientId).toBe(27);
  });

  it('defaultPercentage наполнителя = gap до 100 % (≤ 95)', () => {
    const result = calculateExcipientRequirements(
      [{ ingredient: vitaminC, percentage: 30 }],
      'tablet',
      500,
    );
    const rec = result.find(r => r.role === 'filler');
    expect(rec).toBeDefined();
    // gap = 100 - 30 = 70
    expect(rec!.defaultPercentage).toBe(70);
  });

  it('defaultPercentage зажат в [min=5, max=95]', () => {
    // active=30 % (< 80 → filler нужен), total = 30 + 69 = 99 %, gap = 1 % → clamped to min 5
    const heavyLubricant = makeIngredient({
      id: 99,
      role: 'lubricant',
      looseBulkDensity: 0.80,
      tappedBulkDensity: 0.90,
    });
    const result = calculateExcipientRequirements(
      [
        { ingredient: vitaminC, percentage: 30 },    // active < 80 %
        { ingredient: heavyLubricant, percentage: 69 }, // total = 99 %, gap = 1 %
      ],
      'tablet',
      500,
    );
    const rec = result.find(r => r.role === 'filler');
    expect(rec).toBeDefined();
    expect(rec!.defaultPercentage).toBe(5); // rawDefault=1 % → clamped to min 5 %
  });

  it('НЕ рекомендует filler, когда active >= 80 %', () => {
    const result = calculateExcipientRequirements(
      [{ ingredient: vitaminC, percentage: 85 }],
      'tablet',
      500,
    );
    expect(result.find(r => r.role === 'filler')).toBeUndefined();
  });

  it('НЕ рекомендует filler, когда filler уже есть', () => {
    const result = calculateExcipientRequirements(
      [
        { ingredient: vitaminC, percentage: 30 },
        { ingredient: filler, percentage: 60 },
      ],
      'tablet',
      500,
    );
    expect(result.find(r => r.role === 'filler')).toBeUndefined();
  });
});

describe('Правило 3 — Disintegrant (разрыхлитель)', () => {
  it('рекомендует кроскармелозу (id=6) для таблетки без disintegrant', () => {
    const result = calculateExcipientRequirements(
      [{ ingredient: vitaminC, percentage: 30 }],
      'tablet',
      500,
    );
    const rec = result.find(r => r.role === 'disintegrant');
    expect(rec).toBeDefined();
    expect(rec!.ingredientId).toBe(29);
    expect(rec!.minPercentage).toBe(2.0);
    expect(rec!.maxPercentage).toBe(8.0);
    expect(rec!.defaultPercentage).toBe(4.0);
  });

  it('рекомендует disintegrant для капсулы', () => {
    const result = calculateExcipientRequirements(
      [{ ingredient: vitaminC, percentage: 30 }],
      'capsule',
      500,
    );
    expect(result.find(r => r.role === 'disintegrant')).toBeDefined();
  });

  it('НЕ рекомендует disintegrant для порошка', () => {
    const result = calculateExcipientRequirements(
      [{ ingredient: vitaminC, percentage: 30 }],
      'powder',
      500,
    );
    expect(result.find(r => r.role === 'disintegrant')).toBeUndefined();
  });

  it('НЕ рекомендует disintegrant для сиропа', () => {
    const result = calculateExcipientRequirements(
      [{ ingredient: vitaminC, percentage: 10 }],
      'syrup',
      500,
    );
    expect(result.find(r => r.role === 'disintegrant')).toBeUndefined();
  });

  it('НЕ рекомендует disintegrant, когда он уже есть', () => {
    const result = calculateExcipientRequirements(
      [
        { ingredient: vitaminC, percentage: 30 },
        { ingredient: disintegrant, percentage: 4 },
      ],
      'tablet',
      500,
    );
    expect(result.find(r => r.role === 'disintegrant')).toBeUndefined();
  });
});

describe('Правило 4 — Glidant (глидант при Карр > 20)', () => {
  it('рекомендует Aerosil (id=3), когда Карр > 20 и glidant отсутствует', () => {
    // poorFlow: loose=0.30, tapped=0.45 → Carr = (0.45-0.30)/0.45 * 100 ≈ 33.3 %
    const result = calculateExcipientRequirements(
      [{ ingredient: poorFlow, percentage: 30 }],
      'tablet',
      500,
    );
    const rec = result.find(r => r.role === 'glidant');
    expect(rec).toBeDefined();
    expect(rec!.ingredientId).toBe(30);
    expect(rec!.minPercentage).toBe(0.1);
    expect(rec!.maxPercentage).toBe(1.0);
    expect(rec!.defaultPercentage).toBe(0.5);
    // reason должен содержать значение Индекса Карра
    expect(rec!.reason).toMatch(/Индекс Карра/);
  });

  it('НЕ рекомендует glidant, когда Карр <= 20', () => {
    // vitaminC: loose=0.80, tapped=0.90 → Carr ≈ 11.1 % (< 20)
    const result = calculateExcipientRequirements(
      [{ ingredient: vitaminC, percentage: 85 }],
      'tablet',
      500,
    );
    expect(result.find(r => r.role === 'glidant')).toBeUndefined();
  });

  it('НЕ рекомендует glidant, когда glidant уже есть', () => {
    const result = calculateExcipientRequirements(
      [
        { ingredient: poorFlow, percentage: 30 },
        { ingredient: glidant, percentage: 0.5 },
      ],
      'tablet',
      500,
    );
    expect(result.find(r => r.role === 'glidant')).toBeUndefined();
  });
});

describe('Edge case — все роли уже присутствуют', () => {
  it('возвращает [] когда все excipients уже есть в смеси', () => {
    // active ≥ 80 % → filler не нужен; все остальные роли покрыты
    const result = calculateExcipientRequirements(
      [
        { ingredient: vitaminC, percentage: 85 },   // active ≥ 80 % → no filler
        { ingredient: lubricant, percentage: 1 },
        { ingredient: disintegrant, percentage: 4 },
        { ingredient: glidant, percentage: 0.5 },
      ],
      'tablet',
      500,
    );
    expect(result).toHaveLength(0);
  });

  it('возвращает [] для порошка с lubricant и glidant при хорошей сыпучести', () => {
    const result = calculateExcipientRequirements(
      [
        { ingredient: vitaminC, percentage: 85 },   // active ≥ 80 %
        { ingredient: lubricant, percentage: 1 },    // lubricant covered
        // Карр у vitaminC ≈ 11 % → glidant не нужен
      ],
      'powder',  // powder → disintegrant не нужен
    );
    expect(result).toHaveLength(0);
  });

  it('НЕ рекомендует filler, когда общая сумма ингредиентов уже равна 100% (даже без роли filler)', () => {
    // В смеси нет филлера, но сумма уже 100 % (10 % active + 90 % dry-binder)
    const dryBinder = makeIngredient({
      id: 3,
      role: 'dry-binder',
      looseBulkDensity: 0.30,
      tappedBulkDensity: 0.45,
    });
    const result = calculateExcipientRequirements(
      [
        { ingredient: vitaminC, percentage: 10 },
        { ingredient: dryBinder, percentage: 90 },
      ],
      'tablet',
      500,
    );
    expect(result.find(r => r.role === 'filler')).toBeUndefined();
  });
});

describe('Структура возвращаемых рекомендаций', () => {
  it('каждый объект содержит все обязательные поля ExcipientRecommendation', () => {
    const result = calculateExcipientRequirements(
      [{ ingredient: poorFlow, percentage: 30 }],
      'tablet',
      500,
    );
    expect(result.length).toBeGreaterThan(0);
    for (const rec of result) {
      expect(typeof rec.role).toBe('string');
      expect(typeof rec.ingredientId === 'number' || typeof rec.ingredientId === 'string').toBe(true);
      expect(typeof rec.minPercentage).toBe('number');
      expect(typeof rec.maxPercentage).toBe('number');
      expect(typeof rec.defaultPercentage).toBe('number');
      expect(typeof rec.reason).toBe('string');
      // Инвариант: min < max
      expect(rec.minPercentage).toBeLessThan(rec.maxPercentage);
      // Инвариант: default в пределах [min, max]
      expect(rec.defaultPercentage).toBeGreaterThanOrEqual(rec.minPercentage);
      expect(rec.defaultPercentage).toBeLessThanOrEqual(rec.maxPercentage);
    }
  });
});
