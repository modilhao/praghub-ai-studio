# EPIC 01 - Setup Stripe via CLI

## 📋 Pré-requisitos

- [ ] Stripe CLI instalado: `stripe --version`
- [ ] Autenticado no Stripe: `stripe login`
- [ ] Projeto Stripe configurado (ou usar `--project-key`)

---

## 1️⃣ Criar Products e Prices

### ⚠️ Importante (Test vs Live)
- Execute estes comandos primeiro em **modo Test** (padrão do Stripe CLI após `stripe login`).
- Repita o mesmo processo depois no **modo Live**.
- **Nunca misture** `price_...` do Test com webhooks/secrets do Live.

### Dica: capturar IDs automaticamente (recomendado)
Se você tiver `jq` instalado, dá para capturar `prod_...` e `price_...` sem copiar manualmente.

### Produto 1: Diretório

> **Sugestão (com jq):** capture o Product ID automaticamente:
```bash
PROD_DIRECTORY=$(stripe products create \
  --name="Diretório PragHub" \
  --description="Sua empresa no diretório PragHub com visibilidade para clientes, recebimento de leads e estatísticas básicas" \
  --metadata[plan_key]=directory \
  | jq -r '.id')

echo "Product (Diretório): $PROD_DIRECTORY"
```

> Se preferir sem jq, rode `stripe products create ...` e copie o `id` retornado (prod_...).

```bash
# Criar product
stripe products create \
  --name="Diretório PragHub" \
  --description="Sua empresa no diretório PragHub com visibilidade para clientes, recebimento de leads e estatísticas básicas" \
  --metadata[plan_key]=directory

# Criar price recorrente mensal (R$ 49,90)
stripe prices create \
  --product=$PROD_DIRECTORY \
  --currency=brl \
  --unit-amount=4990 \
  --recurring[interval]=month \
  --nickname="Diretório - Mensal"
```

### Produto 2: Diretório + Academia

> **Sugestão (com jq):** capture o Product ID automaticamente:
```bash
PROD_DIRECTORY_ACADEMY=$(stripe products create \
  --name="Diretório + Academia PragHub" \
  --description="Diretório completo + acesso à Academia de Vídeos com treinamentos e conteúdo exclusivo" \
  --metadata[plan_key]=directory_academy \
  | jq -r '.id')

echo "Product (Diretório + Academia): $PROD_DIRECTORY_ACADEMY"
```

> Se preferir sem jq, rode `stripe products create ...` e copie o `id` retornado (prod_...).

```bash
# Criar product
stripe products create \
  --name="Diretório + Academia PragHub" \
  --description="Diretório completo + acesso à Academia de Vídeos com treinamentos e conteúdo exclusivo" \
  --metadata[plan_key]=directory_academy

# Criar price recorrente mensal (R$ 99,90)
stripe prices create \
  --product=$PROD_DIRECTORY_ACADEMY \
  --currency=brl \
  --unit-amount=9990 \
  --recurring[interval]=month \
  --nickname="Diretório + Academia - Mensal"
```

### Produto 3: Premium

> **Sugestão (com jq):** capture o Product ID automaticamente:
```bash
PROD_PREMIUM=$(stripe products create \
  --name="Premium PragHub" \
  --description="Plano completo com Diretório, Academia, descontos premium, site básico incluso e suporte prioritário" \
  --metadata[plan_key]=premium \
  | jq -r '.id')

echo "Product (Premium): $PROD_PREMIUM"
```

> Se preferir sem jq, rode `stripe products create ...` e copie o `id` retornado (prod_...).

```bash
# Criar product
stripe products create \
  --name="Premium PragHub" \
  --description="Plano completo com Diretório, Academia, descontos premium, site básico incluso e suporte prioritário" \
  --metadata[plan_key]=premium

# Criar price recorrente mensal (R$ 149,90)
stripe prices create \
  --product=$PROD_PREMIUM \
  --currency=brl \
  --unit-amount=14990 \
  --recurring[interval]=month \
  --nickname="Premium - Mensal"
```

---

## 2️⃣ Listar Price IDs Criados

### Opção A: Listar todos os prices

```bash
# Listar todos os prices (últimos 10)
stripe prices list --limit=10

# Filtrar por product (se você salvou os Product IDs)
stripe prices list --product=prod_xxxxx
stripe prices list --product=prod_yyyyy
stripe prices list --product=prod_zzzzz

# Listar apenas prices recorrentes mensais em BRL
stripe prices list \
  --limit=100 \
  --expand[]=data.product \
  | jq '.data[] | select(.recurring.interval == "month" and .currency == "brl") | {id: .id, nickname: .nickname, amount: .unit_amount, product: .product.name}'
```

### Opção B: Buscar por nickname

```bash
# Buscar price específico por nickname
stripe prices list \
  --limit=100 \
  | jq '.data[] | select(.nickname | contains("Diretório - Mensal")) | {id: .id, nickname: .nickname, amount: .unit_amount}'

stripe prices list \
  --limit=100 \
  | jq '.data[] | select(.nickname | contains("Diretório + Academia - Mensal")) | {id: .id, nickname: .nickname, amount: .unit_amount}'

stripe prices list \
  --limit=100 \
  | jq '.data[] | select(.nickname | contains("Premium - Mensal")) | {id: .id, nickname: .nickname, amount: .unit_amount}'
```

### Opção C: Script para extrair todos de uma vez

```bash
# Criar arquivo temporário com output formatado
stripe prices list --limit=100 --expand[]=data.product > prices_output.json

# Extrair Price IDs (requer jq instalado)
cat prices_output.json | jq -r '.data[] | select(.recurring.interval == "month" and .currency == "brl") | "\(.nickname // "Sem nome"): \(.id)"'
```

### Opção D: Comando único para listar os 3 prices

```bash
# Listar e formatar os 3 prices criados
stripe prices list --limit=100 --expand[]=data.product | jq '
  .data[] 
  | select(.recurring.interval == "month" and .currency == "brl")
  | select(.nickname | contains("Diretório") or contains("Premium"))
  | {
      plan: .nickname,
      price_id: .id,
      amount: (.unit_amount / 100 | tostring + " BRL"),
      product: .product.name
    }
'
```

---

## 3️⃣ Criar Webhook Endpoint

### Opção A (DEV): ouvir eventos localmente e encaminhar para o webhook local
Use isto durante desenvolvimento para debugar rapidamente.

```bash
# 1) Inicie suas Edge Functions localmente (exemplo)
# supabase start
# supabase functions serve

# 2) Em outra aba, escute eventos do Stripe e encaminhe para seu endpoint local
stripe listen --forward-to http://localhost:54321/functions/v1/stripe-webhook

# Dica: você pode disparar eventos de teste em outra aba
# stripe trigger checkout.session.completed
```

### Opção B (PROD): criar webhook endpoint permanente no Stripe
Use isto para produção (e também pode usar para staging).

```bash
# Substituir [seu-projeto] pelo ID do seu projeto Supabase (project ref)
stripe webhook_endpoints create \
  --url=https://[seu-projeto].supabase.co/functions/v1/stripe-webhook \
  --enabled-events[0]=checkout.session.completed \
  --enabled-events[1]=customer.subscription.created \
  --enabled-events[2]=customer.subscription.updated \
  --enabled-events[3]=customer.subscription.deleted \
  --enabled-events[4]=invoice.payment_succeeded \
  --enabled-events[5]=invoice.payment_failed \
  --description="PragHub - Webhook de Billing e Subscriptions"
```

### Como obter o `whsec_...` (Webhook Signing Secret)
- Ao **criar** o webhook via CLI (Opção B), o Stripe retorna o secret na resposta. Guarde-o imediatamente.
- Se você criar pelo Dashboard, copie o secret na tela do endpoint (ele pode ser revelado/rotacionado lá).
- **Importante:** `stripe webhook_endpoints retrieve ...` não retorna o `whsec_...` depois. Se você perdeu, gere/rotacione um novo secret.

### Verificar webhooks existentes
```bash
stripe webhook_endpoints list
stripe webhook_endpoints list --limit=100 | jq '.data[] | {id: .id, url: .url, status: .status}'
```

---

## 4️⃣ Checklist de Verificação Pós-Criação

### ✅ Products

- [ ] 3 products criados no Stripe Dashboard
- [ ] Cada product tem `metadata.plan_key` correto:
  - [ ] `directory`
  - [ ] `directory_academy`
  - [ ] `premium`
- [ ] Descrições estão corretas e completas
- [ ] Nomes são claros e profissionais

### ✅ Prices

- [ ] 3 prices criados (um para cada product)
- [ ] Valores corretos:
  - [ ] Diretório: R$ 49,90 (4990 centavos)
  - [ ] Diretório + Academia: R$ 99,90 (9990 centavos)
  - [ ] Premium: R$ 149,90 (14990 centavos)
- [ ] Moeda: BRL (Real brasileiro)
- [ ] Intervalo: `month` (mensal)
- [ ] Price IDs anotados (começam com `price_...`)
- [ ] Nicknames estão corretos

### ✅ Webhook Endpoint

> **Segurança:** nunca commite `whsec_...` nem `sk_...` no repositório. Use `supabase secrets set ...`.

- [ ] Webhook criado no Stripe Dashboard
- [ ] URL correta: `https://[projeto].supabase.co/functions/v1/stripe-webhook`
- [ ] 6 eventos habilitados:
  - [ ] `checkout.session.completed`
  - [ ] `customer.subscription.created`
  - [ ] `customer.subscription.updated`
  - [ ] `customer.subscription.deleted`
  - [ ] `invoice.payment_succeeded`
  - [ ] `invoice.payment_failed`
- [ ] Webhook Secret anotado (começa com `whsec_...`)
- [ ] Status: `enabled` (habilitado)

### ✅ Configuração no Código

- [ ] Price IDs atualizados em:
  - [ ] `supabase/functions/stripe-webhook/index.ts` → `PRICE_TO_PLAN_MAP`
  - [ ] `supabase/functions/create-checkout/index.ts` → `PLAN_TO_PRICE_MAP`
- [ ] Webhook Secret configurado como Supabase Secret:
  ```bash
  supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_...
  ```
- [ ] Price IDs configurados como Supabase Secrets:
  ```bash
  supabase secrets set STRIPE_PRICE_DIRECTORY=price_...
  supabase secrets set STRIPE_PRICE_DIRECTORY_ACADEMY=price_...
  supabase secrets set STRIPE_PRICE_PREMIUM=price_...
  ```

### ✅ Testes Básicos

- [ ] Testar criação de checkout session:
  ```bash
  # Via Stripe Dashboard → Developers → Events → Send test webhook
  # Ou usar stripe trigger
  stripe trigger checkout.session.completed
  ```
- [ ] Verificar que webhook recebe eventos (logs da Edge Function)
- [ ] Testar pagamento de teste:
  - [ ] Cartão: `4242 4242 4242 4242`
  - [ ] Data: qualquer data futura
  - [ ] CVC: qualquer 3 dígitos
- [ ] Verificar que subscription é criada no DB após pagamento
- [ ] Verificar que entitlements são liberados corretamente

### ✅ Documentação

- [ ] Price IDs documentados em arquivo `.env.example` ou documentação
- [ ] Webhook Secret guardado com segurança (nunca commitado)
- [ ] Processo de setup documentado para outros desenvolvedores

---

## 🔍 Comandos Úteis de Verificação

### Verificar Products

```bash
# Listar todos os products
stripe products list --limit=10

# Ver detalhes de um product específico
stripe products retrieve prod_xxxxx

# Verificar metadata
stripe products retrieve prod_xxxxx | jq '.metadata'
```

### Verificar Prices

```bash
# Ver detalhes de um price específico
stripe prices retrieve price_xxxxx

# Verificar product associado
stripe prices retrieve price_xxxxx --expand[]=product | jq '.product'
```

### Verificar Webhooks

```bash
# Listar todos os webhooks
stripe webhook_endpoints list

# Ver detalhes de um webhook
stripe webhook_endpoints retrieve we_xxxxx

# Ver eventos de um webhook
stripe webhook_endpoints retrieve we_xxxxx | jq '.enabled_events'

# Testar webhook no DEV (recomendado):
# 1) Rode `stripe listen --forward-to http://localhost:54321/functions/v1/stripe-webhook`
# 2) Dispare eventos:
stripe trigger checkout.session.completed
stripe trigger customer.subscription.created
```

### Testar Checkout

```bash
# Criar checkout session de teste (requer customer_id)
stripe checkout sessions create \
  --customer=cus_xxxxx \
  --mode=subscription \
  --line-items[0][price]=price_xxxxx \
  --success-url=https://localhost:3000/dashboard?success=true \
  --cancel-url=https://localhost:3000/planos?canceled=true
```

---

## 📝 Template de Configuração

Após executar os comandos, preencha este template:

```bash
# Stripe Configuration
STRIPE_PRICE_DIRECTORY=price_xxxxxxxxxxxxx
STRIPE_PRICE_DIRECTORY_ACADEMY=price_yyyyyyyyyyyyy
STRIPE_PRICE_PREMIUM=price_zzzzzzzzzzzzz
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxxxxxx

# Mapeamento para código
# PRICE_TO_PLAN_MAP em stripe-webhook/index.ts:
# 'price_xxxxxxxxxxxxx': 'directory',
# 'price_yyyyyyyyyyyyy': 'directory_academy',
# 'price_zzzzzzzzzzzzz': 'premium',
```

---

## 🚨 Troubleshooting

### Price não aparece na listagem
- Verificar se foi criado no modo correto (test vs live)
- Usar `--limit=100` para ver mais resultados
- Filtrar por `currency=brl` e `recurring.interval=month`

### Webhook não recebe eventos
- Verificar URL está acessível publicamente
- Verificar SSL válido (HTTPS)
- Verificar eventos estão habilitados
- Testar com `stripe listen` localmente primeiro

### Secret não aparece
- Secret só é mostrado na criação
- Se perdeu, criar novo webhook ou usar Stripe Dashboard para ver

---

**Última atualização:** Janeiro 2026  
**Versão:** 1.1.0
