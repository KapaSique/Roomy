'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { motion, AnimatePresence } from 'framer-motion'
import { ProfileComparison } from '@/components/ProfileComparison'
import { ProfileSkeleton } from '@/components/ui/skeletons'
import { MobileMenu } from '@/components/MobileMenu'

type UserProfile = {
  id: string
  name: string
  avatarUrl?: string | null
  profile: {
    city?: string | null
    budgetMin?: number | null
    budgetMax?: number | null
    moveInDate?: string | null
    bio?: string | null
    gender?: string | null
    age?: number | null
  } | null
  survey: {
    sleepSchedule?: string | null
    smoking?: string | null
    alcohol?: string | null
    cleanliness?: string | null
    noiseLevel?: string | null
    guests?: string | null
    parties?: string | null
    pets?: string | null
    workFromHome?: string | null
    cooking?: string | null
    sharedSpaces?: string | null
    wakeTime?: string | null
  } | null
}

const formatEnum = (value: string) => {
  const translations: Record<string, string> = {
    EARLY_BIRD: 'Жаворонок',
    NORMAL: 'Обычный режим',
    NIGHT_OWL: 'Сова',
    NEVER: 'Никогда',
    OCCASIONALLY: 'Иногда',
    REGULARLY: 'Регулярно',
    VERY_CLEAN: 'Стерильная чистота',
    CLEAN: 'Чисто и аккуратно',
    MESSY: 'Беспорядочно',
    VERY_MESSY: 'Полный хаос',
    QUIET: 'Тихо',
    MODERATE: 'Умеренно',
    LOUD: 'Шумно',
    RARELY: 'Редко',
    FREQUENTLY: 'Часто',
    NONE: 'Нет питомцев',
    HAVE_CAT: 'Есть кот/кошка',
    HAVE_DOG: 'Есть собака',
    HAVE_OTHER: 'Другие питомцы',
    ALLERGIC: 'Аллергия',
    ALWAYS: 'Всегда',
    PRIVATE: 'Предпочитаю уединение',
    BALANCED: 'Золотая середина',
    SHARED: 'Люблю общение',
    VERY_EARLY: 'Очень рано (5-6 утра)',
    EARLY: 'Рано (6-8 утра)',
    LATE: 'Поздно (после 10 утра)',
  }
  return translations[value] || value
}

const formatGender = (value: string) => {
  return value === 'Male' ? 'Мужской' : 'Женский'
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.25, 0.46, 0.45, 0.94] as any, // eslint-disable-line @typescript-eslint/no-explicit-any
    },
  },
}

export default function UserProfilePage() {
  const params = useParams()
  const router = useRouter()
  const { data: session } = useSession()
  const [user, setUser] = useState<UserProfile | null>(null)
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [isOwnProfile, setIsOwnProfile] = useState(false)
  const [showComparison, setShowComparison] = useState(false)

  useEffect(() => {
    if (params.id) {
      fetchUser(params.id as string)
    }
    if (session?.user?.id) {
      fetchCurrentUser()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id, session])

  useEffect(() => {
    if (session?.user?.id && params.id) {
      setIsOwnProfile(session.user.id === params.id)
    }
  }, [session, params.id])

  async function fetchUser(userId: string) {
    try {
      const response = await fetch(`/api/profile/${userId}`)
      const data = await response.json()

      if (response.ok) {
        setUser(data.user)
      } else {
        router.push('/search')
      }
    } catch (error) {
      console.error('Failed to fetch user:', error)
    } finally {
      setLoading(false)
    }
  }

  async function fetchCurrentUser() {
    try {
      const response = await fetch('/api/me')
      const data = await response.json()

      if (response.ok) {
        setCurrentUser(data.user)
      }
    } catch (error) {
      console.error('Failed to fetch current user:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/30">
        <div className="bg-card border-b shadow-sm">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <div className="h-8 w-20 bg-secondary rounded" />
            <div className="flex gap-4">
              <div className="h-8 w-16 bg-secondary rounded" />
              <div className="h-8 w-24 bg-secondary rounded" />
            </div>
          </div>
        </div>
        <main className="container mx-auto px-4 py-8">
          <ProfileSkeleton />
        </main>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/30">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="bg-card border-b shadow-sm"
      >
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-display font-semibold text-primary">Roomy</Link>
          {/* Desktop Nav */}
          <nav className="hidden lg:flex gap-4">
            <Link href="/search" className="px-4 py-2 text-foreground/70 hover:text-foreground transition-colors">
              Поиск
            </Link>
            <Link href="/chats" className="px-4 py-2 text-foreground/70 hover:text-foreground transition-colors">
              Сообщения
            </Link>
            {isOwnProfile && (
              <Link href="/profile/edit" className="px-4 py-2 text-foreground/70 hover:text-foreground transition-colors">
                Редактировать
              </Link>
            )}
          </nav>
          {/* Mobile Menu */}
          <MobileMenu
            links={[
              { href: '/search', label: 'Поиск' },
              { href: '/chats', label: 'Сообщения' },
              ...(isOwnProfile ? [{ href: '/profile/edit', label: 'Редактировать' }] : []),
            ]}
          />
        </div>
      </motion.header>

      {/* Profile Content */}
      <main className="container mx-auto px-4 py-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-4xl mx-auto"
        >
          {/* Profile Header */}
          <motion.div variants={itemVariants} className="bg-card rounded-2xl shadow-md p-8 mb-6">
            <div className="flex items-center gap-6">
              <motion.img
                whileHover={{ scale: 1.05 }}
                transition={{ type: 'spring', stiffness: 300 }}
                src={user.avatarUrl || '/default-avatar.png'}
                alt={user.name}
                className="w-24 h-24 rounded-full object-cover"
              />
              <div>
                <h1 className="text-3xl font-display font-semibold text-foreground">{user.name}</h1>
                <p className="text-foreground/60">
                  {user.profile?.city && `${user.profile.city}`}
                  {user.profile?.age && `, ${user.profile.age}`}
                  {user.profile?.gender && ` • ${formatGender(user.profile.gender)}`}
                </p>
                {user.profile?.bio && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="mt-2 text-foreground/70"
                  >
                    {user.profile.bio}
                  </motion.p>
                )}
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              {!isOwnProfile && (
                <>
                  <Link
                    href={`/chats?userId=${user.id}`}
                    className="inline-block px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                  >
                    Написать сообщение
                  </Link>
                  {currentUser && user.survey && currentUser.survey && (
                    <motion.button
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setShowComparison(true)}
                      className="px-6 py-3 bg-secondary text-foreground rounded-lg hover:bg-secondary/80 transition-colors flex items-center gap-2"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                      Сравнить
                    </motion.button>
                  )}
                </>
              )}
            </div>
          </motion.div>

          {/* Housing Info */}
          {user.profile && (user.profile.budgetMin || user.profile.budgetMax || user.profile.moveInDate) && (
            <motion.div variants={itemVariants} className="bg-card rounded-2xl shadow-md p-6 mb-6">
              <h2 className="text-xl font-display font-semibold text-foreground mb-4">
                Предпочтения по жилью
              </h2>
              <div className="grid md:grid-cols-3 gap-4">
                {(user.profile.budgetMin || user.profile.budgetMax) && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.1 }}
                  >
                    <p className="text-sm text-foreground/60">Бюджет в месяц</p>
                    <p className="text-foreground">
                      {user.profile.budgetMin && `${user.profile.budgetMin.toLocaleString()}₽`}
                      {' — '}
                      {user.profile.budgetMax && `${user.profile.budgetMax.toLocaleString()}₽`}
                    </p>
                  </motion.div>
                )}
                {user.profile.moveInDate && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    <p className="text-sm text-foreground/60">Дата заезда</p>
                    <p className="text-foreground">
                      {new Date(user.profile.moveInDate).toLocaleDateString('ru-RU', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </p>
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}

          {/* Survey/Habits */}
          {user.survey && (
            <motion.div variants={itemVariants} className="bg-card rounded-2xl shadow-md p-6">
              <h2 className="text-xl font-display font-semibold text-foreground mb-4">
                Привычки и образ жизни
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                {user.survey.sleepSchedule && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
                    <p className="text-sm text-foreground/60">Режим сна</p>
                    <p className="text-foreground">{formatEnum(user.survey.sleepSchedule)}</p>
                  </motion.div>
                )}
                {user.survey.smoking && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}>
                    <p className="text-sm text-foreground/60">Курение</p>
                    <p className="text-foreground">{formatEnum(user.survey.smoking)}</p>
                  </motion.div>
                )}
                {user.survey.alcohol && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
                    <p className="text-sm text-foreground/60">Алкоголь</p>
                    <p className="text-foreground">{formatEnum(user.survey.alcohol)}</p>
                  </motion.div>
                )}
                {user.survey.cleanliness && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }}>
                    <p className="text-sm text-foreground/60">Чистоплотность</p>
                    <p className="text-foreground">{formatEnum(user.survey.cleanliness)}</p>
                  </motion.div>
                )}
                {user.survey.noiseLevel && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
                    <p className="text-sm text-foreground/60">Уровень шума</p>
                    <p className="text-foreground">{formatEnum(user.survey.noiseLevel)}</p>
                  </motion.div>
                )}
                {user.survey.guests && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }}>
                    <p className="text-sm text-foreground/60">Гости</p>
                    <p className="text-foreground">{formatEnum(user.survey.guests)}</p>
                  </motion.div>
                )}
                {user.survey.parties && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
                    <p className="text-sm text-foreground/60">Вечеринки</p>
                    <p className="text-foreground">{formatEnum(user.survey.parties)}</p>
                  </motion.div>
                )}
                {user.survey.pets && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.45 }}>
                    <p className="text-sm text-foreground/60">Питомцы</p>
                    <p className="text-foreground">{formatEnum(user.survey.pets)}</p>
                  </motion.div>
                )}
                {user.survey.workFromHome && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
                    <p className="text-sm text-foreground/60">Работа из дома</p>
                    <p className="text-foreground">{formatEnum(user.survey.workFromHome)}</p>
                  </motion.div>
                )}
                {user.survey.cooking && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.55 }}>
                    <p className="text-sm text-foreground/60">Готовка</p>
                    <p className="text-foreground">{formatEnum(user.survey.cooking)}</p>
                  </motion.div>
                )}
                {user.survey.sharedSpaces && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}>
                    <p className="text-sm text-foreground/60">Общие пространства</p>
                    <p className="text-foreground">{formatEnum(user.survey.sharedSpaces)}</p>
                  </motion.div>
                )}
                {user.survey.wakeTime && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.65 }}>
                    <p className="text-sm text-foreground/60">Время подъёма</p>
                    <p className="text-foreground">{formatEnum(user.survey.wakeTime)}</p>
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}
        </motion.div>
      </main>

      {/* Comparison Modal */}
      <AnimatePresence>
        {showComparison && currentUser && user.survey && currentUser.survey && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto"
            onClick={() => setShowComparison(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-card rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto my-8"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 bg-card border-b p-6 flex items-center justify-between z-10">
                <h2 className="text-2xl font-display font-semibold text-foreground">
                  Сравнение профилей
                </h2>
                <button
                  onClick={() => setShowComparison(false)}
                  className="p-2 hover:bg-secondary rounded-full transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="p-6">
                <ProfileComparison
                  user1Survey={currentUser.survey}
                  user2Survey={user.survey}
                  user1Name={currentUser.name}
                  user2Name={user.name}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
