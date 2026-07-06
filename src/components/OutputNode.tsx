"use client";

import React from 'react';
import { FileText, Sparkles, AlertTriangle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from '../context/I18nContext';
import { CalculatedResults } from '../hooks/useNodeEditor';
import { generateGMPReport } from '../lib/pdfGenerator';
import { EditorNode, Ingredient } from '../types/pharm';
import { getPackagingRecommendations, calculateFormulaScore, validateProcessCompatibility } from '../lib/calculator';
import { REGULATORY_LIMITS } from '../lib/regulatoryLimits';

interface OutputNodeProps {
  node: EditorNode;
  nodes?: EditorNode[];
  calculatedResults: CalculatedResults;
  tariff: 'hobby' | 'professional';
  onUpdateData: (nodeId: string, data: Partial<EditorNode['data']>) => void;
  onUpgradeClick?: () => void;
  allIngredients: Ingredient[];
  isMobile?: boolean;
  onAddTechNode?: (type: 'granulator' | 'capsulator' | 'press') => void;
  onRemove?: (nodeId: string) => void;
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
  onAddTechNode,
  onRemove,
}) => {
  const { id, data } = node;
  const { user } = useAuth();
  const { t, setLocale, locale } = useTranslation();

  const activeRawWeightG = data.activeRawWeightG ?? 10;
  const region = String(data.region ?? 'US');
  const formType = (data.formType as 'tablet' | 'capsule') || 'tablet';
  const { recommendedWeightMg } = calculatedResults.tableting;
  const { totalTablets, totalBatchWeightKg } = calculatedResults.batch;
  const isRu = locale === 'ru-RU';
  const market = (data.market as 'usa' | 'eu' | 'both') || 'both';
  const servingsPerDay = Number(data.servingsPerDay ?? 1);
  const regulatoryWarnings = calculatedResults.regulatoryWarnings || [];

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

      {/* Dosage Form Selector */}
      <div className={`flex items-center justify-between text-[11px] bg-zinc-800/30 p-2 border border-zinc-800/50 text-zinc-100 ${isMobile ? "rounded-xl" : "rounded"}`}>
        <span className="text-zinc-400 font-medium ml-1">
          {locale === 'ru-RU' ? 'Форма выпуска' : 'Dosage Form'}
        </span>
        <div className="flex bg-zinc-900 rounded p-0.5 border border-zinc-850">
          <button
            onClick={() => onUpdateData(id, { formType: 'tablet' })}
            className={`px-3 py-0.5 rounded text-[10px] font-bold transition-all cursor-pointer ${
              formType === 'tablet' 
                ? 'bg-zinc-850 text-indigo-400 font-semibold' 
                : 'text-zinc-500 hover:text-zinc-400'
            } ${isMobile ? "px-4 py-1 rounded-md" : ""}`}
          >
            {locale === 'ru-RU' ? 'Таблетка' : 'Tablet'}
          </button>
          <button
            onClick={() => onUpdateData(id, { formType: 'capsule' })}
            className={`px-3 py-0.5 rounded text-[10px] font-bold transition-all cursor-pointer ${
              formType === 'capsule' 
                ? 'bg-zinc-850 text-indigo-400 font-semibold' 
                : 'text-zinc-500 hover:text-zinc-400'
            } ${isMobile ? "px-4 py-1 rounded-md" : ""}`}
          >
            {locale === 'ru-RU' ? 'Капсула' : 'Capsule'}
          </button>
        </div>
      </div>

      {/* Batch stats details or Capsule fit details */}
      {formType === 'tablet' ? (
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
      ) : (
        <div className="flex flex-col gap-2">
          {/* Capsule fit details */}
          <div className={`flex flex-col gap-1.5 bg-zinc-900/40 p-2.5 border border-zinc-800/50 text-xs ${isMobile ? "rounded-xl p-3" : "rounded"}`}>
            <div className="flex justify-between">
              <span className="text-zinc-500">
                {locale === 'ru-RU' ? 'Рекомендуемый размер капсулы:' : 'Recommended size:'}
              </span>
              <span className="font-mono text-indigo-400 font-bold">
                {calculatedResults.dosageFormFit.recommendedCapsuleSize || (locale === 'ru-RU' ? 'Нет' : 'None')}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">
                {locale === 'ru-RU' ? 'Заполнение капсулы:' : 'Capsule fill:'}
              </span>
              <span className="font-mono text-zinc-300 font-semibold">
                {calculatedResults.dosageFormFit.fillPercentage.toFixed(1)}%
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">
                {locale === 'ru-RU' ? 'Объем смеси:' : 'Blend volume:'}
              </span>
              <span className="font-mono text-zinc-300 font-semibold">
                {calculatedResults.dosageFormFit.volumeMl.toFixed(4)} {t('unit_ml') || 'мл'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">
                {locale === 'ru-RU' ? 'Количество капсул на дозу:' : 'Capsules per dose:'}
              </span>
              <span className="font-mono text-zinc-300 font-semibold">
                {calculatedResults.dosageFormFit.capsuleCount}
              </span>
            </div>
          </div>

          {/* Capsule fill visualization & alternative sizes / alerts */}
          <div className={`flex items-stretch gap-3 bg-zinc-900/40 p-3 border border-zinc-800/50 ${isMobile ? "rounded-xl" : "rounded"}`}>
            <div className="flex flex-col items-center justify-center shrink-0 w-16 bg-zinc-950/50 p-2 border border-zinc-850 rounded-lg">
              {(() => {
                const fillPct = calculatedResults.dosageFormFit.fillPercentage;
                let colorClass = 'text-emerald-400';
                if (fillPct > 95) {
                  colorClass = 'text-rose-455';
                } else if (fillPct > 80) {
                  colorClass = 'text-amber-400';
                }
                return (
                  <svg width="24" height="48" viewBox="0 0 24 48" className="overflow-visible">
                    <rect x="2" y="2" width="20" height="44" rx="10" fill="none" stroke="currentColor" strokeWidth="2" className="text-zinc-700" />
                    <mask id="capsule-fill-mask">
                      <rect x="3" y="3" width="18" height="42" rx="9" fill="white" />
                    </mask>
                    <rect 
                      x="3" 
                      y={3 + 42 * (1 - Math.min(100, fillPct) / 100)} 
                      width="18" 
                      height={42 * (Math.min(100, fillPct) / 100)} 
                      mask="url(#capsule-fill-mask)" 
                      className={colorClass} 
                      fill="currentColor"
                    />
                    <line x1="2" y1="24" x2="22" y2="24" stroke="var(--surface)" strokeWidth="1.5" />
                  </svg>
                );
              })()}
              <span className="text-[9px] text-zinc-500 font-medium mt-1 font-mono">
                {calculatedResults.dosageFormFit.fillPercentage.toFixed(0)}%
              </span>
            </div>

            <div className="flex-1 flex flex-col justify-center gap-1.5 text-[10px]">
              {/* Warnings (if any, e.g. "needs splitting") */}
              {calculatedResults.dosageFormFit.warnings.map((warn, idx) => (
                <div key={idx} className="p-2 bg-amber-500/5 border border-amber-500/10 text-amber-400 flex items-start gap-1.5 rounded leading-normal font-medium">
                  <AlertTriangle size={12} className="shrink-0 mt-0.5" />
                  <span>{warn}</span>
                </div>
              ))}

              {/* Alternative sizes */}
              {calculatedResults.dosageFormFit.alternativeSizes.length > 0 ? (
                <div className="flex flex-col gap-1">
                  <span className="text-zinc-500 font-semibold text-[8px] uppercase tracking-wider">
                    {locale === 'ru-RU' ? 'Другие варианты капсул:' : 'Alternative sizes:'}
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {calculatedResults.dosageFormFit.alternativeSizes.slice(0, 3).map((alt, idx) => (
                      <span key={idx} className="bg-zinc-950/60 px-1.5 py-0.5 rounded border border-zinc-850 text-zinc-400 font-mono text-[9px]">
                        {alt.size}: {alt.fillPercentage.toFixed(0)}%
                      </span>
                    ))}
                  </div>
                </div>
              ) : (
                calculatedResults.dosageFormFit.fitsInSingleCapsule && (
                  <span className="text-zinc-500 italic text-[9px]">
                    {locale === 'ru-RU' ? 'Других подходящих размеров нет' : 'No alternative sizes fit'}
                  </span>
                )
              )}
            </div>
          </div>
        </div>
      )}

      {/* Regulatory and Safety Warnings related to final product */}
      {calculatedResults.warnings.length > 0 && (
        <div className="flex flex-col gap-1.5">
          {calculatedResults.warnings.map((w, idx) => {
            const isCarrIndexWarning = w.message.includes('Carr Index') || w.message.includes('flowability');
            const ingNode = (nodes || []).find(n => n.type === 'ingredient' && String(n.data.ingredientId) === String(w.ingredientId));
            const ing = allIngredients.find(i => String(i.id) === String(w.ingredientId));

            return (
              <div key={idx} className={`p-2.5 bg-red-500/5 border border-red-500/10 text-red-400 flex flex-col gap-1.5 leading-normal ${isMobile ? "rounded-lg text-[10.5px]" : "rounded text-[10px]"}`}>
                <div className="flex items-start gap-1.5">
                  <AlertTriangle size={isMobile ? 13 : 12} className="shrink-0 mt-0.5" />
                  <span>{w.message}</span>
                </div>
                {isCarrIndexWarning && onAddTechNode && (
                  <button
                    onClick={() => onAddTechNode('granulator')}
                    className={
                      isMobile
                        ? "mt-1 px-3 py-1.5 bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 active:bg-indigo-500/30 text-[10px] font-bold rounded-lg border border-indigo-500/30 transition-colors cursor-pointer self-start"
                        : "mt-1 self-start px-2 py-0.5 bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/30 text-[9px] font-semibold rounded border border-indigo-500/30 transition-colors cursor-pointer"
                    }
                  >
                    {isRu ? 'Добавить гранулятор' : 'Add Granulator Node'}
                  </button>
                )}
                {w.type === 'limit' && w.ingredientId && ing && ingNode && (
                  <button
                    onClick={() => onUpdateData(ingNode.id, { percentage: ing.maxSafePercentage })}
                    className={
                      isMobile
                        ? "mt-1 px-3 py-1.5 bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 active:bg-indigo-500/30 text-[10px] font-bold rounded-lg border border-indigo-500/30 transition-colors cursor-pointer self-start"
                        : "mt-1 self-start px-2 py-0.5 bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/30 text-[9px] font-semibold rounded border border-indigo-500/30 transition-colors cursor-pointer"
                    }
                  >
                    {isRu ? `Снизить долю до ${ing.maxSafePercentage}%` : `Reduce share to ${ing.maxSafePercentage}%`}
                  </button>
                )}
              </div>
            );
          })}
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

      {/* ── Regulatory Compliance Section (Задача 4.3) ── */}
      <div className="bg-zinc-900/60 p-3 rounded-xl border border-zinc-800/85 flex flex-col gap-2.5">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
          <span className="text-xs font-bold text-zinc-200 flex items-center gap-1.5">
            🛡️ {isRu ? 'Регуляторный комплаенс' : 'Regulatory Compliance'}
          </span>
        </div>

        {/* Market Selector */}
        <div className="flex items-center justify-between text-[10px]">
          <span className="text-zinc-500 font-semibold uppercase tracking-wider">
            {isRu ? 'Рынок сбыта:' : 'Target Market:'}
          </span>
          <div className="flex bg-zinc-950 rounded p-0.5 border border-zinc-850">
            <button
              onClick={() => onUpdateData(id, { market: 'usa' })}
              className={`px-2 py-0.5 rounded text-[9px] font-bold transition-all cursor-pointer ${
                market === 'usa'
                  ? 'bg-zinc-850 text-indigo-400 font-semibold'
                  : 'text-zinc-500 hover:text-zinc-400'
              }`}
            >
              🇺🇸 US
            </button>
            <button
              onClick={() => onUpdateData(id, { market: 'eu' })}
              className={`px-2 py-0.5 rounded text-[9px] font-bold transition-all cursor-pointer ${
                market === 'eu'
                  ? 'bg-zinc-850 text-indigo-400 font-semibold'
                  : 'text-zinc-500 hover:text-zinc-400'
              }`}
            >
              🇪🇺 EU
            </button>
            <button
              onClick={() => onUpdateData(id, { market: 'both' })}
              className={`px-2 py-0.5 rounded text-[9px] font-bold transition-all cursor-pointer ${
                market === 'both'
                  ? 'bg-zinc-850 text-indigo-400 font-semibold'
                  : 'text-zinc-500 hover:text-zinc-400'
              }`}
            >
              {isRu ? 'Оба' : 'Both'}
            </button>
          </div>
        </div>

        {/* Servings per day input */}
        <div className="flex items-center justify-between text-[10px]">
          <span className="text-zinc-550 font-semibold uppercase tracking-wider">
            {isRu ? 'Приёмов в день:' : 'Servings per day:'}
          </span>
          <input
            type="number"
            min="1"
            max="10"
            value={servingsPerDay}
            onChange={(e) => {
              let val = parseInt(e.target.value, 10);
              if (isNaN(val) || val < 1) val = 1;
              onUpdateData(id, { servingsPerDay: val });
            }}
            className="w-12 bg-zinc-950 border border-zinc-850 text-zinc-200 text-center font-mono text-[10px] py-0.5 rounded focus:outline-none focus:border-indigo-500"
          />
        </div>

        {/* Compliance Warnings List */}
        <div className="flex flex-col gap-1.5 mt-1">
          {regulatoryWarnings.length > 0 ? (
            regulatoryWarnings.map((w, idx) => {
              const isNovelOrGras = w.message.includes('Novel Food') || w.message.includes('GRAS');
              
              let styleClass = '';
              let badge = '';

              if (w.severity === 'error') {
                styleClass = 'bg-red-500/5 border-red-550/30 text-red-400';
                badge = '🔴';
              } else if (isNovelOrGras) {
                styleClass = 'bg-violet-500/5 border-violet-550/30 text-violet-400';
                badge = '🟣';
              } else {
                styleClass = 'bg-amber-500/5 border-amber-550/30 text-amber-400';
                badge = '🟡';
              }

              const ingNode = (nodes || []).find(n => n.type === 'ingredient' && String(n.data.ingredientId) === String(w.ingredientId));
              const ing = allIngredients.find(i => String(i.id) === String(w.ingredientId));
              
              let safePct: number | null = null;
              if (w.type === 'limit' && w.ingredientId && ing && ingNode && recommendedWeightMg > 0) {
                // Find regulatory limit item
                const limitItem = REGULATORY_LIMITS.find(r => {
                  if (r.casNumber && ing.casNumber && r.casNumber === ing.casNumber) return true;
                  return r.ingredientName.toLowerCase() === ing.name.toLowerCase() || 
                         (r.synonyms && r.synonyms.some(s => s.toLowerCase() === ing.name.toLowerCase()));
                });
                
                if (limitItem) {
                  let ul: number | null = null;
                  if (market === 'usa') {
                    ul = limitItem.fdaUlMgPerDay;
                  } else if (market === 'eu') {
                    ul = limitItem.efsaUlMgPerDay;
                  } else {
                    // Both
                    const fda = limitItem.fdaUlMgPerDay;
                    const efsa = limitItem.efsaUlMgPerDay;
                    if (fda !== null && efsa !== null) ul = Math.min(fda, efsa);
                    else if (fda !== null) ul = fda;
                    else if (efsa !== null) ul = efsa;
                  }
                  
                  if (ul !== null) {
                    // Calculate safe percentage: percentage = (ul / (recommendedWeightMg * servingsPerDay)) * 100
                    const rawPct = (ul / (recommendedWeightMg * servingsPerDay)) * 100;
                    // Provide a 0.5% buffer to prevent rounding issues causing it to hover on edge
                    safePct = Math.floor(rawPct * 99.5) / 100;
                    if (safePct < 0.001) safePct = 0.001;
                    if (safePct > 100) safePct = 100;
                  }
                }
              }

              return (
                <div key={idx} className={`p-2 border rounded-lg text-[9px] leading-normal flex flex-col gap-0.5 ${styleClass}`}>
                  <span className="font-bold flex items-center gap-1">
                    <span>{badge}</span>
                    <span>{w.message}</span>
                  </span>
                  {w.suggestion && (
                    <span className="text-zinc-500 text-[8px] pl-4">{w.suggestion}</span>
                  )}
                  {safePct !== null && ingNode && (
                    <button
                      onClick={() => onUpdateData(ingNode.id, { percentage: safePct! })}
                      className={
                        isMobile
                          ? "mt-1.5 px-3 py-1.5 bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 active:bg-indigo-500/30 text-[10px] font-bold rounded-lg border border-indigo-500/30 transition-colors cursor-pointer self-start"
                          : "mt-1.5 self-start px-2 py-0.5 bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/30 text-[9px] font-semibold rounded border border-indigo-500/30 transition-colors cursor-pointer"
                      }
                    >
                      {isRu ? `Снизить долю до ${safePct.toFixed(2)}%` : `Reduce share to ${safePct.toFixed(2)}%`}
                    </button>
                  )}
                  {isNovelOrGras && ingNode && onRemove && (
                    <button
                      onClick={() => onRemove(ingNode.id)}
                      className={
                        isMobile
                          ? "mt-1.5 px-3 py-1.5 bg-rose-500/10 text-rose-450 hover:bg-rose-500/20 active:bg-rose-500/30 text-[10px] font-bold rounded-lg border border-rose-500/30 transition-colors cursor-pointer self-start"
                          : "mt-1.5 self-start px-2 py-0.5 bg-rose-500/20 text-rose-350 hover:bg-rose-500/30 text-[9px] font-semibold rounded border border-rose-500/30 transition-colors cursor-pointer"
                      }
                    >
                      {isRu ? 'Удалить ингредиент' : 'Remove ingredient'}
                    </button>
                  )}
                </div>
              );
            })
          ) : (
            <div className="p-2 bg-emerald-500/5 border border-emerald-500/10 text-emerald-400 flex items-center justify-center gap-1.5 rounded text-[10px] font-semibold text-center">
              <span>✅</span>
              <span>
                {isRu 
                  ? 'Формула соответствует требованиям FDA/EFSA' 
                  : 'Formula complies with FDA/EFSA standards'}
              </span>
            </div>
          )}
        </div>
      </div>

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
