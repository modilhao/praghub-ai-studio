-- Script SQL para validar políticas RLS após correções do EPIC 00
-- Execute este script no SQL Editor do Supabase Dashboard
-- IMPORTANTE: Execute como usuário com permissões adequadas

-- ============================================
-- 1. VERIFICAR ESTRUTURA DE POLÍTICAS
-- ============================================
-- Lista todas as políticas da tabela companies
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'companies'
ORDER BY policyname;

-- ============================================
-- 2. VERIFICAR SE RLS ESTÁ HABILITADO
-- ============================================
SELECT 
    tablename, 
    rowsecurity,
    CASE 
        WHEN rowsecurity THEN '✅ RLS HABILITADO'
        ELSE '❌ RLS DESABILITADO - HABILITE COM: ALTER TABLE companies ENABLE ROW LEVEL SECURITY;'
    END as status
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename = 'companies';

-- ============================================
-- 3. CONTAR EMPRESAS POR STATUS
-- ============================================
-- Verificar distribuição de empresas (executar como service_role)
SELECT 
    status,
    COUNT(*) as total,
    COUNT(*) FILTER (WHERE owner_id IS NULL) as sem_owner,
    COUNT(*) FILTER (WHERE owner_id IS NOT NULL) as com_owner
FROM companies
GROUP BY status
ORDER BY status;

-- ============================================
-- 4. TESTES DE ACESSO (SIMULAÇÃO)
-- ============================================
-- NOTA: Estes testes devem ser executados manualmente com diferentes roles
-- ou via Supabase Dashboard testando com diferentes usuários

-- Teste 1: Como anônimo (deve ver apenas APPROVED)
-- SET ROLE anon;
-- SELECT COUNT(*) as total_approved_anon FROM companies WHERE status = 'APPROVED';
-- SELECT COUNT(*) as total_all_anon FROM companies; -- Deve ser igual ao anterior
-- RESET ROLE;

-- Teste 2: Como usuário autenticado não-admin (deve ver APPROVED + própria empresa)
-- SET ROLE authenticated;
-- -- Substitua 'USER_UUID_AQUI' pelo UUID de um usuário COMPANY
-- SELECT COUNT(*) as total_authenticated FROM companies 
-- WHERE status = 'APPROVED' OR owner_id = 'USER_UUID_AQUI';
-- RESET ROLE;

-- Teste 3: Como admin (deve ver TODAS as empresas)
-- SET ROLE authenticated;
-- -- Execute como usuário com role = 'ADMIN' no profiles
-- SELECT COUNT(*) as total_admin FROM companies; -- Deve ver todas
-- SELECT COUNT(*) as total_pending_admin FROM companies WHERE status = 'PENDING';
-- SELECT COUNT(*) as total_rejected_admin FROM companies WHERE status = 'REJECTED';
-- RESET ROLE;

-- ============================================
-- 5. VALIDAR EMPRESAS MIGRADAS (owner_id = NULL)
-- ============================================
-- Verificar se empresas APPROVED com owner_id NULL existem
-- (estas devem aparecer no diretório público)
SELECT 
    id,
    name,
    status,
    owner_id,
    CASE 
        WHEN owner_id IS NULL THEN '⚠️ Empresa migrada (sem owner)'
        ELSE '✅ Empresa com owner'
    END as tipo
FROM companies
WHERE status = 'APPROVED' AND owner_id IS NULL
ORDER BY created_at DESC
LIMIT 10;

-- ============================================
-- 6. VERIFICAR ÍNDICES
-- ============================================
-- Validar se os índices foram criados corretamente
SELECT 
    indexname,
    indexdef
FROM pg_indexes 
WHERE tablename = 'companies' 
AND indexname LIKE 'idx_companies%'
ORDER BY indexname;

-- ============================================
-- 7. VERIFICAR CAMPO SLUG
-- ============================================
-- Validar se o campo slug foi adicionado
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'companies' 
AND column_name = 'slug';

-- ============================================
-- 8. CHECKLIST DE VALIDAÇÃO
-- ============================================
-- Execute manualmente e verifique:

-- [ ] RLS está habilitado na tabela companies
-- [ ] Existem políticas para anon, authenticated e admin
-- [ ] Política anon usa 'APPROVED' (não 'Aprovado')
-- [ ] Política admin verifica role = 'ADMIN' (não 'admin')
-- [ ] Empresas APPROVED com owner_id NULL aparecem para anônimos
-- [ ] Empresas PENDING aparecem apenas para owner ou admin
-- [ ] Admin vê todas as empresas (PENDING, APPROVED, REJECTED)
-- [ ] Campo slug existe e é nullable
-- [ ] Índices foram criados (status, owner_id, slug)
-- [ ] Nenhum erro ao executar queries em Home.tsx, Admin.tsx, etc.

-- ============================================
-- 9. QUERIES DE TESTE RÁPIDO
-- ============================================
-- Execute estas queries para validar rapidamente:

-- Total de empresas aprovadas (deve funcionar para anônimo)
-- SELECT COUNT(*) FROM companies WHERE status = 'APPROVED';

-- Empresas aprovadas sem owner (devem aparecer no diretório)
-- SELECT COUNT(*) FROM companies WHERE status = 'APPROVED' AND owner_id IS NULL;

-- Verificar se há empresas com status incorreto
-- SELECT DISTINCT status FROM companies;

-- Verificar roles dos usuários (deve ter 'ADMIN', 'COMPANY', 'CUSTOMER')
-- SELECT DISTINCT role FROM profiles;
