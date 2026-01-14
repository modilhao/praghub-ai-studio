-- Script SQL para EPIC 00 - Story 00.3: Preparação para Slugs
-- Adiciona campo slug e índices essenciais na tabela companies
-- Execute este script no SQL Editor do Supabase Dashboard

-- ============================================
-- 1. ADICIONAR CAMPO SLUG
-- ============================================
-- Campo nullable para permitir migração gradual
-- URLs antigas (UUID) continuam funcionando
ALTER TABLE companies 
ADD COLUMN IF NOT EXISTS slug TEXT;

-- Comentário explicativo
COMMENT ON COLUMN companies.slug IS 'URL-friendly identifier. Nullable para manter compatibilidade com UUIDs existentes.';

-- ============================================
-- 2. CRIAR ÍNDICES ESSENCIAIS
-- ============================================
-- Índice para status (usado em todas as queries públicas)
CREATE INDEX IF NOT EXISTS idx_companies_status 
ON companies(status) 
WHERE status = 'APPROVED';

-- Índice para owner_id (usado em dashboard e RLS)
CREATE INDEX IF NOT EXISTS idx_companies_owner_id 
ON companies(owner_id) 
WHERE owner_id IS NOT NULL;

-- Índice único para slug (quando preenchido)
-- Permite busca rápida por slug e garante unicidade
CREATE UNIQUE INDEX IF NOT EXISTS idx_companies_slug_unique 
ON companies(slug) 
WHERE slug IS NOT NULL;

-- Índice composto para busca comum (status + is_premium)
-- Otimiza queries do diretório que filtram por status e ordenam por premium
CREATE INDEX IF NOT EXISTS idx_companies_status_premium 
ON companies(status, is_premium DESC) 
WHERE status = 'APPROVED';

-- ============================================
-- 3. VALIDAR ESTRUTURA
-- ============================================
-- Verificar se o campo foi criado:
-- SELECT column_name, data_type, is_nullable 
-- FROM information_schema.columns 
-- WHERE table_name = 'companies' AND column_name = 'slug';

-- Verificar índices criados:
-- SELECT indexname, indexdef 
-- FROM pg_indexes 
-- WHERE tablename = 'companies' 
-- ORDER BY indexname;

-- ============================================
-- 4. NOTAS IMPORTANTES
-- ============================================
-- - Campo slug é nullable: empresas existentes continuam usando UUID nas URLs
-- - Índices parciais (WHERE) são mais eficientes e ocupam menos espaço
-- - Índice único em slug garante que não haverá duplicatas quando preenchido
-- - Migração para slugs será gradual (não faz parte do EPIC_00)
-- - Rotas atuais (/company/:id) continuam funcionando com UUID
