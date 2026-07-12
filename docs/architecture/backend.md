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


---

## Мониторинг и Логирование (Logging & Monitoring)

This document details the telemetry, error interception, and performance monitoring setup for the **PharmNode** B2B SaaS platform.

---

## 1. Structured Logging Schema

PharmNode utilizes structured JSON logging via the helper in [logger.ts](file:///Users/dev/projects/pharmnode/src/lib/logger.ts). This ensures logs generated in both Server Components, Server Actions, Route Handlers, and client-side error boundaries follow a uniform schema that can be easily parsed by logging agents (e.g., Datadog, AWS CloudWatch, Logtail, Vercel Log Streams).

### Log Payload Format
Every printed log outputs a single-line JSON string conforming to the following type:
```typescript
interface LogPayload {
  level: "info" | "warn" | "error"; // Log severity
  timestamp: string;                // ISO 8601 UTC timestamp
  message: string;                  // Human-readable message
  action?: string;                  // Module/context identifier (e.g., "webhook_lemon")
  context?: Record<string, any>;    // Custom metadata payload
  error?: {                         // Captured exception details (only for level = "error")
    name: string;
    message: string;
    stack?: string;
    digest?: string;
  };
}
```

---

## 2. Integrated Points

### 1. Lemon Squeezy Webhooks
In [route.ts](file:///Users/dev/projects/pharmnode/src/app/api/webhooks/lemon/route.ts), structured logging is instrumented across all stages:
- **`info`**: Incoming payloads, event ID mapping, database record modifications.
- **`warn`**: Missing signatures, HMAC SHA-256 validation failures, or missing database user mappings.
- **`error`**: Processing exceptions or SQL constraint violations are caught, formatted with stack traces, and logged.

### 2. Global React Boundary
In [error.tsx](file:///Users/dev/projects/pharmnode/src/app/error.tsx), unhandled React renderer thread crashes are captured in `useEffect` and dispatched to the logger:
```typescript
logger.error("Unhandled runtime error captured by root boundary", error, "react_error_boundary");
```

---

## 3. Sentry Production Integration

To link PharmNode to Sentry for automated anomaly alerts, performance tracing, and source map resolution, execute the following steps:

### 1. Run the Setup Wizard
Run the official Sentry initialization tool inside the project root:
```bash
npx @sentry/wizard -i nextjs
```
The wizard will automatically:
1. Install `@sentry/nextjs`.
2. Generate setup configuration files:
   - `sentry.client.config.ts` (Client-side tracing)
   - `sentry.server.config.ts` (Route handlers, Server actions)
   - `sentry.edge.config.ts` (Next.js middleware/proxy)
3. Modify `next.config.js` to automatically upload source maps to Sentry on production builds.
4. Add `.sentryclirc` containing Sentry authentication parameters.

### 2. Configure Environment Variables
Add the Sentry DSN key to your production environment (e.g. on Vercel):
```bash
SENTRY_DSN="https://your-public-key@o0.ingest.sentry.io/your-project-id"
NEXT_PUBLIC_SENTRY_DSN="https://your-public-key@o0.ingest.sentry.io/your-project-id"
```

### 3. Uncomment Sentry Hooks
Once `@sentry/nextjs` is installed, uncomment the Sentry capture hooks in [logger.ts](file:///Users/dev/projects/pharmnode/src/lib/logger.ts#L43-L54):
```typescript
if (process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN) {
  try {
    const Sentry = require("@sentry/nextjs");
    Sentry.captureException(payload.error || new Error(payload.message), {
      tags: { action: payload.action },
      extra: payload.context,
    });
  } catch (e) {
    // Sentry load warning
  }
}
```

---

## 4. Production Log Collection

In cloud platforms like **Vercel** or **AWS Amplify**:
- Anything written via `console.log`, `console.warn`, or `console.error` is captured as stdout/stderr streams.
- Since our logs are stringified JSON payloads, logs in the dashboard will be readable as structured fields.
- You can create log-drain rules to route these JSON streams directly to external APMs (Datadog, Grafana, Logtail) for custom dashboard visualization.


---

## Архитектура Безопасности (Security)

This guide details the security configurations, algorithms, and infrastructure protections deployed in **PharmNode** to protect the B2B SaaS platform from brute-force authentication attempts, automated content scraping, and Distributed Denial of Service (DDoS) attacks.

---

## 1. Rate Limiting Strategy

To prevent brute-force attacks and resource consumption on critical endpoints, PharmNode applies sliding-window rate limiting.

### Code-Level Implementation

PharmNode uses a localized in-memory rate limiter at `src/lib/rateLimit.ts` that tracks request counts using client IPs extracted via `x-forwarded-for` and `x-real-ip` headers:

- **Password Reset Request Action**: Restricted to **5 requests per 15 minutes** per IP address.
- **Credentials Authorization Action**: Restricted to **10 authorization attempts per 15 minutes** per IP address.

### Upgrading to Redis / Upstash (Clustered Environments)

When deploying multiple serverless containers (e.g., on Vercel or Kubernetes nodes), in-memory counters should be replaced by a centralized database like **Redis** (e.g., Upstash Redis) to maintain global consistency.

To upgrade, update `src/lib/rateLimit.ts` to utilize the Upstash `@upstash/redis` SDK:

```typescript
import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

export async function rateLimit(actionKey: string, options: RateLimitOptions) {
  const ip = await getClientIp();
  const key = `ratelimit:${ip}:${actionKey}`;
  
  const currentCount = await redis.incr(key);
  if (currentCount === 1) {
    await redis.expire(key, options.windowMs / 1000);
  }
  
  const success = currentCount <= options.limit;
  return {
    success,
    limit: options.limit,
    remaining: Math.max(0, options.limit - currentCount),
    reset: Date.now() + (await redis.ttl(key)) * 1000,
  };
}
```

---

## 2. Bot & Spam Protection (CAPTCHA)

To completely mitigate automated profile registrations and password reset spam, we recommend integrating **Cloudflare Turnstile** or **Google reCAPTCHA v3**.

### Turnstile Integration Steps

1. **Obtain API Keys**: Register the domain in the Cloudflare Dashboard to get a **Sitekey** and a **Secret Key**.
2. **Add Environment Variables**:
   ```bash
   NEXT_PUBLIC_TURNSTILE_SITEKEY="your-site-key-here"
   TURNSTILE_SECRET_KEY="your-secret-key-here"
   ```
3. **Install Client Library**:
   ```bash
   npm install @marsidev/react-turnstile
   ```
4. **Embed Widget in Client Component**:
   ```tsx
   import { Turnstile } from '@marsidev/react-turnstile';
   
   // In login/password reset form
   <Turnstile 
     siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITEKEY} 
     onSuccess={(token) => setCaptchaToken(token)} 
   />
   ```
5. **Verify Token in Server Action**:
   ```typescript
   const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
     method: "POST",
     headers: { "Content-Type": "application/x-www-form-urlencoded" },
     body: `secret=${process.env.TURNSTILE_SECRET_KEY}&response=${captchaToken}`,
   });
   const outcome = await response.json();
   if (!outcome.success) {
     return { success: false, error: "CAPTCHA validation failed." };
   }
   ```

---

## 3. Infrastructure-Level DDoS & Scraping Protection (Cloudflare WAF)

For high-availability and WAF (Web Application Firewall) compliance, PharmNode should be placed behind a Cloudflare proxy.

### Cloudflare Setup Checklist

1. **DNS & Proxying**:
   - Point your domain's NS records to Cloudflare.
   - Ensure the proxy status is **Orange Cloud (Proxied)** for all core web routes.
2. **WAF Custom Rules**:
   - **Rate Limiting Rules**: Set up a Cloudflare WAF rate limiting rule on paths matching `/api/*` and `/login` (e.g., block requests exceeding 60 requests per minute from a single IP).
   - **Bot Management**: Enable **Bot Fight Mode** to block automated scrapers trying to index the pharmaceutical knowledge base.
   - **Scrape Shield**: Enable Cloudflare Scrape Shield to obfuscate emails and prevent search spiders from harvesting ingredients databases.
3. **DDoS Resiliency**:
   - Configure **HTTP DDoS Protection Rules** to automatically challenge (JS challenge or CAPTCHA) suspicious spikes in traffic.
   - Keep **Under Attack Mode** disabled by default, and activate it manually via API or dashboard during an active, high-volume layer 7 flood.

---
⬅️ [Вернуться к индексу документации](../index.md)
