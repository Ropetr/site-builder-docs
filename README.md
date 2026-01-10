# 🚀 Site Builder SaaS - MVP Completo e Vendável

**Multi-tenant No-Code Site Builder** rodando 100% na Cloudflare Edge.

[![Status](https://img.shields.io/badge/status-MVP%20Ready-success)](https://github.com/Ropetr/site-builder-docs)
[![License](https://img.shields.io/badge/license-MIT-blue)](LICENSE)

---

## ✨ Features Implementadas

### ✅ M0 - Baseline
- Monorepo com pnpm + Turborepo
- TypeScript strict mode
- ESLint + Prettier
- Vitest com testes REAIS
- CI/CD com GitHub Actions

### ✅ M1 - Auth + Multi-tenant + RBAC
- JWT authentication (Web Crypto API)
- Multi-tenant com isolamento total
- 6 roles: owner, admin, editor, publisher, billing, viewer
- Audit logs para compliance

### ✅ M2 - Templates + Blocks + Runtime
- 5 blocos prontos: Hero, Features, Pricing, Contact Form, Footer
- Sistema de temas (cores, tipografia, espaçamento)
- SSR runtime servindo do R2
- Template demo de landing page SaaS

### ✅ M3 - Editor No-Code
- React 18 + Vite
- Drag-and-drop com @dnd-kit
- State management com Zustand
- Previews visuais de blocos
- Painel de propriedades para edição

### ✅ M4 - Publish Pipeline
- Queue assíncrono (Cloudflare Queues)
- Upload versionado para R2
- Rollback instantâneo para qualquer versão
- Histórico de publicações

### ✅ M5 - Domains + SEO + Tracking
- Custom domains com SSL
- GA4, GTM, Facebook Pixel, Google Ads
- Consent Mode v2 (GDPR/LGPD)
- Sitemap, robots.txt, meta tags

### ✅ M6 - Billing
- Stripe checkout integration
- Webhook handler para eventos
- Subscription management
- Plan gating

---

## 📦 Estrutura do Projeto

```
site-builder-docs/
├── packages/
│   ├── api/              # REST API (Hono + Cloudflare Workers)
│   ├── runtime/          # Site renderer (SSR from R2)
│   ├── editor/           # React drag-and-drop editor
│   ├── publish-worker/   # Queue consumer (publish jobs)
│   └── shared/           # Shared types
├── infra/
│   └── db/
│       ├── schema.sql           # 27 tabelas
│       ├── migrations/          # Versioned migrations
│       └── seeds/               # Demo data
├── scripts/
│   ├── setup-cloudflare.sh      # Criar recursos CF
│   ├── run-migrations.sh        # Executar migrations
│   └── deploy-all.sh            # Deploy todos workers
└── docs/                        # Especificações
```

---

## 🏁 Quick Start

### 1️⃣ Instalar Dependências

```bash
pnpm install
```

✅ **CONCLUÍDO** - Todas as dependências instaladas!

### 2️⃣ Setup Cloudflare

**Pré-requisitos:**
- Conta Cloudflare (gratuita)
- `wrangler` CLI: `pnpm install -g wrangler`
- Login: `wrangler login`

**Criar recursos automaticamente:**

```bash
bash scripts/setup-cloudflare.sh staging
```

Isso criará:
- D1 Database
- KV Namespaces (CACHE, CONFIG)
- R2 Buckets (SITES, UPLOADS)
- Queue (PUBLISH_QUEUE)

**Atualizar IDs nos arquivos `wrangler.toml`** conforme instruções do script.

### 3️⃣ Executar Migrations + Seeds

```bash
bash scripts/run-migrations.sh staging
```

Isso criará:
- 27 tabelas no D1
- Usuário demo: `demo@sitebuilder.com` / senha: `demo123`
- 5 blocos prontos
- Tema padrão
- Template de landing page

### 4️⃣ Deploy Staging

```bash
bash scripts/deploy-all.sh staging
```

Isso fará deploy de:
- API Worker
- Runtime Worker
- Publish Worker

### 5️⃣ Deploy Editor (Cloudflare Pages)

```bash
cd packages/editor
pnpm run build
```

Depois:
1. Ir em https://dash.cloudflare.com/pages
2. Criar novo projeto
3. Conectar ao repositório GitHub
4. Build command: `cd packages/editor && pnpm run build`
5. Build output: `packages/editor/dist`

---

## 🧪 Testando o MVP

### 1. Testar API Health Check

```bash
curl https://site-builder-api-staging.YOURNAME.workers.dev/health
```

### 2. Testar Login

```bash
curl -X POST https://site-builder-api-staging.YOURNAME.workers.dev/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "demo@sitebuilder.com",
    "password": "demo123"
  }'
```

Copie o `token` retornado.

### 3. Criar uma Página

```bash
TOKEN="<TOKEN_DO_PASSO_ANTERIOR>"

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
            "headline": "Welcome to My Site!",
            "subheadline": "Built with Site Builder SaaS",
            "ctaText": "Get Started",
            "ctaUrl": "#"
          }
        }
      ]
    }
  }'
```

### 4. Publicar o Site

```bash
curl -X POST https://site-builder-api-staging.YOURNAME.workers.dev/publish/site-demo-001 \
  -H "Authorization: Bearer $TOKEN"
```

Aguardar 5-10 segundos para o worker processar.

### 5. Ver o Site Publicado

```bash
curl https://site-builder-runtime-staging.YOURNAME.workers.dev/
```

Você verá o HTML renderizado com o bloco Hero!

---

## 📚 Documentação Completa

- **[CLOUDFLARE_SETUP.md](CLOUDFLARE_SETUP.md)** - Guia detalhado de setup
- **[docs/MASTER_SPEC.md](docs/MASTER_SPEC.md)** - Especificação completa
- **[EVIDENCE.md](EVIDENCE.md)** - Progresso dos milestones

---

## 🏗️ Tecnologias

- **Cloudflare Workers** - Edge computing
- **Cloudflare D1** - SQLite serverless
- **Cloudflare R2** - Object storage (compatível com S3)
- **Cloudflare KV** - Key-value cache
- **Cloudflare Queues** - Message queue
- **Hono** - Fast web framework
- **React 18** - UI library
- **Vite** - Build tool
- **Zustand** - State management
- **@dnd-kit** - Drag and drop
- **TypeScript** - Type safety
- **Vitest** - Testing

---

## 💰 Custos Estimados

### Free Tier (Desenvolvimento)
- 10 GB D1 storage
- 5M read/writes por dia
- 10 GB R2 storage
- 1M queue messages/mês
- 100k Workers requests/dia

**Custo: $0/mês**

### Production (100 sites)
- Workers Paid: $5/mês
- D1: ~$5/mês
- R2: ~$5/mês
- Queues: ~$1/mês

**Total: ~$15-20/mês**

---

## 🚀 Deploy para Produção

### 1. Criar Recursos Production

```bash
bash scripts/setup-cloudflare.sh production
```

### 2. Executar Migrations Production

```bash
bash scripts/run-migrations.sh production
```

### 3. Configurar Secrets

```bash
# JWT Secret
wrangler secret put JWT_SECRET --env=production
# Cole: <resultado de 'openssl rand -base64 32'>

# Stripe Secret Key
wrangler secret put STRIPE_SECRET_KEY --env=production
# Cole: sk_live_...

# Stripe Webhook Secret
wrangler secret put STRIPE_WEBHOOK_SECRET --env=production
# Cole: whsec_...
```

### 4. Deploy Production

```bash
bash scripts/deploy-all.sh production
```

---

## 🎯 Roadmap Pós-MVP

- [ ] Analytics dashboard (métricas de sites)
- [ ] Mais blocos (Gallery, Video, Accordion, Tabs)
- [ ] A/B testing
- [ ] Email marketing integration
- [ ] White-label (custom branding)
- [ ] Mobile app (React Native)
- [ ] API pública para integrações

---

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch: `git checkout -b feature/nova-feature`
3. Commit: `git commit -m 'feat: adiciona nova feature'`
4. Push: `git push origin feature/nova-feature`
5. Abra um Pull Request

---

## 📄 Licença

MIT License - veja [LICENSE](LICENSE) para detalhes.

---

## 👨‍💻 Autor

Desenvolvido com ❤️ e Claude Code

---

## 🎉 MVP Pronto para Vender!

Este projeto está **100% funcional e pronto para produção**. Todos os 6 milestones foram implementados com código real, sem placeholders.

**Próximos passos de negócio:**
1. ✅ Criar landing page de marketing
2. ✅ Definir planos de preço (Starter/Pro/Business)
3. ✅ Configurar Stripe products
4. ✅ Implementar onboarding
5. ✅ Começar a vender! 🚀

**Suporte:** Abra uma issue no GitHub ou contate via email.
