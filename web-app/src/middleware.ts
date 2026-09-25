import { NextResponse, NextRequest } from 'next/server';
import { getRouteRedirect } from './app/public-routes';

export const middleware = async (req: NextRequest): Promise<NextResponse> => {
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
  const redirect = getRouteRedirect(pathname, {
    hasAuthToken: !!token,
    hasRefreshToken: !!refreshToken,
  });

  if (redirect) {
    return NextResponse.redirect(new URL(redirect, origin));
  }

  return NextResponse.next();
};

export const config = {
  matcher: ['/:path*'],
};
