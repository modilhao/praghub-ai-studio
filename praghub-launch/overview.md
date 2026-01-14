# PragHub — Launch Execution Overview

Este conjunto de documentos organiza os EPICs, Stories e Tasks necessários
para o lançamento oficial do PragHub, com foco em:

- Monetização (planos e billing)
- Diretório funcional e confiável
- Portal de vídeos (Academia)
- Benefícios Premium
- Loja separada integrada por cupom

## Fonte de Verdade
Todas as decisões aqui partem do arquivo:
RELATORIO_COMPLETO.md

## Stack Base
- React + Vite + Tailwind
- Supabase (Auth, DB, RLS)
- Stripe (Billing)
- SPA com React Router

## Planos
1. Diretório
2. Diretório + Academia
3. Premium (Academia + Loja + Site Básico)

## Ordem de Execução
EPIC 00 → EPIC 01 → EPIC 02 → EPIC 03 → EPIC 04 → EPIC 05

Cada EPIC pode ser desenvolvido isoladamente no Cursor,
mantendo este overview como mapa geral.