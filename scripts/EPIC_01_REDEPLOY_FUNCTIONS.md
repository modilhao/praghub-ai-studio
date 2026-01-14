# EPIC 01 - Redeploy das Edge Functions

## 📋 Edge Functions que Precisam de Redeploy

Você tem **3 Edge Functions** que precisam ser redeployadas:

### 1. `create-checkout`
**O que faz:** Cria sessões de checkout no Stripe  
**Por que precisa redeploy:** 
- ✅ Price IDs atualizados no código
- ✅ Validação de secrets melhorada
- ✅ Usa secrets: `STRIPE_SECRET_KEY`, `STRIPE_PRICE_*`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`

### 2. `stripe-webhook`
**O que faz:** Processa webhooks do Stripe (cria/atualiza subscriptions e entitlements)  
**Por que precisa redeploy:**
- ✅ Price IDs atualizados no mapeamento `PRICE_TO_PLAN_MAP`
- ✅ Usa secrets: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`

### 3. `sync-subscription`
**O que faz:** Sincronização manual de subscription (botão "Sincronizar")  
**Por que precisa redeploy:**
- ✅ Price IDs atualizados no mapeamento `PRICE_TO_PLAN_MAP`
- ✅ Usa secrets: `STRIPE_SECRET_KEY`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`

---

## 🚀 Comandos de Redeploy

Execute **todos** estes comandos (na ordem):

```bash
# 1. create-checkout (cria sessões de checkout)
supabase functions deploy create-checkout

# 2. stripe-webhook (processa eventos do Stripe)
supabase functions deploy stripe-webhook

# 3. sync-subscription (sincronização manual)
supabase functions deploy sync-subscription
```

---

## ✅ Verificar Deploy

Após cada deploy, verifique:

```bash
# Ver logs da função (últimas 50 linhas)
supabase functions logs create-checkout --limit 50
supabase functions logs stripe-webhook --limit 50
supabase functions logs sync-subscription --limit 50

# Ver status das funções
supabase functions list
```

---

## 🔍 Ordem de Importância

Se você quiser fazer deploy incremental para testar:

1. **Primeiro:** `create-checkout` (mais crítico - usado no checkout)
2. **Segundo:** `stripe-webhook` (importante - processa pagamentos)
3. **Terceiro:** `sync-subscription` (menos crítico - apenas para sincronização manual)

---

## ⚠️ Importante

- **Todas as 3 funções** precisam dos secrets configurados antes do deploy
- Se algum secret estiver faltando, a função vai falhar em runtime
- Verifique secrets antes: `supabase secrets list`

---

## 📝 Checklist de Redeploy

- [ ] Secrets configurados (`supabase secrets list`)
- [ ] `create-checkout` deployada
- [ ] `stripe-webhook` deployada
- [ ] `sync-subscription` deployada
- [ ] Logs verificados (sem erros)
- [ ] Teste de checkout funcionando

---

**Última atualização:** Janeiro 2025
