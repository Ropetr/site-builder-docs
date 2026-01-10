# Deployment Guide

## Prerequisites

1. **Cloudflare Account** (Workers Paid plan)
2. **Wrangler CLI** installed and authenticated
   ```bash
   npm install -g wrangler
   wrangler login
   ```
3. **GitHub Repository** with secrets configured

## First-Time Setup

### 1. Create Cloudflare Resources

Run the setup script to create D1, KV, R2, Queues:

```bash
pnpm run setup
```

This will create:
- D1 databases (staging + production)
- KV namespaces (cache + config)
- R2 buckets (uploads + sites)
- Queues (publish + dunning)

The script will output IDs that need to be updated in `wrangler.toml` files.

### 2. Update wrangler.toml Files

Replace placeholder IDs in:
- `packages/api/wrangler.toml`
- `packages/runtime/wrangler.toml`

### 3. Run Migrations

```bash
pnpm run migrate staging
pnpm run migrate production
```

### 4. Configure GitHub Secrets

In GitHub repository settings → Secrets and variables → Actions, add:

**Staging:**
- `CF_API_TOKEN` - Cloudflare API token
- `CF_ACCOUNT_ID` - Cloudflare account ID

**Production:**
- `CF_API_TOKEN_PROD` - Cloudflare API token (can be same as staging)
- `CF_ACCOUNT_ID` - Cloudflare account ID

## Manual Deployment

### Staging

```bash
# API
cd packages/api
pnpm run deploy:staging

# Runtime
cd packages/runtime
pnpm run deploy:staging
```

### Production

```bash
# API
cd packages/api
pnpm run deploy:production

# Runtime
cd packages/runtime
pnpm run deploy:production
```

## Automated Deployment (GitHub Actions)

- **Staging**: Auto-deploys on push to `main` branch
- **Production**: Manual trigger via GitHub Actions UI or on release

### Trigger Production Deploy

1. Go to Actions → `Deploy to Production`
2. Click "Run workflow"
3. Select branch: `main`
4. Confirm migration option if needed
5. Run workflow

## Health Checks

After deployment, verify health endpoints:

```bash
# Staging
curl https://site-builder-api-staging.YOUR_SUBDOMAIN.workers.dev/health
curl https://site-builder-runtime-staging.YOUR_SUBDOMAIN.workers.dev/health

# Production
curl https://site-builder-api.YOUR_SUBDOMAIN.workers.dev/health
curl https://site-builder-runtime.YOUR_SUBDOMAIN.workers.dev/health
```

Expected response:
```json
{
  "status": "ok",
  "environment": "staging|production",
  "version": "1.0.0",
  "timestamp": "2026-01-10T..."
}
```

## Troubleshooting

### wrangler command not found
```bash
npm install -g wrangler
```

### Authentication error
```bash
wrangler login
wrangler whoami  # verify
```

### D1 database not found
- Verify database ID in `wrangler.toml` matches output from setup script
- Check database exists: `wrangler d1 list`

### Worker deployment fails
- Check account limits (Workers Paid plan required)
- Verify bindings are correct in `wrangler.toml`
- Check CloudFlare dashboard for quota issues
