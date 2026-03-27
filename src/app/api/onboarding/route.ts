import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { auth } from '@/lib/auth'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const userId = session.user.id
    const { profile, survey } = await request.json()

    // Filter only valid profile fields
    const profileData = {
      city: profile?.city || null,
      budgetMin: profile?.budgetMin ? parseInt(profile.budgetMin) : null,
      budgetMax: profile?.budgetMax ? parseInt(profile.budgetMax) : null,
      moveInDate: profile?.moveInDate ? new Date(profile.moveInDate) : null,
      gender: profile?.gender || null,
      age: profile?.age ? parseInt(profile.age) : null,
      bio: profile?.bio || null,
    }

    // Filter only valid survey fields
    const surveyData = {
      sleepSchedule: survey?.sleepSchedule || null,
      smoking: survey?.smoking || null,
      alcohol: survey?.alcohol || null,
      cleanliness: survey?.cleanliness || null,
      noiseLevel: survey?.noiseLevel || null,
      guests: survey?.guests || null,
      parties: survey?.parties || null,
      pets: survey?.pets || null,
      workFromHome: survey?.workFromHome || null,
      cooking: survey?.cooking || null,
      sharedSpaces: survey?.sharedSpaces || null,
      wakeTime: survey?.wakeTime || null,
    }

    // Update or create profile
    await prisma.profile.upsert({
      where: { userId },
      update: profileData,
      create: {
        userId,
        ...profileData,
      },
    })

    // Update or create survey
    await prisma.survey.upsert({
      where: { userId },
      update: surveyData,
      create: {
        userId,
        ...surveyData,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Onboarding error:', error)
    const message = error instanceof Error ? error.message : 'Something went wrong'
    return NextResponse.json(
      { error: message },
      { status: 500 }
    )
  }
}
