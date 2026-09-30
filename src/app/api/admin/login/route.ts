import { NextRequest, NextResponse } from 'next/server';
import {
  ADMIN_COOKIE_NAME,
  checkRateLimit,
  createAdminToken,
  recordFailedAttempt,
  resetFailedAttempts,
  validateAdminCredentials,
} from '@/lib/auth/adminSession';

export async function POST(req: NextRequest) {
  try {
    const ip =
      req.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
      req.headers.get('x-real-ip') ||
      'unknown-ip';

    const body = await req.json().catch(() => ({}));
    const { username, password } = body;

    if (!username || typeof username !== 'string' || !password || typeof password !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Username and password are required' },
        { status: 400 }
      );
    }

    const rateLimitKey = `${ip}:${username.trim().toLowerCase()}`;
    const rateLimitCheck = checkRateLimit(rateLimitKey);

    if (!rateLimitCheck.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: `Too many failed login attempts. Please wait ${rateLimitCheck.retryAfterSeconds} seconds before trying again.`,
        },
        { status: 429 }
      );
    }

    const validation = validateAdminCredentials(username, password);

    if (!validation.success) {
      recordFailedAttempt(rateLimitKey);
      return NextResponse.json(
        { success: false, error: 'Invalid admin ID or password' },
        { status: 401 }
      );
    }

    // Login successful: reset rate limit attempts
    resetFailedAttempts(rateLimitKey);

    const token = createAdminToken(username.trim());

    const response = NextResponse.json({
      success: true,
      message: 'Admin authenticated successfully',
      username: username.trim(),
    });

    const isProduction = process.env.NODE_ENV === 'production';

    response.cookies.set({
      name: ADMIN_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      path: '/',
      maxAge: 12 * 60 * 60, // 12 hours
    });

    return response;
  } catch (error) {
    console.error('Error in /api/admin/login:', error);
    return NextResponse.json(
      { success: false, error: 'An unexpected server error occurred during authentication' },
      { status: 500 }
    );
  }
}
