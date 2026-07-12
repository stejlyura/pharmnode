import { describe, it, expect, vi } from 'vitest';
import { generateGMPReport } from './pdfGenerator';
import { EditorNode, Ingredient } from '../types/pharm';
import type { CalculatedResults } from '../hooks/useNodeEditor';

// Mock jsPDF to assert on text elements being added
const mockAddPage = vi.fn();
const mockText = vi.fn();
const mockRect = vi.fn();
const mockLine = vi.fn();

class MockJsPDF {
  addPage = mockAddPage;
  text = mockText;
  rect = mockRect;
  line = mockLine;
  setFont = vi.fn();
  setFontSize = vi.fn();
  setTextColor = vi.fn();
  setFillColor = vi.fn();
  setDrawColor = vi.fn();
  save = vi.fn();
  internal = {
    pageSize: {
      getWidth: () => 210,
      getHeight: () => 297,
    }
  };
}

vi.mock('jspdf', () => {
  return {
    jsPDF: MockJsPDF
  };
});

describe('generateGMPReport', () => {
  it('should generate PDF report including Master Formula with Overage & Yield', async () => {
    const mockNodes: EditorNode[] = [
      {
        id: 'node-active',
        type: 'ingredient',
        position: { x: 0, y: 0 },
        data: { ingredientId: '1', percentage: 20 }
      },
      {
        id: 'node-filler',
        type: 'ingredient',
        position: { x: 0, y: 0 },
        data: { ingredientId: '2', percentage: 80 }
      },
      {
        id: 'node-out',
        type: 'output',
        position: { x: 0, y: 0 },
        data: { expectedLossPercentage: 5.0 }
      }
    ];

    const mockIngredients: Ingredient[] = [
      {
        id: '1',
        name: 'Active Ingredient X',
        role: 'active',
        chemicalClassId: 1,
        looseBulkDensity: 0.5,
        tappedBulkDensity: 0.6,
        costPerKgUsd: 100,
        maxSafePercentage: 100,
        overagePercent: 10,
      },
      {
        id: '2',
        name: 'Filler Substance Y',
        role: 'filler',
        chemicalClassId: 2,
        looseBulkDensity: 0.5,
        tappedBulkDensity: 0.6,
        costPerKgUsd: 10,
        maxSafePercentage: 100,
        overagePercent: 0,
      }
    ];

    const mockCalculatedResults: CalculatedResults = {
      blend: {
        looseDensity: 0.5,
        tappedDensity: 0.6,
        trueDensity: 1.2,
        costPerKg: 28,
        flowability: { rating: 'Good', hausner: 1.2, carr: 16.6 },
      },
      tableting: {
        volume: 0.2,
        maxWeightMg: 250,
        recommendedWeightMg: 200,
        porosity: 0.15,
      },
      batch: {
        totalTablets: 200,
        totalBatchWeightKg: 0.107368,
        nominalBatchWeightKg: 0.1,
        costPerTabletUsd: 0.01579,
        totalBatchCostUsd: 3.1579,
        ingredientsBreakdown: [
          {
            ingredientId: '1',
            name: 'Active Ingredient X',
            nominalWeightKg: 0.02,
            finalWeightKg: 0.023158,
            overagePercent: 10
          },
          {
            ingredientId: '2',
            name: 'Filler Substance Y',
            nominalWeightKg: 0.08,
            finalWeightKg: 0.08421,
            overagePercent: 0
          }
        ]
      },
      warnings: [],
      totalPercentage: 100,
      activePercentage: 20,
      allergens: [],
      scoring: {
        score: 85,
        benefitScore: 90,
        stabilityScore: 80,
        manufacturabilityScore: 80,
        riskScore: 10,
        aggregatedEffects: [],
        aggregatedContraindications: [],
        aggregatedSideEffects: [],
        overdoses: [],
        penalties: []
      },
      dosageFormFit: {
        recommendedCapsuleSize: null,
        capsuleCount: 0,
        fitsInSingleCapsule: true,
        volumeMl: 0,
        fillPercentage: 0,
        alternativeSizes: [],
        warnings: []
      },
      regulatoryWarnings: []
    };

    await generateGMPReport(
      mockNodes,
      mockCalculatedResults,
      { id: 'user-123', name: 'Tech User', email: 'tech@example.com', tariff: 'professional', provider: 'credentials' },
      'US',
      mockIngredients
    );

    // Verify sections and details were printed
    expect(mockText).toHaveBeenCalledWith("2.1. Production Master Formula (Batch Layout)", 20, expect.any(Number));
    expect(mockText).toHaveBeenCalledWith("Component Name", 23, expect.any(Number));
    
    // Check that custom ingredient with 10% overage and filler with 0% overage are rendered in actual quantities
    expect(mockText).toHaveBeenCalledWith("Active Ingredient X", 23, expect.any(Number));
    expect(mockText).toHaveBeenCalledWith("Filler Substance Y", 23, expect.any(Number));
  });
});
