#!/bin/bash
# Script para configurar secrets do Supabase automaticamente
# Execute: bash scripts/EPIC_01_CONFIGURAR_SECRETS_AUTOMATICO.sh

set -e

echo "🔧 Configurando Secrets do Supabase para EPIC 01"
echo ""

# Cores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Verificar se supabase CLI está instalado
if ! command -v supabase &> /dev/null; then
    echo -e "${RED}❌ Supabase CLI não está instalado.${NC}"
    echo "Instale com: npm install -g supabase"
    exit 1
fi

# Verificar se está autenticado
if ! supabase projects list &> /dev/null; then
    echo -e "${YELLOW}⚠️  Você precisa estar autenticado no Supabase CLI${NC}"
    echo "Execute: supabase login"
    exit 1
fi

# Valores já conhecidos
SUPABASE_URL="https://nkbcpwbgvesbkaebmkkw.supabase.co"
STRIPE_PRICE_DIRECTORY="price_1Sp9iDJULNOvBzJ4rHEy276L"
STRIPE_PRICE_DIRECTORY_ACADEMY="price_1Sp9irJULNOvBzJ4peDiLsfv"
STRIPE_PRICE_PREMIUM="price_1Sp9kcJULNOvBzJ492cQGIWE"
APP_BASE_URL="http://localhost:3000"

echo "📋 Valores que serão configurados:"
echo "  - SUPABASE_URL: $SUPABASE_URL"
echo "  - STRIPE_PRICE_DIRECTORY: $STRIPE_PRICE_DIRECTORY"
echo "  - STRIPE_PRICE_DIRECTORY_ACADEMY: $STRIPE_PRICE_DIRECTORY_ACADEMY"
echo "  - STRIPE_PRICE_PREMIUM: $STRIPE_PRICE_PREMIUM"
echo "  - APP_BASE_URL: $APP_BASE_URL"
echo ""

# Solicitar valores que precisam ser fornecidos
echo -e "${YELLOW}⚠️  Você precisa fornecer os seguintes valores:${NC}"
echo ""

# STRIPE_SECRET_KEY
read -p "Digite a STRIPE_SECRET_KEY (sk_test_... ou sk_live_...): " STRIPE_SECRET_KEY
if [ -z "$STRIPE_SECRET_KEY" ]; then
    echo -e "${RED}❌ STRIPE_SECRET_KEY é obrigatória${NC}"
    exit 1
fi

# SUPABASE_SERVICE_ROLE_KEY
read -p "Digite a SUPABASE_SERVICE_ROLE_KEY (eyJ...): " SUPABASE_SERVICE_ROLE_KEY
if [ -z "$SUPABASE_SERVICE_ROLE_KEY" ]; then
    echo -e "${RED}❌ SUPABASE_SERVICE_ROLE_KEY é obrigatória${NC}"
    exit 1
fi

# STRIPE_WEBHOOK_SECRET (opcional)
read -p "Digite a STRIPE_WEBHOOK_SECRET (whsec_...) [opcional, pode deixar vazio]: " STRIPE_WEBHOOK_SECRET

echo ""
echo -e "${GREEN}🚀 Configurando secrets...${NC}"
echo ""

# Configurar secrets
supabase secrets set STRIPE_SECRET_KEY="$STRIPE_SECRET_KEY" || {
    echo -e "${RED}❌ Erro ao configurar STRIPE_SECRET_KEY${NC}"
    exit 1
}
echo -e "${GREEN}✅ STRIPE_SECRET_KEY configurada${NC}"

supabase secrets set STRIPE_PRICE_DIRECTORY="$STRIPE_PRICE_DIRECTORY" || {
    echo -e "${RED}❌ Erro ao configurar STRIPE_PRICE_DIRECTORY${NC}"
    exit 1
}
echo -e "${GREEN}✅ STRIPE_PRICE_DIRECTORY configurada${NC}"

supabase secrets set STRIPE_PRICE_DIRECTORY_ACADEMY="$STRIPE_PRICE_DIRECTORY_ACADEMY" || {
    echo -e "${RED}❌ Erro ao configurar STRIPE_PRICE_DIRECTORY_ACADEMY${NC}"
    exit 1
}
echo -e "${GREEN}✅ STRIPE_PRICE_DIRECTORY_ACADEMY configurada${NC}"

supabase secrets set STRIPE_PRICE_PREMIUM="$STRIPE_PRICE_PREMIUM" || {
    echo -e "${RED}❌ Erro ao configurar STRIPE_PRICE_PREMIUM${NC}"
    exit 1
}
echo -e "${GREEN}✅ STRIPE_PRICE_PREMIUM configurada${NC}"

supabase secrets set SUPABASE_URL="$SUPABASE_URL" || {
    echo -e "${RED}❌ Erro ao configurar SUPABASE_URL${NC}"
    exit 1
}
echo -e "${GREEN}✅ SUPABASE_URL configurada${NC}"

supabase secrets set SUPABASE_SERVICE_ROLE_KEY="$SUPABASE_SERVICE_ROLE_KEY" || {
    echo -e "${RED}❌ Erro ao configurar SUPABASE_SERVICE_ROLE_KEY${NC}"
    exit 1
}
echo -e "${GREEN}✅ SUPABASE_SERVICE_ROLE_KEY configurada${NC}"

supabase secrets set APP_BASE_URL="$APP_BASE_URL" || {
    echo -e "${RED}❌ Erro ao configurar APP_BASE_URL${NC}"
    exit 1
}
echo -e "${GREEN}✅ APP_BASE_URL configurada${NC}"

if [ -n "$STRIPE_WEBHOOK_SECRET" ]; then
    supabase secrets set STRIPE_WEBHOOK_SECRET="$STRIPE_WEBHOOK_SECRET" || {
        echo -e "${YELLOW}⚠️  Erro ao configurar STRIPE_WEBHOOK_SECRET (pode ser configurado depois)${NC}"
    }
    echo -e "${GREEN}✅ STRIPE_WEBHOOK_SECRET configurada${NC}"
fi

echo ""
echo -e "${GREEN}✅ Todos os secrets foram configurados com sucesso!${NC}"
echo ""
echo "📋 Verificar secrets configurados:"
echo "   supabase secrets list"
echo ""
echo "🔄 Próximo passo: Redeploy das Edge Functions"
echo "   supabase functions deploy create-checkout"
echo "   supabase functions deploy stripe-webhook"
echo "   supabase functions deploy sync-subscription"
