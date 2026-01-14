# 🔍 Diagnóstico de Problemas de Conexão com BD

**Data:** Janeiro 2025  
**Problemas Reportados:**
1. Ao tentar entrar como empresa, não é redirecionado para o dashboard
2. Empresas já cadastradas não carregam

---

## ✅ Correções Aplicadas

### 1. Adicionados Logs de Debug
- ✅ Logs no `AuthContext` para rastrear carregamento de profile
- ✅ Logs no `App.tsx` para rastrear redirecionamento
- ✅ Logs no `Home.tsx` para rastrear carregamento de empresas
- ✅ Logs no `CompanyDashboard.tsx` para rastrear busca de empresa

### 2. Melhor Tratamento de Erros
- ✅ Erros do Supabase agora mostram código, mensagem, detalhes e hint
- ✅ Validação de dados obrigatórios no mapper
- ✅ Tratamento de empresas inválidas (mapeia apenas as válidas)

### 3. Campos Opcionais
- ✅ `whatsapp` e `location` agora são opcionais no tipo `Company`
- ✅ Verificações adicionadas onde esses campos são usados
- ✅ Mapeamento ajustado para lidar com campos vazios

---

## 🔍 Como Diagnosticar

### 1. Verificar Console do Navegador

Abra o DevTools (F12) e verifique:

#### Ao Fazer Login:
```
👤 Usuário logado: { id: '...', role: 'COMPANY', currentPath: '/login' }
🔄 Redirecionando usuário logado...
→ Redirecionando para /dashboard
```

Se não aparecer, verifique:
- Se o profile foi carregado: `✅ Profile mapeado: { id: '...', role: 'COMPANY' }`
- Se há erros de RLS: `Error fetching profile: { code: '...', message: '...' }`

#### Ao Carregar Empresas:
```
✅ Carregadas X empresas do banco
```

Se aparecer `⚠️ Nenhuma empresa retornada do banco`, verifique:
- Se há empresas com `status = 'APPROVED'` no banco
- Se as políticas RLS estão corretas
- Se há erros na query: `Error fetching companies: { code: '...', message: '...' }`

### 2. Verificar Erros Comuns

#### Erro de RLS (Row Level Security)
**Sintoma:** `Error code: 42501` ou `permission denied`
**Solução:** Executar `scripts/FIX_RLS_POLICIES.sql` no Supabase

#### Erro de Campo Faltando
**Sintoma:** `Error mapping companies: Dados da empresa inválidos: id ou name faltando`
**Solução:** Verificar dados no banco, empresas devem ter `id` e `name`

#### Erro de Status Incorreto
**Sintoma:** Empresas não aparecem mesmo estando no banco
**Solução:** Verificar se o status é `'APPROVED'` (não `'Aprovado'`)

#### Erro de Role Não Atualizado
**Sintoma:** Usuário não é redirecionado para `/dashboard`
**Solução:** 
- Verificar se o profile tem `role = 'COMPANY'`
- Executar trigger SQL: `scripts/EPIC_00_UPDATE_ROLE_ON_COMPANY_CREATE.sql`

---

## 🛠️ Checklist de Verificação

### Banco de Dados
- [ ] Verificar se há empresas com `status = 'APPROVED'`:
  ```sql
  SELECT COUNT(*) FROM companies WHERE status = 'APPROVED';
  ```

- [ ] Verificar se o usuário tem profile:
  ```sql
  SELECT * FROM profiles WHERE id = 'USER_ID_AQUI';
  ```

- [ ] Verificar se o profile tem role correto:
  ```sql
  SELECT id, email, role FROM profiles WHERE id = 'USER_ID_AQUI';
  ```

- [ ] Verificar se o usuário tem empresa:
  ```sql
  SELECT * FROM companies WHERE owner_id = 'USER_ID_AQUI';
  ```

### Políticas RLS
- [ ] Verificar se políticas RLS estão ativas:
  ```sql
  SELECT tablename, policyname, permissive, roles, cmd, qual 
  FROM pg_policies 
  WHERE tablename = 'companies';
  ```

- [ ] Verificar política para anônimos:
  ```sql
  -- Deve permitir SELECT onde status = 'APPROVED'
  ```

- [ ] Verificar política para usuários autenticados:
  ```sql
  -- Deve permitir SELECT onde status = 'APPROVED' OR owner_id = auth.uid()
  ```

### Variáveis de Ambiente
- [ ] Verificar se `.env` tem:
  ```
  VITE_SUPABASE_URL=...
  VITE_SUPABASE_ANON_KEY=...
  ```

- [ ] Verificar se as variáveis estão sendo carregadas:
  ```javascript
  console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL);
  console.log('Supabase Key:', import.meta.env.VITE_SUPABASE_ANON_KEY?.substring(0, 20) + '...');
  ```

---

## 📋 Próximos Passos de Diagnóstico

1. **Abrir o console do navegador** e verificar os logs
2. **Verificar erros específicos** que aparecem
3. **Executar queries SQL** no Supabase para verificar dados
4. **Verificar políticas RLS** se houver erros de permissão
5. **Verificar variáveis de ambiente** se houver erros de conexão

---

## 🔧 Scripts SQL Úteis

### Verificar Empresas Aprovadas
```sql
SELECT id, name, status, owner_id, location, whatsapp 
FROM companies 
WHERE status = 'APPROVED' 
LIMIT 10;
```

### Verificar Profile do Usuário
```sql
SELECT id, email, name, role, created_at 
FROM profiles 
WHERE email = 'EMAIL_DO_USUARIO';
```

### Verificar Políticas RLS
```sql
SELECT * FROM pg_policies WHERE tablename = 'companies';
```

### Testar Query como Anônimo
```sql
-- Simular query anônima
SET ROLE anon;
SELECT * FROM companies WHERE status = 'APPROVED' LIMIT 5;
RESET ROLE;
```

---

**Última Atualização:** Janeiro 2025
