"use client";

import React from "react";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useTranslation } from "@/context/I18nContext";
import { 
  ArrowLeft, 
  Play, 
  Beaker, 
  Settings, 
  CheckCircle,
  FileText,
  ChevronRight,
  Sparkles,
  Layers,
  Activity,
  AlertTriangle
} from "lucide-react";

const pageContent = {
  "en-US": {
    back: "Back to Home",
    title: "Technological Workflow",
    subtitle: "A digital workspace to model, simulate, and compile pharmaceutical formulations from concept to CDMO-ready GxP reports",
    
    // Canva analogy
    analogy_badge: "The Canva of Formulation Design",
    analogy_title: "How It Works: Visual drag-and-drop compounding",
    analogy_desc: "Traditional pharmaceutical R&D relies on disjointed spreadsheets or heavy molecular modeling software. PharmNode Studio replaces AutoCAD-like complexity with a clean, interactive node canvas. Technologists can map formulas, run flowability calculations, and export compliant documentation in minutes.",

    // Steps
    step1_title: "Step 1: Ingredients & Target Baseline",
    step1_tag: "Define active substances & excipients",
    step1_desc: "Begin by adding ingredient nodes to your workspace. Import active substances (APIs) and excipients from our B2B database or create custom materials. Specify target concentrations (mg or %). The system automatically loads critical physical profiles, including bulk, tapped, and true skeletal densities.",
    
    step2_title: "Step 2: Interactive Blending & Flow Simulation",
    step2_tag: "Real-time physical & chemical screening",
    step2_desc: "Connect ingredient nodes to the Blending Node. As you slide concentrations, the calculation engine dynamically computes the blend's bulk properties (Carr's Index and Hausner's Ratio) to 4 decimal places. The expert rule-based compatibility engine monitors 35 chemical classes, warning you immediately of potential conflicts, such as Maillard browning or alkaline oxidation.",
    
    step3_title: "Step 3: Compaction & GMP Documentation Export",
    step3_desc: "Route the blend to the Tablet Press Node. Choose die shapes (round, oval, capsule) and target dimensions. The simulator computes recommended tablet weight, volume, and porosity. Once validated, click to generate a secure, GMP-compliant PDF report detailing calculation logs, safety warnings, and CDMO transfer details.",
    
    // Visual Mock Canvas translations
    canvas_mock_title: "Interactive Canvas Simulation",
    canvas_mock_subtitle: "Visualizing the node-based compounding pipeline",
    node_api: "API: Vitamin C",
    node_filler: "Filler: Lactose",
    node_lubricant: "Lubricant: Magnesium Stearate",
    node_blender: "Blending & Mixing Node",
    node_press: "Tablet Press Node",
    node_output: "GMP PDF Output Node",
    warn_maillard: "Warning: Potential Maillard Reaction!",
    calc_flow: "Flowability: Fair (Hausner: 1.20)",
    calc_porosity: "Porosity: 0.12 (Optimal)",

    // Benefits
    summary_title: "Key Workflow Advantages",
    benefit_1: "Replaces unstandardized Excel files with a deterministic, trace-audited system.",
    benefit_2: "Detects chemical and physical incompatibilities in real-time, reducing laboratory waste.",
    benefit_3: "Saves up to 80% in formulation iteration cycles by screening hypotheses virtually.",

    // CTA
    cta_title: "Ready to Create Your First Formulation?",
    cta_subtitle: "Launch the node-based studio now to simulate your dry powder mix and verify safety rules.",
    cta_btn: "Launch Configurator",
    cta_subtext: "Free tier supports up to 3 ingredients per recipe. No credit card required."
  },
  "ru-RU": {
    back: "На главную",
    title: "Технологический процесс",
    subtitle: "Цифровой рабочий процесс моделирования, симуляции и сборки лекарственных форм от идеи до готового GMP-отчета",
    
    // Canva analogy
    analogy_badge: "Canva для разработки формуляций",
    analogy_title: "Как это работает: визуальное проектирование рецептур",
    analogy_desc: "Традиционная фармацевтическая разработка полагается на разрозненные Excel-файлы или тяжелый САПР-подобный софт. PharmNode Studio заменяет эту сложность интуитивно понятным интерактивным холстом. Технолог заходит в браузер, собирает рецептуру из нод и за минуты получает готовый расчет с учетом всех правил совместимости.",

    // Steps
    step1_title: "Шаг 1: Добавление ингредиентов",
    step1_tag: "Задайте действующие вещества и наполнители",
    step1_desc: "Начните с добавления нод сырья на холст. Выбирайте АФС и вспомогательные вещества из B2B базы данных или добавляйте собственные материалы. Укажите дозировки в процентах или мг. Система автоматически загрузит физико-химические профили, включая насыпную и истинную плотность.",
    
    step2_title: "Шаг 2: Симуляция смеси и совместимости",
    step2_tag: "Расчет физических свойств и хим. скрининг в реальном времени",
    step2_desc: "Соедините ноды сырья со Смесителем. При изменении дозировок ползунками система на лету пересчитывает индекс Карра и коэффициент Хауснера с точностью до 4 знаков. База правил (35 классов) мгновенно подсвечивает связи красным при риске реакции Майяра или щелочного гидролиза.",
    
    step3_title: "Шаг 3: Прессование и экспорт отчета GMP",
    step3_desc: "Направьте смесь в ноду Таблетпресса. Настройте геометрию пуансона (круглый, овальный) и параметры засыпки. Симулятор посчитает объем, пористость и рекомендуемый вес таблетки. При соответствии нормам выгрузите защищенный GMP PDF-отчет с журналом аудита для производства (CDMO).",
    
    // Visual Mock Canvas translations
    canvas_mock_title: "Интерактивная симуляция холста",
    canvas_mock_subtitle: "Визуализация процесса сборки рецептуры из нод",
    node_api: "АФС: Витамин C",
    node_filler: "Наполнитель: Лактоза",
    node_lubricant: "Лубрикант: Магния Стеарат",
    node_blender: "Смеситель и Расчеты",
    node_press: "Таблетпресс и Прессование",
    node_output: "Выгрузка GMP PDF",
    warn_maillard: "Внимание: Реакция Майяра!",
    calc_flow: "Текучесть: Допустимая (Хауснер: 1.20)",
    calc_porosity: "Пористость: 0.12 (Оптимально)",

    // Benefits
    summary_title: "Преимущества техпроцесса PharmNode",
    benefit_1: "Заменяет разрозненные файлы Excel на структурированную базу данных с историей изменений (audit trail).",
    benefit_2: "Выявляет несовместимости ингредиентов и ошибки формулирования до закупки сырья.",
    benefit_3: "Сокращает время R&D R&D-циклов на 80%, позволяя отсекать несыпучие порошки виртуально.",

    // CTA
    cta_title: "Готовы создать свою первую формуляцию?",
    cta_subtitle: "Запустите визуальный редактор прямо сейчас, чтобы смоделировать рецептуру и проверить правила безопасности.",
    cta_btn: "Запустить конфигуратор",
    cta_subtext: "Бесплатный тариф позволяет добавлять до 3 ингредиентов. Регистрация карты не требуется."
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
      
      {/* Background Dots */}
      <div className="absolute inset-0 bg-[radial-gradient(var(--grid-dot)_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none opacity-20" />
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-[600px] h-[600px] bg-purple-500/5 rounded-full blur-[140px] pointer-events-none" />

      <Header showCanvasControls={false} />

      <main className="flex-1 max-w-5xl w-full mx-auto py-12 px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Back Link */}
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-xs font-semibold text-zinc-500 hover:text-indigo-400 transition-colors mb-8 group"
        >
          <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
          {dict.back}
        </Link>

        {/* Heading */}
        <div className="pb-8 border-b border-zinc-900/60 mb-12">
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-zinc-100 via-zinc-200 to-indigo-400 bg-clip-text text-transparent leading-tight">
            {dict.title}
          </h1>
          <p className="mt-4 text-base sm:text-lg text-zinc-400 max-w-3xl leading-relaxed">
            {dict.subtitle}
          </p>
        </div>

        {/* Canva Analogy Intro Block (GEO Answer-First) */}
        <section className="relative rounded-2xl bg-zinc-900/40 border border-zinc-800/80 p-6 sm:p-8 backdrop-blur-xl mb-16 shadow-lg">
          <div className="absolute -top-3 left-6 px-3 py-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full text-[10px] font-extrabold uppercase tracking-widest text-white shadow">
            {dict.analogy_badge}
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-zinc-150 mb-3 mt-1">
            {dict.analogy_title}
          </h2>
          <p className="text-xs sm:text-sm text-zinc-350 leading-relaxed font-medium">
            {dict.analogy_desc}
          </p>
        </section>

        {/* Visual Mock Canvas Illustration */}
        <section className="mb-16 border border-zinc-900 rounded-2xl bg-zinc-950 p-6 sm:p-8 relative overflow-hidden shadow-inner">
          <div className="mb-6">
            <h3 className="text-base font-bold text-zinc-200">{dict.canvas_mock_title}</h3>
            <p className="text-xs text-zinc-500 mt-1">{dict.canvas_mock_subtitle}</p>
          </div>

          {/* Canvas mock grid representation */}
          <div className="relative border border-zinc-900 bg-zinc-900/10 rounded-xl p-6 flex flex-col md:flex-row gap-8 items-center justify-between min-h-[300px] overflow-hidden">
            {/* Dots background for mock workspace */}
            <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.05)_1px,transparent_1px)] [background-size:12px_12px] pointer-events-none" />

            {/* Left Column: Ingredient Nodes */}
            <div className="flex flex-col gap-4 relative z-10 w-full md:w-[28%]">
              {/* Ingredient Node 1 */}
              <div className="p-3 rounded-lg border border-zinc-850 bg-zinc-950/80 backdrop-blur shadow-sm hover:border-zinc-700 transition-colors">
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-[10px] font-bold text-zinc-350 truncate">{dict.node_api}</span>
                  <span className="text-[8px] px-1 bg-indigo-500/15 text-indigo-400 font-extrabold rounded">15%</span>
                </div>
                <div className="w-full bg-zinc-900 h-1 rounded-full overflow-hidden">
                  <div className="bg-indigo-500 h-full w-[15%]" />
                </div>
              </div>

              {/* Ingredient Node 2 */}
              <div className="p-3 rounded-lg border border-rose-950/40 bg-zinc-950/80 backdrop-blur shadow-sm hover:border-rose-900/30 transition-colors relative">
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-[10px] font-bold text-zinc-350 truncate">{dict.node_filler}</span>
                  <span className="text-[8px] px-1 bg-purple-500/15 text-purple-400 font-extrabold rounded">80%</span>
                </div>
                <div className="w-full bg-zinc-900 h-1 rounded-full overflow-hidden mb-1.5">
                  <div className="bg-purple-500 h-full w-[80%]" />
                </div>
                {/* Warning inside node */}
                <div className="flex items-center gap-1 text-[8px] text-rose-400 font-semibold bg-rose-500/5 p-1 rounded border border-rose-500/10">
                  <AlertTriangle size={10} className="shrink-0" />
                  <span className="truncate">{dict.warn_maillard}</span>
                </div>
              </div>

              {/* Ingredient Node 3 */}
              <div className="p-3 rounded-lg border border-zinc-850 bg-zinc-950/80 backdrop-blur shadow-sm hover:border-zinc-700 transition-colors">
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-[10px] font-bold text-zinc-350 truncate">{dict.node_lubricant}</span>
                  <span className="text-[8px] px-1 bg-emerald-500/15 text-emerald-400 font-extrabold rounded">5%</span>
                </div>
                <div className="w-full bg-zinc-900 h-1 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-full w-[5%]" />
                </div>
              </div>
            </div>

            {/* SVG Connection Lines */}
            <div className="hidden md:block absolute inset-0 pointer-events-none z-0">
              <svg className="w-full h-full">
                {/* Connection API -> Blender */}
                <path d="M 280 100 Q 320 100 350 150" fill="none" stroke="#6366f1" strokeWidth="1.5" strokeDasharray="4 2" />
                {/* Connection Filler -> Blender (Warning: Red) */}
                <path d="M 280 160 Q 320 160 350 160" fill="none" stroke="#f43f5e" strokeWidth="2" />
                {/* Connection Lubricant -> Blender */}
                <path d="M 280 220 Q 320 220 350 170" fill="none" stroke="#10b981" strokeWidth="1.5" strokeDasharray="4 2" />
                
                {/* Connection Blender -> Press */}
                <path d="M 520 160 Q 560 160 590 160" fill="none" stroke="#a855f7" strokeWidth="1.5" strokeDasharray="4 2" />
                
                {/* Connection Press -> Output */}
                <path d="M 760 160 Q 800 160 830 160" fill="none" stroke="#eab308" strokeWidth="1.5" strokeDasharray="4 2" />
              </svg>
            </div>

            {/* Middle Node: Blender */}
            <div className="p-4 rounded-xl border border-indigo-500/20 bg-zinc-950/90 shadow-[0_0_15px_rgba(99,102,241,0.1)] relative z-10 w-full md:w-[32%]">
              <div className="flex items-center gap-2 mb-2 pb-2 border-b border-zinc-900">
                <div className="w-2 h-2 rounded-full bg-indigo-500 animate-ping" />
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-indigo-400">{dict.node_blender}</span>
              </div>
              <div className="flex flex-col gap-2 font-mono text-[9px] text-zinc-400">
                <div className="flex justify-between bg-zinc-900/50 p-1.5 rounded">
                  <span>Carr Index:</span>
                  <span className="text-emerald-400 font-bold">16.67%</span>
                </div>
                <div className="flex justify-between bg-zinc-900/50 p-1.5 rounded">
                  <span>Hausner:</span>
                  <span className="text-emerald-400 font-bold">1.20</span>
                </div>
                <div className="text-[8px] font-sans text-zinc-500 mt-1">
                  {dict.calc_flow}
                </div>
              </div>
            </div>

            {/* Right-Middle Node: Press */}
            <div className="p-4 rounded-xl border border-purple-500/20 bg-zinc-950/90 shadow-[0_0_15px_rgba(168,85,247,0.1)] relative z-10 w-full md:w-[28%]">
              <div className="flex items-center gap-2 mb-2 pb-2 border-b border-zinc-900">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-purple-400">{dict.node_press}</span>
              </div>
              <div className="flex flex-col gap-2 font-mono text-[9px] text-zinc-400">
                <div className="flex justify-between bg-zinc-900/50 p-1.5 rounded">
                  <span>Volume:</span>
                  <span className="text-purple-400 font-bold">0.45 cm³</span>
                </div>
                <div className="flex justify-between bg-zinc-900/50 p-1.5 rounded">
                  <span>Porosity:</span>
                  <span className="text-purple-400 font-bold">12.5%</span>
                </div>
                <div className="text-[8px] font-sans text-zinc-500 mt-1">
                  {dict.calc_porosity}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Dynamic Timeline Steps */}
        <section className="mb-16">
          <div className="relative pl-6 sm:pl-8 border-l border-zinc-900 flex flex-col gap-16">
            
            {/* Step 1 */}
            <div className="relative">
              <div className="absolute -left-[37px] sm:-left-[45px] top-1 w-6 h-6 sm:w-8 sm:h-8 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-xs sm:text-sm shadow">
                1
              </div>
              <div>
                <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest block mb-1">
                  {dict.step1_tag}
                </span>
                <h3 className="text-lg sm:text-xl font-bold text-zinc-100 mb-3">{dict.step1_title}</h3>
                <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed max-w-3xl">{dict.step1_desc}</p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="relative">
              <div className="absolute -left-[37px] sm:-left-[45px] top-1 w-6 h-6 sm:w-8 sm:h-8 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-xs sm:text-sm shadow">
                2
              </div>
              <div>
                <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest block mb-1">
                  {dict.step2_tag}
                </span>
                <h3 className="text-lg sm:text-xl font-bold text-zinc-100 mb-3">{dict.step2_title}</h3>
                <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed max-w-3xl">{dict.step2_desc}</p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="relative">
              <div className="absolute -left-[37px] sm:-left-[45px] top-1 w-6 h-6 sm:w-8 sm:h-8 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-xs sm:text-sm shadow">
                3
              </div>
              <div>
                <span className="text-[10px] font-bold text-purple-400 uppercase tracking-widest block mb-1">
                  GMP COMPLIANT
                </span>
                <h3 className="text-lg sm:text-xl font-bold text-zinc-100 mb-3">{dict.step3_title}</h3>
                <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed max-w-3xl">{dict.step3_desc}</p>
              </div>
            </div>

          </div>
        </section>

        {/* Benefits Summary List */}
        <section className="border-t border-zinc-900 pt-12 mb-16">
          <h2 className="text-xl sm:text-2xl font-bold text-zinc-100 mb-6">{dict.summary_title}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-5 rounded-xl border border-zinc-900 bg-zinc-900/10 hover:border-zinc-800 transition-colors">
              <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mb-3" />
              <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">{dict.benefit_1}</p>
            </div>
            <div className="p-5 rounded-xl border border-zinc-900 bg-zinc-900/10 hover:border-zinc-800 transition-colors">
              <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mb-3" />
              <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">{dict.benefit_2}</p>
            </div>
            <div className="p-5 rounded-xl border border-zinc-900 bg-zinc-900/10 hover:border-zinc-800 transition-colors">
              <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mb-3" />
              <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">{dict.benefit_3}</p>
            </div>
          </div>
        </section>

        {/* CTA (Call To Action) Section */}
        <section className="relative rounded-2xl bg-gradient-to-br from-indigo-950/40 via-purple-950/20 to-zinc-950 border border-indigo-500/20 p-8 sm:p-12 text-center overflow-hidden shadow-[0_0_50px_rgba(99,102,241,0.15)] mb-8">
          <div className="absolute -top-12 -right-12 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10 max-w-2xl mx-auto flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-4">
              <Sparkles size={20} className="animate-pulse" />
            </div>
            
            <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-100 tracking-tight mb-4">
              {dict.cta_title}
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed mb-8">
              {dict.cta_subtitle}
            </p>

            <Link
              href="/configurator"
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white rounded-xl text-sm font-extrabold shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/35 hover:scale-[1.02] active:scale-[0.98] transition-all group cursor-pointer"
            >
              {dict.cta_btn}
              <ChevronRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
            </Link>

            <p className="text-[10px] text-zinc-500 mt-4 leading-normal">
              {dict.cta_subtext}
            </p>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}
