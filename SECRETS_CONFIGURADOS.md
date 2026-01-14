# ✅ Secrets do Supabase - Configurados

## 📋 Status da Configuração

**Data:** Janeiro 2026  
**Projeto:** nkbcpwbgvesbkaebmkkw (Praghub-Ai-Studio)

---

## ✅ Secrets Configurados

Os seguintes secrets foram configurados com sucesso no Supabase:

| Secret | Status | Descrição |
|--------|--------|-----------|
| `STRIPE_SECRET_KEY` | ✅ Configurado | Chave secreta do Stripe (modo teste) |
| `STRIPE_PRICE_DIRECTORY` | ✅ Configurado | Price ID do plano Directory |
| `STRIPE_PRICE_DIRECTORY_ACADEMY` | ✅ Configurado | Price ID do plano Directory + Academy |
| `STRIPE_PRICE_PREMIUM` | ✅ Configurado | Price ID do plano Premium |
| `APP_BASE_URL` | ✅ Configurado | URL base da aplicação (localhost:3000) |
| `SERVICE_ROLE_KEY` | ✅ Já estava configurado | Service Role Key do Supabase |
| `STRIPE_WEBHOOK_SECRET` | ✅ Já estava configurado | Secret do webhook do Stripe |
| `SUPABASE_URL` | ✅ Disponível automaticamente | URL do projeto Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ Já estava configurado | Service Role Key (alternativa) |
| `SUPABASE_ANON_KEY` | ✅ Já estava configurado | Chave pública (anon) |
| `SUPABASE_DB_URL` | ✅ Já estava configurado | URL de conexão do banco |

---

## 🔧 Valores Configurados

### Stripe (Modo Teste)
- **Secret Key:** `sk_test_...` (configurado via Supabase secrets)
- **Price Directory:** `price_1Sp9iDJULNOvBzJ4rHEy276L`
- **Price Directory + Academy:** `price_1Sp9irJULNOvBzJ4peDiLsfv`
- **Price Premium:** `price_1Sp9kcJULNOvBzJ492cQGIWE`

### URLs
- **Supabase URL:** `https://nkbcpwbgvesbkaebmkkw.supabase.co`
- **App Base URL:** `http://localhost:3000` (atualizar para produção)

---

## ⚠️ Ações Necessárias para Produção

### 1. Atualizar APP_BASE_URL para Produção

Quando o projeto estiver deployado no Vercel, atualize:

```bash
supabase secrets set APP_BASE_URL='https://seu-dominio.vercel.app' --project-ref nkbcpwbgvesbkaebmkkw
```

### 2. Configurar Stripe em Modo Live (Opcional)

Quando estiver pronto para produção:

1. Obtenha a chave **Live** do Stripe
2. Configure os Price IDs de produção
3. Atualize os secrets:

```bash
supabase secrets set STRIPE_SECRET_KEY='sk_live_...' --project-ref nkbcpwbgvesbkaebmkkw
supabase secrets set STRIPE_PRICE_DIRECTORY='price_live_...' --project-ref nkbcpwbgvesbkaebmkkw
# etc...
```

### 3. Configurar Webhook do Stripe para Produção

1. Acesse [Stripe Dashboard](https://dashboard.stripe.com) → **Developers** → **Webhooks**
2. Adicione endpoint: `https://nkbcpwbgvesbkaebmkkw.supabase.co/functions/v1/stripe-webhook`
3. Selecione eventos:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
4. Copie o **Webhook Signing Secret**
5. Configure:

```bash
supabase secrets set STRIPE_WEBHOOK_SECRET='whsec_...' --project-ref nkbcpwbgvesbkaebmkkw
```

---

## 📝 Verificar Secrets Configurados

Para listar todos os secrets:

```bash
supabase secrets list --project-ref nkbcpwbgvesbkaebmkkw
```

---

## ✅ Edge Functions

As Edge Functions devem estar deployadas. Verifique com:

```bash
supabase functions list --project-ref nkbcpwbgvesbkaebmkkw
```

Se necessário, faça deploy:

```bash
supabase functions deploy create-checkout --project-ref nkbcpwbgvesbkaebmkkw
supabase functions deploy stripe-webhook --project-ref nkbcpwbgvesbkaebmkkw
supabase functions deploy sync-subscription --project-ref nkbcpwbgvesbkaebmkkw
```

---

## 🔒 Segurança

- ✅ Secrets não são expostos no frontend
- ✅ Service Role Key configurada apenas nas Edge Functions
- ✅ Stripe Secret Key apenas no servidor
- ⚠️ **NUNCA** commite secrets no Git

---

## 📚 Referências

- [Supabase Secrets Documentation](https://supabase.com/docs/guides/functions/secrets)
- [Stripe API Keys](https://dashboard.stripe.com/apikeys)
- Script usado: `scripts/CONFIGURAR_SECRETS_AUTOMATICO.sh`

---

**Última atualização:** Janeiro 2026  
**Configurado por:** Script automatizado via Supabase CLI
