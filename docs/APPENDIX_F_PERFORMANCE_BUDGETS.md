
# APPENDIX F — Performance Budgets (PageSpeed) e Guardrails

## F.1 Objetivo
Garantir sites rápidos por padrão (Core Web Vitals “good”) via budgets e limites no editor.

## F.2 Budgets sugeridos (MVP)
Defina budgets por plano (valores exemplificativos; ajuste conforme stack):

### Start
- JS inicial total: <= 250 KB (gzip)
- Scripts third-party: <= 3
- Fontes: <= 2 famílias, <= 4 weights
- Imagem hero: preload + tamanho adequado

### Growth/Shop
- JS inicial total: <= 350 KB (gzip)
- Scripts third-party: <= 6

### Agency
- pode ampliar budgets, mas com alertas e score

## F.3 Regras no editor (guardrails)
- Ao adicionar script/app:
  - mostrar impacto estimado (score)
  - alertar ao exceder budgets
  - bloquear (opcional) em planos inferiores
- Upload de imagens:
  - gerar variantes (mobile/desktop)
  - entregar WebP/AVIF quando suportado
  - lazy-load por padrão

## F.4 Footer mobile (regras de performance)
- SVG inline (sem libs)
- carregar apenas em mobile
- reservar altura para evitar CLS
- ocultar ao abrir teclado

## F.5 Checklist performance por publish
- validar budgets
- validar número de requests críticos
- validar tamanho de imagens acima da dobra
- emitir relatório para auditoria
