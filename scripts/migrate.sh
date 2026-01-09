#!/bin/bash
# Run D1 migrations

set -e

ENV=${1:-staging}

if [ "$ENV" != "staging" ] && [ "$ENV" != "production" ]; then
    echo "Usage: bash scripts/migrate.sh [staging|production]"
    exit 1
fi

echo "🔄 Running migrations for $ENV environment..."
echo ""

# Get database name from wrangler.toml
if [ "$ENV" = "staging" ]; then
    DB_NAME="site-builder-staging"
else
    DB_NAME="site-builder-production"
fi

# Run each migration
for migration in infra/db/migrations/*.sql; do
    echo "Applying $(basename "$migration")..."
    wrangler d1 execute "$DB_NAME" --file="$migration" --env="$ENV"
    echo "✅ Applied"
done

echo ""
echo "✅ All migrations applied to $ENV"
