<div align="center">

<img src="./public/readme-banner.svg" alt="Roomy — Соседи, с которыми уживёшься" width="100%" />

<br />

<h3>Сервис подбора соседей по совместимости привычек</h3>

<p>Не фото. Не «вайб». 12 параметров, взвешенный алгоритм и честные флажки там, где не сойдётесь.</p>

<br />

[![Next.js](https://img.shields.io/badge/Next.js-14.2-000000?style=flat-square&logo=next.js&logoColor=white)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Tailwind](https://img.shields.io/badge/Tailwind-3.4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Prisma](https://img.shields.io/badge/Prisma-5.22-2D3748?style=flat-square&logo=prisma&logoColor=white)](https://www.prisma.io)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?style=flat-square&logo=postgresql&logoColor=white)](https://www.postgresql.org)
[![NextAuth.js](https://img.shields.io/badge/NextAuth-v5-EB5424?style=flat-square&logo=auth0&logoColor=white)](https://authjs.dev)
[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-000000?style=flat-square&logo=vercel&logoColor=white)](https://roomy-inky.vercel.app)

<br />

<a href="https://roomy-inky.vercel.app"><b>🌐 Открыть живой прототип →</b></a>

</div>

---

## 💡 В двух словах

В России сотни сервисов по поиску **квартир** — и **ни одного**, который бы находил **людей**. 60% конфликтов в съёмном жилье случаются из-за бытовых привычек: чистота, шум, гости, режим сна. Roomy решает именно эту задачу — мы сравниваем привычки двух людей и показываем совместимость в процентах ещё до того, как они впервые созвонятся.

> «Нашла идеальную квартиру. Съехала через месяц — сосед курил на кухне, а на просмотре сказал, что бросил.»
> — Аня, 27

---

## ✨ Что внутри

- **🧠 Взвешенный алгоритм совместимости** — три уровня весов: дилбрейкеры (обнуляют матч), high-weight (×3), normal-weight (×1). Полностью покрыт юнит-тестами.
- **📝 Анкета, которую дочитывают** — 12 визуальных вопросов с вариантами-плитками, медиана прохождения **1:47**.
- **🎯 Лента с совпадениями** — сортировка по совместимости, 4-категорийный разбор на каждой карточке (ритм, чистота, социальность, быт), фильтры по городу / возрасту / бюджету, табы «Рекомендуем / Сохранённые / Скрытые» с локальным хранилищем.
- **🔍 Глубокий профиль кандидата** — SVG-кольцо общего матча, бок-о-бок таблица 12 привычек, generated conversation starters из реального оверлапа, похожие профили, share/save/hide/report actions.
- **💬 Встроенный чат** без обмена номерами телефонов.
- **🛡 Безопасность** — дилбрейкер-баннер на профиле, флаг «пожаловаться», скрытие кандидатов, эмейл-верификация через NextAuth.
- **🔐 Авторизация** — email+пароль (bcrypt) или ЕСИА Госуслуги (OAuth-заглушка для демо).

---

## 🧮 Алгоритм совместимости

```
                    ┌─────────────────────────────────────────┐
  survey A  ──────▶ │  checkDealbreakers(A, B)                │
  survey B  ──────▶ │  ├─ курение (NEVER × OCCASIONALLY+)     │  ──▶  score = 0
                    │  ├─ аллергия × питомец                  │      dealbreaker = true
                    │  └─ жаворонок × сова                    │
                    └─────────────────────────────────────────┘
                                     │
                                     ▼  если дилбрейкеров нет
                    ┌─────────────────────────────────────────┐
                    │  high-weight × 3                        │
                    │  ├─ cleanliness                         │
                    │  ├─ noiseLevel                          │
                    │  ├─ guests                              │
                    │  └─ smoking (non-dealbreaker)           │
                    │                                         │
                    │  normal-weight × 1                      │
                    │  ├─ alcohol      ├─ cooking             │
                    │  ├─ parties      ├─ sharedSpaces        │
                    │  └─ workFromHome └─ wakeTime            │
                    └─────────────────────────────────────────┘
                                     │
                                     ▼
                weighted_score = Σ(score × weight) / Σ(max × weight) × 100
                exact match = 1.0  ·  adjacent value = 0.5  ·  opposite = 0.0
```

Код — в [`src/lib/matching.ts`](./src/lib/matching.ts). Тесты — в [`src/lib/matching.test.ts`](./src/lib/matching.test.ts). Клиентские помощники (категории, переводы, icebreakers) — в [`src/lib/survey-dict.ts`](./src/lib/survey-dict.ts).

---

## 🧱 Стек

<table>
  <tr>
    <td><b>Фронт</b></td>
    <td>Next.js 14 (App Router) · React 18 · TypeScript · Tailwind CSS · framer-motion · lucide-react · shadcn/ui + base-ui</td>
  </tr>
  <tr>
    <td><b>Бэк</b></td>
    <td>Next.js API routes · NextAuth.js v5 (credentials + OAuth) · bcryptjs</td>
  </tr>
  <tr>
    <td><b>Данные</b></td>
    <td>Prisma 5 · PostgreSQL (prod) / SQLite (dev fallback)</td>
  </tr>
  <tr>
    <td><b>Тесты</b></td>
    <td>Vitest · jsdom</td>
  </tr>
  <tr>
    <td><b>Хостинг</b></td>
    <td>Vercel (fra1) · Prisma Accelerate</td>
  </tr>
</table>

---

## 🗂 Структура проекта

```
Roomy/
├── app/                         # Next.js App Router (root)
│   ├── (routes)/               # лендинг, signin, signup, onboarding, search, profile/[id], profile/edit, chats
│   ├── api/                    # /auth · /me · /onboarding · /search · /profile · /chats · /seed
│   ├── globals.css             # дизайн-токены, утилиты
│   └── layout.tsx              # Inter + Manrope, SessionProvider, metadata
├── src/
│   ├── components/             # ErrorBoundary, FilterDrawer, OfflineBanner, ProfileComparison, ui/*
│   ├── lib/
│   │   ├── auth.ts             # NextAuth + Credentials + Gosuslugi OAuth
│   │   ├── matching.ts         # взвешенный алгоритм совместимости + тесты
│   │   ├── survey-dict.ts      # категории, переводы, icebreakers, scoreTone
│   │   └── prisma.ts           # singleton Prisma client
│   └── middleware.ts           # защита приватных роутов
├── prisma/
│   ├── schema.prisma           # User · Profile · Survey · Match · Chat · Message
│   └── seed.ts                 # 25 демо-пользователей
└── public/                     # og-image, favicon, readme-assets
```

---

## 🚀 Локальный запуск

```bash
# 1. Клонируем и устанавливаем зависимости
git clone https://github.com/KapaSique/Roomy.git
cd Roomy
npm install

# 2. Создаём .env.local (значения — примеры для dev)
cat > .env.local <<'EOF'
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/roomy"
DIRECT_URL="postgresql://postgres:postgres@localhost:5432/roomy"
NEXTAUTH_SECRET="generate-me-with-openssl-rand-base64-32"
NEXTAUTH_URL="http://localhost:3000"
EOF

# 3. База: миграции + сид
npm run db:push
npm run db:seed

# 4. Запускаем
npm run dev                      # http://localhost:3000
```

**Демо-креды** для быстрого входа:

```
email:    aleksandr.ivanov@example.com
password: password123
```

Все 25 сид-пользователей имеют один и тот же пароль — `password123`.

---

## 🧪 Команды

```bash
npm run dev          # Next.js dev server
npm run build        # Production build (+ Prisma generate + migrate deploy)
npm run start        # Запуск prod-сервера
npm run lint         # ESLint
npm run test         # Vitest (юнит-тесты алгоритма)

npm run db:generate  # Prisma client
npm run db:push      # Синхронизировать схему с БД
npm run db:seed      # Наполнить базу 25 демо-юзерами
```

---

## 🚢 Деплой

Проект продакшн-задеплоен на **[roomy-inky.vercel.app](https://roomy-inky.vercel.app)**.

```bash
vercel --prod        # после `vercel link`
```

Требуемые env-переменные в Vercel → Project → Settings → Environment Variables:
- `DATABASE_URL`, `DIRECT_URL` — Prisma/Postgres connection strings
- `NEXTAUTH_SECRET`, `NEXTAUTH_URL`
- `GOSUSLUGI_CLIENT_ID`, `GOSUSLUGI_CLIENT_SECRET` *(опционально — провайдер включается автоматически при наличии обеих)*

Build command в `vercel.json`:
```json
"buildCommand": "prisma generate && prisma migrate deploy && next build"
```
— каждый продакшн-деплой накатывает миграции до сборки нового кода (zero-downtime).

---

## 🗺 Roadmap

| Когда | Что |
|-------|-----|
| **Сейчас (MVP)** | Алгоритм 12 параметров · анкета 1:47 · лента с фильтрами · глубокий профиль · чат · email/ЕСИА вход |
| **Q3 2026** | Верификация паспортом · отзывы от прошлых соседей · push-уведомления · геофильтр по районам |
| **Q4 2026** | Матчинг групп 3–4 чел. · партнёрства с площадками · B2B API для риелторов |

---

## 👥 Команда

<table>
  <tr>
    <td><b>A. Свинобоев</b></td><td>fullstack</td>
  </tr>
  <tr>
    <td><b>С. Андреева</b></td><td>design</td>
  </tr>
  <tr>
    <td><b>А. Жиркова</b></td><td>teamlead</td>
  </tr>
  <tr>
    <td><b>В. Слепцов</b></td><td>backend</td>
  </tr>
</table>

**IMI · 2026**

---
