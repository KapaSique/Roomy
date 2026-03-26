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

    const { profile, survey } = await request.json()

    // Update or create profile
    await prisma.profile.upsert({
      where: { userId: session.user.id },
      update: profile,
      create: {
        userId: session.user.id,
        ...profile,
      },
    })

    // Update or create survey
    await prisma.survey.upsert({
      where: { userId: session.user.id },
      update: survey,
      create: {
        userId: session.user.id,
        ...survey,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Onboarding error:', error)
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    )
  }
}
