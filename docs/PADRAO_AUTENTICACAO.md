# Padrão de Autenticação - PragHub

## ⚠️ IMPORTANTE: Leia antes de modificar código de autenticação

Este documento descreve o padrão correto de autenticação usado no projeto para evitar problemas de redirecionamento e sincronização de estado.

---

## 🔑 Princípios Fundamentais

### 1. **Sempre aguarde o profile antes de redirecionar**

O `signInWithEmail` retorna o `User` após carregar o profile do banco de dados. **NUNCA** faça redirecionamento antes de receber este retorno.

### 2. **Dois mecanismos de redirecionamento**

- **Primário**: Redirecionamento direto após `signInWithEmail` retornar
- **Fallback**: `useEffect` que monitora mudanças no `user` (para sessões existentes)

---

## 📋 Padrão Correto de Login

### ✅ CORRETO

```typescript
const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
        // signInWithEmail retorna User após carregar profile
        const loggedUser = await signInWithEmail(email, password);
        
        // Redireciona IMEDIATAMENTE após receber o user
        if (loggedUser) {
            if (loggedUser.role === 'ADMIN') {
                navigate('/admin', { replace: true });
            } else if (loggedUser.role === 'COMPANY') {
                navigate('/dashboard', { replace: true });
            } else {
                navigate('/', { replace: true });
            }
        }
    } catch (error) {
        // Tratar erro
    } finally {
        setIsLoading(false);
    }
};
```

### ❌ ERRADO - NÃO FAÇA ISSO

```typescript
// ❌ ERRADO: Não aguarda o profile
const handleLogin = async (e: React.FormEvent) => {
    await signInWithEmail(email, password);
    // user ainda pode ser null aqui!
    if (user) { // ❌ Race condition!
        navigate('/dashboard');
    }
};

// ❌ ERRADO: Depende apenas do useEffect
const handleLogin = async (e: React.FormEvent) => {
    await signInWithEmail(email, password);
    // Espera que useEffect detecte mudança - pode não funcionar!
};
```

---

## 🔄 Fluxo de Autenticação

```
1. Usuário clica em "Entrar"
   ↓
2. handleLogin chama signInWithEmail(email, password)
   ↓
3. signInWithEmail:
   - Faz login no Supabase Auth
   - Busca profile do banco de dados
   - Atualiza state (setUser)
   - RETORNA o User
   ↓
4. handleLogin recebe o User
   ↓
5. Redireciona imediatamente baseado no role
```

---

## 🛡️ Por que este padrão?

### Problema que resolve:

**Antes**: O `signInWithEmail` não retornava o profile, então:
- O redirecionamento dependia apenas do `useEffect`
- O `useEffect` podia não disparar no momento certo
- Race conditions entre login e carregamento do profile

**Agora**: O `signInWithEmail` retorna o profile, então:
- Redirecionamento imediato e confiável
- Sem race conditions
- `useEffect` serve apenas como fallback para sessões existentes

---

## 📝 Checklist ao modificar autenticação

- [ ] `signInWithEmail` retorna `Promise<User | null>`
- [ ] `signInWithEmail` aguarda `fetchProfile` antes de retornar
- [ ] `handleLogin` usa o retorno de `signInWithEmail` para redirecionar
- [ ] `useEffect` está presente como fallback
- [ ] Não há logs de debug em produção
- [ ] Comentários explicam o padrão

---

## 🔍 Onde este padrão é usado

- `pages/Login.tsx` - Login com email/senha
- `contexts/AuthContext.tsx` - Lógica de autenticação

---

## 🚨 Se precisar adicionar novo método de login

Se você adicionar um novo método de login (ex: OAuth, magic link), siga o mesmo padrão:

```typescript
const signInWithOAuth = async (provider: string): Promise<User | null> => {
    setIsLoading(true);
    try {
        const { data, error } = await supabase.auth.signInWithOAuth({ provider });
        if (error) throw error;
        
        // Aguarda o profile ser carregado
        if (data.user) {
            const profile = await fetchProfile(data.user.id);
            if (profile) {
                setUser(profile);
                return profile; // ✅ Retorna o profile
            }
        }
        return null;
    } finally {
        setIsLoading(false);
    }
};
```

---

## 📚 Referências

- `contexts/AuthContext.tsx` - Implementação do padrão
- `pages/Login.tsx` - Exemplo de uso correto

---

**Última atualização**: Janeiro 2026  
**Motivo**: Correção de bug de redirecionamento após login
