import Link from "next/link";
import { ThemeToggle } from "@/components/ThemeToggle";
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
  ChevronRight
} from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "PharmNode - Virtual Formulation Studio",
  description: "Virtual drug and supplement formulation B2B SaaS. Calculate flowability, simulate tablet presses, verify regulatory limits, and generate GMP compliance reports.",
};

export default function LandingPage() {
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
          <a href="#features" className="hover:text-zinc-100 transition-colors">Функции</a>
          <a href="#workflow" className="hover:text-zinc-100 transition-colors">Техпроцесс</a>
          <a href="#technology" className="hover:text-zinc-100 transition-colors">Технологии</a>
          <a href="#regulatory" className="hover:text-zinc-100 transition-colors">Регуляторика</a>
        </nav>

        <div className="flex items-center gap-4">
          <ThemeToggle />
          <Link
            href="/configurator"
            className="px-4 py-1.5 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg text-xs font-bold shadow-lg shadow-indigo-500/10 hover:shadow-indigo-500/20 transition-all flex items-center gap-1 group theme-element"
          >
            Открыть студию
            <ArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-20 pb-16 px-6 max-w-7xl mx-auto flex flex-col items-center text-center">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-900/80 border border-zinc-800 text-zinc-400 text-[10px] font-bold uppercase tracking-wider mb-6">
          <Beaker size={12} className="text-indigo-400" />
          Цифровое фармацевтическое производство
        </div>
        
        <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight max-w-4xl text-transparent bg-clip-text bg-gradient-to-r from-zinc-100 via-zinc-200 to-indigo-400 leading-tight">
          Виртуальная студия разработки лекарств и БАД
        </h1>
        
        <p className="mt-6 text-sm sm:text-base md:text-lg text-zinc-400 max-w-2xl leading-relaxed">
          Проектируйте рецептуры, рассчитывайте сыпучесть порошков (Hausner/Carr), симулируйте параметры таблеточного пресса и автоматически проверяйте нормы FDA/EFSA в визуальном n8n-style холсте.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row items-center gap-4">
          <Link
            href="/configurator"
            className="px-6 py-3 bg-indigo-500 hover:bg-indigo-600 active:bg-indigo-700 text-white rounded-xl text-sm font-bold shadow-xl shadow-indigo-500/20 transition-all flex items-center gap-2 group theme-element"
          >
            Запустить конфигуратор
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </Link>
          <a
            href="#features"
            className="px-6 py-3 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 text-zinc-300 hover:text-zinc-100 rounded-xl text-sm font-semibold transition-all theme-element"
          >
            Изучить возможности
          </a>
        </div>

        {/* Visual Workspace Mockup */}
        <div className="mt-16 w-full max-w-5xl rounded-2xl border border-zinc-800/80 bg-zinc-900/40 backdrop-blur-md p-4 md:p-6 shadow-2xl relative">
          <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-zinc-800 to-transparent" />
          
          {/* Mockup Toolbar Header */}
          <div className="flex justify-between items-center pb-4 border-b border-zinc-800/60 mb-6 text-xs text-zinc-500">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/30" />
              <span className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/30" />
              <span className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/30" />
              <span className="font-mono ml-2">Active Formula: Amlodipine_Besylate_v1.2</span>
            </div>
            <span className="bg-zinc-900 border border-zinc-800 px-2 py-0.5 rounded text-[10px] font-bold text-indigo-400">
              PRO SIMULATION ACTIVE
            </span>
          </div>

          {/* Graphical layout mockup */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
            
            {/* Card 1: Ingredient */}
            <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4 text-left flex flex-col gap-2 relative">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-rose-400 font-bold uppercase tracking-wider border border-rose-500/20 bg-rose-500/5 px-2 py-0.5 rounded">
                  Active
                </span>
                <span className="text-[10px] text-zinc-500 font-mono">CAS: 111470-99-6</span>
              </div>
              <h4 className="font-bold text-sm text-zinc-100">Amlodipine Besylate</h4>
              <div className="flex justify-between items-center text-xs mt-2">
                <span className="text-zinc-500">Процент ввода:</span>
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
                  Blending Node
                </span>
                <span className="text-emerald-400 font-bold text-[10px]">99.8% flowability</span>
              </div>
              <h4 className="font-bold text-sm text-zinc-100 flex items-center gap-1.5">
                <Cpu size={14} className="text-indigo-400" />
                Смешивание
              </h4>
              <div className="grid grid-cols-2 gap-2 mt-2 text-[10px] text-zinc-400">
                <div className="bg-zinc-850 p-1.5 rounded border border-zinc-800">
                  <span className="text-zinc-500 block">Коэф. Хауснера:</span>
                  <span className="font-mono text-zinc-200 font-bold">1.09 (Excellent)</span>
                </div>
                <div className="bg-zinc-850 p-1.5 rounded border border-zinc-800">
                  <span className="text-zinc-500 block">Себестоимость:</span>
                  <span className="font-mono text-emerald-400 font-bold">$12.40 / kg</span>
                </div>
              </div>
            </div>

            {/* Card 3: Press output */}
            <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4 text-left flex flex-col gap-2 relative">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider border border-amber-500/20 bg-amber-500/5 px-2 py-0.5 rounded">
                  Tablet Press
                </span>
                <span className="text-zinc-500 text-[10px]">Porosity: 18.4%</span>
              </div>
              <h4 className="font-bold text-sm text-zinc-100 flex items-center gap-1.5">
                <Settings size={14} className="text-indigo-400" />
                Пуансон 8.0 мм
              </h4>
              <div className="bg-zinc-900 border border-zinc-800 p-2 rounded text-[10px] flex flex-col gap-1 mt-1 font-mono">
                <div className="flex justify-between">
                  <span className="text-zinc-500">Выпуск таблеток:</span>
                  <span className="text-indigo-400 font-bold">85,200 шт.</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Вес таблетки:</span>
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
            Все расчеты фармацевта на одном холсте
          </h2>
          <p className="text-zinc-400 max-w-xl mx-auto text-xs sm:text-sm">
            Мы объединили продвинутые математические алгоритмы и базу физико-химических свойств в интуитивный графический редактор.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1 */}
          <div className="bg-zinc-900/50 border border-zinc-800/80 rounded-2xl p-6 hover:border-zinc-700/80 transition-all duration-300 theme-element flex flex-col gap-4">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 shrink-0">
              <Layers size={20} />
            </div>
            <h3 className="font-bold text-sm text-zinc-100">Node-Based Редактор</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Визуальное управление цепочкой формуляции. Подключайте активные вещества, связующие, лубриканты и разбавители.
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-zinc-900/50 border border-zinc-800/80 rounded-2xl p-6 hover:border-zinc-700/80 transition-all duration-300 theme-element flex flex-col gap-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 shrink-0">
              <Gauge size={20} />
            </div>
            <h3 className="font-bold text-sm text-zinc-100">Математический Движок</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Мгновенный расчет физических показателей порошковой смеси: коэффициента Хауснера, пористости и индекса сжимаемости Карра.
            </p>
          </div>

          {/* Card 3 */}
          <div className="bg-zinc-900/50 border border-zinc-800/80 rounded-2xl p-6 hover:border-zinc-700/80 transition-all duration-300 theme-element flex flex-col gap-4">
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-400 shrink-0">
              <ShieldAlert size={20} />
            </div>
            <h3 className="font-bold text-sm text-zinc-100">Химическая Совместимость</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Интеллектуальный контроль несовместимостей. Блокировка реакций Майяра, амин-сахарных конфликтов и передозировки сырья.
            </p>
          </div>

          {/* Card 4 */}
          <div className="bg-zinc-900/50 border border-zinc-800/80 rounded-2xl p-6 hover:border-zinc-700/80 transition-all duration-300 theme-element flex flex-col gap-4">
            <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center text-violet-400 shrink-0">
              <FileText size={20} />
            </div>
            <h3 className="font-bold text-sm text-zinc-100">Отчетность GMP (PDF)</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Автоматическая генерация спецификаций готового продукта, паспорта безопасности рецептуры и профиля аллергенов (FALCPA).
            </p>
          </div>
        </div>
      </section>

      {/* Workflow Showcase */}
      <section id="workflow" className="py-20 px-6 max-w-7xl mx-auto border-t border-zinc-900 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-5 flex flex-col gap-6">
            <h2 className="text-2xl sm:text-4xl font-extrabold text-zinc-100 leading-tight">
              От идеи до технологической карты за 3 клика
            </h2>
            <p className="text-sm text-zinc-400 leading-relaxed">
              PharmNode заменяет разрозненные Excel-файлы и дорогостоящие лабораторные тесты на ранних этапах, помогая симулировать стабильность готовой формы.
            </p>
            <ul className="flex flex-col gap-4 text-xs">
              <li className="flex gap-2.5">
                <CheckCircle size={16} className="text-indigo-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-zinc-200 block">1. Выберите активное вещество</strong>
                  Добавьте лекарственную форму из справочника с известными CAS и свойствами.
                </div>
              </li>
              <li className="flex gap-2.5">
                <CheckCircle size={16} className="text-indigo-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-zinc-200 block">2. Подберите вспомогательное сырье</strong>
                  Регулируйте процент ввода. Движок оценит синергию плотности и гидрофобности.
                </div>
              </li>
              <li className="flex gap-2.5">
                <CheckCircle size={16} className="text-indigo-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-zinc-200 block">3. Настройте таблетпресс и получите отчет</strong>
                  Укажите размеры пуансона, симулируйте засыпку и экспортируйте готовую GMP-документацию.
                </div>
              </li>
            </ul>
          </div>

          <div className="lg:col-span-7 bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-6 flex flex-col gap-4 theme-element">
            <div className="flex justify-between items-center text-xs text-zinc-400 pb-2 border-b border-zinc-800/50">
              <span className="font-semibold text-zinc-300">GMP Validation Report (Simulation)</span>
              <span className="text-[10px] text-zinc-500">Document ID: US-21CFR-112</span>
            </div>
            
            <div className="flex flex-col gap-3 font-mono text-[10px] text-zinc-400">
              <div className="flex justify-between py-1 border-b border-zinc-900">
                <span>Ingredient Role Compatibility:</span>
                <span className="text-emerald-400 font-bold">COMPLIANT (100%)</span>
              </div>
              <div className="flex justify-between py-1 border-b border-zinc-900">
                <span>Magnesium Stearate Hydrophobicity Limit:</span>
                <span className="text-emerald-400">Pass (1.2% &le; 1.5% max)</span>
              </div>
              <div className="flex justify-between py-1 border-b border-zinc-900">
                <span>Allergen Profile (FALCPA Standard):</span>
                <span className="text-amber-400">Warning: Contains Milk (Lactose Monohydrate)</span>
              </div>
              <div className="flex justify-between py-1 border-b border-zinc-900">
                <span>FDA Label Identifier (CFR Title 21):</span>
                <span className="text-zinc-300">Dietary Supplement Standard (US)</span>
              </div>
            </div>
            
            <div className="mt-4 p-4 bg-zinc-900 rounded border border-zinc-800 text-[10px] text-zinc-400 flex flex-col gap-2">
              <div className="font-bold text-zinc-300 flex items-center gap-1.5 uppercase text-[9px] tracking-wider text-rose-400">
                <ShieldAlert size={14} />
                Регуляторный Дисклеймер
              </div>
              <p className="leading-relaxed">
                PharmNode является системой поддержки принятия решений (DSS). Все расчеты носят прогностический характер и требуют обязательной физической лабораторной валидации (FTIR, DSC, HPLC) перед началом промышленного выпуска.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Bottom Section */}
      <section className="py-20 px-6 max-w-5xl mx-auto text-center border-t border-zinc-900 w-full">
        <h2 className="text-2xl sm:text-4xl font-extrabold text-zinc-100">
          Готовы оптимизировать ваши рецептуры?
        </h2>
        <p className="mt-4 text-xs sm:text-sm text-zinc-400 max-w-md mx-auto leading-relaxed">
          Начните проектирование в виртуальной песочнице абсолютно бесплатно без регистрации.
        </p>
        <div className="mt-8">
          <Link
            href="/configurator"
            className="inline-flex items-center gap-2 px-6 py-3.5 bg-indigo-500 hover:bg-indigo-600 text-white font-bold text-sm rounded-xl shadow-xl shadow-indigo-500/10 hover:shadow-indigo-500/25 transition-all group theme-element"
          >
            Открыть интерактивный холст
            <ChevronRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-zinc-900 py-8 px-6 bg-zinc-950/80 backdrop-blur-md text-xs text-zinc-500 text-center theme-element">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-zinc-400">PharmNode</span>
            <span>&copy; 2026. Все права защищены.</span>
          </div>
          <div className="flex gap-6">
            <a href="#" className="hover:text-zinc-300">Условия использования</a>
            <a href="#" className="hover:text-zinc-300">EULA / DSS Disclaimer</a>
            <a href="#" className="hover:text-zinc-300">FDA Compliance</a>
          </div>
        </div>
      </footer>

    </div>
  );
}
