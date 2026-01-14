# EPIC 01 - Corrigir Price IDs para Modo Teste

## 🔴 Problema Identificado

**Erro ao clicar em assinatura:**
```
Error: No such price: 'price_1Sp9kcJULNOvBzJ492cQGIWE'; 
a similar object exists in live mode, but a test mode key was used to make this request.
```

### Causa
Os **Price IDs configurados são de PRODUÇÃO (live mode)**, mas a **chave do Stripe é de TESTE (test mode)**.

---

## ✅ Solução

Você tem **2 opções**:

### Opção 1: Criar Novos Price IDs de Teste (Recomendado)

1. Acesse: https://dashboard.stripe.com/test/products
2. Crie 3 produtos novos (ou use os existentes):
   - **Diretório**: R$ 149,00/mês
   - **Diretório + Academia**: R$ 249,00/mês  
   - **Premium**: R$ 479,00/mês
3. Para cada produto, crie um **Price recorrente mensal**
4. Copie os **Price IDs** (começam com `price_...`)
5. Atualize os secrets:
   ```bash
   supabase secrets set STRIPE_PRICE_DIRECTORY=price_XXXXX_TESTE
   supabase secrets set STRIPE_PRICE_DIRECTORY_ACADEMY=price_YYYYY_TESTE
   supabase secrets set STRIPE_PRICE_PREMIUM=price_ZZZZZ_TESTE
   ```
6. Atualize também em `pages/Planos.tsx` (array `PLANS`)

### Opção 2: Usar Chave de Produção (NÃO RECOMENDADO para testes)

⚠️ **ATENÇÃO**: Não use chave de produção em ambiente de desenvolvimento!

Se realmente precisar:
1. Obtenha a chave de produção: https://dashboard.stripe.com/apikeys
2. Configure como secret:
   ```bash
   supabase secrets set STRIPE_SECRET_KEY=sk_live_...
   ```

---

## 📋 Price IDs Atuais (PRODUÇÃO - NÃO FUNCIONAM COM TESTE)

| Plano | Price ID (Produção) | Valor |
|-------|---------------------|-------|
| Diretório | `price_1Sp9iDJULNOvBzJ4rHEy276L` | R$ 149,00 |
| Diretório + Academia | `price_1Sp9irJULNOvBzJ4peDiLsfv` | R$ 249,00 |
| Premium | `price_1Sp9kcJULNOvBzJ492cQGIWE` | R$ 479,00 |

---

## 🔧 Arquivos que Precisam ser Atualizados

Após criar os novos Price IDs de teste:

1. **Secrets do Supabase:**
   ```bash
   supabase secrets set STRIPE_PRICE_DIRECTORY=price_NOVO_TESTE
   supabase secrets set STRIPE_PRICE_DIRECTORY_ACADEMY=price_NOVO_TESTE
   supabase secrets set STRIPE_PRICE_PREMIUM=price_NOVO_TESTE
   ```

2. **`pages/Planos.tsx`:**
   - Atualizar o array `PLANS` com os novos `priceId`

3. **`supabase/functions/stripe-webhook/index.ts`:**
   - Atualizar `PRICE_TO_PLAN_MAP` com os novos Price IDs

4. **`supabase/functions/sync-subscription/index.ts`:**
   - Atualizar `PRICE_TO_PLAN_MAP` com os novos Price IDs

---

## 🧪 Como Verificar se Funcionou

1. Acesse: `http://localhost:3000/#/planos`
2. Faça login como COMPANY
3. Clique em qualquer botão de assinatura
4. Deve redirecionar para Stripe Checkout sem erros
5. Use cartão de teste: `4242 4242 4242 4242`

---

**Data:** Janeiro 2025
