# PharmNode Studio

**Облачная B2B SaaS-платформа** для виртуального формулирования и расчёта лекарственных форм и БАД.

Концепция: **Quality by Computational Design (QbCD)** — технологи визуально собирают рецептуры из ингредиентов, платформа мгновенно проверяет химическую совместимость и рассчитывает параметры таблетирования.

## Быстрый старт

```bash
npm install
npm run dev
```

Открыть [http://localhost:3000](http://localhost:3000)

## Структура документации

| Файл | Содержание |
| --- | --- |
| [`docs/project-overview.md`](docs/project-overview.md) | Полный обзор проекта, структура кода, ключевые файлы |
| [`docs/architecture/backend.md`](docs/architecture/backend.md) | Стек, API, Prisma, Redis, деплой |
| [`docs/architecture/knowledge-base.md`](docs/architecture/knowledge-base.md) | База знаний, матрицы совместимости, скоринг |
| [`docs/architecture/product-evolution.md`](docs/architecture/product-evolution.md) | Уровни продукта, дорожная карта |
| [`docs/tasks/todo.md`](docs/tasks/todo.md) | Список задач, статус блоков |
| [`docs/deployment/setup-guide.md`](docs/deployment/setup-guide.md) | Настройка ключей, деплой на Vercel |

## Стек

- **Next.js** (App Router) + **TypeScript**
- **Prisma** + **PostgreSQL** (Neon / Supabase)
- **Redis** (Upstash)
- **NextAuth.js** (Google + GitHub OAuth)
- **Stripe** (биллинг)

## Ключевые возможности

- 🧪 Node-Based Canvas для визуальной сборки рецептур
- ⚗️ Проверка химической совместимости (35 химических классов)
- 📊 Физико-химические расчёты (коэффициент Хауснера, индекс Карра, пористость)
- 💊 Симуляция таблетирования (геометрия матрицы, вес партии)
- 💰 Экономические расчёты (себестоимость таблетки)
- 🌙 Тёмная / Светлая темы
- 📄 Экспорт GMP-отчётов в PDF

## Тарифы

| Тариф | Цена | Ингредиентов |
| --- | --- | --- |
| Hobby | Бесплатно | 3 |
| Professional | $149/мес | 15 |
| Enterprise | Custom | ∞ |
