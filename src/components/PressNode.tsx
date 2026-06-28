"use client";

import React from 'react';
import { Settings } from 'lucide-react';
import { CalculatedResults } from '../hooks/useNodeEditor';
import { useTranslation } from '../context/I18nContext';
import { EditorNode } from '../types/pharm';

interface PressNodeProps {
  id: string;
  data: EditorNode['data'];
  calculatedResults: CalculatedResults;
  onUpdateData: (nodeId: string, data: Partial<EditorNode['data']>) => void;
  isMobile?: boolean;
}

export const PressNode: React.FC<PressNodeProps> = ({
  id,
  data,
  calculatedResults,
  onUpdateData,
  isMobile = false,
}) => {
  const { t } = useTranslation();
  const diameter = data.diameterCm ?? 0.3;
  const depth = data.depthCm ?? 0.5;
  const { volume, maxWeightMg, recommendedWeightMg, porosity } = calculatedResults.tableting;

  return (
    <div className={isMobile ? "flex flex-col gap-4" : "flex flex-col gap-3 p-4"}>
      <h3 className="font-semibold text-zinc-100 text-sm md:text-base flex items-center gap-2 border-b border-zinc-800 pb-2">
        <Settings size={16} className="text-indigo-400" />
        {t('card_press_equipment')}
      </h3>

      {/* Punch Diameter Slider */}
      <div>
        <div className="flex justify-between items-center mb-1.5">
          <span className="text-xs text-zinc-400">{t('card_punch_diameter')}</span>
          <span className="text-xs font-semibold text-zinc-200 font-mono">
            {diameter} {t('unit_cm')} ({(diameter * 10).toFixed(0)} {t('unit_mm')})
          </span>
        </div>
        <div className="flex gap-2 items-center">
          <input
            type="range"
            min="0.1"
            max="1.5"
            step="0.05"
            value={diameter}
            onChange={(e) => onUpdateData(id, { diameterCm: parseFloat(e.target.value) || 0.3 })}
            className={`flex-1 accent-indigo-500 bg-zinc-800 rounded-lg appearance-none cursor-pointer ${
              isMobile ? "h-2 py-2" : "h-1.5"
            }`}
          />
        </div>
      </div>

      {/* Fill Depth Slider */}
      <div>
        <div className="flex justify-between items-center mb-1.5">
          <span className="text-xs text-zinc-400">{t('card_fill_depth')}</span>
          <span className="text-xs font-semibold text-zinc-200 font-mono">
            {depth} {t('unit_cm')}
          </span>
        </div>
        <div className="flex gap-2 items-center">
          <input
            type="range"
            min="0.1"
            max="2.0"
            step="0.05"
            value={depth}
            onChange={(e) => onUpdateData(id, { depthCm: parseFloat(e.target.value) || 0.5 })}
            className={`flex-1 accent-indigo-500 bg-zinc-800 rounded-lg appearance-none cursor-pointer ${
              isMobile ? "h-2 py-2" : "h-1.5"
            }`}
          />
        </div>
      </div>

      {/* Results Grid */}
      <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-zinc-800/60 text-xs">
        <div className={`bg-zinc-800/20 border border-zinc-850 ${isMobile ? "p-2.5 rounded-xl border-zinc-800/50" : "p-2 rounded border-zinc-800/40"}`}>
          <span className="text-[10px] text-zinc-550 block">{t('card_die_volume')}</span>
          <span className="font-mono text-zinc-300 font-bold block mt-0.5">
            {(volume * 1000).toFixed(1)} {t('unit_mm3')}
          </span>
        </div>
        <div className={`bg-zinc-800/20 border border-zinc-850 ${isMobile ? "p-2.5 rounded-xl border-zinc-800/50" : "p-2 rounded border-zinc-800/40"}`}>
          <span className="text-[10px] text-zinc-550 block">{t('card_tablet_porosity')}</span>
          <span className={`font-mono font-bold block mt-0.5 ${
            porosity > 0.4 ? 'text-amber-400' : 'text-zinc-300'
          }`}>
            {(porosity * 100).toFixed(2)}%
          </span>
        </div>
        <div className={`bg-zinc-800/20 border border-zinc-850 ${isMobile ? "p-2.5 rounded-xl border-zinc-800/50" : "p-2 rounded border-zinc-800/40"}`}>
          <span className="text-[10px] text-zinc-550 block">{t('card_fill_weight_max')}</span>
          <span className="font-mono text-zinc-300 font-bold block mt-0.5">
            {maxWeightMg.toFixed(2)} {t('unit_mg')}
          </span>
        </div>
        <div className={`bg-zinc-800/20 border border-zinc-850 ${isMobile ? "p-2.5 rounded-xl border-zinc-800/50" : "p-2 rounded border-zinc-800/40"}`}>
          <span className="text-[10px] text-zinc-550 block">{t('card_tablet_weight_rec')}</span>
          <span className="font-mono text-indigo-400 font-bold block mt-0.5">
            {recommendedWeightMg.toFixed(2)} {t('unit_mg')}
          </span>
        </div>
      </div>
    </div>
  );
};
