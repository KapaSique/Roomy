'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { useState } from 'react'
import {
  ArrowRight,
  Check,
  ChevronDown,
  Clock,
  MessageCircle,
  Shield,
  Sparkles,
  X,
} from 'lucide-react'

export const dynamic = 'force-dynamic'

const rise = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-80px' },
  transition: { duration: 0.6, ease: [0.2, 0.8, 0.2, 1] as const },
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-border/80 bg-card/60 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.2em] text-muted-foreground backdrop-blur">
      <span className="h-1 w-1 rounded-full bg-primary" />
      {children}
    </div>
  )
}

export default function Home() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <SiteHeader />
      <Hero />
      <WhyItBreaksSection />
      <HowItWorksSection />
      <MatchPreviewSection />
      <SurveySection />
      <TestimonialsSection />
      <FaqSection />
      <FinalCta />
      <SiteFooter />
    </div>
  )
}

/* ──────────────────────────────────────────────────────── */

function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <div className="container mx-auto flex h-16 items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2 font-display text-xl font-bold tracking-tight">
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-brand-gradient" />
          Roomy
        </Link>
        <nav className="hidden items-center gap-1 md:flex">
          {[
            { href: '#how', label: 'Как это работает' },
            { href: '#match', label: 'Совместимость' },
            { href: '#faq', label: 'Вопросы' },
          ].map((l) => (
            <a key={l.href} href={l.href} className="rounded-full px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground">
              {l.label}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <Link href="/signin" className="rounded-full px-4 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground">
            Войти
          </Link>
          <Link href="/signup" className="btn-primary px-5 py-2 text-sm">
            Начать
          </Link>
        </div>
      </div>
    </header>
  )
}

/* ─── HERO — off-axis, big wordmark, one anchored match card ─── */
function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 bg-mesh" aria-hidden />
      <div className="pointer-events-none absolute -top-40 right-[-20%] h-[620px] w-[620px] rounded-full bg-brand-gradient opacity-70 blur-3xl animate-blob-drift" aria-hidden />
      <div className="pointer-events-none absolute bottom-[-25%] left-[-10%] h-[480px] w-[480px] rounded-full bg-accent/40 opacity-60 blur-3xl animate-blob-drift" aria-hidden />

      <div className="container relative mx-auto px-6 pt-20 pb-40 md:pt-28 md:pb-48">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.2, 0.8, 0.2, 1] }}
          className="max-w-3xl"
        >
          <Eyebrow>сосед по привычкам, а не по фото</Eyebrow>

          <h1 className="mt-6 font-display text-[clamp(3rem,8vw,6.75rem)] font-bold leading-[0.95] tracking-tighter text-balance">
            Найди того, с кем <br />
            <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">уживёшься</span>.
          </h1>

          <p className="mt-6 max-w-xl text-lg leading-relaxed text-foreground/80 md:text-xl text-balance">
            Roomy сравнивает 12 привычек — сон, чистоту, шум, гостей — и показывает,
            с кем ты реально продержишься под одной крышей. Не фото, не вайб — цифры.
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-3">
            <Link href="/signup" className="btn-primary group">
              Попробовать
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link href="#how" className="btn-ghost">
              Сначала посмотреть, как работает
            </Link>
          </div>

          <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5"><Shield className="h-3.5 w-3.5" /> Без номеров и паспортов на старте</span>
            <span className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" /> 1 мин 47 сек — медиана анкеты</span>
            <span className="flex items-center gap-1.5"><Sparkles className="h-3.5 w-3.5" /> Бесплатно, пока мы растём</span>
          </div>
        </motion.div>

        {/* Floating match card — just one, anchored off-canvas */}
        <motion.div
          initial={{ opacity: 0, y: 40, rotate: 3 }}
          animate={{ opacity: 1, y: 0, rotate: 3 }}
          transition={{ delay: 0.4, duration: 0.9, ease: [0.2, 0.8, 0.2, 1] }}
          className="pointer-events-none absolute bottom-16 right-6 hidden w-80 md:block"
          aria-hidden
        >
          <div className="card-soft overflow-hidden backdrop-blur-sm">
            <div className="relative h-36 bg-gradient-to-br from-primary/15 via-accent/20 to-amber-200/30">
              <div className="absolute bottom-4 right-4 flex h-14 w-14 items-center justify-center rounded-full bg-match-high text-base font-semibold text-white shadow-card">
                92
              </div>
            </div>
            <div className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold">Марина, 23</div>
                  <div className="text-xs text-muted-foreground">Архитектор · Хамовники</div>
                </div>
                <span className="chip !px-2 !py-0.5">онлайн</span>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-1.5 text-[10px]">
                {[
                  { l: 'Чистота', t: 'match' },
                  { l: 'Ритм', t: 'match' },
                  { l: 'Гости', t: 'mid' },
                ].map((x) => (
                  <div key={x.l} className={`rounded-lg px-2 py-1.5 text-center ${x.t === 'match' ? 'bg-match-high/10 text-match-high' : 'bg-match-mid/10 text-match-mid'}`}>
                    {x.l}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

/* ─── WHY IT BREAKS — one strong narrative, not numbered grid ─── */
function WhyItBreaksSection() {
  const reasons = [
    { pct: '60%', title: 'Бытовые привычки', note: 'Чистота, шум, гости, сон. На эти четыре вещи приходится большинство ссор.' },
    { pct: '3 из 4', title: 'Съезжают раньше срока', note: 'Не из-за квартиры. Из-за соседа, с которым не совпали по ритму.' },
    { pct: '40 часов', title: 'Потрачено на переписку', note: 'Среднее время, которое уходит на одну квартиру в «бесконечных вопросах».' },
  ]

  return (
    <section className="border-t border-border/60 bg-muted/30">
      <div className="container mx-auto px-6 py-24 md:py-32">
        <motion.div {...rise} className="grid gap-10 md:grid-cols-[5fr_7fr] md:gap-16">
          <div>
            <Eyebrow>живая боль</Eyebrow>
            <h2 className="mt-4 font-display text-4xl font-bold leading-tight tracking-tight md:text-5xl text-balance">
              Людей объявления не показывают.
            </h2>
            <p className="mt-6 text-base leading-relaxed text-muted-foreground">
              Анкет-фильтров по квартирам сотни. По людям — ни одного. В итоге ты подписываешь
              договор с метражом, а живёшь с человеком, про которого не знаешь ничего, кроме фото.
            </p>
            <blockquote className="mt-8 border-l-2 border-primary/60 pl-5 text-sm italic leading-relaxed text-foreground/80">
              «Нашла идеальную квартиру. Съехала через месяц — сосед курил на кухне, а на просмотре сказал, что бросил.»
              <footer className="mt-2 not-italic text-xs text-muted-foreground">— Аня, 27</footer>
            </blockquote>
          </div>

          <div className="grid gap-3">
            {reasons.map((r, i) => (
              <motion.div key={i} {...rise} transition={{ ...rise.transition, delay: i * 0.08 }} className="card-soft flex items-center gap-6 p-6">
                <div className="font-display text-5xl font-bold tracking-tighter text-foreground">{r.pct}</div>
                <div className="flex-1">
                  <div className="font-semibold">{r.title}</div>
                  <div className="mt-1 text-sm leading-relaxed text-muted-foreground">{r.note}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}

/* ─── HOW IT WORKS — 3 feature pillars, not 4-step flow ─── */
function HowItWorksSection() {
  const pillars = [
    {
      tag: 'Алгоритм',
      title: 'Взвешенная совместимость',
      body: 'Курение, сон и аллергии — дилбрейкеры, обнуляют матч. Чистота и шум весят в 3×. Всё остальное — обычный вес.',
      hint: 'ровно 12 параметров',
    },
    {
      tag: 'Анкета',
      title: 'Визуальные варианты, не поля',
      body: '«Сова» или «жаворонок»? Картинка и три кнопки. Никаких свободных форм, никаких эссе о себе.',
      hint: 'медиана 1:47',
    },
    {
      tag: 'Чат',
      title: 'Без обмена номерами',
      body: 'Пишешь напрямую в Roomy. Видно, кто онлайн, кто отвечает, кто фантом. Telegram — одной кнопкой, если захочешь.',
      hint: 'фолбэк на TG',
    },
  ]

  return (
    <section id="how" className="relative">
      <div className="container mx-auto px-6 py-24 md:py-32">
        <motion.div {...rise} className="max-w-2xl">
          <Eyebrow>как устроен Roomy</Eyebrow>
          <h2 className="mt-4 font-display text-4xl font-bold leading-tight tracking-tight md:text-5xl text-balance">
            Три вещи, которые делают матч — матчем.
          </h2>
        </motion.div>

        <div className="mt-14 grid gap-5 md:grid-cols-3">
          {pillars.map((p, i) => (
            <motion.article
              key={i}
              {...rise}
              transition={{ ...rise.transition, delay: i * 0.08 }}
              className="card-soft group relative overflow-hidden p-7 transition-all hover:-translate-y-1 hover:shadow-card-hover"
            >
              <div className="absolute -top-20 -right-20 h-40 w-40 rounded-full bg-primary/10 opacity-0 blur-3xl transition-opacity group-hover:opacity-100" aria-hidden />
              <div className="chip">{p.tag}</div>
              <h3 className="mt-5 font-display text-xl font-semibold tracking-tight">{p.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{p.body}</p>
              <div className="mt-6 flex items-center gap-2 text-xs font-medium text-primary">
                <span className="h-1 w-1 rounded-full bg-primary" /> {p.hint}
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ─── MATCH PREVIEW — interactive-looking compatibility card ─── */
function MatchPreviewSection() {
  return (
    <section id="match" className="relative border-y border-border/60 bg-muted/30">
      <div className="container mx-auto grid gap-10 px-6 py-24 md:grid-cols-[1fr_1fr] md:gap-16 md:py-32">
        <motion.div {...rise} className="md:pt-10">
          <Eyebrow>совместимость в цифрах</Eyebrow>
          <h2 className="mt-4 font-display text-4xl font-bold leading-tight tracking-tight md:text-5xl text-balance">
            Видно, где совпали.<br />И где — не судьба.
          </h2>
          <p className="mt-6 max-w-md text-base leading-relaxed text-muted-foreground">
            Каждый процент совпадения разложен по строчкам. Никакой магии, никакого чёрного ящика:
            если что-то не сошлось, сразу видно — что именно.
          </p>
          <ul className="mt-8 space-y-3 text-sm">
            {[
              'Дилбрейкеры подсвечены отдельно',
              'Частичные совпадения — отмечены, не спрятаны',
              'Можно открыть полное сравнение с объяснением',
            ].map((t) => (
              <li key={t} className="flex items-start gap-2 text-foreground/80">
                <Check className="mt-0.5 h-4 w-4 flex-none text-match-high" />
                {t}
              </li>
            ))}
          </ul>
        </motion.div>

        <motion.div {...rise} transition={{ ...rise.transition, delay: 0.12 }}>
          <div className="card-soft relative overflow-hidden p-7">
            <div className="pointer-events-none absolute -right-20 -top-20 h-48 w-48 rounded-full bg-primary/15 blur-2xl" aria-hidden />
            <div className="relative flex items-center justify-between">
              <div className="text-sm">
                <div className="font-semibold">Илья, 28</div>
                <div className="text-xs text-muted-foreground">ищет соседа</div>
              </div>
              <div className="flex items-baseline gap-1 font-display text-6xl font-bold tracking-tighter">
                89<span className="text-2xl text-muted-foreground">%</span>
              </div>
              <div className="text-sm text-right">
                <div className="font-semibold">Марина, 23</div>
                <div className="text-xs text-muted-foreground">ищет соседку</div>
              </div>
            </div>
            <div className="mt-6 space-y-2">
              {[
                { label: 'Чистота', left: 'Очень чисто', right: 'Очень чисто', match: true },
                { label: 'Ритм сна', left: '23:30', right: 'Нейтр.', match: true },
                { label: 'Курение', left: 'Никогда', right: 'Никогда', match: true },
                { label: 'Гости', left: 'Редко', right: 'Иногда', match: false },
                { label: 'Собаки', left: 'Нет', right: 'Есть', match: false },
              ].map((row) => (
                <div key={row.label} className="flex items-center gap-3 rounded-xl bg-muted/60 px-4 py-2.5 text-sm">
                  <span className="w-24 flex-none text-muted-foreground">{row.label}</span>
                  <span className="flex-1 text-foreground/85">{row.left}</span>
                  {row.match
                    ? <Check className="h-4 w-4 text-match-high" />
                    : <X className="h-4 w-4 text-muted-foreground/70" />}
                  <span className="flex-1 text-right text-foreground/85">{row.right}</span>
                </div>
              ))}
            </div>
            <div className="mt-6 flex items-center justify-between border-t border-border/70 pt-4 text-xs text-muted-foreground">
              <span>2 несовпадения из 12</span>
              <span className="text-primary">Открыть полное сравнение →</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

/* ─── SURVEY — single focused visual ─── */
function SurveySection() {
  const [active, setActive] = useState(1)
  const options = [
    { label: 'Жаворонок', sub: 'до 23:00', emoji: '🌅' },
    { label: 'Нейтрально', sub: '23:00–01:00', emoji: '🌙' },
    { label: 'Сова', sub: 'после 01:00', emoji: '🦉' },
  ]

  return (
    <section className="relative">
      <div className="container mx-auto grid items-center gap-12 px-6 py-24 md:grid-cols-[7fr_5fr] md:py-32">
        <motion.div {...rise} transition={{ ...rise.transition, delay: 0.1 }}>
          <div className="card-soft overflow-hidden">
            <div className="flex items-center justify-between border-b border-border/60 bg-muted/30 px-6 py-4">
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span className="chip !px-2 !py-0.5">6 / 12</span>
                Привычки и ритм
              </div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="h-3.5 w-3.5" /> 1:47
              </div>
            </div>
            <div className="p-8">
              <p className="font-display text-2xl font-semibold tracking-tight">Во сколько обычно ложишься?</p>
              <div className="mt-6 grid grid-cols-3 gap-3">
                {options.map((opt, i) => (
                  <button
                    key={opt.label}
                    onClick={() => setActive(i)}
                    className={`flex flex-col items-center gap-2 rounded-2xl border p-5 text-center transition-all ${
                      active === i ? 'border-primary bg-primary/5 shadow-card' : 'border-border/70 bg-card hover:border-border'
                    }`}
                  >
                    <div className="text-2xl">{opt.emoji}</div>
                    <div className="text-sm font-semibold">{opt.label}</div>
                    <div className="text-xs text-muted-foreground">{opt.sub}</div>
                  </button>
                ))}
              </div>
              <div className="mt-6 h-1.5 overflow-hidden rounded-full bg-muted">
                <div className="h-full w-1/2 rounded-full bg-brand-gradient" />
              </div>
              <div className="mt-4 text-xs text-muted-foreground">Попробуй — это настоящий вопрос из анкеты.</div>
            </div>
          </div>
        </motion.div>

        <motion.div {...rise}>
          <Eyebrow>анкета</Eyebrow>
          <h2 className="mt-4 font-display text-4xl font-bold leading-tight tracking-tight md:text-5xl text-balance">
            Дочитывают <span className="text-muted-foreground">до конца.</span>
          </h2>
          <p className="mt-6 text-base leading-relaxed text-muted-foreground">
            12 визуальных вопросов вместо бесконечного списка чекбоксов. Медиана — одна минута сорок семь секунд.
            Мы не спрашиваем про хобби и «расскажите о себе» — только то, из-за чего потом ссорятся.
          </p>
        </motion.div>
      </div>
    </section>
  )
}

/* ─── TESTIMONIALS — masonry, not deck-grid ─── */
function TestimonialsSection() {
  const quotes = [
    { text: 'Я сова, он жаворонок. За две недели оба перестали спать. С Roomy нашла такого же ночного, как я — вопросов вообще не стало.', name: 'Егор, 31', tall: false },
    { text: 'Искал соседа два месяца. Поговорил с сорока людьми. Здесь — четыре карточки, два ответа, заселился.', name: 'Тоня, 25', tall: true },
    { text: 'Попробовала интереса ради — алгоритм прямо сказал, что у нас с лучшей подругой 54%. Чуть не сняли вместе квартиру.', name: 'Катя, 22', tall: false },
    { text: 'Ни разу в жизни не ссорился из-за мусора. Не уверен, что это из-за Roomy, но связь ощущаю.', name: 'Миша, 29', tall: true },
  ]

  return (
    <section className="relative border-y border-border/60 bg-muted/30">
      <div className="container mx-auto px-6 py-24 md:py-32">
        <motion.div {...rise} className="flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-xl">
            <Eyebrow>что говорят</Eyebrow>
            <h2 className="mt-4 font-display text-4xl font-bold leading-tight tracking-tight md:text-5xl text-balance">
              Реальные истории. <span className="text-muted-foreground">Не маркетинг.</span>
            </h2>
          </div>
          <div className="text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">4.8 / 5</span> · по отзывам первых пользователей
          </div>
        </motion.div>

        <div className="mt-14 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {quotes.map((q, i) => (
            <motion.blockquote
              key={i}
              {...rise}
              transition={{ ...rise.transition, delay: i * 0.06 }}
              className={`card-soft p-6 ${q.tall ? 'md:row-span-2' : ''}`}
            >
              <MessageCircle className="h-5 w-5 text-primary/60" />
              <p className="mt-4 text-sm leading-relaxed text-foreground/85">«{q.text}»</p>
              <footer className="mt-5 flex items-center gap-3 text-xs text-muted-foreground">
                <div className="h-7 w-7 rounded-full bg-gradient-to-br from-primary/60 to-accent/60" />
                {q.name}
              </footer>
            </motion.blockquote>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ─── FAQ — user-facing, not pitch-facing ─── */
function FaqSection() {
  const faq = [
    {
      q: 'А это правда бесплатно?',
      a: 'Да, пока мы растём. Основные фичи — анкета, матч, чат — никогда не станут платными. Позже появятся опциональные надстройки (верификация паспортом, расширенный поиск), но базовый продукт останется как есть.',
    },
    {
      q: 'Что с моими данными?',
      a: 'Профиль видят только те, с кем у тебя совпало выше 50%. Телефон и паспорт мы не просим. Удалить аккаунт — одна кнопка в настройках, всё сносится в ноль.',
    },
    {
      q: 'Как вы считаете совместимость?',
      a: 'Взвешенная сумма по 12 параметрам. Дилбрейкеры (курение, аллергии, радикально разный режим сна) обнуляют матч. Чистота, шум и гости весят в 3×. Остальное — обычный вес. Формула открытая.',
    },
    {
      q: 'Где я живу — там кто-то есть?',
      a: 'Сейчас лучше всего покрыты Москва и Питер. Екатеринбург, Казань, Новосиб — растут. Если в твоём городе пусто, ты сразу увидишь это в ленте, а мы напишем, когда появятся кандидаты.',
    },
    {
      q: 'А если я интроверт и не хочу переписываться?',
      a: 'Анкета сделана ровно так, чтобы сократить переписку до минимума. Видишь карточку → понимаешь, сходитесь вы или нет → пишешь только тем, у кого матч высокий. Никаких «расскажите о себе».',
    },
  ]
  const [open, setOpen] = useState<number | null>(0)

  return (
    <section id="faq" className="relative">
      <div className="container mx-auto grid gap-12 px-6 py-24 md:grid-cols-[5fr_7fr] md:py-32">
        <div>
          <Eyebrow>часто спрашивают</Eyebrow>
          <h2 className="mt-4 font-display text-4xl font-bold leading-tight tracking-tight md:text-5xl text-balance">
            Короткие ответы <br />на длинные сомнения.
          </h2>
          <p className="mt-6 max-w-sm text-sm leading-relaxed text-muted-foreground">
            Если твоего вопроса нет — напиши нам в Telegram @roomylive, обновим эту секцию.
          </p>
        </div>

        <div className="space-y-3">
          {faq.map((f, i) => {
            const isOpen = open === i
            return (
              <motion.div key={i} {...rise} transition={{ ...rise.transition, delay: i * 0.04 }}>
                <button
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="group flex w-full items-center justify-between gap-4 rounded-2xl border border-border/70 bg-card px-6 py-5 text-left shadow-card transition-colors hover:bg-card"
                >
                  <span className="font-semibold">{f.q}</span>
                  <ChevronDown className={`h-5 w-5 flex-none text-muted-foreground transition-transform ${isOpen ? 'rotate-180 text-primary' : ''}`} />
                </button>
                <motion.div
                  initial={false}
                  animate={{ height: isOpen ? 'auto' : 0, opacity: isOpen ? 1 : 0 }}
                  transition={{ duration: 0.25, ease: [0.2, 0.8, 0.2, 1] }}
                  className="overflow-hidden"
                >
                  <div className="px-6 py-4 text-sm leading-relaxed text-muted-foreground">{f.a}</div>
                </motion.div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

/* ─── FINAL CTA — still uses wordmark, but simpler than deck finale ─── */
function FinalCta() {
  return (
    <section className="relative overflow-hidden border-t border-border/60">
      <div className="absolute inset-0 bg-mesh" aria-hidden />
      <div className="pointer-events-none absolute left-1/2 top-0 h-[400px] w-[800px] -translate-x-1/2 rounded-full bg-brand-gradient opacity-40 blur-3xl" aria-hidden />

      <div className="container relative mx-auto max-w-3xl px-6 py-28 text-center md:py-36">
        <motion.div {...rise}>
          <Eyebrow>давай попробуем</Eyebrow>
          <h2 className="mt-6 font-display text-5xl font-bold leading-[0.95] tracking-tighter md:text-7xl text-balance">
            Сосед, <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">с которым уживёшься</span>, ждёт в ленте.
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-base text-muted-foreground md:text-lg">
            Две минуты на регистрацию. Ещё одна минуту сорок семь — на анкету. Дальше — твоя лента.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <Link href="/signup" className="btn-primary group">
              Начать сейчас
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link href="/signin" className="btn-ghost">
              Уже есть аккаунт
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

function SiteFooter() {
  return (
    <footer className="border-t border-border/60 bg-background">
      <div className="container mx-auto flex flex-wrap items-center justify-between gap-4 px-6 py-8 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <span className="inline-block h-2 w-2 rounded-full bg-brand-gradient" />
          &copy; 2026 Roomy · IMI Labs
        </div>
        <div className="flex gap-6">
          <Link href="/signup" className="hover:text-foreground">Регистрация</Link>
          <Link href="/signin" className="hover:text-foreground">Войти</Link>
          <a href="#faq" className="hover:text-foreground">Вопросы</a>
        </div>
      </div>
    </footer>
  )
}
