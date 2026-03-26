# Roomy — Найди идеального соседа 🏠

<div align="center">

![Roomy Banner](https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200&h=400&fit=crop)

[![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js&logoColor=white)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-38bdf8?logo=tailwind-css&logoColor=white)](https://tailwindcss.com)
[![Prisma](https://img.shields.io/badge/Prisma-5-2d3748?logo=prisma&logoColor=white)](https://prisma.io)
[![SQLite](https://img.shields.io/badge/Database-SQLite-003b57?logo=sqlite&logoColor=white)](https://www.sqlite.org)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Hackathon](https://img.shields.io/badge/Project-Hackathon-orange)]()

**Сервис подбора соседей по совместимости привычек и образа жизни**

[Демо](#-демо-доступ) • [Документация](#-документация) • [Фичи](#-особенности) • [Установка](#-установка)

</div>

---

## 🎯 О проекте

**Roomy** — это умный сервис для поиска идеального соседа по квартире. Мы используем взвешенный алгоритм совместимости, который учитывает ваши привычки, образ жизни и критические несовместимости.

### ✨ Особенности

| Фича | Описание |
|------|----------|
| 🔍 **Умный поиск** | Алгоритм совместимости с учётом dealbreakers |
| 📝 **Онбординг** | 5-шаговая анкета для точного подбора |
| 💬 **Чат** | Общение с потенциальными соседями в реальном времени |
| 🎨 **Дизайн** | Современный UI с анимациями Framer Motion |
| 📱 **Адаптив** | Полная поддержка мобильных устройств |
| 🔒 **Безопасность** | NextAuth v5 с JWT сессиями |

---

## 🚀 Быстрый старт

### Требования

- Node.js 18+
- npm или pnpm

### Установка

```bash
# Клонирование репозитория
git clone https://github.com/KapaSique/Roomy.git
cd Roomy

# Установка зависимостей
npm install

# Генерация Prisma клиента
npx prisma generate

# Применение миграций
npx prisma migrate dev

# Заполнение базы демо-данными
npm run db:seed

# Запуск dev-сервера
npm run dev
```

После запуска откройте [http://localhost:3000](http://localhost:3000)

---

## 📋 Демо-доступ

| Email | Пароль |
|-------|--------|
| `aleksandr.ivanov@example.com` | `password123` |
| `mikhail.smirnov@example.com` | `password123` |
| `elena.morozova@example.com` | `password123` |

> **Примечание:** Все 25 демо-пользователей имеют пароль `password123`

---

## 🛠 Технологический стек

### Frontend
- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript 5
- **Styling:** Tailwind CSS + shadcn/ui
- **Animations:** Framer Motion
- **Fonts:** Inter + Cormorant Garamond

### Backend
- **Auth:** NextAuth v5 (Credentials Provider)
- **Database:** SQLite (Prisma ORM)
- **API:** Next.js API Routes

### DevOps
- **Deploy:** Vercel (готово к деплою)
- **Database:** Supabase (PostgreSQL)

---

## 📊 Алгоритм совместимости

Roomy использует трёхуровневую систему оценки:

```
┌─────────────────────────────────────────────────────┐
│                 COMPATIBILITY SCORE                 │
├─────────────────────────────────────────────────────┤
│  1. DEALBREAKERS (binary)                           │
│     • Курение + некурящий                           │
│     • Аллергия на питомцев + питомцы                │
│     • Жаворонок + Сова                              │
│     → Результат: 0% + флаг конфликта                │
├─────────────────────────────────────────────────────┤
│  2. HIGH WEIGHT (3x множитель)                      │
│     • Чистоплотность                                │
│     • Уровень шума                                  │
│     • Гости                                         │
│     • Курение (если не dealbreaker)                 │
├─────────────────────────────────────────────────────┤
│  3. NORMAL WEIGHT (1x множитель)                    │
│     • Алкоголь                                      │
│     • Вечеринки                                     │
│     • Работа из дома                                │
│     • Готовка                                       │
│     • Общие пространства                            │
│     • Время подъёма                                 │
└─────────────────────────────────────────────────────┘
```

**Формула:**
```
score = (Σ(param_score × weight) / Σ(max_score × weight)) × 100
```

---

## 📁 Структура проекта

```
Roomy/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/                # API Routes
│   │   │   ├── auth/           # NextAuth endpoints
│   │   │   ├── search/         # Search API
│   │   │   ├── onboarding/     # Profile save API
│   │   │   ├── profile/        # User profile API
│   │   │   └── chats/          # Chat API
│   │   ├── onboarding/         # 5-step wizard
│   │   ├── search/             # Match results
│   │   ├── profile/[id]/       # User profile view
│   │   ├── chats/              # Chat interface
│   │   ├── signin/             # Login page
│   │   ├── signup/             # Registration page
│   │   └── page.tsx            # Landing page
│   ├── components/
│   │   └── ui/                 # shadcn/ui components
│   └── lib/
│       ├── auth.ts             # NextAuth config
│       ├── prisma.ts           # Prisma client
│       ├── matching.ts         # Compatibility algorithm
│       └── matching.test.ts    # Unit tests
├── prisma/
│   ├── schema.prisma           # Database schema
│   ├── seed.ts                 # Demo data (25 users)
│   └── migrations/             # DB migrations
└── package.json
```

---

## 🧪 Тестирование

```bash
# Запуск unit-тестов (matching algorithm)
npm test

# Валидация схемы Prisma
npx prisma validate

# Production сборка
npm run build

# Linting
npm run lint
```

---

## 👥 Команда

**Разработчик:** artem4ik
**Email:** artem_svinoboev@mail.ru
**GitHub:** [@KapaSique](https://github.com/KapaSique)

---

## 📄 Лицензия

MIT License — см. файл [LICENSE](LICENSE) для деталей.

---

## 🔗 Ссылки

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [NextAuth.js Documentation](https://next-auth.js.org/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [shadcn/ui](https://ui.shadcn.com)
- [Framer Motion](https://www.framer.com/motion/)

---

<div align="center">

**Made with ❤️ for the Hackathon**

[⬆ Back to top](#roomy--найди-идеального-соседа)

</div>
