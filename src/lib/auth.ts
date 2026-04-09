import { SignJWT, jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'fera-web-default-secret-change-in-production'
);

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
    .sign(JWT_SECRET);
}

export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as JWTPayload;
  } catch {
    return null;
  }
}

export function hashPassword(password: string): string {
  // Simple hash for demo - use bcrypt in production
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return `$demo$${Math.abs(hash).toString(16)}$${Buffer.from(password).toString('base64')}`;
}

export function verifyPassword(password: string, hash: string): boolean {
  // For demo only - in production use bcrypt.compare
  return hashPassword(password) === hash;
}
