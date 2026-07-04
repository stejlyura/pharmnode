"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useTranslation } from "@/context/I18nContext";
import { 
  ArrowLeft, 
  BookOpen, 
  AlertCircle, 
  Sparkles, 
  TrendingUp,
  FlaskConical,
  Building,
  Apple,
  ChevronRight,
  ShieldAlert,
  CheckCircle,
  HelpCircle,
  Undo
} from "lucide-react";

const pageContent = {
  "en-US": {
    back: "Back to Home",
    title: "Practical Use Cases",
    subtitle: "Real-world examples of how formulation technologists resolve compounding & tablet pressing challenges digitally",
    
    // Canva analogy
    analogy_badge: "The Canva of Formulation Design",
    analogy_title: "Canva for Chemists: Solving complex B2B scenarios in a single click",
    analogy_desc: "Forget physical trial-and-error testing or heavy molecular modeling suites. PharmNode allows R&D labs, supplement brands, and CDMO factories to optimize powder flow, prevent mechanical defects like capping, and substitute incompatible excipients instantly.",

    // Interactive Demo
    demo_title: "Visual Formulation Optimizer",
    demo_subtitle: "Click the buttons below to toggle between a conflict-prone formulation and its optimized equivalent.",
    tab_before: "Initial Formula (2 Conflicts)",
    tab_after: "Optimized Formula (100% Stable)",
    
    // Before states
    label_api: "API: Glucosamine HCl",
    label_filler_before: "Filler: Lactose Monohydrate",
    label_lubricant_before: "Lubricant: Magnesium Stearate",
    status_conflict: "CONFLICT",
    status_stable: "STABLE",
    err_maillard: "Maillard Browning Risk!",
    err_alkaline: "Alkaline Hydrolysis Risk!",
    desc_before: "In this formulation, Lactose reacts with the primary amine group of Glucosamine (Maillard Reaction). Additionally, Magnesium Stearate creates an alkaline microenvironment, threatening active molecule stability.",

    // After states
    label_filler_after: "Filler: Mannitol (Allergen Free)",
    label_lubricant_after: "Lubricant: Sodium Stearyl Fumarate (PRUV)",
    desc_after: "Lactose is replaced with Mannitol (non-reducing), eliminating the Maillard reaction. Magnesium Stearate is replaced with PRUV (neutral pH), preserving API integrity. Compounding flowability index rises to 'Excellent'.",

    // Scenarios
    scenarios_title: "Target B2B Scenarios",
    scenarios_subtitle: "How different sectors apply PharmNode to streamline R&D",
    
    sc1_title: "R&D Laboratories",
    sc1_desc: "Virtual prototyping of new dosage forms before ordering chemical reagents. Technologists screen 10 virtual formulation hypotheses in one evening, discarding 8 poor-flow or high-porosity variations, and test only the top 2 candidates physically.",
    
    sc2_title: "Contract Manufacturing (CDMO)",
    sc2_desc: "Rapid manufacturability audits of client-supplied formulations. Prevent tablet capping, lamination, and inconsistent die filling during high-speed compression tests by optimizing punch geometries and lubrication indexes before setting up the press.",
    
    sc3_title: "Dietary Supplement & Sports Nutrition Brands",
    sc3_desc: "Designing allergen-free, clean-label solid doses without milk or lactose allergens (FALCPA compliance). Replace costly chemical consultants with a browser-based expert system that checks rules automatically.",

    // Case Studies Detailed
    cases_section_title: "In-Depth Case Studies",
    case1_title: "Case Study 1: Excipient Flowability Tuning",
    case1_prob: "A pharmaceutical formulation containing 15% Active Ingredient exhibits poor powder flowability (bulk density 0.38 g/cm³, tapped density 0.51 g/cm³), resulting in a Carr Index of 25.49% and a Hausner Ratio of 1.3421. This poor flow leads to inconsistent die filling and significant tablet weight variations during high-speed compression tests.",
    case1_sol: "Using the PharmNode canvas editor, the technologist simulates adding 1.5% colloidal silicon dioxide (Aerosil 200) as a glidant, and 35% microcrystalline cellulose (Avicel pH-102) as a binder/diluent. The simulator automatically models the updated tapped density profile, predicting an improved Carr Index of 12.00% (Excellent flowability) and stabilizing the target tablet weight.",
    case1_metric: "Flow Index: Poor (25) → Excellent (12)",
    
    case2_title: "Case Study 2: Preventing Tablet Capping & Lamination",
    case2_prob: "A high-dose 500mg Calcium Carbonate blend undergoes severe capping (where the top crown splits from the main body) when pressed using a flat 10.0mm round punch design under 15kN of compression force. The high pressure profile combined with low binder volume results in excessive air entrapment and tablet lamination.",
    case2_sol: "The formulator switches the simulated tablet punch geometry on the Output Node to a double-convex 11.0mm oval punch and reduces compression targets. The geometric simulator models a decreased thickness vector and calculates a safe target porosity of 15.00%. This enables mechanical stability and prevents lamination at a lower force of 8kN.",
    case2_metric: "Force Required: 15kN → 8kN",
    
    case3_title: "Case Study 3: Chemical Incompatibility & Allergen Substitution",
    case3_prob: "An R&D laboratory designs a new chewable tablet containing Glucosamine Hydrochloride (which possesses a primary amine group) and Lactose Monohydrate (a reducing sugar). During initial stability predictions, the compatibility engine flags a critical risk of Maillard reaction browning (chemical rating 40%), plus a FALCPA warning for milk/lactose allergens.",
    case3_sol: "To resolve both concerns, the technologist substitutes Lactose Monohydrate with Mannitol (a non-reducing sugar alcohol) in the formulation canvas. The rule-based check instantly updates the compatibility score to 100% (Compliant) and clears the allergen warning, allowing clean export of the GMP technology spec.",
    case3_metric: "Compatibility Rating: 40% → 100% Compliant",

    // Summary
    summary_title: "Summary of Value Realized",
    table_feature: "Problem Class",
    table_defect: "Formulation Defect",
    table_solution: "Digital Simulation Strategy",
    table_metric: "Resulting Metric",
    summary_list: [
      { name: "Powder Flow", defect: "Inconsistent weight (Carr 25+)", solution: "Model glidant (Aerosil) & binder ratios", metric: "Carr Index 12.00% (Excellent)" },
      { name: "Tablet Press", defect: "Capping / Lamination", solution: "Modify punch geometry & porosity level", metric: "Pressure 15kN → 8kN at 15% Porosity" },
      { name: "Compatibility", defect: "Maillard browning / Milk allergen", solution: "Substitute lactose with mannitol", metric: "100% chemical compatibility score" }
    ],

    // CTA
    cta_title: "Test Your Formulation Hypothesis Instantly",
    cta_subtitle: "Prevent chemical reactions and mechanical tablet defects before entering the cleanroom.",
    cta_btn: "Launch Configurator",
    cta_subtext: "Includes our standard B2B database of 35 chemical classes and physical simulation metrics."
  },
  "ru-RU": {
    back: "На главную",
    title: "Практические кейсы",
    subtitle: "Примеры решения реальных производственных задач моделирования и таблетирования в цифровом виде",
    
    // Canva analogy
    analogy_badge: "Canva для разработки формуляций",
    analogy_title: "Canva для химиков: решение сложных B2B кейсов в один клик",
    analogy_desc: "Забудьте о методе физических проб и ошибок или тяжелом научном софте. PharmNode позволяет R&D лабораториям, брендам БАД и контрактным заводам оптимизировать сыпучесть смесей, предотвращать брак таблетирования и заменять несовместимые ингредиенты за секунды.",

    // Interactive Demo
    demo_title: "Визуальный оптимизатор рецептур",
    demo_subtitle: "Переключайтесь между исходной формулой с конфликтами и ее оптимизированной версией.",
    tab_before: "Исходный рецепт (2 Конфликта)",
    tab_after: "Оптимизированный рецепт (100% Стабилен)",
    
    // Before states
    label_api: "АФС: Глюкозамин HCl",
    label_filler_before: "Наполнитель: Лактоза моногидрат",
    label_lubricant_before: "Лубрикант: Магния Стеарат",
    status_conflict: "КОНФЛИКТ",
    status_stable: "НОРМА",
    err_maillard: "Реакция Майяра!",
    err_alkaline: "Щелочной гидролиз!",
    desc_before: "В этой формуле лактоза реагирует с первичной аминогруппой глюкозамина (реакция Майяра). Дополнительно, стеарат магния создает щелочную среду, снижая стабильность действующего вещества.",

    // After states
    label_filler_after: "Наполнитель: Маннит (Без аллергенов)",
    label_lubricant_after: "Лубрикант: Натрия Стеарил Фумарат (PRUV)",
    desc_after: "Лактоза заменена на маннит (невосстанавливающий спирт), что устраняет реакцию Майяра. Стеарат магния заменен на нейтральный PRUV, сохраняя активность АФС. Текучесть смеси выросла до 'Отличной'.",

    // Scenarios
    scenarios_title: "Целевые сценарии применения (B2B)",
    scenarios_subtitle: "Как различные отрасли используют PharmNode для оптимизации R&D",
    
    sc1_title: "Лаборатории R&D",
    sc1_desc: "Виртуальное прототипирование новых лекарственных форм до заказа дорогостоящих реактивов. Технолог за вечер тестирует 10 гипотез, отсекает 8 плохих или высокопористых вариантов и передает в лабораторию только 2 наиболее перспективных образца.",
    
    sc2_title: "Контрактные производства (CDMO)",
    sc2_desc: "Быстрый аудит рецептур, присланных заказчиками. Предотвращение расслоения таблеток, «capping»-эффекта и нестабильности веса на прессах высокой мощности путем оптимизации геометрии пуансонов и лубрикантов до настройки оборудования.",
    
    sc3_title: "Бренды БАД и спортивного питания",
    sc3_desc: "Разработка чистых рецептур (clean label) без содержания аллергенов молока и лактозы (соответствие стандартам FALCPA). Замена дорогих услуг химических консультантов на интерактивную экспертную систему с автопроверкой правил.",

    // Case Studies Detailed
    cases_section_title: "Детальный разбор кейсов",
    case1_title: "Кейс 1: Настройка сыпучести смеси",
    case1_prob: "Рецептура с 15% активного вещества показывает плохую сыпучесть порошка (насыпная плотность 0.38 г/см³, плотность после усадки 0.51 г/см³), что дает индекс Карра 25.49% и коэффициент Хауснера 1.3421. Это вызывает разброс массы таблеток при прессовании из-за неравномерного заполнения матриц.",
    case1_sol: "В конфигураторе PharmNode технолог симулирует введение 1.5% Аэросила (Aerosil 200) в качестве скользящего вещества и 35% микрокристаллической целлюлозы (Avicel pH-102) как связующего. Физический симулятор рассчитывает плотность и прогнозирует индекс Карра на уровне 12.00% (отличная сыпучесть), стабилизируя вес таблеток.",
    case1_metric: "Текучесть: Плохая (25) → Отличная (12)",
    
    case2_title: "Кейс 2: Предотвращение расслоения («capping»)",
    case2_prob: "Таблетка карбоната кальция дозировкой 500 мг расслаивается (верхняя крышка отделяется от тела) при прессовании плоским круглым пуансоном 10.0 мм под давлением 15 кН. Избыток давления при малом объеме связующих ведет к застреванию воздуха в порошке.",
    case2_sol: "Технолог меняет в параметрах ноды пресса плоский круглый пуансон на двояковыпуклый овальный пуансон 11.0 мм. Симулятор рассчитывает уменьшение толщины и прогнозирует пористость на уровне 15.00%. Это обеспечивает механическую прочность при меньшем усилии 8 кН, исключая брак расслоения.",
    case2_metric: "Давление пресса: 15 кН → 8 кН",
    
    case3_title: "Кейс 3: Химический конфликт и замена аллергенов",
    case3_prob: "Лаборатория проектирует жевательную таблетку с глюкозамином (первичный амин) и моногидратом лактозы (восстанавливающий сахар). На первом этапе симуляции движок выдает предупреждение о риске реакции Майяра (совместимость 40%) и о наличии аллергена молока (лактозы).",
    case3_sol: "Для решения конфликтов технолог заменяет моногидрат лактозы на маннит (сахарный спирт) прямо на холсте. Система мгновенно пересчитывает совместимость до 100% (Норма) и убирает предупреждение об аллергене, делая рецептуру полностью безопасной для производства.",
    case3_metric: "Совместимость: 40% (риск) → 100% (норма)",

    // Summary
    summary_title: "Сводная таблица эффективности",
    table_feature: "Тип проблемы",
    table_defect: "Производственный брак",
    table_solution: "Стратегия симуляции",
    table_metric: "Результат симуляции",
    summary_list: [
      { name: "Текучесть порошка", defect: "Разброс массы (Карра 25+)", solution: "Корректировка ввода Аэросила и Avicel", metric: "Индекс Карра 12.00% (Отлично)" },
      { name: "Прессование", defect: "Расслоение таблетки (capping)", solution: "Оптимизация пуансона и пористости", metric: "Снижение усилия 15кН → 8кН при 15% пористости" },
      { name: "Совместимость", defect: "Реакция Майяра / Аллерген молока", solution: "Замена лактозы на невосстанавливающий маннит", metric: "Совместимость 100% по стандартам FALCPA" }
    ],

    // CTA
    cta_title: "Проверьте вашу формулу прямо сейчас",
    cta_subtitle: "Предотвратите нежелательные химические реакции и брак прессования до выхода в чистую зону.",
    cta_btn: "Запустить конфигуратор",
    cta_subtext: "Включает стандартную B2B базу из 35 химических классов и расчет физических параметров."
  }
};

export default function UseCasesPage() {
  const { locale } = useTranslation();
  const currentLang = (locale === "ru-RU") ? "ru-RU" : "en-US";
  const dict = pageContent[currentLang];

  // Visual Canvas Simulation State
  const [activeTab, setActiveTab] = useState<"before" | "after">("before");

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col font-sans text-zinc-100 relative overflow-hidden">
      
      {/* Background Dots Grid */}
      <div className="absolute inset-0 bg-[radial-gradient(var(--grid-dot)_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none opacity-20" />
      <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-indigo-500/5 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 left-1/4 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none" />

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

        {/* Header */}
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
          <p className="text-xs sm:text-sm text-zinc-355 leading-relaxed font-medium">
            {dict.analogy_desc}
          </p>
        </section>

        {/* Interactive Before/After Node Workspace Simulation */}
        <section className="mb-16 border border-zinc-900 rounded-2xl bg-zinc-950 p-6 sm:p-8 relative overflow-hidden shadow-inner">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div>
              <h3 className="text-base font-bold text-zinc-200">{dict.demo_title}</h3>
              <p className="text-xs text-zinc-500 mt-1">{dict.demo_subtitle}</p>
            </div>
            
            {/* Toggle tabs */}
            <div className="flex items-center bg-zinc-900/60 p-0.5 rounded-lg border border-zinc-800 text-xs font-bold w-full sm:w-auto">
              <button
                onClick={() => setActiveTab("before")}
                className={`px-4 py-2 rounded-md transition-all flex-1 sm:flex-none cursor-pointer ${
                  activeTab === "before" 
                    ? "bg-rose-500/15 border border-rose-500/20 text-rose-400 shadow-sm" 
                    : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                {dict.tab_before}
              </button>
              <button
                onClick={() => setActiveTab("after")}
                className={`px-4 py-2 rounded-md transition-all flex-1 sm:flex-none cursor-pointer ${
                  activeTab === "after" 
                    ? "bg-emerald-500/15 border border-emerald-500/20 text-emerald-400 shadow-sm" 
                    : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                {dict.tab_after}
              </button>
            </div>
          </div>

          {/* Canvas mock grid representation */}
          <div className="relative border border-zinc-900 bg-zinc-900/10 rounded-xl p-6 flex flex-col md:flex-row gap-8 items-center justify-between min-h-[300px] overflow-hidden">
            {/* Dots background for mock workspace */}
            <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.05)_1px,transparent_1px)] [background-size:12px_12px] pointer-events-none" />

            {/* Left Column: Input Nodes */}
            <div className="flex flex-col gap-4 relative z-10 w-full md:w-[32%]">
              
              {/* Node 1: API (Always stable/same) */}
              <div className="p-3 rounded-lg border border-zinc-850 bg-zinc-950/80 backdrop-blur shadow-sm">
                <span className="text-[10px] font-bold text-zinc-350 block mb-1">{dict.label_api}</span>
                <div className="flex justify-between items-center text-[9px] text-zinc-550">
                  <span>Class: Primary Amine</span>
                  <span className="text-emerald-400 font-extrabold uppercase">{dict.status_stable}</span>
                </div>
              </div>

              {/* Node 2: Filler (Lactose vs Mannitol) */}
              {activeTab === "before" ? (
                <div className="p-3 rounded-lg border border-rose-950/40 bg-zinc-950/80 backdrop-blur shadow-sm transition-all relative">
                  <span className="text-[10px] font-bold text-zinc-350 block mb-1">{dict.label_filler_before}</span>
                  <div className="flex justify-between items-center text-[9px] text-rose-400 font-semibold mb-1">
                    <span>Class: Reducing Sugar</span>
                    <span className="text-rose-500 font-extrabold uppercase flex items-center gap-1">
                      <ShieldAlert size={10} />
                      {dict.status_conflict}
                    </span>
                  </div>
                  <div className="text-[8px] bg-rose-500/5 text-rose-400 p-1 rounded border border-rose-500/10">
                    {dict.err_maillard}
                  </div>
                </div>
              ) : (
                <div className="p-3 rounded-lg border border-emerald-950/40 bg-zinc-950/80 backdrop-blur shadow-sm transition-all">
                  <span className="text-[10px] font-bold text-zinc-350 block mb-1">{dict.label_filler_after}</span>
                  <div className="flex justify-between items-center text-[9px] text-emerald-450 font-semibold">
                    <span>Class: Polyol (Sugar Alcohol)</span>
                    <span className="text-emerald-400 font-extrabold uppercase flex items-center gap-1">
                      <CheckCircle size={10} />
                      {dict.status_stable}
                    </span>
                  </div>
                </div>
              )}

              {/* Node 3: Lubricant (Mg Stearate vs PRUV) */}
              {activeTab === "before" ? (
                <div className="p-3 rounded-lg border border-rose-950/40 bg-zinc-950/80 backdrop-blur shadow-sm transition-all relative">
                  <span className="text-[10px] font-bold text-zinc-350 block mb-1">{dict.label_lubricant_before}</span>
                  <div className="flex justify-between items-center text-[9px] text-rose-400 font-semibold mb-1">
                    <span>Class: Alkaline Stearate</span>
                    <span className="text-rose-500 font-extrabold uppercase flex items-center gap-1">
                      <ShieldAlert size={10} />
                      {dict.status_conflict}
                    </span>
                  </div>
                  <div className="text-[8px] bg-rose-500/5 text-rose-400 p-1 rounded border border-rose-500/10">
                    {dict.err_alkaline}
                  </div>
                </div>
              ) : (
                <div className="p-3 rounded-lg border border-emerald-950/40 bg-zinc-950/80 backdrop-blur shadow-sm transition-all">
                  <span className="text-[10px] font-bold text-zinc-350 block mb-1">{dict.label_lubricant_after}</span>
                  <div className="flex justify-between items-center text-[9px] text-emerald-450 font-semibold">
                    <span>Class: Organic Fumarate</span>
                    <span className="text-emerald-400 font-extrabold uppercase flex items-center gap-1">
                      <CheckCircle size={10} />
                      {dict.status_stable}
                    </span>
                  </div>
                </div>
              )}

            </div>

            {/* SVG Connection Lines */}
            <div className="hidden md:block absolute inset-0 pointer-events-none z-0">
              <svg className="w-full h-full">
                {/* Connection lines from inputs to Blender */}
                <path d="M 315 100 Q 360 100 395 150" fill="none" stroke={activeTab === "before" ? "#6366f1" : "#10b981"} strokeWidth="1.5" />
                <path d="M 315 160 Q 360 160 395 160" fill="none" stroke={activeTab === "before" ? "#f43f5e" : "#10b981"} strokeWidth="2" className={activeTab === "before" ? "animate-pulse" : ""} />
                <path d="M 315 220 Q 360 220 395 170" fill="none" stroke={activeTab === "before" ? "#f43f5e" : "#10b981"} strokeWidth="2" className={activeTab === "before" ? "animate-pulse" : ""} />
                
                {/* Blender to Output */}
                <path d="M 680 160 Q 720 160 750 160" fill="none" stroke={activeTab === "before" ? "#f43f5e" : "#10b981"} strokeWidth="1.5" />
              </svg>
            </div>

            {/* Middle Node: Blender */}
            <div className={`p-4 rounded-xl border relative z-10 w-full md:w-[35%] transition-all ${
              activeTab === "before" 
                ? "border-rose-500/20 bg-zinc-950 shadow-[0_0_15px_rgba(244,63,94,0.15)]" 
                : "border-emerald-500/20 bg-zinc-950 shadow-[0_0_15px_rgba(16,185,129,0.15)]"
            }`}>
              <div className="flex items-center gap-2 mb-3 pb-2 border-b border-zinc-900">
                <div className={`w-2 h-2 rounded-full ${activeTab === "before" ? "bg-rose-500 animate-pulse" : "bg-emerald-500"}`} />
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-zinc-300">Formulation Blender</span>
              </div>
              
              <div className="flex flex-col gap-2 font-mono text-[9px] text-zinc-400 mb-3">
                <div className="flex justify-between bg-zinc-900/50 p-1.5 rounded">
                  <span>Compatibility:</span>
                  <span className={activeTab === "before" ? "text-rose-500 font-bold" : "text-emerald-450 font-bold"}>
                    {activeTab === "before" ? "40% (Risk)" : "100% (Stable)"}
                  </span>
                </div>
                <div className="flex justify-between bg-zinc-900/50 p-1.5 rounded">
                  <span>Carr Index:</span>
                  <span className="text-zinc-300">16.67%</span>
                </div>
              </div>

              <div className="text-[10px] text-zinc-400 font-sans leading-normal">
                {activeTab === "before" ? dict.desc_before : dict.desc_after}
              </div>
            </div>

          </div>
        </section>

        {/* B2B Target Scenarios */}
        <section className="mb-16">
          <div className="mb-10 text-center md:text-left">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-100">
              {dict.scenarios_title}
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 mt-2">
              {dict.scenarios_subtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Scenario 1 */}
            <div className="p-6 rounded-2xl border border-zinc-900 bg-zinc-900/10 hover:border-indigo-500/20 transition-all group flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center border border-indigo-500/20 mb-4 group-hover:scale-110 transition-transform">
                  <FlaskConical size={20} />
                </div>
                <h3 className="text-base sm:text-lg font-bold text-zinc-100 mb-2">{dict.sc1_title}</h3>
                <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">{dict.sc1_desc}</p>
              </div>
            </div>

            {/* Scenario 2 */}
            <div className="p-6 rounded-2xl border border-zinc-900 bg-zinc-900/10 hover:border-indigo-500/20 transition-all group flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center border border-indigo-500/20 mb-4 group-hover:scale-110 transition-transform">
                  <Building size={20} />
                </div>
                <h3 className="text-base sm:text-lg font-bold text-zinc-100 mb-2">{dict.sc2_title}</h3>
                <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">{dict.sc2_desc}</p>
              </div>
            </div>

            {/* Scenario 3 */}
            <div className="p-6 rounded-2xl border border-zinc-900 bg-zinc-900/10 hover:border-indigo-500/20 transition-all group flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center border border-indigo-500/20 mb-4 group-hover:scale-110 transition-transform">
                  <Apple size={20} />
                </div>
                <h3 className="text-base sm:text-lg font-bold text-zinc-100 mb-2">{dict.sc3_title}</h3>
                <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">{dict.sc3_desc}</p>
              </div>
            </div>

          </div>
        </section>

        {/* Case Studies Detailed List */}
        <section className="mb-16 border-t border-zinc-900 pt-16">
          <div className="mb-10">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-100">
              {dict.cases_section_title}
            </h2>
          </div>

          <div className="flex flex-col gap-12">
            
            {/* Case 1 */}
            <section className="p-6 rounded-2xl border border-zinc-900 bg-zinc-900/10 flex flex-col gap-4">
              <h3 className="text-base sm:text-lg font-bold text-zinc-100 flex items-center gap-2">
                <TrendingUp size={18} className="text-indigo-400" />
                {dict.case1_title}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs sm:text-sm">
                <div className="p-4 rounded-xl bg-red-950/5 border border-red-500/10 text-zinc-400">
                  <strong className="text-red-400 font-semibold uppercase tracking-wider block mb-2 text-[10px]">{dict.table_defect}</strong>
                  {dict.case1_prob}
                </div>
                <div className="p-4 rounded-xl bg-emerald-950/5 border border-emerald-500/10 text-zinc-400">
                  <strong className="text-emerald-400 font-semibold uppercase tracking-wider block mb-2 text-[10px]">{dict.table_solution}</strong>
                  {dict.case1_sol}
                </div>
              </div>
              <div className="pt-3 border-t border-zinc-900 flex justify-between items-center text-xs">
                <span className="text-zinc-550 font-semibold uppercase tracking-wider text-[9px]">Target Outcome</span>
                <span className="font-mono text-emerald-400 font-bold">{dict.case1_metric}</span>
              </div>
            </section>

            {/* Case 2 */}
            <section className="p-6 rounded-2xl border border-zinc-900 bg-zinc-900/10 flex flex-col gap-4">
              <h3 className="text-base sm:text-lg font-bold text-zinc-100 flex items-center gap-2">
                <AlertCircle size={18} className="text-indigo-400" />
                {dict.case2_title}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs sm:text-sm">
                <div className="p-4 rounded-xl bg-red-950/5 border border-red-500/10 text-zinc-400">
                  <strong className="text-red-400 font-semibold uppercase tracking-wider block mb-2 text-[10px]">{dict.table_defect}</strong>
                  {dict.case2_prob}
                </div>
                <div className="p-4 rounded-xl bg-emerald-950/5 border border-emerald-500/10 text-zinc-400">
                  <strong className="text-emerald-400 font-semibold uppercase tracking-wider block mb-2 text-[10px]">{dict.table_solution}</strong>
                  {dict.case2_sol}
                </div>
              </div>
              <div className="pt-3 border-t border-zinc-900 flex justify-between items-center text-xs">
                <span className="text-zinc-550 font-semibold uppercase tracking-wider text-[9px]">Target Outcome</span>
                <span className="font-mono text-emerald-400 font-bold">{dict.case2_metric}</span>
              </div>
            </section>

            {/* Case 3 */}
            <section className="p-6 rounded-2xl border border-zinc-900 bg-zinc-900/10 flex flex-col gap-4">
              <h3 className="text-base sm:text-lg font-bold text-zinc-100 flex items-center gap-2">
                <Sparkles size={18} className="text-indigo-400" />
                {dict.case3_title}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs sm:text-sm">
                <div className="p-4 rounded-xl bg-red-950/5 border border-red-500/10 text-zinc-400">
                  <strong className="text-red-400 font-semibold uppercase tracking-wider block mb-2 text-[10px]">{dict.table_defect}</strong>
                  {dict.case3_prob}
                </div>
                <div className="p-4 rounded-xl bg-emerald-950/5 border border-emerald-500/10 text-zinc-400">
                  <strong className="text-emerald-400 font-semibold uppercase tracking-wider block mb-2 text-[10px]">{dict.table_solution}</strong>
                  {dict.case3_sol}
                </div>
              </div>
              <div className="pt-3 border-t border-zinc-900 flex justify-between items-center text-xs">
                <span className="text-zinc-550 font-semibold uppercase tracking-wider text-[9px]">Target Outcome</span>
                <span className="font-mono text-emerald-400 font-bold">{dict.case3_metric}</span>
              </div>
            </section>

          </div>
        </section>

        {/* Comparison Table */}
        <section className="border-t border-zinc-900 pt-16 mb-16">
          <div className="mb-8">
            <h2 className="text-xl sm:text-2xl font-bold text-zinc-100">{dict.summary_title}</h2>
          </div>

          <div className="overflow-x-auto rounded-xl border border-zinc-900 bg-zinc-950 shadow-inner">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-zinc-900 bg-zinc-900/40 text-zinc-300 font-bold uppercase tracking-wider">
                  <th className="py-4 px-6">{dict.table_feature}</th>
                  <th className="py-4 px-6">{dict.table_defect}</th>
                  <th className="py-4 px-6">{dict.table_solution}</th>
                  <th className="py-4 px-6 text-indigo-400">{dict.table_metric}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-900 text-zinc-400">
                {dict.summary_list.map((item, idx) => (
                  <tr key={idx} className="hover:bg-zinc-900/20 transition-colors">
                    <td className="py-4 px-6 font-medium text-zinc-300">{item.name}</td>
                    <td className="py-4 px-6">{item.defect}</td>
                    <td className="py-4 px-6">{item.solution}</td>
                    <td className="py-4 px-6 text-zinc-100 font-bold">{item.metric}</td>
                  </tr>
                ))}
              </tbody>
            </table>
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
