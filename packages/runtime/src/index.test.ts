import { describe, it, expect } from 'vitest';

const mockEnv = {
  SITES: {} as R2Bucket,
  CACHE: {} as KVNamespace,
  ENVIRONMENT: 'test',
};

describe('Runtime Worker', () => {
  it('should return health check successfully', async () => {
    const { default: worker } = await import('./index');

    const request = new Request('http://localhost/health');
    const response = await worker.fetch(request, mockEnv);

    expect(response.status).toBe(200);

    const data = await response.json();
    expect(data).toHaveProperty('status', 'ok');
    expect(data).toHaveProperty('service', 'runtime');
    expect(data).toHaveProperty('environment', 'test');
    expect(data).toHaveProperty('version');
  });

  it('should return placeholder for site routes', async () => {
    const { default: worker } = await import('./index');

    const request = new Request('http://localhost/some-site');
    const response = await worker.fetch(request, mockEnv);

    expect(response.status).toBe(200);
    const text = await response.text();
    expect(text).toContain('runtime');
  });
});
