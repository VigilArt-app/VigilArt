import { NextResponse, NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const { pathname, origin } = req.nextUrl;

  if (pathname === '/') {
    return NextResponse.redirect(new URL('/login', origin));
  }

  if (
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/api/') ||
    pathname.match(/\.(jpg|jpeg|png|gif|svg|ico|css|js|woff2?)$/)
  ) {
    return NextResponse.next();
  }

  const token = req.cookies.get('auth_token')?.value;
  const refreshToken = req.cookies.get('refresh_token')?.value;
  const unprotectedRoutes = ['/login', '/sign-up'];
  const hasPossibleAuth = !!token || !!refreshToken;

  if (!hasPossibleAuth && !unprotectedRoutes.includes(pathname)) {
    return NextResponse.redirect(new URL('/login', origin));
  }

  if (hasPossibleAuth && unprotectedRoutes.includes(pathname)) {
    return NextResponse.redirect(new URL('/dashboard', origin));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/:path*'],
};
