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

## 2. Stripe (Платежи и подписки)

**Что сделать:**
1. Зарегистрируйтесь в [Stripe](https://stripe.com)
2. Используйте режим «Test mode» для тестов, «Live mode» для продаж
3. В **Developers → API keys** скопируйте `Secret key`
4. В **Developers → Webhooks** создайте вебхук на `https://ВАШ_ДОМЕН.com/api/checkout`

**Параметры:**
- `STRIPE_API_KEY="sk_live_..."` (или `sk_test_...`)
- `STRIPE_WEBHOOK_SECRET="whsec_..."`

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

# Stripe
STRIPE_API_KEY="sk_live_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
```
