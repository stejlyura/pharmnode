# PharmNode — Бэкенд архитектура, стек и деплой

## Технологический стек

### Frontend / Fullstack
- **Next.js** (App Router) — основной фреймворк
- **TypeScript** — строгая типизация везде
- **Tailwind CSS** — стилизация

### Backend (встроен в Next.js)
- **Next.js Route Handlers** — API роуты (`src/app/api/`)
- **Next.js Server Actions** — серверные действия
- Отдельный NestJS **не требуется** на текущем этапе

### База данных
- **PostgreSQL** (основная)
- **Prisma ORM** — работа с БД
- Рекомендуемые хостинги: **Neon.tech**, **Supabase**

### Кэш
- **Redis** (Upstash Redis для serverless)

### Фоновые задачи
- **BullMQ** (при масштабировании)

### ORM / Модели
- **Prisma** — основная БД (`User`, `Recipe`, `CustomIngredient`)
- Mongoose схема (`src/models/CustomIngredient.ts`) — историческая, не используется

---

## API Эндпоинты (`src/app/api`)

| Метод | Путь | Описание |
| --- | --- | --- |
| GET, POST | `/api/ingredients` | Получение/создание пользовательских ингредиентов |
| POST | `/api/recipes` | Сохранение и обновление рецептур |
| ALL | `/api/auth/[...nextauth]` | OAuth авторизация (NextAuth.js) |
| POST | `/api/checkout` | Stripe биллинг |
| GET | `/api/admin/data` | Данные для admin-панели |

**Особенности API:**
- Валидация входных данных (плотности, цены, роли)
- Санитизация строк (защита от XSS)
- Для локальной разработки — mock-провайдеры авторизации

---

## Prisma схема

```prisma
model User {
  id      String   @id
  email   String   @unique
  tariff  String   @default("hobby") // hobby | professional | enterprise
  recipes Recipe[]
}

model Recipe {
  id      String @id
  userId  String
  canvas  Json   // состояние нод и соединений
  user    User   @relation(...)
}

model CustomIngredient {
  id     String @id
  userId String
  data   Json
}
```

---

## Бизнес-логика (`src/lib`)

| Файл | Описание |
| --- | --- |
| [`calculator.ts`](../../src/lib/calculator.ts) | Физико-химические расчеты: сыпучесть, пористость, таблетирование, партии |
| [`chemicalRules.ts`](../../src/lib/chemicalRules.ts) | 35 химических классов + правила совместимости |
| [`auth.ts`](../../src/lib/auth.ts) | Конфигурация NextAuth / Auth.js |
| [`prisma.ts`](../../src/lib/prisma.ts) | Singleton Prisma Client для serverless |

---

## Система кэширования (Redis)

### Ключи кэша

| Тип | Ключ | TTL |
| --- | --- | --- |
| Ингредиент | `ingredient:{id}` | 24 ч |
| Совместимость | `compatibility:{idA}:{idB}` | — |
| Готовая формула | `formula:sleep`, `formula:immune` | — |
| Граф ингредиента | `ingredient_graph:{id}` | — |

### Предрасчёт данных

Ночные фоновые задачи рассчитывают популярные комбинации:
```text
A + B, A + C, A + D → результаты сохраняются
```

### Materialized Views (PostgreSQL)

```sql
CREATE MATERIALIZED VIEW top_sleep_ingredients;
REFRESH MATERIALIZED VIEW top_sleep_ingredients;
```

---

## Деплой

### Текущая схема (MVP)

```text
Vercel
├── Frontend (Next.js)
└── Backend (Next.js API)

Neon PostgreSQL
Upstash Redis
```

### Build Command для Vercel

```bash
npx prisma generate && next build
```

### Переменные окружения

| Переменная | Описание |
| --- | --- |
| `DATABASE_URL` | PostgreSQL строка подключения |
| `NEXTAUTH_SECRET` | Секрет для шифрования сессий |
| `NEXTAUTH_URL` | Публичный домен |
| `STRIPE_API_KEY` | Ключ Stripe |
| `STRIPE_WEBHOOK_SECRET` | Webhook секрет Stripe |
| `GOOGLE_CLIENT_ID/SECRET` | OAuth Google |
| `GITHUB_ID/SECRET` | OAuth GitHub |

---

## Архитектура при масштабировании

```text
Frontend (Next.js)
    ↓
Backend (NestJS) ← добавляется при росте
    ↓
BullMQ Workers
    ↓
Redis Cache
    ↓
PostgreSQL
```

**NestJS добавляется только при появлении:**
- Сложных фоновых задач и очередей
- Больших объёмов данных
- Отдельных клиентов (Web, Mobile, Partner API)

---

## Монорепозиторий (планируемая структура)

```text
pharmnode/
app/
├── frontend
├── api
└── admin

packages/
├── shared-types
├── scoring-engine
├── validation
└── utils
```
