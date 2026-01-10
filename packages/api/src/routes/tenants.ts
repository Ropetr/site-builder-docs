/**
 * Tenants routes
 */

import { Hono } from 'hono';
import { nanoid } from 'nanoid';
import type { Env } from '../index';
import { authMiddleware } from '../middleware/auth';
import { requirePermission } from '../middleware/rbac';
import { execute, query, queryOne } from '../lib/db';

const tenants = new Hono<{ Bindings: Env }>();

// All routes require auth
tenants.use('/*', authMiddleware);

// GET /tenants - List user's tenants
tenants.get('/', async (c) => {
  const user = c.get('user');

  const results = await query(
    c.env.DB,
    `SELECT t.*, tu.role
     FROM tenants t
     JOIN tenant_users tu ON t.id = tu.tenant_id
     WHERE tu.user_id = ?
     ORDER BY t.created_at DESC`,
    [user.userId]
  );

  return c.json({ tenants: results });
});

// GET /tenants/:id - Get tenant details
tenants.get('/:id', requirePermission('tenant:read'), async (c) => {
  const id = c.req.param('id');
  const user = c.get('user');

  // Verify user has access
  if (id !== user.tenantId) {
    return c.json({ error: 'Access denied' }, 403);
  }

  const tenant = await queryOne(
    c.env.DB,
    'SELECT * FROM tenants WHERE id = ?',
    [id]
  );

  if (!tenant) {
    return c.json({ error: 'Tenant not found' }, 404);
  }

  return c.json(tenant);
});

export default tenants;
