import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl
    const token = req.nextauth.token

    // Admin routes protection
    if (pathname.startsWith('/admin') && token?.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl

        // Public routes that don't require auth
        const publicRoutes = [
          '/',
          '/giris',
          '/kayit',
          '/sifremi-unuttum',
          '/sifre-sifirla',
          '/nasil-calisir',
          '/hakkimizda',
          '/sss',
          '/iletisim',
          '/blog',
          '/tazminat-hesapla',
        ]

        // Check if current path is public
        const isPublicRoute = publicRoutes.some(
          (route) => pathname === route || pathname.startsWith(`${route}/`)
        )

        // API routes and static files
        if (
          pathname.startsWith('/api') ||
          pathname.startsWith('/_next') ||
          pathname.includes('.')
        ) {
          return true
        }

        // Allow public routes
        if (isPublicRoute) {
          return true
        }

        // Require auth for protected routes
        return !!token
      },
    },
  }
)

export const config = {
  matcher: ['/((?!api/auth|_next/static|_next/image|favicon.ico).*)'],
}
