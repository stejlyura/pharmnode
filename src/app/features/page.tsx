"use client";

import React from "react";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useTranslation } from "@/context/I18nContext";
import { 
  ArrowLeft, 
  Layers, 
  Cpu, 
  ShieldAlert, 
  Activity, 
  Coins, 
  Flame, 
  ChevronRight, 
  Sparkles, 
  Beaker,
  Scale
} from "lucide-react";

const pageContent = {
  "en-US": {
    back: "Back to Home",
    title: "Platform Features",
    subtitle: "Enterprise B2B Decision Support System (DSS) for Pharmaceutical Compounding & Solid Dosage Simulation",
    
    // Canva analogy & USPs
    analogy_badge: "The Canva of Formulation Design",
    analogy_title: "Visual, Instant & Cloud-Based",
    analogy_desc: "Traditional pharmaceutical R&D software is like AutoCAD—heavy, desktop-bound, expensive, and requires a PhD in computational chemistry. PharmNode Studio is the Canva for formulators. Run calculations in your browser, drag and drop components, and map active substances, binders, and excipients in seconds.",
    usp_title: "Key Value Propositions",
    usp1_tag: "Economic Edge",
    usp1_val: "Virtual Lab in Your Browser for $39/mo",
    usp1_desc: "Replace heavy molecular modeling suites costing $20,000/year per seat with a lightweight, high-performance SaaS. Perfect for contract manufacturing sites (CDMO), startup labs, and dietary supplement brands.",
    usp2_tag: "Risk Mitigation",
    usp2_val: "Prevent Chemical Conflicts Before the First Lab Run",
    usp2_desc: "Save thousands of dollars on wasted raw materials and weeks of failed experimental batches. screen formulations digitally and test only the viable candidates.",

    // Core Features
    core_features_title: "Scientific Core & Computational Engine",
    core_features_subtitle: "Under the hood of our real-time simulation engine",

    // Section 1
    sec1_title: "1. Node-Based Formulation Canvas",
    sec1_tagline: "Smart Canvas: Reacting to your ideas in real-time",
    sec1_desc: "Construct complex multi-ingredient formulations visually. Connect active ingredients (API), fillers, binders, and lubricants using standard drag-and-drop nodes. The flow of data is computed dynamically: any changes in raw materials propagate instantly down the line to blending, pressing, and final output nodes. The visual node canvas ensures absolute conceptual clarity for R&D teams.",

    // Section 2
    sec2_title: "2. Computational Powder Flowability Simulator",
    sec2_tagline: "Mathematical prediction of mechanical flow behavior",
    sec2_desc: "PharmNode automatically calculates Carr's Index and Hausner's Ratio with 4 decimal places of accuracy to ensure dry powder mixtures maintain optimal flowability. The engine prevents tableting issues like capping, lamination, and weight variation by monitoring raw material properties.",
    sec2_math_title: "Mathematical Models Executed:",
    sec2_math_carr: "Carr's Index (C) measures compressibility and predicts flowability classification:",
    sec2_math_hausner: "Hausner's Ratio (H) characterizes flow properties and cohesiveness:",
    sec2_math_fill: "Recommended Tablet Weight (W_rec) represents 90% of theoretical die cavity capacity:",
    sec2_math_carr_formula: "C = 100 * (\\rho_t - \\rho_b) / \\rho_t",
    sec2_math_hausner_formula: "H = \\rho_t / \\rho_b",
    sec2_math_fill_formula: "W_rec = 0.9 * V_die * \\rho_b * 1000",
    sec2_math_terms: "Where \\rho_b is loose bulk density (g/mL), \\rho_t is tapped density (g/mL), and V_die is the fill volume (cm³).",

    // Section 3
    sec3_title: "3. Rule-Based Chemical Compatibility Screen",
    sec3_tagline: "35 Chemical Classes. 13 Deterministic Rules.",
    sec3_desc: "PharmNode contains a rule-based expert system mapping chemical classes to detect formulation conflicts instantly. Unlike standard spreadsheets that calculate formulas blindly, PharmNode analyzes interactions and lights up red or yellow connections on the canvas before any physical materials are mixed.",
    sec3_reactions_title: "Key Chemical Conflicts Modeled:",
    sec3_reaction1_name: "Maillard Browning Reaction",
    sec3_reaction1_desc: "Occurs when primary or secondary amines (e.g. certain active ingredients) are mixed with reducing sugars (such as lactose). In the presence of trace moisture, this results in dark brown degradation products and active substance loss.",
    sec3_reaction2_name: "Alkaline Lubricant Degradation",
    sec3_reaction2_desc: "Alkaline lubricants (like Magnesium Stearate) create a local basic microenvironment, catalyzing the hydrolysis of amine-based compounds and degrading fat-soluble vitamins.",
    sec3_reaction3_name: "Acid-Base Gas Evolution",
    sec3_reaction3_desc: "Mixing organic acids (e.g., Vitamin C) with carbonates or bicarbonates triggers carbon dioxide release under moisture, causing tablet swelling and physical fracturing.",

    // Section 4
    sec4_title: "4. Digital Quality by Design (QbCD)",
    sec4_tagline: "Reduce physical lab runs by 80%",
    sec4_desc: "Quality by Design (QbD) has historically been gatekept by expensive consulting and heavy compliance software. PharmNode democratizes QbCD. Test 10 virtual formulation hypotheses in one evening, discard 8 poor flowability or high-porosity variations, and send only the 2 top-performing options to the physical laboratory.",
    sec4_math_title: "Tablet Porosity (P) Simulation:",
    sec4_math_desc: "We calculate tablet porosity to predict compaction strength and dissolution times:",
    sec4_math_formula: "P = 1 - (\\rho_apparent / \\rho_true)",
    sec4_math_apparent: "Where \\rho_apparent is the apparent density of the tablet (mass / volume), and \\rho_true is the true skeletal density of the blend.",

    // Section 5
    sec5_title: "5. Regulatory-Compliant GMP PDF Reports",
    sec5_tagline: "CDMO-Ready Audit Trails",
    sec5_desc: "Generate professional reports containing complete formula logs, compatibility matrices, and calculated physical parameters. Designed in compliance with FDA 21 CFR Part 11 and EU GMP Annex 11, these reports allow digital signatures and validation notes to ensure seamless tech-transfer to production sites.",

    // Competitive Comparison
    comp_title: "Competitive Landscape Matrix",
    comp_subtitle: "How PharmNode compares to traditional corporate software classes",
    col_class: "Software Class",
    col_drawback: "User Obstacles & Cost",
    col_solution: "The PharmNode Solution",
    comp_list: [
      {
        class: "Heavy Molecular Software (CADD)",
        drawback: "Costs $10,000–$50,000/yr. Requires a PhD in computational chemistry. Focuses on atomic behavior, which is useless for practical compounding of supplement blends.",
        solution: "Operates at the practical formulation level (excipients, binders, APIs). Requires zero training, runs in the browser, and is affordable for small teams."
      },
      {
        class: "Digital CMC / PLM Databases",
        drawback: "Clunky, slow databases designed for regulatory filing. Boring spreadsheets tailored for compliance officers rather than R&D engineers.",
        solution: "Interactive, node-based Canvas. Technologists drag-and-drop ingredients and immediately see physical properties change visually in real-time."
      },
      {
        class: "Design of Experiments (DoE) Software",
        drawback: "Requires you to run 15-20 physical experiments, waste kilograms of expensive raw materials, and manually input results to draw graphs.",
        solution: "Works BEFORE the physical lab. The expert rules identify issues like Maillard browning or compaction failure before you buy a single gram of raw material."
      }
    ],

    // Pricing Matrix
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
    ],

    // CTA
    cta_title: "Ready to Virtualize Your Formulation Workflow?",
    cta_subtitle: "Join thousands of pharmacists and formulators using PharmNode to build stable, optimized recipes in seconds.",
    cta_btn: "Launch Configurator",
    cta_subtext: "Free trial includes 3 ingredients per recipe. No credit card required."
  },
  "ru-RU": {
    back: "На главную",
    title: "Функции платформы",
    subtitle: "Комплексная система поддержки принятия решений (DSS) для разработки рецептур и симуляции твердых форм",
    
    // Canva analogy & USPs
    analogy_badge: "Canva для разработки формуляций",
    analogy_title: "Визуально, мгновенно и в облаке",
    analogy_desc: "Традиционное программное обеспечение для R&D в фармацевтике похоже на AutoCAD — тяжелое, десктопное, дорогое и требует докторской степени по вычислительной химии. PharmNode Studio — это Canva для технологов. Запускайте расчеты в браузере, перетаскивайте компоненты мышкой и связывайте активные вещества, наполнители и лубриканты за секунды.",
    usp_title: "Ключевые ценностные предложения",
    usp1_tag: "Экономическое превосходство",
    usp1_val: "Виртуальная лаборатория на вашем экране за $39/мес",
    usp1_desc: "Замените тяжелый научный софт стоимостью $20,000 в год за лицензию на легкую и быструю SaaS-платформу. Идеально для контрактных производств (CDMO), стартап-лабораторий и брендов БАД.",
    usp2_tag: "Снижение рисков",
    usp2_val: "Предотвратите химические конфликты до первого захода в лабораторию",
    usp2_desc: "Сэкономьте тысячи долларов на испорченном сырье и недели неудачных экспериментальных варок. Проводите скрининг рецептур виртуально и тестируйте только жизнеспособные варианты.",

    // Core Features
    core_features_title: "Научная база и вычислительное ядро",
    core_features_subtitle: "Что находится под капотом симулятора реального времени",

    // Section 1
    sec1_title: "1. Интерактивный холст рецептур",
    sec1_tagline: "Умный холст: реакция на идеи в реальном времени",
    sec1_desc: "Визуально конструируйте сложные многокомпонентные рецептуры. Соединяйте ноды сырья, дозировки в процентах и лубриканты с помощью drag-and-drop интерфейса. Все изменения мгновенно пересчитываются по цепочке: от смесителей до параметров таблетпресса. Визуальный холст обеспечивает абсолютную прозрачность структуры рецептуры для R&D команд.",

    // Section 2
    sec2_title: "2. Вычислительный симулятор сыпучести порошка",
    sec2_tagline: "Математическое прогнозирование механического поведения смеси",
    sec2_desc: "PharmNode автоматически рассчитывает индекс Карра и коэффициент Хауснера с точностью до 4 знаков после запятой для обеспечения стабильной засыпки порошка на высоких скоростях прессования. Движок отслеживает насыпную плотность, плотность после усадки и гранулометрический состав сырья, предупреждая о риске расслоения или зависания смеси.",
    sec2_math_title: "Применяемые математические модели:",
    sec2_math_carr: "Индекс Карра (C) оценивает сжимаемость и прогнозирует класс сыпучести смеси:",
    sec2_math_hausner: "Коэффициент Хауснера (H) характеризует сцепление частиц и когезию:",
    sec2_math_fill: "Рекомендуемый вес таблетки (W_rec) составляет 90% от теоретического объема матрицы:",
    sec2_math_carr_formula: "C = 100 * (\\rho_t - \\rho_b) / \\rho_t",
    sec2_math_hausner_formula: "H = \\rho_t / \\rho_b",
    sec2_math_fill_formula: "W_rec = 0.9 * V_die * \\rho_b * 1000",
    sec2_math_terms: "Где \\rho_b — насыпная плотность до усадки (г/мл), \\rho_t — плотность после усадки (г/мл), а V_die — объем заполнения матрицы пуансона (см³).",

    // Section 3
    sec3_title: "3. Контроль химической совместимости сырья",
    sec3_tagline: "35 химических классов. 13 детерминированных правил.",
    sec3_desc: "PharmNode содержит экспертную систему, сопоставляющую химические классы для мгновенного выявления конфликтов рецептуры. В отличие от обычных калькуляторов, которые молча перемножают пропорции, PharmNode подсвечивает связи на холсте красным или желтым предупреждением еще до физического смешивания.",
    sec3_reactions_title: "Моделируемые критические конфликты:",
    sec3_reaction1_name: "Реакция Майяра (потемнение)",
    sec3_reaction1_desc: "Возникает при смешивании первичных или вторичных аминов (например, многих АФС) с восстанавливающими сахарами (такими как лактоза). Приводит к потемнению смеси и потере активности действующего вещества во влажной среде.",
    sec3_reaction2_name: "Щелочная деградация под действием стеаратов",
    sec3_reaction2_desc: "Щелочные смазывающие вещества (Стеарат магния) создают базовую микросреду, ускоряя гидролитическое расщепление аминных молекул и разрушая жирорастворимые витамины.",
    sec3_reaction3_name: "Кислотно-основное газовыделение",
    sec3_reaction3_desc: "Взаимодействие органических кислот (например, аскорбиновой) с карбонатами при наличии остаточной влаги вызывает выделение углекислого газа, что ведет к вздутию и растрескиванию готовых таблеток.",

    // Section 4
    sec4_title: "4. Цифровой Quality by Design (QbCD)",
    sec4_tagline: "Снижение физических испытаний в лаборатории на 80%",
    sec4_desc: "Методология QbD исторически ассоциировалась с дорогим консалтингом и сложным ПО. PharmNode делает QbD общедоступным. Проверяйте 10 гипотез формулирования за один вечер виртуально, отсекайте 8 плохих или высокопористых вариантов и отправляйте на реальные тесты только 2 лучших рецепта.",
    sec4_math_title: "Симуляция пористости таблетки (P):",
    sec4_math_desc: "Позволяет предсказать прочность прессования и кинетику растворения in vitro:",
    sec4_math_formula: "P = 1 - (\\rho_apparent / \\rho_true)",
    sec4_math_apparent: "Где \\rho_apparent — кажущаяся плотность таблетки (масса / объем), а \\rho_true — истинная плотность смеси сырья.",

    // Section 5
    sec5_title: "5. Валидационные отчеты GMP в PDF",
    sec5_tagline: "Технологические карты, готовые к передаче на завод",
    sec5_desc: "Создавайте профессиональные отчеты, содержащие полную калькуляцию физических свойств смеси и тепловую карту рисков. Отчеты соответствуют стандартам FDA 21 CFR Part 11 и EU GMP Annex 11, поддерживают электронные подписи и валидационные примечания технолога.",

    // Competitive Comparison
    comp_title: "Сравнительный анализ альтернативных подходов",
    comp_subtitle: "Как PharmNode решает проблемы традиционных классов программного обеспечения",
    col_class: "Класс программного обеспечения",
    col_drawback: "Сложности и стоимость для технолога",
    col_solution: "Решение в PharmNode",
    comp_list: [
      {
        class: "Тяжелый молекулярный софт (CADD)",
        drawback: "Стоит $10,000–$50,000/год. Требует PhD по квантовой химии. Фокусируется на межатомном поведении, что неприменимо для обычного смешивания БАД и твердых форм.",
        solution: "Работает на уровне практического формулирования (ингредиенты, наполнители, АФС). Не требует обучения, доступен по цене обычной подписки."
      },
      {
        class: "Системы ведения комплаенса (Digital CMC)",
        drawback: "Огромные, неповоротливые базы данных для хранения отчетов для регуляторов. Скучные текстовые таблицы, созданные для бюрократов, а не для инженеров.",
        solution: "Интерактивный визуальный холст. Технолог перетаскивает ингредиенты и в реальном времени наблюдает физико-химические изменения смеси на экране."
      },
      {
        class: "Статистический софт DoE (Планирование эксперимента)",
        drawback: "Требует пойти в лабораторию, испортить 20 кг сырья, провести 15 тестов руками и вручную ввести эти цифры для построения графиков.",
        solution: "Работает ДО захода в лабораторию. Экспертная система сразу указывает на Майяра или плохую сыпучесть на этапе идеи, сберегая реактивы."
      }
    ],

    // Pricing Matrix
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
    ],

    // CTA
    cta_title: "Готовы перевести разработку рецептур в цифру?",
    cta_subtitle: "Присоединяйтесь к тысячам технологов, которые используют PharmNode для создания стабильных, оптимизированных рецептур за секунды.",
    cta_btn: "Запустить конфигуратор",
    cta_subtext: "Бесплатная версия включает до 3 ингредиентов в рецепте. Банковская карта не требуется."
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
      
      {/* Dynamic Ambient Background Grid */}
      <div className="absolute inset-0 bg-[radial-gradient(var(--grid-dot)_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none opacity-20" />
      <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-[140px] pointer-events-none" />
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

        {/* Hero Section */}
        <div className="pb-8 border-b border-zinc-900/60 mb-12">
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-zinc-100 via-zinc-200 to-indigo-400 bg-clip-text text-transparent leading-tight">
            {dict.title}
          </h1>
          <p className="mt-4 text-base sm:text-lg text-zinc-400 max-w-3xl leading-relaxed">
            {dict.subtitle}
          </p>
        </div>

        {/* Canva Analogy & USPs (Answer-First Concept Block) */}
        <section className="relative rounded-2xl bg-gradient-to-br from-zinc-900/80 to-zinc-950 border border-zinc-800/80 p-6 sm:p-8 backdrop-blur-xl mb-16 shadow-[0_4px_30px_rgba(0,0,0,0.4)]">
          <div className="absolute -top-3 left-6 px-3 py-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full text-[10px] font-extrabold uppercase tracking-widest text-white shadow-md">
            {dict.analogy_badge}
          </div>
          
          <div className="mt-2">
            <h2 className="text-xl sm:text-2xl font-extrabold text-zinc-100 mb-4">
              {dict.analogy_title}
            </h2>
            <p className="text-sm sm:text-base text-zinc-300 leading-relaxed font-medium mb-8">
              {dict.analogy_desc}
            </p>
          </div>

          <div className="border-t border-zinc-800/60 pt-6">
            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-4">
              {dict.usp_title}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* USP 1 */}
              <div className="p-4 rounded-xl bg-zinc-900/40 border border-zinc-800/40 hover:border-indigo-500/30 transition-all flex flex-col justify-between">
                <div>
                  <span className="inline-block text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 bg-indigo-500/10 text-indigo-400 rounded-md mb-2">
                    {dict.usp1_tag}
                  </span>
                  <h4 className="text-sm font-bold text-zinc-200 mb-1">{dict.usp1_val}</h4>
                  <p className="text-xs text-zinc-400 leading-relaxed">{dict.usp1_desc}</p>
                </div>
              </div>

              {/* USP 2 */}
              <div className="p-4 rounded-xl bg-zinc-900/40 border border-zinc-800/40 hover:border-emerald-500/30 transition-all flex flex-col justify-between">
                <div>
                  <span className="inline-block text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 bg-emerald-500/10 text-emerald-400 rounded-md mb-2">
                    {dict.usp2_tag}
                  </span>
                  <h4 className="text-sm font-bold text-zinc-200 mb-1">{dict.usp2_val}</h4>
                  <p className="text-xs text-zinc-400 leading-relaxed">{dict.usp2_desc}</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Detailed Core Features & Math */}
        <section className="mb-16">
          <div className="mb-10 text-center md:text-left">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-100">
              {dict.core_features_title}
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 mt-2">
              {dict.core_features_subtitle}
            </p>
          </div>

          <div className="flex flex-col gap-12">
            
            {/* Feature 1: Canvas */}
            <div className="p-6 sm:p-8 rounded-2xl bg-zinc-900/20 border border-zinc-900 backdrop-blur-sm flex flex-col md:flex-row gap-6 items-start">
              <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-xl">
                <Layers size={24} />
              </div>
              <div className="flex-1">
                <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest block mb-1">
                  {dict.sec1_tagline}
                </span>
                <h3 className="text-lg sm:text-xl font-bold text-zinc-100 mb-3">{dict.sec1_title}</h3>
                <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">{dict.sec1_desc}</p>
              </div>
            </div>

            {/* Feature 2: Flowability Simulation */}
            <div className="p-6 sm:p-8 rounded-2xl bg-zinc-900/20 border border-zinc-900 backdrop-blur-sm flex flex-col md:flex-row gap-6 items-start">
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl">
                <Cpu size={24} />
              </div>
              <div className="flex-1 w-full">
                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest block mb-1">
                  {dict.sec2_tagline}
                </span>
                <h3 className="text-lg sm:text-xl font-bold text-zinc-100 mb-3">{dict.sec2_title}</h3>
                <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed mb-6">{dict.sec2_desc}</p>

                {/* Math panel */}
                <div className="p-5 rounded-xl bg-zinc-950 border border-zinc-800/80 font-mono text-zinc-300">
                  <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-3 flex items-center gap-1.5 font-sans">
                    <Scale size={13} className="text-emerald-400" />
                    {dict.sec2_math_title}
                  </h4>
                  <div className="flex flex-col gap-4 text-xs">
                    <div>
                      <p className="text-zinc-500 mb-1 font-sans">{dict.sec2_math_carr}</p>
                      <div className="p-2 bg-zinc-900 rounded border border-zinc-850 text-emerald-300 font-bold text-center">
                        {dict.sec2_math_carr_formula}
                      </div>
                    </div>
                    <div>
                      <p className="text-zinc-500 mb-1 font-sans">{dict.sec2_math_hausner}</p>
                      <div className="p-2 bg-zinc-900 rounded border border-zinc-850 text-emerald-300 font-bold text-center">
                        {dict.sec2_math_hausner_formula}
                      </div>
                    </div>
                    <div>
                      <p className="text-zinc-500 mb-1 font-sans">{dict.sec2_math_fill}</p>
                      <div className="p-2 bg-zinc-900 rounded border border-zinc-850 text-emerald-300 font-bold text-center">
                        {dict.sec2_math_fill_formula}
                      </div>
                    </div>
                    <p className="text-[10px] text-zinc-500 font-sans mt-1 leading-normal">
                      {dict.sec2_math_terms}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Feature 3: Chemical Compatibility */}
            <div className="p-6 sm:p-8 rounded-2xl bg-zinc-900/20 border border-zinc-900 backdrop-blur-sm flex flex-col md:flex-row gap-6 items-start">
              <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl">
                <ShieldAlert size={24} />
              </div>
              <div className="flex-1 w-full">
                <span className="text-[10px] font-bold text-rose-400 uppercase tracking-widest block mb-1">
                  {dict.sec3_tagline}
                </span>
                <h3 className="text-lg sm:text-xl font-bold text-zinc-100 mb-3">{dict.sec3_title}</h3>
                <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed mb-6">{dict.sec3_desc}</p>

                {/* Compatibility reactions detail */}
                <div className="p-5 rounded-xl bg-zinc-950 border border-zinc-800/80 font-sans text-xs">
                  <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-3 flex items-center gap-1.5 font-sans">
                    <Flame size={13} className="text-rose-400" />
                    {dict.sec3_reactions_title}
                  </h4>
                  <div className="flex flex-col gap-4">
                    {/* Reaction 1 */}
                    <div className="border-b border-zinc-900 pb-3">
                      <h5 className="font-bold text-zinc-200 flex items-center gap-2 mb-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                        {dict.sec3_reaction1_name}
                      </h5>
                      <p className="text-zinc-400 text-xs leading-relaxed">{dict.sec3_reaction1_desc}</p>
                    </div>
                    {/* Reaction 2 */}
                    <div className="border-b border-zinc-900 pb-3">
                      <h5 className="font-bold text-zinc-200 flex items-center gap-2 mb-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                        {dict.sec3_reaction2_name}
                      </h5>
                      <p className="text-zinc-400 text-xs leading-relaxed">{dict.sec3_reaction2_desc}</p>
                    </div>
                    {/* Reaction 3 */}
                    <div>
                      <h5 className="font-bold text-zinc-200 flex items-center gap-2 mb-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                        {dict.sec3_reaction3_name}
                      </h5>
                      <p className="text-zinc-400 text-xs leading-relaxed">{dict.sec3_reaction3_desc}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Feature 4: Quality by Design (QbD) */}
            <div className="p-6 sm:p-8 rounded-2xl bg-zinc-900/20 border border-zinc-900 backdrop-blur-sm flex flex-col md:flex-row gap-6 items-start">
              <div className="p-3 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-xl">
                <Activity size={24} />
              </div>
              <div className="flex-1 w-full">
                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest block mb-1">
                  {dict.sec4_tagline}
                </span>
                <h3 className="text-lg sm:text-xl font-bold text-zinc-100 mb-3">{dict.sec4_title}</h3>
                <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed mb-6">{dict.sec4_desc}</p>

                {/* Porosity model */}
                <div className="p-5 rounded-xl bg-zinc-950 border border-zinc-800/80 font-mono text-zinc-300">
                  <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2 flex items-center gap-1.5 font-sans">
                    <Beaker size={13} className="text-amber-400" />
                    {dict.sec4_math_title}
                  </h4>
                  <p className="text-zinc-500 mb-2 font-sans text-xs">{dict.sec4_math_desc}</p>
                  <div className="p-2 bg-zinc-900 rounded border border-zinc-850 text-amber-300 font-bold text-center text-xs mb-2">
                    {dict.sec4_math_formula}
                  </div>
                  <p className="text-[10px] text-zinc-500 font-sans leading-normal">
                    {dict.sec4_math_apparent}
                  </p>
                </div>
              </div>
            </div>

            {/* Feature 5: GMP PDF */}
            <div className="p-6 sm:p-8 rounded-2xl bg-zinc-900/20 border border-zinc-900 backdrop-blur-sm flex flex-col md:flex-row gap-6 items-start">
              <div className="p-3 bg-purple-500/10 border border-purple-500/20 text-purple-400 rounded-xl">
                <Coins size={24} />
              </div>
              <div className="flex-1">
                <span className="text-[10px] font-bold text-purple-400 uppercase tracking-widest block mb-1">
                  {dict.sec5_tagline}
                </span>
                <h3 className="text-lg sm:text-xl font-bold text-zinc-100 mb-3">{dict.sec5_title}</h3>
                <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">{dict.sec5_desc}</p>
              </div>
            </div>

          </div>
        </section>

        {/* Competitive Landscape Matrix (Native Table) */}
        <section className="border-t border-zinc-900 pt-16 mb-16">
          <div className="mb-8">
            <h2 className="text-xl sm:text-2xl font-bold text-zinc-100">{dict.comp_title}</h2>
            <p className="text-xs text-zinc-400 mt-1">{dict.comp_subtitle}</p>
          </div>

          <div className="overflow-x-auto rounded-xl border border-zinc-900 bg-zinc-950 shadow-inner">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-zinc-900 bg-zinc-900/40 text-zinc-300 font-bold uppercase tracking-wider">
                  <th className="py-4 px-6 w-[25%]">{dict.col_class}</th>
                  <th className="py-4 px-6 w-[45%]">{dict.col_drawback}</th>
                  <th className="py-4 px-6 text-indigo-400 w-[30%]">{dict.col_solution}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-900 text-zinc-400">
                {dict.comp_list.map((item, idx) => (
                  <tr key={idx} className="hover:bg-zinc-900/20 transition-colors">
                    <td className="py-4 px-6 font-bold text-zinc-200">{item.class}</td>
                    <td className="py-4 px-6 leading-relaxed">{item.drawback}</td>
                    <td className="py-4 px-6 text-indigo-300 font-semibold leading-relaxed bg-indigo-950/10">{item.solution}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Feature Comparison Table */}
        <section className="border-t border-zinc-900 pt-16 mb-16">
          <div className="mb-8">
            <h2 className="text-xl sm:text-2xl font-bold text-zinc-100">{dict.table_title}</h2>
            <p className="text-xs text-zinc-400 mt-1">{dict.table_subtitle}</p>
          </div>

          <div className="overflow-x-auto rounded-xl border border-zinc-900 bg-zinc-950 shadow-inner">
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

        {/* CTA (Call To Action) Section */}
        <section className="relative rounded-2xl bg-gradient-to-br from-indigo-950/40 via-purple-950/20 to-zinc-950 border border-indigo-500/20 p-8 sm:p-12 text-center overflow-hidden shadow-[0_0_50px_rgba(99,102,241,0.15)] mb-8">
          <div className="absolute -top-12 -right-12 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10 max-w-2xl mx-auto flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-4 animate-bounce">
              <Sparkles size={20} />
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
