# PragHub — Dev Prompts por EPIC (Cursor-ready)

> Objetivo: permitir abrir um chat por EPIC no Cursor e implementar com consistência.
> Fonte de verdade: RELATORIO_COMPLETO.md

---

## Prompt Base (use sempre)
Você é um engenheiro full-stack sênior. Trabalhe com o projeto PragHub (React + Vite + Tailwind + Supabase).
Respeite o relatório RELATORIO_COMPLETO.md como fonte de verdade para rotas, DB e problemas conhecidos.
Priorize mudanças mínimas, seguras e incrementalmente testáveis.
Sempre entregue:
1) Plano curto
2) Lista de arquivos/tabelas afetados
3) Implementação sugerida
4) Checklist de testes manuais
5) Pontos de risco e mitigação

---

## EPIC 00 — Core Fixes & Launch Readiness
### Prompt
Implemente o EPIC 00. Foque em corrigir RLS e garantir que:
- Anônimo vê companies com status='APPROVED' no /demonstracao
- Dono (COMPANY) vê sua empresa (mesmo se PENDING) no /dashboard
- ADMIN vê tudo no /admin
Além disso, trate empresas migradas com owner_id NULL para que NÃO sumam do diretório se APPROVED.
Introduza suporte a slug (nullable) sem quebrar rotas UUID existentes.

Entregue:
- Ajustes SQL (policies/triggers/indices) e onde aplicar
- Ajustes no front para queries mais robustas
- Plano de validação com usuários anon, company e admin

---

## EPIC 01 — Billing + Planos + Entitlements (Stripe)
### Prompt
Implemente o EPIC 01 usando Stripe Hosted Checkout e webhooks.
Crie modelo de dados no Supabase:
- subscriptions (profile_id, stripe_customer_id, stripe_subscription_id, status, plan_key, current_period_end)
- entitlements (profile_id, directory_access, academy_access, premium_discounts, basic_site_included)

Implemente:
- Página de planos
- Criação de checkout session
- Webhook para atualizar subscriptions + entitlements automaticamente
- Hook useEntitlements() e gating de UI/rotas

Requisitos:
- Não confiar só em role, sempre usar entitlements
- Falha em webhook deve ter caminho de "sync/refresh status" manual no app

---

## EPIC 02 — Diretório (Plano 1) + Perfil Público Forte
### Prompt
Implemente melhorias de diretório e perfil público:
- SEO básico por empresa
- Melhoria dos cards e CTA WhatsApp
- Métricas: incrementar profile_views ao abrir perfil e whatsapp_clicks ao clicar no CTA
- Garantir que RLS não bloqueie atualização dessas métricas (sem abrir brechas)

Se possível:
- Introduzir slug progressivo (sem quebrar UUID)
- Melhorar filtros em /demonstracao (cidade/serviços/premium)

---

## EPIC 03 — Academia (Portal de Vídeos) — Caminho A
### Prompt
Implemente a Academia com hospedagem externa de vídeo (embed_url), gated por entitlement academy_access.
Criar tabelas:
- academy_videos (title, description, embed_url, track, order, is_published)

Criar rotas:
- /academy (lista)
- /academy/:id (player)

Regras:
- Plano 2 e 3 acessam (academy_access=true)
- Plano 1 vê bloqueio com CTA de upgrade

Entregar também:
- Seed inicial de vídeos (placeholder)
- UI consistente com design atual

---

## EPIC 04 — Premium: Cupom Loja + Pipeline Site Básico
### Prompt
Implemente benefícios Premium:
A) Cupom:
- tabela discount_coupons (profile_id, code, status, created_at, used_at, provider)
- UI /beneficios (gerar/ver/copiar cupom)
- Somente premium_discounts=true pode gerar
- Regra simples: 1 cupom ativo por profile (idempotente)

B) Site Básico:
- tabela basic_site_requests (company_id, status, briefing_json, created_at, updated_at)
- Form de briefing no app
- Admin vê lista e atualiza status

---

## EPIC 05 — Loja Externa Integrada por Cupom
### Prompt
Prepare integração mínima com loja externa:
- Link "Loja" no dashboard
- Página de instruções (como usar cupom premium)
- Garantir que cupom premium é mostrado apenas para usuários Premium

Sem SSO no lançamento. Integração somente via cupom.