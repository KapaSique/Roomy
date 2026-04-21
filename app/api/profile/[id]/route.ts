import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { auth } from '@/lib/auth'
import { calculateCompatibility, SurveyData } from '@/lib/matching'

const prisma = new PrismaClient()

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    const { id } = await params

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const [user, currentUser] = await Promise.all([
      prisma.user.findUnique({
        where: { id },
        include: { profile: true, survey: true },
      }),
      prisma.user.findUnique({
        where: { id: session.user.id },
        include: { survey: true },
      }),
    ])

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const userSurvey: SurveyData = pluckSurvey(user.survey)
    const currentSurvey: SurveyData | null = currentUser?.survey ? pluckSurvey(currentUser.survey) : null

    const compatibility = currentSurvey
      ? calculateCompatibility(currentSurvey, userSurvey)
      : null

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatarUrl: user.avatarUrl,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        profile: user.profile,
        survey: userSurvey,
      },
      currentUserSurvey: currentSurvey,
      compatibility,
      isOwnProfile: user.id === session.user.id,
    })
  } catch (error) {
    console.error('Profile fetch error:', error)
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
