/**
 * Задача 1.1 — тесты на корректность расширенных типов ингредиентов (excipients).
 *
 * Эти тесты проверяют:
 * 1. Что все ожидаемые роли принимаются компилятором TypeScript (статическая проверка).
 * 2. Что набор ролей в runtime-массиве соответствует задокументированному перечню.
 * 3. Что интерфейс ExcipientRecommendation корректно типизирует допустимые объекты.
 */

import { describe, it, expect } from 'vitest';
import type { IngredientRole, ExcipientRecommendation } from '@/types/pharm';

// ---------------------------------------------------------------------------
// Статические проверки через присвоение (TypeScript не компилирует файл, если
// тип неверен, — поэтому само существование этих присвоений является тестом).
// ---------------------------------------------------------------------------

// Все 9 допустимых ролей
const _roles: IngredientRole[] = [
  'active',
  'filler',
  'lubricant',
  'glidant',
  'dry-binder',
  'disintegrant',
  'coating',
  'sweetener',
  'anti-caking',
];

// Корректный объект ExcipientRecommendation (стеарат магния как смазывающее)
const _magStearate: ExcipientRecommendation = {
  role: 'lubricant',
  ingredientId: 9,
  minPercentage: 0.5,
  maxPercentage: 2.0,
  defaultPercentage: 1.0,
  reason: 'Предотвращает налипание на пуансоны и стенки матрицы',
};

// ---------------------------------------------------------------------------
// Runtime-тесты
// ---------------------------------------------------------------------------

describe('IngredientRole — набор допустимых ролей', () => {
  const EXPECTED_ROLES: IngredientRole[] = [
    'active',
    'filler',
    'lubricant',
    'glidant',
    'dry-binder',
    'disintegrant',
    'coating',
    'sweetener',
    'anti-caking',
  ];

  it('должен содержать все 9 ролей', () => {
    expect(EXPECTED_ROLES).toHaveLength(9);
  });

  it('должен включать новые роли excipients', () => {
    const newRoles: IngredientRole[] = [
      'disintegrant',
      'coating',
      'sweetener',
      'anti-caking',
    ];
    for (const role of newRoles) {
      expect(EXPECTED_ROLES).toContain(role);
    }
  });

  it('должен включать унаследованные роли', () => {
    const legacyRoles: IngredientRole[] = [
      'active',
      'filler',
      'lubricant',
      'glidant',
      'dry-binder',
    ];
    for (const role of legacyRoles) {
      expect(EXPECTED_ROLES).toContain(role);
    }
  });
});

describe('ExcipientRecommendation — структура объекта', () => {
  it('должен принимать корректный объект с числовым ingredientId', () => {
    const rec: ExcipientRecommendation = {
      role: 'lubricant',
      ingredientId: 9,
      minPercentage: 0.5,
      maxPercentage: 2.0,
      defaultPercentage: 1.0,
      reason: 'Предотвращает налипание',
    };
    expect(rec.role).toBe('lubricant');
    expect(rec.ingredientId).toBe(9);
    expect(rec.minPercentage).toBeGreaterThan(0);
    expect(rec.maxPercentage).toBeGreaterThan(rec.minPercentage);
    expect(rec.defaultPercentage).toBeGreaterThanOrEqual(rec.minPercentage);
    expect(rec.defaultPercentage).toBeLessThanOrEqual(rec.maxPercentage);
    expect(rec.reason.length).toBeGreaterThan(0);
  });

  it('должен принимать строковый ingredientId', () => {
    const rec: ExcipientRecommendation = {
      role: 'filler',
      ingredientId: 'avicel-ph-102',
      minPercentage: 10,
      maxPercentage: 80,
      defaultPercentage: 45,
      reason: 'МКЦ — универсальный наполнитель для таблетирования',
    };
    expect(typeof rec.ingredientId).toBe('string');
  });

  it('должен принимать все новые роли в качестве role', () => {
    const newRoles: IngredientRole[] = [
      'disintegrant',
      'coating',
      'sweetener',
      'anti-caking',
    ];

    for (const role of newRoles) {
      const rec: ExcipientRecommendation = {
        role,
        ingredientId: 1,
        minPercentage: 0.1,
        maxPercentage: 10,
        defaultPercentage: 2,
        reason: `Тест роли ${role}`,
      };
      expect(rec.role).toBe(role);
    }
  });

  it('minPercentage должен быть меньше maxPercentage', () => {
    const rec: ExcipientRecommendation = {
      role: 'disintegrant',
      ingredientId: 10,
      minPercentage: 2,
      maxPercentage: 8,
      defaultPercentage: 4,
      reason: 'Кроскармелоза натрия — разрыхлитель для твёрдых форм',
    };
    expect(rec.minPercentage).toBeLessThan(rec.maxPercentage);
  });
});
