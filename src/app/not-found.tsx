"use client";

import React from "react";
import Link from "next/link";
import { useTranslation } from "@/context/I18nContext";
import { FileQuestion, Home } from "lucide-react";

export default function NotFound() {
  const { t, locale, setLocale } = useTranslation();
  const isRu = locale === "ru-RU";

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans theme-element relative overflow-hidden">
      {/* Background patterns */}
      <div className="absolute inset-0 bg-[radial-gradient(var(--grid-dot)_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none opacity-30" />
      <div className="absolute top-0 inset-x-0 h-[400px] bg-gradient-to-b from-indigo-500/5 via-purple-500/0 to-transparent pointer-events-none" />

      {/* Simplified Header */}
      <header className="h-16 border-b border-zinc-900 bg-zinc-950/80 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-50">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-white text-sm shadow-[0_0_15px_rgba(99,102,241,0.2)]">
            PN
          </div>
          <div>
            <span className="text-sm font-bold text-zinc-100 uppercase tracking-wider block">PharmNode</span>
            <span className="text-[9px] text-zinc-500 block leading-none">Formulation Studio</span>
          </div>
        </Link>

        <div className="flex items-center gap-4">
          <button
            onClick={() => setLocale(locale === "ru-RU" ? "en-US" : "ru-RU")}
            className="px-2.5 py-1.5 rounded-lg border border-zinc-800 bg-zinc-900/60 text-xs font-bold text-zinc-300 hover:text-zinc-100 hover:bg-zinc-800 transition-colors cursor-pointer theme-element"
          >
            {isRu ? "RU" : "EN"}
          </button>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 flex items-center justify-center p-6 relative z-10">
        <div className="w-full max-w-md bg-zinc-900/50 border border-zinc-800/80 rounded-2xl backdrop-blur-md p-6 md:p-8 shadow-2xl relative overflow-hidden text-center theme-element">
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-t-2xl" />
          
          <div className="flex flex-col items-center mb-6">
            <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-4 shadow-[0_0_15px_rgba(99,102,241,0.1)]">
              <FileQuestion size={28} className="animate-pulse" />
            </div>
            <h2 className="text-2xl font-bold text-zinc-100 uppercase tracking-wide">
              {t("error_404_title")}
            </h2>
            <p className="text-xs text-zinc-400 mt-3 leading-relaxed max-w-sm mx-auto">
              {t("error_404_desc")}
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <Link
              href="/"
              className="w-full py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-indigo-500/10 hover:shadow-indigo-500/20"
            >
              <Home size={14} />
              {t("error_404_btn")}
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
