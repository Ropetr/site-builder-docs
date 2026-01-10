/**
 * Pages routes - CRUD for site pages
 */

import { Hono } from 'hono';
import { nanoid } from 'nanoid';
import type { Env } from '../index';
import { authMiddleware } from '../middleware/auth';
import { requirePermission } from '../middleware/rbac';
import { query, queryOne, execute, createAuditLog } from '../lib/db';

const pages = new Hono<{ Bindings: Env }>();

pages.use('/*', authMiddleware);

// GET /pages?site_id=X - List pages for a site
pages.get('/', requirePermission('site:read'), async (c) => {
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
    'SELECT * FROM pages WHERE site_id = ? ORDER BY slug',
    [siteId]
  );

  return c.json({ pages: results });
});

// GET /pages/:id - Get page details
pages.get('/:id', requirePermission('site:read'), async (c) => {
  const user = c.get('user');
  const id = c.req.param('id');

  const page = await queryOne(
    c.env.DB,
    `SELECT p.* FROM pages p
     JOIN sites s ON p.site_id = s.id
     WHERE p.id = ? AND s.tenant_id = ?`,
    [id, user.tenantId]
  );

  if (!page) {
    return c.json({ error: 'Page not found' }, 404);
  }

  // Parse JSON content
  const parsed = {
    ...page,
    content: typeof page.content === 'string'
      ? JSON.parse(page.content as string)
      : page.content,
  };

  return c.json(parsed);
});

// POST /pages - Create page
pages.post('/', requirePermission('site:edit'), async (c) => {
  const user = c.get('user');
  const body = await c.req.json();

  const { site_id, slug, title, meta_description, content } = body;

  if (!site_id || !slug || !title) {
    return c.json({ error: 'site_id, slug, and title required' }, 400);
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
    `INSERT INTO pages (id, site_id, slug, title, meta_description, content, status, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [id, site_id, slug, title, meta_description || null, JSON.stringify(content || { blocks: [] }), 'draft', now, now]
  );

  const page = await queryOne(c.env.DB, 'SELECT * FROM pages WHERE id = ?', [id]);

  return c.json(page, 201);
});

// PATCH /pages/:id - Update page
pages.patch('/:id', requirePermission('site:edit'), async (c) => {
  const user = c.get('user');
  const id = c.req.param('id');
  const body = await c.req.json();

  // Verify page belongs to tenant's site
  const existing = await queryOne(
    c.env.DB,
    `SELECT p.* FROM pages p
     JOIN sites s ON p.site_id = s.id
     WHERE p.id = ? AND s.tenant_id = ?`,
    [id, user.tenantId]
  );

  if (!existing) {
    return c.json({ error: 'Page not found' }, 404);
  }

  const { title, meta_description, content } = body;
  const now = Math.floor(Date.now() / 1000);

  await execute(
    c.env.DB,
    `UPDATE pages
     SET title = COALESCE(?, title),
         meta_description = COALESCE(?, meta_description),
         content = COALESCE(?, content),
         updated_at = ?
     WHERE id = ?`,
    [
      title || null,
      meta_description || null,
      content ? JSON.stringify(content) : null,
      now,
      id
    ]
  );

  const updated = await queryOne(c.env.DB, 'SELECT * FROM pages WHERE id = ?', [id]);

  return c.json(updated);
});

// DELETE /pages/:id
pages.delete('/:id', requirePermission('site:delete'), async (c) => {
  const user = c.get('user');
  const id = c.req.param('id');

  const existing = await queryOne(
    c.env.DB,
    `SELECT p.* FROM pages p
     JOIN sites s ON p.site_id = s.id
     WHERE p.id = ? AND s.tenant_id = ?`,
    [id, user.tenantId]
  );

  if (!existing) {
    return c.json({ error: 'Page not found' }, 404);
  }

  await execute(c.env.DB, 'DELETE FROM pages WHERE id = ?', [id]);

  return c.json({ success: true });
});

export default pages;
