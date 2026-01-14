#!/bin/bash

# =============================================================================
# Script para criar Prices de TESTE no Stripe via API
# =============================================================================
# Este script cria prices de teste para os produtos existentes no Stripe
# usando a chave de teste fornecida.
# =============================================================================

set -e

# Chave de teste do Stripe
# ⚠️ Configure STRIPE_SECRET_KEY via variável de ambiente
STRIPE_SECRET_KEY="${STRIPE_SECRET_KEY:-}"

# Variáveis para armazenar Product IDs criados
PROD_DIRECTORY=""
PROD_DIRECTORY_ACADEMY=""
PROD_PREMIUM=""

echo ""
echo "============================================================"
echo "  🚀 CRIANDO PRICES DE TESTE NO STRIPE"
echo "============================================================"
echo ""

# Verificar se curl está disponível
if ! command -v curl &> /dev/null; then
    echo "❌ curl não encontrado. Instale curl para continuar."
    exit 1
fi

# Verificar se jq está disponível (opcional, mas recomendado)
HAS_JQ=false
if command -v jq &> /dev/null; then
    HAS_JQ=true
    echo "✅ jq encontrado - IDs serão extraídos automaticamente"
else
    echo "⚠️  jq não encontrado - você precisará copiar os Price IDs manualmente"
fi

echo ""

# =============================================================================
# 0. Criar Products de Teste
# =============================================================================

echo "📦 Criando Product: Diretório PragHub..."
RESPONSE_PROD_DIRECTORY=$(curl -s -X POST https://api.stripe.com/v1/products \
  -u "${STRIPE_SECRET_KEY}:" \
  -d "name=Diretório PragHub" \
  -d "description=Sua empresa no diretório PragHub com visibilidade para clientes, recebimento de leads e estatísticas básicas" \
  -d "metadata[plan_key]=directory")

if [ "$HAS_JQ" = true ]; then
    PROD_DIRECTORY=$(echo "$RESPONSE_PROD_DIRECTORY" | jq -r '.id')
    if [ "$PROD_DIRECTORY" != "null" ] && [ -n "$PROD_DIRECTORY" ]; then
        echo "   ✅ Product criado: $PROD_DIRECTORY"
    else
        ERROR_MSG=$(echo "$RESPONSE_PROD_DIRECTORY" | jq -r '.error.message // "Erro desconhecido"')
        echo "   ❌ Erro: $ERROR_MSG"
        PROD_DIRECTORY=""
    fi
else
    echo "$RESPONSE_PROD_DIRECTORY"
    read -p "   Cole o Product ID aqui (prod_...): " PROD_DIRECTORY
fi

echo ""

echo "📦 Criando Product: Diretório + Academia PragHub..."
RESPONSE_PROD_DIRECTORY_ACADEMY=$(curl -s -X POST https://api.stripe.com/v1/products \
  -u "${STRIPE_SECRET_KEY}:" \
  -d "name=Diretório + Academia PragHub" \
  -d "description=Diretório completo + acesso à Academia de Vídeos com treinamentos e conteúdo exclusivo" \
  -d "metadata[plan_key]=directory_academy")

if [ "$HAS_JQ" = true ]; then
    PROD_DIRECTORY_ACADEMY=$(echo "$RESPONSE_PROD_DIRECTORY_ACADEMY" | jq -r '.id')
    if [ "$PROD_DIRECTORY_ACADEMY" != "null" ] && [ -n "$PROD_DIRECTORY_ACADEMY" ]; then
        echo "   ✅ Product criado: $PROD_DIRECTORY_ACADEMY"
    else
        ERROR_MSG=$(echo "$RESPONSE_PROD_DIRECTORY_ACADEMY" | jq -r '.error.message // "Erro desconhecido"')
        echo "   ❌ Erro: $ERROR_MSG"
        PROD_DIRECTORY_ACADEMY=""
    fi
else
    echo "$RESPONSE_PROD_DIRECTORY_ACADEMY"
    read -p "   Cole o Product ID aqui (prod_...): " PROD_DIRECTORY_ACADEMY
fi

echo ""

echo "📦 Criando Product: Premium PragHub..."
RESPONSE_PROD_PREMIUM=$(curl -s -X POST https://api.stripe.com/v1/products \
  -u "${STRIPE_SECRET_KEY}:" \
  -d "name=Premium PragHub" \
  -d "description=Plano completo com Diretório, Academia, descontos premium, site básico incluso e suporte prioritário" \
  -d "metadata[plan_key]=premium")

if [ "$HAS_JQ" = true ]; then
    PROD_PREMIUM=$(echo "$RESPONSE_PROD_PREMIUM" | jq -r '.id')
    if [ "$PROD_PREMIUM" != "null" ] && [ -n "$PROD_PREMIUM" ]; then
        echo "   ✅ Product criado: $PROD_PREMIUM"
    else
        ERROR_MSG=$(echo "$RESPONSE_PROD_PREMIUM" | jq -r '.error.message // "Erro desconhecido"')
        echo "   ❌ Erro: $ERROR_MSG"
        PROD_PREMIUM=""
    fi
else
    echo "$RESPONSE_PROD_PREMIUM"
    read -p "   Cole o Product ID aqui (prod_...): " PROD_PREMIUM
fi

echo ""

# Verificar se todos os products foram criados
if [ -z "$PROD_DIRECTORY" ] || [ -z "$PROD_DIRECTORY_ACADEMY" ] || [ -z "$PROD_PREMIUM" ]; then
    echo "❌ Erro: Nem todos os products foram criados. Abortando criação de prices."
    exit 1
fi

# =============================================================================
# 1. Criar Price para Diretório (R$ 149,00)
# =============================================================================
echo "📦 Criando Price para Diretório (R$ 149,00/mês)..."
RESPONSE_DIRECTORY=$(curl -s -X POST https://api.stripe.com/v1/prices \
  -u "${STRIPE_SECRET_KEY}:" \
  -d "product=${PROD_DIRECTORY}" \
  -d "currency=brl" \
  -d "unit_amount=14900" \
  -d "recurring[interval]=month" \
  -d "nickname=Diretório - Mensal (Teste)")

if [ "$HAS_JQ" = true ]; then
    PRICE_DIRECTORY=$(echo "$RESPONSE_DIRECTORY" | jq -r '.id')
    if [ "$PRICE_DIRECTORY" != "null" ] && [ -n "$PRICE_DIRECTORY" ]; then
        echo "   ✅ Price criado: $PRICE_DIRECTORY"
    else
        ERROR_MSG=$(echo "$RESPONSE_DIRECTORY" | jq -r '.error.message // "Erro desconhecido"')
        echo "   ❌ Erro: $ERROR_MSG"
        echo "   Resposta completa: $RESPONSE_DIRECTORY"
        PRICE_DIRECTORY=""
    fi
else
    echo "$RESPONSE_DIRECTORY"
    echo ""
    read -p "   Cole o Price ID aqui (price_...): " PRICE_DIRECTORY
fi

echo ""

# =============================================================================
# 2. Criar Price para Diretório + Academia (R$ 249,00)
# =============================================================================
echo "📦 Criando Price para Diretório + Academia (R$ 249,00/mês)..."
RESPONSE_DIRECTORY_ACADEMY=$(curl -s -X POST https://api.stripe.com/v1/prices \
  -u "${STRIPE_SECRET_KEY}:" \
  -d "product=${PROD_DIRECTORY_ACADEMY}" \
  -d "currency=brl" \
  -d "unit_amount=24900" \
  -d "recurring[interval]=month" \
  -d "nickname=Diretório + Academia - Mensal (Teste)")

if [ "$HAS_JQ" = true ]; then
    PRICE_DIRECTORY_ACADEMY=$(echo "$RESPONSE_DIRECTORY_ACADEMY" | jq -r '.id')
    if [ "$PRICE_DIRECTORY_ACADEMY" != "null" ] && [ -n "$PRICE_DIRECTORY_ACADEMY" ]; then
        echo "   ✅ Price criado: $PRICE_DIRECTORY_ACADEMY"
    else
        ERROR_MSG=$(echo "$RESPONSE_DIRECTORY_ACADEMY" | jq -r '.error.message // "Erro desconhecido"')
        echo "   ❌ Erro: $ERROR_MSG"
        echo "   Resposta completa: $RESPONSE_DIRECTORY_ACADEMY"
        PRICE_DIRECTORY_ACADEMY=""
    fi
else
    echo "$RESPONSE_DIRECTORY_ACADEMY"
    echo ""
    read -p "   Cole o Price ID aqui (price_...): " PRICE_DIRECTORY_ACADEMY
fi

echo ""

# =============================================================================
# 3. Criar Price para Premium (R$ 479,00)
# =============================================================================
echo "📦 Criando Price para Premium (R$ 479,00/mês)..."
RESPONSE_PREMIUM=$(curl -s -X POST https://api.stripe.com/v1/prices \
  -u "${STRIPE_SECRET_KEY}:" \
  -d "product=${PROD_PREMIUM}" \
  -d "currency=brl" \
  -d "unit_amount=47900" \
  -d "recurring[interval]=month" \
  -d "nickname=Premium - Mensal (Teste)")

if [ "$HAS_JQ" = true ]; then
    PRICE_PREMIUM=$(echo "$RESPONSE_PREMIUM" | jq -r '.id')
    if [ "$PRICE_PREMIUM" != "null" ] && [ -n "$PRICE_PREMIUM" ]; then
        echo "   ✅ Price criado: $PRICE_PREMIUM"
    else
        ERROR_MSG=$(echo "$RESPONSE_PREMIUM" | jq -r '.error.message // "Erro desconhecido"')
        echo "   ❌ Erro: $ERROR_MSG"
        echo "   Resposta completa: $RESPONSE_PREMIUM"
        PRICE_PREMIUM=""
    fi
else
    echo "$RESPONSE_PREMIUM"
    echo ""
    read -p "   Cole o Price ID aqui (price_...): " PRICE_PREMIUM
fi

echo ""

# =============================================================================
# 4. Resumo e Próximos Passos
# =============================================================================
echo "============================================================"
echo "  ✅ PRICES DE TESTE CRIADOS"
echo "============================================================"
echo ""
echo "📋 Price IDs criados:"
echo ""
echo "   STRIPE_PRICE_DIRECTORY=$PRICE_DIRECTORY"
echo "   STRIPE_PRICE_DIRECTORY_ACADEMY=$PRICE_DIRECTORY_ACADEMY"
echo "   STRIPE_PRICE_PREMIUM=$PRICE_PREMIUM"
echo ""

if [ -n "$PRICE_DIRECTORY" ] && [ -n "$PRICE_DIRECTORY_ACADEMY" ] && [ -n "$PRICE_PREMIUM" ]; then
    echo "🔧 Próximos passos:"
    echo ""
    echo "   1. Configure os secrets no Supabase:"
    echo ""
    echo "      supabase secrets set STRIPE_PRICE_DIRECTORY=$PRICE_DIRECTORY"
    echo "      supabase secrets set STRIPE_PRICE_DIRECTORY_ACADEMY=$PRICE_DIRECTORY_ACADEMY"
    echo "      supabase secrets set STRIPE_PRICE_PREMIUM=$PRICE_PREMIUM"
    echo ""
    echo "   2. Atualize o código:"
    echo "      - pages/Planos.tsx (array PLANS)"
    echo "      - supabase/functions/stripe-webhook/index.ts (PRICE_TO_PLAN_MAP)"
    echo "      - supabase/functions/sync-subscription/index.ts (PRICE_TO_PLAN_MAP)"
    echo ""
    echo "   3. Faça o redeploy das Edge Functions:"
    echo "      supabase functions deploy create-checkout"
    echo "      supabase functions deploy stripe-webhook"
    echo "      supabase functions deploy sync-subscription"
    echo ""
else
    echo "⚠️  Alguns prices não foram criados. Verifique os erros acima."
    echo ""
fi

echo "============================================================"
echo ""
