# EPIC 01 - Price IDs Configurados

## ✅ Price IDs do Stripe (Janeiro 2025)

### Mapeamento Completo

| Plano | Plan Key | Price ID | Valor | Product ID |
|-------|----------|----------|-------|------------|
| **Diretório** | `directory` | `price_1Sp9iDJULNOvBzJ4rHEy276L` | R$ 149,00 | `prod_TmjATzLyvp3Fuc` |
| **Diretório + Academia** | `directory_academy` | `price_1Sp9irJULNOvBzJ4peDiLsfv` | R$ 249,00 | `prod_TmjB1LwAxfW5VW` |
| **Premium** | `premium` | `price_1Sp9kcJULNOvBzJ492cQGIWE` | R$ 479,00 | `prod_TmjCd15ymEboB8` |

---

## 🔧 Configuração de Secrets

Execute estes comandos para configurar os secrets no Supabase:

```bash
supabase secrets set STRIPE_PRICE_DIRECTORY=price_1Sp9iDJULNOvBzJ4rHEy276L
supabase secrets set STRIPE_PRICE_DIRECTORY_ACADEMY=price_1Sp9irJULNOvBzJ4peDiLsfv
supabase secrets set STRIPE_PRICE_PREMIUM=price_1Sp9kcJULNOvBzJ492cQGIWE
```

---

## 📝 Onde os Price IDs são usados

### 1. Edge Function: `create-checkout`
- Usa variáveis de ambiente (via secrets)
- Mapeamento: `PLAN_TO_PRICE_MAP`

### 2. Edge Function: `stripe-webhook`
- Mapeamento hardcoded: `PRICE_TO_PLAN_MAP`
- ✅ **ATUALIZADO** com Price IDs reais

### 3. Edge Function: `sync-subscription`
- Mapeamento hardcoded: `PRICE_TO_PLAN_MAP`
- ✅ **ATUALIZADO** com Price IDs reais

### 4. Frontend: `Planos.tsx`
- Preços exibidos na UI
- ✅ **ATUALIZADO** para corresponder aos valores reais

---

## ⚠️ Nota sobre Preços

Os preços atuais no Stripe são:
- Diretório: **R$ 149,00** (não R$ 49,90)
- Diretório + Academia: **R$ 249,00** (não R$ 99,90)
- Premium: **R$ 479,00** (não R$ 149,90)

Se você quiser usar os preços originais (R$ 49,90, R$ 99,90, R$ 149,90), você precisa:
1. Criar novos Prices no Stripe com os valores corretos
2. Atualizar os Price IDs neste documento e no código

---

## 🔄 Como Atualizar

Se você criar novos Prices no Stripe:

1. Atualizar este arquivo com os novos Price IDs
2. Atualizar `stripe-webhook/index.ts`: `PRICE_TO_PLAN_MAP`
3. Atualizar `sync-subscription/index.ts`: `PRICE_TO_PLAN_MAP`
4. Atualizar `pages/Planos.tsx`: valores e `priceId`
5. Configurar novos secrets:
   ```bash
   supabase secrets set STRIPE_PRICE_DIRECTORY=novo_price_id
   supabase secrets set STRIPE_PRICE_DIRECTORY_ACADEMY=novo_price_id
   supabase secrets set STRIPE_PRICE_PREMIUM=novo_price_id
   ```
6. Redeploy das Edge Functions

---

**Última atualização:** Janeiro 2025  
**Versão:** 1.0.0
