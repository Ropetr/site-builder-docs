/**
 * Domains routes - Custom domain management
 */

import { Hono } from 'hono';
import { nanoid } from 'nanoid';
import type { Env } from '../index';
import { authMiddleware } from '../middleware/auth';
import { requirePermission } from '../middleware/rbac';
import { query, queryOne, execute, createAuditLog } from '../lib/db';

const domains = new Hono<{ Bindings: Env }>();

domains.use('/*', authMiddleware);

// GET /domains?site_id=X - List domains for site
domains.get('/', requirePermission('site:read'), async (c) => {
  const user = c.get('user');
  const siteId = c.req.query('site_id');

  if (!siteId) {
    return c.json({ error: 'site_id required' }, 400);
  }

  // Verify site belongs to tenant
  const site = await queryOne(
    c.env.DB,
    'SELECT * FROM sites WHERE id = ? AND tenant_id = ?',
    [siteId, user.tenantId]
  );

  if (!site) {
    return c.json({ error: 'Site not found' }, 404);
  }

  const results = await query(
    c.env.DB,
    'SELECT * FROM domains WHERE site_id = ? ORDER BY is_primary DESC, created_at',
    [siteId]
  );

  return c.json({ domains: results });
});

// POST /domains - Add custom domain
domains.post('/', requirePermission('domain:manage'), async (c) => {
  const user = c.get('user');
  const body = await c.req.json();

  const { site_id, domain, is_primary } = body;

  if (!site_id || !domain) {
    return c.json({ error: 'site_id and domain required' }, 400);
  }

  // Verify site belongs to tenant
  const site = await queryOne(
    c.env.DB,
    'SELECT * FROM sites WHERE id = ? AND tenant_id = ?',
    [site_id, user.tenantId]
  );

  if (!site) {
    return c.json({ error: 'Site not found' }, 404);
  }

  const id = nanoid();
  const now = Math.floor(Date.now() / 1000);

  await execute(
    c.env.DB,
    `INSERT INTO domains (id, site_id, domain, is_primary, status, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [id, site_id, domain, is_primary || false, 'pending_verification', now, now]
  );

  // Audit log
  await createAuditLog(c.env.DB, {
    tenant_id: user.tenantId,
    user_id: user.userId,
    action: 'add_domain',
    resource_type: 'domain',
    resource_id: id,
    metadata: { domain, site_id },
  });

  const newDomain = await queryOne(c.env.DB, 'SELECT * FROM domains WHERE id = ?', [id]);

  return c.json(newDomain, 201);
});

// DELETE /domains/:id
domains.delete('/:id', requirePermission('domain:manage'), async (c) => {
  const user = c.get('user');
  const id = c.req.param('id');

  const domain = await queryOne(
    c.env.DB,
    `SELECT d.* FROM domains d
     JOIN sites s ON d.site_id = s.id
     WHERE d.id = ? AND s.tenant_id = ?`,
    [id, user.tenantId]
  );

  if (!domain) {
    return c.json({ error: 'Domain not found' }, 404);
  }

  // Clear KV cache
  await c.env.CACHE.delete(`domain:${domain.domain}`);

  await execute(c.env.DB, 'DELETE FROM domains WHERE id = ?', [id]);

  // Audit log
  await createAuditLog(c.env.DB, {
    tenant_id: user.tenantId,
    user_id: user.userId,
    action: 'remove_domain',
    resource_type: 'domain',
    resource_id: id,
    metadata: { domain: domain.domain },
  });

  return c.json({ success: true });
});

export default domains;
