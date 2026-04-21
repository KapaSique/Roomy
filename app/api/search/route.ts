import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { auth } from '@/lib/auth'
import { calculateCompatibility, SurveyData } from '@/lib/matching'

const prisma = new PrismaClient()

export async function GET() {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userSurvey = await prisma.survey.findUnique({
      where: { userId: session.user.id },
    })

    if (!userSurvey) {
      return NextResponse.json({ error: 'Complete your profile first' }, { status: 400 })
    }

    const users = await prisma.user.findMany({
      where: {
        id: { not: session.user.id },
        survey: { isNot: null },
      },
      include: {
        profile: true,
        survey: true,
      },
    })

    const userSurveyData: SurveyData = pluckSurvey(userSurvey)

    const matches = users.map((user) => {
      const partnerSurvey: SurveyData = pluckSurvey(user.survey)
      const compatibility = calculateCompatibility(userSurveyData, partnerSurvey)

      return {
        user: {
          id: user.id,
          name: user.name,
          avatarUrl: user.avatarUrl,
          profile: user.profile,
          survey: partnerSurvey,
        },
        score: compatibility.score,
        dealbreakerConflict: compatibility.dealbreakerConflict,
        dealbreakerReason: compatibility.dealbreakerReason,
        breakdown: compatibility.breakdown,
      }
    })

    matches.sort((a, b) => {
      if (a.dealbreakerConflict && !b.dealbreakerConflict) return 1
      if (!a.dealbreakerConflict && b.dealbreakerConflict) return -1
      return b.score - a.score
    })

    return NextResponse.json({
      matches,
      currentUserSurvey: userSurveyData,
    })
  } catch (error) {
    console.error('Search error:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}

function pluckSurvey(src: {
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
} | null): SurveyData {
  return {
    sleepSchedule: src?.sleepSchedule,
    smoking: src?.smoking,
    alcohol: src?.alcohol,
    cleanliness: src?.cleanliness,
    noiseLevel: src?.noiseLevel,
    guests: src?.guests,
    parties: src?.parties,
    pets: src?.pets,
    workFromHome: src?.workFromHome,
    cooking: src?.cooking,
    sharedSpaces: src?.sharedSpaces,
    wakeTime: src?.wakeTime,
  }
}
