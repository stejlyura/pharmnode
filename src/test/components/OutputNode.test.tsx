// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { OutputNode } from '@/components/OutputNode';
import type { EditorNode } from '@/types/pharm';
import type { CalculatedResults } from '@/hooks/useNodeEditor';

vi.mock('@/context/I18nContext', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    locale: 'en-US',
    setLocale: () => {},
  }),
}));

vi.mock('@/context/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 'user-1', email: 'user@example.com' },
  }),
}));

const mockCalculatedResults = (regulatoryWarnings: any[] = []): CalculatedResults => ({
  blend: {
    looseDensity: 0.5,
    tappedDensity: 0.6,
    trueDensity: 1.5,
    costPerKg: 10,
    flowability: { rating: 'Good', hausner: 1.2, carr: 16.6 },
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
  activePercentage: 20,
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
  regulatoryWarnings
}) as any;

describe('OutputNode Component', () => {
  it('renders "Formula complies" when there are no regulatory warnings', () => {
    const node: EditorNode = {
      id: 'node-output',
      type: 'output',
      position: { x: 0, y: 0 },
      data: { market: 'both', servingsPerDay: 1 },
    };
    const onUpdateData = vi.fn();

    render(
      <OutputNode
        node={node}
        nodes={[]}
        calculatedResults={mockCalculatedResults([])}
        tariff="professional"
        onUpdateData={onUpdateData}
        allIngredients={[]}
      />
    );

    expect(screen.getByText(/Formula complies with FDA\/EFSA standards/i)).toBeDefined();
  });

  it('renders regulatory warnings with correct styling', () => {
    const node: EditorNode = {
      id: 'node-output',
      type: 'output',
      position: { x: 0, y: 0 },
      data: { market: 'both', servingsPerDay: 1 },
    };
    const onUpdateData = vi.fn();

    const mockWarnings = [
      {
        type: 'limit',
        severity: 'error',
        message: 'Daily dose exceeds the FDA UL limit',
        suggestion: 'Reduce the percentage'
      },
      {
        type: 'compatibility',
        severity: 'warning',
        message: 'Ingredient is classified as a Novel Food',
        suggestion: 'Pre-market authorization required'
      }
    ];

    render(
      <OutputNode
        node={node}
        nodes={[]}
        calculatedResults={mockCalculatedResults(mockWarnings)}
        tariff="professional"
        onUpdateData={onUpdateData}
        allIngredients={[]}
      />
    );

    expect(screen.getByText(/Daily dose exceeds the FDA UL limit/i)).toBeDefined();
    expect(screen.getByText(/Ingredient is classified as a Novel Food/i)).toBeDefined();
    expect(screen.getByText('🔴')).toBeDefined();
    expect(screen.getByText('🟣')).toBeDefined();
  });
});
