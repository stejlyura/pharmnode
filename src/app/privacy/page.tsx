"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useTranslation } from "@/context/I18nContext";
import { Eye, Database, CreditCard, Lock, ArrowLeft } from "lucide-react";

const content = {
  "en-US": {
    title: "Privacy Policy",
    subtitle: "How we collect, secure, and process your account and billing data",
    lastUpdated: "Last updated: June 13, 2026",
    backLink: "Back to Home",
    tocTitle: "Table of Contents",
    sections: [
      {
        id: "collection",
        title: "1. Account Data & Information Collection",
        icon: Eye,
        paragraphs: [
          "When you register or log in to PharmNode, we collect basic account details using third-party OAuth providers (Google and GitHub). This includes your public profile information such as name, email address, profile picture, and provider identifier.",
          "We collect this information strictly to manage your user account, authorize access to your personal formulation workspace, and persist your custom ingredient definitions across sessions. We do not solicit or purchase list broker databases."
        ]
      },
      {
        id: "cookies",
        title: "2. Cookie & Local Storage Usage",
        icon: Database,
        paragraphs: [
          "PharmNode utilizes local storage and HTTP cookies to enable basic platform functionality. These storage elements are stored locally on your device and are not used for targeted advertisement or cross-site behavioral tracking.",
          "Specifically, cookies and localStorage are used for: (a) maintaining active authentication session tokens, (b) persisting your theme configuration preference (dark vs light mode settings), and (c) retaining your current translation/locale parameter (English vs Russian UI state)."
        ]
      },
      {
        id: "billing",
        title: "3. Payment & Billing Information (Paddle)",
        icon: CreditCard,
        paragraphs: [
          "All financial transactions, subscriptions, invoices, and payments on PharmNode are handled exclusively by Paddle, our Merchant of Record. Paddle processes your billing details in full compliance with PCI-DSS standards.",
          "PharmNode does not receive, process, or store your credit card numbers, billing addresses, or bank details. We only process secure server-to-server webhook events sent by Paddle. These notifications contain the subscription ID, active tier state, renewal dates, and billing portal links which are stored in our PostgreSQL database to grant Professional access rights."
        ]
      },
      {
        id: "security",
        title: "4. Cryptographic Security & Form Isolation",
        icon: Lock,
        paragraphs: [
          "We employ strict security measures to protect your digital pharmaceutical designs and account details. All data transmitted between your browser and our platform is encrypted in transit using Transport Layer Security (TLS) and HTTPS protocol.",
          "User recipe formulations, canvas node coordinates, and custom ingredient rules are isolated inside our relational PostgreSQL database. We implement strict multi-tenant constraints at the database query layer to prevent accidental exposure of raw formula data to other users."
        ]
      }
    ]
  },
  "ru-RU": {
    title: "Политика конфиденциальности",
    subtitle: "Как мы собираем, защищаем и обрабатываем ваши личные и платежные данные",
    lastUpdated: "Последнее обновление: 13 июня 2026 г.",
    backLink: "На главную",
    tocTitle: "Содержание",
    sections: [
      {
        id: "collection",
        title: "1. Сбор учетных данных",
        icon: Eye,
        paragraphs: [
          "При регистрации или входе в PharmNode мы собираем основные данные вашей учетной записи с помощью внешних провайдеров OAuth (Google и GitHub). Это включает информацию вашего общедоступного профиля: имя, адрес электронной почты, изображение профиля и идентификатор провайдера.",
          "Мы собираем эту информацию исключительно для управления вашим аккаунтом, предоставления доступа к вашему рабочему пространству и сохранения созданных вами рецептур между сессиями. Мы не покупаем и не собираем базы сторонних контактов."
        ]
      },
      {
        id: "cookies",
        title: "2. Использование файлов Cookie и локального хранилища",
        icon: Database,
        paragraphs: [
          "PharmNode использует файлы cookie и локальное хранилище браузера (localStorage) для работы ключевых функций платформы. Эти элементы хранятся локально на вашем устройстве и не используются для таргетированной рекламы или межсайтового отслеживания.",
          "В частности, данные используются для: (а) поддержки активной сессии аутентификации, (б) сохранения выбранной темы оформления (темная или светлая тема) и (в) запоминания языковых настроек интерфейса (английский или русский)."
        ]
      },
      {
        id: "billing",
        title: "3. Данные об оплате (Paddle)",
        icon: CreditCard,
        paragraphs: [
          "Все финансовые операции, управление подписками и выставление счетов осуществляются исключительно через нашего платежного партнера Paddle (Merchant of Record). Paddle обрабатывает ваши платежные реквизиты в соответствии со стандартами PCI-DSS.",
          "PharmNode не получает, не обрабатывает и не хранит номера ваших банковских карт или банковские реквизиты. Мы получаем только безопасные серверные уведомления (вебхуки) от Paddle, содержащие ID подписки, ее статус, даты продления и ссылки на портал управления счетами, которые записываются в базу данных PostgreSQL для активации статуса Professional."
        ]
      },
      {
        id: "security",
        title: "4. Криптографическая защита и изоляция формул",
        icon: Lock,
        paragraphs: [
          "Мы применяем строгие меры безопасности для защиты ваших цифровых рецептур и личных данных. Вся передаваемая информация шифруется с использованием протоколов TLS и HTTPS.",
          "Рецептуры пользователей, координаты нод на холсте и пользовательские ингредиенты изолированы в реляционной базе данных PostgreSQL. Мы реализуем строгие правила разграничения доступа на уровне запросов к базе данных, чтобы исключить утечку данных рецептов другим пользователям."
        ]
      }
    ]
  }
};

export default function PrivacyPage() {
  const { locale } = useTranslation();
  const currentLang = (locale === "ru-RU") ? "ru-RU" : "en-US";
  const dict = content[currentLang];
  const [activeSection, setActiveSection] = useState("collection");

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
