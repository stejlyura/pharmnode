"use client";

import React from "react";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useTranslation } from "@/context/I18nContext";
import { ArrowLeft, ShieldAlert, Check, X, AlertTriangle } from "lucide-react";

const pageContent = {
  "en-US": {
    back: "Back to Home",
    title: "Chemical Compatibility Matrix",
    subtitle: "Deterministic rule-based verification across 35 distinct chemical classes",
    definition_title: "Active-Excipient Compatibility Logic",
    definition_desc: "Our compatibility engine runs deterministic cross-checks between active ingredients and excipients across 35 chemical classes. The system assigns safety scores and generates warning logs to flag problems like amino-sugar browning and lactose allergen conflicts.",
    sec1_title: "1. Rule-Based Conflict Evaluation",
    sec1_desc: "Unlike probabilistic AI models which may hallucinate outcomes, PharmNode uses a deterministic database of binary compatibility rules. Every active molecule is mapped to a specific chemical class. When connected on the canvas, the system runs cross-checks to verify if the components trigger pre-defined incompatibilities. This prevents chemical degradation before scale-up.",
    sec2_title: "2. The Maillard Browning Browning Conflict",
    sec2_desc: "One of the most common pharmaceutical conflicts occurs between primary/secondary amines (like Glucosamine) and reducing sugars (like Lactose). This interaction results in Maillard browning, causing discoloration and degradation of the active substance. The engine automatically detects this primary amine / reducing sugar pairing and blocks it with a high-risk alert.",
    sec3_title: "3. Acid-Base Neutralization & Salt Interactions",
    sec3_desc: "Mixing strong acidic components with basic excipients triggers salt formation, which can drastically modify the drug's solubility and bioavailability profiles. The platform monitors pH-sensitive active molecules and alerts formulators if the composite formulation pH is predicted to shift outside of the active ingredient's stable range.",
    table_title: "Common Chemical Class Compatibility Guidelines",
    table_subtitle: "Standard interaction rules evaluated by the PharmNode DSS engine",
    col_classA: "Chemical Class A",
    col_classB: "Chemical Class B",
    col_result: "Resulting Compatibility Status",
    col_desc: "Interaction Description",
    matrix_list: [
      { a: "Primary/Secondary Amines", b: "Reducing Sugars", res: "Incompatible", desc: "Triggers Maillard browning reaction & discoloration" },
      { a: "Organic Acids", b: "Carbonates / Bicarbonates", res: "Incompatible", desc: "Effervescent acid-base reaction releasing carbon dioxide" },
      { a: "Alkali Salts", b: "Heavy Metal Ions", res: "Incompatible", desc: "Causes precipitation and decreases bioavailability" },
      { a: "Esters", b: "Strong Bases", res: "Incompatible", desc: "Triggers alkaline hydrolysis (saponification)" },
      { a: "Reducing Agents", b: "Oxidizing Agents", res: "Incompatible", desc: "Rapid redox reaction causing degradation" },
      { a: "Polyols", b: "Borates / Boric Acid", res: "Incompatible", desc: "Forms highly acidic complex gels" }
    ]
  },
  "ru-RU": {
    back: "На главную",
    title: "Матрица совместимости",
    subtitle: "Детерминированный контроль несовместимостей по 35 химическим классам",
    definition_title: "Логика проверки совместимости",
    definition_desc: "Система проводит автоматический перекрестный анализ действующих и вспомогательных веществ по 35 химическим классам. Она рассчитывает оценку стабильности и выводит предупреждения о рисках вроде реакции Майяра или аллергии на лактозу.",
    sec1_title: "1. Детерминированная оценка конфликтов",
    sec1_desc: "В отличие от вероятностных ИИ-моделей, которые могут ошибаться, PharmNode использует строгую детерминированную базу правил. Каждое вещество привязано к своему химическому классу. При их соединении на холсте система сверяет правила, исключая риски деградации до физического смешивания порошков.",
    sec2_title: "2. Реакция Майяра (потемнение смеси)",
    sec2_desc: "Один из наиболее частых конфликтов в технологии форм — взаимодействие первичных/вторичных аминов (например, глюкозамина) с восстанавливающими сахарами (например, лактозой). Эта реакция ведет к потемнению смеси и потере активности субстанции. Движок мгновенно блокирует такое сочетание.",
    sec3_title: "3. Кислотно-основные и солевые взаимодействия",
    sec3_desc: "Соединение сильных кислот со щелочными наполнителями запускает солеобразование, меняющее растворимость и биодоступность. Платформа отслеживает рН-чувствительные АФС и выдает предупреждение, если расчетный уровень pH смеси выходит за безопасные границы.",
    table_title: "Типовые правила совместимости классов",
    table_subtitle: "Примеры стандартных взаимодействий, оцениваемых экспертной системой PharmNode",
    col_classA: "Химический класс А",
    col_classB: "Химический класс Б",
    col_result: "Совместимость",
    col_desc: "Описание взаимодействия",
    matrix_list: [
      { a: "Первичные/вторичные амины", b: "Восстанавливающие сахара", res: "Несовместимы", desc: "Реакция Майяра, потемнение и деградация АФС" },
      { a: "Органические кислоты", b: "Карбонаты / Бикарбонаты", res: "Несовместимы", desc: "Реакция нейтрализации с выделением углекислого газа" },
      { a: "Соли щелочных металлов", b: "Ионы тяжелых металлов", res: "Несовместимы", desc: "Выпадение в осадок, снижение биодоступности" },
      { a: "Сложные эфиры", b: "Сильные основания", res: "Несовместимы", desc: "Щелочной гидролиз (омыление эфиров)" },
      { a: "Восстановители", b: "Окислители", res: "Несовместимы", desc: "Быстрая ОВР с деградацией активной молекулы" },
      { a: "Многоатомные спирты (полиолы)", b: "Бораты / Борная кислота", res: "Несовместимы", desc: "Образование кислых комплексных гелей" }
    ]
  }
};

export default function CompatibilityMatrixPage() {
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
            <ShieldAlert size={16} />
            {dict.definition_title}
          </h2>
          <p className="text-sm sm:text-base text-zinc-300 font-medium leading-relaxed">
            {dict.definition_desc}
          </p>
        </section>

        {/* Detail Sections */}
        <div className="flex flex-col gap-12 mb-16">
          <section className="flex flex-col gap-3">
            <h2 className="text-lg sm:text-xl font-bold text-zinc-100">{dict.sec1_title}</h2>
            <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">{dict.sec1_desc}</p>
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="text-lg sm:text-xl font-bold text-zinc-100">{dict.sec2_title}</h2>
            <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">{dict.sec2_desc}</p>
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="text-lg sm:text-xl font-bold text-zinc-100">{dict.sec3_title}</h2>
            <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">{dict.sec3_desc}</p>
          </section>
        </div>

        {/* Compatibility Rules Table */}
        <section className="border-t border-zinc-900 pt-12">
          <div className="mb-8">
            <h2 className="text-xl sm:text-2xl font-bold text-zinc-100">{dict.table_title}</h2>
            <p className="text-xs text-zinc-400 mt-1">{dict.table_subtitle}</p>
          </div>

          <div className="overflow-x-auto rounded-xl border border-zinc-900 bg-zinc-950">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-zinc-900 bg-zinc-900/40 text-zinc-300 font-bold uppercase tracking-wider">
                  <th className="py-4 px-6">{dict.col_classA}</th>
                  <th className="py-4 px-6">{dict.col_classB}</th>
                  <th className="py-4 px-6">{dict.col_result}</th>
                  <th className="py-4 px-6 text-indigo-400">{dict.col_desc}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-900 text-zinc-400">
                {dict.matrix_list.map((item, idx) => (
                  <tr key={idx} className="hover:bg-zinc-900/20 transition-colors">
                    <td className="py-4 px-6 font-medium text-zinc-300">{item.a}</td>
                    <td className="py-4 px-6">{item.b}</td>
                    <td className="py-4 px-6">
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                        <AlertTriangle size={10} />
                        {item.res}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-zinc-300">{item.desc}</td>
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
