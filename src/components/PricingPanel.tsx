"use client";

import React, { useEffect } from 'react';
import { Zap, Globe, Sparkles } from 'lucide-react';
import { useTranslation } from '../context/I18nContext';
import { useAuth } from '../context/AuthContext';
import { PricingCard } from './PricingCard';
import { trackEvent } from '@/lib/analytics';

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
  const { user } = useAuth();
  const userId = user?.id;

  useEffect(() => {
    trackEvent('pricing_viewed', {
      currentTariff,
      userId
    });
  }, [currentTariff, userId]);

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
      price: '$39',
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
        {plans.map((plan) => (
          <PricingCard
            key={plan.id}
            userId={userId}
            userEmail={user?.email}
            id={plan.id}
            name={plan.name}
            price={plan.price}
            period={plan.period}
            description={plan.description}
            icon={plan.icon}
            features={plan.features}
            color={plan.color}
            badgeColor={plan.badgeColor}
            btnText={plan.btnText}
            btnClass={plan.btnClass}
            currentTariff={currentTariff}
            onSelectTariff={onSelectTariff}
            onClose={onClose}
          />
        ))}
      </div>
    </div>
  );
};
