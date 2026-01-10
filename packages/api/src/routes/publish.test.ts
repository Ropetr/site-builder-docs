import { describe, it, expect } from 'vitest';
import app from '../index';
import { generateToken } from '../lib/auth';

// Mock env with queue
const mockEnv = {
  DB: {
    prepare: () => ({
      bind: () => ({
        all: async () => ({
          results: [
            {
              id: 'page-001',
              site_id: 'site-001',
              slug: 'index',
              title: 'Home',
              content: JSON.stringify({ blocks: [] }),
            },
          ],
        }),
        first: async () => ({
          id: 'site-001',
          tenant_id: 'tenant-001',
          name: 'Test Site',
          theme_id: 'theme-default',
        }),
        run: async () => ({ success: true }),
      }),
    }),
  } as any as D1Database,
  CACHE: {} as KVNamespace,
  CONFIG: {} as KVNamespace,
  UPLOADS: {} as R2Bucket,
  PUBLISH_QUEUE: {
    send: async () => {},
  } as Queue,
  ENVIRONMENT: 'test',
};

describe('Publish Routes', () => {
  it('POST /publish/:site_id queues publish job', async () => {
    const token = await generateToken({
      userId: 'user-001',
      tenantId: 'tenant-001',
      role: 'admin',
    });

    const res = await app.request('/publish/site-001', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    }, mockEnv);

    expect(res.status).toBe(202);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data).toHaveProperty('version');
  });

  it('GET /publish/:site_id/versions returns publish history', async () => {
    const token = await generateToken({
      userId: 'user-001',
      tenantId: 'tenant-001',
      role: 'admin',
    });

    const res = await app.request('/publish/site-001/versions', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    }, mockEnv);

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toHaveProperty('versions');
  });
});
