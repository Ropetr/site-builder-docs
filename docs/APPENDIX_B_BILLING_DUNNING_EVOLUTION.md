
# APPENDIX B — Billing recorrente + Dunning (Régua) + Evolution API v1

## B.1 Objetivo
Cobrança recorrente em cartão via gateway (fonte de verdade financeira) com:
- webhooks para sincronização de estado
- régua (dunning) do produto via Evolution API v1 (WhatsApp) + opcional e-mail/in-app
- política de acesso (grace/soft/hard lock)
- idempotência e auditoria

## B.2 Fontes de verdade
- Gateway: status financeiro (invoice/subscription/payment)
- Produto: status de acesso (active/past_due/suspended) baseado em regras

## B.3 Entidades mínimas
- BillingAccount (tenant_id, provider, customer_id, default_payment_method, status)
- Subscription (plan_id, provider_subscription_id, status, current_period_end)
- Invoice (provider_invoice_id, amount, currency, status, due_at)
- DunningStepLog (subscription_id, step_code, sent_at, channel, message_id, status)
- AccessPolicy (plan_id, grace_days, soft_lock_days, hard_lock_days)

## B.4 State machine (assinatura) — interno
- trialing → active → past_due → suspended → canceled
Regras:
- active: pagamento ok
- past_due: falha de pagamento (gateway) e dentro do grace period
- suspended: excedeu hard_lock_days
- canceled: cancelamento manual ou término definitivo no gateway

## B.5 Webhooks mínimos (mapear para seu provider)
- invoice.paid → set active; encerrar régua; reativar acesso
- invoice.payment_failed → set past_due; iniciar régua; aplicar grace
- subscription.canceled → set canceled; hard lock imediato (configurável)
- charge.disputed/charge.refunded (se aplicável) → set past_due/suspended (política)

## B.6 Cadência sugerida de régua (configurável)
- D-3: aviso de renovação
- D-1: lembrete
- D0: renovação hoje
- Falha: imediato (com link atualizar cartão)
- D+1: reforço
- D+3: aviso soft lock
- D+7: hard lock (varia por plano)

## B.7 Política de acesso (exemplo por plano)
- Start: grace 3, soft 5, hard 7
- Growth: grace 5, soft 7, hard 10
- Shop: grace 5, soft 7, hard 10
- Agency: grace 7, soft 10, hard 14

## B.8 Templates de mensagem (WhatsApp)
Variáveis mínimas:
- {nome}, {plano}, {valor}, {vencimento}, {link_pagamento}, {link_atualizar_cartao}, {suporte}

Exemplos (curtos):
1) Aviso falha:
"Não conseguimos renovar seu plano {plano}. Atualize seu cartão: {link_atualizar_cartao}. Se preferir PIX: {link_pagamento}."

2) Soft lock:
"Seu plano {plano} está em atraso. Em {dias} dias alguns recursos serão limitados. Regularize: {link_pagamento}."

## B.9 Idempotência e logs
- Cada etapa da régua possui step_code (ex.: RENEW_D-1, FAIL_IMMEDIATE, SOFT_D+3).
- Não enviar o mesmo step_code para a mesma subscription dentro de uma janela mínima (ex.: 24h), salvo mudança de estado.
- Registrar:
  - payload enviado (sanitizado),
  - response do provider,
  - message_id do Evolution API,
  - status (sent/delivered/failed).

## B.10 Evolution API v1 (envio)
- Implementar um serviço “NotificationService” com drivers:
  - WhatsApp (Evolution API v1)
  - Email (opcional)
  - In-app (opcional)
- Driver WhatsApp deve:
  - validar número (E.164)
  - aplicar rate-limit
  - ter retry com backoff para falhas transitórias
