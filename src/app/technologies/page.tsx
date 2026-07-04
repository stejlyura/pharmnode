"use client";

import React from "react";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useTranslation } from "@/context/I18nContext";
import { 
  ArrowLeft, 
  Cpu, 
  Settings, 
  Activity, 
  Scale, 
  Maximize2, 
  Percent, 
  ShieldCheck,
  ChevronRight,
  Sparkles
} from "lucide-react";

const pageContent = {
  "en-US": {
    back: "Back to Home",
    title: "Computational Technology",
    subtitle: "Under the hood: mathematical equations, physical-chemical models, and scoring algorithms driving our real-time simulation engine",
    
    // Canva analogy
    analogy_badge: "The Canva of Formulation Design",
    analogy_title: "Canva for Formulation: Heavy physics in a lightweight browser app",
    analogy_desc: "Traditional formulation R&D relies on legacy software costing $20,000/year per seat and requiring a PhD in computational chemistry. PharmNode democratizes pharmaceutical Quality by Design (QbD). We pack complex powder packing density math, matrix geometries, and chemical incompatibility rules into a visual B2B SaaS for $39/month.",

    // Core Equations Section
    eq_section_title: "Core Mathematical Framework",
    eq_section_subtitle: "The deterministic algorithms executed by our real-time solver",

    // Section 1: Powder Flowability
    sec1_title: "1. Compressibility & Flowability Metrics",
    sec1_desc: "Bulk powder flowability is determined from loose bulk density (ρ_b) and tapped bulk density (ρ_t). PharmNode computes these properties dynamically as formulators adjust ingredient percentages, predicting flow parameters before physical mixing.",
    sec1_eq1_label: "Carr's Compressibility Index (C)",
    sec1_eq1_form: "C = 100 * (\\rho_t - \\rho_b) / \\rho_t",
    sec1_eq2_label: "Hausner's Cohesion Ratio (H)",
    sec1_eq2_form: "H = \\rho_t / \\rho_b",

    // Section 2: Skeletal Densities
    sec2_title: "2. Weighted Blend Skeletal Density",
    sec2_desc: "Unlike simple linear averages, composite skeletal true density (ρ_true) is computed using a weighted harmonic mean of the individual raw material true densities. This mathematically matches physical volumetric displacement.",
    sec2_eq_label: "Blend True Skeletal Density (\\rho_true)",
    sec2_eq_form: "\\rho_true = 100 / \\sum_{i=1}^{n} (w_i / \\rho_{true, i})",
    sec2_eq_terms: "Where w_i is the weight percentage (%) of ingredient i, and \\rho_{true, i} is its skeletal true density (g/mL).",

    // Section 3: Tablet Compaction & Porosity
    sec3_title: "3. Die Filling Geometry & Porosity",
    sec3_desc: "To simulate high-speed compression and avoid capping or lamination defects, the engine computes target die volume (V_die), apparent tablet density (ρ_apparent), and porosity (P).",
    sec3_eq1_label: "Theoretical Die Cavity Volume (V_die)",
    sec3_eq1_form: "V_die = \\pi * r^2 * h",
    sec3_eq2_label: "Apparent Tablet Density (\\rho_apparent)",
    sec3_eq2_form: "\\rho_apparent = M_tablet / V_die",
    sec3_eq3_label: "Tablet Porosity (P)",
    sec3_eq3_form: "P = 1 - (\\rho_apparent / \\rho_true)",
    sec3_eq_terms: "Where r is punch radius (cm), h is filling depth (cm), M_tablet is tablet weight (g), and V_die is volume (cm³). Target porosity should ideally sit between 12.00% and 18.00% to ensure disintegration while preventing capping.",

    // Section 4: Filling Target
    sec4_title: "4. Recommended Filling Weight Target",
    sec4_desc: "The recommended dosage weight (W_rec) for dry powder filling represents 90% of the maximum theoretical gravity-fed volume inside the punch die cavity.",
    sec4_eq_label: "Recommended Tablet Weight (W_rec)",
    sec4_eq_form: "W_rec = 0.9 * V_die * \\rho_b * 1000",
    sec4_eq_terms: "Where W_rec is in milligrams (mg), V_die is in cm³, and \\rho_b is the loose bulk density of the compound blend (g/mL).",

    // Section 5: Scoring Algorithms
    sec5_title: "5. Formulation Scoring & Penalty Engine",
    sec5_desc: "PharmNode rates overall recipe viability from 0 to 100 using a deterministic weighting matrix that applies deduction penalties for chemical incompatibilities, poor flow, and dosage warnings.",
    sec5_list_title: "Score Deduction Matrix:",
    sec5_ded1: "Critical Chemical Conflict (e.g. Maillard Reaction): -50 points",
    sec5_ded2: "Moderate Chemical Conflict (e.g. Acid-Lubricant reaction): -20 points",
    sec5_ded3: "Flowability Rating Penalty: Excellent/Good (0 pts), Fair (-5 pts), Passable (-15 pts), Poor (-30 pts), Very Poor (-50 pts)",
    sec5_ded4: "Allergen Alert (FALCPA milk/gluten cross-contamination): -10 points",
    sec5_ded5: "Exceeding Safe Ingredient Limits (Overdose): -25 points",

    // Table
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
    ],

    // CTA
    cta_title: "Simulate Your Math Instantly",
    cta_subtitle: "Ditch manual Excel calculations. Try the visually guided, mathematically validated studio now.",
    cta_btn: "Launch Configurator",
    cta_subtext: "Calculations computed to 4 decimal places. GxP PDF reports available on Professional tier."
  },
  "ru-RU": {
    back: "На главную",
    title: "Технологии расчетов",
    subtitle: "Под капотом: математические уравнения, физико-химические модели и алгоритмы скоринга, управляющие движком симуляции",
    
    // Canva analogy
    analogy_badge: "Canva для разработки формуляций",
    analogy_title: "Canva для формулирования: сложная физика в легком браузере",
    analogy_desc: "Традиционное R&D ПО стоит от $20,000 в год за лицензию и требует PhD по вычислительной химии. PharmNode демократизирует фармацевтическое проектирование качества (QbD). Мы объединили расчеты сыпучести смесей, геометрию прессования таблеток и правила совместимости в единую облачную платформу за $39/мес.",

    // Core Equations Section
    eq_section_title: "Основной математический аппарат",
    eq_section_subtitle: "Детерминированные формулы, рассчитываемые симулятором в реальном времени",

    // Section 1: Powder Flowability
    sec1_title: "1. Показатели сжимаемости и сыпучести порошка",
    sec1_desc: "Сыпучесть порошковых смесей оценивается на основе насыпной плотности (ρ_b) и плотности после усадки (ρ_t). PharmNode рассчитывает их на лету при изменении дозировок технологом.",
    sec1_eq1_label: "Индекс сжимаемости Карра (C)",
    sec1_eq1_form: "C = 100 * (\\rho_t - \\rho_b) / \\rho_t",
    sec1_eq2_label: "Коэффициент сцепления частиц Хауснера (H)",
    sec1_eq2_form: "H = \\rho_t / \\rho_b",

    // Section 2: Skeletal Densities
    sec2_title: "2. Истинная средневзвешенная плотность смеси",
    sec2_desc: "В отличие от простого линейного усреднения, общая истинная плотность смеси (ρ_true) рассчитывается как средневзвешенное гармоническое значение истинных плотностей отдельных ингредиентов. Это точно соответствует физическому вытеснению объема.",
    sec2_eq_label: "Истинная плотность смеси порошков (\\rho_true)",
    sec2_eq_form: "\\rho_true = 100 / \\sum_{i=1}^{n} (w_i / \\rho_{true, i})",
    sec2_eq_terms: "Где w_i — процент ввода ингредиента i (%), а \\rho_{true, i} — его индивидуальная истинная плотность (г/мл).",

    // Section 3: Tablet Compaction & Porosity
    sec3_title: "3. Геометрия заполнения матрицы и пористость",
    sec3_desc: "Для моделирования работы пресса на высоких скоростях и предотвращения сколов («capping»), движок рассчитывает объем матрицы (V_die), кажущуюся плотность таблетки (ρ_apparent) и пористость (P).",
    sec3_eq1_label: "Теоретический объем матрицы пресса (V_die)",
    sec3_eq1_form: "V_die = \\pi * r^2 * h",
    sec3_eq2_label: "Кажущаяся плотность таблетки (\\rho_apparent)",
    sec3_eq2_form: "\\rho_apparent = M_tablet / V_die",
    sec3_eq3_label: "Пористость таблетки (P)",
    sec3_eq3_form: "P = 1 - (\\rho_apparent / \\rho_true)",
    sec3_eq_terms: "Где r — радиус пуансона (см), h — глубина засыпки матрицы (см), M_tablet — масса таблетки (г), V_die — объем матрицы (см³). Оптимальный уровень пористости составляет 12.00% - 18.00% для быстрой растворимости и прочности таблетки.",

    // Section 4: Filling Target
    sec4_title: "4. Рекомендуемый целевой вес засыпки",
    sec4_desc: "Рекомендуемый вес дозирования (W_rec) порошка для гравитационной засыпки в матрицу пресса составляет 90% от максимального теоретического объема полости пуансона.",
    sec4_eq_label: "Рекомендуемый вес таблетки (W_rec)",
    sec4_eq_form: "W_rec = 0.9 * V_die * \\rho_b * 1000",
    sec4_eq_terms: "Где W_rec измеряется в миллиграммах (мг), V_die — в см³, а \\rho_b — насыпная плотность смеси до усадки (г/мл).",

    // Section 5: Scoring Algorithms
    sec5_title: "5. Алгоритм оценки качества рецептуры (Скоринг)",
    sec5_desc: "PharmNode оценивает применимость рецепта по шкале от 0 до 100 на основе штрафных вычетов за химическую несовместимость, низкую сыпучесть порошка и нарушение лимитов доз.",
    sec5_list_title: "Матрица вычета штрафных баллов:",
    sec5_ded1: "Критический химический конфликт (например, реакция Майяра): -50 баллов",
    sec5_ded2: "Умеренный химический конфликт (например, реакция кислоты со стеаратом): -20 баллов",
    sec5_ded3: "Штраф за текучесть: Отличная/Хорошая (0 б), Удовл (-5 б), Приемл (-15 б), Плохая (-30 б), Очень плохая (-50 б)",
    sec5_ded4: "Предупреждение об аллергенах (молоко/глютен по FALCPA): -10 баллов",
    sec5_ded5: "Превышение безопасного порога дозировки (передозировка): -25 баллов",

    // Table
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
    ],

    // CTA
    cta_title: "Симулируйте расчеты мгновенно",
    cta_subtitle: "Откажитесь от ручных Excel-таблиц. Попробуйте визуальный холст с валидацией математики на лету.",
    cta_btn: "Запустить конфигуратор",
    cta_subtext: "Все расчеты выполняются с точностью до 4 знаков. GMP PDF-отчеты доступны на тарифе Professional."
  }
};

export default function TechnologiesPage() {
  const { locale } = useTranslation();
  const currentLang = (locale === "ru-RU") ? "ru-RU" : "en-US";
  const dict = pageContent[currentLang];

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col font-sans text-zinc-100 relative overflow-hidden">
      
      {/* Background Grid Accent */}
      <div className="absolute inset-0 bg-[radial-gradient(var(--grid-dot)_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none opacity-20" />
      <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-indigo-500/5 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 left-1/4 w-[550px] h-[550px] bg-emerald-500/5 rounded-full blur-[130px] pointer-events-none" />

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

        {/* Equation Details ("Formulas Porn" Grid) */}
        <section className="mb-16">
          <div className="mb-10">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-100">
              {dict.eq_section_title}
            </h2>
            <p className="text-xs sm:text-sm text-zinc-500 mt-1">
              {dict.eq_section_subtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Equation 1: Compressibility & Flowability */}
            <div className="p-6 rounded-2xl border border-zinc-900 bg-zinc-900/10 flex flex-col justify-between">
              <div>
                <h3 className="text-base font-bold text-zinc-100 flex items-center gap-2 mb-3">
                  <Activity size={18} className="text-indigo-400" />
                  {dict.sec1_title}
                </h3>
                <p className="text-xs text-zinc-400 leading-relaxed mb-6">{dict.sec1_desc}</p>
              </div>
              <div className="flex flex-col gap-4 font-mono text-xs">
                <div>
                  <span className="text-[10px] text-zinc-500 font-sans block mb-1">{dict.sec1_eq1_label}</span>
                  <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-850 text-indigo-400 text-center font-extrabold">
                    {dict.sec1_eq1_form}
                  </div>
                </div>
                <div>
                  <span className="text-[10px] text-zinc-500 font-sans block mb-1">{dict.sec1_eq2_label}</span>
                  <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-850 text-indigo-400 text-center font-extrabold">
                    {dict.sec1_eq2_form}
                  </div>
                </div>
              </div>
            </div>

            {/* Equation 2: Skeletal Blend Density */}
            <div className="p-6 rounded-2xl border border-zinc-900 bg-zinc-900/10 flex flex-col justify-between">
              <div>
                <h3 className="text-base font-bold text-zinc-100 flex items-center gap-2 mb-3">
                  <Scale size={18} className="text-indigo-400" />
                  {dict.sec2_title}
                </h3>
                <p className="text-xs text-zinc-400 leading-relaxed mb-6">{dict.sec2_desc}</p>
              </div>
              <div>
                <span className="text-[10px] text-zinc-500 font-sans block mb-1 font-mono">{dict.sec2_eq_label}</span>
                <div className="p-4 bg-zinc-950 rounded-xl border border-zinc-850 text-indigo-400 text-center font-mono font-extrabold text-sm mb-3">
                  {dict.sec2_eq_form}
                </div>
                <p className="text-[10px] text-zinc-500 leading-normal">
                  {dict.sec2_eq_terms}
                </p>
              </div>
            </div>

            {/* Equation 3: Tablet Porosity */}
            <div className="p-6 rounded-2xl border border-zinc-900 bg-zinc-900/10 flex flex-col justify-between md:col-span-2">
              <div>
                <h3 className="text-base font-bold text-zinc-100 flex items-center gap-2 mb-3">
                  <Percent size={18} className="text-indigo-400" />
                  {dict.sec3_title}
                </h3>
                <p className="text-xs text-zinc-400 leading-relaxed mb-6">{dict.sec3_desc}</p>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 font-mono text-xs mb-4">
                <div>
                  <span className="text-[10px] text-zinc-500 font-sans block mb-1">{dict.sec3_eq1_label}</span>
                  <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-850 text-indigo-400 text-center font-extrabold">
                    {dict.sec3_eq1_form}
                  </div>
                </div>
                <div>
                  <span className="text-[10px] text-zinc-500 font-sans block mb-1">{dict.sec3_eq2_label}</span>
                  <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-850 text-indigo-400 text-center font-extrabold">
                    {dict.sec3_eq2_form}
                  </div>
                </div>
                <div>
                  <span className="text-[10px] text-zinc-500 font-sans block mb-1">{dict.sec3_eq3_label}</span>
                  <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-850 text-indigo-400 text-center font-extrabold">
                    {dict.sec3_eq3_form}
                  </div>
                </div>
              </div>
              <p className="text-[10px] text-zinc-500 leading-normal">
                {dict.sec3_eq_terms}
              </p>
            </div>

            {/* Equation 4: Target Tablet Weight */}
            <div className="p-6 rounded-2xl border border-zinc-900 bg-zinc-900/10 flex flex-col justify-between">
              <div>
                <h3 className="text-base font-bold text-zinc-100 flex items-center gap-2 mb-3">
                  <Maximize2 size={18} className="text-indigo-400" />
                  {dict.sec4_title}
                </h3>
                <p className="text-xs text-zinc-400 leading-relaxed mb-6">{dict.sec4_desc}</p>
              </div>
              <div>
                <span className="text-[10px] text-zinc-500 font-sans block mb-1 font-mono">{dict.sec4_eq_label}</span>
                <div className="p-4 bg-zinc-950 rounded-xl border border-zinc-850 text-indigo-400 text-center font-mono font-extrabold text-sm mb-3">
                  {dict.sec4_eq_form}
                </div>
                <p className="text-[10px] text-zinc-500 leading-normal">
                  {dict.sec4_eq_terms}
                </p>
              </div>
            </div>

            {/* Section 5: Formulation Scoring */}
            <div className="p-6 rounded-2xl border border-zinc-900 bg-zinc-900/10 flex flex-col justify-between">
              <div>
                <h3 className="text-base font-bold text-zinc-100 flex items-center gap-2 mb-3">
                  <ShieldCheck size={18} className="text-indigo-400" />
                  {dict.sec5_title}
                </h3>
                <p className="text-xs text-zinc-400 leading-relaxed mb-6">{dict.sec5_desc}</p>
              </div>
              <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-850 font-sans text-xs text-zinc-300">
                <span className="text-[10px] font-bold text-zinc-500 uppercase block mb-3">{dict.sec5_list_title}</span>
                <ul className="flex flex-col gap-2.5">
                  <li className="flex items-start gap-2 text-rose-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0" />
                    <span>{dict.sec5_ded1}</span>
                  </li>
                  <li className="flex items-start gap-2 text-amber-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                    <span>{dict.sec5_ded2}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                    <span>{dict.sec5_ded3}</span>
                  </li>
                  <li className="flex items-start gap-2 text-zinc-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-zinc-650 mt-1.5 shrink-0" />
                    <span>{dict.sec5_ded4}</span>
                  </li>
                  <li className="flex items-start gap-2 text-zinc-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-zinc-650 mt-1.5 shrink-0" />
                    <span>{dict.sec5_ded5}</span>
                  </li>
                </ul>
              </div>
            </div>

          </div>
        </section>

        {/* Classification Table */}
        <section className="border-t border-zinc-900 pt-16 mb-16">
          <div className="mb-8">
            <h2 className="text-xl sm:text-2xl font-bold text-zinc-100">{dict.table_title}</h2>
            <p className="text-xs text-zinc-400 mt-1">{dict.table_subtitle}</p>
          </div>

          <div className="overflow-x-auto rounded-xl border border-zinc-900 bg-zinc-950 shadow-inner">
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
                      <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold ${
                        item.alert === "Normal" || item.alert === "Норма"
                          ? "bg-emerald-500/10 text-emerald-450 border border-emerald-500/20"
                          : item.alert === "Warning" || item.alert === "Внимание"
                          ? "bg-amber-500/10 text-amber-450 border border-amber-500/20"
                          : "bg-rose-500/10 text-rose-450 border border-rose-500/20"
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
