# EPIC 01 - Diagnóstico Completo

## ✅ Verificações Realizadas

### Stripe (via MCP)
- ✅ Conta Stripe ativa: `acct_1HCPguJULNOvBzJ4`
- ✅ Products criados:
  - Diretório PragHub: `prod_TmjATzLyvp3Fuc`
  - Diretório + Academia PragHub: `prod_TmjB1LwAxfW5VW`
  - Premium PragHub: `prod_TmjCd15ymEboB8`

### Prices Identificados
⚠️ **ATENÇÃO:** Os preços no Stripe estão diferentes dos esperados!

| Plano | Price ID | Valor no Stripe | Valor Esperado | Status |
|-------|----------|-----------------|----------------|--------|
| Diretório | `price_1Sp9iDJULNOvBzJ4rHEy276L` | R$ 149,00 | R$ 49,90 | ⚠️ Diferente |
| Diretório + Academia | `price_1Sp9irJULNOvBzJ4peDiLsfv` | R$ 249,00 | R$ 99,90 | ⚠️ Diferente |
| Premium | `price_1Sp9kcJULNOvBzJ492cQGIWE` | R$ 479,00 | R$ 149,90 | ⚠️ Diferente |

---

## 🔴 Problemas Identificados

### 1. Price IDs não mapeados no código
- ❌ `create-checkout/index.ts`: Usa variáveis de ambiente (correto, mas precisa configurar)
- ❌ `stripe-webhook/index.ts`: Mapeamento hardcoded com placeholders

### 2. Preços inconsistentes
- ❌ Página `Planos.tsx` mostra valores diferentes dos Price IDs do Stripe
- ⚠️ Decisão necessária: Atualizar código para valores reais OU criar novos Prices no Stripe

### 3. Tabelas do Supabase
- ⚠️ Não verificado ainda (precisa verificar via SQL)

### 4. Secrets do Supabase
- ⚠️ Não verificado ainda (precisa verificar via CLI)

---

## 📋 Plano de Ação

### Fase 1: Corrigir Mapeamento de Price IDs
1. Atualizar `stripe-webhook/index.ts` com Price IDs reais
2. Criar documento com Price IDs para configuração de secrets
3. Decidir sobre preços (usar valores reais ou criar novos)

### Fase 2: Verificar Supabase
1. Verificar se tabelas existem
2. Verificar RLS
3. Verificar secrets configurados

### Fase 3: Atualizar Código
1. Atualizar preços na página Planos.tsx (se necessário)
2. Garantir consistência entre código e Stripe

### Fase 4: Testes
1. Testar criação de checkout
2. Testar webhook
3. Validar fluxo completo

---

**Data:** Janeiro 2025
