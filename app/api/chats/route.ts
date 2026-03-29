import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { auth } from '@/lib/auth'

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

    const chats = await prisma.chat.findMany({
      where: {
        OR: [
          { user1Id: session.user.id },
          { user2Id: session.user.id },
        ],
      },
      include: {
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    })

    const chatsWithOtherUser = await Promise.all(
      chats.map(async chat => {
        const otherUserId = chat.user1Id === session.user.id ? chat.user2Id : chat.user1Id
        const otherUser = await prisma.user.findUnique({
          where: { id: otherUserId },
          select: {
            id: true,
            name: true,
            avatarUrl: true,
          },
        })

        return {
          id: chat.id,
          otherUser,
          lastMessage: chat.messages[0] || null,
        }
      })
    )

    return NextResponse.json({ chats: chatsWithOtherUser })
  } catch (error) {
    console.error('Chats fetch error:', error)
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    )
  }
}
