import crypto from 'crypto';
import { NextRequest } from 'next/server';

export const ADMIN_COOKIE_NAME = 'kg_admin_session';
const SESSION_EXPIRY_MS = 12 * 60 * 60 * 1000; // 12 hours

// Maximum 5 failed attempts per 15 minutes per IP/Identifier
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;
const MAX_FAILED_ATTEMPTS = 5;

interface RateLimitRecord {
  count: number;
  resetAt: number;
}

const rateLimitMap = new Map<string, RateLimitRecord>();

function cleanExpiredRateLimits() {
  const now = Date.now();
  for (const [key, record] of rateLimitMap.entries()) {
    if (now > record.resetAt) {
      rateLimitMap.delete(key);
    }
  }
}

export function checkRateLimit(key: string): { allowed: boolean; retryAfterSeconds: number } {
  cleanExpiredRateLimits();
  const record = rateLimitMap.get(key);
  const now = Date.now();

  if (!record) {
    return { allowed: true, retryAfterSeconds: 0 };
  }

  if (now > record.resetAt) {
    rateLimitMap.delete(key);
    return { allowed: true, retryAfterSeconds: 0 };
  }

  if (record.count >= MAX_FAILED_ATTEMPTS) {
    const retryAfterSeconds = Math.ceil((record.resetAt - now) / 1000);
    return { allowed: false, retryAfterSeconds };
  }

  return { allowed: true, retryAfterSeconds: 0 };
}

export function recordFailedAttempt(key: string) {
  cleanExpiredRateLimits();
  const now = Date.now();
  const existing = rateLimitMap.get(key);

  if (!existing || now > existing.resetAt) {
    rateLimitMap.set(key, {
      count: 1,
      resetAt: now + RATE_LIMIT_WINDOW_MS,
    });
  } else {
    existing.count += 1;
  }
}

export function resetFailedAttempts(key: string) {
  rateLimitMap.delete(key);
}

function getSecretKey(): string {
  return (
    process.env.ADMIN_SESSION_SECRET ||
    process.env.SESSION_SECRET ||
    'khushi_luxury_skincare_admin_secret_key_2026'
  );
}

export function getExpectedAdminCredentials(): { username: string; passwordHashOrPlain: string } {
  const username = process.env.ADMIN_USERNAME || 'khushi_admin';
  const password = process.env.ADMIN_PASSWORD || 'CHANGE_THIS_SECURE_PASSWORD';
  return { username, passwordHashOrPlain: password };
}

/**
 * Constant-time string comparison to prevent timing attacks
 */
function safeStringCompare(a: string, b: string): boolean {
  try {
    const bufA = Buffer.from(a, 'utf-8');
    const bufB = Buffer.from(b, 'utf-8');
    if (bufA.length !== bufB.length) {
      // Execute dummy comparison to maintain constant time profile
      crypto.timingSafeEqual(bufA, bufA);
      return false;
    }
    return crypto.timingSafeEqual(bufA, bufB);
  } catch {
    return false;
  }
}

export function validateAdminCredentials(
  usernameInput: string,
  passwordInput: string
): { success: boolean; error?: string } {
  const { username, passwordHashOrPlain } = getExpectedAdminCredentials();

  const isUsernameValid = safeStringCompare(usernameInput.trim(), username.trim());
  const isPasswordValid = safeStringCompare(passwordInput, passwordHashOrPlain);

  if (isUsernameValid && isPasswordValid) {
    return { success: true };
  }

  return { success: false, error: 'Invalid admin username or password' };
}

export interface AdminSessionPayload {
  username: string;
  role: 'admin';
  exp: number;
}

export function createAdminToken(username: string): string {
  const exp = Date.now() + SESSION_EXPIRY_MS;
  const payload: AdminSessionPayload = {
    username,
    role: 'admin',
    exp,
  };

  const payloadB64 = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto
    .createHmac('sha256', getSecretKey())
    .update(payloadB64)
    .digest('base64url');

  return `${payloadB64}.${signature}`;
}

export function verifyAdminToken(token?: string | null): {
  valid: boolean;
  username?: string;
  error?: string;
} {
  if (!token) {
    return { valid: false, error: 'No token provided' };
  }

  try {
    const parts = token.split('.');
    if (parts.length !== 2) {
      return { valid: false, error: 'Malformed token' };
    }

    const [payloadB64, signature] = parts;
    const expectedSignature = crypto
      .createHmac('sha256', getSecretKey())
      .update(payloadB64)
      .digest('base64url');

    const bufSig = Buffer.from(signature);
    const bufExpected = Buffer.from(expectedSignature);

    if (bufSig.length !== bufExpected.length || !crypto.timingSafeEqual(bufSig, bufExpected)) {
      return { valid: false, error: 'Invalid token signature' };
    }

    const payload: AdminSessionPayload = JSON.parse(
      Buffer.from(payloadB64, 'base64url').toString('utf-8')
    );

    if (payload.role !== 'admin') {
      return { valid: false, error: 'Invalid token role' };
    }

    if (Date.now() > payload.exp) {
      return { valid: false, error: 'Session token has expired' };
    }

    return { valid: true, username: payload.username };
  } catch {
    return { valid: false, error: 'Failed to verify token' };
  }
}

/**
 * Extracts and verifies admin session token from incoming NextRequest or Request
 */
export function getAdminFromRequest(req: NextRequest | Request): {
  valid: boolean;
  username?: string;
  error?: string;
} {
  let token: string | null = null;

  // 1. Check cookies
  if ('cookies' in req && typeof req.cookies?.get === 'function') {
    const cookie = req.cookies.get(ADMIN_COOKIE_NAME);
    if (cookie?.value) {
      token = cookie.value;
    }
  }

  // 2. Check Cookie header fallback
  if (!token) {
    const cookieHeader = req.headers.get('cookie');
    if (cookieHeader) {
      const match = cookieHeader
        .split(';')
        .map((c) => c.trim())
        .find((c) => c.startsWith(`${ADMIN_COOKIE_NAME}=`));
      if (match) {
        token = match.substring(ADMIN_COOKIE_NAME.length + 1);
      }
    }
  }

  // 3. Check Authorization header fallback
  if (!token) {
    const authHeader = req.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7).trim();
    }
  }

  return verifyAdminToken(token);
}
