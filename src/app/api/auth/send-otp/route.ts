import { NextResponse } from 'next/server';
import { generateSecureOtp, registerOtp, OTP_CHALLENGE_COOKIE } from '@/lib/auth/otpStore';
import { getUserByPhone } from '@/lib/auth/userStore';
import { getSmsProvider } from '@/lib/sms';

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { phone, countryCode = '+91', mode = 'any' } = body;

    if (!phone || typeof phone !== 'string') {
      return NextResponse.json(
        { success: false, error: 'INVALID_PHONE', message: 'Please enter a valid mobile number.' },
        { status: 400 }
      );
    }

    const cleanNumber = phone.replace(/\D/g, '');
    const cleanCountryCode = countryCode.startsWith('+') ? countryCode : `+${countryCode}`;

    // Validate phone length based on country code
    if (cleanCountryCode === '+91') {
      if (cleanNumber.length !== 10) {
        return NextResponse.json(
          {
            success: false,
            error: 'INVALID_PHONE_LENGTH',
            message: 'Please enter a valid 10-digit Indian mobile number.',
          },
          { status: 400 }
        );
      }
    } else {
      if (cleanNumber.length < 7 || cleanNumber.length > 15) {
        return NextResponse.json(
          {
            success: false,
            error: 'INVALID_PHONE_LENGTH',
            message: 'Please enter a valid mobile number.',
          },
          { status: 400 }
        );
      }
    }

    const fullPhone = `${cleanCountryCode}${cleanNumber}`;
    const existingUser = getUserByPhone(fullPhone);

    // Enforce flow separation if requested
    if (mode === 'login' && !existingUser) {
      return NextResponse.json(
        {
          success: false,
          error: 'UNREGISTERED_PHONE',
          message: 'No account found with this mobile number. Please create an account.',
          suggestSignup: true,
        },
        { status: 404 }
      );
    }

    if (mode === 'signup' && existingUser) {
      return NextResponse.json(
        {
          success: false,
          error: 'ALREADY_REGISTERED',
          message: 'An account with this mobile number already exists. Please log in.',
          suggestLogin: true,
        },
        { status: 409 }
      );
    }

    // Generate 6-digit cryptographic OTP & register in rate-limited store
    const rawOtp = generateSecureOtp();
    const storeResult = registerOtp(fullPhone, rawOtp);

    if (!storeResult.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: 'RATE_LIMITED',
          message: storeResult.error || 'Too many OTP requests. Please wait before trying again.',
          cooldownRemaining: storeResult.cooldownRemaining,
        },
        { status: 429 }
      );
    }

    // Send via active SMS Provider
    const smsProvider = getSmsProvider();
    const sendResult = await smsProvider.sendOtp(fullPhone, rawOtp);

    if (!sendResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'SMS_GATEWAY_ERROR',
          message: sendResult.error || 'Unable to send OTP. Please try again.',
        },
        { status: 502 }
      );
    }

    // Mask phone for response (e.g. +91 98765 ••••0)
    const maskedPhone = `${cleanCountryCode} ${cleanNumber.slice(0, 3)}••••${cleanNumber.slice(-2)}`;

    const response = NextResponse.json({
      success: true,
      message: `OTP sent successfully to ${maskedPhone}`,
      maskedPhone,
      cooldownSeconds: 60,
      expiresInSeconds: storeResult.expiresInSeconds || 300,
      provider: smsProvider.name,
    });

    // Set signed stateless challenge cookie for serverless Vercel verification
    if (storeResult.challengeToken) {
      const isProduction = process.env.NODE_ENV === 'production';
      response.cookies.set({
        name: OTP_CHALLENGE_COOKIE,
        value: storeResult.challengeToken,
        httpOnly: true,
        secure: isProduction,
        sameSite: 'lax',
        path: '/',
        maxAge: 5 * 60, // 5 minutes
      });
    }

    return response;
  } catch (err: any) {
    console.error('send-otp API error:', err);
    return NextResponse.json(
      { success: false, error: 'SERVER_ERROR', message: 'Unable to send OTP. Please try again.' },
      { status: 500 }
    );
  }
}
