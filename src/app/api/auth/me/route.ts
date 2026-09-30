import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifySessionToken } from '@/lib/auth/session';
import { getUserById } from '@/lib/auth/userStore';

export async function GET(req: Request) {
  try {
    const cookieStore = await cookies();
    let token = cookieStore.get('kg_session')?.value;

    // Fallback to Authorization header
    if (!token) {
      const authHeader = req.headers.get('Authorization');
      if (authHeader?.startsWith('Bearer ')) {
        token = authHeader.substring(7);
      }
    }

    if (!token) {
      return NextResponse.json({ success: false, user: null }, { status: 200 });
    }

    const payload = verifySessionToken(token);
    if (!payload) {
      return NextResponse.json({ success: false, user: null }, { status: 200 });
    }

    const user = getUserById(payload.userId, payload.phone);
    if (!user) {
      return NextResponse.json({ success: false, user: null }, { status: 200 });
    }

    return NextResponse.json({
      success: true,
      user,
    });
  } catch (err: any) {
    console.error('me API error:', err);
    return NextResponse.json({ success: false, user: null }, { status: 200 });
  }
}
