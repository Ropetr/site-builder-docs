# Guia de Setup Cloudflare - Site Builder SaaS

## Pré-requisitos
- Conta Cloudflare (gratuita ou paga)
- Cloudflare Workers habilitado
- `wrangler` CLI instalado (`pnpm install -g wrangler`)
- Login no wrangler: `wrangler login`

---

## Passo 2: Criar Recursos Cloudflare

### 2.1. Criar D1 Database (Staging)

```bash
wrangler d1 create site-builder-staging
```

**Output esperado:**
```
✅ Successfully created DB 'site-builder-staging'
Database ID: <ALGUM_ID>
```

**Copie o Database ID** e cole em `packages/api/wrangler.toml`:
```toml
[env.staging]
[[env.staging.d1_databases]]
binding = "DB"
database_name = "site-builder-staging"
database_id = "COLE_O_ID_AQUI"  # ← Substituir
```

### 2.2. Criar D1 Database (Production)

```bash
wrangler d1 create site-builder-production
```

Copie o ID para `packages/api/wrangler.toml` em `[env.production]`.

---

### 2.3. Criar KV Namespace (CACHE) - Staging

```bash
wrangler kv:namespace create CACHE --env=staging
```

**Output esperado:**
```
✅ Successfully created KV namespace
ID: <ALGUM_KV_ID>
```

Cole em `packages/api/wrangler.toml`:
```toml
[env.staging]
[[env.staging.kv_namespaces]]
binding = "CACHE"
id = "COLE_O_KV_ID_AQUI"  # ← Substituir
```

### 2.4. Criar KV Namespace (CACHE) - Production

```bash
wrangler kv:namespace create CACHE --env=production
```

Cole o ID em `[env.production]`.

---

### 2.5. Criar KV Namespace (CONFIG) - Staging

```bash
wrangler kv:namespace create CONFIG --env=staging
```

Cole o ID em `packages/api/wrangler.toml`.

### 2.6. Criar KV Namespace (CONFIG) - Production

```bash
wrangler kv:namespace create CONFIG --env=production
```

---

### 2.7. Criar R2 Bucket (SITES) - Staging

```bash
wrangler r2 bucket create site-builder-sites-staging
```

**Output esperado:**
```
✅ Successfully created bucket 'site-builder-sites-staging'
```

**Atenção:** O nome do bucket já está configurado em `wrangler.toml`, então não precisa copiar ID.

### 2.8. Criar R2 Bucket (SITES) - Production

```bash
wrangler r2 bucket create site-builder-sites-production
```

---

### 2.9. Criar R2 Bucket (UPLOADS) - Staging

```bash
wrangler r2 bucket create site-builder-uploads-staging
```

### 2.10. Criar R2 Bucket (UPLOADS) - Production

```bash
wrangler r2 bucket create site-builder-uploads-production
```

---

### 2.11. Criar Queue (PUBLISH_QUEUE) - Staging

```bash
wrangler queues create publish-queue
```

**Output esperado:**
```
✅ Successfully created queue 'publish-queue'
```

### 2.12. Criar Queue (PUBLISH_QUEUE) - Production

```bash
wrangler queues create publish-queue-production
```

Cole em `packages/publish-worker/wrangler.toml`:
```toml
[env.production]
[[queues.consumers]]
queue = "publish-queue-production"
```

---

## Passo 2B: Executar Migrations + Seeds

### 2B.1. Run Initial Migration (Staging)

```bash
cd packages/api
wrangler d1 execute site-builder-staging --file=../../infra/db/migrations/001_initial_schema.sql --env=staging
```

### 2B.2. Run Main Schema (Staging)

```bash
wrangler d1 execute site-builder-staging --file=../../infra/db/schema.sql --env=staging
```

### 2B.3. Seed Demo Data (Staging)

```bash
wrangler d1 execute site-builder-staging --file=../../infra/db/seeds/001_demo_data.sql --env=staging
wrangler d1 execute site-builder-staging --file=../../infra/db/seeds/002_blocks_themes.sql --env=staging
wrangler d1 execute site-builder-staging --file=../../infra/db/seeds/003_template_demo.sql --env=staging
```

### 2B.4. Verificar que funcionou

```bash
wrangler d1 execute site-builder-staging --command="SELECT * FROM users LIMIT 1" --env=staging
```

**Output esperado:**
```
┌──────────────┬─────────────────────┬─────────────┐
│ id           │ email               │ name        │
├──────────────┼─────────────────────┼─────────────┤
│ user-demo-001│ demo@sitebuilder.com│ Demo User   │
└──────────────┴─────────────────────┴─────────────┘
```

---

## Passo 3: Deploy Staging

### 3.1. Deploy API Worker

```bash
cd packages/api
pnpm run deploy:staging
```

**Output esperado:**
```
✅ Deployed to https://site-builder-api-staging.YOURNAME.workers.dev
```

### 3.2. Deploy Runtime Worker

```bash
cd ../runtime
pnpm run deploy:staging
```

**Output esperado:**
```
✅ Deployed to https://site-builder-runtime-staging.YOURNAME.workers.dev
```

### 3.3. Deploy Publish Worker

```bash
cd ../publish-worker
pnpm run deploy:staging
```

**Output esperado:**
```
✅ Deployed queue consumer
```

### 3.4. Deploy Editor (Cloudflare Pages)

```bash
cd ../editor
pnpm run build
```

Depois fazer deploy manual via Cloudflare Pages dashboard:
1. Ir em https://dash.cloudflare.com/pages
2. Criar novo projeto
3. Conectar ao repositório GitHub
4. Build command: `cd packages/editor && pnpm run build`
5. Build output directory: `packages/editor/dist`

---

## Passo 4: Teste Completo

### 4.1. Testar API Health Check

```bash
curl https://site-builder-api-staging.YOURNAME.workers.dev/health
```

**Esperado:**
```json
{
  "status": "ok",
  "environment": "staging",
  "version": "1.0.0"
}
```

### 4.2. Testar Login

```bash
curl -X POST https://site-builder-api-staging.YOURNAME.workers.dev/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "demo@sitebuilder.com",
    "password": "demo123"
  }'
```

**Esperado:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": { "id": "user-demo-001", ... },
  "tenant": { "id": "tenant-demo-001", ... }
}
```

### 4.3. Testar Editor

Abrir no navegador:
```
https://site-builder-editor.pages.dev
```

**Fluxo de teste:**
1. ✅ Painel de blocos carrega à esquerda
2. ✅ Clicar em "Hero Section" adiciona ao canvas
3. ✅ Editar propriedades no painel direito
4. ✅ Arrastar blocos para reordenar
5. ✅ Salvar página (mock por enquanto)

### 4.4. Testar Publicação

```bash
# 1. Criar uma página
TOKEN="<TOKEN_DO_LOGIN>"

curl -X POST https://site-builder-api-staging.YOURNAME.workers.dev/pages \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "site_id": "site-demo-001",
    "slug": "index",
    "title": "Home Page",
    "content": {
      "blocks": [
        {
          "block_id": "block-hero-01",
          "props": {
            "headline": "Welcome!",
            "subheadline": "This is a test",
            "ctaText": "Get Started",
            "ctaUrl": "#"
          }
        }
      ]
    }
  }'

# 2. Publicar o site
curl -X POST https://site-builder-api-staging.YOURNAME.workers.dev/publish/site-demo-001 \
  -H "Authorization: Bearer $TOKEN"

# Esperado: {"success": true, "version": {...}, "message": "Publish job queued..."}

# 3. Aguardar 5-10 segundos para o worker processar

# 4. Configurar domínio de teste
curl -X POST https://site-builder-api-staging.YOURNAME.workers.dev/domains \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "site_id": "site-demo-001",
    "domain": "demo.example.com",
    "is_primary": true
  }'
```

### 4.5. Ver Site Publicado

**Opção A - Via Runtime Worker:**
```bash
curl https://site-builder-runtime-staging.YOURNAME.workers.dev/
```

**Opção B - Com Custom Domain:**
1. Adicionar DNS CNAME em `demo.example.com` → `site-builder-runtime-staging.YOURNAME.workers.dev`
2. Abrir `https://demo.example.com`

---

## Passo 5: Deploy Production

### 5.1. Repetir Passo 2 para Production

- Criar D1 database production
- Criar KV namespaces production
- Criar R2 buckets production
- Criar Queue production
- Executar migrations + seeds

### 5.2. Deploy Production Workers

```bash
cd packages/api
pnpm run deploy:production

cd ../runtime
pnpm run deploy:production

cd ../publish-worker
pnpm run deploy:production
```

### 5.3. Deploy Production Editor

1. No Cloudflare Pages, criar ambiente "Production"
2. Conectar ao branch `master`
3. Deploy automático

---

## Variáveis de Ambiente (Secrets)

### Para Stripe (M6):

```bash
# Staging
wrangler secret put STRIPE_SECRET_KEY --env=staging
# Cole: sk_test_...

wrangler secret put STRIPE_WEBHOOK_SECRET --env=staging
# Cole: whsec_...

# Production
wrangler secret put STRIPE_SECRET_KEY --env=production
# Cole: sk_live_...

wrangler secret put STRIPE_WEBHOOK_SECRET --env=production
# Cole: whsec_...
```

### JWT Secret:

```bash
wrangler secret put JWT_SECRET --env=staging
# Cole qualquer string segura (ex: resultado de openssl rand -base64 32)

wrangler secret put JWT_SECRET --env=production
# Cole outra string segura diferente
```

---

## Monitoramento

### Ver logs em tempo real:

```bash
# API logs
wrangler tail site-builder-api-staging --env=staging

# Runtime logs
wrangler tail site-builder-runtime-staging --env=staging

# Publish worker logs
wrangler tail site-builder-publish-worker-staging --env=staging
```

### Ver filas:

```bash
wrangler queues list
```

---

## Troubleshooting

### Erro: "Database not found"
- Verificar se o database_id em wrangler.toml está correto
- Rodar: `wrangler d1 list` para ver todos os databases

### Erro: "KV namespace not found"
- Verificar se o KV id em wrangler.toml está correto
- Rodar: `wrangler kv:namespace list` para ver todos os namespaces

### Erro: "R2 bucket not found"
- Verificar nome do bucket em wrangler.toml
- Rodar: `wrangler r2 bucket list` para ver todos os buckets

### Queue não processa jobs:
- Verificar se publish-worker foi deployado
- Ver logs: `wrangler tail site-builder-publish-worker-staging`
- Inspecionar dead letter queue: `wrangler queues consumer list publish-dlq`

---

## Custos Esperados (Cloudflare)

**Free Tier cobre:**
- 10 GB D1 storage
- 5 million read/writes por dia
- 10 GB R2 storage
- 1 million queue messages/month
- 100k Workers requests/day

**Para SaaS em produção:**
- Workers Paid ($5/mês) = Unlimited requests
- D1 ($0.75/GB/mês + $0.001/million reads)
- R2 ($0.015/GB/mês storage)
- Queues ($0.40/million messages)

**Estimativa para 100 sites publicados:**
- ~$10-20/mês

---

## 🎉 PRONTO PARA VENDER!

Depois de completar todos os passos:
✅ MVP 100% funcional
✅ Multi-tenant
✅ Editor drag-and-drop
✅ Publicação com versionamento
✅ Custom domains
✅ SEO + Analytics
✅ Billing integrado

**Próximos passos de negócio:**
1. Criar landing page de marketing
2. Definir planos de preço (Starter/Pro/Business)
3. Configurar Stripe products
4. Adicionar onboarding de novos usuários
5. Implementar suporte/chat
6. Começar a vender! 🚀
