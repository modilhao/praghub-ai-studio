# 🎯 Plano de Execução - Correções do Relatório de Análise

**Data de Criação:** Janeiro 2025  
**Baseado em:** `RELATORIO_ANALISE_COMPLETA.md`  
**Status:** 🟡 Aguardando Execução

---

## 📋 Visão Geral

Este plano organiza a execução de todas as correções identificadas no relatório de análise, priorizadas por impacto e complexidade.

**Total de Problemas:** 12  
**Prioridade Alta:** 3  
**Prioridade Média:** 3  
**Prioridade Baixa:** 6

---

## 🚨 FASE 1: Correções Críticas (Prioridade Alta)

### ✅ Tarefa 1.1: Remover Referências ao Campo `cnpj`

**Arquivos Afetados:**
- `pages/Home.tsx` (linha 53)
- `pages/Admin.tsx` (linhas 47, 144, 318)
- `pages/CompanyProfile.tsx` (linha 36)
- `pages/CompanyDashboard.tsx` (linha 39)

**Ações:**
1. [ ] Remover `cnpj: c.cnpj` do mapeamento em `Home.tsx`
2. [ ] Remover `cnpj: c.cnpj` do mapeamento em `Admin.tsx`
3. [ ] Remover busca por CNPJ em `Admin.tsx` (linha 144: `c.cnpj?.includes(searchTerm)`)
4. [ ] Remover exibição de CNPJ em `Admin.tsx` (linha 318)
5. [ ] Remover `cnpj: data.cnpj` do mapeamento em `CompanyProfile.tsx`
6. [ ] Remover `cnpj: comp.cnpj` do mapeamento em `CompanyDashboard.tsx`
7. [ ] Remover `cnpj?: string` do tipo `Company` em `types.ts` (se existir)
8. [ ] Testar que não há erros em runtime

**Estimativa:** 30 minutos  
**Risco:** Baixo

---

### ✅ Tarefa 1.2: Adicionar Proteção Contra Race Condition no AuthContext

**Arquivo:** `contexts/AuthContext.tsx`

**Ações:**
1. [ ] Adicionar `useRef` para rastrear promise em execução:
   ```typescript
   const fetchProfileRef = useRef<Promise<User | null> | null>(null);
   const currentUserIdRef = useRef<string | null>(null);
   const isFetchingRef = useRef<boolean>(false);
   ```

2. [ ] Modificar função `fetchProfile` para verificar se já está em execução:
   ```typescript
   if ((fetchProfileRef.current && currentUserIdRef.current === userId) || 
       (isFetchingRef.current && currentUserIdRef.current === userId)) {
     return fetchProfileRef.current || Promise.resolve(null);
   }
   ```

3. [ ] Marcar como "em execução" antes de iniciar:
   ```typescript
   isFetchingRef.current = true;
   currentUserIdRef.current = userId;
   ```

4. [ ] Limpar referências após conclusão (sucesso ou erro)
5. [ ] Testar múltiplos logins simultâneos

**Estimativa:** 45 minutos  
**Risco:** Médio (requer cuidado com lógica assíncrona)

---

### ✅ Tarefa 1.3: Remover Arquivos Duplicados

**Arquivos para Remover:**
- `src/lib/supabase.ts`
- `src/contexts/AuthContext.tsx`
- `src/data/companies.ts` (verificar se não é usado)

**Ações:**
1. [ ] Verificar se algum arquivo importa de `src/lib/supabase.ts`:
   ```bash
   grep -r "from.*src/lib/supabase" .
   ```

2. [ ] Verificar se algum arquivo importa de `src/contexts/AuthContext.tsx`:
   ```bash
   grep -r "from.*src/contexts/AuthContext" .
   ```

3. [ ] Verificar se `src/data/companies.ts` é usado:
   ```bash
   grep -r "from.*src/data/companies" .
   ```

4. [ ] Se não houver referências, remover arquivos:
   ```bash
   rm src/lib/supabase.ts
   rm src/contexts/AuthContext.tsx
   rm src/data/companies.ts  # se não usado
   ```

5. [ ] Verificar se build ainda funciona: `npm run build`

**Estimativa:** 15 minutos  
**Risco:** Baixo

---

## ⚠️ FASE 2: Simplificações (Prioridade Média)

### ✅ Tarefa 2.1: Criar Função Helper `mapCompanyFromDB()`

**Arquivo a Criar:** `lib/mappers.ts` ou adicionar em `lib/utils.ts`

**Ações:**
1. [ ] Criar função `mapCompanyFromDB(data: any): Company`:
   ```typescript
   export function mapCompanyFromDB(data: any): Company {
     return {
       id: data.id,
       userId: data.owner_id,
       name: data.name,
       description: data.description,
       rating: Number(data.rating),
       reviewsCount: data.reviews_count,
       whatsapp: data.whatsapp,
       location: data.location,
       city: data.city,
       state: data.state,
       imageUrl: data.image_url,
       isPremium: data.is_premium,
       status: data.status as any,
       services: data.services,
       createdAt: data.created_at,
       shortLocation: data.short_location,
       tags: data.tags,
       initials: data.name?.substring(0, 2).toUpperCase(),
       website: data.website,
       instagram: data.instagram,
       businessHours: data.business_hours,
       yearFounded: data.year_founded,
       ownerName: data.owner_name,
       methods: data.methods,
       gallery: data.gallery,
       certifications: data.certifications,
       serviceAreas: data.service_areas,
       specialties: data.specialties,
       priceRange: data.price_range
     };
   }
   ```

2. [ ] Substituir mapeamento manual em `Home.tsx`
3. [ ] Substituir mapeamento manual em `Admin.tsx`
4. [ ] Substituir mapeamento manual em `CompanyProfile.tsx`
5. [ ] Substituir mapeamento manual em `CompanyDashboard.tsx`
6. [ ] Testar que dados ainda são exibidos corretamente

**Estimativa:** 1 hora  
**Risco:** Baixo

---

### ✅ Tarefa 2.2: Padronizar Tratamento de Erros com Toast

**Ações:**
1. [ ] Criar hook `useToast()` em `hooks/useToast.ts`:
   ```typescript
   export function useToast() {
     const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
     
     const showToast = (message: string, type: 'success' | 'error' | 'info') => {
       setToast({ message, type });
     };
     
     return { toast, showToast, setToast };
   }
   ```

2. [ ] Substituir `alert()` em `Login.tsx` por `Toast`
3. [ ] Substituir `alert()` em `Register.tsx` por `Toast`
4. [ ] Verificar outros arquivos com `alert()`:
   ```bash
   grep -r "alert(" pages/
   ```

5. [ ] Substituir todos os `alert()` encontrados
6. [ ] Manter `console.error()` apenas para logs de debug (não remover)

**Estimativa:** 1 hora  
**Risco:** Baixo

---

### ✅ Tarefa 2.3: Mover Lógica de Self-Healing para Banco/Triggers

**Arquivo:** `contexts/AuthContext.tsx`

**Opção A: Criar Trigger no Banco (Recomendado)**
1. [ ] Criar trigger SQL que atualiza role quando empresa é criada:
   ```sql
   CREATE OR REPLACE FUNCTION update_user_role_on_company_create()
   RETURNS TRIGGER AS $$
   BEGIN
     UPDATE profiles
     SET role = 'COMPANY'
     WHERE id = NEW.owner_id
     AND role != 'ADMIN';
     RETURN NEW;
   END;
   $$ LANGUAGE plpgsql;

   CREATE TRIGGER trigger_update_role_on_company_create
   AFTER INSERT ON companies
   FOR EACH ROW
   EXECUTE FUNCTION update_user_role_on_company_create();
   ```

2. [ ] Remover lógica de self-healing do `AuthContext.tsx`
3. [ ] Testar criação de empresa e verificar role atualizado

**Opção B: Criar Função RPC no Supabase**
1. [ ] Criar função RPC `sync_user_role(profile_id UUID)`
2. [ ] Chamar função RPC após criar empresa em `Register.tsx`
3. [ ] Remover lógica de self-healing do `AuthContext.tsx`

**Estimativa:** 1 hora  
**Risco:** Médio (requer conhecimento SQL/triggers)

---

## 🔧 FASE 3: Melhorias (Prioridade Baixa)

### ✅ Tarefa 3.1: Adicionar `initials` ao Tipo Company ou Criar Helper

**Opção A: Adicionar ao Tipo (Recomendado)**
1. [ ] Adicionar `initials?: string` ao tipo `Company` em `types.ts`
2. [ ] Atualizar `mapCompanyFromDB()` para incluir `initials`

**Opção B: Criar Helper Function**
1. [ ] Criar função `getCompanyInitials(company: Company): string` em `lib/utils.ts`
2. [ ] Substituir `company.initials` por `getCompanyInitials(company)` onde usado

**Estimativa:** 15 minutos  
**Risco:** Baixo

---

### ✅ Tarefa 3.2: Adicionar Validação de Dados no Register

**Arquivo:** `pages/Register.tsx`

**Ações:**
1. [ ] Criar função de validação:
   ```typescript
   function validateFormData(data: typeof formData): string[] {
     const errors: string[] = [];
     
     if (!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
       errors.push('Email inválido');
     }
     
     if (!data.password || data.password.length < 6) {
       errors.push('Senha deve ter pelo menos 6 caracteres');
     }
     
     if (!data.companyName || data.companyName.length < 3) {
       errors.push('Nome da empresa deve ter pelo menos 3 caracteres');
     }
     
     if (!data.whatsapp || !/^[\d\s\(\)\-\+]+$/.test(data.whatsapp.replace(/\D/g, ''))) {
       errors.push('WhatsApp inválido');
     }
     
     return errors;
   }
   ```

2. [ ] Chamar validação antes de submit
3. [ ] Exibir erros usando `Toast`
4. [ ] Prevenir submit se houver erros

**Estimativa:** 45 minutos  
**Risco:** Baixo

---

### ✅ Tarefa 3.3: Substituir `window.location.reload()` por Navegação React Router

**Arquivo:** `pages/Register.tsx` (linha 96)

**Ações:**
1. [ ] Importar `useNavigate` (já importado)
2. [ ] Substituir:
   ```typescript
   // ANTES:
   setTimeout(() => {
     window.location.href = '/#/dashboard';
     window.location.reload();
   }, 2000);

   // DEPOIS:
   setTimeout(() => {
     navigate('/dashboard', { replace: true });
   }, 2000);
   ```

3. [ ] Testar redirecionamento após registro

**Estimativa:** 10 minutos  
**Risco:** Baixo

---

### ✅ Tarefa 3.4: Mover Price IDs para Configuração

**Arquivo:** `pages/Planos.tsx`

**Opção A: Variáveis de Ambiente (Recomendado)**
1. [ ] Criar arquivo `.env.example` com:
   ```
   VITE_STRIPE_PRICE_DIRECTORY=price_1SpTBFJULNOvBzJ46Hf2TCJK
   VITE_STRIPE_PRICE_DIRECTORY_ACADEMY=price_1SpTBGJULNOvBzJ4ZEmSu0zk
   VITE_STRIPE_PRICE_PREMIUM=price_1SpTBGJULNOvBzJ4P3WdhYfN
   ```

2. [ ] Atualizar `Planos.tsx` para usar:
   ```typescript
   priceId: import.meta.env.VITE_STRIPE_PRICE_DIRECTORY || 'price_1SpTBFJULNOvBzJ46Hf2TCJK',
   ```

3. [ ] Documentar no README

**Opção B: Arquivo de Configuração**
1. [ ] Criar `config/stripe.ts` com Price IDs
2. [ ] Importar em `Planos.tsx`

**Estimativa:** 30 minutos  
**Risco:** Baixo

---

### ✅ Tarefa 3.5: Simplificar Lógica de Retry no Register

**Arquivo:** `pages/Register.tsx`

**Ações:**
1. [ ] Verificar se trigger do banco cria profile automaticamente
2. [ ] Se sim, remover lógica de retry manual
3. [ ] Se não, criar trigger ou função RPC que garante criação
4. [ ] Simplificar código removendo loop de retry

**Estimativa:** 30 minutos  
**Risco:** Médio (depende de trigger do banco)

---

### ✅ Tarefa 3.6: Adicionar Helper para `getCompanyInitials()`

**Arquivo:** `lib/utils.ts` (criar se não existir)

**Ações:**
1. [ ] Criar função:
   ```typescript
   export function getCompanyInitials(company: Company | { name: string }): string {
     if (!company.name) return '??';
     return company.name
       .split(' ')
       .slice(0, 2)
       .map(word => word[0]?.toUpperCase() || '')
       .join('')
       .substring(0, 2);
   }
   ```

2. [ ] Usar em `Home.tsx` ao invés de `company.initials`
3. [ ] Usar em outros lugares onde `initials` é usado

**Estimativa:** 20 minutos  
**Risco:** Baixo

---

## 📊 Checklist de Execução

### Pré-requisitos
- [ ] Fazer backup do código atual (commit ou branch)
- [ ] Verificar que testes existentes ainda passam
- [ ] Ter acesso ao banco de dados Supabase (para triggers)

### Ordem de Execução Recomendada

**Dia 1: Correções Críticas**
1. [ ] Tarefa 1.1: Remover `cnpj` (30 min)
2. [ ] Tarefa 1.3: Remover arquivos duplicados (15 min)
3. [ ] Tarefa 1.2: Race condition no AuthContext (45 min)
4. [ ] Testar aplicação após correções críticas

**Dia 2: Simplificações**
5. [ ] Tarefa 2.1: Criar `mapCompanyFromDB()` (1h)
6. [ ] Tarefa 2.2: Padronizar erros com Toast (1h)
7. [ ] Tarefa 2.3: Mover self-healing para banco (1h)
8. [ ] Testar aplicação após simplificações

**Dia 3: Melhorias**
9. [ ] Tarefa 3.1: Adicionar `initials` (15 min)
10. [ ] Tarefa 3.2: Validação no Register (45 min)
11. [ ] Tarefa 3.3: Substituir `window.location.reload()` (10 min)
12. [ ] Tarefa 3.4: Mover Price IDs (30 min)
13. [ ] Tarefa 3.5: Simplificar retry (30 min)
14. [ ] Tarefa 3.6: Helper `getCompanyInitials()` (20 min)
15. [ ] Teste final completo

---

## 🧪 Testes Após Cada Fase

### Após Fase 1 (Correções Críticas)
- [ ] Login funciona corretamente
- [ ] Registro funciona corretamente
- [ ] Home exibe empresas sem erros
- [ ] Admin exibe empresas sem erros
- [ ] CompanyProfile exibe dados corretamente
- [ ] CompanyDashboard exibe dados corretamente

### Após Fase 2 (Simplificações)
- [ ] Mapeamento de dados ainda funciona
- [ ] Erros são exibidos via Toast
- [ ] Role é atualizado automaticamente ao criar empresa

### Após Fase 3 (Melhorias)
- [ ] Validação de formulário funciona
- [ ] Redirecionamento funciona sem reload
- [ ] Price IDs são carregados de configuração

---

## 📝 Notas Importantes

1. **Backup:** Sempre fazer commit antes de começar cada fase
2. **Testes:** Testar manualmente após cada tarefa
3. **Rollback:** Se algo quebrar, reverter para commit anterior
4. **Documentação:** Atualizar documentação se necessário

---

## 🎯 Métricas de Sucesso

- ✅ Zero referências a `cnpj` no código
- ✅ Zero arquivos duplicados em `src/`
- ✅ Zero race conditions no AuthContext
- ✅ Zero uso de `alert()` para erros do usuário
- ✅ 100% dos mapeamentos usando função helper
- ✅ 100% das validações implementadas

---

**Última Atualização:** Janeiro 2025  
**Status:** 🟡 Aguardando Execução
