"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RotateCcw, Home } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { logger } from "@/lib/logger";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorBoundary({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log the error to our structured logging service
    logger.error("Unhandled runtime error captured by root boundary", error, "react_error_boundary");
  }, [error]);

  // Read cookie locale manually for full robustness if I18nProvider context is crashed
  let isRu = false;
  if (typeof window !== "undefined") {
    try {
      const match = document.cookie.match(/pharmnode-locale=([^;]+)/);
      if (match && match[1] === "ru-RU") {
        isRu = true;
      } else {
        const lang = navigator.language || "";
        if (lang.toLowerCase().includes("ru")) {
          isRu = true;
        }
      }
    } catch (e) {
      console.warn("Failed to detect locale in ErrorBoundary, defaulting to EN", e);
    }
  }

  const title = isRu ? "500 - Критический сбой симуляции" : "500 - Critical Formulation Failure";
  const desc = isRu 
    ? "Система моделирования столкнулась с непредвиденным исключением. Не удалось стабилизировать реакцию."
    : "The simulation engine encountered an unhandled exception. The reaction could not be stabilized.";
  const retryBtn = isRu ? "Повторить попытку" : "Re-run Simulation";
  const homeBtn = isRu ? "Прервать и вернуться на главную" : "Abort and Return Home";
  const diagnosticsTitle = isRu ? "Лог диагностического исключения" : "Diagnostic Exception Log";

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
            <span className="text-[9px] text-zinc-500 block leading-none">Security Core</span>
          </div>
        </Link>

        <ThemeToggle />
      </header>

      {/* Main content */}
      <main className="flex-1 flex items-center justify-center p-4 md:p-6 relative z-10">
        <div className="w-full max-w-xl bg-zinc-900/50 border border-zinc-800/80 rounded-2xl backdrop-blur-md p-6 md:p-8 shadow-2xl relative overflow-hidden theme-element">
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-red-500 via-rose-600 to-amber-500 rounded-t-2xl" />
          
          <div className="flex flex-col items-center text-center mb-6">
            <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 mb-4 shadow-[0_0_15px_rgba(239,68,68,0.1)]">
              <AlertTriangle size={28} className="animate-pulse" />
            </div>
            <h2 className="text-2xl font-bold text-zinc-100 uppercase tracking-wide">
              {title}
            </h2>
            <p className="text-xs text-zinc-400 mt-3 leading-relaxed max-w-md mx-auto">
              {desc}
            </p>
          </div>

          {/* Diagnostic Log */}
          <div className="bg-zinc-950/80 border border-zinc-850 p-4 rounded-xl mb-6 text-left">
            <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block mb-2">
              {diagnosticsTitle}
            </span>
            <div className="max-h-40 overflow-y-auto text-[11px] font-mono text-zinc-450 leading-relaxed break-all whitespace-pre-wrap">
              <div className="text-red-400 font-bold mb-1">{error.name || "Error"}: {error.message || "Unknown error"}</div>
              {error.stack && <div className="text-zinc-500 mt-1.5 opacity-80">{error.stack}</div>}
              {error.digest && <div className="text-indigo-400 mt-1">Digest: {error.digest}</div>}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => reset()}
              className="flex-1 py-2.5 bg-indigo-500 hover:bg-indigo-650 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-lg shadow-indigo-500/10 hover:shadow-indigo-500/20"
            >
              <RotateCcw size={14} />
              {retryBtn}
            </button>
            <Link
              href="/"
              className="flex-1 py-2.5 bg-zinc-800 hover:bg-zinc-750 border border-zinc-700 hover:border-zinc-650 text-zinc-300 hover:text-zinc-100 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer text-center"
            >
              <Home size={14} />
              {homeBtn}
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
