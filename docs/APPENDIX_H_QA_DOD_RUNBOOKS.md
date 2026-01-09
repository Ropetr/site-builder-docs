
# APPENDIX H — QA, DoD e Runbooks

## H.1 Definition of Done (global)
Uma feature está pronta quando:
- critérios de aceitação foram atendidos
- testes mínimos foram adicionados
- logs/observabilidade básica implementados
- budgets de performance não foram violados (Apêndice F)

## H.2 Testes mínimos por área
Editor:
- e2e: editar conteúdo em 3 breakpoints; publicar; rollback
Footer mobile:
- e2e mobile: aparece e funciona; não aparece no checkout; não causa CLS; eventos 1x
SEO:
- geração de sitemap/robots; canonical; redirect automático ao mudar slug
Tracking:
- page_view sem duplicidade; generate_lead após sucesso; parâmetros mínimos
Billing:
- webhooks idempotentes; transições de estado; régua com cadência e logs
Shop:
- add_to_cart → begin_checkout → purchase com itens

## H.3 Observabilidade mínima
- logs estruturados com request_id, tenant_id, site_id, user_id (quando houver)
- métricas: publish success/failure, tempo de publish, falhas de domínio, falhas de webhook, envios de régua

## H.4 Runbooks (procedimentos)
Publish falhou:
- verificar logs do job; reprocessar; se necessário rollback
Domínio pendente:
- validar DNS/CNAME; status SSL; reemitir hostname se necessário
Pagamento falhou:
- confirmar evento gateway; iniciar régua; aplicar soft/hard lock conforme política
Incidente de performance:
- identificar páginas com violação de budgets; desabilitar scripts; publicar hotfix
