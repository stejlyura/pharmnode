"use client";

import React, { useState, useEffect } from "react";
import { useTranslation } from "@/context/I18nContext";
import { initAnalytics } from "@/lib/analytics";
import { ShieldCheck, Settings, Check } from "lucide-react";

export const CookieConsent: React.FC = () => {
  const { locale } = useTranslation();
  const isRu = locale === "ru-RU";
  const [isVisible, setIsVisible] = useState(false);
  const [showConfigure, setShowConfigure] = useState(false);
  const [analyticsEnabled, setAnalyticsEnabled] = useState(true);

  useEffect(() => {
    const consent = localStorage.getItem("pharmnode_cookie_consent");
    if (consent) return;

    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  const handleAcceptAll = () => {
    localStorage.setItem("pharmnode_cookie_consent", "accepted");
    initAnalytics();
    setIsVisible(false);
  };

  const handleDeclineAll = () => {
    localStorage.setItem("pharmnode_cookie_consent", "declined");
    setIsVisible(false);
  };

  const handleSavePreferences = () => {
    if (analyticsEnabled) {
      localStorage.setItem("pharmnode_cookie_consent", "accepted");
      initAnalytics();
    } else {
      localStorage.setItem("pharmnode_cookie_consent", "declined");
    }
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-6 right-6 left-6 md:left-auto md:max-w-md z-50 animate-fade-in-up">
      <div className="bg-zinc-900/95 border border-zinc-800/90 backdrop-blur-md p-5 rounded-2xl shadow-2xl flex flex-col gap-4 text-zinc-100 theme-element transition-all duration-300">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400 shrink-0 border border-indigo-500/20">
            <ShieldCheck size={16} />
          </div>
          <div className="flex-1">
            <h4 className="text-xs font-bold text-zinc-200">
              {isRu ? "Файлы Cookie и конфиденциальность" : "Cookies & Data Privacy"}
            </h4>
            <p className="text-[10.5px] text-zinc-400 leading-relaxed mt-1.5">
              {isRu
                ? "Мы используем файлы cookie для оптимизации работы с холстом формуляций и B2B расчетов. Вы можете настроить свои предпочтения ниже."
                : "We utilize cookies to optimize formulation modeling and B2B calculations. You can customize your preferences below."}
            </p>
          </div>
        </div>

        {/* Configuration settings pane */}
        {showConfigure && (
          <div className="border-t border-zinc-800/60 pt-3 mt-1 flex flex-col gap-2.5 animate-fade-in">
            <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">
              {isRu ? "Настройка предпочтений" : "Cookie Settings"}
            </span>

            {/* Necessary Option */}
            <div className="flex items-center justify-between p-2 rounded bg-zinc-950/40 border border-zinc-850">
              <div className="flex flex-col gap-0.5">
                <span className="text-[10.5px] font-semibold text-zinc-300">
                  {isRu ? "Обязательные (Necessary)" : "Necessary Cookies"}
                </span>
                <span className="text-[9.5px] text-zinc-500 leading-tight">
                  {isRu ? "Для авторизации, локали и темы." : "Used for session, locale & theme preference."}
                </span>
              </div>
              <div className="w-5 h-5 rounded bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 cursor-not-allowed">
                <Check size={12} />
              </div>
            </div>

            {/* Telemetry Option */}
            <div className="flex items-center justify-between p-2 rounded bg-zinc-950/40 border border-zinc-850">
              <div className="flex flex-col gap-0.5">
                <span className="text-[10.5px] font-semibold text-zinc-300">
                  {isRu ? "Аналитика и телеметрия" : "Analytics & Telemetry"}
                </span>
                <span className="text-[9.5px] text-zinc-500 leading-tight">
                  {isRu ? "Анонимное отслеживание ошибок." : "Anonymous diagnostics and performance."}
                </span>
              </div>
              <button
                onClick={() => setAnalyticsEnabled(!analyticsEnabled)}
                className={`w-5 h-5 rounded border transition-colors flex items-center justify-center cursor-pointer ${
                  analyticsEnabled
                    ? "bg-indigo-500 border-indigo-400 text-white"
                    : "bg-zinc-900 border-zinc-800 text-transparent hover:border-zinc-700"
                }`}
              >
                {analyticsEnabled && <Check size={12} />}
              </button>
            </div>
          </div>
        )}

        {/* Buttons and actions */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 border-t border-zinc-800/40 pt-3">
          <button
            onClick={() => setShowConfigure(!showConfigure)}
            className="flex items-center gap-1 px-2.5 py-1.5 hover:text-zinc-200 text-[10px] text-zinc-400 rounded-lg transition-colors cursor-pointer bg-zinc-900/40 hover:bg-zinc-850/60 border border-zinc-800"
          >
            <Settings size={12} />
            {isRu ? "Настроить" : "Configure"}
          </button>

          <div className="flex items-center gap-2">
            {showConfigure ? (
              <button
                onClick={handleSavePreferences}
                className="px-3 py-1.5 bg-indigo-500 hover:bg-indigo-600 text-[10px] text-white font-bold rounded-lg transition-colors cursor-pointer shadow-md shadow-indigo-500/15"
              >
                {isRu ? "Сохранить" : "Save Choice"}
              </button>
            ) : (
              <>
                <button
                  onClick={handleDeclineAll}
                  className="px-3 py-1.5 bg-zinc-950 border border-zinc-850 hover:bg-zinc-900 text-[10px] text-zinc-400 rounded-lg transition-colors cursor-pointer"
                >
                  {isRu ? "Отклонить все" : "Decline All"}
                </button>
                <button
                  onClick={handleAcceptAll}
                  className="px-3.5 py-1.5 bg-indigo-500 hover:bg-indigo-600 text-[10px] text-white font-bold rounded-lg transition-colors cursor-pointer shadow-md shadow-indigo-500/15"
                >
                  {isRu ? "Принять все" : "Accept All"}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
