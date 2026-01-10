-- Seed data for demo/testing
-- Creates a demo tenant, user, and site

-- Demo tenant
INSERT INTO tenants (id, name, slug, status, plan_id, created_at, updated_at)
VALUES (
  'tenant-demo-001',
  'Demo Agency',
  'demo-agency',
  'active',
  'growth',
  unixepoch(),
  unixepoch()
);

-- Demo user (password: "demo123")
-- Hash is SHA-256 of "demo123"
INSERT INTO users (id, email, password_hash, name, status, created_at, updated_at)
VALUES (
  'user-demo-001',
  'demo@sitebuilder.com',
  'FuQJnXYNMl0BqNy8tZ5kJYcGcFhXKiLOc1KiEz9A4RM=',
  'Demo User',
  'active',
  unixepoch(),
  unixepoch()
);

-- Link user to tenant as owner
INSERT INTO tenant_users (id, tenant_id, user_id, role, created_at)
VALUES (
  'tu-demo-001',
  'tenant-demo-001',
  'user-demo-001',
  'owner',
  unixepoch()
);

-- Demo site
INSERT INTO sites (id, tenant_id, name, slug, description, status, created_at, updated_at)
VALUES (
  'site-demo-001',
  'tenant-demo-001',
  'Demo Site',
  'demo-site',
  'Demo site for testing',
  'draft',
  unixepoch(),
  unixepoch()
);
