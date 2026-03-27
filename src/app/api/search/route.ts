import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { auth } from '@/lib/auth'
import { calculateCompatibility, SurveyData } from '@/lib/matching'

const prisma = new PrismaClient()

export async function GET() {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get current user's survey
    const userSurvey = await prisma.survey.findUnique({
      where: { userId: session.user.id },
    })

    if (!userSurvey) {
      return NextResponse.json(
        { error: 'Complete your profile first' },
        { status: 400 }
      )
    }

    // Get all other users with surveys
    const users = await prisma.user.findMany({
      where: {
        id: { not: session.user.id },
        survey: {
          isNot: null,
        },
      },
      include: {
        profile: true,
        survey: true,
      },
    })

    // Calculate compatibility for each user
    const userSurveyData: SurveyData = {
      sleepSchedule: userSurvey.sleepSchedule,
      smoking: userSurvey.smoking,
      alcohol: userSurvey.alcohol,
      cleanliness: userSurvey.cleanliness,
      noiseLevel: userSurvey.noiseLevel,
      guests: userSurvey.guests,
      parties: userSurvey.parties,
      pets: userSurvey.pets,
      workFromHome: userSurvey.workFromHome,
      cooking: userSurvey.cooking,
      sharedSpaces: userSurvey.sharedSpaces,
      wakeTime: userSurvey.wakeTime,
    }

    const matches = users.map(user => {
      const surveyData: SurveyData = {
        sleepSchedule: user.survey?.sleepSchedule,
        smoking: user.survey?.smoking,
        alcohol: user.survey?.alcohol,
        cleanliness: user.survey?.cleanliness,
        noiseLevel: user.survey?.noiseLevel,
        guests: user.survey?.guests,
        parties: user.survey?.parties,
        pets: user.survey?.pets,
        workFromHome: user.survey?.workFromHome,
        cooking: user.survey?.cooking,
        sharedSpaces: user.survey?.sharedSpaces,
        wakeTime: user.survey?.wakeTime,
      }

      const compatibility = calculateCompatibility(userSurveyData, surveyData)

      return {
        user: {
          id: user.id,
          name: user.name,
          avatarUrl: user.avatarUrl,
          profile: user.profile,
        },
        ...compatibility,
      }
    })

    // Sort by score (dealbreakers last)
    matches.sort((a, b) => {
      if (a.dealbreakerConflict && !b.dealbreakerConflict) return 1
      if (!a.dealbreakerConflict && b.dealbreakerConflict) return -1
      return b.score - a.score
    })

    return NextResponse.json({ matches })
  } catch (error) {
    console.error('Search error:', error)
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    )
  }
}
