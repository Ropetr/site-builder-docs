
# APPENDIX E — SEO técnico, Schema e Redirects

## E.1 sitemap.xml
Regras:
- incluir apenas páginas indexáveis (não incluir staging ou noindex)
- atualizar automaticamente ao publicar e ao criar/editar slugs
- separar por site (multi-tenant)

## E.2 robots.txt
Regras:
- permitir indexação em produção
- bloquear staging/preview por padrão
- permitir exceções por site (config)

## E.3 Canonical
- toda página publicável deve ter canonical consistente
- ao duplicar páginas, canonical deve apontar para a versão correta

## E.4 noindex
- páginas marcadas como noindex não entram no sitemap
- staging e preview sempre noindex

## E.5 Redirects
- suportar 301/302
- ao alterar slug, criar 301 automático
- evitar chains (A→B→C)

## E.6 Schema (mínimo)
- Organization/LocalBusiness no site (conforme tipo)
- Article em posts
- Product em produtos
- FAQPage quando bloco FAQ habilitado

## E.7 Open Graph / Social meta
- og:title, og:description, og:image, og:url
- imagem social default por site e override por página
