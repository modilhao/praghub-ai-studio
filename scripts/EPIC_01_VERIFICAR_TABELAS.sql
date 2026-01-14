-- ============================================
-- EPIC 01: Verificar Tabelas e Estrutura
-- Execute este script no Supabase SQL Editor
-- ============================================

-- 1. Verificar se tabelas existem
SELECT 
    table_name,
    CASE 
        WHEN table_name IN ('subscriptions', 'entitlements', 'webhook_events') THEN '✅ Existe'
        ELSE '❌ Não existe'
    END as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('subscriptions', 'entitlements', 'webhook_events')
ORDER BY table_name;

-- 2. Verificar estrutura da tabela subscriptions (se existe)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'subscriptions') THEN
        RAISE NOTICE 'Tabela subscriptions existe. Verificando colunas...';
    ELSE
        RAISE WARNING 'Tabela subscriptions NÃO existe. Execute scripts/EPIC_01_CREATE_TABLES.sql';
    END IF;
END $$;

-- 3. Verificar estrutura da tabela entitlements (se existe)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'entitlements') THEN
        RAISE NOTICE 'Tabela entitlements existe. Verificando colunas...';
    ELSE
        RAISE WARNING 'Tabela entitlements NÃO existe. Execute scripts/EPIC_01_CREATE_TABLES.sql';
    END IF;
END $$;

-- 4. Verificar estrutura da tabela webhook_events (se existe)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'webhook_events') THEN
        RAISE NOTICE 'Tabela webhook_events existe. Verificando colunas...';
    ELSE
        RAISE WARNING 'Tabela webhook_events NÃO existe. Execute scripts/EPIC_01_CREATE_TABLES.sql';
    END IF;
END $$;

-- 5. Verificar RLS está habilitado
SELECT 
    tablename,
    rowsecurity as rls_enabled,
    CASE 
        WHEN rowsecurity THEN '✅ RLS Habilitado'
        ELSE '❌ RLS Desabilitado'
    END as status
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('subscriptions', 'entitlements', 'webhook_events')
ORDER BY tablename;

-- 6. Verificar políticas RLS
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd as command,
    qual as using_expression
FROM pg_policies 
WHERE schemaname = 'public'
AND tablename IN ('subscriptions', 'entitlements', 'webhook_events')
ORDER BY tablename, policyname;

-- 7. Verificar função sync_entitlements_from_subscription existe
SELECT 
    proname as function_name,
    CASE 
        WHEN proname = 'sync_entitlements_from_subscription' THEN '✅ Existe'
        ELSE '❌ Não existe'
    END as status
FROM pg_proc 
WHERE proname = 'sync_entitlements_from_subscription';

-- 8. Verificar índices
SELECT 
    tablename,
    indexname,
    indexdef
FROM pg_indexes 
WHERE schemaname = 'public'
AND tablename IN ('subscriptions', 'entitlements', 'webhook_events')
ORDER BY tablename, indexname;

-- 9. Contar registros (se tabelas existem)
SELECT 
    'subscriptions' as tabela,
    COUNT(*) as total_registros
FROM subscriptions
WHERE EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'subscriptions')
UNION ALL
SELECT 
    'entitlements' as tabela,
    COUNT(*) as total_registros
FROM entitlements
WHERE EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'entitlements')
UNION ALL
SELECT 
    'webhook_events' as tabela,
    COUNT(*) as total_registros
FROM webhook_events
WHERE EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'webhook_events');
