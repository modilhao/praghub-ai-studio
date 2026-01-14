# PragHub — Pre-Deploy Checklist (Launch)

## A. Supabase (DB / RLS / Auth)
- [ ] RLS habilitado nas tabelas: profiles, companies, leads, services (e novas: subscriptions, entitlements, academy_videos, discount_coupons, basic_site_requests)
- [ ] Políticas RLS revisadas e testadas para:
  - [ ] anon SELECT companies APPROVED
  - [ ] owner SELECT sua company (PENDING/APPROVED)
  - [ ] admin SELECT tudo
- [ ] Executar scripts SQL versionados (ex.: FIX_RLS_POLICIES.sql) e registrar data/commit
- [ ] Índices essenciais:
  - [ ] companies(status), companies(owner_id)
  - [ ] companies(slug) UNIQUE (se introduzido)
  - [ ] subscriptions(profile_id), subscriptions(stripe_subscription_id)
  - [ ] entitlements(profile_id) UNIQUE
- [ ] Trigger handle_new_user() validado (cria profile)
- [ ] Service Role Key guardada com segurança (NUNCA no client)

## B. Stripe (Billing)
- [ ] Products/Prices criados:
  - [ ] Plano 1 — Diretório
  - [ ] Plano 2 — Diretório + Academia
  - [ ] Plano 3 — Premium
- [ ] Webhook endpoint configurado (produção)
- [ ] Eventos mínimos assinados:
  - [ ] checkout.session.completed
  - [ ] customer.subscription.created/updated/deleted
- [ ] Chaves:
  - [ ] STRIPE_SECRET_KEY em env server
  - [ ] STRIPE_WEBHOOK_SECRET em env server
  - [ ] Public key no client se necessário
- [ ] Teste em modo live (ou staging com dados reais) de:
  - [ ] pagamento aprovado → entitlement liberado
  - [ ] cancelamento → entitlement revogado (com grace period se aplicável)
  - [ ] falha no webhook → botão “sincronizar assinatura” funciona

## C. Vercel (Deploy)
- [ ] Variáveis de ambiente no projeto (produção):
  - [ ] VITE_SUPABASE_URL
  - [ ] VITE_SUPABASE_ANON_KEY
  - [ ] STRIPE_SECRET_KEY (server)
  - [ ] STRIPE_WEBHOOK_SECRET (server)
  - [ ] APP_BASE_URL / SITE_URL (conforme uso)
- [ ] Rotas/rewrites para webhook (se usar /api)
- [ ] Build OK (Vite) e sem warnings críticos
- [ ] Cache e headers adequados (não cachear páginas privadas)
- [ ] Domínios:
  - [ ] praghub.com.br
  - [ ] (se usar) app.praghub.com.br / academy.praghub.com.br

## D. Segurança & Acesso
- [ ] Confirmar que entitlements não podem ser alterados pelo client (RLS)
- [ ] Confirmar que rotas protegidas validam sessão + entitlements
- [ ] Rate limit básico em endpoints críticos (webhook e create-checkout)
- [ ] Logs:
  - [ ] registrar falhas de webhook
  - [ ] registrar tentativas inválidas de acesso à academia

## E. QA Rápido (Teste manual — 30 min)
### Usuário anônimo
- [ ] /demonstracao lista empresas aprovadas
- [ ] /company/:id abre perfil
- [ ] CTA WhatsApp funciona

### Usuário COMPANY (Plano 1)
- [ ] cadastro/login ok
- [ ] /dashboard abre
- [ ] consegue editar perfil
- [ ] /academy bloqueado com upgrade

### Usuário COMPANY (Plano 2)
- [ ] /academy acessível e vídeos tocam
- [ ] /beneficios (cupom) bloqueado

### Usuário COMPANY (Plano 3)
- [ ] cupom premium disponível e copiável
- [ ] briefing do site básico disponível e envia request

### ADMIN
- [ ] /admin lista empresas e aprova/rejeita
- [ ] vê requests de site básico