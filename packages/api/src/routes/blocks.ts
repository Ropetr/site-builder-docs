/**
 * Blocks routes
 */

import { Hono } from 'hono';
import type { Env } from '../index';
import { authMiddleware } from '../middleware/auth';
import { requirePermission } from '../middleware/rbac';
import { query, queryOne } from '../lib/db';

const blocks = new Hono<{ Bindings: Env }>();

blocks.use('/*', authMiddleware);

// GET /blocks - List blocks
blocks.get('/', requirePermission('site:edit'), async (c) => {
  const category = c.req.query('category');

  let sql = `SELECT id, type, category, name, description, preview_url, created_at, updated_at
             FROM blocks`;
  const params: unknown[] = [];

  if (category) {
    sql += ' WHERE category = ?';
    params.push(category);
  }

  sql += ' ORDER BY category, name';

  const results = await query(c.env.DB, sql, params);

  return c.json({ blocks: results });
});

// GET /blocks/:id - Get block details
blocks.get('/:id', requirePermission('site:edit'), async (c) => {
  const id = c.req.param('id');

  const block = await queryOne(
    c.env.DB,
    `SELECT * FROM blocks WHERE id = ?`,
    [id]
  );

  if (!block) {
    return c.json({ error: 'Block not found' }, 404);
  }

  // Parse JSON fields
  const parsed = {
    ...block,
    schema: typeof block.schema === 'string'
      ? JSON.parse(block.schema as string)
      : block.schema,
    default_props: typeof block.default_props === 'string'
      ? JSON.parse(block.default_props as string)
      : block.default_props,
    styles: block.styles && typeof block.styles === 'string'
      ? JSON.parse(block.styles as string)
      : block.styles,
  };

  return c.json(parsed);
});

export default blocks;
