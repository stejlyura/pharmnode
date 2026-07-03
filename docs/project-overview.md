# PharmNode — Обзор проекта

**PharmNode** — облачная B2B SaaS-платформа для автоматизации расчетов, моделирования совместимости ингредиентов и симуляции таблетирования в фармацевтике и индустрии БАД.

Концепция: **Quality by Computational Design (QbCD)** — виртуальная оценка физико-химических рисков до лабораторных испытаний.

---

## Что умеет платформа

- **Node-Based Canvas** (в стиле n8n/Node-RED) — визуальная сборка рецептур
- **Библиотека ингредиентов** — 5+ базовых + пользовательские ингредиенты
- **Проверка химической совместимости** — 35 химических классов, детерминированные правила
- **Физико-химические расчеты**:
  - Коэффициент Хауснера и Индекс Карра (сыпучесть)
  - Пористость таблетки
  - Объем матрицы пуансона и масса засыпки
- **Симуляция таблетирования** — параметры пресса, рабочий вес
- **Экономические расчеты** — себестоимость таблетки, размер партии
- **Интерактивная матрица совместимости** — тепловая карта (heatmap)

---

## Структура проекта

```text
pharmnode/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── page.tsx            # Лендинг (/)
│   │   ├── configurator/       # Конфигуратор (/configurator)
│   │   ├── api/
│   │   │   ├── ingredients/    # GET, POST ингредиенты
│   │   │   ├── recipes/        # POST рецептуры
│   │   │   ├── auth/           # NextAuth.js
│   │   │   └── checkout/       # Paddle биллинг
│   │   └── globals.css         # CSS переменные тем
│   ├── components/
│   │   ├── Canvas.tsx          # Холст с нодами
│   │   ├── NodeCard.tsx        # Карточки нод
│   │   ├── Sidebar.tsx         # Панель компонентов
│   │   ├── CompatibilityMatrix.tsx
│   │   ├── PricingPanel.tsx
│   │   ├── ThemeToggle.tsx
│   │   ├── Header.tsx
│   │   └── Disclaimer.tsx
│   ├── hooks/
│   │   └── useNodeEditor.ts    # Стейт холста
│   ├── lib/
│   │   ├── calculator.ts       # Физико-химические расчеты
│   │   ├── chemicalRules.ts    # Правила совместимости
│   │   ├── auth.ts             # NextAuth конфиг
│   │   ├── prisma.ts           # Prisma клиент
│   │   └── pdfGenerator.ts     # Генерация PDF отчетов
│   ├── types/
│   │   └── pharm.ts            # TypeScript типы
│   ├── models/                 # Mongoose (архив)
│   └── i18n/                   # Локализация
├── prisma/
│   └── schema.prisma           # Схема БД
└── docs/                       # Документация проекта
    ├── project-overview.md     ← этот файл
    ├── architecture/
    │   ├── backend.md
    │   ├── knowledge-base.md
    │   └── product-evolution.md
    ├── deployment/
    │   └── setup-guide.md
    ├── tasks/
    │   └── todo.md
    └── archive/
        └── pre-mvp-research.md
```

---

## Бэкенд архитектура

→ [`docs/architecture/backend.md`](architecture/backend.md)

## База знаний и матрицы совместимости

→ [`docs/architecture/knowledge-base.md`](architecture/knowledge-base.md)

## Дорожная карта

→ [`docs/architecture/product-evolution.md`](architecture/product-evolution.md)

---

## Ключевые файлы с бизнес-логикой

| Файл | Что делает |
| --- | --- |
| [`src/lib/calculator.ts`](../src/lib/calculator.ts) | Формулы: Хауснер, Карр, пористость, геометрия матрицы, партии |
| [`src/lib/chemicalRules.ts`](../src/lib/chemicalRules.ts) | 35 хим. классов + правила совместимости |
| [`src/types/pharm.ts`](../src/types/pharm.ts) | TypeScript интерфейсы `Ingredient`, `IngredientRole` |
| [`src/hooks/useNodeEditor.ts`](../src/hooks/useNodeEditor.ts) | Стейт нод холста + реактивный пересчет |
| [`src/components/Canvas.tsx`](../src/components/Canvas.tsx) | SVG-холст с нодами и связями |
| [`src/components/CompatibilityMatrix.tsx`](../src/components/CompatibilityMatrix.tsx) | Heatmap матрицы совместимости |

---

## Дизайн-система

**Темы:**
- **Светлая** (`default`): строгий медицинский — `#f8fafc` фон, `#005eb8` акцент
- **Тёмная** (`[data-theme="dark"]`): премиум тёмная — `#000000` фон, `#05e69f` акцент

**Компоненты:** glassmorphism, градиентные границы, SVG-линии связей (Bezier curves), animated transitions.

---
⬅️ [Вернуться к индексу документации](index.md)
