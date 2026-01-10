/**
 * Site Builder SaaS - Runtime Worker
 * Serves published sites
 */

export interface Env {
  SITES: R2Bucket;
  CACHE: KVNamespace;
  ENVIRONMENT: string;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    // Health check
    if (url.pathname === '/health') {
      return Response.json({
        status: 'ok',
        service: 'runtime',
        environment: env.ENVIRONMENT || 'unknown',
        version: '1.0.0',
        timestamp: new Date().toISOString(),
      });
    }

    // Site serving (to be implemented in M2)
    // Will resolve hostname -> site_id -> fetch from R2 -> serve with cache headers

    return new Response('Site runtime - Coming in M2', {
      headers: { 'Content-Type': 'text/plain' },
    });
  },
};
