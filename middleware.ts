import { NextRequest, NextResponse } from 'next/server';

const protectedPrefixes = ['/dashboard', '/admin'];

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const needsSession = protectedPrefixes.some((prefix) => pathname.startsWith(prefix)) || pathname === '/profile';
  // Full validation, including user lookup and role verification, happens in the
  // server layouts and route handlers. This fast edge check prevents anonymous
  // navigation from rendering protected shells.
  if (needsSession && !request.cookies.get('aptivo_session')?.value) {
    const login = new URL('/auth/login', request.url);
    login.searchParams.set('next', pathname);
    return NextResponse.redirect(login);
  }
  return NextResponse.next();
}

export const config = { matcher: ['/dashboard/:path*', '/admin/:path*', '/profile'] };
