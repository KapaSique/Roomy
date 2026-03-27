import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { auth } from '@/lib/auth'

const prisma = new PrismaClient()

export async function PUT(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { profile, survey } = body

    // Update profile
    await prisma.profile.upsert({
      where: { userId: session.user.id },
      update: {
        city: profile.city,
        budgetMin: profile.budgetMin,
        budgetMax: profile.budgetMax,
        moveInDate: profile.moveInDate ? new Date(profile.moveInDate) : null,
        gender: profile.gender,
        age: profile.age,
        bio: profile.bio,
        status: profile.status,
      },
      create: {
        userId: session.user.id,
        city: profile.city,
        budgetMin: profile.budgetMin,
        budgetMax: profile.budgetMax,
        moveInDate: profile.moveInDate ? new Date(profile.moveInDate) : null,
        gender: profile.gender,
        age: profile.age,
        bio: profile.bio,
        status: profile.status,
      },
    })

    // Update survey
    await prisma.survey.upsert({
      where: { userId: session.user.id },
      update: {
        sleepSchedule: survey.sleepSchedule,
        smoking: survey.smoking,
        alcohol: survey.alcohol,
        cleanliness: survey.cleanliness,
        noiseLevel: survey.noiseLevel,
        guests: survey.guests,
        parties: survey.parties,
        pets: survey.pets,
        workFromHome: survey.workFromHome,
        cooking: survey.cooking,
        sharedSpaces: survey.sharedSpaces,
        wakeTime: survey.wakeTime,
      },
      create: {
        userId: session.user.id,
        sleepSchedule: survey.sleepSchedule,
        smoking: survey.smoking,
        alcohol: survey.alcohol,
        cleanliness: survey.cleanliness,
        noiseLevel: survey.noiseLevel,
        guests: survey.guests,
        parties: survey.parties,
        pets: survey.pets,
        workFromHome: survey.workFromHome,
        cooking: survey.cooking,
        sharedSpaces: survey.sharedSpaces,
        wakeTime: survey.wakeTime,
      },
    })

    // Update user name if changed
    if (profile.name) {
      await prisma.user.update({
        where: { id: session.user.id },
        data: { name: profile.name },
      })
    }

    // Update avatarUrl if changed
    if (profile.avatarUrl !== undefined) {
      await prisma.user.update({
        where: { id: session.user.id },
        data: { avatarUrl: profile.avatarUrl },
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Profile update error:', error)
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    )
  }
}

export async function DELETE() {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Delete matches involving this user
    await prisma.match.deleteMany({
      where: {
        OR: [
          { user1Id: session.user.id },
          { user2Id: session.user.id },
        ],
      },
    })

    // Delete messages
    await prisma.message.deleteMany({
      where: {
        senderId: session.user.id,
      },
    })

    // Delete chats
    await prisma.chat.deleteMany({
      where: {
        OR: [
          { user1Id: session.user.id },
          { user2Id: session.user.id },
        ],
      },
    })

    // Delete survey
    await prisma.survey.delete({
      where: { userId: session.user.id },
    })

    // Delete profile
    await prisma.profile.delete({
      where: { userId: session.user.id },
    })

    // Delete user
    await prisma.user.delete({
      where: { id: session.user.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Account deletion error:', error)
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    )
  }
}
