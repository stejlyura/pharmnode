// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { CapsulatorNode } from '@/components/CapsulatorNode';
import type { EditorNode } from '@/types/pharm';
import type { CalculatedResults } from '@/hooks/useNodeEditor';

vi.mock('@/context/I18nContext', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    locale: 'en-US',
  }),
}));

const mockCalculatedResults = (recommendedWeightMg: number, looseDensity: number): CalculatedResults => ({
  blend: {
    looseDensity,
    tappedDensity: 0.6,
    trueDensity: 1.5,
    costPerKg: 10,
    flowability: { rating: 'Good', hausner: 1.15, carr: 15 },
  },
  tableting: {
    volume: 0.2,
    maxWeightMg: 250,
    recommendedWeightMg,
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
});

describe('CapsulatorNode Component', () => {
  it('renders correctly with default values', () => {
    const node: EditorNode = {
      id: 'node-capsulator',
      type: 'capsulator',
      position: { x: 0, y: 0 },
      data: { capsuleSize: '#0', capsuleMaterial: 'gelatin' },
    };
    const onUpdateData = vi.fn();

    render(
      <CapsulatorNode
        id={node.id}
        data={node.data}
        calculatedResults={mockCalculatedResults(400, 0.8)} // 0.5 mL volume
        onUpdateData={onUpdateData}
      />
    );

    // Header exists
    expect(screen.getByText(/Capsule Filler/i)).toBeDefined();

    // Dropdown contains size #0
    const select = screen.getByRole('combobox');
    expect(select).toBeDefined();
    expect((select as HTMLSelectElement).value).toBe('#0');

    // Material selector gelatin is active
    expect(screen.getByText('Gelatin')).toBeDefined();
    expect(screen.getByText('HPMC')).toBeDefined();
  });

  it('calls onUpdateData when size is selected', () => {
    const node: EditorNode = {
      id: 'node-capsulator',
      type: 'capsulator',
      position: { x: 0, y: 0 },
      data: { capsuleSize: '#0', capsuleMaterial: 'gelatin' },
    };
    const onUpdateData = vi.fn();

    render(
      <CapsulatorNode
        id={node.id}
        data={node.data}
        calculatedResults={mockCalculatedResults(400, 0.8)}
        onUpdateData={onUpdateData}
      />
    );

    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: '#00' } });

    expect(onUpdateData).toHaveBeenCalledWith(node.id, { capsuleSize: '#00' });
  });

  it('shows overflow warning when volume exceeds capsule volume', () => {
    const node: EditorNode = {
      id: 'node-capsulator',
      type: 'capsulator',
      position: { x: 0, y: 0 },
      data: { capsuleSize: '#5', capsuleMaterial: 'gelatin' }, // Capsule size #5 has 0.13 mL capacity
    };
    const onUpdateData = vi.fn();

    render(
      <CapsulatorNode
        id={node.id}
        data={node.data}
        calculatedResults={mockCalculatedResults(400, 0.8)} // 0.5 mL volume (overflows #5!)
        onUpdateData={onUpdateData}
      />
    );

    expect(screen.getByText(/Warning: Blend will not fit in this capsule/i)).toBeDefined();
  });
});
