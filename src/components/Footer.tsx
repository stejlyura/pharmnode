"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useTranslation } from "@/context/I18nContext";
import { ShieldAlert, Building } from "lucide-react";

export const Footer: React.FC = () => {
  const { locale, t } = useTranslation();
  const currentLocale = locale === "ru-RU" ? "ru-RU" : "en-US";

  // Modal State
  const [modalOpen, setModalOpen] = useState<{
    eula: boolean;
    fda: boolean;
  }>({
    eula: false,
    fda: false,
  });

  const closeModals = () => {
    setModalOpen({ eula: false, fda: false });
  };

  return (
    <footer className="mt-auto border-t border-zinc-900 py-12 px-6 bg-zinc-950/80 backdrop-blur-md text-xs text-zinc-500 theme-element z-10 relative">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-8 text-left pb-8 border-b border-zinc-900/60">
        
        {/* Column 1: Brand & Requisites */}
        <div className="md:col-span-6 flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-zinc-300 text-sm uppercase tracking-wider">{t("company_name")}</span>
            <span className="text-[10px] text-zinc-650 bg-zinc-900 px-2 py-0.5 rounded border border-zinc-850">B2B SaaS</span>
          </div>
          
          <address className="not-italic text-zinc-400 flex flex-col gap-2 mt-1 text-[11px] leading-relaxed">
            <div className="flex items-start gap-1.5">
              <span className="text-zinc-550 min-w-[70px] uppercase font-mono text-[9px] mt-0.5">{currentLocale === "ru-RU" ? "Адрес:" : "Address:"}</span>
              <span className="text-zinc-300">{t("company_address")}</span>
            </div>
            <div className="flex items-start gap-1.5">
              <span className="text-zinc-550 min-w-[70px] uppercase font-mono text-[9px] mt-0.5">{currentLocale === "ru-RU" ? "Телефон:" : "Phone:"}</span>
              <a href={`tel:${t("company_phone").replace(/[\s\(\)-]+/g, "")}`} className="text-indigo-400 hover:text-indigo-300 transition-colors">
                {t("company_phone")}
              </a>
            </div>
            <div className="flex items-start gap-1.5">
              <span className="text-zinc-550 min-w-[70px] uppercase font-mono text-[9px] mt-0.5">{currentLocale === "ru-RU" ? "Email:" : "Email:"}</span>
              <a href={`mailto:${t("company_email")}`} className="text-indigo-400 hover:text-indigo-300 transition-colors">
                {t("company_email")}
              </a>
            </div>
          </address>
        </div>

        {/* Column 2: Legal Documents */}
        <div className="md:col-span-3 flex flex-col gap-3">
          <span className="font-bold text-zinc-400 uppercase tracking-wider text-[10px]">
            {currentLocale === "ru-RU" ? "Документы" : "Legal Policy"}
          </span>
          <nav className="flex flex-col gap-2.5 text-zinc-400">
            <Link href="/terms" className="hover:text-zinc-200 transition-colors">
              {t("footer_terms")}
            </Link>
            <Link href="/privacy" className="hover:text-zinc-200 transition-colors">
              {t("footer_privacy")}
            </Link>
            <Link href="/cookie-policy" className="hover:text-zinc-200 transition-colors">
              {t("footer_cookie")}
            </Link>
            <Link href="/accessibility" className="hover:text-zinc-200 transition-colors">
              {t("footer_accessibility")}
            </Link>
            <Link href="/refund" className="hover:text-zinc-200 transition-colors">
              {t("footer_refund")}
            </Link>
          </nav>
        </div>

        {/* Column 3: DSS & Standards */}
        <div className="md:col-span-3 flex flex-col gap-3">
          <span className="font-bold text-zinc-400 uppercase tracking-wider text-[10px]">
            {currentLocale === "ru-RU" ? "Стандарты и DSS" : "Standards & DSS"}
          </span>
          <div className="flex flex-col gap-2.5 text-left text-zinc-400">
            <button
              onClick={() => setModalOpen((prev) => ({ ...prev, eula: true }))}
              className="text-left bg-transparent border-none outline-none cursor-pointer hover:text-zinc-200 transition-colors"
            >
              {t("footer_eula")}
            </button>
            <button
              onClick={() => setModalOpen((prev) => ({ ...prev, fda: true }))}
              className="text-left bg-transparent border-none outline-none cursor-pointer hover:text-zinc-200 transition-colors"
            >
              {t("footer_fda")}
            </button>
          </div>
        </div>
      </div>

      {/* Footer Bottom Row */}
      <div className="max-w-7xl mx-auto pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <span className="text-[11px] text-zinc-500">
          &copy; 2026 {t("company_name")}. {t("footer_copy")}
        </span>
        <div className="text-[10px] text-zinc-600 max-w-2xl text-center sm:text-right leading-relaxed">
          {currentLocale === "ru-RU"
            ? "Дисклеймер: Алгоритмы и расчеты платформы носят вычислительный характер и не заменяют сертифицированные лабораторные испытания. Платформа не несет юридической ответственности за произведенные физические партии."
            : "Disclaimer: The platform's algorithms and calculations are computational in nature and do not replace certified laboratory testing. The platform bears no legal liability for physical batches produced."}
        </div>
      </div>

      {/* EULA / DSS Disclaimer Modal */}
      {modalOpen.eula && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-xl bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl relative p-6 max-h-[80vh] overflow-y-auto text-left">
            <button
              onClick={closeModals}
              className="absolute top-4 right-4 text-zinc-500 hover:text-zinc-300 cursor-pointer bg-transparent border-none text-base"
            >
              ✕
            </button>
            <h3 className="text-base font-bold text-zinc-100 mb-4 uppercase tracking-wider flex items-center gap-2">
              <ShieldAlert size={18} className="text-amber-400" />
              {t("eula_title")}
            </h3>
            <div className="text-xs text-zinc-400 flex flex-col gap-3 leading-relaxed">
              <p className="p-2.5 bg-amber-500/10 border border-amber-500/20 rounded text-amber-400 font-semibold">
                {t("eula_alert")}
              </p>
              <p>{t("eula_p1")}</p>
              <p>{t("eula_p2")}</p>
            </div>
            <div className="mt-6 flex justify-end">
              <button
                onClick={closeModals}
                className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg text-xs cursor-pointer border-none"
              >
                {t("btn_close")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FDA Compliance Modal */}
      {modalOpen.fda && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-xl bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl relative p-6 max-h-[80vh] overflow-y-auto text-left">
            <button
              onClick={closeModals}
              className="absolute top-4 right-4 text-zinc-500 hover:text-zinc-300 cursor-pointer bg-transparent border-none text-base"
            >
              ✕
            </button>
            <h3 className="text-base font-bold text-zinc-100 mb-4 uppercase tracking-wider flex items-center gap-2">
              <Building size={18} className="text-emerald-400" />
              {t("fda_title")}
            </h3>
            <div className="text-xs text-zinc-400 flex flex-col gap-3 leading-relaxed">
              <p>{t("fda_p1")}</p>
              <p>{t("fda_p2")}</p>
              <p>{t("fda_p3")}</p>
            </div>
            <div className="mt-6 flex justify-end">
              <button
                onClick={closeModals}
                className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg text-xs cursor-pointer border-none"
              >
                {t("btn_close")}
              </button>
            </div>
          </div>
        </div>
      )}
    </footer>
  );
};
