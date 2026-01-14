# EPIC 01 - Guia Rápido: Configurar Secrets

## 📋 Valores Já Identificados

✅ **SUPABASE_URL:** `https://nkbcpwbgvesbkaebmkkw.supabase.co`  
✅ **Price IDs:**
- Diretório: `price_1Sp9iDJULNOvBzJ4rHEy276L`
- Diretório + Academia: `price_1Sp9irJULNOvBzJ4peDiLsfv`
- Premium: `price_1Sp9kcJULNOvBzJ492cQGIWE`

## ⚠️ Valores que Você Precisa Fornecer

1. **STRIPE_SECRET_KEY** - Obter em: https://dashboard.stripe.com/apikeys
   - Reveal test key (modo teste) ou Reveal live key (produção)
   - Começa com `sk_test_...` ou `sk_live_...`

2. **SUPABASE_SERVICE_ROLE_KEY** - Obter em: https://app.supabase.com/project/nkbcpwbgvesbkaebmkkw/settings/api
   - Na seção "Project API keys"
   - Copie a chave `service_role` (secret)
   - ⚠️ NUNCA exponha no frontend!

3. **STRIPE_WEBHOOK_SECRET** (opcional por enquanto)
   - Será necessário após configurar webhook no Stripe
   - Começa com `whsec_...`

---

## 🚀 Opção 1: Script Interativo (Recomendado)

Execute:
```bash
bash scripts/EPIC_01_CONFIGURAR_SECRETS_AUTOMATICO.sh
```

O script vai pedir os valores e configurar automaticamente.

---

## 🚀 Opção 2: Comandos Manuais

Execute um por um (substitua os valores):

```bash
# 1. Autenticar (se ainda não fez)
supabase login

# 2. Linkar ao projeto (se ainda não fez)
supabase link --project-ref nkbcpwbgvesbkaebmkkw

# 3. Configurar secrets
supabase secrets set STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxx
supabase secrets set STRIPE_PRICE_DIRECTORY=price_1Sp9iDJULNOvBzJ4rHEy276L
supabase secrets set STRIPE_PRICE_DIRECTORY_ACADEMY=price_1Sp9irJULNOvBzJ4peDiLsfv
supabase secrets set STRIPE_PRICE_PREMIUM=price_1Sp9kcJULNOvBzJ492cQGIWE
supabase secrets set SUPABASE_URL=https://nkbcpwbgvesbkaebmkkw.supabase.co
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
supabase secrets set APP_BASE_URL=http://localhost:3000
```

---

## ✅ Verificar

```bash
supabase secrets list
```

Deve mostrar todos os secrets configurados.

---

## 🔄 Próximo Passo

Após configurar, faça redeploy das Edge Functions:
```bash
supabase functions deploy create-checkout
supabase functions deploy stripe-webhook
supabase functions deploy sync-subscription
```
