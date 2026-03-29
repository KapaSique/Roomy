import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Mock-вход через Госуслуги для демонстрации
// В production здесь будет реальный OAuth2 flow с ЕСИА
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const callbackUrl = searchParams.get('callbackUrl') || '/search'

    // Имитируем данные из Госуслуг (ЕСИА)
    // В реальности эти данные приходят из ESIA после OAuth2 flow
    const mockGosuslugiData = {
      snils: '123-456-789 00', // Mock SNILS
      lastName: 'Иванов',
      firstName: 'Иван',
      middleName: 'Иванович',
      email: `ivan.ivanov${Date.now()}@gosuslugi.mock`,
    }

    const fullName = `${mockGosuslugiData.lastName} ${mockGosuslugiData.firstName} ${mockGosuslugiData.middleName}`.trim()

    // Проверяем, есть ли уже пользователь с таким SNILS или email
    let user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: { startsWith: 'ivan.ivanov' } },
        ],
      },
      include: {
        profile: true,
        survey: true,
      },
    })

    if (!user) {
      // Создаём нового пользователя из Госуслуг
      user = await prisma.user.create({
        data: {
          email: mockGosuslugiData.email,
          passwordHash: `gosuslugi_${Date.now()}`, // Mock password hash
          name: fullName,
          telegramId: null,
          profile: {
            create: {
              city: 'Москва',
              budgetMin: 30000,
              budgetMax: 60000,
              bio: `Здравствуйте! Меня зовут ${fullName}. Ищу соседа через Госуслуги! 🇷🇺`,
              gender: 'MALE',
              age: 25,
              status: 'looking',
            },
          },
          survey: {
            create: {
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
            },
          },
        },
        include: {
          profile: true,
          survey: true,
        },
      })
    }

    // Создаём сессию через NextAuth
    // Возвращаем редирект с токеном
    const sessionToken = `gosuslugi_${user.id}_${Date.now()}`

    // В реальном приложении здесь был бы вызов signIn('gosuslugi')
    // Для mock-режима просто редиректим с user data в URL (для демонстрации)
    const redirectUrl = new URL(callbackUrl, request.url)
    redirectUrl.searchParams.set('gosuslugi', 'true')
    redirectUrl.searchParams.set('userId', user.id)

    // Устанавливаем cookie с сессией (mock)
    const response = NextResponse.redirect(redirectUrl)
    response.cookies.set('mock-gosuslugi-session', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    })

    return response
  } catch (error) {
    console.error('Gosuslugi auth error:', error)
    return NextResponse.json(
      { error: 'Ошибка входа через Госуслуги' },
      { status: 500 }
    )
  }
}
