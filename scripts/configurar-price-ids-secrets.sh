#!/bin/bash

# =============================================================================
# Script para configurar Price IDs de TESTE como secrets no Supabase
# =============================================================================

set -e

PROJECT_REF="nkbcpwbgvesbkaebmkkw"

# Price IDs de TESTE criados
STRIPE_PRICE_DIRECTORY="price_1SpTBFJULNOvBzJ46Hf2TCJK"
STRIPE_PRICE_DIRECTORY_ACADEMY="price_1SpTBGJULNOvBzJ4ZEmSu0zk"
STRIPE_PRICE_PREMIUM="price_1SpTBGJULNOvBzJ4P3WdhYfN"

echo ""
echo "============================================================"
echo "  ⚙️  CONFIGURANDO PRICE IDs COMO SECRETS NO SUPABASE"
echo "============================================================"
echo ""

# Verificar se está linkado
if [ ! -f ".supabase/config.toml" ]; then
    echo "⚠️  Projeto não está linkado. Linkando agora..."
    supabase link --project-ref $PROJECT_REF
    echo ""
fi

echo "🔧 Configurando secrets..."
echo ""

echo "   Configurando STRIPE_PRICE_DIRECTORY..."
supabase secrets set STRIPE_PRICE_DIRECTORY="$STRIPE_PRICE_DIRECTORY" --project-ref $PROJECT_REF

echo "   Configurando STRIPE_PRICE_DIRECTORY_ACADEMY..."
supabase secrets set STRIPE_PRICE_DIRECTORY_ACADEMY="$STRIPE_PRICE_DIRECTORY_ACADEMY" --project-ref $PROJECT_REF

echo "   Configurando STRIPE_PRICE_PREMIUM..."
supabase secrets set STRIPE_PRICE_PREMIUM="$STRIPE_PRICE_PREMIUM" --project-ref $PROJECT_REF

echo ""
echo "✅ Price IDs configurados como secrets!"
echo ""
echo "📋 Próximo passo: Redeploy das Edge Functions"
echo ""
echo "   supabase functions deploy create-checkout"
echo "   supabase functions deploy stripe-webhook"
echo "   supabase functions deploy sync-subscription"
echo ""
echo "============================================================"
echo ""
