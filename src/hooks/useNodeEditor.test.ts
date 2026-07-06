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

  it('should return regulatoryWarnings in calculatedResults', () => {
    const { result } = renderHook(() => useNodeEditor('hobby', mockIngredients));
    expect(result.current.calculatedResults.regulatoryWarnings).toBeDefined();
    expect(Array.isArray(result.current.calculatedResults.regulatoryWarnings)).toBe(true);
  });

  it('should auto-connect granulator node between blending and press', () => {
    const { result } = renderHook(() => useNodeEditor('professional', mockIngredients));
    
    // Add granulator
    let addResult;
    act(() => {
      addResult = result.current.addTechNode('granulator');
    });

    expect(addResult.success).toBe(true);
    const granulatorNode = result.current.nodes.find(n => n.type === 'granulator');
    expect(granulatorNode).toBeDefined();

    // Check connections: it should break blending -> press and add blending -> granulator and granulator -> press
    const connBlendingToGranulator = result.current.connections.find(
      c => c.source === 'node-blending' && c.target === granulatorNode!.id
    );
    const connGranulatorToPress = result.current.connections.find(
      c => c.source === granulatorNode!.id && c.target === 'node-press'
    );
    expect(connBlendingToGranulator).toBeDefined();
    expect(connGranulatorToPress).toBeDefined();

    // Old direct connection should be removed
    const oldConn = result.current.connections.find(
      c => c.source === 'node-blending' && c.target === 'node-press'
    );
    expect(oldConn).toBeUndefined();
  });

  it('should replace press node with capsulator and update connections', () => {
    const { result } = renderHook(() => useNodeEditor('professional', mockIngredients));

    // Initially node-press is present
    expect(result.current.nodes.some(n => n.type === 'press')).toBe(true);

    let addResult;
    act(() => {
      addResult = result.current.addTechNode('capsulator');
    });

    expect(addResult.success).toBe(true);
    // Press node should be removed, and capsulator should be added
    expect(result.current.nodes.some(n => n.type === 'press')).toBe(false);
    
    const capsulatorNode = result.current.nodes.find(n => n.type === 'capsulator');
    expect(capsulatorNode).toBeDefined();

    // Connection: node-blending -> node-press should be converted to node-blending -> capsulator
    const connToCapsulator = result.current.connections.find(
      c => c.source === 'node-blending' && c.target === capsulatorNode!.id
    );
    expect(connToCapsulator).toBeDefined();
  });

  it('should restore default press node if capsulator is removed', () => {
    const { result } = renderHook(() => useNodeEditor('professional', mockIngredients));

    // Add capsulator (which replaces press node)
    let capsulatorNodeId;
    act(() => {
      const res = result.current.addTechNode('capsulator');
      capsulatorNodeId = res.nodeId;
    });

    expect(result.current.nodes.some(n => n.type === 'capsulator')).toBe(true);
    expect(result.current.nodes.some(n => n.type === 'press')).toBe(false);

    // Now remove the capsulator
    act(() => {
      result.current.removeNode(capsulatorNodeId!);
    });

    // Capsulator should be gone, and default press node should be restored
    expect(result.current.nodes.some(n => n.type === 'capsulator')).toBe(false);
    expect(result.current.nodes.some(n => n.type === 'press')).toBe(true);

    // Connection blending -> capsulator should revert back to blending -> press
    const connToPress = result.current.connections.find(
      c => c.source === 'node-blending' && c.target === 'node-press'
    );
    expect(connToPress).toBeDefined();
  });

  it('should replace capsulator node with press node when press is added', () => {
    const { result } = renderHook(() => useNodeEditor('professional', mockIngredients));

    // First replace default press with capsulator
    let capsulatorNodeId;
    act(() => {
      const res = result.current.addTechNode('capsulator');
      capsulatorNodeId = res.nodeId;
    });

    expect(result.current.nodes.some(n => n.type === 'capsulator')).toBe(true);
    expect(result.current.nodes.some(n => n.type === 'press')).toBe(false);

    // Now add press node (which should replace capsulator)
    let pressResult;
    act(() => {
      pressResult = result.current.addTechNode('press');
    });

    expect(pressResult!.success).toBe(true);
    expect(result.current.nodes.some(n => n.type === 'capsulator')).toBe(false);
    expect(result.current.nodes.some(n => n.type === 'press')).toBe(true);

    // Connection: node-blending -> capsulator should be converted back to node-blending -> node-press
    const connToPress = result.current.connections.find(
      c => c.source === 'node-blending' && c.target === 'node-press'
    );
    expect(connToPress).toBeDefined();
  });

  it('should remove unconnected ingredient nodes but keep connected and core nodes', () => {
    const { result } = renderHook(() => useNodeEditor('professional', mockIngredients));
    
    // Total nodes initially
    const initialNodesCount = result.current.nodes.length;

    // Add an ingredient node (which auto-connects to blending node)
    let addedNodeId;
    act(() => {
      const res = result.current.addIngredientNode(1, { x: 10, y: 10 });
      addedNodeId = res.nodeId;
    });

    expect(result.current.nodes.length).toBe(initialNodesCount + 1);
    expect(result.current.nodes.some(n => n.id === addedNodeId)).toBe(true);

    // Find the auto-connection and remove it to make the node unconnected
    const autoConn = result.current.connections.find(c => c.source === addedNodeId);
    expect(autoConn).toBeDefined();
    
    act(() => {
      result.current.removeConnection(autoConn!.id);
    });

    // Call removeUnconnectedNodes
    act(() => {
      result.current.removeUnconnectedNodes();
    });

    // The unconnected node should be gone
    expect(result.current.nodes.some(n => n.id === addedNodeId)).toBe(false);
    expect(result.current.nodes.length).toBe(initialNodesCount);
  });

  it('should reset canvas state to initialNodes when initialRecipeId is reset to null/undefined', () => {
    // 1. Initialize with an initialRecipeId
    const { result, rerender } = renderHook(
      ({ recipeId }) => useNodeEditor('professional', mockIngredients, recipeId),
      { initialProps: { recipeId: 'recipe-123' } }
    );

    // 2. Modify state by adding a node
    act(() => {
      result.current.addIngredientNode(1, { x: 10, y: 10 });
    });
    const modifiedLength = result.current.nodes.length;

    // 3. Rerender with recipeId = null (as if starting a new recipe)
    rerender({ recipeId: null });

    // 4. State should reset to default initialNodes
    expect(result.current.nodes.length).toBeLessThan(modifiedLength);
    expect(result.current.nodes.some(n => n.id.startsWith('node-ing-'))).toBe(false);
  });
});
