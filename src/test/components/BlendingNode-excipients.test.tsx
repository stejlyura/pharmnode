// @vitest-environment jsdom
/**
 * Задача 1.3 — тесты UI-панели рекомендаций excipients в BlendingNode.
 *
 * Покрытие:
 *  1. Рендер секции "Рекомендуемые вспомогательные вещества" при наличии рекомендаций
 *  2. Скрытие секции, когда рекомендаций нет (все роли покрыты)
 *  3. Клик по кнопке "Добавить" вызывает addIngredientNode()
 *  4. Кнопка "Добавить" задизейблена, если ингредиент уже на холсте
 *  5. Критичная рекомендация (lubricant) отображает ⚠️, остальные — 💡
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { BlendingNode } from '@/components/BlendingNode';
import type { EditorNode, Ingredient } from '@/types/pharm';
import type { CalculatedResults } from '@/hooks/useNodeEditor';

// ─── Mocks ────────────────────────────────────────────────────────────────────

vi.mock('@/context/I18nContext', () => ({
  useTranslation: () => ({
    t: (key: string) => key, // returns key as translation fallback
  }),
}));

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const mockCalculatedResults: CalculatedResults = {
  blend: {
    looseDensity: 0.3,
    tappedDensity: 0.45,  // Carr ≈ 33 % → glidant trigger
    trueDensity: 0.5,
    costPerKg: 10,
    flowability: { hausner: 1.5, carr: 33.3, rating: 'Poor' },
  },
  tableting: { volume: 1, maxWeightMg: 500, recommendedWeightMg: 450, porosity: 0.2 },
  batch: { totalTablets: 1000, totalBatchWeightKg: 0.45, costPerTabletUsd: 0.01, totalBatchCostUsd: 10 },
  warnings: [],
  totalPercentage: 30,
  activePercentage: 30,
  allergens: [],
  scoring: {
    totalScore: 70,
    benefitScore: 80,
    stabilityScore: 85,
    manufacturabilityScore: 85,
    riskPenalty: 10,
    breakdown: [],
  },
};

function makeIngredient(id: number, role: Ingredient['role']): Ingredient {
  return {
    id,
    name: `Ingredient_${id}`,
    role,
    chemicalClassId: 1,
    looseBulkDensity: 0.3,
    tappedBulkDensity: 0.45,
    costPerKgUsd: 10,
    maxSafePercentage: 100,
  } as Ingredient;
}

/** A single active ingredient node (30 %) — triggers lubricant, filler, disintegrant, glidant recommendations */
const activeNode: EditorNode = {
  id: 'node-1',
  type: 'ingredient',
  position: { x: 0, y: 0 },
  data: { ingredientId: 1, percentage: 30 },
};

const blendingNode: EditorNode = {
  id: 'node-blending',
  type: 'blending',
  position: { x: 300, y: 0 },
  data: {},
};

const allIngredients: Ingredient[] = [
  makeIngredient(1, 'active'),
  makeIngredient(28, 'lubricant'), // Magnesium Stearate (seed id 28)
  makeIngredient(27, 'filler'),   // Avicel PH-102 (seed id 27)
  makeIngredient(29, 'disintegrant'), // Croscarmellose Sodium (seed id 29)
  makeIngredient(30, 'glidant'),  // Colloidal SiO₂ (seed id 30)
];

function renderBlendingNode({
  nodes = [activeNode],
  addIngredientNode,
}: {
  nodes?: EditorNode[];
  addIngredientNode?: (id: number | string) => void;
}) {
  return render(
    <BlendingNode
      node={blendingNode}
      nodes={nodes}
      calculatedResults={mockCalculatedResults}
      onUpdateData={() => {}}
      allIngredients={allIngredients}
      addIngredientNode={addIngredientNode}
    />,
  );
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('BlendingNode — Excipient Recommendations Panel (Задача 1.3)', () => {
  it('рендерит секцию рекомендаций, когда есть недостающие excipients', () => {
    renderBlendingNode({});
    // Section header should appear
    expect(screen.getByText(/Рекомендуемые вспомогательные вещества/i)).toBeDefined();
  });

  it('НЕ рендерит секцию, когда все excipient-роли уже покрыты', () => {
    // Provide nodes with all roles: active ≥ 80 %, lubricant, disintegrant, glidant
    const lubricantNode: EditorNode = { id: 'n-lub', type: 'ingredient', position: { x: 0, y: 0 }, data: { ingredientId: 28, percentage: 1 } };
    const disintNode: EditorNode = { id: 'n-dis', type: 'ingredient', position: { x: 0, y: 0 }, data: { ingredientId: 29, percentage: 4 } };
    const glidantNode: EditorNode = { id: 'n-gli', type: 'ingredient', position: { x: 0, y: 0 }, data: { ingredientId: 30, percentage: 0.5 } };
    // active 85 % → no filler needed; carr ≈ 33 % but glidant present → no glidant rec
    const activeNode85: EditorNode = { id: 'n-act', type: 'ingredient', position: { x: 0, y: 0 }, data: { ingredientId: 1, percentage: 85 } };

    renderBlendingNode({ nodes: [activeNode85, lubricantNode, disintNode, glidantNode] });
    expect(screen.queryByText(/Рекомендуемые вспомогательные вещества/i)).toBeNull();
  });

  it('отображает иконку ⚠️ для критичной рекомендации (lubricant)', () => {
    renderBlendingNode({});
    const warnings = document.querySelectorAll('[title="Критично"]');
    expect(warnings.length).toBeGreaterThan(0);
  });

  it('отображает иконку 💡 для некритичных рекомендаций', () => {
    renderBlendingNode({});
    const infos = document.querySelectorAll('[title="Рекомендуется"]');
    expect(infos.length).toBeGreaterThan(0);
  });

  it('кнопка "Добавить" вызывает addIngredientNode с правильным ID', () => {
    const addIngredientNode = vi.fn();
    renderBlendingNode({ addIngredientNode });

    const addButtons = screen.getAllByText('Добавить');
    expect(addButtons.length).toBeGreaterThan(0);

    fireEvent.click(addButtons[0]);
    expect(addIngredientNode).toHaveBeenCalledTimes(1);
    // First recommendation is lubricant (id=28 after Задача 1.4)
    expect(addIngredientNode).toHaveBeenCalledWith(28);
  });

  it('кнопка показывает "Добавлен" и задизейблена, когда ингредиент уже на холсте', () => {
    // Lubricant (id=4) is already on canvas
    const lubricantOnCanvas: EditorNode = {
      id: 'n-lub',
      type: 'ingredient',
      position: { x: 0, y: 0 },
      data: { ingredientId: 28, percentage: 0 }, // Magnesium Stearate (seed id 28)
    };

    // But we need to test that the node WITH the lubricant ingredient id shows "Добавлен"
    // active node (30 %) → still needs lubricant recommendation, but it's already on canvas
    renderBlendingNode({ nodes: [activeNode, lubricantOnCanvas], addIngredientNode: vi.fn() });

    // Lubricant node is on canvas → button should say "Добавлен"
    const addedButtons = screen.getAllByText('Добавлен');
    expect(addedButtons.length).toBeGreaterThan(0);
    expect((addedButtons[0] as HTMLButtonElement).disabled).toBe(true);
  });

  it('диапазон процентов отображается корректно для lubricant', () => {
    renderBlendingNode({});
    // "0.5–2%" for Magnesium Stearate
    expect(screen.getByText('0.5–2%')).toBeDefined();
  });
});
