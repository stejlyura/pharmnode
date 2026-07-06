"use client";

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useTranslation } from '../context/I18nContext';
import { EditorNode, EditorConnection, TariffType, Ingredient } from '../types/pharm';
import { CalculatedResults } from '../hooks/useNodeEditor';
import { NodeCard } from './NodeCard';
import { CanvasToolbar } from './CanvasToolbar';
import { CanvasContextMenu } from './CanvasContextMenu';
import { FlaskConical } from 'lucide-react';

interface CanvasAreaProps {
  nodes: EditorNode[];
  connections: EditorConnection[];
  calculatedResults: CalculatedResults;
  tariff: TariffType;
  updateNodeData: (id: string, data: Partial<EditorNode['data']>) => void;
  removeNode: (id: string) => void;
  updateNodePosition: (id: string, x: number, y: number, record?: boolean) => void;
  handleReplaceIngredient: (oldId: number | string, newId: number | string) => void;
  allIngredients: Ingredient[];
  remainingIngredients: Ingredient[];
  handleAddIngredientAt: (id: number | string, position?: { x: number; y: number }) => void;
  handleAddTechNodeAt?: (type: 'granulator' | 'capsulator' | 'press', position?: { x: number; y: number }) => void;
  onOpenUpgradeModal: () => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onOpenWizard: () => void;
  onOpenCompatibilityMatrix: () => void;
  handleRemoveUnconnected?: () => void;
}

export const CanvasArea: React.FC<CanvasAreaProps> = ({
  nodes,
  connections,
  calculatedResults,
  tariff,
  updateNodeData,
  removeNode,
  updateNodePosition,
  handleReplaceIngredient,
  allIngredients,
  remainingIngredients,
  handleAddIngredientAt,
  handleAddTechNodeAt,
  onOpenUpgradeModal,
  undo,
  redo,
  canUndo,
  canRedo,
  onOpenWizard,
  onOpenCompatibilityMatrix,
  handleRemoveUnconnected
}) => {
  const { t } = useTranslation();
  const [scale, setScale] = useState(1.0);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [dragIngredientName, setDragIngredientName] = useState<string | null>(null);
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({});
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);
  const [pan, setPan] = useState({ x: 0, y: 0 });

  const workspaceRef = useRef<HTMLDivElement>(null);
  const dragInfo = useRef<{
    type: 'node' | 'pan';
    nodeId?: string;
    startX: number;
    startY: number;
    nodeStartX?: number;
    nodeStartY?: number;
    panStartX?: number;
    panStartY?: number;
  } | null>(null);

  // Handle wheel events for zooming (trackpad pinch-to-zoom uses Ctrl + wheel)
  useEffect(() => {
    const workspace = workspaceRef.current;
    if (!workspace) return;

    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey) {
        e.preventDefault();
        const zoomSpeed = 0.05;
        const delta = e.deltaY < 0 ? zoomSpeed : -zoomSpeed;
        setScale(prev => Math.min(Math.max(prev + delta, 0.3), 2.0));
      }
    };

    workspace.addEventListener('wheel', handleWheel, { passive: false });
    return () => workspace.removeEventListener('wheel', handleWheel);
  }, []);

  // Approximate heights of cards to align port connections cleanly
  const getPortCoordinates = useCallback((node: EditorNode, portType: 'input' | 'output') => {
    const isExpanded = expandedNodes[node.id] ?? false;

    if (!isExpanded) {
      const width = 72;
      const height = 72;
      const x = portType === 'input' ? node.position.x : node.position.x + width;
      const y = node.position.y + (height / 2);
      return { x, y };
    }

    const width = 320; // Matches CSS w-[320px]
    let height = 300;

    switch (node.type) {
      case 'ingredient':
        height = 265;
        break;
      case 'blending':
        height = 360;
        break;
      case 'press':
        height = 290;
        break;
      case 'cost-optimizer':
        height = 230;
        break;
      case 'output':
        height = 430;
        break;
    }

    const x = portType === 'input' ? node.position.x : node.position.x + width;
    const y = node.position.y + (height / 2);
    return { x, y };
  }, [expandedNodes]);

  // Calculate connection paths
  const connectionPaths = React.useMemo(() => {
    return connections.map(conn => {
      const sourceNode = nodes.find(n => n.id === conn.source);
      const targetNode = nodes.find(n => n.id === conn.target);

      if (!sourceNode || !targetNode) return null;

      const p1 = getPortCoordinates(sourceNode, 'output');
      const p2 = getPortCoordinates(targetNode, 'input');

      const dx = Math.abs(p2.x - p1.x) * 0.5;
      const d = `M ${p1.x} ${p1.y} C ${p1.x + dx} ${p1.y}, ${p2.x - dx} ${p2.y}, ${p2.x} ${p2.y}`;

      return {
        id: conn.id,
        d
      };
    }).filter((p): p is { id: string; d: string } => p !== null);
  }, [connections, nodes, getPortCoordinates]);

  // Mouse drag handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 2) return; // Ignore right click for panning/dragging nodes

    const target = e.target as HTMLElement;
    const dragHandle = target.closest('[data-drag-handle="true"]');

    if (dragHandle) {
      const nodeId = dragHandle.getAttribute('data-node-id');
      const node = nodes.find(n => n.id === nodeId);

      if (node) {
        dragInfo.current = {
          type: 'node',
          nodeId: node.id,
          startX: e.clientX,
          startY: e.clientY,
          nodeStartX: node.position.x,
          nodeStartY: node.position.y
        };
        e.preventDefault();
        return;
      }
    }

    dragInfo.current = {
      type: 'pan',
      startX: e.clientX,
      startY: e.clientY,
      panStartX: pan.x,
      panStartY: pan.y
    };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (dragInfo.current) {
      const info = dragInfo.current;
      if (info.type === 'node' && info.nodeId) {
        const deltaX = (e.clientX - info.startX) / scale;
        const deltaY = (e.clientY - info.startY) / scale;

        updateNodePosition(info.nodeId, (info.nodeStartX || 0) + deltaX, (info.nodeStartY || 0) + deltaY, false);
      } else if (info.type === 'pan') {
        const deltaX = e.clientX - info.startX;
        const deltaY = e.clientY - info.startY;
        setPan({
          x: (info.panStartX || 0) + deltaX,
          y: (info.panStartY || 0) + deltaY
        });
      }
    }
  };

  const handleMouseUp = () => {
    if (dragInfo.current) {
      const info = dragInfo.current;
      if (info.type === 'node' && info.nodeId) {
        const finalNode = nodes.find(n => n.id === info.nodeId);
        if (finalNode) {
          updateNodePosition(info.nodeId, finalNode.position.x, finalNode.position.y, true);
        }
      }
      dragInfo.current = null;
    }
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.types.includes('application/pharmnode-node')) {
      e.dataTransfer.dropEffect = 'copy';
      setIsDraggingOver(true);
      const name = e.dataTransfer.getData('application/pharmnode-name');
      if (name) setDragIngredientName(name);
    }
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    if (!workspaceRef.current?.contains(e.relatedTarget as Node)) {
      setIsDraggingOver(false);
      setDragIngredientName(null);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(false);
    setDragIngredientName(null);

    const nodeType = e.dataTransfer.getData('application/pharmnode-node');
    const ingredientIdStr = e.dataTransfer.getData('text/plain');

    if (workspaceRef.current) {
      const rect = workspaceRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left - pan.x) / scale - 80;
      const y = (e.clientY - rect.top - pan.y) / scale - 30;

      if (nodeType === 'ingredient' && ingredientIdStr) {
        let ingredientId: number | string = ingredientIdStr;
        if (!isNaN(Number(ingredientIdStr))) {
          ingredientId = parseInt(ingredientIdStr, 10);
        }
        handleAddIngredientAt(ingredientId, { x, y });
      } else if ((nodeType === 'granulator' || nodeType === 'capsulator' || nodeType === 'press') && handleAddTechNodeAt) {
        handleAddTechNodeAt(nodeType as 'granulator' | 'capsulator' | 'press', { x, y });
      }
    }
  }, [handleAddIngredientAt, handleAddTechNodeAt, scale, pan, scale]);

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setContextMenu({
      x: e.clientX,
      y: e.clientY
    });
  };

  const handleAddIngredientFromMenu = (id: number | string) => {
    if (workspaceRef.current) {
      const rect = workspaceRef.current.getBoundingClientRect();
      // Position new node roughly where right click happened
      const x = (contextMenu ? contextMenu.x : rect.left + 200) - rect.left - pan.x;
      const y = (contextMenu ? contextMenu.y : rect.top + 200) - rect.top - pan.y;
      handleAddIngredientAt(id, { x: x / scale - 80, y: y / scale - 30 });
    } else {
      handleAddIngredientAt(id);
    }
  };

  return (
    <main
      id="canvas-workspace"
      ref={workspaceRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onContextMenu={handleContextMenu}
      className="flex-1 relative overflow-hidden"
    >
      {/* Drop Zone Overlay */}
      {isDraggingOver && (
        <div
          className="absolute inset-0 z-50 pointer-events-none flex flex-col items-center justify-center gap-3"
          style={{
            background: 'rgba(0,0,0,0.55)',
            backdropFilter: 'blur(2px)',
          }}
        >
          <div
            style={{
              width: 96, height: 96,
              border: '2px solid var(--primary)',
              borderRadius: '50%',
              boxShadow: '0 0 0 8px rgba(var(--primary-rgb, 5,230,159), 0.15), 0 0 30px rgba(var(--primary-rgb, 5,230,159), 0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              animation: 'drop-pulse 1.2s ease-in-out infinite',
            }}
          >
            <FlaskConical size={36} style={{ color: 'var(--primary)' }} />
          </div>
          <div className="text-center">
            <p className="text-white font-bold text-base tracking-wide">
              {dragIngredientName ? t('canvas_drop_add').replace('{name}', dragIngredientName) : t('canvas_drop_release')}
            </p>
            <p className="text-xs mt-1" style={{ color: 'var(--muted)' }}>
              {t('canvas_drop_hint')}
            </p>
          </div>
          <div
            className="absolute inset-4 rounded-2xl pointer-events-none"
            style={{
              border: '2px dashed var(--primary)',
              opacity: 0.3,
            }}
          />
        </div>
      )}

      {/* Zoomable Canvas Area */}
      <div
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale})`,
          transformOrigin: '0 0',
        }}
        className="absolute inset-0"
      >
        {/* Infinite Grid Background */}
        <div
          className="absolute inset-0 pointer-events-none opacity-40"
          style={{
            backgroundImage: 'radial-gradient(var(--grid-dot) 1px, transparent 1px)',
            backgroundSize: `${20}px ${20}px`,
            backgroundPosition: `${pan.x}px ${pan.y}px`,
            transform: `scale(${1 / scale})`, // Undo the scale so grid stays consistent in screen space
            transformOrigin: '0 0',
            width: `${100 * scale}vw`, // Expand to cover visible area when zoomed out
            height: `${100 * scale}vh`
          }}
        />

        {/* SVG Drawing Layer for Connection Lines */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-0" style={{ overflow: 'visible' }}>
          <defs>
            <linearGradient id="glow-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.4" />
              <stop offset="50%" stopColor="var(--primary)" stopOpacity="0.8" />
              <stop offset="100%" stopColor="var(--primary)" stopOpacity="0.4" />
            </linearGradient>
          </defs>
          {connectionPaths.map(path => (
            <g key={path.id}>
              <path
                d={path.d}
                fill="none"
                stroke="url(#glow-grad)"
                strokeWidth={5}
                className="opacity-40"
              />
              <path
                d={path.d}
                fill="none"
                stroke="var(--primary)"
                strokeWidth={2}
                className="opacity-80"
              />
            </g>
          ))}
        </svg>

        {/* Nodes Layer */}
        <div className="relative w-full h-full z-10">
          {nodes.map(node => (
            <NodeCard
              key={node.id}
              node={node}
              nodes={nodes}
              calculatedResults={calculatedResults}
              tariff={tariff}
              onUpdateData={updateNodeData}
              onRemove={removeNode}
              onReplaceIngredient={handleReplaceIngredient}
              onUpgradeClick={onOpenUpgradeModal}
              isExpanded={expandedNodes[node.id] ?? false}
              onToggleExpand={(expanded) => {
                setExpandedNodes(prev => ({
                  ...prev,
                  [node.id]: expanded
                }));
              }}
              allIngredients={allIngredients}
              addIngredientNode={handleAddIngredientAt}
              onAddTechNode={handleAddTechNodeAt}
            />
          ))}
        </div>
      </div>

      {/* Floating Zoom Controls */}
      <CanvasToolbar
        scale={scale}
        onZoomIn={() => setScale(prev => Math.min(prev + 0.1, 2.0))}
        onZoomOut={() => setScale(prev => Math.max(prev - 0.1, 0.3))}
        onZoomReset={() => setScale(1.0)}
      />

      {/* Right-click Context Menu */}
      <CanvasContextMenu
        x={contextMenu ? contextMenu.x : 0}
        y={contextMenu ? contextMenu.y : 0}
        isOpen={!!contextMenu}
        onClose={() => setContextMenu(null)}
        onAddIngredient={handleAddIngredientFromMenu}
        remainingIngredients={remainingIngredients}
        onUndo={undo}
        onRedo={redo}
        canUndo={canUndo}
        canRedo={canRedo}
        onOpenWizard={onOpenWizard}
        onOpenMatrix={onOpenCompatibilityMatrix}
        onRemoveUnconnected={handleRemoveUnconnected}
      />
    </main>
  );
};
