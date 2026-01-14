# EPIC 00 - Core Fixes & Launch Readiness

## 📋 Scripts Criados

Este diretório contém os scripts SQL necessários para corrigir problemas críticos que impedem o lançamento do PragHub.

### 1. `FIX_RLS_POLICIES.sql` ✅ CORRIGIDO
**Status:** Pronto para execução

**Correções aplicadas:**
- ✅ Substituído `'Aprovado'` por `'APPROVED'` (conforme database_schema.sql)
- ✅ Substituído `'admin'` por `'ADMIN'` (conforme database_schema.sql e types.ts)
- ✅ Adicionado DROP de políticas antigas antes de criar novas
- ✅ Políticas garantem que empresas com `owner_id = NULL` apareçam para anônimos

**O que faz:**
- Remove políticas antigas conflitantes
- Cria políticas RLS corretas para:
  - **Anônimos:** Veem apenas empresas `status = 'APPROVED'` (incluindo `owner_id = NULL`)
  - **Autenticados:** Veem próprias empresas + empresas `APPROVED`
  - **Admins:** Veem todas as empresas (independente de status)

**Como executar:**
1. Acesse o Supabase Dashboard → SQL Editor
2. Cole o conteúdo completo de `FIX_RLS_POLICIES.sql`
3. Execute o script
4. Valide com `EPIC_00_VALIDATE_RLS.sql`

---

### 2. `EPIC_00_ADD_SLUG_AND_INDEXES.sql` ✅ NOVO
**Status:** Pronto para execução

**O que faz:**
- Adiciona campo `slug TEXT NULL` na tabela `companies`
- Cria índices essenciais para performance:
  - `idx_companies_status` - Otimiza queries por status
  - `idx_companies_owner_id` - Otimiza queries do dashboard
  - `idx_companies_slug_unique` - Garante unicidade de slugs
  - `idx_companies_status_premium` - Otimiza diretório (status + premium)

**Notas importantes:**
- Campo `slug` é nullable: URLs antigas (UUID) continuam funcionando
- Índices são parciais (WHERE) para melhor performance
- Migração para slugs será gradual (não faz parte do EPIC_00)

**Como executar:**
1. Acesse o Supabase Dashboard → SQL Editor
2. Cole o conteúdo completo de `EPIC_00_ADD_SLUG_AND_INDEXES.sql`
3. Execute o script
4. Valide com `EPIC_00_VALIDATE_RLS.sql` (seção 6 e 7)

---

### 3. `EPIC_00_VALIDATE_RLS.sql` ✅ NOVO
**Status:** Script de validação

**O que faz:**
- Lista todas as políticas RLS da tabela `companies`
- Verifica se RLS está habilitado
- Conta empresas por status
- Valida empresas migradas (`owner_id = NULL`)
- Verifica índices criados
- Verifica campo `slug`
- Fornece checklist de validação

**Como usar:**
1. Execute após `FIX_RLS_POLICIES.sql`
2. Execute após `EPIC_00_ADD_SLUG_AND_INDEXES.sql`
3. Use o checklist (seção 8) para validar manualmente
4. Execute queries de teste (seção 9) para validação rápida

---

## 🚀 Ordem de Execução Recomendada

### Passo 1: Backup (Opcional mas Recomendado)
```sql
-- Exportar políticas atuais (caso precise reverter)
SELECT * FROM pg_policies WHERE tablename = 'companies';
```

### Passo 2: Executar Correções RLS
```bash
# No Supabase Dashboard → SQL Editor
# Execute: FIX_RLS_POLICIES.sql
```

### Passo 3: Adicionar Slug e Índices
```bash
# No Supabase Dashboard → SQL Editor
# Execute: EPIC_00_ADD_SLUG_AND_INDEXES.sql
```

### Passo 4: Validar
```bash
# No Supabase Dashboard → SQL Editor
# Execute: EPIC_00_VALIDATE_RLS.sql
# Revise os resultados e complete o checklist
```

### Passo 5: Testar na Aplicação
1. Teste `/demonstracao` (Home.tsx) - deve mostrar empresas APPROVED
2. Teste `/company/:id` - deve funcionar para empresas APPROVED
3. Teste `/dashboard` - deve mostrar empresa própria (se COMPANY)
4. Teste `/admin` - deve mostrar todas as empresas (se ADMIN)

---

## ✅ Checklist de Validação Pós-Execução

### RLS Policies
- [ ] RLS está habilitado na tabela `companies`
- [ ] Política para `anon` existe e usa `status = 'APPROVED'`
- [ ] Política para `authenticated` existe e permite próprias + APPROVED
- [ ] Política para `ADMIN` existe e verifica `role = 'ADMIN'`
- [ ] Empresas APPROVED com `owner_id = NULL` aparecem para anônimos
- [ ] Empresas PENDING aparecem apenas para owner ou admin
- [ ] Admin vê todas as empresas (PENDING, APPROVED, REJECTED)

### Estrutura de Dados
- [ ] Campo `slug` existe na tabela `companies` (nullable)
- [ ] Índice `idx_companies_status` foi criado
- [ ] Índice `idx_companies_owner_id` foi criado
- [ ] Índice `idx_companies_slug_unique` foi criado
- [ ] Índice `idx_companies_status_premium` foi criado

### Funcionalidade
- [ ] `/demonstracao` carrega empresas APPROVED (incluindo `owner_id = NULL`)
- [ ] `/company/:id` funciona para empresas APPROVED
- [ ] `/dashboard` mostra empresa própria (se COMPANY)
- [ ] `/admin` mostra todas as empresas (se ADMIN)
- [ ] Nenhum erro de console relacionado a RLS
- [ ] URLs antigas (UUID) continuam funcionando

---

## ⚠️ Problemas Conhecidos e Limitações

### Empresas Migradas (`owner_id = NULL`)
- **Status:** ✅ Resolvido para diretório público
- **Limitação:** Empresas migradas não aparecem no dashboard de usuários (esperado)
- **Solução futura:** Fluxo de "claim company" (adiado para pós-launch)

### Campo Slug
- **Status:** ✅ Preparado (campo existe, nullable)
- **Limitação:** URLs ainda usam UUID (slug será implementado gradualmente)
- **Impacto:** Nenhum - URLs atuais continuam funcionando

---

## 📝 Notas Técnicas

### Valores Corretos
- **Status:** `'APPROVED'` (não `'Aprovado'`)
- **Role:** `'ADMIN'` (não `'admin'`)
- **Roles válidos:** `'ADMIN'`, `'COMPANY'`, `'CUSTOMER'`

### Arquivos React Validados
- ✅ `pages/Home.tsx` - Usa `'APPROVED'` corretamente
- ✅ `pages/CompanyProfile.tsx` - Query genérica (RLS filtra)
- ✅ `pages/Admin.tsx` - Query genérica (RLS de admin permite tudo)
- ✅ `pages/CompanyDashboard.tsx` - Filtra por `owner_id` (correto)

### Rollback (Se Necessário)
Se precisar reverter as políticas:
```sql
-- Remover políticas novas
DROP POLICY IF EXISTS "Permitir leitura pública de empresas aprovadas" ON companies;
DROP POLICY IF EXISTS "Usuários podem ver próprias empresas e aprovadas" ON companies;
DROP POLICY IF EXISTS "Empresas podem atualizar próprios dados" ON companies;
DROP POLICY IF EXISTS "Admins podem ler todas empresas" ON companies;
DROP POLICY IF EXISTS "Admins podem atualizar todas empresas" ON companies;

-- Recriar política antiga (do database_schema.sql)
CREATE POLICY "Companies are viewable by everyone" 
ON companies FOR SELECT 
USING (status = 'APPROVED' OR auth.uid() = owner_id);
```

---

## 🎯 Próximos Passos

Após validar o EPIC_00:
1. ✅ EPIC_01: Billing and Plans (depende de RLS funcionando)
2. ✅ EPIC_02: Directory Core (depende de empresas aparecendo)
3. ⏳ Migração gradual para slugs (não crítico para launch)

---

**Última atualização:** Janeiro 2025  
**Status:** ✅ Pronto para execução
