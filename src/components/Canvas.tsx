"use client";

import React, { useState, useRef, useCallback } from 'react';
import { useNodeEditor, EditorNode } from '../hooks/useNodeEditor';
import { NodeCard } from './NodeCard';
import { Disclaimer } from './Disclaimer';
import { PricingPanel } from './PricingPanel';
import { baseIngredientsMatrix, Ingredient, IngredientRole } from '../types/pharm';
import { useIngredients } from '../hooks/useIngredients';
import { CHEMICAL_CLASSES } from '../lib/chemicalRules';
import { Undo2, Redo2, Plus, AlertTriangle, FlaskConical } from 'lucide-react';
import { Header } from './Header';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from '../context/I18nContext';
import { Sidebar } from './Sidebar';
import { CompatibilityMatrix } from './CompatibilityMatrix';
import { BenefitsModal } from './BenefitsModal';
import { useIsMobile } from '../hooks/useIsMobile';
import { MobileConfigurator } from './MobileConfigurator';

export const Canvas: React.FC = () => {
  const { user, status, login, changeTariff } = useAuth();
  const { t, locale } = useTranslation();
  const isMobile = useIsMobile();

  // Load ingredients via hook (API → fallback to hardcoded matrix)
  const isMockUser = !!user?.id?.startsWith('mock-');
  const { ingredients: allIngredients, standardIngredients, customIngredients, refetch: refetchIngredients } = useIngredients(
    user?.id,
    isMockUser
  );

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isCompatibilityMatrixOpen, setIsCompatibilityMatrixOpen] = useState(false);
  const [addForm, setAddForm] = useState({
    name: '',
    role: 'active' as IngredientRole,
    casNumber: '',
    looseBulkDensity: 0.4,
    tappedBulkDensity: 0.6,
    trueDensity: 1.2,
    costPerKgUsd: 10,
    maxSafePercentage: 100,
    isAllergen: false,
    chemicalClassId: 0
  });

  const [regForm, setRegForm] = useState({
    name: '',
    email: '',
    tariff: 'hobby' as 'hobby' | 'professional'
  });

  const [authError, setAuthError] = useState<string | null>(null);
  const [addError, setAddError] = useState<string | null>(null);

  const {
    nodes,
    connections,
    tariff,
    setTariff,
    calculatedResults,
    addIngredientNode,
    removeNode,
    updateNodeData,
    updateNodePosition,
    undo,
    redo,
    canUndo,
    canRedo
  } = useNodeEditor('hobby', allIngredients);

  // Sync canvas editor's tariff with active user's tariff
  React.useEffect(() => {
    if (user?.tariff) {
      setTariff(user.tariff);
    }
  }, [user?.tariff, setTariff]);

  // Check for Stripe checkout success/cancelled query params
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const checkoutStatus = params.get('checkout');
      const plan = params.get('plan') as any;

      if (checkoutStatus === 'success' && plan) {
        setTariff(plan);
        if (user) {
          changeTariff(plan);
        }
        alert(t('canvas_checkout_success').replace('{plan}', plan.toUpperCase()));
        window.history.replaceState({}, document.title, window.location.pathname);
      } else if (checkoutStatus === 'cancelled') {
        alert(t('canvas_checkout_cancelled'));
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    }
  }, [user, changeTariff, setTariff]);

  // Dragging state
  const dragInfo = useRef<{
    nodeId: string;
    startX: number;
    startY: number;
    nodeStartX: number;
    nodeStartY: number;
  } | null>(null);

  const workspaceRef = useRef<HTMLDivElement>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [dragIngredientName, setDragIngredientName] = useState<string | null>(null);
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({});
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showBenefitsModal, setShowBenefitsModal] = useState(false);
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [limitError, setLimitError] = useState<string | null>(null);
  const [scale, setScale] = useState(1.0);

  // Handle wheel events for zooming (trackpad pinch-to-zoom uses Ctrl + wheel)
  React.useEffect(() => {
    const workspace = workspaceRef.current;
    if (!workspace) return;

    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey) {
        e.preventDefault();
        const zoomSpeed = 0.05;
        // e.deltaY is positive when scrolling out / pinching in, negative when scrolling in / pinching out
        const delta = e.deltaY < 0 ? zoomSpeed : -zoomSpeed;
        setScale(prev => Math.min(Math.max(prev + delta, 0.3), 2.0));
      }
    };

    workspace.addEventListener('wheel', handleWheel, { passive: false });
    return () => workspace.removeEventListener('wheel', handleWheel);
  }, []);

  // Compute active ingredient node IDs to show what's already on the canvas
  const activeNodeIngredientIds = React.useMemo(() => {
    return nodes
      .filter(n => n.type === 'ingredient')
      .map(n => n.data.ingredientId)
      .filter((id): id is number | string => id !== undefined);
  }, [nodes]);

  // Approximate heights of cards to align port connections cleanly
  const getPortCoordinates = useCallback((node: EditorNode, portType: 'input' | 'output') => {
    const isExpanded = expandedNodes[node.id] ?? false;

    if (!isExpanded) {
      // Compact node coordinates: circle/square of size 72x72px (approximate center for ports)
      const width = 72; // Adjusted slightly for compact size to center line nicely
      const height = 72;
      const x = portType === 'input' ? node.position.x : node.position.x + width;
      const y = node.position.y + (height / 2);
      return { x, y };
    }

    const width = 320; // Matches CSS w-[320px]
    let height = 300;
    
    switch (node.type) {
      case 'ingredient':
        // Height varies slightly by warnings, approximate to 260px base
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

  // Mouse drag handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    const dragHandle = target.closest('[data-drag-handle="true"]');
    
    if (dragHandle) {
      const nodeId = dragHandle.getAttribute('data-node-id');
      const node = nodes.find(n => n.id === nodeId);
      
      if (node) {
        dragInfo.current = {
          nodeId: node.id,
          startX: e.clientX,
          startY: e.clientY,
          nodeStartX: node.position.x,
          nodeStartY: node.position.y
        };
        e.preventDefault();
      }
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (dragInfo.current) {
      const info = dragInfo.current;
      const deltaX = (e.clientX - info.startX) / scale;
      const deltaY = (e.clientY - info.startY) / scale;
      
      // Update node position in state without recording history (fluid drag)
      updateNodePosition(info.nodeId, info.nodeStartX + deltaX, info.nodeStartY + deltaY, false);
    }
  };

  const handleMouseUp = () => {
    if (dragInfo.current) {
      const info = dragInfo.current;
      // Record position in history on drag end
      const finalNode = nodes.find(n => n.id === info.nodeId);
      if (finalNode) {
        updateNodePosition(info.nodeId, finalNode.position.x, finalNode.position.y, true);
      }
      dragInfo.current = null;
    }
  };

  const handleAddIngredientAt = useCallback((id: number | string, position?: { x: number; y: number }) => {
    const res = addIngredientNode(id, position);
    if (!res.success) {
      if (res.reason === 'hobby-limit') {
        setLimitError(t('canvas_hobby_limit'));
        setShowUpgradeModal(true);
      }
    } else {
      setLimitError(null);
    }
    setShowAddMenu(false);
  }, [addIngredientNode]);

  const handleAddIngredient = useCallback((id: number | string) => {
    handleAddIngredientAt(id);
  }, [handleAddIngredientAt]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.types.includes('application/pharmnode-node')) {
      e.dataTransfer.dropEffect = 'copy';
      setIsDraggingOver(true);
      // Try to capture name for overlay display
      const name = e.dataTransfer.getData('application/pharmnode-name');
      if (name) setDragIngredientName(name);
    }
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    // Only hide if leaving the main workspace entirely
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
    
    if (nodeType === 'ingredient' && ingredientIdStr && workspaceRef.current) {
      let ingredientId: number | string = ingredientIdStr;
      if (!isNaN(Number(ingredientIdStr))) {
        ingredientId = parseInt(ingredientIdStr, 10);
      }
      
      const rect = workspaceRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left + workspaceRef.current.scrollLeft) / scale - 80;
      const y = (e.clientY - rect.top + workspaceRef.current.scrollTop) / scale - 30;
      
      handleAddIngredientAt(ingredientId, { x, y });
    }
  }, [handleAddIngredientAt, scale]);

  // Switch/Replace ingredient handler
  const handleReplaceIngredient = (oldIngredientId: number | string, newIngredientId: number | string) => {
    const targetNode = nodes.find(
      node => node.type === 'ingredient' && String(node.data.ingredientId) === String(oldIngredientId)
    );
    if (targetNode) {
      updateNodeData(targetNode.id, { ingredientId: newIngredientId });
    }
  };

  const handleOpenAddModal = () => {
    if (!user) {
      setIsAuthModalOpen(true);
    } else {
      setIsAddModalOpen(true);
      setAddError(null);
    }
  };

  const handleQuickLogin = async (provider: "mock-google" | "mock-github" | "mock-microsoft") => {
    try {
      await login(provider);
      setIsAuthModalOpen(false);
      setAuthError(null);
    } catch (err: any) {
      setAuthError(err.message || t('canvas_login_error'));
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regForm.name.trim() || !regForm.email.trim()) {
      setAuthError(t('canvas_fill_name_email'));
      return;
    }
    setAuthError(null);
    try {
      await login("mock-google", { name: regForm.name.trim(), email: regForm.email.trim(), tariff: regForm.tariff });
      setIsAuthModalOpen(false);
      setRegForm({ name: '', email: '', tariff: 'hobby' });
    } catch (err: any) {
      setAuthError(err.message || t('canvas_reg_error'));
    }
  };

  const handleSubmitIngredient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addForm.name.trim()) {
      setAddError(t('add_error_empty_name'));
      return;
    }
    if (addForm.looseBulkDensity <= 0 || addForm.tappedBulkDensity <= 0) {
      setAddError(t('add_error_density_positive'));
      return;
    }
    if (addForm.looseBulkDensity > addForm.tappedBulkDensity) {
      setAddError(t('add_error_density_order'));
      return;
    }
    setAddError(null);

    const chemClassId = Number(addForm.chemicalClassId);

    const newIngredient: Omit<Ingredient, 'id'> = {
      name: addForm.name.trim(),
      role: addForm.role,
      casNumber: addForm.casNumber.trim() || undefined,
      looseBulkDensity: Number(addForm.looseBulkDensity),
      tappedBulkDensity: Number(addForm.tappedBulkDensity),
      trueDensity: Number(addForm.trueDensity || addForm.tappedBulkDensity),
      costPerKgUsd: Number(addForm.costPerKgUsd),
      maxSafePercentage: Number(addForm.maxSafePercentage),
      isAllergen: addForm.isAllergen,
      chemicalClassId: chemClassId
    };

    try {
      const response = await fetch('/api/ingredients', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...newIngredient,
          userId: user?.id
        })
      });
      const data = await response.json();
      if (data.success) {
        // For mock users: persist to localStorage so useIngredients hook can read it
        if (user?.id.startsWith("mock-") || data.mock) {
          const finalIng: Ingredient = { ...newIngredient, id: data.ingredient.id };
          const stored = localStorage.getItem(`pharmnode_custom_ingredients_${user?.id}`) ?? '[]';
          const existing: Ingredient[] = JSON.parse(stored);
          localStorage.setItem(
            `pharmnode_custom_ingredients_${user?.id}`,
            JSON.stringify([...existing, finalIng])
          );
        }
        // Trigger hook to reload ingredients from source
        refetchIngredients();
        setIsAddModalOpen(false);
        // Reset form
        setAddForm({
          name: '',
          role: 'active',
          casNumber: '',
          looseBulkDensity: 0.4,
          tappedBulkDensity: 0.6,
          trueDensity: 1.2,
          costPerKgUsd: 10,
          maxSafePercentage: 100,
          isAllergen: false,
          chemicalClassId: 0
        });
      } else {
        setAddError(data.error || t("canvas_save_error"));
      }
    } catch (err: any) {
      setAddError(err.message || t("canvas_network_error"));
    }
  };

  // Calculate connection paths
  const connectionPaths = React.useMemo(() => {
    return connections.map(conn => {
      const sourceNode = nodes.find(n => n.id === conn.source);
      const targetNode = nodes.find(n => n.id === conn.target);
      
      if (!sourceNode || !targetNode) return null;

      const p1 = getPortCoordinates(sourceNode, 'output');
      const p2 = getPortCoordinates(targetNode, 'input');

      // Bezier curve controls
      const dx = Math.abs(p2.x - p1.x) * 0.5;
      const d = `M ${p1.x} ${p1.y} C ${p1.x + dx} ${p1.y}, ${p2.x - dx} ${p2.y}, ${p2.x} ${p2.y}`;

      return {
        id: conn.id,
        d
      };
    }).filter((p): p is { id: string; d: string } => p !== null);
  }, [connections, nodes, getPortCoordinates]);

  // List of remaining ingredients to add
  const remainingIngredients = React.useMemo(() => {
    const activeIds = nodes
      .filter(n => n.type === 'ingredient')
      .map(n => n.data.ingredientId);
    return allIngredients.filter(ing => !activeIds.some(id => String(id) === String(ing.id)));

  }, [nodes]);

  if (isMobile) {
    return (
      <div className="min-h-screen bg-zinc-950 theme-element">
        <MobileConfigurator
          nodes={nodes}
          calculatedResults={calculatedResults}
          tariff={tariff}
          setTariff={setTariff}
          onUpdateData={updateNodeData}
          onRemove={removeNode}
          onReplaceIngredient={handleReplaceIngredient}
          allIngredients={allIngredients}
          onOpenAddModal={handleOpenAddModal}
          onAddIngredient={handleAddIngredient}
          activeNodeIngredientIds={activeNodeIngredientIds}
          onOpenCompatibilityMatrix={() => setIsCompatibilityMatrixOpen(true)}
          onOpenPricing={() => setShowUpgradeModal(true)}
          onOpenBenefits={() => setShowBenefitsModal(true)}
        />

        {/* Pricing / Plan upgrade modal */}
        {showUpgradeModal && (
          <div className="fixed inset-0 z-55 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
            <PricingPanel
              currentTariff={tariff}
              onSelectTariff={(plan) => {
                setTariff(plan);
                if (user) changeTariff(plan);
                setShowUpgradeModal(false);
              }}
              onClose={() => {
                setShowUpgradeModal(false);
              }}
            />
          </div>
        )}

        {/* Add Custom Ingredient Modal */}
        {isAddModalOpen && (
          <div className="fixed inset-0 z-55 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
            <div className="w-full max-w-lg bg-zinc-950/90 border border-zinc-900 rounded-2xl shadow-2xl p-6 relative theme-element my-8">
              <button
                onClick={() => {
                  setIsAddModalOpen(false);
                  setAddError(null);
                }}
                className="absolute top-4 right-4 text-zinc-500 hover:text-zinc-350 transition-colors z-45"
              >
                ✕
              </button>
              
              <h2 className="text-lg font-bold text-zinc-100 mb-2 uppercase tracking-wide flex items-center gap-2">
                🧪 {t('canvas_new_component')}
              </h2>
              <p className="text-xs text-zinc-400 mb-6 leading-relaxed">
                {t('canvas_new_component_desc')}
              </p>

              {addError && (
                <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/20 rounded-lg text-xs text-rose-400 flex items-start gap-2">
                  <AlertTriangle size={14} className="shrink-0 mt-0.5" />
                  <span>{addError}</span>
                </div>
              )}

              <form onSubmit={handleSubmitIngredient} className="flex flex-col gap-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="col-span-1 md:col-span-2">
                    <label className="block text-[10px] text-zinc-400 font-semibold mb-1 uppercase tracking-wider">{t('add_name_label')} *</label>
                    <input
                      type="text"
                      required
                      placeholder={locale === 'ru-RU' ? 'Например, Paracetamol Generic' : 'e.g., Paracetamol Generic'}
                      value={addForm.name}
                      onChange={(e) => setAddForm(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-3 py-2 bg-zinc-900 border border-zinc-850 text-zinc-200 placeholder-zinc-655 rounded-lg text-xs focus:outline-none focus:border-indigo-500 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] text-zinc-400 font-semibold mb-1 uppercase tracking-wider">{t('add_role_label')} *</label>
                    <select
                      value={addForm.role}
                      onChange={(e) => setAddForm(prev => ({ ...prev, role: e.target.value as any }))}
                      className="w-full px-3 py-2 bg-zinc-900 border border-zinc-850 text-zinc-200 rounded-lg text-xs focus:outline-none focus:border-indigo-500 transition-colors bg-zinc-900"
                    >
                      <option value="active">{t('add_role_active')}</option>
                      <option value="filler">{t('add_role_filler')}</option>
                      <option value="dry-binder">{t('add_role_dry_binder')}</option>
                      <option value="lubricant">{t('add_role_lubricant')}</option>
                      <option value="glidant">{t('add_role_glidant')}</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] text-zinc-400 font-semibold mb-1 uppercase tracking-wider">{t('add_cas_label')}</label>
                    <input
                      type="text"
                      placeholder="103-90-2"
                      value={addForm.casNumber}
                      onChange={(e) => setAddForm(prev => ({ ...prev, casNumber: e.target.value }))}
                      className="w-full px-3 py-2 bg-zinc-900 border border-zinc-850 text-zinc-200 placeholder-zinc-655 rounded-lg text-xs focus:outline-none focus:border-indigo-500 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] text-zinc-400 font-semibold mb-1 uppercase tracking-wider">{t('add_loose_density')} *</label>
                    <input
                      type="number"
                      required
                      step="0.01"
                      min="0.01"
                      max="5.0"
                      placeholder="0.45"
                      value={addForm.looseBulkDensity}
                      onChange={(e) => setAddForm(prev => ({ ...prev, looseBulkDensity: parseFloat(e.target.value) || 0.45 }))}
                      className="w-full px-3 py-2 bg-zinc-900 border border-zinc-850 text-zinc-200 font-mono rounded-lg text-xs focus:outline-none focus:border-indigo-500 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] text-zinc-400 font-semibold mb-1 uppercase tracking-wider">{t('add_tapped_density')} *</label>
                    <input
                      type="number"
                      required
                      step="0.01"
                      min="0.01"
                      max="5.0"
                      placeholder="0.65"
                      value={addForm.tappedBulkDensity}
                      onChange={(e) => setAddForm(prev => ({ ...prev, tappedBulkDensity: parseFloat(e.target.value) || 0.65 }))}
                      className="w-full px-3 py-2 bg-zinc-900 border border-zinc-850 text-zinc-200 font-mono rounded-lg text-xs focus:outline-none focus:border-indigo-500 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] text-zinc-400 font-semibold mb-1 uppercase tracking-wider">{t('add_true_density')}</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0.01"
                      max="5.0"
                      placeholder="1.25"
                      value={addForm.trueDensity}
                      onChange={(e) => setAddForm(prev => ({ ...prev, trueDensity: parseFloat(e.target.value) || 1.25 }))}
                      className="w-full px-3 py-2 bg-zinc-900 border border-zinc-850 text-zinc-200 font-mono rounded-lg text-xs focus:outline-none focus:border-indigo-500 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] text-zinc-400 font-semibold mb-1 uppercase tracking-wider">{t('add_max_safe')} *</label>
                    <input
                      type="number"
                      required
                      step="0.5"
                      min="0.1"
                      max="100.0"
                      placeholder="100"
                      value={addForm.maxSafePercentage}
                      onChange={(e) => setAddForm(prev => ({ ...prev, maxSafePercentage: parseFloat(e.target.value) || 100 }))}
                      className="w-full px-3 py-2 bg-zinc-900 border border-zinc-850 text-zinc-200 font-mono rounded-lg text-xs focus:outline-none focus:border-indigo-500 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] text-zinc-400 font-semibold mb-1 uppercase tracking-wider">{t('add_cost_per_kg')} *</label>
                    <input
                      type="number"
                      required
                      step="0.1"
                      min="0.0"
                      placeholder="15.0"
                      value={addForm.costPerKgUsd}
                      onChange={(e) => setAddForm(prev => ({ ...prev, costPerKgUsd: parseFloat(e.target.value) || 15.0 }))}
                      className="w-full px-3 py-2 bg-zinc-900 border border-zinc-850 text-zinc-200 font-mono rounded-lg text-xs focus:outline-none focus:border-indigo-500 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] text-zinc-400 font-semibold mb-1 uppercase tracking-wider">{t('add_compat_group')} *</label>
                    <select
                      value={addForm.chemicalClassId}
                      onChange={(e) => setAddForm(prev => ({ ...prev, chemicalClassId: parseInt(e.target.value, 10) || 0 }))}
                      className="w-full px-3 py-2 bg-zinc-900 border border-zinc-850 text-zinc-200 rounded-lg text-xs focus:outline-none focus:border-indigo-500 transition-colors bg-zinc-900"
                    >
                      {CHEMICAL_CLASSES.map(cls => (
                        <option key={cls.id} value={cls.id}>
                          {t(`chem_class_${cls.id}_cat`)}: {t(`chem_class_${cls.id}_name`)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="col-span-1 md:col-span-2 flex items-center gap-2 bg-zinc-900/40 border border-zinc-900 p-3 rounded-lg mt-1">
                    <input
                      type="checkbox"
                      id="isAllergen-mobile-canvas"
                      checked={addForm.isAllergen}
                      onChange={(e) => setAddForm(prev => ({ ...prev, isAllergen: e.target.checked }))}
                      className="accent-indigo-500 cursor-pointer"
                    />
                    <label htmlFor="isAllergen-mobile-canvas" className="text-xs text-zinc-300 font-medium cursor-pointer select-none">
                      {t('canvas_allergen_label')}
                    </label>
                  </div>
                </div>

                <div className="flex gap-3 mt-4">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="flex-1 py-2.5 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-zinc-400 hover:text-zinc-200 font-bold rounded-xl text-xs transition-colors cursor-pointer"
                  >
                    {t('canvas_cancel')}
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 bg-indigo-500 hover:bg-indigo-600 active:bg-indigo-700 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer"
                  >
                    {t('canvas_submit_ingredient')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <Disclaimer />

        <CompatibilityMatrix
          isOpen={isCompatibilityMatrixOpen}
          onClose={() => setIsCompatibilityMatrixOpen(false)}
          ingredients={allIngredients}
        />

        <BenefitsModal
          isOpen={showBenefitsModal}
          onClose={() => setShowBenefitsModal(false)}
          tariff="professional"
        />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-zinc-950 relative overflow-hidden select-none theme-element">
      {/* Global Header */}
      <Header
        showCanvasControls={true}
        undo={undo}
        redo={redo}
        canUndo={canUndo}
        canRedo={canRedo}
        showAddMenu={isSidebarOpen}
        setShowAddMenu={() => setIsSidebarOpen(!isSidebarOpen)}
        remainingIngredients={remainingIngredients}
        handleAddIngredient={handleAddIngredient}
        tariff={tariff}
        setTariff={setTariff}
        onOpenCompatibilityMatrix={() => setIsCompatibilityMatrixOpen(true)}
        onOpenPricing={() => setShowUpgradeModal(true)}
        onOpenBenefits={() => {
          setShowBenefitsModal(true);
        }}
      />

      {/* Split Pane: Sidebar & Workspace Canvas */}
      <div className="flex-1 w-full flex overflow-hidden h-[calc(100vh-4rem)] relative">
        <Sidebar
          isOpen={isSidebarOpen}
          onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
          activeNodeIngredientIds={activeNodeIngredientIds}
          onAddIngredient={handleAddIngredient}
          customIngredients={customIngredients}
          standardIngredients={standardIngredients}
          onOpenAddModal={handleOpenAddModal}
        />

        {/* Main Drag & Drop Workspace */}
        <main
          ref={workspaceRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className="flex-1 relative overflow-auto"
        >
          {/* ── Drop Zone Overlay ── */}
          {isDraggingOver && (
            <div
              className="absolute inset-0 z-50 pointer-events-none flex flex-col items-center justify-center gap-3"
              style={{
                background: 'rgba(0,0,0,0.55)',
                backdropFilter: 'blur(2px)',
              }}
            >
              {/* Animated pulsing ring */}
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
              {/* Dashed border hint */}
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
              transform: `scale(${scale})`,
              transformOrigin: 'top left',
              width: '4000px',
              height: '3000px',
            }}
            className="relative"
          >
            {/* Premium Infinite Grid Background */}
            <div 
              className="absolute inset-0 bg-[radial-gradient(var(--grid-dot)_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none opacity-40" 
            />
            <div 
              className="absolute inset-0 bg-[radial-gradient(circle_800px_at_50%_200px,rgba(99,102,241,0.08),transparent)] pointer-events-none" 
            />

            {/* SVG Drawing Layer for Connection Lines */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
              <defs>
                <linearGradient id="glow-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.4" />
                  <stop offset="50%" stopColor="var(--primary)" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="var(--primary)" stopOpacity="0.4" />
                </linearGradient>
              </defs>
              {connectionPaths.map(path => (
                <g key={path.id}>
                  {/* Outer Glow */}
                  <path
                    d={path.d}
                    fill="none"
                    stroke="url(#glow-grad)"
                    strokeWidth={5}
                    className="opacity-40"
                  />
                  {/* Main solid line */}
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
            <div className="relative w-full h-full min-h-[900px] z-10">
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
                  onUpgradeClick={() => setShowUpgradeModal(true)}
                  isExpanded={expandedNodes[node.id] ?? false}
                  onToggleExpand={(expanded) => {
                    setExpandedNodes(prev => ({
                      ...prev,
                      [node.id]: expanded
                    }));
                  }}
                  allIngredients={allIngredients}
                />
              ))}
            </div>
          </div>

          {/* Floating Zoom Controls (Bottom Right) */}
          <div className="absolute bottom-6 right-6 z-40 flex items-center bg-zinc-900/90 backdrop-blur-md border border-zinc-800 rounded-xl p-1 shadow-2xl gap-1.5 theme-element">
            <button
              onClick={() => setScale(prev => Math.max(prev - 0.1, 0.3))}
              className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-zinc-850 text-zinc-400 hover:text-zinc-200 transition-colors text-sm font-bold cursor-pointer"
              title={t('canvas_zoom_out')}
            >
              －
            </button>
            <span 
              onClick={() => setScale(1.0)}
              className="px-2 text-[10px] font-bold text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer select-none font-mono min-w-[36px] text-center"
              title={t('canvas_zoom_reset')}
            >
              {Math.round(scale * 100)}%
            </span>
            <button
              onClick={() => setScale(prev => Math.min(prev + 0.1, 2.0))}
              className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-zinc-850 text-zinc-400 hover:text-zinc-200 transition-colors text-sm font-bold cursor-pointer"
              title={t('canvas_zoom_in')}
            >
              ＋
            </button>
          </div>
        </main>
      </div>

      {/* Upgrade pricing simulation modal (Block 6) */}
      {showUpgradeModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-4xl bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl relative p-6">
            <button
              onClick={() => {
                setShowUpgradeModal(false);
                setLimitError(null);
              }}
              className="absolute top-4 right-4 text-zinc-500 hover:text-zinc-300 transition-colors z-40"
            >
              ✕
            </button>
            
            {limitError && (
              <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/20 rounded-lg text-xs text-rose-400 flex items-start gap-2 max-w-lg mx-auto">
                <AlertTriangle size={14} className="shrink-0 mt-0.5" />
                <span>{limitError}</span>
              </div>
            )}

            <PricingPanel
              currentTariff={tariff}
              onSelectTariff={setTariff}
              onClose={() => {
                setShowUpgradeModal(false);
                setLimitError(null);
              }}
            />
          </div>
        </div>
      )}
      {/* Auth Modal (Login / Registration) */}
      {isAuthModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-zinc-950/90 border border-zinc-900 rounded-2xl shadow-2xl p-6 relative theme-element">
            <button
              onClick={() => {
                setIsAuthModalOpen(false);
                setAuthError(null);
              }}
              className="absolute top-4 right-4 text-zinc-500 hover:text-zinc-300 transition-colors z-45"
            >
              ✕
            </button>
            
            <h2 className="text-lg font-bold text-zinc-100 mb-2 uppercase tracking-wide flex items-center gap-2">
              🔐 {t('canvas_auth_required')}
            </h2>
            <p className="text-xs text-zinc-400 mb-6 leading-relaxed">
              {t('canvas_auth_desc')}
            </p>

            {authError && (
              <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/20 rounded-lg text-xs text-rose-400 flex items-start gap-2">
                <AlertTriangle size={14} className="shrink-0 mt-0.5" />
                <span>{authError}</span>
              </div>
            )}

            {/* Quick Mock Login Profiles */}
            <div className="flex flex-col gap-2 mb-6">
              <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block mb-1">
                {t('canvas_quick_login')}
              </span>
              <button
                onClick={() => handleQuickLogin("mock-google")}
                className="w-full py-2 px-3 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-zinc-200 text-xs font-bold rounded-xl flex items-center gap-2 transition-all cursor-pointer border border-zinc-800/50 bg-zinc-900/40"
              >
                <div className="w-4 h-4 rounded bg-red-500/10 flex items-center justify-center text-red-400 text-[9px] font-bold">G</div>
                <span>{t('canvas_login_hobby')}</span>
              </button>
              <button
                onClick={() => handleQuickLogin("mock-github")}
                className="w-full py-2 px-3 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-zinc-200 text-xs font-bold rounded-xl flex items-center gap-2 transition-all cursor-pointer border border-zinc-800/50 bg-zinc-900/40"
              >
                <div className="w-4 h-4 rounded bg-indigo-500/10 flex items-center justify-center text-indigo-400 text-[9px] font-bold">Git</div>
                <span>{t('canvas_login_pro')}</span>
              </button>
            </div>

            {/* Registration Form */}
            <form onSubmit={handleRegister} className="border-t border-zinc-900 pt-4 flex flex-col gap-3">
              <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">
                {t('canvas_or_register')}
              </span>
              <div>
                <label className="block text-[10px] text-zinc-400 font-semibold mb-1 uppercase tracking-wider">{t('canvas_your_name')}</label>
                <input
                  type="text"
                  placeholder={locale === 'ru-RU' ? 'Иван Иванов' : 'John Doe'}
                  value={regForm.name}
                  onChange={(e) => setRegForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 bg-zinc-900 border border-zinc-850 text-zinc-200 placeholder-zinc-650 rounded-lg text-xs focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-[10px] text-zinc-400 font-semibold mb-1 uppercase tracking-wider">Email</label>
                <input
                  type="email"
                  placeholder="ivan@pharma.com"
                  value={regForm.email}
                  onChange={(e) => setRegForm(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-3 py-2 bg-zinc-900 border border-zinc-850 text-zinc-200 placeholder-zinc-650 rounded-lg text-xs focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-[10px] text-zinc-400 font-semibold mb-1 uppercase tracking-wider">{t('canvas_plan_label')}</label>
                <select
                  value={regForm.tariff}
                  onChange={(e) => setRegForm(prev => ({ ...prev, tariff: e.target.value as any }))}
                  className="w-full px-3 py-2 bg-zinc-900 border border-zinc-850 text-zinc-200 rounded-lg text-xs focus:outline-none focus:border-indigo-500 transition-colors bg-zinc-900"
                >
                  <option value="hobby">{t('canvas_hobby_option')}</option>
                  <option value="professional">{t('canvas_pro_option')}</option>
                </select>
              </div>
              <button
                type="submit"
                className="w-full py-2 bg-indigo-500 hover:bg-indigo-600 active:bg-indigo-700 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer mt-2"
              >
                {t('canvas_create_account')}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Add Custom Ingredient Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-lg bg-zinc-950/90 border border-zinc-900 rounded-2xl shadow-2xl p-6 relative theme-element my-8">
            <button
              onClick={() => {
                setIsAddModalOpen(false);
                setAddError(null);
              }}
              className="absolute top-4 right-4 text-zinc-500 hover:text-zinc-300 transition-colors z-45"
            >
              ✕
            </button>
            
            <h2 className="text-lg font-bold text-zinc-100 mb-2 uppercase tracking-wide flex items-center gap-2">
              🧪 {t('canvas_new_component')}
            </h2>
            <p className="text-xs text-zinc-400 mb-6 leading-relaxed">
              {t('canvas_new_component_desc')}
            </p>

            {addError && (
              <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/20 rounded-lg text-xs text-rose-400 flex items-start gap-2">
                <AlertTriangle size={14} className="shrink-0 mt-0.5" />
                <span>{addError}</span>
              </div>
            )}

            <form onSubmit={handleSubmitIngredient} className="flex flex-col gap-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="col-span-1 md:col-span-2">
                  <label className="block text-[10px] text-zinc-400 font-semibold mb-1 uppercase tracking-wider">{t('add_name_label')} *</label>
                  <input
                    type="text"
                    required
                    placeholder={locale === 'ru-RU' ? 'Например, Paracetamol Generic' : 'e.g., Paracetamol Generic'}
                    value={addForm.name}
                    onChange={(e) => setAddForm(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 bg-zinc-900 border border-zinc-850 text-zinc-200 placeholder-zinc-650 rounded-lg text-xs focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-zinc-400 font-semibold mb-1 uppercase tracking-wider">{t('add_role_label')} *</label>
                  <select
                    value={addForm.role}
                    onChange={(e) => setAddForm(prev => ({ ...prev, role: e.target.value as any }))}
                    className="w-full px-3 py-2 bg-zinc-900 border border-zinc-850 text-zinc-200 rounded-lg text-xs focus:outline-none focus:border-indigo-500 transition-colors bg-zinc-900"
                  >
                    <option value="active">{t('add_role_active')}</option>
                    <option value="filler">{t('add_role_filler')}</option>
                    <option value="dry-binder">{t('add_role_dry_binder')}</option>
                    <option value="lubricant">{t('add_role_lubricant')}</option>
                    <option value="glidant">{t('add_role_glidant')}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] text-zinc-400 font-semibold mb-1 uppercase tracking-wider">{t('add_cas_label')}</label>
                  <input
                    type="text"
                    placeholder="103-90-2"
                    value={addForm.casNumber}
                    onChange={(e) => setAddForm(prev => ({ ...prev, casNumber: e.target.value }))}
                    className="w-full px-3 py-2 bg-zinc-900 border border-zinc-850 text-zinc-200 placeholder-zinc-650 rounded-lg text-xs focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-zinc-400 font-semibold mb-1 uppercase tracking-wider">{t('add_loose_density')} *</label>
                  <input
                    type="number"
                    required
                    step="0.01"
                    min="0.01"
                    max="5.0"
                    placeholder="0.45"
                    value={addForm.looseBulkDensity}
                    onChange={(e) => setAddForm(prev => ({ ...prev, looseBulkDensity: parseFloat(e.target.value) || 0.45 }))}
                    className="w-full px-3 py-2 bg-zinc-900 border border-zinc-850 text-zinc-200 font-mono rounded-lg text-xs focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-zinc-400 font-semibold mb-1 uppercase tracking-wider">{t('add_tapped_density')} *</label>
                  <input
                    type="number"
                    required
                    step="0.01"
                    min="0.01"
                    max="5.0"
                    placeholder="0.65"
                    value={addForm.tappedBulkDensity}
                    onChange={(e) => setAddForm(prev => ({ ...prev, tappedBulkDensity: parseFloat(e.target.value) || 0.65 }))}
                    className="w-full px-3 py-2 bg-zinc-900 border border-zinc-850 text-zinc-200 font-mono rounded-lg text-xs focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-zinc-400 font-semibold mb-1 uppercase tracking-wider">{t('add_true_density')}</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    max="5.0"
                    placeholder="1.25"
                    value={addForm.trueDensity}
                    onChange={(e) => setAddForm(prev => ({ ...prev, trueDensity: parseFloat(e.target.value) || 1.25 }))}
                    className="w-full px-3 py-2 bg-zinc-900 border border-zinc-850 text-zinc-200 font-mono rounded-lg text-xs focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-zinc-400 font-semibold mb-1 uppercase tracking-wider">{t('add_max_safe')} *</label>
                  <input
                    type="number"
                    required
                    step="0.5"
                    min="0.1"
                    max="100.0"
                    placeholder="100"
                    value={addForm.maxSafePercentage}
                    onChange={(e) => setAddForm(prev => ({ ...prev, maxSafePercentage: parseFloat(e.target.value) || 100 }))}
                    className="w-full px-3 py-2 bg-zinc-900 border border-zinc-850 text-zinc-200 font-mono rounded-lg text-xs focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-zinc-400 font-semibold mb-1 uppercase tracking-wider">{t('add_cost_per_kg')} *</label>
                  <input
                    type="number"
                    required
                    step="0.1"
                    min="0.0"
                    placeholder="15.0"
                    value={addForm.costPerKgUsd}
                    onChange={(e) => setAddForm(prev => ({ ...prev, costPerKgUsd: parseFloat(e.target.value) || 15.0 }))}
                    className="w-full px-3 py-2 bg-zinc-900 border border-zinc-850 text-zinc-200 font-mono rounded-lg text-xs focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-zinc-400 font-semibold mb-1 uppercase tracking-wider">{t('add_compat_group')} *</label>
                  <select
                    value={addForm.chemicalClassId}
                    onChange={(e) => setAddForm(prev => ({ ...prev, chemicalClassId: parseInt(e.target.value, 10) || 0 }))}
                    className="w-full px-3 py-2 bg-zinc-900 border border-zinc-850 text-zinc-200 rounded-lg text-xs focus:outline-none focus:border-indigo-500 transition-colors bg-zinc-900"
                  >
                    {CHEMICAL_CLASSES.map(cls => (
                      <option key={cls.id} value={cls.id}>
                        {t(`chem_class_${cls.id}_cat`)}: {t(`chem_class_${cls.id}_name`)}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-span-1 md:col-span-2 flex items-center gap-2 bg-zinc-900/40 border border-zinc-900 p-3 rounded-lg mt-1">
                  <input
                    type="checkbox"
                    id="isAllergen"
                    checked={addForm.isAllergen}
                    onChange={(e) => setAddForm(prev => ({ ...prev, isAllergen: e.target.checked }))}
                    className="accent-indigo-500 cursor-pointer"
                  />
                  <label htmlFor="isAllergen" className="text-xs text-zinc-300 font-medium cursor-pointer select-none">
                    {t('canvas_allergen_label')}
                  </label>
                </div>
              </div>

              <div className="flex gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 py-2 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-zinc-400 hover:text-zinc-200 font-bold rounded-xl text-xs transition-colors cursor-pointer"
                >
                  {t('canvas_cancel')}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-indigo-500 hover:bg-indigo-600 active:bg-indigo-700 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer"
                >
                  {t('canvas_submit_ingredient')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Regulatory EULA / DSS Disclaimer overlay */}
      <Disclaimer />

      {/* Interactive Compatibility Matrix Modal */}
      <CompatibilityMatrix
        isOpen={isCompatibilityMatrixOpen}
        onClose={() => setIsCompatibilityMatrixOpen(false)}
        ingredients={allIngredients}
      />

      {/* Benefits Modal */}
      <BenefitsModal
        isOpen={showBenefitsModal}
        onClose={() => setShowBenefitsModal(false)}
        tariff="professional"
      />
    </div>
  );
};
