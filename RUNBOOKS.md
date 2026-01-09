# Site Builder SaaS - Operation Runbooks

Procedures for handling common operational scenarios.

---

## Table of Contents

1. [Publish Failed](#1-publish-failed)
2. [Domain Stuck in Pending](#2-domain-stuck-in-pending)
3. [Payment Failed / Dunning](#3-payment-failed--dunning)
4. [Performance Incident](#4-performance-incident)
5. [Database Migration Failure](#5-database-migration-failure)
6. [API Down / High Error Rate](#6-api-down--high-error-rate)
7. [Billing Webhook Not Received](#7-billing-webhook-not-received)
8. [Evolution API (WhatsApp) Failure](#8-evolution-api-whatsapp-failure)

---

## 1. Publish Failed

### Symptoms
- Publish version stuck in `building`, `deploying`, or `failed` status
- Site not accessible at deployed URL
- User reports publish took too long

### Investigation

1. **Check Publish Queue**
```bash
wrangler queues list
# Check backlog size
```

2. **Check Logs**
```bash
wrangler tail site-builder-api-production --format=pretty
# Filter by site_id or request_id
```

3. **Check Publish Version Table**
```sql
SELECT * FROM publish_versions
WHERE site_id = 'SITE_ID'
ORDER BY created_at DESC LIMIT 5;
```

Look for:
- `status = 'failed'` with `error_message`
- Long time between `created_at` and `completed_at`

### Resolution

**If Build Failed:**
1. Check `error_message` in publish_versions table
2. Common causes:
   - Invalid content_json (malformed blocks)
   - Missing assets in R2
   - Exceeded build timeout

**Action**: Fix data issue, requeue publish:
```bash
# Via API
POST /sites/{siteId}/publish
{ "environment": "production" }
```

**If Deployment Failed:**
1. Check Cloudflare Pages deployment status
2. Verify Pages project exists and is accessible
3. Check for quota limits

**Action**: Manually trigger redeploy or contact Cloudflare support.

**If Cache Purge Failed:**
1. Deployment succeeded but cache not purged
2. Old content still served

**Action**: Manual cache purge:
```bash
# Via Cloudflare API
curl -X POST "https://api.cloudflare.com/client/v4/zones/ZONE_ID/purge_cache" \
  -H "Authorization: Bearer YOUR_API_TOKEN" \
  -H "Content-Type: application/json" \
  --data '{"purge_everything":true}'
```

### Rollback

If new version is broken:

```bash
# Via API
POST /sites/{siteId}/rollback
{
  "version_number": PREVIOUS_VERSION,
  "environment": "production"
}
```

---

## 2. Domain Stuck in Pending

### Symptoms
- Domain status = `pending_validation` or `pending_ssl` for > 24 hours
- Site not accessible via custom domain

### Investigation

1. **Check Domain Status**
```sql
SELECT * FROM domains WHERE domain = 'example.com';
```

2. **Check DNS Records**
```bash
dig example.com CNAME
dig _acme-challenge.example.com TXT
```

Expected:
- CNAME → your-site.pages.dev (or fallback origin)
- TXT → verification_token (for validation)

3. **Check Cloudflare Custom Hostname Status**
```bash
# Via Cloudflare API
curl "https://api.cloudflare.com/client/v4/zones/ZONE_ID/custom_hostnames/HOSTNAME_ID" \
  -H "Authorization: Bearer YOUR_API_TOKEN"
```

### Resolution

**If DNS Not Configured:**
1. Contact client/user
2. Provide DNS instructions again
3. Wait for DNS propagation (up to 48h)

**If DNS Correct but Still Pending:**
1. DNS propagated but Cloudflare hasn't validated

**Action**: Retry validation via API:
```bash
# Re-trigger validation
PATCH /sites/{siteId}/domains/{domainId}
{ "action": "retry_validation" }
```

**If SSL Pending:**
1. Validation succeeded, waiting for SSL certificate

**Action**:
- Usually auto-resolves within 15 minutes
- If > 1 hour, check Cloudflare status page
- Contact Cloudflare support if stuck

**If Failed:**
1. Check `status = 'failed'` in domains table

**Action**: Delete and recreate hostname:
```bash
DELETE /sites/{siteId}/domains/{domainId}
POST /sites/{siteId}/domains
{ "domain": "example.com" }
```

---

## 3. Payment Failed / Dunning

### Symptoms
- Invoice status = `open` or `uncollectible`
- Subscription status = `past_due`
- User reports not receiving dunning messages

### Investigation

1. **Check Subscription Status**
```sql
SELECT s.*, ba.status as billing_status
FROM subscriptions s
JOIN billing_accounts ba ON s.billing_account_id = ba.id
WHERE s.id = 'SUBSCRIPTION_ID';
```

2. **Check Invoice**
```sql
SELECT * FROM invoices
WHERE subscription_id = 'SUBSCRIPTION_ID'
ORDER BY due_at DESC LIMIT 5;
```

3. **Check Dunning Logs**
```sql
SELECT * FROM dunning_step_logs
WHERE subscription_id = 'SUBSCRIPTION_ID'
ORDER BY sent_at DESC LIMIT 10;
```

Look for:
- Missing steps (should have FAIL_IMMEDIATE, D+1, D+3, etc.)
- Status = 'failed'

4. **Check Evolution API Logs**
```bash
# Check Evolution API health
curl https://your-evolution-instance.com/instance/connect/INSTANCE_ID \
  -H "apikey: YOUR_TOKEN"
```

### Resolution

**If Webhook Not Received:**
1. Check billing provider webhook logs
2. Verify webhook endpoint accessible: `https://your-api.com/webhooks/billing/stripe`
3. Check webhook secret configured correctly

**Action**: Manually trigger webhook processing (use provider dashboard to resend).

**If Dunning Not Sent:**
1. Check dunning queue backlog
2. Check Evolution API credentials valid

**Action**: Manually send dunning message:
```bash
POST /internal/dunning/send
{
  "subscription_id": "SUBSCRIPTION_ID",
  "step_code": "SOFT_D+3"
}
```

**If Access Policy Not Applied:**
1. Check tenant status

**Action**: Run access policy enforcement:
```bash
POST /internal/billing/enforce-policies
```

This will:
- Calculate days past due
- Apply soft lock if > grace_days
- Apply hard lock if > hard_lock_days

**If User Paid But Still Locked:**
1. Check invoice status = 'paid'
2. Check subscription status still 'past_due'

**Action**: Webhook may have been missed. Manually sync:
```bash
POST /internal/billing/sync-subscription
{ "subscription_id": "SUBSCRIPTION_ID" }
```

---

## 4. Performance Incident

### Symptoms
- PageSpeed score dropped significantly
- User reports slow site
- Core Web Vitals "Needs Improvement" or "Poor"

### Investigation

1. **Check Performance Budget**
```sql
SELECT * FROM performance_budgets WHERE site_id = 'SITE_ID';
```

2. **Run PageSpeed Test**
```bash
# Via PageSpeed Insights API or web UI
https://pagespeed.web.dev/report?url=https://example.com
```

3. **Check Recent Changes**
```sql
SELECT * FROM publish_versions
WHERE site_id = 'SITE_ID'
ORDER BY created_at DESC LIMIT 5;
```

4. **Identify Culprit**
- Large JS bundle (check `current_js_kb`)
- Too many third-party scripts
- Unoptimized images
- New block added with heavy dependencies

### Resolution

**If Budget Exceeded:**
1. Identify violating scripts/assets
2. Options:
   - Remove/disable heavy scripts
   - Upgrade plan (higher budget)
   - Optimize assets (defer/async, code splitting)

**Action**: Publish hotfix with culprit removed:
```bash
# Via editor: disable script, save, publish
# Or via API: update site config, publish
```

**If Images Not Optimized:**
1. Check R2 for unoptimized originals
2. Re-process images to generate WebP/AVIF variants

**Action**: Run image optimization job:
```bash
POST /internal/images/optimize-site
{ "site_id": "SITE_ID" }
```

**If CLS Issue (Mobile Footer):**
1. Mobile footer causing layout shift
2. Check footer implementation

**Action**: Verify footer has reserved height in CSS.

---

## 5. Database Migration Failure

### Symptoms
- Deploy failed during migration step
- Database in inconsistent state

### Investigation

1. **Check Migration Logs**
```bash
wrangler d1 migrations list DB_NAME --env=production
```

2. **Check Which Migration Failed**
Look at CI/CD logs for error message.

3. **Connect to D1**
```bash
wrangler d1 execute DB_NAME --command="SELECT name FROM sqlite_master WHERE type='table';"
```

### Resolution

**If Syntax Error:**
1. Fix migration SQL file
2. Test locally:
```bash
wrangler d1 execute DB_NAME --file=./infra/db/migrations/XXX.sql --local
```

3. Deploy fix

**If Partial Application:**
1. Migration partially applied (some tables created, some not)

**Action**: Write compensating migration to complete or rollback:
```sql
-- Check what exists
SELECT name FROM sqlite_master WHERE type='table';

-- Drop partial tables if needed
DROP TABLE IF EXISTS incomplete_table;

-- Or complete the migration
CREATE TABLE IF NOT EXISTS missing_table (...);
```

**If Need Rollback:**
1. Restore from backup:
```bash
wrangler d1 backup restore DB_NAME --backup-id=BACKUP_ID
```

2. Re-apply migrations up to last known good state.

---

## 6. API Down / High Error Rate

### Symptoms
- API returning 500 errors
- High response times
- Users unable to save/publish

### Investigation

1. **Check Worker Status**
```bash
wrangler tail site-builder-api-production --format=pretty
```

2. **Check Error Logs**
Look for patterns:
- Specific endpoint failing
- Database connection issues
- External API timeouts (billing, Evolution)

3. **Check Cloudflare Status**
https://www.cloudflarestatus.com/

4. **Check Quotas**
- D1 query limits
- Worker CPU time limits
- KV read/write limits

### Resolution

**If D1 Overloaded:**
1. Too many queries or slow queries

**Action**:
- Add indexes if missing
- Optimize queries
- Implement caching layer (KV)

**If External API Down:**
1. Billing provider or Evolution API unreachable

**Action**:
- Implement circuit breaker to fail fast
- Queue requests for retry later
- Return graceful error to user

**If Worker CPU Limit:**
1. Complex computation exceeding 50ms CPU time

**Action**:
- Move heavy processing to queue consumer
- Optimize algorithm
- Split into smaller chunks

**If Deploy Broken:**
1. New deploy introduced bug

**Action**: Rollback immediately:
```bash
# Deploy previous version
wrangler deploy --env=production packages/api/dist/previous-version
```

---

## 7. Billing Webhook Not Received

### Symptoms
- Payment succeeded in billing provider but invoice still `open` in database
- User paid but site still locked

### Investigation

1. **Check Billing Provider Logs**
- Verify webhook was sent
- Check HTTP response (should be 200)

2. **Check API Webhook Endpoint Logs**
```bash
wrangler tail --format=pretty | grep "webhooks/billing"
```

3. **Check Invoice Status**
```sql
SELECT * FROM invoices WHERE provider_invoice_id = 'INVOICE_ID';
```

### Resolution

**If Webhook Failed (4xx/5xx):**
1. Fix issue (auth, validation, etc.)
2. Resend webhook via provider dashboard

**If Webhook Never Sent:**
1. Verify webhook endpoint configured in provider
2. Verify endpoint URL correct: `https://your-api.com/webhooks/billing/stripe`

**Action**: Configure webhook in provider UI.

**If Webhook Received but Not Processed:**
1. Check for errors in processing logic

**Action**: Manually sync invoice:
```bash
POST /internal/billing/sync-invoice
{ "provider_invoice_id": "INVOICE_ID" }
```

---

## 8. Evolution API (WhatsApp) Failure

### Symptoms
- Dunning messages status = 'failed'
- WhatsApp messages not delivered
- Evolution API returning errors

### Investigation

1. **Check Evolution API Health**
```bash
curl https://your-evolution-instance.com/instance/connect/INSTANCE_ID \
  -H "apikey: YOUR_TOKEN"
```

2. **Check Instance Status**
- Verify instance connected
- Verify phone number linked

3. **Check Dunning Logs**
```sql
SELECT * FROM dunning_step_logs
WHERE status = 'failed'
ORDER BY sent_at DESC LIMIT 20;
```

Look at `provider_response` for error details.

4. **Common Errors**:
- Phone number invalid (not E.164 format)
- Instance disconnected
- Rate limit exceeded
- Message template rejected

### Resolution

**If Phone Number Invalid:**
1. Verify format: `+55119XXXXXXXX` (E.164)

**Action**: Fix phone number in user/tenant data.

**If Instance Disconnected:**
1. Reconnect instance via Evolution API dashboard
2. Scan QR code with WhatsApp

**If Rate Limited:**
1. Too many messages sent in short time

**Action**:
- Implement rate limiting in dunning service
- Spread messages over longer window
- Upgrade Evolution API plan

**If Message Template Issue:**
1. WhatsApp Business Policy violation

**Action**:
- Revise message template to comply with policies
- Use approved template variables only

**Manual Retry:**
```bash
# Retry failed dunning step
POST /internal/dunning/retry
{
  "dunning_step_log_id": "LOG_ID"
}
```

---

## Escalation

If issue cannot be resolved via runbooks:

1. **Check Status Pages**:
   - Cloudflare: https://www.cloudflarestatus.com/
   - Billing Provider: (varies)
   - Evolution API: (check provider status)

2. **Contact Support**:
   - Cloudflare: https://dash.cloudflare.com/support
   - Billing Provider: Support channel
   - Evolution API: Provider support

3. **Internal Escalation**:
   - Notify team lead
   - Create incident ticket
   - Document all investigation steps and findings

---

## Preventive Maintenance

Weekly:
- [ ] Review error logs for patterns
- [ ] Check queue backlogs
- [ ] Verify backup success
- [ ] Review performance metrics

Monthly:
- [ ] Review and update runbooks
- [ ] Conduct incident post-mortems
- [ ] Update monitoring alerts
- [ ] Review access policies and adjust if needed

Quarterly:
- [ ] Load testing
- [ ] Security audit
- [ ] Dependency updates
- [ ] Cost optimization review

---

**Document Version**: 1.0
**Last Updated**: 2026-01-09
