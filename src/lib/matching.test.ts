import { describe, it, expect } from 'vitest'
import { calculateCompatibility, findBestMatches } from './matching'

describe('Matching Algorithm', () => {
  describe('calculateCompatibility', () => {
    it('should return 100% for identical surveys', () => {
      const survey1 = {
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
      }

      const result = calculateCompatibility(survey1, survey1)
      expect(result.score).toBe(100)
      expect(result.dealbreakerConflict).toBe(false)
    })

    it('should return 0% with dealbreaker for smoking incompatibility', () => {
      const survey1 = {
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
      }

      const survey2 = {
        ...survey1,
        smoking: 'REGULARLY',
      }

      const result = calculateCompatibility(survey1, survey2)
      expect(result.score).toBe(0)
      expect(result.dealbreakerConflict).toBe(true)
      expect(result.dealbreakerReason).toBe('Smoking incompatibility')
    })

    it('should return 0% with dealbreaker for pets allergy', () => {
      const survey1 = {
        sleepSchedule: 'NORMAL',
        smoking: 'NEVER',
        alcohol: 'OCCASIONALLY',
        cleanliness: 'CLEAN',
        noiseLevel: 'MODERATE',
        guests: 'OCCASIONALLY',
        parties: 'RARELY',
        pets: 'ALLERGIC',
        workFromHome: 'OCCASIONALLY',
        cooking: 'OCCASIONALLY',
        sharedSpaces: 'BALANCED',
        wakeTime: 'NORMAL',
      }

      const survey2 = {
        ...survey1,
        pets: 'HAVE_CAT',
      }

      const result = calculateCompatibility(survey1, survey2)
      expect(result.score).toBe(0)
      expect(result.dealbreakerConflict).toBe(true)
      expect(result.dealbreakerReason).toBe('Pets allergy conflict')
    })

    it('should return 0% with dealbreaker for sleep schedule conflict', () => {
      const survey1 = {
        sleepSchedule: 'EARLY_BIRD',
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
      }

      const survey2 = {
        ...survey1,
        sleepSchedule: 'NIGHT_OWL',
      }

      const result = calculateCompatibility(survey1, survey2)
      expect(result.score).toBe(0)
      expect(result.dealbreakerConflict).toBe(true)
      expect(result.dealbreakerReason).toBe('Sleep schedule incompatibility')
    })

    it('should calculate partial match correctly', () => {
      const survey1 = {
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
      }

      const survey2 = {
        sleepSchedule: 'NORMAL', // match
        smoking: 'NEVER', // match
        alcohol: 'NEVER', // adjacent
        cleanliness: 'CLEAN', // match
        noiseLevel: 'MODERATE', // match
        guests: 'OCCASIONALLY', // match
        parties: 'RARELY', // match
        pets: 'NONE', // match
        workFromHome: 'OCCASIONALLY', // match
        cooking: 'OCCASIONALLY', // match
        sharedSpaces: 'BALANCED', // match
        wakeTime: 'NORMAL', // match
      }

      const result = calculateCompatibility(survey1, survey2)
      // 11 params match (1.0), 1 adjacent (0.5)
      // High weight: cleanliness, noiseLevel, guests, smoking = 4 * 3 = 12 max, all match = 12
      // Normal weight: alcohol (0.5), parties, workFromHome, cooking, sharedSpaces, wakeTime, sleepSchedule = 6 + 0.5 = 6.5
      // Total: 12 + 6.5 = 18.5 / 18 = ~100% (actually slightly less due to alcohol)
      expect(result.score).toBeGreaterThan(90)
      expect(result.dealbreakerConflict).toBe(false)
    })

    it('should handle null/undefined values gracefully', () => {
      const survey1 = {
        sleepSchedule: 'NORMAL',
        smoking: null,
        alcohol: undefined,
        cleanliness: 'CLEAN',
        noiseLevel: 'MODERATE',
        guests: 'OCCASIONALLY',
        parties: 'RARELY',
        pets: 'NONE',
        workFromHome: 'OCCASIONALLY',
        cooking: 'OCCASIONALLY',
        sharedSpaces: 'BALANCED',
        wakeTime: 'NORMAL',
      }

      const survey2 = {
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
      }

      const result = calculateCompatibility(survey1, survey2)
      expect(result.dealbreakerConflict).toBe(false)
      expect(result.score).toBeGreaterThan(0)
    })
  })

  describe('findBestMatches', () => {
    it('should return matches sorted by score', () => {
      const userSurvey = {
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
      }

      const allSurveys = [
        {
          userId: 'user1',
          survey: { ...userSurvey }, // 100% match
        },
        {
          userId: 'user2',
          survey: { ...userSurvey, smoking: 'REGULARLY' }, // dealbreaker
        },
        {
          userId: 'user3',
          survey: { ...userSurvey, alcohol: 'NEVER' }, // high match
        },
      ]

      const matches = findBestMatches(userSurvey, allSurveys)

      expect(matches.length).toBe(3)
      expect(matches[0].userId).toBe('user1')
      expect(matches[0].score).toBe(100)
      expect(matches[1].userId).toBe('user3')
      expect(matches[2].userId).toBe('user2')
      expect(matches[2].dealbreakerConflict).toBe(true)
    })

    it('should respect the limit parameter', () => {
      const userSurvey = {
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
      }

      const allSurveys = Array.from({ length: 20 }, (_, i) => ({
        userId: `user${i}`,
        survey: { ...userSurvey, alcohol: i % 2 === 0 ? 'OCCASIONALLY' : 'NEVER' },
      }))

      const matches = findBestMatches(userSurvey, allSurveys, 5)

      expect(matches.length).toBe(5)
    })
  })
})
