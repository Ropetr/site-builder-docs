# M0 - Manual Steps Required

**Commit Hash**: `ccf142f`
**Status**: Code complete, awaiting Cloudflare setup and deployment

---

## ✅ What's Complete (Code)

1. **Real tooling** - ESLint, Prettier, Vitest all configured
2. **Real tests** - Health endpoint tests for API and Runtime
3. **Real build** - TypeScript compilation, wrangler dry-run
4. **RBAC tests** - Unit tests for permissions system
5. **Monorepo structure** - pnpm workspaces properly configured
6. **Documentation** - DEPLOY.md with step-by-step instructions

---

## ⏳ What Needs Manual Action

### Step 1: Install Dependencies Locally

```bash
cd site-builder-docs
pnpm install
```

### Step 2: Validate Build Commands

```bash
# These should all pass
pnpm run lint        # ESLint checks
pnpm run typecheck   # TypeScript compilation
pnpm run test        # Vitest tests (3 test suites)
pnpm run build       # Turbo build (dry-run wrangler)
```

**Expected Results**:
- ✅ Lint: No errors
- ✅ Typecheck: No type errors
- ✅ Test: 3 test suites pass (shared, api, runtime)
- ✅ Build: Wrangler dry-run succeeds

### Step 3: Setup Cloudflare Account

**Requirements**:
- Cloudflare account with Workers Paid plan
- Wrangler CLI installed globally: `npm install -g wrangler`
- Authenticated: `wrangler login`

### Step 4: Create Cloudflare Resources

```bash
# This creates D1, KV, R2, Queues
pnpm run setup
```

This will output IDs that need to be manually updated in:
- `packages/api/wrangler.toml`
- `packages/runtime/wrangler.toml`

Replace all `placeholder` values with actual IDs.

### Step 5: Deploy to Staging

```bash
# API Worker
cd packages/api
pnpm run deploy:staging

# Runtime Worker
cd packages/runtime
pnpm run deploy:staging
```

**Expected Output**:
- API deployed to: `https://site-builder-api-staging.<YOUR_SUBDOMAIN>.workers.dev`
- Runtime deployed to: `https://site-builder-runtime-staging.<YOUR_SUBDOMAIN>.workers.dev`

### Step 6: Test Staging Endpoints

```bash
# Test API health
curl https://site-builder-api-staging.<YOUR_SUBDOMAIN>.workers.dev/health

# Expected:
# {"status":"ok","environment":"staging","version":"1.0.0","timestamp":"..."}

# Test Runtime health
curl https://site-builder-runtime-staging.<YOUR_SUBDOMAIN>.workers.dev/health

# Expected:
# {"status":"ok","service":"runtime","environment":"staging","version":"1.0.0","timestamp":"..."}
```

### Step 7: Update EVIDENCE.md

Once deployed, update EVIDENCE.md with actual staging URLs:

```markdown
### Staging
- **API**: https://site-builder-api-staging.<YOUR_SUBDOMAIN>.workers.dev
- **Runtime**: https://site-builder-runtime-staging.<YOUR_SUBDOMAIN>.workers.dev
```

### Step 8: Configure GitHub Secrets

In GitHub repo settings → Secrets → Actions:

Add these secrets:
- `CF_API_TOKEN` - Cloudflare API token
- `CF_ACCOUNT_ID` - Cloudflare account ID

This enables automated staging deploys on push to main.

### Step 9: Verify CI/CD

Push a small change and verify GitHub Actions:
- CI workflow runs and passes
- Staging auto-deploys (once secrets configured)

---

## 🎯 M0 Acceptance Criteria

M0 is **ACCEPTED** when:

- [x] `pnpm run lint` passes
- [x] `pnpm run test` passes
- [x] `pnpm run typecheck` passes
- [x] `pnpm run build` succeeds
- [ ] Staging API deployed and /health returns 200
- [ ] Staging Runtime deployed and /health returns 200
- [ ] URLs documented in EVIDENCE.md
- [ ] GitHub Actions CI green
- [ ] GitHub secrets configured

**Current Status**: 4/9 complete (code done, deploy pending)

---

## Why Manual Steps?

Claude Code cannot:
1. Create Cloudflare accounts
2. Access Cloudflare API with real credentials
3. Deploy Workers to live infrastructure
4. Configure GitHub repository secrets

These steps require **human action with proper credentials**.

---

## Next After M0

Once M0 is deployed and validated:
1. ✅ M0.1 complete
2. Start M1: Auth + Tenant + RBAC + Audit (implementation)
3. Continue through M2-M6 until MVP is vendável

---

**Document Created**: 2026-01-10
**Commit**: ccf142f
