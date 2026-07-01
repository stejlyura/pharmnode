"use client";

import React from 'react';
import { FileText, Sparkles, AlertTriangle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from '../context/I18nContext';
import { CalculatedResults } from '../hooks/useNodeEditor';
import { generateGMPReport } from '../lib/pdfGenerator';
import { EditorNode, Ingredient } from '../types/pharm';
import { getPackagingRecommendations, calculateFormulaScore, validateProcessCompatibility } from '../lib/calculator';

interface OutputNodeProps {
  node: EditorNode;
  nodes?: EditorNode[];
  calculatedResults: CalculatedResults;
  tariff: 'hobby' | 'professional';
  onUpdateData: (nodeId: string, data: Partial<EditorNode['data']>) => void;
  onUpgradeClick?: () => void;
  allIngredients: Ingredient[];
  isMobile?: boolean;
}

export const OutputNode: React.FC<OutputNodeProps> = ({
  node,
  nodes,
  calculatedResults,
  tariff,
  onUpdateData,
  onUpgradeClick,
  allIngredients,
  isMobile = false,
}) => {
  const { id, data } = node;
  const { user } = useAuth();
  const { t, setLocale } = useTranslation();

  const activeRawWeightG = data.activeRawWeightG ?? 10;
  const region = String(data.region ?? 'US');
  const { recommendedWeightMg } = calculatedResults.tableting;
  const { totalTablets, totalBatchWeightKg } = calculatedResults.batch;

  // Format allergens to match FALCPA Milk (Lactose) labeling
  const formattedAllergens = calculatedResults.allergens.map(name => {
    if (name.includes('Lactose')) return 'Milk (Lactose)';
    return name;
  });

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

  const packagingRecs = React.useMemo(() => {
    return getPackagingRecommendations(ingredientsList);
  }, [ingredientsList]);

  const formulaScore = React.useMemo(() => {
    return calculateFormulaScore(ingredientsList);
  }, [ingredientsList]);

  const processType = React.useMemo(() => {
    const blendingNode = (nodes || []).find(n => n.type === 'blending');
    return blendingNode?.data.processType;
  }, [nodes]);

  const processValidation = React.useMemo(() => {
    if (!processType) return null;
    return validateProcessCompatibility(ingredientsList, processType);
  }, [ingredientsList, processType]);

  return (
    <div className={isMobile ? "flex flex-col gap-4" : "flex flex-col gap-3 p-4"}>
      <h3 className="font-semibold text-zinc-100 text-sm md:text-base flex items-center gap-2 border-b border-zinc-800 pb-2">
        <FileText size={16} className="text-indigo-400" />
        {t('card_final_product')}
      </h3>

      {/* Region Toggle Standard */}
      <div className={`flex items-center justify-between text-[11px] bg-zinc-800/30 p-2 border border-zinc-800/50 text-zinc-100 ${isMobile ? "rounded-xl" : "rounded"}`}>
        <span className="text-zinc-400 font-medium ml-1">{t('card_region_standard')}</span>
        <div className="flex bg-zinc-900 rounded p-0.5 border border-zinc-850">
          <button
            onClick={() => {
              onUpdateData(id, { region: 'US' });
              setLocale('en-US');
            }}
            className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all cursor-pointer ${
              region === 'US' 
                ? 'bg-zinc-850 text-indigo-400 font-semibold' 
                : 'text-zinc-500 hover:text-zinc-400'
            } ${isMobile ? "px-3 py-1 rounded-md" : ""}`}
          >
            US (FDA)
          </button>
          <button
            onClick={() => {
              onUpdateData(id, { region: 'EU' });
              setLocale('en-EU');
            }}
            className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all cursor-pointer ${
              region === 'EU' 
                ? 'bg-zinc-850 text-indigo-400 font-semibold' 
                : 'text-zinc-500 hover:text-zinc-400'
            } ${isMobile ? "px-3 py-1 rounded-md" : ""}`}
          >
            EU (EFSA)
          </button>
        </div>
      </div>

      {/* Active Raw Material Input */}
      <div>
        <div className="flex justify-between items-center mb-1.5">
          <span className="text-xs text-zinc-400">{t('card_active_raw_weight')}</span>
          <span className="text-xs font-semibold text-zinc-200 font-mono">
            {activeRawWeightG} {t('unit_g')}
          </span>
        </div>
        <div className="flex gap-2">
          <input
            type="range"
            min="1"
            max="100"
            step="1"
            value={activeRawWeightG}
            onChange={(e) => onUpdateData(id, { activeRawWeightG: parseFloat(e.target.value) || 10 })}
            className={`flex-1 accent-indigo-500 bg-zinc-800 rounded-lg appearance-none cursor-pointer self-center ${
              isMobile ? "h-2 py-2" : "h-1.5"
            }`}
          />
          <input
            type="number"
            min="1"
            max="5000"
            value={activeRawWeightG}
            onChange={(e) => {
              let val = parseFloat(e.target.value);
              if (isNaN(val)) val = 1;
              if (val < 1) val = 1;
              onUpdateData(id, { activeRawWeightG: val });
            }}
            className={`bg-zinc-805 border border-zinc-705 text-zinc-105 rounded text-center text-xs font-mono py-1 focus:outline-none focus:border-indigo-500 ${
              isMobile ? "w-16 py-2 rounded-lg" : "w-16"
            }`}
          />
        </div>
      </div>

      {/* Batch stats details */}
      <div className={`flex flex-col gap-1.5 bg-zinc-900/40 p-2.5 border border-zinc-800/50 text-xs ${isMobile ? "rounded-xl p-3" : "rounded"}`}>
        <div className="flex justify-between">
          <span className="text-zinc-500">{t('card_active_share')}</span>
          <span className="font-mono text-zinc-300 font-semibold">
            {calculatedResults.activePercentage.toFixed(1)}%
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-zinc-500">{t('card_rec_tablet_weight')}</span>
          <span className="font-mono text-zinc-300 font-semibold">
            {recommendedWeightMg.toFixed(2)} {t('unit_mg')}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-zinc-500">{t('card_tablets_count')}</span>
          <span className="font-mono text-indigo-400 font-bold">
            {totalTablets.toLocaleString()} {t('unit_pcs')}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-zinc-500">{t('card_total_batch_weight')}</span>
          <span className="font-mono text-zinc-300 font-semibold">
            {totalBatchWeightKg.toFixed(4)} {t('unit_kg')}
          </span>
        </div>
      </div>

      {/* Regulatory and Safety Warnings related to final product */}
      {calculatedResults.warnings.length > 0 && (
        <div className="flex flex-col gap-1.5">
          {calculatedResults.warnings.map((w, idx) => (
            <div key={idx} className={`p-2 bg-red-500/5 border border-red-500/10 text-red-400 flex items-start gap-1.5 leading-normal ${isMobile ? "p-2.5 rounded-lg text-[10.5px]" : "rounded text-[10px]"}`}>
              <AlertTriangle size={isMobile ? 13 : 12} className="shrink-0 mt-0.5" />
              <span>{w.message}</span>
            </div>
          ))}
        </div>
      )}

      {/* Allergens warning in FALCPA format */}
      {formattedAllergens.length > 0 && (
        <div className={`p-2 bg-amber-500/5 border border-amber-500/10 text-amber-400 flex items-start gap-1.5 leading-normal ${isMobile ? "p-2.5 rounded-lg text-[10.5px]" : "rounded text-[10px]"}`}>
          <AlertTriangle size={isMobile ? 13 : 12} className="shrink-0 mt-0.5" />
          <span>
            <strong>Contains:</strong> {formattedAllergens.join(', ')} ({t('allergen_compliance')}).
          </span>
        </div>
      )}

      {/* Packaging Protocol Section */}
      <div className="bg-zinc-900/60 p-3 rounded-xl border border-zinc-800/85 flex flex-col gap-2">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
          <span className="text-xs font-bold text-zinc-200 flex items-center gap-1.5">
            📦 {t('card_packaging_protocol') || 'Протокол упаковки'}
          </span>
        </div>
        {tariff === 'hobby' ? (
          <div className={`bg-indigo-500/5 border border-indigo-500/10 flex flex-col gap-2 items-center text-center ${isMobile ? "p-3 rounded-xl gap-2.5" : "p-3 rounded"}`}>
            <p className="text-[10px] text-zinc-400 leading-normal font-light">
              🔒 {t('card_packaging_locked') || 'Протокол упаковки доступен только в тарифе Professional.'}
            </p>
            <button
              onClick={onUpgradeClick}
              className={`w-full bg-indigo-500 hover:bg-indigo-600 active:bg-indigo-700 text-white font-bold transition-all cursor-pointer ${
                isMobile ? "py-2 text-xs rounded-lg shadow-md" : "py-1.5 px-3 text-[10px] rounded shadow"
              }`}
            >
              {t('card_upgrade_pro')}
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-1.5 text-[10px]">
            {packagingRecs.map((rec, idx) => {
              let icon = '📦';
              if (rec.type === 'moisture_protection') icon = '💧';
              else if (rec.type === 'light_protection') icon = '🔆';
              else if (rec.type === 'heat_protection') icon = '🌡️';
              return (
                <div key={idx} className="bg-zinc-950/45 p-2 rounded border border-zinc-850 flex flex-col gap-0.5 text-zinc-350">
                  <span className="font-bold text-zinc-200 flex items-center gap-1">
                    <span>{icon}</span>
                    <span>{rec.message}</span>
                  </span>
                  <span className="text-[9px] text-zinc-500 leading-normal">{rec.details}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Formula Score Section */}
      {formulaScore && (
        <div className="bg-zinc-900/60 p-3 rounded-xl border border-zinc-800/85 flex flex-col gap-2.5">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
            <span className="text-xs font-bold text-zinc-200 flex items-center gap-1.5">
              ⚖️ {t('card_formula_score_title') || 'Качество рецептуры'}
            </span>
            <div className={`flex items-center gap-1 px-2 py-0.5 rounded border ${
              formulaScore.totalScore > 70 
                ? 'bg-emerald-550/10 border-emerald-500/25 text-emerald-400' 
                : formulaScore.totalScore >= 40 
                  ? 'bg-amber-500/10 border-amber-500/25 text-amber-400' 
                  : 'bg-rose-500/10 border-rose-500/25 text-rose-400'
            }`}>
              <span className="text-xs font-extrabold font-mono">
                {formulaScore.totalScore.toFixed(1)}/100
              </span>
            </div>
          </div>

          {/* Breakdown per ingredient */}
          <div className="flex flex-col gap-1.5">
            <span className="text-[10px] text-zinc-500 font-medium">
              {t('card_formula_score_breakdown') || 'Вклад ингредиентов (Breakdown):'}
            </span>
            <div className="flex flex-col gap-2 text-[10px]">
              {formulaScore.breakdown.map((item, idx) => (
                <div key={idx} className="flex flex-col gap-1">
                  <div className="flex justify-between text-[9px] text-zinc-400">
                    <span className="truncate max-w-[150px]">{item.ingredientName}</span>
                    <span className="font-mono text-zinc-300">+{item.score.toFixed(1)}</span>
                  </div>
                  {/* Mini Progress Bar */}
                  <div className="w-full bg-zinc-950 rounded-full h-1 overflow-hidden border border-zinc-850">
                    <div 
                      className="bg-indigo-500 h-full rounded-full" 
                      style={{ width: `${item.score}%` }} 
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      {/* Process Validation Section */}
      {processType && (
        <div className="bg-zinc-900/60 p-3 rounded-xl border border-zinc-800/85 flex flex-col gap-2.5">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
            <span className="text-xs font-bold text-zinc-200 flex items-center gap-1.5">
              ⚙️ {t('card_process_validation_title') || 'Валидация техпроцесса'}
            </span>
            <span className="text-[10px] uppercase font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-1.5 py-0.5 rounded font-mono">
              {String(processType).replace(/_/g, ' ')}
            </span>
          </div>

          {processValidation && (
            <div className="flex flex-col gap-1.5 text-[10px]">
              {processValidation.warnings.map((warn, idx) => (
                <div key={idx} className="p-2 bg-red-500/5 border border-red-500/10 text-red-400 flex items-start gap-1.5 rounded leading-normal">
                  <AlertTriangle size={12} className="shrink-0 mt-0.5" />
                  <span>{warn}</span>
                </div>
              ))}
              {processValidation.recommendations.map((rec, idx) => (
                <div key={idx} className="p-2 bg-indigo-500/5 border border-indigo-500/10 text-indigo-400 flex items-start gap-1.5 rounded leading-normal">
                  <AlertTriangle size={12} className="shrink-0 mt-0.5" />
                  <span>{rec}</span>
                </div>
              ))}
              {processValidation.isValid && processValidation.warnings.length === 0 && (
                <div className="p-2 bg-emerald-500/5 border border-emerald-500/10 text-emerald-400 flex items-center gap-1.5 rounded">
                  <span>✅</span>
                  <span>{t('process_validation_compatible') || 'Техпроцесс полностью совместим с составом'}</span>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Premium Recipe Analysis/Scoring Panel */}
      {calculatedResults.scoring && (
        <div className="bg-zinc-900/60 p-3 rounded-xl border border-zinc-800/85 flex flex-col gap-2.5">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
            <span className="text-xs font-bold text-zinc-200 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              {t('card_recipe_analysis')}
            </span>
            <div className="flex items-center gap-1 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/25">
              <span className="text-[10px] text-zinc-400 font-medium">{t('card_overall_rating')}</span>
              <span className="text-xs font-extrabold text-indigo-400 font-mono">
                {calculatedResults.scoring.score}/100
              </span>
            </div>
          </div>

          {/* Score component values */}
          <div className="grid grid-cols-4 gap-1.5 text-center text-[9px] text-zinc-400">
            <div className="bg-zinc-950/40 p-1 rounded border border-zinc-850">
              <span className="block text-zinc-500">{t('card_score_benefit')}</span>
              <span className="font-mono font-bold text-emerald-400">{calculatedResults.scoring.benefitScore}</span>
            </div>
            <div className="bg-zinc-950/40 p-1 rounded border border-zinc-850">
              <span className="block text-zinc-500">{t('card_score_stability')}</span>
              <span className="font-mono font-bold text-indigo-400">{calculatedResults.scoring.stabilityScore}</span>
            </div>
            <div className="bg-zinc-950/40 p-1 rounded border border-zinc-850">
              <span className="block text-zinc-500">{t('card_score_manufacturability')}</span>
              <span className="font-mono font-bold text-amber-400">{calculatedResults.scoring.manufacturabilityScore}</span>
            </div>
            <div className="bg-zinc-950/40 p-1 rounded border border-zinc-850">
              <span className="block text-zinc-500">{t('card_score_risks')}</span>
              <span className="font-mono font-bold text-rose-400">{calculatedResults.scoring.riskScore}</span>
            </div>
          </div>

          {/* Overdoses warnings */}
          {calculatedResults.scoring.overdoses.length > 0 && (
            <div className="bg-rose-500/10 border border-rose-500/25 p-2 rounded-lg text-[10px] text-rose-455 flex flex-col gap-1">
              <span className="font-bold flex items-center gap-1">
                <AlertTriangle size={12} />
                {t('card_overdose_title')}
              </span>
              {calculatedResults.scoring.overdoses.map((o, idx) => (
                <div key={idx} className="font-mono text-[9px]">
                  • {o.name}: {o.doseMg.toFixed(1)} mg ({o.maxDoseMg} mg max)
                </div>
              ))}
            </div>
          )}

          {/* Penalty details list */}
          {calculatedResults.scoring.penalties.length > 0 && (
            <div className="flex flex-col gap-1 bg-zinc-950/30 p-2 rounded-lg border border-zinc-850/60 text-[9px] text-zinc-400">
              <span className="font-bold text-zinc-500 uppercase tracking-wide text-[8px]">{t('card_penalties_title')}</span>
              {calculatedResults.scoring.penalties.map((p, idx) => (
                <div key={idx} className="flex justify-between gap-2">
                  <span className="truncate max-w-[200px] leading-tight">• {p.reason}</span>
                  <span className="font-mono text-rose-455">-{p.deduction}</span>
                </div>
              ))}
            </div>
          )}

          {/* Aggregated Effects */}
          {calculatedResults.scoring.aggregatedEffects.length > 0 && (
            <div className="flex flex-col gap-1 text-[10px]">
              <span className="text-zinc-550 font-medium">{t('card_aggregated_effects')}</span>
              <div className="flex flex-wrap gap-1">
                {calculatedResults.scoring.aggregatedEffects.map((eff, idx) => (
                  <span key={idx} className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-1.5 py-0.5 rounded text-[9px]">
                    {eff}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Aggregated Contraindications */}
          {calculatedResults.scoring.aggregatedContraindications.length > 0 && (
            <div className="flex flex-col gap-1 text-[10px]">
              <span className="text-zinc-550 font-medium">{t('card_aggregated_contraindications')}</span>
              <div className="flex flex-col gap-0.5 text-amber-500/95 font-sans">
                {calculatedResults.scoring.aggregatedContraindications.map((contra, idx) => (
                  <div key={idx} className="flex items-center gap-1">
                    <span className="w-1 h-1 rounded-full bg-amber-500" />
                    <span>{contra}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Aggregated Side Effects */}
          {calculatedResults.scoring.aggregatedSideEffects.length > 0 && (
            <div className="flex flex-col gap-1.5 text-[10px]">
              <span className="text-zinc-550 font-medium">{t('card_side_effects_label')}</span>
              <div className="grid grid-cols-2 gap-1.5 font-mono text-[9px]">
                {calculatedResults.scoring.aggregatedSideEffects.map((se, idx) => {
                  let dotColor = 'bg-green-500';
                  if (se.severity === 'medium') dotColor = 'bg-amber-500';
                  if (se.severity === 'high') dotColor = 'bg-rose-500';

                  return (
                    <div key={idx} className="flex items-center justify-between bg-zinc-950/45 p-1 rounded border border-zinc-850 text-zinc-300">
                      <span className="flex items-center gap-1 truncate max-w-[100px]">
                        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotColor}`} />
                        {se.name}
                      </span>
                      <span className="text-zinc-550 shrink-0 text-[8px]">({se.frequency})</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Dynamic FDA/EFSA Label Design Box */}
      <div className={`bg-zinc-950 p-2.5 border border-zinc-850 text-[9px] font-sans flex flex-col gap-1.5 ${isMobile ? "p-3.5 rounded-xl" : "rounded"}`}>
        <div className="border-b border-zinc-800 pb-1 text-center font-bold text-zinc-300 uppercase tracking-wider text-[10px]">
          {t('supplement_type')}
        </div>
        <div className="flex justify-between font-mono text-zinc-400">
          <span>Serving Size:</span>
          <span>1 Tablet</span>
        </div>
        <div className="border-t border-b border-zinc-800 py-1 flex justify-between font-bold text-zinc-300">
          <span>Active ingredients:</span>
          <span>
            {recommendedWeightMg > 0 
              ? (recommendedWeightMg * (calculatedResults.activePercentage / 100)).toFixed(2) 
              : 0} mg
          </span>
        </div>
        <div className="text-[8px] text-zinc-500 leading-normal italic text-center border-t border-zinc-800/50 pt-1">
          {region === 'US' ? (
            '* These statements have not been evaluated by the Food and Drug Administration. This product is not intended to diagnose, treat, cure, or prevent any disease.'
          ) : (
            '* This food supplement is not a substitute for a varied and balanced diet and a healthy lifestyle.'
          )}
        </div>
      </div>

      {/* Export GMP Report Button */}
      <button
        onClick={async () => {
          const hasAccessToPdf = tariff === 'professional';
          if (!hasAccessToPdf) {
            if (onUpgradeClick) onUpgradeClick();
          } else {
            await generateGMPReport(nodes || [node], calculatedResults, user, region, allIngredients);
          }
        }}
        className={`w-full py-2 px-3 text-xs font-bold rounded shadow transition-all cursor-pointer flex justify-center items-center gap-1.5 ${
          tariff !== 'professional'
            ? 'bg-zinc-800 text-zinc-400 hover:text-zinc-300 border border-zinc-700/50'
            : 'bg-indigo-500 hover:bg-indigo-600 text-white'
        } ${isMobile ? "py-2.5 rounded-lg shadow-md gap-2" : ""}`}
      >
        {t('card_export_gmp')}
        {tariff !== 'professional' && (
          <span className="text-[9px] bg-zinc-700 px-1.5 py-0.5 rounded text-zinc-400 font-semibold uppercase tracking-wider scale-90">
            Pro
          </span>
        )}
      </button>
    </div>
  );
};
