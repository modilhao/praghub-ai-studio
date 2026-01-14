# PragHub — Launch Repo

Plataforma SaaS/Marketplace que conecta empresas de controle de pragas a clientes e oferece ferramentas de crescimento:
- Diretório (vitrine)
- Leads
- Academia (vídeos e treinamentos)
- Plano Premium (descontos + site básico)

## Fonte de Verdade
Veja: `RELATORIO_COMPLETO.md`

## Stack
- React + TypeScript + Vite
- Tailwind CSS
- Supabase (Auth + Postgres + RLS)
- React Router DOM
- Stripe (Billing / Hosted Checkout)

## Planos (Entitlements)
1) Diretório
2) Diretório + Academia
3) Premium (Academia + Cupom Loja + Site Básico)

> Importante: Features devem ser liberadas por **entitlements**, não apenas por role.

## Estrutura de Rotas (alto nível)
Públicas:
- `/` Landing parceiros
- `/consumidores` Landing consumidores
- `/demonstracao` Diretório
- `/company/:id` Perfil público
- `/register` Cadastro
- `/login` Login

Protegidas:
- `/dashboard` Painel da empresa
- `/admin` Painel admin
- (nova) `/academy` Academia
- (nova) `/beneficios` Benefícios premium

## Banco de Dados (Supabase)
Tabelas existentes:
- `profiles`
- `companies`
- `leads`
- `services`

Tabelas a adicionar no launch:
- `subscriptions`
- `entitlements`
- `academy_videos`
- `discount_coupons`
- `basic_site_requests`

## Dev Docs (Launch Suite)
Documentos em:
`/docs/praghub-launch/`

- `00_OVERVIEW.md`
- `01_ARCHITECTURE_DECISIONS.md`
- `EPIC_00_CORE_FIXES.md`
- `EPIC_01_BILLING_AND_PLANS.md`
- `EPIC_02_DIRECTORY_CORE.md`
- `EPIC_03_ACADEMY_VIDEOS.md`
- `EPIC_04_PREMIUM_BENEFITS.md`
- `EPIC_05_EXTERNAL_STORE.md`
- `DEV_PROMPTS.md`
- `PRE_DEPLOY_CHECKLIST.md`

## Setup Local (padrão)
1) Instalar deps:
```bash
npm install

2.	Criar .env com:

	•	VITE_SUPABASE_URL=...
	•	VITE_SUPABASE_ANON_KEY=...

3. Rodar:
npm run dev

Stripe (Billing)

O fluxo de billing utiliza:
	•	Hosted Checkout
	•	Webhooks para sincronizar subscriptions + entitlements

Variáveis server (produção):
	•	STRIPE_SECRET_KEY
	•	STRIPE_WEBHOOK_SECRET

Segurança
	•	RLS no Supabase é obrigatório
	•	Nunca expor Service Role no client
	•	Webhooks Stripe devem validar assinatura

Lançamento (ordem recomendada)

EPIC 00 → EPIC 01 → EPIC 02 → EPIC 03 → EPIC 04 → EPIC 05