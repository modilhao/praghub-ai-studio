#!/bin/bash

# =============================================================================
# SCRIPT AUTOMÁTICO DE CONFIGURAÇÃO DOS SECRETS DO SUPABASE
# =============================================================================
# Este script configura todos os secrets conhecidos no Supabase
# A Service Role Key precisa ser fornecida manualmente por segurança
# =============================================================================

set -e

PROJECT_REF="nkbcpwbgvesbkaebmkkw"

# Valores conhecidos do Stripe (modo teste)
# ⚠️ IMPORTANTE: Configure STRIPE_SECRET_KEY via variável de ambiente ou forneça quando executar
STRIPE_SECRET_KEY="${STRIPE_SECRET_KEY:-}"
SUPABASE_URL="https://nkbcpwbgvesbkaebmkkw.supabase.co"

# Price IDs do Stripe (confirmados)
STRIPE_PRICE_DIRECTORY="price_1Sp9iDJULNOvBzJ4rHEy276L"
STRIPE_PRICE_DIRECTORY_ACADEMY="price_1Sp9irJULNOvBzJ4peDiLsfv"
STRIPE_PRICE_PREMIUM="price_1Sp9kcJULNOvBzJ492cQGIWE"

# APP_BASE_URL - será configurado para produção depois
# Por enquanto, deixamos como localhost para desenvolvimento
APP_BASE_URL="http://localhost:3000"

echo ""
echo "============================================================"
echo "  🔧 CONFIGURAÇÃO AUTOMÁTICA DOS SECRETS DO SUPABASE"
echo "============================================================"
echo ""
echo "📋 Projeto: $PROJECT_REF"
echo ""

# Verificar se está autenticado
if ! supabase projects list &> /dev/null; then
    echo "❌ Você não está autenticado no Supabase CLI."
    echo "   Execute: supabase login"
    exit 1
fi

echo "✅ Autenticado no Supabase CLI"
echo ""

# Linkar projeto se necessário
if [ ! -f ".supabase/config.toml" ]; then
    echo "🔗 Linkando projeto..."
    supabase link --project-ref $PROJECT_REF
    echo ""
fi

echo "⚙️  Configurando secrets..."
echo ""

# Verificar se STRIPE_SECRET_KEY foi fornecida
if [ -z "$STRIPE_SECRET_KEY" ]; then
    echo "⚠️  STRIPE_SECRET_KEY não fornecida via variável de ambiente"
    echo "   Para configurar, execute:"
    echo "   STRIPE_SECRET_KEY='sk_test_...' bash scripts/CONFIGURAR_SECRETS_AUTOMATICO.sh"
    echo ""
    read -p "   Deseja fornecer a chave agora? (s/n): " fornecer_chave
    if [ "$fornecer_chave" = "s" ] || [ "$fornecer_chave" = "S" ]; then
        read -p "   Cole sua STRIPE_SECRET_KEY: " STRIPE_SECRET_KEY
    else
        echo "   Pulando configuração de STRIPE_SECRET_KEY"
    fi
fi

# Configurar STRIPE_SECRET_KEY se fornecida
if [ -n "$STRIPE_SECRET_KEY" ]; then
    echo "   ✓ Configurando STRIPE_SECRET_KEY..."
    supabase secrets set STRIPE_SECRET_KEY="$STRIPE_SECRET_KEY" --project-ref $PROJECT_REF || {
        echo "   ❌ Erro ao configurar STRIPE_SECRET_KEY"
        exit 1
    }
else
    echo "   ⚠️  STRIPE_SECRET_KEY não configurada (pode já estar configurada)"
fi

# Configurar Price IDs
echo "   ✓ Configurando STRIPE_PRICE_DIRECTORY..."
supabase secrets set STRIPE_PRICE_DIRECTORY="$STRIPE_PRICE_DIRECTORY" --project-ref $PROJECT_REF || {
    echo "   ❌ Erro ao configurar STRIPE_PRICE_DIRECTORY"
    exit 1
}

echo "   ✓ Configurando STRIPE_PRICE_DIRECTORY_ACADEMY..."
supabase secrets set STRIPE_PRICE_DIRECTORY_ACADEMY="$STRIPE_PRICE_DIRECTORY_ACADEMY" --project-ref $PROJECT_REF || {
    echo "   ❌ Erro ao configurar STRIPE_PRICE_DIRECTORY_ACADEMY"
    exit 1
}

echo "   ✓ Configurando STRIPE_PRICE_PREMIUM..."
supabase secrets set STRIPE_PRICE_PREMIUM="$STRIPE_PRICE_PREMIUM" --project-ref $PROJECT_REF || {
    echo "   ❌ Erro ao configurar STRIPE_PRICE_PREMIUM"
    exit 1
}

# Configurar SUPABASE_URL (algumas Edge Functions podem precisar)
echo "   ✓ Configurando SUPABASE_URL..."
supabase secrets set SUPABASE_URL="$SUPABASE_URL" --project-ref $PROJECT_REF || {
    echo "   ⚠️  SUPABASE_URL pode já estar disponível automaticamente"
}

# Configurar APP_BASE_URL
echo "   ✓ Configurando APP_BASE_URL..."
supabase secrets set APP_BASE_URL="$APP_BASE_URL" --project-ref $PROJECT_REF || {
    echo "   ❌ Erro ao configurar APP_BASE_URL"
    exit 1
}

echo ""
echo "⚠️  SERVICE_ROLE_KEY precisa ser configurada manualmente"
echo ""
echo "   Para obter a Service Role Key:"
echo "   1. Acesse: https://app.supabase.com/project/$PROJECT_REF/settings/api"
echo "   2. Procure por 'service_role' na seção 'Project API keys'"
echo "   3. Clique em 'Reveal' para ver a chave"
echo "   4. Execute:"
echo ""
echo "   supabase secrets set SERVICE_ROLE_KEY='sua-chave-aqui' --project-ref $PROJECT_REF"
echo ""

# Listar secrets configurados
echo "📋 Secrets configurados:"
echo ""
supabase secrets list --project-ref $PROJECT_REF || {
    echo "   ⚠️  Não foi possível listar secrets (pode ser normal)"
}

echo ""
echo "============================================================"
echo "  ✅ SECRETS CONFIGURADOS COM SUCESSO!"
echo "============================================================"
echo ""
echo "📝 Próximos passos:"
echo ""
echo "   1. Configure a SERVICE_ROLE_KEY (veja instruções acima)"
echo ""
echo "   2. Para produção, atualize APP_BASE_URL:"
echo "      supabase secrets set APP_BASE_URL='https://seu-dominio.vercel.app' --project-ref $PROJECT_REF"
echo ""
echo "   3. Verifique se as Edge Functions estão deployadas:"
echo "      supabase functions list --project-ref $PROJECT_REF"
echo ""
echo "============================================================"
echo ""
