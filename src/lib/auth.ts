import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

// ЕСИА (Госуслуги) OAuth2 провайдер
// Документация: https://digital.gov.ru/ru/activity/govsystems/seo/
const GOSUSLUGI_CLIENT_ID = process.env.GOSUSLUGI_CLIENT_ID
const GOSUSLUGI_CLIENT_SECRET = process.env.GOSUSLUGI_CLIENT_SECRET
const GOSUSLUGI_ENABLED = GOSUSLUGI_CLIENT_ID && GOSUSLUGI_CLIENT_SECRET

const GosuslugiProvider = {
  id: 'gosuslugi',
  name: 'Госуслуги',
  type: 'oauth' as const,
  clientId: GOSUSLUGI_CLIENT_ID,
  clientSecret: GOSUSLUGI_CLIENT_SECRET,
  wellKnown: 'https://esia.gosuslugi.ru/.well-known/openid-configuration',
  authorization: {
    url: 'https://esia.gosuslugi.ru/idp/rso.js',
    params: {
      scope: 'fullname snils email',
      state: 'state',
    },
  },
  token: 'https://esia.gosuslugi.ru/oauth/v2/token',
  userinfo: 'https://esia.gosuslugi.ru/rs/prns/foreign',
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  profile: (profile: any) => {
    return {
      id: profile.id,
      name: `${profile.lastName} ${profile.firstName} ${profile.middleName}`.trim(),
      email: profile.email,
      snils: profile.snils,
    }
  },
  checks: ['state' as const],
  allowDangerousEmailAccountLinking: true,
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  secret: process.env.NEXTAUTH_SECRET,
  trustHost: true,
  providers: [
    Credentials({
      name: 'Email и пароль',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Пароль', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
          include: {
            profile: true,
            survey: true,
          },
        })

        if (!user) {
          return null
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password as string,
          user.passwordHash
        )

        if (!isPasswordValid) {
          return null
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          avatarUrl: user.avatarUrl,
        }
      },
    }),
    // Добавляем Госуслуги только если настроены переменные окружения
    ...(GOSUSLUGI_ENABLED ? [GosuslugiProvider] : []),
  ],
  pages: {
    signIn: '/signin',
    newUser: '/signup',
  },
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async jwt({ token, user, account }: any) {
      if (user) {
        token.id = user.id
        if (account?.provider === 'gosuslugi') {
          token.gosuslugi = true
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          token.snils = (user as any).snils
        }
      }
      return token
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async session({ session, token }: any) {
      if (session.user) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const user = session.user as any
        user.id = token.id as string
        if (token.gosuslugi) {
          user.gosuslugi = true
          user.snils = token.snils
        }
      }
      return session
    },
  },
})
