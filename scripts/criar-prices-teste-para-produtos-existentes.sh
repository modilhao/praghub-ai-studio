#!/bin/bash

# =============================================================================
# Script para criar Prices de TESTE para produtos EXISTENTES no Stripe
# =============================================================================
# Este script cria prices de teste para os produtos de produção existentes
# usando a chave de teste do Stripe.
# =============================================================================

set -e

# Chave de teste do Stripe (obtenha em: https://dashboard.stripe.com/test/apikeys)
STRIPE_SECRET_KEY="${STRIPE_SECRET_KEY:-sk_test_51HCPguJULNOvBzJ4ijJLwk6kAueh30tWqrIyuWXqmcwfKLHVvbe673HNBp7ogTwVBUTIwzbV2l1QGu7PjHk9hm5500fsCCgT0h}"

# Product IDs existentes (PRODUÇÃO)
PROD_DIRECTORY="prod_TmjATzLyvp3Fuc"
PROD_DIRECTORY_ACADEMY="prod_TmjB1LwAxfW5VW"
PROD_PREMIUM="prod_TmjCd15ymEboB8"

echo ""
echo "============================================================"
echo "  🚀 CRIANDO PRICES DE TESTE PARA PRODUTOS EXISTENTES"
echo "============================================================"
echo ""

if [ -z "$STRIPE_SECRET_KEY" ]; then
    echo "❌ STRIPE_SECRET_KEY não configurada!"
    echo "   Configure via variável de ambiente:"
    echo "   STRIPE_SECRET_KEY='sk_test_...' bash scripts/criar-prices-teste-para-produtos-existentes.sh"
    exit 1
fi

# Verificar se curl está disponível
if ! command -v curl &> /dev/null; then
    echo "❌ curl não encontrado. Instale curl para continuar."
    exit 1
fi

# Verificar se jq está disponível
HAS_JQ=false
if command -v jq &> /dev/null; then
    HAS_JQ=true
    echo "✅ jq encontrado"
else
    echo "⚠️  jq não encontrado - você precisará copiar os Price IDs manualmente"
fi

echo ""

# =============================================================================
# 1. Criar Price para Diretório (R$ 149,00) - TESTE
# =============================================================================
echo "📦 Criando Price de TESTE para Diretório (R$ 149,00/mês)..."
RESPONSE_DIRECTORY=$(curl -s -X POST https://api.stripe.com/v1/prices \
  -u "${STRIPE_SECRET_KEY}:" \
  -d "product=${PROD_DIRECTORY}" \
  -d "currency=brl" \
  -d "unit_amount=14900" \
  -d "recurring[interval]=month" \
  -d "nickname=Diretório - Mensal (Teste)")

if [ "$HAS_JQ" = true ]; then
    PRICE_DIRECTORY=$(echo "$RESPONSE_DIRECTORY" | jq -r '.id')
    ERROR=$(echo "$RESPONSE_DIRECTORY" | jq -r '.error.message // empty')
    if [ -n "$ERROR" ]; then
        echo "   ❌ Erro: $ERROR"
        PRICE_DIRECTORY=""
    elif [ "$PRICE_DIRECTORY" != "null" ] && [ -n "$PRICE_DIRECTORY" ]; then
        echo "   ✅ Price criado: $PRICE_DIRECTORY"
    else
        echo "   ❌ Erro desconhecido"
        echo "   Resposta: $RESPONSE_DIRECTORY"
        PRICE_DIRECTORY=""
    fi
else
    echo "$RESPONSE_DIRECTORY"
    read -p "   Cole o Price ID aqui (price_...): " PRICE_DIRECTORY
fi

echo ""

# =============================================================================
# 2. Criar Price para Diretório + Academia (R$ 249,00) - TESTE
# =============================================================================
echo "📦 Criando Price de TESTE para Diretório + Academia (R$ 249,00/mês)..."
RESPONSE_DIRECTORY_ACADEMY=$(curl -s -X POST https://api.stripe.com/v1/prices \
  -u "${STRIPE_SECRET_KEY}:" \
  -d "product=${PROD_DIRECTORY_ACADEMY}" \
  -d "currency=brl" \
  -d "unit_amount=24900" \
  -d "recurring[interval]=month" \
  -d "nickname=Diretório + Academia - Mensal (Teste)")

if [ "$HAS_JQ" = true ]; then
    PRICE_DIRECTORY_ACADEMY=$(echo "$RESPONSE_DIRECTORY_ACADEMY" | jq -r '.id')
    ERROR=$(echo "$RESPONSE_DIRECTORY_ACADEMY" | jq -r '.error.message // empty')
    if [ -n "$ERROR" ]; then
        echo "   ❌ Erro: $ERROR"
        PRICE_DIRECTORY_ACADEMY=""
    elif [ "$PRICE_DIRECTORY_ACADEMY" != "null" ] && [ -n "$PRICE_DIRECTORY_ACADEMY" ]; then
        echo "   ✅ Price criado: $PRICE_DIRECTORY_ACADEMY"
    else
        echo "   ❌ Erro desconhecido"
        echo "   Resposta: $RESPONSE_DIRECTORY_ACADEMY"
        PRICE_DIRECTORY_ACADEMY=""
    fi
else
    echo "$RESPONSE_DIRECTORY_ACADEMY"
    read -p "   Cole o Price ID aqui (price_...): " PRICE_DIRECTORY_ACADEMY
fi

echo ""

# =============================================================================
# 3. Criar Price para Premium (R$ 479,00) - TESTE
# =============================================================================
echo "📦 Criando Price de TESTE para Premium (R$ 479,00/mês)..."
RESPONSE_PREMIUM=$(curl -s -X POST https://api.stripe.com/v1/prices \
  -u "${STRIPE_SECRET_KEY}:" \
  -d "product=${PROD_PREMIUM}" \
  -d "currency=brl" \
  -d "unit_amount=47900" \
  -d "recurring[interval]=month" \
  -d "nickname=Premium - Mensal (Teste)")

if [ "$HAS_JQ" = true ]; then
    PRICE_PREMIUM=$(echo "$RESPONSE_PREMIUM" | jq -r '.id')
    ERROR=$(echo "$RESPONSE_PREMIUM" | jq -r '.error.message // empty')
    if [ -n "$ERROR" ]; then
        echo "   ❌ Erro: $ERROR"
        PRICE_PREMIUM=""
    elif [ "$PRICE_PREMIUM" != "null" ] && [ -n "$PRICE_PREMIUM" ]; then
        echo "   ✅ Price criado: $PRICE_PREMIUM"
    else
        echo "   ❌ Erro desconhecido"
        echo "   Resposta: $RESPONSE_PREMIUM"
        PRICE_PREMIUM=""
    fi
else
    echo "$RESPONSE_PREMIUM"
    read -p "   Cole o Price ID aqui (price_...): " PRICE_PREMIUM
fi

echo ""

# =============================================================================
# 4. Resumo e Configuração
# =============================================================================
echo "============================================================"
echo "  ✅ PRICES DE TESTE CRIADOS"
echo "============================================================"
echo ""

if [ -n "$PRICE_DIRECTORY" ] && [ -n "$PRICE_DIRECTORY_ACADEMY" ] && [ -n "$PRICE_PREMIUM" ]; then
    echo "📋 Price IDs criados:"
    echo ""
    echo "   STRIPE_PRICE_DIRECTORY=$PRICE_DIRECTORY"
    echo "   STRIPE_PRICE_DIRECTORY_ACADEMY=$PRICE_DIRECTORY_ACADEMY"
    echo "   STRIPE_PRICE_PREMIUM=$PRICE_PREMIUM"
    echo ""
    echo "🔧 Configurando secrets no Supabase..."
    echo ""
    
    PROJECT_REF="nkbcpwbgvesbkaebmkkw"
    
    supabase secrets set STRIPE_PRICE_DIRECTORY="$PRICE_DIRECTORY" --project-ref $PROJECT_REF
    supabase secrets set STRIPE_PRICE_DIRECTORY_ACADEMY="$PRICE_DIRECTORY_ACADEMY" --project-ref $PROJECT_REF
    supabase secrets set STRIPE_PRICE_PREMIUM="$PRICE_PREMIUM" --project-ref $PROJECT_REF
    
    echo ""
    echo "✅ Secrets configurados!"
    echo ""
    echo "📋 Próximo passo: Redeploy das Edge Functions"
    echo ""
    echo "   supabase functions deploy create-checkout --project-ref $PROJECT_REF"
    echo "   supabase functions deploy stripe-webhook --project-ref $PROJECT_REF"
    echo "   supabase functions deploy sync-subscription --project-ref $PROJECT_REF"
    echo ""
else
    echo "⚠️  Alguns prices não foram criados. Verifique os erros acima."
    echo ""
    if [ -n "$PRICE_DIRECTORY" ]; then
        echo "   STRIPE_PRICE_DIRECTORY=$PRICE_DIRECTORY"
    fi
    if [ -n "$PRICE_DIRECTORY_ACADEMY" ]; then
        echo "   STRIPE_PRICE_DIRECTORY_ACADEMY=$PRICE_DIRECTORY_ACADEMY"
    fi
    if [ -n "$PRICE_PREMIUM" ]; then
        echo "   STRIPE_PRICE_PREMIUM=$PRICE_PREMIUM"
    fi
fi

echo "============================================================"
echo ""
