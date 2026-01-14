# EPIC 01 - Configurar Secrets do Supabase

## ⚠️ Problema

Se você está recebendo o erro:
```
Error: You did not provide an API key. You need to provide your API key in the Authorization header...
```

Isso significa que os **secrets do Supabase não estão configurados**. As Edge Functions precisam de variáveis de ambiente (secrets) para funcionar.

---

## 🔧 Solução: Configurar Secrets

### 1. Obter Chaves do Stripe

1. Acesse [Stripe Dashboard](https://dashboard.stripe.com)
2. Vá em **Developers** → **API keys**
3. Copie a **Secret key** (começa com `sk_test_...` para teste ou `sk_live_...` para produção)
4. Anote os **Price IDs** dos seus produtos (começam com `price_...`)

### 2. Obter Chaves do Supabase

1. Acesse [Supabase Dashboard](https://app.supabase.com)
2. Selecione seu projeto
3. Vá em **Settings** → **API**
4. Copie:
   - **Project URL** (ex: `https://xxxxx.supabase.co`)
   - **service_role key** (⚠️ NUNCA exponha no frontend!)

### 3. Configurar Secrets no Supabase

Execute os seguintes comandos no terminal (substitua os valores):

```bash
# Autenticar no Supabase CLI (se ainda não fez)
supabase login

# Linkar ao projeto (se ainda não fez)
supabase link --project-ref seu-project-ref

# Configurar secrets
supabase secrets set STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxx
supabase secrets set STRIPE_PRICE_DIRECTORY=price_xxxxxxxxxxxxx
supabase secrets set STRIPE_PRICE_DIRECTORY_ACADEMY=price_yyyyyyyyyyyyy
supabase secrets set STRIPE_PRICE_PREMIUM=price_zzzzzzzzzzzzz
supabase secrets set SUPABASE_URL=https://seu-projeto.supabase.co
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
supabase secrets set APP_BASE_URL=http://localhost:3000
```

### 4. Verificar Secrets Configurados

```bash
# Listar todos os secrets (valores não são mostrados por segurança)
supabase secrets list
```

Você deve ver:
```
STRIPE_SECRET_KEY
STRIPE_PRICE_DIRECTORY
STRIPE_PRICE_DIRECTORY_ACADEMY
STRIPE_PRICE_PREMIUM
SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY
APP_BASE_URL
```

### 5. Redeploy da Edge Function

Após configurar os secrets, você precisa fazer redeploy:

```bash
supabase functions deploy create-checkout
supabase functions deploy stripe-webhook
supabase functions deploy sync-subscription
```

---

## 🔍 Verificar se Funcionou

### Teste Local (com Supabase Local)

Se estiver usando Supabase local:

```bash
# Iniciar Supabase local
supabase start

# Configurar secrets localmente
supabase secrets set STRIPE_SECRET_KEY=sk_test_... --local
# ... (repetir para todos os secrets)

# Servir função localmente
supabase functions serve create-checkout
```

### Teste em Produção

1. Acesse `/planos` na aplicação
2. Clique em "Assinar Agora"
3. Verifique no console do navegador que não há mais erro 500
4. Verifique nos logs da Edge Function:

```bash
supabase functions logs create-checkout
```

---

## 🐛 Troubleshooting

### Erro: "secret not found"
- Verifique que você está no projeto correto: `supabase projects list`
- Verifique que o secret foi configurado: `supabase secrets list`
- Certifique-se de fazer redeploy após configurar secrets

### Erro: "Invalid API key"
- Verifique que a chave do Stripe está correta (começa com `sk_test_` ou `sk_live_`)
- Verifique que está usando a chave do ambiente correto (test vs live)

### Erro 406 nas queries
- Verifique que as tabelas `subscriptions` e `entitlements` foram criadas
- Execute o SQL: `scripts/EPIC_01_CREATE_TABLES.sql`
- Verifique RLS está configurado corretamente

### Edge Function não recebe secrets
- Secrets só estão disponíveis em **produção** (não em desenvolvimento local sem configuração especial)
- Para local, use `--local` flag ou variáveis de ambiente do Deno
- Certifique-se de fazer redeploy após configurar secrets

---

## 📝 Checklist

- [ ] Stripe Secret Key configurada
- [ ] Price IDs configurados (3 planos)
- [ ] SUPABASE_URL configurada
- [ ] SUPABASE_SERVICE_ROLE_KEY configurada
- [ ] APP_BASE_URL configurada
- [ ] Secrets listados com `supabase secrets list`
- [ ] Edge Functions redeployadas
- [ ] Teste local ou produção funcionando

---

## 🔐 Segurança

⚠️ **IMPORTANTE:**
- NUNCA commite secrets no código
- NUNCA exponha `SUPABASE_SERVICE_ROLE_KEY` no frontend
- Use `supabase secrets` para gerenciar variáveis sensíveis
- Rotacione secrets periodicamente
- Use diferentes secrets para test e production

---

**Última atualização:** Janeiro 2025  
**Versão:** 1.0.0
