# Site Builder SaaS - Validation Checklist

Complete objective validation checklist based on Section 8 of MASTER_SPEC.md.

## MVP Complete - All Items Must Pass

### ✅ 1. Performance

- [ ] **Budgets Implemented**: Performance budgets enforced per plan (Start: 250KB JS, Growth: 350KB, Shop: 350KB, Agency: 500KB)
- [ ] **No Grave Regression**: Sites built with templates respect budgets by default
- [ ] **Editor Warnings**: Budget alerts appear at 80% threshold
- [ ] **Editor Blocks**: Budget violations prevent publish (or warn clearly)
- [ ] **Image Optimization**: Automatic WebP/AVIF generation + variants (mobile/desktop)
- [ ] **Lazy Loading**: Images lazy-loaded by default except above-the-fold
- [ ] **Font Loading**: Font display: swap; preload critical fonts
- [ ] **Core Web Vitals**: Sample sites achieve "Good" rating (LCP < 2.5s, FID < 100ms, CLS < 0.1)

**Test**: Create site from Start plan template, measure PageSpeed, confirm all budgets green.

---

### ✅ 2. Consent & Compliance

- [ ] **Banner Implemented**: Consent banner appears on first visit
- [ ] **Category Selection**: Users can accept/reject by category (necessary, analytics, marketing, preferences)
- [ ] **Real Blocking**: Scripts tagged with categories only load after consent
- [ ] **Consent Mode v2**: GTM/gtag properly configured with consent signals
- [ ] **Persistence**: Consent choices persist across sessions (cookie/localStorage)
- [ ] **Revocation**: Users can change consent via settings link

**Test**: Load site, reject analytics, confirm GA4 does NOT fire. Accept analytics, confirm GA4 fires.

---

### ✅ 3. Tracking & Events

- [ ] **Canonical Events**: All events (page_view, click_cta, generate_lead, contact, click_call, click_whatsapp, click_directions, view_item, add_to_cart, begin_checkout, purchase) implemented
- [ ] **Anti-Duplication**: page_view fires once per navigation (SPA controlled)
- [ ] **Anti-Duplication**: generate_lead fires only after HTTP 2xx (not on submit)
- [ ] **Required Parameters**: All events include: event, page_path, device, timestamp_ms
- [ ] **UTM Capture**: UTM parameters captured and passed with leads/orders
- [ ] **Data Layer**: window.dataLayer properly structured and pushed
- [ ] **E-commerce Events**: view_item, add_to_cart, begin_checkout, purchase fire with currency, value, items[]

**Test**: Navigate site, submit form, verify only ONE page_view and ONE generate_lead event. Check dataLayer structure.

---

### ✅ 4. GA4 / Ads / Pixels

- [ ] **GA4 Integration**: Measurement ID configurable via wizard
- [ ] **GTM Integration**: Container ID configurable (optional)
- [ ] **Ads Integration**: Conversion ID configurable
- [ ] **Facebook Pixel**: Pixel ID configurable
- [ ] **TikTok Pixel**: Pixel ID configurable
- [ ] **Minimum Parameters**: All conversion events include required e-commerce parameters
- [ ] **Consent Blocking**: Pixels respect consent categories

**Test**: Configure GA4 + Ads, complete purchase, verify conversion appears in GA4 and Ads with correct value/items.

---

### ✅ 5. SEO Technical

- [ ] **Sitemap.xml**: Auto-generated, includes only indexable pages, updates on publish
- [ ] **robots.txt**: Properly configured (allow prod, block staging)
- [ ] **Canonical Tags**: Present on all pages, point to correct URLs
- [ ] **noindex**: Pages marked noindex excluded from sitemap
- [ ] **Redirects**: 301 auto-created when slug changes
- [ ] **No Chains**: Redirect chains avoided (A→B direct, not A→B→C)
- [ ] **Schema Markup**: Organization/LocalBusiness on site, Article on posts, Product on products, FAQPage when FAQ present
- [ ] **Open Graph**: og:title, og:description, og:image, og:url on all pages

**Test**: Publish site, fetch /sitemap.xml, verify all published pages present. Change slug, verify 301 created.

---

### ✅ 6. Operation & Multi-Tenant

- [ ] **Multi-Tenant**: Tenants isolated, queries include tenant_id filter
- [ ] **RBAC**: Roles enforced (Owner, Admin, Editor, Publisher, Billing, Viewer)
- [ ] **Permission Checks**: Editor cannot publish production without Publisher role
- [ ] **Audit Log**: Sensitive operations logged (publish_production, connect_domain, change_plan)
- [ ] **Audit Fields**: Logs include tenant_id, user_id, action, resource_type, resource_id, timestamp

**Test**: Create tenant, add Editor user, attempt to publish production → blocked. Add Publisher role → succeeds. Check audit_logs table.

---

### ✅ 7. Domains & SSL

- [ ] **Custom Domains**: API endpoint to add domain
- [ ] **SSL Provisioning**: Cloudflare for SaaS custom hostnames integration
- [ ] **Status States**: pending_validation → pending_ssl → active (or failed)
- [ ] **DNS Instructions**: System provides CNAME + TXT records for client
- [ ] **Validation**: System polls Cloudflare API to check validation/SSL status
- [ ] **Routing**: Domain routes to correct site after activation

**Test**: Add domain example.com, configure DNS, wait for activation, access https://example.com, verify correct site loads with valid SSL.

---

### ✅ 8. Templates & Blocks

- [ ] **5 Complete Templates**: Local Service, Professional, Health/Clinic, Restaurant/Delivery, E-commerce Starter
- [ ] **Page Templates**: Minimum page templates (Service Detail, About, Contact, Lead Capture, FAQ, Blog Post, Category, Product)
- [ ] **Block Library**: Minimum 40 blocks:
  - 10 heroes
  - 8 benefits
  - 8 social proof
  - 6 FAQ
  - 6 pricing
  - 6 forms
  - 6 CTAs
  - 4 comparisons
  - 4 portfolios
- [ ] **Template Structure**: Each template includes all required pages + sections + SEO + tracking config
- [ ] **Mobile Footer**: Configured per template with correct rules (e.g., OFF on e-commerce checkout)

**Test**: Create site from each of 5 templates, verify all pages present, mobile footer configured correctly.

---

### ✅ 9. Mobile Footer

- [ ] **Global Component**: Footer is site-level config, not a block
- [ ] **Mobile Only**: Appears only on mobile (optional tablet)
- [ ] **Items**: Configurable items (Call, WhatsApp, Directions, optional Budget/Schedule)
- [ ] **Rules**: Does NOT appear on checkout pages
- [ ] **Rules**: Whitelist/blacklist pages configurable
- [ ] **UX**: Respects safe-area on iOS
- [ ] **UX**: Hides when keyboard opens
- [ ] **No CLS**: Reserved height prevents layout shift
- [ ] **Events**: click_call, click_whatsapp, click_directions fire correctly (ONE time per click)

**Test**: Load site on mobile, verify footer present. Navigate to checkout, verify footer hidden. Click WhatsApp, verify event fires once.

---

### ✅ 10. Billing & Dunning

- [ ] **Recurring Billing**: Integration with payment gateway (Stripe/Paddle/custom)
- [ ] **Webhook Handling**: invoice.paid, invoice.payment_failed, subscription.canceled handled
- [ ] **Idempotent Webhooks**: Same webhook can be received multiple times without duplicate actions
- [ ] **State Machine**: Subscription states: trialing → active → past_due → suspended → canceled
- [ ] **Dunning Cadence**: Messages sent per policy (D-3, D-1, D0, failure, D+1, D+3, D+7)
- [ ] **No Duplicates**: Same step_code not sent twice within window (unless state changes)
- [ ] **Evolution API v1**: WhatsApp messages sent via Evolution API with correct E.164 phone format
- [ ] **Message Logs**: DunningStepLog table records all sends with status and message_id
- [ ] **Access Policies**: Grace/soft/hard locks applied per plan:
  - Start: grace 3, soft 5, hard 7
  - Growth: grace 5, soft 7, hard 10
  - Shop: grace 5, soft 7, hard 10
  - Agency: grace 7, soft 10, hard 14
- [ ] **Grace Period**: Site remains active during grace
- [ ] **Soft Lock**: Editor access limited (warning displayed)
- [ ] **Hard Lock**: Site suspended, shows payment required page

**Test**: Simulate payment failure webhook, verify dunning message sent, soft lock applied after grace period, hard lock applied after policy days.

---

### ✅ 11. Shop / E-commerce

- [ ] **Product Catalog**: Products with images, price, description, SKU, stock
- [ ] **Product Pages**: Individual product pages with variant support (if applicable)
- [ ] **Add to Cart**: Functional cart with quantity adjustment
- [ ] **Cart Persistence**: Cart persists across sessions (localStorage/cookie)
- [ ] **Checkout**: Form with shipping/billing address
- [ ] **Payment**: Integration with payment gateway
- [ ] **Order Confirmation**: Thank you page with order details
- [ ] **E-commerce Events**: view_item, add_to_cart, begin_checkout, purchase fire with correct parameters
- [ ] **Transaction ID**: Unique transaction_id in purchase event
- [ ] **Items Array**: Purchase event includes items[] with item_id, item_name, price, quantity

**Test**: Browse catalog, add product to cart, complete checkout, verify order created and purchase event fires with full data.

---

### ✅ 12. CI/CD & Deployment

- [ ] **ci.yml**: Runs on PR, executes lint + typecheck + test + build
- [ ] **deploy-staging.yml**: Auto-deploys to staging on push to main
- [ ] **deploy-production.yml**: Manual deploy with approval required
- [ ] **Migrations**: D1 migrations applied safely (staging auto, production with approval)
- [ ] **Smoke Tests**: Post-deploy health checks (/health endpoint returns 200)
- [ ] **Secrets**: All secrets configured in GitHub environments (staging, production)
- [ ] **Build ID**: Deploy registers build_id/version for audit

**Test**: Push to main, verify staging auto-deploys. Trigger production deploy, verify approval required, verify smoke tests pass.

---

### ✅ 13. Observability & Monitoring

- [ ] **Structured Logs**: All logs include request_id, tenant_id, user_id (when present)
- [ ] **Metrics**: Collect metrics for:
  - Publish success/failure rate
  - Publish duration (p50, p95, p99)
  - Domain provisioning errors
  - Billing webhook failures
  - Dunning send failures
  - API response times by endpoint
  - Error rates by endpoint
- [ ] **Error Tracking**: Errors logged with full stack trace and context
- [ ] **Alerting**: Alerts configured for critical failures (publish, billing, dunning)

**Test**: Trigger publish, check logs for request_id and tenant_id. Query metrics, verify publish duration recorded.

---

## Summary

**Total Checks**: 13 categories, ~100 individual criteria

**Passing Criteria**: ALL items must be checked for MVP to be considered production-ready.

**Current Status** (based on delivered implementation):
- [x] Architecture & Design: 100%
- [x] Database Schema: 100%
- [x] Types & Constants: 100%
- [ ] API Implementation: ~30% (structure ready, endpoints needed)
- [ ] Services Implementation: ~20% (billing, dunning, SEO, publish core logic needed)
- [ ] Editor UI: 0% (needs full React implementation)
- [ ] Renderer & Blocks: 0% (needs all 40+ block components)
- [ ] CI/CD: 80% (workflows ready, secrets needed)
- [ ] Deployment Scripts: 100%
- [x] Documentation: 100%

**Next Steps**: Complete API endpoints, implement services, build editor UI, create block library, seed templates, configure CI/CD secrets, deploy and test all flows.
