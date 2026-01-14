# EPIC 00 — Core Fixes & Launch Readiness

## Objetivo
Eliminar riscos técnicos que podem quebrar o lançamento.

## Contexto Atual
- RLS inconsistente
- Empresas com owner_id = NULL
- Queries falhando silenciosamente

---

## STORY 00.1 — Corrigir políticas RLS

### Tasks
- Executar FIX_RLS_POLICIES.sql
- Validar SELECT anon em companies APPROVED
- Validar SELECT owner em companies próprias
- Validar SELECT admin global

### Definition of Done
- Diretório carrega corretamente para anon
- Dashboard carrega para COMPANY
- Admin vê tudo

---

## STORY 00.2 — Empresas migradas

### Tasks
- Garantir exibição de empresas APPROVED com owner_id NULL
- Documentar limitação no launch
- Adiar fluxo de "claim company"

### Definition of Done
- Nenhuma empresa aprovada some do diretório

---

## STORY 00.3 — Preparação para Slugs

### Tasks
- Criar campo slug (nullable)
- Garantir fallback UUID
- Não quebrar rotas atuais

### Definition of Done
- URLs antigas continuam funcionando