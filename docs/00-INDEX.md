
# 00-INDEX — Como usar esta documentação com IA

## Objetivo
Este repositório contém a documentação única (fonte de verdade) para implementar um **Criador de Sites para Venda** (SaaS) com:
- Editor no-code responsivo (guardrails)
- Templates completos (mínimo 5) + temas + blocos
- Multi-tenant (Agência/Cliente), permissões e auditoria
- Domínios custom por cliente com SSL
- SEO técnico + Search Console
- Mensuração: GA4/GTM/Ads/Pixels com Consent Mode v2
- PageSpeed/Core Web Vitals como requisito
- Shop básico (catálogo → checkout → pedido)
- Billing recorrente (cartão via gateway) + régua de cobrança (dunning) via Evolution API v1

## Como usar com IA (procedimento padrão)
1. Dê para a IA **este índice** e **MASTER_SPEC.md**.
2. Para cada implementação, inclua também o(s) apêndice(s) relevante(s):
   - Eventos e Data Layer: APPENDIX_A_EVENTS_DATA_LAYER.md
   - Billing/Dunning/Evolution: APPENDIX_B_BILLING_DUNNING_EVOLUTION.md
   - Templates: APPENDIX_C_TEMPLATES_LIBRARY.md
   - Arquitetura Cloudflare/GitHub: APPENDIX_D_CLOUDFLARE_GITHUB_ARCHITECTURE.md
   - SEO/Schema/Redirects: APPENDIX_E_SEO_SCHEMA_REDIRECTS.md
   - Performance budgets: APPENDIX_F_PERFORMANCE_BUDGETS.md
   - API/Modelos/RBAC: APPENDIX_G_API_DATA_MODELS_RBAC.md
   - QA/DoD/Runbooks: APPENDIX_H_QA_DOD_RUNBOOKS.md

3. Trabalhe por **tickets** (cartões de tarefa). Cada ticket deve conter:
   - Contexto (referência de seção do spec)
   - Objetivo, fora de escopo
   - Regras/validações
   - Estados (quando aplicável)
   - Eventos/telemetria
   - Critérios de aceitação testáveis
   - Testes mínimos

## Padrão de “Definition of Done” (DoD) global
Nenhuma feature é considerada pronta sem:
- Critérios de aceitação cumpridos
- Testes mínimos implementados
- Logs/observabilidade básica
- Sem regressão grave de performance (ver budgets no Apêndice F)
