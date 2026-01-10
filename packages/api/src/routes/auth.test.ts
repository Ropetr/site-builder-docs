import { describe, it, expect, beforeAll } from 'vitest';
import app from '../index';
import { hashPassword } from '../lib/auth';

// Mock env
const mockEnv = {
  DB: {
    prepare: () => ({
      bind: () => ({
        all: async () => ({ results: [] }),
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

describe('Auth Routes', () => {
  it('POST /auth/login requires email and password', async () => {
    const res = await app.request('/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    }, mockEnv);

    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBe('Email and password required');
  });

  it('GET /health works without auth', async () => {
    const res = await app.request('/health', {}, mockEnv);

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.status).toBe('ok');
  });
});
