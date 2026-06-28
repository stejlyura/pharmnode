// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useNodeEditor } from './useNodeEditor';
import { Ingredient } from '../types/pharm';

// Mock context and external modules
vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 'mock-user-123', email: 'user@example.com', tariff: 'hobby' },
  }),
}));

vi.mock('../context/I18nContext', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    locale: 'en-US',
  }),
}));

vi.mock('../lib/analytics', () => ({
  trackEvent: vi.fn(),
}));

const mockIngredients: Ingredient[] = [
  {
    id: 1,
    name: 'Active Ingredient A',
    role: 'active',
    chemicalClassId: 1,
    looseBulkDensity: 0.4,
    tappedBulkDensity: 0.6,
    costPerKgUsd: 100,
    maxSafePercentage: 10
  },
  {
    id: 2,
    name: 'Excipient B',
    role: 'filler',
    chemicalClassId: 2,
    looseBulkDensity: 0.5,
    tappedBulkDensity: 0.7,
    costPerKgUsd: 10,
    maxSafePercentage: 90
  }
];

describe('useNodeEditor Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('should initialize with default nodes and connections', () => {
    const { result } = renderHook(() => useNodeEditor('hobby', mockIngredients));

    expect(result.current.nodes).toBeDefined();
    expect(result.current.connections).toBeDefined();
    expect(result.current.nodes.length).toBeGreaterThan(0);
    expect(result.current.connections.length).toBeGreaterThan(0);
  });

  it('should allow adding an ingredient node within limit', () => {
    const { result } = renderHook(() => useNodeEditor('hobby', mockIngredients));
    const initialNodeCount = result.current.nodes.length;

    act(() => {
      result.current.addIngredientNode(1, { x: 100, y: 100 });
    });

    // hobby allows up to 3 ingredients, we had 2 initially
    expect(result.current.nodes.length).toBe(initialNodeCount + 1);
    const addedNode = result.current.nodes.find(
      n => n.id.startsWith('node-ing-')
    );
    expect(addedNode).toBeDefined();
    expect(addedNode?.position).toEqual({ x: 100, y: 100 });
  });

  it('should prevent adding more than 3 ingredients under hobby tariff', () => {
    const { result } = renderHook(() => useNodeEditor('hobby', mockIngredients));

    // Initially we have 2 ingredient nodes. Add 3rd:
    act(() => {
      result.current.addIngredientNode(1, { x: 100, y: 100 });
    });

    // Add 4th (should fail under hobby):
    let addResult;
    act(() => {
      addResult = result.current.addIngredientNode(2, { x: 200, y: 200 });
    });

    expect(addResult).toEqual({ success: false, reason: 'hobby-limit' });
  });

  it('should allow adding unlimited ingredients under professional tariff', () => {
    const { result } = renderHook(() => useNodeEditor('professional', mockIngredients));

    act(() => {
      result.current.addIngredientNode(1, { x: 100, y: 100 });
    });
    act(() => {
      result.current.addIngredientNode(2, { x: 200, y: 200 });
    });

    const ingredientsCount = result.current.nodes.filter(n => n.type === 'ingredient').length;
    expect(ingredientsCount).toBe(4); // 2 default + 2 added
  });

  it('should allow removing a node', () => {
    const { result } = renderHook(() => useNodeEditor('hobby', mockIngredients));
    const nodeIdToRemove = result.current.nodes[0].id;
    const initialLength = result.current.nodes.length;

    act(() => {
      result.current.removeNode(nodeIdToRemove);
    });

    expect(result.current.nodes.length).toBe(initialLength - 1);
    expect(result.current.nodes.some(n => n.id === nodeIdToRemove)).toBe(false);
  });

  it('should update node data correctly', () => {
    const { result } = renderHook(() => useNodeEditor('hobby', mockIngredients));
    const targetNode = result.current.nodes.find(n => n.type === 'ingredient');
    expect(targetNode).toBeDefined();

    act(() => {
      result.current.updateNodeData(targetNode!.id, { percentage: 25 });
    });

    const updatedNode = result.current.nodes.find(n => n.id === targetNode!.id);
    expect(updatedNode?.data.percentage).toBe(25);
  });

  it('should support undo and redo operations', () => {
    const { result } = renderHook(() => useNodeEditor('professional', mockIngredients));
    const targetNode = result.current.nodes.find(n => n.type === 'ingredient');

    act(() => {
      result.current.updateNodeData(targetNode!.id, { percentage: 40 });
    });
    expect(result.current.nodes.find(n => n.id === targetNode!.id)?.data.percentage).toBe(40);
    expect(result.current.canUndo).toBe(true);

    // Undo change
    act(() => {
      result.current.undo();
    });
    expect(result.current.nodes.find(n => n.id === targetNode!.id)?.data.percentage).not.toBe(40);
    expect(result.current.canRedo).toBe(true);

    // Redo change
    act(() => {
      result.current.redo();
    });
    expect(result.current.nodes.find(n => n.id === targetNode!.id)?.data.percentage).toBe(40);
  });
});
