-- Script SQL para corrigir políticas de RLS na tabela companies
-- Execute este script no SQL Editor do Supabase Dashboard

-- ============================================
-- 1. REMOVER POLÍTICAS ANTIGAS (se necessário)
-- ============================================
-- IMPORTANTE: Execute estas linhas ANTES de criar as novas políticas
-- para evitar conflitos com políticas existentes
DROP POLICY IF EXISTS "Permitir leitura pública de empresas aprovadas" ON companies;
DROP POLICY IF EXISTS "Permitir leitura de empresas aprovadas" ON companies;
DROP POLICY IF EXISTS "Usuários podem ver próprias empresas e aprovadas" ON companies;
DROP POLICY IF EXISTS "Empresas podem ler próprios dados" ON companies;
DROP POLICY IF EXISTS "Empresas podem atualizar próprios dados" ON companies;
DROP POLICY IF EXISTS "Admins podem ler todas empresas" ON companies;
DROP POLICY IF EXISTS "Admins podem atualizar todas empresas" ON companies;
-- Remover política antiga do database_schema.sql se existir
DROP POLICY IF EXISTS "Companies are viewable by everyone" ON companies;
DROP POLICY IF EXISTS "Owners can update their own company" ON companies;

-- ============================================
-- 2. POLÍTICA PARA USUÁRIOS ANÔNIMOS (PÚBLICO)
-- ============================================
-- Permite que qualquer pessoa (não autenticada) veja empresas aprovadas
-- Funciona mesmo se owner_id for NULL (empresas migradas)
-- CORRIGIDO: Usa 'APPROVED' (inglês) conforme database_schema.sql
CREATE POLICY "Permitir leitura pública de empresas aprovadas"
ON companies
FOR SELECT
TO anon
USING (status = 'APPROVED');

-- ============================================
-- 3. POLÍTICA PARA USUÁRIOS AUTENTICADOS
-- ============================================
-- Permite que usuários autenticados vejam:
-- - Suas próprias empresas (se tiverem owner_id)
-- - Empresas aprovadas (incluindo as com owner_id NULL)
-- CORRIGIDO: Usa 'APPROVED' (inglês) conforme database_schema.sql
CREATE POLICY "Usuários podem ver próprias empresas e aprovadas"
ON companies
FOR SELECT
TO authenticated
USING (
  auth.uid() = owner_id 
  OR status = 'APPROVED'
);

-- Permite que empresas atualizem apenas suas próprias empresas
CREATE POLICY "Empresas podem atualizar próprios dados"
ON companies
FOR UPDATE
TO authenticated
USING (auth.uid() = owner_id)
WITH CHECK (auth.uid() = owner_id);

-- ============================================
-- 4. POLÍTICA PARA ADMINS
-- ============================================
-- Admins podem ler todas as empresas (independente de status ou owner_id)
-- CORRIGIDO: Usa 'ADMIN' (uppercase) conforme database_schema.sql e types.ts
CREATE POLICY "Admins podem ler todas empresas"
ON companies
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'ADMIN'
  )
);

-- Admins podem atualizar todas as empresas
-- CORRIGIDO: Usa 'ADMIN' (uppercase) conforme database_schema.sql e types.ts
CREATE POLICY "Admins podem atualizar todas empresas"
ON companies
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'ADMIN'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'ADMIN'
  )
);

-- ============================================
-- 5. VERIFICAR SE RLS ESTÁ HABILITADO
-- ============================================
-- Execute este comando para verificar:
-- SELECT tablename, rowsecurity FROM pg_tables WHERE tablename = 'companies';

-- Se rowsecurity for false, habilite com:
-- ALTER TABLE companies ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 6. TESTAR AS POLÍTICAS
-- ============================================
-- CORRIGIDO: Usa 'APPROVED' (inglês) nos testes
-- Teste como usuário anônimo:
-- SET ROLE anon;
-- SELECT COUNT(*) FROM companies WHERE status = 'APPROVED';
-- SELECT * FROM companies WHERE status = 'APPROVED' LIMIT 5;
-- RESET ROLE;

-- Teste como usuário autenticado (não-admin):
-- SET ROLE authenticated;
-- SELECT COUNT(*) FROM companies WHERE status = 'APPROVED';
-- SELECT * FROM companies WHERE status = 'APPROVED' LIMIT 5;
-- RESET ROLE;

-- Teste como admin (deve ver todas, incluindo PENDING e REJECTED):
-- SET ROLE authenticated;
-- -- Execute como usuário com role = 'ADMIN' no profiles
-- SELECT COUNT(*) FROM companies;
-- SELECT * FROM companies LIMIT 10;
-- RESET ROLE;

