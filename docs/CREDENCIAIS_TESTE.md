# Credenciais de Teste - PragHub

## ⚠️ IMPORTANTE: Apenas para Ambiente de Desenvolvimento

Este documento contém credenciais de teste para uso em testes automatizados e desenvolvimento. **NUNCA** use estas credenciais em produção.

---

## 👤 Usuários de Teste

### Usuário ADMIN
- **Email:** `admin@praghub.test`
- **Senha:** `[A definir]`
- **Role:** `ADMIN`
- **Status:** ⚠️ **NECESSÁRIO CRIAR**

### Usuário COMPANY
- **Email:** `marcel@123.com` ✅ (Existente)
- **Senha:** `[Senha atual do usuário]`
- **Role:** `COMPANY`
- **Status:** ✅ Existe no banco de dados

### Usuário CUSTOMER
- **Email:** `customer@praghub.test`
- **Senha:** `[A definir]`
- **Role:** `CUSTOMER`
- **Status:** ⚠️ **NECESSÁRIO CRIAR**

---

## 🔧 Como Criar Usuários de Teste

### Opção 1: Via Supabase Dashboard

1. Acesse o Supabase Dashboard
2. Vá em **Authentication** → **Users**
3. Clique em **Add User** → **Create new user**
4. Preencha:
   - Email: `admin@praghub.test`
   - Password: (defina uma senha forte)
   - Auto Confirm User: ✅ (marcar)
5. Após criar, vá em **Table Editor** → `profiles`
6. Encontre o usuário criado e atualize:
   - `role`: `ADMIN` (ou `COMPANY`, `CUSTOMER` conforme necessário)

### Opção 2: Via SQL (Recomendado)

Execute no SQL Editor do Supabase:

```sql
-- Criar usuário ADMIN de teste
INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
) VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    'admin@praghub.test',
    crypt('SenhaForte123!', gen_salt('bf')),
    NOW(),
    NOW(),
    NOW(),
    '',
    '',
    '',
    ''
) ON CONFLICT (email) DO NOTHING;

-- Criar profile ADMIN
INSERT INTO public.profiles (id, email, name, role)
SELECT 
    id,
    email,
    'Admin Teste',
    'ADMIN'
FROM auth.users
WHERE email = 'admin@praghub.test'
ON CONFLICT (id) DO UPDATE SET role = 'ADMIN';

-- Criar usuário CUSTOMER de teste
INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
) VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    'customer@praghub.test',
    crypt('SenhaForte123!', gen_salt('bf')),
    NOW(),
    NOW(),
    NOW(),
    '',
    '',
    '',
    ''
) ON CONFLICT (email) DO NOTHING;

-- Criar profile CUSTOMER
INSERT INTO public.profiles (id, email, name, role)
SELECT 
    id,
    email,
    'Customer Teste',
    'CUSTOMER'
FROM auth.users
WHERE email = 'customer@praghub.test'
ON CONFLICT (id) DO UPDATE SET role = 'CUSTOMER';
```

**Nota:** O SQL acima pode precisar de ajustes dependendo da estrutura exata do Supabase. Use o método do Dashboard se o SQL não funcionar.

---

## 📝 Credenciais para Testes Automatizados

Após criar os usuários, atualize este documento com as senhas reais e configure variáveis de ambiente:

```bash
# .env.test (não commitar no git!)
TEST_ADMIN_EMAIL=admin@praghub.test
TEST_ADMIN_PASSWORD=SenhaForte123!
TEST_COMPANY_EMAIL=marcel@123.com
TEST_COMPANY_PASSWORD=[senha atual]
TEST_CUSTOMER_EMAIL=customer@praghub.test
TEST_CUSTOMER_PASSWORD=SenhaForte123!
```

---

## ✅ Checklist de Setup

- [ ] Usuário ADMIN criado
- [ ] Usuário CUSTOMER criado
- [ ] Profiles com roles corretos
- [ ] Senhas definidas e documentadas (localmente)
- [ ] Variáveis de ambiente configuradas
- [ ] Testes automatizados atualizados com credenciais

---

## 🔒 Segurança

- ⚠️ **NUNCA** commite este arquivo com senhas reais no Git
- ⚠️ Use `.gitignore` para excluir arquivos com senhas
- ⚠️ Rotacione senhas de teste regularmente
- ⚠️ Use senhas fortes mesmo para testes
- ⚠️ Limite acesso a este documento apenas para desenvolvedores

---

## 📚 Referências

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [TestSprite Test Plan](../testsprite_tests/testsprite_frontend_test_plan.json)

---

**Última atualização:** Janeiro 2026  
**Motivo:** Configuração de testes automatizados após execução do TestSprite
