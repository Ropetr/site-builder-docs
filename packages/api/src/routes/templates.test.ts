import { describe, it, expect } from 'vitest';
import app from '../index';
import { generateToken } from '../lib/auth';

// Mock env
const mockEnv = {
  DB: {
    prepare: () => ({
      bind: () => ({
        all: async () => ({
          results: [
            {
              id: 'template-001',
              name: 'Landing Page',
              category: 'saas',
              description: 'A landing page template',
              preview_url: null,
              metadata: JSON.stringify({ tags: ['landing'] }),
              created_at: 1234567890,
              updated_at: 1234567890,
            },
          ],
        }),
        first: async () => ({
          id: 'template-001',
          name: 'Landing Page',
          category: 'saas',
          description: 'A landing page template',
          structure: JSON.stringify({ pages: [] }),
          metadata: JSON.stringify({ tags: ['landing'] }),
          created_at: 1234567890,
          updated_at: 1234567890,
        }),
        run: async () => ({ success: true }),
      }),
    }),
  } as any as D1Database,
  CACHE: {} as KVNamespace,
  CONFIG: {} as KVNamespace,
  UPLOADS: {} as R2Bucket,
  PUBLISH_QUEUE: {} as Queue,
  ENVIRONMENT: 'test',
};

describe('Templates Routes', () => {
  it('GET /templates requires authentication', async () => {
    const res = await app.request('/templates', {
      method: 'GET',
    }, mockEnv);

    expect(res.status).toBe(401);
  });

  it('GET /templates returns templates list when authenticated', async () => {
    const token = await generateToken({
      userId: 'user-001',
      tenantId: 'tenant-001',
      role: 'admin',
    });

    const res = await app.request('/templates', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    }, mockEnv);

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toHaveProperty('templates');
    expect(Array.isArray(data.templates)).toBe(true);
  });

  it('GET /templates/:id returns template details', async () => {
    const token = await generateToken({
      userId: 'user-001',
      tenantId: 'tenant-001',
      role: 'admin',
    });

    const res = await app.request('/templates/template-001', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    }, mockEnv);

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.id).toBe('template-001');
    expect(data.structure).toBeDefined();
  });
});
