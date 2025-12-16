# Como Obter a Service Role Key do Supabase

## Passo a Passo

1. Acesse o [Supabase Dashboard](https://app.supabase.com)
2. Selecione seu projeto
3. Vá em **Settings** (Configurações) no menu lateral
4. Clique em **API**
5. Na seção **Project API keys**, encontre a chave **`service_role`** (secret)
6. **⚠️ ATENÇÃO:** Esta chave tem acesso total ao banco de dados. NUNCA compartilhe ou commite no Git!

## Adicionar ao .env.local

Adicione a linha abaixo ao arquivo `.env.local`:

```env
SUPABASE_SERVICE_ROLE_KEY=sua-service-role-key-aqui
```

Depois execute:

```bash
npm run create-admin
```

