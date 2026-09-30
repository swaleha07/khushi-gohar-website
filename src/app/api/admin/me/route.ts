import { NextRequest, NextResponse } from 'next/server';
import { getAdminFromRequest } from '@/lib/auth/adminSession';

export async function GET(req: NextRequest) {
  const admin = getAdminFromRequest(req);

  if (!admin.valid) {
    return NextResponse.json(
      {
        success: false,
        authenticated: false,
        error: admin.error || 'Unauthorized admin access',
      },
      { status: 401 }
    );
  }

  return NextResponse.json({
    success: true,
    authenticated: true,
    admin: {
      username: admin.username,
      role: 'admin',
    },
  });
}
