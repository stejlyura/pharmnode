"use client";

import React from 'react';
import { EditorNode, CalculatedResults } from '../hooks/useNodeEditor';
import { baseIngredientsMatrix, Ingredient } from '../types/pharm';
import { Trash2, AlertTriangle, DollarSign, Cpu, FileText, Settings, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from '../context/I18nContext';
import { generateGMPReport } from '../lib/pdfGenerator';

interface MobileNodeCardProps {
  node: EditorNode;
  nodes?: EditorNode[];
  calculatedResults: CalculatedResults;
  tariff: 'hobby' | 'professional';
  onUpdateData: (nodeId: string, data: Partial<EditorNode['data']>) => void;
  onRemove: (nodeId: string) => void;
  onReplaceIngredient?: (oldId: number | string, newId: number | string) => void;
  onUpgradeClick?: () => void;
  customIngredients?: Ingredient[];
}

export const MobileNodeCard: React.FC<MobileNodeCardProps> = ({
  node,
  nodes,
  calculatedResults,
  tariff,
  onUpdateData,
  onRemove,
  onReplaceIngredient,
  onUpgradeClick,
  customIngredients = []
}) => {
  const { user } = useAuth();
  const { t, locale, setLocale } = useTranslation();
  const { id, type, data } = node;

  const allIngredients = React.useMemo(() => {
    return [...baseIngredientsMatrix, ...customIngredients];
  }, [customIngredients]);

  // Determine warnings for this specific node
  const nodeWarnings = React.useMemo(() => {
    if (type === 'ingredient') {
      return calculatedResults.warnings.filter(w => String(w.ingredientId) === String(data.ingredientId));
    }
    if (type === 'blending') {
      return calculatedResults.warnings;
    }
    if (type === 'press') {
      return calculatedResults.warnings.filter(w => w.ingredientId === 4); // Magnesium Stearate limit warnings affect press
    }
    return [];
  }, [type, data.ingredientId, calculatedResults.warnings]);

  const hasError = nodeWarnings.some(w => w.severity === 'error');
  const hasWarning = nodeWarnings.some(w => w.severity === 'warning');

  let borderClass = 'border-zinc-800 bg-zinc-900/90';
  if (hasError) {
    borderClass = 'border-red-500/60 bg-red-950/5 shadow-[0_0_15px_rgba(239,68,68,0.1)]';
  } else if (hasWarning) {
    borderClass = 'border-amber-500/60 bg-amber-950/5 shadow-[0_0_15px_rgba(245,158,11,0.1)]';
  }

  const renderCardContent = () => {
    switch (type) {
      case 'ingredient': {
        const ingredient = allIngredients.find(ing => String(ing.id) === String(data.ingredientId));
        if (!ingredient) return <div className="p-4 text-rose-400">{t('card_ingredient_not_found')}</div>;

        const percentage = data.percentage ?? 0;
        
        let roleBadgeColor = 'bg-zinc-800 text-zinc-400 border-zinc-700/50';
        if (ingredient.role === 'active') roleBadgeColor = 'bg-rose-500/10 text-rose-400 border-rose-500/20';
        else if (ingredient.role === 'dry-binder') roleBadgeColor = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
        else if (ingredient.role === 'lubricant') roleBadgeColor = 'bg-amber-500/10 text-amber-400 border-amber-500/20';
        else if (ingredient.role === 'glidant') roleBadgeColor = 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20';

        return (
          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-bold text-zinc-100 text-base leading-tight pr-2">
                  {ingredient.name}
                </h3>
                <div className="flex gap-2 items-center mt-1.5 flex-wrap">
                  <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded border ${roleBadgeColor}`}>
                    {ingredient.role}
                  </span>
                  <span className="text-[10px] text-zinc-500 font-mono">
                    CAS: {ingredient.casNumber}
                  </span>
                </div>
              </div>
              <button
                onClick={() => onRemove(id)}
                className="text-zinc-500 hover:text-rose-400 transition-colors p-2 rounded-lg bg-zinc-800/40 border border-zinc-800 active:bg-zinc-800"
                title={t('card_remove_ingredient')}
              >
                <Trash2 size={16} />
              </button>
            </div>

            <div className="mt-1">
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-xs text-zinc-400">{t('card_input_percentage')}</span>
                <span className="text-sm font-extrabold text-zinc-100 font-mono">
                  {percentage}%
                </span>
              </div>
              <div className="flex gap-3 items-center">
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="0.5"
                  value={percentage}
                  onChange={(e) => onUpdateData(id, { percentage: parseFloat(e.target.value) || 0 })}
                  className="flex-1 accent-indigo-500 bg-zinc-800 h-2 rounded-lg appearance-none cursor-pointer py-2"
                />
                <input
                  type="number"
                  inputMode="decimal"
                  min="0"
                  max="100"
                  step="0.1"
                  value={percentage}
                  onChange={(e) => {
                    let val = parseFloat(e.target.value);
                    if (isNaN(val)) val = 0;
                    if (val < 0) val = 0;
                    if (val > 100) val = 100;
                    onUpdateData(id, { percentage: val });
                  }}
                  className="w-16 bg-zinc-850 border border-zinc-750 text-zinc-100 rounded-lg text-center text-xs font-mono py-2 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-1 pt-3 border-t border-zinc-800/60 text-[11px] text-zinc-500">
              <div>
                <span>{t('card_density')}</span>
                <span className="block font-mono text-zinc-350 font-medium mt-0.5">
                  {ingredient.looseBulkDensity.toFixed(2)} → {ingredient.tappedBulkDensity.toFixed(2)} g/mL
                </span>
              </div>
              <div>
                <span>{t('card_price_per_kg')}</span>
                <span className="block font-mono text-emerald-400 font-bold mt-0.5">
                  ${ingredient.costPerKgUsd.toFixed(2)}
                </span>
              </div>
            </div>

            {nodeWarnings.map((w, idx) => (
              <div key={idx} className="mt-1 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-xs text-red-400 flex items-start gap-2 leading-relaxed">
                <AlertTriangle size={14} className="shrink-0 mt-0.5" />
                <span>{w.message}</span>
              </div>
            ))}
          </div>
        );
      }

      case 'blending': {
        const { looseDensity, tappedDensity, flowability } = calculatedResults.blend;
        const totalPct = calculatedResults.totalPercentage;
        
        let ratingColor = 'text-zinc-400 border-zinc-800';
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
          <div className="flex flex-col gap-4">
            <h3 className="font-bold text-zinc-100 text-sm flex items-center gap-2 border-b border-zinc-800 pb-2.5">
              <Cpu size={16} className="text-indigo-400" />
              {t('card_blend_mixing')}
            </h3>

            <div className={`p-3 rounded-xl text-xs border ${
              Math.abs(totalPct - 100) < 0.01 
                ? 'bg-emerald-500/5 text-emerald-400 border-emerald-500/10' 
                : 'bg-amber-500/5 text-amber-400 border-amber-500/10'
            }`}>
              <div className="flex justify-between items-center font-bold">
                <span>{t('card_recipe_total')}</span>
                <span className="font-mono">{totalPct.toFixed(1)}% / 100%</span>
              </div>
              {Math.abs(totalPct - 100) > 0.01 && (
                <p className="text-[10px] text-amber-500/80 mt-1 leading-normal">
                  {t('card_recipe_must_100')}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-zinc-800/30 p-2.5 rounded-xl border border-zinc-800/60">
                <span className="text-[10px] text-zinc-500 block">{t('card_bulk_density')}</span>
                <span className="text-xs font-bold text-zinc-350 font-mono block mt-0.5">
                  {looseDensity.toFixed(3)} g/mL
                </span>
              </div>
              <div className="bg-zinc-800/30 p-2.5 rounded-xl border border-zinc-800/60">
                <span className="text-[10px] text-zinc-500 block">{t('card_tapped_density')}</span>
                <span className="text-xs font-bold text-zinc-350 font-mono block mt-0.5">
                  {tappedDensity.toFixed(3)} g/mL
                </span>
              </div>
            </div>

            <div className={`p-3 rounded-xl border ${ratingBg} ${ratingColor} flex flex-col gap-1.5`}>
              <div className="flex justify-between items-center">
                <span className="text-[10px] text-zinc-400">{t('card_blend_flowability')}</span>
                <span className="text-xs font-extrabold uppercase tracking-wider font-mono">
                  {flowability.rating}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[10px] text-zinc-550 border-t border-zinc-800/40 pt-1.5 mt-0.5">
                <span>{t('card_hausner')} <span className="font-mono font-bold text-zinc-300">{flowability.hausner.toFixed(2)}</span></span>
                <span>{t('card_carr_index')} <span className="font-mono font-bold text-zinc-300">{flowability.carr.toFixed(1)}%</span></span>
              </div>
            </div>

            {calculatedResults.warnings.length > 0 && (
              <div className="flex flex-col gap-2.5 border-t border-zinc-800/60 pt-3">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                  {t('card_warnings_conflicts')} ({calculatedResults.warnings.length}):
                </span>
                <div className="flex flex-col gap-2">
                  {calculatedResults.warnings.map((w, idx) => (
                    <div key={idx} className={`p-3 rounded-xl border flex flex-col gap-2 ${
                      w.severity === 'error' 
                        ? 'bg-red-500/5 text-red-400 border-red-500/10' 
                        : 'bg-amber-500/5 text-amber-400 border-amber-500/10'
                    }`}>
                      <div className="flex items-start gap-1.5">
                        <AlertTriangle size={14} className="shrink-0 mt-0.5" />
                        <span className="text-xs leading-normal">{w.message}</span>
                      </div>
                      {w.suggestion && (
                        <div className="flex flex-col gap-1.5 bg-black/25 p-2 rounded-lg border border-white/5">
                          <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider">{t('card_suggestion')}</span>
                          <span className="text-[11px] text-zinc-300 leading-normal font-light">{w.suggestion}</span>
                          {w.relatedIngredientId && onReplaceIngredient && (
                            <button
                              onClick={() => {
                                if (w.message.includes('Майяра') || w.message.includes('Maillard')) {
                                  onReplaceIngredient(w.relatedIngredientId!, 3); // Lactose -> MCC
                                }
                              }}
                              className="mt-1 px-3 py-1.5 bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 active:bg-indigo-500/30 text-[10px] font-bold rounded-lg border border-indigo-500/30 transition-colors cursor-pointer self-start"
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
      }

      case 'press': {
        const diameter = data.diameterCm ?? 0.3;
        const depth = data.depthCm ?? 0.5;
        const { volume, maxWeightMg, recommendedWeightMg, porosity } = calculatedResults.tableting;

        return (
          <div className="flex flex-col gap-4">
            <h3 className="font-bold text-zinc-100 text-sm flex items-center gap-2 border-b border-zinc-800 pb-2.5">
              <Settings size={16} className="text-indigo-400" />
              {t('card_press_equipment')}
            </h3>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-xs text-zinc-400">{t('card_punch_diameter')}</span>
                <span className="text-xs font-bold text-zinc-200 font-mono">
                  {diameter} {t('unit_cm')} ({(diameter * 10).toFixed(0)} {t('unit_mm')})
                </span>
              </div>
              <input
                type="range"
                min="0.1"
                max="1.5"
                step="0.05"
                value={diameter}
                onChange={(e) => onUpdateData(id, { diameterCm: parseFloat(e.target.value) || 0.3 })}
                className="w-full accent-indigo-500 bg-zinc-800 h-2 rounded-lg appearance-none cursor-pointer py-2"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-xs text-zinc-400">{t('card_fill_depth')}</span>
                <span className="text-xs font-bold text-zinc-200 font-mono">
                  {depth} {t('unit_cm')}
                </span>
              </div>
              <input
                type="range"
                min="0.1"
                max="2.0"
                step="0.05"
                value={depth}
                onChange={(e) => onUpdateData(id, { depthCm: parseFloat(e.target.value) || 0.5 })}
                className="w-full accent-indigo-500 bg-zinc-800 h-2 rounded-lg appearance-none cursor-pointer py-2"
              />
            </div>

            <div className="grid grid-cols-2 gap-3 mt-2 pt-3 border-t border-zinc-800/60 text-xs">
              <div className="bg-zinc-800/20 p-2.5 rounded-xl border border-zinc-800/50">
                <span className="text-[10px] text-zinc-500 block">{t('card_die_volume')}</span>
                <span className="font-mono text-zinc-350 font-bold block mt-0.5">
                  {(volume * 1000).toFixed(1)} {t('unit_mm3')}
                </span>
              </div>
              <div className="bg-zinc-800/20 p-2.5 rounded-xl border border-zinc-800/50">
                <span className="text-[10px] text-zinc-500 block">{t('card_tablet_porosity')}</span>
                <span className={`font-mono font-bold block mt-0.5 ${
                  porosity > 0.4 ? 'text-amber-400' : 'text-zinc-300'
                }`}>
                  {(porosity * 100).toFixed(2)}%
                </span>
              </div>
              <div className="bg-zinc-800/20 p-2.5 rounded-xl border border-zinc-800/50">
                <span className="text-[10px] text-zinc-500 block">{t('card_fill_weight_max')}</span>
                <span className="font-mono text-zinc-350 font-bold block mt-0.5">
                  {maxWeightMg.toFixed(2)} {t('unit_mg')}
                </span>
              </div>
              <div className="bg-zinc-800/20 p-2.5 rounded-xl border border-zinc-800/50">
                <span className="text-[10px] text-zinc-500 block">{t('card_tablet_weight_rec')}</span>
                <span className="font-mono text-indigo-400 font-bold block mt-0.5">
                  {recommendedWeightMg.toFixed(2)} {t('unit_mg')}
                </span>
              </div>
            </div>
          </div>
        );
      }

      case 'cost-optimizer': {
        const { costPerKg } = calculatedResults.blend;
        const { costPerTabletUsd, totalBatchCostUsd } = calculatedResults.batch;

        return (
          <div className="flex flex-col gap-4">
            <h3 className="font-bold text-zinc-100 text-sm flex items-center gap-2 border-b border-zinc-800 pb-2.5">
              <DollarSign size={16} className="text-emerald-400" />
              {t('card_cost_optimizer')}
            </h3>

            <div className="flex flex-col gap-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-zinc-400">{t('card_blend_cost')}</span>
                <span className="font-mono text-emerald-400 font-bold">
                  ${costPerKg.toFixed(2)} / {t('unit_kg')}
                </span>
              </div>
              <div className="flex justify-between items-center mt-0.5">
                <span className="text-zinc-400">{t('card_cost_per_tablet')}</span>
                <span className="font-mono text-emerald-400 font-bold">
                  ${costPerTabletUsd.toFixed(5)}
                </span>
              </div>
              <div className="flex justify-between items-center mt-0.5">
                <span className="text-zinc-400">{t('card_batch_cost')}</span>
                <span className="font-mono text-emerald-400 font-bold">
                  ${totalBatchCostUsd.toFixed(2)}
                </span>
              </div>
            </div>

            <div className="mt-2 border-t border-zinc-800/60 pt-3 flex flex-col gap-2.5">
              <span className="text-[10px] text-zinc-550 uppercase tracking-wider font-bold">
                {t('card_ai_suggestions')}
              </span>

              {tariff === 'hobby' ? (
                <div className="p-3 bg-indigo-500/5 rounded-xl border border-indigo-500/10 flex flex-col gap-2.5 items-center text-center">
                  <p className="text-[10px] text-zinc-400 leading-relaxed font-light">
                    {t('card_ai_locked')}
                  </p>
                  <button
                    onClick={onUpgradeClick}
                    className="w-full py-2 bg-indigo-500 hover:bg-indigo-600 active:bg-indigo-700 text-white text-xs font-bold rounded-lg shadow-md transition-all cursor-pointer"
                  >
                    {t('card_upgrade_pro')}
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  <div className="p-3 bg-emerald-500/5 rounded-xl border border-emerald-500/10 text-[11px] text-zinc-350 leading-relaxed font-light">
                    <span className="font-bold text-emerald-450 block mb-1">{t('card_binder_savings')}</span>
                    {t('card_binder_savings_desc')}
                  </div>
                  <div className="p-2.5 bg-zinc-800/40 rounded-xl border border-zinc-800/50 text-[10px] text-zinc-500 text-center">
                    {t('card_no_more_suggestions')}
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      }

      case 'output': {
        const activeRawWeightG = data.activeRawWeightG ?? 10;
        const region = String(data.region ?? 'US');
        const { recommendedWeightMg } = calculatedResults.tableting;
        const { totalTablets, totalBatchWeightKg } = calculatedResults.batch;
        
        const formattedAllergens = calculatedResults.allergens.map(name => {
          if (name.includes('Lactose')) return 'Milk (Lactose)';
          return name;
        });

        return (
          <div className="flex flex-col gap-4">
            <h3 className="font-bold text-zinc-100 text-sm flex items-center gap-2 border-b border-zinc-800 pb-2.5">
              <FileText size={16} className="text-indigo-400" />
              {t('card_final_product')}
            </h3>

            <div className="flex items-center justify-between text-xs bg-zinc-800/25 p-2 rounded-xl border border-zinc-800/60 text-zinc-100">
              <span className="text-zinc-400 font-medium ml-1">{t('card_region_standard')}</span>
              <div className="flex bg-zinc-900 rounded-lg p-0.5 border border-zinc-800">
                <button
                  onClick={() => {
                    onUpdateData(id, { region: 'US' });
                    setLocale('en-US');
                  }}
                  className={`px-3 py-1 rounded-md text-[10px] font-bold transition-all cursor-pointer ${
                    region === 'US' ? 'bg-zinc-800 text-indigo-400' : 'text-zinc-500 hover:text-zinc-455'
                  }`}
                >
                  US (FDA)
                </button>
                <button
                  onClick={() => {
                    onUpdateData(id, { region: 'EU' });
                    setLocale('en-EU');
                  }}
                  className={`px-3 py-1 rounded-md text-[10px] font-bold transition-all cursor-pointer ${
                    region === 'EU' ? 'bg-zinc-800 text-indigo-400' : 'text-zinc-500 hover:text-zinc-455'
                  }`}
                >
                  EU (EFSA)
                </button>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-xs text-zinc-400">{t('card_active_raw_weight')}</span>
                <span className="text-xs font-bold text-zinc-200 font-mono">
                  {activeRawWeightG} {t('unit_g')}
                </span>
              </div>
              <div className="flex gap-3">
                <input
                  type="range"
                  min="1"
                  max="100"
                  step="1"
                  value={activeRawWeightG}
                  onChange={(e) => onUpdateData(id, { activeRawWeightG: parseFloat(e.target.value) || 10 })}
                  className="flex-1 accent-indigo-500 bg-zinc-800 h-2 rounded-lg appearance-none cursor-pointer py-2 self-center"
                />
                <input
                  type="number"
                  inputMode="numeric"
                  min="1"
                  max="5000"
                  value={activeRawWeightG}
                  onChange={(e) => {
                    let val = parseFloat(e.target.value);
                    if (isNaN(val)) val = 1;
                    if (val < 1) val = 1;
                    onUpdateData(id, { activeRawWeightG: val });
                  }}
                  className="w-16 bg-zinc-850 border border-zinc-750 text-zinc-100 rounded-lg text-center text-xs font-mono py-2 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="flex flex-col gap-2 bg-zinc-900/40 p-3 rounded-xl border border-zinc-800/60 text-xs">
              <div className="flex justify-between">
                <span className="text-zinc-500">{t('card_active_share')}</span>
                <span className="font-mono text-zinc-300 font-bold">
                  {calculatedResults.activePercentage.toFixed(1)}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">{t('card_rec_tablet_weight')}</span>
                <span className="font-mono text-zinc-300 font-bold">
                  {recommendedWeightMg.toFixed(2)} {t('unit_mg')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">{t('card_tablets_count')}</span>
                <span className="font-mono text-indigo-400 font-extrabold">
                  {totalTablets.toLocaleString()} {t('unit_pcs')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">{t('card_total_batch_weight')}</span>
                <span className="font-mono text-zinc-300 font-bold">
                  {totalBatchWeightKg.toFixed(4)} {t('unit_kg')}
                </span>
              </div>
            </div>

            {calculatedResults.warnings.length > 0 && (
              <div className="flex flex-col gap-1.5">
                {calculatedResults.warnings.map((w, idx) => (
                  <div key={idx} className="p-2.5 bg-red-500/5 border border-red-500/10 rounded-lg text-[10.5px] text-red-400 flex items-start gap-1.5 leading-normal">
                    <AlertTriangle size={13} className="shrink-0 mt-0.5" />
                    <span>{w.message}</span>
                  </div>
                ))}
              </div>
            )}

            {formattedAllergens.length > 0 && (
              <div className="p-2.5 bg-amber-500/5 border border-amber-500/10 rounded-lg text-[10.5px] text-amber-400 flex items-start gap-1.5 leading-normal">
                <AlertTriangle size={13} className="shrink-0 mt-0.5" />
                <span>
                  <strong>Contains:</strong> {formattedAllergens.join(', ')} ({t('allergen_compliance')}).
                </span>
              </div>
            )}

            <div className="bg-zinc-950 p-3.5 rounded-xl border border-zinc-850 text-[10px] font-sans flex flex-col gap-2">
              <div className="border-b border-zinc-800 pb-1.5 text-center font-bold text-zinc-300 uppercase tracking-wider text-xs">
                {t('supplement_type')}
              </div>
              <div className="flex justify-between font-mono text-zinc-400 text-[11px]">
                <span>Serving Size:</span>
                <span>1 Tablet</span>
              </div>
              <div className="border-t border-b border-zinc-800 py-1.5 flex justify-between font-bold text-zinc-200 text-[11px]">
                <span>Active ingredients:</span>
                <span>
                  {recommendedWeightMg > 0 
                    ? (recommendedWeightMg * (calculatedResults.activePercentage / 100)).toFixed(2) 
                    : 0} mg
                </span>
              </div>
              <div className="text-[9px] text-zinc-550 leading-normal italic text-center border-t border-zinc-800/40 pt-1.5 mt-0.5">
                {region === 'US' ? (
                  '* These statements have not been evaluated by the Food and Drug Administration. This product is not intended to diagnose, treat, cure, or prevent any disease.'
                ) : (
                  '* This food supplement is not a substitute for a varied and balanced diet and a healthy lifestyle.'
                )}
              </div>
            </div>

            <button
              onClick={() => {
                if (tariff !== 'professional') {
                  if (onUpgradeClick) onUpgradeClick();
                } else {
                  generateGMPReport(nodes || [node], calculatedResults, user, region, customIngredients);
                }
              }}
              className={`w-full py-2.5 px-3 text-xs font-bold rounded-lg shadow-md transition-all cursor-pointer flex justify-center items-center gap-2 ${
                tariff !== 'professional'
                  ? 'bg-zinc-800 text-zinc-400 hover:text-zinc-300 border border-zinc-750'
                  : 'bg-indigo-500 hover:bg-indigo-600 text-white'
              }`}
            >
              {t('card_export_gmp')}
              {tariff !== 'professional' && (
                <span className="text-[9px] bg-zinc-700 px-2 py-0.5 rounded text-zinc-400 font-semibold uppercase tracking-wider scale-90">
                  Pro
                </span>
              )}
            </button>
          </div>
        );
      }

      default:
        return null;
    }
  };

  return (
    <div className={`w-full rounded-2xl border p-4 flex flex-col gap-3 shadow-xl transition-all theme-element ${borderClass}`}>
      {renderCardContent()}
    </div>
  );
};
