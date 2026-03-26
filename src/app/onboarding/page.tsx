'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { motion } from 'framer-motion'

const STEPS = [
  { id: 'basic', title: 'Основное' },
  { id: 'housing', title: 'Жильё' },
  { id: 'habits', title: 'Привычки' },
  { id: 'social', title: 'Общение' },
  { id: 'bio', title: 'О себе' },
]

const SLEEP_SCHEDULES = [
  { value: 'EARLY_BIRD', label: 'Жаворонок (до 7 утра)' },
  { value: 'NORMAL', label: 'Нормальный (7-9 утра)' },
  { value: 'NIGHT_OWL', label: 'Сова (после 9 утра)' },
]

const SMOKING_OPTIONS = [
  { value: 'NEVER', label: 'Не курю' },
  { value: 'OCCASIONALLY', label: 'Иногда' },
  { value: 'REGULARLY', label: 'Курю регулярно' },
]

const ALCOHOL_OPTIONS = [
  { value: 'NEVER', label: 'Не пью' },
  { value: 'OCCASIONALLY', label: 'Иногда' },
  { value: 'REGULARLY', label: 'Регулярно' },
]

const CLEANLINESS_OPTIONS = [
  { value: 'VERY_CLEAN', label: 'Очень чисто' },
  { value: 'CLEAN', label: 'Чисто' },
  { value: 'MESSY', label: 'Небрежно' },
  { value: 'VERY_MESSY', label: 'Очень небрежно' },
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
  { value: 'NONE', label: 'Без питомцев' },
  { value: 'HAVE_CAT', label: 'Есть кот' },
  { value: 'HAVE_DOG', label: 'Есть собака' },
  { value: 'HAVE_OTHER', label: 'Другие питомцы' },
  { value: 'ALLERGIC', label: 'Аллергия на питомцев' },
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
  { value: 'PRIVATE', label: 'Предпочитаю приватность' },
  { value: 'BALANCED', label: 'Баланс' },
  { value: 'SHARED', label: 'Люблю общение' },
]

const WAKE_TIME_OPTIONS = [
  { value: 'VERY_EARLY', label: 'Очень рано (5-6 утра)' },
  { value: 'EARLY', label: 'Рано (6-8 утра)' },
  { value: 'NORMAL', label: 'Нормально (8-10 утра)' },
  { value: 'LATE', label: 'Поздно (после 10 утра)' },
]

export default function OnboardingPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const [currentStep, setCurrentStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    // Profile
    city: '',
    budgetMin: '',
    budgetMax: '',
    moveInDate: '',
    gender: '',
    age: '',
    // Survey
    sleepSchedule: '',
    smoking: '',
    alcohol: '',
    cleanliness: '',
    noiseLevel: '',
    guests: '',
    parties: '',
    pets: '',
    workFromHome: '',
    cooking: '',
    sharedSpaces: '',
    wakeTime: '',
    bio: '',
  })

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, STEPS.length - 1))
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 0))

  const handleSubmit = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profile: {
            city: formData.city,
            budgetMin: formData.budgetMin ? parseInt(formData.budgetMin) : null,
            budgetMax: formData.budgetMax ? parseInt(formData.budgetMax) : null,
            moveInDate: formData.moveInDate ? new Date(formData.moveInDate) : null,
            gender: formData.gender || null,
            age: formData.age ? parseInt(formData.age) : null,
          },
          survey: {
            sleepSchedule: formData.sleepSchedule || null,
            smoking: formData.smoking || null,
            alcohol: formData.alcohol || null,
            cleanliness: formData.cleanliness || null,
            noiseLevel: formData.noiseLevel || null,
            guests: formData.guests || null,
            parties: formData.parties || null,
            pets: formData.pets || null,
            workFromHome: formData.workFromHome || null,
            cooking: formData.cooking || null,
            sharedSpaces: formData.sharedSpaces || null,
            wakeTime: formData.wakeTime || null,
            bio: formData.bio || null,
          },
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to save profile')
      }

      router.push('/search')
    } catch (error) {
      console.error('Onboarding error:', error)
    } finally {
      setLoading(false)
    }
  }

  const renderStep = () => {
    switch (currentStep) {
      case 0: // Basic Info
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-display font-semibold text-foreground">Основная информация</h2>
            <div>
              <label className="block text-sm font-medium text-foreground/80">Возраст</label>
              <input
                type="number"
                value={formData.age}
                onChange={(e) => updateField('age', e.target.value)}
                className="mt-1 block w-full px-4 py-3 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                placeholder="25"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground/80">Пол</label>
              <select
                value={formData.gender}
                onChange={(e) => updateField('gender', e.target.value)}
                className="mt-1 block w-full px-4 py-3 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all"
              >
                <option value="">Выберите...</option>
                <option value="Male">Мужской</option>
                <option value="Female">Женский</option>
                <option value="Non-binary">Небинарный</option>
                <option value="Other">Другой</option>
              </select>
            </div>
          </div>
        )

      case 1: // Housing
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-display font-semibold text-foreground">Предпочтения по жилью</h2>
            <div>
              <label className="block text-sm font-medium text-foreground/80">Город</label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => updateField('city', e.target.value)}
                className="mt-1 block w-full px-4 py-3 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                placeholder="Москва"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground/80">Мин. бюджет (₽)</label>
                <input
                  type="number"
                  value={formData.budgetMin}
                  onChange={(e) => updateField('budgetMin', e.target.value)}
                  className="mt-1 block w-full px-4 py-3 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                  placeholder="30000"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground/80">Макс. бюджет (₽)</label>
                <input
                  type="number"
                  value={formData.budgetMax}
                  onChange={(e) => updateField('budgetMax', e.target.value)}
                  className="mt-1 block w-full px-4 py-3 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                  placeholder="60000"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground/80">Дата заезда</label>
              <input
                type="date"
                value={formData.moveInDate}
                onChange={(e) => updateField('moveInDate', e.target.value)}
                className="mt-1 block w-full px-4 py-3 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all"
              />
            </div>
          </div>
        )

      case 2: // Habits
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-display font-semibold text-foreground">Привычки и образ жизни</h2>
            <div>
              <label className="block text-sm font-medium text-foreground/80">Режим сна</label>
              <select
                value={formData.sleepSchedule}
                onChange={(e) => updateField('sleepSchedule', e.target.value)}
                className="mt-1 block w-full px-4 py-3 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all"
              >
                <option value="">Выберите...</option>
                {SLEEP_SCHEDULES.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground/80">Курение</label>
              <select
                value={formData.smoking}
                onChange={(e) => updateField('smoking', e.target.value)}
                className="mt-1 block w-full px-4 py-3 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all"
              >
                <option value="">Выберите...</option>
                {SMOKING_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground/80">Алкоголь</label>
              <select
                value={formData.alcohol}
                onChange={(e) => updateField('alcohol', e.target.value)}
                className="mt-1 block w-full px-4 py-3 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all"
              >
                <option value="">Выберите...</option>
                {ALCOHOL_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground/80">Чистоплотность</label>
              <select
                value={formData.cleanliness}
                onChange={(e) => updateField('cleanliness', e.target.value)}
                className="mt-1 block w-full px-4 py-3 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all"
              >
                <option value="">Выберите...</option>
                {CLEANLINESS_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>
        )

      case 3: // Social
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-display font-semibold text-foreground">Социальные предпочтения</h2>
            <div>
              <label className="block text-sm font-medium text-foreground/80">Уровень шума</label>
              <select
                value={formData.noiseLevel}
                onChange={(e) => updateField('noiseLevel', e.target.value)}
                className="mt-1 block w-full px-4 py-3 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all"
              >
                <option value="">Выберите...</option>
                {NOISE_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground/80">Гости</label>
              <select
                value={formData.guests}
                onChange={(e) => updateField('guests', e.target.value)}
                className="mt-1 block w-full px-4 py-3 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all"
              >
                <option value="">Выберите...</option>
                {GUESTS_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground/80">Вечеринки</label>
              <select
                value={formData.parties}
                onChange={(e) => updateField('parties', e.target.value)}
                className="mt-1 block w-full px-4 py-3 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all"
              >
                <option value="">Выберите...</option>
                {PARTIES_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground/80">Питомцы</label>
              <select
                value={formData.pets}
                onChange={(e) => updateField('pets', e.target.value)}
                className="mt-1 block w-full px-4 py-3 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all"
              >
                <option value="">Выберите...</option>
                {PETS_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>
        )

      case 4: // Bio
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-display font-semibold text-foreground">Ещё о вас</h2>
            <div>
              <label className="block text-sm font-medium text-foreground/80">Работа из дома</label>
              <select
                value={formData.workFromHome}
                onChange={(e) => updateField('workFromHome', e.target.value)}
                className="mt-1 block w-full px-4 py-3 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all"
              >
                <option value="">Выберите...</option>
                {WORK_FROM_HOME_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground/80">Готовка</label>
              <select
                value={formData.cooking}
                onChange={(e) => updateField('cooking', e.target.value)}
                className="mt-1 block w-full px-4 py-3 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all"
              >
                <option value="">Выберите...</option>
                {COOKING_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground/80">Общие пространства</label>
              <select
                value={formData.sharedSpaces}
                onChange={(e) => updateField('sharedSpaces', e.target.value)}
                className="mt-1 block w-full px-4 py-3 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all"
              >
                <option value="">Выберите...</option>
                {SHARED_SPACES_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground/80">Время подъёма</label>
              <select
                value={formData.wakeTime}
                onChange={(e) => updateField('wakeTime', e.target.value)}
                className="mt-1 block w-full px-4 py-3 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all"
              >
                <option value="">Выберите...</option>
                {WAKE_TIME_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground/80">О себе</label>
              <textarea
                value={formData.bio}
                onChange={(e) => updateField('bio', e.target.value)}
                rows={4}
                className="mt-1 block w-full px-4 py-3 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                placeholder="Расскажите потенциальным соседям о себе..."
              />
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/30 py-12 px-4">
      <div className="max-w-2xl mx-auto bg-card rounded-2xl shadow-xl p-8">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-8"
        >
          <div className="flex justify-between mb-2">
            {STEPS.map((step, index) => (
              <div
                key={step.id}
                className={`flex-1 h-2 mx-1 rounded transition-all ${
                  index <= currentStep ? 'bg-primary' : 'bg-secondary'
                }`}
              />
            ))}
          </div>
          <p className="text-sm text-foreground/60 text-center">
            Шаг {currentStep + 1} из {STEPS.length}: {STEPS[currentStep].title}
          </p>
        </motion.div>

        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          {renderStep()}
        </motion.div>

        <div className="flex justify-between mt-8">
          <button
            onClick={prevStep}
            disabled={currentStep === 0}
            className="px-6 py-3 border border-border rounded-lg text-foreground hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            Назад
          </button>

          {currentStep === STEPS.length - 1 ? (
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-all"
            >
              {loading ? 'Сохранение...' : 'Готово'}
            </button>
          ) : (
            <button
              onClick={nextStep}
              className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all"
            >
              Далее
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
