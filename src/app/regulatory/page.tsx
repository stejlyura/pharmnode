"use client";

import React from "react";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useTranslation } from "@/context/I18nContext";
import { ArrowLeft, Scale, Building, ShieldAlert, Award } from "lucide-react";

const pageContent = {
  "en-US": {
    back: "Back to Home",
    title: "Regulatory Compliance",
    subtitle: "Built in conformance with FDA Title 21 CFR Part 11, FALCPA, and EU EMA guidelines",
    definition_title: "GMP Compliant Expert Verification",
    definition_desc: "The validation engine checks formulations against strict compliance thresholds, generating electronic GxP audit logs, FALCPA-compliant allergen declarations, and formatting reports for eCTD dossier submissions.",
    sec1_title: "1. FDA Title 21 CFR Part 11 Electronic Records",
    sec1_desc: "PharmNode is designed to accommodate GxP logging, электронные подписи, and audit trailing protocols. Each action taken on the canvas - including recipe modifications, ingredient overrides, and PDF reports creation - triggers an immutable database audit entry containing timestamps and user identification tokens to ensure security and compliance.",
    sec2_title: "2. FALCPA Allergen Warnings & Declarations",
    sec2_desc: "Our regulatory database contains profiling metadata for all major allergens (milk/lactose, gluten, soy, nuts, etc.). If a technologist incorporates an allergen-bearing excipient, the compliance engine flags the substance under FALCPA/EFSA guidelines and prints a mandatory 'Contains' warning in the GMP output sheet.",
    sec3_title: "3. eCTD Dossier Module 3 Format Readiness",
    sec3_desc: "Our PDF report generation module conforms with the standard Common Technical Document (eCTD) Module 3 structure (Quality/Chemical-Pharmaceutical data). Exported specifications, flowability parameters, and compatibility logs are organized in technical sections, saving days of manual translation for CDMO technology transfer.",
    table_title: "Regulatory Standards Overview",
    table_subtitle: "Summary of regulatory environments integrated into the PharmNode DSS engine",
    col_std: "Standard Name",
    col_scope: "Regulatory Scope",
    col_impl: "PharmNode Implementation",
    col_status: "Compliance Status",
    standards_list: [
      { std: "FDA 21 CFR Part 11", scope: "Electronic Records & Signatures", impl: "Immutable GxP audit logging & signature workflows", status: "Audit Ready" },
      { std: "FALCPA 2004", scope: "Supplement Allergen Labeling (US)", impl: "Auto allergen scanning & contains warnings", status: "Compliant" },
      { std: "EFSA Regulation 1169/2011", scope: "EU Food Info & Allergens", impl: "Metric parameters & mandatory EU declarations", status: "Compliant" },
      { std: "eCTD Module 3", scope: "Common Technical Document Structure", impl: "PDF exports organized by standard technical chapters", status: "Ready" }
    ]
  },
  "ru-RU": {
    back: "На главную",
    title: "Регуляторное соответствие",
    subtitle: "Проектирование рецептур в строгом соответствии с нормами FDA Title 21 CFR Part 11, FALCPA и EMA",
    definition_title: "Регуляторный аудит и комплаенс",
    definition_desc: "Движок валидации сверяет состав смеси с государственными лимитами, создавая электронные логи аудита GxP, декларации об аллергенах по нормам FALCPA и подготавливая спецификации к подаче в формате eCTD.",
    sec1_title: "1. Стандарты электронных записей FDA 21 CFR Part 11",
    sec1_desc: "PharmNode разработан с учетом протоколов аудита (audit trail) и электронных подписей. Каждое действие на холсте — изменение рецептуры, ввод нового сырья или экспорт отчета — записывается в неизменяемую базу данных с меткой времени и ID пользователя, что исключает фальсификацию данных.",
    sec2_title: "2. Декларации аллергенов по стандартам FALCPA и EFSA",
    sec2_desc: "Наша база данных содержит детальную маркировку аллергенов (лактоза, глютен, соя, орехи). При добавлении сырья с содержанием аллергенов система выдает предупреждение о необходимости вывода надписи «Содержит...» на этикетке готового продукта в соответствии с правилами США и ЕС.",
    sec3_title: "3. Готовность к экспорту в досье eCTD (Модуль 3)",
    sec3_desc: "Модуль генерации отчетов формирует спецификации согласно структуре Общего технического документа (eCTD, Модуль 3: Качество / Химико-фармацевтические данные). Схемы смесей, параметры сыпучести и результаты тестов структурируются по главам, ускоряя трансфер технологии на завод.",
    table_title: "Сводка регуляторных стандартов",
    table_subtitle: "Основные законодательные нормы, поддерживаемые экспертной системой PharmNode",
    col_std: "Название стандарта",
    col_scope: "Сфера регулирования",
    col_impl: "Реализация в PharmNode",
    col_status: "Статус комплаенса",
    standards_list: [
      { std: "FDA 21 CFR Part 11", scope: "Электронные записи и подписи", impl: "Неизменяемый лог аудита и подписи валидаторов", status: "Готов к аудиту" },
      { std: "FALCPA 2004", scope: "Маркировка аллергенов БАД (США)", impl: "Автоматический поиск аллергенов и вывод предупреждений", status: "Соответствует" },
      { std: "EFSA Регламент 1169/2011", scope: "Маркировка продуктов и аллергенов (ЕС)", impl: "Поддержка метрики и обязательных оговорок ЕС", status: "Соответствует" },
      { std: "eCTD Модуль 3", scope: "Общий технический документ", impl: "Структурирование PDF-отчета по главам досье", status: "Готов" }
    ]
  }
};

export default function RegulatoryPage() {
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
            <Scale size={16} />
            {dict.definition_title}
          </h2>
          <p className="text-sm sm:text-base text-zinc-300 font-medium leading-relaxed">
            {dict.definition_desc}
          </p>
        </section>

        {/* Sections */}
        <div className="flex flex-col gap-12 mb-16">
          <section className="flex flex-col gap-3">
            <h2 className="text-lg sm:text-xl font-bold text-zinc-100 flex items-center gap-2">
              <Award size={18} className="text-indigo-400" />
              {dict.sec1_title}
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">{dict.sec1_desc}</p>
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="text-lg sm:text-xl font-bold text-zinc-100 flex items-center gap-2">
              <ShieldAlert size={18} className="text-indigo-400" />
              {dict.sec2_title}
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">{dict.sec2_desc}</p>
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="text-lg sm:text-xl font-bold text-zinc-100 flex items-center gap-2">
              <Building size={18} className="text-indigo-400" />
              {dict.sec3_title}
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">{dict.sec3_desc}</p>
          </section>
        </div>

        {/* Regulatory Matrix Table */}
        <section className="border-t border-zinc-900 pt-12">
          <div className="mb-8">
            <h2 className="text-xl sm:text-2xl font-bold text-zinc-100">{dict.table_title}</h2>
            <p className="text-xs text-zinc-400 mt-1">{dict.table_subtitle}</p>
          </div>

          <div className="overflow-x-auto rounded-xl border border-zinc-900 bg-zinc-950">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-zinc-900 bg-zinc-900/40 text-zinc-300 font-bold uppercase tracking-wider">
                  <th className="py-4 px-6">{dict.col_std}</th>
                  <th className="py-4 px-6">{dict.col_scope}</th>
                  <th className="py-4 px-6">{dict.col_impl}</th>
                  <th className="py-4 px-6 text-indigo-400">{dict.col_status}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-900 text-zinc-400">
                {dict.standards_list.map((item, idx) => (
                  <tr key={idx} className="hover:bg-zinc-900/20 transition-colors">
                    <td className="py-4 px-6 font-medium text-zinc-300">{item.std}</td>
                    <td className="py-4 px-6">{item.scope}</td>
                    <td className="py-4 px-6">{item.impl}</td>
                    <td className="py-4 px-6 text-zinc-100 font-bold">{item.status}</td>
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
