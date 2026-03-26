'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'

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
      type: 'spring',
      stiffness: 100,
      damping: 20,
      mass: 1,
      duration: 0.5,
    },
  },
}

const fadeInVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  },
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
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="text-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="rounded-full h-12 w-12 border-b-2 border-primary mx-auto"
          />
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mt-4 text-foreground/60"
          >
            Поиск совпадений...
          </motion.p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/30">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="bg-card border-b shadow-sm sticky top-0 z-10"
      >
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
      </motion.header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="flex items-center justify-between mb-6"
        >
          <h1 className="text-3xl font-display font-semibold text-foreground">
            Ваши совпадения ({filteredMatches.length})
          </h1>
          <motion.div className="flex gap-2" layout>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg transition-all ${
                filter === 'all'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-card text-foreground hover:bg-secondary'
              }`}
            >
              Все
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setFilter('no-dealbreaker')}
              className={`px-4 py-2 rounded-lg transition-all ${
                filter === 'no-dealbreaker'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-card text-foreground hover:bg-secondary'
              }`}
            >
              Без конфликтов
            </motion.button>
          </motion.div>
        </motion.div>

        <AnimatePresence mode="wait">
          {filteredMatches.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="text-center py-12"
            >
              <p className="text-foreground/60">Совпадений не найдено</p>
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
                  whileHover={{ y: -4, transition: { duration: 0.2 } }}
                  className="bg-card rounded-2xl shadow-md overflow-hidden"
                >
                  <div className="p-6">
                    <div className="flex items-center gap-4 mb-4">
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        transition={{ type: 'spring', stiffness: 300 }}
                      >
                        <img
                          src={match.user.avatarUrl || '/default-avatar.png'}
                          alt={match.user.name}
                          className="w-16 h-16 rounded-full object-cover"
                        />
                      </motion.div>
                      <div>
                        <h3 className="text-lg font-semibold text-foreground">
                          {match.user.name}
                        </h3>
                        <p className="text-sm text-foreground/60">
                          {match.user.profile?.city || 'Город не указан'}
                          {match.user.profile?.age && `, ${match.user.profile.age}`}
                          {match.user.profile?.gender && ` • ${match.user.profile.gender === 'Male' ? 'Муж.' : 'Жен.'}`}
                        </p>
                      </div>
                    </div>

                    <motion.div className="mb-4" layout>
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
                          className={`h-3 rounded-full ${
                            match.dealbreakerConflict
                              ? 'bg-destructive'
                              : match.score >= 70
                              ? 'bg-green-600'
                              : match.score >= 40
                              ? 'bg-yellow-600'
                              : 'bg-destructive'
                          }`}
                        />
                      </div>
                      {match.dealbreakerReason && (
                        <motion.p
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          transition={{ delay: 0.3 }}
                          className="text-xs text-destructive mt-2"
                        >
                          ⚠️ {match.dealbreakerReason}
                        </motion.p>
                      )}
                    </motion.div>

                    {match.user.profile?.bio && (
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="text-sm text-foreground/60 mb-4 line-clamp-2"
                      >
                        {match.user.profile.bio}
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
