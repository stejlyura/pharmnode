# 🔬 PharmNode — Аудит проекта и рекомендации по улучшению

> Анализ по состоянию на 26.06.2026. MVP завершён, все задачи из [todo.md](file:///Users/dev/projects/pharmnode/docs/tasks/todo.md) отмечены как `[x]`.

---

## 📊 Общая оценка

| Категория | Оценка | Комментарий |
| --- | --- | --- |
| Функциональность | ⭐⭐⭐⭐ | MVP полный, расчёты, совместимость, PDF, подписки |
| Безопасность | ⭐⭐⭐⭐ | Аудит пройден, bcrypt, Redis rate limit, 2FA, HSTS |
| Архитектура | ⭐⭐⭐ | Монолитные компоненты, нет чёткого разделения слоёв |
| Тестовое покрытие | ⭐⭐⭐ | Backend покрыт (75 тестов), frontend — 0 тестов |
| Code Quality | ⭐⭐⭐ | 6 TS errors, 58 lint warnings, giant components |
| DX/Maintainability | ⭐⭐⭐ | Хорошая документация, но сложно работать с 1800+ строк компонентами |
| Performance | ⭐⭐⭐ | Нет lazy loading, нет code splitting, нет мемоизации |
| UX/Accessibility | ⭐⭐ | Нет a11y, нет скелетонов, нет onboarding |

---

## 🔴 CRITICAL — Исправить сейчас

### 1. Гигантские компоненты — архитектурный долг

Файлы-монстры, которые невозможно нормально поддерживать:

| Файл | Строк | Проблема |
| --- | --- | --- |
| [Canvas.tsx](file:///Users/dev/projects/pharmnode/src/components/Canvas.tsx) | **1857** | Один файл = весь конфигуратор |
| [NodeCard.tsx](file:///Users/dev/projects/pharmnode/src/components/NodeCard.tsx) | **1166** | Все типы нод в одном компоненте |
| [MobileNodeCard.tsx](file:///Users/dev/projects/pharmnode/src/components/MobileNodeCard.tsx) | **820** | Дублирование десктопной карточки |
| [SettingsForm.tsx](file:///Users/dev/projects/pharmnode/src/components/SettingsForm.tsx) | **697** | Монолитная форма |
| [page.tsx (Landing)](file:///Users/dev/projects/pharmnode/src/app/page.tsx) | **647** | Лендинг с inline-словарями |

> [!CAUTION]
> `Canvas.tsx` (1857 строк) — один из самых больших React-компонентов, с которыми мне приходилось работать. Модальные окна, формы, drag-and-drop, аутентификация, тарифы — всё в одном файле. Это критический блокер для любых будущих фич.

**Рекомендация**: Декомпозировать на:
- `Canvas.tsx` → `CanvasToolbar`, `CanvasArea`, `AddIngredientModal`, `AuthModal`, `CanvasContextMenu`
- `NodeCard.tsx` → `IngredientNode`, `BlendingNode`, `PressNode`, `OutputNode` (strategy pattern)
- `MobileNodeCard.tsx` → переиспользовать десктоп-карточки с responsive props вместо дублирования

---

### 2. ESLint errors — `any` в тестах

```
6 errors в src/lib/auth-2fa.test.ts — @typescript-eslint/no-explicit-any
```

Правило `no-explicit-any` стоит на `error`, но в тестах используется `any`. Это нарушает принятое правило проекта.

---

### 3. TS error в тесте

```
src/app/api/admin/data/route.test.ts(158) — Cannot assign to 'NODE_ENV' because it is a read-only property
```

Сломанный typecheck — нельзя деплоить с confidence.

---

## 🟠 HIGH — Рекомендуется к следующему релизу

### 4. Нулевое тестовое покрытие фронтенда

Все 75 тестов — бэкенд (`lib/`, `api/`). Ни одного теста на React-компоненты:
- Нет тестов на `Canvas`, `NodeCard`, `Sidebar`, `CompatibilityMatrix`
- Нет тестов на хуки (`useNodeEditor`, `useIngredients`, `useRecipes`)
- Нет integration-тестов user flow (добавить ингредиент → увидеть расчёты)

**Рекомендация**: Добавить `@testing-library/react` + `vitest` для:
- Unit-тесты хуков: `useNodeEditor` (add/remove/undo/redo)
- Smoke-тесты компонентов: рендеринг без краша
- E2E тесты: Playwright для критических user flow

---

### 5. Hardcoded `baseIngredientsMatrix` в [pharm.ts](file:///Users/dev/projects/pharmnode/src/types/pharm.ts)

680-строчный файл типов содержит **26 hardcoded ингредиентов** (строки 53–575). Это статические данные, которые:
- Дублируют то, что хранится в БД (`Ingredient` модель)
- Загрязняют файл типов данными
- Создают проблемы синхронизации — при изменении в БД файл не обновляется

**Рекомендация**: Вынести в `src/data/baseIngredients.ts` или `prisma/seed.ts`. В `pharm.ts` оставить только интерфейсы.

---

### 6. Отсутствие Error Boundaries

- Есть [error.tsx](file:///Users/dev/projects/pharmnode/src/app/error.tsx) (App Router level), но **нет granular Error Boundaries** для:
  - Canvas (если рендеринг SVG сломается — упадёт весь конфигуратор)
  - PDF-генерация
  - Compatibility Matrix
  
**Рекомендация**: Обернуть `Canvas`, `CompatibilityMatrix`, `WizardModal` в отдельные Error Boundaries.

---

### 7. Нет loading states / скелетонов

- Страницы грузятся "внезапно" — белый экран → контент
- Нет `loading.tsx` для App Router маршрутов
- Нет skeleton-компонентов для canvas, sidebar, ingredient list

---

### 8. i18n реализация — inline dictionaries

В [page.tsx](file:///Users/dev/projects/pharmnode/src/app/page.tsx) (лендинг) переводы захардкожены прямо в компоненте:
```typescript
const translations = {
  "en-US": { nav_features: "Features", ... },
  "ru-RU": { nav_features: "Возможности", ... }
};
```

А в остальных компонентах используется `useTranslation()` из [I18nContext](file:///Users/dev/projects/pharmnode/src/context/I18nContext.tsx). **Два разных подхода к i18n** в одном проекте.

**Рекомендация**: Консолидировать все переводы в `src/i18n/`, использовать единый подход (`next-intl` или собственный `I18nContext`).

---

## 🟡 MEDIUM — Улучшения качества

### 9. Performance

- **Нет `React.memo()`** на `NodeCard`, `Sidebar` — при каждом перетаскивании ноды перерендериваются все карточки
- **Нет `useMemo`/`useCallback`** для обработчиков в `Canvas.tsx` — каждый ре-рендер создаёт десятки замыканий
- **Нет `dynamic()` импортов** для тяжёлых модулей:
  - `jspdf` (~300kb) грузится всегда, хотя PDF генерируют ~5% пользователей
  - `driver.js` (~50kb) грузится в Canvas, хотя onboarding показывается один раз
  - `CompatibilityMatrix` (~280 строк + heatmap) грузится даже если не открыта

**Рекомендация**:
```typescript
const PdfGenerator = dynamic(() => import('./PdfGenerator'), { ssr: false });
const CompatibilityMatrix = dynamic(() => import('./CompatibilityMatrix'));
```

---

### 10. Accessibility (a11y) — практически отсутствует

- Нет `aria-*` атрибутов на canvas элементах
- Нет keyboard navigation для нод
- Нет `role` атрибутов на интерактивных элементах
- Нет `focus-visible` стилей
- Canvas на основе div'ов не читается screen-reader'ами

Для B2B SaaS в фарме — это может быть блокером для enterprise клиентов (compliance).

---

### 11. Duplирование `NodeCard` и `MobileNodeCard`

820 строк [MobileNodeCard.tsx](file:///Users/dev/projects/pharmnode/src/components/MobileNodeCard.tsx) — это copy-paste десктопной карточки с адаптацией стилей.

**Рекомендация**: Один компонент `NodeCard` с responsive design (CSS media queries или `useIsMobile()` prop) вместо двух файлов.

---

### 12. lint warnings (58)

Основные паттерны:
- `react-hooks/exhaustive-deps` — пропущенные зависимости в `useEffect` (потенциальные баги)
- `no-unused-vars` — мёртвый код в WizardModal, calculator, encryption
- Эти warnings копятся и маскируют реальные проблемы

---

## 🔵 LOW — Приятные улучшения

### 13. State Management

Текущая архитектура: `useState` + `useCallback` + `useEffect` + Context. При масштабировании (Уровни 2-5 по дорожной карте) это станет неуправляемым.

**Рекомендация**: Рассмотреть `zustand` для canvas state — меньше re-renders, devtools, persist middleware.

---

### 14. API Route Handlers — отсутствие общего паттерна

Каждый route handler самостоятельно:
- Парсит body
- Проверяет сессию
- Обрабатывает ошибки
- Логирует

**Рекомендация**: Создать `apiHandler()` wrapper:
```typescript
export const POST = apiHandler({
  auth: 'required',
  rateLimit: { window: '15m', max: 10 },
  schema: createRecipeSchema,
  handler: async (req, { user, body }) => { ... }
});
```

---

### 15. Нет CI/CD pipeline

- Нет `.github/workflows/` файлов (пустая директория `.github/`)
- Нет автоматического запуска `typecheck`, `lint`, `test` на PR
- Нет automated deploys

**Рекомендация**: GitHub Actions с:
```yaml
- npm run typecheck
- npm run lint -- --max-warnings 0
- npm run test
- npm run build
```

---

### 16. Sentry example page в продакшене

Директория [sentry-example-page](file:///Users/dev/projects/pharmnode/src/app/sentry-example-page) и [sentry-example-api](file:///Users/dev/projects/pharmnode/src/app/api/sentry-example-api) — демо-страницы Sentry, которые не нужны в production.

---

### 17. `Ptomotion.html` в корне проекта

Файл [Ptomotion.html](file:///Users/dev/projects/pharmnode/Ptomotion.html) (24kb) — вероятно промо-страница с опечаткой в имени. Лежит в корне, не в `public/`.

---

### 18. Database indexes отсутствуют

В [schema.prisma](file:///Users/dev/projects/pharmnode/prisma/schema.prisma):
- `AuditLog.userId` — нет индекса (будет slow query при фильтрации логов пользователя)
- `AuditLog.createdAt` — нет индекса (slow ORDER BY при пагинации)
- `Recipe.userId` — нет индекса
- `UserSession.userId` — нет индекса

**Рекомендация**: Добавить `@@index([userId])` на `AuditLog`, `Recipe`, `UserSession`.

---

## 📋 Предлагаемый план действий (по приоритету)

| # | Задача | Сложность | Импакт |
| --- | --- | --- | --- |
| 1 | Исправить 6 TS errors + 1 typecheck error | 🟢 Low | Unblocks CI |
| 2 | Вычистить 58 lint warnings | 🟢 Low | Code quality |
| 3 | Добавить DB indexes | 🟢 Low | Performance |
| 4 | Удалить sentry-example, Ptomotion.html | 🟢 Low | Cleanup |
| 5 | Декомпозировать `Canvas.tsx` | 🔴 High | Maintainability |
| 6 | Декомпозировать `NodeCard.tsx` → strategy | 🟠 Medium | Maintainability |
| 7 | Объединить `NodeCard` + `MobileNodeCard` | 🟠 Medium | -820 строк кода |
| 8 | Вынести `baseIngredientsMatrix` из types | 🟢 Low | Architecture |
| 9 | Добавить dynamic imports (jspdf, driver.js) | 🟢 Low | Performance |
| 10 | Добавить React.memo на NodeCard, Sidebar | 🟢 Low | Performance |
| 11 | Frontend-тесты (hooks + smoke) | 🟠 Medium | Reliability |
| 12 | Error Boundaries для Canvas, Matrix | 🟢 Low | UX |
| 13 | CI/CD pipeline (GitHub Actions) | 🟢 Low | DX |
| 14 | Loading states / skeletons | 🟠 Medium | UX |
| 15 | Унификация i18n | 🟠 Medium | Maintainability |
| 16 | API handler wrapper | 🟠 Medium | DX |
| 17 | Accessibility audit | 🔴 High | Compliance |
| 18 | State management (zustand) | 🔴 High | Scalability |

---

> [!TIP]
> Все задачи из текущего `todo.md` отмечены как завершённые ✅. Проект в хорошем состоянии для MVP. Перечисленные улучшения — это **переход от MVP к production-grade продукту**, подготовка к масштабированию на Уровни 2-5 из дорожной карты.

Хотите, чтобы я начал работу по какому-то из пунктов? Или сформировал это как новый блок задач в `todo.md`?
