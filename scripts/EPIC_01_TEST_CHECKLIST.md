# EPIC 01 - Checklist de Testes: Billing e Entitlements

## 📋 Pré-requisitos

- [ ] Executar `scripts/EPIC_01_CREATE_TABLES.sql` no Supabase
- [ ] Configurar variáveis de ambiente:
  - [ ] `STRIPE_SECRET_KEY` (no Supabase Secrets ou Vercel)
  - [ ] `STRIPE_WEBHOOK_SECRET` (no Supabase Secrets ou Vercel)
  - [ ] `STRIPE_PRICE_DIRECTORY` (Price ID do Stripe)
  - [ ] `STRIPE_PRICE_DIRECTORY_ACADEMY` (Price ID do Stripe)
  - [ ] `STRIPE_PRICE_PREMIUM` (Price ID do Stripe)
  - [ ] `APP_BASE_URL` (URL da aplicação)
- [ ] Criar Products e Prices no Stripe Dashboard
- [ ] Configurar webhook endpoint no Stripe:
  - [ ] URL: `https://[seu-projeto].supabase.co/functions/v1/stripe-webhook`
  - [ ] Eventos: `checkout.session.completed`, `customer.subscription.*`, `invoice.*`
- [ ] Deploy das Edge Functions:
  - [ ] `supabase functions deploy stripe-webhook`
  - [ ] `supabase functions deploy create-checkout`
  - [ ] `supabase functions deploy sync-subscription`

---

## ✅ Teste 1: Compra de Assinatura (Fluxo Feliz)

### Objetivo
Verificar que o fluxo completo de compra funciona: checkout → webhook → entitlements liberados.

### Passos
1. [ ] Fazer login como usuário COMPANY
2. [ ] Acessar `/planos`
3. [ ] Selecionar plano "Diretório" (R$ 49,90)
4. [ ] Clicar em "Assinar Agora"
5. [ ] Verificar redirecionamento para Stripe Hosted Checkout
6. [ ] Completar pagamento no Stripe (usar cartão de teste: `4242 4242 4242 4242`)
7. [ ] Verificar redirecionamento de volta para `/dashboard?session_id=xxx&success=true`
8. [ ] Verificar mensagem de sucesso na página
9. [ ] Aguardar 2-5 segundos para webhook processar

### Validações no Banco
```sql
-- Verificar subscription criada
SELECT * FROM subscriptions WHERE profile_id = '[user_id]';
-- Deve ter: status = 'active', plan_key = 'directory'

-- Verificar entitlements
SELECT * FROM entitlements WHERE profile_id = '[user_id]';
-- Deve ter: directory_access = TRUE, academy_access = FALSE

-- Verificar webhook processado
SELECT * FROM webhook_events WHERE subscription_id = '[stripe_subscription_id]';
-- Deve ter registro com success = TRUE
```

### Validações no Frontend
- [ ] Componente `SubscriptionStatus` mostra "Assinatura Ativa"
- [ ] Badge "Diretório" aparece nos acessos ativos
- [ ] Próxima renovação exibida corretamente

### Resultado Esperado
✅ Subscription criada, entitlements liberados, acesso funcionando

---

## ✅ Teste 2: Upgrade de Plano

### Objetivo
Verificar que upgrade de plano atualiza entitlements corretamente.

### Passos
1. [ ] Ter subscription ativa do plano "Diretório"
2. [ ] Acessar `/planos`
3. [ ] Selecionar plano "Premium"
4. [ ] Clicar em "Fazer Upgrade"
5. [ ] Completar checkout no Stripe
6. [ ] Aguardar webhook processar

### Validações
```sql
-- Verificar subscription atualizada
SELECT plan_key, status FROM subscriptions WHERE profile_id = '[user_id]';
-- Deve ter: plan_key = 'premium'

-- Verificar entitlements atualizados
SELECT * FROM entitlements WHERE profile_id = '[user_id]';
-- Deve ter: directory_access = TRUE, academy_access = TRUE, 
--           premium_discounts = TRUE, basic_site_included = TRUE
```

### Resultado Esperado
✅ Todos os entitlements do plano Premium liberados

---

## ✅ Teste 3: Cancelamento de Assinatura

### Objetivo
Verificar que cancelamento revoga entitlements.

### Passos
1. [ ] Ter subscription ativa
2. [ ] Cancelar subscription no Stripe Dashboard (ou via API)
3. [ ] Aguardar webhook `customer.subscription.deleted` processar

### Validações
```sql
-- Verificar subscription cancelada
SELECT status, canceled_at FROM subscriptions WHERE profile_id = '[user_id]';
-- Deve ter: status = 'canceled', canceled_at preenchido

-- Verificar entitlements revogados
SELECT * FROM entitlements WHERE profile_id = '[user_id]';
-- Deve ter: todos os campos = FALSE
```

### Validações no Frontend
- [ ] `SubscriptionStatus` mostra "Assinatura Cancelada"
- [ ] Features protegidas não são mais acessíveis

### Resultado Esperado
✅ Entitlements revogados, acesso bloqueado

---

## ✅ Teste 4: Falha de Pagamento (Past Due)

### Objetivo
Verificar grace period de 7 dias para pagamentos falhos.

### Passos
1. [ ] Ter subscription ativa
2. [ ] Simular falha de pagamento no Stripe (usar cartão que falha)
3. [ ] Aguardar webhook `invoice.payment_failed` processar

### Validações
```sql
-- Verificar status
SELECT status FROM subscriptions WHERE profile_id = '[user_id]';
-- Deve ter: status = 'past_due'

-- Verificar entitlements mantidos (grace period)
SELECT * FROM entitlements WHERE profile_id = '[user_id]';
-- Deve ter: entitlements ainda TRUE (não revogados imediatamente)
```

### Validações no Frontend
- [ ] `SubscriptionStatus` mostra aviso de pagamento pendente
- [ ] Acesso ainda funciona (grace period)

### Resultado Esperado
✅ Status `past_due`, mas entitlements mantidos por 7 dias

---

## ✅ Teste 5: Sincronização Manual

### Objetivo
Verificar que botão "Sincronizar" corrige inconsistências.

### Cenário de Teste
1. [ ] Ter subscription ativa no Stripe
2. [ ] Manualmente alterar `status` no DB para 'canceled' (simular inconsistência)
3. [ ] Acessar `/dashboard`
4. [ ] Clicar em "Sincronizar" no componente `SubscriptionStatus`
5. [ ] Aguardar resposta

### Validações
```sql
-- Verificar status corrigido
SELECT status FROM subscriptions WHERE profile_id = '[user_id]';
-- Deve ter: status = 'active' (corrigido do Stripe)
```

### Resultado Esperado
✅ Status sincronizado com Stripe, inconsistência corrigida

---

## ✅ Teste 6: Idempotência do Webhook

### Objetivo
Verificar que webhook não processa o mesmo evento duas vezes.

### Passos
1. [ ] Processar um evento webhook (ex: `checkout.session.completed`)
2. [ ] Verificar registro em `webhook_events`
3. [ ] Reenviar o mesmo evento do Stripe (via Dashboard → Replay Event)
4. [ ] Verificar logs do webhook

### Validações
```sql
-- Verificar que evento foi registrado apenas uma vez
SELECT COUNT(*) FROM webhook_events WHERE stripe_event_id = '[event_id]';
-- Deve retornar: 1

-- Verificar que subscription não foi duplicada
SELECT COUNT(*) FROM subscriptions WHERE stripe_subscription_id = '[sub_id]';
-- Deve retornar: 1
```

### Resultado Esperado
✅ Evento processado apenas uma vez, sem duplicações

---

## ✅ Teste 7: Gating de Features (ProtectedFeature)

### Objetivo
Verificar que componentes protegidos bloqueiam acesso sem entitlement.

### Passos
1. [ ] Usuário sem subscription ativa
2. [ ] Tentar acessar feature protegida (ex: `/academy` - se existir)
3. [ ] Verificar que componente `ProtectedFeature` mostra prompt de upgrade
4. [ ] Clicar em "Ver Planos"
5. [ ] Verificar redirecionamento para `/planos?upgrade=true`

### Validações no Código
- [ ] `useEntitlements()` retorna `academyAccess: false`
- [ ] `ProtectedFeature` renderiza fallback, não o conteúdo protegido

### Resultado Esperado
✅ Acesso bloqueado, prompt de upgrade exibido

---

## ✅ Teste 8: Múltiplas Subscriptions (Histórico)

### Objetivo
Verificar que histórico de subscriptions é mantido.

### Passos
1. [ ] Criar subscription "Diretório"
2. [ ] Cancelar
3. [ ] Criar nova subscription "Premium"
4. [ ] Verificar que ambas existem no DB

### Validações
```sql
-- Verificar histórico
SELECT plan_key, status, created_at FROM subscriptions 
WHERE profile_id = '[user_id]' 
ORDER BY created_at DESC;
-- Deve ter: 2 registros (1 canceled, 1 active)
```

### Resultado Esperado
✅ Histórico mantido, apenas subscription ativa usada para entitlements

---

## ✅ Teste 9: Segurança RLS

### Objetivo
Verificar que RLS impede acesso não autorizado.

### Passos
1. [ ] Fazer login como User A
2. [ ] Tentar acessar entitlements de User B via query direta
3. [ ] Verificar que RLS bloqueia

### Validações
```sql
-- Como User A, tentar ler entitlements de User B
SET LOCAL request.jwt.claim.sub = '[user_a_id]';
SELECT * FROM entitlements WHERE profile_id = '[user_b_id]';
-- Deve retornar: vazio (RLS bloqueia)
```

### Resultado Esperado
✅ RLS funciona, usuários só veem seus próprios dados

---

## ✅ Teste 10: Checkout Cancelado

### Objetivo
Verificar tratamento quando usuário cancela checkout.

### Passos
1. [ ] Iniciar checkout
2. [ ] Clicar em "Voltar" ou fechar janela do Stripe
3. [ ] Verificar redirecionamento para `/planos?canceled=true`
4. [ ] Verificar mensagem de erro exibida

### Validações
- [ ] Nenhuma subscription criada no DB
- [ ] Mensagem "Checkout cancelado" exibida
- [ ] Usuário pode tentar novamente

### Resultado Esperado
✅ Cancelamento tratado graciosamente, sem dados residuais

---

## 🔍 Testes de Carga e Edge Cases

### Teste 11: Webhook com Dados Inválidos
- [ ] Enviar webhook com `subscription_id` inexistente
- [ ] Verificar que erro é logado, mas não quebra o sistema

### Teste 12: Race Condition (Múltiplos Webhooks Simultâneos)
- [ ] Enviar 3 webhooks do mesmo evento simultaneamente
- [ ] Verificar que apenas 1 é processado (idempotência)

### Teste 13: Customer sem Profile
- [ ] Criar customer no Stripe sem `metadata.profile_id`
- [ ] Verificar que webhook trata erro graciosamente

### Teste 14: Price ID Desconhecido
- [ ] Usar Price ID não mapeado em `PRICE_TO_PLAN_MAP`
- [ ] Verificar que erro é logado e webhook retorna 500

---

## 📊 Métricas de Sucesso

Após todos os testes, verificar:

- [ ] Taxa de sucesso de webhooks > 99%
- [ ] Tempo médio de liberação após pagamento < 30 segundos
- [ ] Zero duplicações de subscriptions
- [ ] Zero acessos não autorizados (RLS funcionando)
- [ ] Todos os entitlements corretos para cada plano

---

## 🐛 Troubleshooting

### Webhook não processa
- Verificar `STRIPE_WEBHOOK_SECRET` está correto
- Verificar URL do webhook no Stripe Dashboard
- Verificar logs da Edge Function: `supabase functions logs stripe-webhook`

### Entitlements não atualizam
- Verificar função SQL `sync_entitlements_from_subscription` existe
- Verificar RLS permite service role atualizar
- Usar botão "Sincronizar" manualmente

### Checkout não redireciona
- Verificar `APP_BASE_URL` está correto
- Verificar `success_url` e `cancel_url` no código
- Verificar CORS nas Edge Functions

---

**Última atualização:** Janeiro 2025  
**Versão:** 1.0.0
