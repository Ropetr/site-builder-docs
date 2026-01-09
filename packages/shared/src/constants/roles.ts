// RBAC Roles and Permissions
// Based on Appendix G

export const ROLES = {
  OWNER: 'owner',
  ADMIN: 'admin',
  EDITOR: 'editor',
  PUBLISHER: 'publisher',
  BILLING: 'billing',
  VIEWER: 'viewer',
} as const;

export type Role = typeof ROLES[keyof typeof ROLES];

// Permissions by role
export const ROLE_PERMISSIONS = {
  [ROLES.OWNER]: [
    'tenant:*',
    'user:*',
    'site:*',
    'page:*',
    'domain:*',
    'billing:*',
    'publish:*',
    'template:*',
  ],
  [ROLES.ADMIN]: [
    'site:*',
    'page:*',
    'domain:*',
    'publish:*',
    'user:read',
    'user:invite',
  ],
  [ROLES.EDITOR]: [
    'site:read',
    'page:create',
    'page:edit',
    'page:delete',
  ],
  [ROLES.PUBLISHER]: [
    'site:read',
    'page:read',
    'publish:staging',
    'publish:production',
  ],
  [ROLES.BILLING]: [
    'billing:*',
    'site:read',
  ],
  [ROLES.VIEWER]: [
    'site:read',
    'page:read',
  ],
} as const;

export function hasPermission(role: Role, permission: string): boolean {
  const permissions = ROLE_PERMISSIONS[role] || [];

  return permissions.some(p => {
    if (p.endsWith(':*')) {
      const resource = p.split(':')[0];
      return permission.startsWith(`${resource}:`);
    }
    return p === permission;
  });
}
