# EPIC 01 - Secrets Prontos para Configurar

## ✅ Informações Coletadas (via MCP Stripe)

### Stripe
- **Account ID:** `acct_1HCPguJULNOvBzJ4`
- **Price IDs Identificados:**
  - Diretório: `price_1Sp9iDJULNOvBzJ4rHEy276L` (R$ 149,00)
  - Diretório + Academia: `price_1Sp9irJULNOvBzJ4peDiLsfv` (R$ 249,00)
  - Premium: `price_1Sp9kcJULNOvBzJ492cQGIWE` (R$ 479,00)

### Supabase
- **Project URL:** `https://nkbcpwbgvesbkaebmkkw.supabase.co`
- **Project Ref:** `nkbcpwbgvesbkaebmkkw`

---

## 🔧 Comandos Prontos para Executar

### Passo 1: Autenticar no Supabase CLI

```bash
supabase login
```

### Passo 2: Linkar ao Projeto

```bash
supabase link --project-ref nkbcpwbgvesbkaebmkkw
```

### Passo 3: Obter Valores que Faltam

#### A) STRIPE_SECRET_KEY
1. Acesse: https://dashboard.stripe.com/apikeys
2. Clique em **"Reveal test key"** (modo teste) ou **"Reveal live key"** (produção)
3. Copie a chave (começa com `sk_test_...` ou `sk_live_...`)

#### B) SUPABASE_SERVICE_ROLE_KEY
1. Acesse: https://app.supabase.com/project/nkbcpwbgvesbkaebmkkw/settings/api
2. Na seção **"Project API keys"**
3. Copie a chave **`service_role`** (secret)
4. ⚠️ **NUNCA exponha no frontend!**

### Passo 4: Configurar Secrets

Execute estes comandos (substitua `SEU_STRIPE_SECRET_KEY` e `SUA_SERVICE_ROLE_KEY`):

```bash
# Price IDs (já identificados)
supabase secrets set STRIPE_PRICE_DIRECTORY=price_1Sp9iDJULNOvBzJ4rHEy276L
supabase secrets set STRIPE_PRICE_DIRECTORY_ACADEMY=price_1Sp9irJULNOvBzJ4peDiLsfv
supabase secrets set STRIPE_PRICE_PREMIUM=price_1Sp9kcJULNOvBzJ492cQGIWE

# URLs e configurações (já identificadas)
supabase secrets set SUPABASE_URL=https://nkbcpwbgvesbkaebmkkw.supabase.co
supabase secrets set APP_BASE_URL=http://localhost:3000

# Valores que você precisa fornecer
supabase secrets set STRIPE_SECRET_KEY=SEU_STRIPE_SECRET_KEY
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=SUA_SERVICE_ROLE_KEY
```

### Passo 5: Verificar

```bash
supabase secrets list
```

Deve mostrar:
```
STRIPE_SECRET_KEY
STRIPE_PRICE_DIRECTORY
STRIPE_PRICE_DIRECTORY_ACADEMY
STRIPE_PRICE_PREMIUM
SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY
APP_BASE_URL
```

### Passo 6: Redeploy das Edge Functions

```bash
supabase functions deploy create-checkout
supabase functions deploy stripe-webhook
supabase functions deploy sync-subscription
```

---

## 🎯 Script Automatizado Alternativo

Se preferir usar o script interativo:

```bash
bash scripts/EPIC_01_CONFIGURAR_SECRETS_AUTOMATICO.sh
```

O script vai pedir os valores que faltam e configurar tudo automaticamente.

---

## 📝 Resumo dos Valores

| Secret | Valor | Status |
|--------|-------|--------|
| `STRIPE_PRICE_DIRECTORY` | `price_1Sp9iDJULNOvBzJ4rHEy276L` | ✅ Pronto |
| `STRIPE_PRICE_DIRECTORY_ACADEMY` | `price_1Sp9irJULNOvBzJ4peDiLsfv` | ✅ Pronto |
| `STRIPE_PRICE_PREMIUM` | `price_1Sp9kcJULNOvBzJ492cQGIWE` | ✅ Pronto |
| `SUPABASE_URL` | `https://nkbcpwbgvesbkaebmkkw.supabase.co` | ✅ Pronto |
| `APP_BASE_URL` | `http://localhost:3000` | ✅ Pronto |
| `STRIPE_SECRET_KEY` | `sk_test_...` ou `sk_live_...` | ⚠️ Você precisa obter |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJ...` | ⚠️ Você precisa obter |
| `STRIPE_WEBHOOK_SECRET` | `whsec_...` | ⚠️ Opcional (depois do webhook) |

---

## 🔗 Links Úteis

- **Stripe API Keys:** https://dashboard.stripe.com/apikeys
- **Supabase API Settings:** https://app.supabase.com/project/nkbcpwbgvesbkaebmkkw/settings/api
- **Stripe Dashboard:** https://dashboard.stripe.com

---

**Última atualização:** Janeiro 2025
