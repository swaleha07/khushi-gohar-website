import crypto from 'crypto';

const SESSION_SECRET = process.env.SESSION_SECRET || 'khushi_luxury_skincare_auth_secret_key_2026';
const SESSION_EXPIRY_DAYS = 30;

export interface SessionPayload {
  userId: string;
  phone: string;
  exp: number;
}

export function createSessionToken(userId: string, phone: string): string {
  const exp = Date.now() + SESSION_EXPIRY_DAYS * 24 * 60 * 60 * 1000;
  const payload: SessionPayload = { userId, phone, exp };
  const payloadB64 = Buffer.from(JSON.stringify(payload)).toString('base64url');

  const signature = crypto
    .createHmac('sha256', SESSION_SECRET)
    .update(payloadB64)
    .digest('base64url');

  return `${payloadB64}.${signature}`;
}

export function verifySessionToken(token: string): SessionPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 2) return null;

    const [payloadB64, signature] = parts;
    const expectedSignature = crypto
      .createHmac('sha256', SESSION_SECRET)
      .update(payloadB64)
      .digest('base64url');

    if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) {
      return null;
    }

    const payload: SessionPayload = JSON.parse(Buffer.from(payloadB64, 'base64url').toString('utf-8'));
    if (Date.now() > payload.exp) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}
