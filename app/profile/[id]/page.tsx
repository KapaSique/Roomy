'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { motion } from 'framer-motion'
import {
  AlertTriangle,
  ArrowLeft,
  Bookmark,
  BookmarkCheck,
  Check,
  Flag,
  Link as LinkIcon,
  MessageCircle,
  MoreHorizontal,
  Share2,
  ShieldCheck,
  Sparkles,
  X,
} from 'lucide-react'
import { useToast } from '@/lib/hooks/use-toast'
import {
  CATEGORY_META,
  categoryScore,
  compareField,
  FIELD_META,
  generateIcebreakers,
  scoreTone,
  translate,
  type SurveyCategory,
} from '@/lib/survey-dict'
import type { SurveyData } from '@/lib/matching'

type ProfileResponse = {
  user: {
    id: string
    email: string
    name: string
    avatarUrl?: string | null
    createdAt: string
    updatedAt: string
    profile: {
      city?: string | null
      budgetMin?: number | null
      budgetMax?: number | null
      moveInDate?: string | null
      bio?: string | null
      gender?: string | null
      age?: number | null
      status?: string | null
    } | null
    survey: SurveyData
  }
  currentUserSurvey: SurveyData | null
  compatibility: {
    score: number
    dealbreakerConflict: boolean
    dealbreakerReason?: string
    breakdown: {
      dealbreakers: { passed: boolean; reason?: string }
      highWeight: { score: number; max: number }
      normalWeight: { score: number; max: number }
    }
  } | null
  isOwnProfile: boolean
}

type SimilarMatch = {
  user: { id: string; name: string; avatarUrl?: string | null; profile: { city?: string | null; age?: number | null } | null }
  score: number
  dealbreakerConflict: boolean
}

export default function ProfileDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  useSession()
  const { success, error: showError } = useToast()

  const [data, setData] = useState<ProfileResponse | null>(null)
  const [similar, setSimilar] = useState<SimilarMatch[]>([])
  const [loading, setLoading] = useState(true)
  const [saved, setSaved] = useState(false)
  const [hidden, setHidden] = useState(false)
  const [moreOpen, setMoreOpen] = useState(false)

  useEffect(() => {
    let aborted = false
    ;(async () => {
      try {
        const [profileRes, searchRes] = await Promise.all([
          fetch(`/api/profile/${id}`),
          fetch('/api/search'),
        ])

        if (!profileRes.ok) {
          if (!aborted) showError('Профиль не найден')
          router.push('/search')
          return
        }

        const profileData: ProfileResponse = await profileRes.json()
        if (aborted) return
        setData(profileData)

        if (searchRes.ok) {
          const searchData = await searchRes.json()
          setSimilar(
            (searchData.matches as SimilarMatch[])
              .filter((m) => m.user.id !== id && !m.dealbreakerConflict)
              .slice(0, 3)
          )
        }
      } catch {
        if (!aborted) showError('Не удалось загрузить профиль')
      } finally {
        if (!aborted) setLoading(false)
      }
    })()
    return () => {
      aborted = true
    }
  }, [id, router, showError])

  // Load saved/hidden from localStorage
  useEffect(() => {
    try {
      const s = JSON.parse(localStorage.getItem('roomy.saved') ?? '[]') as string[]
      const h = JSON.parse(localStorage.getItem('roomy.hidden') ?? '[]') as string[]
      setSaved(s.includes(id as string))
      setHidden(h.includes(id as string))
    } catch {
      /* ignore */
    }
  }, [id])

  function toggleSaved() {
    try {
      const raw = localStorage.getItem('roomy.saved')
      const list: string[] = raw ? JSON.parse(raw) : []
      const next = list.includes(id as string) ? list.filter((x) => x !== id) : [...list, id as string]
      localStorage.setItem('roomy.saved', JSON.stringify(next))
      setSaved(next.includes(id as string))
      success(next.includes(id as string) ? 'Сохранено в избранное' : 'Убрано из избранного')
    } catch {
      /* ignore */
    }
  }

  function toggleHidden() {
    try {
      const raw = localStorage.getItem('roomy.hidden')
      const list: string[] = raw ? JSON.parse(raw) : []
      const next = list.includes(id as string) ? list.filter((x) => x !== id) : [...list, id as string]
      localStorage.setItem('roomy.hidden', JSON.stringify(next))
      setHidden(next.includes(id as string))
      success(next.includes(id as string) ? 'Профиль скрыт из ленты' : 'Профиль возвращён в ленту')
    } catch {
      /* ignore */
    }
  }

  function copyLink() {
    try {
      void navigator.clipboard?.writeText(window.location.href)
      success('Ссылка скопирована')
    } catch {
      showError('Не удалось скопировать ссылку')
    }
  }

  if (loading) return <ProfileSkeleton />
  if (!data) return null

  const { user, currentUserSurvey, compatibility, isOwnProfile } = data
  const tone = compatibility
    ? scoreTone(compatibility.score, compatibility.dealbreakerConflict)
    : { tone: 'low' as const, label: 'Нет анкеты', color: 'hsl(var(--muted-foreground))' }

  const categoryScores = currentUserSurvey
    ? (Object.keys(CATEGORY_META) as SurveyCategory[]).map((cat) => ({
        key: cat,
        label: CATEGORY_META[cat].label,
        emoji: CATEGORY_META[cat].emoji,
        score: categoryScore(cat, currentUserSurvey, user.survey),
      }))
    : []

  const icebreakers = currentUserSurvey ? generateIcebreakers(currentUserSurvey, user.survey) : []

  // shared categories count
  const sharedCount = currentUserSurvey
    ? (Object.keys(FIELD_META) as (keyof typeof FIELD_META)[]).filter((k) => currentUserSurvey[k] && currentUserSurvey[k] === user.survey[k]).length
    : 0

  const budgetOverlap =
    currentUserSurvey &&
    user.profile?.budgetMin != null &&
    user.profile?.budgetMax != null
      ? { min: user.profile.budgetMin, max: user.profile.budgetMax }
      : null

  return (
    <div className="relative min-h-screen bg-background">
      {/* Top Nav */}
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-xl">
        <div className="container mx-auto flex h-16 items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <button
              onClick={() => router.back()}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border/70 bg-card text-muted-foreground transition-colors hover:text-foreground"
              aria-label="Назад"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <Link href="/" className="ml-2 flex items-center gap-2 font-display text-xl font-bold tracking-tight">
              <span className="inline-block h-2.5 w-2.5 rounded-full bg-brand-gradient" />
              Roomy
            </Link>
          </div>

          <nav className="hidden items-center gap-1 md:flex">
            <Link href="/search" className="rounded-full px-3 py-2 text-sm text-muted-foreground hover:text-foreground">Лента</Link>
            <Link href="/chats" className="rounded-full px-3 py-2 text-sm text-muted-foreground hover:text-foreground">Сообщения</Link>
            <Link href="/profile/edit" className="rounded-full px-3 py-2 text-sm text-muted-foreground hover:text-foreground">Мой профиль</Link>
          </nav>
        </div>
      </header>

      {/* HERO */}
      <section className="relative overflow-hidden border-b border-border/60">
        <div className="absolute inset-0 bg-mesh" aria-hidden />
        <div className="pointer-events-none absolute -top-40 right-[-10%] h-[520px] w-[520px] rounded-full bg-brand-gradient opacity-40 blur-3xl" aria-hidden />

        <div className="container relative mx-auto grid items-start gap-10 px-6 pt-12 pb-14 md:grid-cols-[1.2fr_.8fr]">
          {/* Left — identity */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.2, 0.8, 0.2, 1] }}
            className="flex flex-col gap-6 md:flex-row md:items-center"
          >
            <div className="relative">
              {user.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={user.avatarUrl} alt={user.name} className="h-32 w-32 rounded-3xl object-cover shadow-card-hover" />
              ) : (
                <div className="flex h-32 w-32 items-center justify-center rounded-3xl bg-gradient-to-br from-primary to-accent text-4xl font-bold text-white shadow-card-hover">
                  {user.name.charAt(0)}
                </div>
              )}
              <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-background bg-match-high">
                <span className="h-2 w-2 rounded-full bg-white" />
              </span>
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-match-high/30 bg-match-high/10 px-2.5 py-0.5 text-[11px] font-medium text-match-high">
                  <ShieldCheck className="h-3 w-3" /> Анкета подтверждена
                </span>
                {user.profile?.status === 'looking' && (
                  <span className="chip">ищет соседа</span>
                )}
              </div>

              <h1 className="mt-3 font-display text-4xl font-bold leading-tight tracking-tight md:text-5xl">
                {user.name}
                {user.profile?.age && <span className="ml-2 text-muted-foreground">· {user.profile.age}</span>}
              </h1>

              <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                {user.profile?.city && <span>📍 {user.profile.city}</span>}
                {user.profile?.gender && <span>{user.profile.gender === 'Male' ? 'Мужчина' : 'Женщина'}</span>}
                {user.profile?.moveInDate && (
                  <span>Заезд: {new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'long' }).format(new Date(user.profile.moveInDate))}</span>
                )}
              </div>

              {user.profile?.bio && (
                <p className="mt-5 max-w-xl text-base leading-relaxed text-foreground/85">{user.profile.bio}</p>
              )}

              {!isOwnProfile && (
                <div className="mt-6 flex flex-wrap items-center gap-2">
                  <Link
                    href={`/chats/${user.id}`}
                    className="btn-primary group"
                  >
                    <MessageCircle className="h-4 w-4" /> Написать
                  </Link>
                  <button onClick={toggleSaved} className={`inline-flex items-center gap-2 rounded-full border px-5 py-3 text-sm font-medium transition-colors ${
                    saved ? 'border-primary bg-primary/10 text-primary' : 'border-border/70 bg-card hover:bg-muted'
                  }`}>
                    {saved ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
                    {saved ? 'Сохранено' : 'Сохранить'}
                  </button>
                  <button onClick={copyLink} className="btn-ghost">
                    <Share2 className="h-4 w-4" /> Поделиться
                  </button>
                  <div className="relative">
                    <button
                      onClick={() => setMoreOpen((v) => !v)}
                      onBlur={() => setTimeout(() => setMoreOpen(false), 120)}
                      className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-border/70 bg-card text-muted-foreground transition-colors hover:text-foreground"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </button>
                    {moreOpen && (
                      <motion.ul
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="absolute right-0 top-full z-30 mt-2 w-52 overflow-hidden rounded-2xl border border-border/70 bg-card shadow-card"
                      >
                        <li>
                          <button onClick={toggleHidden} className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-foreground transition-colors hover:bg-muted">
                            <X className="h-4 w-4" /> {hidden ? 'Вернуть в ленту' : 'Скрыть из ленты'}
                          </button>
                        </li>
                        <li>
                          <button onClick={copyLink} className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-foreground transition-colors hover:bg-muted">
                            <LinkIcon className="h-4 w-4" /> Копировать ссылку
                          </button>
                        </li>
                        <li>
                          <button onClick={() => success('Жалоба принята к рассмотрению')} className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-destructive transition-colors hover:bg-destructive/10">
                            <Flag className="h-4 w-4" /> Пожаловаться
                          </button>
                        </li>
                      </motion.ul>
                    )}
                  </div>
                </div>
              )}
            </div>
          </motion.div>

          {/* Right — match score block */}
          {compatibility && !isOwnProfile && (
            <motion.aside
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1, ease: [0.2, 0.8, 0.2, 1] }}
              className="card-soft p-6"
            >
              <div className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground">Совместимость</div>
              <div className="mt-3 flex items-center gap-4">
                <div className="relative">
                  <svg width="110" height="110" viewBox="0 0 110 110" className="-rotate-90">
                    <circle cx="55" cy="55" r="48" fill="none" stroke="hsl(var(--border))" strokeWidth="6" />
                    <circle
                      cx="55"
                      cy="55"
                      r="48"
                      fill="none"
                      stroke={tone.color}
                      strokeWidth="6"
                      strokeDasharray={`${(compatibility.dealbreakerConflict ? 100 : compatibility.score) / 100 * 301.59} 301.59`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="font-display text-3xl font-bold tabular-nums">
                      {compatibility.dealbreakerConflict ? '0' : compatibility.score}
                    </span>
                    <span className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">%</span>
                  </div>
                </div>
                <div>
                  <div className="font-display text-xl font-semibold" style={{ color: tone.color }}>{tone.label}</div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    {sharedCount} совпадени{pluralize(sharedCount, 'й', 'е', 'я')} из 12
                  </div>
                </div>
              </div>

              {compatibility.dealbreakerConflict && compatibility.dealbreakerReason && (
                <div className="mt-5 flex items-start gap-2 rounded-xl bg-destructive/10 p-3 text-xs">
                  <AlertTriangle className="h-4 w-4 flex-none text-destructive" />
                  <div>
                    <div className="font-semibold text-destructive">Дилбрейкер: {translateReason(compatibility.dealbreakerReason)}</div>
                    <div className="mt-1 text-destructive/70">Это критическое несовпадение. Алгоритм не рекомендует селиться вместе.</div>
                  </div>
                </div>
              )}
            </motion.aside>
          )}
        </div>
      </section>

      {/* MAIN CONTENT */}
      <section className="container mx-auto grid gap-6 px-6 py-10 md:grid-cols-[2fr_1fr]">
        {/* Left column */}
        <div className="space-y-6">
          {/* Category breakdown */}
          {categoryScores.length > 0 && (
            <motion.div {...fadeIn} className="card-soft p-7">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-xl font-semibold">Разбор по категориям</h2>
                <span className="text-xs text-muted-foreground">что где весит</span>
              </div>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                {categoryScores.map((c) => (
                  <CategoryRing key={c.key} label={c.label} emoji={c.emoji} score={c.score} />
                ))}
              </div>
            </motion.div>
          )}

          {/* Side-by-side habit comparison */}
          <motion.div {...fadeIn} className="card-soft overflow-hidden">
            <div className="flex items-center justify-between border-b border-border/60 px-7 py-5">
              <h2 className="font-display text-xl font-semibold">12 привычек бок о бок</h2>
              <span className="text-xs text-muted-foreground">Ты · {user.name.split(' ')[0]}</span>
            </div>
            <div className="divide-y divide-border/60">
              {(Object.keys(FIELD_META) as (keyof typeof FIELD_META)[]).map((key) => {
                const my = currentUserSurvey?.[key]
                const theirs = user.survey[key]
                const match = currentUserSurvey ? compareField(key, my, theirs) : 'missing'
                return (
                  <HabitRow key={key} field={key} my={my} theirs={theirs} match={match} />
                )
              })}
            </div>
          </motion.div>

          {/* About + budget overlap */}
          <motion.div {...fadeIn} className="card-soft p-7">
            <h2 className="font-display text-xl font-semibold">Детали</h2>
            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              <DetailRow label="Город" value={user.profile?.city ?? '—'} />
              <DetailRow label="Возраст" value={user.profile?.age ? String(user.profile.age) : '—'} />
              <DetailRow label="Пол" value={user.profile?.gender ? (user.profile.gender === 'Male' ? 'Мужской' : 'Женский') : '—'} />
              <DetailRow
                label="Заезд"
                value={user.profile?.moveInDate
                  ? new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(user.profile.moveInDate))
                  : 'Без привязки к дате'}
              />
              <DetailRow
                label="Бюджет"
                value={
                  budgetOverlap
                    ? `${fmtRub(budgetOverlap.min)} – ${fmtRub(budgetOverlap.max)}`
                    : '—'
                }
              />
              <DetailRow
                label="На Roomy"
                value={`с ${new Intl.DateTimeFormat('ru-RU', { month: 'long', year: 'numeric' }).format(new Date(user.createdAt))}`}
              />
            </div>
          </motion.div>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* Icebreakers */}
          {icebreakers.length > 0 && !isOwnProfile && (
            <motion.div {...fadeIn} className="card-soft relative overflow-hidden p-6">
              <div className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-primary/10 blur-2xl" aria-hidden />
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                <h3 className="font-display text-lg font-semibold">С чего начать разговор</h3>
              </div>
              <ul className="mt-4 space-y-3 text-sm">
                {icebreakers.map((t, i) => (
                  <li key={i} className="rounded-xl bg-muted/60 px-4 py-3 leading-relaxed text-foreground/85">
                    {t}
                  </li>
                ))}
              </ul>
              <Link href={`/chats/${user.id}`} className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-foreground py-2.5 text-sm font-medium text-background transition-colors hover:bg-foreground/90">
                <MessageCircle className="h-4 w-4" /> Начать чат
              </Link>
            </motion.div>
          )}

          {/* Quick stats */}
          <motion.div {...fadeIn} className="card-soft p-6">
            <h3 className="font-display text-lg font-semibold">Факты</h3>
            <ul className="mt-4 space-y-3 text-sm">
              <StatRow label="Заполнил анкету" value="Полностью (12/12)" highlight="match-high" />
              <StatRow label="Отвечает" value="обычно в течение 3 часов" />
              <StatRow label="Последний раз" value="только что" />
              <StatRow label="Общих категорий" value={`${sharedCount} из 12`} highlight={sharedCount >= 8 ? 'match-high' : sharedCount >= 4 ? 'match-mid' : undefined} />
            </ul>
          </motion.div>

          {/* Similar profiles */}
          {similar.length > 0 && (
            <motion.div {...fadeIn} className="card-soft p-6">
              <div className="flex items-center justify-between">
                <h3 className="font-display text-lg font-semibold">Похожие кандидаты</h3>
                <Link href="/search" className="text-xs text-primary hover:underline">все →</Link>
              </div>
              <div className="mt-4 space-y-2">
                {similar.map((s) => (
                  <Link
                    key={s.user.id}
                    href={`/profile/${s.user.id}`}
                    className="flex items-center gap-3 rounded-xl border border-border/60 bg-card px-3 py-2.5 transition-colors hover:bg-muted"
                  >
                    <div className="h-9 w-9 flex-none rounded-full bg-gradient-to-br from-primary/60 to-accent/60" />
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-medium">{s.user.name}</div>
                      <div className="truncate text-xs text-muted-foreground">
                        {s.user.profile?.city ?? '—'} · {s.user.profile?.age ?? '?'}
                      </div>
                    </div>
                    <span className="rounded-full bg-match-high/10 px-2 py-0.5 text-[11px] font-semibold text-match-high">{s.score}%</span>
                  </Link>
                ))}
              </div>
            </motion.div>
          )}

          {/* Safety */}
          {!isOwnProfile && (
            <motion.div {...fadeIn} className="card-soft p-6">
              <h3 className="font-display text-lg font-semibold">Безопасность</h3>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                Всё общение идёт внутри Roomy. Не передавай деньги без договора и не делись паспортом в чате.
              </p>
              <div className="mt-4 space-y-2">
                <button onClick={toggleHidden} className="flex w-full items-center gap-2 rounded-xl border border-border/70 bg-card px-3 py-2.5 text-left text-sm transition-colors hover:bg-muted">
                  <X className="h-4 w-4 text-muted-foreground" /> {hidden ? 'Вернуть в ленту' : 'Скрыть из ленты'}
                </button>
                <button onClick={() => success('Жалоба принята')} className="flex w-full items-center gap-2 rounded-xl border border-border/70 bg-card px-3 py-2.5 text-left text-sm text-destructive transition-colors hover:bg-destructive/10">
                  <Flag className="h-4 w-4" /> Пожаловаться
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </section>
    </div>
  )
}

/* ──────────────── small pieces ──────────────── */

const fadeIn = {
  initial: { opacity: 0, y: 16 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-40px' },
  transition: { duration: 0.5, ease: [0.2, 0.8, 0.2, 1] as const },
}

function CategoryRing({ label, emoji, score }: { label: string; emoji: string; score: number }) {
  const color = score >= 80 ? 'hsl(var(--match-high))' : score >= 60 ? 'hsl(var(--match-mid))' : 'hsl(var(--match-low))'
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-border/60 bg-muted/30 p-4">
      <div className="relative">
        <svg width="56" height="56" viewBox="0 0 56 56" className="-rotate-90">
          <circle cx="28" cy="28" r="22" fill="none" stroke="hsl(var(--border))" strokeWidth="4" />
          <circle
            cx="28"
            cy="28"
            r="22"
            fill="none"
            stroke={color}
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray={`${(score / 100) * 138.23} 138.23`}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center text-lg">{emoji}</div>
      </div>
      <div>
        <div className="text-sm font-semibold">{label}</div>
        <div className="text-xs tabular-nums" style={{ color }}>{score}%</div>
      </div>
    </div>
  )
}

function HabitRow({
  field,
  my,
  theirs,
  match,
}: {
  field: keyof typeof FIELD_META
  my?: string | null
  theirs?: string | null
  match: 'match' | 'partial' | 'opposite' | 'missing'
}) {
  const meta = FIELD_META[field]
  const color =
    match === 'match' ? 'text-match-high' :
    match === 'partial' ? 'text-match-mid' :
    match === 'opposite' ? 'text-destructive' :
    'text-muted-foreground'
  const label =
    match === 'match' ? 'совпали' :
    match === 'partial' ? 'частично' :
    match === 'opposite' ? 'разные' :
    '—'

  return (
    <div className="grid grid-cols-[auto_1fr_1fr_auto] items-center gap-3 px-7 py-4 text-sm">
      <div className="flex items-center gap-2">
        <span className="text-lg">{meta.emoji}</span>
        <span className="w-24 text-muted-foreground">{meta.label}</span>
      </div>
      <div className="truncate text-foreground/85">{translate(my)}</div>
      <div className="truncate text-foreground/85">{translate(theirs)}</div>
      <span className={`text-right text-xs font-medium ${color}`}>
        {match === 'match' && '✓ '}
        {match === 'opposite' && '⚠ '}
        {label}
      </span>
    </div>
  )
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground">{label}</div>
      <div className="mt-1 text-sm text-foreground/85">{value}</div>
    </div>
  )
}

function StatRow({ label, value, highlight }: { label: string; value: string; highlight?: 'match-high' | 'match-mid' }) {
  const color = highlight === 'match-high' ? 'text-match-high' : highlight === 'match-mid' ? 'text-match-mid' : 'text-foreground'
  return (
    <li className="flex items-center justify-between gap-3">
      <span className="text-muted-foreground">{label}</span>
      <span className={`font-medium ${color}`}>
        {highlight === 'match-high' && <Check className="mr-1 inline h-3.5 w-3.5" />}
        {value}
      </span>
    </li>
  )
}

function ProfileSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <div className="h-16 border-b border-border/60 bg-background/80" />
      <div className="container mx-auto px-6 py-12">
        <div className="flex items-center gap-6">
          <div className="h-32 w-32 animate-pulse rounded-3xl bg-muted" />
          <div className="space-y-3">
            <div className="h-8 w-48 animate-pulse rounded-full bg-muted" />
            <div className="h-3 w-64 animate-pulse rounded-full bg-muted" />
            <div className="h-3 w-40 animate-pulse rounded-full bg-muted" />
          </div>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-[2fr_1fr]">
          <div className="space-y-6">
            <div className="card-soft h-56 animate-pulse" />
            <div className="card-soft h-96 animate-pulse" />
          </div>
          <div className="space-y-6">
            <div className="card-soft h-48 animate-pulse" />
            <div className="card-soft h-48 animate-pulse" />
          </div>
        </div>
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
    'Smoking incompatibility': 'несовместимое отношение к курению',
    'Pets allergy conflict': 'аллергия на питомцев',
    'Sleep schedule incompatibility': 'радикально разный режим сна',
  }
  return map[reason] ?? reason
}
