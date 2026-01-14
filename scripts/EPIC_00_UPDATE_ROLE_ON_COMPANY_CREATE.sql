-- ============================================
-- Trigger: Atualizar role do usuário quando empresa é criada
-- ============================================
-- Este trigger garante que quando uma empresa é criada,
-- o role do usuário (owner_id) seja automaticamente atualizado para 'COMPANY'
-- Isso elimina a necessidade de lógica de "self-healing" no frontend

-- Função que será executada pelo trigger
CREATE OR REPLACE FUNCTION update_user_role_on_company_create()
RETURNS TRIGGER AS $$
BEGIN
  -- Atualiza o role do usuário para 'COMPANY' se ele não for ADMIN
  -- e se a empresa foi criada com sucesso
  IF NEW.owner_id IS NOT NULL THEN
    UPDATE profiles
    SET role = 'COMPANY'
    WHERE id = NEW.owner_id
      AND role != 'ADMIN';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger que executa a função após inserir uma empresa
DROP TRIGGER IF EXISTS trigger_update_role_on_company_create ON companies;
CREATE TRIGGER trigger_update_role_on_company_create
  AFTER INSERT ON companies
  FOR EACH ROW
  EXECUTE FUNCTION update_user_role_on_company_create();

-- Comentário explicativo
COMMENT ON FUNCTION update_user_role_on_company_create() IS 
  'Atualiza automaticamente o role do usuário para COMPANY quando uma empresa é criada';

COMMENT ON TRIGGER trigger_update_role_on_company_create ON companies IS 
  'Trigger que atualiza o role do usuário para COMPANY após criar empresa';
