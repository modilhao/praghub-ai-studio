# ✅ Checklist de Deploy no Vercel - PragHub

## 📋 Antes de Fazer Commit e Push

### 1. ✅ Verificar Arquivos que NÃO devem ser Commitados

Verifique se o `.gitignore` está correto e contém:

```gitignore
# Environment variables
.env
.env.local
.env.*.local

# Vercel
.vercel

# Build outputs
dist
dist-ssr

# Node
node_modules

# Logs
*.log
```

**Ação:** Execute `git status` e verifique se nenhum arquivo sensível está sendo commitado.

---

### 2. ✅ Configuração do Build no Vercel

#### 2.1. Configurações do Projeto

No dashboard do Vercel, configure:

- **Framework Preset:** Vite
- **Build Command:** `npm run build` (ou `vite build`)
- **Output Directory:** `dist`
- **Install Command:** `npm install` (ou `npm ci` para builds mais rápidos)

#### 2.2. Node.js Version

Configure para usar Node.js 18.x ou superior:

- **Node.js Version:** 18.x (ou superior)

---

### 3. ✅ Variáveis de Ambiente no Vercel

Configure as seguintes variáveis de ambiente no Vercel Dashboard:

#### 3.1. Variáveis Obrigatórias (Frontend)

| Variável | Descrição | Onde Obter |
|----------|-----------|------------|
| `VITE_SUPABASE_URL` | URL do projeto Supabase | Supabase Dashboard → Settings → API |
| `VITE_SUPABASE_ANON_KEY` | Chave pública (anon) do Supabase | Supabase Dashboard → Settings → API |

#### 3.2. Variáveis Opcionais (Frontend)

| Variável | Descrição | Onde Obter |
|----------|-----------|------------|
| `GEMINI_API_KEY` | Chave da API Gemini (se usar) | Google AI Studio |

#### 3.3. Variáveis para Edge Functions (Supabase)

**⚠️ IMPORTANTE:** Estas variáveis são configuradas no Supabase, não no Vercel!

As Edge Functions do Supabase precisam dos seguintes secrets:

| Secret | Descrição | Onde Configurar |
|--------|-----------|-----------------|
| `STRIPE_SECRET_KEY` | Chave secreta do Stripe | Supabase CLI: `supabase secrets set` |
| `STRIPE_PRICE_DIRECTORY` | Price ID do plano Directory | Supabase CLI |
| `STRIPE_PRICE_DIRECTORY_ACADEMY` | Price ID do plano Directory + Academy | Supabase CLI |
| `STRIPE_PRICE_PREMIUM` | Price ID do plano Premium | Supabase CLI |
| `SUPABASE_URL` | URL do projeto (mesma do frontend) | Supabase CLI |
| `SUPABASE_SERVICE_ROLE_KEY` | Service Role Key (NUNCA no frontend!) | Supabase CLI |
| `APP_BASE_URL` | URL base da aplicação (ex: https://praghub.vercel.app) | Supabase CLI |

**Como configurar no Supabase:**
```bash
# Ver script completo em: scripts/CONFIGURAR_SECRETS_TESTE.sh
supabase secrets set STRIPE_SECRET_KEY=sk_test_...
supabase secrets set STRIPE_PRICE_DIRECTORY=price_...
# etc...
```

---

### 4. ✅ Arquivo vercel.json (Opcional)

Se necessário, crie um arquivo `vercel.json` na raiz do projeto:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ],
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

**Nota:** O Vercel geralmente detecta Vite automaticamente, então este arquivo pode não ser necessário.

---

### 5. ✅ Verificar Build Local

Antes de fazer push, teste o build localmente:

```bash
# Instalar dependências
npm install

# Fazer build
npm run build

# Verificar se o build foi criado
ls -la dist/

# Testar preview do build
npm run preview
```

**Se o build falhar localmente, também falhará no Vercel!**

---

### 6. ✅ Verificar TypeScript

Execute o TypeScript para verificar erros:

```bash
# Se tiver script de type-check
npm run type-check

# Ou diretamente
npx tsc --noEmit
```

---

### 7. ✅ Verificar Linter

Execute o linter (se configurado):

```bash
# Se tiver script de lint
npm run lint
```

---

### 8. ✅ Configuração do Domínio

No Vercel Dashboard:

- [ ] Domínio customizado configurado (se aplicável)
- [ ] SSL/HTTPS habilitado automaticamente
- [ ] Redirecionamentos configurados (se necessário)

---

### 9. ✅ Webhook do Stripe

**⚠️ CRÍTICO:** Configure o webhook do Stripe para produção:

1. Acesse [Stripe Dashboard](https://dashboard.stripe.com) → **Developers** → **Webhooks**
2. Adicione endpoint: `https://[seu-projeto].supabase.co/functions/v1/stripe-webhook`
3. Selecione eventos:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
4. Copie o **Webhook Signing Secret**
5. Configure no Supabase: `supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_...`

---

### 10. ✅ Verificar Supabase Edge Functions

Certifique-se de que as Edge Functions estão deployadas:

```bash
# Verificar functions deployadas
supabase functions list

# Se necessário, fazer deploy
supabase functions deploy create-checkout
supabase functions deploy stripe-webhook
supabase functions deploy sync-subscription
```

---

### 11. ✅ Testar Build no Vercel

Após fazer push:

1. Acesse o Vercel Dashboard
2. Verifique o build em **Deployments**
3. Se falhar, verifique os logs:
   - Variáveis de ambiente configuradas?
   - Build command correto?
   - Dependências instaladas corretamente?

---

## 🚨 Problemas Comuns e Soluções

### Build falha com erro de variável de ambiente

**Solução:** Verifique se todas as variáveis `VITE_*` estão configuradas no Vercel Dashboard.

### Build falha com erro de TypeScript

**Solução:** Execute `npx tsc --noEmit` localmente e corrija os erros antes de fazer push.

### Página em branco após deploy

**Solução:** 
- Verifique se o `outputDirectory` está correto (`dist`)
- Verifique se há erros no console do navegador
- Verifique se as variáveis de ambiente estão configuradas

### Rotas não funcionam (404)

**Solução:** Configure rewrites no `vercel.json` para redirecionar todas as rotas para `index.html` (SPA).

---

## 📝 Checklist Final Antes de Push

- [ ] `.gitignore` está correto
- [ ] Nenhum arquivo `.env` ou `.env.local` será commitado
- [ ] Build local funciona (`npm run build`)
- [ ] TypeScript não tem erros (`npx tsc --noEmit`)
- [ ] Linter passa (se configurado)
- [ ] Variáveis de ambiente documentadas
- [ ] `vercel.json` criado (se necessário)
- [ ] Webhook do Stripe configurado
- [ ] Edge Functions do Supabase deployadas
- [ ] Secrets do Supabase configurados

---

## 🔗 Links Úteis

- [Vercel Dashboard](https://vercel.com/dashboard)
- [Supabase Dashboard](https://app.supabase.com)
- [Stripe Dashboard](https://dashboard.stripe.com)
- [Documentação Vite + Vercel](https://vercel.com/docs/frameworks/vite)

---

**Última atualização:** Janeiro 2026  
**Criado para:** PragHub AI Studio
