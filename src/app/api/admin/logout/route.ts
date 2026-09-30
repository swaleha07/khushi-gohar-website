import { NextResponse } from 'next/server';
import { ADMIN_COOKIE_NAME } from '@/lib/auth/adminSession';

export async function POST() {
  const response = NextResponse.json({
    success: true,
    message: 'Admin logged out successfully',
  });

  const isProduction = process.env.NODE_ENV === 'production';

  response.cookies.set({
    name: ADMIN_COOKIE_NAME,
    value: '',
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
    expires: new Date(0),
  });

  return response;
}
