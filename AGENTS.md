<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

---

# PharmNode — Правила для AI-агентов

## Контекст проекта

**PharmNode** — B2B SaaS платформа для расчетов в фармацевтике (Node-Based UI, матрицы совместимости, таблетирование).

- Стек: **Next.js** (App Router) + **TypeScript** + **Prisma** + **PostgreSQL**
- Все интерактивные компоненты → `"use client"` директива

---

## 📚 ДОКУМЕНТАЦИЯ — Читать перед работой

> Перед написанием любого кода прочитай соответствующий раздел документации.

| Задача | Документ |
| --- | --- |
| Обзор проекта, структура файлов | [`docs/project-overview.md`](docs/project-overview.md) |
| Текущие задачи и статус блоков | [`docs/tasks/todo.md`](docs/tasks/todo.md) |
| Бэкенд: API, Prisma, Redis, деплой | [`docs/architecture/backend.md`](docs/architecture/backend.md) |
| База знаний: матрицы, скоринг, 35 классов | [`docs/architecture/knowledge-base.md`](docs/architecture/knowledge-base.md) |
| Дорожная карта, уровни продукта | [`docs/architecture/product-evolution.md`](docs/architecture/product-evolution.md) |
| Настройка ключей, деплой на Vercel | [`docs/deployment/setup-guide.md`](docs/deployment/setup-guide.md) |

---

## 🎯 СКИЛЫ — Специализированные инструкции

> Для каждой области есть детальный скил с примерами кода. Читай его перед реализацией.

| Скил | Когда использовать |
| --- | --- |
| [`docs/skills/pharmnode-calculator/SKILL.md`](docs/skills/pharmnode-calculator/SKILL.md) | Формулы расчётов: Хауснер, Карр, пористость, партия, таблетирование |
| [`docs/skills/pharmnode-compatibility/SKILL.md`](docs/skills/pharmnode-compatibility/SKILL.md) | Матрица совместимости, химические классы, правила конфликтов |
| [`docs/skills/pharmnode-canvas-ui/SKILL.md`](docs/skills/pharmnode-canvas-ui/SKILL.md) | Canvas, ноды, SVG-связи, drag-and-drop, дизайн-система |
| [`docs/skills/pharmnode-backend-api/SKILL.md`](docs/skills/pharmnode-backend-api/SKILL.md) | Route Handlers, Prisma, NextAuth, тарифные лимиты |

---

## Правила для Gemini AI

### ОБЯЗАТЕЛЬНО перед написанием кода

1. **Next.js API**: Перед написанием Route Handlers, Server Actions или middleware — прочитай `node_modules/next/dist/docs/`. Все deprecated API помечены.

2. **Структура проекта**: 
   - `src/app/` — Next.js App Router (страницы и API)
   - `src/lib/calculator.ts` — ВСЯ бизнес-логика расчетов. Никогда не дублируй формулы в компонентах
   - `src/lib/chemicalRules.ts` — матрицы совместимости. Не создавай новых правил без добавления в этот файл
   - `src/types/pharm.ts` — единственный источник типов. Не создавай локальных интерфейсов для ингредиентов

3. **Типы**: Никаких `any`. Все интерфейсы — в `src/types/pharm.ts`

4. **Точность расчетов**: Формулы должны давать результат с точностью до 4 знаков. Округление — только в UI

5. **База данных**: Используй только Prisma Client (`src/lib/prisma.ts`). Mongoose схемы в `src/models/` — архивные, не используются

### Файлы-игнорки для Gemini (см. `.geminiignore`)

- Не трогать: `docs/archive/` — архивные материалы
- Не трогать: `.env`, `.env.local` — чувствительные данные  
- Не трогать: `node_modules/`, `.next/` — генерируемые директории
- Не трогать: `src/models/` — Mongoose архив

---

## Правила для Claude AI

> Этот файл подключается через `CLAUDE.md` как `@AGENTS.md`

Те же правила что для Gemini плюс:
- Читай `node_modules/next/dist/docs/` перед изменением Next.js конфигурации
- Heed deprecation notices

---

## Архитектурные принципы

### Экспертная система (без ИИ)
Логика совместимости — детерминированная, на базе правил. Никаких вероятностных моделей в MVP.

### Node-Based UI
Каждая "нода" — React-компонент в `src/components/NodeCard.tsx`. Состояние холста — в `src/hooks/useNodeEditor.ts`.

### Дизайн
- Темная тема: `--bg: #000000`, `--primary: #05e69f`
- Светлая тема: `--bg: #f8fafc`, `--primary: #005eb8`
- Все переменные — в `src/app/globals.css`
- Никогда не используй хардкоженные цвета в компонентах

### API Design
- Авторизация через NextAuth, тариф хранится в `User.tariff`
- Ограничения тарифов проверяются в Route Handlers, не в UI
- `hobby` → 3 ingredients; `professional` → unlimited
