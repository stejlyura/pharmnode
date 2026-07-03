"use client";

import React from "react";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useTranslation } from "@/context/I18nContext";
import { ArrowLeft, BookOpen, AlertCircle, Sparkles, TrendingUp } from "lucide-react";

const pageContent = {
  "en-US": {
    back: "Back to Home",
    title: "Practical Use Cases",
    subtitle: "Real-world examples of how formulation technologists resolve compounding & tablet pressing challenges digitally",
    definition_title: "Empirical Compounding Case Studies",
    definition_desc: "These compounding use cases demonstrate the practical application of virtual simulations to optimize powder flow, prevent mechanical defects like capping, and substitute incompatible excipients to satisfy FALCPA allergen rules.",
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
    summary_title: "Summary of Value Realized",
    table_feature: "Problem Class",
    table_defect: "Formulation Defect",
    table_solution: "Digital Simulation Strategy",
    table_metric: "Resulting Metric",
    summary_list: [
      { name: "Powder Flow", defect: "Inconsistent weight (Carr 25+)", solution: "Model glidant (Aerosil) & binder ratios", metric: "Carr Index 12.00% (Excellent)" },
      { name: "Tablet Press", defect: "Capping / Lamination", solution: "Modify punch geometry & porosity level", metric: "Pressure 15kN → 8kN at 15% Porosity" },
      { name: "Compatibility", defect: "Maillard browning / Milk allergen", solution: "Substitute lactose with mannitol", metric: "100% chemical compatibility score" }
    ]
  },
  "ru-RU": {
    back: "На главную",
    title: "Практические кейсы",
    subtitle: "Примеры решения реальных производственных задач моделирования и таблетирования в цифровом виде",
    definition_title: "Цифровой разбор кейсов",
    definition_desc: "Данные примеры демонстрируют практическое применение виртуального холста для оптимизации сыпучести смесей, предотвращения механического брака таблеток и подбора совместимых наполнителей по правилам FALCPA.",
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
    summary_title: "Сводная таблица эффективности",
    table_feature: "Тип проблемы",
    table_defect: "Производственный брак",
    table_solution: "Стратегия симуляции",
    table_metric: "Результат симуляции",
    summary_list: [
      { name: "Текучесть порошка", defect: "Разброс массы (Карра 25+)", solution: "Корректировка ввода Аэросила и Avicel", metric: "Индекс Карра 12.00% (Отлично)" },
      { name: "Прессование", defect: "Расслоение таблетки (capping)", solution: "Оптимизация пуансона и пористости", metric: "Снижение усилия 15кН → 8кН при 15% пористости" },
      { name: "Совместимость", defect: "Реакция Майяра / Аллерген молока", solution: "Замена лактозы на невосстанавливающий маннит", metric: "Совместимость 100% по стандартам FALCPA" }
    ]
  }
};

export default function UseCasesPage() {
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
            <BookOpen size={16} />
            {dict.definition_title}
          </h2>
          <p className="text-sm sm:text-base text-zinc-300 font-medium leading-relaxed">
            {dict.definition_desc}
          </p>
        </section>

        {/* Case Studies Detailed Lists */}
        <div className="flex flex-col gap-12 mb-16">
          <section className="p-6 rounded-2xl border border-zinc-900 bg-zinc-900/10 flex flex-col gap-4">
            <h2 className="text-base sm:text-lg font-bold text-zinc-100 flex items-center gap-2">
              <TrendingUp size={18} className="text-indigo-400" />
              {dict.case1_title}
            </h2>
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
              <span className="text-zinc-550">Target Outcome</span>
              <span className="font-mono text-emerald-400 font-bold">{dict.case1_metric}</span>
            </div>
          </section>

          <section className="p-6 rounded-2xl border border-zinc-900 bg-zinc-900/10 flex flex-col gap-4">
            <h2 className="text-base sm:text-lg font-bold text-zinc-100 flex items-center gap-2">
              <AlertCircle size={18} className="text-indigo-400" />
              {dict.case2_title}
            </h2>
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
              <span className="text-zinc-550">Target Outcome</span>
              <span className="font-mono text-emerald-400 font-bold">{dict.case2_metric}</span>
            </div>
          </section>

          <section className="p-6 rounded-2xl border border-zinc-900 bg-zinc-900/10 flex flex-col gap-4">
            <h2 className="text-base sm:text-lg font-bold text-zinc-100 flex items-center gap-2">
              <Sparkles size={18} className="text-indigo-400" />
              {dict.case3_title}
            </h2>
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
              <span className="text-zinc-550">Target Outcome</span>
              <span className="font-mono text-emerald-400 font-bold">{dict.case3_metric}</span>
            </div>
          </section>
        </div>

        {/* Comparison Table */}
        <section className="border-t border-zinc-900 pt-12">
          <div className="mb-8">
            <h2 className="text-xl sm:text-2xl font-bold text-zinc-100">{dict.summary_title}</h2>
          </div>

          <div className="overflow-x-auto rounded-xl border border-zinc-900 bg-zinc-950">
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
      </main>

      <Footer />
    </div>
  );
}
