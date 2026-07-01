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
| GET | `/api/ingredients?type=standard\|custom\|all` | Список ингредиентов; стандартные включают `stabilityProfile` и `regulatoryInfo` |
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

### Ответ GET `/api/ingredients`
Стандартные ингредиенты возвращают физико-химические и регуляторные данные, полученные из связей 1:1 (`stabilityData` и `regulatoryData`), преобразованные в плоскую структуру:
- `stabilityProfile`:
  - `ph` (`number | null`): pH в 10% растворе
  - `hygroscopicity` (`number`): гигроскопичность от 0 до 100
  - `lightSensitive` (`boolean`): чувствительность к свету
  - `heatDegradation` (`number | null`): температура деградации в °C
- `regulatoryInfo`:
  - `pharmacopoeiaGrade` (`string | null`): стандарт качества (например, `"USP-NF"`, `"EP"`, `"BP"`, `"JP"`)
  - `allergenStatus` (`string | null`): аллерген-маркировка (`"Lactose"`, `"Gluten"`, `"Soy"`, или `null`)

---

## Prisma схема

```prisma
model User {
  id       String  @id @default(uuid())
  email    String  @unique
  tariff   String  @default("hobby") // hobby | professional
  recipes  Recipe[]
  sessions UserSession[]
}

model Ingredient {
  id                Int                   @id
  name              String
  role              String                // active | filler | lubricant | glidant | dry-binder
  stabilityScore    Float  @default(0)    // KB-скор стабильности (переименован из stability)
  benefit           Float  @default(0)
  risk              Float  @default(0)
  manufacturability Float  @default(0)
  // 1:1 relations
  stabilityData     IngredientStability?
  regulatoryData    IngredientRegulatory?
  // 1:N relations
  activeMolecules   ActiveMolecule[]
  effects           IngredientEffect[]
  contraindications IngredientContraindication[]
  synergiesA        Synergy[] @relation("SynergyA")
  synergiesB        Synergy[] @relation("SynergyB")
}

model IngredientStability {
  id              String     @id @default(uuid())
  ingredientId    Int        @unique
  ingredient      Ingredient @relation(fields: [ingredientId], references: [id], onDelete: Cascade)
  ph              Float?     // pH в 10% растворе
  hygroscopicity  Int        @default(0) // 0–100
  lightSensitive  Boolean    @default(false)
  heatDegradation Float?     // температура деградации °C
}

model IngredientRegulatory {
  id                 String     @id @default(uuid())
  ingredientId       Int        @unique
  ingredient         Ingredient @relation(fields: [ingredientId], references: [id], onDelete: Cascade)
  pharmacopoeiaGrade String?    // "USP-NF", "EP", "BP", "JP"
  allergenStatus     String?    // "Lactose", "Gluten", "Soy", null
}

model CustomIngredient {
  id     String @id @default(uuid())
  userId String
  // поля зашифрованы (AES-256 через src/lib/encryption.ts)
}

model Recipe {
  id      String @id @default(uuid())
  userId  String
  nodes   Json   @default("[]") // состояние нод холста
  connections Json @default("[]") // SVG-связи
}
```

---

## Бизнес-логика (`src/lib`)

| Файл | Описание |
| --- | --- |
| [`calculator.ts`](../../src/lib/calculator.ts) | Физико-химические расчеты: сыпучесть, пористость, таблетирование, партии |
| | + `validateProcessCompatibility()` — валидация техпроцесса по stability profile |
| | + `calculateFormulaScore()` — взвешенный скор формулы (benefit/stability/risk) |
| | + `getPackagingRecommendations()` — детерминированные рекомендации по упаковке |
| [`chemicalRules.ts`](../../src/lib/chemicalRules.ts) | 35 химических классов + правила совместимости |
| [`validation.ts`](../../src/lib/validation.ts) | Санитизация и валидация входящих данных для API |
| [`tariffLimits.ts`](../../src/lib/tariffLimits.ts) | Функция проверки лимитов Hobby тарифа (3 ингредиента, 1 рецептура) |
| [`auth.ts`](../../src/lib/auth.ts) | Конфигурация NextAuth / Auth.js |
| [`prisma.ts`](../../src/lib/prisma.ts) | Singleton Prisma Client для serverless |
| [`encryption.ts`](../../src/lib/encryption.ts) | AES-256 шифрование пользовательских данных |
| [`auditLogger.ts`](../../src/lib/auditLogger.ts) | Запись событий в `AuditLog` (compliance) |

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
