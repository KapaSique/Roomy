'use client'

import { motion } from 'framer-motion'

type SurveyData = {
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
}

type ComparisonProps = {
  user1Survey: SurveyData
  user2Survey: SurveyData
  user1Name: string
  user2Name: string
}

const formatLabel = (key: string): string => {
  const labels: Record<string, string> = {
    sleepSchedule: 'Режим сна',
    smoking: 'Курение',
    alcohol: 'Алкоголь',
    cleanliness: 'Чистоплотность',
    noiseLevel: 'Уровень шума',
    guests: 'Гости',
    parties: 'Вечеринки',
    pets: 'Питомцы',
    workFromHome: 'Работа из дома',
    cooking: 'Готовка',
    sharedSpaces: 'Общие пространства',
    wakeTime: 'Время подъёма',
  }
  return labels[key] || key
}

const formatValue = (value: string): string => {
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

const getCompatibilityStatus = (value1: string | null | undefined, value2: string | null | undefined, key: string) => {
  if (!value1 || !value2) return 'unknown'

  if (value1 === value2) return 'match'

  // Dealbreaker checks
  if (key === 'smoking') {
    if ((value1 === 'NEVER' && value2 !== 'NEVER') || (value2 === 'NEVER' && value1 !== 'NEVER')) {
      return 'conflict'
    }
  }

  if (key === 'pets') {
    if (
      (value1 === 'ALLERGIC' && (value2 === 'HAVE_CAT' || value2 === 'HAVE_DOG')) ||
      (value2 === 'ALLERGIC' && (value1 === 'HAVE_CAT' || value1 === 'HAVE_DOG'))
    ) {
      return 'conflict'
    }
  }

  if (key === 'sleepSchedule') {
    if ((value1 === 'EARLY_BIRD' && value2 === 'NIGHT_OWL') || (value2 === 'EARLY_BIRD' && value1 === 'NIGHT_OWL')) {
      return 'conflict'
    }
  }

  if (key === 'cleanliness') {
    const cleanValues = ['VERY_CLEAN', 'CLEAN']
    const messyValues = ['MESSY', 'VERY_MESSY']
    if (
      (cleanValues.includes(value1) && messyValues.includes(value2)) ||
      (cleanValues.includes(value2) && messyValues.includes(value1))
    ) {
      return 'warning'
    }
  }

  if (key === 'noiseLevel') {
    if ((value1 === 'QUIET' && value2 === 'LOUD') || (value2 === 'QUIET' && value1 === 'LOUD')) {
      return 'warning'
    }
  }

  // Adjacent values - partial compatibility
  const adjacentValues: Record<string, string[][]> = {
    sleepSchedule: [['EARLY_BIRD', 'NORMAL'], ['NORMAL', 'NIGHT_OWL']],
    cleanliness: [['VERY_CLEAN', 'CLEAN'], ['CLEAN', 'MESSY'], ['MESSY', 'VERY_MESSY']],
    noiseLevel: [['QUIET', 'MODERATE'], ['MODERATE', 'LOUD']],
    guests: [['RARELY', 'OCCASIONALLY'], ['OCCASIONALLY', 'FREQUENTLY']],
    parties: [['NEVER', 'RARELY'], ['RARELY', 'OCCASIONALLY'], ['OCCASIONALLY', 'FREQUENTLY']],
  }

  if (adjacentValues[key]) {
    const pairs = adjacentValues[key]
    if (pairs.some(pair =>
      (pair[0] === value1 && pair[1] === value2) ||
      (pair[0] === value2 && pair[1] === value1)
    )) {
      return 'partial'
    }
  }

  return 'different'
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'match':
      return 'bg-green-100 border-green-500 text-green-800'
    case 'conflict':
      return 'bg-red-100 border-red-500 text-red-800'
    case 'warning':
      return 'bg-yellow-100 border-yellow-500 text-yellow-800'
    case 'partial':
      return 'bg-blue-100 border-blue-500 text-blue-800'
    default:
      return 'bg-gray-100 border-gray-300 text-gray-800'
  }
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'match':
      return '✓'
    case 'conflict':
      return '✗'
    case 'warning':
      return '⚠'
    case 'partial':
      return '~'
    default:
      return '•'
  }
}

export function ProfileComparison({ user1Survey, user2Survey, user1Name, user2Name }: ComparisonProps) {
  const categories = Object.keys(user1Survey) as (keyof SurveyData)[]

  const scoreBreakdown = categories.map(key => {
    const status = getCompatibilityStatus(user1Survey[key], user2Survey[key], key)
    let weight = 1
    let score = 0

    // High-weight categories
    if (['cleanliness', 'noiseLevel', 'guests', 'smoking'].includes(key)) {
      weight = 3
    }

    switch (status) {
      case 'match':
        score = 1
        break
      case 'partial':
        score = 0.75
        break
      case 'warning':
        score = 0.5
        break
      case 'different':
        score = 0.25
        break
      case 'conflict':
        score = 0
        break
    }

    return { key, status, weight, score }
  })

  const totalWeight = scoreBreakdown.reduce((sum, item) => sum + item.weight, 0)
  const weightedScore = scoreBreakdown.reduce((sum, item) => sum + (item.score * item.weight), 0)
  const overallCompatibility = Math.round((weightedScore / totalWeight) * 100)

  const hasDealbreaker = scoreBreakdown.some(item => item.status === 'conflict')

  return (
    <div className="space-y-6">
      {/* Overall Score */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`rounded-2xl p-6 text-center ${
          hasDealbreaker ? 'bg-red-50 border-2 border-red-200' : 'bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10'
        }`}
      >
        <h3 className="text-lg font-medium text-foreground/80 mb-2">
          Общая совместимость
        </h3>
        <div className="flex items-center justify-center gap-4">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
            className={`text-6xl font-bold ${
              hasDealbreaker
                ? 'text-red-600'
                : overallCompatibility >= 70
                ? 'text-green-600'
                : overallCompatibility >= 40
                ? 'text-yellow-600'
                : 'text-red-600'
            }`}
          >
            {hasDealbreaker ? '!' : `${overallCompatibility}%`}
          </motion.div>
        </div>
        {hasDealbreaker && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-red-600 font-medium mt-2"
          >
            ⚠️ Обнаружен критический конфликт
          </motion.p>
        )}
      </motion.div>

      {/* Detailed Breakdown */}
      <div className="space-y-3">
        {scoreBreakdown.map((item, index) => {
          const status = getCompatibilityStatus(user1Survey[item.key], user2Survey[item.key], item.key)

          return (
            <motion.div
              key={item.key}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`rounded-xl border-2 p-4 ${getStatusColor(status)}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium opacity-80 mb-1">
                    {formatLabel(item.key)}
                  </p>
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <p className="text-xs opacity-60">{user1Name}</p>
                      <p className="font-semibold">{formatValue(user1Survey[item.key] || '')}</p>
                    </div>
                    <div className="text-2xl font-bold opacity-50">
                      {getStatusIcon(status)}
                    </div>
                    <div className="flex-1 text-right">
                      <p className="text-xs opacity-60">{user2Name}</p>
                      <p className="font-semibold">{formatValue(user2Survey[item.key] || '')}</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Score Legend */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="bg-card rounded-xl p-4 shadow-md"
      >
        <h4 className="text-sm font-medium text-foreground/80 mb-3">Условные обозначения</h4>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-green-100 border-2 border-green-500 flex items-center justify-center text-green-800 text-sm">✓</span>
            <span className="text-xs text-foreground/70">Совпадение</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-blue-100 border-2 border-blue-500 flex items-center justify-center text-blue-800 text-sm">~</span>
            <span className="text-xs text-foreground/70">Частично</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-yellow-100 border-2 border-yellow-500 flex items-center justify-center text-yellow-800 text-sm">⚠</span>
            <span className="text-xs text-foreground/70">Различие</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-red-100 border-2 border-red-500 flex items-center justify-center text-red-800 text-sm">✗</span>
            <span className="text-xs text-foreground/70">Конфликт</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-gray-100 border-2 border-gray-300 flex items-center justify-center text-gray-800 text-sm">•</span>
            <span className="text-xs text-foreground/70">Разное</span>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
