"use client";

import React from 'react';
import { Trash2, AlertTriangle } from 'lucide-react';
import { useTranslation } from '../context/I18nContext';
import { EditorNode, Ingredient, CompatibilityWarning } from '../types/pharm';

interface IngredientNodeProps {
  id: string;
  data: EditorNode['data'];
  allIngredients: Ingredient[];
  onUpdateData: (nodeId: string, data: Partial<EditorNode['data']>) => void;
  onRemove: (nodeId: string) => void;
  nodeWarnings: CompatibilityWarning[];
  isMobile?: boolean;
}

export const IngredientNode: React.FC<IngredientNodeProps> = ({
  id,
  data,
  allIngredients,
  onUpdateData,
  onRemove,
  nodeWarnings,
  isMobile = false,
}) => {
  const { t } = useTranslation();
  const ingredient = allIngredients.find(ing => String(ing.id) === String(data.ingredientId));

  if (!ingredient) {
    return <div className="p-4 text-rose-400">{t('card_ingredient_not_found')}</div>;
  }

  const percentage = data.percentage ?? 0;

  // Dynamic styling for role badge
  let roleBadgeColor = 'bg-zinc-800/50 text-zinc-400 border-zinc-700/50';
  if (ingredient.role === 'active') roleBadgeColor = 'bg-rose-500/10 text-rose-400 border-rose-500/20';
  else if (ingredient.role === 'dry-binder') roleBadgeColor = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
  else if (ingredient.role === 'lubricant') roleBadgeColor = 'bg-amber-500/10 text-amber-400 border-amber-500/20';
  else if (ingredient.role === 'glidant') roleBadgeColor = 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20';

  return (
    <div className={isMobile ? "flex flex-col gap-4" : "flex flex-col gap-3 p-4"}>
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-semibold text-zinc-100 pr-6 text-sm md:text-base leading-tight">
            {t(ingredient.name)}
          </h3>
          <div className={`flex gap-2 items-center mt-1 flex-wrap`}>
            <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded border ${roleBadgeColor}`}>
              {ingredient.role}
            </span>
            {ingredient.regulatoryInfo?.pharmacopoeiaGrade && (
              <span className="text-[10px] uppercase font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-1.5 py-0.5 rounded">
                {ingredient.regulatoryInfo.pharmacopoeiaGrade}
              </span>
            )}
            <span className="text-[10px] text-zinc-550 font-mono">
              CAS: {ingredient.casNumber}
            </span>
          </div>
        </div>
        <button
          onClick={() => onRemove(id)}
          className={
            isMobile
              ? "text-zinc-550 hover:text-rose-400 transition-colors p-2 rounded-lg bg-zinc-800/40 border border-zinc-800 active:bg-zinc-800"
              : "text-zinc-500 hover:text-rose-400 transition-colors p-1 rounded hover:bg-zinc-800/50"
          }
          title={t('card_remove_ingredient')}
        >
          <Trash2 size={16} />
        </button>
      </div>

      {/* Stability Profile Panel */}
      {ingredient.stabilityProfile && (
        <div className="bg-zinc-900/40 p-2 border border-zinc-800/60 rounded flex items-center justify-around text-[10px] text-zinc-400 font-mono">
          <div>
            <span className="text-zinc-550 mr-1">pH:</span>
            <span className="text-zinc-300">{ingredient.stabilityProfile.ph !== null ? ingredient.stabilityProfile.ph.toFixed(1) : '—'}</span>
          </div>
          <div className="border-l border-zinc-800/60 h-3" />
          <div>
            <span className="text-zinc-550 mr-1">Hygro:</span>
            <span className="text-zinc-300">{ingredient.stabilityProfile.hygroscopicity}%</span>
          </div>
          <div className="border-l border-zinc-800/60 h-3" />
          <div>
            <span className="text-zinc-550 mr-1">Light:</span>
            <span className="text-zinc-300">{ingredient.stabilityProfile.lightSensitive ? '⚠️' : '✅'}</span>
          </div>
          <div className="border-l border-zinc-800/60 h-3" />
          <div>
            <span className="text-zinc-550 mr-1">Heat:</span>
            <span className="text-zinc-300">{ingredient.stabilityProfile.heatDegradation !== null ? `${ingredient.stabilityProfile.heatDegradation}°C` : '—'}</span>
          </div>
        </div>
      )}

      <div className="mt-1">
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs text-zinc-400">{t('card_input_percentage')}</span>
          <span className="text-sm font-semibold text-zinc-100 font-mono">
            {percentage}%
          </span>
        </div>
        <div className="flex gap-2 items-center">
          <input
            type="range"
            min="0"
            max="100"
            step="0.5"
            value={percentage}
            onChange={(e) => onUpdateData(id, { percentage: parseFloat(e.target.value) || 0 })}
            className={`flex-1 accent-indigo-500 bg-zinc-800 rounded-lg appearance-none cursor-pointer ${
              isMobile ? "h-2 py-2" : "h-1.5"
            }`}
          />
          <input
            type="number"
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
            className={`bg-zinc-800 border border-zinc-700 text-zinc-100 rounded text-center text-xs font-mono py-1 focus:outline-none focus:border-indigo-500 ${
              isMobile ? "w-16 py-2 rounded-lg" : "w-14"
            }`}
          />
        </div>
      </div>

      <div className="mt-1 pt-2 border-t border-zinc-800/60 text-[11px]">
        {ingredient.dilutionScale ? (
          <div className="flex flex-col gap-1.5 text-zinc-400">
            <div className="flex justify-between items-center">
              <span className="text-zinc-550">{t('card_dilution_scale')}:</span>
              <span className="font-semibold text-zinc-200 font-mono bg-indigo-500/10 px-1.5 py-0.5 rounded border border-indigo-500/20">{ingredient.dilutionScale}</span>
            </div>
            {ingredient.source && (
              <div className="flex justify-between">
                <span className="text-zinc-550">{t('card_source')}:</span>
                <span className="text-zinc-300 text-right truncate max-w-[180px]">{ingredient.source}</span>
              </div>
            )}
            {ingredient.dosageForm && (
              <div className="flex justify-between">
                <span className="text-zinc-550">{t('card_dosage_form')}:</span>
                <span className="text-zinc-300 text-right">{ingredient.dosageForm}</span>
              </div>
            )}
            {ingredient.applicationArea && (
              <div className="flex justify-between">
                <span className="text-zinc-550">{t('card_application_area')}:</span>
                <span className="text-zinc-300 text-right truncate max-w-[160px]">{ingredient.applicationArea}</span>
              </div>
            )}
            {ingredient.processingTech && (
              <div className={`flex flex-col gap-0.5 mt-1 bg-zinc-900/40 p-1.5 border border-zinc-850 ${isMobile ? "rounded-xl p-2" : "rounded"}`}>
                <span className="text-zinc-550 text-[9px] uppercase font-bold tracking-wider">{t('card_processing_tech')}:</span>
                <span className="text-zinc-350 leading-relaxed text-[10px]">{ingredient.processingTech}</span>
              </div>
            )}
            <div className="flex justify-between mt-1 pt-1.5 border-t border-zinc-900/60">
              <span className="text-zinc-550">{t('card_price_per_kg')}</span>
              <span className="font-mono text-emerald-400 font-semibold">
                ${ingredient.costPerKgUsd.toFixed(2)}
              </span>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2 text-zinc-550">
            <div>
              <span>{t('card_density')}</span>
              <span className="block font-mono text-zinc-300">
                {ingredient.looseBulkDensity.toFixed(2)} → {ingredient.tappedBulkDensity.toFixed(2)} g/mL
              </span>
            </div>
            <div>
              <span>{t('card_price_per_kg')}</span>
              <span className="block font-mono text-zinc-300 text-emerald-400">
                ${ingredient.costPerKgUsd.toFixed(2)}
              </span>
            </div>
          </div>
        )}

        {/* Supplement/OTC Info (Level 2) */}
        {(ingredient.effects?.length || ingredient.contraindications?.length || ingredient.sideEffects?.length) ? (
          <div className="mt-2.5 pt-2.5 border-t border-zinc-800/60 flex flex-col gap-2 text-[11px]">
            {ingredient.effects && ingredient.effects.length > 0 && (
              <div>
                <span className="text-zinc-550 font-medium block mb-1">{t('card_effects_label')}</span>
                <div className="flex flex-wrap gap-1">
                  {ingredient.effects.map((eff, idx) => (
                    <span key={idx} className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 rounded text-[10px]">
                      {t(eff)}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {ingredient.contraindications && ingredient.contraindications.length > 0 && (
              <div>
                <span className="text-zinc-550 font-medium block mb-1">{t('card_contraindications_label')}</span>
                <div className="flex flex-col gap-0.5">
                  {ingredient.contraindications.map((contra, idx) => (
                    <div key={idx} className="text-rose-450 flex items-center gap-1">
                      <span className="w-1 h-1 rounded-full bg-rose-500" />
                      <span>{t(contra)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {ingredient.sideEffects && ingredient.sideEffects.length > 0 && (
              <div>
                <span className="text-zinc-550 font-medium block mb-1">{t('card_side_effects_label')}</span>
                <div className="flex flex-col gap-1 font-mono text-[10px]">
                  {ingredient.sideEffects.map((se, idx) => {
                    let dotColor = 'bg-green-500';
                    if (se.severity === 'medium') dotColor = 'bg-amber-500';
                    if (se.severity === 'high') dotColor = 'bg-rose-500';

                    return (
                      <div key={idx} className="flex items-center justify-between text-zinc-300">
                        <span className="flex items-center gap-1.5 font-sans">
                          <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
                          {t(se.name)}
                        </span>
                        <span className="text-zinc-550 font-sans">({t(se.frequency)})</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        ) : null}
      </div>

      {nodeWarnings.map((w, idx) => (
        <div key={idx} className={`mt-2 p-2 bg-red-500/10 border border-red-500/20 text-[11px] text-red-400 flex items-start gap-1.5 ${isMobile ? "rounded-xl p-3 text-xs leading-relaxed" : "rounded"}`}>
          <AlertTriangle size={isMobile ? 14 : 12} className="shrink-0 mt-0.5" />
          <span>{w.message}</span>
        </div>
      ))}
    </div>
  );
};
