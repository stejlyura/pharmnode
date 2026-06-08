"use client";

import React from 'react';
import { Check, ShieldAlert, Zap, Globe, Sparkles, Building } from 'lucide-react';

interface PricingPanelProps {
  currentTariff: 'hobby' | 'professional' | 'enterprise';
  onSelectTariff: (tariff: 'hobby' | 'professional' | 'enterprise') => void;
  onClose?: () => void;
}

export const PricingPanel: React.FC<PricingPanelProps> = ({
  currentTariff,
  onSelectTariff,
  onClose
}) => {
  const plans = [
    {
      id: 'hobby' as const,
      name: 'Hobby',
      price: '$0',
      period: 'forever',
      description: 'Для независимых технологов, студентов и малых стартапов.',
      icon: <Globe className="text-zinc-400" size={18} />,
      features: [
        { text: 'Максимум 3 ингредиента на схеме', included: true },
        { text: 'Базовая библиотека (5 веществ)', included: true },
        { text: 'Детерминированный анализ рисков', included: true },
        { text: 'ИИ-рекомендации по замене', included: false },
        { text: 'Экспорт GMP PDF отчетов', included: false },
      ],
      color: 'border-zinc-800 hover:border-zinc-700',
      badgeColor: 'bg-zinc-800/40 text-zinc-400 border-zinc-700/50',
      btnText: 'Текущий тариф',
      btnClass: 'bg-zinc-800 text-zinc-400 cursor-default border border-zinc-700/50'
    },
    {
      id: 'professional' as const,
      name: 'Professional',
      price: '$149',
      period: 'месяц',
      description: 'Для производителей БАД и контрактных разработчиков.',
      icon: <Zap className="text-indigo-400 animate-pulse" size={18} />,
      features: [
        { text: 'До 15 ингредиентов в рецептуре', included: true },
        { text: 'Полная база сырья (250+ эксципиентов)', included: true },
        { text: 'ИИ-движок автоматического подбора', included: true },
        { text: 'Решение химических конфликтов в клик', included: true },
        { text: 'Экспорт GMP PDF отчетов', included: false },
      ],
      color: 'border-indigo-500/60 shadow-[0_0_20px_rgba(99,102,241,0.15)] hover:border-indigo-500',
      badgeColor: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
      btnText: 'Выбрать Pro',
      btnClass: 'bg-indigo-500 hover:bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
    },
    {
      id: 'enterprise' as const,
      name: 'Enterprise / CMO',
      price: 'Custom',
      period: 'контракт',
      description: 'Для крупных фармзаводов и госпитальных сетей.',
      icon: <Building className="text-emerald-400" size={18} />,
      features: [
        { text: 'Безлимитное количество ингредиентов', included: true },
        { text: 'Загрузка собственных ТУ и баз данных', included: true },
        { text: 'Экспорт GMP/GxP отчетов в PDF', included: true },
        { text: 'Интеграция с ERP (SAP, SAP Odoo, ERP)', included: true },
        { text: 'Выделенные приватные ИИ-модели', included: true },
      ],
      color: 'border-emerald-500/40 hover:border-emerald-500',
      badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      btnText: 'Подключить Enterprise',
      btnClass: 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/20'
    }
  ];

  return (
    <div className="w-full max-w-4xl bg-zinc-950/40 rounded-2xl p-2 md:p-6 flex flex-col gap-6 select-none text-zinc-100">
      <div className="text-center flex flex-col gap-1.5">
        <div className="flex items-center justify-center gap-1.5 text-xs text-indigo-400 uppercase tracking-widest font-bold">
          <Sparkles size={14} />
          Коммерческие тарифные планы
        </div>
        <h2 className="text-lg md:text-2xl font-bold text-zinc-100">Выберите подходящую лицензию</h2>
        <p className="text-xs text-zinc-400 max-w-md mx-auto leading-relaxed">
          Тестируйте ограничения в реальном времени. Переключение тарифов мгновенно перестраивает поведение холста и доступные ИИ-модели.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => {
          const isCurrent = currentTariff === plan.id;
          
          let btnLabel = plan.btnText;
          let buttonStyle = plan.btnClass;
          if (isCurrent) {
            btnLabel = 'Активный тариф';
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
