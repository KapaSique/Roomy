'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { motion } from 'framer-motion'

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
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  },
}

export default function UserProfilePage() {
  const params = useParams()
  const router = useRouter()
  const { data: session } = useSession()
  const [user, setUser] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [isOwnProfile, setIsOwnProfile] = useState(false)

  useEffect(() => {
    if (params.id) {
      fetchUser(params.id as string)
    }
  }, [params.id])

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/30 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"
        />
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
          <nav className="flex gap-4">
            <Link href="/search" className="px-4 py-2 text-foreground/70 hover:text-foreground transition-colors">
              Поиск
            </Link>
            <Link href="/chats" className="px-4 py-2 text-foreground/70 hover:text-foreground transition-colors">
              Сообщения
            </Link>
          </nav>
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

            {!isOwnProfile && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="mt-6"
              >
                <Link
                  href={`/chats?userId=${user.id}`}
                  className="inline-block px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                >
                  Написать сообщение
                </Link>
              </motion.div>
            )}
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
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.1 }}
                  >
                    <p className="text-sm text-foreground/60">Режим сна</p>
                    <p className="text-foreground">{formatEnum(user.survey.sleepSchedule)}</p>
                  </motion.div>
                )}
                {user.survey.smoking && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.15 }}
                  >
                    <p className="text-sm text-foreground/60">Курение</p>
                    <p className="text-foreground">{formatEnum(user.survey.smoking)}</p>
                  </motion.div>
                )}
                {user.survey.alcohol && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    <p className="text-sm text-foreground/60">Алкоголь</p>
                    <p className="text-foreground">{formatEnum(user.survey.alcohol)}</p>
                  </motion.div>
                )}
                {user.survey.cleanliness && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.25 }}
                  >
                    <p className="text-sm text-foreground/60">Чистоплотность</p>
                    <p className="text-foreground">{formatEnum(user.survey.cleanliness)}</p>
                  </motion.div>
                )}
                {user.survey.noiseLevel && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    <p className="text-sm text-foreground/60">Уровень шума</p>
                    <p className="text-foreground">{formatEnum(user.survey.noiseLevel)}</p>
                  </motion.div>
                )}
                {user.survey.guests && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.35 }}
                  >
                    <p className="text-sm text-foreground/60">Гости</p>
                    <p className="text-foreground">{formatEnum(user.survey.guests)}</p>
                  </motion.div>
                )}
                {user.survey.parties && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                  >
                    <p className="text-sm text-foreground/60">Вечеринки</p>
                    <p className="text-foreground">{formatEnum(user.survey.parties)}</p>
                  </motion.div>
                )}
                {user.survey.pets && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.45 }}
                  >
                    <p className="text-sm text-foreground/60">Питомцы</p>
                    <p className="text-foreground">{formatEnum(user.survey.pets)}</p>
                  </motion.div>
                )}
                {user.survey.workFromHome && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                  >
                    <p className="text-sm text-foreground/60">Работа из дома</p>
                    <p className="text-foreground">{formatEnum(user.survey.workFromHome)}</p>
                  </motion.div>
                )}
                {user.survey.cooking && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.55 }}
                  >
                    <p className="text-sm text-foreground/60">Готовка</p>
                    <p className="text-foreground">{formatEnum(user.survey.cooking)}</p>
                  </motion.div>
                )}
                {user.survey.sharedSpaces && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                  >
                    <p className="text-sm text-foreground/60">Общие пространства</p>
                    <p className="text-foreground">{formatEnum(user.survey.sharedSpaces)}</p>
                  </motion.div>
                )}
                {user.survey.wakeTime && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.65 }}
                  >
                    <p className="text-sm text-foreground/60">Время подъёма</p>
                    <p className="text-foreground">{formatEnum(user.survey.wakeTime)}</p>
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}
        </motion.div>
      </main>
    </div>
  )
}
