'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { motion, AnimatePresence } from 'framer-motion'
import { useToast } from '@/lib/hooks/use-toast'

const CITIES = [
  'Москва', 'Санкт-Петербург', 'Якутск', 'Казань', 'Новосибирск',
  'Екатеринбург', 'Нижний Новгород', 'Челябинск', 'Самара', 'Омск',
  'Ростов-на-Дону', 'Уфа', 'Красноярск', 'Воронеж', 'Пермь', 'Волгоград',
]

const SLEEP_SCHEDULES = [
  { value: 'EARLY_BIRD', label: 'Жаворонок' },
  { value: 'NORMAL', label: 'Обычный режим' },
  { value: 'NIGHT_OWL', label: 'Сова' },
]

const SMOKING_OPTIONS = [
  { value: 'NEVER', label: 'Не курю' },
  { value: 'OCCASIONALLY', label: 'Иногда' },
  { value: 'REGULARLY', label: 'Регулярно' },
]

const ALCOHOL_OPTIONS = [
  { value: 'NEVER', label: 'Не употребляю' },
  { value: 'OCCASIONALLY', label: 'Иногда' },
  { value: 'REGULARLY', label: 'Регулярно' },
]

const CLEANLINESS_OPTIONS = [
  { value: 'VERY_CLEAN', label: 'Стерильная чистота' },
  { value: 'CLEAN', label: 'Чисто' },
  { value: 'MESSY', label: 'Беспорядочно' },
  { value: 'VERY_MESSY', label: 'Полный хаос' },
]

const NOISE_OPTIONS = [
  { value: 'QUIET', label: 'Тихо' },
  { value: 'MODERATE', label: 'Умеренно' },
  { value: 'LOUD', label: 'Шумно' },
]

const GUESTS_OPTIONS = [
  { value: 'RARELY', label: 'Редко' },
  { value: 'OCCASIONALLY', label: 'Иногда' },
  { value: 'FREQUENTLY', label: 'Часто' },
]

const PARTIES_OPTIONS = [
  { value: 'NEVER', label: 'Никогда' },
  { value: 'RARELY', label: 'Редко' },
  { value: 'OCCASIONALLY', label: 'Иногда' },
  { value: 'FREQUENTLY', label: 'Часто' },
]

const PETS_OPTIONS = [
  { value: 'NONE', label: 'Нет питомцев' },
  { value: 'HAVE_CAT', label: 'Есть кот/кошка' },
  { value: 'HAVE_DOG', label: 'Есть собака' },
  { value: 'HAVE_OTHER', label: 'Другие' },
  { value: 'ALLERGIC', label: 'Аллергия' },
]

const WORK_FROM_HOME_OPTIONS = [
  { value: 'NEVER', label: 'Никогда' },
  { value: 'OCCASIONALLY', label: 'Иногда' },
  { value: 'FREQUENTLY', label: 'Часто' },
  { value: 'ALWAYS', label: 'Всегда' },
]

const COOKING_OPTIONS = [
  { value: 'NEVER', label: 'Никогда' },
  { value: 'OCCASIONALLY', label: 'Иногда' },
  { value: 'FREQUENTLY', label: 'Часто' },
  { value: 'ALWAYS', label: 'Всегда' },
]

const SHARED_SPACES_OPTIONS = [
  { value: 'PRIVATE', label: 'Предпочитаю уединение' },
  { value: 'BALANCED', label: 'Золотая середина' },
  { value: 'SHARED', label: 'Люблю общение' },
]

const WAKE_TIME_OPTIONS = [
  { value: 'VERY_EARLY', label: 'Очень рано (5-6 утра)' },
  { value: 'EARLY', label: 'Рано (6-8 утра)' },
  { value: 'NORMAL', label: 'Обычно (8-10 утра)' },
  { value: 'LATE', label: 'Поздно (после 10 утра)' },
]

const STATUS_OPTIONS = [
  { value: 'looking', label: '🔍 Активно ищу' },
  { value: 'found', label: '✅ Нашёл' },
  { value: 'not_looking', label: '⏸️ Не ищу' },
]

type ProfileData = {
  name: string
  avatarUrl: string
  city: string
  budgetMin: number
  budgetMax: number
  moveInDate: string
  gender: string
  age: number
  bio: string
  status: string
}

type SurveyData = {
  sleepSchedule: string
  smoking: string
  alcohol: string
  cleanliness: string
  noiseLevel: string
  guests: string
  parties: string
  pets: string
  workFromHome: string
  cooking: string
  sharedSpaces: string
  wakeTime: string
}

export default function EditProfilePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/30 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    }>
      <EditProfileContent />
    </Suspense>
  )
}

function EditProfileContent() {
  const router = useRouter()
  const { data: session, update: updateSession } = useSession()
  const { success, error: showError, loading: showLoading } = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState<'basic' | 'habits' | 'danger'>('basic')

  const [profile, setProfile] = useState<ProfileData>({
    name: '',
    avatarUrl: '',
    city: '',
    budgetMin: 20000,
    budgetMax: 60000,
    moveInDate: '',
    gender: 'Male',
    age: 18,
    bio: '',
    status: 'looking',
  })

  const [survey, setSurvey] = useState<SurveyData>({
    sleepSchedule: 'NORMAL',
    smoking: 'NEVER',
    alcohol: 'OCCASIONALLY',
    cleanliness: 'CLEAN',
    noiseLevel: 'MODERATE',
    guests: 'OCCASIONALLY',
    parties: 'RARELY',
    pets: 'NONE',
    workFromHome: 'OCCASIONALLY',
    cooking: 'OCCASIONALLY',
    sharedSpaces: 'BALANCED',
    wakeTime: 'NORMAL',
  })

  useEffect(() => {
    fetchProfile()
  }, [])

  async function fetchProfile() {
    try {
      const response = await fetch('/api/me')
      const data = await response.json()

      if (response.ok && data.user) {
        const user = data.user
        setProfile({
          name: user.name || '',
          avatarUrl: user.avatarUrl || '',
          city: user.profile?.city || '',
          budgetMin: user.profile?.budgetMin || 20000,
          budgetMax: user.profile?.budgetMax || 60000,
          moveInDate: user.profile?.moveInDate ? new Date(user.profile.moveInDate).toISOString().split('T')[0] : '',
          gender: user.profile?.gender || 'Male',
          age: user.profile?.age || 18,
          bio: user.profile?.bio || '',
          status: user.profile?.status || 'looking',
        })

        if (user.survey) {
          setSurvey({
            sleepSchedule: user.survey.sleepSchedule || 'NORMAL',
            smoking: user.survey.smoking || 'NEVER',
            alcohol: user.survey.alcohol || 'OCCASIONALLY',
            cleanliness: user.survey.cleanliness || 'CLEAN',
            noiseLevel: user.survey.noiseLevel || 'MODERATE',
            guests: user.survey.guests || 'OCCASIONALLY',
            parties: user.survey.parties || 'RARELY',
            pets: user.survey.pets || 'NONE',
            workFromHome: user.survey.workFromHome || 'OCCASIONALLY',
            cooking: user.survey.cooking || 'OCCASIONALLY',
            sharedSpaces: user.survey.sharedSpaces || 'BALANCED',
            wakeTime: user.survey.wakeTime || 'NORMAL',
          })
        }
      } else {
        showError('Не удалось загрузить профиль')
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error)
      showError('Ошибка загрузки профиля')
    } finally {
      setLoading(false)
    }
  }

  async function handleSave() {
    setSaving(true)
    try {
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile, survey }),
      })

      if (response.ok) {
        success('Профиль сохранён')
        await updateSession()
        router.push('/profile')
        router.refresh()
      } else {
        const data = await response.json()
        showError(data.error || 'Ошибка сохранения')
      }
    } catch (error) {
      console.error('Save error:', error)
      showError('Ошибка сохранения профиля')
    } finally {
      setSaving(false)
    }
  }

  async function handleDeleteAccount() {
    if (!confirm('Вы уверены? Это действие нельзя отменить.')) return
    if (!confirm('Все ваши данные будут удалены навсегда. Продолжить?')) return

    try {
      const response = await fetch('/api/profile', {
        method: 'DELETE',
      })

      if (response.ok) {
        success('Аккаунт удалён')
        window.location.href = '/'
      } else {
        showError('Ошибка удаления аккаунта')
      }
    } catch (error) {
      console.error('Delete error:', error)
      showError('Ошибка удаления аккаунта')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/30 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/30">
      {/* Header */}
      <header className="bg-card border-b shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-display font-semibold text-primary">Roomy</Link>
          <nav className="flex gap-4">
            <Link href="/search" className="px-4 py-2 text-foreground/70 hover:text-foreground transition-colors">
              Поиск
            </Link>
            <Link href="/profile" className="px-4 py-2 text-foreground/70 hover:text-foreground transition-colors">
              Профиль
            </Link>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          {/* Tabs */}
          <div className="flex gap-2 mb-6 bg-card p-2 rounded-xl">
            <button
              onClick={() => setActiveTab('basic')}
              className={`flex-1 px-4 py-2 rounded-lg transition-colors ${
                activeTab === 'basic' ? 'bg-primary text-primary-foreground' : 'text-foreground hover:bg-secondary'
              }`}
            >
              Основное
            </button>
            <button
              onClick={() => setActiveTab('habits')}
              className={`flex-1 px-4 py-2 rounded-lg transition-colors ${
                activeTab === 'habits' ? 'bg-primary text-primary-foreground' : 'text-foreground hover:bg-secondary'
              }`}
            >
              Привычки
            </button>
            <button
              onClick={() => setActiveTab('danger')}
              className={`flex-1 px-4 py-2 rounded-lg transition-colors ${
                activeTab === 'danger' ? 'bg-red-500 text-white' : 'text-foreground hover:bg-secondary'
              }`}
            >
              Опасно
            </button>
          </div>

          <AnimatePresence mode="wait">
            {/* Basic Info Tab */}
            {activeTab === 'basic' && (
              <motion.div
                key="basic"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="bg-card rounded-2xl shadow-md p-6 space-y-6"
              >
                <h2 className="text-2xl font-display font-semibold text-foreground">Основная информация</h2>

                {/* Avatar */}
                <div>
                  <label className="block text-sm font-medium text-foreground/80 mb-2">Аватар</label>
                  <div className="flex gap-4 items-start">
                    <img
                      src={profile.avatarUrl || '/default-avatar.png'}
                      alt="Avatar"
                      className="w-20 h-20 rounded-full object-cover"
                    />
                    <input
                      type="url"
                      value={profile.avatarUrl}
                      onChange={(e) => setProfile({ ...profile, avatarUrl: e.target.value })}
                      placeholder="URL аватара"
                      className="flex-1 px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>

                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-foreground/80 mb-2">Имя</label>
                  <input
                    type="text"
                    value={profile.name}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                    className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                {/* Status */}
                <div>
                  <label className="block text-sm font-medium text-foreground/80 mb-2">Статус</label>
                  <select
                    value={profile.status}
                    onChange={(e) => setProfile({ ...profile, status: e.target.value })}
                    className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    {STATUS_OPTIONS.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>

                {/* City */}
                <div>
                  <label className="block text-sm font-medium text-foreground/80 mb-2">Город</label>
                  <select
                    value={profile.city}
                    onChange={(e) => setProfile({ ...profile, city: e.target.value })}
                    className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="">Выберите город...</option>
                    {CITIES.map(city => (
                      <option key={city} value={city}>{city}</option>
                    ))}
                  </select>
                </div>

                {/* Age & Gender */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground/80 mb-2">Возраст</label>
                    <input
                      type="number"
                      value={profile.age}
                      onChange={(e) => setProfile({ ...profile, age: parseInt(e.target.value) || 0 })}
                      className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground/80 mb-2">Пол</label>
                    <select
                      value={profile.gender}
                      onChange={(e) => setProfile({ ...profile, gender: e.target.value })}
                      className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="Male">Мужской</option>
                      <option value="Female">Женский</option>
                    </select>
                  </div>
                </div>

                {/* Budget */}
                <div>
                  <label className="block text-sm font-medium text-foreground/80 mb-2">
                    Бюджет: {profile.budgetMin.toLocaleString()}₽ - {profile.budgetMax.toLocaleString()}₽
                  </label>
                  <div className="flex gap-4">
                    <input
                      type="number"
                      value={profile.budgetMin}
                      onChange={(e) => setProfile({ ...profile, budgetMin: parseInt(e.target.value) || 0 })}
                      className="flex-1 px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="Мин"
                    />
                    <input
                      type="number"
                      value={profile.budgetMax}
                      onChange={(e) => setProfile({ ...profile, budgetMax: parseInt(e.target.value) || 0 })}
                      className="flex-1 px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="Макс"
                    />
                  </div>
                </div>

                {/* Move-in Date */}
                <div>
                  <label className="block text-sm font-medium text-foreground/80 mb-2">Дата заезда</label>
                  <input
                    type="date"
                    value={profile.moveInDate}
                    onChange={(e) => setProfile({ ...profile, moveInDate: e.target.value })}
                    className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                {/* Bio */}
                <div>
                  <label className="block text-sm font-medium text-foreground/80 mb-2">О себе</label>
                  <textarea
                    value={profile.bio}
                    onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Расскажите о себе..."
                  />
                </div>
              </motion.div>
            )}

            {/* Habits Tab */}
            {activeTab === 'habits' && (
              <motion.div
                key="habits"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="bg-card rounded-2xl shadow-md p-6 space-y-4"
              >
                <h2 className="text-2xl font-display font-semibold text-foreground">Привычки и образ жизни</h2>

                <SelectField
                  label="Режим сна"
                  value={survey.sleepSchedule}
                  onChange={(v) => setSurvey({ ...survey, sleepSchedule: v })}
                  options={SLEEP_SCHEDULES}
                />
                <SelectField
                  label="Курение"
                  value={survey.smoking}
                  onChange={(v) => setSurvey({ ...survey, smoking: v })}
                  options={SMOKING_OPTIONS}
                />
                <SelectField
                  label="Алкоголь"
                  value={survey.alcohol}
                  onChange={(v) => setSurvey({ ...survey, alcohol: v })}
                  options={ALCOHOL_OPTIONS}
                />
                <SelectField
                  label="Чистоплотность"
                  value={survey.cleanliness}
                  onChange={(v) => setSurvey({ ...survey, cleanliness: v })}
                  options={CLEANLINESS_OPTIONS}
                />
                <SelectField
                  label="Уровень шума"
                  value={survey.noiseLevel}
                  onChange={(v) => setSurvey({ ...survey, noiseLevel: v })}
                  options={NOISE_OPTIONS}
                />
                <SelectField
                  label="Гости"
                  value={survey.guests}
                  onChange={(v) => setSurvey({ ...survey, guests: v })}
                  options={GUESTS_OPTIONS}
                />
                <SelectField
                  label="Вечеринки"
                  value={survey.parties}
                  onChange={(v) => setSurvey({ ...survey, parties: v })}
                  options={PARTIES_OPTIONS}
                />
                <SelectField
                  label="Питомцы"
                  value={survey.pets}
                  onChange={(v) => setSurvey({ ...survey, pets: v })}
                  options={PETS_OPTIONS}
                />
                <SelectField
                  label="Работа из дома"
                  value={survey.workFromHome}
                  onChange={(v) => setSurvey({ ...survey, workFromHome: v })}
                  options={WORK_FROM_HOME_OPTIONS}
                />
                <SelectField
                  label="Готовка"
                  value={survey.cooking}
                  onChange={(v) => setSurvey({ ...survey, cooking: v })}
                  options={COOKING_OPTIONS}
                />
                <SelectField
                  label="Общие пространства"
                  value={survey.sharedSpaces}
                  onChange={(v) => setSurvey({ ...survey, sharedSpaces: v })}
                  options={SHARED_SPACES_OPTIONS}
                />
                <SelectField
                  label="Время подъёма"
                  value={survey.wakeTime}
                  onChange={(v) => setSurvey({ ...survey, wakeTime: v })}
                  options={WAKE_TIME_OPTIONS}
                />
              </motion.div>
            )}

            {/* Danger Zone Tab */}
            {activeTab === 'danger' && (
              <motion.div
                key="danger"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="bg-card rounded-2xl shadow-md p-6 space-y-6"
              >
                <h2 className="text-2xl font-display font-semibold text-red-500">Опасная зона</h2>

                <div className="border border-red-200 rounded-xl p-4 bg-red-50">
                  <h3 className="text-lg font-semibold text-red-800 mb-2">Удаление аккаунта</h3>
                  <p className="text-sm text-red-600 mb-4">
                    Это действие нельзя отменить. Все ваши данные, включая профиль, сообщения и совпадения, будут удалены навсегда.
                  </p>
                  <button
                    onClick={handleDeleteAccount}
                    className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                  >
                    Удалить аккаунт
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Save Button */}
          {activeTab !== 'danger' && (
            <div className="mt-6 flex justify-end">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSave}
                disabled={saving}
                className="px-8 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-colors shadow-lg"
              >
                {saving ? 'Сохранение...' : 'Сохранить изменения'}
              </motion.button>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  options: { value: string; label: string }[]
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-foreground/80 mb-2">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
      >
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  )
}
