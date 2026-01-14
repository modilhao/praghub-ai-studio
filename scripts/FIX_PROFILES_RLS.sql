-- ============================================
-- Script para Corrigir RLS na Tabela profiles
-- ============================================
-- Execute este script no SQL Editor do Supabase Dashboard

-- 1. Verificar se RLS está habilitado
-- SELECT tablename, rowsecurity FROM pg_tables WHERE tablename = 'profiles';
-- Se rowsecurity for false, execute:
-- ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 2. Remover políticas antigas (se existirem)
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can read all profiles" ON profiles;

-- 3. Política: Usuários podem ler seu próprio profile
CREATE POLICY "Users can read own profile"
ON profiles
FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- 4. Política: Usuários podem atualizar seu próprio profile
CREATE POLICY "Users can update own profile"
ON profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- 5. Política: Permitir inserção de profiles (para o trigger funcionar)
-- O trigger precisa poder inserir, então usamos SECURITY DEFINER na função
-- Mas também precisamos de uma política que permita inserção
CREATE POLICY "Allow profile creation"
ON profiles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- 6. Política: Admins podem ler todos os profiles
CREATE POLICY "Admins can read all profiles"
ON profiles
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.id = auth.uid()
    AND p.role = 'ADMIN'
  )
);

-- 7. Verificar se o trigger existe
-- SELECT trigger_name, event_manipulation, event_object_table
-- FROM information_schema.triggers
-- WHERE event_object_table = 'users' AND trigger_name = 'on_auth_user_created';

-- 8. Se o trigger não existir, criar:
-- CREATE OR REPLACE FUNCTION public.handle_new_user()
-- RETURNS TRIGGER
-- LANGUAGE plpgsql
-- SECURITY DEFINER SET search_path = public
-- AS $$
-- BEGIN
--   INSERT INTO public.profiles (id, email, name, picture, role)
--   VALUES (
--     NEW.id, 
--     NEW.email, 
--     COALESCE(NEW.raw_user_meta_data->>'name', NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
--     COALESCE(NEW.raw_user_meta_data->>'picture', NEW.raw_user_meta_data->>'avatar_url'),
--     'CUSTOMER'
--   )
--   ON CONFLICT (id) DO NOTHING;
--   RETURN NEW;
-- END;
-- $$;

-- CREATE TRIGGER on_auth_user_created
--   AFTER INSERT ON auth.users
--   FOR EACH ROW
--   EXECUTE FUNCTION public.handle_new_user();

-- 9. Testar políticas
-- Como usuário autenticado, deve conseguir ler seu próprio profile:
-- SELECT * FROM profiles WHERE id = auth.uid();
