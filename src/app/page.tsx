"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useTranslation } from "@/context/I18nContext";
import {
  Cpu,
  Settings,
  DollarSign,
  FileText,
  CheckCircle,
  ArrowRight,
  ShieldAlert,
  Beaker,
  Gauge,
  Layers,
  ChevronRight,
  Database,
  Lock,
  CreditCard,
  Building,
  Check,
  Scale
} from "lucide-react";

// Dictionaries for Landing Page content to keep code organized and support localized routes/headers
const translations = {
  "en-US": {
    nav_features: "Features",
    nav_workflow: "Workflow",
    nav_tech: "Technologies",
    nav_regulatory: "Regulatory",
    btn_open: "Open Studio",
    hero_badge: "Digital Pharmaceutical Compounding",
    hero_title: "Virtual Formulation Studio for B2B Pharma & Supplements",
    hero_desc: "Design formulations, calculate powder flowability, simulate tablet presses, verify regulatory limits, and generate GMP compliance reports in a real-time, node-based workspace.",
    hero_cta: "Launch Configurator",
    hero_secondary: "Explore Features",
    mock_title: "Active Formula: Amlodipine_Besylate_v1.2",
    mock_tag: "PRO SIMULATION ACTIVE",
    active_lbl: "Active",
    percentage_lbl: "Input percentage:",
    blend_lbl: "Blending Node",
    flowability_lbl: "flowability",
    carr_lbl: "Hausner Ratio:",
    cost_lbl: "Raw cost:",
    punch_lbl: "Punch 8.0 mm",
    press_lbl: "Tablet Press",
    tablets_lbl: "Tablets output:",
    weight_lbl: "Tablet weight:",
    features_subtitle: "All your calculations in a single visual workspace",
    features_desc: "We combine chemistry logic, physical properties simulation, and B2B pricing parameters into a powerful node-based canvas.",
    feature_node: "Node-Based Editor",
    feature_node_desc: "Connect ingredients, adjust active pharmaceutical ingredients (APIs), and preview formulation components dynamically.",
    feature_math: "Physical Simulator",
    feature_math_desc: "Instant calculations of Carr's Index, Hausner Ratio, bulk and tapped densities to ensure blend flowability.",
    feature_chem: "Chemical Compatibility",
    feature_chem_desc: "Real-time verification of raw material conflicts. Detect amino-sugar browning and lactose allergen conflicts.",
    feature_gmp: "GMP Documentation",
    feature_gmp_desc: "Generate strict regulatory PDFs containing technological instructions, safety sheets, and digital validator signatures.",
    workflow_title: "From initial idea to tech spec in 3 simple steps",
    workflow_desc: "PharmNode streamlines drug design, replacing outdated Excel sheets with a digital decision support system.",
    workflow_step1: "1. Select Active Ingredient",
    workflow_step1_desc: "Add substances with pre-populated CAS numbers, densities, and safe limits.",
    workflow_step2: "2. Add Excipients & Binders",
    workflow_step2_desc: "Tweak input percentages. The engine recalculates blend flowability and alerts you of errors.",
    workflow_step3: "3. Press Simulation & GMP Export",
    workflow_step3_desc: "Set punch dimensions, calculate tablet porosity, and export validated technological logs.",
    gmp_header: "GMP Validation Report (Simulation)",
    gmp_doc: "Document ID: US-21CFR-112",
    gmp_rule1: "Ingredient Role Compatibility:",
    gmp_rule1_status: "COMPLIANT (100%)",
    gmp_rule2: "Magnesium Stearate Hydrophobicity:",
    gmp_rule3: "Allergen Profile (FALCPA):",
    gmp_rule3_warning: "Warning: Contains Milk (Lactose)",
    gmp_rule4: "FDA Label Standard (21 CFR):",
    gmp_rule4_val: "Dietary Supplement Standard (US)",
    disclaimer_hdr: "DSS Regulatory Notice",
    disclaimer_body: "PharmNode acts as a Decision Support System (DSS). All formulas are predictive. Physical laboratory validation (FTIR, DSC, HPLC) is strictly required before scale-up and industrial manufacturing.",
    tech_title: "Built on State-of-the-Art Software Stack",
    tech_desc: "We leverage industry-leading technologies to guarantee low latency, robust data storage, and compliance.",
    tech_ssr: "Next.js 16 & React 19",
    tech_ssr_desc: "Fast hybrid server and client rendering with strict typing.",
    tech_db: "PostgreSQL & Prisma ORM",
    tech_db_desc: "Safe relational storage of users, projects, and component schemas.",
    tech_nosql: "MongoDB Database",
    tech_nosql_desc: "Flexible, high-performance storage for complex node-based canvas graphs.",
    tech_auth: "Secure OAuth Security",
    tech_auth_desc: "Secure login utilizing NextAuth.js for corporate credentials.",
    tech_billing: "Stripe Billing Engine",
    tech_billing_desc: "Instant subscription management for Pro plan.",
    reg_title: "Regulatory Compliance Standards",
    reg_desc: "Our verification engine is engineered in collaboration with pharma consultants to comply with major legal environments.",
    reg_fda: "FDA Title 21 CFR",
    reg_fda_desc: "Complies with digital signature requirements, dietary supplement labeling rules, and safe input thresholds.",
    reg_efsa: "EFSA Supplement Rules",
    reg_efsa_desc: "Enforces metric parameters, EU allergens reporting, and EFSA maximum safe daily intake parameters.",
    reg_falcpa: "Allergen Disclosures",
    reg_falcpa_desc: "Automatically profiles allergens and prints mandatory 'Contains' statements for allergens like lactose or gluten.",
    cta_title: "Ready to optimize your formulations?",
    cta_desc: "Start designing in our sandbox immediately. No credit card required.",
    cta_btn: "Open Interactive Canvas",
    footer_copy: "PharmNode. All rights reserved.",
    footer_terms: "Terms of Use",
    footer_eula: "EULA / DSS Disclaimer",
    footer_fda: "FDA Compliance",
    terms_title: "Terms of Use",
    terms_p1: "1. Acceptance of Terms: By accessing PharmNode, you agree to comply with these Terms of Use and standard enterprise regulations.",
    terms_p2: "2. Usage Boundaries: This application is a mathematical simulation studio. Users remain fully responsible for the compliance, legality, and safety of any formulas created.",
    terms_p3: "3. Disclaimer of Liability: In no event shall PharmNode or its developers be held liable for any production failures, batch contamination, or regulatory fines incurred during physical product testing.",
    eula_title: "EULA / Decision Support System (DSS) Agreement",
    eula_alert: "IMPORTANT: PharmNode is a virtual Decision Support System (DSS). It does not guarantee physical formula stability or biological bioavailability.",
    eula_p1: "Users must perform laboratory trials including Fourier-transform infrared spectroscopy (FTIR), differential scanning calorimetry (DSC), and high-performance liquid chromatography (HPLC) prior to scale-up.",
    eula_p2: "All calculations are purely predictive and provided on an 'as-is' basis without any warranties or guarantees of any kind.",
    fda_title: "FDA Compliance & Regulatory Standards",
    fda_p1: "FDA Title 21 CFR Part 11: Designed to accommodate GMP/GxP logging, electronic signature support, and audit trailing protocols for commercial use.",
    fda_p2: "FALCPA Standard: Automatic declaration of major allergens in dietary supplements. Warnings are generated for substances containing milk (lactose), wheat (gluten), soy, or nuts.",
    fda_p3: "DSHEA 1994 Compliance: Automatic inclusion of required dietary supplement labeling statements for products intended for distribution in the United States.",
    btn_close: "Close"
  },
  "ru-RU": {
    nav_features: "Функции",
    nav_workflow: "Техпроцесс",
    nav_tech: "Технологии",
    nav_regulatory: "Регуляторика",
    btn_open: "Открыть Студию",
    hero_badge: "Цифровое фармацевтическое моделирование",
    hero_title: "Виртуальная студия разработки лекарств и БАДов",
    hero_desc: "Проектируйте рецептуры, рассчитывайте сыпучесть порошков, симулируйте параметры пресса и автоматически проверяйте нормы FDA/EFSA на холсте в реальном времени.",
    hero_cta: "Запустить конфигуратор",
    hero_secondary: "Изучить функции",
    mock_title: "Формула: Amlodipine_Besylate_v1.2",
    mock_tag: "PRO СИМУЛЯЦИЯ АКТИВНА",
    active_lbl: "Активное",
    percentage_lbl: "Процент ввода:",
    blend_lbl: "Смеситель",
    flowability_lbl: "сыпучесть",
    carr_lbl: "Коэф. Хауснера:",
    cost_lbl: "Цена смеси:",
    punch_lbl: "Пуансон 8.0 мм",
    press_lbl: "Таблетпресс",
    tablets_lbl: "Выпуск таблеток:",
    weight_lbl: "Вес таблетки:",
    features_subtitle: "Все технологические расчеты на одном холсте",
    features_desc: "Мы объединили химическую логику, симуляцию физических свойств порошков и B2B-калькуляцию затрат в один удобный визуальный холст.",
    feature_node: "Интерактивный холст",
    feature_node_desc: "Управляйте составом формуляции, связывайте ноды ингредиентов и отслеживайте их влияние друг на друга.",
    feature_math: "Физический симулятор",
    feature_math_desc: "Мгновенный расчет индекса Карра, коэффициента Хауснера, насыпной плотности и сжимаемости смеси.",
    feature_chem: "Химический контроль",
    feature_chem_desc: "Автоматическое выявление несовместимостей. Предотвращение реакции Майяра и аллергенных конфликтов.",
    feature_gmp: "GMP Документация",
    feature_gmp_desc: "Генерация строгих отчетов GMP в формате PDF с технологической картой и цифровой подписью.",
    workflow_title: "От идеи до технологической карты за 3 простых шага",
    workflow_desc: "PharmNode заменяет разрозненные Excel-таблицы на единую интеллектуальную систему поддержки принятия решений.",
    workflow_step1: "1. Выберите действующее вещество",
    workflow_step1_desc: "Добавьте компонент из каталога с предзаполненными CAS номерами и лимитами безопасности.",
    workflow_step2: "2. Подберите наполнители",
    workflow_step2_desc: "Изменяйте процент ввода. Движок мгновенно пересчитает сыпучесть порошка и укажет на ошибки.",
    workflow_step3: "3. Симулируйте пресс и экспорт",
    workflow_step3_desc: "Настройте диаметр таблетки, глубину засыпки и скачайте готовый технологический GMP-отчет.",
    gmp_header: "Валидационный отчет GMP (Симуляция)",
    gmp_doc: "ID Документа: RU-21CFR-112",
    gmp_rule1: "Совместимость ингредиентов:",
    gmp_rule1_status: "СООТВЕТСТВУЕТ (100%)",
    gmp_rule2: "Концентрация Стеарата Магния:",
    gmp_rule3: "Профиль аллергенов (FALCPA):",
    gmp_rule3_warning: "Внимание: Содержит Лактозу (Молоко)",
    gmp_rule4: "Стандарт маркировки FDA (21 CFR):",
    gmp_rule4_val: "Стандарт БАД (США)",
    disclaimer_hdr: "Регуляторное предупреждение DSS",
    disclaimer_body: "PharmNode является системой поддержки принятия решений (DSS). Все расчеты носят прогностический характер и требуют обязательной физической валидации в лаборатории перед началом производства.",
    tech_title: "Современный технологический стек",
    tech_desc: "Мы используем лучшие решения для обеспечения минимального времени отклика и максимальной надежности данных.",
    tech_ssr: "Next.js 16 и React 19",
    tech_ssr_desc: "Высокопроизводительное гибридное серверно-клиентское приложение со строгой типизацией.",
    tech_db: "PostgreSQL и Prisma ORM",
    tech_db_desc: "Надежная реляционная база для хранения профилей, проектов и прав доступа.",
    tech_nosql: "База данных MongoDB",
    tech_nosql_desc: "Масштабируемое и гибкое хранилище для структурных схем и графов холста.",
    tech_auth: "Безопасность и OAuth",
    tech_auth_desc: "Защищенный вход по стандартам OAuth 2.0 (Google, GitHub, Microsoft).",
    tech_billing: "Биллинг Stripe",
    tech_billing_desc: "Мгновенное управление подписками и биллингом для Pro тарифа.",
    reg_title: "Стандарты регуляторного контроля",
    reg_desc: "Наша система валидации разработана совместно с экспертами фармацевтической отрасли.",
    reg_fda: "FDA Title 21 CFR",
    reg_fda_desc: "Проверка соответствия электронной документации, маркировки БАДов и лимитов ввода сырья.",
    reg_efsa: "Стандарты EFSA (Евросоюз)",
    reg_efsa_desc: "Поддержка метрической системы, норм информирования об аллергенах и суточных доз потребления.",
    reg_falcpa: "Раскрытие аллергенов",
    reg_falcpa_desc: "Автоматический анализ состава и вывод обязательных предупреждений об аллергенах (лактоза, глютен).",
    cta_title: "Готовы оптимизировать ваши рецептуры?",
    cta_desc: "Начните проектирование в песочнице прямо сейчас. Регистрация не требуется.",
    cta_btn: "Открыть интерактивный холст",
    footer_copy: "PharmNode. Все права защищены.",
    footer_terms: "Условия использования",
    footer_eula: "EULA / DSS Дисклеймер",
    footer_fda: "Соответствие FDA",
    terms_title: "Условия использования",
    terms_p1: "1. Согласие с условиями: Доступ к платформе PharmNode означает ваше согласие с данными Условиями использования и корпоративными правилами.",
    terms_p2: "2. Границы использования: Данное приложение является студией математического моделирования. Пользователи несут единоличную ответственность за соответствие, легальность и безопасность создаваемых формул.",
    terms_p3: "3. Ограничение ответственности: PharmNode и его разработчики ни при каких обстоятельствах не несут ответственности за сбои в производстве, порчу партий сырья или регуляторные штрафы при тестировании физического продукта.",
    eula_title: "EULA / Соглашение системы поддержки принятия решений (DSS)",
    eula_alert: "ВАЖНО: PharmNode — это виртуальная система поддержки принятия решений (DSS). Система не гарантирует физическую стабильность формулы или её биологическую усвояемость.",
    eula_p1: "Пользователи обязаны провести лабораторные испытания, включая ИК-спектроскопию (FTIR), дифференциальную сканирующую калориметрию (DSC) и высокоэффективную жидкостную хроматографию (HPLC) перед масштабированием.",
    eula_p2: "Все расчеты носят исключительно прогностический характер и предоставляются на условиях «как есть» без каких-либо явных или подразумеваемых гарантий.",
    fda_title: "Соответствие стандартам FDA и регуляторике",
    fda_p1: "FDA Title 21 CFR Part 11: Система спроектирована с учетом поддержки логирования GMP/GxP, электронных подписей и протоколов аудита для коммерческого использования.",
    fda_p2: "Стандарт FALCPA: Автоматическое декларирование основных аллергенов в пищевых добавках. Предупреждения генерируются для веществ, содержащих молоко (лактозу), пшеницу (глютен), сою или орехи.",
    fda_p3: "Соответствие DSHEA 1994: Автоматическое включение обязательных дисклеймеров FDA для продуктов, предназначенных для распространения на территории США.",
    btn_close: "Закрыть"
  }
};

type LocaleKey = "en-US" | "ru-RU";

export default function LandingPage() {
  const { locale, setLocale } = useTranslation();
  const currentLocale: LocaleKey = (locale === "ru-RU") ? "ru-RU" : "en-US";
  const dict = translations[currentLocale];

  // Legal Modals State
  const [modalOpen, setModalOpen] = useState<{
    terms: boolean;
    eula: boolean;
    fda: boolean;
  }>({
    terms: false,
    eula: false,
    fda: false
  });

  const closeModals = () => {
    setModalOpen({ terms: false, eula: false, fda: false });
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans theme-element relative overflow-hidden">

      {/* Background patterns */}
      <div className="absolute inset-0 bg-[radial-gradient(var(--grid-dot)_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none opacity-30" />
      <div className="absolute top-0 inset-x-0 h-[500px] bg-gradient-to-b from-indigo-500/5 via-purple-500/0 to-transparent pointer-events-none" />

      {/* Navigation Header */}
      <header className="h-16 border-b border-zinc-900 bg-zinc-950/80 backdrop-blur-md sticky top-0 z-50 px-6 flex items-center justify-between theme-element">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-white text-sm shadow-[0_0_15px_rgba(99,102,241,0.2)]">
            PN
          </div>
          <div>
            <span className="text-sm font-bold text-zinc-100 uppercase tracking-wider block">PharmNode</span>
            <span className="text-[9px] text-zinc-500 block leading-none">Formulation B2B SaaS</span>
          </div>
        </div>

        <nav className="hidden md:flex items-center gap-8 text-xs font-semibold text-zinc-400">
          <a href="#features" className="hover:text-zinc-100 transition-colors">{dict.nav_features}</a>
          <a href="#workflow" className="hover:text-zinc-100 transition-colors">{dict.nav_workflow}</a>
          <a href="#technology" className="hover:text-zinc-100 transition-colors">{dict.nav_tech}</a>
          <a href="#regulatory" className="hover:text-zinc-100 transition-colors">{dict.nav_regulatory}</a>
        </nav>

        <div className="flex items-center gap-4">
          <button
            onClick={() => setLocale(locale === "ru-RU" ? "en-US" : "ru-RU")}
            className="px-2.5 py-1.5 rounded-lg border border-zinc-800 bg-zinc-900/60 text-xs font-bold text-zinc-300 hover:text-zinc-100 hover:bg-zinc-800 transition-colors cursor-pointer theme-element"
            title="Переключить язык (EN/RU)"
          >
            {locale === "ru-RU" ? "RU" : "EN"}
          </button>

          <ThemeToggle />

          <Link
            href="/projects"
            className="px-4 py-1.5 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg text-xs font-bold shadow-lg shadow-indigo-500/10 hover:shadow-indigo-500/20 transition-all flex items-center gap-1 group theme-element"
          >
            {dict.btn_open}
            <ArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-20 pb-16 px-6 max-w-7xl mx-auto flex flex-col items-center text-center">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-900/80 border border-zinc-800 text-zinc-400 text-[10px] font-bold uppercase tracking-wider mb-6">
          <Beaker size={12} className="text-indigo-400" />
          {dict.hero_badge}
        </div>

        <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight max-w-4xl text-transparent bg-clip-text bg-gradient-to-r from-zinc-100 via-zinc-200 to-indigo-400 leading-tight">
          {dict.hero_title}
        </h1>

        <p className="mt-6 text-sm sm:text-base md:text-lg text-zinc-400 max-w-2xl leading-relaxed">
          {dict.hero_desc}
        </p>

        <div className="mt-8 flex flex-col sm:flex-row items-center gap-4">
          <Link
            href="/projects"
            className="px-6 py-3 bg-indigo-500 hover:bg-indigo-600 active:bg-indigo-700 text-white rounded-xl text-sm font-bold shadow-xl shadow-indigo-500/20 transition-all flex items-center gap-2 group theme-element"
          >
            {dict.hero_cta}
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </Link>
          <a
            href="#features"
            className="px-6 py-3 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 text-zinc-300 hover:text-zinc-100 rounded-xl text-sm font-semibold transition-all theme-element"
          >
            {dict.hero_secondary}
          </a>
        </div>

        {/* Visual Workspace Mockup */}
        <div className="mt-16 w-full max-w-5xl rounded-2xl border border-zinc-800/80 bg-zinc-900/40 backdrop-blur-md p-4 md:p-6 shadow-2xl relative">
          <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-zinc-800 to-transparent" />

          <div className="flex justify-between items-center pb-4 border-b border-zinc-800/60 mb-6 text-xs text-zinc-500">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/30" />
              <span className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/30" />
              <span className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/30" />
              <span className="font-mono ml-2">{dict.mock_title}</span>
            </div>
            <span className="bg-zinc-900 border border-zinc-800 px-2 py-0.5 rounded text-[10px] font-bold text-indigo-400">
              {dict.mock_tag}
            </span>
          </div>

          {/* Graphical layout mockup */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">

            {/* Card 1: Ingredient */}
            <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4 text-left flex flex-col gap-2 relative">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-rose-400 font-bold uppercase tracking-wider border border-rose-500/20 bg-rose-500/5 px-2 py-0.5 rounded">
                  {dict.active_lbl}
                </span>
                <span className="text-[10px] text-zinc-500 font-mono">CAS: 111470-99-6</span>
              </div>
              <h4 className="font-bold text-sm text-zinc-100">Amlodipine Besylate</h4>
              <div className="flex justify-between items-center text-xs mt-2">
                <span className="text-zinc-500">{dict.percentage_lbl}</span>
                <span className="font-mono text-zinc-300 font-bold">12.5%</span>
              </div>
              <div className="w-full bg-zinc-800 h-1.5 rounded-full mt-1">
                <div className="bg-indigo-500 h-full rounded-full" style={{ width: "12.5%" }} />
              </div>
            </div>

            {/* Card 2: Blending Mixer */}
            <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4 text-left flex flex-col gap-2 relative">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider border border-indigo-500/20 bg-indigo-500/5 px-2 py-0.5 rounded">
                  {dict.blend_lbl}
                </span>
                <span className="text-emerald-400 font-bold text-[10px]">99.8% {dict.flowability_lbl}</span>
              </div>
              <h4 className="font-bold text-sm text-zinc-100 flex items-center gap-1.5">
                <Cpu size={14} className="text-indigo-400" />
                {currentLocale === "ru-RU" ? "Смеситель" : "Blending"}
              </h4>
              <div className="grid grid-cols-2 gap-2 mt-2 text-[10px] text-zinc-400">
                <div className="bg-zinc-850 p-1.5 rounded border border-zinc-800">
                  <span className="text-zinc-500 block">{dict.carr_lbl}</span>
                  <span className="font-mono text-zinc-200 font-bold">1.09 (Excellent)</span>
                </div>
                <div className="bg-zinc-850 p-1.5 rounded border border-zinc-800">
                  <span className="text-zinc-500 block">{dict.cost_lbl}</span>
                  <span className="font-mono text-emerald-400 font-bold">$12.40 / kg</span>
                </div>
              </div>
            </div>

            {/* Card 3: Press output */}
            <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4 text-left flex flex-col gap-2 relative">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider border border-amber-500/20 bg-amber-500/5 px-2 py-0.5 rounded">
                  {dict.press_lbl}
                </span>
                <span className="text-zinc-500 text-[10px]">Porosity: 18.4%</span>
              </div>
              <h4 className="font-bold text-sm text-zinc-100 flex items-center gap-1.5">
                <Settings size={14} className="text-indigo-400" />
                {dict.punch_lbl}
              </h4>
              <div className="bg-zinc-900 border border-zinc-800 p-2 rounded text-[10px] flex flex-col gap-1 mt-1 font-mono">
                <div className="flex justify-between">
                  <span className="text-zinc-500">{dict.tablets_lbl}</span>
                  <span className="text-indigo-400 font-bold">85,200 шт.</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">{dict.weight_lbl}</span>
                  <span className="text-zinc-200">112.5 мг</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-6 max-w-7xl mx-auto border-t border-zinc-900 w-full">
        <div className="text-center flex flex-col gap-3 mb-16">
          <h2 className="text-2xl sm:text-4xl font-extrabold text-zinc-100">
            {dict.features_subtitle}
          </h2>
          <p className="text-zinc-400 max-w-xl mx-auto text-xs sm:text-sm">
            {dict.features_desc}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1 */}
          <div className="bg-zinc-900/50 border border-zinc-800/80 rounded-2xl p-6 hover:border-zinc-700/80 transition-all duration-300 theme-element flex flex-col gap-4">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 shrink-0">
              <Layers size={20} />
            </div>
            <h3 className="font-bold text-sm text-zinc-100">{dict.feature_node}</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              {dict.feature_node_desc}
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-zinc-900/50 border border-zinc-800/80 rounded-2xl p-6 hover:border-zinc-700/80 transition-all duration-300 theme-element flex flex-col gap-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 shrink-0">
              <Gauge size={20} />
            </div>
            <h3 className="font-bold text-sm text-zinc-100">{dict.feature_math}</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              {dict.feature_math_desc}
            </p>
          </div>

          {/* Card 3 */}
          <div className="bg-zinc-900/50 border border-zinc-800/80 rounded-2xl p-6 hover:border-zinc-700/80 transition-all duration-300 theme-element flex flex-col gap-4">
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-400 shrink-0">
              <ShieldAlert size={20} />
            </div>
            <h3 className="font-bold text-sm text-zinc-100">{dict.feature_chem}</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              {dict.feature_chem_desc}
            </p>
          </div>

          {/* Card 4 */}
          <div className="bg-zinc-900/50 border border-zinc-800/80 rounded-2xl p-6 hover:border-zinc-700/80 transition-all duration-300 theme-element flex flex-col gap-4">
            <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center text-violet-400 shrink-0">
              <FileText size={20} />
            </div>
            <h3 className="font-bold text-sm text-zinc-100">{dict.feature_gmp}</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              {dict.feature_gmp_desc}
            </p>
          </div>
        </div>
      </section>

      {/* Workflow Section */}
      <section id="workflow" className="py-20 px-6 max-w-7xl mx-auto border-t border-zinc-900 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-5 flex flex-col gap-6">
            <h2 className="text-2xl sm:text-4xl font-extrabold text-zinc-100 leading-tight">
              {dict.workflow_title}
            </h2>
            <p className="text-sm text-zinc-400 leading-relaxed">
              {dict.workflow_desc}
            </p>
            <ul className="flex flex-col gap-4 text-xs">
              <li className="flex gap-2.5">
                <CheckCircle size={16} className="text-indigo-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-zinc-200 block">{dict.workflow_step1}</strong>
                  <span className="text-zinc-400">{dict.workflow_step1_desc}</span>
                </div>
              </li>
              <li className="flex gap-2.5">
                <CheckCircle size={16} className="text-indigo-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-zinc-200 block">{dict.workflow_step2}</strong>
                  <span className="text-zinc-400">{dict.workflow_step2_desc}</span>
                </div>
              </li>
              <li className="flex gap-2.5">
                <CheckCircle size={16} className="text-indigo-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-zinc-200 block">{dict.workflow_step3}</strong>
                  <span className="text-zinc-400">{dict.workflow_step3_desc}</span>
                </div>
              </li>
            </ul>
          </div>

          <div className="lg:col-span-7 bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-6 flex flex-col gap-4 theme-element">
            <div className="flex justify-between items-center text-xs text-zinc-400 pb-2 border-b border-zinc-800/50">
              <span className="font-semibold text-zinc-300">{dict.gmp_header}</span>
              <span className="text-[10px] text-zinc-500">{dict.gmp_doc}</span>
            </div>

            <div className="flex flex-col gap-3 font-mono text-[10px] text-zinc-400">
              <div className="flex justify-between py-1 border-b border-zinc-900">
                <span>{dict.gmp_rule1}</span>
                <span className="text-emerald-400 font-bold">{dict.gmp_rule1_status}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-zinc-900">
                <span>{dict.gmp_rule2}</span>
                <span className="text-emerald-400">Pass (1.2% &le; 1.5% max)</span>
              </div>
              <div className="flex justify-between py-1 border-b border-zinc-900">
                <span>{dict.gmp_rule3}</span>
                <span className="text-amber-400">{dict.gmp_rule3_warning}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-zinc-900">
                <span>{dict.gmp_rule4}</span>
                <span className="text-zinc-300">{dict.gmp_rule4_val}</span>
              </div>
            </div>

            <div className="mt-4 p-4 bg-zinc-900 rounded border border-zinc-800 text-[10px] text-zinc-400 flex flex-col gap-2">
              <div className="font-bold text-zinc-300 flex items-center gap-1.5 uppercase text-[9px] tracking-wider text-rose-400">
                <ShieldAlert size={14} />
                {dict.disclaimer_hdr}
              </div>
              <p className="leading-relaxed">
                {dict.disclaimer_body}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Technologies Section */}
      <section id="technology" className="py-20 px-6 max-w-7xl mx-auto border-t border-zinc-900 w-full">
        <div className="text-center flex flex-col gap-3 mb-16">
          <h2 className="text-2xl sm:text-4xl font-extrabold text-zinc-100">
            {dict.tech_title}
          </h2>
          <p className="text-zinc-400 max-w-xl mx-auto text-xs sm:text-sm">
            {dict.tech_desc}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="p-6 bg-zinc-900/60 border border-zinc-800 rounded-2xl flex flex-col gap-3">
            <Cpu className="text-indigo-400" size={24} />
            <h4 className="font-bold text-zinc-100 text-sm">{dict.tech_ssr}</h4>
            <p className="text-xs text-zinc-400 leading-relaxed">{dict.tech_ssr_desc}</p>
          </div>
          <div className="p-6 bg-zinc-900/60 border border-zinc-800 rounded-2xl flex flex-col gap-3">
            <Database className="text-indigo-400" size={24} />
            <h4 className="font-bold text-zinc-100 text-sm">{dict.tech_db}</h4>
            <p className="text-xs text-zinc-400 leading-relaxed">{dict.tech_db_desc}</p>
          </div>
          <div className="p-6 bg-zinc-900/60 border border-zinc-800 rounded-2xl flex flex-col gap-3">
            <Layers className="text-indigo-400" size={24} />
            <h4 className="font-bold text-zinc-100 text-sm">{dict.tech_nosql}</h4>
            <p className="text-xs text-zinc-400 leading-relaxed">{dict.tech_nosql_desc}</p>
          </div>
          <div className="p-6 bg-zinc-900/60 border border-zinc-800 rounded-2xl flex flex-col gap-3">
            <Lock className="text-indigo-400" size={24} />
            <h4 className="font-bold text-zinc-100 text-sm">{dict.tech_auth}</h4>
            <p className="text-xs text-zinc-400 leading-relaxed">{dict.tech_auth_desc}</p>
          </div>
          <div className="p-6 bg-zinc-900/60 border border-zinc-800 rounded-2xl flex flex-col gap-3">
            <CreditCard className="text-indigo-400" size={24} />
            <h4 className="font-bold text-zinc-100 text-sm">{dict.tech_billing}</h4>
            <p className="text-xs text-zinc-400 leading-relaxed">{dict.tech_billing_desc}</p>
          </div>
        </div>
      </section>

      {/* Regulatory Section */}
      <section id="regulatory" className="py-20 px-6 max-w-7xl mx-auto border-t border-zinc-900 w-full">
        <div className="text-center flex flex-col gap-3 mb-16">
          <h2 className="text-2xl sm:text-4xl font-extrabold text-zinc-100">
            {dict.reg_title}
          </h2>
          <p className="text-zinc-400 max-w-xl mx-auto text-xs sm:text-sm">
            {dict.reg_desc}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-6 bg-zinc-900/40 border border-zinc-800/80 rounded-2xl flex flex-col gap-3">
            <Scale className="text-emerald-400" size={24} />
            <h4 className="font-bold text-zinc-100 text-sm">{dict.reg_fda}</h4>
            <p className="text-xs text-zinc-400 leading-relaxed">{dict.reg_fda_desc}</p>
          </div>
          <div className="p-6 bg-zinc-900/40 border border-zinc-800/80 rounded-2xl flex flex-col gap-3">
            <Building className="text-emerald-400" size={24} />
            <h4 className="font-bold text-zinc-100 text-sm">{dict.reg_efsa}</h4>
            <p className="text-xs text-zinc-400 leading-relaxed">{dict.reg_efsa_desc}</p>
          </div>
          <div className="p-6 bg-zinc-900/40 border border-zinc-800/80 rounded-2xl flex flex-col gap-3">
            <ShieldAlert className="text-emerald-400" size={24} />
            <h4 className="font-bold text-zinc-100 text-sm">{dict.reg_falcpa}</h4>
            <p className="text-xs text-zinc-400 leading-relaxed">{dict.reg_falcpa_desc}</p>
          </div>
        </div>
      </section>

      {/* CTA Bottom Section */}
      <section className="py-20 px-6 max-w-5xl mx-auto text-center border-t border-zinc-900 w-full">
        <h2 className="text-2xl sm:text-4xl font-extrabold text-zinc-100">
          {dict.cta_title}
        </h2>
        <p className="mt-4 text-xs sm:text-sm text-zinc-400 max-w-md mx-auto leading-relaxed">
          {dict.cta_desc}
        </p>
        <div className="mt-8">
          <Link
            href="/projects"
            className="inline-flex items-center gap-2 px-6 py-3.5 bg-indigo-500 hover:bg-indigo-600 text-white font-bold text-sm rounded-xl shadow-xl shadow-indigo-500/10 hover:shadow-indigo-500/25 transition-all group theme-element"
          >
            {dict.cta_btn}
            <ChevronRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-zinc-900 py-8 px-6 bg-zinc-950/80 backdrop-blur-md text-xs text-zinc-500 text-center theme-element z-10 relative">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-zinc-400">PharmNode</span>
            <span>&copy; 2026. {dict.footer_copy}</span>
          </div>
          <div className="flex gap-6">
            <button
              onClick={() => setModalOpen(prev => ({ ...prev, terms: true }))}
              className="hover:text-zinc-300 bg-transparent border-none outline-none cursor-pointer"
            >
              {dict.footer_terms}
            </button>
            <button
              onClick={() => setModalOpen(prev => ({ ...prev, eula: true }))}
              className="hover:text-zinc-300 bg-transparent border-none outline-none cursor-pointer"
            >
              {dict.footer_eula}
            </button>
            <button
              onClick={() => setModalOpen(prev => ({ ...prev, fda: true }))}
              className="hover:text-zinc-300 bg-transparent border-none outline-none cursor-pointer"
            >
              {dict.footer_fda}
            </button>
          </div>
        </div>
      </footer>

      {/* Terms of Use Modal */}
      {modalOpen.terms && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-xl bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl relative p-6 max-h-[80vh] overflow-y-auto">
            <button onClick={closeModals} className="absolute top-4 right-4 text-zinc-500 hover:text-zinc-300 cursor-pointer">✕</button>
            <h3 className="text-base font-bold text-zinc-100 mb-4 uppercase tracking-wider flex items-center gap-2">
              <Scale size={18} className="text-indigo-400" />
              {dict.terms_title}
            </h3>
            <div className="text-xs text-zinc-400 flex flex-col gap-3 leading-relaxed">
              <p>{dict.terms_p1}</p>
              <p>{dict.terms_p2}</p>
              <p>{dict.terms_p3}</p>
            </div>
            <div className="mt-6 flex justify-end">
              <button onClick={closeModals} className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg text-xs cursor-pointer">{dict.btn_close}</button>
            </div>
          </div>
        </div>
      )}

      {/* EULA / DSS Disclaimer Modal */}
      {modalOpen.eula && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-xl bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl relative p-6 max-h-[80vh] overflow-y-auto">
            <button onClick={closeModals} className="absolute top-4 right-4 text-zinc-500 hover:text-zinc-300 cursor-pointer">✕</button>
            <h3 className="text-base font-bold text-zinc-100 mb-4 uppercase tracking-wider flex items-center gap-2">
              <ShieldAlert size={18} className="text-amber-400" />
              {dict.eula_title}
            </h3>
            <div className="text-xs text-zinc-400 flex flex-col gap-3 leading-relaxed">
              <p className="p-2.5 bg-amber-500/10 border border-amber-500/20 rounded text-amber-400 font-semibold">
                {dict.eula_alert}
              </p>
              <p>{dict.eula_p1}</p>
              <p>{dict.eula_p2}</p>
            </div>
            <div className="mt-6 flex justify-end">
              <button onClick={closeModals} className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg text-xs cursor-pointer">{dict.btn_close}</button>
            </div>
          </div>
        </div>
      )}

      {/* FDA Compliance Modal */}
      {modalOpen.fda && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-xl bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl relative p-6 max-h-[80vh] overflow-y-auto">
            <button onClick={closeModals} className="absolute top-4 right-4 text-zinc-500 hover:text-zinc-300 cursor-pointer">✕</button>
            <h3 className="text-base font-bold text-zinc-100 mb-4 uppercase tracking-wider flex items-center gap-2">
              <Building size={18} className="text-emerald-400" />
              {dict.fda_title}
            </h3>
            <div className="text-xs text-zinc-400 flex flex-col gap-3 leading-relaxed">
              <p>{dict.fda_p1}</p>
              <p>{dict.fda_p2}</p>
              <p>{dict.fda_p3}</p>
            </div>
            <div className="mt-6 flex justify-end">
              <button onClick={closeModals} className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg text-xs cursor-pointer">{dict.btn_close}</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
