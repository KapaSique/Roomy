'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'

type Match = {
  user: {
    id: string
    name: string
    avatarUrl?: string | null
    profile: {
      city?: string | null
      age?: number | null
      bio?: string | null
    } | null
  }
  score: number
  dealbreakerConflict: boolean
  dealbreakerReason?: string
}

export default function SearchPage() {
  const router = useRouter()
  const [matches, setMatches] = useState<Match[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'no-dealbreaker'>('all')

  useEffect(() => {
    fetchMatches()
  }, [])

  async function fetchMatches() {
    try {
      const response = await fetch('/api/search')
      const data = await response.json()

      if (response.ok) {
        setMatches(data.matches)
      } else {
        router.push('/onboarding')
      }
    } catch (error) {
      console.error('Failed to fetch matches:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredMatches = filter === 'no-dealbreaker'
    ? matches.filter(m => !m.dealbreakerConflict)
    : matches

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/30 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-foreground/60">Поиск совпадений...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/30">
      {/* Header */}
      <header className="bg-card border-b shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-display font-semibold text-primary">
            Roomy
          </Link>
          <nav className="flex gap-4">
            <Link
              href="/profile"
              className="px-4 py-2 text-foreground/70 hover:text-foreground transition-colors"
            >
              Профиль
            </Link>
            <Link
              href="/chats"
              className="px-4 py-2 text-foreground/70 hover:text-foreground transition-colors"
            >
              Сообщения
            </Link>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-6"
        >
          <h1 className="text-3xl font-display font-semibold text-foreground">
            Ваши совпадения ({filteredMatches.length})
          </h1>
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg transition-all ${
                filter === 'all'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-card text-foreground hover:bg-secondary'
              }`}
            >
              Все
            </button>
            <button
              onClick={() => setFilter('no-dealbreaker')}
              className={`px-4 py-2 rounded-lg transition-all ${
                filter === 'no-dealbreaker'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-card text-foreground hover:bg-secondary'
              }`}
            >
              Без конфликтов
            </button>
          </div>
        </motion.div>

        {filteredMatches.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <p className="text-foreground/60">Совпадений не найдено</p>
          </motion.div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMatches.map((match, index) => (
              <motion.div
                key={match.user.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-card rounded-2xl shadow-md overflow-hidden hover:shadow-lg transition-all"
              >
                <div className="p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <img
                      src={match.user.avatarUrl || '/default-avatar.png'}
                      alt={match.user.name}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                    <div>
                      <h3 className="text-lg font-semibold text-foreground">
                        {match.user.name}
                      </h3>
                      <p className="text-sm text-foreground/60">
                        {match.user.profile?.city || 'Город не указан'}
                        {match.user.profile?.age && `, ${match.user.profile.age}`}
                      </p>
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-foreground/70">
                        Совместимость
                      </span>
                      <span
                        className={`text-lg font-bold ${
                          match.dealbreakerConflict
                            ? 'text-destructive'
                            : match.score >= 70
                            ? 'text-green-600'
                            : match.score >= 40
                            ? 'text-yellow-600'
                            : 'text-destructive'
                        }`}
                      >
                        {match.dealbreakerConflict ? 'Конфликт' : `${match.score}%`}
                      </span>
                    </div>
                    <div className="w-full bg-secondary rounded-full h-3">
                      <div
                        className={`h-3 rounded-full transition-all ${
                          match.dealbreakerConflict
                            ? 'bg-destructive w-full'
                            : match.score >= 70
                            ? 'bg-green-600'
                            : match.score >= 40
                            ? 'bg-yellow-600'
                            : 'bg-destructive'
                        }`}
                        style={{ width: match.dealbreakerConflict ? '100%' : `${match.score}%` }}
                      />
                    </div>
                    {match.dealbreakerReason && (
                      <p className="text-xs text-destructive mt-2">
                        ⚠️ {match.dealbreakerReason}
                      </p>
                    )}
                  </div>

                  {match.user.profile?.bio && (
                    <p className="text-sm text-foreground/60 mb-4 line-clamp-2">
                      {match.user.profile.bio}
                    </p>
                  )}

                  <div className="flex gap-2">
                    <Link
                      href={`/profile/${match.user.id}`}
                      className="flex-1 px-4 py-2 bg-secondary text-foreground rounded-lg text-center hover:bg-secondary/80 text-sm transition-colors"
                    >
                      Профиль
                    </Link>
                    <Link
                      href={`/chats?userId=${match.user.id}`}
                      className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-center hover:bg-primary/90 text-sm transition-colors"
                    >
                      Написать
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
