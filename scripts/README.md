# Scripts de Setup

## Criar Usuário Admin

Este script cria o usuário administrador no Supabase.

### Pré-requisitos

1. Você precisa da **Service Role Key** do Supabase:
   - Acesse: Supabase Dashboard > Settings > API
   - Copie a chave `service_role` (secret) - **NÃO compartilhe essa chave!**

### Como usar

**Opção 1: Usando variáveis de ambiente**

Crie um arquivo `.env.local` na raiz do projeto com:

```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_SERVICE_ROLE_KEY=sua-service-role-key-aqui
```

Depois execute:

```bash
npm run create-admin
```

**Opção 2: Passando variáveis diretamente**

```bash
VITE_SUPABASE_URL=https://seu-projeto.supabase.co SUPABASE_SERVICE_ROLE_KEY=sua-key npm run create-admin
```

### Credenciais criadas

- **Email:** `admin@praghub.com`
- **Senha:** `password`

⚠️ **Importante:** Altere a senha após o primeiro login!

