"use client";

import React from "react";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useTranslation } from "@/context/I18nContext";
import { 
  ArrowLeft, 
  Scale, 
  Building, 
  ShieldAlert, 
  Award,
  ChevronRight,
  Sparkles,
  ShieldCheck,
  FileCheck2,
  CalendarCheck
} from "lucide-react";

const pageContent = {
  "en-US": {
    back: "Back to Home",
    title: "Regulatory Compliance",
    subtitle: "Built in conformance with FDA Title 21 CFR Part 11, FALCPA, EU GMP Annex 11, and ICH Q8 guidelines",
    
    // Canva analogy
    analogy_badge: "The Canva of Formulation Design",
    analogy_title: "Canva for Compliance: Simplifying GxP audits and validation",
    analogy_desc: "Traditional pharmaceutical compliance software is like AutoCAD—over-engineered, desk-bound, and requires complex setup. PharmNode Studio is the Canva for compliance officers. Manage safety thresholds, trace changes, generate GxP reports, and verify chemical regulations directly in your browser.",

    // Core Content
    definition_title: "GMP-Compliant Validation & Quality by Design",
    definition_desc: "The compliance engine evaluates formulation safety thresholds in real-time. It records electronic logs (FDA Part 11), screens allergen indicators (FALCPA), maps pharmaceutical Design Spaces (ICH Q8), and generates print-ready specifications matching eCTD Module 3 dossier chapters.",

    // Sections
    sec1_title: "1. FDA 21 CFR Part 11 & EU GMP Annex 11",
    sec1_tag: "Electronic Records & Audit Trails",
    sec1_desc: "PharmNode is built to guarantee absolute data integrity. Every action taken on the canvas—including ingredient concentration modifications, node connection routing, and PDF exports—triggers a cryptographically logged, immutable database audit entry. Features include secure, timestamps-tracked audit trails and digital validator signatures to satisfy CDMO tech-transfer inspections.",
    
    sec2_title: "2. FALCPA & EU FIC 1169/2011 Compliance",
    sec2_tag: "Automated Allergen Verification",
    sec2_desc: "Our database tags allergens (milk/lactose, wheat/gluten, soy, peanuts, etc.) automatically. Under the Food Allergen Labeling and Consumer Protection Act (FALCPA) and EU Regulation 1169/2011, incorporating an allergen-bearing excipient (like lactose) triggers immediate warnings and populates mandatory labeling disclaimers ('Contains...') on the output sheet.",
    
    sec3_title: "3. ICH Q8 (R2) Quality by Design (QbD)",
    sec3_tag: "Risk-based Formulation Design Space",
    sec3_desc: "Traditional systems check parameters after physical tests. PharmNode implements Quality by Computational Design (QbCD) on the canvas. The engine defines a virtual 'Design Space' by checking ingredient interactions and compaction boundaries, preventing Critical Quality Attributes (CQAs) failure before cleanroom entrance.",

    sec4_title: "4. eCTD Dossier Module 3 Format Readiness",
    sec4_tag: "CDMO-Ready Technical Documentation",
    sec4_desc: "Our PDF report generation module conforms with the standard Common Technical Document (eCTD) Module 3 structure (Quality/Chemical-Pharmaceutical data). Exported specifications, flowability parameters, and compatibility logs are organized in technical sections, saving days of manual translation for CDMO technology transfer.",

    // Standards Table
    table_title: "Regulatory Standards Overview",
    table_subtitle: "Summary of regulatory environments integrated into the PharmNode DSS engine",
    col_std: "Standard Name",
    col_scope: "Regulatory Scope",
    col_impl: "PharmNode Implementation",
    col_status: "Compliance Status",
    standards_list: [
      { std: "FDA 21 CFR Part 11", scope: "Electronic Records & Signatures", impl: "Immutable GxP audit logging & signature workflows", status: "Audit Ready" },
      { std: "EU GMP Annex 11", scope: "EU Computerized Systems Compliance", impl: "Data integrity validation and audit-ready lifecycle logging", status: "Compliant" },
      { std: "ICH Guideline Q8 (R2)", scope: "Pharmaceutical Quality by Design (QbD)", impl: "Volumetric Design Space calculations & CQAs check", status: "Compliant" },
      { std: "FALCPA 2004", scope: "Supplement Allergen Labeling (US)", impl: "Auto allergen scanning & contains warnings", status: "Compliant" },
      { std: "EFSA Regulation 1169/2011", scope: "EU Food Info & Allergens", impl: "Metric parameters & mandatory EU declarations", status: "Compliant" },
      { std: "eCTD Module 3", scope: "Common Technical Document Structure", impl: "PDF exports organized by standard technical chapters", status: "Ready" }
    ],

    // CTA
    cta_title: "Start Designing Compliant Formulations Today",
    cta_subtitle: "Ensure full data integrity, GxP trace audit trails, and chemical safety rules from the first sketch.",
    cta_btn: "Launch Configurator",
    cta_subtext: "Hobby tier includes basic compatibility. Professional tier features full 35-class chemical checks and GxP reports."
  },
  "ru-RU": {
    back: "На главную",
    title: "Регуляторное соответствие",
    subtitle: "Проектирование рецептур в строгом соответствии с нормами FDA Title 21 CFR Part 11, FALCPA, EU GMP Annex 11 и ICH Q8",
    
    // Canva analogy
    analogy_badge: "Canva для разработки формуляций",
    analogy_title: "Canva для комплаенса: простое прохождение аудитов GxP",
    analogy_desc: "Традиционное программное обеспечение для комплаенса похоже на AutoCAD — перегруженное, десктопное и требующее сложной настройки. PharmNode Studio — это Canva для офицеров по качеству. Управляйте лимитами безопасности, отслеживайте изменения, формируйте GxP-отчеты и проверяйте химические регламенты прямо в браузере.",

    // Core Content
    definition_title: "GMP-валидация и методология Quality by Design",
    definition_desc: "Движок валидации сверяет состав смеси с государственными стандартами в реальном времени. Он формирует электронные логи (FDA Part 11), выявляет аллергены (FALCPA), рассчитывает фармацевтический Design Space (ICH Q8) и генерирует спецификации согласно структуре eCTD (Модуль 3).",

    // Sections
    sec1_title: "1. Стандарты электронных записей FDA 21 CFR Part 11 и EU GMP Annex 11",
    sec1_tag: "Электронные записи и протоколы аудита (Audit Trail)",
    sec1_desc: "PharmNode разработан для обеспечения полной целостности данных. Каждое действие на холсте — от изменения концентрации до выгрузки отчета — записывается в неизменяемую базу данных с криптографическим отслеживанием. Отчеты включают метки времени и электронные подписи валидаторов для соответствия аудитам CDMO.",
    
    sec2_title: "2. Стандарты FALCPA и EFSA Регламент 1169/2011",
    sec2_tag: "Автоматическая верификация и декларации аллергенов",
    sec2_desc: "Наша база данных автоматически помечает аллергены (лактоза, глютен, соя, орехи). При добавлении сырья с содержанием аллергенов (например, лактозы) система мгновенно выдает предупреждение о необходимости вывода надписи «Содержит...» на этикетке готового продукта в соответствии с правилами США и ЕС.",
    
    sec3_title: "3. Стандарт ICH Q8 (R2) Quality by Design (QbD)",
    sec3_tag: "Расчет виртуального пространства параметров (Design Space)",
    sec3_desc: "В отличие от традиционных систем, проверяющих брак после тестов, PharmNode реализует Quality by Computational Design (QbCD) на холсте. Движок рассчитывает пространство параметров (Design Space) на основе пористости и совместимости, исключая брак Critical Quality Attributes (CQAs) до начала производства.",

    sec4_title: "4. Готовность к экспорту в досье eCTD (Модуль 3)",
    sec4_tag: "Техническая документация, готовая к трансферу на CDMO",
    sec4_desc: "Модуль генерации отчетов формирует спецификации согласно структуре Общего технического документа (eCTD, Модуль 3: Качество / Химико-фармацевтические данные). Схемы смесей, параметры сыпучести и результаты тестов структурируются по главам, ускоряя трансфер технологии на завод.",

    // Standards Table
    table_title: "Сводка регуляторных стандартов",
    table_subtitle: "Основные законодательные нормы, поддерживаемые экспертной системой PharmNode",
    col_std: "Название стандарта",
    col_scope: "Сфера регулирования",
    col_impl: "Реализация в PharmNode",
    col_status: "Статус комплаенса",
    standards_list: [
      { std: "FDA 21 CFR Part 11", scope: "Электронные записи и подписи", impl: "Неизменяемый лог аудита и подписи валидаторов", status: "Готов к аудиту" },
      { std: "EU GMP Annex 11", scope: "Компьютеризированные системы GxP в ЕС", impl: "Валидация целостности данных и логирование жизненного цикла рецептур", status: "Соответствует" },
      { std: "ICH Guideline Q8 (R2)", scope: "Фармацевтическая разработка (QbD)", impl: "Расчеты Design Space на холсте и проверка CQAs", status: "Соответствует" },
      { std: "FALCPA 2004", scope: "Маркировка аллергенов БАД (США)", impl: "Автоматический поиск аллергенов и вывод предупреждений", status: "Соответствует" },
      { std: "EFSA Регламент 1169/2011", scope: "Маркировка продуктов и аллергенов (ЕС)", impl: "Поддержка метрики и обязательных оговорок ЕС", status: "Соответствует" },
      { std: "eCTD Модуль 3", scope: "Общий технический документ", impl: "Структурирование PDF-отчета по главам досье", status: "Готов" }
    ],

    // CTA
    cta_title: "Начните проектировать рецептуры по стандартам GMP",
    cta_subtitle: "Обеспечьте полную прослеживаемость изменений, защиту данных и соответствие правилам безопасности с первого наброска.",
    cta_btn: "Запустить конфигуратор",
    cta_subtext: "Hobby-тариф включает базовую проверку. Professional-тариф предлагает полный анализ 35 классов и GMP PDF-отчеты."
  }
};

export default function RegulatoryPage() {
  const { locale } = useTranslation();
  const currentLang = (locale === "ru-RU") ? "ru-RU" : "en-US";
  const dict = pageContent[currentLang];

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col font-sans text-zinc-100 relative overflow-hidden">
      
      {/* Ambient Grid Pattern */}
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

        {/* Summary Answer Block */}
        <section className="p-6 rounded-2xl bg-zinc-900/20 border border-zinc-900 backdrop-blur-sm mb-16 relative">
          <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500 rounded-l-2xl" />
          <h2 className="text-sm font-bold text-indigo-400 uppercase tracking-widest mb-2 flex items-center gap-2">
            <Scale size={16} />
            {dict.definition_title}
          </h2>
          <p className="text-sm text-zinc-300 font-medium leading-relaxed">
            {dict.definition_desc}
          </p>
        </section>

        {/* Regulations Detail Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          
          {/* Regulation 1: FDA 21 CFR Part 11 */}
          <div className="p-6 rounded-2xl border border-zinc-900 bg-zinc-900/10 flex flex-col justify-between hover:border-indigo-500/20 transition-all">
            <div>
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center border border-indigo-500/20 mb-4">
                <Award size={20} />
              </div>
              <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest block mb-1">
                {dict.sec1_tag}
              </span>
              <h3 className="text-base sm:text-lg font-bold text-zinc-100 mb-3">{dict.sec1_title}</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">{dict.sec1_desc}</p>
            </div>
          </div>

          {/* Regulation 2: Allergen warning */}
          <div className="p-6 rounded-2xl border border-zinc-900 bg-zinc-900/10 flex flex-col justify-between hover:border-indigo-500/20 transition-all">
            <div>
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center border border-indigo-500/20 mb-4">
                <ShieldAlert size={20} />
              </div>
              <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest block mb-1">
                {dict.sec2_tag}
              </span>
              <h3 className="text-base sm:text-lg font-bold text-zinc-100 mb-3">{dict.sec2_title}</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">{dict.sec2_desc}</p>
            </div>
          </div>

          {/* Regulation 3: ICH Q8 (QbD) */}
          <div className="p-6 rounded-2xl border border-zinc-900 bg-zinc-900/10 flex flex-col justify-between hover:border-indigo-500/20 transition-all">
            <div>
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center border border-indigo-500/20 mb-4">
                <ShieldCheck size={20} />
              </div>
              <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest block mb-1">
                {dict.sec3_tag}
              </span>
              <h3 className="text-base sm:text-lg font-bold text-zinc-100 mb-3">{dict.sec3_title}</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">{dict.sec3_desc}</p>
            </div>
          </div>

          {/* Regulation 4: eCTD Module 3 */}
          <div className="p-6 rounded-2xl border border-zinc-900 bg-zinc-900/10 flex flex-col justify-between hover:border-indigo-500/20 transition-all">
            <div>
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center border border-indigo-500/20 mb-4">
                <Building size={20} />
              </div>
              <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest block mb-1">
                {dict.sec4_tag}
              </span>
              <h3 className="text-base sm:text-lg font-bold text-zinc-100 mb-3">{dict.sec4_title}</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">{dict.sec4_desc}</p>
            </div>
          </div>

        </div>

        {/* Regulatory Matrix Table */}
        <section className="border-t border-zinc-900 pt-16 mb-16">
          <div className="mb-8">
            <h2 className="text-xl sm:text-2xl font-bold text-zinc-100">{dict.table_title}</h2>
            <p className="text-xs text-zinc-400 mt-1">{dict.table_subtitle}</p>
          </div>

          <div className="overflow-x-auto rounded-xl border border-zinc-900 bg-zinc-950 shadow-inner">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-zinc-900 bg-zinc-900/40 text-zinc-300 font-bold uppercase tracking-wider">
                  <th className="py-4 px-6 w-[20%]">{dict.col_std}</th>
                  <th className="py-4 px-6 w-[25%]">{dict.col_scope}</th>
                  <th className="py-4 px-6 w-[40%]">{dict.col_impl}</th>
                  <th className="py-4 px-6 text-indigo-400 w-[15%]">{dict.col_status}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-900 text-zinc-400">
                {dict.standards_list.map((item, idx) => (
                  <tr key={idx} className="hover:bg-zinc-900/20 transition-colors">
                    <td className="py-4 px-6 font-bold text-zinc-200">{item.std}</td>
                    <td className="py-4 px-6">{item.scope}</td>
                    <td className="py-4 px-6">{item.impl}</td>
                    <td className="py-4 px-6">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        {item.status}
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
