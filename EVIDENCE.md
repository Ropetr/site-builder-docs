# Site Builder SaaS - Evidence & Demo Guide

**Last Updated**: 2026-01-10
**Current Milestone**: M0

---

## Quick Links

### Staging
- **Editor**: TBD (M3)
- **API**: TBD (M0 deploy pending)
- **Runtime**: TBD (M0 deploy pending)

### Production
- **Editor**: TBD (M3)
- **API**: TBD (M0 deploy pending)
- **Runtime**: TBD (M0 deploy pending)

---

## M0: Repo Executável + Infra + Health Endpoints

### Status: ✅ M0.1 Code Complete (Deploy Pending)

### What's Implemented
- [x] Monorepo structure with pnpm workspaces
- [x] packages/shared with types, constants, and TESTS
- [x] packages/api with /health endpoint and TESTS
- [x] packages/runtime with /health endpoint and TESTS
- [x] TypeScript configuration with declaration generation
- [x] Turbo build orchestration
- [x] ESLint + Prettier + Vitest (real tooling)
- [x] Real build/test/lint scripts (no placeholders)
- [x] DEPLOY.md comprehensive guide
- [ ] Cloudflare resources created (requires manual setup)
- [ ] D1 migrations applied
- [ ] Deploy to staging
- [ ] Deploy to production
- [ ] CI/CD workflows validated with secrets

**See M0_MANUAL_STEPS.md for deployment instructions**

### How to Test Locally

```bash
# Clone repo
git clone https://github.com/Ropetr/site-builder-docs.git
cd site-builder-docs

# Install dependencies
pnpm install

# Run all checks
pnpm run lint        # ESLint on all packages
pnpm run typecheck   # TypeScript check
pnpm run test        # Vitest tests
pnpm run build       # Build all packages

# Test API locally (requires wrangler CLI)
cd packages/api
pnpm run dev
# Visit http://localhost:8787/health

# Test Runtime locally
cd packages/runtime
pnpm run dev
# Visit http://localhost:8787/health
```

### Deploy to Staging

```bash
# Requires Cloudflare account and wrangler CLI logged in

# API
cd packages/api
pnpm run deploy:staging

# Runtime
cd packages/runtime
pnpm run deploy:staging
```

### Expected /health Response

**API**:
```json
{
  "status": "ok",
  "environment": "staging",
  "version": "1.0.0",
  "timestamp": "2026-01-10T..."
}
```

**Runtime**:
```json
{
  "status": "ok",
  "service": "runtime",
  "environment": "staging",
  "version": "1.0.0",
  "timestamp": "2026-01-10T..."
}
```

---

## M1-M6: Coming Next

Will be documented as each milestone is completed.

---

## Validation Checklist

Based on VALIDATION_CHECKLIST.md:

### M0 Criteria
- [x] Repository cloneable
- [x] `pnpm install` succeeds
- [x] `pnpm typecheck` passes
- [x] `pnpm build` succeeds
- [ ] `pnpm test` has real tests (M1+)
- [ ] API /health returns 200
- [ ] Runtime /health returns 200
- [ ] Staging deployed and accessible
- [ ] Production deployed and accessible
- [ ] CI/CD green on latest commit

### Overall MVP Status
- M0: 60% complete (code done, deploy pending)
- M1: 0%
- M2: 0%
- M3: 0%
- M4: 0%
- M5: 0%
- M6: 0%

---

## GitHub Actions Status

**Latest Runs**: TBD after first push

**CI Workflow**: https://github.com/Ropetr/site-builder-docs/actions/workflows/ci.yml

**Deploy Staging**: https://github.com/Ropetr/site-builder-docs/actions/workflows/deploy-staging.yml

**Deploy Production**: https://github.com/Ropetr/site-builder-docs/actions/workflows/deploy-production.yml

---

## Demo Credentials (M3+)

TBD - Will be created during M1 (Auth implementation)

---

## Known Issues / TODOs

- [ ] Cloudflare resources need to be created (run scripts/setup.sh)
- [ ] GitHub secrets need configuration
- [ ] D1 database IDs need update in wrangler.toml files
- [ ] Deploy scripts need Cloudflare API tokens

---

## Next Steps

1. Complete M0: Deploy to staging/production
2. Start M1: Implement auth + tenant + RBAC
3. Continue through M2-M6
4. Update this document after each milestone
