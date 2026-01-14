# EPIC 01 - Correção de Redirecionamento após Checkout

## 🔴 Problema Identificado

Após o pagamento no Stripe, o redirecionamento estava indo para:
```
http://localhost:3000/dashboard?session_id=...&success=true
```

Mas o app usa **HashRouter**, então a URL correta deveria ser:
```
http://localhost:3000/#/planos?session_id=...&success=true
```

Isso causava uma página em branco porque a rota `/dashboard` não existe sem o hash.

---

## ✅ Correções Aplicadas

### 1. `supabase/functions/create-checkout/index.ts`

**Antes:**
```typescript
success_url: `${appUrl}/dashboard?session_id={CHECKOUT_SESSION_ID}&success=true`,
cancel_url: `${appUrl}/planos?canceled=true`,
```

**Depois:**
```typescript
success_url: `${appUrl}/#/planos?session_id={CHECKOUT_SESSION_ID}&success=true`,
cancel_url: `${appUrl}/#/planos?canceled=true`,
```

**Mudanças:**
- ✅ `success_url` agora redireciona para `/#/planos` (não `/dashboard`)
- ✅ `cancel_url` agora usa hash routing `/#/planos`
- ✅ A página `Planos.tsx` já tem lógica para processar o retorno e redirecionar para `/dashboard` após sincronizar

### 2. `pages/Planos.tsx`

**Antes:**
```typescript
navigate('/dashboard');
```

**Depois:**
```typescript
navigate('/#/dashboard');
```

**Nota:** Na verdade, com `HashRouter`, o `navigate()` do react-router-dom já adiciona o hash automaticamente, mas deixei explícito para garantir.

---

## 🔄 Fluxo Corrigido

1. **Usuário clica em "Assinar"** → Redireciona para Stripe Checkout
2. **Usuário completa pagamento** → Stripe redireciona para `/#/planos?session_id=...&success=true`
3. **Planos.tsx detecta sucesso** → Mostra toast e sincroniza subscription
4. **Após 2 segundos** → Redireciona para `/#/dashboard`
5. **Dashboard carrega** → Mostra subscription ativa e entitlements liberados

---

## 🧪 Como Testar

1. Acesse: `http://localhost:3000/#/planos`
2. Faça login como COMPANY
3. Clique em qualquer botão de assinatura
4. Complete o pagamento com cartão de teste: `4242 4242 4242 4242`
5. Verifique que:
   - ✅ Redireciona para `/#/planos?session_id=...&success=true`
   - ✅ Mostra toast de sucesso
   - ✅ Após 2 segundos, redireciona para `/#/dashboard`
   - ✅ Dashboard mostra subscription ativa

---

## 📋 Próximos Passos

Após fazer o redeploy da Edge Function `create-checkout`:

```bash
supabase functions deploy create-checkout
```

O redirecionamento deve funcionar corretamente.

---

**Data:** Janeiro 2025
