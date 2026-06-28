"use client";

import React from 'react';
import { Check, ShieldAlert } from 'lucide-react';
import { useTranslation } from '../context/I18nContext';
import { trackEvent } from '@/lib/analytics';

interface PricingCardProps {
  userId?: string;
  userEmail?: string;
  id: 'hobby' | 'professional';
  name: string;
  price: string;
  period?: string;
  description: string;
  icon: React.ReactNode;
  features: { text: string; included: boolean }[];
  color: string;
  badgeColor: string;
  btnText: string;
  btnClass: string;
  currentTariff: 'hobby' | 'professional';
  onSelectTariff: (tariff: 'hobby' | 'professional') => void;
  onClose?: () => void;
}

export const PricingCard: React.FC<PricingCardProps> = ({
  userId,
  userEmail,
  id,
  name,
  price,
  period,
  description,
  icon,
  features,
  color,
  btnText,
  currentTariff,
  onSelectTariff,
  onClose
}) => {
  const { t, locale } = useTranslation();

  const isCurrent = currentTariff === id;
  
  let btnLabel = btnText;
  if (isCurrent) {
    btnLabel = t('pricing_active_plan') || 'Active Plan';
  }

  const handleCheckout = () => {
    if (!userId) {
      onSelectTariff('professional');
      return;
    }

    trackEvent('checkout_initiated', {
      tariff: 'professional',
      price: '$39',
      userId: userId
    });
    
    const paddle = (window as any).Paddle || (window as any).PaddleBillingV1;
    if (paddle) {
      const checkoutOptions: any = {
        items: [
          {
            priceId: process.env.NEXT_PUBLIC_PADDLE_PRICE_ID || "pri_test_placeholder",
            quantity: 1
          }
        ],
        customData: {
          userId: userId || "",
        }
      };

      if (userEmail && userEmail.trim() !== "") {
        checkoutOptions.customer = {
          email: userEmail
        };
      }

      paddle.Checkout.open(checkoutOptions);
    } else {
      console.error("Paddle SDK not loaded");
      
      // Fallback for mock users in local development if SDK is blocked or offline
      if (userId?.startsWith('mock-')) {
        onSelectTariff('professional');
        if (onClose) onClose();
      } else {
        alert(t('paddle_sdk_error') || "Payment gateway (Paddle) failed to load. If you are using an adblocker, please disable it and refresh the page.");
      }
    }
  };

  return (
    <div
      className={`rounded-2xl border bg-zinc-900/80 backdrop-blur-md p-5 flex flex-col gap-4 transition-all duration-300 theme-element ${color}`}
    >
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-zinc-800 flex items-center justify-center border border-zinc-700/50">
            {icon}
          </div>
          <h3 className="font-bold text-sm text-zinc-100">{name}</h3>
        </div>
        {id === 'professional' && (
          <span className="text-[9px] bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 px-2 py-0.5 rounded font-bold uppercase tracking-wider">
            Popular
          </span>
        )}
      </div>

      <div>
        <div className="flex items-baseline">
          <span className="text-2xl md:text-3xl font-extrabold font-mono text-zinc-50">{price}</span>
          {period && (
            <span className="text-zinc-500 text-[10px] ml-1"> / {period}</span>
          )}
        </div>
        <p className="text-[11px] text-zinc-400 mt-2 leading-relaxed h-8">
          {description}
        </p>
      </div>

      <ul className="flex flex-col gap-2.5 my-2 pt-3 border-t border-zinc-800">
        {features.map((feat, idx) => (
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

      {isCurrent ? (
        <button
          disabled
          className="w-full py-2 px-3 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 bg-zinc-800 text-zinc-400 border border-zinc-700/50 cursor-default"
        >
          {btnLabel}
        </button>
      ) : id === 'hobby' && currentTariff === 'professional' ? (
        <button
          disabled
          className="w-full py-2 px-3 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 bg-zinc-900 text-zinc-650 border border-zinc-850/80 cursor-not-allowed opacity-50"
        >
          {locale === "ru-RU" ? "Понижение недоступно" : "Downgrade unavailable"}
        </button>
      ) : id === 'hobby' ? (
        <button
          onClick={() => {
            trackEvent('checkout_initiated', {
              tariff: 'hobby',
              price: '$0',
              userId: userId
            });
            onSelectTariff('hobby');
            if (onClose) onClose();
          }}
          className="w-full py-2 px-3 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 bg-zinc-850 hover:bg-zinc-800 text-zinc-300 border border-zinc-700/50"
        >
          {btnLabel}
        </button>
      ) : (
        <button
          onClick={handleCheckout}
          className="w-full py-2 px-3 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 bg-indigo-500 hover:bg-indigo-600 text-white shadow-lg shadow-indigo-500/20"
        >
          {btnLabel}
        </button>
      )}
    </div>
  );
};
