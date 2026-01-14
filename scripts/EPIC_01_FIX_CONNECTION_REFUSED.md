# EPIC 01 - Correção: ERR_CONNECTION_REFUSED após Checkout

## 🔴 Problema

Após o pagamento no Stripe, o redirecionamento está indo para:
```
http://localhost:3000/#/planos?session_id=...&success=true
```

Mas o erro `ERR_CONNECTION_REFUSED` aparece, indicando que:
- O servidor local não está rodando na porta 3000, OU
- O Stripe está tentando redirecionar antes do servidor estar pronto

---

## ✅ Soluções

### Solução 1: Garantir que o servidor está rodando (Recomendado)

**Antes de testar o checkout:**
1. Certifique-se de que o servidor está rodando:
   ```bash
   npm run dev
   ```
2. Verifique que está acessível em: `http://localhost:3000`
3. **Mantenha o servidor rodando** durante todo o teste de checkout

### Solução 2: Melhorar tratamento de erro no frontend

Adicionar verificação se a página carregou corretamente e mostrar mensagem útil.

### Solução 3: Usar URL absoluta em produção

Para produção, configure `APP_BASE_URL` com a URL real do seu domínio:
```bash
supabase secrets set APP_BASE_URL=https://seu-dominio.com
```

---

## 🔍 Diagnóstico

### Verificar se o servidor está rodando

```bash
# Verificar se a porta 3000 está em uso
lsof -i :3000

# Ou tentar acessar diretamente
curl http://localhost:3000
```

### Verificar APP_BASE_URL configurado

```bash
supabase secrets list --project-ref nkbcpwbgvesbkaebmkkw | grep APP_BASE_URL
```

---

## 📋 Checklist de Teste

Antes de testar o checkout:

- [ ] Servidor local está rodando (`npm run dev`)
- [ ] Servidor está acessível em `http://localhost:3000`
- [ ] `APP_BASE_URL` está configurado como `http://localhost:3000`
- [ ] Edge Function `create-checkout` foi redeployada
- [ ] Browser não bloqueia conexões locais

---

## 🧪 Teste Corrigido

1. **Inicie o servidor:**
   ```bash
   npm run dev
   ```

2. **Aguarde até ver:**
   ```
   VITE ready in XXX ms
   ➜  Local:   http://localhost:3000/
   ```

3. **Mantenha o servidor rodando** e abra outro terminal

4. **Acesse:** `http://localhost:3000/#/planos`

5. **Faça login e teste o checkout**

6. **Após o pagamento**, o Stripe deve redirecionar para:
   ```
   http://localhost:3000/#/planos?session_id=...&success=true
   ```

7. **A página deve carregar** e mostrar toast de sucesso

---

## ⚠️ Nota Importante

O `APP_BASE_URL` deve corresponder à URL onde seu app está rodando:
- **Desenvolvimento:** `http://localhost:3000`
- **Produção:** `https://seu-dominio.com`

Se você mudar de ambiente, atualize o secret:
```bash
supabase secrets set APP_BASE_URL=nova-url
supabase functions deploy create-checkout
```

---

**Data:** Janeiro 2025
