'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  AlertTriangle,
  ArrowUpDown,
  Bookmark,
  BookmarkCheck,
  Check,
  ChevronDown,
  Heart,
  MessageCircle,
  Search,
  SlidersHorizontal,
  Sparkles,
  X,
} from 'lucide-react'
import { signOut, useSession } from 'next-auth/react'
import { useToast } from '@/lib/hooks/use-toast'
import {
  CATEGORY_META,
  categoryScore,
  FIELD_META,
  scoreTone,
  type SurveyCategory,
} from '@/lib/survey-dict'
import type { SurveyData } from '@/lib/matching'

type Breakdown = {
  dealbreakers: { passed: boolean; reason?: string }
  highWeight: { score: number; max: number }
  normalWeight: { score: number; max: number }
}

type Match = {
  user: {
    id: string
    name: string
    avatarUrl?: string | null
    profile: {
      city?: string | null
      age?: number | null
      bio?: string | null
      budgetMin?: number | null
      budgetMax?: number | null
      gender?: string | null
      moveInDate?: string | null
    } | null
    survey: SurveyData
  }
  score: number
  dealbreakerConflict: boolean
  dealbreakerReason?: string
  breakdown: Breakdown
}

type SortKey = 'match' | 'new' | 'budget'
type TabKey = 'all' | 'recommended' | 'saved' | 'blocked'

const STORAGE_KEY_SAVED = 'roomy.saved'
const STORAGE_KEY_HIDDEN = 'roomy.hidden'

function useLocalSet(key: string) {
  const [items, setItems] = useState<Set<string>>(new Set())

  useEffect(() => {
    try {
      const raw = typeof window !== 'undefined' ? localStorage.getItem(key) : null
      if (raw) setItems(new Set(JSON.parse(raw)))
    } catch {
      /* ignore */
    }
  }, [key])

  const persist = (next: Set<string>) => {
    setItems(next)
    try {
      localStorage.setItem(key, JSON.stringify(Array.from(next)))
    } catch {
      /* ignore */
    }
  }

  const toggle = (id: string) => {
    const next = new Set(items)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    persist(next)
  }

  return { items, toggle, has: (id: string) => items.has(id) }
}

export default function SearchPage() {
  const { data: session } = useSession()
  const { error: showError } = useToast()

  const [matches, setMatches] = useState<Match[]>([])
  const [currentSurvey, setCurrentSurvey] = useState<SurveyData | null>(null)
  const [loading, setLoading] = useState(true)

  const [query, setQuery] = useState('')
  const [city, setCity] = useState<string>('all')
  const [minBudget, setMinBudget] = useState<number | ''>('')
  const [maxBudget, setMaxBudget] = useState<number | ''>('')
  const [ageRange, setAgeRange] = useState<[number | '', number | '']>(['', ''])
  const [sortBy, setSortBy] = useState<SortKey>('match')
  const [tab, setTab] = useState<TabKey>('all')
  const [filtersOpen, setFiltersOpen] = useState(false)

  const saved = useLocalSet(STORAGE_KEY_SAVED)
  const hidden = useLocalSet(STORAGE_KEY_HIDDEN)

  useEffect(() => {
    let aborted = false
    ;(async () => {
      try {
        const res = await fetch('/api/search')
        if (!res.ok) {
          const err = await res.json().catch(() => ({}))
          if (!aborted) showError(err?.error ?? 'Не удалось загрузить ленту')
          return
        }
        const data = await res.json()
        if (aborted) return
        setMatches(data.matches ?? [])
        setCurrentSurvey(data.currentUserSurvey ?? null)
      } catch {
        if (!aborted) showError('Не удалось загрузить ленту')
      } finally {
        if (!aborted) setLoading(false)
      }
    })()
    return () => {
      aborted = true
    }
  }, [showError])

  const cities = useMemo(() => {
    const s = new Set<string>()
    matches.forEach((m) => m.user.profile?.city && s.add(m.user.profile.city))
    return Array.from(s).sort()
  }, [matches])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    const [minA, maxA] = ageRange
    return matches
      .filter((m) => {
        if (tab === 'saved' && !saved.has(m.user.id)) return false
        if (tab === 'blocked' && !hidden.has(m.user.id)) return false
        if (tab === 'recommended') {
          if (m.dealbreakerConflict) return false
          if (m.score < 70) return false
        }
        if (tab === 'all' && hidden.has(m.user.id)) return false

        if (q && !m.user.name.toLowerCase().includes(q)) return false
        if (city !== 'all' && m.user.profile?.city !== city) return false
        if (typeof minA === 'number' && (m.user.profile?.age ?? 0) < minA) return false
        if (typeof maxA === 'number' && (m.user.profile?.age ?? 999) > maxA) return false
        if (typeof minBudget === 'number' && (m.user.profile?.budgetMax ?? 0) < minBudget) return false
        if (typeof maxBudget === 'number' && (m.user.profile?.budgetMin ?? 0) > maxBudget) return false
        return true
      })
      .sort((a, b) => {
        if (sortBy === 'match') {
          if (a.dealbreakerConflict && !b.dealbreakerConflict) return 1
          if (!a.dealbreakerConflict && b.dealbreakerConflict) return -1
          return b.score - a.score
        }
        if (sortBy === 'budget') {
          return (a.user.profile?.budgetMin ?? 0) - (b.user.profile?.budgetMin ?? 0)
        }
        return a.user.name.localeCompare(b.user.name)
      })
  }, [matches, tab, query, city, ageRange, minBudget, maxBudget, sortBy, saved, hidden])

  const counts = useMemo(() => {
    const recommended = matches.filter((m) => !m.dealbreakerConflict && m.score >= 70).length
    const savedCount = matches.filter((m) => saved.has(m.user.id)).length
    const hiddenCount = matches.filter((m) => hidden.has(m.user.id)).length
    return { all: matches.length, recommended, saved: savedCount, blocked: hiddenCount }
  }, [matches, saved, hidden])

  return (
    <div className="relative min-h-screen bg-background">
      <TopNav user={session?.user as { name?: string | null; email?: string | null; avatarUrl?: string | null } | undefined} />

      {/* Hero strip */}
      <section className="relative overflow-hidden border-b border-border/60">
        <div className="absolute inset-0 bg-mesh" aria-hidden />
        <div className="container relative mx-auto px-6 pt-10 pb-8">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-card/70 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.2em] text-muted-foreground backdrop-blur">
                <span className="h-1 w-1 rounded-full bg-primary" /> ваша лента
              </div>
              <h1 className="mt-4 font-display text-4xl font-bold tracking-tight md:text-5xl">
                {loading ? 'Считаем…' : `${counts.all} кандидат${pluralize(counts.all, 'ов', '', 'а')} в соседи`}
              </h1>
              <p className="mt-2 max-w-xl text-sm text-muted-foreground">
                Сверху — самые совместимые. Снизу — те, у кого с тобой дилбрейкер.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Имя"
                  className="w-48 rounded-full border border-border/70 bg-card py-2 pl-9 pr-3 text-sm outline-none transition-colors focus:border-primary focus:ring-4 focus:ring-primary/10"
                />
              </div>

              <SortDropdown value={sortBy} onChange={setSortBy} />

              <button
                onClick={() => setFiltersOpen((v) => !v)}
                className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                  filtersOpen ? 'border-primary bg-primary/5 text-primary' : 'border-border/70 bg-card text-foreground hover:bg-muted'
                }`}
              >
                <SlidersHorizontal className="h-4 w-4" /> Фильтры
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="mt-8 flex flex-wrap gap-1 border-b border-border/50">
            {([
              { k: 'all' as const, label: 'Все', count: counts.all },
              { k: 'recommended' as const, label: 'Рекомендуем', count: counts.recommended, emoji: '⭐️' },
              { k: 'saved' as const, label: 'Сохранённые', count: counts.saved },
              { k: 'blocked' as const, label: 'Скрытые', count: counts.blocked },
            ]).map((t) => {
              const active = tab === t.k
              return (
                <button
                  key={t.k}
                  onClick={() => setTab(t.k)}
                  className={`relative px-4 py-2.5 text-sm transition-colors ${
                    active ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    {t.emoji && <span className="text-xs">{t.emoji}</span>}
                    {t.label}
                    <span className={`ml-1 rounded-full px-1.5 text-[11px] ${active ? 'bg-primary/15 text-primary' : 'bg-muted text-muted-foreground'}`}>
                      {t.count}
                    </span>
                  </span>
                  {active && <motion.span layoutId="tab-underline" className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-primary" />}
                </button>
              )
            })}
          </div>

          {/* Advanced filters */}
          <AnimatePresence>
            {filtersOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.22, ease: [0.2, 0.8, 0.2, 1] }}
                className="overflow-hidden"
              >
                <div className="mt-6 grid gap-4 rounded-2xl border border-border/70 bg-card/70 p-5 backdrop-blur md:grid-cols-4">
                  <div>
                    <label className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground">Город</label>
                    <select
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="mt-2 w-full rounded-xl border border-border/70 bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"
                    >
                      <option value="all">Все города</option>
                      {cities.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground">Возраст</label>
                    <div className="mt-2 flex items-center gap-2">
                      <NumberInput placeholder="от" value={ageRange[0]} onChange={(v) => setAgeRange([v, ageRange[1]])} />
                      <span className="text-xs text-muted-foreground">—</span>
                      <NumberInput placeholder="до" value={ageRange[1]} onChange={(v) => setAgeRange([ageRange[0], v])} />
                    </div>
                  </div>
                  <div>
                    <label className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground">Бюджет, ₽ (от/до)</label>
                    <div className="mt-2 flex items-center gap-2">
                      <NumberInput placeholder="от" value={minBudget} onChange={setMinBudget} />
                      <span className="text-xs text-muted-foreground">—</span>
                      <NumberInput placeholder="до" value={maxBudget} onChange={setMaxBudget} />
                    </div>
                  </div>
                  <div className="flex items-end">
                    <button
                      onClick={() => {
                        setCity('all')
                        setAgeRange(['', ''])
                        setMinBudget('')
                        setMaxBudget('')
                        setQuery('')
                      }}
                      className="btn-ghost w-full py-2 text-sm"
                    >
                      Сбросить
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* Grid */}
      <section className="container mx-auto px-6 py-10">
        {loading ? (
          <SkeletonGrid />
        ) : filtered.length === 0 ? (
          <EmptyState tab={tab} />
        ) : (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.04 } } }}
            className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
          >
            <AnimatePresence mode="popLayout">
              {filtered.map((m) => (
                <MatchCard
                  key={m.user.id}
                  match={m}
                  currentSurvey={currentSurvey}
                  saved={saved.has(m.user.id)}
                  hidden={hidden.has(m.user.id)}
                  onSaveToggle={() => saved.toggle(m.user.id)}
                  onHideToggle={() => hidden.toggle(m.user.id)}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </section>
    </div>
  )
}

/* ──────────── small pieces ──────────── */

function TopNav({ user }: { user?: { name?: string | null; email?: string | null; avatarUrl?: string | null } }) {
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <div className="container mx-auto flex h-16 items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2 font-display text-xl font-bold tracking-tight">
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-brand-gradient" />
          Roomy
        </Link>
        <nav className="hidden items-center gap-1 md:flex">
          <Link href="/search" className="rounded-full bg-muted px-3 py-2 text-sm font-medium text-foreground">Лента</Link>
          <Link href="/chats" className="rounded-full px-3 py-2 text-sm text-muted-foreground hover:text-foreground">Сообщения</Link>
          <Link href="/profile/edit" className="rounded-full px-3 py-2 text-sm text-muted-foreground hover:text-foreground">Мой профиль</Link>
        </nav>
        <div className="flex items-center gap-3">
          <div className="hidden text-right text-xs text-muted-foreground md:block">
            <div className="font-medium text-foreground">{user?.name ?? '—'}</div>
            <div>{user?.email ?? ''}</div>
          </div>
          <div className="h-9 w-9 rounded-full bg-gradient-to-br from-primary to-accent" />
          <button
            onClick={() => signOut({ callbackUrl: '/' })}
            className="text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          >
            Выйти
          </button>
        </div>
      </div>
    </header>
  )
}

function NumberInput({ placeholder, value, onChange }: { placeholder: string; value: number | ''; onChange: (v: number | '') => void }) {
  return (
    <input
      type="number"
      placeholder={placeholder}
      value={value}
      onChange={(e) => {
        const v = e.target.value
        onChange(v === '' ? '' : Number(v))
      }}
      className="w-full rounded-xl border border-border/70 bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"
    />
  )
}

function SortDropdown({ value, onChange }: { value: SortKey; onChange: (v: SortKey) => void }) {
  const [open, setOpen] = useState(false)
  const options: { k: SortKey; label: string }[] = [
    { k: 'match', label: 'По совместимости' },
    { k: 'budget', label: 'По бюджету' },
    { k: 'new', label: 'По имени' },
  ]
  const current = options.find((o) => o.k === value)?.label ?? ''

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        onBlur={() => setTimeout(() => setOpen(false), 120)}
        className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-card px-4 py-2 text-sm font-medium transition-colors hover:bg-muted"
      >
        <ArrowUpDown className="h-4 w-4" />
        {current}
        <ChevronDown className="h-3.5 w-3.5" />
      </button>
      <AnimatePresence>
        {open && (
          <motion.ul
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full z-30 mt-2 w-52 overflow-hidden rounded-2xl border border-border/70 bg-card shadow-card"
          >
            {options.map((opt) => (
              <li key={opt.k}>
                <button
                  onClick={() => {
                    onChange(opt.k)
                    setOpen(false)
                  }}
                  className={`flex w-full items-center justify-between px-4 py-2.5 text-left text-sm transition-colors hover:bg-muted ${
                    opt.k === value ? 'text-primary' : 'text-foreground'
                  }`}
                >
                  {opt.label}
                  {opt.k === value && <Check className="h-4 w-4" />}
                </button>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  )
}

function MatchCard({
  match,
  currentSurvey,
  saved,
  hidden,
  onSaveToggle,
  onHideToggle,
}: {
  match: Match
  currentSurvey: SurveyData | null
  saved: boolean
  hidden: boolean
  onSaveToggle: () => void
  onHideToggle: () => void
}) {
  const tone = scoreTone(match.score, match.dealbreakerConflict)
  const { user, dealbreakerConflict, dealbreakerReason, score } = match

  // Category scores for micro-bars
  const categoryScores = useMemo(() => {
    if (!currentSurvey) return null
    return (Object.keys(CATEGORY_META) as SurveyCategory[]).map((cat) => ({
      key: cat,
      label: CATEGORY_META[cat].label,
      emoji: CATEGORY_META[cat].emoji,
      score: categoryScore(cat, currentSurvey, user.survey),
    }))
  }, [currentSurvey, user.survey])

  // Top matches + conflicts (non-dealbreaker)
  const topMatches = useMemo(() => {
    if (!currentSurvey) return []
    const out: { label: string; emoji: string }[] = []
    for (const key of Object.keys(FIELD_META) as (keyof typeof FIELD_META)[]) {
      const a = currentSurvey[key]
      const b = user.survey[key]
      if (a && a === b) out.push({ label: FIELD_META[key].label, emoji: FIELD_META[key].emoji })
      if (out.length >= 3) break
    }
    return out
  }, [currentSurvey, user.survey])

  return (
    <motion.article
      layout
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.2, 0.8, 0.2, 1] } },
      }}
      exit={{ opacity: 0, scale: 0.96, transition: { duration: 0.2 } }}
      className={`card-soft group relative flex flex-col overflow-hidden transition-all hover:-translate-y-1 hover:shadow-card-hover ${
        hidden ? 'opacity-50' : ''
      }`}
    >
      {/* Header strip */}
      <div className="relative border-b border-border/60 bg-gradient-to-br from-primary/5 via-accent/5 to-transparent p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              {user.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={user.avatarUrl} alt={user.name} className="h-14 w-14 rounded-full object-cover" />
              ) : (
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-primary/70 to-accent/70 text-lg font-semibold text-white">
                  {user.name.charAt(0)}
                </div>
              )}
              <span className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-card bg-match-high" />
            </div>
            <div>
              <div className="font-semibold leading-tight">{user.name}</div>
              <div className="mt-0.5 text-xs text-muted-foreground">
                {user.profile?.city ?? '—'} · {user.profile?.age ?? '?'}
                {user.profile?.gender ? ` · ${user.profile.gender === 'Male' ? 'муж.' : 'жен.'}` : ''}
              </div>
            </div>
          </div>

          <MatchBadge score={score} tone={tone.tone} />
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span
            className="chip"
            style={{
              borderColor: `${tone.color}40`,
              background: `${tone.color}10`,
              color: tone.color,
            }}
          >
            {tone.label}
          </span>
          {dealbreakerConflict && dealbreakerReason && (
            <span className="inline-flex items-center gap-1 rounded-full bg-destructive/10 px-2.5 py-0.5 text-[11px] font-medium text-destructive">
              <AlertTriangle className="h-3 w-3" /> {translateReason(dealbreakerReason)}
            </span>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 p-5">
        {user.profile?.bio && (
          <p className="text-sm leading-relaxed text-foreground/80">
            {user.profile.bio.length > 110 ? user.profile.bio.slice(0, 108) + '…' : user.profile.bio}
          </p>
        )}

        {categoryScores && !dealbreakerConflict && (
          <div className="mt-5 space-y-2">
            {categoryScores.map((c) => (
              <div key={c.key} className="flex items-center gap-3 text-xs">
                <span className="w-5 text-center text-sm">{c.emoji}</span>
                <span className="w-28 flex-none text-muted-foreground">{c.label}</span>
                <div className="relative h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${c.score}%`,
                      background: c.score >= 80 ? 'hsl(var(--match-high))' : c.score >= 60 ? 'hsl(var(--match-mid))' : 'hsl(var(--match-low))',
                    }}
                  />
                </div>
                <span className="w-10 text-right font-medium tabular-nums">{c.score}%</span>
              </div>
            ))}
          </div>
        )}

        {topMatches.length > 0 && !dealbreakerConflict && (
          <div className="mt-5 flex flex-wrap gap-1.5">
            {topMatches.map((t) => (
              <span key={t.label} className="inline-flex items-center gap-1 rounded-full bg-match-high/10 px-2.5 py-0.5 text-[11px] font-medium text-match-high">
                <Check className="h-3 w-3" /> {t.emoji} {t.label}
              </span>
            ))}
          </div>
        )}

        {user.profile?.budgetMin && user.profile?.budgetMax && (
          <div className="mt-5 flex items-center justify-between rounded-xl bg-muted/60 px-3 py-2 text-xs">
            <span className="text-muted-foreground">Бюджет</span>
            <span className="font-medium tabular-nums">{fmtRub(user.profile.budgetMin)} – {fmtRub(user.profile.budgetMax)}</span>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 border-t border-border/60 p-4">
        <Link
          href={`/profile/${user.id}`}
          className="flex-1 rounded-full border border-border/70 bg-card py-2 text-center text-sm font-medium transition-colors hover:bg-muted"
        >
          Профиль
        </Link>
        <Link
          href={`/chats/${user.id}`}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-full bg-foreground py-2 text-sm font-medium text-background transition-colors hover:bg-foreground/90"
        >
          <MessageCircle className="h-4 w-4" /> Написать
        </Link>
        <button
          onClick={onSaveToggle}
          aria-label={saved ? 'Убрать из сохранённых' : 'Сохранить'}
          className={`inline-flex h-9 w-9 items-center justify-center rounded-full border transition-colors ${
            saved ? 'border-primary bg-primary/10 text-primary' : 'border-border/70 bg-card text-muted-foreground hover:text-foreground'
          }`}
        >
          {saved ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
        </button>
        <button
          onClick={onHideToggle}
          aria-label={hidden ? 'Вернуть в ленту' : 'Скрыть'}
          className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border/70 bg-card text-muted-foreground transition-colors hover:text-foreground"
        >
          {hidden ? <Heart className="h-4 w-4" /> : <X className="h-4 w-4" />}
        </button>
      </div>
    </motion.article>
  )
}

function MatchBadge({ score, tone }: { score: number; tone: 'high' | 'mid' | 'low' | 'block' }) {
  const bg =
    tone === 'block' ? 'bg-destructive' :
    tone === 'high' ? 'bg-match-high' :
    tone === 'mid' ? 'bg-match-mid' :
    'bg-muted text-foreground'
  const txt = tone === 'low' ? 'text-foreground' : 'text-white'
  return (
    <div className={`flex h-14 w-14 flex-none flex-col items-center justify-center rounded-full shadow-card ${bg} ${txt}`}>
      <span className="font-display text-lg font-bold tabular-nums leading-none">{tone === 'block' ? '0' : score}</span>
      <span className="text-[9px] font-medium uppercase tracking-wider opacity-80">%</span>
    </div>
  )
}

function SkeletonGrid() {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="card-soft overflow-hidden">
          <div className="border-b border-border/60 p-5">
            <div className="flex items-center gap-3">
              <div className="h-14 w-14 animate-pulse rounded-full bg-muted" />
              <div className="flex-1 space-y-2">
                <div className="h-3 w-1/2 animate-pulse rounded-full bg-muted" />
                <div className="h-2.5 w-1/3 animate-pulse rounded-full bg-muted" />
              </div>
              <div className="h-14 w-14 animate-pulse rounded-full bg-muted" />
            </div>
          </div>
          <div className="space-y-3 p-5">
            <div className="h-3 w-5/6 animate-pulse rounded-full bg-muted" />
            <div className="h-3 w-4/6 animate-pulse rounded-full bg-muted" />
            <div className="h-2 w-full animate-pulse rounded-full bg-muted" />
            <div className="h-2 w-full animate-pulse rounded-full bg-muted" />
          </div>
        </div>
      ))}
    </div>
  )
}

function EmptyState({ tab }: { tab: TabKey }) {
  const copy: Record<TabKey, { title: string; body: string }> = {
    all: {
      title: 'Лента пуста',
      body: 'Никого не нашли по твоему профилю. Проверь анкету или возвращайся позже — новые пользователи появляются каждый день.',
    },
    recommended: {
      title: 'Пока без рекомендаций',
      body: 'Это те, у кого совместимость ≥ 70% и нет дилбрейкеров. Поправь фильтры или посмотри все совпадения.',
    },
    saved: {
      title: 'Нет сохранённых',
      body: 'Нажми на иконку закладки на карточке, чтобы вернуться к ней позже.',
    },
    blocked: {
      title: 'Скрытых нет',
      body: 'Профили, которые ты скрыл, появятся здесь. Их можно вернуть в ленту одной кнопкой.',
    },
  }
  const c = copy[tab]
  return (
    <div className="card-soft mx-auto flex max-w-xl flex-col items-center gap-4 py-14 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
        <Sparkles className="h-6 w-6" />
      </div>
      <div>
        <div className="font-display text-2xl font-semibold">{c.title}</div>
        <p className="mt-2 max-w-sm text-sm text-muted-foreground">{c.body}</p>
      </div>
    </div>
  )
}

function fmtRub(n: number) {
  return new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', maximumFractionDigits: 0 }).format(n)
}

function pluralize(n: number, many: string, one: string, few: string) {
  const mod10 = n % 10
  const mod100 = n % 100
  if (mod10 === 1 && mod100 !== 11) return one
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return few
  return many
}

function translateReason(reason: string): string {
  const map: Record<string, string> = {
    'Smoking incompatibility': 'Курение',
    'Pets allergy conflict': 'Аллергия на питомцев',
    'Sleep schedule incompatibility': 'Разный режим сна',
  }
  return map[reason] ?? reason
}
