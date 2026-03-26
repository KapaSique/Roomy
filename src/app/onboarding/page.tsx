'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { motion, AnimatePresence } from 'framer-motion'

const STEPS = [
  { id: 'basic', title: 'Основное' },
  { id: 'housing', title: 'Жильё' },
  { id: 'habits', title: 'Привычки' },
  { id: 'social', title: 'Общение' },
  { id: 'bio', title: 'О себе' },
]

const SLEEP_SCHEDULES = [
  { value: 'EARLY_BIRD', label: 'Жаворонок (встаю до 7 утра)' },
  { value: 'NORMAL', label: 'Обычный режим (7-9 утра)' },
  { value: 'NIGHT_OWL', label: 'Сова (встаю после 9 утра)' },
]

const SMOKING_OPTIONS = [
  { value: 'NEVER', label: 'Не курю' },
  { value: 'OCCASIONALLY', label: 'Иногда курю' },
  { value: 'REGULARLY', label: 'Курю регулярно' },
]

const ALCOHOL_OPTIONS = [
  { value: 'NEVER', label: 'Не употребляю' },
  { value: 'OCCASIONALLY', label: 'Иногда употребляю' },
  { value: 'REGULARLY', label: 'Употребляю регулярно' },
]

const CLEANLINESS_OPTIONS = [
  { value: 'VERY_CLEAN', label: 'Очень чистоплотный(ая)' },
  { value: 'CLEAN', label: 'Чистоплотный(ая)' },
  { value: 'MESSY', label: 'Не очень аккуратный(ая)' },
  { value: 'VERY_MESSY', label: 'Очень неаккуратный(ая)' },
]

const NOISE_OPTIONS = [
  { value: 'QUIET', label: 'Предпочитаю тишину' },
  { value: 'MODERATE', label: 'Умеренный уровень шума' },
  { value: 'LOUD', label: 'Люблю когда шумно' },
]

const GUESTS_OPTIONS = [
  { value: 'RARELY', label: 'Редко принимаю гостей' },
  { value: 'OCCASIONALLY', label: 'Иногда принимаю гостей' },
  { value: 'FREQUENTLY', label: 'Часто принимаю гостей' },
]

const PARTIES_OPTIONS = [
  { value: 'NEVER', label: 'Не устраиваю вечеринки' },
  { value: 'RARELY', label: 'Редко устраиваю вечеринки' },
  { value: 'OCCASIONALLY', label: 'Иногда устраиваю вечеринки' },
  { value: 'FREQUENTLY', label: 'Часто устраиваю вечеринки' },
]

const PETS_OPTIONS = [
  { value: 'NONE', label: 'Без домашних животных' },
  { value: 'HAVE_CAT', label: 'Есть кот/кошка' },
  { value: 'HAVE_DOG', label: 'Есть собака' },
  { value: 'HAVE_OTHER', label: 'Есть другие питомцы' },
  { value: 'ALLERGIC', label: 'Аллергия на животных' },
]

const WORK_FROM_HOME_OPTIONS = [
  { value: 'NEVER', label: 'Никогда не работаю из дома' },
  { value: 'OCCASIONALLY', label: 'Иногда работаю из дома' },
  { value: 'FREQUENTLY', label: 'Часто работаю из дома' },
  { value: 'ALWAYS', label: 'Всегда работаю из дома' },
]

const COOKING_OPTIONS = [
  { value: 'NEVER', label: 'Никогда не готовлю' },
  { value: 'OCCASIONALLY', label: 'Иногда готовлю' },
  { value: 'FREQUENTLY', label: 'Часто готовлю' },
  { value: 'ALWAYS', label: 'Всегда готовлю' },
]

const SHARED_SPACES_OPTIONS = [
  { value: 'PRIVATE', label: 'Предпочитаю уединение' },
  { value: 'BALANCED', label: 'Золотая середина' },
  { value: 'SHARED', label: 'Люблю проводить время вместе' },
]

const WAKE_TIME_OPTIONS = [
  { value: 'VERY_EARLY', label: 'Очень рано (5-6 утра)' },
  { value: 'EARLY', label: 'Рано (6-8 утра)' },
  { value: 'NORMAL', label: 'Обычно (8-10 утра)' },
  { value: 'LATE', label: 'Поздно (после 10 утра)' },
]

const stepVariants = {
  hidden: { opacity: 0, x: 30 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.4,
      ease: [0.25, 0.46, 0.45, 0.94],
      staggerChildren: 0.1,
    },
  },
  exit: { opacity: 0, x: -30, transition: { duration: 0.3 } },
}

const fieldVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3 },
  },
}

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
          <motion.div variants={stepVariants} className="space-y-4">
            <motion.h2 variants={fieldVariants} className="text-2xl font-display font-semibold text-foreground">
              Основная информация
            </motion.h2>
            <motion.div variants={fieldVariants}>
              <label className="block text-sm font-medium text-foreground/80">Возраст</label>
              <input
                type="number"
                value={formData.age}
                onChange={(e) => updateField('age', e.target.value)}
                className="mt-1 block w-full px-4 py-3 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                placeholder="25"
              />
            </motion.div>
            <motion.div variants={fieldVariants}>
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
            </motion.div>
          </motion.div>
        )

      case 1: // Housing
        return (
          <motion.div variants={stepVariants} className="space-y-4">
            <motion.h2 variants={fieldVariants} className="text-2xl font-display font-semibold text-foreground">
              Предпочтения по жилью
            </motion.h2>
            <motion.div variants={fieldVariants}>
              <label className="block text-sm font-medium text-foreground/80">Город</label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => updateField('city', e.target.value)}
                className="mt-1 block w-full px-4 py-3 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                placeholder="Москва"
              />
            </motion.div>
            <motion.div variants={fieldVariants} className="grid grid-cols-2 gap-4">
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
            </motion.div>
            <motion.div variants={fieldVariants}>
              <label className="block text-sm font-medium text-foreground/80">Дата заезда</label>
              <input
                type="date"
                value={formData.moveInDate}
                onChange={(e) => updateField('moveInDate', e.target.value)}
                className="mt-1 block w-full px-4 py-3 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all"
              />
            </motion.div>
          </motion.div>
        )

      case 2: // Habits
        return (
          <motion.div variants={stepVariants} className="space-y-4">
            <motion.h2 variants={fieldVariants} className="text-2xl font-display font-semibold text-foreground">
              Привычки и образ жизни
            </motion.h2>
            <motion.div variants={fieldVariants}>
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
            </motion.div>
            <motion.div variants={fieldVariants}>
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
            </motion.div>
            <motion.div variants={fieldVariants}>
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
            </motion.div>
            <motion.div variants={fieldVariants}>
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
            </motion.div>
          </motion.div>
        )

      case 3: // Social
        return (
          <motion.div variants={stepVariants} className="space-y-4">
            <motion.h2 variants={fieldVariants} className="text-2xl font-display font-semibold text-foreground">
              Социальные предпочтения
            </motion.h2>
            <motion.div variants={fieldVariants}>
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
            </motion.div>
            <motion.div variants={fieldVariants}>
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
            </motion.div>
            <motion.div variants={fieldVariants}>
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
            </motion.div>
            <motion.div variants={fieldVariants}>
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
            </motion.div>
          </motion.div>
        )

      case 4: // Bio
        return (
          <motion.div variants={stepVariants} className="space-y-4">
            <motion.h2 variants={fieldVariants} className="text-2xl font-display font-semibold text-foreground">
              Ещё о вас
            </motion.h2>
            <motion.div variants={fieldVariants}>
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
            </motion.div>
            <motion.div variants={fieldVariants}>
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
            </motion.div>
            <motion.div variants={fieldVariants}>
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
            </motion.div>
            <motion.div variants={fieldVariants}>
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
            </motion.div>
            <motion.div variants={fieldVariants}>
              <label className="block text-sm font-medium text-foreground/80">О себе</label>
              <textarea
                value={formData.bio}
                onChange={(e) => updateField('bio', e.target.value)}
                rows={4}
                className="mt-1 block w-full px-4 py-3 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                placeholder="Расскажите потенциальным соседям о себе..."
              />
            </motion.div>
          </motion.div>
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
              <motion.div
                key={step.id}
                className={`flex-1 h-2 mx-1 rounded transition-all ${
                  index <= currentStep ? 'bg-primary' : 'bg-secondary'
                }`}
                layout
              />
            ))}
          </div>
          <p className="text-sm text-foreground/60 text-center mt-2">
            Шаг {currentStep + 1} из {STEPS.length}: {STEPS[currentStep].title}
          </p>
        </motion.div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            variants={stepVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {renderStep()}
          </motion.div>
        </AnimatePresence>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex justify-between mt-8"
        >
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={prevStep}
            disabled={currentStep === 0}
            className="px-6 py-3 border border-border rounded-lg text-foreground hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            Назад
          </motion.button>

          {currentStep === STEPS.length - 1 ? (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSubmit}
              disabled={loading}
              className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-all"
            >
              {loading ? 'Сохранение...' : 'Готово'}
            </motion.button>
          ) : (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={nextStep}
              className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all"
            >
              Далее
            </motion.button>
          )}
        </motion.div>
      </div>
    </div>
  )
}
