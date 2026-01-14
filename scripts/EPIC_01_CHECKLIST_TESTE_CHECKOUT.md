# EPIC 01 - Checklist de Teste do Checkout

## ✅ Pré-requisitos ANTES de Testar

### 1. Servidor Local DEVE estar rodando

```bash
# Em um terminal, inicie o servidor:
npm run dev

# Aguarde até ver:
# VITE ready in XXX ms
# ➜  Local:   http://localhost:3000/
```

**⚠️ IMPORTANTE:** Mantenha o servidor rodando durante TODO o teste!

### 2. Verificar Configurações

```bash
# Verificar se os secrets estão configurados
supabase secrets list --project-ref nkbcpwbgvesbkaebmkkw

# Deve mostrar:
# - STRIPE_SECRET_KEY
# - STRIPE_PRICE_DIRECTORY
# - STRIPE_PRICE_DIRECTORY_ACADEMY
# - STRIPE_PRICE_PREMIUM
# - SERVICE_ROLE_KEY
# - APP_BASE_URL
```

### 3. Verificar Edge Functions Deployadas

```bash
supabase functions list --project-ref nkbcpwbgvesbkaebmkkw

# Deve mostrar:
# - create-checkout (ACTIVE)
# - stripe-webhook (ACTIVE)
# - sync-subscription (ACTIVE)
```

---

## 🧪 Passo a Passo do Teste

### Passo 1: Preparar Ambiente

1. ✅ Servidor rodando (`npm run dev`)
2. ✅ Browser aberto
3. ✅ Console do browser aberto (F12)

### Passo 2: Acessar Página de Planos

1. Acesse: `http://localhost:3000/#/planos`
2. Verifique que a página carrega corretamente
3. Verifique que os 3 planos estão visíveis

### Passo 3: Fazer Login

1. Se não estiver logado, clique em "Login"
2. Faça login como usuário COMPANY
3. Verifique que retorna para `/planos`

### Passo 4: Iniciar Checkout

1. Clique em qualquer botão "Assinar" ou "Quero começar a aparecer"
2. Verifique que redireciona para Stripe Checkout
3. **NÃO FECHE O SERVIDOR LOCAL!**

### Passo 5: Completar Pagamento

1. No Stripe Checkout, use cartão de teste:
   - **Número:** `4242 4242 4242 4242`
   - **Data:** Qualquer futura (ex: 12/30)
   - **CVC:** Qualquer 3 dígitos (ex: 123)
2. Clique em "Pagar"
3. Aguarde o redirecionamento

### Passo 6: Verificar Redirecionamento

1. ✅ Deve redirecionar para: `http://localhost:3000/#/planos?session_id=...&success=true`
2. ✅ Deve mostrar toast de sucesso
3. ✅ Após 2 segundos, deve redirecionar para `/dashboard`
4. ✅ Dashboard deve mostrar subscription ativa

---

## 🔴 Problemas Comuns e Soluções

### Problema 1: ERR_CONNECTION_REFUSED

**Causa:** Servidor local não está rodando

**Solução:**
```bash
# Inicie o servidor
npm run dev

# Mantenha rodando durante o teste
```

### Problema 2: Página em branco após checkout

**Causa:** URL sem hash ou servidor não rodando

**Solução:**
- Verifique que o servidor está rodando
- Verifique que a URL tem `#` (hash routing)
- Verifique console do browser para erros

### Problema 3: Subscription não aparece no dashboard

**Causa:** Webhook não processou ou sincronização falhou

**Solução:**
1. Verifique logs do webhook no Supabase Dashboard
2. Use botão "Sincronizar" no dashboard
3. Verifique se subscription existe no Stripe Dashboard

### Problema 4: Erro "No such price"

**Causa:** Price IDs de teste não configurados

**Solução:**
```bash
# Configure os Price IDs de teste
supabase secrets set STRIPE_PRICE_DIRECTORY=price_1SpTBFJULNOvBzJ46Hf2TCJK
supabase secrets set STRIPE_PRICE_DIRECTORY_ACADEMY=price_1SpTBGJULNOvBzJ4ZEmSu0zk
supabase secrets set STRIPE_PRICE_PREMIUM=price_1SpTBGJULNOvBzJ4P3WdhYfN

# Redeploy
supabase functions deploy create-checkout
```

---

## ✅ Checklist Final

Após completar o teste, verifique:

- [ ] Pagamento foi processado no Stripe
- [ ] Subscription foi criada no Stripe
- [ ] Subscription aparece no Supabase (`subscriptions` table)
- [ ] Entitlements foram liberados (`entitlements` table)
- [ ] Dashboard mostra subscription ativa
- [ ] Botões de planos mostram "Plano Ativo" ou "Já Incluído"

---

**Data:** Janeiro 2025
