# 🔒 Resolver Bloqueio do GitHub - Chaves Secretas

## ⚠️ Situação

O GitHub está bloqueando o push porque detectou chaves secretas do Stripe em commits anteriores (commit `f761f9a`).

**Arquivos afetados:**
- `scripts/CONFIGURAR_SECRETS_TESTE.sh`
- `scripts/EPIC_01_TESTE_PAGAMENTO_PLANO.md`
- `scripts/criar-prices-teste-stripe.sh`

---

## ✅ Solução Rápida (Recomendada)

### Opção 1: Permitir o Secret no GitHub

Como é uma chave de **teste** (não produção), você pode permitir no GitHub:

1. Acesse o link fornecido pelo GitHub:
   ```
   https://github.com/modilhao/praghub-ai-studio/security/secret-scanning/unblock-secret/38Fq6c7jzFdyZ3WoGJ9osYvTFcB
   ```

2. Clique em **"Allow this secret"** ou **"Permitir este secret"**

3. Tente fazer push novamente:
   ```bash
   git push origin main
   ```

**Vantagem:** Rápido e simples  
**Desvantagem:** A chave de teste permanece no histórico do Git

---

## 🔧 Solução Completa (Remover do Histórico)

Se preferir remover completamente as chaves do histórico:

### Opção 2: Usar git filter-repo (Recomendado)

```bash
# Instalar git-filter-repo (se não tiver)
brew install git-filter-repo

# Remover chave secreta do histórico
git filter-repo --replace-text <(echo "sk_test_51HCPguJULNOvBzJ4ijJLwk6kAueh30tWqrIyuWXqmcwfKLHVvbe673HNBp7ogTwVBUTIwzbV2l1QGu7PjHk9hm5500fsCCgT0h==>sk_test_...")

# Force push (⚠️ CUIDADO: isso reescreve o histórico)
git push origin main --force
```

**⚠️ ATENÇÃO:** Isso reescreve o histórico do Git. Todos que têm o repositório precisarão fazer `git pull --rebase` ou recriar o clone.

---

### Opção 3: Usar BFG Repo-Cleaner

```bash
# Instalar BFG
brew install bfg

# Criar arquivo com chave a remover
echo "sk_test_51HCPguJULNOvBzJ4ijJLwk6kAueh30tWqrIyuWXqmcwfKLHVvbe673HNBp7ogTwVBUTIwzbV2l1QGu7PjHk9hm5500fsCCgT0h" > secrets.txt

# Limpar histórico
bfg --replace-text secrets.txt

# Force push
git push origin main --force
```

---

## 📝 Recomendação

**Para desenvolvimento/teste:** Use a **Opção 1** (permitir no GitHub). Chaves de teste não são críticas.

**Para produção:** Use a **Opção 2 ou 3** para remover completamente do histórico.

---

## ✅ Arquivos Já Corrigidos

Os seguintes arquivos já foram atualizados para não conterem chaves:

- ✅ `scripts/CONFIGURAR_SECRETS_AUTOMATICO.sh` - Usa variável de ambiente
- ✅ `scripts/CONFIGURAR_SECRETS_TESTE.sh` - Usa variável de ambiente
- ✅ `scripts/EPIC_01_TESTE_PAGAMENTO_PLANO.md` - Placeholder
- ✅ `scripts/criar-prices-teste-stripe.sh` - Usa variável de ambiente
- ✅ `SECRETS_CONFIGURADOS.md` - Placeholder

---

## 🚀 Após Resolver

Depois de permitir o secret ou remover do histórico:

```bash
git push origin main
```

O push deve funcionar normalmente.

---

**Última atualização:** Janeiro 2026
