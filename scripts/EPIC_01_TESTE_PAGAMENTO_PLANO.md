# EPIC 01 - Plano de Teste do Fluxo de Pagamento

## 📋 Objetivo
Configurar ambiente de teste com Stripe e validar o fluxo completo de pagamento.

---

## 🔑 Chaves e Valores

### Stripe (Modo Teste)
- **STRIPE_SECRET_KEY:** `sk_test_...` (configure via variável de ambiente)

### Price IDs (já identificados via MCP)
- **STRIPE_PRICE_DIRECTORY:** `price_1Sp9iDJULNOvBzJ4rHEy276L`
- **STRIPE_PRICE_DIRECTORY_ACADEMY:** `price_1Sp9irJULNOvBzJ4peDiLsfv`
- **STRIPE_PRICE_PREMIUM:** `price_1Sp9kcJULNOvBzJ492cQGIWE`

### Supabase
- **SUPABASE_URL:** `https://nkbcpwbgvesbkaebmkkw.supabase.co`
- **APP_BASE_URL:** `http://localhost:3000`
- **SUPABASE_SERVICE_ROLE_KEY:** ⚠️ Precisa obter do Dashboard

---

## 📝 Plano de Execução

### Fase 1: Obter Service Role Key do Supabase
1. Acessar: https://app.supabase.com/project/nkbcpwbgvesbkaebmkkw/settings/api
2. Copiar a chave `service_role` (secret)

### Fase 2: Autenticar e Linkar Projeto
```bash
supabase login
supabase link --project-ref nkbcpwbgvesbkaebmkkw
```

### Fase 3: Configurar Secrets
```bash
# Stripe Secret Key (modo teste)
supabase secrets set STRIPE_SECRET_KEY='sk_test_...' # Obtenha em https://dashboard.stripe.com/apikeys

# Price IDs
supabase secrets set STRIPE_PRICE_DIRECTORY=price_1Sp9iDJULNOvBzJ4rHEy276L
supabase secrets set STRIPE_PRICE_DIRECTORY_ACADEMY=price_1Sp9irJULNOvBzJ4peDiLsfv
supabase secrets set STRIPE_PRICE_PREMIUM=price_1Sp9kcJULNOvBzJ492cQGIWE

# Supabase URLs
supabase secrets set SUPABASE_URL=https://nkbcpwbgvesbkaebmkkw.supabase.co
supabase secrets set APP_BASE_URL=http://localhost:3000

# Service Role Key (substituir pelo valor real)
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=SUA_SERVICE_ROLE_KEY_AQUI
```

### Fase 4: Verificar Tabelas no Supabase
Executar no SQL Editor: `scripts/EPIC_01_VERIFICAR_TABELAS.sql`

Se tabelas não existirem, executar: `scripts/EPIC_01_CREATE_TABLES.sql`

### Fase 5: Deploy das Edge Functions
```bash
supabase functions deploy create-checkout
supabase functions deploy stripe-webhook
supabase functions deploy sync-subscription
```

### Fase 6: Verificar Deploy
```bash
supabase secrets list
supabase functions list
```

### Fase 7: Testar Fluxo
1. Acessar: `http://localhost:3000/#/planos`
2. Fazer login como usuário COMPANY
3. Clicar em "Quero começar a aparecer" (Plano Diretório)
4. Verificar redirecionamento para Stripe Checkout
5. Usar cartão de teste: `4242 4242 4242 4242`
6. Verificar redirecionamento de volta e entitlements liberados

---

## 🧪 Dados de Teste do Stripe

### Cartão de Teste (Sucesso)
- Número: `4242 4242 4242 4242`
- Data: Qualquer data futura (ex: 12/30)
- CVC: Qualquer 3 dígitos (ex: 123)

### Cartão de Teste (Falha)
- Número: `4000 0000 0000 0002`

### Cartão de Teste (Autenticação Necessária)
- Número: `4000 0025 0000 3155`

---

## ✅ Checklist de Validação

- [ ] Supabase CLI autenticado
- [ ] Projeto linkado
- [ ] STRIPE_SECRET_KEY configurada
- [ ] Price IDs configurados
- [ ] SUPABASE_URL configurada
- [ ] SUPABASE_SERVICE_ROLE_KEY configurada
- [ ] APP_BASE_URL configurada
- [ ] Tabelas criadas (subscriptions, entitlements, webhook_events)
- [ ] Edge Functions deployadas
- [ ] Página /planos carrega sem erros
- [ ] Checkout redireciona para Stripe
- [ ] Pagamento de teste funciona
- [ ] Retorno do Stripe funciona
- [ ] Entitlements liberados após pagamento

---

## 🔗 Links Úteis

- Supabase Dashboard: https://app.supabase.com/project/nkbcpwbgvesbkaebmkkw
- Stripe Dashboard (Teste): https://dashboard.stripe.com/test
- Stripe Webhooks: https://dashboard.stripe.com/test/webhooks
- Documentação Stripe Test Cards: https://docs.stripe.com/testing

---

**Data:** Janeiro 2025
