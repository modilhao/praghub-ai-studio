# ✅ Correção: Price IDs de Teste - Resolvido

## 🔴 Problema Identificado

Após o deploy, ao clicar no botão de assinatura, ocorria o erro:

```
Error: No such price: 'price_1Sp9kcJULNOvBzJ492cQGIWE'; 
a similar object exists in live mode, but a test mode key was used to make this request.
```

### Causa
Os **Price IDs configurados eram de PRODUÇÃO (live mode)**, mas a **chave do Stripe é de TESTE (test mode)**.

---

## ✅ Solução Implementada

### 1. Criados Novos Price IDs de Teste

Foram criados novos produtos e prices de teste no Stripe:

| Plano | Product ID (Teste) | Price ID (Teste) | Valor |
|-------|-------------------|------------------|-------|
| **Diretório** | `prod_Tn6b7L064ALyen` | `price_1SpWODJULNOvBzJ47clC2p69` | R$ 149,00 |
| **Diretório + Academia** | `prod_Tn6bnFZhPQYSF8` | `price_1SpWODJULNOvBzJ4uDxuhCN2` | R$ 249,00 |
| **Premium** | `prod_Tn6bEsTemvRh23` | `price_1SpWOEJULNOvBzJ4YYQjYJjO` | R$ 479,00 |

### 2. Secrets Configurados no Supabase

```bash
✅ STRIPE_PRICE_DIRECTORY=price_1SpWODJULNOvBzJ47clC2p69
✅ STRIPE_PRICE_DIRECTORY_ACADEMY=price_1SpWODJULNOvBzJ4uDxuhCN2
✅ STRIPE_PRICE_PREMIUM=price_1SpWOEJULNOvBzJ4YYQjYJjO
```

### 3. Edge Functions Atualizadas e Deployadas

- ✅ `create-checkout` - Deployado (versão atualizada)
- ✅ `stripe-webhook` - Atualizado com novos Price IDs e deployado
- ✅ `sync-subscription` - Atualizado com novos Price IDs e deployado

### 4. Mapeamentos Atualizados

Os mapeamentos `PRICE_TO_PLAN_MAP` foram atualizados em:
- `supabase/functions/stripe-webhook/index.ts`
- `supabase/functions/sync-subscription/index.ts`

**Incluem:**
- ✅ Novos Price IDs de teste (criados hoje)
- ✅ Price IDs de teste antigos (compatibilidade)
- ✅ Price IDs de produção (compatibilidade futura)

---

## 🧪 Como Testar

1. Acesse a página de planos no deploy
2. Faça login como usuário COMPANY
3. Clique em qualquer botão de assinatura
4. Deve redirecionar para Stripe Checkout **sem erros**
5. Use cartão de teste:
   - **Número:** `4242 4242 4242 4242`
   - **Data:** qualquer futura (ex: 12/30)
   - **CVC:** qualquer 3 dígitos (ex: 123)

---

## 📋 Price IDs Configurados (Atual)

### Modo Teste (Atual)
```
STRIPE_PRICE_DIRECTORY=price_1SpWODJULNOvBzJ47clC2p69
STRIPE_PRICE_DIRECTORY_ACADEMY=price_1SpWODJULNOvBzJ4uDxuhCN2
STRIPE_PRICE_PREMIUM=price_1SpWOEJULNOvBzJ4YYQjYJjO
```

### Modo Produção (Para uso futuro)
```
STRIPE_PRICE_DIRECTORY=price_1Sp9iDJULNOvBzJ4rHEy276L
STRIPE_PRICE_DIRECTORY_ACADEMY=price_1Sp9irJULNOvBzJ4peDiLsfv
STRIPE_PRICE_PREMIUM=price_1Sp9kcJULNOvBzJ492cQGIWE
```

---

## 🔄 Para Mudar para Produção (Futuro)

Quando estiver pronto para produção:

1. Obtenha a chave **Live** do Stripe
2. Configure os secrets de produção:
   ```bash
   supabase secrets set STRIPE_SECRET_KEY='sk_live_...' --project-ref nkbcpwbgvesbkaebmkkw
   supabase secrets set STRIPE_PRICE_DIRECTORY='price_1Sp9iDJULNOvBzJ4rHEy276L' --project-ref nkbcpwbgvesbkaebmkkw
   supabase secrets set STRIPE_PRICE_DIRECTORY_ACADEMY='price_1Sp9irJULNOvBzJ4peDiLsfv' --project-ref nkbcpwbgvesbkaebmkkw
   supabase secrets set STRIPE_PRICE_PREMIUM='price_1Sp9kcJULNOvBzJ492cQGIWE' --project-ref nkbcpwbgvesbkaebmkkw
   ```
3. Faça redeploy das Edge Functions

---

## ✅ Status Final

- ✅ Price IDs de teste criados
- ✅ Secrets configurados no Supabase
- ✅ Edge Functions atualizadas e deployadas
- ✅ Mapeamentos incluem todos os Price IDs (teste e produção)
- ✅ Pronto para testar checkout

---

**Data da correção:** Janeiro 2026  
**Script usado:** `scripts/criar-prices-teste-stripe.sh`
