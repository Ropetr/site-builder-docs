
# MASTER SPEC — Criador de Sites para Venda (SaaS)

## Visão geral do produto
Plataforma SaaS para criação e publicação de sites (institucional, landing e shop) com:
- Editor no-code responsivo, com guardrails
- Templates completos (mínimo 5) + temas + blocos
- Multi-tenant (agência/cliente) com permissões e auditoria
- Domínios custom por cliente com SSL
- SEO técnico e conteúdo via CMS
- Mensuração (GA4/GTM/Ads/Pixels) com Consent Mode v2
- PageSpeed/Core Web Vitals como requisito de produto
- Shop básico (catálogo → carrinho → checkout → pedido/obrigado)
- Billing recorrente em cartão via gateway
- Régua de cobrança (dunning) via Evolution API v1 (com logs e idempotência)

## Princípios de produto
- Publicação rápida: “publicar em 30 minutos” (para templates completos)
- Performance por padrão: budgets e guardrails (Apêndice F)
- Mensuração confiável: eventos canônicos + anti-duplicação (Apêndice A)
- Compliance: consentimento, bloqueio por categoria e governança (Seção 6)
- Operação vendável: planos, multi-tenant, domínios, billing e régua (Seção 7)

---

## 1) O que esse criador precisa ser, na prática

### 1.0 Objetivo
Produto vendável baseado em 4 pilares:
1) Editor + Temas + Templates (produção rápida)
2) Hospedagem + Performance (rápido e estável)
3) Marketing/SEO + Mensuração (conversões, orgânico e pixels)
4) Operação para vender/entregar (multi-tenant, domínios, billing e suporte)

### 1.0 Fora de escopo (MVP)
- Colaboração simultânea real-time no editor
- Marketplace amplo de integrações (somente conectores essenciais)
- BI avançado (apenas painel simples no MVP)

### 1.1 Editor + Temas + Templates
**Definições (camadas):**
- Tema (Theme): tokens globais (cores, fontes, botões, spacing)
- Template completo: site inteiro pronto (páginas + estrutura + defaults)
- Page template: blueprint de uma página
- Bloco (section): seção reutilizável (Hero, FAQ etc.)

**Fluxo de criação:**
1) Criar site → escolher template completo
2) Aplicar tema
3) Editar conteúdo e mídia
4) Ajustar SEO base
5) Publicar (draft → staging → production)
6) (Opcional) Conectar domínio
7) (Opcional) Conectar mensuração (GA4/GTM/Ads/Pixels) via wizard

**Guardrails:**
- Breakpoints: desktop/tablet/mobile com isolamento de ajustes
- Limites de tipografia e spacing
- Upload de imagem sempre gera variantes otimizadas

**Estados:**
- Site: draft | staging | published
- Publish job: queued → building → deploying → purging_cache → done/failed (com rollback)

**Aceite:**
- Permitir publicar site completo a partir de template em < 30 min (usuário padrão)
- Ajuste em mobile não quebra desktop (e vice-versa)

### 1.2 Hospedagem + Performance
- CDN/cache/SSL por padrão
- Otimização automática de assets
- Monitoramento e rollback
- Budgets e alertas no editor (Apêndice F)

**Aceite:**
- Publicação invalida cache corretamente
- Sem regressão grave de budgets (Apêndice F)

### 1.3 Marketing/SEO + Mensuração
- Eventos canônicos + data layer padrão (Apêndice A)
- UTMs capturadas e associadas a leads/pedidos
- Consentimento por categorias + bloqueio de tags

**Aceite:**
- `page_view` não duplica
- `generate_lead` e `purchase` disparam com parâmetros mínimos

### 1.4 Operação para vender/entregar
- Multi-tenant: agência cria e gerencia sites de clientes
- Permissões (RBAC) e auditoria (Apêndice G)
- Planos e limites
- Billing recorrente + dunning (Apêndice B)

**Aceite:**
- Usuário Editor não publica em produção sem permissão
- Auditoria registra publish/domínio/billing

### 1.5 Templates completos (mín. 5)
Obrigatório no pacote inicial:
1) Serviço Local (WhatsApp-first)
2) Profissional (Consultoria/Adv/Contábil)
3) Saúde/Clínica (Agendamento)
4) Restaurante/Delivery
5) E-commerce Starter
Detalhamento: Apêndice C.

### 1.9 Footer/Barra fixa mobile (Call/Map/Whats)
- Componente global (site-level), não é bloco
- Aparece apenas em mobile (opcional tablet)
- Itens: Ligar (tel), WhatsApp (wa.me), Localização (Maps/Waze), opcional Orçamento
- Regras: não mostrar no checkout; whitelist/blacklist de páginas
- UX: safe-area iOS, esconder com teclado, evitar CLS
- Eventos: `click_call`, `click_whatsapp`, `click_directions` (Apêndice A)

---

## 2) Funcionalidades essenciais

### 2.1 Editor no-code
Componentes mínimos: texto, imagem, botão, formulário, cards, FAQ, depoimentos, mapa, vídeo (controlado), seções prontas.
- Breakpoints e propriedades por breakpoint
- Guardrails de performance (scripts/trackers)
- Versionamento e rollback

### 2.2 CMS
Tipos: Página, Post, Serviço, Case, Produto, FAQ.
- Slug único por site
- Metadados por item
- Listagens dinâmicas

### 2.3 Multi-tenant
- Clonar por template
- Biblioteca protegida (header/footer/tema traváveis)
- Auditoria de mudanças

### 2.4 Integrações
- Formulários → e-mail/CRM/webhook
- Anti-spam (Turnstile/honeypot/rate-limit)
- Footer links gerados automaticamente (tel/wa.me/maps)

---

## 3) Tipos de páginas

### 3.1 Institucional
Home, Sobre, Serviços, Serviço, Cases/Depoimentos, Blog, FAQ, Contato, Políticas.
- Footer recomendado em Home/Serviço/Contato

### 3.2 Shop
Home, Categoria, Produto, Carrinho, Checkout, Obrigado, Conta, Políticas.
- Footer **não** aparece no checkout

### 3.3 Landing
Captura, Oferta, Agenda, Link na Bio.
- Tracking rigoroso; evitar CTAs conflitantes

---

## 4) Modelos prontos e temas
- Temas: conjuntos de tokens aplicáveis em 1 clique
- Biblioteca de blocos: heros, benefícios, prova social, FAQ, pricing, forms etc.
- Componentes “campeões”: sticky CTA, footer mobile, form 2 passos, FAQ+schema, prova social
- Templates completos: Apêndice C

---

## 5) Tamanho ideal e performance
- Serviço local MVP: 5–12 páginas
- SEO forte: expandir com páginas por serviço/cidade + blog
- Shop: base fixa + catálogo
- Budgets: Apêndice F

---

## 6) Compliance técnico completo
- Consentimento por categorias + bloqueio de tags
- GTM/gtag wizard + data layer padrão
- GA4/Ads/pixels com parâmetros mínimos e sem duplicidade
- Search Console: verificação assistida + sitemap/robots
- SEO on-page e schema
- PageSpeed por padrão (otimização automática + guardrails)

---

## 7) Pacotes + Billing + Régua
- Planos: Start/Growth/Shop/Agency
- Billing recorrente cartão via gateway (fonte da verdade financeira)
- PIX/Boleto via banco como alternativo/recuperação
- Régua (dunning) via Evolution API v1: comunicação + política de acesso (Apêndice B)
- Políticas: grace period, soft lock, hard lock

---

## 8) Checklist objetivo de validação (MVP completo)
- Performance: budgets implementados + sem regressão grave
- Consentimento: banner + bloqueio real
- Mensuração: eventos canônicos + anti-duplicação
- GA4/Ads/Pixels: conversões e parâmetros mínimos
- SEO técnico: sitemap/robots/canonical/redirects/schema
- Operação: multi-tenant + RBAC + auditoria
- Domínios: SSL e roteamento por cliente
- Templates: 5 completos + page templates + blocos mínimos
- Footer mobile: regras + eventos + sem CLS
- Billing/dunning: webhooks + cadência + idempotência + política de acesso


---

## CI/CD (GitHub Actions)
Detalhes completos: `docs/APPENDIX_I_GITHUB_ACTIONS_CICD.md`.
