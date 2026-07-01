---
name: pharmnode-e2e
description: |
  Guides implementation of E2E testing in PharmNode using Playwright.
  Use when writing or modifying E2E tests in tests/e2e/ or configuring Playwright.
  Also triggers when user mentions: "E2E", "Playwright", "тест критических путей", "интеграционный тест".
---

# PharmNode E2E Testing Skill

This skill documents guidelines and best practices for writing End-to-End (E2E) tests in PharmNode using Playwright.

## Архитектура E2E Тестов

E2E тесты покрывают критические сценарии использования приложения:
1. **Регистрация пользователя** и автоматический вход.
2. **Верификация email** через локальный Dev-Bypass.
3. **Создание рецептур** на Dashboard `/projects`.
4. **Визуальный редактор (Canvas)**: изменение параметров нод и автоматическое сохранение (Autosave) в БД.
5. **Интеграция Paddle Billing**: эмуляция успешной оплаты через клиентский эвент и вызов локального Webhook-симулятора для обновления тарифа.

---

## 🛠️ Настройка Playwright

Все тесты размещаются в каталоге `tests/e2e/`. Конфигурация находится в `playwright.config.ts`.

### Особенности конфигурации:
- **Базовый URL**: `http://localhost:3000`
- **Запуск сервера**: Автоматический запуск `npm run dev` через секцию `webServer`.
- **Параллелизм**: Отключен (`workers: 1`), чтобы избежать конфликтов при операциях с одной базой данных PostgreSQL.
- **Локальный импорт Prisma**: Так как E2E тесты выполняются в среде Node.js на хосте, в тест-файлах можно импортировать Prisma Client напрямую для проверки состояния БД и очистки данных.

---

## 📋 Основные сценарии и селекторы

### 1. Авторизация и Регистрация
При тестировании регистрации создавайте уникальные email-адреса с помощью временных меток (`e2e-user-${Date.now()}@example.com`), чтобы избежать дублирования.

```typescript
// Переход на страницу логина
await page.goto('/login');

// Переключение на вкладку создания аккаунта
await page.click('button:has-text("Создать аккаунт")'); // или "Create Account"

// Заполнение формы
await page.fill('input[placeholder="Alexander Fleming"]', 'E2E Test User');
await page.fill('input[type="email"]', testEmail);
await page.fill('input[type="password"]', 'Password123!');

// Согласие с дисклеймером
await page.check('#disclaimer-checkbox');

// Сабмит формы
await page.click('button[type="submit"]');
```

### 2. Подтверждение email через Dev-Bypass
Поскольку на локальном окружении SMTP сервер отсутствует, в режиме разработки на странице `/verify-email` отображается кнопка обхода:

```typescript
// Проверяем переход на страницу верификации
await expect(page).toHaveURL(/.*\/verify-email.*/);

// Кликаем по кнопке локальной верификации
await page.click('button:has-text("Подтвердить email локально")');
```

### 3. Создание проекта на Dashboard
После верификации пользователь автоматически перенаправляется на `/projects`.

```typescript
// Кликаем по кнопке создания нового проекта
await page.click('button:has-text("Новый проект")'); // или "New Project"

// Ждем открытия конфигуратора
await expect(page).toHaveURL(/.*\/configurator\?recipeId=.*/);
```

### 4. Взаимодействие с Canvas и Autosave
На холсте Canvas отображаются ноды с атрибутами `id="node-card-{id}"` и `data-node-type="{type}"`.
Для проверки Autosave измените значение слайдера в одной из нод и подождите 3 секунды (debounce таймер составляет 2 секунды).

```typescript
// Находим ноду пресса
const pressNode = page.locator('[data-node-type="press"]');
await expect(pressNode).toBeVisible();

// Регулируем глубину заполнения (slider)
const depthSlider = pressNode.locator('input[type="range"]').nth(1); // второй слайдер (depthCm)
await depthSlider.fill('1.25'); // устанавливаем новое значение

// Ждем срабатывания дебаунса автосохранения
await page.waitForTimeout(3000);
```

### 5. Эмуляция Paddle Billing и Webhook-симулятора
Для тестирования перехода на Pro тариф без открытия реального iframe платежной системы:
1. Вызываем клиентский эвент успешного завершения чекаута.
2. Получаем ID пользователя из базы данных.
3. Отправляем POST запрос к локальному симулятору вебхуков `/api/dev/simulate-webhook` с заголовком и подписью.

```typescript
// 1. Открываем модальное окно тарифов
await page.click('button:has-text("Pro")');

// 2. Инициируем чекаут и сразу эмулируем событие завершения чекаута в браузере
await page.evaluate(() => {
  window.dispatchEvent(new CustomEvent("paddle:checkout:completed"));
});

// 3. Через API-контекст Playwright вызываем симулятор вебхука
const user = await prisma.user.findUnique({ where: { email: testEmail } });
const response = await page.request.post('/api/dev/simulate-webhook', {
  data: { userId: user.id }
});
const result = await response.json();
expect(result.success).toBe(true);

// 4. Ждем обновления UI (исчезновения Hobby и переключения на Pro)
await expect(page.locator('text=Professional').first()).toBeVisible();
```

---

## 🧹 Очистка данных (Teardown)

Для исключения переполнения базы данных тестовыми записями, используйте блок `afterAll` для каскадного удаления созданного пользователя:

```typescript
import { prisma } from '../../src/lib/prisma';

afterAll(async () => {
  // Находим и удаляем тестового пользователя
  const user = await prisma.user.findUnique({ where: { email: testEmail } });
  if (user) {
    await prisma.user.delete({ where: { id: user.id } });
  }
  await prisma.$disconnect();
});
```
