/**
 * Authentication routes
 */

import { Hono } from 'hono';
import type { Env } from '../index';
import { generateToken, hashPassword, verifyPassword } from '../lib/auth';
import { getUserByEmail, getUserRole, execute, query } from '../lib/db';

const auth = new Hono<{ Bindings: Env }>();

// POST /auth/login
auth.post('/login', async (c) => {
  const { email, password } = await c.req.json();

  if (!email || !password) {
    return c.json({ error: 'Email and password required' }, 400);
  }

  // Get user
  const user = await getUserByEmail(c.env.DB, email);
  if (!user) {
    return c.json({ error: 'Invalid credentials' }, 401);
  }

  // Verify password
  const valid = await verifyPassword(password, (user as any).password_hash);
  if (!valid) {
    return c.json({ error: 'Invalid credentials' }, 401);
  }

  // Get user's tenants
  const tenants = await query(
    c.env.DB,
    `SELECT t.id, t.name, t.slug, tu.role
     FROM tenants t
     JOIN tenant_users tu ON t.id = tu.tenant_id
     WHERE tu.user_id = ? AND t.status = ?
     ORDER BY t.created_at ASC`,
    [(user as any).id, 'active']
  );

  if (tenants.length === 0) {
    return c.json({ error: 'No active tenants found' }, 403);
  }

  // Use first tenant by default
  const firstTenant = tenants[0] as any;

  // Generate token
  const token = await generateToken({
    userId: (user as any).id,
    tenantId: firstTenant.id,
    role: firstTenant.role,
  });

  return c.json({
    token,
    user: {
      id: (user as any).id,
      email: (user as any).email,
      name: (user as any).name,
    },
    tenant: {
      id: firstTenant.id,
      name: firstTenant.name,
      slug: firstTenant.slug,
      role: firstTenant.role,
    },
    tenants: tenants.map((t: any) => ({
      id: t.id,
      name: t.name,
      slug: t.slug,
      role: t.role,
    })),
  });
});

// POST /auth/switch-tenant
auth.post('/switch-tenant', async (c) => {
  const authHeader = c.req.header('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  const { tenantId } = await c.req.json();
  if (!tenantId) {
    return c.json({ error: 'Tenant ID required' }, 400);
  }

  // Decode current token to get userId (simplified - in production use proper JWT lib)
  const token = authHeader.substring(7);
  const [, payload] = token.split('.');
  const decoded = JSON.parse(atob(payload));

  // Get role for this tenant
  const role = await getUserRole(c.env.DB, decoded.userId, tenantId);
  if (!role) {
    return c.json({ error: 'No access to this tenant' }, 403);
  }

  // Generate new token
  const newToken = await generateToken({
    userId: decoded.userId,
    tenantId,
    role,
  });

  return c.json({ token: newToken });
});

export default auth;
