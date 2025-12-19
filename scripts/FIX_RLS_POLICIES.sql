-- Script SQL para corrigir políticas de RLS na tabela companies
-- Execute este script no SQL Editor do Supabase Dashboard

-- ============================================
-- 1. REMOVER POLÍTICAS ANTIGAS (se necessário)
-- ============================================
-- Descomente as linhas abaixo se precisar remover políticas existentes
-- DROP POLICY IF EXISTS "Permitir leitura de empresas aprovadas" ON companies;
-- DROP POLICY IF EXISTS "Empresas podem ler próprios dados" ON companies;
-- DROP POLICY IF EXISTS "Admins podem ler todas empresas" ON companies;

-- ============================================
-- 2. POLÍTICA PARA USUÁRIOS ANÔNIMOS (PÚBLICO)
-- ============================================
-- Permite que qualquer pessoa (não autenticada) veja empresas aprovadas
-- Funciona mesmo se owner_id for NULL
CREATE POLICY "Permitir leitura pública de empresas aprovadas"
ON companies
FOR SELECT
TO anon
USING (status = 'Aprovado');

-- ============================================
-- 3. POLÍTICA PARA USUÁRIOS AUTENTICADOS
-- ============================================
-- Permite que usuários autenticados vejam:
-- - Suas próprias empresas (se tiverem owner_id)
-- - Empresas aprovadas (incluindo as com owner_id NULL)
CREATE POLICY "Usuários podem ver próprias empresas e aprovadas"
ON companies
FOR SELECT
TO authenticated
USING (
  auth.uid() = owner_id 
  OR status = 'Aprovado'
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
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
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
-- Teste como usuário anônimo:
-- SET ROLE anon;
-- SELECT COUNT(*) FROM companies WHERE status = 'Aprovado';
-- RESET ROLE;

-- Teste como usuário autenticado:
-- SET ROLE authenticated;
-- SELECT COUNT(*) FROM companies WHERE status = 'Aprovado';
-- RESET ROLE;

