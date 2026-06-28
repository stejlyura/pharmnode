"use client";

import React from 'react';
import { Check, Zap, X } from 'lucide-react';
import { useTranslation } from '../context/I18nContext';

interface BenefitsModalProps {
  isOpen: boolean;
  onClose: () => void;
  tariff: 'professional';
}

export const BenefitsModal: React.FC<BenefitsModalProps> = ({
  isOpen,
  onClose,
  tariff: _tariff
}) => {
  const { t } = useTranslation();

  if (!isOpen) return null;

  const details = {
    title: t('benefits_pro_title'),
    subtitle: t('benefits_pro_subtitle'),
    icon: <Zap className="text-indigo-400 animate-pulse" size={24} />,
    color: 'from-indigo-500/20 to-purple-500/20 border-indigo-500/50',
    badge: 'Professional',
    badgeClass: 'bg-indigo-500/15 border-indigo-500/30 text-indigo-300',
    features: [
      { text: t('benefits_pro_feature_1_title'), desc: t('benefits_pro_feature_1_desc') },
      { text: t('benefits_pro_feature_2_title'), desc: t('benefits_pro_feature_2_desc') },
      { text: t('benefits_pro_feature_3_title'), desc: t('benefits_pro_feature_3_desc') },
      { text: t('benefits_pro_feature_4_title'), desc: t('benefits_pro_feature_4_desc') }
    ]
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl relative overflow-hidden theme-element">
        {/* Decorative Top Glow */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 to-purple-600" />

        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-500 hover:text-zinc-300 transition-colors z-10 cursor-pointer"
        >
          <X size={18} />
        </button>

        <div className="p-6 md:p-8 flex flex-col gap-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center border bg-zinc-950/80 shrink-0 border-indigo-500/30">
              {details.icon}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-lg font-bold text-zinc-100">{details.title}</h3>
                <span className={`text-[10px] border px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${details.badgeClass}`}>
                  {t('benefits_active')}
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-1 leading-relaxed">{details.subtitle}</p>
            </div>
          </div>

          <div className={`p-4 rounded-xl border bg-gradient-to-br ${details.color} flex items-center gap-3`}>
            <Zap className="text-indigo-400 shrink-0" size={18} />
            <div className="text-xs text-zinc-200">
              {t('benefits_using_all')} <strong className="text-zinc-100">{details.badge}</strong>. {t('benefits_switch_note')}
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">{t('benefits_included')}</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {details.features.map((feat, idx) => (
                <div key={idx} className="flex gap-3 bg-zinc-950/40 border border-zinc-850 p-3.5 rounded-xl hover:border-zinc-800 transition-colors">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0 mt-0.5">
                    <Check size={12} className="text-emerald-400" />
                  </div>
                  <div>
                    <h5 className="text-xs font-semibold text-zinc-200 leading-tight">{feat.text}</h5>
                    <p className="text-[10px] text-zinc-500 mt-1 leading-relaxed">{feat.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-zinc-800 flex justify-end">
            <button
              onClick={onClose}
              className="px-5 py-2 bg-zinc-850 hover:bg-zinc-800 text-zinc-300 font-bold rounded-xl text-xs transition-colors cursor-pointer border border-zinc-800/80"
            >
              {t('benefits_done')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
