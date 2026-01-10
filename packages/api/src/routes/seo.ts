/**
 * SEO and Tracking configuration
 */

import { Hono } from 'hono';
import type { Env } from '../index';
import { authMiddleware } from '../middleware/auth';
import { requirePermission } from '../middleware/rbac';
import { queryOne, execute } from '../lib/db';

const seo = new Hono<{ Bindings: Env }>();

seo.use('/*', authMiddleware);

// GET /seo/:site_id - Get SEO + tracking config
seo.get('/:site_id', requirePermission('site:read'), async (c) => {
  const user = c.get('user');
  const siteId = c.req.param('site_id');

  const config = await queryOne(
    c.env.DB,
    `SELECT tc.* FROM tracking_configs tc
     JOIN sites s ON tc.site_id = s.id
     WHERE tc.site_id = ? AND s.tenant_id = ?`,
    [siteId, user.tenantId]
  );

  return c.json(config || {});
});

// PATCH /seo/:site_id - Update SEO + tracking config
seo.patch('/:site_id', requirePermission('site:edit'), async (c) => {
  const user = c.get('user');
  const siteId = c.req.param('site_id');
  const body = await c.req.json();

  const site = await queryOne(
    c.env.DB,
    'SELECT * FROM sites WHERE id = ? AND tenant_id = ?',
    [siteId, user.tenantId]
  );

  if (!site) {
    return c.json({ error: 'Site not found' }, 404);
  }

  const { ga4_id, gtm_id, facebook_pixel_id, google_ads_id, consent_mode } = body;
  const now = Math.floor(Date.now() / 1000);

  // Upsert tracking config
  await execute(
    c.env.DB,
    `INSERT INTO tracking_configs (site_id, ga4_id, gtm_id, facebook_pixel_id, google_ads_id, consent_mode, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(site_id) DO UPDATE SET
       ga4_id = COALESCE(excluded.ga4_id, ga4_id),
       gtm_id = COALESCE(excluded.gtm_id, gtm_id),
       facebook_pixel_id = COALESCE(excluded.facebook_pixel_id, facebook_pixel_id),
       google_ads_id = COALESCE(excluded.google_ads_id, google_ads_id),
       consent_mode = COALESCE(excluded.consent_mode, consent_mode),
       updated_at = excluded.updated_at`,
    [siteId, ga4_id, gtm_id, facebook_pixel_id, google_ads_id, consent_mode || 'v2', now]
  );

  const updated = await queryOne(
    c.env.DB,
    'SELECT * FROM tracking_configs WHERE site_id = ?',
    [siteId]
  );

  return c.json(updated);
});

export default seo;
