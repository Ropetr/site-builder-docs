/**
 * Sites routes
 */

import { Hono } from 'hono';
import { nanoid } from 'nanoid';
import type { Env } from '../index';
import { authMiddleware } from '../middleware/auth';
import { requirePermission } from '../middleware/rbac';
import { execute, query, queryOne, createAuditLog } from '../lib/db';

const sites = new Hono<{ Bindings: Env }>();

sites.use('/*', authMiddleware);

// GET /sites - List tenant's sites
sites.get('/', requirePermission('site:read'), async (c) => {
  const user = c.get('user');

  const results = await query(
    c.env.DB,
    `SELECT * FROM sites WHERE tenant_id = ? ORDER BY created_at DESC`,
    [user.tenantId]
  );

  return c.json({ sites: results });
});

// POST /sites - Create site
sites.post('/', requirePermission('site:create'), async (c) => {
  const user = c.get('user');
  const body = await c.req.json();

  const { name, template_id, theme_id } = body;

  if (!name) {
    return c.json({ error: 'Name required' }, 400);
  }

  const id = nanoid();
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const now = Math.floor(Date.now() / 1000);

  await execute(
    c.env.DB,
    `INSERT INTO sites (id, tenant_id, name, slug, template_id, theme_id, status, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [id, user.tenantId, name, slug, template_id || null, theme_id || null, 'draft', now, now]
  );

  // Audit log
  await createAuditLog(c.env.DB, {
    tenant_id: user.tenantId,
    user_id: user.userId,
    action: 'create_site',
    resource_type: 'site',
    resource_id: id,
    metadata: { name, template_id, theme_id },
  });

  const site = await queryOne(c.env.DB, 'SELECT * FROM sites WHERE id = ?', [id]);

  return c.json(site, 201);
});

// GET /sites/:id - Get site
sites.get('/:id', requirePermission('site:read'), async (c) => {
  const user = c.get('user');
  const id = c.req.param('id');

  const site = await queryOne(
    c.env.DB,
    'SELECT * FROM sites WHERE id = ? AND tenant_id = ?',
    [id, user.tenantId]
  );

  if (!site) {
    return c.json({ error: 'Site not found' }, 404);
  }

  return c.json(site);
});

// PATCH /sites/:id - Update site
sites.patch('/:id', requirePermission('site:edit'), async (c) => {
  const user = c.get('user');
  const id = c.req.param('id');
  const body = await c.req.json();

  // Verify ownership
  const existing = await queryOne(
    c.env.DB,
    'SELECT * FROM sites WHERE id = ? AND tenant_id = ?',
    [id, user.tenantId]
  );

  if (!existing) {
    return c.json({ error: 'Site not found' }, 404);
  }

  const { name, description } = body;
  const now = Math.floor(Date.now() / 1000);

  await execute(
    c.env.DB,
    `UPDATE sites SET name = COALESCE(?, name), description = COALESCE(?, description), updated_at = ? WHERE id = ?`,
    [name || null, description || null, now, id]
  );

  const updated = await queryOne(c.env.DB, 'SELECT * FROM sites WHERE id = ?', [id]);

  return c.json(updated);
});

// DELETE /sites/:id
sites.delete('/:id', requirePermission('site:delete'), async (c) => {
  const user = c.get('user');
  const id = c.req.param('id');

  const existing = await queryOne(
    c.env.DB,
    'SELECT * FROM sites WHERE id = ? AND tenant_id = ?',
    [id, user.tenantId]
  );

  if (!existing) {
    return c.json({ error: 'Site not found' }, 404);
  }

  await execute(c.env.DB, 'DELETE FROM sites WHERE id = ?', [id]);

  // Audit log
  await createAuditLog(c.env.DB, {
    tenant_id: user.tenantId,
    user_id: user.userId,
    action: 'delete_site',
    resource_type: 'site',
    resource_id: id,
  });

  return c.json({ success: true });
});

export default sites;
