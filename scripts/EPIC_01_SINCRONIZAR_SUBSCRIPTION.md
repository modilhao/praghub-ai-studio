# EPIC 01 - Como Sincronizar Subscription Manualmente

## 🔴 Problema

Após completar o pagamento no Stripe, o dashboard mostra "Nenhuma assinatura ativa" porque:
- O webhook do Stripe pode levar alguns segundos para processar
- O webhook pode não estar configurado ainda
- A subscription foi criada no Stripe mas não foi sincronizada no Supabase

---

## ✅ Soluções

### Solução 1: Botão "Sincronizar" no Dashboard (Recomendado)

O componente `SubscriptionStatus` agora tem um botão "Sincronizar" que:
1. Chama a Edge Function `sync-subscription`
2. Busca a subscription mais recente do Stripe
3. Atualiza o banco de dados local
4. Atualiza os entitlements

**Como usar:**
1. Acesse o dashboard: `http://localhost:3000/#/dashboard`
2. Na seção "Nenhuma assinatura ativa", clique em **"Sincronizar"**
3. Aguarde alguns segundos
4. A subscription deve aparecer

### Solução 2: Verificar Webhook

Se o botão não funcionar, verifique se o webhook está configurado:

1. **Acesse:** https://dashboard.stripe.com/test/webhooks
2. **Verifique** se há um endpoint configurado para:
   ```
   https://nkbcpwbgvesbkaebmkkw.supabase.co/functions/v1/stripe-webhook
   ```
3. **Eventos necessários:**
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`

### Solução 3: Verificar Logs do Webhook

1. **Acesse:** Supabase Dashboard → Edge Functions → stripe-webhook → Logs
2. **Verifique** se há erros recentes
3. **Verifique** se os eventos estão sendo processados

### Solução 4: Verificar Subscription no Stripe

1. **Acesse:** https://dashboard.stripe.com/test/subscriptions
2. **Verifique** se a subscription foi criada
3. **Anote** o `subscription_id` (começa com `sub_...`)

### Solução 5: Verificar Banco de Dados

Execute no SQL Editor do Supabase:

```sql
-- Verificar subscriptions
SELECT * FROM subscriptions 
WHERE profile_id = 'SEU_PROFILE_ID_AQUI'
ORDER BY created_at DESC;

-- Verificar entitlements
SELECT * FROM entitlements 
WHERE profile_id = 'SEU_PROFILE_ID_AQUI';

-- Verificar webhook events processados
SELECT * FROM webhook_events 
ORDER BY created_at DESC 
LIMIT 10;
```

---

## 🔧 Configurar Webhook (Se não estiver configurado)

### 1. Criar Webhook no Stripe

1. Acesse: https://dashboard.stripe.com/test/webhooks
2. Clique em **"Add endpoint"**
3. URL: `https://nkbcpwbgvesbkaebmkkw.supabase.co/functions/v1/stripe-webhook`
4. Eventos a selecionar:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Clique em **"Add endpoint"**

### 2. Configurar Webhook Secret

1. Após criar o webhook, copie o **Signing secret** (começa com `whsec_...`)
2. Configure como secret:
   ```bash
   supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_...
   ```
3. Redeploy do webhook:
   ```bash
   supabase functions deploy stripe-webhook
   ```

### 3. Testar Webhook

1. No Stripe Dashboard, vá em **Webhooks** → Seu endpoint
2. Clique em **"Send test webhook"**
3. Selecione `checkout.session.completed`
4. Verifique os logs no Supabase

---

## 📋 Checklist de Diagnóstico

Se a subscription não aparece após sincronizar:

- [ ] Subscription existe no Stripe Dashboard
- [ ] Webhook está configurado no Stripe
- [ ] `STRIPE_WEBHOOK_SECRET` está configurado no Supabase
- [ ] Edge Function `stripe-webhook` está deployada
- [ ] Tabelas `subscriptions` e `entitlements` existem
- [ ] RLS permite service role criar/atualizar
- [ ] Função SQL `sync_entitlements_from_subscription` existe

---

## 🧪 Teste Completo

1. **Faça um novo pagamento de teste**
2. **Aguarde 5-10 segundos** (webhook pode levar tempo)
3. **Clique em "Sincronizar"** no dashboard
4. **Verifique** se a subscription aparece

Se ainda não funcionar:
1. Verifique logs do webhook no Supabase
2. Verifique logs da Edge Function `sync-subscription`
3. Execute as queries SQL acima para verificar o banco

---

**Data:** Janeiro 2025
