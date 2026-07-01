"use client";

import React from 'react';
import { Cpu, AlertTriangle } from 'lucide-react';
import { useTranslation } from '../context/I18nContext';
import { CalculatedResults } from '../hooks/useNodeEditor';
import { EditorNode, Ingredient } from '../types/pharm';
import { validateProcessCompatibility } from '../lib/calculator';

interface BlendingNodeProps {
  node: EditorNode;
  nodes?: EditorNode[];
  calculatedResults: CalculatedResults;
  onUpdateData: (nodeId: string, data: Partial<EditorNode['data']>) => void;
  onReplaceIngredient?: (oldId: number | string, newId: number | string) => void;
  allIngredients: Ingredient[];
  isMobile?: boolean;
}

export const BlendingNode: React.FC<BlendingNodeProps> = ({
  node,
  nodes,
  calculatedResults,
  onUpdateData,
  onReplaceIngredient,
  allIngredients,
  isMobile = false,
}) => {
  const { t } = useTranslation();
  const { looseDensity, tappedDensity, flowability } = calculatedResults.blend;
  const totalPct = calculatedResults.totalPercentage;

  const processType = node.data.processType;

  const ingredientsList = React.useMemo(() => {
    return (nodes || [])
      .filter(n => n.type === 'ingredient')
      .map(n => {
        const ingredient = allIngredients.find(ing => String(ing.id) === String(n.data.ingredientId));
        const percentage = Number(n.data.percentage ?? 0);
        return { ingredient, percentage };
      })
      .filter((item): item is { ingredient: Ingredient; percentage: number } => !!item.ingredient);
  }, [nodes, allIngredients]);

  const processValidation = React.useMemo(() => {
    if (!processType) return null;
    return validateProcessCompatibility(ingredientsList, processType);
  }, [ingredientsList, processType]);

  let ratingColor = 'text-zinc-400';
  let ratingBg = 'bg-zinc-800/50';

  if (flowability.rating === 'Excellent' || flowability.rating === 'Good') {
    ratingColor = 'text-emerald-400 border-emerald-500/20';
    ratingBg = 'bg-emerald-500/5';
  } else if (flowability.rating === 'Fair' || flowability.rating === 'Passable') {
    ratingColor = 'text-amber-400 border-amber-500/20';
    ratingBg = 'bg-amber-500/5';
  } else if (flowability.rating === 'Poor' || flowability.rating === 'Very Poor') {
    ratingColor = 'text-rose-400 border-rose-500/20';
    ratingBg = 'bg-rose-500/5';
  }

  return (
    <div className={isMobile ? "flex flex-col gap-4" : "flex flex-col gap-3 p-4"}>
      <h3 className={`font-semibold text-zinc-100 text-sm flex items-center gap-2 border-b border-zinc-800 ${
        isMobile ? "pb-2.5" : "md:text-base pb-2"
      }`}>
        <Cpu size={16} className="text-indigo-400" />
        {t('card_blend_mixing')}
      </h3>

      {/* Total Percentage Indicator */}
      <div className={`p-2.5 rounded-xl text-xs border ${
        Math.abs(totalPct - 100) < 0.01 
          ? 'bg-emerald-500/5 text-emerald-400 border-emerald-500/10' 
          : 'bg-amber-500/5 text-amber-400 border-amber-500/10'
      }`}>
        <div className="flex justify-between items-center font-semibold">
          <span>{t('card_recipe_total')}</span>
          <span className="font-mono">{totalPct.toFixed(1)}% / 100%</span>
        </div>
        {Math.abs(totalPct - 100) > 0.01 && (
          <p className="text-[10px] text-amber-500/80 mt-1 leading-normal">
            {t('card_recipe_must_100')}
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3 mt-1">
        <div className={`bg-zinc-800/30 border border-zinc-800/40 ${isMobile ? "p-2.5 rounded-xl" : "p-2 rounded"}`}>
          <span className="text-[10px] text-zinc-550 block">{t('card_bulk_density')}</span>
          <span className="text-xs font-semibold text-zinc-200 font-mono block mt-0.5">
            {looseDensity.toFixed(3)} g/mL
          </span>
        </div>
        <div className={`bg-zinc-800/30 border border-zinc-800/40 ${isMobile ? "p-2.5 rounded-xl" : "p-2 rounded"}`}>
          <span className="text-[10px] text-zinc-550 block">{t('card_tapped_density')}</span>
          <span className="text-xs font-semibold text-zinc-200 font-mono block mt-0.5">
            {tappedDensity.toFixed(3)} g/mL
          </span>
        </div>
      </div>

      {/* Process Selection dropdown */}
      <div className="flex flex-col gap-1.5 mt-1">
        <span className="text-[10px] text-zinc-400 font-medium">
          {t('card_process_type_label') || 'Технологический процесс:'}
        </span>
        <select
          value={processType || ''}
          onChange={(e) => onUpdateData(node.id, { processType: (e.target.value || undefined) as any })}
          className="w-full bg-zinc-950/80 border border-zinc-800/80 text-zinc-200 rounded text-xs py-1.5 px-2 focus:outline-none focus:border-indigo-500 font-sans cursor-pointer transition-colors"
        >
          <option value="">{t('select_process_placeholder') || '-- Выберите техпроцесс --'}</option>
          <option value="direct_compression">Прямое прессование (Direct Compression)</option>
          <option value="wet_granulation">Влажная грануляция (Wet Granulation)</option>
          <option value="dry_granulation">Сухая грануляция (Dry Granulation)</option>
          <option value="roller_compaction">Роллер-компактирование (Roller Compaction)</option>
        </select>
      </div>

      {/* Process validation warnings / recommendations in BlendingNode */}
      {processType && processValidation && (
        <div className="flex flex-col gap-1.5 mt-0.5">
          {processValidation.warnings.map((warn, idx) => (
            <div key={idx} className="p-2 bg-red-500/5 border border-red-500/10 text-red-400 flex items-start gap-1.5 rounded text-[10px] leading-normal">
              <AlertTriangle size={12} className="shrink-0 mt-0.5" />
              <span>{warn}</span>
            </div>
          ))}
          {processValidation.recommendations.map((rec, idx) => (
            <div key={idx} className="p-2 bg-indigo-500/5 border border-indigo-500/10 text-indigo-400 flex items-start gap-1.5 rounded text-[10px] leading-normal">
              <AlertTriangle size={12} className="shrink-0 mt-0.5" />
              <span>{rec}</span>
            </div>
          ))}
          {processValidation.isValid && processValidation.warnings.length === 0 && (
            <div className="p-2 bg-emerald-500/5 border border-emerald-500/10 text-emerald-400 flex items-center gap-1.5 rounded text-[10px]">
              <span>✅</span>
              <span>{t('process_validation_compatible') || 'Совместимость подтверждена'}</span>
            </div>
          )}
        </div>
      )}

      {/* Flowability evaluation */}
      <div className={`border ${ratingBg} ${ratingColor} flex flex-col gap-1.5 ${isMobile ? "p-3 rounded-xl" : "p-2.5 rounded"}`}>
        <div className="flex justify-between items-center">
          <span className="text-[10px] text-zinc-400">{t('card_blend_flowability')}</span>
          <span className="text-xs font-bold uppercase tracking-wider font-mono">
            {flowability.rating}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-2 text-[10px] text-zinc-550 mt-1 border-t border-zinc-800/50 pt-1">
          <span>{t('card_hausner')} <span className="font-mono text-zinc-300 font-bold">{flowability.hausner.toFixed(2)}</span></span>
          <span>{t('card_carr_index')} <span className="font-mono text-zinc-300 font-bold">{flowability.carr.toFixed(1)}%</span></span>
        </div>
      </div>

      {/* Warnings list with action button */}
      {calculatedResults.warnings.length > 0 && (
        <div className="flex flex-col gap-2.5 border-t border-zinc-800/50 pt-2.5">
          <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">
            {t('card_warnings_conflicts')} ({calculatedResults.warnings.length}):
          </span>
          <div className={`flex flex-col gap-1.5 ${isMobile ? "" : "max-h-36 overflow-y-auto pr-1"}`}>
            {calculatedResults.warnings.map((w, idx) => (
              <div key={idx} className={`p-2.5 rounded-xl text-[10px] border flex flex-col gap-1.5 ${
                w.severity === 'error' 
                  ? 'bg-red-500/5 text-red-400 border-red-500/10' 
                  : 'bg-amber-500/5 text-amber-400 border-amber-500/10'
              }`}>
                <div className="flex items-start gap-1">
                  <AlertTriangle size={isMobile ? 14 : 12} className="shrink-0 mt-0.5" />
                  <span className={isMobile ? "text-xs leading-normal" : ""}>{w.message}</span>
                </div>
                {w.suggestion && (
                  <div className="flex flex-col gap-1.5 bg-black/20 p-1.5 rounded border border-white/5">
                    <span className="text-[9px] text-zinc-550 font-bold uppercase tracking-wider">{t('card_suggestion')}</span>
                    <span className="text-zinc-300 leading-normal font-light">{w.suggestion}</span>
                    {w.relatedIngredientId && onReplaceIngredient && (
                      <button
                        onClick={() => {
                          if (w.message.includes('Майяра') || w.message.includes('Maillard')) {
                            onReplaceIngredient(w.relatedIngredientId!, 3); // Lactose -> MCC
                          }
                        }}
                        className={
                          isMobile
                            ? "mt-1 px-3 py-1.5 bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 active:bg-indigo-500/30 text-[10px] font-bold rounded-lg border border-indigo-500/30 transition-colors cursor-pointer self-start"
                            : "mt-1 self-start px-2 py-0.5 bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/30 text-[9px] font-semibold rounded border border-indigo-500/30 transition-colors cursor-pointer"
                        }
                      >
                        {t('card_replace_mcc')}
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
