// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { NodeCard } from './NodeCard';
import { CalculatedResults } from '../hooks/useNodeEditor';
import { EditorNode, Ingredient } from '../types/pharm';

// Mock context hooks
vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({
    user: { name: 'Test User', email: 'test@example.com' },
  }),
}));

vi.mock('../context/I18nContext', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const keys: Record<string, string> = {
        card_blend_mixing: 'Blending & Mixing',
        card_press_equipment: 'Pressing Equipment',
        card_cost_optimizer: 'Cost Optimizer',
        card_final_product: 'Final Product Label',
      };
      return keys[key] || key;
    },
    setLocale: vi.fn(),
  }),
}));

const mockIngredients: Ingredient[] = [
  {
    id: 1,
    name: 'Amlodipine Besylate',
    role: 'active',
    chemicalClassId: 1,
    looseBulkDensity: 0.35,
    tappedBulkDensity: 0.48,
    costPerKgUsd: 450,
    maxSafePercentage: 20,
  },
];

const mockCalculatedResults: CalculatedResults = {
  blend: {
    looseDensity: 0.4,
    tappedDensity: 0.6,
    trueDensity: 1.5,
    costPerKg: 10,
    flowability: { rating: 'Good', hausner: 1.15, carr: 15 },
  },
  tableting: {
    volume: 0.2,
    maxWeightMg: 250,
    recommendedWeightMg: 200,
    porosity: 0.15,
  },
  batch: {
    costPerTabletUsd: 0.01,
    totalBatchCostUsd: 100,
    totalTablets: 10000,
    totalBatchWeightKg: 2.0,
  },
  warnings: [],
  totalPercentage: 100,
  activePercentage: 10,
  allergens: [],
  scoring: {
    score: 85,
    benefitScore: 90,
    stabilityScore: 80,
    manufacturabilityScore: 85,
    riskScore: 10,
    overdoses: [],
    penalties: [],
    aggregatedEffects: [],
    aggregatedContraindications: [],
    aggregatedSideEffects: [],
  },
  dosageFormFit: {
    recommendedCapsuleSize: '#0',
    capsuleCount: 1,
    fitsInSingleCapsule: true,
    volumeMl: 0.25,
    fillPercentage: 80,
    alternativeSizes: [],
    warnings: [],
  },
};

describe('NodeCard Component', () => {
  it('renders Ingredient node on desktop (expanded)', () => {
    const node: EditorNode = {
      id: 'node-1',
      type: 'ingredient',
      position: { x: 100, y: 100 },
      data: { ingredientId: 1, percentage: 10 },
    };

    render(
      <NodeCard
        node={node}
        calculatedResults={mockCalculatedResults}
        tariff="hobby"
        onUpdateData={vi.fn()}
        onRemove={vi.fn()}
        allIngredients={mockIngredients}
        isExpanded={true}
      />
    );

    expect(screen.getByText('Amlodipine Besylate')).toBeDefined();
    expect(screen.getByText('active')).toBeDefined();
  });

  it('renders Blending node in mobile mode', () => {
    const node: EditorNode = {
      id: 'node-2',
      type: 'blending',
      position: { x: 0, y: 0 },
      data: {},
    };

    render(
      <NodeCard
        node={node}
        calculatedResults={mockCalculatedResults}
        tariff="hobby"
        onUpdateData={vi.fn()}
        onRemove={vi.fn()}
        allIngredients={mockIngredients}
        isMobile={true}
      />
    );

    expect(screen.getByText('Blending & Mixing')).toBeDefined();
    expect(screen.getByText('Good')).toBeDefined();
  });
});
