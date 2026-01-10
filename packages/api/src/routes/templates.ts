/**
 * Templates routes
 */

import { Hono } from 'hono';
import { nanoid } from 'nanoid';
import type { Env } from '../index';
import { authMiddleware } from '../middleware/auth';
import { requirePermission } from '../middleware/rbac';
import { query, queryOne, execute } from '../lib/db';

const templates = new Hono<{ Bindings: Env }>();

templates.use('/*', authMiddleware);

// GET /templates - List templates
templates.get('/', requirePermission('site:create'), async (c) => {
  const results = await query(
    c.env.DB,
    `SELECT id, name, category, description, preview_url, metadata, created_at, updated_at
     FROM templates
     ORDER BY created_at DESC`,
    []
  );

  return c.json({ templates: results });
});

// GET /templates/:id - Get template details
templates.get('/:id', requirePermission('site:create'), async (c) => {
  const id = c.req.param('id');

  const template = await queryOne(
    c.env.DB,
    `SELECT * FROM templates WHERE id = ?`,
    [id]
  );

  if (!template) {
    return c.json({ error: 'Template not found' }, 404);
  }

  // Parse JSON fields
  const parsed = {
    ...template,
    structure: typeof template.structure === 'string'
      ? JSON.parse(template.structure as string)
      : template.structure,
    metadata: typeof template.metadata === 'string'
      ? JSON.parse(template.metadata as string)
      : template.metadata,
  };

  return c.json(parsed);
});

export default templates;
