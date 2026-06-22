"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useTranslation } from "@/context/I18nContext";
import { Scale, Heart, ShieldAlert, Award, ArrowLeft, Accessibility } from "lucide-react";

const content = {
  "en-US": {
    title: "Accessibility Statement",
    subtitle: "Our commitment to ensuring digital accessibility for all technologists",
    lastUpdated: "Last updated: June 13, 2026",
    backLink: "Back to Home",
    tocTitle: "Table of Contents",
    sections: [
      {
        id: "commitment",
        title: "1. Commitment & Standards",
        icon: Award,
        paragraphs: [
          "PharmNode is committed to ensuring digital accessibility for people with disabilities. We are continuously improving the user experience for everyone and applying the relevant accessibility standards to our formulation platform.",
          "We target conformance with the Web Content Accessibility Guidelines (WCAG) 2.1 Level AA. These guidelines explain how to make web content more accessible for people with sensory, cognitive, and mobility difficulties."
        ]
      },
      {
        id: "features",
        title: "2. Accessibility Features on PharmNode",
        icon: Accessibility,
        paragraphs: [
          "To provide a highly usable environment for pharmaceutical modeling, we have built the following features into our design system:",
          "Keyboard Navigation: All interactive elements, sidebar buttons, library search filters, and profile controls can be fully navigated using standard keyboard commands (Tab, Shift+Tab, Enter, Space).",
          "Focus Visibility: We enforce visible focus indicators (rings) on all buttons, input fields, and links to ensure clear navigation tracking.",
          "Semantic HTML: We utilize native, semantic HTML5 tags (like <main>, <header>, <nav>, <footer>, <address>) and proper heading hierarchies (H1, H2, H3) to support assistive technologies like screen readers.",
          "Color Contrast & Dark/Light Themes: Our color system is designed to maintain high readability. If the dark mode has high contrast accents, users can switch to the light theme using our Header theme toggles to best fit their visual preference."
        ]
      },
      {
        id: "limitations",
        title: "3. Known Limitations & Canvas Behavior",
        icon: ShieldAlert,
        paragraphs: [
          "While we strive to make the entire platform fully accessible, our interactive node-based canvas relies on complex drag-and-drop actions and dynamic SVG connection drawing.",
          "For users who find the drag-and-drop operations difficult via standard pointer devices, we provide keyboard shortcuts, a structured mobile layout option, and direct numerical forms to adjust ingredient percentages.",
          "We are actively working on improving screen reader feedback for live calculation changes occurring dynamically on the canvas."
        ]
      },
      {
        id: "feedback",
        title: "4. Feedback & Contact Information",
        icon: Heart,
        paragraphs: [
          "We welcome your feedback on the accessibility of PharmNode. If you encounter any accessibility barriers or require assistance with physical compounding calculations, please contact us:",
          "Email: accessibility@pharmnode.com",
          "We aim to respond to accessibility inquiries within 3 business days and implement necessary improvements to keep our platform open and usable."
        ]
      }
    ]
  },
  "ru-RU": {
    title: "Заявление о доступности",
    subtitle: "Наше стремление обеспечить цифровое удобство для всех специалистов",
    lastUpdated: "Последнее обновление: 13 июня 2026 г.",
    backLink: "На главную",
    tocTitle: "Содержание",
    sections: [
      {
        id: "commitment",
        title: "1. Обязательства и стандарты",
        icon: Award,
        paragraphs: [
          "PharmNode стремится обеспечить цифровую доступность платформы для людей с ограниченными возможностями. Мы постоянно совершенствуем пользовательский интерфейс и применяем актуальные стандарты доступности к нашему расчетному холсту.",
          "Мы ориентируемся на полное соответствие Руководству по обеспечению доступности веб-контента (WCAG) 2.1 на уровне AA. Эти правила описывают способы сделать веб-контент более доступным для людей с нарушениями зрения, слуха, опорно-двигательного аппарата и когнитивных функций."
        ]
      },
      {
        id: "features",
        title: "2. Функции доступности в PharmNode",
        icon: Accessibility,
        paragraphs: [
          "Для обеспечения удобной среды моделирования рецептур мы интегрировали следующие функции в нашу дизайн-систему:",
          "Навигация с клавиатуры: Все интерактивные элементы, кнопки боковой панели, фильтры поиска и настройки профиля полностью управляются стандартными командами клавиатуры (Tab, Shift+Tab, Enter, Space).",
          "Индикация фокуса: Мы используем контрастную обводку (focus rings) для всех активных кнопок, полей ввода и ссылок для отслеживания фокуса.",
          "Семантическая разметка: Мы применяем нативные теги HTML5 (такие как <main>, <header>, <nav>, <footer>, <address>) и логическую структуру заголовков (H1, H2, H3) для поддержки программ чтения с экрана.",
          "Цветовой контраст и темы: Наша цветовая палитра разработана для сохранения читаемости текста. Пользователи могут переключаться между темной и светлой темой на панели Header в зависимости от личных предпочтений."
        ]
      },
      {
        id: "limitations",
        title: "3. Известные ограничения холста",
        icon: ShieldAlert,
        paragraphs: [
          "Несмотря на все усилия по обеспечению полной доступности, наш интерактивный холст с нодами использует сложные операции перетаскивания (drag-and-drop) и динамическое отрисовывание SVG-связей.",
          "Для пользователей, которым затруднительно использовать мышь для перетаскивания нод, мы предоставляем поддержку горячих клавиш, упрощенный интерфейс для мобильных устройств, а также текстовые формы для ввода дозировок.",
          "Мы активно работаем над улучшением обратной связи программ чтения с экрана при изменении физических расчетов в реальном времени."
        ]
      },
      {
        id: "feedback",
        title: "4. Обратная связь и контакты",
        icon: Heart,
        paragraphs: [
          "Мы будем рады вашим отзывам и предложениям по улучшению доступности платформы. Если вы столкнулись с какими-либо препятствиями при использовании платформы, пожалуйста, сообщите нам:",
          "Электронная почта: accessibility@pharmnode.com",
          "Мы стараемся отвечать на запросы по доступности в течение 3 рабочих дней и оперативно вносить доработки в интерфейс."
        ]
      }
    ]
  }
};

export default function AccessibilityStatementPage() {
  const { locale } = useTranslation();
  const currentLang = locale === "ru-RU" ? "ru-RU" : "en-US";
  const dict = content[currentLang];
  const [activeSection, setActiveSection] = useState("commitment");

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
