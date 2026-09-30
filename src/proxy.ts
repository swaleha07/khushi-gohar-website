import { NextRequest, NextResponse } from 'next/server';
import { ADMIN_COOKIE_NAME, verifyAdminToken } from '@/lib/auth/adminSession';

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only handle /admin routes
  if (!pathname.startsWith('/admin')) {
    return NextResponse.next();
  }

  const token = request.cookies.get(ADMIN_COOKIE_NAME)?.value;
  const adminVerification = verifyAdminToken(token);

  // If user is visiting /admin/login
  if (pathname === '/admin/login') {
    if (adminVerification.valid) {
      // Already authenticated -> redirect to admin dashboard
      return NextResponse.redirect(new URL('/admin/dashboard', request.url));
    }
    // Not authenticated -> allow access to login page
    return NextResponse.next();
  }

  // Any other /admin or /admin/* route: requires authentication
  if (!adminVerification.valid) {
    const loginUrl = new URL('/admin/login', request.url);
    // Include return URL if appropriate
    if (pathname !== '/admin' && pathname !== '/admin/dashboard') {
      loginUrl.searchParams.set('redirect', pathname);
    }
    const response = NextResponse.redirect(loginUrl);
    // Clear any stale/invalid cookie
    response.cookies.delete(ADMIN_COOKIE_NAME);
    return response;
  }

  // Authenticated admin accessing protected /admin route:
  // Apply anti-caching headers so browser back button cannot show stale authenticated state after logout
  const response = NextResponse.next();
  response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  response.headers.set('Pragma', 'no-cache');
  response.headers.set('Expires', '0');

  return response;
}

export const config = {
  matcher: ['/admin', '/admin/:path*'],
};
