#!/bin/bash
# Site Builder SaaS - Infrastructure Setup Script
# Creates all required Cloudflare resources

set -e

echo "🚀 Site Builder SaaS - Infrastructure Setup"
echo "==========================================="
echo ""

# Check if wrangler is installed
if ! command -v wrangler &> /dev/null; then
    echo "❌ Error: wrangler CLI not found"
    echo "Install with: npm install -g wrangler"
    exit 1
fi

# Check if logged in
echo "Checking Cloudflare authentication..."
if ! wrangler whoami &> /dev/null; then
    echo "❌ Not logged in to Cloudflare"
    echo "Run: wrangler login"
    exit 1
fi

echo "✅ Authenticated"
echo ""

# Get account ID
echo "Enter your Cloudflare Account ID:"
read -r CF_ACCOUNT_ID

echo ""
echo "Setting up resources for account: $CF_ACCOUNT_ID"
echo ""

# Create D1 Databases
echo "📦 Creating D1 databases..."
echo "Creating staging database..."
STAGING_DB_ID=$(wrangler d1 create site-builder-staging --json | jq -r '.database_id')
echo "✅ Staging D1: $STAGING_DB_ID"

echo "Creating production database..."
PROD_DB_ID=$(wrangler d1 create site-builder-production --json | jq -r '.database_id')
echo "✅ Production D1: $PROD_DB_ID"
echo ""

# Create KV Namespaces
echo "🗄️  Creating KV namespaces..."
STAGING_KV_CACHE=$(wrangler kv:namespace create CACHE --preview false --json | jq -r '.id')
echo "✅ Staging KV Cache: $STAGING_KV_CACHE"

STAGING_KV_CONFIG=$(wrangler kv:namespace create CONFIG --preview false --json | jq -r '.id')
echo "✅ Staging KV Config: $STAGING_KV_CONFIG"

PROD_KV_CACHE=$(wrangler kv:namespace create CACHE_PROD --preview false --json | jq -r '.id')
echo "✅ Production KV Cache: $PROD_KV_CACHE"

PROD_KV_CONFIG=$(wrangler kv:namespace create CONFIG_PROD --preview false --json | jq -r '.id')
echo "✅ Production KV Config: $PROD_KV_CONFIG"
echo ""

# Create R2 Buckets
echo "🪣 Creating R2 buckets..."
wrangler r2 bucket create site-builder-uploads-staging
echo "✅ Staging uploads bucket created"

wrangler r2 bucket create site-builder-uploads-production
echo "✅ Production uploads bucket created"
echo ""

# Create Queues
echo "📮 Creating queues..."
wrangler queues create site-builder-publish-staging
echo "✅ Staging publish queue created"

wrangler queues create site-builder-publish-production
echo "✅ Production publish queue created"

wrangler queues create site-builder-dunning-staging
echo "✅ Staging dunning queue created"

wrangler queues create site-builder-dunning-production
echo "✅ Production dunning queue created"
echo ""

# Update wrangler.toml with IDs
echo "📝 Updating wrangler.toml..."
sed -i "s/your-staging-d1-id/$STAGING_DB_ID/g" packages/api/wrangler.toml
sed -i "s/your-production-d1-id/$PROD_DB_ID/g" packages/api/wrangler.toml
sed -i "s/your-staging-kv-cache-id/$STAGING_KV_CACHE/g" packages/api/wrangler.toml
sed -i "s/your-staging-kv-config-id/$STAGING_KV_CONFIG/g" packages/api/wrangler.toml
sed -i "s/your-production-kv-cache-id/$PROD_KV_CACHE/g" packages/api/wrangler.toml
sed -i "s/your-production-kv-config-id/$PROD_KV_CONFIG/g" packages/api/wrangler.toml
echo "✅ wrangler.toml updated"
echo ""

# Summary
echo "✅ Infrastructure setup complete!"
echo ""
echo "📋 Summary:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "D1 Staging:     $STAGING_DB_ID"
echo "D1 Production:  $PROD_DB_ID"
echo ""
echo "KV Staging Cache:  $STAGING_KV_CACHE"
echo "KV Staging Config: $STAGING_KV_CONFIG"
echo "KV Prod Cache:     $PROD_KV_CACHE"
echo "KV Prod Config:    $PROD_KV_CONFIG"
echo ""
echo "R2 Buckets: site-builder-uploads-staging, site-builder-uploads-production"
echo "Queues: Created for publish and dunning (staging + production)"
echo ""
echo "📋 Next steps:"
echo "1. Update .env.local with these IDs"
echo "2. Run: bash scripts/migrate.sh staging"
echo "3. Run: bash scripts/seed.sh staging"
echo "4. Configure GitHub secrets for CI/CD"
echo ""
