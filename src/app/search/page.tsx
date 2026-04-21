'use client'

import { useState, useEffect, Suspense, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { SearchPageSkeletons } from '@/components/ui/skeletons'
import { useToast } from '@/lib/hooks/use-toast'
import { FilterDrawer } from '@/components/FilterDrawer'
import { MobileMenu } from '@/components/MobileMenu'

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
    } | null
  }
  score: number
  dealbreakerConflict: boolean
  dealbreakerReason?: string
}

const CITIES = [
  'Москва',
  'Санкт-Петербург',
  'Якутск',
  'Казань',
  'Новосибирск',
  'Екатеринбург',
  'Нижний Новгород',
  'Челябинск',
  'Самара',
  'Омск',
  'Ростов-на-Дону',
  'Уфа',
  'Красноярск',
  'Воронеж',
  'Пермь',
  'Волгоград',
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
}

const itemVariants = {
  hidden: {
    opacity: 0,
    y: 30,
    scale: 0.95,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: 'spring' as any,
      stiffness: 100,
      damping: 20,
      mass: 1,
      duration: 0.5,
    },
  },
}

function SearchContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { error: showError } = useToast()
  const [matches, setMatches] = useState<Match[]>([])
  const [loading, setLoading] = useState(true)
  const [filtersOpen, setFiltersOpen] = useState(false)

  const cityFilter = searchParams.get('city') || ''
  const minScoreFilter = parseInt(searchParams.get('minScore') || '0')
  const budgetMinFilter = parseInt(searchParams.get('budgetMin') || '0')
  const budgetMaxFilter = parseInt(searchParams.get('budgetMax') || '100000')
  const hideDealbreakersFilter = searchParams.get('hideDealbreakers') === 'true'

  const [localFilters, setLocalFilters] = useState({
    city: cityFilter,
    minScore: minScoreFilter,
    budgetMin: budgetMinFilter,
    budgetMax: budgetMaxFilter,
    hideDealbreakers: hideDealbreakersFilter,
  })

  const updateUrl = useCallback((filters: typeof localFilters) => {
    const params = new URLSearchParams()
    if (filters.city) params.set('city', filters.city)
    if (filters.minScore > 0) params.set('minScore', filters.minScore.toString())
    if (filters.budgetMin > 0) params.set('budgetMin', filters.budgetMin.toString())
    if (filters.budgetMax < 100000) params.set('budgetMax', filters.budgetMax.toString())
    if (filters.hideDealbreakers) params.set('hideDealbreakers', 'true')

    const queryString = params.toString()
    router.push(`/search${queryString ? `?${queryString}` : ''}`, { scroll: false })
  }, [router])

  const applyFilters = () => {
    updateUrl(localFilters)
    setFiltersOpen(false)
  }

  const resetFilters = () => {
    setLocalFilters({
      city: '',
      minScore: 0,
      budgetMin: 0,
      budgetMax: 100000,
      hideDealbreakers: false,
    })
    router.push('/search')
  }

  useEffect(() => {
    fetchMatches()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    setLocalFilters({
      city: cityFilter,
      minScore: minScoreFilter,
      budgetMin: budgetMinFilter,
      budgetMax: budgetMaxFilter,
      hideDealbreakers: hideDealbreakersFilter,
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams])

  async function fetchMatches() {
    try {
      const response = await fetch('/api/search')
      const data = await response.json()

      if (response.ok) {
        setMatches(data.matches)
      } else {
        showError('Не удалось загрузить совпадения')
        router.push('/onboarding')
      }
    } catch (error) {
      console.error('Failed to fetch matches:', error)
      showError('Ошибка загрузки данных')
    } finally {
      setLoading(false)
    }
  }

  const filteredMatches = matches.filter((match) => {
    if (localFilters.city && match.user.profile?.city !== localFilters.city) {
      return false
    }

    if (match.score < localFilters.minScore) {
      return false
    }

    const userBudgetMin = match.user.profile?.budgetMin || 0
    const userBudgetMax = match.user.profile?.budgetMax || 100000

    const hasBudgetOverlap =
      userBudgetMin <= localFilters.budgetMax &&
      userBudgetMax >= localFilters.budgetMin

    if (!hasBudgetOverlap) {
      return false
    }

    if (localFilters.hideDealbreakers && match.dealbreakerConflict) {
      return false
    }

    return true
  })

  const hasActiveFilters =
    localFilters.city !== '' ||
    localFilters.minScore > 0 ||
    localFilters.budgetMin > 0 ||
    localFilters.budgetMax < 100000 ||
    localFilters.hideDealbreakers

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-emerald-600'
    if (score >= 40) return 'text-yellow-600'
    return 'text-orange-600'
  }

  const getScoreGradient = (score: number) => {
    if (score >= 80) return 'from-green-500 to-emerald-500'
    if (score >= 60) return 'from-emerald-500 to-teal-500'
    if (score >= 40) return 'from-yellow-500 to-orange-500'
    return 'from-orange-500 to-red-500'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-slate-900 dark:via-purple-900/20 dark:to-slate-900">
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border-b border-white/20 sticky top-0 z-10"
        >
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <div className="h-8 w-20 bg-secondary rounded" />
            <div className="flex gap-4">
              <div className="h-8 w-20 bg-secondary rounded" />
              <div className="h-8 w-24 bg-secondary rounded" />
            </div>
          </div>
        </motion.header>

        <main className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-6">
            <div className="h-8 w-48 bg-secondary rounded" />
            <div className="h-9 w-32 bg-secondary rounded-lg" />
          </div>
          <SearchPageSkeletons />
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-slate-900 dark:via-purple-900/20 dark:to-slate-900">
      {/* Floating Orbs Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ x: [0, 100, 0], y: [0, -50, 0], scale: [1, 1.2, 1] }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-400/15 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ x: [0, -80, 0], y: [0, 80, 0], scale: [1, 1.3, 1] }}
          transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-400/15 rounded-full blur-3xl"
        />
      </div>

      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="glass bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border-b border-white/20 sticky top-0 z-10"
      >
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-display font-semibold gradient-text">
            Roomy
          </Link>
          <nav className="hidden lg:flex gap-4">
            <Link
              href="/profile"
              className="px-4 py-2 text-foreground/70 hover:text-foreground transition-colors rounded-lg hover:bg-secondary/50"
            >
              Профиль
            </Link>
            <Link
              href="/chats"
              className="px-4 py-2 text-foreground/70 hover:text-foreground transition-colors rounded-lg hover:bg-secondary/50"
            >
              Сообщения
            </Link>
          </nav>
          <MobileMenu
            links={[
              { href: '/profile', label: 'Профиль' },
              { href: '/chats', label: 'Сообщения' },
            ]}
          />
        </div>
      </motion.header>

      {/* Filter Drawer for Mobile */}
      <FilterDrawer
        isOpen={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        filters={localFilters}
        setFilters={setLocalFilters}
        onApply={applyFilters}
        onReset={resetFilters}
      />

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8"
        >
          <div>
            <h1 className="text-3xl md:text-4xl font-display font-semibold text-foreground">
              Ваши совпадения
            </h1>
            <p className="text-foreground/60 mt-1">
              Найдено {filteredMatches.length} {filteredMatches.length === 1 ? 'совпадение' : filteredMatches.length < 5 ? 'совпадения' : 'совпадений'}
            </p>
          </div>
          <div className="flex gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setFiltersOpen(!filtersOpen)}
              className={`hidden lg:flex px-4 py-2 rounded-xl transition-all items-center gap-2 ${
                filtersOpen || hasActiveFilters
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/30'
                  : 'glass text-foreground hover:bg-white/50 border border-white/20'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              Фильтры
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setFiltersOpen(true)}
              className={`lg:hidden px-4 py-2 rounded-xl transition-all flex items-center gap-2 ${
                hasActiveFilters
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                  : 'glass text-foreground hover:bg-white/50 border border-white/20'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
            </motion.button>
          </div>
        </motion.div>

        {/* Filters Panel - Desktop */}
        <AnimatePresence>
          {filtersOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="hidden lg:block glass rounded-2xl shadow-lg p-6 mb-8 overflow-hidden border border-white/20"
            >
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-foreground/80 mb-2">
                    Город
                  </label>
                  <select
                    value={localFilters.city}
                    onChange={(e) => setLocalFilters({ ...localFilters, city: e.target.value })}
                    className="w-full px-4 py-2 border border-border rounded-xl bg-background/50 text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                  >
                    <option value="">Все города</option>
                    {CITIES.map((city) => (
                      <option key={city} value={city}>{city}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground/80 mb-2">
                    Мин. совместимость: {localFilters.minScore}%
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={localFilters.minScore}
                    onChange={(e) => setLocalFilters({ ...localFilters, minScore: parseInt(e.target.value) })}
                    className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-foreground/50 mt-1">
                    <span>0%</span>
                    <span>50%</span>
                    <span>100%</span>
                  </div>
                </div>

                <div className="lg:col-span-2">
                  <label className="block text-sm font-medium text-foreground/80 mb-2">
                    Бюджет: {localFilters.budgetMin.toLocaleString()}₽ - {localFilters.budgetMax.toLocaleString()}₽
                  </label>
                  <div className="flex gap-4 items-center">
                    <div className="flex-1">
                      <input
                        type="range"
                        min="0"
                        max="100000"
                        step="5000"
                        value={localFilters.budgetMin}
                        onChange={(e) => setLocalFilters({
                          ...localFilters,
                          budgetMin: Math.min(parseInt(e.target.value), localFilters.budgetMax - 5000)
                        })}
                        className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer"
                      />
                      <p className="text-xs text-foreground/50 mt-1">от</p>
                    </div>
                    <div className="flex-1">
                      <input
                        type="range"
                        min="0"
                        max="100000"
                        step="5000"
                        value={localFilters.budgetMax}
                        onChange={(e) => setLocalFilters({
                          ...localFilters,
                          budgetMax: Math.max(parseInt(e.target.value), localFilters.budgetMin + 5000)
                        })}
                        className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer"
                      />
                      <p className="text-xs text-foreground/50 mt-1">до</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setLocalFilters({ ...localFilters, hideDealbreakers: !localFilters.hideDealbreakers })}
                    className={`w-12 h-6 rounded-full transition-colors ${
                      localFilters.hideDealbreakers ? 'bg-gradient-to-r from-blue-600 to-purple-600' : 'bg-secondary'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-all ${
                        localFilters.hideDealbreakers ? 'translate-x-6' : 'translate-x-0.5'
                      }`}
                    />
                  </button>
                  <span className="text-sm font-medium text-foreground/80">
                    Скрыть конфликты
                  </span>
                </div>
              </div>

              <div className="flex gap-2 mt-6 pt-4 border-t border-border">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={applyFilters}
                  className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all"
                >
                  Применить
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={resetFilters}
                  className="px-6 py-2 glass text-foreground rounded-xl hover:bg-white/50 transition-all border border-border"
                >
                  Сбросить
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results */}
        <AnimatePresence mode="wait">
          {filteredMatches.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="text-center py-16 glass rounded-3xl border border-white/20"
            >
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                className="text-6xl mb-4"
              >
                🔍
              </motion.div>
              <h3 className="text-xl font-display font-semibold text-foreground mb-2">
                Совпадений не найдено
              </h3>
              <p className="text-foreground/60 mb-6">
                {hasActiveFilters ? 'Попробуйте изменить параметры фильтров' : 'Заполните анкету чтобы найти совпадения'}
              </p>
              {hasActiveFilters && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={resetFilters}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all"
                >
                  Сбросить фильтры
                </motion.button>
              )}
            </motion.div>
          ) : (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {filteredMatches.map((match) => (
                <motion.div
                  key={match.user.id}
                  variants={itemVariants}
                  whileHover={{ y: -6, transition: { duration: 0.2 } }}
                  className="glass rounded-3xl shadow-lg overflow-hidden border border-white/20 card-hover group"
                >
                  {/* Card Header with Gradient */}
                  <div className={`h-2 bg-gradient-to-r ${getScoreGradient(match.dealbreakerConflict ? 0 : match.score)}`} />

                  <div className="p-6">
                    <div className="flex items-start gap-4 mb-4">
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        transition={{ type: 'spring', stiffness: 300 }}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={match.user.avatarUrl || '/default-avatar.png'}
                          alt={match.user.name}
                          className="w-16 h-16 rounded-full object-cover ring-2 ring-white/50 shadow-md"
                        />
                      </motion.div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                          {match.user.name}
                        </h3>
                        <p className="text-sm text-foreground/60">
                          {match.user.profile?.city || 'Город не указан'}
                        </p>
                        <p className="text-xs text-foreground/50 mt-1">
                          {match.user.profile?.age && `${match.user.profile.age} лет`}
                          {match.user.profile?.age && match.user.profile?.gender && ' • '}
                          {match.user.profile?.gender && (match.user.profile.gender === 'Male' ? 'Муж.' : 'Жен.')}
                        </p>
                      </div>
                    </div>

                    {/* Compatibility Score */}
                    <motion.div className="mb-4 p-4 rounded-2xl bg-gradient-to-br from-secondary/50 to-secondary/30" layout>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-foreground/70">
                          Совместимость
                        </span>
                        <AnimatePresence mode="wait">
                          <motion.span
                            key={match.dealbreakerConflict ? 'conflict' : match.score}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            transition={{ duration: 0.2 }}
                            className={`text-xl font-bold ${
                              match.dealbreakerConflict
                                ? 'text-destructive'
                                : getScoreColor(match.score)
                            }`}
                          >
                            {match.dealbreakerConflict ? 'Конфликт' : `${match.score}%`}
                          </motion.span>
                        </AnimatePresence>
                      </div>
                      <div className="w-full bg-secondary rounded-full h-3 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{
                            width: match.dealbreakerConflict ? '100%' : `${match.score}%`,
                          }}
                          transition={{
                            duration: 1,
                            delay: 0.2,
                            ease: [0.25, 0.46, 0.45, 0.94],
                          }}
                          className={`h-3 rounded-full bg-gradient-to-r ${
                            match.dealbreakerConflict
                              ? 'from-destructive to-red-600'
                              : getScoreGradient(match.score)
                          }`}
                        />
                      </div>
                      {match.dealbreakerReason && (
                        <motion.p
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          transition={{ delay: 0.3 }}
                          className="text-xs text-destructive mt-2 flex items-center gap-1"
                        >
                          <span>⚠️</span> {match.dealbreakerReason}
                        </motion.p>
                      )}
                    </motion.div>

                    {match.user.profile?.bio && (
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="text-sm text-foreground/60 mb-4 line-clamp-2 italic"
                      >
                        "{match.user.profile.bio}"
                      </motion.p>
                    )}

                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3 }}
                      className="flex gap-2"
                    >
                      <Link
                        href={`/profile/${match.user.id}`}
                        className="flex-1 px-4 py-2.5 glass text-foreground rounded-xl text-center hover:bg-white/50 text-sm font-medium transition-all border border-border"
                      >
                        Профиль
                      </Link>
                      <Link
                        href={`/chats?userId=${match.user.id}`}
                        className="flex-1 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl text-center hover:shadow-lg hover:shadow-blue-500/30 text-sm font-medium transition-all"
                      >
                        Написать
                      </Link>
                    </motion.div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  )
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-slate-900 dark:via-purple-900/20 dark:to-slate-900 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full"
        />
      </div>
    }>
      <SearchContent />
    </Suspense>
  )
}
