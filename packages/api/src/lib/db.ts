/**
 * Database utilities for D1
 */

import type { Env } from '../index';

export async function query<T = unknown>(
  db: D1Database,
  sql: string,
  params: unknown[] = []
): Promise<T[]> {
  const result = await db.prepare(sql).bind(...params).all();
  return (result.results || []) as T[];
}

export async function queryOne<T = unknown>(
  db: D1Database,
  sql: string,
  params: unknown[] = []
): Promise<T | null> {
  const results = await query<T>(db, sql, params);
  return results[0] || null;
}

export async function execute(
  db: D1Database,
  sql: string,
  params: unknown[] = []
): Promise<D1Result> {
  return await db.prepare(sql).bind(...params).run();
}

// Tenant utilities
export async function getTenantById(db: D1Database, tenantId: string) {
  return queryOne(
    db,
    'SELECT * FROM tenants WHERE id = ? AND status = ?',
    [tenantId, 'active']
  );
}

// User utilities
export async function getUserById(db: D1Database, userId: string) {
  return queryOne(
    db,
    'SELECT * FROM users WHERE id = ? AND status = ?',
    [userId, 'active']
  );
}

export async function getUserByEmail(db: D1Database, email: string) {
  return queryOne(
    db,
    'SELECT * FROM users WHERE email = ? AND status = ?',
    [email, 'active']
  );
}

export async function getUserRole(db: D1Database, userId: string, tenantId: string) {
  const result = await queryOne<{ role: string }>(
    db,
    'SELECT role FROM tenant_users WHERE user_id = ? AND tenant_id = ?',
    [userId, tenantId]
  );
  return result?.role || null;
}

// Audit log
export async function createAuditLog(
  db: D1Database,
  data: {
    tenant_id: string;
    user_id?: string;
    action: string;
    resource_type: string;
    resource_id: string;
    metadata?: Record<string, unknown>;
    ip_address?: string;
    user_agent?: string;
  }
) {
  const id = crypto.randomUUID();
  const created_at = Math.floor(Date.now() / 1000);

  await execute(
    db,
    `INSERT INTO audit_logs (id, tenant_id, user_id, action, resource_type, resource_id, metadata, ip_address, user_agent, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      data.tenant_id,
      data.user_id || null,
      data.action,
      data.resource_type,
      data.resource_id,
      data.metadata ? JSON.stringify(data.metadata) : null,
      data.ip_address || null,
      data.user_agent || null,
      created_at,
    ]
  );

  return id;
}
