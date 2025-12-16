# Como Verificar e Configurar RLS (Row Level Security) no Supabase

## 🔍 Problema

Se os dados não estão carregando no servidor, pode ser que as políticas de RLS (Row Level Security) estejam bloqueando as queries.

## ✅ Correções Aplicadas

1. **Removido erro 404 do index.css** - Removida referência ao arquivo inexistente
2. **Removidas referências ao campo `cnpj`** - Campo não existe na tabela do Supabase
   - `pages/Home.tsx`
   - `pages/Admin.tsx`
   - `pages/CompanyProfile.tsx`
   - `pages/CompanyDashboard.tsx`

## 🔐 Verificar RLS no Supabase

### Passo 1: Acessar o Supabase Dashboard

1. Acesse: https://app.supabase.com
2. Selecione seu projeto
3. Vá em **Authentication** > **Policies** ou **Table Editor** > **companies** > **Policies**

### Passo 2: Verificar Políticas da Tabela `companies`

A tabela `companies` precisa ter políticas que permitam:

#### Para usuários anônimos (público):
```sql
-- Permitir leitura de empresas aprovadas para todos
-- IMPORTANTE: Permite empresas com owner_id NULL (empresas migradas)
CREATE POLICY "Permitir leitura de empresas aprovadas"
ON companies
FOR SELECT
TO anon
USING (status = 'Aprovado');
```

**⚠️ ATENÇÃO:** Se você já tem uma política similar, mas ela verifica `owner_id IS NOT NULL`, você precisa atualizá-la ou criar uma nova que permita `owner_id NULL`.

#### Para usuários autenticados (empresas):
```sql
-- Empresas podem ler suas próprias empresas
-- E também empresas aprovadas (para visualização pública)
CREATE POLICY "Empresas podem ler próprios dados e aprovadas"
ON companies
FOR SELECT
TO authenticated
USING (
  auth.uid() = owner_id 
  OR status = 'Aprovado'
);

-- Empresas podem atualizar apenas suas próprias empresas
CREATE POLICY "Empresas podem atualizar próprios dados"
ON companies
FOR UPDATE
TO authenticated
USING (auth.uid() = owner_id);
```

#### Para admins:
```sql
-- Admins podem ler todas as empresas
CREATE POLICY "Admins podem ler todas empresas"
ON companies
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- Admins podem atualizar todas as empresas
CREATE POLICY "Admins podem atualizar todas empresas"
ON companies
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);
```

### Passo 3: Verificar se RLS está Habilitado

1. No Supabase Dashboard, vá em **Table Editor** > **companies**
2. Clique em **Settings** (ícone de engrenagem)
3. Verifique se **Enable Row Level Security** está marcado
4. Se estiver marcado, você precisa criar as políticas acima
5. Se NÃO estiver marcado, as queries devem funcionar (mas não é recomendado para produção)

### Passo 4: Testar Queries

No Supabase Dashboard, vá em **SQL Editor** e execute:

```sql
-- Testar query como usuário anônimo
SET ROLE anon;
SELECT * FROM companies WHERE status = 'Aprovado' LIMIT 5;

-- Testar query como usuário autenticado
SET ROLE authenticated;
SELECT * FROM companies LIMIT 5;
```

## 🚨 Problema: owner_id NULL

Se suas empresas têm `owner_id = NULL` (como as empresas migradas), você precisa garantir que as políticas permitam isso.

### Verificar Políticas Existentes

No Supabase Dashboard:
1. Vá em **Table Editor** > **companies**
2. Clique no botão **"4 RLS policies"** (ou número de políticas que você tem)
3. Verifique se alguma política está bloqueando empresas com `owner_id NULL`

### Criar/Atualizar Política para Empresas sem Owner

```sql
-- Se você já tem uma política que bloqueia owner_id NULL, 
-- você precisa criar uma nova ou atualizar a existente:

-- Opção 1: Criar nova política (recomendado)
CREATE POLICY "Permitir empresas aprovadas sem owner"
ON companies
FOR SELECT
TO anon, authenticated
USING (status = 'Aprovado' AND owner_id IS NULL);

-- Opção 2: Atualizar política existente para permitir NULL
-- (substitua 'nome_da_politica' pelo nome real)
ALTER POLICY "nome_da_politica" ON companies
USING (status = 'Aprovado' OR owner_id IS NULL);
```

## 🚨 Solução Rápida (Temporária)

Se você precisar que funcione imediatamente para testar:

```sql
-- ⚠️ ATENÇÃO: Isso desabilita RLS temporariamente
-- Use apenas para desenvolvimento/teste
ALTER TABLE companies DISABLE ROW LEVEL SECURITY;
```

**NÃO use isso em produção!** Sempre configure as políticas corretas.

## 📝 Checklist

- [ ] RLS está habilitado na tabela `companies`
- [ ] Política para leitura pública (empresas aprovadas) existe
- [ ] Política para empresas lerem seus próprios dados existe
- [ ] Política para admins lerem todas as empresas existe
- [ ] Variáveis de ambiente estão configuradas no servidor:
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`

## 🔧 Verificar Variáveis de Ambiente no Servidor

Se você está usando Vercel, Netlify ou outro serviço:

1. Acesse as configurações do projeto
2. Vá em **Environment Variables**
3. Verifique se estão configuradas:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

**Importante:** Após adicionar/alterar variáveis, faça um novo deploy!

## 🐛 Debug

Se ainda não funcionar, abra o console do navegador (F12) e verifique:

1. **Erros de rede**: Veja se há requisições falhando
2. **Erros de autenticação**: Verifique se o token está sendo enviado
3. **Erros de RLS**: Mensagens como "new row violates row-level security policy"

Para ver os erros detalhados, adicione logs temporários:

```typescript
const { data, error } = await supabase
  .from('companies')
  .select('*')
  .eq('status', 'Aprovado');

if (error) {
  console.error('Erro detalhado:', error);
  console.error('Código:', error.code);
  console.error('Mensagem:', error.message);
  console.error('Detalhes:', error.details);
}
```

