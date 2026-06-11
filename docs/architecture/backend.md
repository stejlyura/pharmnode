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

### ORM / Модели
- **Prisma** — основная БД (`User`, `Recipe`, `CustomIngredient`)

---

## API Эндпоинты (`src/app/api`)

| Метод | Путь | Описание |
| --- | --- | --- |
| GET | `/api/ingredients?type=standard\|custom\|all` | Получение ингредиентов по типу (стандартные/пользовательские/все) |
| POST | `/api/ingredients` | Создание пользовательского ингредиента с валидацией |
| GET | `/api/recipes` | Получение сохраненных рецептур пользователя |
| POST | `/api/recipes` | Сохранение/обновление текущей рецептуры холста |
| DELETE | `/api/recipes` | Удаление рецептуры по её ID |
| ALL | `/api/auth/[...nextauth]` | OAuth авторизация (NextAuth.js) |
| POST | `/api/checkout` | Stripe биллинг (создание сессии оплаты) |
| POST | `/api/webhook/stripe` | Обработка вебхуков от Stripe (обновление тарифов) |
| GET | `/api/admin/data` | Данные для панели администратора |

**Особенности API:**
- Валидация входных данных (плотности, цены, роли) в `src/lib/validation.ts`
- Проверка лимитов тарифов (Hobby vs Pro) в `src/lib/tariffLimits.ts`
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
| [`validation.ts`](../../src/lib/validation.ts) | Санитизация и валидация входящих данных для API |
| [`tariffLimits.ts`](../../src/lib/tariffLimits.ts) | Функция проверки лимитов Hobby тарифа (3 ингредиента, 1 рецептура) |
| [`auth.ts`](../../src/lib/auth.ts) | Конфигурация NextAuth / Auth.js |
| [`prisma.ts`](../../src/lib/prisma.ts) | Singleton Prisma Client для serverless |

---

## Деплой

### Текущая схема (MVP)

```text
Vercel
├── Frontend (Next.js)
└── Backend (Next.js API)

Neon PostgreSQL
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
