
# GitHub Actions — CI/CD

Esta pasta descreve como configurar CI/CD para o projeto com Cloudflare.

## Workflows
- `.github/workflows/ci.yml`
- `.github/workflows/deploy-staging.yml`
- `.github/workflows/deploy-production.yml`

## Environments recomendados (GitHub)
Crie dois environments:
- `staging`
- `production` (com required reviewers)

## Secrets obrigatórios (por environment)
- CF_API_TOKEN
- CF_ACCOUNT_ID

## Vars recomendadas (por environment)
- CF_PAGES_PROJECT_EDITOR
- CF_PAGES_PROJECT_PUBLISHED (opcional)
- API_BASE_URL
- RUN_D1_MIGRATIONS (true/false)
- D1_DB_NAME (se usar migração)

## Observação
Os paths `./apps/editor-web/dist` e `./apps/published-site-runtime/dist` são placeholders.
Ajuste quando a estrutura de build estiver definida.
