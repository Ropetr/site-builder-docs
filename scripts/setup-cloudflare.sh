#!/bin/bash
# Script para criar recursos Cloudflare automaticamente
# Uso: bash scripts/setup-cloudflare.sh staging|production

set -e

ENV=${1:-staging}

if [ "$ENV" != "staging" ] && [ "$ENV" != "production" ]; then
  echo "❌ Uso: bash scripts/setup-cloudflare.sh staging|production"
  exit 1
fi

echo "🚀 Criando recursos Cloudflare para ambiente: $ENV"
echo ""

# D1 Database
echo "📊 Criando D1 Database..."
DB_NAME="site-builder-$ENV"
wrangler d1 create "$DB_NAME"
echo ""

# KV Namespaces
echo "🗄️  Criando KV Namespaces..."
wrangler kv:namespace create CACHE --env="$ENV"
wrangler kv:namespace create CONFIG --env="$ENV"
echo ""

# R2 Buckets
echo "📦 Criando R2 Buckets..."
wrangler r2 bucket create "site-builder-sites-$ENV"
wrangler r2 bucket create "site-builder-uploads-$ENV"
echo ""

# Queues
echo "📨 Criando Queue..."
QUEUE_NAME="publish-queue"
if [ "$ENV" = "production" ]; then
  QUEUE_NAME="publish-queue-production"
fi
wrangler queues create "$QUEUE_NAME"
echo ""

echo "✅ Recursos criados com sucesso!"
echo ""
echo "⚠️  IMPORTANTE: Copie os IDs gerados acima e cole nos arquivos wrangler.toml:"
echo "  - packages/api/wrangler.toml"
echo "  - packages/runtime/wrangler.toml"
echo "  - packages/publish-worker/wrangler.toml"
echo ""
echo "📖 Consulte CLOUDFLARE_SETUP.md para instruções detalhadas."
