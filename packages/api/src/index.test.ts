import { describe, it, expect } from 'vitest';

// Mock Cloudflare environment
const mockEnv = {
  DB: {} as D1Database,
  CACHE: {} as KVNamespace,
  CONFIG: {} as KVNamespace,
  UPLOADS: {} as R2Bucket,
  PUBLISH_QUEUE: {} as Queue,
  ENVIRONMENT: 'test',
};

describe('API Worker', () => {
  it('should return health check successfully', async () => {
    const { default: worker } = await import('./index');

    const request = new Request('http://localhost/health');
    const response = await worker.fetch(request, mockEnv);

    expect(response.status).toBe(200);

    const data = await response.json();
    expect(data).toHaveProperty('status', 'ok');
    expect(data).toHaveProperty('environment', 'test');
    expect(data).toHaveProperty('version');
    expect(data).toHaveProperty('timestamp');
  });

  it('should handle CORS preflight', async () => {
    const { default: worker } = await import('./index');

    const request = new Request('http://localhost/api/test', {
      method: 'OPTIONS',
    });
    const response = await worker.fetch(request, mockEnv);

    expect(response.status).toBe(200);
    expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*');
  });

  it('should return 404 for unknown routes', async () => {
    const { default: worker } = await import('./index');

    const request = new Request('http://localhost/unknown');
    const response = await worker.fetch(request, mockEnv);

    expect(response.status).toBe(404);
  });
});
