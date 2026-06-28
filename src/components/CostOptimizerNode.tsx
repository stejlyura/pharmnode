"use client";

import React from 'react';
import { DollarSign } from 'lucide-react';
import { useTranslation } from '../context/I18nContext';
import { CalculatedResults } from '../hooks/useNodeEditor';

interface CostOptimizerNodeProps {
  calculatedResults: CalculatedResults;
  tariff: 'hobby' | 'professional';
  onUpgradeClick?: () => void;
  isMobile?: boolean;
}

export const CostOptimizerNode: React.FC<CostOptimizerNodeProps> = ({
  calculatedResults,
  tariff,
  onUpgradeClick,
  isMobile = false,
}) => {
  const { t } = useTranslation();
  const { costPerKg } = calculatedResults.blend;
  const { costPerTabletUsd, totalBatchCostUsd } = calculatedResults.batch;

  return (
    <div className={isMobile ? "flex flex-col gap-4" : "flex flex-col gap-3 p-4"}>
      <h3 className="font-semibold text-zinc-100 text-sm md:text-base flex items-center gap-2 border-b border-zinc-800 pb-2">
        <DollarSign size={16} className="text-emerald-400" />
        {t('card_cost_optimizer')}
      </h3>

      <div className="flex flex-col gap-2 text-xs">
        <div className="flex justify-between items-center">
          <span className="text-zinc-400">{t('card_blend_cost')}</span>
          <span className="font-mono text-emerald-400 font-semibold">
            ${costPerKg.toFixed(2)} / {t('unit_kg')}
          </span>
        </div>
        <div className="flex justify-between items-center mt-0.5">
          <span className="text-zinc-400">{t('card_cost_per_tablet')}</span>
          <span className="font-mono text-emerald-400 font-semibold">
            ${costPerTabletUsd.toFixed(5)}
          </span>
        </div>
        <div className="flex justify-between items-center mt-0.5">
          <span className="text-zinc-400">{t('card_batch_cost')}</span>
          <span className="font-mono text-emerald-400 font-semibold">
            ${totalBatchCostUsd.toFixed(2)}
          </span>
        </div>
      </div>

      {/* AI suggestions container */}
      <div className="mt-2 border-t border-zinc-800/50 pt-2 flex flex-col gap-2">
        <span className="text-[10px] text-zinc-550 uppercase tracking-wider font-semibold">
          {t('card_ai_suggestions')}
        </span>

        {tariff === 'hobby' ? (
          <div className={`bg-indigo-500/5 border border-indigo-500/10 flex flex-col gap-2 items-center text-center ${isMobile ? "p-3 rounded-xl gap-2.5" : "p-3 rounded"}`}>
            <p className="text-[10px] text-zinc-400 leading-normal font-light">
              {t('card_ai_locked')}
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
          <div className="flex flex-col gap-1.5">
            <div className={`bg-emerald-500/5 border border-emerald-500/10 text-zinc-350 leading-relaxed font-light ${isMobile ? "p-3 rounded-xl text-[11px]" : "p-2 rounded text-[10px]"}`}>
              <span className={`font-bold text-emerald-400 block mb-0.5 ${isMobile ? "text-emerald-455 mb-1" : ""}`}>{t('card_binder_savings')}</span>
              {t('card_binder_savings_desc')}
            </div>
            <div className={`bg-zinc-800/40 border border-zinc-800/50 text-[10px] text-zinc-500 text-center ${isMobile ? "p-2.5 rounded-xl" : "p-2 rounded"}`}>
              {t('card_no_more_suggestions')}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
