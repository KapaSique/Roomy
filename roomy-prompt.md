# Roomy — Сервис подбора соседей по совместимости

## Контекст
Хакатон/интенсив. Приоритет — рабочий MVP за минимальное время. Код должен быть чистым, но без оверинжиниринга. Никаких заглушек и моков — всё должно работать end-to-end.

## Что делаем
Веб-сервис, где пользователь заполняет анкету о своих бытовых привычках, и система находит совместимых соседей для совместной аренды жилья. Ключевая фича — умный алгоритм совместимости с весами и dealbreaker-параметрами, а не тупое «совпало/не совпало».

---

## Стек

**Frontend:** Next.js 14+ (App Router), TypeScript, Tailwind CSS, shadcn/ui  
**Backend:** Next.js API Routes (всё в одном репо, без отдельного сервера)  
**БД:** PostgreSQL через Prisma ORM  
**Авторизация:** NextAuth.js v5 — email+пароль (credentials provider) + Telegram Login Widget  
**Realtime чат:** Socket.io (сервер через custom Next.js server) ИЛИ polling через API routes (выбери что быстрее поднять)  
**Деплой:** рассчитано на Vercel + Supabase (PostgreSQL)

---

## Структура БД (Prisma schema)

### User
- id, email, passwordHash, telegramId (nullable), name, avatarUrl
- createdAt, updatedAt

### Profile (1:1 с User)
- id, userId
- city (string)
- budget_min, budget_max (int, рубли)
- move_in_date (date, nullable)
- bio (text, краткое описание о себе)
- gender (enum: MALE, FEMALE, OTHER)
- age (int)

### Survey (1:1 с User) — ответы на анкету
Каждое поле — enum с конкретными вариантами:

- **sleep_schedule**: EARLY_BIRD | NORMAL | NIGHT_OWL  
- **wake_time**: BEFORE_7 | 7_TO_9 | 9_TO_11 | AFTER_11  
- **smoking**: NEVER | OUTSIDE_ONLY | YES  
- **alcohol**: NEVER | RARELY | WEEKENDS | OFTEN  
- **noise_level**: SILENT | MODERATE | LOUD_OK  
- **cleanliness**: MINIMALIST | NORMAL | CLEAN_FREAK  
- **guests**: NEVER | RARELY | OFTEN | ANYTIME  
- **parties**: NEVER | MONTHLY | WEEKLY  
- **pets**: NO_PETS | HAVE_CAT | HAVE_DOG | HAVE_OTHER | WANT_PETS | ALLERGIC  
- **work_from_home**: NEVER | SOMETIMES | ALWAYS  
- **cooking**: RARELY | SOMETIMES | DAILY  
- **shared_spaces**: PRIVATE | FLEXIBLE | SOCIAL  

### Match (связь между двумя пользователями)
- id, user1Id, user2Id
- score (float 0-100)
- dealbreaker_conflict (boolean)
- calculatedAt

### Chat / Message
- chatId, participants (relation), messages
- message: id, chatId, senderId, text, createdAt, isRead

---

## Алгоритм совместимости (КРИТИЧЕСКИ ВАЖНО — сделать правильно)

НЕ просто "совпадения / всего". Используем weighted scoring с тремя уровнями:

### 1. Dealbreakers (вес: бинарный, если конфликт — score = 0 и флаг)
Пары, которые несовместимы в принципе:
- smoking=YES + партнёр smoking=NEVER → dealbreaker
- pets=HAVE_CAT/HAVE_DOG + партнёр pets=ALLERGIC → dealbreaker
- sleep_schedule=EARLY_BIRD + партнёр sleep_schedule=NIGHT_OWL → dealbreaker

### 2. High-weight параметры (вес: 3x)
- cleanliness (разница между MINIMALIST и CLEAN_FREAK = 0 баллов)
- noise_level
- guests
- smoking (если не dealbreaker, но разная толерантность)

### 3. Normal-weight параметры (вес: 1x)
- alcohol, parties, work_from_home, cooking, shared_spaces, wake_time

### Формула:
```
weighted_score = Σ(параметр_score × вес) / Σ(макс_score × вес) × 100

Где параметр_score для каждого параметра:
- Exact match = 1.0
- Adjacent value (на 1 шаг) = 0.5  
- Opposite = 0.0
```

Результат: число 0–100, показывается как процент. Если есть dealbreaker — показываем 0% + предупреждение.

Реализовать как отдельную утилиту `lib/matching.ts` с юнит-тестами.

---

## Страницы и UI

### 1. `/` — Лендинг
Простой, цепляющий. Заголовок типа «Найди соседа, с которым не захочется съехать». CTA → регистрация. Показать как это работает в 3 шага (иконки + текст).

### 2. `/auth/signin` и `/auth/signup`
Email + пароль. Telegram Login Widget как альтернатива. После регистрации — редирект на анкету.

### 3. `/onboarding` — Заполнение профиля и анкеты
**Многошаговая форма (wizard):**
- Шаг 1: Базовое (имя, город, возраст, пол)
- Шаг 2: Жильё (бюджет min-max, дата заезда)
- Шаг 3: Привычки (sleep, smoking, alcohol, cleanliness, noise)
- Шаг 4: Социальность (guests, parties, shared_spaces, cooking, work_from_home, pets)
- Шаг 5: Bio (свободный текст о себе)

Каждый шаг — карточки/кнопки для выбора (НЕ скучные радиобаттоны). Визуально приятно, с эмодзи/иконками. Progress bar сверху.

### 4. `/search` — Поиск соседей
Фильтры: город, бюджет (range slider), мин. совместимость (slider).  
Список карточек пользователей:
- Аватар, имя, возраст, город
- Процент совместимости (круговая шкала/прогресс-бар, цвет зависит от %: зелёный >75, жёлтый 50-75, красный <50)
- Кнопка «Подробнее»

### 5. `/profile/[id]` — Профиль пользователя  
Полная анкета, био, сравнение привычек с твоими (визуальное: ✅ совпадает / ⚠️ отличается / 🚫 dealbreaker). Кнопка «Написать».

### 6. `/chats` — Список чатов
### 7. `/chats/[id]` — Чат
Простой мессенджер. Сообщения, input, отправка. Без лишнего.

### 8. `/profile` — Свой профиль
Редактирование анкеты и профиля.

---

## Важные детали реализации

1. **Пересчёт совместимости**: При изменении анкеты — пересчитать матчи. Можно делать lazy (при запросе поиска), не нужен background job для хакатона.

2. **Сортировка в поиске**: По умолчанию — по убыванию совместимости. Dealbreaker-матчи не показывать вообще.

3. **Адаптив**: Mobile-first. Всё должно выглядеть хорошо на телефоне.

4. **Seed data**: Создай seed-скрипт `prisma/seed.ts` который генерирует 20-30 фейковых пользователей с заполненными анкетами для демонстрации.

5. **Env vars**: DATABASE_URL, NEXTAUTH_SECRET, NEXTAUTH_URL, TELEGRAM_BOT_TOKEN (для Telegram Login Widget).

---

## Порядок разработки

1. Инициализация: Next.js + Tailwind + shadcn/ui + Prisma + PostgreSQL
2. Prisma schema + миграции + seed
3. Авторизация (NextAuth email+пароль, Telegram потом если время есть)
4. Onboarding wizard (заполнение профиля + анкеты)
5. Алгоритм совместимости (`lib/matching.ts`)
6. Поиск + карточки
7. Профиль пользователя + сравнение
8. Чат (если останется время — иначе кнопка «Написать в Telegram»)
9. Лендинг
10. Seed data + полировка

---

## Чего НЕ делать
- Никаких микросервисов
- Никакого Redux/Zustand — хватит React Query + серверных компонентов
- Никаких сложных CI/CD пайплайнов
- Не тратить время на email-верификацию, forgot password и прочее — это хакатон
- Не писать тесты на всё — только на алгоритм совместимости

---

Начинай с шага 1. После каждого шага коммить с понятным сообщением. Работай файл за файлом, не пытайся генерить весь проект за один раз.
