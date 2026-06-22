"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useTranslation } from "@/context/I18nContext";
import { Scale, ShieldAlert, ArrowLeft, BookOpen, Terminal, CreditCard } from "lucide-react";

const content = {
  "en-US": {
    title: "Terms of Service",
    subtitle: "Legal agreement and rules governing the PharmNode Platform",
    lastUpdated: "Last updated: June 13, 2026",
    backLink: "Back to Home",
    tocTitle: "Table of Contents",
    sections: [
      {
        id: "acceptance",
        title: "1. Acceptance of Terms",
        icon: Scale,
        paragraphs: [
          "By accessing and using the PharmNode platform ('Service'), you agree to be bound by these Terms of Service, all applicable laws, and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing this site.",
          "If you are entering into these terms on behalf of a company, laboratory, or other legal entity, you represent that you have the authority to bind such entity and its affiliates to these terms. If you do not have such authority, you must not accept this agreement and cannot use the Service."
        ]
      },
      {
        id: "disclaimer",
        title: "2. DSS Prediction Disclaimer & Liability",
        icon: ShieldAlert,
        paragraphs: [
          "PharmNode acts as a Decision Support System (DSS) for pharmaceutical formulations. All physical simulations, powder flowability calculations (Carr's Index and Hausner Ratio), tablet press simulations, and regulatory compliance evaluations are predictive mathematical models based on theoretical properties.",
          "THE CALCULATIONS ARE PROVIDED ON AN 'AS-IS' BASIS. All simulated values and warnings are intended for research and early design stages. Physical laboratory validation—including Fourier-transform infrared spectroscopy (FTIR), differential scanning calorimetry (DSC), high-performance liquid chromatography (HPLC), and physical test presses—is strictly required prior to any clinical manufacturing, batch compounding, scaling up, or market distribution.",
          "In no event shall PharmNode, its developers, or affiliates be liable for any production failures, batch contamination, machinery damage, regulatory penalties, or health issues resulting from physical formulation trials based on calculations obtained via the Service."
        ]
      },
      {
        id: "ownership",
        title: "3. User Formulation Data & Intellectual Property",
        icon: BookOpen,
        paragraphs: [
          "You retain full intellectual property rights, ownership, and responsibility over all chemical formulations, custom excipient profiles, and node canvas recipe configurations created on your PharmNode workspace.",
          "PharmNode does not claim ownership of user formulas. We do not sell, leak, or share user-designed active formulas to competitors or third parties. It is your sole responsibility to ensure that your formulations do not violate local pharmaceutical regulations, patent laws, or active medical compound registrations in your jurisdiction."
        ]
      },
      {
        id: "usage",
        title: "4. Code, API & Subscription Limitations",
        icon: Terminal,
        paragraphs: [
          "Your usage of the Service is governed by your active subscription tier (Hobby or Professional). The Hobby tier restricts formulations to 3 ingredients per canvas and limits saved recipe counts. The Professional tier unlocks unlimited ingredients and GMP report generation.",
          "You agree not to attempt to reverse engineer the formulation algorithms, systematically scrape our pre-populated ingredients database, or bypass API rate limits via custom automated scripts. Any detected misuse, scraping, or brute-forcing of validation engines will result in immediate termination of the user account and active subscription without refund."
        ]
      },
      {
        id: "payment",
        title: "5. Payment Processing & Merchant of Record",
        icon: CreditCard,
        paragraphs: [
          "Our order process is conducted by our online reseller Paddle.com. Paddle.com is the Merchant of Record for all our orders. Paddle provides all customer service inquiries and handles returns.",
          "By purchasing a subscription through PharmNode, you agree to Paddle's Terms of Use and Privacy Policy. All billing disputes, chargebacks, and refund requests are processed by Paddle in accordance with their standard policies and applicable consumer protection laws."
        ]
      }
    ]
  },
  "ru-RU": {
    title: "Условия использования",
    subtitle: "Юридическое соглашение и правила использования платформы PharmNode",
    lastUpdated: "Последнее обновление: 13 июня 2026 г.",
    backLink: "На главную",
    tocTitle: "Содержание",
    sections: [
      {
        id: "acceptance",
        title: "1. Согласие с условиями",
        icon: Scale,
        paragraphs: [
          "Получая доступ к платформе PharmNode («Сервис») и используя её, вы соглашаетесь соблюдать настоящие Условия использования, а также все применимые законы и правила. Если вы не согласны с любым из этих условий, вам запрещается использовать данный сайт.",
          "Если вы принимаете эти условия от имени компании, лаборатории или иного юридического лица, вы подтверждаете, что обладаете полномочиями связывать обязательствами такое юридическое лицо. Если у вас нет таких полномочий, вы не должны принимать данное соглашение и не можете использовать Сервис."
        ]
      },
      {
        id: "disclaimer",
        title: "2. Дисклеймер системы поддержки решений (DSS)",
        icon: ShieldAlert,
        paragraphs: [
          "PharmNode функционирует как виртуальная система поддержки принятия решений (DSS). Все симуляции физических свойств, расчеты сыпучести (Индекс Карра и Коэффициент Хауснера), симуляции таблетпресса и проверки соответствия требованиям регуляторов представляют собой прогнозные математические модели, основанные на теоретических свойствах.",
          "РАСЧЕТЫ ПРЕДОСТАВЛЯЮТСЯ НА УСЛОВИЯХ «КАК ЕСТЬ». Все расчетные значения предназначены исключительно для исследовательских и ранних этапов проектирования. Физическая лабораторная валидация — включая ИК-спектроскопию (FTIR), дифференциальную сканирующую калориметрию (DSC), высокоэффективную жидкостную хроматографию (HPLC) и физическое прессование тестовых партий — строго обязательна перед любым клиническим производством, масштабным выпуском или дистрибуцией.",
          "Ни при каких обстоятельствах PharmNode, его разработчики или аффилированные лица не несут ответственности за сбои в производстве, порчу партий сырья, повреждение оборудования, штрафы регуляторов или проблемы со здоровьем, возникшие в результате физических испытаний формул на основе расчетов Сервиса."
        ]
      },
      {
        id: "ownership",
        title: "3. Интеллектуальная собственность на формулы",
        icon: BookOpen,
        paragraphs: [
          "Вы сохраняете полные права интеллектуальной собственности, владения и ответственности в отношении всех химических формул, профилей вспомогательных веществ и конфигураций рецептов, созданных в вашем рабочем пространстве PharmNode.",
          "PharmNode не претендует на владение формулами пользователей. Мы не продаем, не разглашаем и не передаем формулы конкурентам или третьим лицам. Вы несете единоличную ответственность за проверку того, что ваши рецептуры не нарушают местное законодательство в сфере фармации, патентное право или активные регистрации медицинских препаратов."
        ]
      },
      {
        id: "usage",
        title: "4. Ограничения API и подписки",
        icon: Terminal,
        paragraphs: [
          "Использование Сервиса регулируется вашим активным тарифом (Hobby или Professional). Тариф Hobby ограничивает количество ингредиентов на холсте (до 3) и количество сохраненных рецептов. Тариф Professional предоставляет безлимитный доступ ко всем функциям и экспорту отчетов по стандарту GMP.",
          "Вы соглашаетесь не предпринимать попыток обратного проектирования алгоритмов расчета, систематического сбора базы данных ингредиентов или обхода ограничений частоты запросов к API. Любые попытки парсинга или вредоносного воздействия приведут к немедленному аннулированию учетной записи и подписки без возврата средств."
        ]
      },
      {
        id: "payment",
        title: "5. Обработка платежей и официальный продавец",
        icon: CreditCard,
        paragraphs: [
          "Процесс оформления заказов осуществляется нашим онлайн-реселлером Paddle.com. Paddle.com является официальным продавцом (Merchant of Record) для всех наших заказов. Paddle обеспечивает обработку запросов клиентской поддержки и возвратов.",
          "Приобретая подписку через PharmNode, вы соглашаетесь с Условиями использования и Политикой конфиденциальности Paddle. Все платежные споры, чарджбэки и запросы на возврат средств обрабатываются компанией Paddle в соответствии с её стандартной политикой и применимым законодательством о защите прав потребителей."
        ]
      }
    ]
  }
};

export default function TermsPage() {
  const { locale } = useTranslation();
  const currentLang = (locale === "ru-RU") ? "ru-RU" : "en-US";
  const dict = content[currentLang];
  const [activeSection, setActiveSection] = useState("acceptance");

  const handleScrollTo = (id: string) => {
    setActiveSection(id);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col font-sans text-zinc-100 selection:bg-indigo-500/30">
      <Header showCanvasControls={false} />
      
      <main className="flex-1 bg-radial from-zinc-900 via-zinc-950 to-zinc-950 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          {/* Back button */}
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs text-zinc-500 hover:text-indigo-400 transition-colors mb-8 group"
          >
            <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
            {dict.backLink}
          </Link>

          {/* Heading */}
          <div className="border-b border-zinc-900 pb-8 mb-10">
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
              {dict.title}
            </h1>
            <p className="mt-2 text-sm text-zinc-400">
              {dict.subtitle}
            </p>
            <span className="inline-block mt-4 text-[10px] font-semibold text-zinc-600 bg-zinc-900/60 border border-zinc-800 px-2.5 py-1 rounded-md">
              {dict.lastUpdated}
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar Table of Contents */}
            <aside className="lg:col-span-1">
              <div className="sticky top-24 p-5 rounded-2xl bg-zinc-900/40 border border-zinc-800/80 backdrop-blur-md flex flex-col gap-4">
                <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">
                  {dict.tocTitle}
                </span>
                <nav className="flex flex-col gap-2">
                  {dict.sections.map((sec) => (
                    <button
                      key={sec.id}
                      onClick={() => handleScrollTo(sec.id)}
                      className={`text-left px-3 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                        activeSection === sec.id
                          ? "bg-indigo-500/10 border-l-2 border-indigo-400 text-indigo-400 pl-4"
                          : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/40"
                      }`}
                    >
                      {sec.title.split(". ")[1] || sec.title}
                    </button>
                  ))}
                </nav>
              </div>
            </aside>

            {/* Document Content */}
            <div className="lg:col-span-3 flex flex-col gap-10">
              {dict.sections.map((sec) => {
                const IconComponent = sec.icon;
                return (
                  <section
                    key={sec.id}
                    id={sec.id}
                    className="p-6 sm:p-8 rounded-2xl bg-zinc-900/20 border border-zinc-900 hover:border-zinc-800/60 transition-all flex flex-col gap-4 relative group scroll-mt-24"
                  >
                    <div className="absolute top-6 right-6 p-2 rounded-lg bg-zinc-900/60 border border-zinc-800/40 text-zinc-500 group-hover:text-indigo-400 transition-colors">
                      <IconComponent size={18} />
                    </div>
                    <h2 className="text-base font-bold text-zinc-100 tracking-wide uppercase pr-10">
                      {sec.title}
                    </h2>
                    <div className="text-xs sm:text-sm text-zinc-400 flex flex-col gap-4 leading-relaxed">
                      {sec.paragraphs.map((para, idx) => (
                        <p key={idx}>{para}</p>
                      ))}
                    </div>
                  </section>
                );
              })}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
