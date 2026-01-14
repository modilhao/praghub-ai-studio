#!/bin/bash

# =============================================================================
# SCRIPT DE CONFIGURAÇÃO DOS SECRETS DO SUPABASE PARA TESTES
# =============================================================================
# Este script configura todas as variáveis de ambiente necessárias para
# testar o fluxo completo de pagamento com Stripe.
# =============================================================================

set -e

echo ""
echo "============================================================"
echo "  🔧 CONFIGURAÇÃO DOS SECRETS DO SUPABASE - MODO TESTE"
echo "============================================================"
echo ""

# Valores já conhecidos
PROJECT_REF="nkbcpwbgvesbkaebmkkw"
STRIPE_SECRET_KEY="sk_test_51HCPguJULNOvBzJ4ijJLwk6kAueh30tWqrIyuWXqmcwfKLHVvbe673HNBp7ogTwVBUTIwzbV2l1QGu7PjHk9hm5500fsCCgT0h"
SUPABASE_URL="https://nkbcpwbgvesbkaebmkkw.supabase.co"
APP_BASE_URL="http://localhost:3000"

# Price IDs confirmados via MCP Stripe
STRIPE_PRICE_DIRECTORY="price_1Sp9iDJULNOvBzJ4rHEy276L"
STRIPE_PRICE_DIRECTORY_ACADEMY="price_1Sp9irJULNOvBzJ4peDiLsfv"
STRIPE_PRICE_PREMIUM="price_1Sp9kcJULNOvBzJ492cQGIWE"

echo "📋 Configurações pré-definidas:"
echo "   • Project Ref: $PROJECT_REF"
echo "   • Stripe Mode: TEST (sk_test_...)"
echo "   • Supabase URL: $SUPABASE_URL"
echo "   • App URL: $APP_BASE_URL"
echo ""

# =============================================================================
# PASSO 1: Verificar/fazer login no Supabase CLI
# =============================================================================
echo "🔐 PASSO 1: Verificando autenticação do Supabase CLI..."
echo ""

if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI não encontrado!"
    echo "   Instale com: brew install supabase/tap/supabase"
    exit 1
fi

# Tenta listar projetos para verificar se está logado
if ! supabase projects list &> /dev/null; then
    echo "⚠️  Você não está logado no Supabase CLI."
    echo "   Executando 'supabase login'..."
    echo ""
    supabase login
    echo ""
fi

echo "✅ Autenticado no Supabase CLI!"
echo ""

# =============================================================================
# PASSO 2: Linkar projeto
# =============================================================================
echo "🔗 PASSO 2: Linkando projeto..."
echo ""

# Verifica se já está linkado
if [ ! -f ".supabase/config.toml" ]; then
    echo "   Linkando ao projeto $PROJECT_REF..."
    supabase link --project-ref $PROJECT_REF
    echo ""
fi

echo "✅ Projeto linkado!"
echo ""

# =============================================================================
# PASSO 3: Solicitar Service Role Key
# =============================================================================
echo "🔑 PASSO 3: Configuração da Service Role Key"
echo ""
echo "   A service_role key é necessária para as Edge Functions."
echo "   Obtenha em:"
echo "   https://app.supabase.com/project/$PROJECT_REF/settings/api"
echo ""
echo "   Procure por 'service_role' na seção 'Project API keys'"
echo "   (clique em 'Reveal' para ver a chave completa)"
echo ""
read -p "   Cole sua service_role key aqui: " SUPABASE_SERVICE_ROLE_KEY
echo ""

if [ -z "$SUPABASE_SERVICE_ROLE_KEY" ]; then
    echo "❌ Service role key não pode estar vazia!"
    exit 1
fi

# Validação básica
if [[ ! "$SUPABASE_SERVICE_ROLE_KEY" == eyJ* ]]; then
    echo "⚠️  A chave não parece ser um JWT válido (deve começar com 'eyJ')"
    read -p "   Continuar mesmo assim? (s/n): " confirm
    if [ "$confirm" != "s" ] && [ "$confirm" != "S" ]; then
        echo "   Abortado."
        exit 1
    fi
fi

echo "✅ Service role key recebida!"
echo ""

# =============================================================================
# PASSO 4: Configurar todos os secrets
# =============================================================================
echo "⚙️  PASSO 4: Configurando secrets no Supabase..."
echo ""

echo "   Configurando STRIPE_SECRET_KEY..."
supabase secrets set STRIPE_SECRET_KEY="$STRIPE_SECRET_KEY" --project-ref $PROJECT_REF

echo "   ⚠️  SUPABASE_URL está disponível automaticamente nas Edge Functions"
echo "      (não precisa ser configurada como secret)"

echo "   Configurando SERVICE_ROLE_KEY..."
supabase secrets set SERVICE_ROLE_KEY="$SUPABASE_SERVICE_ROLE_KEY" --project-ref $PROJECT_REF

echo "   Configurando APP_BASE_URL..."
supabase secrets set APP_BASE_URL="$APP_BASE_URL" --project-ref $PROJECT_REF

echo "   Configurando STRIPE_PRICE_DIRECTORY..."
supabase secrets set STRIPE_PRICE_DIRECTORY="$STRIPE_PRICE_DIRECTORY" --project-ref $PROJECT_REF

echo "   Configurando STRIPE_PRICE_DIRECTORY_ACADEMY..."
supabase secrets set STRIPE_PRICE_DIRECTORY_ACADEMY="$STRIPE_PRICE_DIRECTORY_ACADEMY" --project-ref $PROJECT_REF

echo "   Configurando STRIPE_PRICE_PREMIUM..."
supabase secrets set STRIPE_PRICE_PREMIUM="$STRIPE_PRICE_PREMIUM" --project-ref $PROJECT_REF

echo ""
echo "✅ Todos os secrets configurados!"
echo ""

# =============================================================================
# PASSO 5: Verificar configuração
# =============================================================================
echo "📋 PASSO 5: Verificando secrets configurados..."
echo ""
echo "   Secrets configurados:"
supabase secrets list --project-ref $PROJECT_REF
echo ""
echo "   ⚠️  Nota: SUPABASE_URL está disponível automaticamente"
echo "      e não aparece na lista acima (comportamento normal)"
echo ""

# =============================================================================
# RESUMO FINAL
# =============================================================================
echo ""
echo "============================================================"
echo "  ✅ CONFIGURAÇÃO CONCLUÍDA COM SUCESSO!"
echo "============================================================"
echo ""
echo "📋 Próximos passos:"
echo ""
echo "   1. Inicie o servidor local:"
echo "      npm run dev"
echo ""
echo "   2. Acesse a página de planos:"
echo "      http://localhost:3000/#/planos"
echo ""
echo "   3. Faça login como usuário COMPANY"
echo ""
echo "   4. Clique em qualquer botão de assinatura"
echo ""
echo "   5. Use o cartão de teste do Stripe:"
echo "      • Número: 4242 4242 4242 4242"
echo "      • Data: qualquer futura (ex: 12/30)"
echo "      • CVC: qualquer 3 dígitos (ex: 123)"
echo ""
echo "============================================================"
echo ""
