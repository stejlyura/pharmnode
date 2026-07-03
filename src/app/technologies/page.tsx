"use client";

import React from "react";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useTranslation } from "@/context/I18nContext";
import { ArrowLeft, Cpu, Settings, Activity } from "lucide-react";

const pageContent = {
  "en-US": {
    back: "Back to Home",
    title: "Computational Technology",
    subtitle: "Under the hood: mathematical equations, physical models, and our B2B tech stack",
    definition_title: "Deterministic Formulation Algorithms",
    definition_desc: "The computational engine evaluates powder flowability indices (Carr's Index and Hausner's Ratio) and tablet porosity values dynamically using classical physics and material density metrics with up to 4 decimal places of accuracy.",
    sec1_title: "1. Powder Flowability Calculations",
    sec1_desc: "Dry powder flow is evaluated using loose bulk density (ρB) and tapped bulk density (ρT). The Hausner Ratio (H) is defined as H = ρT / ρB. Carr's Index (C) is defined as C = 100 * (1 - ρB / ρT). PharmNode matches these values against established scales: Carr Index < 10 indicates 'Excellent' flow, while > 25 represents 'Poor' flowability.",
    sec2_title: "2. Porosity & Tablet Compression Models",
    sec2_desc: "Tablet porosity (ε) defines the ratio of empty voids inside the tablet matrix. It is computed from the tablet weight, punch geometry volume, and true density of the compound blend. Correct porosity target modeling (typically 12.00% to 18.00%) avoids capping defects while optimizing tablet dissolution rates.",
    sec3_title: "3. Robust B2B Software Stack",
    sec3_desc: "PharmNode is engineered for enterprise performance. The frontend is built on Next.js 16 and React 19 to enable SSG pre-rendering for SEO. The primary database runs PostgreSQL managed via Prisma ORM for relational user, project, and permission logging. Canvas graphs are stored in MongoDB to support unstructured node trees, and Paddle manages B2B subscriptions.",
    table_title: "Powder Flowability Classification Scale",
    table_subtitle: "Carr Index and Hausner Ratio values mapped to flow characteristics",
    col_carr: "Carr Index (%)",
    col_hausner: "Hausner Ratio",
    col_flow: "Flow Character",
    col_color: "Alert Level",
    scale_list: [
      { carr: "1 - 10", hausner: "1.00 - 1.11", flow: "Excellent", alert: "Normal" },
      { carr: "11 - 15", hausner: "1.12 - 1.18", flow: "Good", alert: "Normal" },
      { carr: "16 - 20", hausner: "1.19 - 1.25", flow: "Fair", alert: "Warning" },
      { carr: "21 - 25", hausner: "1.26 - 1.34", flow: "Passable", alert: "Warning" },
      { carr: "26 - 31", hausner: "1.35 - 1.45", flow: "Poor", alert: "Critical" },
      { carr: "32 - 37", hausner: "1.46 - 1.59", flow: "Very Poor", alert: "Critical" },
      { carr: "> 38", hausner: "> 1.60", flow: "Very, Very Poor", alert: "Critical" }
    ]
  },
  "ru-RU": {
    back: "На главную",
    title: "Технологии расчетов",
    subtitle: "Под капотом: математические уравнения, физические модели и стек B2B SaaS",
    definition_title: "Математический аппарат",
    definition_desc: "Вычислительное ядро оценивает индексы текучести порошков (индекс Карра, коэффициент Хауснера) и пористость таблеток динамически, используя физические формулы плотности веществ с точностью до 4 знаков.",
    sec1_title: "1. Формулы сыпучести порошка",
    sec1_desc: "Сыпучесть порошков оценивается по насыпной плотности (ρB) и плотности после усадки (ρT). Коэффициент Хауснера (H) рассчитывается как H = ρT / ρB. Индекс Карра (C) рассчитывается как C = 100 * (1 - ρB / ρT). Значения сопоставляются со стандартами: индекс Карра < 10 означает отличное качество смеси, а > 25 — неудовлетворительную сыпучесть.",
    sec2_title: "2. Физические модели пористости таблеток",
    sec2_desc: "Пористость (ε) показывает долю пустот в таблетке. Она рассчитывается на основе массы смеси, объема пуансона пресса и истинной плотности смеси. Правильное моделирование пористости (обычно в пределах 12.00% - 18.00%) позволяет избежать сколов и трещин («capping») при сохранении растворимости.",
    sec3_title: "3. Архитектура и стек технологий",
    sec3_desc: "Платформа PharmNode создана для высоких нагрузок. Интерфейс разработан на Next.js 16 и React 19 для серверного рендеринга и SEO. Реляционные данные пользователей и логов хранятся в PostgreSQL через Prisma ORM, а графы холста хранятся в MongoDB для гибкого ветвления нод. Платежи обрабатываются Paddle.",
    table_title: "Таблица классификации текучести порошков",
    table_subtitle: "Сопоставление индексов Карра и Хауснера со свойствами сыпучести",
    col_carr: "Индекс Карра (%)",
    col_hausner: "Коэф. Хауснера",
    col_flow: "Текучесть порошка",
    col_color: "Уровень риска",
    scale_list: [
      { carr: "1 - 10", hausner: "1.00 - 1.11", flow: "Отличная", alert: "Норма" },
      { carr: "11 - 15", hausner: "1.12 - 1.18", flow: "Хорошая", alert: "Норма" },
      { carr: "16 - 20", hausner: "1.19 - 1.25", flow: "Удовлетворительная", alert: "Внимание" },
      { carr: "21 - 25", hausner: "1.26 - 1.34", flow: "Приемлемая", alert: "Внимание" },
      { carr: "26 - 31", hausner: "1.35 - 1.45", flow: "Плохая", alert: "Критично" },
      { carr: "32 - 37", hausner: "1.46 - 1.59", flow: "Очень плохая", alert: "Критично" },
      { carr: "> 38", hausner: "> 1.60", flow: "Чрезвычайно плохая", alert: "Критично" }
    ]
  }
};

export default function TechnologiesPage() {
  const { locale } = useTranslation();
  const currentLang = (locale === "ru-RU") ? "ru-RU" : "en-US";
  const dict = pageContent[currentLang];

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col font-sans text-zinc-100 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(var(--grid-dot)_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none opacity-30" />
      <div className="absolute top-0 inset-x-0 h-[400px] bg-gradient-to-b from-indigo-500/5 via-purple-500/0 to-transparent pointer-events-none" />

      <Header showCanvasControls={false} />

      <main className="flex-1 max-w-5xl w-full mx-auto py-12 px-4 sm:px-6 lg:px-8 relative z-10">
        <Link href="/" className="inline-flex items-center gap-2 text-xs text-zinc-500 hover:text-indigo-400 transition-colors mb-8 group">
          <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
          {dict.back}
        </Link>

        <div className="pb-8 border-b border-zinc-900/60 mb-12">
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-zinc-100 via-zinc-200 to-indigo-400 bg-clip-text text-transparent">
            {dict.title}
          </h1>
          <p className="mt-4 text-sm text-zinc-400 max-w-2xl leading-relaxed">
            {dict.subtitle}
          </p>
        </div>

        {/* Answer-First Section */}
        <section className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800/80 backdrop-blur-md mb-12 relative">
          <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500 rounded-l-2xl" />
          <h2 className="text-sm font-bold text-indigo-400 uppercase tracking-widest mb-2 flex items-center gap-2">
            <Cpu size={16} />
            {dict.definition_title}
          </h2>
          <p className="text-sm sm:text-base text-zinc-300 font-medium leading-relaxed">
            {dict.definition_desc}
          </p>
        </section>

        {/* Equation Details */}
        <div className="flex flex-col gap-12 mb-16">
          <section className="flex flex-col gap-4">
            <h2 className="text-lg sm:text-xl font-bold text-zinc-100 flex items-center gap-2">
              <Activity size={18} className="text-indigo-400" />
              {dict.sec1_title}
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">{dict.sec1_desc}</p>
            <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 text-center font-mono text-xs sm:text-sm text-indigo-400">
              H = ρT / ρB &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; C = 100 * (1 - ρB / ρT)
            </div>
          </section>

          <section className="flex flex-col gap-4">
            <h2 className="text-lg sm:text-xl font-bold text-zinc-100 flex items-center gap-2">
              <Settings size={18} className="text-indigo-400" />
              {dict.sec2_title}
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">{dict.sec2_desc}</p>
          </section>

          <section className="flex flex-col gap-4">
            <h2 className="text-lg sm:text-xl font-bold text-zinc-100 flex items-center gap-2">
              <Cpu size={18} className="text-indigo-400" />
              {dict.sec3_title}
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">{dict.sec3_desc}</p>
          </section>
        </div>

        {/* Classification Table */}
        <section className="border-t border-zinc-900 pt-12">
          <div className="mb-8">
            <h2 className="text-xl sm:text-2xl font-bold text-zinc-100">{dict.table_title}</h2>
            <p className="text-xs text-zinc-400 mt-1">{dict.table_subtitle}</p>
          </div>

          <div className="overflow-x-auto rounded-xl border border-zinc-900 bg-zinc-950">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-zinc-900 bg-zinc-900/40 text-zinc-300 font-bold uppercase tracking-wider">
                  <th className="py-4 px-6">{dict.col_carr}</th>
                  <th className="py-4 px-6">{dict.col_hausner}</th>
                  <th className="py-4 px-6">{dict.col_flow}</th>
                  <th className="py-4 px-6 text-indigo-400">{dict.col_color}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-900 text-zinc-400">
                {dict.scale_list.map((item, idx) => (
                  <tr key={idx} className="hover:bg-zinc-900/20 transition-colors">
                    <td className="py-4 px-6 font-medium text-zinc-300 font-mono">{item.carr}</td>
                    <td className="py-4 px-6 font-mono">{item.hausner}</td>
                    <td className="py-4 px-6 text-zinc-200 font-semibold">{item.flow}</td>
                    <td className="py-4 px-6">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        item.alert === "Normal" || item.alert === "Норма"
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          : item.alert === "Warning" || item.alert === "Внимание"
                          ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                          : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                      }`}>
                        {item.alert}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
