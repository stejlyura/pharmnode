"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useTranslation } from "@/context/I18nContext";
import { HelpCircle, AlertCircle, Calendar, RefreshCcw, ArrowLeft } from "lucide-react";

const content = {
  "en-US": {
    title: "Refund Policy",
    subtitle: "Refund parameters, cancellation periods, and billing inquiries",
    lastUpdated: "Last updated: June 13, 2026",
    backLink: "Back to Home",
    tocTitle: "Table of Contents",
    sections: [
      {
        id: "availability",
        title: "1. Refund Eligibility & Parameters",
        icon: HelpCircle,
        paragraphs: [
          "PharmNode offers a Professional tier with clinical-grade formulation simulations. Because access to calculation schemas, PDF downloads, and ingredient databases is immediate upon subscription activation, eligibility criteria apply to prevent platform misuse.",
          "Refund requests are handled in accordance with the terms of our Merchant of Record, Paddle, and applicable regional consumer protection laws. Refunds are generally processed for initial orders where no extensive batch exports or bulk calculations have been run."
        ]
      },
      {
        id: "fourteenday",
        title: "2. Paddle 14-day Refund Terms",
        icon: AlertCircle,
        paragraphs: [
          "For customers residing in the European Union, United Kingdom, and other regions enforcing statutory rights, a 14-day cooling-off period is provided starting from the date of initial purchase.",
          "To request a refund within this 14-day window, please contact us or submit a request directly through your Paddle payment receipt. If a refund is approved, your access to the Professional tier features will be disabled immediately, and the transaction amount will be credited back via the original payment method."
        ]
      },
      {
        id: "cancellation",
        title: "3. Subscription Cancellations",
        icon: Calendar,
        paragraphs: [
          "You can cancel your Professional plan subscription at any time. When you cancel, your active plan will remain operational until the end of the current billing cycle (monthly or annual).",
          "We do not provide prorated or partial refunds for unused days or calculation runs within an active billing cycle. Upon expiration of the current billing cycle, your workspace will be reverted to the Hobby tier, and custom active ingredients or saved formulas exceeding tier constraints will be locked or deactivated."
        ]
      },
      {
        id: "processing",
        title: "4. Processing Inquiries & Disputes",
        icon: RefreshCcw,
        paragraphs: [
          "Approved refund transactions take 5 to 10 business days to appear on your bank statement, depending on your bank's card processing timeline.",
          "For any questions, complaints regarding incorrect billing, or to check on the status of an ongoing refund request, please email billing@pharmnode.com. Please include your transaction ID, Paddle receipt details, and registered account email address in all communications."
        ]
      }
    ]
  },
  "ru-RU": {
    title: "Правила возврата средств",
    subtitle: "Условия возврата оплаты, период отмены и поддержка по платежам",
    lastUpdated: "Последнее обновление: 13 июня 2026 г.",
    backLink: "На главную",
    tocTitle: "Содержание",
    sections: [
      {
        id: "availability",
        title: "1. Доступность возврата средств",
        icon: HelpCircle,
        paragraphs: [
          "PharmNode предлагает подписку Professional с возможностями моделирования клинического уровня. Поскольку доступ к расчетным алгоритмам, базам данных и экспорту PDF-файлов предоставляется мгновенно после оплаты, к запросам на возврат применяются ограничения для предотвращения злоупотреблений платформой.",
          "Запросы на возврат средств обрабатываются в соответствии с условиями нашего платежного партнера Paddle и применимым региональным законодательством о защите прав потребителей. Возврат обычно одобряется для первоначальных платежей, при условии, что с аккаунта не производилось массового экспорта формул."
        ]
      },
      {
        id: "fourteenday",
        title: "2. 14-дневный период возврата Paddle",
        icon: AlertCircle,
        paragraphs: [
          "Для пользователей из Европейского Союза, Великобритании и других регионов с установленными законом правами потребителей предоставляется 14-дневный период охлаждения с даты первоначальной покупки подписки.",
          "Чтобы запросить возврат в течение этого 14-дневного окна, вы можете связаться с нами или подать запрос напрямую через квитанцию об оплате Paddle. В случае одобрения возврата доступ к функциям тарифа Professional будет немедленно прекращен, а денежные средства будут возвращены на исходный платежный инструмент."
        ]
      },
      {
        id: "cancellation",
        title: "3. Отмена подписки",
        icon: Calendar,
        paragraphs: [
          "Вы можете отменить подписку на тариф Professional в любое время. После отмены тариф продолжает действовать до окончания текущего оплаченного периода (месячного или годового).",
          "Мы не производим частичный возврат средств за неиспользованные дни внутри активного расчетного периода. По окончании оплаченного периода ваш аккаунт будет переведен на тариф Hobby, а доступ к рецептам с числом ингредиентов более 3 будет временно ограничен."
        ]
      },
      {
        id: "processing",
        title: "4. Обработка платежных запросов",
        icon: RefreshCcw,
        paragraphs: [
          "Возврат средств после его одобрения занимает от 5 до 10 рабочих дней, в зависимости от скорости обработки операций вашим банком.",
          "При возникновении вопросов, споров или жалоб на некорректное списание средств напишите нам по адресу billing@pharmnode.com. Пожалуйста, укажите в письме ID транзакции, адрес электронной почты учетной записи и данные чека Paddle."
        ]
      }
    ]
  }
};

export default function RefundPage() {
  const { locale } = useTranslation();
  const currentLang = (locale === "ru-RU") ? "ru-RU" : "en-US";
  const dict = content[currentLang];
  const [activeSection, setActiveSection] = useState("availability");

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
