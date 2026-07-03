"use client";

import React from "react";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useTranslation } from "@/context/I18nContext";
import { ArrowLeft, Terminal, Server, ShieldCheck } from "lucide-react";

const pageContent = {
  "en-US": {
    back: "Back to Home",
    title: "REST API Reference",
    subtitle: "Programmatic access to B2B formulation calculations, density predictions, and chemical rules",
    definition_title: "Developer Integration Interface",
    definition_desc: "The REST API allows corporate clients to connect internal ERP/LIMS software directly to PharmNode's physical calculations and compatibility engines, guaranteeing response latency under 20ms.",
    sec1_title: "1. Authentication and Endpoint Protocol",
    sec1_desc: "All API requests require Bearer token authentication passed in the HTTP Authorization header. The API target base URL is hosted at https://api.pharmnode.com/v1. To prevent service degradation, requests are subject to strict rate limits depending on subscription tiers (Professional: 60 requests/min; Enterprise: unlimited).",
    sec2_title: "2. Bulk Calculation Endpoint (/v1/flowability)",
    sec2_desc: "POST to /v1/flowability to calculate Carr's Index and Hausner's Ratio for a list of components. Request body must contain ingredient bulk and tapped density objects alongside concentration weights. The payload returns flowability classifications with 4 decimal places of mathematical accuracy.",
    sec3_title: "3. Chemical Compatibility Screening (/v1/compatibility)",
    sec3_desc: "POST to /v1/compatibility to run active-excipient checks. The endpoint evaluates combinations across 35 chemical classes, returning compatibility percentages, risk scores, and detailed logs for known conflicts (like amino-sugar browning or allergens).",
    table_title: "Public Endpoint Registry",
    table_subtitle: "Summary of API endpoints and targeted processing latency profiles",
    col_method: "Method",
    col_path: "Endpoint Path",
    col_latency: "Target Latency",
    col_desc: "Description",
    endpoints_list: [
      { method: "GET", path: "/v1/ingredients", latency: "15ms", desc: "List standard and custom raw materials" },
      { method: "POST", path: "/v1/flowability", latency: "20ms", desc: "Calculate bulk/tapped composite densities, Carr & Hausner" },
      { method: "POST", path: "/v1/compatibility", latency: "20ms", desc: "Evaluate chemical conflicts across 35 classes" },
      { method: "GET", path: "/v1/recipes/:id", latency: "10ms", desc: "Fetch stored recipe structure and metadata" },
      { method: "POST", path: "/v1/recipes/gmp-export", latency: "150ms", desc: "Generate validated GMP PDF technical spec sheets" }
    ]
  },
  "ru-RU": {
    back: "На главную",
    title: "Документация REST API",
    subtitle: "Программный доступ к расчетам смесей, плотности порошков и матрицам совместимости",
    definition_title: "Интерфейс интеграции B2B",
    definition_desc: "REST API позволяет подключать внутренние LIMS/ERP системы предприятий напрямую к физическому движку и базам данных PharmNode, обеспечивая отклик запросов менее 20 мс.",
    sec1_title: "1. Протокол авторизации и лимиты",
    sec1_desc: "Все запросы к API требуют передачи Bearer токена в заголовке Authorization. Базовый адрес API: https://api.pharmnode.com/v1. Для предотвращения перегрузки серверов применяются лимиты (Professional: 60 запр/мин; Enterprise: без ограничений).",
    sec2_title: "2. Расчет параметров сыпучести (/v1/flowability)",
    sec2_desc: "Метод POST /v1/flowability рассчитывает индекс Карра и коэффициент Хауснера для смеси порошков. Тело запроса должно содержать массив ингредиентов с их насыпной/усадочной плотностью и долями ввода. Ответ возвращает класс сыпучести с точностью до 4 знаков.",
    sec3_title: "3. Проверка совместимости (/v1/compatibility)",
    sec3_desc: "Метод POST /v1/compatibility проверяет совместимость АФС и вспомогательного сырья. Система оценивает смесь по 35 химическим классам, возвращая процент стабильности, уровень риска и лог конфликтов (Майяра, аллергены).",
    table_title: "Реестр публичных эндпоинтов",
    table_subtitle: "Описание доступных адресов и целевого времени обработки запросов",
    col_method: "Метод",
    col_path: "Путь эндпоинта",
    col_latency: "Время отклика",
    col_desc: "Описание операции",
    endpoints_list: [
      { method: "GET", path: "/v1/ingredients", latency: "15 мс", desc: "Получить список стандартного и пользовательского сырья" },
      { method: "POST", path: "/v1/flowability", latency: "20 мс", desc: "Расчет плотности смеси, индекса Карра и Хауснера" },
      { method: "POST", path: "/v1/compatibility", latency: "20 мс", desc: "Проверка химической совместимости по 35 классам" },
      { method: "GET", path: "/v1/recipes/:id", latency: "10 мс", desc: "Получить структуру и метаданные сохраненного рецепта" },
      { method: "POST", path: "/v1/recipes/gmp-export", latency: "150 мс", desc: "Экспорт заполненных технологических GMP PDF-карт" }
    ]
  }
};

export default function ApiReferencePage() {
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
            <Terminal size={16} />
            {dict.definition_title}
          </h2>
          <p className="text-sm sm:text-base text-zinc-300 font-medium leading-relaxed">
            {dict.definition_desc}
          </p>
        </section>

        {/* Sections */}
        <div className="flex flex-col gap-12 mb-16">
          <section className="flex flex-col gap-3">
            <h2 className="text-lg sm:text-xl font-bold text-zinc-100 flex items-center gap-2">
              <Server size={18} className="text-indigo-400" />
              {dict.sec1_title}
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">{dict.sec1_desc}</p>
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="text-lg sm:text-xl font-bold text-zinc-100 flex items-center gap-2">
              <Terminal size={18} className="text-indigo-400" />
              {dict.sec2_title}
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">{dict.sec2_desc}</p>
            {/* Short code block example */}
            <pre className="p-4 rounded-xl bg-zinc-950 border border-zinc-900 overflow-x-auto text-[10px] text-indigo-400 font-mono">
{`POST /v1/flowability HTTP/1.1
Host: api.pharmnode.com
Authorization: Bearer <your_token>
Content-Type: application/json

{
  "ingredients": [
    { "name": "Active API", "percent": 15.0, "bulk": 0.38, "tapped": 0.51 },
    { "name": "Avicel pH-102", "percent": 85.0, "bulk": 0.29, "tapped": 0.41 }
  ]
}`}
            </pre>
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="text-lg sm:text-xl font-bold text-zinc-100 flex items-center gap-2">
              <ShieldCheck size={18} className="text-indigo-400" />
              {dict.sec3_title}
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">{dict.sec3_desc}</p>
          </section>
        </div>

        {/* Public Endpoints Table */}
        <section className="border-t border-zinc-900 pt-12">
          <div className="mb-8">
            <h2 className="text-xl sm:text-2xl font-bold text-zinc-100">{dict.table_title}</h2>
            <p className="text-xs text-zinc-400 mt-1">{dict.table_subtitle}</p>
          </div>

          <div className="overflow-x-auto rounded-xl border border-zinc-900 bg-zinc-950">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-zinc-900 bg-zinc-900/40 text-zinc-300 font-bold uppercase tracking-wider">
                  <th className="py-4 px-6">{dict.col_method}</th>
                  <th className="py-4 px-6">{dict.col_path}</th>
                  <th className="py-4 px-6">{dict.col_latency}</th>
                  <th className="py-4 px-6 text-indigo-400">{dict.col_desc}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-900 text-zinc-400">
                {dict.endpoints_list.map((item, idx) => (
                  <tr key={idx} className="hover:bg-zinc-900/20 transition-colors">
                    <td className="py-4 px-6">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        item.method === "GET"
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          : "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20"
                      }`}>
                        {item.method}
                      </span>
                    </td>
                    <td className="py-4 px-6 font-mono text-zinc-200">{item.path}</td>
                    <td className="py-4 px-6 font-mono">{item.latency}</td>
                    <td className="py-4 px-6 text-zinc-300">{item.desc}</td>
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
