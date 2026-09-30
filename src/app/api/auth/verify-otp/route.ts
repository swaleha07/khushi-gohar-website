import { NextRequest, NextResponse } from 'next/server';
import { verifyOtp, OTP_CHALLENGE_COOKIE } from '@/lib/auth/otpStore';
import { getUserByPhone, createUser, updateUser } from '@/lib/auth/userStore';
import { createSessionToken } from '@/lib/auth/session';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { phone, countryCode = '+91', otp, name } = body;

    if (!phone || !otp) {
      return NextResponse.json(
        { success: false, error: 'MISSING_FIELDS', message: 'Phone number and 6-digit OTP are required.' },
        { status: 400 }
      );
    }

    const cleanNumber = phone.replace(/\D/g, '');
    const cleanCountryCode = countryCode.startsWith('+') ? countryCode : `+${countryCode}`;
    const fullPhone = `${cleanCountryCode}${cleanNumber}`;

    // Clean OTP format
    const cleanOtp = otp.toString().trim();
    if (cleanOtp.length !== 6 || !/^\d{6}$/.test(cleanOtp)) {
      return NextResponse.json(
        { success: false, error: 'INVALID_OTP_FORMAT', message: 'Invalid OTP. Please check the code and try again.' },
        { status: 400 }
      );
    }

    // Retrieve stateless challenge cookie if present (serverless resilience)
    const challengeToken = req.cookies.get(OTP_CHALLENGE_COOKIE)?.value || null;

    // Verify OTP against server store or challenge cookie
    const verifyResult = verifyOtp(fullPhone, cleanOtp, challengeToken);

    if (!verifyResult.valid) {
      const statusCode =
        verifyResult.error === 'MAX_ATTEMPTS_EXCEEDED'
          ? 429
          : verifyResult.error === 'EXPIRED'
          ? 410
          : 400;

      return NextResponse.json(
        {
          success: false,
          error: verifyResult.error,
          message: verifyResult.message,
          remainingAttempts: verifyResult.remainingAttempts,
        },
        { status: statusCode }
      );
    }

    // OTP is valid! Find or create user
    let user = getUserByPhone(fullPhone);
    let isNewUser = false;

    if (!user) {
      isNewUser = true;
      user = createUser(fullPhone, cleanCountryCode, cleanNumber, name);
    } else if (name && !user.name) {
      // If user had no name yet and provided one now
      const updated = updateUser(user.id, { name: name.trim() });
      if (updated) user = updated;
    }

    // Generate signed session token
    const token = createSessionToken(user.id, user.phone);

    // Set secure HTTP-only cookie
    const response = NextResponse.json({
      success: true,
      message: isNewUser
        ? `Welcome to Khushi & Gohar, ${user.name || 'Gorgeous'}!`
        : `Welcome back, ${user.name || 'Gorgeous'}!`,
      user,
      isNewUser,
      token,
    });

    const isProduction = process.env.NODE_ENV === 'production';

    // Delete temporary OTP challenge cookie
    response.cookies.delete(OTP_CHALLENGE_COOKIE);

    // Set persistent session cookie
    response.cookies.set({
      name: 'kg_session',
      value: token,
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      path: '/',
      maxAge: 30 * 24 * 60 * 60, // 30 days
    });

    return response;
  } catch (err: any) {
    console.error('verify-otp API error:', err);
    return NextResponse.json(
      { success: false, error: 'SERVER_ERROR', message: 'Internal server error while verifying OTP.' },
      { status: 500 }
    );
  }
}
