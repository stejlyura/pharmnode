# 🔑 Инструкция по настройке ключей и сервисов перед Деплоем

Чтобы приложение PharmNode заработало в полноценном боевом (Production) режиме, необходимо зарегистрироваться в ряде внешних сервисов, получить ключи и указать их в настройках хостинга (Vercel).

---

## 1. База Данных PostgreSQL (Production)

**Что сделать:**
1. Зарегистрируйтесь на [Neon.tech](https://neon.tech) или [Supabase](https://supabase.com)
2. Создайте новый проект и базу данных (назовите `pharmnode`)
3. Скопируйте строку подключения (Connection String)
4. **Параметр:** `DATABASE_URL="postgres://user:password@host/pharmnode"`

> [!WARNING]
> После настройки базы обязательно выполните миграцию:
> `npx prisma db push`

---

## 2. Paddle Billing v2 (Платежи и подписки)

**Что сделать:**
1. Зарегистрируйтесь в [Paddle](https://paddle.com) (или используйте [Sandbox](https://sandbox.paddle.com) для тестов).
2. Создайте продукт и подписку (Professional тариф), чтобы получить Price ID (например, `pri_...`).
3. В разделе **Developer Tools → Authentication** создайте боевой API Key и Client Token.
4. В разделе **Developer Tools → Webhooks** добавьте адрес обработчика: `https://ВАШ_ДОМЕН.com/api/webhooks/paddle`. Выберите события транзакций и подписок, и скопируйте Webhook Secret Key.

**Параметры:**
- `NEXT_PUBLIC_PADDLE_ENVIRONMENT="production"` (или `sandbox`)
- `NEXT_PUBLIC_PADDLE_CLIENT_TOKEN="live_client_token..."`
- `NEXT_PUBLIC_PADDLE_PRICE_ID="pri_..."`
- `PADDLE_API_KEY="live_api_key..."`
- `PADDLE_WEBHOOK_SECRET="pdl_ntf_..."`

---

## 3. Авторизация (NextAuth / Auth.js)

### 3.1 Глобальные настройки

Сгенерируйте секрет: `openssl rand -base64 32`

- `NEXTAUTH_SECRET="ваша_случайная_строка"`
- `NEXTAUTH_URL="https://ВАШ_ДОМЕН.com"`

### 3.2 Google OAuth

1. [Google Cloud Console](https://console.cloud.google.com) → APIs & Services → Credentials
2. Создайте **OAuth client ID** (Web application)
3. В «Authorized redirect URIs»: `https://ВАШ_ДОМЕН.com/api/auth/callback/google`

**Параметры:**
- `GOOGLE_CLIENT_ID="..."`
- `GOOGLE_CLIENT_SECRET="..."`

### 3.3 GitHub OAuth

1. GitHub → Settings → Developer settings → OAuth Apps → New OAuth App
2. Authorization callback URL: `https://ВАШ_ДОМЕН.com/api/auth/callback/github`

**Параметры:**
- `GITHUB_ID="..."`
- `GITHUB_SECRET="..."`

---

## 4. Деплой на Vercel

1. Импортируйте репозиторий GitHub в Vercel
2. В настройках проекта → **Environment Variables** — добавьте все переменные выше
3. В **Build Command** укажите:
   ```bash
   npx prisma generate && next build
   ```
4. Нажмите Deploy

> [!TIP]
> После деплоя назначьте себе роль администратора — измените поле `tariff` в таблице `User` на `enterprise`.

---

## Чеклист всех переменных окружения

```env
# База данных
DATABASE_URL="postgres://..."

# NextAuth
NEXTAUTH_SECRET="..."
NEXTAUTH_URL="https://..."

# Google OAuth
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."

# GitHub OAuth
GITHUB_ID="..."
GITHUB_SECRET="..."

# Paddle
NEXT_PUBLIC_PADDLE_ENVIRONMENT="production"
NEXT_PUBLIC_PADDLE_CLIENT_TOKEN="live_client_token..."
NEXT_PUBLIC_PADDLE_PRICE_ID="pri_..."
PADDLE_API_KEY="live_api_key..."
PADDLE_WEBHOOK_SECRET="pdl_ntf_..."
```

---
⬅️ [Вернуться к индексу документации](../index.md)
