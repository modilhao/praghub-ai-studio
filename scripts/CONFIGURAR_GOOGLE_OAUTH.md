# Configurar Google OAuth no Supabase

Este guia explica como configurar a autenticação OAuth do Google no Supabase para o projeto PragHub.

## Pré-requisitos

- Acesso ao [Google Cloud Console](https://console.cloud.google.com)
- Acesso ao [Supabase Dashboard](https://app.supabase.com)
- Projeto Supabase: `nkbcpwbgvesbkaebmkkw`
- URL do Projeto: `https://nkbcpwbgvesbkaebmkkw.supabase.co`

## Passo 1: Criar Credenciais OAuth no Google Cloud Console

### 1.1 Acessar Google Cloud Console

1. Acesse [Google Cloud Console](https://console.cloud.google.com)
2. Selecione um projeto existente ou crie um novo
3. Vá em **APIs & Services** → **Credentials**

### 1.2 Habilitar Google+ API

1. Vá em **APIs & Services** → **Library**
2. Procure por "Google+ API" ou "Google Identity Services"
3. Clique em **Enable** (se ainda não estiver habilitado)

### 1.3 Criar Credenciais OAuth 2.0

1. Vá em **APIs & Services** → **Credentials**
2. Clique em **+ CREATE CREDENTIALS** → **OAuth client ID**
3. Se solicitado, configure a tela de consentimento OAuth:
   - Tipo de usuário: **External** (para desenvolvimento) ou **Internal** (para G Suite)
   - Preencha as informações necessárias
   - Adicione scopes: `email`, `profile`, `openid`
4. Configure o OAuth client:
   - **Application type**: Web application
   - **Name**: PragHub Auth (ou outro nome de sua escolha)
   - **Authorized JavaScript origins**:
     - `http://localhost:5173` (desenvolvimento)
     - `https://nkbcpwbgvesbkaebmkkw.supabase.co` (Supabase callback)
   - **Authorized redirect URIs**:
     - `https://nkbcpwbgvesbkaebmkkw.supabase.co/auth/v1/callback` (obrigatório)
     - `http://localhost:5173/auth/v1/callback` (opcional, para desenvolvimento local)
5. Clique em **Create**
6. **Copie o Client ID e Client Secret** (você precisará deles no próximo passo)

## Passo 2: Configurar Google Provider no Supabase

### 2.1 Acessar Supabase Dashboard

1. Acesse [Supabase Dashboard](https://app.supabase.com)
2. Selecione o projeto: **Praghub-Ai-Studio** (ref: `nkbcpwbgvesbkaebmkkw`)
3. Vá em **Authentication** → **Providers**

### 2.2 Habilitar Google Provider

1. Na lista de providers, encontre **Google**
2. Clique no toggle para **habilitar** o provider
3. Preencha os campos:
   - **Client ID (for OAuth)**: Cole o Client ID obtido no Google Cloud Console
   - **Client Secret (for OAuth)**: Cole o Client Secret obtido no Google Cloud Console
4. Clique em **Save**

### 2.3 Verificar Redirect URL

O Supabase já configura automaticamente o redirect URL como:
```
https://nkbcpwbgvesbkaebmkkw.supabase.co/auth/v1/callback
```

Certifique-se de que esta URL está configurada no Google Cloud Console (Passo 1.3).

## Passo 3: Testar a Configuração

### 3.1 Testar Login

1. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```

2. Acesse `http://localhost:5173/#/login`

3. Clique no botão **"Continuar com Google"**

4. Você deve ser redirecionado para o Google para autorizar

5. Após autorizar, você será redirecionado de volta para o app

6. Verifique se o usuário foi criado em **Authentication** → **Users** no Supabase Dashboard

### 3.2 Verificar Criação de Profile

1. Após login bem-sucedido, verifique se um profile foi criado automaticamente
2. Vá em **Table Editor** → **profiles**
3. Deve haver um registro com o ID do usuário autenticado

## Troubleshooting

### Erro: "redirect_uri_mismatch"

- **Causa**: A URL de redirecionamento no Google Cloud Console não corresponde à URL do Supabase
- **Solução**: Adicione `https://nkbcpwbgvesbkaebmkkw.supabase.co/auth/v1/callback` nas **Authorized redirect URIs** do Google Cloud Console

### Erro: "invalid_client"

- **Causa**: Client ID ou Client Secret incorretos no Supabase Dashboard
- **Solução**: Verifique se copiou corretamente as credenciais do Google Cloud Console

### Usuário não é redirecionado após login

- **Causa**: O `redirectTo` no código pode estar incorreto
- **Solução**: Verifique o arquivo `contexts/AuthContext.tsx` - o `redirectTo` deve ser `${window.location.origin}/#/dashboard`

### Profile não é criado automaticamente

- **Causa**: Trigger `handle_new_user()` pode não estar funcionando
- **Solução**: Verifique se a trigger está criada no banco de dados (deve criar profile automaticamente quando um usuário é criado)

## URLs Importantes

- **Supabase Dashboard**: https://app.supabase.com/project/nkbcpwbgvesbkaebmkkw
- **Google Cloud Console**: https://console.cloud.google.com
- **Supabase Auth Settings**: https://app.supabase.com/project/nkbcpwbgvesbkaebmkkw/auth/providers
- **Callback URL**: `https://nkbcpwbgvesbkaebmkkw.supabase.co/auth/v1/callback`

## Próximos Passos

Após configurar o Google OAuth:

1. ✅ Testar login com Google
2. ✅ Testar registro com Google
3. ✅ Verificar criação automática de profile
4. ✅ Configurar URLs de produção no Google Cloud Console (quando fizer deploy)
5. ✅ Atualizar `redirectTo` para URL de produção

## Notas

- O Client Secret **NUNCA** deve ser exposto no frontend
- O Client Secret deve estar apenas no Supabase Dashboard
- Para produção, adicione a URL de produção nas **Authorized redirect URIs** do Google Cloud Console
- O Supabase gerencia automaticamente o fluxo OAuth, incluindo o callback
