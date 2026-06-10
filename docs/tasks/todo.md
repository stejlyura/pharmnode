# PharmNode — Задачи (Todo)

> Исходный план разработки MVP. Актуальное состояние задач.
> Инструкция по деплою → [`docs/deployment/setup-guide.md`](../deployment/setup-guide.md)

---

## Статус блоков

```markdown
[x] БЛОК 1:  Базовая структура данных и типы
[x] БЛОК 2:  Математический и химический вычислительный движок
[x] БЛОК 3:  Управление состоянием холста (Node Editor State)
[x] БЛОК 4:  Интерактивный Node-Based интерфейс (UI Canvas)
[x] БЛОК 5:  Юридические дисклеймеры и регуляторные проверки (США/ЕС)
[x] БЛОК 6:  Тарифная сетка и финальная полировка интерфейса
[x] БЛОК 7:  Дизайн-система, темы оформления и переключение тем
[x] БЛОК 8:  Лендинговая страница и маршрутизация
[x] БЛОК 9:  Аутентификация (OAuth) и База Данных (PostgreSQL)
[x] БЛОК 10: Экспорт документации (PDF) и Локализация (i18n)
[x] БЛОК 11: Биллинг (Stripe / LemonSqueezy) и UX холста (Undo/Redo)
[ ] БЛОК 12: Панель компонентов и Drag-and-Drop (в стиле Scratch / n8n)
[ ] БЛОК 13: Подготовка проекта к деплою (Production Readiness)
[x] БЛОК 14: SEO Оптимизация и брендинг
```

---

## 💡 Глобальные подсказки по выполнению

1. **Разделение логики и представления**: математические формулы и логика совместимости — только в `src/lib/calculator.ts`
2. **Абсолютная точность**: формулы работают с точностью до 4 знаков, округление в UI до 2–3
3. **Эстетика Premium B2B SaaS**: glassmorphism, градиентные рамки, SVG-линии, анимации
4. **Безопасность типов**: никаких `any`. Все интерфейсы описаны в `src/types/pharm.ts`
5. **React 19 / Next.js**: все интерактивные компоненты холста — с директивой `"use client"`

---

## 📦 БЛОК 1: Базовая структура данных и типы ✅

### Задача 1.1: Типы данных для ингредиентов

**Файлы:** `src/types/pharm.ts`

```typescript
export type IngredientRole = 'active' | 'filler' | 'lubricant' | 'glidant' | 'dry-binder';

export interface Ingredient {
  id: number;
  name: string;
  casNumber?: string;
  role: IngredientRole;
  chemicalClassId: number;
  looseBulkDensity: number;   // g/mL без уплотнения
  tappedBulkDensity: number;  // g/mL с уплотнением
  trueDensity?: number;        // для расчета пористости
  averageParticleSizeUm?: number;
  incompatibleWith: number[];  // chemicalClassId конфликтов
  compatibleWith: number[];    // chemicalClassId синергий
  isAllergen?: boolean;
  costPerKgUsd: number;
  maxSafePercentage: number;
}
```

**Чеклист:**
- [x] `src/types/pharm.ts` создан
- [x] `IngredientRole` тип описан
- [x] `Ingredient` интерфейс с физико-химическими свойствами
- [x] `baseIngredientsMatrix` — 5 реальных ингредиентов с несовместимостями

---

## 🧪 БЛОК 2: Вычислительный движок ✅

### Задача 2.1: Физико-химический калькулятор

**Файлы:** `src/lib/calculator.ts`

**Формулы:**
- Коэффициент Хауснера: `H = ρ_tapped / ρ_loose`
- Индекс Карра: `C = 100 * (ρ_tapped - ρ_loose) / ρ_tapped`
- Объём матрицы: `V = π * (d/2)² * h`
- Макс. масса засыпки: `M_max = V * ρ_loose_blend`
- Рабочий вес: `M_work ≤ 0.9 * M_max`
- Пористость: `ε = 1 - (ρ_apparent / ρ_true)`

**Экспортируемые функции:**
- `calculateFlowability(loose, tapped)` → `{ hausner, carr, rating }`
- `calculatePorosity(massMg, volumeCm3, trueDensityBlend)` → `number`
- `calculateBlendProperties(ingredients[])` → `{ looseDensity, tappedDensity, flowability }`
- `calculateTableting(diameterCm, depthCm, looseDensity)` → `{ volume, maxWeightMg, recommendedWeightMg }`
- `calculateBatch(activeRawWeightG, recommendedWeightMg, activePercentage, costPerKgBlend)` → `{ totalTablets, totalBatchWeightKg, costPerTabletUsd, totalBatchCostUsd }`
- `checkCompatibilityAndLimits(ingredients[])` → предупреждения

**Чеклист:**
- [x] Коэффициент Хауснера, индекс Карра, шкала сыпучести
- [x] Взвешенное усреднение плотностей смеси
- [x] Геометрические расчеты цилиндрической матрицы
- [x] Расчет партии, количества таблеток, себестоимости
- [x] Алгоритм поиска несовместимостей по `chemicalClassId`

---

## 🛠️ БЛОК 3: Управление стейтом холста ✅

### Задача 3.1: React-хук `useNodeEditor`

**Файлы:** `src/hooks/useNodeEditor.ts`

**API хука:**
- `nodes` — список нод на холсте
- `connections` — связи между нодами
- `addIngredientNode(ingredientId)`
- `removeNode(nodeId)`
- `updateNodeData(nodeId, data)`
- `calculatedResults` — автоматически пересчитываемые результаты

**Чеклист:**
- [x] Хук создан с начальной схемой (active + filler + blending + press + output)
- [x] Методы добавления/удаления/обновления нод
- [x] Реактивный пересчет при любых изменениях

---

## 🎨 БЛОК 4: UI Canvas ✅

**Файлы:** `src/components/Canvas.tsx`, `src/components/NodeCard.tsx`

**Чеклист:**
- [x] Canvas с фоном-сеткой (`radial-gradient`)
- [x] Рендер карточек нод по координатам
- [x] SVG-линии связей (Bezier curves)
- [x] Кнопка добавления ингредиента из библиотеки
- [x] Коэффициент Хауснера, Карра, сыпучесть в Blending Node
- [x] Предупреждения химических несовместимостей с подсветкой
- [x] Press Node: ползунки диаметра (3 мм) и глубины + пористость
- [x] Cost Optimizer Node
- [x] Output Node: паспорт рецептуры + аллергены

---

## ⚖️ БЛОК 5: Юридические дисклеймеры ✅

**Файлы:** `src/components/Disclaimer.tsx`

**Чеклист:**
- [x] EULA/DSS дисклеймер с подтверждением пользователя
- [x] Генератор маркировки (Dietary Supplement / Food Supplement)
- [x] Проверка лимитов (FDA/EFSA)
- [x] Аллергены (FALCPA: «Contains: Milk (Lactose)»)

---

## 💳 БЛОК 6: Тарифная сетка ✅

**Файлы:** `src/components/PricingPanel.tsx`

- [x] Панель Hobby / Professional / Enterprise
- [x] Ограничение 3 ингредиента на Hobby
- [x] Блокировка AI-рекомендаций + кнопка «Upgrade to Pro»
- [x] Симуляция GMP-экспорта на Enterprise

---

## 🎨 БЛОК 7: Дизайн-система ✅

**Файлы:** `src/app/globals.css`, `src/components/ThemeToggle.tsx`

**CSS переменные:**
```css
:root { --bg: #f8fafc; --primary: #005eb8; --radius: 0.125rem; }
[data-theme="dark"] { --bg: #000000; --primary: #05e69f; }
```

- [x] Светлая и тёмная темы через CSS переменные
- [x] Плавные transitions, стилизация скроллбара
- [x] ThemeToggle — сохранение в localStorage

---

## 🚀 БЛОК 8: Лендинг ✅

**Файлы:** `src/app/page.tsx`, `src/app/configurator/page.tsx`

- [x] Hero-секция с CTA
- [x] Маршрутизация: `/` — лендинг, `/configurator` — рабочее пространство
- [x] SEO мета-теги

---

## 🔐 БЛОК 9: Auth + БД ✅

**Файлы:** `prisma/schema.prisma`, `src/lib/auth.ts`, `src/lib/prisma.ts`

- [x] NextAuth / Auth.js с mock-провайдерами
- [x] Prisma + PostgreSQL: User, Recipe, CustomIngredient
- [x] API `/api/ingredients`, `/api/recipes` через Prisma Client
- [x] Миграция `npx prisma db push`

---

## 📄 БЛОК 10: PDF + i18n ✅

- [x] PDF-генератор (`src/lib/pdfGenerator.ts`)
- [x] Шаблон GMP отчёта с логотипом и таблицами
- [x] `en-US.json` / `en-EU.json` — стандарты FDA vs EFSA

---

## 💳 БЛОК 11: Биллинг + Undo/Redo ✅

- [x] Stripe checkout (`/api/checkout`)
- [x] Паттерн истории в `useNodeEditor` (past/present/future)
- [x] Cmd+Z для отмены
- [x] Debounced автосохранение рецептуры

---

## 📐 БЛОК 12: Sidebar + Drag-and-Drop ⬜

### Задача 12.1: Боковая панель компонентов

**Файлы:** `src/components/Sidebar.tsx`, `src/components/Canvas.tsx`

**Чеклист:**
- [ ] Создан `src/components/Sidebar.tsx`
- [ ] Интегрирован в Canvas layout
- [ ] Фильтрация и группировка по ролям
- [ ] Кнопка сворачивания с анимацией

### Задача 12.2: HTML5 Drag-and-Drop

**Чеклист:**
- [ ] `draggable="true"` + `onDragStart` в Sidebar
- [ ] `onDragOver` + `onDrop` на Canvas
- [ ] Визуальный drop-zone эффект
- [ ] Точный расчет координат сброса (с учетом скролла)
- [ ] Нода создаётся в точке сброса

---

## 🚀 БЛОК 13: Production Readiness ⬜

### Задача 13.1: Переменные окружения

→ Инструкция: [`docs/deployment/setup-guide.md`](../deployment/setup-guide.md)

**Чеклист:**
- [ ] Зарегистрировать продакшен БД (Supabase, Neon)
- [ ] Google Cloud Console + GitHub OAuth Apps
- [ ] Stripe Dashboard ключи
- [ ] Заполнить переменные в Vercel

### Задача 13.2: Деплой

**Чеклист:**
- [ ] Подключить Git-репозиторий к Vercel
- [ ] Build Command: `npx prisma generate && next build`
- [ ] Миграция `npx prisma db push` на удалённую БД
- [ ] Проверить рабочий домен

---

## 🔍 БЛОК 14: SEO + Брендинг ✅

- [x] Логотип PharmNode в `public/`
- [x] Open Graph + Twitter Cards в `layout.tsx`
- [x] Динамический `sitemap.xml`
- [x] `robots.txt` (всё кроме `/api`)
- [x] `manifest.json` (PWA)
