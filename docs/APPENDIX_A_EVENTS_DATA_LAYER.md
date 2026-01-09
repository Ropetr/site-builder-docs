
# APPENDIX A — Eventos e Data Layer

## A.1 Objetivo
Padronizar eventos e parâmetros para GA4/GTM/Ads/Pixels, com anti-duplicação e governança.

## A.2 Convenções
- snake_case para nomes
- parâmetros tipados
- idempotência por ação do usuário
- separar micro x macro conversões

## A.3 Eventos canônicos (MVP)
### Base (todos)
- page_view
- click_cta (genérico)
- generate_lead (macro)
- contact (macro)

### Footer mobile
- click_call
- click_whatsapp
- click_directions

### Shop (e-commerce)
- view_item
- add_to_cart
- begin_checkout
- purchase

## A.4 Parâmetros mínimos por evento
### Obrigatórios (todos)
- event (string)
- page_path (string)
- device (enum: mobile|tablet|desktop)
- timestamp_ms (int)

### Recomendados (quando houver)
- label (string)
- utm_source, utm_medium, utm_campaign, utm_term, utm_content (string)

### Shop (obrigatórios adicionais)
- currency (string, ex: BRL)
- value (number)
- items (array) com:
  - item_id (string)
  - item_name (string)
  - price (number)
  - quantity (int)

## A.5 Exemplos de payload (dataLayer)
```js
window.dataLayer = window.dataLayer || [];
window.dataLayer.push({
  event: "click_whatsapp",
  page_path: "/servicos/ar-condicionado",
  label: "WhatsApp Footer",
  device: "mobile",
  utm_source: "google",
  utm_campaign: "campanha_x",
  timestamp_ms: 1736390000000
});
```

## A.6 Regras anti-duplicação
- page_view: 1x por navegação (SPA deve controlar via router)
- cliques: debounce para evitar duplo envio
- generate_lead: deve disparar apenas após sucesso de envio (HTTP 2xx) e nunca no submit inicial

## A.7 Micro x Macro
- Micro: click_whatsapp, click_call, click_directions, add_to_cart
- Macro: generate_lead, purchase
