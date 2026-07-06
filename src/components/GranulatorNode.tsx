"use client";

import React from 'react';
import { RefreshCw, AlertTriangle } from 'lucide-react';
import { CalculatedResults } from '../hooks/useNodeEditor';
import { useTranslation } from '../context/I18nContext';
import { EditorNode } from '../types/pharm';
import { calculateWetGranulation } from '../lib/calculator';

interface GranulatorNodeProps {
  id: string;
  data: EditorNode['data'];
  calculatedResults: CalculatedResults;
  onUpdateData: (nodeId: string, data: Partial<EditorNode['data']>) => void;
  isMobile?: boolean;
}

export const GranulatorNode: React.FC<GranulatorNodeProps> = ({
  id,
  data,
  calculatedResults,
  onUpdateData,
  isMobile = false,
}) => {
  const { t, locale } = useTranslation();
  const granulationType = (data.granulationType as 'wet' | 'dry') || 'wet';

  // Read current blend properties
  const { carr } = calculatedResults.blend.flowability;
  const { recommendedWeightMg } = calculatedResults.tableting;
  const { totalTablets } = calculatedResults.batch;
  const { activePercentage } = calculatedResults;

  // Wet Granulation inputs from node data or defaults
  const intragranularPercentage = Number(data.intragranularPercentage ?? 90);
  const moistureContentLod = Number(data.moistureContentLod ?? 3);
  const binderSolutionAddedPercentage = Number(data.binderSolutionAddedPercentage ?? 10);
  const expectedLossPercentage = Number(data.expectedLossPercentage ?? 2);

  // Calculations for wet granulation
  const wetResult = React.useMemo(() => {
    if (granulationType !== 'wet') return null;
    return calculateWetGranulation({
      targetTabletWeightMg: recommendedWeightMg || 500,
      apiPercentage: activePercentage || 20,
      intragranularPercentage,
      moistureContentLod,
      binderSolutionAddedPercentage,
      expectedLossPercentage,
      batchSizeTablets: totalTablets || 10000,
    });
  }, [
    granulationType,
    recommendedWeightMg,
    activePercentage,
    intragranularPercentage,
    moistureContentLod,
    binderSolutionAddedPercentage,
    expectedLossPercentage,
    totalTablets,
  ]);

  const isRu = locale === 'ru-RU';

  return (
    <div className={isMobile ? "flex flex-col gap-4" : "flex flex-col gap-3 p-4"}>
      <h3 className="font-semibold text-zinc-100 text-sm md:text-base flex items-center gap-2 border-b border-zinc-800 pb-2">
        <RefreshCw size={16} className="text-indigo-400" />
        {isRu ? 'Гранулятор' : 'Granulator'}
      </h3>

      {/* Granulation Type Selector */}
      <div className="flex flex-col gap-1.5">
        <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold font-mono">
          {isRu ? 'Метод грануляции:' : 'Granulation Method:'}
        </span>
        <div className="grid grid-cols-2 bg-zinc-950 p-0.5 rounded border border-zinc-850">
          <button
            onClick={() => onUpdateData(id, { granulationType: 'wet' })}
            className={`py-1 text-xs font-semibold rounded transition-all cursor-pointer ${
              granulationType === 'wet'
                ? 'bg-zinc-850 text-indigo-400'
                : 'text-zinc-500 hover:text-zinc-400'
            }`}
          >
            {isRu ? 'Влажная' : 'Wet'}
          </button>
          <button
            onClick={() => onUpdateData(id, { granulationType: 'dry' })}
            className={`py-1 text-xs font-semibold rounded transition-all cursor-pointer ${
              granulationType === 'dry'
                ? 'bg-zinc-850 text-indigo-400'
                : 'text-zinc-500 hover:text-zinc-400'
            }`}
          >
            {isRu ? 'Сухая' : 'Dry'}
          </button>
        </div>
      </div>

      {/* Warnings & Notices */}
      <div className="flex flex-col gap-1.5 text-[10px] leading-normal">
        {carr > 25 && granulationType !== 'wet' && (
          <div className="p-2 bg-amber-500/5 border border-amber-500/10 text-amber-400 flex items-start gap-1.5 rounded">
            <AlertTriangle size={12} className="shrink-0 mt-0.5" />
            <span>
              {isRu
                ? 'Рекомендуется влажная грануляция при Индексе Карра > 25 для улучшения сыпучести смеси.'
                : 'Wet granulation is recommended when Carr Index > 25 to improve blend flowability.'}
            </span>
          </div>
        )}
        {carr < 15 && (
          <div className="p-2 bg-indigo-500/5 border border-indigo-500/10 text-indigo-400 flex items-start gap-1.5 rounded">
            <AlertTriangle size={12} className="shrink-0 mt-0.5" />
            <span>
              {isRu
                ? 'Грануляция может быть излишней: порошок уже имеет хорошую сыпучесть.'
                : 'Granulation might be redundant: the powder already has good flowability.'}
            </span>
          </div>
        )}
      </div>

      {/* Wet Granulation Sliders & Parameters */}
      {granulationType === 'wet' && (
        <div className="flex flex-col gap-3 border-t border-zinc-800/60 pt-3">
          {/* Intragranular Percentage */}
          <div>
            <div className="flex justify-between text-[11px] mb-1">
              <span className="text-zinc-400">{isRu ? 'Интрагранулярно (%):' : 'Intragranular (%):'}</span>
              <span className="font-mono text-zinc-200 font-semibold">{intragranularPercentage}%</span>
            </div>
            <input
              type="range"
              min="50"
              max="100"
              step="5"
              value={intragranularPercentage}
              onChange={(e) => onUpdateData(id, { intragranularPercentage: parseInt(e.target.value) || 90 })}
              className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
            />
          </div>

          {/* Moisture Content LOD */}
          <div>
            <div className="flex justify-between text-[11px] mb-1">
              <span className="text-zinc-400">{isRu ? 'Влажность LOD (%):' : 'Moisture LOD (%):'}</span>
              <span className="font-mono text-zinc-200 font-semibold">{moistureContentLod}%</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="10"
              step="0.5"
              value={moistureContentLod}
              onChange={(e) => onUpdateData(id, { moistureContentLod: parseFloat(e.target.value) || 3 })}
              className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
            />
          </div>

          {/* Binder Solution Added */}
          <div>
            <div className="flex justify-between text-[11px] mb-1">
              <span className="text-zinc-400">{isRu ? 'Раствор связующего (%):' : 'Binder Solution (%):'}</span>
              <span className="font-mono text-zinc-200 font-semibold">{binderSolutionAddedPercentage}%</span>
            </div>
            <input
              type="range"
              min="1"
              max="30"
              step="1"
              value={binderSolutionAddedPercentage}
              onChange={(e) => onUpdateData(id, { binderSolutionAddedPercentage: parseInt(e.target.value) || 10 })}
              className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
            />
          </div>

          {/* Expected Loss */}
          <div>
            <div className="flex justify-between text-[11px] mb-1">
              <span className="text-zinc-400">{isRu ? 'Ожидаемые потери (%):' : 'Expected Loss (%):'}</span>
              <span className="font-mono text-zinc-200 font-semibold">{expectedLossPercentage}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="10"
              step="0.5"
              value={expectedLossPercentage}
              onChange={(e) => onUpdateData(id, { expectedLossPercentage: parseFloat(e.target.value) || 2 })}
              className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
            />
          </div>

          {/* Results Grid */}
          {wetResult && (
            <div className="grid grid-cols-2 gap-2 mt-1 pt-2 border-t border-zinc-850 text-[10px]">
              <div className="bg-zinc-800/10 p-2 rounded border border-zinc-850 text-zinc-450">
                <span className="text-zinc-550 block text-[9px]">{isRu ? 'Масса серии (сух.):' : 'Batch Dry Mass:'}</span>
                <span className="font-mono text-zinc-300 font-bold block mt-0.5">
                  {wetResult.totalDryBatchWeightKg.toFixed(3)} {t('unit_kg') || 'кг'}
                </span>
              </div>
              <div className="bg-zinc-800/10 p-2 rounded border border-zinc-850 text-zinc-450">
                <span className="text-zinc-550 block text-[9px]">{isRu ? 'Масса АФИ:' : 'API Dry Mass:'}</span>
                <span className="font-mono text-zinc-300 font-bold block mt-0.5">
                  {wetResult.pureApiWeightKg.toFixed(3)} {t('unit_kg') || 'кг'}
                </span>
              </div>
              <div className="bg-zinc-800/10 p-2 rounded border border-zinc-850 text-zinc-455">
                <span className="text-zinc-550 block text-[9px]">{isRu ? 'Влажный замес:' : 'Wet Mass:'}</span>
                <span className="font-mono text-zinc-300 font-bold block mt-0.5">
                  {wetResult.wetGranulesWeightBeforeDryingKg.toFixed(3)} {t('unit_kg') || 'кг'}
                </span>
              </div>
              <div className="bg-zinc-800/10 p-2 rounded border border-zinc-850 text-zinc-455">
                <span className="text-zinc-550 block text-[9px]">{isRu ? 'Потери серии:' : 'Expected Loss:'}</span>
                <span className="font-mono text-rose-400 font-bold block mt-0.5">
                  {wetResult.expectedLossWeightKg.toFixed(3)} {t('unit_kg') || 'кг'}
                </span>
              </div>
              <div className="bg-zinc-850/20 p-2 rounded border border-zinc-800/40 text-zinc-450 col-span-2">
                <span className="text-zinc-550 block text-[9px]">{isRu ? 'Вес заполнения на таблетку (с LOD):' : 'Fill Weight per Tablet (w/ LOD):'}</span>
                <span className="font-mono text-indigo-400 font-bold block mt-0.5 text-center">
                  {wetResult.finalFillWeightPerTabletMg.toFixed(2)} {t('unit_mg') || 'мг'}
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {granulationType === 'dry' && (
        <div className="border-t border-zinc-800/60 pt-3 flex flex-col gap-2 text-xs text-zinc-400 leading-normal">
          <p>
            {isRu
              ? 'Сухая грануляция (компактирование / брикетирование) используется для влаго- или термочувствительных материалов.'
              : 'Dry granulation (slugging / roller compaction) is used for moisture or heat-sensitive materials.'}
          </p>
          <div className="bg-zinc-950/40 p-2 rounded border border-zinc-850 text-[10px] text-zinc-500">
            {isRu
              ? 'Масса заполнения матрицы равна сухому весу таблетки.'
              : 'The fill weight remains equal to the dry weight of the tablet.'}
          </div>
        </div>
      )}
    </div>
  );
};
