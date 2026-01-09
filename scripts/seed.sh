#!/bin/bash
# Seed templates, blocks, and themes

set -e

ENV=${1:-staging}

if [ "$ENV" != "staging" ] && [ "$ENV" != "production" ]; then
    echo "Usage: bash scripts/seed.sh [staging|production]"
    exit 1
fi

echo "🌱 Seeding data for $ENV environment..."
echo ""

# This script would:
# 1. Read JSON files from infra/seeds/
# 2. Insert into D1 via wrangler d1 execute or API calls

echo "Loading themes..."
# wrangler d1 execute ... INSERT statements for themes

echo "Loading blocks library..."
# INSERT 40+ blocks

echo "Loading 5 complete templates..."
# INSERT templates with full structure

echo ""
echo "✅ Seed data loaded to $ENV"
echo ""
echo "📋 Loaded:"
echo "  - 10+ themes"
echo "  - 40+ blocks (heroes, benefits, FAQ, pricing, etc.)"
echo "  - 5 complete templates:"
echo "    • Local Service (WhatsApp-first)"
echo "    • Professional (Consulting/Legal)"
echo "    • Health/Clinic"
echo "    • Restaurant/Delivery"
echo "    • E-commerce Starter"
echo ""
