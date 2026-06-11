"use client";

import React from 'react';
import { Check, ShieldAlert, Zap, Globe, Sparkles, Building } from 'lucide-react';
import { useTranslation } from '../context/I18nContext';

interface PricingPanelProps {
  currentTariff: 'hobby' | 'professional';
  onSelectTariff: (tariff: 'hobby' | 'professional') => void;
  onClose?: () => void;
}

export const PricingPanel: React.FC<PricingPanelProps> = ({
  currentTariff,
  onSelectTariff,
  onClose
}) => {
  const { t } = useTranslation();
  const plans = [
    {
      id: 'hobby' as const,
      name: 'Hobby',
      price: '$0',
      period: 'forever',
      description: t('pricing_hobby_desc'),
      icon: <Globe className="text-zinc-400" size={18} />,
      features: [
        { text: t('pricing_hobby_feature_1'), included: true },
        { text: t('pricing_hobby_feature_2'), included: true },
        { text: t('pricing_hobby_feature_3'), included: true },
        { text: t('pricing_hobby_feature_4'), included: false },
        { text: t('pricing_hobby_feature_5'), included: false },
      ],
      color: 'border-zinc-800 hover:border-zinc-700',
      badgeColor: 'bg-zinc-800/40 text-zinc-400 border-zinc-700/50',
      btnText: t('pricing_current_plan'),
      btnClass: 'bg-zinc-800 text-zinc-400 cursor-default border border-zinc-700/50'
    },
    {
      id: 'professional' as const,
      name: 'Professional',
      price: '$19',
      period: t('pricing_month'),
      description: t('pricing_pro_desc'),
      icon: <Zap className="text-indigo-400 animate-pulse" size={18} />,
      features: [
        { text: t('pricing_pro_feature_1'), included: true },
        { text: t('pricing_pro_feature_2'), included: true },
        { text: t('pricing_pro_feature_3'), included: true },
        { text: t('pricing_pro_feature_4'), included: true },
        { text: t('pricing_pro_feature_5'), included: true },
      ],
      color: 'border-indigo-500/60 shadow-[0_0_20px_rgba(99,102,241,0.15)] hover:border-indigo-500',
      badgeColor: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
      btnText: t('pricing_upgrade_pro'),
      btnClass: 'bg-indigo-500 hover:bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
    }
  ];

  return (
    <div className="w-full max-w-4xl bg-zinc-950/40 rounded-2xl p-2 md:p-6 flex flex-col gap-6 select-none text-zinc-100">
      <div className="text-center flex flex-col gap-1.5">
        <div className="flex items-center justify-center gap-1.5 text-xs text-indigo-400 uppercase tracking-widest font-bold">
          <Sparkles size={14} />
          {t('pricing_title')}
        </div>
        <h2 className="text-lg md:text-2xl font-bold text-zinc-100">{t('pricing_subtitle')}</h2>
        <p className="text-xs text-zinc-400 max-w-md mx-auto leading-relaxed">
          {t('pricing_desc')}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto w-full">
        {plans.map((plan) => {
          const isCurrent = currentTariff === plan.id;
          
          let btnLabel = plan.btnText;
          let buttonStyle = plan.btnClass;
          if (isCurrent) {
            btnLabel = t('pricing_active_plan');
            buttonStyle = 'bg-zinc-800 text-zinc-400 border border-zinc-700/50 cursor-default';
          }

          return (
            <div
              key={plan.id}
              className={`rounded-2xl border bg-zinc-900/80 backdrop-blur-md p-5 flex flex-col gap-4 transition-all duration-300 theme-element ${plan.color}`}
            >
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-zinc-800 flex items-center justify-center border border-zinc-700/50">
                    {plan.icon}
                  </div>
                  <h3 className="font-bold text-sm text-zinc-100">{plan.name}</h3>
                </div>
                {plan.id === 'professional' && (
                  <span className="text-[9px] bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                    Popular
                  </span>
                )}
              </div>

              <div>
                <div className="flex items-baseline">
                  <span className="text-2xl md:text-3xl font-extrabold font-mono text-zinc-50">{plan.price}</span>
                  {plan.period && (
                    <span className="text-zinc-500 text-[10px] ml-1"> / {plan.period}</span>
                  )}
                </div>
                <p className="text-[11px] text-zinc-400 mt-2 leading-relaxed h-8">
                  {plan.description}
                </p>
              </div>

              <ul className="flex flex-col gap-2.5 my-2 pt-3 border-t border-zinc-800">
                {plan.features.map((feat, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-xs">
                    {feat.included ? (
                      <Check size={14} className="text-emerald-400 shrink-0 mt-0.5" />
                    ) : (
                      <ShieldAlert size={14} className="text-zinc-600 shrink-0 mt-0.5" />
                    )}
                    <span className={feat.included ? 'text-zinc-300' : 'text-zinc-600 line-through decoration-zinc-800/80'}>
                      {feat.text}
                    </span>
                  </li>
                ))}
              </ul>

              <button
                disabled={isCurrent && plan.id === 'hobby'}
                onClick={async () => {
                  if (isCurrent) return;

                  if (plan.id === 'hobby') {
                    onSelectTariff('hobby');
                    if (onClose) onClose();
                    return;
                  }

                  try {
                    const response = await fetch('/api/checkout', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ plan: plan.id }),
                    });
                    const resData = await response.json();
                    if (resData.url) {
                      window.location.href = resData.url;
                    } else {
                      onSelectTariff(plan.id);
                      if (onClose) onClose();
                    }
                  } catch (err) {
                    console.error("Billing redirect failed, falling back to local simulation:", err);
                    onSelectTariff(plan.id);
                    if (onClose) onClose();
                  }
                }}
                className={`w-full py-2 px-3 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${buttonStyle}`}
              >
                {btnLabel}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
