"use client";

import React from 'react';
import { Settings, AlertTriangle } from 'lucide-react';
import { CalculatedResults } from '../hooks/useNodeEditor';
import { useTranslation } from '../context/I18nContext';
import { EditorNode } from '../types/pharm';
import { getCapsuleSizes } from '../lib/calculator';

interface CapsulatorNodeProps {
  id: string;
  data: EditorNode['data'];
  calculatedResults: CalculatedResults;
  onUpdateData: (nodeId: string, data: Partial<EditorNode['data']>) => void;
  isMobile?: boolean;
}

export const CapsulatorNode: React.FC<CapsulatorNodeProps> = ({
  id,
  data,
  calculatedResults,
  onUpdateData,
  isMobile = false,
}) => {
  const { t, locale } = useTranslation();
  const capsuleSizes = getCapsuleSizes();

  // Selected values
  const selectedSize = (data.capsuleSize as string) || calculatedResults.dosageFormFit.recommendedCapsuleSize || '#0';
  const capsuleMaterial = (data.capsuleMaterial as 'gelatin' | 'hpmc') || 'gelatin';

  // Read blend properties
  const { looseDensity } = calculatedResults.blend;
  const { recommendedWeightMg } = calculatedResults.tableting;

  // Recalculate fill percentage for the chosen capsule size
  const volumeMl = looseDensity > 0 ? recommendedWeightMg / (looseDensity * 1000) : 0;
  const activeCapsule = capsuleSizes.find(c => c.size === selectedSize) || capsuleSizes[2];
  const fillPercentage = activeCapsule ? (volumeMl / activeCapsule.volumeMl) * 100 : 0;

  const isRu = locale === 'ru-RU';
  const isOverflow = fillPercentage > 100;

  return (
    <div className={isMobile ? "flex flex-col gap-4" : "flex flex-col gap-3 p-4"}>
      <h3 className="font-semibold text-zinc-100 text-sm md:text-base flex items-center gap-2 border-b border-zinc-800 pb-2">
        <Settings size={16} className="text-indigo-400" />
        {isRu ? 'Капсулятор' : 'Capsule Filler'}
      </h3>

      {/* Capsule Size Dropdown */}
      <div className="flex flex-col gap-1.5">
        <span className="text-[10px] text-zinc-550 uppercase tracking-wider font-semibold">
          {isRu ? 'Размер капсулы:' : 'Capsule Size:'}
        </span>
        <select
          value={selectedSize}
          onChange={(e) => onUpdateData(id, { capsuleSize: e.target.value })}
          className="w-full bg-zinc-950 border border-zinc-850 text-zinc-100 text-xs rounded px-2.5 py-1.5 focus:outline-none focus:border-indigo-500 cursor-pointer"
        >
          {capsuleSizes.map((c) => (
            <option key={c.size} value={c.size} className="bg-zinc-950">
              {c.size} ({c.volumeMl} {t('unit_ml') || 'мл'})
            </option>
          ))}
        </select>
      </div>

      {/* Capsule Material Selector */}
      <div className="flex flex-col gap-1.5">
        <span className="text-[10px] text-zinc-550 uppercase tracking-wider font-semibold">
          {isRu ? 'Материал капсулы:' : 'Capsule Material:'}
        </span>
        <div className="grid grid-cols-2 bg-zinc-950 p-0.5 rounded border border-zinc-850">
          <button
            onClick={() => onUpdateData(id, { capsuleMaterial: 'gelatin' })}
            className={`py-1 text-xs font-semibold rounded transition-all cursor-pointer ${
              capsuleMaterial === 'gelatin'
                ? 'bg-zinc-850 text-indigo-400'
                : 'text-zinc-500 hover:text-zinc-400'
            }`}
          >
            {isRu ? 'Желатин' : 'Gelatin'}
          </button>
          <button
            onClick={() => onUpdateData(id, { capsuleMaterial: 'hpmc' })}
            className={`py-1 text-xs font-semibold rounded transition-all cursor-pointer ${
              capsuleMaterial === 'hpmc'
                ? 'bg-zinc-850 text-indigo-400'
                : 'text-zinc-500 hover:text-zinc-400'
            }`}
          >
            HPMC
          </button>
        </div>
      </div>

      {/* Overflow warning */}
      {isOverflow && (
        <div className="p-2.5 bg-rose-500/5 border border-rose-500/40 text-rose-400 rounded-lg text-xs leading-normal flex items-start gap-2 shadow-[0_0_10px_rgba(239,68,68,0.05)] animate-pulse">
          <AlertTriangle size={14} className="shrink-0 mt-0.5" />
          <span>
            {isRu 
              ? 'Предупреждение: Смесь не поместится в эту капсулу (заполнение > 100%). Выберите больший размер.' 
              : 'Warning: Blend will not fit in this capsule (fill > 100%). Choose a larger size.'}
          </span>
        </div>
      )}

      {/* Results grid */}
      <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-zinc-800/60 text-xs">
        <div className={`p-2 rounded border transition-colors ${
          isOverflow 
            ? 'bg-rose-500/5 border-rose-500/20 text-rose-400' 
            : 'bg-zinc-800/20 border-zinc-800/40 text-zinc-400'
        }`}>
          <span className="text-[10px] text-zinc-550 block">{isRu ? 'Заполнение:' : 'Fill Percentage:'}</span>
          <span className="font-mono font-bold block mt-0.5">
            {fillPercentage.toFixed(1)}%
          </span>
        </div>
        <div className="bg-zinc-800/20 p-2 rounded border border-zinc-800/40 text-zinc-450">
          <span className="text-[10px] text-zinc-550 block">{isRu ? 'Объем смеси:' : 'Blend Volume:'}</span>
          <span className="font-mono text-zinc-300 font-bold block mt-0.5">
            {volumeMl.toFixed(4)} {t('unit_ml') || 'мл'}
          </span>
        </div>
      </div>
    </div>
  );
};
