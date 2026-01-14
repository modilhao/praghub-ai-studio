# 📊 Relatório Completo de Análise - PragHub

**Data:** Janeiro 2025  
**Escopo:** Análise completa do código para simplificações, reengenharias e bugs

---

## 🔴 Problemas Críticos Encontrados

### 1. **Duplicação de Arquivos (Reengenharia Incompleta)**

**Problema:** Existem arquivos duplicados que não estão sendo usados:

- ✅ `lib/supabase.ts` (USADO) - Versão atual com tratamento de erro suave
- ❌ `src/lib/supabase.ts` (NÃO USADO) - Versão antiga que lança erro

- ✅ `contexts/AuthContext.tsx` (USADO) - Versão atual com interface `User`
- ❌ `src/contexts/AuthContext.tsx` (NÃO USADO) - Versão antiga com interface diferente (`Profile`)

**Impacto:**
- Confusão sobre qual arquivo usar
- Possível uso acidental da versão errada
- Código morto ocupando espaço

**Recomendação:** Remover arquivos em `src/` que são duplicados

---

### 2. **Campo `cnpj` Ainda Sendo Usado (Bug)**

**Problema:** O campo `cnpj` foi removido do banco de dados, mas ainda é referenciado em vários lugares:

**Arquivos afetados:**
- `pages/Home.tsx:53` - `cnpj: c.cnpj`
- `pages/Admin.tsx:47` - `cnpj: c.cnpj`
- `pages/Admin.tsx:144` - `c.cnpj?.includes(searchTerm)`
- `pages/Admin.tsx:318` - Exibição de `c.cnpj`
- `pages/CompanyProfile.tsx:36` - `cnpj: data.cnpj`
- `pages/CompanyDashboard.tsx:39` - `cnpj: comp.cnpj`

**Impacto:**
- Erros em runtime quando `cnpj` é `undefined`
- Busca no Admin não funciona para CNPJ
- Dados podem não ser exibidos corretamente

**Recomendação:** Remover todas as referências a `cnpj` ou adicionar o campo de volta ao banco

---

### 3. **Campo `initials` Não Definido no Tipo (Inconsistência)**

**Problema:** O código usa `company.initials` mas o campo não existe no tipo `Company`:

**Arquivos afetados:**
- `pages/Home.tsx:68` - `initials: c.name.substring(0, 2).toUpperCase()`
- `pages/Home.tsx:252` - `{company.initials}`

**Impacto:**
- TypeScript não valida o uso
- Pode causar confusão sobre origem do campo

**Recomendação:** 
- Adicionar `initials?: string` ao tipo `Company`, OU
- Criar função helper `getCompanyInitials(company: Company): string`

---

### 4. **Inconsistência de Interfaces AuthContext (Reengenharia)**

**Problema:** Existem duas versões do `AuthContext` com interfaces diferentes:

**Versão atual (`contexts/AuthContext.tsx`):**
```typescript
interface AuthContextType {
    user: User | null;  // User do types.ts
    isLoading: boolean;
    signInWithEmail: (email: string, password: string) => Promise<void>;
    signUpWithEmail: (email: string, password: string) => Promise<any>;
    logout: () => Promise<void>;
}
```

**Versão antiga (`src/contexts/AuthContext.tsx`):**
```typescript
interface AuthContextType {
    user: User | null;  // User do @supabase/supabase-js
    profile: Profile | null;
    loading: boolean;
    signOut: () => Promise<void>;
    sessionEvent: 'SIGNED_IN' | 'SIGNED_OUT' | ... | null;
}
```

**Impacto:**
- Confusão sobre qual interface usar
- Código pode quebrar se importar versão errada

**Recomendação:** Remover versão antiga e padronizar interface

---

## ⚠️ Problemas de Simplificação

### 5. **Lógica de Retry Complexa no Register.tsx**

**Problema:** `pages/Register.tsx` tem lógica de retry manual para aguardar criação de profile:

```typescript
// Retry logic para garantir que o profile existe antes de criar a empresa
let profileExists = false;
for (let i = 0; i < 3; i++) {
    const { data: profile } = await supabase.from('profiles').select('id').eq('id', currentUser?.id).single();
    if (profile) {
        profileExists = true;
        break;
    }
    await new Promise(resolve => setTimeout(resolve, 1000));
}
```

**Simplificação possível:**
- Usar trigger do banco para criar profile automaticamente
- Ou usar função RPC do Supabase que garante criação
- Remover retry manual e confiar no trigger

---

### 6. **AuthContext com Lógica de Self-Healing Complexa**

**Problema:** `contexts/AuthContext.tsx` tem lógica complexa para auto-corrigir roles:

```typescript
// Self-healing: Check if user owns a company but has wrong role
if (profile.role !== 'COMPANY' && profile.role !== 'ADMIN') {
    const { data: company } = await supabase
        .from('companies')
        .select('id')
        .eq('owner_id', userId)
        .maybeSingle();

    if (company) {
        // User owns a company, update their role
        const { error: updateError } = await supabase
            .from('profiles')
            .update({ role: 'COMPANY' })
            .eq('id', userId);
        // ...
    }
}
```

**Simplificação possível:**
- Mover lógica para trigger do banco
- Ou criar função RPC que sincroniza role ao criar empresa
- Remover lógica do frontend

---

### 7. **Mapeamento Manual Repetido (DRY Violation)**

**Problema:** O mapeamento de dados do banco (snake_case) para TypeScript (camelCase) é repetido em vários arquivos:

**Arquivos com mapeamento similar:**
- `pages/Home.tsx:49-80`
- `pages/Admin.tsx:43-59`
- `pages/CompanyProfile.tsx:32-49`
- `pages/CompanyDashboard.tsx:39-60`

**Simplificação possível:**
- Criar função helper `mapCompanyFromDB(data: any): Company`
- Centralizar em `lib/utils.ts` ou criar `lib/mappers.ts`

---

### 8. **Tratamento de Erro Inconsistente**

**Problema:** Alguns lugares usam `alert()`, outros `console.error()`, outros `Toast`:

**Exemplos:**
- `pages/Login.tsx:29` - `alert(error.message || "...")`
- `pages/Register.tsx:101` - `alert(error.message || "...")`
- `pages/Planos.tsx` - Usa componente `Toast`

**Simplificação possível:**
- Padronizar uso de `Toast` em toda aplicação
- Criar hook `useToast()` para facilitar uso
- Remover `alert()` e `console.error()` para erros do usuário

---

## 🐛 Bugs Potenciais

### 9. **Race Condition no AuthContext**

**Problema:** `fetchProfile` pode ser chamado múltiplas vezes simultaneamente:

```typescript
const fetchProfile = async (userId: string) => {
    // Não há proteção contra múltiplas chamadas simultâneas
    let { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
    // ...
}
```

**Versão antiga em `src/contexts/AuthContext.tsx` tem proteção:**
```typescript
const fetchProfileRef = useRef<Promise<void> | null>(null);
const isFetchingRef = useRef<boolean>(false);
// ... lógica de prevenção de race condition
```

**Recomendação:** Adicionar proteção similar na versão atual

---

### 10. **Falta de Validação de Dados no Register**

**Problema:** `pages/Register.tsx` não valida dados antes de enviar:

- WhatsApp pode estar em formato inválido
- Cidade pode estar vazia
- Nome da empresa pode ter caracteres inválidos

**Recomendação:** Adicionar validação antes de submit

---

### 11. **Hardcoded Values em Planos.tsx**

**Problema:** Price IDs estão hardcoded no código:

```typescript
priceId: 'price_1SpTBFJULNOvBzJ46Hf2TCJK',
```

**Recomendação:** 
- Mover para variáveis de ambiente
- Ou buscar de API/configuração dinâmica

---

### 12. **Window.location.reload() no Register**

**Problema:** `pages/Register.tsx:96` usa `window.location.reload()`:

```typescript
setTimeout(() => {
    window.location.href = '/#/dashboard';
    window.location.reload();
}, 2000);
```

**Recomendação:**
- Usar `navigate()` do React Router
- Atualizar estado ao invés de recarregar página

---

## 📋 Resumo de Ações Recomendadas

### Prioridade Alta (Bugs)
1. ✅ Remover referências a `cnpj` em todos os arquivos
2. ✅ Adicionar proteção contra race condition no `AuthContext`
3. ✅ Remover arquivos duplicados em `src/`

### Prioridade Média (Simplificações)
4. ✅ Criar função helper `mapCompanyFromDB()`
5. ✅ Padronizar tratamento de erros com `Toast`
6. ✅ Mover lógica de self-healing para banco/triggers

### Prioridade Baixa (Melhorias)
7. ✅ Adicionar `initials` ao tipo `Company` ou criar helper
8. ✅ Adicionar validação de dados no Register
9. ✅ Substituir `window.location.reload()` por navegação React Router
10. ✅ Mover Price IDs para configuração

---

## 🔍 Arquivos para Revisar

### Duplicados (Remover)
- `src/lib/supabase.ts`
- `src/contexts/AuthContext.tsx`
- `src/data/companies.ts` (se não usado)

### Com Bugs
- `pages/Home.tsx` - Campo `cnpj`
- `pages/Admin.tsx` - Campo `cnpj` e busca
- `pages/CompanyProfile.tsx` - Campo `cnpj`
- `pages/CompanyDashboard.tsx` - Campo `cnpj`

### Com Simplificações Possíveis
- `pages/Register.tsx` - Retry logic e validação
- `contexts/AuthContext.tsx` - Self-healing e race condition
- Todos os arquivos com mapeamento manual

---

**Próximos Passos:**
1. Corrigir bugs críticos
2. Remover código duplicado
3. Simplificar lógica complexa
4. Criar testes com TestSprite
