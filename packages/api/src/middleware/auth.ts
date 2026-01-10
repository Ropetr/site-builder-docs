/**
 * Authentication middleware
 */

import { Context, Next } from 'hono';
import { verifyToken, JWTPayload } from '../lib/auth';
import { getUserById, getTenantById } from '../lib/db';

export interface AuthContext {
  user: JWTPayload;
}

export async function authMiddleware(c: Context, next: Next) {
  const authHeader = c.req.header('Authorization');

  if (!authHeader?.startsWith('Bearer ')) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  const token = authHeader.substring(7);
  const payload = await verifyToken(token);

  if (!payload) {
    return c.json({ error: 'Invalid or expired token' }, 401);
  }

  // Verify user still exists and is active
  const user = await getUserById(c.env.DB, payload.userId);
  if (!user) {
    return c.json({ error: 'User not found or inactive' }, 401);
  }

  // Verify tenant still exists and is active
  const tenant = await getTenantById(c.env.DB, payload.tenantId);
  if (!tenant) {
    return c.json({ error: 'Tenant not found or inactive' }, 401);
  }

  // Attach to context
  c.set('user', payload);

  await next();
}
