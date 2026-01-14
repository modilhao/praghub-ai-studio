# EPIC 01 — Billing, Planos e Entitlements

## Objetivo
Habilitar monetização com liberação automática de acesso.

---

## STORY 01.1 — Modelo de Dados de Assinatura

### Tasks
- Criar tabela subscriptions
- Criar tabela entitlements
- Relacionar com profiles

### Definition of Done
- Assinatura persistida no banco
- Entitlements acessíveis via query

---

## STORY 01.2 — Stripe Integration

### Tasks
- Criar Products/Prices no Stripe
- Configurar Hosted Checkout
- Criar webhook de assinatura

### Definition of Done
- Compra → webhook → DB atualizado

---

## STORY 01.3 — Gating por Plano

### Tasks
- Criar hook useEntitlements()
- Bloquear/liberar rotas e features
- Criar UI de upgrade

### Definition of Done
- Plano define o que o usuário vê