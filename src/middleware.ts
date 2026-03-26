import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'

export async function middleware(request: NextRequest) {
  const session = await auth()
  const { pathname } = request.nextUrl

  // Public paths
  const publicPaths = ['/', '/signin', '/signup']
  if (publicPaths.includes(pathname)) {
    return NextResponse.next()
  }

  // If not authenticated, redirect to signin
  if (!session?.user) {
    return NextResponse.redirect(new URL('/signin', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!api/auth|_next/static|_next/image|favicon.ico).*)',
  ],
}
