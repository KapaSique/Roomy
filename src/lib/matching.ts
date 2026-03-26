// Matching algorithm for Roomy
// Weighted scoring with three levels: dealbreakers, high-weight, normal-weight

export type SurveyData = {
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

export type MatchResult = {
  score: number // 0-100
  dealbreakerConflict: boolean
  dealbreakerReason?: string
  breakdown: {
    dealbreakers: { passed: boolean; reason?: string }
    highWeight: { score: number; max: number }
    normalWeight: { score: number; max: number }
  }
}

// Dealbreaker combinations
const DEALBREAKERS = {
  smoking: [
    { user1: 'NEVER', user2: 'REGULARLY' },
    { user1: 'NEVER', user2: 'OCCASIONALLY' },
  ],
  pets: [
    { user1: 'ALLERGIC', user2: 'HAVE_CAT' },
    { user1: 'ALLERGIC', user2: 'HAVE_DOG' },
    { user1: 'ALLERGIC', user2: 'HAVE_OTHER' },
  ],
  sleepSchedule: [
    { user1: 'EARLY_BIRD', user2: 'NIGHT_OWL' },
    { user1: 'NIGHT_OWL', user2: 'EARLY_BIRD' },
  ],
}

// High weight parameters (3x multiplier)
const HIGH_WEIGHT_PARAMS = ['cleanliness', 'noiseLevel', 'guests', 'smoking']

// Normal weight parameters (1x multiplier)
const NORMAL_WEIGHT_PARAMS = ['alcohol', 'parties', 'workFromHome', 'cooking', 'sharedSpaces', 'wakeTime']

// Parameter order values for adjacent matching
const PARAM_ORDER: Record<string, string[]> = {
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

function checkDealbreakers(survey1: SurveyData, survey2: SurveyData): { passed: boolean; reason?: string } {
  // Check smoking dealbreakers
  if (survey1.smoking && survey2.smoking) {
    for (const combo of DEALBREAKERS.smoking) {
      if ((survey1.smoking === combo.user1 && survey2.smoking === combo.user2) ||
          (survey1.smoking === combo.user2 && survey2.smoking === combo.user1)) {
        return { passed: false, reason: 'Smoking incompatibility' }
      }
    }
  }

  // Check pets dealbreakers
  if (survey1.pets && survey2.pets) {
    for (const combo of DEALBREAKERS.pets) {
      if ((survey1.pets === combo.user1 && survey2.pets === combo.user2) ||
          (survey1.pets === combo.user2 && survey2.pets === combo.user1)) {
        return { passed: false, reason: 'Pets allergy conflict' }
      }
    }
  }

  // Check sleep schedule dealbreakers
  if (survey1.sleepSchedule && survey2.sleepSchedule) {
    for (const combo of DEALBREAKERS.sleepSchedule) {
      if ((survey1.sleepSchedule === combo.user1 && survey2.sleepSchedule === combo.user2) ||
          (survey1.sleepSchedule === combo.user2 && survey2.sleepSchedule === combo.user1)) {
        return { passed: false, reason: 'Sleep schedule incompatibility' }
      }
    }
  }

  return { passed: true }
}

function calculateParamScore(val1: string | null | undefined, val2: string | null | undefined, param: string): number {
  if (!val1 || !val2) return 0.5 // No data = neutral

  if (val1 === val2) return 1.0 // Exact match

  const order = PARAM_ORDER[param]
  if (!order) return 0.5

  const idx1 = order.indexOf(val1)
  const idx2 = order.indexOf(val2)

  if (idx1 === -1 || idx2 === -1) return 0.5

  const distance = Math.abs(idx1 - idx2)
  if (distance === 1) return 0.5 // Adjacent value
  return 0.0 // Opposite
}

export function calculateCompatibility(survey1: SurveyData, survey2: SurveyData): MatchResult {
  // Check dealbreakers first
  const dealbreakerResult = checkDealbreakers(survey1, survey2)

  if (!dealbreakerResult.passed) {
    return {
      score: 0,
      dealbreakerConflict: true,
      dealbreakerReason: dealbreakerResult.reason,
      breakdown: {
        dealbreakers: dealbreakerResult,
        highWeight: { score: 0, max: 0 },
        normalWeight: { score: 0, max: 0 },
      },
    }
  }

  // Calculate high weight scores (3x multiplier)
  let highWeightScore = 0
  let highWeightMax = 0

  for (const param of HIGH_WEIGHT_PARAMS) {
    const score = calculateParamScore(
      survey1[param as keyof SurveyData],
      survey2[param as keyof SurveyData],
      param
    )
    highWeightScore += score * 3
    highWeightMax += 3
  }

  // Calculate normal weight scores (1x multiplier)
  let normalWeightScore = 0
  let normalWeightMax = 0

  for (const param of NORMAL_WEIGHT_PARAMS) {
    const score = calculateParamScore(
      survey1[param as keyof SurveyData],
      survey2[param as keyof SurveyData],
      param
    )
    normalWeightScore += score
    normalWeightMax += 1
  }

  // Calculate final weighted score
  const totalScore = highWeightScore + normalWeightScore
  const totalMax = highWeightMax + normalWeightMax
  const percentage = totalMax > 0 ? Math.round((totalScore / totalMax) * 100) : 0

  return {
    score: percentage,
    dealbreakerConflict: false,
    breakdown: {
      dealbreakers: dealbreakerResult,
      highWeight: { score: highWeightScore, max: highWeightMax },
      normalWeight: { score: normalWeightScore, max: normalWeightMax },
    },
  }
}

export function findBestMatches(
  userSurvey: SurveyData,
  allSurveys: { userId: string; survey: SurveyData }[],
  limit: number = 10
): Array<{ userId: string; score: number; dealbreakerConflict: boolean; dealbreakerReason?: string }> {
  const matches = allSurveys
    .filter(({ survey }) => survey !== userSurvey)
    .map(({ userId, survey }) => {
      const result = calculateCompatibility(userSurvey, survey)
      return {
        userId,
        score: result.score,
        dealbreakerConflict: result.dealbreakerConflict,
        dealbreakerReason: result.dealbreakerReason,
      }
    })
    .sort((a, b) => b.score - a.score)

  return matches.slice(0, limit)
}
