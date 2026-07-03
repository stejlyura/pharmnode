"use client";

import React from "react";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useTranslation } from "@/context/I18nContext";
import { ArrowLeft, Layers, Cpu, ShieldAlert, FileText, Check, X } from "lucide-react";

const pageContent = {
  "en-US": {
    back: "Back to Home",
    title: "Platform Features",
    subtitle: "Comprehensive B2B decision support system (DSS) for compounding & tablet pressing",
    definition_title: "Visual Formulation Environment",
    definition_desc: "The visual node editor is a drag-and-drop workspace that lets formulators connect ingredients, binders, and active substances, dynamically calculating physical powder traits in real-time.",
    sec1_title: "1. Node-Based Formulation Canvas",
    sec1_desc: "Our interactive canvas allows you to construct complex pharmaceutical blends visually. Connect raw materials, modify concentration percentages, and immediately observe propagation changes across the blending and output nodes. This visual representation ensures R&D teams maintain complete conceptual clarity of complex multipart recipes.",
    sec2_title: "2. Computational Powder Flowability Simulator",
    sec2_desc: "PharmNode automatically computes Carr's Index and Hausner's Ratio with 4 decimal places of accuracy to ensure dry powder mixtures maintain optimal flowability during high-speed tableting. The engine monitors critical bulk density parameters, tapped density, and particle size distribution. It triggers dynamic alerts if the compound's mechanical properties indicate risk of capping, lamination, or poor flow.",
    sec3_title: "3. Rule-Based Chemical Compatibility Screen",
    sec3_desc: "Our deterministic matrix screens active ingredients against excipients across 35 distinct chemical classes, flagging incompatibilities like Maillard browning and lactose allergen conflicts. By executing precise, rule-based conflict checks, PharmNode prevents color degradation, active molecule decomposition, and cross-allergen contamination before lab testing.",
    sec4_title: "4. GMP-Compliant PDF Documentation Export",
    sec4_desc: "Generate strict regulatory PDFs containing complete formula logs, compatibility matrices, calculation results, and digital signatures. Designed to satisfy FDA Title 21 CFR Part 11 and EU GMP Annex 11 requirements, these reports provide a validated audit trail ready for CDMO transfer and electronic submission.",
    table_title: "Feature Matrix & Subscription Tiers",
    table_subtitle: "Detailed breakdown of Hobby vs. Professional capabilities",
    col_feature: "Feature",
    col_hobby: "Hobby Tier",
    col_pro: "Professional Tier",
    features_list: [
      { name: "Max Ingredients per Formula", hobby: "3 ingredients", pro: "Unlimited" },
      { name: "Chemical Compatibility Checking", hobby: "Basic (10 classes)", pro: "Advanced (35 classes)" },
      { name: "Powder Flowability Calculations (Carr & Hausner)", hobby: "Yes", pro: "Yes" },
      { name: "Tablet Press Volume & Porosity Simulation", hobby: "Yes", pro: "Yes" },
      { name: "GMP PDF Report Export", hobby: "No", pro: "Unlimited (with validator signatures)" },
      { name: "Custom Excipient Database Additions", hobby: "No", pro: "Unlimited" },
      { name: "REST API Access", hobby: "No", pro: "Yes (20ms target latency)" },
      { name: "Customer Support", hobby: "Community support", pro: "Priority B2B (24/7)" }
    ]
  },
  "ru-RU": {
    back: "На главную",
    title: "Функции платформы",
    subtitle: "Комплексная система поддержки принятия решений (DSS) для разработки рецептур и прессования",
    definition_title: "Визуальная среда моделирования",
    definition_desc: "Визуальный редактор нод представляет собой интерактивный холст, позволяющий технологам связывать активные вещества, наполнители и связующие компоненты, автоматически пересчитывая физические свойства порошка в реальном времени.",
    sec1_title: "1. Интерактивный холст рецептур",
    sec1_desc: "Наш холст позволяет визуально конструировать сложные многокомпонентные смеси. Соединяйте ноды сырья, меняйте дозировки в процентах и мгновенно отслеживайте изменения в смесителях и выходных нодах. Визуальная структура гарантирует прозрачность рецептуры на этапе R&D.",
    sec2_title: "2. Вычислительный симулятор сыпучести",
    sec2_desc: "PharmNode автоматически рассчитывает индекс Карра и коэффициент Хауснера с точностью до 4 знаков после запятой для обеспечения стабильного дозирования порошков при таблетировании. Движок отслеживает насыпную плотность, плотность после усадки и средний размер частиц, выдавая предупреждения при риске расслоения или плохой текучести смеси.",
    sec3_title: "3. Контроль химической совместимости сырья",
    sec3_desc: "Наша детерминированная матрица сопоставляет активные компоненты и вспомогательные вещества по 35 классам химических соединений, мгновенно выявляя реакцию Майяра и аллергенные конфликты. Это позволяет предотвратить деградацию цвета, разрушение действующих молекул и перекрестную контаминацию до начала тестов.",
    sec4_title: "4. Экспорт GMP-документации в PDF",
    sec4_desc: "Создавайте официальные PDF-отчеты с подробным журналом расчетов, матрицей рисков и цифровыми подписями. Документы соответствуют требованиям FDA 21 CFR Part 11 и EU GMP Annex 11, обеспечивая полную прослеживаемость данных (audit trail) для передачи на производство (CDMO) и сдачи регуляторам.",
    table_title: "Сравнительная матрица тарифов",
    table_subtitle: "Детальный разбор возможностей тарифов Hobby и Professional",
    col_feature: "Функция",
    col_hobby: "Тариф Hobby",
    col_pro: "Тариф Professional",
    features_list: [
      { name: "Макс. ингредиентов в рецепте", hobby: "3 ингредиента", pro: "Без ограничений" },
      { name: "Анализ химической совместимости", hobby: "Базовый (10 классов)", pro: "Продвинутый (35 классов)" },
      { name: "Расчет сыпучести порошка (Карр и Хауснер)", hobby: "Да", pro: "Да" },
      { name: "Симуляция пористости и параметров пресса", hobby: "Да", pro: "Да" },
      { name: "Экспорт валидационных отчетов GMP PDF", hobby: "Нет", pro: "Без ограничений (с подписью)" },
      { name: "Добавление собственных ингредиентов в базу", hobby: "Нет", pro: "Без ограничений" },
      { name: "Доступ к REST API", hobby: "Нет", pro: "Да (время отклика до 20 мс)" },
      { name: "Техническая поддержка", hobby: "Сообщество", pro: "Приоритетная B2B (24/7)" }
    ]
  }
};

export default function FeaturesPage() {
  const { locale } = useTranslation();
  const currentLang = (locale === "ru-RU") ? "ru-RU" : "en-US";
  const dict = pageContent[currentLang];

  const appJsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "PharmNode",
    "operatingSystem": "All",
    "applicationCategory": "BusinessApplication",
    "offers": {
      "@type": "AggregateOffer",
      "priceCurrency": "USD",
      "lowPrice": "0",
      "highPrice": "39.00",
      "offerCount": "2",
      "offers": [
        {
          "@type": "Offer",
          "name": "Hobby Plan",
          "price": "0.00",
          "priceCurrency": "USD"
        },
        {
          "@type": "Offer",
          "name": "Professional Plan",
          "price": "39.00",
          "priceCurrency": "USD"
        }
      ]
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.9",
      "reviewCount": "124"
    }
  };

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": currentLang === "ru-RU" ? "Каков лимит ингредиентов на тарифе Hobby?" : "What is the ingredient limit on the Hobby plan?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": currentLang === "ru-RU" ? "На тарифе Hobby лимит составляет 3 ингредиента на рецепт." : "The Hobby plan is limited to 3 ingredients per recipe formulation."
        }
      },
      {
        "@type": "Question",
        "name": currentLang === "ru-RU" ? "Какое количество химических классов проверяет система?" : "How many chemical classes does the compatibility engine check?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": currentLang === "ru-RU" ? "Система проверяет совместимость по 35 классам химических веществ на тарифе Professional." : "The advanced compatibility check covers 35 distinct chemical classes on the Professional plan."
        }
      }
    ]
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col font-sans text-zinc-100 relative overflow-hidden">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(appJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      {/* Background Grid Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(var(--grid-dot)_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none opacity-30" />
      <div className="absolute top-0 inset-x-0 h-[400px] bg-gradient-to-b from-indigo-500/5 via-purple-500/0 to-transparent pointer-events-none" />

      <Header showCanvasControls={false} />

      <main className="flex-1 max-w-5xl w-full mx-auto py-12 px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Back Link */}
        <Link href="/" className="inline-flex items-center gap-2 text-xs text-zinc-500 hover:text-indigo-400 transition-colors mb-8 group">
          <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
          {dict.back}
        </Link>

        {/* Heading */}
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
            <Layers size={16} />
            {dict.definition_title}
          </h2>
          <p className="text-sm sm:text-base text-zinc-300 font-medium leading-relaxed">
            {dict.definition_desc}
          </p>
        </section>

        {/* Feature Sections */}
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

          <section className="flex flex-col gap-3">
            <h2 className="text-lg sm:text-xl font-bold text-zinc-100">{dict.sec4_title}</h2>
            <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">{dict.sec4_desc}</p>
          </section>
        </div>

        {/* Feature Comparison Table */}
        <section className="border-t border-zinc-900 pt-12 mb-12">
          <div className="mb-8">
            <h2 className="text-xl sm:text-2xl font-bold text-zinc-100">{dict.table_title}</h2>
            <p className="text-xs text-zinc-400 mt-1">{dict.table_subtitle}</p>
          </div>

          <div className="overflow-x-auto rounded-xl border border-zinc-900 bg-zinc-950">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-zinc-900 bg-zinc-900/40 text-zinc-300 font-bold uppercase tracking-wider">
                  <th className="py-4 px-6">{dict.col_feature}</th>
                  <th className="py-4 px-6">{dict.col_hobby}</th>
                  <th className="py-4 px-6 text-indigo-400">{dict.col_pro}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-900 text-zinc-400">
                {dict.features_list.map((item, idx) => (
                  <tr key={idx} className="hover:bg-zinc-900/20 transition-colors">
                    <td className="py-4 px-6 font-medium text-zinc-300">{item.name}</td>
                    <td className="py-4 px-6">{item.hobby}</td>
                    <td className="py-4 px-6 text-zinc-200 font-semibold">{item.pro}</td>
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
