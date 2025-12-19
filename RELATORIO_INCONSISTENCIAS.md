# Relatório de Inconsistências - PragHub

## 📋 Resumo Executivo

Este documento lista todas as inconsistências encontradas no mapeamento de dados entre o banco de dados Supabase (snake_case) e o código TypeScript (camelCase), além de problemas de estrutura e acesso.

---

## 🔴 Problemas Críticos Corrigidos

### 1. **Mapeamento Incompleto em CompanyProfile.tsx** ✅ CORRIGIDO
- **Problema**: O mapeamento de dados do banco para o tipo `Company` estava incompleto, faltando campos como `description`, `specialties`, `status`, `cnpj`, `slug`, e campos de endereço.
- **Impacto**: Dados salvos não apareciam corretamente na visualização do perfil público.
- **Solução**: Adicionado mapeamento completo de todos os campos.

### 2. **Mapeamento Incompleto em CompanyDashboard.tsx** ✅ CORRIGIDO
- **Problema**: Similar ao anterior, mas na visão geral do dashboard.
- **Impacto**: Dados editados não apareciam na visão geral após salvar.
- **Solução**: Já corrigido anteriormente com mapeamento completo.

---

## ⚠️ Inconsistências Identificadas

### 3. **Campo `initials` Não Definido no Tipo Company**
- **Localização**: `pages/Home.tsx:150`, `pages/CompanyProfile.tsx:122`, `pages/Admin.tsx:229`
- **Problema**: O código usa `company.initials` mas esse campo não existe no tipo `Company`.
- **Impacto**: Pode causar erros em runtime quando não há `imageUrl`.
- **Recomendação**: 
  - Adicionar `initials?: string` ao tipo `Company`, OU
  - Criar uma função helper que gera as iniciais do nome da empresa

### 4. **Home.tsx Não Busca Dados do Supabase**
- **Localização**: `pages/Home.tsx`
- **Problema**: A página Home importa `useEffect` e `supabase` mas não está buscando dados reais do banco. Parece estar usando dados mockados de `src/data/companies.ts`.
- **Impacto**: A página inicial não mostra empresas reais cadastradas.
- **Recomendação**: Implementar `useEffect` para buscar empresas aprovadas do Supabase.

### 5. **Inconsistência no Campo `id` vs `slug`**
- **Localização**: Múltiplos arquivos
- **Problema**: 
  - `CompanyDashboard.tsx` usa `data.id` (ID do banco)
  - `CompanyProfile.tsx` usa `data.slug` como `id` (para URL)
  - `Home.tsx` usa `company.id` no Link, mas pode ser slug ou ID
- **Impacto**: Pode causar problemas de roteamento e inconsistências.
- **Recomendação**: Padronizar o uso - usar `slug` para URLs e `id` para operações de banco.

### 6. **Tabela `profiles` Não Está Sendo Criada/Atualizada Corretamente**
- **Localização**: `pages/Register.tsx:78-81`, `pages/Login.tsx:27-31`
- **Problema**: 
  - No registro, para consumidores, o código comenta que depende de trigger do Supabase
  - No login, tenta buscar `profiles` mas pode falhar se o trigger não existir
- **Impacto**: Usuários consumidores podem não ter perfil criado corretamente.
- **Recomendação**: 
  - Verificar se existe trigger no Supabase para criar `profiles` automaticamente
  - Ou criar explicitamente o perfil no registro

### 7. **Admin Não Tem Autenticação**
- **Localização**: `pages/Admin.tsx`
- **Problema**: A página Admin não verifica se o usuário tem permissão de admin antes de exibir.
- **Impacto**: Qualquer usuário pode acessar `/admin` diretamente.
- **Recomendação**: 
  - Adicionar verificação de autenticação
  - Verificar se o usuário tem role `admin` na tabela `profiles` ou `user_metadata`

### 8. **Admin Usa Dados Mockados**
- **Localização**: `pages/Admin.tsx:5-42`
- **Problema**: A lista de empresas no admin usa dados hardcoded (`ADMIN_COMPANIES`) ao invés de buscar do Supabase.
- **Impacto**: O admin não mostra empresas reais cadastradas.
- **Recomendação**: Implementar busca real do Supabase com filtros e paginação.

### 9. **Campos Opcionais Sem Valores Padrão**
- **Localização**: Múltiplos arquivos
- **Problema**: Alguns campos opcionais podem ser `null` no banco mas o código não trata adequadamente.
- **Exemplos**: `rating`, `reviews`, `tags`, `specialties`
- **Recomendação**: Já parcialmente corrigido com `|| 0` e `|| []`, mas verificar todos os casos.

---

## 📊 Estrutura de Tabelas Esperada

### Tabela `companies`
Campos esperados (snake_case no banco):
- `id` (UUID)
- `owner_id` (UUID, FK para auth.users)
- `slug` (text, único)
- `name` (text)
- `rating` (numeric, default 0)
- `reviews` (integer, default 0)
- `location` (text)
- `short_location` (text)
- `description` (text, nullable)
- `cep` (text, nullable)
- `street` (text, nullable)
- `number` (text, nullable)
- `neighborhood` (text, nullable)
- `city` (text, nullable)
- `state` (text, nullable)
- `tags` (array/text[], default [])
- `specialties` (array/text[], nullable)
- `image_url` (text, nullable)
- `whatsapp` (text, nullable)
- `is_premium` (boolean, default false)
- `status` (text, enum: 'Pendente' | 'Aprovado' | 'Rejeitado')
- `cnpj` (text, nullable)
- `created_at` (timestamp)
- `updated_at` (timestamp)

### Tabela `profiles`
Campos esperados:
- `id` (UUID, FK para auth.users)
- `role` (text, enum: 'company' | 'consumer' | 'admin')
- `full_name` (text, nullable)
- `created_at` (timestamp)
- `updated_at` (timestamp)

---

## 🔐 Como Acessar o Dashboard Administrativo

### Método Atual (Sem Autenticação)
1. Acesse diretamente: `http://localhost:3000/#/admin`
2. **⚠️ ATENÇÃO**: Atualmente não há verificação de permissão, qualquer usuário pode acessar.

### Recomendação de Implementação
Para adicionar autenticação de admin:

1. **Verificar no Login** (`pages/Login.tsx`):
```typescript
if (profile.role === 'admin') {
    navigate('/admin');
} else if (profile.role === 'company') {
    navigate('/dashboard');
} else {
    navigate('/');
}
```

2. **Adicionar Proteção na Página Admin** (`pages/Admin.tsx`):
```typescript
useEffect(() => {
    const checkAdmin = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            navigate('/login');
            return;
        }
        
        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();
            
        if (profile?.role !== 'admin') {
            navigate('/');
            return;
        }
    };
    checkAdmin();
}, []);
```

3. **Criar Usuário Admin no Supabase**:
   - Via SQL Editor no Supabase Dashboard:
   ```sql
   -- Após criar o usuário via auth, atualizar o profile
   UPDATE profiles 
   SET role = 'admin' 
   WHERE id = 'user-uuid-here';
   ```

---

## ✅ Correções Aplicadas

1. ✅ Mapeamento completo em `CompanyDashboard.tsx`
2. ✅ Mapeamento completo em `CompanyProfile.tsx`
3. ✅ Exibição de descrição real no perfil público
4. ✅ Exibição de especialidades no perfil público
5. ✅ Melhorias na visão geral do dashboard

---

## 📝 Próximos Passos Recomendados

1. **Alta Prioridade**:
   - [ ] Implementar busca de empresas reais na Home.tsx
   - [ ] Adicionar autenticação de admin
   - [ ] Implementar busca real de empresas no Admin.tsx
   - [ ] Resolver inconsistência id vs slug

2. **Média Prioridade**:
   - [ ] Adicionar campo `initials` ao tipo ou criar função helper
   - [ ] Verificar e corrigir criação de profiles para consumidores
   - [ ] Adicionar tratamento de erros mais robusto

3. **Baixa Prioridade**:
   - [ ] Adicionar paginação nas listagens
   - [ ] Implementar cache de dados
   - [ ] Adicionar loading states mais informativos

---

## 🔍 Checklist de Verificação no Supabase

Verifique se as seguintes estruturas existem no seu banco:

- [ ] Tabela `companies` com todos os campos listados acima
- [ ] Tabela `profiles` com campo `role`
- [ ] Trigger/Function para criar `profiles` automaticamente ao criar usuário
- [ ] RLS (Row Level Security) configurado corretamente
- [ ] Políticas de acesso para:
  - [ ] Empresas podem ler/atualizar apenas seus próprios dados
  - [ ] Público pode ler apenas empresas aprovadas
  - [ ] Admin pode ler/atualizar todas as empresas

---

**Data do Relatório**: 2025-01-XX
**Versão do App**: 0.0.0

