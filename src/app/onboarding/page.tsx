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

const CITIES = [
  { value: 'Москва', label: 'Москва', popular: true },
  { value: 'Санкт-Петербург', label: 'Санкт-Петербург', popular: true },
  { value: 'Якутск', label: 'Якутск', popular: true },
  { value: 'Казань', label: 'Казань', popular: true },
  { value: 'Новосибирск', label: 'Новосибирск', popular: true },
  { value: 'Екатеринбург', label: 'Екатеринбург', popular: true },
  { value: 'Нижний Новгород', label: 'Нижний Новгород', popular: false },
  { value: 'Челябинск', label: 'Челябинск', popular: false },
  { value: 'Самара', label: 'Самара', popular: false },
  { value: 'Омск', label: 'Омск', popular: false },
  { value: 'Ростов-на-Дону', label: 'Ростов-на-Дону', popular: false },
  { value: 'Уфа', label: 'Уфа', popular: false },
  { value: 'Красноярск', label: 'Красноярск', popular: false },
  { value: 'Воронеж', label: 'Воронеж', popular: false },
  { value: 'Пермь', label: 'Пермь', popular: false },
  { value: 'Волгоград', label: 'Волгоград', popular: false },
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
  { value: 'VERY_CLEAN', label: 'Стерильная чистота' },
  { value: 'CLEAN', label: 'Чисто и аккуратно' },
  { value: 'MESSY', label: 'Беспорядочно' },
  { value: 'VERY_MESSY', label: 'Полный хаос' },
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
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [formData, setFormData] = useState({
    // Profile
    city: '',
    budgetMin: 20000,
    budgetMax: 60000,
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

  const updateField = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts filling
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  const nextStep = () => {
    // Validate current step fields
    const newErrors: Record<string, string> = {}

    if (currentStep === 0) {
      if (!formData.age || formData.age < 18 || formData.age > 100) {
        newErrors.age = 'Укажите возраст от 18 до 100'
      }
      if (!formData.gender) {
        newErrors.gender = 'Выберите пол'
      }
    }

    if (currentStep === 1) {
      if (!formData.city) {
        newErrors.city = 'Выберите город'
      }
      if (formData.budgetMin >= formData.budgetMax) {
        newErrors.budget = 'Минимальный бюджет должен быть меньше максимального'
      }
      if (!formData.moveInDate) {
        newErrors.moveInDate = 'Укажите дату заезда'
      }
    }

    if (currentStep === 2) {
      if (!formData.sleepSchedule) {
        newErrors.sleepSchedule = 'Выберите режим сна'
      }
      if (!formData.smoking) {
        newErrors.smoking = 'Выберите отношение к курению'
      }
      if (!formData.alcohol) {
        newErrors.alcohol = 'Выберите отношение к алкоголю'
      }
      if (!formData.cleanliness) {
        newErrors.cleanliness = 'Выберите уровень чистоплотности'
      }
    }

    if (currentStep === 3) {
      if (!formData.noiseLevel) {
        newErrors.noiseLevel = 'Выберите уровень шума'
      }
      if (!formData.guests) {
        newErrors.guests = 'Выберите частоту приёма гостей'
      }
      if (!formData.parties) {
        newErrors.parties = 'Выберите отношение к вечеринкам'
      }
      if (!formData.pets) {
        newErrors.pets = 'Выберите отношение к питомцам'
      }
    }

    if (currentStep === 4) {
      if (!formData.workFromHome) {
        newErrors.workFromHome = 'Выберите режим работы'
      }
      if (!formData.cooking) {
        newErrors.cooking = 'Выберите частоту готовки'
      }
      if (!formData.sharedSpaces) {
        newErrors.sharedSpaces = 'Выберите отношение к общим пространствам'
      }
      if (!formData.wakeTime) {
        newErrors.wakeTime = 'Выберите время подъёма'
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setCurrentStep(prev => Math.min(prev + 1, STEPS.length - 1))
  }

  const prevStep = () => {
    setErrors({})
    setCurrentStep(prev => Math.max(prev - 1, 0))
  }

  const handleSubmit = async () => {
    // Final validation
    const newErrors: Record<string, string> = {}

    if (!formData.age || formData.age < 18 || formData.age > 100) {
      newErrors.age = 'Укажите возраст от 18 до 100'
    }
    if (!formData.gender) {
      newErrors.gender = 'Выберите пол'
    }
    if (!formData.city) {
      newErrors.city = 'Выберите город'
    }
    if (formData.budgetMin >= formData.budgetMax) {
      newErrors.budget = 'Минимальный бюджет должен быть меньше максимального'
    }
    if (!formData.moveInDate) {
      newErrors.moveInDate = 'Укажите дату заезда'
    }
    if (!formData.sleepSchedule) {
      newErrors.sleepSchedule = 'Выберите режим сна'
    }
    if (!formData.smoking) {
      newErrors.smoking = 'Выберите отношение к курению'
    }
    if (!formData.alcohol) {
      newErrors.alcohol = 'Выберите отношение к алкоголю'
    }
    if (!formData.cleanliness) {
      newErrors.cleanliness = 'Выберите уровень чистоплотности'
    }
    if (!formData.noiseLevel) {
      newErrors.noiseLevel = 'Выберите уровень шума'
    }
    if (!formData.guests) {
      newErrors.guests = 'Выберите частоту приёма гостей'
    }
    if (!formData.parties) {
      newErrors.parties = 'Выберите отношение к вечеринкам'
    }
    if (!formData.pets) {
      newErrors.pets = 'Выберите отношение к питомцам'
    }
    if (!formData.workFromHome) {
      newErrors.workFromHome = 'Выберите режим работы'
    }
    if (!formData.cooking) {
      newErrors.cooking = 'Выберите частоту готовки'
    }
    if (!formData.sharedSpaces) {
      newErrors.sharedSpaces = 'Выберите отношение к общим пространствам'
    }
    if (!formData.wakeTime) {
      newErrors.wakeTime = 'Выберите время подъёма'
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      setCurrentStep(0)
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profile: {
            city: formData.city,
            budgetMin: parseInt(formData.budgetMin.toString()),
            budgetMax: parseInt(formData.budgetMax.toString()),
            moveInDate: new Date(formData.moveInDate),
            gender: formData.gender,
            age: parseInt(formData.age.toString()),
          },
          survey: {
            sleepSchedule: formData.sleepSchedule,
            smoking: formData.smoking,
            alcohol: formData.alcohol,
            cleanliness: formData.cleanliness,
            noiseLevel: formData.noiseLevel,
            guests: formData.guests,
            parties: formData.parties,
            pets: formData.pets,
            workFromHome: formData.workFromHome,
            cooking: formData.cooking,
            sharedSpaces: formData.sharedSpaces,
            wakeTime: formData.wakeTime,
            bio: formData.bio || null,
          },
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to save profile')
      }

      const data = await response.json()
      console.log('Profile saved:', data)
      router.push('/search')
      router.refresh()
    } catch (error) {
      console.error('Onboarding error:', error)
      setErrors({ submit: 'Ошибка при сохранении. Попробуйте ещё раз.' })
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
              <label className="block text-sm font-medium text-foreground/80">Возраст <span className="text-destructive">*</span></label>
              <input
                type="number"
                value={formData.age}
                onChange={(e) => updateField('age', e.target.value)}
                className={`mt-1 block w-full px-4 py-3 border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all ${
                  errors.age ? 'border-destructive' : 'border-border'
                }`}
                placeholder="25"
              />
              {errors.age && <p className="text-sm text-destructive mt-1">{errors.age}</p>}
            </motion.div>
            <motion.div variants={fieldVariants}>
              <label className="block text-sm font-medium text-foreground/80">Пол <span className="text-destructive">*</span></label>
              <select
                value={formData.gender}
                onChange={(e) => updateField('gender', e.target.value)}
                className={`mt-1 block w-full px-4 py-3 border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all ${
                  errors.gender ? 'border-destructive' : 'border-border'
                }`}
              >
                <option value="">Выберите пол...</option>
                <option value="Male">Мужской</option>
                <option value="Female">Женский</option>
              </select>
              {errors.gender && <p className="text-sm text-destructive mt-1">{errors.gender}</p>}
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
              <label className="block text-sm font-medium text-foreground/80">Город <span className="text-destructive">*</span></label>
              <select
                value={formData.city}
                onChange={(e) => updateField('city', e.target.value)}
                className={`mt-1 block w-full px-4 py-3 border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all ${
                  errors.city ? 'border-destructive' : 'border-border'
                }`}
              >
                <option value="">Выберите город...</option>
                <optgroup label="Популярные города">
                  {CITIES.filter(c => c.popular).map(city => (
                    <option key={city.value} value={city.value}>{city.label}</option>
                  ))}
                </optgroup>
                <optgroup label="Другие города">
                  {CITIES.filter(c => !c.popular).map(city => (
                    <option key={city.value} value={city.value}>{city.label}</option>
                  ))}
                </optgroup>
              </select>
              {errors.city && <p className="text-sm text-destructive mt-1">{errors.city}</p>}
            </motion.div>
            <motion.div variants={fieldVariants}>
              <label className="block text-sm font-medium text-foreground/80 mb-4">
                Бюджет в месяц (₽) <span className="text-destructive">*</span>
              </label>
              <div className="px-2">
                <div className="flex justify-between text-sm text-foreground/60 mb-2">
                  <span>от {formData.budgetMin.toLocaleString()}₽</span>
                  <span>до {formData.budgetMax.toLocaleString()}₽</span>
                </div>
                <div className="relative h-12 bg-secondary rounded-lg">
                  <input
                    type="range"
                    min="0"
                    max="100000"
                    step="5000"
                    value={formData.budgetMin}
                    onChange={(e) => updateField('budgetMin', Math.min(parseInt(e.target.value), formData.budgetMax - 5000))}
                    className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer z-10"
                    style={{ pointerEvents: 'auto' }}
                  />
                  <input
                    type="range"
                    min="0"
                    max="100000"
                    step="5000"
                    value={formData.budgetMax}
                    onChange={(e) => updateField('budgetMax', Math.max(parseInt(e.target.value), formData.budgetMin + 5000))}
                    className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer z-10"
                    style={{ pointerEvents: 'auto' }}
                  />
                  <div className="absolute top-1/2 left-0 right-0 h-2 -translate-y-1/2 mx-4">
                    <div className="relative h-full">
                      <div
                        className="absolute h-full bg-primary/30 rounded-full"
                        style={{
                          left: `${(formData.budgetMin / 100000) * 100}%`,
                          right: `${100 - (formData.budgetMax / 100000) * 100}%`,
                        }}
                      />
                      <div
                        className="absolute h-4 w-4 bg-primary rounded-full -top-1 shadow-md transition-all"
                        style={{ left: `calc(${(formData.budgetMin / 100000) * 100}% - 8px)` }}
                      />
                      <div
                        className="absolute h-4 w-4 bg-primary rounded-full -top-1 shadow-md transition-all"
                        style={{ left: `calc(${(formData.budgetMax / 100000) * 100}% - 8px)` }}
                      />
                    </div>
                  </div>
                </div>
                {errors.budget && <p className="text-sm text-destructive mt-1">{errors.budget}</p>}
              </div>
            </motion.div>
            <motion.div variants={fieldVariants}>
              <label className="block text-sm font-medium text-foreground/80">Дата заезда <span className="text-destructive">*</span></label>
              <input
                type="date"
                value={formData.moveInDate}
                onChange={(e) => updateField('moveInDate', e.target.value)}
                className={`mt-1 block w-full px-4 py-3 border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all ${
                  errors.moveInDate ? 'border-destructive' : 'border-border'
                }`}
              />
              {errors.moveInDate && <p className="text-sm text-destructive mt-1">{errors.moveInDate}</p>}
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
              <label className="block text-sm font-medium text-foreground/80">Режим сна <span className="text-destructive">*</span></label>
              <select
                value={formData.sleepSchedule}
                onChange={(e) => updateField('sleepSchedule', e.target.value)}
                className={`mt-1 block w-full px-4 py-3 border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all ${
                  errors.sleepSchedule ? 'border-destructive' : 'border-border'
                }`}
              >
                <option value="">Выберите...</option>
                {SLEEP_SCHEDULES.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              {errors.sleepSchedule && <p className="text-sm text-destructive mt-1">{errors.sleepSchedule}</p>}
            </motion.div>
            <motion.div variants={fieldVariants}>
              <label className="block text-sm font-medium text-foreground/80">Курение <span className="text-destructive">*</span></label>
              <select
                value={formData.smoking}
                onChange={(e) => updateField('smoking', e.target.value)}
                className={`mt-1 block w-full px-4 py-3 border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all ${
                  errors.smoking ? 'border-destructive' : 'border-border'
                }`}
              >
                <option value="">Выберите...</option>
                {SMOKING_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              {errors.smoking && <p className="text-sm text-destructive mt-1">{errors.smoking}</p>}
            </motion.div>
            <motion.div variants={fieldVariants}>
              <label className="block text-sm font-medium text-foreground/80">Алкоголь <span className="text-destructive">*</span></label>
              <select
                value={formData.alcohol}
                onChange={(e) => updateField('alcohol', e.target.value)}
                className={`mt-1 block w-full px-4 py-3 border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all ${
                  errors.alcohol ? 'border-destructive' : 'border-border'
                }`}
              >
                <option value="">Выберите...</option>
                {ALCOHOL_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              {errors.alcohol && <p className="text-sm text-destructive mt-1">{errors.alcohol}</p>}
            </motion.div>
            <motion.div variants={fieldVariants}>
              <label className="block text-sm font-medium text-foreground/80">Чистоплотность <span className="text-destructive">*</span></label>
              <select
                value={formData.cleanliness}
                onChange={(e) => updateField('cleanliness', e.target.value)}
                className={`mt-1 block w-full px-4 py-3 border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all ${
                  errors.cleanliness ? 'border-destructive' : 'border-border'
                }`}
              >
                <option value="">Выберите...</option>
                {CLEANLINESS_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              {errors.cleanliness && <p className="text-sm text-destructive mt-1">{errors.cleanliness}</p>}
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
              <label className="block text-sm font-medium text-foreground/80">Уровень шума <span className="text-destructive">*</span></label>
              <select
                value={formData.noiseLevel}
                onChange={(e) => updateField('noiseLevel', e.target.value)}
                className={`mt-1 block w-full px-4 py-3 border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all ${
                  errors.noiseLevel ? 'border-destructive' : 'border-border'
                }`}
              >
                <option value="">Выберите...</option>
                {NOISE_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              {errors.noiseLevel && <p className="text-sm text-destructive mt-1">{errors.noiseLevel}</p>}
            </motion.div>
            <motion.div variants={fieldVariants}>
              <label className="block text-sm font-medium text-foreground/80">Гости <span className="text-destructive">*</span></label>
              <select
                value={formData.guests}
                onChange={(e) => updateField('guests', e.target.value)}
                className={`mt-1 block w-full px-4 py-3 border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all ${
                  errors.guests ? 'border-destructive' : 'border-border'
                }`}
              >
                <option value="">Выберите...</option>
                {GUESTS_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              {errors.guests && <p className="text-sm text-destructive mt-1">{errors.guests}</p>}
            </motion.div>
            <motion.div variants={fieldVariants}>
              <label className="block text-sm font-medium text-foreground/80">Вечеринки <span className="text-destructive">*</span></label>
              <select
                value={formData.parties}
                onChange={(e) => updateField('parties', e.target.value)}
                className={`mt-1 block w-full px-4 py-3 border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all ${
                  errors.parties ? 'border-destructive' : 'border-border'
                }`}
              >
                <option value="">Выберите...</option>
                {PARTIES_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              {errors.parties && <p className="text-sm text-destructive mt-1">{errors.parties}</p>}
            </motion.div>
            <motion.div variants={fieldVariants}>
              <label className="block text-sm font-medium text-foreground/80">Питомцы <span className="text-destructive">*</span></label>
              <select
                value={formData.pets}
                onChange={(e) => updateField('pets', e.target.value)}
                className={`mt-1 block w-full px-4 py-3 border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all ${
                  errors.pets ? 'border-destructive' : 'border-border'
                }`}
              >
                <option value="">Выберите...</option>
                {PETS_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              {errors.pets && <p className="text-sm text-destructive mt-1">{errors.pets}</p>}
            </motion.div>
          </motion.div>
        )

      case 4: // Bio
        return (
          <motion.div variants={stepVariants} className="space-y-4">
            <motion.h2 variants={fieldVariants} className="text-2xl font-display font-semibold text-foreground">
              Ещё о вас
            </motion.h2>
            {errors.submit && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 bg-destructive/10 border border-destructive/30 rounded-lg"
              >
                <p className="text-sm text-destructive">{errors.submit}</p>
              </motion.div>
            )}
            <motion.div variants={fieldVariants}>
              <label className="block text-sm font-medium text-foreground/80">Работа из дома <span className="text-destructive">*</span></label>
              <select
                value={formData.workFromHome}
                onChange={(e) => updateField('workFromHome', e.target.value)}
                className={`mt-1 block w-full px-4 py-3 border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all ${
                  errors.workFromHome ? 'border-destructive' : 'border-border'
                }`}
              >
                <option value="">Выберите...</option>
                {WORK_FROM_HOME_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              {errors.workFromHome && <p className="text-sm text-destructive mt-1">{errors.workFromHome}</p>}
            </motion.div>
            <motion.div variants={fieldVariants}>
              <label className="block text-sm font-medium text-foreground/80">Готовка <span className="text-destructive">*</span></label>
              <select
                value={formData.cooking}
                onChange={(e) => updateField('cooking', e.target.value)}
                className={`mt-1 block w-full px-4 py-3 border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all ${
                  errors.cooking ? 'border-destructive' : 'border-border'
                }`}
              >
                <option value="">Выберите...</option>
                {COOKING_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              {errors.cooking && <p className="text-sm text-destructive mt-1">{errors.cooking}</p>}
            </motion.div>
            <motion.div variants={fieldVariants}>
              <label className="block text-sm font-medium text-foreground/80">Общие пространства <span className="text-destructive">*</span></label>
              <select
                value={formData.sharedSpaces}
                onChange={(e) => updateField('sharedSpaces', e.target.value)}
                className={`mt-1 block w-full px-4 py-3 border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all ${
                  errors.sharedSpaces ? 'border-destructive' : 'border-border'
                }`}
              >
                <option value="">Выберите...</option>
                {SHARED_SPACES_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              {errors.sharedSpaces && <p className="text-sm text-destructive mt-1">{errors.sharedSpaces}</p>}
            </motion.div>
            <motion.div variants={fieldVariants}>
              <label className="block text-sm font-medium text-foreground/80">Время подъёма <span className="text-destructive">*</span></label>
              <select
                value={formData.wakeTime}
                onChange={(e) => updateField('wakeTime', e.target.value)}
                className={`mt-1 block w-full px-4 py-3 border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all ${
                  errors.wakeTime ? 'border-destructive' : 'border-border'
                }`}
              >
                <option value="">Выберите...</option>
                {WAKE_TIME_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              {errors.wakeTime && <p className="text-sm text-destructive mt-1">{errors.wakeTime}</p>}
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
