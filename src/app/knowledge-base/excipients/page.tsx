"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useTranslation } from "@/context/I18nContext";
import { ArrowLeft, BookOpen, Search, CheckCircle } from "lucide-react";

const pageContent = {
  "en-US": {
    back: "Back to Home",
    title: "Excipient Directory",
    subtitle: "A digital reference database of pharmaceutical excipients, binders, glidants, and lubricants",
    definition_title: "Role-Based Excipient Indexing",
    definition_desc: "The excipient database indexes raw materials based on their primary and secondary compounding roles (binders, diluents, disintegrants, lubricants, and glidants), specifying physical density profiles and safe intake thresholds.",
    sec1_title: "1. Binders and Dry Diluents",
    sec1_desc: "Binders (such as Microcrystalline Cellulose / Avicel and Lactose) ensure cohesive strength and compressibility during tablet pressing. Diluents add necessary bulk weight to high-potency, low-dosage active formulas to guarantee reliable weight control. PharmNode evaluates excipient density parameters to predict the overall mixture density.",
    sec2_title: "2. Glidants and High-Efficiency Lubricants",
    sec2_desc: "Lubricants (e.g. Magnesium Stearate) prevent powder from sticking to press punches. Glidants (e.g. Aerosil / Colloidal Silicon Dioxide) improve powder flow characteristics by reducing inter-particle friction. PharmNode monitors lubricant concentrations to prevent hydrophobic barriers that delay tablet dissolution.",
    table_title: "Excipient Functional Directory",
    table_subtitle: "Reference list of common pharmaceutical compounding excipients and parameters",
    col_name: "Excipient Name",
    col_role: "Compounding Role",
    col_bulk: "Bulk Density (g/cm³)",
    col_tapped: "Tapped Density (g/cm³)",
    col_max: "Max Safe Threshold (%)",
    excipients_list: [
      { name: "Microcrystalline Cellulose (Avicel pH-102)", role: "Binder / Diluent", bulk: "0.2900", tapped: "0.4100", max: "90.00%" },
      { name: "Lactose Monohydrate (Reducing Sugar)", role: "Diluent / Filler", bulk: "0.4200", tapped: "0.5200", max: "85.00%" },
      { name: "Magnesium Stearate (Insoluble Salt)", role: "Lubricant", bulk: "0.2200", tapped: "0.3500", max: "2.00%" },
      { name: "Colloidal Silicon Dioxide (Aerosil 200)", role: "Glidant", bulk: "0.0500", tapped: "0.0700", max: "3.00%" },
      { name: "Croscarmellose Sodium (Superdisintegrant)", role: "Disintegrant", bulk: "0.3600", tapped: "0.5000", max: "6.00%" },
      { name: "Mannitol (Non-Reducing Polyol)", role: "Sweetener / Diluent", bulk: "0.4500", tapped: "0.5800", max: "80.00%" }
    ]
  },
  "ru-RU": {
    back: "На главную",
    title: "Справочник вспомогательных веществ",
    subtitle: "Цифровая база данных фармацевтических наполнителей, связующих и скользящих веществ",
    definition_title: "Справочник сырья по ролям",
    definition_desc: "База данных классифицирует сырье по функциональным группам (связующие, наполнители, разрыхлители, смазывающие и скользящие вещества), указывая плотность и лимиты безопасного ввода.",
    sec1_title: "1. Связующие вещества и сухие наполнители",
    sec1_desc: "Связующие компоненты (такие как микрокристаллическая целлюлоза / МКЦ и лактоза) обеспечивают прочность таблетки при прессовании. Наполнители увеличивают массу таблетки при работе с микродозировками активных веществ. PharmNode учитывает их плотность для прогнозирования сжимаемости порошка.",
    sec2_title: "2. Скользящие вещества и лубриканты",
    sec2_desc: "Смазывающие вещества (например, стеарат магния) исключают налипание порошка на металлические части пресса. Скользящие добавки (например, Аэросил) улучшают сыпучесть порошка, снижая трение. Движок контролирует ввод лубрикантов, предупреждая риск гидрофобизации таблетки.",
    table_title: "Функциональный реестр сырья",
    table_subtitle: "Справочные физические параметры и максимальные концентрации сырья",
    col_name: "Название вещества",
    col_role: "Технологическая роль",
    col_bulk: "Насыпная плотность (г/см³)",
    col_tapped: "Плотность с усадкой (г/см³)",
    col_max: "Макс. предел ввода (%)",
    excipients_list: [
      { name: "Микрокристаллическая целлюлоза (Avicel pH-102)", role: "Связующее / Наполнитель", bulk: "0.2900", tapped: "0.4100", max: "90.00%" },
      { name: "Моногидрат лактозы (восстанавливающий сахар)", role: "Наполнитель / Разбавитель", bulk: "0.4200", tapped: "0.5200", max: "85.00%" },
      { name: "Стеарат магния (нерастворимая соль)", role: "Лубрикант (смазка)", bulk: "0.2200", tapped: "0.3500", max: "2.00%" },
      { name: "Диоксид кремния / Аэросил (Aerosil 200)", role: "Скользящее (глайдант)", bulk: "0.0500", tapped: "0.0700", max: "3.00%" },
      { name: "Кроскармеллоза натрия (супердезинтегрант)", role: "Разрыхлитель смеси", bulk: "0.3600", tapped: "0.5000", max: "6.00%" },
      { name: "Маннит (невосстанавливающий спирт)", role: "Подсластитель / Разбавитель", bulk: "0.4500", tapped: "0.5800", max: "80.00%" }
    ]
  }
};

export default function ExcipientsPage() {
  const { locale } = useTranslation();
  const currentLang = (locale === "ru-RU") ? "ru-RU" : "en-US";
  const dict = pageContent[currentLang];
  const [search, setSearch] = useState("");

  const filteredExcipients = dict.excipients_list.filter((item) =>
    item.name.toLowerCase().includes(search.toLowerCase()) ||
    item.role.toLowerCase().includes(search.toLowerCase())
  );

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
            <BookOpen size={16} />
            {dict.definition_title}
          </h2>
          <p className="text-sm sm:text-base text-zinc-300 font-medium leading-relaxed">
            {dict.definition_desc}
          </p>
        </section>

        {/* Details grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          <section className="flex flex-col gap-3">
            <h2 className="text-lg sm:text-xl font-bold text-zinc-100 flex items-center gap-2">
              <CheckCircle size={18} className="text-indigo-400" />
              {dict.sec1_title}
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">{dict.sec1_desc}</p>
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="text-lg sm:text-xl font-bold text-zinc-100 flex items-center gap-2">
              <CheckCircle size={18} className="text-indigo-400" />
              {dict.sec2_title}
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">{dict.sec2_desc}</p>
          </section>
        </div>

        {/* Excipients Interactive Directory Table */}
        <section className="border-t border-zinc-900 pt-12">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-zinc-100">{dict.table_title}</h2>
              <p className="text-xs text-zinc-400 mt-1">{dict.table_subtitle}</p>
            </div>
            {/* Simple search bar */}
            <div className="relative w-full sm:w-64">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input
                type="text"
                placeholder={locale === "ru-RU" ? "Поиск сырья..." : "Search excipient..."}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-zinc-800 bg-zinc-900/50 hover:bg-zinc-900 focus:outline-none focus:border-indigo-500 text-zinc-100 transition-all placeholder:text-zinc-650"
              />
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-zinc-900 bg-zinc-950">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-zinc-900 bg-zinc-900/40 text-zinc-300 font-bold uppercase tracking-wider">
                  <th className="py-4 px-6">{dict.col_name}</th>
                  <th className="py-4 px-6">{dict.col_role}</th>
                  <th className="py-4 px-6">{dict.col_bulk}</th>
                  <th className="py-4 px-6">{dict.col_tapped}</th>
                  <th className="py-4 px-6 text-indigo-400">{dict.col_max}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-900 text-zinc-400">
                {filteredExcipients.length > 0 ? (
                  filteredExcipients.map((item, idx) => (
                    <tr key={idx} className="hover:bg-zinc-900/20 transition-colors">
                      <td className="py-4 px-6 font-medium text-zinc-300">{item.name}</td>
                      <td className="py-4 px-6">{item.role}</td>
                      <td className="py-4 px-6 font-mono">{item.bulk}</td>
                      <td className="py-4 px-6 font-mono">{item.tapped}</td>
                      <td className="py-4 px-6 text-zinc-200 font-bold font-mono">{item.max}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-zinc-600">
                      {locale === "ru-RU" ? "Ничего не найдено" : "No results found"}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
