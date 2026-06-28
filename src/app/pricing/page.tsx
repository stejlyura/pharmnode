"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PricingPanel } from "@/components/PricingPanel";
import { useTranslation } from "@/context/I18nContext";
import { useAuth } from "@/context/AuthContext";
import { 
  ArrowLeft, 
  HelpCircle, 
  Layers, 
  ShieldAlert, 
  Calculator, 
  Database, 
  FileText 
} from "lucide-react";

const pageContent = {
  "en-US": {
    title: "Pricing & License Plans",
    subtitle: "Transparent pricing designed for pharmaceutical specialists and laboratories",
    description: "Start designing formulations for free, or unlock the full power of our virtual studio with the Professional plan.",
    backLink: "Back to Home",
    featuresTitle: "What is PharmNode?",
    featuresSubtitle: "A comprehensive digital suite for smart drug formulation design",
    features: [
      {
        title: "Interactive Node Editor (DSS)",
        desc: "Design complex multi-ingredient formulations visually using our drag-and-drop canvas and real-time computation engine.",
        icon: Layers
      },
      {
        title: "Physical Powder Calculations",
        desc: "Instantly compute powder flowability, Hausner ratio, Carr index, porosity, diluent ratios, and tablet press volume parameters.",
        icon: Calculator
      },
      {
        title: "Compatibility Conflict Matrices",
        desc: "Analyze ingredient compatibility across 35 chemical classes with automated risk scoring and warning logs.",
        icon: ShieldAlert
      },
      {
        title: "Raw Material Library",
        desc: "Access basic substances for free or unlock the full database of 250+ excipients and active ingredients in the Pro plan.",
        icon: Database
      },
      {
        title: "GMP/GxP PDF Reporting",
        desc: "Export professional formulation sheets, calculated metrics, and compatibility matrices into industry-standard PDFs.",
        icon: FileText
      }
    ],
    faqTitle: "Frequently Asked Questions",
    faqSubtitle: "Find answers to common questions about Paddle billing and subscription management",
    faqs: [
      {
        q: "How are my payments processed?",
        a: "All payments and subscriptions on PharmNode are securely managed by Paddle, our Merchant of Record. Paddle processes your transaction in full compliance with PCI-DSS standards. We do not store or process your credit card numbers on our servers."
      },
      {
        q: "What payment methods do you accept?",
        a: "Through Paddle, we accept major credit and debit cards (Visa, MasterCard, American Express), PayPal, Apple Pay, and Google Pay (depending on your country of residence)."
      },
      {
        q: "Can I cancel my subscription?",
        a: "Yes, you can cancel your subscription at any time. When logged in, visit your Settings page and click 'Manage Subscription' to open the Paddle Customer Portal, where you can cancel, update your payment details, or download past invoices."
      },
      {
        q: "What happens when I cancel?",
        a: "Upon cancellation, your Professional access will remain active until the end of your current billing period. After that, your account will revert to the Hobby tier (max 3 ingredients per recipe)."
      },
      {
        q: "Do you offer refunds?",
        a: "We want you to be fully satisfied. If you encountered any billing issues or wish to request a refund, please contact us at billing@pharmnode.com within 14 days of purchase. Please refer to our Refund Policy page for full details."
      }
    ]
  },
  "ru-RU": {
    title: "Цены и Тарифные Планы",
    subtitle: "Прозрачные тарифы для разработчиков рецептур и фармацевтических лабораторий",
    description: "Начните проектирование бесплатно на тарифе Hobby или разблокируйте все возможности виртуальной студии с тарифом Professional.",
    backLink: "На главную",
    featuresTitle: "Что представляет собой PharmNode?",
    featuresSubtitle: "Полноценный цифровой комплекс для умного проектирования лекарственных форм",
    features: [
      {
        title: "Интерактивный редактор нод (DSS)",
        desc: "Визуально проектируйте многокомпонентные смеси с помощью drag-and-drop холста и вычислений в реальном времени.",
        icon: Layers
      },
      {
        title: "Фарм-расчеты параметров смесей",
        desc: "Мгновенно рассчитывайте индекс Карра, коэффициент Хауснера, пористость, объемы таблетирования и степень разбавления.",
        icon: Calculator
      },
      {
        title: "Матрицы совместимости веществ",
        desc: "Анализируйте совместимость ингредиентов по 35 химическим классам с автоматическим выводом предупреждений о рисках.",
        icon: ShieldAlert
      },
      {
        title: "База данных сырья",
        desc: "Используйте базовые вещества бесплатно или разблокируйте доступ к полной базе из 250+ эксципиентов и АФИ на Pro-тарифе.",
        icon: Database
      },
      {
        title: "Экспорт отчетов по стандартам GMP",
        desc: "Экспортируйте спецификации рецептур, результаты расчетов и матрицы совместимости в профессиональные PDF-отчеты.",
        icon: FileText
      }
    ],
    faqTitle: "Часто задаваемые вопросы",
    faqSubtitle: "Ответы на популярные вопросы о платежах Paddle и управлении подпиской",
    faqs: [
      {
        q: "Как обрабатываются платежи?",
        a: "Все платежи и подписки на PharmNode надежно обрабатываются платформой Paddle, которая является нашим официальным продавцом (Merchant of Record). Paddle проводит транзакции в полном соответствии со стандартом PCI-DSS. Мы не храним и не обрабатываем данные ваших карт на наших серверах."
      },
      {
        q: "Какие способы оплаты вы принимаете?",
        a: "Через Paddle мы принимаем основные дебетовые и кредитные карты (Visa, MasterCard, American Express), PayPal, Apple Pay и Google Pay (в зависимости от вашей страны)."
      },
      {
        q: "Могу ли я отменить подписку?",
        a: "Да, вы можете отменить подписку в любой момент. В личном кабинете перейдите в Настройки и нажмите кнопку «Управление подпиской». Откроется клиентский портал Paddle, где можно отменить подписку, сменить карту или скачать инвойсы."
      },
      {
        q: "Что произойдет после отмены подписки?",
        a: "После отмены ваш тариф Professional останется активным до конца текущего оплаченного периода. Затем ваш аккаунт вернется на тариф Hobby (до 3 ингредиентов в рецепте)."
      },
      {
        q: "Предоставляете ли вы возврат средств?",
        a: "Мы стремимся к тому, чтобы вы были довольны сервисом. Если у вас возникли технические проблемы или вы хотите запросить возврат, свяжитесь с нами по почте billing@pharmnode.com в течение 14 дней с момента оплаты. Подробности читайте на странице политики возврата."
      }
    ]
  }
};

export default function PricingPage() {
  const router = useRouter();
  const { locale } = useTranslation();
  const { user, changeTariff } = useAuth();
  const currentLang = (locale === "ru-RU") ? "ru-RU" : "en-US";
  const dict = pageContent[currentLang];

  const currentTariff = user?.tariff || "hobby";

  const handleSelectTariff = (tariff: "hobby" | "professional") => {
    if (!user) {
      router.push("/login?redirect=/pricing");
    } else {
      changeTariff(tariff);
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

          {/* Page Heading */}
          <div className="text-center pb-8 mb-10 border-b border-zinc-900/60">
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              {dict.title}
            </h1>
            <p className="mt-4 text-sm sm:text-base text-zinc-400 max-w-2xl mx-auto leading-relaxed">
              {dict.subtitle}
            </p>
          </div>

          {/* Pricing Panel Component */}
          <div className="flex justify-center mb-20">
            <PricingPanel
              currentTariff={currentTariff}
              onSelectTariff={handleSelectTariff}
            />
          </div>

          {/* Section: What we sell / Project features */}
          <section className="mb-20 border-t border-zinc-900 pt-16">
            <div className="text-center mb-12">
              <h2 className="text-xl sm:text-3xl font-extrabold text-zinc-100">
                {dict.featuresTitle}
              </h2>
              <p className="mt-2 text-xs sm:text-sm text-zinc-400 max-w-md mx-auto leading-relaxed">
                {dict.featuresSubtitle}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {dict.features.map((feat, idx) => {
                const IconComponent = feat.icon;
                return (
                  <div
                    key={idx}
                    className="p-6 rounded-2xl bg-zinc-900/30 border border-zinc-900 hover:border-zinc-800/80 transition-all flex flex-col gap-4 relative group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-zinc-800/40 border border-zinc-800/60 text-indigo-400 flex items-center justify-center group-hover:bg-indigo-500/10 group-hover:border-indigo-500/20 transition-all">
                      <IconComponent size={20} />
                    </div>
                    <h3 className="text-sm font-bold text-zinc-100">{feat.title}</h3>
                    <p className="text-xs text-zinc-400 leading-relaxed">{feat.desc}</p>
                  </div>
                );
              })}
            </div>
          </section>

          {/* FAQ Section */}
          <section className="border-t border-zinc-900 pt-16 mb-8">
            <div className="text-center mb-12">
              <h2 className="text-xl sm:text-3xl font-extrabold text-zinc-100">
                {dict.faqTitle}
              </h2>
              <p className="mt-2 text-xs sm:text-sm text-zinc-400 max-w-md mx-auto leading-relaxed">
                {dict.faqSubtitle}
              </p>
            </div>

            <div className="max-w-3xl mx-auto flex flex-col gap-6">
              {dict.faqs.map((faq, idx) => (
                <div
                  key={idx}
                  className="p-6 rounded-2xl bg-zinc-900/20 border border-zinc-900 hover:border-zinc-850 transition-colors flex gap-4"
                >
                  <div className="text-indigo-400 mt-0.5 shrink-0">
                    <HelpCircle size={18} />
                  </div>
                  <div className="flex flex-col gap-2">
                    <h4 className="text-xs sm:text-sm font-bold text-zinc-100">
                      {faq.q}
                    </h4>
                    <p className="text-xs text-zinc-400 leading-relaxed">
                      {faq.a}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>

        </div>
      </main>

      <Footer />
    </div>
  );
}
