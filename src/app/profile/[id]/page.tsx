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
    NORMAL: 'Нормальный',
    NIGHT_OWL: 'Сова',
    NEVER: 'Никогда',
    OCCASIONALLY: 'Иногда',
    REGULARLY: 'Регулярно',
    VERY_CLEAN: 'Очень чисто',
    CLEAN: 'Чисто',
    MESSY: 'Небрежно',
    VERY_MESSY: 'Очень небрежно',
    QUIET: 'Тихо',
    MODERATE: 'Умеренно',
    LOUD: 'Шумно',
    RARELY: 'Редко',
    FREQUENTLY: 'Часто',
    NONE: 'Нет питомцев',
    HAVE_CAT: 'Есть кот',
    HAVE_DOG: 'Есть собака',
    HAVE_OTHER: 'Другие питомцы',
    ALLERGIC: 'Аллергия',
    ALWAYS: 'Всегда',
    PRIVATE: 'Приватность',
    BALANCED: 'Баланс',
    SHARED: 'Общение',
    VERY_EARLY: 'Очень рано',
    EARLY: 'Рано',
    LATE: 'Поздно',
  }
  return translations[value] || value
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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/30">
      {/* Header */}
      <header className="bg-card border-b shadow-sm">
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
      </header>

      {/* Profile Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Profile Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card rounded-2xl shadow-md p-8 mb-6"
          >
            <div className="flex items-center gap-6">
              <img
                src={user.avatarUrl || '/default-avatar.png'}
                alt={user.name}
                className="w-24 h-24 rounded-full object-cover"
              />
              <div>
                <h1 className="text-3xl font-display font-semibold text-foreground">{user.name}</h1>
                <p className="text-foreground/60">
                  {user.profile?.city && `${user.profile.city}`}
                  {user.profile?.age && `, ${user.profile.age}`}
                  {user.profile?.gender && ` • ${user.profile.gender}`}
                </p>
                {user.profile?.bio && (
                  <p className="mt-2 text-foreground/70">{user.profile.bio}</p>
                )}
              </div>
            </div>

            {!isOwnProfile && (
              <div className="mt-6">
                <Link
                  href={`/chats?userId=${user.id}`}
                  className="inline-block px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                >
                  Написать сообщение
                </Link>
              </div>
            )}
          </motion.div>

          {/* Housing Info */}
          {user.profile && (user.profile.budgetMin || user.profile.budgetMax || user.profile.moveInDate) && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-card rounded-2xl shadow-md p-6 mb-6"
            >
              <h2 className="text-xl font-display font-semibold text-foreground mb-4">Предпочтения по жилью</h2>
              <div className="grid md:grid-cols-3 gap-4">
                {(user.profile.budgetMin || user.profile.budgetMax) && (
                  <div>
                    <p className="text-sm text-foreground/60">Бюджет</p>
                    <p className="text-foreground">
                      {user.profile.budgetMin && `${user.profile.budgetMin.toLocaleString()}₽`}
                      {' — '}
                      {user.profile.budgetMax && `${user.profile.budgetMax.toLocaleString()}₽`}
                    </p>
                  </div>
                )}
                {user.profile.moveInDate && (
                  <div>
                    <p className="text-sm text-foreground/60">Дата заезда</p>
                    <p className="text-foreground">
                      {new Date(user.profile.moveInDate).toLocaleDateString('ru-RU')}
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Survey/Habits */}
          {user.survey && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-card rounded-2xl shadow-md p-6"
            >
              <h2 className="text-xl font-display font-semibold text-foreground mb-4">Привычки и образ жизни</h2>
              <div className="grid md:grid-cols-2 gap-4">
                {user.survey.sleepSchedule && (
                  <div>
                    <p className="text-sm text-foreground/60">Режим сна</p>
                    <p className="text-foreground">{formatEnum(user.survey.sleepSchedule)}</p>
                  </div>
                )}
                {user.survey.smoking && (
                  <div>
                    <p className="text-sm text-foreground/60">Курение</p>
                    <p className="text-foreground">{formatEnum(user.survey.smoking)}</p>
                  </div>
                )}
                {user.survey.alcohol && (
                  <div>
                    <p className="text-sm text-foreground/60">Алкоголь</p>
                    <p className="text-foreground">{formatEnum(user.survey.alcohol)}</p>
                  </div>
                )}
                {user.survey.cleanliness && (
                  <div>
                    <p className="text-sm text-foreground/60">Чистоплотность</p>
                    <p className="text-foreground">{formatEnum(user.survey.cleanliness)}</p>
                  </div>
                )}
                {user.survey.noiseLevel && (
                  <div>
                    <p className="text-sm text-foreground/60">Уровень шума</p>
                    <p className="text-foreground">{formatEnum(user.survey.noiseLevel)}</p>
                  </div>
                )}
                {user.survey.guests && (
                  <div>
                    <p className="text-sm text-foreground/60">Гости</p>
                    <p className="text-foreground">{formatEnum(user.survey.guests)}</p>
                  </div>
                )}
                {user.survey.parties && (
                  <div>
                    <p className="text-sm text-foreground/60">Вечеринки</p>
                    <p className="text-foreground">{formatEnum(user.survey.parties)}</p>
                  </div>
                )}
                {user.survey.pets && (
                  <div>
                    <p className="text-sm text-foreground/60">Питомцы</p>
                    <p className="text-foreground">{formatEnum(user.survey.pets)}</p>
                  </div>
                )}
                {user.survey.workFromHome && (
                  <div>
                    <p className="text-sm text-foreground/60">Работа из дома</p>
                    <p className="text-foreground">{formatEnum(user.survey.workFromHome)}</p>
                  </div>
                )}
                {user.survey.cooking && (
                  <div>
                    <p className="text-sm text-foreground/60">Готовка</p>
                    <p className="text-foreground">{formatEnum(user.survey.cooking)}</p>
                  </div>
                )}
                {user.survey.sharedSpaces && (
                  <div>
                    <p className="text-sm text-foreground/60">Общие пространства</p>
                    <p className="text-foreground">{formatEnum(user.survey.sharedSpaces)}</p>
                  </div>
                )}
                {user.survey.wakeTime && (
                  <div>
                    <p className="text-sm text-foreground/60">Время подъёма</p>
                    <p className="text-foreground">{formatEnum(user.survey.wakeTime)}</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </div>
      </main>
    </div>
  )
}
