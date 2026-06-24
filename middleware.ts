import { NextResponse, type NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // /admin/login always passes through
  if (pathname === '/admin/login') {
    return NextResponse.next()
  }

  // Protect all other /admin/* routes
  if (pathname.startsWith('/admin')) {
    const session = request.cookies.get('admin-session')
    if (!session?.value) {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*'],
}
