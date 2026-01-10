import { describe, it, expect } from 'vitest';
import app from './index';

// Mock environment
const mockEnv = {
  DB: {
    prepare: () => ({
      bind: () => ({
        first: async () => null,
      }),
    }),
  } as any as D1Database,
  CACHE: {
    get: async () => null,
    put: async () => {},
  } as KVNamespace,
  SITES: {} as R2Bucket,
  ENVIRONMENT: 'test',
};

describe('Runtime Worker', () => {
  it('GET /health returns status ok', async () => {
    const res = await app.request('/health', {}, mockEnv);

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.status).toBe('ok');
    expect(data.service).toBe('runtime');
  });

  it('Returns 404 for unknown domain', async () => {
    const res = await app.request('/', {
      headers: {
        'Host': 'unknown-domain.com',
      },
    }, mockEnv);

    expect(res.status).toBe(404);
    const html = await res.text();
    expect(html).toContain('404');
  });
});
