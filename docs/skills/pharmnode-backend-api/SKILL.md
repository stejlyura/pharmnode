---
name: pharmnode-backend-api
description: |
  Guides implementation of backend API, Prisma database, and authentication in PharmNode.
  Use when writing or modifying: Route Handlers in src/app/api/, Prisma queries, NextAuth config,
  tariff enforcement, or any server-side logic.
  Also triggers when user mentions: "API", "роут", "route handler", "Prisma", "база данных", "авторизация", "тариф", "NextAuth".
---

# PharmNode Backend API Skill

## Обязательное правило перед работой с API

```
⚠️ ПЕРЕД написанием Route Handlers или Server Actions:
Прочитай node_modules/next/dist/docs/
Там могут быть deprecated API, отличающиеся от твоих обучающих данных.
```

## Структура API роутов

```text
src/app/api/
├── ingredients/
│   └── route.ts        ← GET (список), POST (создание)
├── recipes/
│   └── route.ts        ← POST (сохранение/обновление)
├── auth/
│   └── [...nextauth]/
│       └── route.ts    ← NextAuth.js handlers
├── checkout/
│   └── route.ts        ← Stripe webhook + checkout
└── admin/
    └── data/
        └── route.ts    ← Admin данные
```

## Шаблон Route Handler

```typescript
// src/app/api/ingredients/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// Тарифные лимиты — ТОЛЬКО здесь, не в UI
const TARIFF_LIMITS = {
  hobby: 3,
  professional: 15,
  enterprise: Infinity,
} as const;

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const ingredients = await prisma.customIngredient.findMany({
    where: { userId: session.user.id },
  });

  return NextResponse.json(ingredients);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  const limit = TARIFF_LIMITS[user?.tariff as keyof typeof TARIFF_LIMITS] ?? 3;

  const existingCount = await prisma.customIngredient.count({
    where: { userId: user!.id },
  });

  if (existingCount >= limit) {
    return NextResponse.json(
      { error: `Tariff limit reached. Upgrade to increase limit.` },
      { status: 403 }
    );
  }

  const body = await req.json();
  // Валидация и санитизация входных данных обязательны
  const ingredient = await prisma.customIngredient.create({ data: { ...body, userId: user!.id } });
  return NextResponse.json(ingredient, { status: 201 });
}
```

## Prisma схема

```prisma
// prisma/schema.prisma
model User {
  id          String             @id @default(cuid())
  email       String             @unique
  name        String?
  tariff      String             @default("hobby") // hobby | professional | enterprise
  recipes     Recipe[]
  ingredients CustomIngredient[]
  createdAt   DateTime           @default(now())
}

model Recipe {
  id        String   @id @default(cuid())
  userId    String
  canvas    Json     // состояние нод + соединений
  user      User     @relation(fields: [userId], references: [id])
  updatedAt DateTime @updatedAt
}

model CustomIngredient {
  id     String @id @default(cuid())
  userId String
  data   Json   // Ingredient объект
  user   User   @relation(fields: [userId], references: [id])
}
```

## Singleton Prisma Client

```typescript
// src/lib/prisma.ts — ВСЕГДА импортировать отсюда
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
```

## NextAuth конфигурация

```typescript
// src/lib/auth.ts
import { AuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import GitHubProvider from 'next-auth/providers/github';

export const authOptions: AuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
    }),
    // mock провайдер для локальной разработки
  ],
  callbacks: {
    async session({ session, token }) {
      // Добавляем userId и tariff в сессию
      if (session.user && token.sub) {
        session.user.id = token.sub;
      }
      return session;
    },
  },
};
```

## Ключевые правила

1. **Mongoose НЕ используется** — `src/models/` это архивные файлы, не трогать
2. **Тарифные лимиты** проверяются ТОЛЬКО в Route Handlers, не в UI
3. **Никогда не используй `any`** — все типы из `src/types/pharm.ts`
4. **Санитизация строк** обязательна при `POST` (защита от XSS)
5. **`DATABASE_URL` и `.env`** — не читать и не модифицировать

## Переменные окружения

```bash
DATABASE_URL="postgres://..."      # PostgreSQL
NEXTAUTH_SECRET="..."               # Генерировать: openssl rand -base64 32
NEXTAUTH_URL="https://..."          # Публичный домен
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."
GITHUB_ID="..."
GITHUB_SECRET="..."
STRIPE_API_KEY="sk_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
```

## Ссылки на документацию

- Архитектура бэкенда: [`docs/architecture/backend.md`](../../architecture/backend.md)
- Инструкция по деплою: [`docs/deployment/setup-guide.md`](../../deployment/setup-guide.md)
- Prisma клиент: [`src/lib/prisma.ts`](../../../src/lib/prisma.ts)
