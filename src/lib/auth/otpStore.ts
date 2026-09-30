import crypto from 'crypto';

export const OTP_CHALLENGE_COOKIE = 'kg_otp_challenge';
const OTP_EXPIRY_MS = 5 * 60 * 1000; // 5 minutes
const RESEND_COOLDOWN_MS = 60 * 1000; // 60 seconds
const MAX_VERIFY_ATTEMPTS = 3;
const MAX_RESENDS_PER_WINDOW = 4; // Initial + 3 resends

interface OtpRecord {
  phone: string;
  otpHash: string;
  salt: string;
  createdAt: number;
  expiresAt: number;
  attempts: number;
  lastSentAt: number;
  resendCount: number;
}

interface OtpChallengePayload {
  phone: string;
  otpHash: string;
  salt: string;
  expiresAt: number;
  attempts: number;
}

// In-memory record store (for rate limiting and cooldown caching)
const otpStore = new Map<string, OtpRecord>();

function getOtpSigningSecret(): string {
  return process.env.SESSION_SECRET || 'khushi_luxury_skincare_production_secret_key_2026';
}

function hashOtp(otp: string, salt: string): string {
  return crypto.createHash('sha256').update(`${salt}:${otp.trim()}`).digest('hex');
}

/**
 * Constant-time comparison to prevent timing attacks
 */
function safeCompare(a: string, b: string): boolean {
  try {
    const bufA = Buffer.from(a, 'utf-8');
    const bufB = Buffer.from(b, 'utf-8');
    if (bufA.length !== bufB.length) {
      crypto.timingSafeEqual(bufA, bufA);
      return false;
    }
    return crypto.timingSafeEqual(bufA, bufB);
  } catch {
    return false;
  }
}

/**
 * Generate cryptographically secure 6-digit numeric OTP
 */
export function generateSecureOtp(): string {
  return crypto.randomInt(100000, 999999).toString();
}

/**
 * Clean up expired OTP entries periodically from memory
 */
function cleanupExpired() {
  const now = Date.now();
  for (const [phone, record] of otpStore.entries()) {
    if (now > record.expiresAt + 60000) {
      otpStore.delete(phone);
    }
  }
}

export interface StoreOtpResult {
  allowed: boolean;
  error?: string;
  cooldownRemaining?: number;
  expiresInSeconds?: number;
  challengeToken?: string;
}

/**
 * Creates an HMAC signed stateless challenge token for Vercel serverless resilience.
 * Does NOT contain the raw OTP (only salted SHA-256 hash).
 */
export function createOtpChallengeToken(
  phone: string,
  rawOtp: string,
  salt?: string
): { token: string; salt: string; otpHash: string; expiresAt: number } {
  const effectiveSalt = salt || crypto.randomBytes(16).toString('hex');
  const otpHash = hashOtp(rawOtp, effectiveSalt);
  const expiresAt = Date.now() + OTP_EXPIRY_MS;

  const payload: OtpChallengePayload = {
    phone,
    otpHash,
    salt: effectiveSalt,
    expiresAt,
    attempts: 0,
  };

  const payloadB64 = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto
    .createHmac('sha256', getOtpSigningSecret())
    .update(payloadB64)
    .digest('base64url');

  return {
    token: `${payloadB64}.${signature}`,
    salt: effectiveSalt,
    otpHash,
    expiresAt,
  };
}

/**
 * Register OTP in rate-limiting store and generate stateless challenge token.
 */
export function registerOtp(phone: string, rawOtp: string): StoreOtpResult {
  cleanupExpired();
  const now = Date.now();
  const existing = otpStore.get(phone);

  if (existing) {
    // Check cooldown
    const elapsedSinceLastSend = now - existing.lastSentAt;
    if (elapsedSinceLastSend < RESEND_COOLDOWN_MS) {
      const cooldownRemaining = Math.ceil((RESEND_COOLDOWN_MS - elapsedSinceLastSend) / 1000);
      return {
        allowed: false,
        error: `Please wait ${cooldownRemaining}s before requesting a new OTP.`,
        cooldownRemaining,
      };
    }

    // Check resend limits
    if (existing.resendCount >= MAX_RESENDS_PER_WINDOW) {
      const lockRemaining = Math.ceil((existing.expiresAt - now) / 1000);
      if (lockRemaining > 0) {
        return {
          allowed: false,
          error: 'Too many OTP requests. Please wait before trying again.',
        };
      }
    }
  }

  const salt = crypto.randomBytes(16).toString('hex');
  const otpHash = hashOtp(rawOtp, salt);
  const resendCount = existing ? existing.resendCount + 1 : 1;

  const record: OtpRecord = {
    phone,
    otpHash,
    salt,
    createdAt: now,
    expiresAt: now + OTP_EXPIRY_MS,
    attempts: 0,
    lastSentAt: now,
    resendCount,
  };

  otpStore.set(phone, record);

  const { token } = createOtpChallengeToken(phone, rawOtp, salt);

  return {
    allowed: true,
    expiresInSeconds: Math.floor(OTP_EXPIRY_MS / 1000),
    challengeToken: token,
  };
}

export interface VerifyOtpResult {
  valid: boolean;
  error?: 'NOT_FOUND' | 'EXPIRED' | 'MAX_ATTEMPTS_EXCEEDED' | 'INCORRECT' | 'INVALID_FORMAT';
  message: string;
  remainingAttempts?: number;
}

/**
 * Verify submitted OTP against stored state or stateless HMAC challenge token.
 * This guarantees seamless verification even when requests hit separate Vercel lambda instances.
 */
export function verifyOtp(
  phone: string,
  inputOtp: string,
  challengeToken?: string | null
): VerifyOtpResult {
  cleanupExpired();
  const now = Date.now();
  const cleanInputOtp = inputOtp.trim();

  // 1. Verify via stateless HMAC Challenge Token (Serverless resilient)
  if (challengeToken) {
    try {
      const parts = challengeToken.split('.');
      if (parts.length === 2) {
        const [payloadB64, signature] = parts;
        const expectedSignature = crypto
          .createHmac('sha256', getOtpSigningSecret())
          .update(payloadB64)
          .digest('base64url');

        if (safeCompare(signature, expectedSignature)) {
          const payload: OtpChallengePayload = JSON.parse(
            Buffer.from(payloadB64, 'base64url').toString('utf-8')
          );

          // Verify matching phone
          const phoneMatch =
            payload.phone.replace(/\D/g, '').slice(-10) === phone.replace(/\D/g, '').slice(-10);

          if (phoneMatch) {
            if (now > payload.expiresAt) {
              otpStore.delete(phone);
              return {
                valid: false,
                error: 'EXPIRED',
                message: 'This OTP has expired. Please request a new OTP.',
              };
            }

            const computedHash = hashOtp(cleanInputOtp, payload.salt);
            if (safeCompare(computedHash, payload.otpHash)) {
              // Successfully verified! Clear memory cache
              otpStore.delete(phone);
              return {
                valid: true,
                message: 'OTP verified successfully.',
              };
            } else {
              return {
                valid: false,
                error: 'INCORRECT',
                message: 'Invalid OTP. Please check the code and try again.',
              };
            }
          }
        }
      }
    } catch (err) {
      console.error('Error verifying stateless OTP challenge token:', err);
    }
  }

  // 2. Fallback to in-memory record store
  const record = otpStore.get(phone);

  if (!record) {
    return {
      valid: false,
      error: 'NOT_FOUND',
      message: 'No active OTP request found. Please request a new code.',
    };
  }

  // Check expiration
  if (now > record.expiresAt) {
    otpStore.delete(phone);
    return {
      valid: false,
      error: 'EXPIRED',
      message: 'This OTP has expired. Please request a new OTP.',
    };
  }

  // Check attempt limit
  if (record.attempts >= MAX_VERIFY_ATTEMPTS) {
    otpStore.delete(phone);
    return {
      valid: false,
      error: 'MAX_ATTEMPTS_EXCEEDED',
      message: 'Too many OTP requests. Please wait before trying again.',
    };
  }

  // Verify hash with constant time check
  const computedHash = hashOtp(cleanInputOtp, record.salt);
  if (!safeCompare(computedHash, record.otpHash)) {
    record.attempts += 1;
    const remaining = MAX_VERIFY_ATTEMPTS - record.attempts;

    if (remaining <= 0) {
      otpStore.delete(phone);
      return {
        valid: false,
        error: 'MAX_ATTEMPTS_EXCEEDED',
        message: 'Invalid OTP. Maximum attempts reached, code invalidated.',
      };
    }

    return {
      valid: false,
      error: 'INCORRECT',
      message: 'Invalid OTP. Please check the code and try again.',
      remainingAttempts: remaining,
    };
  }

  // Verified successfully - invalidate immediately to prevent replay
  otpStore.delete(phone);

  return {
    valid: true,
    message: 'OTP verified successfully.',
  };
}
