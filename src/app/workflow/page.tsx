"use client";

import React from "react";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useTranslation } from "@/context/I18nContext";
import { ArrowLeft, Play, Beaker, Settings, CheckCircle } from "lucide-react";

const pageContent = {
  "en-US": {
    back: "Back to Home",
    title: "Compounding Workflow",
    subtitle: "A digital decision support environment to design, simulate, and validate pharmaceutical formulations",
    definition_title: "Structured Compounding Pipeline",
    definition_desc: "The digital compounding workflow streamlines drug design by replacing offline spreadsheet models with a guided three-step sequence: active ingredient specification, excipient mixing simulation, and automated GMP-compliant validation reporting.",
    step1_title: "Step 1: Active Ingredient & Target Specification",
    step1_desc: "The formulation process begins by adding the target active pharmaceutical ingredients (APIs). The technologist specifies target dosages (in milligrams or percentage) and imports pre-populated chemical profiles containing molecular weights, density properties, and safety limits. These settings configure the active baseline for the formulation project.",
    step2_title: "Step 2: Excipient Addition & Mixing Simulation",
    step2_desc: "Formulators drag and drop binders, diluents, lubricants, and disintegrants into the blending node. As concentration sliders are adjusted, the physical engine recalculates the composite blend properties (bulk/tapped density, Carr index, and Hausner ratio) with 4 decimal places of accuracy. Dynamic warning dialogs alert the user of compatibility failures, moisture sensitivities, or raw material limits.",
    step3_title: "Step 3: Punch Settings & GMP Specification Export",
    step3_desc: "Finally, the user configures the tablet press punch geometry (e.g. flat round, double convex, oval) and targets. The simulator calculates the corresponding tablet volume, porosity, and compressibility. If metrics satisfy GxP parameters, the system generates a validated GMP PDF report detailing full audit logs, technological instructions, and compatibility metrics.",
    summary_title: "Workflow Benefits",
    benefit_1: "Replaces unstandardized Excel files with a deterministic, trace-audited database.",
    benefit_2: "Detects ingredient role conflicts and regulatory errors in real-time, reducing laboratory waste.",
    benefit_3: "Saves up to 70% in formulation iteration cycles by predicting flowability scores prior to dry mixing."
  },
  "ru-RU": {
    back: "На главную",
    title: "Технологический процесс",
    subtitle: "Цифровая среда поддержки решений для разработки, симуляции и валидации рецептур",
    definition_title: "Этапы цифровой разработки",
    definition_desc: "Цифровой технологический процесс разработки лекарственных форм заменяет разрозненные Excel-таблицы на последовательность из трех шагов: выбор действующего вещества, симуляция смешивания порошков и автоматический аудит соответствия GMP.",
    step1_title: "Шаг 1: Выбор действующего вещества и дозировки",
    step1_desc: "Процесс начинается с добавления активных фармацевтических субстанций (АФС). Технолог задает дозировку (в мг или процентах) и импортирует из базы готовые химические характеристики (молекулярный вес, плотность, лимиты безопасности). Эти данные определяют основу для всей рецептуры.",
    step2_title: "Шаг 2: Выбор наполнителей и симуляция смеси",
    step2_desc: "Технолог добавляет связующие, разрыхлители и лубриканты в смеситель. При регулировании процентного ввода система рассчитывает интегральные свойства смеси (насыпную плотность, индекс Карра, коэффициент Хауснера) с точностью до 4 знаков. Движок предупреждает о плохой сыпучести порошка или конфликтах сырья.",
    step3_title: "Шаг 3: Настройка таблетпресса и экспорт GMP",
    step3_desc: "На завершающем этапе выбираются пуансоны пресса (круглые, овальные, двояковыпуклые) и параметры засыпки. Симулятор рассчитывает пористость и пороговую прочность таблетки. При соответствии нормам система формирует официальный GMP PDF-отчет с полным логом расчетов для передачи на завод.",
    summary_title: "Преимущества техпроцесса",
    benefit_1: "Заменяет разрозненные файлы Excel на структурированную базу данных с историей изменений (audit trail).",
    benefit_2: "Выявляет несовместимости ингредиентов и регуляторные ошибки в реальном времени, снижая затраты сырья.",
    benefit_3: "Сокращает время разработки рецептур до 70%, прогнозируя физические свойства до лабораторных тестов."
  }
};

export default function WorkflowPage() {
  const { locale } = useTranslation();
  const currentLang = (locale === "ru-RU") ? "ru-RU" : "en-US";
  const dict = pageContent[currentLang];

  const howToJsonLd = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    "name": currentLang === "ru-RU" ? "Как спроектировать рецептуру таблетки" : "How to design a stable tablet formulation",
    "description": currentLang === "ru-RU" ? "Пошаговая инструкция по моделированию смеси на платформе PharmNode." : "Step-by-step guide to modeling a compound formulation on PharmNode.",
    "step": [
      {
        "@type": "HowToStep",
        "name": dict.step1_title,
        "text": dict.step1_desc,
        "url": "https://pharmnode.com/workflow#step1"
      },
      {
        "@type": "HowToStep",
        "name": dict.step2_title,
        "text": dict.step2_desc,
        "url": "https://pharmnode.com/workflow#step2"
      },
      {
        "@type": "HowToStep",
        "name": dict.step3_title,
        "text": dict.step3_desc,
        "url": "https://pharmnode.com/workflow#step3"
      }
    ]
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col font-sans text-zinc-100 relative overflow-hidden">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howToJsonLd) }}
      />
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
            <Play size={16} />
            {dict.definition_title}
          </h2>
          <p className="text-sm sm:text-base text-zinc-300 font-medium leading-relaxed">
            {dict.definition_desc}
          </p>
        </section>

        {/* Steps Walkthrough */}
        <div className="flex flex-col gap-10 mb-16">
          <section className="p-6 rounded-2xl border border-zinc-900 bg-zinc-900/10 flex flex-col sm:flex-row gap-6 hover:border-zinc-800 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center shrink-0 border border-indigo-500/20">
              <Beaker size={24} />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-zinc-100 mb-2">{dict.step1_title}</h2>
              <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">{dict.step1_desc}</p>
            </div>
          </section>

          <section className="p-6 rounded-2xl border border-zinc-900 bg-zinc-900/10 flex flex-col sm:flex-row gap-6 hover:border-zinc-800 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center shrink-0 border border-indigo-500/20">
              <Settings size={24} />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-zinc-100 mb-2">{dict.step2_title}</h2>
              <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">{dict.step2_desc}</p>
            </div>
          </section>

          <section className="p-6 rounded-2xl border border-zinc-900 bg-zinc-900/10 flex flex-col sm:flex-row gap-6 hover:border-zinc-800 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center shrink-0 border border-indigo-500/20">
              <CheckCircle size={24} />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-zinc-100 mb-2">{dict.step3_title}</h2>
              <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">{dict.step3_desc}</p>
            </div>
          </section>
        </div>

        {/* Benefits List */}
        <section className="border-t border-zinc-900 pt-12">
          <h2 className="text-xl sm:text-2xl font-bold text-zinc-100 mb-6">{dict.summary_title}</h2>
          <ul className="flex flex-col gap-4">
            <li className="flex items-start gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2 shrink-0" />
              <p className="text-xs sm:text-sm text-zinc-400">{dict.benefit_1}</p>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2 shrink-0" />
              <p className="text-xs sm:text-sm text-zinc-400">{dict.benefit_2}</p>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2 shrink-0" />
              <p className="text-xs sm:text-sm text-zinc-400">{dict.benefit_3}</p>
            </li>
          </ul>
        </section>
      </main>

      <Footer />
    </div>
  );
}
