"use client";

import React, { useState, useCallback } from 'react';
import { useNodeEditor, EditorNode } from '../hooks/useNodeEditor';
import { Ingredient } from '../types/pharm';
import { Disclaimer } from './Disclaimer';
import { PricingPanel } from './PricingPanel';
import { useIngredients } from '../hooks/useIngredients';
import { Header } from './Header';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from '../context/I18nContext';
import { Sidebar } from './Sidebar';
import dynamic from 'next/dynamic';
import { BenefitsModal } from './BenefitsModal';

const CompatibilityMatrix = dynamic<{
  isOpen: boolean;
  onClose: () => void;
  ingredients: Ingredient[];
}>(
  () => import('./CompatibilityMatrix').then((mod) => mod.CompatibilityMatrix),
  {
    loading: () => null,
    ssr: false
  }
);
import { useIsMobile } from '../hooks/useIsMobile';
import { WizardModal } from './WizardModal';
import { MobileConfigurator } from './MobileConfigurator';
import { useSearchParams, useRouter } from 'next/navigation';
import { trackEvent } from '@/lib/analytics';
import 'driver.js/dist/driver.css';
import { AlertTriangle } from 'lucide-react';

// Decomposed Subcomponents
import { AuthModal } from './AuthModal';
import { AddIngredientModal } from './AddIngredientModal';
import { ErrorBoundary } from './ErrorBoundary';
import { CanvasArea } from './CanvasArea';

export const Canvas: React.FC = () => {
  const { user, changeTariff, startSubscriptionPolling } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialRecipeId = searchParams.get('recipeId');
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
    canRedo,
    setCanvasState
  } = useNodeEditor('hobby', allIngredients, initialRecipeId);

  // Redirect to projects list if no recipeId is specified
  React.useEffect(() => {
    if (!initialRecipeId) {
      router.push('/projects');
    }
  }, [initialRecipeId, router]);

  // Fetch initial recipe if recipeId is provided
  React.useEffect(() => {
    if (!initialRecipeId) return;

    if (isMockUser) {
      // Load from localStorage
      const storedKey = `pharmnode_recipes_mock_${user?.id}`;
      const stored = localStorage.getItem(storedKey);
      if (stored) {
        try {
          const recipes = JSON.parse(stored) as { id: string; name: string; nodes: EditorNode[]; connections: { id: string; source: string; target: string }[] }[];
          const found = recipes.find((r) => r.id === initialRecipeId);
          if (found) {
            setCanvasState(found.nodes, found.connections);
            return;
          }
        } catch (e) {
          console.error("Failed to parse mock recipes from localStorage", e);
        }
      }
      console.error("Mock recipe not found in localStorage:", initialRecipeId);
      return;
    }

    async function fetchRecipe() {
      try {
        const res = await fetch(`/api/recipes?id=${initialRecipeId}`);
        const data = await res.json();
        if (data.success && data.recipe) {
          setCanvasState(data.recipe.nodes, data.recipe.connections);
        }
      } catch (err) {
        console.error("Failed to load recipe:", err);
      }
    }
    fetchRecipe();
  }, [initialRecipeId, isMockUser, user?.id, setCanvasState]);

  // Sync canvas editor's tariff with active user's tariff
  React.useEffect(() => {
    if (user?.tariff) {
      setTariff(user.tariff);
    }
  }, [user?.tariff, setTariff]);

  // Check for Paddle checkout success/cancelled query params
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const checkoutStatus = params.get('checkout');
      const plan = params.get('plan') as "hobby" | "professional" | null;

      if (checkoutStatus === 'success' && plan) {
        setTariff(plan);
        if (user) {
          changeTariff(plan);
          // Start background polling to check if payment webhook completed and active session synchronized
          startSubscriptionPolling();
        }
        alert(t('canvas_checkout_success').replace('{plan}', plan.toUpperCase()));
        window.history.replaceState({}, document.title, window.location.pathname);
      } else if (checkoutStatus === 'cancelled') {
        alert(t('canvas_checkout_cancelled'));
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    }
  }, [user, changeTariff, setTariff, startSubscriptionPolling, t, searchParams]);

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showBenefitsModal, setShowBenefitsModal] = useState(false);
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [limitError, setLimitError] = useState<string | null>(null);

  const handleToggleSidebar = useCallback(() => {
    setIsSidebarOpen(prev => !prev);
  }, []);

  const handleOpenUpgradeModal = useCallback(() => {
    setShowUpgradeModal(true);
  }, []);

  const handleOpenCompatibilityMatrix = useCallback(() => {
    setIsCompatibilityMatrixOpen(true);
  }, []);

  const handleOpenBenefitsModal = useCallback(() => {
    setShowBenefitsModal(true);
  }, []);

  const handleOpenWizard = useCallback(() => {
    setIsWizardOpen(true);
  }, []);

  const startOnboardingTour = useCallback(async () => {
    const isRu = locale === 'ru-RU';

    const { driver } = await import('driver.js');
    const driverObj = driver({
      showProgress: true,
      allowClose: true,
      nextBtnText: isRu ? 'Далее →' : 'Next →',
      prevBtnText: isRu ? '← Назад' : '← Prev',
      doneBtnText: isRu ? 'Завершить' : 'Done',
      steps: [
        {
          element: undefined,
          popover: {
            title: isRu ? 'Добро пожаловать в PharmNode!' : 'Welcome to PharmNode!',
            description: isRu
              ? 'Давайте пройдем короткий интерактивный тур, чтобы узнать, как проектировать рецептуры и симулировать производство таблеток.'
              : 'Let\'s take a quick 1-minute interactive tour to learn how to design formulations and simulate tablet manufacturing.',
            side: 'bottom',
            align: 'start'
          }
        },
        {
          element: '#sidebar-container',
          popover: {
            title: isRu ? 'Библиотека ингредиентов' : 'Ingredients Library',
            description: isRu
              ? 'Здесь содержатся активные вещества (АФС) и вспомогательные компоненты. Перетаскивайте их на холст или кликайте для добавления.'
              : 'Access pre-populated APIs, excipients, fillers, and binders. Drag components onto the canvas or click them to add.',
            side: 'right',
            align: 'start'
          },
          onHighlightStarted: () => {
            setIsSidebarOpen(true);
          }
        },
        {
          element: '#canvas-workspace',
          popover: {
            title: isRu ? 'Рабочая область холста' : 'Node Canvas Workspace',
            description: isRu
              ? 'Это интерактивное пространство для проектирования. Соединяйте ноды линиями, перемещайте их и регулируйте проценты ввода.'
              : 'Connect ingredients, manage positions, and adjust input values to run real-time mathematical simulations.',
            side: 'bottom',
            align: 'start'
          }
        },
        {
          element: '[data-node-type="blending"]',
          popover: {
            title: isRu ? 'Смеситель сырья' : 'Blending Node',
            description: isRu
              ? 'Объединяет все входящие ингредиенты и рассчитывает средние свойства порошка. Здесь же работает матрица химической совместимости.'
              : 'Gathers inputs and evaluates raw blend parameters. Real-time chemical compatibility matrix runs here to detect material conflicts.',
            side: 'right',
            align: 'start'
          }
        },
        {
          element: '[data-node-type="press"]',
          popover: {
            title: isRu ? 'Симулятор таблетпресса' : 'Tablet Press Simulator',
            description: isRu
              ? 'Задает параметры матрицы пуансона (диаметр и глубину), рассчитывая пористость, объем и рекомендуемый вес таблетки.'
              : 'Configure equipment parameters here, such as die diameter and depth, to simulate tablet geometries and porosity index.',
            side: 'right',
            align: 'start'
          }
        },
        {
          element: '[data-node-type="output"]',
          popover: {
            title: isRu ? 'Выпуск и экономика партии' : 'Batch Yield & Economics',
            description: isRu
              ? 'Показывает конечные расчеты: размер партии в таблетках, общую массу сырья, себестоимость и цену таблетки.'
              : 'Calculates total tablet yields, batch weights, and unit pricing analysis based on active ingredient dose targets.',
            side: 'left',
            align: 'start'
          }
        },
        {
          element: '#header-wizard-btn',
          popover: {
            title: isRu ? 'Мастер рецептур' : 'Smart Design Helpers',
            description: isRu
              ? 'Нажмите на Мастер для быстрой загрузки стандартных моделей рецептур. Рядом находятся Матрица совместимости и выбор языков.'
              : 'Use the Formulation Wizard to instantly load pre-modeled configurations, or click the Compatibility Matrix to inspect conflicts.',
            side: 'bottom',
            align: 'start'
          }
        }
      ]
    });

    driverObj.drive();
    localStorage.setItem('pharmnode-onboarding-done', 'true');
  }, [locale]);

  // Auto-launch tour for new sessions
  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    const done = localStorage.getItem('pharmnode-onboarding-done');
    if (done) return;

    const timer = setTimeout(() => {
      startOnboardingTour();
    }, 1500);
    return () => clearTimeout(timer);
  }, [startOnboardingTour]);

  // Compute active ingredient node IDs to show what's already on the canvas
  const activeNodeIngredientIds = React.useMemo(() => {
    return nodes
      .filter(n => n.type === 'ingredient')
      .map(n => n.data.ingredientId)
      .filter((id): id is number | string => id !== undefined);
  }, [nodes]);

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
  }, [addIngredientNode, t]);

  const handleAddIngredient = useCallback((id: number | string) => {
    handleAddIngredientAt(id);
  }, [handleAddIngredientAt]);

  const handleGenerateFromWizard = useCallback((generatedIngs: { id: number | string; name: string; role: string; percentage: number }[], dosageForm: string) => {
    const newNodes = generatedIngs.map((ing, i) => ({
      id: `node-ing-${i + 1}`,
      type: 'ingredient' as const,
      position: { x: 100, y: 50 + i * 200 },
      data: {
        ingredientId: ing.id,
        percentage: ing.percentage
      }
    }));

    const blendingY = Math.max(250, 50 + ((generatedIngs.length - 1) * 200) / 2);

    const generatedNodes = [
      ...newNodes,
      {
        id: "node-blending",
        type: "blending" as const,
        position: { x: 450, y: blendingY },
        data: {}
      },
      {
        id: "node-press",
        type: "press" as const,
        position: { x: 750, y: blendingY },
        data: { diameterCm: 0.3, depthCm: 0.5, dosageForm }
      },
      {
        id: "node-output",
        type: "output" as const,
        position: { x: 1050, y: blendingY },
        data: { activeRawWeightG: 10 }
      }
    ];

    const generatedConnections = [
      ...newNodes.map((node, i) => ({
        id: `conn-ing-${i + 1}`,
        source: node.id,
        target: 'node-blending'
      })),
      { id: `conn-blending-press`, source: 'node-blending', target: 'node-press' },
      { id: `conn-press-output`, source: 'node-press', target: 'node-output' }
    ];

    setCanvasState(generatedNodes, generatedConnections);

    trackEvent('project_created', {
      recipeId: 'wizard-generated',
      name: `Wizard Formula (${dosageForm})`,
      ingredientCount: generatedIngs.length,
      dosageForm,
      locale
    });

    alert(t("wizard_success"));
    setIsWizardOpen(false);
  }, [setCanvasState, t, locale]);

  const handleReplaceIngredient = useCallback((oldIngredientId: number | string, newIngredientId: number | string) => {
    const targetNode = nodes.find(
      node => node.type === 'ingredient' && String(node.data.ingredientId) === String(oldIngredientId)
    );
    if (targetNode) {
      updateNodeData(targetNode.id, { ingredientId: newIngredientId });
    }
  }, [nodes, updateNodeData]);

  const handleOpenAddModal = useCallback(() => {
    if (!user) {
      setIsAuthModalOpen(true);
    } else {
      setIsAddModalOpen(true);
    }
  }, [user]);

  const remainingIngredients = React.useMemo(() => {
    const activeIds = nodes
      .filter(n => n.type === 'ingredient')
      .map(n => n.data.ingredientId);
    return allIngredients.filter(ing => !activeIds.some(id => String(id) === String(ing.id)));
  }, [nodes, allIngredients]);

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
          onOpenCompatibilityMatrix={handleOpenCompatibilityMatrix}
          onOpenPricing={handleOpenUpgradeModal}
          onOpenBenefits={handleOpenBenefitsModal}
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

        <AddIngredientModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onSuccess={refetchIngredients}
        />

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
    <div className="flex-1 flex flex-col h-full bg-zinc-950 relative overflow-hidden select-none theme-element">
      {/* Global Header */}
      <Header
        showCanvasControls={true}
        undo={undo}
        redo={redo}
        canUndo={canUndo}
        canRedo={canRedo}
        showAddMenu={isSidebarOpen}
        setShowAddMenu={handleToggleSidebar}
        remainingIngredients={remainingIngredients}
        handleAddIngredient={handleAddIngredient}
        tariff={tariff}
        setTariff={setTariff}
        onOpenCompatibilityMatrix={handleOpenCompatibilityMatrix}
        onOpenPricing={handleOpenUpgradeModal}
        onOpenBenefits={handleOpenBenefitsModal}
        onOpenWizard={handleOpenWizard}
        onStartTour={startOnboardingTour}
      />

      {/* Split Pane: Sidebar & Workspace Canvas Area */}
      <div className="flex-1 w-full flex overflow-hidden h-[calc(100vh-4rem)] relative">
        <Sidebar
          isOpen={isSidebarOpen}
          onToggle={handleToggleSidebar}
          activeNodeIngredientIds={activeNodeIngredientIds}
          onAddIngredient={handleAddIngredient}
          customIngredients={customIngredients}
          standardIngredients={standardIngredients}
          onOpenAddModal={handleOpenAddModal}
        />

        <CanvasArea
          nodes={nodes}
          connections={connections}
          calculatedResults={calculatedResults}
          tariff={tariff}
          updateNodeData={updateNodeData}
          removeNode={removeNode}
          updateNodePosition={updateNodePosition}
          handleReplaceIngredient={handleReplaceIngredient}
          allIngredients={allIngredients}
          remainingIngredients={remainingIngredients}
          handleAddIngredientAt={handleAddIngredientAt}
          onOpenUpgradeModal={handleOpenUpgradeModal}
          undo={undo}
          redo={redo}
          canUndo={canUndo}
          canRedo={canRedo}
          onOpenWizard={handleOpenWizard}
          onOpenCompatibilityMatrix={handleOpenCompatibilityMatrix}
        />
      </div>

      {/* Upgrade pricing simulation modal */}
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
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />

      {/* Add Custom Ingredient Modal */}
      <AddIngredientModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={refetchIngredients}
      />

      {/* Regulatory EULA / DSS Disclaimer overlay */}
      <Disclaimer />

      {/* Interactive Compatibility Matrix Modal */}
      <ErrorBoundary componentName="CompatibilityMatrix">
        <CompatibilityMatrix
          isOpen={isCompatibilityMatrixOpen}
          onClose={() => setIsCompatibilityMatrixOpen(false)}
          ingredients={allIngredients}
        />
      </ErrorBoundary>

      {/* Benefits Modal */}
      <BenefitsModal
        isOpen={showBenefitsModal}
        onClose={() => setShowBenefitsModal(false)}
        tariff="professional"
      />

      {/* Goal-Driven Wizard Modal */}
      <ErrorBoundary componentName="WizardModal">
        <WizardModal
          isOpen={isWizardOpen}
          onClose={() => setIsWizardOpen(false)}
          onGenerate={handleGenerateFromWizard}
        />
      </ErrorBoundary>
    </div>
  );
};
