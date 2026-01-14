# EPIC 01 - Troubleshooting: Erros Comuns

## 🔴 Erro 1: "You did not provide an API key"

### Sintoma
```
Error: You did not provide an API key. You need to provide your API key in the Authorization header...
```

### Causa
Edge Function não está recebendo `STRIPE_SECRET_KEY` dos secrets do Supabase.

### Solução
1. Configure os secrets do Supabase (ver `EPIC_01_CONFIGURAR_SECRETS.md`)
2. Faça redeploy da Edge Function:
   ```bash
   supabase functions deploy create-checkout
   ```

---

## 🔴 Erro 2: Status 406 nas Queries

### Sintoma
```
Failed to load resource: the server responded with a status of 406
```

### Causa
- Tabelas `subscriptions` ou `entitlements` não existem
- RLS está bloqueando o acesso
- Formato de query incorreto

### Solução

#### Passo 1: Verificar se tabelas existem
```sql
-- No Supabase SQL Editor
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('subscriptions', 'entitlements', 'webhook_events');
```

Se não existirem, execute:
```bash
# No Supabase SQL Editor, execute:
scripts/EPIC_01_CREATE_TABLES.sql
```

#### Passo 2: Verificar RLS
```sql
-- Verificar se RLS está habilitado
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('subscriptions', 'entitlements');

-- Verificar políticas
SELECT * FROM pg_policies 
WHERE tablename IN ('subscriptions', 'entitlements');
```

Se RLS estiver bloqueando, verifique as políticas em `EPIC_01_CREATE_TABLES.sql`.

#### Passo 3: Testar query manualmente
```sql
-- Como usuário autenticado, testar:
SELECT * FROM entitlements WHERE profile_id = 'seu-profile-id';
SELECT * FROM subscriptions WHERE profile_id = 'seu-profile-id';
```

---

## 🔴 Erro 3: Edge Function retorna 500

### Sintoma
```
Failed to load resource: the server responded with a status of 500
```

### Causa
- Secrets não configurados
- Erro no código da Edge Function
- Stripe API key inválida

### Solução

#### Passo 1: Verificar logs
```bash
supabase functions logs create-checkout --limit 50
```

#### Passo 2: Verificar secrets
```bash
supabase secrets list
```

Deve mostrar:
- STRIPE_SECRET_KEY
- STRIPE_PRICE_DIRECTORY
- STRIPE_PRICE_DIRECTORY_ACADEMY
- STRIPE_PRICE_PREMIUM
- SUPABASE_URL
- SUPABASE_SERVICE_ROLE_KEY
- APP_BASE_URL

#### Passo 3: Testar Stripe key
```bash
# Testar se a chave funciona
curl https://api.stripe.com/v1/customers \
  -u sk_test_...:
```

---

## 🔴 Erro 4: "Invalid plan key" ou "Price ID não configurado"

### Sintoma
```
Error: Price ID não configurado para o plano directory
```

### Causa
Price IDs não foram configurados como secrets ou estão incorretos.

### Solução
1. Obter Price IDs do Stripe Dashboard
2. Configurar secrets:
   ```bash
   supabase secrets set STRIPE_PRICE_DIRECTORY=price_xxxxx
   supabase secrets set STRIPE_PRICE_DIRECTORY_ACADEMY=price_yyyyy
   supabase secrets set STRIPE_PRICE_PREMIUM=price_zzzzz
   ```
3. Redeploy:
   ```bash
   supabase functions deploy create-checkout
   ```

---

## 🔴 Erro 5: "Profile not found"

### Sintoma
```
Error: Profile not found
```

### Causa
Perfil do usuário não existe na tabela `profiles`.

### Solução
1. Verificar se trigger `handle_new_user()` está criado
2. Verificar se perfil foi criado:
   ```sql
   SELECT * FROM profiles WHERE id = 'user-id';
   ```
3. Se não existir, criar manualmente ou verificar trigger

---

## 🟡 Erro 6: Checkout não redireciona

### Sintoma
Botão "Assinar Agora" não redireciona para Stripe.

### Causa
- Edge Function retornou erro
- URL do checkout está incorreta
- CORS bloqueando

### Solução
1. Verificar console do navegador para erros
2. Verificar resposta da Edge Function:
   ```javascript
   // No console do navegador, após clicar:
   // Deve retornar { sessionId: '...', url: '...' }
   ```
3. Verificar que `url` não está vazia
4. Verificar CORS na Edge Function (já configurado)

---

## 🟡 Erro 7: Toast não aparece

### Sintoma
Feedback visual não aparece após checkout.

### Causa
- Componente Toast não está renderizando
- Estado não está sendo atualizado
- Parâmetros da URL não estão sendo detectados

### Solução
1. Verificar que `Toast` está importado em `Planos.tsx`
2. Verificar console para erros
3. Verificar que `useEffect` está detectando parâmetros:
   ```javascript
   // Deve detectar ?session_id=xxx&success=true
   ```

---

## 🔍 Verificações Gerais

### Checklist de Diagnóstico

- [ ] Tabelas criadas (`subscriptions`, `entitlements`, `webhook_events`)
- [ ] RLS configurado corretamente
- [ ] Secrets configurados no Supabase
- [ ] Edge Functions deployadas
- [ ] Price IDs corretos no Stripe
- [ ] Stripe Secret Key válida
- [ ] Usuário autenticado
- [ ] Perfil existe na tabela `profiles`

### Comandos Úteis

```bash
# Ver logs das Edge Functions
supabase functions logs create-checkout
supabase functions logs stripe-webhook
supabase functions logs sync-subscription

# Listar secrets
supabase secrets list

# Verificar status do projeto
supabase status

# Testar função localmente
supabase functions serve create-checkout
```

### Queries Úteis

```sql
-- Verificar subscriptions
SELECT * FROM subscriptions ORDER BY created_at DESC LIMIT 10;

-- Verificar entitlements
SELECT * FROM entitlements ORDER BY updated_at DESC LIMIT 10;

-- Verificar webhook events
SELECT * FROM webhook_events ORDER BY processed_at DESC LIMIT 10;

-- Verificar políticas RLS
SELECT * FROM pg_policies WHERE tablename IN ('subscriptions', 'entitlements');
```

---

## 📞 Próximos Passos

Se nenhuma solução funcionou:

1. Verificar logs completos da Edge Function
2. Testar com Stripe CLI localmente
3. Verificar documentação do Supabase Edge Functions
4. Verificar documentação do Stripe API

---

**Última atualização:** Janeiro 2025  
**Versão:** 1.0.0
