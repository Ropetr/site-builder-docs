
# APPENDIX I — GitHub Actions (CI/CD) para Cloudflare (staging + production)

## I.1 Objetivo
Definir workflows GitHub Actions para:
- Qualidade (lint/test/typecheck/build) em PRs e pushes
- Deploy automatizado em **staging** a cada push em `main`
- Deploy controlado em **production** via `workflow_dispatch` e/ou aprovação do ambiente
- Migrações D1 (quando aplicável) com segurança
- Smoke tests pós-deploy
- Gestão de secrets e variáveis por ambiente

> Este apêndice documenta **o que as Actions fazem**, **quais secrets exigem**, e fornece **workflows esqueleto** em `.github/workflows`.

---

## I.2 Visão geral dos workflows

### I.2.1 `ci.yml` (Qualidade e Build)
- **Gatilhos:** `pull_request` e `push` (main)
- **Jobs:**
  1) install deps
  2) lint
  3) typecheck
  4) unit tests
  5) build (apps/editor-web, apps/workers-api, etc.)
- **Objetivo:** impedir regressões e código quebrado antes de deploy.

### I.2.2 `deploy-staging.yml` (Deploy automático em staging)
- **Gatilho:** `push` em `main`
- **Ambiente:** `staging`
- **Passos padrão:**
  1) build artifacts
  2) aplicar migrações (opcional/condicional)
  3) deploy Workers API (wrangler)
  4) deploy Pages (editor + published runtime)
  5) smoke tests (health endpoints)
- **Objetivo:** staging sempre atualizado para validação.

### I.2.3 `deploy-production.yml` (Deploy controlado em production)
- **Gatilhos:** `workflow_dispatch` (manual) e/ou `release published`
- **Ambiente:** `production` (com proteção/approvers)
- **Regras:**
  - deploy só após CI verde
  - migração D1 só com aprovação e backup/rollback definido
  - smoke tests obrigatórios pós-deploy
- **Objetivo:** reduzir risco operacional.

---

## I.3 Requisitos de secrets/vars (por ambiente)

### I.3.1 Cloudflare (obrigatório)
**Secrets recomendados (Repo → Settings → Secrets and variables → Actions):**
- `CF_API_TOKEN` — token com permissões mínimas para Pages + Workers + D1 + KV + R2 (conforme uso)
- `CF_ACCOUNT_ID` — account id Cloudflare

**Vars recomendadas:**
- `CF_PAGES_PROJECT_EDITOR` — nome do projeto Pages do editor
- `CF_PAGES_PROJECT_PUBLISHED` — nome do projeto Pages do runtime publicado (se separado)
- `CF_WORKER_NAME_API` — nome do Worker da API
- `CF_ENV` — `staging` ou `production`

> Observação: use **environments do GitHub** (staging/production) para separar secrets por ambiente.

### I.3.2 Billing provider (gateway cartão) (plugável)
- `BILLING_PROVIDER` (var)
- `BILLING_WEBHOOK_SECRET` (secret)
- `BILLING_API_KEY` (secret)

### I.3.3 Evolution API v1 (WhatsApp)
- `EVOLUTION_API_URL` (secret/var)
- `EVOLUTION_API_TOKEN` (secret)
- `EVOLUTION_INSTANCE_ID` (var/secret)

### I.3.4 Outras integrações (opcionais)
- SMTP/Email provider secrets
- Sentry/Observabilidade

---

## I.4 Migrações D1 (padrão seguro)
### I.4.1 Estratégia recomendada
- Migrações versionadas (ex.: `infra/db/migrations/*.sql`)
- Staging aplica automaticamente
- Production aplica somente com aprovação (workflow_dispatch) e checklist de rollback

### I.4.2 Critérios mínimos
- Migração deve ser **idempotente** quando possível
- Sem “drop” destrutivo no MVP; preferir additive migrations

---

## I.5 Smoke tests pós-deploy (mínimo)
Criar endpoints:
- `GET /health` (API)
- `GET /ready` (se necessário)
E validar:
- status 200
- versão/build_id retornado para auditoria

---

## I.6 Workflows esqueleto (referência)
Os arquivos abaixo são exemplos iniciais e devem ser ajustados quando a estrutura de apps estiver implementada:
- `.github/workflows/ci.yml`
- `.github/workflows/deploy-staging.yml`
- `.github/workflows/deploy-production.yml`

---

## I.7 Checklist CI/CD (aceite)
- PR não faz deploy
- Push em main faz deploy em staging automaticamente
- Production exige aprovação (environment protection + workflow_dispatch)
- Secrets separados por ambiente
- Deploy registra build_id/version e executa smoke tests
