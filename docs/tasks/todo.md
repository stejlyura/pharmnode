# PharmNode — Задачи по бэкенду и интеграции фронт ↔ бэк

> Цель: привести бэкенд в соответствие с `docs/architecture/backend.md` (MVP-уровень, без BullMQ/NestJS/Redis), убрать legacy-код, связать фронтенд с API.

---

## Блок 0 — Очистка legacy-кода

- [x] **0.1** Удалить файл `src/lib/mongodb.ts` — Mongoose-подключение не используется, всё на Prisma
- [x] **0.2** Удалить папку `src/models/` целиком (`User.ts`, `Recipe.ts`, `CustomIngredient.ts`) — это Mongoose-схемы, архивные, не используются
- [x] **0.3** Удалить зависимость `mongoose` из `package.json` и выполнить `npm install`
- [x] **0.4** Проверить grep'ом что ни один файл в `src/` не импортирует из `src/models/` или `src/lib/mongodb.ts`. Если есть — убрать импорты

---

## Блок 1 — Prisma-схема: привести к backend.md

- [x] **1.1** Сверить `prisma/schema.prisma` с документом `backend.md`. Убедиться что модели `User`, `Recipe`, `CustomIngredient`, `Ingredient` соответствуют описанной архитектуре. На данный момент схема уже в порядке — зафиксировать это и перейти дальше
- [x] **1.2** Убедиться что `prisma/seed.ts` корректно сидирует все 26 базовых ингредиентов из `baseIngredientsMatrix` в таблицу `Ingredient`. Сейчас сид есть и работает — проверить что он запускается без ошибок (`npm run seed`)

---

## Блок 2 — API Route Handlers: полный набор из backend.md

Текущее состояние API: существуют все 5 эндпоинтов из документа. Задача — ревью и доведение каждого до production-ready.

### 2.1 — `GET /api/ingredients` (стандартные + кастомные)

- [x] **2.1.1** Сейчас `GET /api/ingredients` возвращает ТОЛЬКО `CustomIngredient` текущего пользователя. Нужно добавить: если запрос без авторизации или с query-параметром `?type=standard` — возвращать список из таблицы `Ingredient` (стандартные 26 ингредиентов из БД). Это позволит фронтенду загружать ингредиенты из БД, а не из хардкоженного массива в `pharm.ts`
- [x] **2.1.2** Добавить query-параметр `?type=custom` для получения только кастомных ингредиентов авторизованного пользователя (текущее поведение)
- [x] **2.1.3** Добавить query-параметр `?type=all` — возвращает стандартные + кастомные ингредиенты пользователя (merged)

### 2.2 — `POST /api/ingredients` (создание кастомного)

- [x] **2.2.1** Ревью текущей реализации: валидация и санитизация уже есть. Убедиться что тип `role` валидируется из списка `['active', 'filler', 'lubricant', 'glidant', 'dry-binder']`
- [x] **2.2.2** Добавить проверку тарифных лимитов: пользователь с тарифом `hobby` может иметь максимум 3 кастомных ингредиента. `professional` — без ограничений. Проверку делать в Route Handler, не в UI

### 2.3 — `POST /api/recipes` (сохранение рецептуры)

- [x] **2.3.1** Добавить `GET /api/recipes` — загрузка рецептур пользователя. Сейчас есть только `POST`, но фронтенд не может восстановить состояние холста при перезагрузке страницы
- [x] **2.3.2** Добавить эндпоинт `DELETE /api/recipes?id=xxx` для удаления рецептуры
- [x] **2.3.3** Добавить валидацию: имя рецептуры не пустое, массивы `nodes` и `connections` — это JSON-массивы

### 2.4 — `ALL /api/auth/[...nextauth]` (авторизация)

- [x] **2.4.1** Ревью `src/lib/auth.ts`: убрать все `as any` кастинги. Расширить типы сессии NextAuth в `src/types/pharm.ts` или `src/types/next-auth.d.ts` — добавить `id` и `tariff` в интерфейс `Session.user`
- [x] **2.4.2** Убедиться что mock-провайдеры для локальной разработки работают (уже реализовано в `AuthContext.tsx`)

### 2.5 — `POST /api/checkout` (Stripe биллинг)

- [x] **2.5.1** Ревью: текущий код работает. Убедиться что при mock-режиме (без `STRIPE_SECRET_KEY`) тариф обновляется в БД через Prisma
- [x] **2.5.2** Добавить Stripe Webhook handler: `POST /api/webhook/stripe` для обработки событий `checkout.session.completed` → обновление тарифа пользователя в БД

### 2.6 — `GET /api/admin/data` (админ-панель)

- [x] **2.6.1** Убрать хардкоженные mock-данные из route handler. Если БД недоступна — возвращать пустые массивы с флагом `databaseOnline: false`, а не фейковых пользователей
- [x] **2.6.2** Добавить пагинацию: query-параметры `?page=1&limit=20`

---

## Блок 3 — Миграция фронтенда: с хардкода на API

Ключевая проблема: фронтенд использует `baseIngredientsMatrix` из `src/types/pharm.ts` (хардкоженный массив из 26 ингредиентов) вместо загрузки данных из БД через API.

### 3.1 — Создать хук `useIngredients`

- [x] **3.1.1** Создать файл `src/hooks/useIngredients.ts`. Хук должен:
  - При маунте делать `fetch('/api/ingredients?type=standard')` для загрузки стандартных ингредиентов
  - Если пользователь авторизован — загружать кастомные через `fetch('/api/ingredients?type=custom')`
  - Объединять стандартные + кастомные и возвращать
  - Кешировать в state, не загружать повторно при каждом ре-рендере
  - Экспортировать `{ ingredients, customIngredients, isLoading, error, refetch }`
- [x] **3.1.2** Предусмотреть fallback: если API недоступен — использовать `baseIngredientsMatrix` из `pharm.ts` как fallback (для работы оффлайн/без БД)

### 3.2 — Создать хук `useRecipes`

- [x] **3.2.1** Создать файл `src/hooks/useRecipes.ts`. Хук должен:
  - Загружать рецептуры пользователя через `GET /api/recipes`
  - Сохранять рецептуры через `POST /api/recipes`
  - Удалять через `DELETE /api/recipes`
  - Экспортировать `{ recipes, saveRecipe, deleteRecipe, loadRecipe, isLoading }`

### 3.3 — Подключить хуки к компонентам

- [x] **3.3.1** `Canvas.tsx`: заменить прямой импорт `baseIngredientsMatrix` на использование хука `useIngredients`. Убрать хардкоженное обращение к массиву, использовать данные из хука
- [x] **3.3.2** `Sidebar.tsx`: аналогично — заменить `baseIngredientsMatrix` на данные из `useIngredients`
- [x] **3.3.3** `NodeCard.tsx`: аналогично — получать `allIngredients` из пропсов или контекста, не из хардкода
- [x] **3.3.4** `MobileNodeCard.tsx`: аналогично
- [x] **3.3.5** `MobileIngredientSheet.tsx`: аналогично
- [x] **3.3.6** `CompatibilityMatrix.tsx`: заменить `baseIngredientsMatrix` на данные из хука
- [x] **3.3.7** `useNodeEditor.ts`: заменить `baseIngredientsMatrix` на данные переданные через параметр
- [x] **3.3.8** `pdfGenerator.ts`: принимать ингредиенты как аргумент функции, не импортировать `baseIngredientsMatrix`

### 3.4 — Загрузка/восстановление состояния холста

- [x] **3.4.1** При авторизации пользователя — автоматически загружать последнюю рецептуру с сервера (`GET /api/recipes`) и восстанавливать состояние нод на Canvas
- [x] **3.4.2** Автосохранение: при изменении нод на холсте — debounced `POST /api/recipes` (каждые 5 секунд или при значительном изменении)
- [x] **3.4.3** Для неавторизованных пользователей — сохранять состояние в `localStorage` (текущее поведение)

---

## Блок 4 — Типизация: убрать `any`

- [x] **4.1** Создать файл `src/types/next-auth.d.ts` — расширить типы NextAuth: добавить `id: string` и `tariff: string` в `Session['user']`
- [x] **4.2** В `src/app/api/ingredients/route.ts` — убрать `(session.user as any).id`, использовать расширенный тип
- [x] **4.3** В `src/app/api/recipes/route.ts` — убрать `(session.user as any).id`
- [x] **4.4** В `src/lib/auth.ts` — убрать `(session as any).user.id` и `(session as any).user.tariff`
- [x] **4.5** В `src/context/AuthContext.tsx` — убрать `(session.user as any).id` и `(session.user as any).tariff`

---

## Блок 5 — Валидация и безопасность API

- [x] **5.1** Создать утилиту `src/lib/validation.ts` — общие функции валидации: `sanitizeString(str)`, `validateRole(role)`, `validateDensity(value)`, `validatePercentage(value)`
- [x] **5.2** Применить утилиты валидации в `POST /api/ingredients` и `POST /api/recipes` — убрать дублирование кода валидации
- [x] **5.3** Создать утилиту `src/lib/tariffLimits.ts` — функция `checkTariffLimit(userId, tariff, resource)` для проверки лимитов тарифа. Логика: `hobby` → max 3 ингредиента, max 1 рецептура; `professional` → без лимитов

---

## Блок 6 — Обновить документацию backend.md

- [x] **6.1** Убрать из `backend.md` секцию «Фоновые задачи — BullMQ» — это не MVP, добавлять только при масштабировании
- [x] **6.2** Убрать из `backend.md` секцию «Система кэширования (Redis)» — Redis/Upstash не используется в MVP
- [x] **6.3** Убрать из `backend.md` секцию «Архитектура при масштабировании» (NestJS + BullMQ Workers) — оставить как отдельный файл `docs/architecture/scaling-roadmap.md` при необходимости
- [x] **6.4** Обновить таблицу API эндпоинтов: добавить `GET /api/recipes`, `DELETE /api/recipes`, `GET /api/ingredients?type=standard|custom|all`, `POST /api/webhook/stripe`
- [x] **6.5** Убрать из `backend.md` упоминание Mongoose: `src/models/CustomIngredient.ts — историческая, не используется` — эта папка будет удалена (Блок 0)

---

## Блок 7 — Проверка работоспособности

- [x] **7.1** Запустить `npx prisma generate` — убедиться что Prisma Client генерируется без ошибок
- [x] **7.2** Запустить `npx prisma db push` или миграцию — убедиться что схема применяется к PostgreSQL
- [x] **7.3** Запустить `npm run seed` — убедиться что сид проходит
- [x] **7.4** Запустить `npm run build` — убедиться что проект билдится без ошибок после всех изменений
- [x] **7.5** Запустить `npm run dev` — проверить что все страницы загружаются, API отвечает, авторизация работает
- [x] **7.6** Проверить сценарий: авторизация → добавление ноды на холст → автосохранение → перезагрузка → восстановление состояния

---

## Порядок выполнения

```
Блок 0 (очистка) → Блок 4 (типы) → Блок 1 (Prisma) → Блок 5 (валидация) 
→ Блок 2 (API routes) → Блок 3 (фронт-интеграция) → Блок 6 (docs) → Блок 7 (проверка)
```

---

## Файлы которые будут затронуты

| Действие | Файл |
| --- | --- |
| УДАЛИТЬ | `src/lib/mongodb.ts` |
| УДАЛИТЬ | `src/models/User.ts` |
| УДАЛИТЬ | `src/models/Recipe.ts` |
| УДАЛИТЬ | `src/models/CustomIngredient.ts` |
| СОЗДАТЬ | `src/types/next-auth.d.ts` |
| СОЗДАТЬ | `src/hooks/useIngredients.ts` |
| СОЗДАТЬ | `src/hooks/useRecipes.ts` |
| СОЗДАТЬ | `src/lib/validation.ts` |
| СОЗДАТЬ | `src/lib/tariffLimits.ts` |
| СОЗДАТЬ | `src/app/api/webhook/stripe/route.ts` |
| ИЗМЕНИТЬ | `src/app/api/ingredients/route.ts` |
| ИЗМЕНИТЬ | `src/app/api/recipes/route.ts` |
| ИЗМЕНИТЬ | `src/app/api/admin/data/route.ts` |
| ИЗМЕНИТЬ | `src/app/api/checkout/route.ts` |
| ИЗМЕНИТЬ | `src/lib/auth.ts` |
| ИЗМЕНИТЬ | `src/context/AuthContext.tsx` |
| ИЗМЕНИТЬ | `src/components/Canvas.tsx` |
| ИЗМЕНИТЬ | `src/components/Sidebar.tsx` |
| ИЗМЕНИТЬ | `src/components/NodeCard.tsx` |
| ИЗМЕНИТЬ | `src/components/MobileNodeCard.tsx` |
| ИЗМЕНИТЬ | `src/components/MobileIngredientSheet.tsx` |
| ИЗМЕНИТЬ | `src/components/CompatibilityMatrix.tsx` |
| ИЗМЕНИТЬ | `src/hooks/useNodeEditor.ts` |
| ИЗМЕНИТЬ | `src/lib/pdfGenerator.ts` |
| ИЗМЕНИТЬ | `package.json` |
| ИЗМЕНИТЬ | `docs/architecture/backend.md` |

---

## Блок 8 — Базовое конструирование препаратов (Уровень 1)

> **Контекст для ИИ (Flash Model):** Реализовать поддержку создания многокомпонентных составов первого уровня согласно `product-evolution.md`. Необходимо добавить поля, описывающие происхождение и форму: источник вещества, степень разведения/концентрации, форма выпуска, область применения, технология производства. Работать строго по существующей архитектуре.

- [x] **8.1 Обновление схемы БД (Prisma)**
  - Открой `prisma/schema.prisma`.
  - Добавь в модель `Ingredient` и `RecipeNode` (или как JSON-поле дополнительных параметров) новые свойства: `source` (String?), `dilutionScale` (String?), `dosageForm` (String?), `applicationArea` (String?), `processingTech` (String?).
  - Напиши команду для создания миграции.
- [x] **8.2 Расширение базовых типов (TypeScript)**
  - Открой `src/types/pharm.ts`.
  - Обнови интерфейс `BaseIngredient` (или создай расширяющий интерфейс `ComplexIngredient extends BaseIngredient`). Добавь поля: `source`, `dilutionScale`, `dosageForm`, `applicationArea`, `processingTech`.
- [x] **8.3 Обновление валидации и API**
  - Открой `src/lib/validation.ts`, добавь валидаторы для новых полей (например, `validateDilutionScale`).
  - Открой `src/app/api/ingredients/route.ts` и `src/app/api/recipes/route.ts`, обнови логику создания/обновления, чтобы новые поля корректно сохранялись в БД.
- [x] **8.4 Обновление UI: Карточки на холсте**
  - Открой `src/components/NodeCard.tsx` и `src/components/MobileNodeCard.tsx`.
  - Добавь условный рендеринг: если у ингредиента задано разведение/концентрация (`dilutionScale`), показывай бейджи с этими данными и источником, скрывая поля, которые не применимы к данному типу сырья.
- [x] **8.5 Обновление UI: Боковая панель и формы**
  - Открой `src/components/Sidebar.tsx` и формы редактирования.
  - Добавь поля ввода (select/input) для новых параметров при создании кастомного компонента рецептуры (источник, разведение, форма выпуска).
- [x] **8.6 Логика расчетов (Калькулятор)**
  - Открой `src/lib/calculator.ts`.
  - Добавь обработку компонентов с нестандартной концентрацией: они могут не участвовать в классическом расчете массы или объема напрямую. Реализуй функцию-заглушку или специфичный расчет для `calculateComplexComponent()`.
