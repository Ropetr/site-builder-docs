#!/bin/bash
# Script para executar migrations e seeds
# Uso: bash scripts/run-migrations.sh staging|production

set -e

ENV=${1:-staging}

if [ "$ENV" != "staging" ] && [ "$ENV" != "production" ]; then
  echo "❌ Uso: bash scripts/run-migrations.sh staging|production"
  exit 1
fi

DB_NAME="site-builder-$ENV"

echo "🗃️  Executando migrations no database: $DB_NAME"
echo ""

# Initial migration
echo "📝 Executando 001_initial_schema.sql..."
wrangler d1 execute "$DB_NAME" --file=infra/db/migrations/001_initial_schema.sql --env="$ENV"

# Main schema
echo "📝 Executando schema.sql..."
wrangler d1 execute "$DB_NAME" --file=infra/db/schema.sql --env="$ENV"

# Seeds
echo "🌱 Executando seeds..."
wrangler d1 execute "$DB_NAME" --file=infra/db/seeds/001_demo_data.sql --env="$ENV"
wrangler d1 execute "$DB_NAME" --file=infra/db/seeds/002_blocks_themes.sql --env="$ENV"
wrangler d1 execute "$DB_NAME" --file=infra/db/seeds/003_template_demo.sql --env="$ENV"

echo ""
echo "✅ Migrations e seeds executados com sucesso!"
echo ""
echo "🔍 Verificando dados..."
wrangler d1 execute "$DB_NAME" --command="SELECT email, name FROM users LIMIT 1" --env="$ENV"
echo ""
echo "📊 Tabelas criadas:"
wrangler d1 execute "$DB_NAME" --command="SELECT name FROM sqlite_master WHERE type='table' ORDER BY name" --env="$ENV"
