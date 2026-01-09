
# APPENDIX G — API, Modelos de Dados e RBAC

## G.1 Entidades mínimas
- Tenant
- User
- Role
- Site
- Page
- Theme
- Template
- BlockInstance
- Domain
- PublishVersion
- Lead
- Product
- Order
- BillingAccount
- Subscription
- Invoice
- AuditLog

## G.2 RBAC (mínimo)
- Owner: tudo
- Admin: tudo no tenant
- Editor: editar conteúdo
- Publisher: publicar
- Billing: gerenciar planos/cobrança
- Viewer: visualizar

## G.3 Operações sensíveis (exigem auditoria)
- publish production
- conectar/remover domínio
- alterar plano/billing
- ativar scripts de terceiros/pixels

## G.4 Endpoints mínimos (exemplo)
Sites/Conteúdo:
- POST /tenants/{tenantId}/sites
- GET /sites/{siteId}
- PATCH /sites/{siteId}
- POST /sites/{siteId}/publish
- POST /sites/{siteId}/rollback
- POST /sites/{siteId}/domains
- GET /sites/{siteId}/sitemap.xml
- GET /sites/{siteId}/robots.txt

Leads:
- POST /sites/{siteId}/leads
- GET /sites/{siteId}/leads

Billing:
- POST /billing/checkout-session
- POST /billing/portal-session
- POST /webhooks/billing/{provider}

Tracking:
- POST /sites/{siteId}/events (opcional para analytics interno)

## G.5 Regras de validação
- todo request deve conter tenant context (token)
- enforcement de role por endpoint
- rate-limit por tenant em endpoints de alto volume
