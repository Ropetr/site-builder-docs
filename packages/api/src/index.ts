/**
 * Site Builder SaaS - API Worker
 * Main entry point
 */

export interface Env {
  DB: D1Database;
  CACHE: KVNamespace;
  CONFIG: KVNamespace;
  UPLOADS: R2Bucket;
  PUBLISH_QUEUE: Queue;
  ENVIRONMENT: string;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    // Health check
    if (url.pathname === '/health') {
      return Response.json({
        status: 'ok',
        environment: env.ENVIRONMENT || 'unknown',
        version: '1.0.0',
        timestamp: new Date().toISOString(),
      }, { headers: corsHeaders });
    }

    // API routes (to be implemented in M1)
    if (url.pathname.startsWith('/api/')) {
      return Response.json({
        error: 'API endpoints not yet implemented',
        message: 'Coming in M1',
      }, { status: 501, headers: corsHeaders });
    }

    return Response.json({
      error: 'Not found',
    }, { status: 404, headers: corsHeaders });
  },
};
