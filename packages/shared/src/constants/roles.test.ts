import { describe, it, expect } from 'vitest';
import { ROLES, hasPermission } from './roles';

describe('RBAC Roles', () => {
  it('should define all required roles', () => {
    expect(ROLES.OWNER).toBe('owner');
    expect(ROLES.ADMIN).toBe('admin');
    expect(ROLES.EDITOR).toBe('editor');
    expect(ROLES.PUBLISHER).toBe('publisher');
    expect(ROLES.BILLING).toBe('billing');
    expect(ROLES.VIEWER).toBe('viewer');
  });

  it('OWNER should have all permissions', () => {
    expect(hasPermission('owner', 'site:create')).toBe(true);
    expect(hasPermission('owner', 'billing:read')).toBe(true);
    expect(hasPermission('owner', 'tenant:delete')).toBe(true);
  });

  it('VIEWER should only have read permissions', () => {
    expect(hasPermission('viewer', 'site:read')).toBe(true);
    expect(hasPermission('viewer', 'site:create')).toBe(false);
    expect(hasPermission('viewer', 'page:edit')).toBe(false);
  });

  it('EDITOR should be able to edit pages', () => {
    expect(hasPermission('editor', 'page:edit')).toBe(true);
    expect(hasPermission('editor', 'page:create')).toBe(true);
    expect(hasPermission('editor', 'publish:production')).toBe(false);
  });
});
