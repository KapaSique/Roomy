import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { auth } from '@/lib/auth'

const prisma = new PrismaClient()

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const session = await auth()
    const { userId } = await params

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get or create chat
    let chat = await prisma.chat.findFirst({
      where: {
        AND: [
          { user1Id: session.user.id },
          { user2Id: userId },
        ],
      },
    })

    if (!chat) {
      chat = await prisma.chat.findFirst({
        where: {
          AND: [
            { user1Id: userId },
            { user2Id: session.user.id },
          ],
        },
      })
    }

    if (!chat) {
      chat = await prisma.chat.create({
        data: {
          user1Id: session.user.id,
          user2Id: userId,
        },
      })
    }

    // Get messages
    const messages = await prisma.message.findMany({
      where: { chatId: chat.id },
      orderBy: { createdAt: 'asc' },
      take: 50,
    })

    return NextResponse.json({ messages })
  } catch (error) {
    console.error('Messages fetch error:', error)
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const session = await auth()
    const { userId } = await params
    const { content } = await request.json()

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    if (!content?.trim()) {
      return NextResponse.json(
        { error: 'Message content is required' },
        { status: 400 }
      )
    }

    // Get or create chat
    let chat = await prisma.chat.findFirst({
      where: {
        AND: [
          { user1Id: session.user.id },
          { user2Id: userId },
        ],
      },
    })

    if (!chat) {
      chat = await prisma.chat.findFirst({
        where: {
          AND: [
            { user1Id: userId },
            { user2Id: session.user.id },
          ],
        },
      })
    }

    if (!chat) {
      chat = await prisma.chat.create({
        data: {
          user1Id: session.user.id,
          user2Id: userId,
        },
      })
    }

    // Create message
    const message = await prisma.message.create({
      data: {
        chatId: chat.id,
        senderId: session.user.id,
        content,
      },
    })

    return NextResponse.json({ message })
  } catch (error) {
    console.error('Message send error:', error)
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    )
  }
}
