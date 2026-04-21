import type { SurveyData } from './matching'

export type SurveyKey = keyof SurveyData

export type SurveyCategory = 'rhythm' | 'space' | 'social' | 'lifestyle'

export const CATEGORY_META: Record<SurveyCategory, { label: string; emoji: string; keys: SurveyKey[] }> = {
  rhythm: { label: 'Ритм дня', emoji: '🌙', keys: ['sleepSchedule', 'wakeTime'] },
  space: { label: 'Чистота и шум', emoji: '🧹', keys: ['cleanliness', 'noiseLevel'] },
  social: { label: 'Социальность', emoji: '🍷', keys: ['guests', 'parties', 'smoking', 'alcohol'] },
  lifestyle: { label: 'Быт', emoji: '🍳', keys: ['workFromHome', 'cooking', 'sharedSpaces', 'pets'] },
}

export const FIELD_META: Record<
  SurveyKey,
  { label: string; emoji: string; category: SurveyCategory }
> = {
  sleepSchedule: { label: 'Сон', emoji: '🌙', category: 'rhythm' },
  wakeTime: { label: 'Подъём', emoji: '⏰', category: 'rhythm' },
  cleanliness: { label: 'Чистота', emoji: '🧼', category: 'space' },
  noiseLevel: { label: 'Шум', emoji: '🔊', category: 'space' },
  guests: { label: 'Гости', emoji: '🚪', category: 'social' },
  parties: { label: 'Вечеринки', emoji: '🎉', category: 'social' },
  smoking: { label: 'Курение', emoji: '🚬', category: 'social' },
  alcohol: { label: 'Алкоголь', emoji: '🍷', category: 'social' },
  workFromHome: { label: 'Удалёнка', emoji: '💻', category: 'lifestyle' },
  cooking: { label: 'Готовка', emoji: '🍳', category: 'lifestyle' },
  sharedSpaces: { label: 'Общее пространство', emoji: '🛋', category: 'lifestyle' },
  pets: { label: 'Питомцы', emoji: '🐾', category: 'lifestyle' },
}

export const VALUE_TRANSLATIONS: Record<string, string> = {
  // sleepSchedule
  EARLY_BIRD: 'Жаворонок',
  NORMAL: 'Нейтрально',
  NIGHT_OWL: 'Сова',
  // wakeTime
  VERY_EARLY: 'Очень рано · 5-6',
  EARLY: 'Рано · 6-8',
  LATE: 'Поздно · после 10',
  // smoking / alcohol / parties
  NEVER: 'Никогда',
  OCCASIONALLY: 'Иногда',
  REGULARLY: 'Регулярно',
  // cleanliness
  VERY_CLEAN: 'Очень чисто',
  CLEAN: 'Чисто',
  MESSY: 'Может быть бардак',
  VERY_MESSY: 'Творческий хаос',
  // noiseLevel
  QUIET: 'Тихо',
  MODERATE: 'Умеренно',
  LOUD: 'Шумно',
  // guests
  RARELY: 'Редко',
  FREQUENTLY: 'Часто',
  // pets
  NONE: 'Нет питомцев',
  HAVE_CAT: 'Кот',
  HAVE_DOG: 'Собака',
  HAVE_OTHER: 'Другой',
  ALLERGIC: 'Аллергия',
  // work / cooking
  ALWAYS: 'Всегда',
  // sharedSpaces
  PRIVATE: 'Уединение',
  BALANCED: 'Середина',
  SHARED: 'Общение',
}

export function translate(value?: string | null): string {
  if (!value) return '—'
  return VALUE_TRANSLATIONS[value] ?? value
}

// Parameter order — mirrored from matching.ts for client-side comparison
export const PARAM_ORDER: Record<SurveyKey, readonly string[]> = {
  sleepSchedule: ['EARLY_BIRD', 'NORMAL', 'NIGHT_OWL'],
  smoking: ['NEVER', 'OCCASIONALLY', 'REGULARLY'],
  alcohol: ['NEVER', 'OCCASIONALLY', 'REGULARLY'],
  cleanliness: ['VERY_CLEAN', 'CLEAN', 'MESSY', 'VERY_MESSY'],
  noiseLevel: ['QUIET', 'MODERATE', 'LOUD'],
  guests: ['RARELY', 'OCCASIONALLY', 'FREQUENTLY'],
  parties: ['NEVER', 'RARELY', 'OCCASIONALLY', 'FREQUENTLY'],
  pets: ['NONE', 'HAVE_CAT', 'HAVE_DOG', 'HAVE_OTHER', 'ALLERGIC'],
  workFromHome: ['NEVER', 'OCCASIONALLY', 'FREQUENTLY', 'ALWAYS'],
  cooking: ['NEVER', 'OCCASIONALLY', 'FREQUENTLY', 'ALWAYS'],
  sharedSpaces: ['PRIVATE', 'BALANCED', 'SHARED'],
  wakeTime: ['VERY_EARLY', 'EARLY', 'NORMAL', 'LATE'],
}

export type FieldMatch = 'match' | 'partial' | 'opposite' | 'missing'

export function compareField(key: SurveyKey, a?: string | null, b?: string | null): FieldMatch {
  if (!a || !b) return 'missing'
  if (a === b) return 'match'
  const order = PARAM_ORDER[key]
  const ia = order.indexOf(a)
  const ib = order.indexOf(b)
  if (ia === -1 || ib === -1) return 'missing'
  return Math.abs(ia - ib) === 1 ? 'partial' : 'opposite'
}

export function categoryScore(
  category: SurveyCategory,
  me: SurveyData,
  them: SurveyData
): number {
  const keys = CATEGORY_META[category].keys
  let total = 0
  let max = 0
  for (const key of keys) {
    const m = compareField(key, me[key], them[key])
    max += 1
    if (m === 'match') total += 1
    else if (m === 'partial') total += 0.5
    else if (m === 'missing') total += 0.5
  }
  return max > 0 ? Math.round((total / max) * 100) : 0
}

// Conversation starters — generated from real overlap
export function generateIcebreakers(me: SurveyData, them: SurveyData): string[] {
  const ideas: string[] = []

  if (me.sleepSchedule && me.sleepSchedule === them.sleepSchedule) {
    if (me.sleepSchedule === 'NIGHT_OWL') ideas.push('Оба — совы. Спроси, чем занимаются по ночам.')
    if (me.sleepSchedule === 'EARLY_BIRD') ideas.push('Оба — жаворонки. Как выглядит их идеальное утро?')
  }

  if (me.cleanliness === 'VERY_CLEAN' && them.cleanliness === 'VERY_CLEAN') {
    ideas.push('У вас обоих высокие стандарты чистоты — обсудите, как делите уборку.')
  }

  if (me.cooking && me.cooking === them.cooking && (me.cooking === 'FREQUENTLY' || me.cooking === 'ALWAYS')) {
    ideas.push('Оба любите готовить. Спроси про фирменное блюдо.')
  }

  if (me.pets && (me.pets === 'HAVE_CAT' || me.pets === 'HAVE_DOG') && me.pets === them.pets) {
    ideas.push('У обоих есть питомцы. Как они у вас уживаются друг с другом?')
  }

  if (me.workFromHome && me.workFromHome === them.workFromHome && (me.workFromHome === 'FREQUENTLY' || me.workFromHome === 'ALWAYS')) {
    ideas.push('Оба работаете из дома. Как вы делите рабочее пространство?')
  }

  if (me.guests === 'FREQUENTLY' && them.guests === 'FREQUENTLY') {
    ideas.push('Оба любите принимать гостей. Как часто, обычно?')
  }

  // Fallback
  if (ideas.length === 0) {
    ideas.push('Начни с простого: в каком районе ищешь квартиру и на какой срок?')
    ideas.push('Спроси, есть ли что-то из анкеты, что кажется неважным — часто там скрыт настоящий профиль.')
  }

  return ideas.slice(0, 3)
}

export function scoreTone(score: number, dealbreaker: boolean): {
  tone: 'high' | 'mid' | 'low' | 'block'
  label: string
  color: string
} {
  if (dealbreaker) return { tone: 'block', label: 'Дилбрейкер', color: 'hsl(var(--destructive))' }
  if (score >= 80) return { tone: 'high', label: 'Сильный матч', color: 'hsl(var(--match-high))' }
  if (score >= 60) return { tone: 'mid', label: 'Хороший матч', color: 'hsl(var(--match-mid))' }
  return { tone: 'low', label: 'Низкий матч', color: 'hsl(var(--match-low))' }
}
