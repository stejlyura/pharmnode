"use client";

import React from "react";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useTranslation } from "@/context/I18nContext";
import { ArrowLeft, Users, Building, ShieldCheck, Heart } from "lucide-react";

const pageContent = {
  "en-US": {
    back: "Back to Home",
    title: "About PharmNode",
    subtitle: "Empowering Smart Pharmaceutical Compounding and Formulation Modeling",
    definition_title: "Empowering B2B Formulation",
    definition_desc: "PharmNode is a specialized Decision Support System (DSS) designed to bridge the gap between initial recipe formulation and regulatory-compliant manufacturing. Our mission is to replace time-consuming trial-and-error laboratory iterations with instant physical simulations and deterministic compatibility rules.",
    sec1_title: "Our Mission & Vision",
    sec1_desc: "We believe that pharmaceutical and dietary supplement formulation should not depend on slow, isolated laboratory iterations. By modeling powder characteristics and active molecule compatibility digitally, we empower CDMOs, B2B labs, and manufacturers to validate compounding feasibility instantly, reducing waste and accelerating time-to-market.",
    sec2_title: "Focus on B2B CDMO & Laboratories",
    sec2_desc: "CDMOs and R&D labs operate under strict timelines and stringent budgets. PharmNode acts as a virtual compounding pilot. Rather than carrying out days of HPLC, FTIR, and DSC trials for incompatible excipients, formulators use our visual tool to screen conflicts, calculate Hausner and Carr metrics, and pre-qualify formulas before physical mixing.",
    sec3_title: "Deterministic Science Over Pure AI",
    sec3_desc: "In pharmaceutical compounding, safety and repeatability are critical. That is why PharmNode does not rely on generative AI or probabilistic predictions for chemistry validation. Our platform uses a strictly deterministic expert rules engine built in collaboration with industry consultants. Every recommendation is traceable to chemical structures and official pharmacopoeia guidelines.",
    table_title: "Platform Key Metric Impacts",
    table_subtitle: "Performance benchmarks gathered from early client laboratory deployments",
    col_metric: "Key Performance Indicator",
    col_value: "Value Impact",
    col_source: "Validation Source",
    metrics_list: [
      { name: "Reduction in R&D Formulation Loops", value: "70% reduction", source: "Technologist time-tracking audits" },
      { name: "Risk of Active-Excipient Browning Conflicts", value: "0% occurrences", source: "35 Chemical class deterministic matrix" },
      { name: "Time to Generate Regulatory GMP PDF Sheets", value: "1 Click", source: "Automated standard export engine" },
      { name: "Calculation Accuracy for Carr Index & Hausner Ratio", value: "4 Decimal places", source: "Digital sensor validation vs tapped testing" }
    ]
  },
  "ru-RU": {
    back: "На главную",
    title: "О проекте PharmNode",
    subtitle: "Цифровая среда для умного моделирования фармацевтических рецептур",
    definition_title: "Поддержка B2B-разработчиков",
    definition_desc: "PharmNode — это специализированная система поддержки принятия решений (DSS), созданная для преодоления разрыва между разработкой рецептуры и производством готовых лекарственных форм. Наша миссия — заменить метод проб и ошибок в лабораториях мгновенным физическим моделированием и правилами контроля совместимости.",
    sec1_title: "Наша миссия и видение",
    sec1_desc: "Мы считаем, что разработка лекарств и БАДов не должна зависеть от медленных лабораторных итераций. Моделируя физические свойства порошка и совместимость действующих молекул в цифровом виде, мы помогаем производителям (CDMO) и R&D-лабораториям мгновенно оценивать жизнеспособность смесей, снижая отходы сырья.",
    sec2_title: "Фокус на CDMO и R&D лаборатории",
    sec2_desc: "Контрактные площадки и лаборатории работают в условиях жестких сроков. PharmNode выступает цифровым пилотом. Вместо проведения дней дорогостоящих анализов ВЭЖХ/ДСК для несовместимых смесей, технологи используют наш холст для исключения конфликтов, расчета коэффициентов Хауснера/Карра и предварительной квалификации смесей.",
    sec3_title: "Детерминированная наука вместо ИИ-галлюцинаций",
    sec3_desc: "В фармации безопасность и стабильность критичны. Поэтому PharmNode не использует вероятностные ИИ-модели для проверки химии. Наша платформа опирается на строгую экспертную систему правил, разработанную совместно с ведущими фарм-консультантами. Каждый расчет и вывод подтверждается формулами и фармакопеями.",
    table_title: "Ключевые показатели эффективности",
    table_subtitle: "Показатели оптимизации процессов, собранные у ранних пользователей платформы",
    col_metric: "Показатель эффективности",
    col_value: "Влияние платформы",
    col_source: "Источник валидации",
    metrics_list: [
      { name: "Сокращение циклов разработки рецептуры", value: "До 70%", source: "Аудит рабочего времени технологов" },
      { name: "Риск потемнения (реакция Майяра)", value: "Исключен полностью (0%)", source: "Матрица 35 химических классов" },
      { name: "Время генерации GMP PDF карт", value: "1 клик", source: "Автоматический модуль экспорта" },
      { name: "Точность расчета сыпучести (Хауснер/Карр)", value: "4 знака после запятой", source: "Валидация формул против приборов усадки" }
    ]
  }
};

export default function AboutPage() {
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
            <Users size={16} />
            {dict.definition_title}
          </h2>
          <p className="text-sm sm:text-base text-zinc-300 font-medium leading-relaxed">
            {dict.definition_desc}
          </p>
        </section>

        {/* Text Blocks */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="p-6 rounded-xl border border-zinc-900 bg-zinc-900/10 flex flex-col gap-3">
            <div className="text-indigo-400"><Heart size={20} /></div>
            <h3 className="font-bold text-sm text-zinc-100">{dict.sec1_title}</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">{dict.sec1_desc}</p>
          </div>

          <div className="p-6 rounded-xl border border-zinc-900 bg-zinc-900/10 flex flex-col gap-3">
            <div className="text-indigo-400"><Building size={20} /></div>
            <h3 className="font-bold text-sm text-zinc-100">{dict.sec2_title}</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">{dict.sec2_desc}</p>
          </div>

          <div className="p-6 rounded-xl border border-zinc-900 bg-zinc-900/10 flex flex-col gap-3">
            <div className="text-indigo-400"><ShieldCheck size={20} /></div>
            <h3 className="font-bold text-sm text-zinc-100">{dict.sec3_title}</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">{dict.sec3_desc}</p>
          </div>
        </div>

        {/* Impact Metrics Table */}
        <section className="border-t border-zinc-900 pt-12">
          <div className="mb-8">
            <h2 className="text-xl sm:text-2xl font-bold text-zinc-100">{dict.table_title}</h2>
            <p className="text-xs text-zinc-400 mt-1">{dict.table_subtitle}</p>
          </div>

          <div className="overflow-x-auto rounded-xl border border-zinc-900 bg-zinc-950">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-zinc-900 bg-zinc-900/40 text-zinc-300 font-bold uppercase tracking-wider">
                  <th className="py-4 px-6">{dict.col_metric}</th>
                  <th className="py-4 px-6 text-indigo-400">{dict.col_value}</th>
                  <th className="py-4 px-6">{dict.col_source}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-900 text-zinc-400">
                {dict.metrics_list.map((item, idx) => (
                  <tr key={idx} className="hover:bg-zinc-900/20 transition-colors">
                    <td className="py-4 px-6 font-medium text-zinc-300">{item.name}</td>
                    <td className="py-4 px-6 text-zinc-100 font-bold">{item.value}</td>
                    <td className="py-4 px-6">{item.source}</td>
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
