# Debug: Google OAuth - Problemas de Redirecionamento

## Problema Identificado

O usuário é criado no Supabase (`auth.users`), mas:
1. O redirecionamento após login não funciona
2. O usuário não aparece como logado

## Possíveis Causas

### 1. Profile não está sendo criado
- O trigger `handle_new_user()` pode não estar funcionando
- Verificar se o profile existe na tabela `profiles` após login

**Solução implementada**: Adicionado fallback no `fetchProfile()` para criar o profile automaticamente se não existir.

### 2. RedirectTo incorreto
- O `redirectTo` pode não estar no formato correto para HashRouter
- O Supabase pode estar redirecionando para uma URL diferente

**Solução implementada**: Ajustado `redirectTo` para usar `${window.location.origin}${window.location.pathname}#/dashboard`

### 3. onAuthStateChange não está sendo acionado
- O callback do OAuth pode não estar disparando o evento
- A sessão pode não estar sendo detectada

**Solução implementada**: Adicionados logs detalhados e verificação de sessão no `useEffect` inicial.

## Como Debuggar

### 1. Verificar se o Profile foi criado

No Supabase Dashboard:
```sql
SELECT * FROM profiles WHERE id = 'ID_DO_USUARIO';
```

Se não existir, o código agora cria automaticamente.

### 2. Verificar Logs do Console

Abra o console do navegador e procure por:
- `"Iniciando OAuth com redirectTo:"` - mostra a URL de redirecionamento
- `"Auth state changed:"` - mostra quando o estado de auth muda
- `"Sessão encontrada:"` - mostra quando uma sessão é detectada
- `"Profile carregado:"` - mostra quando o profile é carregado
- `"OAuthCallbackHandler"` - mostra o estado do handler de callback

### 3. Verificar URL após Callback

Após autorizar no Google, verifique:
1. Para qual URL você foi redirecionado
2. Se a URL contém `#/dashboard`
3. Se há parâmetros de query na URL (como `code=...` ou `access_token=...`)

### 4. Testar Manualmente

1. Faça login com Google
2. Após autorizar, verifique no console:
   - Se `onAuthStateChange` foi acionado
   - Se o profile foi encontrado/criado
   - Se o usuário foi setado no estado

3. Se o usuário foi setado mas não redirecionou:
   - Verifique se o `OAuthCallbackHandler` está detectando o usuário
   - Verifique se o `navigate` está sendo chamado

## Correções Implementadas

### 1. Fallback para Criação de Profile
```typescript
// Se o profile não existe, criar automaticamente
if (error || !profile) {
    // Buscar dados do auth user e criar profile
}
```

### 2. Logs Detalhados
- Adicionados logs em todos os pontos críticos do fluxo
- Facilita identificar onde o problema está ocorrendo

### 3. Melhor Tratamento de Callback
- `OAuthCallbackHandler` agora verifica múltiplas condições
- Redireciona baseado no role do usuário
- Usa `replace: true` para evitar histórico duplicado

### 4. Verificação de Sessão Melhorada
- Verifica sessão no mount do componente
- Verifica sessão em cada mudança de auth state
- Cria profile se necessário em ambos os casos

## Próximos Passos para Resolver

1. **Testar o fluxo completo**:
   - Fazer login com Google
   - Verificar logs no console
   - Verificar se profile foi criado
   - Verificar se redirecionamento aconteceu

2. **Se o profile não for criado**:
   - Verificar se o trigger está ativo no banco
   - Verificar logs do Supabase para erros

3. **Se o redirecionamento não funcionar**:
   - Verificar a URL de retorno do Google
   - Verificar se o `redirectTo` está correto
   - Verificar se o HashRouter está funcionando

4. **Se o usuário não aparecer como logado**:
   - Verificar se `onAuthStateChange` está sendo acionado
   - Verificar se `fetchProfile` está retornando dados
   - Verificar se o estado está sendo atualizado

## Comandos SQL Úteis

```sql
-- Verificar se o trigger existe
SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created';

-- Verificar se a função existe
SELECT * FROM pg_proc WHERE proname = 'handle_new_user';

-- Verificar profiles criados recentemente
SELECT * FROM profiles ORDER BY created_at DESC LIMIT 10;

-- Verificar usuários sem profile
SELECT u.id, u.email 
FROM auth.users u 
LEFT JOIN profiles p ON u.id = p.id 
WHERE p.id IS NULL;
```

## Contato

Se o problema persistir após essas verificações, verifique:
1. Configuração do Google OAuth no Supabase Dashboard
2. URLs de callback no Google Cloud Console
3. Políticas RLS na tabela `profiles`
