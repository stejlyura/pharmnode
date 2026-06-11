"use client";

import React, { useState } from 'react';
import { EditorNode, CalculatedResults } from '../hooks/useNodeEditor';
import { Ingredient } from '../types/pharm';
import { MobileNodeCard } from './MobileNodeCard';
import { MobileIngredientSheet } from './MobileIngredientSheet';
import { Header } from './Header';
import { ArrowDown, Plus, FlaskConical, AlertTriangle } from 'lucide-react';
import { useTranslation } from '../context/I18nContext';

interface MobileConfiguratorProps {
  nodes: EditorNode[];
  calculatedResults: CalculatedResults;
  tariff: 'hobby' | 'professional';
  setTariff: (tariff: 'hobby' | 'professional') => void;
  onUpdateData: (nodeId: string, data: Partial<EditorNode['data']>) => void;
  onRemove: (nodeId: string) => void;
  onReplaceIngredient?: (oldId: number | string, newId: number | string) => void;
  allIngredients?: Ingredient[];
  onOpenAddModal: () => void;
  onAddIngredient: (id: number | string) => void;
  activeNodeIngredientIds: (number | string)[];
  onOpenCompatibilityMatrix?: () => void;
  onOpenPricing?: (targetTariff?: "professional") => void;
  onOpenBenefits?: (tariff: "professional") => void;
}

export const MobileConfigurator: React.FC<MobileConfiguratorProps> = ({
  nodes,
  calculatedResults,
  tariff,
  setTariff,
  onUpdateData,
  onRemove,
  onReplaceIngredient,
  allIngredients = [],
  onOpenAddModal,
  onAddIngredient,
  activeNodeIngredientIds,
  onOpenCompatibilityMatrix,
  onOpenPricing,
  onOpenBenefits
}) => {
  const { t } = useTranslation();
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const ingredientNodes = React.useMemo(() => {
    return nodes.filter(n => n.type === 'ingredient');
  }, [nodes]);

  const blendingNode = React.useMemo(() => {
    return nodes.find(n => n.type === 'blending');
  }, [nodes]);

  const pressNode = React.useMemo(() => {
    return nodes.find(n => n.type === 'press');
  }, [nodes]);

  const costOptimizerNode = React.useMemo(() => {
    return nodes.find(n => n.type === 'cost-optimizer');
  }, [nodes]);

  const outputNode = React.useMemo(() => {
    return nodes.find(n => n.type === 'output');
  }, [nodes]);

  const handleUpgradeClick = () => {
    if (onOpenPricing) {
      onOpenPricing("professional");
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-zinc-950 theme-element">
      {/* Compact Header */}
      <Header
        showCanvasControls={false}
        tariff={tariff}
        setTariff={setTariff}
        onOpenCompatibilityMatrix={onOpenCompatibilityMatrix}
        onOpenPricing={onOpenPricing}
        onOpenBenefits={onOpenBenefits}
      />

      {/* Main Content Area */}
      <main className="flex-1 px-4 pt-4 pb-28 flex flex-col gap-4 max-w-md mx-auto w-full">
        {/* Ingredient limits error in case hobby user exceeds limit */}
        {tariff === 'hobby' && ingredientNodes.length >= 3 && (
          <div className="p-3 bg-indigo-500/5 border border-indigo-500/10 rounded-xl text-xs text-zinc-300 flex flex-col gap-2">
            <div className="flex items-start gap-2">
              <AlertTriangle size={15} className="text-indigo-400 shrink-0 mt-0.5" />
              <span>
                <strong>Hobby Limit:</strong> {t('canvas_hobby_limit_desc') || "You reached the limit of 3 ingredients on the free plan."}
              </span>
            </div>
            <button
              onClick={handleUpgradeClick}
              className="py-2 bg-indigo-500 hover:bg-indigo-600 active:bg-indigo-700 text-white font-bold rounded-lg text-xs transition-colors self-start px-3 cursor-pointer"
            >
              {t('card_upgrade_pro')}
            </button>
          </div>
        )}

        {/* Section: Ingredients */}
        <div className="flex flex-col gap-3">
          <div className="flex justify-between items-center px-1">
            <h2 className="text-xs font-bold text-zinc-550 uppercase tracking-wider">
              {t('role_active') || "Ingredients"} ({ingredientNodes.length})
            </h2>
            <button
              onClick={() => setIsSheetOpen(true)}
              className="text-xs font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 cursor-pointer"
            >
              <Plus size={14} />
              {t('sidebar_add_custom') || "Add"}
            </button>
          </div>

          {ingredientNodes.length === 0 ? (
            <div className="p-8 border border-dashed border-zinc-800 rounded-2xl flex flex-col items-center justify-center gap-2 text-center text-zinc-500 text-xs">
              <FlaskConical size={24} className="opacity-40" />
              <p>{t('sidebar_no_results') || "No ingredients added"}</p>
              <button
                onClick={() => setIsSheetOpen(true)}
                className="mt-2 px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-zinc-300 font-bold hover:bg-zinc-850 cursor-pointer"
              >
                {t('sidebar_add_custom') || "Add Ingredient"}
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {ingredientNodes.map(node => (
                <MobileNodeCard
                  key={node.id}
                  node={node}
                  nodes={nodes}
                  calculatedResults={calculatedResults}
                  tariff={tariff}
                  onUpdateData={onUpdateData}
                  onRemove={onRemove}
                  onReplaceIngredient={onReplaceIngredient}
                  onUpgradeClick={handleUpgradeClick}
                  allIngredients={allIngredients}
                />
              ))}
            </div>
          )}
        </div>

        {/* Connector to Blending */}
        <div className="flex justify-center my-1">
          <div className="w-8 h-8 rounded-full bg-zinc-900 border border-zinc-850 flex items-center justify-center text-zinc-400 shadow-md">
            <ArrowDown size={14} />
          </div>
        </div>

        {/* Section: Blending */}
        {blendingNode && (
          <MobileNodeCard
            node={blendingNode}
            nodes={nodes}
            calculatedResults={calculatedResults}
            tariff={tariff}
            onUpdateData={onUpdateData}
            onRemove={onRemove}
            onReplaceIngredient={onReplaceIngredient}
            onUpgradeClick={handleUpgradeClick}
            allIngredients={allIngredients}
          />
        )}

        {/* Connector to Press */}
        <div className="flex justify-center my-1">
          <div className="w-8 h-8 rounded-full bg-zinc-900 border border-zinc-850 flex items-center justify-center text-zinc-400 shadow-md">
            <ArrowDown size={14} />
          </div>
        </div>

        {/* Section: Press */}
        {pressNode && (
          <MobileNodeCard
            node={pressNode}
            nodes={nodes}
            calculatedResults={calculatedResults}
            tariff={tariff}
            onUpdateData={onUpdateData}
            onRemove={onRemove}
            onReplaceIngredient={onReplaceIngredient}
            onUpgradeClick={handleUpgradeClick}
            allIngredients={allIngredients}
          />
        )}

        {/* Section: Cost Optimizer (if present) */}
        {costOptimizerNode && (
          <>
            <div className="flex justify-center my-1">
              <div className="w-8 h-8 rounded-full bg-zinc-900 border border-zinc-850 flex items-center justify-center text-zinc-400 shadow-md">
                <ArrowDown size={14} />
              </div>
            </div>
            <MobileNodeCard
              node={costOptimizerNode}
              nodes={nodes}
              calculatedResults={calculatedResults}
              tariff={tariff}
              onUpdateData={onUpdateData}
              onRemove={onRemove}
              onReplaceIngredient={onReplaceIngredient}
              onUpgradeClick={handleUpgradeClick}
              allIngredients={allIngredients}
            />
          </>
        )}

        {/* Connector to Output */}
        <div className="flex justify-center my-1">
          <div className="w-8 h-8 rounded-full bg-zinc-900 border border-zinc-850 flex items-center justify-center text-zinc-400 shadow-md">
            <ArrowDown size={14} />
          </div>
        </div>

        {/* Section: Output */}
        {outputNode && (
          <MobileNodeCard
            node={outputNode}
            nodes={nodes}
            calculatedResults={calculatedResults}
            tariff={tariff}
            onUpdateData={onUpdateData}
            onRemove={onRemove}
            onReplaceIngredient={onReplaceIngredient}
            onUpgradeClick={handleUpgradeClick}
            allIngredients={allIngredients}
          />
        )}
      </main>

      {/* Floating Action Button (FAB) */}
      <button
        onClick={() => setIsSheetOpen(true)}
        className="fixed bottom-6 right-6 z-40 bg-indigo-500 text-white w-14 h-14 rounded-full flex items-center justify-center shadow-[0_8px_30px_rgba(99,102,241,0.5)] border border-indigo-400/30 active:scale-95 active:bg-indigo-600 transition-all cursor-pointer"
        aria-label="Add Ingredient"
        title={t('sidebar_add_custom') || "Add Ingredient"}
      >
        <Plus size={24} />
      </button>

      {/* Ingredient Selection Sheet */}
      <MobileIngredientSheet
        isOpen={isSheetOpen}
        onClose={() => setIsSheetOpen(false)}
        activeNodeIngredientIds={activeNodeIngredientIds}
        onAddIngredient={onAddIngredient}
        allIngredients={allIngredients}
        onOpenAddModal={onOpenAddModal}
      />
    </div>
  );
};
