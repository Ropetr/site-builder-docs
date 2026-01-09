-- ============================================
-- SITE BUILDER SaaS - D1 DATABASE SCHEMA
-- Complete schema for production MVP
-- ============================================

-- ============================================
-- MULTI-TENANT & RBAC
-- ============================================

CREATE TABLE IF NOT EXISTS tenants (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'active', -- active, suspended, canceled
  plan_id TEXT NOT NULL DEFAULT 'start',
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX idx_tenants_slug ON tenants(slug);
CREATE INDEX idx_tenants_status ON tenants(status);

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active', -- active, inactive, suspended
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX idx_users_email ON users(email);

CREATE TABLE IF NOT EXISTS tenant_users (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  role TEXT NOT NULL, -- owner, admin, editor, publisher, billing, viewer
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE(tenant_id, user_id)
);

CREATE INDEX idx_tenant_users_tenant ON tenant_users(tenant_id);
CREATE INDEX idx_tenant_users_user ON tenant_users(user_id);


-- ============================================
-- SITES & PAGES
-- ============================================

CREATE TABLE IF NOT EXISTS sites (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'draft', -- draft, staging, published
  theme_id TEXT,
  template_id TEXT,
  favicon_url TEXT,
  logo_url TEXT,
  primary_domain TEXT,
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch()),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
  UNIQUE(tenant_id, slug)
);

CREATE INDEX idx_sites_tenant ON sites(tenant_id);
CREATE INDEX idx_sites_status ON sites(status);

CREATE TABLE IF NOT EXISTS pages (
  id TEXT PRIMARY KEY,
  site_id TEXT NOT NULL,
  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  page_type TEXT NOT NULL DEFAULT 'page', -- page, post, service, case, product, landing
  content_json TEXT NOT NULL, -- Block structure JSON
  status TEXT NOT NULL DEFAULT 'draft', -- draft, published
  is_homepage INTEGER DEFAULT 0,
  parent_id TEXT,
  -- SEO fields
  meta_title TEXT,
  meta_description TEXT,
  canonical_url TEXT,
  noindex INTEGER DEFAULT 0,
  og_title TEXT,
  og_description TEXT,
  og_image_url TEXT,
  -- Mobile footer config
  mobile_footer_enabled INTEGER DEFAULT 1,
  mobile_footer_config TEXT, -- JSON with items and rules
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch()),
  published_at INTEGER,
  FOREIGN KEY (site_id) REFERENCES sites(id) ON DELETE CASCADE,
  FOREIGN KEY (parent_id) REFERENCES pages(id) ON DELETE SET NULL,
  UNIQUE(site_id, slug)
);

CREATE INDEX idx_pages_site ON pages(site_id);
CREATE INDEX idx_pages_slug ON pages(site_id, slug);
CREATE INDEX idx_pages_type ON pages(page_type);
CREATE INDEX idx_pages_published ON pages(site_id, status, published_at);


-- ============================================
-- THEMES & TEMPLATES
-- ============================================

CREATE TABLE IF NOT EXISTS themes (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  tokens_json TEXT NOT NULL, -- Theme tokens (colors, fonts, spacing, etc.)
  is_system INTEGER DEFAULT 0,
  tenant_id TEXT, -- NULL for system themes
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
);

CREATE INDEX idx_themes_system ON themes(is_system);

CREATE TABLE IF NOT EXISTS templates (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL, -- local_service, professional, health, restaurant, ecommerce
  thumbnail_url TEXT,
  structure_json TEXT NOT NULL, -- Complete site structure
  is_system INTEGER DEFAULT 1,
  tenant_id TEXT,
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE SET NULL
);

CREATE INDEX idx_templates_category ON templates(category);
CREATE INDEX idx_templates_system ON templates(is_system);

CREATE TABLE IF NOT EXISTS blocks (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL, -- hero, benefits, social_proof, faq, pricing, form, cta, comparison, portfolio
  component_type TEXT NOT NULL,
  config_json TEXT NOT NULL, -- Block default config
  thumbnail_url TEXT,
  is_system INTEGER DEFAULT 1,
  tenant_id TEXT,
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE SET NULL
);

CREATE INDEX idx_blocks_category ON blocks(category);


-- ============================================
-- VERSIONS & PUBLISH
-- ============================================

CREATE TABLE IF NOT EXISTS publish_versions (
  id TEXT PRIMARY KEY,
  site_id TEXT NOT NULL,
  version_number INTEGER NOT NULL,
  snapshot_json TEXT NOT NULL, -- Complete site snapshot
  environment TEXT NOT NULL, -- staging, production
  status TEXT NOT NULL DEFAULT 'pending', -- pending, building, deploying, purging_cache, done, failed
  build_id TEXT,
  deployed_url TEXT,
  published_by TEXT NOT NULL,
  error_message TEXT,
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  completed_at INTEGER,
  FOREIGN KEY (site_id) REFERENCES sites(id) ON DELETE CASCADE,
  FOREIGN KEY (published_by) REFERENCES users(id)
);

CREATE INDEX idx_versions_site ON publish_versions(site_id);
CREATE INDEX idx_versions_environment ON publish_versions(environment, status);


-- ============================================
-- DOMAINS
-- ============================================

CREATE TABLE IF NOT EXISTS domains (
  id TEXT PRIMARY KEY,
  site_id TEXT NOT NULL,
  domain TEXT NOT NULL UNIQUE,
  type TEXT NOT NULL DEFAULT 'custom', -- custom, subdomain
  status TEXT NOT NULL DEFAULT 'pending_validation', -- pending_validation, pending_ssl, active, failed
  cloudflare_hostname_id TEXT,
  verification_token TEXT,
  ssl_status TEXT,
  ssl_expires_at INTEGER,
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch()),
  activated_at INTEGER,
  FOREIGN KEY (site_id) REFERENCES sites(id) ON DELETE CASCADE
);

CREATE INDEX idx_domains_site ON domains(site_id);
CREATE INDEX idx_domains_status ON domains(status);


-- ============================================
-- SEO & REDIRECTS
-- ============================================

CREATE TABLE IF NOT EXISTS redirects (
  id TEXT PRIMARY KEY,
  site_id TEXT NOT NULL,
  source_path TEXT NOT NULL,
  destination_path TEXT NOT NULL,
  status_code INTEGER NOT NULL DEFAULT 301, -- 301, 302
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  FOREIGN KEY (site_id) REFERENCES sites(id) ON DELETE CASCADE,
  UNIQUE(site_id, source_path)
);

CREATE INDEX idx_redirects_site ON redirects(site_id);
CREATE INDEX idx_redirects_source ON redirects(site_id, source_path);


-- ============================================
-- TRACKING & CONSENT
-- ============================================

CREATE TABLE IF NOT EXISTS tracking_configs (
  id TEXT PRIMARY KEY,
  site_id TEXT NOT NULL UNIQUE,
  gtm_container_id TEXT,
  ga4_measurement_id TEXT,
  ads_conversion_id TEXT,
  facebook_pixel_id TEXT,
  tiktok_pixel_id TEXT,
  consent_mode_enabled INTEGER DEFAULT 1,
  consent_categories TEXT, -- JSON array of enabled categories
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch()),
  FOREIGN KEY (site_id) REFERENCES sites(id) ON DELETE CASCADE
);

CREATE INDEX idx_tracking_site ON tracking_configs(site_id);


-- ============================================
-- LEADS & CRM
-- ============================================

CREATE TABLE IF NOT EXISTS leads (
  id TEXT PRIMARY KEY,
  site_id TEXT NOT NULL,
  page_id TEXT,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  message TEXT,
  form_data TEXT, -- Additional form fields JSON
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  utm_term TEXT,
  utm_content TEXT,
  ip_address TEXT,
  user_agent TEXT,
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  FOREIGN KEY (site_id) REFERENCES sites(id) ON DELETE CASCADE,
  FOREIGN KEY (page_id) REFERENCES pages(id) ON DELETE SET NULL
);

CREATE INDEX idx_leads_site ON leads(site_id);
CREATE INDEX idx_leads_created ON leads(created_at);


-- ============================================
-- SHOP / E-COMMERCE
-- ============================================

CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  site_id TEXT NOT NULL,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  price REAL NOT NULL,
  compare_at_price REAL,
  sku TEXT,
  stock_quantity INTEGER DEFAULT 0,
  stock_tracking INTEGER DEFAULT 1,
  images_json TEXT, -- Array of image URLs
  category TEXT,
  status TEXT NOT NULL DEFAULT 'active', -- active, draft, archived
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch()),
  FOREIGN KEY (site_id) REFERENCES sites(id) ON DELETE CASCADE,
  UNIQUE(site_id, slug)
);

CREATE INDEX idx_products_site ON products(site_id);
CREATE INDEX idx_products_status ON products(status);

CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  site_id TEXT NOT NULL,
  order_number TEXT NOT NULL UNIQUE,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT,
  shipping_address TEXT, -- JSON
  billing_address TEXT, -- JSON
  items_json TEXT NOT NULL, -- Array of order items
  subtotal REAL NOT NULL,
  shipping_cost REAL DEFAULT 0,
  tax REAL DEFAULT 0,
  total REAL NOT NULL,
  currency TEXT DEFAULT 'BRL',
  payment_method TEXT, -- credit_card, pix, boleto
  payment_status TEXT NOT NULL DEFAULT 'pending', -- pending, paid, failed, refunded
  payment_provider_id TEXT,
  fulfillment_status TEXT NOT NULL DEFAULT 'unfulfilled', -- unfulfilled, fulfilled, canceled
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  notes TEXT,
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch()),
  paid_at INTEGER,
  FOREIGN KEY (site_id) REFERENCES sites(id) ON DELETE CASCADE
);

CREATE INDEX idx_orders_site ON orders(site_id);
CREATE INDEX idx_orders_status ON orders(payment_status);
CREATE INDEX idx_orders_created ON orders(created_at);


-- ============================================
-- BILLING & SUBSCRIPTIONS
-- ============================================

CREATE TABLE IF NOT EXISTS billing_accounts (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL UNIQUE,
  provider TEXT NOT NULL, -- stripe, paddle, custom
  customer_id TEXT, -- Provider's customer ID
  default_payment_method TEXT,
  status TEXT NOT NULL DEFAULT 'active', -- active, past_due, suspended, canceled
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch()),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
);

CREATE INDEX idx_billing_tenant ON billing_accounts(tenant_id);

CREATE TABLE IF NOT EXISTS subscriptions (
  id TEXT PRIMARY KEY,
  billing_account_id TEXT NOT NULL,
  plan_id TEXT NOT NULL,
  provider_subscription_id TEXT UNIQUE,
  status TEXT NOT NULL DEFAULT 'trialing', -- trialing, active, past_due, suspended, canceled
  current_period_start INTEGER NOT NULL,
  current_period_end INTEGER NOT NULL,
  cancel_at_period_end INTEGER DEFAULT 0,
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch()),
  canceled_at INTEGER,
  FOREIGN KEY (billing_account_id) REFERENCES billing_accounts(id) ON DELETE CASCADE
);

CREATE INDEX idx_subscriptions_account ON subscriptions(billing_account_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);

CREATE TABLE IF NOT EXISTS invoices (
  id TEXT PRIMARY KEY,
  subscription_id TEXT NOT NULL,
  provider_invoice_id TEXT UNIQUE,
  amount REAL NOT NULL,
  currency TEXT DEFAULT 'BRL',
  status TEXT NOT NULL DEFAULT 'draft', -- draft, open, paid, void, uncollectible
  due_at INTEGER NOT NULL,
  paid_at INTEGER,
  attempt_count INTEGER DEFAULT 0,
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch()),
  FOREIGN KEY (subscription_id) REFERENCES subscriptions(id) ON DELETE CASCADE
);

CREATE INDEX idx_invoices_subscription ON invoices(subscription_id);
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_invoices_due ON invoices(due_at);


-- ============================================
-- DUNNING (PAYMENT RECOVERY)
-- ============================================

CREATE TABLE IF NOT EXISTS access_policies (
  id TEXT PRIMARY KEY,
  plan_id TEXT NOT NULL UNIQUE,
  grace_days INTEGER NOT NULL DEFAULT 3,
  soft_lock_days INTEGER NOT NULL DEFAULT 5,
  hard_lock_days INTEGER NOT NULL DEFAULT 7,
  created_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE TABLE IF NOT EXISTS dunning_step_logs (
  id TEXT PRIMARY KEY,
  subscription_id TEXT NOT NULL,
  step_code TEXT NOT NULL, -- RENEW_D-3, RENEW_D-1, FAIL_IMMEDIATE, SOFT_D+3, HARD_D+7
  channel TEXT NOT NULL, -- whatsapp, email, in_app
  recipient TEXT NOT NULL, -- phone/email
  message_template TEXT NOT NULL,
  message_id TEXT, -- Evolution API message ID
  status TEXT NOT NULL DEFAULT 'sent', -- sent, delivered, failed, read
  provider_response TEXT, -- JSON
  sent_at INTEGER NOT NULL DEFAULT (unixepoch()),
  delivered_at INTEGER,
  FOREIGN KEY (subscription_id) REFERENCES subscriptions(id) ON DELETE CASCADE
);

CREATE INDEX idx_dunning_subscription ON dunning_step_logs(subscription_id);
CREATE INDEX idx_dunning_step ON dunning_step_logs(subscription_id, step_code);
CREATE INDEX idx_dunning_sent ON dunning_step_logs(sent_at);


-- ============================================
-- AUDIT LOG
-- ============================================

CREATE TABLE IF NOT EXISTS audit_logs (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  user_id TEXT,
  action TEXT NOT NULL, -- publish_production, connect_domain, change_plan, etc.
  resource_type TEXT NOT NULL, -- site, domain, subscription
  resource_id TEXT NOT NULL,
  metadata TEXT, -- JSON with additional context
  ip_address TEXT,
  user_agent TEXT,
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX idx_audit_tenant ON audit_logs(tenant_id);
CREATE INDEX idx_audit_user ON audit_logs(user_id);
CREATE INDEX idx_audit_resource ON audit_logs(resource_type, resource_id);
CREATE INDEX idx_audit_created ON audit_logs(created_at);


-- ============================================
-- PERFORMANCE BUDGETS
-- ============================================

CREATE TABLE IF NOT EXISTS performance_budgets (
  id TEXT PRIMARY KEY,
  site_id TEXT NOT NULL UNIQUE,
  plan_id TEXT NOT NULL,
  max_js_kb INTEGER NOT NULL, -- gzipped
  max_third_party_scripts INTEGER NOT NULL,
  max_font_families INTEGER NOT NULL,
  max_font_weights INTEGER NOT NULL,
  current_js_kb INTEGER DEFAULT 0,
  current_third_party_scripts INTEGER DEFAULT 0,
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch()),
  FOREIGN KEY (site_id) REFERENCES sites(id) ON DELETE CASCADE
);

CREATE INDEX idx_budgets_site ON performance_budgets(site_id);
