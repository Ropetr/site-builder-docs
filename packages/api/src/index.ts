/**
 * Site Builder SaaS - API Worker
 * Main entry point with Hono router
 */

import { Hono } from 'hono';
import { cors } from 'hono/cors';
import auth from './routes/auth';
import tenants from './routes/tenants';
import sites from './routes/sites';
import templates from './routes/templates';
import blocks from './routes/blocks';
import pages from './routes/pages';
import publish from './routes/publish';
import domains from './routes/domains';
import seo from './routes/seo';
import billing from './routes/billing';

export interface Env {
  DB: D1Database;
  CACHE: KVNamespace;
  CONFIG: KVNamespace;
  UPLOADS: R2Bucket;
  PUBLISH_QUEUE: Queue;
  ENVIRONMENT: string;
}

const app = new Hono<{ Bindings: Env }>();

// CORS
app.use('/*', cors());

// Health check
app.get('/health', (c) => {
  return c.json({
    status: 'ok',
    environment: c.env.ENVIRONMENT || 'unknown',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// Routes
app.route('/auth', auth);
app.route('/tenants', tenants);
app.route('/sites', sites);
app.route('/templates', templates);
app.route('/blocks', blocks);
app.route('/pages', pages);
app.route('/publish', publish);
app.route('/domains', domains);
app.route('/seo', seo);
app.route('/billing', billing);

// 404
app.notFound((c) => {
  return c.json({ error: 'Not found' }, 404);
});

// Error handler
app.onError((err, c) => {
  console.error('API Error:', err);
  return c.json({
    error: 'Internal server error',
    message: err.message,
  }, 500);
});

export default app;
