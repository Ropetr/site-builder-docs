/**
 * JWT Authentication utilities
 */

export interface JWTPayload {
  userId: string;
  tenantId: string;
  role: string;
  exp: number;
}

const SECRET = 'REPLACE_WITH_ENV_JWT_SECRET'; // Will be from env in production

export async function generateToken(payload: Omit<JWTPayload, 'exp'>): Promise<string> {
  const exp = Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60; // 7 days
  const fullPayload = { ...payload, exp };

  // Simple JWT for MVP - in production use proper JWT library
  const header = { alg: 'HS256', typ: 'JWT' };
  const encodedHeader = btoa(JSON.stringify(header));
  const encodedPayload = btoa(JSON.stringify(fullPayload));
  const signature = await signHS256(`${encodedHeader}.${encodedPayload}`, SECRET);

  return `${encodedHeader}.${encodedPayload}.${signature}`;
}

export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const [encodedHeader, encodedPayload, signature] = token.split('.');

    // Verify signature
    const expectedSignature = await signHS256(`${encodedHeader}.${encodedPayload}`, SECRET);
    if (signature !== expectedSignature) {
      return null;
    }

    const payload = JSON.parse(atob(encodedPayload)) as JWTPayload;

    // Check expiration
    if (payload.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

async function signHS256(data: string, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(data));
  return btoa(String.fromCharCode(...new Uint8Array(signature)));
}

export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return btoa(String.fromCharCode(...new Uint8Array(hash)));
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const computed = await hashPassword(password);
  return computed === hash;
}
