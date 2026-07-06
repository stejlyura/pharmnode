import { useState, useEffect, useMemo, useCallback } from 'react';
import { Ingredient, EditorNode, EditorConnection, HistoryState, TariffType, CompatibilityWarning, DosageFormFitResult } from '../types/pharm';
export type { EditorNode, EditorConnection, HistoryState, TariffType, CompatibilityWarning };
import { useAuth } from '../context/AuthContext';
import { useTranslation } from '../context/I18nContext';
import { trackEvent } from '../lib/analytics';
import {
  calculateBlendProperties,
  calculateTableting,
  calculatePorosity,
  calculateBatch,
  checkCompatibilityAndLimits,
  checkRegulatoryCompliance,
  BlendProperties,
  TabletingResult,
  BatchResult,
  calculateDosageFormFit,
} from '../lib/calculator';
import { analyzeRecipe, ScoringResult } from '../lib/scoring';

export interface CalculatedResults {
  blend: BlendProperties;
  tableting: TabletingResult & { porosity: number };
  batch: BatchResult;
  warnings: CompatibilityWarning[];
  totalPercentage: number;
  activePercentage: number;
  allergens: string[];
  scoring: ScoringResult;
  dosageFormFit: DosageFormFitResult;
  regulatoryWarnings: CompatibilityWarning[];
}

const initialNodes: EditorNode[] = [
  {
    id: "node-1",
    type: "ingredient",
    position: { x: 100, y: 150 },
    data: { ingredientId: 1, percentage: 10 }
  },
  {
    id: "node-2",
    type: "ingredient",
    position: { x: 100, y: 350 },
    data: { ingredientId: 2, percentage: 90 }
  },
  {
    id: "node-blending",
    type: "blending",
    position: { x: 450, y: 250 },
    data: {}
  },
  {
    id: "node-press",
    type: "press",
    position: { x: 750, y: 250 },
    data: { diameterCm: 0.3, depthCm: 0.5 }
  },
  {
    id: "node-output",
    type: "output",
    position: { x: 1050, y: 250 },
    data: { activeRawWeightG: 10 }
  }
];

const initialConnections: EditorConnection[] = [
  { id: "conn-1", source: "node-1", target: "node-blending" },
  { id: "conn-2", source: "node-2", target: "node-blending" },
  { id: "conn-3", source: "node-blending", target: "node-press" },
  { id: "conn-4", source: "node-press", target: "node-output" }
];

export function useNodeEditor(initialTariff: TariffType = 'hobby', customIngredients: Ingredient[] = [], initialRecipeId?: string | null) {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [tariff, setTariff] = useState<TariffType>(initialTariff);
  const [recipeId, setRecipeId] = useState<string | null>(initialRecipeId || null);

  const allIngredients = useMemo(() => {
    return customIngredients;
  }, [customIngredients]);

  const [state, setState] = useState<HistoryState>({
    nodes: initialNodes,
    connections: initialConnections
  });
  const isMockUser = !user?.id ? false : user.id.startsWith('mock-');

  // Load initial state from localStorage (guest/mock)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storageKey = user ? `pharmnode_canvas_state_${user.id}` : 'pharmnode_canvas_state';
      if (!user || isMockUser) {
        const stored = localStorage.getItem(storageKey);
        if (stored) {
          try {
            const parsed = JSON.parse(stored) as HistoryState;
            if (parsed && Array.isArray(parsed.nodes) && Array.isArray(parsed.connections)) {
              setTimeout(() => {
                setState(parsed);
              }, 0);
            }
          } catch (e) {
            console.error("Failed to parse canvas state from localStorage", e);
          }
        }
      }
    }
  }, [user, isMockUser]);

  // Sync internal recipeId state and handle resetting state when starting a new recipe
  useEffect(() => {
    setRecipeId(initialRecipeId || null);

    if (!initialRecipeId) {
      setState({
        nodes: initialNodes,
        connections: initialConnections
      });
      setPast([]);
      setFuture([]);
    }
  }, [initialRecipeId]);

  // Autosave canvas state debounced by 2 seconds
  useEffect(() => {
    const handler = setTimeout(async () => {
      // 1. Guest or Mock User -> Save to localStorage
      if (!user || isMockUser) {
        if (isMockUser && recipeId) {
          const storedKey = `pharmnode_recipes_mock_${user?.id}`;
          const stored = localStorage.getItem(storedKey);
          if (stored) {
            try {
              let existing = JSON.parse(stored) as { id: string; name: string; nodes: EditorNode[]; connections: EditorConnection[]; createdAt?: string; updatedAt?: string }[];
              existing = existing.map((r) =>
                r.id === recipeId
                  ? { ...r, nodes: state.nodes, connections: state.connections, updatedAt: new Date().toISOString() }
                  : r
              );
              localStorage.setItem(storedKey, JSON.stringify(existing));
            } catch (e) {
              console.error("Failed to autosave mock recipe:", e);
            }
          }
        } else {
          const storageKey = user ? `pharmnode_canvas_state_${user.id}` : 'pharmnode_canvas_state';
          localStorage.setItem(storageKey, JSON.stringify({
            nodes: state.nodes,
            connections: state.connections
          }));
        }
        return;
      }

      // 2. Real User -> Save to Server DB
      try {
        const payload: {
          nodes: EditorNode[];
          connections: EditorConnection[];
          userId: string;
          name: string;
          recipeId?: string;
        } = {
          nodes: state.nodes,
          connections: state.connections,
          userId: user.id,
          name: "Autosaved Recipe"
        };
        if (recipeId) {
          payload.recipeId = recipeId;
        }

        const response = await fetch('/api/recipes', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });
        const data = await response.json();
        if (data.success) {
          console.log("Canvas autosaved successfully to DB:", data);
          if (data.recipeId && data.recipeId !== recipeId) {
            setRecipeId(data.recipeId);
            window.history.replaceState({}, '', `/configurator?recipeId=${data.recipeId}`);
          }
        }
      } catch (err) {
        console.error("Autosave request failed:", err);
      }
    }, 2000);

    return () => clearTimeout(handler);
  }, [state.nodes, state.connections, user, isMockUser, recipeId]);

  const [past, setPast] = useState<HistoryState[]>([]);
  const [future, setFuture] = useState<HistoryState[]>([]);

  // Update state helper to record history
  const updateState = useCallback((newNodes: EditorNode[], newConnections: EditorConnection[]) => {
    setPast(prev => [...prev, state]);
    setFuture([]);
    setState({ nodes: newNodes, connections: newConnections });
  }, [state]);

  // Undo action
  const undo = useCallback(() => {
    if (past.length === 0) return;
    const previous = past[past.length - 1];
    const newPast = past.slice(0, past.length - 1);

    setFuture(prev => [state, ...prev]);
    setPast(newPast);
    setState(previous);
  }, [past, state]);

  // Redo action
  const redo = useCallback(() => {
    if (future.length === 0) return;
    const next = future[0];
    const newFuture = future.slice(1);

    setPast(prev => [...prev, state]);
    setFuture(newFuture);
    setState(next);
  }, [future, state]);

  // Setup keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isZ = e.key === 'z' || e.key === 'я';
      const isY = e.key === 'y' || e.key === 'н';

      if ((e.ctrlKey || e.metaKey) && isZ) {
        if (e.shiftKey) {
          e.preventDefault();
          redo();
        } else {
          e.preventDefault();
          undo();
        }
      } else if ((e.ctrlKey || e.metaKey) && isY) {
        e.preventDefault();
        redo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo]);

  // Add an ingredient node
  const addIngredientNode = useCallback((ingredientId: number | string, position?: { x: number; y: number }) => {
    const ingredientNodesCount = state.nodes.filter(node => node.type === 'ingredient').length;

    if (tariff === 'hobby' && ingredientNodesCount >= 3) {
      return { success: false, reason: 'hobby-limit' };
    }

    const newId = `node-ing-${Date.now()}`;
    const newNode: EditorNode = {
      id: newId,
      type: 'ingredient',
      position: position || { x: 100, y: 150 + Math.random() * 200 },
      data: { ingredientId, percentage: 0 }
    };

    // Auto-connect to blending node
    const newConn: EditorConnection = {
      id: `conn-${Date.now()}`,
      source: newId,
      target: 'node-blending'
    };

    updateState([...state.nodes, newNode], [...state.connections, newConn]);
    return { success: true, nodeId: newId };
  }, [state, tariff, updateState]);

  // Add a tech node (granulator or capsulator)
  // Add a tech node (granulator or capsulator)
  const addTechNode = useCallback((type: 'granulator' | 'capsulator' | 'press', position?: { x: number; y: number }) => {
    const newId = `node-tech-${type}-${Date.now()}`;
    
    if (type === 'granulator') {
      const newNode: EditorNode = {
        id: newId,
        type,
        position: position || { x: 600, y: 250 },
        data: { granulationType: 'wet', intragranularPercentage: 90, moistureContentLod: 3, binderSolutionAddedPercentage: 10, expectedLossPercentage: 2 }
      };

      // Auto-connect: insert between node-blending and press/capsulator
      const targetNode = state.nodes.find(n => n.type === 'press' || n.type === 'capsulator');
      if (targetNode) {
        const existingConn = state.connections.find(
          c => c.source === 'node-blending' && c.target === targetNode.id
        );

        if (existingConn) {
          const filteredConns = state.connections.filter(c => c.id !== existingConn.id);
          const newConns = [
            ...filteredConns,
            { id: `conn-g1-${Date.now()}`, source: 'node-blending', target: newId },
            { id: `conn-g2-${Date.now()}`, source: newId, target: targetNode.id }
          ];
          updateState([...state.nodes, newNode], newConns);
          return { success: true, nodeId: newId };
        }
      }

      updateState([...state.nodes, newNode], state.connections);
      return { success: true, nodeId: newId };
    } else if (type === 'press') {
      const capsulatorNode = state.nodes.find(n => n.type === 'capsulator');
      const targetPosition = capsulatorNode ? capsulatorNode.position : (position || { x: 750, y: 250 });
      const pressId = 'node-press';

      const newNode: EditorNode = {
        id: pressId,
        type: 'press',
        position: targetPosition,
        data: { diameterCm: 0.3, depthCm: 0.5 }
      };

      if (capsulatorNode) {
        // Auto-connect: replace capsulator node with press
        const filteredNodes = state.nodes.filter(n => n.id !== capsulatorNode.id);
        const updatedConns = state.connections.map(c => {
          let source = c.source;
          let target = c.target;
          if (c.source === capsulatorNode.id) source = pressId;
          if (c.target === capsulatorNode.id) target = pressId;
          return { ...c, source, target };
        });

        updateState([...filteredNodes, newNode], updatedConns);
        return { success: true, nodeId: pressId };
      }

      const existingPressNode = state.nodes.find(n => n.id === pressId);
      if (existingPressNode) {
        return { success: true, nodeId: pressId };
      }

      updateState([...state.nodes, newNode], state.connections);
      return { success: true, nodeId: pressId };
    } else {
      // type === 'capsulator'
      const pressNode = state.nodes.find(n => n.type === 'press');
      const targetPosition = pressNode ? pressNode.position : (position || { x: 750, y: 250 });

      const newNode: EditorNode = {
        id: newId,
        type,
        position: targetPosition,
        data: { capsuleSize: '#0', capsuleMaterial: 'gelatin' }
      };

      if (pressNode) {
        // Auto-connect: replace press node with capsulator
        const filteredNodes = state.nodes.filter(n => n.id !== pressNode.id);
        const updatedConns = state.connections.map(c => {
          let source = c.source;
          let target = c.target;
          if (c.source === pressNode.id) source = newId;
          if (c.target === pressNode.id) target = newId;
          return { ...c, source, target };
        });

        updateState([...filteredNodes, newNode], updatedConns);
        return { success: true, nodeId: newId };
      }

      updateState([...state.nodes, newNode], state.connections);
      return { success: true, nodeId: newId };
    }
  }, [state.nodes, state.connections, updateState]);


  // Remove a node (prevent removing core singleton nodes)
  const removeNode = useCallback((nodeId: string) => {
    const isCoreNode = ['node-blending', 'node-press', 'node-output'].includes(nodeId);
    if (isCoreNode) {
      return { success: false, reason: 'core-node-protected' };
    }

    const nodeToRemove = state.nodes.find(n => n.id === nodeId);
    if (nodeToRemove && nodeToRemove.type === 'capsulator') {
      // Auto-connect: replace capsulator back with default press node
      const pressId = 'node-press';
      const pressNode: EditorNode = {
        id: pressId,
        type: 'press',
        position: nodeToRemove.position,
        data: { diameterCm: 0.3, depthCm: 0.5 }
      };

      const filteredNodes = state.nodes.filter(node => node.id !== nodeId);
      const updatedConns = state.connections.map(c => {
        let source = c.source;
        let target = c.target;
        if (c.source === nodeId) source = pressId;
        if (c.target === nodeId) target = pressId;
        return { ...c, source, target };
      });

      updateState([...filteredNodes, pressNode], updatedConns);
      return { success: true };
    }

    const filteredNodes = state.nodes.filter(node => node.id !== nodeId);
    const filteredConnections = state.connections.filter(
      conn => conn.source !== nodeId && conn.target !== nodeId
    );

    updateState(filteredNodes, filteredConnections);
    return { success: true };
  }, [state, updateState]);

  // Remove all nodes that are not connected to any other node (excluding core singletons)
  const removeUnconnectedNodes = useCallback(() => {
    const coreNodeIds = ['node-blending', 'node-press', 'node-output'];
    
    // Find nodes that are in at least one connection
    const connectedNodeIds = new Set<string>();
    state.connections.forEach(conn => {
      connectedNodeIds.add(conn.source);
      connectedNodeIds.add(conn.target);
    });

    const unconnectedNodes = state.nodes.filter(node => {
      const isCore = coreNodeIds.includes(node.id) || node.type === 'capsulator' || node.type === 'press' || node.type === 'output' || node.type === 'blending';
      return !isCore && !connectedNodeIds.has(node.id);
    });

    if (unconnectedNodes.length === 0) return;

    const unconnectedNodeIds = unconnectedNodes.map(n => n.id);
    const newNodes = state.nodes.filter(node => !unconnectedNodeIds.includes(node.id));
    const newConnections = state.connections.filter(
      conn => !unconnectedNodeIds.includes(conn.source) && !unconnectedNodeIds.includes(conn.target)
    );

    updateState(newNodes, newConnections);
  }, [state, updateState]);

  // Update specific node data (e.g. percentages, punch size)
  const updateNodeData = useCallback((nodeId: string, data: Partial<EditorNode['data']>) => {
    const newNodes = state.nodes.map(node => {
      if (node.id === nodeId) {
        return {
          ...node,
          data: { ...node.data, ...data }
        };
      }
      return node;
    });

    updateState(newNodes, state.connections);
  }, [state.nodes, state.connections, updateState]);

  // Update node position (for visual dragging)
  const updateNodePosition = useCallback((nodeId: string, x: number, y: number, recordHistory = false) => {
    const newNodes = state.nodes.map(node => {
      if (node.id === nodeId) {
        return { ...node, position: { x, y } };
      }
      return node;
    });

    if (recordHistory) {
      updateState(newNodes, state.connections);
    } else {
      setState({ nodes: newNodes, connections: state.connections });
    }
  }, [state, updateState]);

  // Add a connection
  const addConnection = useCallback((source: string, target: string) => {
    const exists = state.connections.some(c => c.source === source && c.target === target);
    if (exists) return { success: false, reason: 'connection-exists' };

    const newConn: EditorConnection = {
      id: `conn-${Date.now()}`,
      source,
      target
    };

    updateState(state.nodes, [...state.connections, newConn]);
    return { success: true };
  }, [state, updateState]);

  // Remove a connection
  const removeConnection = useCallback((connectionId: string) => {
    const filteredConnections = state.connections.filter(c => c.id !== connectionId);
    updateState(state.nodes, filteredConnections);
  }, [state, updateState]);

  // Nodes data representation to prevent recalculating when only coordinates change (panning/dragging)
  const nodesDataDependency = useMemo(() => {
    return JSON.stringify(
      state.nodes.map(n => ({
        id: n.id,
        type: n.type,
        data: n.data
      }))
    );
  }, [state.nodes]);

  // Reactive calculations
  const calculatedResults = useMemo<CalculatedResults>(() => {
    // 1. Gather all ingredient node IDs connected to node-blending
    const connectedIngredientIds = state.connections
      .filter(conn => conn.target === 'node-blending')
      .map(conn => conn.source);

    const blendIngredients = state.nodes
      .filter(node => node.type === 'ingredient' && connectedIngredientIds.includes(node.id))
      .map(node => {
        const ingredient = allIngredients.find(ing => String(ing.id) === String(node.data.ingredientId));
        const percentage = node.data.percentage ?? 0;
        return {
          nodeId: node.id,
          ingredient,
          percentage
        };
      })
      .filter((item): item is { nodeId: string; ingredient: Ingredient; percentage: number } => !!item.ingredient);

    // Sum of percentages of connected ingredients
    const totalPercentage = blendIngredients.reduce((sum, item) => sum + item.percentage, 0);

    // 2. Calculate average properties of the blend
    const blend = calculateBlendProperties(blendIngredients);

    // Active percentage is the sum of percentages of active ingredients in the blend
    const activePercentage = blendIngredients
      .filter(item => item.ingredient.role === 'active')
      .reduce((sum, item) => sum + item.percentage, 0);

    // 3. Compute warnings and limits
    const warnings = checkCompatibilityAndLimits(blendIngredients, t, state.nodes, state.connections);

    // 4. Read equipment/punch size from Press Node
    const pressNode = state.nodes.find(node => node.type === 'press');
    const diameterCm = pressNode?.data.diameterCm ?? 0.3;
    const depthCm = pressNode?.data.depthCm ?? 0.5;

    const tableting = calculateTableting(diameterCm, depthCm, blend.looseDensity);

    // Porosity
    const porosity = calculatePorosity(tableting.recommendedWeightMg, tableting.volume, blend.trueDensity);
    const tabletingWithPorosity = {
      ...tableting,
      porosity
    };

    // 5. Read active raw weight from Output Node
    const outputNode = state.nodes.find(node => node.type === 'output');
    const activeRawWeightG = outputNode?.data.activeRawWeightG ?? 10;

    const batch = calculateBatch(activeRawWeightG, tableting.recommendedWeightMg, activePercentage, blend.costPerKg);

    // 6. Gather unique allergens in the blend
    const allergens = Array.from(
      new Set(
        blendIngredients
          .filter(item => item.ingredient.isAllergen)
          .map(item => item.ingredient.name)
      )
    );

    const scoring = analyzeRecipe(blendIngredients, tableting.recommendedWeightMg, warnings);

    const dosageFormFit = calculateDosageFormFit(tableting.recommendedWeightMg, blend.looseDensity, t);

    const regulatoryWarnings = checkRegulatoryCompliance(
      blendIngredients,
      tabletingWithPorosity.recommendedWeightMg,
      Number(outputNode?.data.servingsPerDay ?? 1),
      (outputNode?.data.market as 'usa' | 'eu' | 'both') ?? 'both'
    );

    return {
      blend,
      tableting: tabletingWithPorosity,
      batch,
      warnings,
      totalPercentage,
      activePercentage,
      allergens,
      scoring,
      dosageFormFit,
      regulatoryWarnings,
    };
  }, [nodesDataDependency, state.connections, allIngredients, t]);

  const setCanvasState = useCallback((nodes: EditorNode[], connections: EditorConnection[]) => {
    setState({ nodes, connections });
    setPast([]);
    setFuture([]);
  }, []);

  // 1. Debounced track calculation_performed
  useEffect(() => {
    if (calculatedResults.totalPercentage <= 0) return;

    const handler = setTimeout(() => {
      trackEvent('calculation_performed', {
        ingredientCount: state.nodes.filter(n => n.type === 'ingredient').length,
        totalPercentage: calculatedResults.totalPercentage,
        activePercentage: calculatedResults.activePercentage,
        hausnerRatio: calculatedResults.blend.flowability.hausner,
        carrIndex: calculatedResults.blend.flowability.carr,
        porosity: calculatedResults.tableting.porosity,
        hasWarnings: calculatedResults.warnings.length > 0,
        scoringScore: calculatedResults.scoring.score
      });
    }, 1000);
    return () => clearTimeout(handler);
  }, [
    calculatedResults.totalPercentage,
    calculatedResults.activePercentage,
    calculatedResults.blend.flowability.hausner,
    calculatedResults.blend.flowability.carr,
    calculatedResults.tableting.porosity,
    calculatedResults.warnings.length,
    calculatedResults.scoring.score,
    state.nodes
  ]);

  // 2. Track compatibility_error_triggered
  const warningMessagesJson = JSON.stringify(
    calculatedResults.warnings.map(w => ({ type: w.type, msg: w.message }))
  );
  useEffect(() => {
    try {
      const currentWarnings = JSON.parse(warningMessagesJson) as { type: string; msg: string }[];
      if (currentWarnings.length > 0) {
        currentWarnings.forEach((warn) => {
          trackEvent('compatibility_error_triggered', {
            conflictType: warn.type,
            message: warn.msg
          });
        });
      }
    } catch (e) {
      console.error('Failed to parse warnings for telemetry:', e);
    }
  }, [warningMessagesJson]);

  return {
    nodes: state.nodes,
    connections: state.connections,
    tariff,
    setTariff,
    calculatedResults,
    addIngredientNode,
    addTechNode,
    removeNode,
    updateNodeData,
    updateNodePosition,
    addConnection,
    removeConnection,
    undo,
    redo,
    canUndo: past.length > 0,
    canRedo: future.length > 0,
    setCanvasState,
    recipeId,
    removeUnconnectedNodes
  };
}
