import { NextResponse, NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const { pathname, origin } = req.nextUrl;

  if (
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/api/') ||
    pathname.match(/\.(jpg|jpeg|png|webp|avif|gif|svg|ico|css|js|json|woff2?)$/)
  ) {
    return NextResponse.next();
  }

  const token = req.cookies.get('auth_token')?.value;
  const refreshToken = req.cookies.get('refresh_token')?.value;
  // '/' is the public landing page. Logged-in visitors are sent on to the
  // dashboard by the rule below, so it never competes with the app.
  const unprotectedRoutes = ['/', '/login', '/sign-up'];
  const hasAuthToken = !!token;
  const hasRefreshToken = !!refreshToken;

  if (!hasAuthToken && !hasRefreshToken && !unprotectedRoutes.includes(pathname)) {
    return NextResponse.redirect(new URL('/login', origin));
  }

  if (hasAuthToken && unprotectedRoutes.includes(pathname)) {
    return NextResponse.redirect(new URL('/dashboard', origin));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/:path*'],
};
