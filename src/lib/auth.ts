import { SignJWT, jwtVerify } from 'jose';
import { scryptSync, randomBytes, timingSafeEqual } from 'crypto';

function getJwtSecret(): Uint8Array {
  const jwtSecretValue = process.env.JWT_SECRET;
  if (!jwtSecretValue && process.env.NODE_ENV === 'production') {
    throw new Error('JWT_SECRET environment variable is not set in production');
  }
  return new TextEncoder().encode(
    jwtSecretValue || 'fera-web-dev-only-secret-change-in-production'
  );
}

export interface JWTPayload {
  userId: string;
  shopId: string;
  email: string;
  plan: string;
}

export async function signToken(payload: JWTPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(getJwtSecret());
}

export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getJwtSecret());
    return payload as unknown as JWTPayload;
  } catch {
    return null;
  }
}

const SCRYPT_PARAMS = { N: 16384, r: 8, p: 1 };
const KEY_LEN = 64;

/**
 * Hash a password using scrypt (a memory-hard KDF).
 * Format: salt:hash (both hex-encoded)
 */
export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString('hex');
  const hash = scryptSync(password, salt, KEY_LEN, SCRYPT_PARAMS).toString('hex');
  return `${salt}:${hash}`;
}

/**
 * Verify a password against its stored hash using timing-safe comparison.
 */
export function verifyPassword(password: string, storedHash: string): boolean {
  const parts = storedHash.split(':');
  if (parts.length !== 2) return false;
  const [salt, expectedHex] = parts;
  try {
    const actual = scryptSync(password, salt, KEY_LEN, SCRYPT_PARAMS);
    const expected = Buffer.from(expectedHex, 'hex');
    if (actual.length !== expected.length) return false;
    return timingSafeEqual(actual, expected);
  } catch {
    return false;
  }
}
