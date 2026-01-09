
# APPENDIX D — Arquitetura Cloudflare + GitHub (MVP)

## D.1 Objetivo
Descrever a arquitetura mínima para operar em produção usando Cloudflare (runtime) e GitHub (fábrica/CI).

## D.2 Componentes
- GitHub:
  - Repositórios e Pull Requests
  - GitHub Actions (CI/CD) com environments (staging/prod)
- Cloudflare:
  - Pages: editor web e sites publicados (static/híbrido)
  - Workers: API do builder
  - D1: dados estruturados
  - KV: cache/config
  - R2: uploads
  - Images: variantes e transformações
  - Queues/Workflows: jobs (publish, processamento, dunning)
  - Turnstile: proteção de formulários (opcional)

## D.3 Fluxo de publicação (alto nível)
1) Usuário aciona publish
2) API cria job (workflow) com versionamento
3) Build/render (SSG/SSR/híbrido conforme necessidade)
4) Upload assets (R2/Pages)
5) Purge/invalidação de cache
6) Marcar versão como published
7) Registrar auditoria e métricas

## D.4 Domínios por cliente (SaaS)
- Criar custom hostname via API
- Validar CNAME/TXT
- Provisionar SSL
- Ativar rota para site publicado
- Estados: pending_validation → pending_ssl → active / failed

## D.5 CI/CD (GitHub Actions)
- pipeline: lint → test → build → deploy staging → (aprovação) → deploy prod
- migrations D1 (quando aplicável)
- smoke tests pós-deploy

## D.6 Observabilidade mínima
- logs estruturados (request_id, tenant_id, site_id)
- métricas de:
  - publish success/failure
  - tempo de publish
  - erros de domínio
  - falhas de billing webhook
