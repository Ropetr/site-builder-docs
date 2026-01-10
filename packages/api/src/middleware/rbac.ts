/**
 * RBAC middleware - Role-based access control
 */

import { Context, Next } from 'hono';
import { hasPermission } from '@site-builder/shared';
import type { Role } from '@site-builder/shared';

export function requirePermission(permission: string) {
  return async (c: Context, next: Next) => {
    const user = c.get('user');

    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const role = user.role as Role;

    if (!hasPermission(role, permission)) {
      return c.json({
        error: 'Forbidden',
        message: `Role '${role}' does not have permission '${permission}'`
      }, 403);
    }

    await next();
  };
}

export function requireRole(...allowedRoles: Role[]) {
  return async (c: Context, next: Next) => {
    const user = c.get('user');

    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    if (!allowedRoles.includes(user.role as Role)) {
      return c.json({
        error: 'Forbidden',
        message: `Role '${user.role}' not allowed. Required: ${allowedRoles.join(', ')}`
      }, 403);
    }

    await next();
  };
}
