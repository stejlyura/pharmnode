# 🔑 Инструкция по настройке ключей и сервисов перед Деплоем

Чтобы приложение PharmNode заработало в полноценном боевом (Production) режиме, вам (как владельцу) необходимо зарегистрироваться в ряде внешних сервисов, получить ключи и указать их в настройках вашего хостинга (например, Vercel). 

Здесь расписаны все шаги, которые нужно сделать вручную.

---

## 1. База Данных PostgreSQL (Production)

Для локальной разработки вы использовали Docker, но для продакшена нужна облачная база данных.

**Что сделать:**
1. Зарегистрируйтесь на бесплатном хостинге PostgreSQL (рекомендуются [Neon.tech](https://neon.tech) или [Supabase](https://supabase.com)).
2. Создайте новый проект и базу данных (назовите `pharmnode`).
3. Скопируйте строку подключения (Connection String).
4. **Ваш параметр:** `DATABASE_URL="postgres://user:password@host/pharmnode"`

> [!WARNING]
> После настройки базы в продакшене обязательно выполните команду миграции, чтобы создать все нужные таблицы:
> `npx prisma db push`

---

## 2. Stripe (Платежи и подписки)

Чтобы пользователи могли оплачивать тариф Professional/Enterprise, нужен биллинг.

**Что сделать:**
1. Зарегистрируйтесь в [Stripe](https://stripe.com).
2. Перейдите в дашборд. На этапе тестов используйте режим "Test mode", а для реальных продаж включите "Live mode".
3. В разделе **Developers -> API keys** скопируйте `Secret key`.
4. В разделе **Developers -> Webhooks** создайте вебхук, указывающий на `https://ВАШ_ДОМЕН.com/api/checkout` и скопируйте `Webhook Signing Secret`.
5. **Ваши параметры:**
   - `STRIPE_API_KEY="sk_live_..."` (или `sk_test_...`)
   - `STRIPE_WEBHOOK_SECRET="whsec_..."`

---

## 3. Авторизация (NextAuth / Auth.js)

Приложение поддерживает вход через Google и GitHub.

### 3.1 Глобальные настройки авторизации
Сначала сгенерируйте секретный ключ для шифрования сессий (можно выполнить в терминале Mac: `openssl rand -base64 32`).
- **Ваши параметры:**
  - `NEXTAUTH_SECRET="ваша_случайная_строка"`
  - `NEXTAUTH_URL="https://ВАШ_ДОМЕН.com"`

### 3.2 Google OAuth
1. Перейдите в [Google Cloud Console](https://console.cloud.google.com).
2. Создайте проект, перейдите в **APIs & Services -> Credentials**.
3. Создайте **OAuth client ID** (Web application).
4. В "Authorized redirect URIs" добавьте: `https://ВАШ_ДОМЕН.com/api/auth/callback/google`
5. **Ваши параметры:**
   - `GOOGLE_CLIENT_ID="..."`
   - `GOOGLE_CLIENT_SECRET="..."`

### 3.3 GitHub OAuth
1. Перейдите в **Settings -> Developer settings -> OAuth Apps** в вашем GitHub.
2. Создайте новое приложение (New OAuth App).
3. В "Authorization callback URL" добавьте: `https://ВАШ_ДОМЕН.com/api/auth/callback/github`
4. **Ваши параметры:**
   - `GITHUB_ID="..."`
   - `GITHUB_SECRET="..."`

---

## 4. Как всё это применить (на примере Vercel)

Если вы деплоите проект на платформу **Vercel** (рекомендуется для Next.js):
1. Импортируйте репозиторий GitHub в Vercel.
2. В настройках проекта, перед нажатием кнопки "Deploy", откройте секцию **Environment Variables**.
3. Скопируйте туда ВСЕ вышеуказанные переменные (DATABASE_URL, STRIPE_API_KEY и т.д.).
4. В секции **Build Command** укажите:
   ```bash
   npx prisma generate && next build
   ```
5. Нажмите Deploy.

> [!TIP]
> После успешного деплоя не забудьте зайти в базу данных и назначить себе (своему email) роль администратора или выдать тариф Enterprise напрямую, изменив поле `tariff` в таблице `User`!
