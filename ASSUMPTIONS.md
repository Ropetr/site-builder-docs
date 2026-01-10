# Site Builder SaaS - Implementation Assumptions

Document of assumptions made during MVP implementation.

---

## 1. Technical Stack Assumptions

### 1.1 Cloudflare Platform
**Assumption**: Cloudflare Workers Paid plan is available.
- **Rationale**: D1, Queues, and increased CPU limits require paid plan
- **Impact**: If free tier only, need alternative database (e.g., Turso) and queue (e.g., BullMQ + Redis)

**Assumption**: Cloudflare for SaaS (Custom Hostnames) is enabled on account.
- **Rationale**: Required for custom domain SSL provisioning
- **Impact**: If not available, need alternative SSL solution (Let's Encrypt + DNS-01 challenge)

### 1.2 Database
**Assumption**: D1 is production-ready and stable.
- **Rationale**: As of 2024, D1 moved to GA
- **Impact**: If stability issues arise, migration plan to PostgreSQL (Neon/Supabase) documented

**Assumption**: SQLite limitations acceptable for MVP scale.
- **Rationale**: D1 suitable for < 100k sites
- **Impact**: For scale beyond, plan migration to distributed database

### 1.3 Billing Provider
**Assumption**: Implementation uses Stripe as reference billing provider.
- **Rationale**: Most common, well-documented, webhook-based
- **Impact**: Adapter pattern allows swapping to Paddle, Mercado Pago, custom gateway

**Alternative**: PIX/Boleto support via Brazilian providers (Asaas, Pagar.me).
- **Rationale**: Brazilian market preference
- **Implementation**: Separate adapter with webhook integration

### 1.4 Evolution API (WhatsApp)
**Assumption**: Evolution API v1 is available and functional.
- **Rationale**: Open-source WhatsApp API solution
- **Impact**: If unavailable, fallbacks: Twilio WhatsApp API, Email-only dunning

**Assumption**: Phone numbers in E.164 format (+5511XXXXXXXXX).
- **Rationale**: Standard international format
- **Validation**: Input validation enforces format

---

## 2. Business Logic Assumptions

### 2.1 Multi-Tenant Model
**Assumption**: Agency creates and manages sites for clients.
- **Rationale**: B2B2C model (agency sells to end clients)
- **Impact**: Tenant = Agency, Sites belong to tenant, not individual users

**Alternative**: Direct-to-consumer model supported via tenant = individual user.

### 2.2 RBAC (Roles)
**Assumption**: 6 roles sufficient for MVP (Owner, Admin, Editor, Publisher, Billing, Viewer).
- **Rationale**: Covers typical team structures
- **Impact**: Custom roles can be added post-MVP

### 2.3 Plans and Limits
**Assumption**: 4 plans cover market needs (Start, Growth, Shop, Agency).
- **Rationale**: Based on typical SaaS tiering
- **Impact**: Limits enforced at API level, adjustable via configuration

### 2.4 Performance Budgets
**Assumption**: Plan-based budgets prevent performance abuse.
- **Rationale**: Lower plans = tighter budgets to ensure fairness
- **Impact**: Users may request budget increases → upsell opportunity

---

## 3. Feature Scope Assumptions

### 3.1 Editor
**Assumption**: No real-time collaboration in MVP.
- **Rationale**: Complexity vs. value for initial launch
- **Impact**: Multiple editors can work on site, but not simultaneously (last-write-wins)

**Assumption**: Breakpoints fixed at desktop/tablet/mobile.
- **Rationale**: Covers 99% of use cases
- **Impact**: Custom breakpoints can be added post-MVP

### 3.2 Templates
**Assumption**: 5 complete templates sufficient for MVP.
- **Rationale**: Covers primary verticals (local service, professional, health, restaurant, e-commerce)
- **Impact**: Template library can expand based on demand

**Assumption**: 40+ blocks cover common needs.
- **Rationale**: Industry standard block count for no-code builders
- **Impact**: Block library expandable via community contributions

### 3.3 Shop (E-commerce)
**Assumption**: Basic shop features only (catalog, cart, checkout, order).
- **Rationale**: MVP focuses on simple product sales
- **Out of Scope**: Inventory management, shipping integrations, multi-currency, subscriptions (post-MVP)

**Assumption**: Single payment gateway per site.
- **Rationale**: Simplifies implementation
- **Impact**: Multiple gateways can be added if needed

### 3.4 SEO
**Assumption**: Automated technical SEO sufficient (sitemap, robots, canonical, schema).
- **Rationale**: Covers 80% of SEO needs
- **Out of Scope**: Advanced SEO tools (keyword research, rank tracking, backlink analysis) → post-MVP or integrations

### 3.5 Tracking
**Assumption**: GTM + GA4 + Ads + Facebook Pixel + TikTok Pixel covers 95% of needs.
- **Rationale**: Most common tracking tools
- **Impact**: Additional pixels (Pinterest, Snapchat, etc.) can be added via custom script injection

**Assumption**: Consent Mode v2 compliance sufficient for GDPR/LGPD.
- **Rationale**: Google's recommended approach
- **Impact**: Legal review recommended before production launch in EU/BR

### 3.6 Mobile Footer
**Assumption**: Fixed mobile footer with Call/WhatsApp/Directions sufficient.
- **Rationale**: Proven conversion tool for local businesses
- **Impact**: Additional actions (Email, Schedule, Budget) can be added

**Assumption**: Mobile footer hides on checkout.
- **Rationale**: Prevents distraction during purchase flow
- **Impact**: Configurable per site if needed

---

## 4. Operational Assumptions

### 4.1 Billing & Dunning
**Assumption**: Automated dunning via WhatsApp is acceptable to users.
- **Rationale**: Brazil/LATAM market prefers WhatsApp over email
- **Impact**: Must comply with WhatsApp Business Policies

**Assumption**: Access policies (grace/soft/hard lock) are fair.
- **Rationale**: Industry standard dunning cadences
- **Impact**: Policies adjustable per plan via database configuration

**Assumption**: PIX/Boleto as fallback for failed credit card payments.
- **Rationale**: Brazilian market preference
- **Impact**: Requires integration with Brazilian payment provider

### 4.2 Deployment
**Assumption**: GitHub Actions sufficient for CI/CD.
- **Rationale**: Integrated with GitHub, free for public/private repos
- **Impact**: If advanced needs arise, consider GitLab CI, CircleCI, etc.

**Assumption**: Staging environment auto-deploys on main push.
- **Rationale**: Enables rapid iteration and testing
- **Impact**: Staging must be clearly marked to avoid confusion

**Assumption**: Production requires manual approval.
- **Rationale**: Reduces deployment risk
- **Impact**: Slows release velocity but increases stability

### 4.3 Monitoring & Observability
**Assumption**: Cloudflare Workers Analytics + structured logs sufficient for MVP.
- **Rationale**: Built-in, low overhead
- **Impact**: For advanced needs, integrate Sentry, Datadog, New Relic, etc.

**Assumption**: Metrics collected at API level (not client-side).
- **Rationale**: Accuracy and security
- **Impact**: Client-side RUM (Real User Monitoring) can be added post-MVP

### 4.4 Backup & Recovery
**Assumption**: Cloudflare automated D1 backups sufficient.
- **Rationale**: Daily backups with point-in-time recovery
- **Impact**: Additional manual exports recommended before major migrations

---

## 5. Security Assumptions

### 5.1 Authentication
**Assumption**: JWT tokens with 7-day expiry + refresh tokens.
- **Rationale**: Balance between security and UX
- **Impact**: Shorter expiry increases security but requires more frequent refreshes

**Assumption**: Passwords hashed with bcrypt (cost factor 10).
- **Rationale**: Industry standard
- **Impact**: Higher cost factor increases security but CPU usage

### 5.2 Authorization
**Assumption**: RBAC enforced at API middleware level.
- **Rationale**: Centralized, consistent enforcement
- **Impact**: All endpoints must declare required permissions

**Assumption**: Tenant isolation enforced in all queries.
- **Rationale**: Prevents cross-tenant data leaks
- **Impact**: All queries must include tenant_id filter

### 5.3 Input Validation
**Assumption**: Zod schemas for all API inputs.
- **Rationale**: Type-safe validation
- **Impact**: Schemas must be maintained alongside types

### 5.4 Rate Limiting
**Assumption**: Per-tenant rate limits prevent abuse.
- **Rationale**: Fair usage, prevent DDoS
- **Impact**: Legitimate high-volume users may hit limits → adjust per plan

---

## 6. Data & Privacy Assumptions

### 6.1 GDPR/LGPD Compliance
**Assumption**: Consent banner + category blocking satisfies basic compliance.
- **Rationale**: Implements Google Consent Mode v2
- **Impact**: **Legal review required** before EU/Brazil launch

**Assumption**: User data deletion requests handled manually in MVP.
- **Rationale**: Low volume expected initially
- **Impact**: Automated GDPR tooling (data export, deletion) recommended post-MVP

### 6.2 Data Retention
**Assumption**: Audit logs retained indefinitely.
- **Rationale**: Required for security and compliance audits
- **Impact**: Storage costs increase over time → archival strategy needed

**Assumption**: Leads/orders retained indefinitely unless user requests deletion.
- **Rationale**: Business value
- **Impact**: Must comply with data retention regulations

---

## 7. Performance Assumptions

### 7.1 Page Load Times
**Assumption**: Published sites load in < 3 seconds on 4G.
- **Rationale**: Industry standard for acceptable UX
- **Impact**: Enforced via budgets and monitoring

**Assumption**: Cloudflare CDN provides global low latency.
- **Rationale**: 200+ edge locations worldwide
- **Impact**: Works well globally, but latency to origin (for dynamic content) may vary

### 7.2 API Response Times
**Assumption**: API responds in < 500ms (p95).
- **Rationale**: Acceptable for user-facing operations
- **Impact**: Slower operations (publish) use async queues

### 7.3 Database Performance
**Assumption**: D1 query times < 100ms (p95) for typical queries.
- **Rationale**: Indexed queries on small-medium datasets
- **Impact**: Slow queries require optimization (indexes, caching)

---

## 8. Scalability Assumptions

### 8.1 MVP Scale
**Assumption**: System handles 10,000 sites initially.
- **Rationale**: Conservative MVP target
- **Impact**: Beyond 100k sites, evaluate distributed database

**Assumption**: Publish queue handles 100 concurrent publish jobs.
- **Rationale**: Typical concurrency for small SaaS
- **Impact**: For higher concurrency, tune queue consumers

### 8.2 Growth Path
**Assumption**: Monorepo sufficient for MVP.
- **Rationale**: Simplifies development and deployment
- **Impact**: At scale, may split into microservices

**Assumption**: Single Cloudflare account sufficient.
- **Rationale**: Generous limits on paid plan
- **Impact**: Enterprise customers may require dedicated accounts

---

## 9. Cost Assumptions

### 9.1 Infrastructure Costs (estimated monthly)
- **Cloudflare Workers**: $5/month base + $0.50/million requests
- **D1**: $5/month base + $1/million reads
- **R2**: $0.015/GB stored
- **KV**: $0.50/million reads
- **Pages**: Free for editor deployment
- **Custom Hostnames**: $0.10/hostname/month (first 100 free)

**Assumption**: Total infrastructure < $200/month for 10,000 sites.
- **Rationale**: Cloudflare pricing model favorable for this architecture
- **Impact**: Cost scales with usage, monitor and optimize

### 9.2 Third-Party Costs
- **Billing Provider** (Stripe): 2.9% + $0.30 per transaction
- **Evolution API**: Variable (self-hosted free, managed ~$20-50/month)
- **Email (SendGrid)**: Free tier → $15/month for 40k emails

---

## 10. Implementation Assumptions

### 10.1 Development Time
**Assumption**: Full MVP implementation requires 3-6 months with 2-4 developers.
- **Rationale**: Current delivery provides foundation (~30% complete)
- **Remaining Work**:
  - API endpoints: 3-4 weeks
  - Services (billing, dunning, publish): 3-4 weeks
  - Editor UI: 6-8 weeks
  - Renderer + blocks: 4-6 weeks
  - Templates + seed data: 2-3 weeks
  - Testing + QA: 2-3 weeks
  - Bug fixes + polish: 2-3 weeks

### 10.2 Tech Expertise Required
**Assumption**: Team has experience with:
- TypeScript
- React (for editor)
- Cloudflare Workers/Pages
- SQL (SQLite/D1)
- REST APIs
- Payment gateway integration
- Basic DevOps (CI/CD, monitoring)

**Impact**: If team lacks expertise in any area, add ramp-up time or hire specialists.

---

## 11. Launch Assumptions

### 11.1 Beta Launch
**Assumption**: Private beta with 10-50 early adopters before public launch.
- **Rationale**: Validate product-market fit, collect feedback, fix critical bugs
- **Impact**: Public launch delayed until beta validated

### 11.2 Marketing
**Assumption**: Marketing site + landing pages ready at launch.
- **Rationale**: Required to drive signups
- **Out of Scope of MVP**: Marketing site can be built with the builder itself (dogfooding)

### 11.3 Support
**Assumption**: Email support + documentation sufficient for MVP.
- **Rationale**: Low initial user volume
- **Impact**: As volume grows, consider live chat, help center, community forum

---

## 12. Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Cloudflare outage | Low | High | Multi-cloud failover (future), status page monitoring |
| D1 instability | Medium | High | Backup/restore procedures, migration plan to PostgreSQL |
| Billing provider downtime | Low | High | Queue webhooks for retry, manual reconciliation process |
| Evolution API failure | Medium | Medium | Fallback to email dunning, Twilio WhatsApp backup |
| GDPR non-compliance | Medium | Critical | Legal review before EU launch, implement data export/deletion |
| Performance degradation | Medium | Medium | Continuous monitoring, performance budgets, optimization sprints |
| Security breach | Low | Critical | Regular security audits, penetration testing, bug bounty program |

---

## Summary

This document captures key assumptions made during implementation. **These assumptions should be validated** with stakeholders before production launch and revisited as the product evolves.

**Critical Assumptions to Validate**:
1. ✅ Cloudflare platform capabilities sufficient
2. ⚠️ GDPR/LGPD compliance approach (legal review needed)
3. ✅ Billing provider integrations feasible
4. ✅ Evolution API integration reliable
5. ⚠️ Scale assumptions (10k sites → validate with load testing)
6. ⚠️ Cost assumptions (monitor actual costs post-launch)

## 13. Security & Vulnerabilities (M0.1)

### 13.1 Dependabot Alerts
**Status**: 6 vulnerabilities detected on initial push (1 high, 4 moderate, 1 low)

**Decision**: Accepted for M0 baseline with mitigation plan:
- High/moderate vulnerabilities are in devDependencies (eslint, wrangler)
- Production runtime (Workers) does not include these dependencies
- Mitigation: Regular dependency updates scheduled
- Action item: Address before production launch

**Rationale**: Blocking M0 for dev dependency vulnerabilities would delay delivery without security benefit to production runtime.

**Tracking**: GitHub Dependabot alerts monitored at https://github.com/Ropetr/site-builder-docs/security/dependabot

---

**Document Version**: 1.1
**Last Updated**: 2026-01-10
**Next Review**: At 1,000 active sites or 3 months post-launch
