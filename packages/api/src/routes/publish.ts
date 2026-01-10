/**
 * Publish routes - Trigger site publication
 */

import { Hono } from 'hono';
import { nanoid } from 'nanoid';
import type { Env } from '../index';
import { authMiddleware } from '../middleware/auth';
import { requirePermission } from '../middleware/rbac';
import { query, queryOne, execute, createAuditLog } from '../lib/db';

const publish = new Hono<{ Bindings: Env }>();

publish.use('/*', authMiddleware);

// POST /publish/:site_id - Publish a site
publish.post('/:site_id', requirePermission('site:publish'), async (c) => {
  const user = c.get('user');
  const siteId = c.req.param('site_id');

  // Verify site belongs to tenant
  const site = await queryOne(
    c.env.DB,
    'SELECT * FROM sites WHERE id = ? AND tenant_id = ?',
    [siteId, user.tenantId]
  );

  if (!site) {
    return c.json({ error: 'Site not found' }, 404);
  }

  // Get all pages for the site
  const sitePages = await query(
    c.env.DB,
    'SELECT * FROM pages WHERE site_id = ?',
    [siteId]
  );

  if (sitePages.length === 0) {
    return c.json({ error: 'Site has no pages to publish' }, 400);
  }

  // Create publish version
  const versionId = nanoid();
  const now = Math.floor(Date.now() / 1000);

  await execute(
    c.env.DB,
    `INSERT INTO publish_versions (id, site_id, version, status, pages_snapshot, created_by, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      versionId,
      siteId,
      now, // Using timestamp as version number
      'pending',
      JSON.stringify(sitePages),
      user.userId,
      now
    ]
  );

  // Queue publish job
  await c.env.PUBLISH_QUEUE.send({
    type: 'publish_site',
    versionId,
    siteId,
    tenantId: user.tenantId,
    userId: user.userId,
  });

  // Audit log
  await createAuditLog(c.env.DB, {
    tenant_id: user.tenantId,
    user_id: user.userId,
    action: 'publish_site',
    resource_type: 'site',
    resource_id: siteId,
    metadata: { version_id: versionId },
  });

  const version = await queryOne(
    c.env.DB,
    'SELECT * FROM publish_versions WHERE id = ?',
    [versionId]
  );

  return c.json({
    success: true,
    version,
    message: 'Publish job queued. Site will be live in a few moments.',
  }, 202);
});

// GET /publish/:site_id/versions - List publish history
publish.get('/:site_id/versions', requirePermission('site:read'), async (c) => {
  const user = c.get('user');
  const siteId = c.req.param('site_id');

  // Verify site belongs to tenant
  const site = await queryOne(
    c.env.DB,
    'SELECT * FROM sites WHERE id = ? AND tenant_id = ?',
    [siteId, user.tenantId]
  );

  if (!site) {
    return c.json({ error: 'Site not found' }, 404);
  }

  const versions = await query(
    c.env.DB,
    `SELECT id, site_id, version, status, created_by, created_at, published_at
     FROM publish_versions
     WHERE site_id = ?
     ORDER BY created_at DESC
     LIMIT 50`,
    [siteId]
  );

  return c.json({ versions });
});

// POST /publish/:site_id/rollback/:version_id - Rollback to previous version
publish.post('/:site_id/rollback/:version_id', requirePermission('site:publish'), async (c) => {
  const user = c.get('user');
  const siteId = c.req.param('site_id');
  const versionId = c.req.param('version_id');

  // Verify site belongs to tenant
  const site = await queryOne(
    c.env.DB,
    'SELECT * FROM sites WHERE id = ? AND tenant_id = ?',
    [siteId, user.tenantId]
  );

  if (!site) {
    return c.json({ error: 'Site not found' }, 404);
  }

  // Get version
  const version = await queryOne(
    c.env.DB,
    'SELECT * FROM publish_versions WHERE id = ? AND site_id = ?',
    [versionId, siteId]
  );

  if (!version) {
    return c.json({ error: 'Version not found' }, 404);
  }

  if (version.status !== 'published') {
    return c.json({ error: 'Can only rollback to published versions' }, 400);
  }

  // Queue rollback job
  await c.env.PUBLISH_QUEUE.send({
    type: 'rollback_site',
    versionId,
    siteId,
    tenantId: user.tenantId,
    userId: user.userId,
  });

  // Audit log
  await createAuditLog(c.env.DB, {
    tenant_id: user.tenantId,
    user_id: user.userId,
    action: 'rollback_site',
    resource_type: 'site',
    resource_id: siteId,
    metadata: { version_id: versionId },
  });

  return c.json({
    success: true,
    message: 'Rollback job queued.',
  }, 202);
});

export default publish;
