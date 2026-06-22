"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useTranslation } from "@/context/I18nContext";
import { Shield, Database, Info, ArrowLeft, Cookie } from "lucide-react";

const content = {
  "en-US": {
    title: "Cookie Policy",
    subtitle: "Understanding how we use cookies and local storage on PharmNode",
    lastUpdated: "Last updated: June 13, 2026",
    backLink: "Back to Home",
    tocTitle: "Table of Contents",
    sections: [
      {
        id: "what-are-cookies",
        title: "1. What Are Cookies and Local Storage?",
        icon: Cookie,
        paragraphs: [
          "Cookies are small text files placed on your device by websites you visit. Local storage (localStorage) is a modern web standard that allows websites to store key-value pairs directly in your browser. Both technologies allow us to remember specific preferences and authentication details across visits.",
          "We use these technologies strictly to enable core platform functions, optimize formulation modeling, and persist your settings. We do not use them to track your activity on other sites or build advertising profiles."
        ]
      },
      {
        id: "how-we-use",
        title: "2. How We Use Cookies & Storage",
        icon: Database,
        paragraphs: [
          "PharmNode utilizes cookies and local storage for the following essential purposes:",
          "Authentication: We use secure cookies to maintain your active login session when registering or logging in via Google/GitHub OAuth.",
          "Preferences: We save your active language setting (English vs Russian) using the 'pharmnode-locale' parameter, ensuring you do not have to switch languages on every visit.",
          "Theme Settings: We store your theme selection (dark vs light mode) in localStorage to preserve the premium glassmorphic visual presentation.",
          "Consent Status: We store your choice to accept or decline cookies in localStorage under 'pharmnode_cookie_consent' so that the cookie banner does not reappear repeatedly."
        ]
      },
      {
        id: "third-party",
        title: "3. Third-Party Payments (Paddle Billing)",
        icon: Shield,
        paragraphs: [
          "For payment processing, subscription management, and checkout operations, we integrate Paddle Billing v2. Paddle acts as the Merchant of Record for PharmNode.",
          "When you open the billing or upgrade flow, the Paddle SDK may set technical cookies to authenticate your checkout session, prevent credit card fraud, and verify transaction integrity. These cookies are processed under Paddle's privacy policies in full compliance with PCI-DSS standards."
        ]
      },
      {
        id: "managing-cookies",
        title: "4. Managing Your Preferences",
        icon: Info,
        paragraphs: [
          "You have the right to decide whether to accept or decline non-essential cookies. You can update your choice at any time using our consent banner, or manually clear your browser's cookies and local storage in your browser settings.",
          "Please note that disabling necessary functional cookies (such as session cookies or preference settings) may degrade your experience and prevent you from utilizing formulation canvas tools, saving ingredients, or managing subscriptions."
        ]
      }
    ]
  },
  "ru-RU": {
    title: "Политика использования файлов cookie",
    subtitle: "Как мы используем файлы cookie и локальное хранилище в PharmNode",
    lastUpdated: "Последнее обновление: 13 июня 2026 г.",
    backLink: "На главную",
    tocTitle: "Содержание",
    sections: [
      {
        id: "what-are-cookies",
        title: "1. Что такое файлы Cookie и локальное хранилище?",
        icon: Cookie,
        paragraphs: [
          "Файлы cookie — это небольшие текстовые файлы, размещаемые на вашем устройстве сайтами, которые вы посещаете. Локальное хранилище (localStorage) — это стандарт веб-технологий, позволяющий сайтам сохранять пары ключ-значение непосредственно в вашем браузере. Обе технологии позволяют нам запоминать конкретные предпочтения и статус авторизации между сессиями.",
          "Мы используем эти технологии исключительно для обеспечения основных функций платформы, симуляции формуляций и сохранения ваших настроек. Мы не используем их для отслеживания вашей активности на других сайтах и не формируем рекламные профили."
        ]
      },
      {
        id: "how-we-use",
        title: "2. Как мы используем файлы Cookie и хранилище",
        icon: Database,
        paragraphs: [
          "PharmNode использует файлы cookie и локальное хранилище для следующих основных целей:",
          "Авторизация: Мы используем безопасные сессионные файлы cookie для поддержания вашей авторизации при входе через провайдеров Google/GitHub OAuth.",
          "Языковые настройки: Мы сохраняем выбранный вами язык интерфейса с помощью параметра 'pharmnode-locale', чтобы вам не приходилось переключать язык при каждом посещении.",
          "Тема оформления: Мы сохраняем выбор темы (темная или светлая тема) в localStorage для поддержания премиального визуального оформления холста.",
          "Статус согласия: Мы сохраняем ваш выбор о согласии на использование cookie в localStorage под ключом 'pharmnode_cookie_consent', чтобы баннер согласия не появлялся повторно."
        ]
      },
      {
        id: "third-party",
        title: "3. Сторонние платежи (Paddle Billing)",
        icon: Shield,
        paragraphs: [
          "Для обработки платежей, подписок и работы счетов мы интегрируем Paddle Billing v2. Paddle выступает в качестве официального продавца (Merchant of Record) для PharmNode.",
          "При открытии экрана оплаты или повышения тарифа SDK Paddle может устанавливать технические файлы cookie для аутентификации сессии оформления заказа, предотвращения мошенничества и проверки целостности транзакций. Данные cookie обрабатываются в соответствии с политикой конфиденциальности Paddle и требованиями стандартов PCI-DSS."
        ]
      },
      {
        id: "managing-cookies",
        title: "4. Управление вашими настройками",
        icon: Info,
        paragraphs: [
          "Вы имеете право принять или отклонить использование необязательных файлов cookie. Вы можете изменить свой выбор в любое время с помощью нашего баннера согласия или вручную очистить файлы cookie и локальное хранилище в настройках вашего браузера.",
          "Обратите внимание, что отключение обязательных функциональных cookie (таких как сессионные cookie или настройки локализации) может ухудшить работу с платформой, сделать невозможным использование холста формуляций, сохранение ингредиентов или управление подпиской."
        ]
      }
    ]
  }
};

export default function CookiePolicyPage() {
  const { locale } = useTranslation();
  const currentLang = locale === "ru-RU" ? "ru-RU" : "en-US";
  const dict = content[currentLang];
  const [activeSection, setActiveSection] = useState("what-are-cookies");

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
