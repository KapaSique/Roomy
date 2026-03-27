# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Roomy — сервис подбора соседей по совместимости для хакатона. Приоритет: рабочий MVP за минимальное время. Код чистый, но без оверинжиниринга.

**Важно:** Никаких заглушек и моков — всё должно работать end-to-end.

## Tech Stack

- **Framework:** Next.js 14+ (App Router), TypeScript
- **Styling:** Tailwind CSS + shadcn/ui
- **Database:** PostgreSQL via Prisma ORM
- **Auth:** NextAuth.js v5 (credentials + Telegram Login Widget)
- **Realtime:** Socket.io (custom Next.js server) или polling через API routes
- **Deploy:** Vercel + Supabase

## Project Structure

```
Roomy/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Auth routes group
│   ├── api/               # API routes
│   ├── onboarding/        # Wizard заполнения анкеты
│   ├── search/            # Поиск соседей
│   ├── profile/           # Профили пользователей
│   └── chats/             # Чаты
├── components/            # React компоненты
│   ├── ui/               # shadcn/ui компоненты
│   └── ...               # Feature компоненты
├── lib/                   # Утилиты
│   └── matching.ts       # Алгоритм совместимости (с тестами)
├── prisma/
│   ├── schema.prisma     # Схема БД
│   └── seed.ts           # Seed данные (20-30 фейковых пользователей)
└── .env                  # DATABASE_URL, NEXTAUTH_SECRET, NEXTAUTH_URL, TELEGRAM_BOT_TOKEN
```

## Database Schema (Prisma)

- **User**: id, email, passwordHash, telegramId, name, avatarUrl, timestamps
- **Profile** (1:1 с User): city, budget_min/max, move_in_date, bio, gender, age
- **Survey** (1:1 с User): 12 enum-полей с привычками (sleep_schedule, smoking, alcohol, cleanliness, noise_level, guests, parties, pets, work_from_home, cooking, shared_spaces, wake_time)
- **Match**: user1Id, user2Id, score (0-100), dealbreaker_conflict, calculatedAt
- **Chat/Message**: чаты и сообщения

## Matching Algorithm (lib/matching.ts)

**Критически важно:** Weighted scoring с тремя уровнями:

1. **Dealbreakers** (binary, конфликт = 0% + флаг):
   - smoking=YES + partner smoking=NEVER
   - pets=HAVE_CAT/HAVE_DOG + partner pets=ALLERGIC
   - sleep_schedule=EARLY_BIRD + partner sleep_schedule=NIGHT_OWL

2. **High-weight** (3x): cleanliness, noise_level, guests, smoking (если не dealbreaker)

3. **Normal-weight** (1x): alcohol, parties, work_from_home, cooking, shared_spaces, wake_time

**Формула:**
```
weighted_score = Σ(parameter_score × weight) / Σ(max_score × weight) × 100
```
- Exact match = 1.0
- Adjacent value = 0.5
- Opposite = 0.0

Результат: 0-100%. При dealbreaker — 0% + предупреждение.

## Development Order

1. Инициализация: Next.js + Tailwind + shadcn/ui + Prisma + PostgreSQL
2. Prisma schema + миграции + seed
3. Авторизация (NextAuth email+пароль, Telegram потом)
4. Onboarding wizard (5 шагов: базовое → жильё → привычки → социальность → bio)
5. Алгоритм совместимости (`lib/matching.ts`) с юнит-тестами
6. Поиск + карточки
7. Профиль + сравнение привычек
8. Чат (или кнопка «Написать в Telegram»)
9. Лендинг
10. Seed data + полировка

## What NOT to Do

- Никаких микросервисов
- Никакого Redux/Zustand — React Query + серверные компоненты
- Никаких сложных CI/CD
- Никакой email-верификации, forgot password (это хакатон)
- Тесты только на алгоритм совместимости

## Environment Variables

- `DATABASE_URL` — PostgreSQL connection string
- `NEXTAUTH_SECRET` — Secret for NextAuth
- `NEXTAUTH_URL` — App URL (localhost:3000 для dev)
- `TELEGRAM_BOT_TOKEN` — Для Telegram Login Widget
- `GOSUSLUGI_CLIENT_ID` — ЕСИА (Госуслуги) OAuth2 client ID (опционально)
- `GOSUSLUGI_CLIENT_SECRET` — ЕСИА (Госуслуги) OAuth2 client secret (опционально)

**Примечание:** Провайдер Госуслуг включается автоматически при наличии `GOSUSLUGI_CLIENT_ID` и `GOSUSLUGI_CLIENT_SECRET`

## Commands

```bash
# Development
npm run dev          # Запуск dev-сервера
npm run build        # Production сборка
npm run start        # Запуск production сервера
npm run lint         # ESLint проверка

# Database
npm run db:generate  # Prisma client generation
npm run db:push      # Push schema to database
npm run db:seed      # Seed database with demo data (25 users)

# Testing
npm test             # Запуск unit-тестов (matching algorithm)
```

## Architecture Notes

**Path Alias:** `@/*` → `./src/*` (настроено в `tsconfig.json`)

**Database:** SQLite для разработки (`prisma/dev.db`), PostgreSQL для продакшена

**Auth:** NextAuth v5 credentials provider с JWT сессиями, хеширование паролей через bcryptjs

**API Routes:** Все endpoints в `app/api/**/route.ts` используют Next.js App Router conventions

**Testing:** Vitest с `jsdom` окружением, тесты только на алгоритм совместимости (`src/lib/matching.test.ts`)

**UI Components:** shadcn/ui компоненты в `src/components/ui/`, кастомные компоненты в `src/components/`

**Demo Credentials:** Все демо-пользователи имеют пароль `password123`

## Build Notes

**Static Generation:** Все страницы помечены `export const dynamic = 'force-dynamic'` для отключения статической генерации (требуется для работы с динамическими данными и framer-motion)

**Known Warnings:** При сборке возникают предупреждения о bcryptjs и jose — это нормально, они работают в Node.js runtime, не в Edge

**Framer Motion:** Все компоненты с `motion` должны иметь `'use client'` директиву
