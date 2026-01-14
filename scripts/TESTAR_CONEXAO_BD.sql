-- ============================================
-- Script de Teste de Conexão e Diagnóstico
-- ============================================
-- Execute este script no Supabase SQL Editor para diagnosticar problemas

-- 1. Verificar se há empresas aprovadas
SELECT 
    COUNT(*) as total_approved,
    COUNT(CASE WHEN owner_id IS NULL THEN 1 END) as sem_owner,
    COUNT(CASE WHEN owner_id IS NOT NULL THEN 1 END) as com_owner
FROM companies 
WHERE status = 'APPROVED';

-- 2. Listar algumas empresas aprovadas
SELECT 
    id,
    name,
    status,
    owner_id,
    location,
    whatsapp,
    is_premium,
    created_at
FROM companies 
WHERE status = 'APPROVED'
ORDER BY created_at DESC
LIMIT 10;

-- 3. Verificar profiles
SELECT 
    id,
    email,
    name,
    role,
    created_at
FROM profiles
ORDER BY created_at DESC
LIMIT 10;

-- 4. Verificar se há empresas sem location ou whatsapp
SELECT 
    COUNT(*) as total,
    COUNT(CASE WHEN location IS NULL OR location = '' THEN 1 END) as sem_location,
    COUNT(CASE WHEN whatsapp IS NULL OR whatsapp = '' THEN 1 END) as sem_whatsapp
FROM companies
WHERE status = 'APPROVED';

-- 5. Verificar políticas RLS na tabela companies
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

-- 6. Testar query como anônimo (simular)
-- Descomente para testar:
-- SET ROLE anon;
-- SELECT COUNT(*) FROM companies WHERE status = 'APPROVED';
-- RESET ROLE;

-- 7. Verificar se trigger de role existe
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement
FROM information_schema.triggers
WHERE event_object_table = 'companies'
ORDER BY trigger_name;

-- 8. Verificar índices
SELECT 
    indexname,
    indexdef
FROM pg_indexes
WHERE tablename = 'companies'
ORDER BY indexname;
