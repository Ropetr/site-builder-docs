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

### Status: ✅ In Progress

### What's Implemented
- [x] Monorepo structure with pnpm workspaces
- [x] packages/shared with types and constants
- [x] packages/api with /health endpoint
- [x] packages/runtime with /health endpoint
- [x] TypeScript configuration
- [x] Turbo build orchestration
- [ ] D1 migrations applied
- [ ] Deploy to staging
- [ ] Deploy to production
- [ ] CI/CD workflows validated

### How to Test Locally

```bash
# Clone repo
git clone https://github.com/Ropetr/site-builder-docs.git
cd site-builder-docs

# Install dependencies
pnpm install

# Type check
pnpm typecheck

# Test API locally (requires wrangler)
cd packages/api
npx wrangler dev
# Visit http://localhost:8787/health

# Test Runtime locally
cd packages/runtime
npx wrangler dev
# Visit http://localhost:8787/health
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
