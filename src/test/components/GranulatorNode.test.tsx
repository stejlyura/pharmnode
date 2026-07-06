// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { GranulatorNode } from '@/components/GranulatorNode';
import type { EditorNode } from '@/types/pharm';
import type { CalculatedResults } from '@/hooks/useNodeEditor';

vi.mock('@/context/I18nContext', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    locale: 'en-US',
  }),
}));

const mockCalculatedResults = (carr: number): CalculatedResults => ({
  blend: {
    looseDensity: 0.4,
    tappedDensity: carr > 0 ? 0.4 / (1 - carr / 100) : 0.5,
    trueDensity: 1.5,
    costPerKg: 10,
    flowability: { rating: 'Fair', hausner: 1.2, carr },
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
});

describe('GranulatorNode Component', () => {
  it('renders correctly with default Wet granulation method', () => {
    const node: EditorNode = {
      id: 'node-granulator',
      type: 'granulator',
      position: { x: 0, y: 0 },
      data: { granulationType: 'wet' },
    };
    const onUpdateData = vi.fn();

    render(
      <GranulatorNode
        id={node.id}
        data={node.data}
        calculatedResults={mockCalculatedResults(18)}
        onUpdateData={onUpdateData}
      />
    );

    // Header exists
    expect(screen.getByText(/Granulator/i)).toBeDefined();

    // Type selector exists and Wet is active
    expect(screen.getByText('Wet')).toBeDefined();
    expect(screen.getByText('Dry')).toBeDefined();

    // Sliders exist for wet granulation
    expect(screen.getByText(/Intragranular/i)).toBeDefined();
    expect(screen.getByText(/Moisture LOD/i)).toBeDefined();
  });

  it('toggles granulation type when clicked', () => {
    const node: EditorNode = {
      id: 'node-granulator',
      type: 'granulator',
      position: { x: 0, y: 0 },
      data: { granulationType: 'wet' },
    };
    const onUpdateData = vi.fn();

    render(
      <GranulatorNode
        id={node.id}
        data={node.data}
        calculatedResults={mockCalculatedResults(18)}
        onUpdateData={onUpdateData}
      />
    );

    const dryButton = screen.getByText('Dry');
    fireEvent.click(dryButton);

    expect(onUpdateData).toHaveBeenCalledWith(node.id, { granulationType: 'dry' });
  });

  it('shows poor flowability warning when Carr Index > 25 and granulation is not wet', () => {
    const node: EditorNode = {
      id: 'node-granulator',
      type: 'granulator',
      position: { x: 0, y: 0 },
      data: { granulationType: 'dry' }, // Dry selected
    };
    const onUpdateData = vi.fn();

    render(
      <GranulatorNode
        id={node.id}
        data={node.data}
        calculatedResults={mockCalculatedResults(28)} // Carr Index = 28 (> 25)
        onUpdateData={onUpdateData}
      />
    );

    expect(screen.getByText(/Wet granulation is recommended when Carr Index > 25/i)).toBeDefined();
  });

  it('shows redundant granulation warning when Carr Index < 15', () => {
    const node: EditorNode = {
      id: 'node-granulator',
      type: 'granulator',
      position: { x: 0, y: 0 },
      data: { granulationType: 'wet' },
    };
    const onUpdateData = vi.fn();

    render(
      <GranulatorNode
        id={node.id}
        data={node.data}
        calculatedResults={mockCalculatedResults(10)} // Carr Index = 10 (< 15)
        onUpdateData={onUpdateData}
      />
    );

    expect(screen.getByText(/Granulation might be redundant: the powder already has good flowability/i)).toBeDefined();
  });
});
