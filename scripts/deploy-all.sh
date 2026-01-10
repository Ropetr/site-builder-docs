#!/bin/bash
# Script para fazer deploy de todos os workers
# Uso: bash scripts/deploy-all.sh staging|production

set -e

ENV=${1:-staging}

if [ "$ENV" != "staging" ] && [ "$ENV" != "production" ]; then
  echo "❌ Uso: bash scripts/deploy-all.sh staging|production"
  exit 1
fi

echo "🚀 Fazendo deploy de todos os workers para: $ENV"
echo ""

# API Worker
echo "📡 Deploying API Worker..."
cd packages/api
pnpm run deploy:$ENV
cd ../..
echo ""

# Runtime Worker
echo "🌐 Deploying Runtime Worker..."
cd packages/runtime
pnpm run deploy:$ENV
cd ../..
echo ""

# Publish Worker
echo "📨 Deploying Publish Worker (Queue Consumer)..."
cd packages/publish-worker
pnpm run deploy:$ENV
cd ../..
echo ""

echo "✅ Todos os workers foram deployados com sucesso!"
echo ""
echo "🔗 URLs:"
echo "  API: https://site-builder-api-$ENV.*.workers.dev"
echo "  Runtime: https://site-builder-runtime-$ENV.*.workers.dev"
echo ""
echo "📝 Editor precisa ser deployado via Cloudflare Pages:"
echo "  1. cd packages/editor"
echo "  2. pnpm run build"
echo "  3. Deploy via Cloudflare Pages dashboard"
