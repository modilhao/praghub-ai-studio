# EPIC 01 - Billing, Planos e Entitlements

## 📋 Visão Geral

Implementação completa de monetização com Stripe e liberação automática de acesso via entitlements.

**Princípios:**
- ✅ Entitlements são a única fonte de verdade para autorização
- ✅ Nunca confiar apenas em role para liberar features
- ✅ Webhooks são idempotentes e seguros
- ✅ Sincronização manual disponível como fallback

---

## 🗂️ Arquivos Criados

### SQL
- `scripts/EPIC_01_CREATE_TABLES.sql` - Criação de tabelas, índices, triggers, RLS e função de sincronização

### TypeScript Types
- `types.ts` - Tipos adicionados: `Subscription`, `Entitlements`, `Plan`, `PlanKey`, `SubscriptionStatus`

### Backend (Supabase Edge Functions)
- `supabase/functions/stripe-webhook/index.ts` - Handler de webhooks do Stripe
- `supabase/functions/create-checkout/index.ts` - Criação de checkout sessions
- `supabase/functions/sync-subscription/index.ts` - Sincronização manual

### Frontend
- `contexts/SubscriptionContext.tsx` - Context para gerenciar estado de subscriptions
- `hooks/useEntitlements()` - Hook para verificar entitlements
- `components/ProtectedFeature.tsx` - Componente de gating de features
- `components/SubscriptionStatus.tsx` - Exibição de status da assinatura
- `pages/Planos.tsx` - Página de seleção de planos
- `lib/subscriptions.ts` - Funções para gerenciar subscriptions
- `lib/stripe-client.ts` - Cliente para chamadas de API do Stripe

### Documentação
- `scripts/EPIC_01_TEST_CHECKLIST.md` - Checklist completo de testes

---

## 🚀 Setup

### 1. Executar SQL

```bash
# No Supabase SQL Editor, executar:
scripts/EPIC_01_CREATE_TABLES.sql
```

### 2. Configurar Stripe

1. Criar Products e Prices no Stripe Dashboard:
   - **Diretório**: R$ 49,90/mês
   - **Diretório + Academia**: R$ 99,90/mês
   - **Premium**: R$ 149,90/mês

2. Anotar os Price IDs (começam com `price_...`)

3. Configurar Webhook:
   - URL: `https://[seu-projeto].supabase.co/functions/v1/stripe-webhook`
   - Eventos:
     - `checkout.session.completed`
     - `customer.subscription.created`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
     - `invoice.payment_succeeded`
     - `invoice.payment_failed`

4. Anotar o Webhook Secret (começa com `whsec_...`)

### 3. Configurar Variáveis de Ambiente

#### Supabase Secrets (para Edge Functions)
```bash
supabase secrets set STRIPE_SECRET_KEY=sk_live_...
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_...
supabase secrets set STRIPE_PRICE_DIRECTORY=price_...
supabase secrets set STRIPE_PRICE_DIRECTORY_ACADEMY=price_...
supabase secrets set STRIPE_PRICE_PREMIUM=price_...
supabase secrets set APP_BASE_URL=https://seu-dominio.com
supabase secrets set SUPABASE_URL=https://[projeto].supabase.co
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

#### Frontend (.env)
```bash
VITE_SUPABASE_URL=https://[projeto].supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
```

### 4. Atualizar Mapeamento de Prices

Editar `supabase/functions/stripe-webhook/index.ts` e `supabase/functions/create-checkout/index.ts`:

```typescript
const PRICE_TO_PLAN_MAP: Record<string, 'directory' | 'directory_academy' | 'premium'> = {
  'price_1234567890': 'directory',           // Substitua pelos seus Price IDs
  'price_0987654321': 'directory_academy',
  'price_1122334455': 'premium',
};
```

### 5. Deploy Edge Functions

```bash
supabase functions deploy stripe-webhook
supabase functions deploy create-checkout
supabase functions deploy sync-subscription
```

### 6. Adicionar SubscriptionProvider ao App

Já foi adicionado em `App.tsx`:

```tsx
<AuthProvider>
  <SubscriptionProvider>
    {/* ... */}
  </SubscriptionProvider>
</AuthProvider>
```

---

## 💻 Uso

### Verificar Entitlements

```tsx
import { useEntitlements } from '../contexts/SubscriptionContext';

function MyComponent() {
  const { academyAccess, premiumDiscounts } = useEntitlements();
  
  if (academyAccess) {
    // Renderizar conteúdo da academia
  }
}
```

### Proteger Features

```tsx
import { ProtectedFeature } from '../components/ProtectedFeature';

<ProtectedFeature 
  requiredEntitlement="academyAccess"
  redirectTo="/planos?upgrade=true"
>
  <AcademyContent />
</ProtectedFeature>
```

### Exibir Status da Assinatura

```tsx
import { SubscriptionStatus } from '../components/SubscriptionStatus';

<SubscriptionStatus />
```

### Criar Checkout

```tsx
import { createCheckoutSession } from '../lib/stripe-client';

const handleSubscribe = async () => {
  const { url } = await createCheckoutSession('premium');
  window.location.href = url; // Redireciona para Stripe
};
```

### Sincronizar Manualmente

```tsx
import { syncSubscription } from '../lib/stripe-client';
import { useSubscription } from '../contexts/SubscriptionContext';

const { refresh } = useSubscription();

const handleSync = async () => {
  await syncSubscription();
  await refresh(); // Atualiza estado local
};
```

---

## 🔄 Fluxo Completo

### Compra
1. Usuário acessa `/planos`
2. Seleciona plano e clica "Assinar"
3. Frontend chama `create-checkout` Edge Function
4. Redireciona para Stripe Hosted Checkout
5. Usuário completa pagamento
6. Stripe redireciona para `/dashboard?session_id=xxx&success=true`
7. Frontend detecta `session_id` e mostra mensagem de sucesso
8. Webhook `checkout.session.completed` é disparado
9. Edge Function processa e atualiza `subscriptions` + `entitlements`
10. Frontend recarrega e mostra acesso liberado

### Cancelamento
1. Usuário cancela no Stripe Dashboard
2. Webhook `customer.subscription.deleted` é disparado
3. Edge Function atualiza `subscriptions.status = 'canceled'`
4. Função SQL `sync_entitlements_from_subscription` revoga todos os entitlements
5. Frontend atualiza e bloqueia acesso

---

## 🛡️ Segurança

### RLS (Row Level Security)
- Usuários só veem suas próprias subscriptions e entitlements
- Service role pode gerenciar tudo (para webhooks)

### Webhook Security
- Validação de assinatura com `STRIPE_WEBHOOK_SECRET`
- Idempotência via tabela `webhook_events`
- Logs de todos os eventos processados

### Frontend Security
- Chaves secretas nunca expostas no client
- Todas as operações sensíveis via Edge Functions
- Verificação de entitlements sempre no backend (não confiar só no frontend)

---

## 🧪 Testes

Ver `scripts/EPIC_01_TEST_CHECKLIST.md` para checklist completo.

**Testes principais:**
1. ✅ Compra de assinatura (fluxo feliz)
2. ✅ Upgrade de plano
3. ✅ Cancelamento
4. ✅ Falha de pagamento (grace period)
5. ✅ Sincronização manual
6. ✅ Idempotência de webhooks
7. ✅ Gating de features
8. ✅ Segurança RLS

---

## 🐛 Troubleshooting

### Webhook não processa
```bash
# Verificar logs
supabase functions logs stripe-webhook

# Verificar webhook secret
supabase secrets list
```

### Entitlements não atualizam
```sql
-- Verificar função existe
SELECT * FROM pg_proc WHERE proname = 'sync_entitlements_from_subscription';

-- Testar manualmente
SELECT sync_entitlements_from_subscription(
  '[profile_id]'::uuid,
  'premium',
  'active'
);
```

### Checkout não redireciona
- Verificar `APP_BASE_URL` está correto
- Verificar CORS nas Edge Functions
- Verificar `success_url` e `cancel_url` no código

---

## 📊 Monitoramento

### Métricas Importantes
- Taxa de sucesso de webhooks (> 99%)
- Tempo médio de liberação após pagamento (< 30s)
- Número de divergências detectadas
- Uso do botão "Sincronizar" (indica problemas)

### Queries Úteis

```sql
-- Subscriptions ativas
SELECT COUNT(*) FROM subscriptions WHERE status = 'active';

-- Entitlements por tipo
SELECT 
  COUNT(*) FILTER (WHERE directory_access) as directory,
  COUNT(*) FILTER (WHERE academy_access) as academy,
  COUNT(*) FILTER (WHERE premium_discounts) as premium
FROM entitlements;

-- Webhooks falhados (últimas 24h)
SELECT * FROM webhook_events 
WHERE success = FALSE 
AND processed_at > NOW() - INTERVAL '24 hours';
```

---

## 🔗 Referências

- [Stripe Webhooks Guide](https://stripe.com/docs/webhooks)
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)
- [Stripe Hosted Checkout](https://stripe.com/docs/payments/checkout)

---

**Última atualização:** Janeiro 2025  
**Versão:** 1.0.0
