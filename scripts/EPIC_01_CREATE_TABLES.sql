-- ============================================
-- EPIC 01: Billing, Planos e Entitlements
-- Criação das tabelas de subscriptions e entitlements
-- ============================================

-- Tabela subscriptions: armazena assinaturas ativas e histórico
CREATE TABLE IF NOT EXISTS subscriptions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    stripe_customer_id TEXT UNIQUE NOT NULL,
    stripe_subscription_id TEXT UNIQUE NOT NULL,
    plan_key TEXT NOT NULL CHECK (plan_key IN ('directory', 'directory_academy', 'premium')),
    status TEXT NOT NULL CHECK (status IN (
        'active', 
        'canceled', 
        'past_due', 
        'trialing', 
        'incomplete', 
        'incomplete_expired', 
        'unpaid',
        'paused'
    )),
    current_period_start TIMESTAMPTZ NOT NULL,
    current_period_end TIMESTAMPTZ NOT NULL,
    cancel_at_period_end BOOLEAN DEFAULT FALSE,
    canceled_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Tabela entitlements: fonte de verdade para permissões de acesso
CREATE TABLE IF NOT EXISTS entitlements (
    profile_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
    directory_access BOOLEAN DEFAULT FALSE NOT NULL,
    academy_access BOOLEAN DEFAULT FALSE NOT NULL,
    premium_discounts BOOLEAN DEFAULT FALSE NOT NULL,
    basic_site_included BOOLEAN DEFAULT FALSE NOT NULL,
    last_synced_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()),
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Tabela webhook_events: rastreamento de eventos processados (idempotência)
CREATE TABLE IF NOT EXISTS webhook_events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    stripe_event_id TEXT UNIQUE NOT NULL,
    event_type TEXT NOT NULL,
    subscription_id TEXT, -- stripe_subscription_id
    processed_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    success BOOLEAN DEFAULT TRUE,
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ============================================
-- ÍNDICES
-- ============================================

-- Índices para subscriptions
CREATE INDEX IF NOT EXISTS idx_subscriptions_profile_id ON subscriptions(profile_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_customer_id ON subscriptions(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_subscription_id ON subscriptions(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_current_period_end ON subscriptions(current_period_end);

-- Índices para entitlements
CREATE INDEX IF NOT EXISTS idx_entitlements_directory_access ON entitlements(directory_access);
CREATE INDEX IF NOT EXISTS idx_entitlements_academy_access ON entitlements(academy_access);

-- Índices para webhook_events
CREATE INDEX IF NOT EXISTS idx_webhook_events_stripe_event_id ON webhook_events(stripe_event_id);
CREATE INDEX IF NOT EXISTS idx_webhook_events_subscription_id ON webhook_events(subscription_id);
CREATE INDEX IF NOT EXISTS idx_webhook_events_processed_at ON webhook_events(processed_at);

-- ============================================
-- TRIGGERS
-- ============================================

-- Trigger para atualizar updated_at em subscriptions
CREATE OR REPLACE FUNCTION update_subscriptions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_subscriptions_updated_at
    BEFORE UPDATE ON subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION update_subscriptions_updated_at();

-- Trigger para atualizar updated_at em entitlements
CREATE OR REPLACE FUNCTION update_entitlements_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_entitlements_updated_at
    BEFORE UPDATE ON entitlements
    FOR EACH ROW
    EXECUTE FUNCTION update_entitlements_updated_at();

-- ============================================
-- FUNÇÃO: Sincronizar entitlements baseado em subscription
-- ============================================

CREATE OR REPLACE FUNCTION sync_entitlements_from_subscription(
    p_profile_id UUID,
    p_plan_key TEXT,
    p_status TEXT
)
RETURNS VOID AS $$
DECLARE
    v_directory_access BOOLEAN := FALSE;
    v_academy_access BOOLEAN := FALSE;
    v_premium_discounts BOOLEAN := FALSE;
    v_basic_site_included BOOLEAN := FALSE;
    v_is_active BOOLEAN := FALSE;
BEGIN
    -- Determina se a subscription está ativa
    v_is_active := (p_status IN ('active', 'trialing'));
    
    -- Se não está ativa, revoga todos os entitlements
    IF NOT v_is_active THEN
        INSERT INTO entitlements (profile_id, directory_access, academy_access, premium_discounts, basic_site_included, last_synced_at, updated_at)
        VALUES (p_profile_id, FALSE, FALSE, FALSE, FALSE, NOW(), NOW())
        ON CONFLICT (profile_id) 
        DO UPDATE SET
            directory_access = FALSE,
            academy_access = FALSE,
            premium_discounts = FALSE,
            basic_site_included = FALSE,
            last_synced_at = NOW(),
            updated_at = NOW();
        RETURN;
    END IF;
    
    -- Mapeia plan_key para entitlements
    CASE p_plan_key
        WHEN 'directory' THEN
            v_directory_access := TRUE;
        WHEN 'directory_academy' THEN
            v_directory_access := TRUE;
            v_academy_access := TRUE;
        WHEN 'premium' THEN
            v_directory_access := TRUE;
            v_academy_access := TRUE;
            v_premium_discounts := TRUE;
            v_basic_site_included := TRUE;
    END CASE;
    
    -- Upsert entitlements
    INSERT INTO entitlements (
        profile_id, 
        directory_access, 
        academy_access, 
        premium_discounts, 
        basic_site_included,
        last_synced_at,
        updated_at
    )
    VALUES (
        p_profile_id,
        v_directory_access,
        v_academy_access,
        v_premium_discounts,
        v_basic_site_included,
        NOW(),
        NOW()
    )
    ON CONFLICT (profile_id) 
    DO UPDATE SET
        directory_access = EXCLUDED.directory_access,
        academy_access = EXCLUDED.academy_access,
        premium_discounts = EXCLUDED.premium_discounts,
        basic_site_included = EXCLUDED.basic_site_included,
        last_synced_at = NOW(),
        updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- RLS (Row Level Security)
-- ============================================

ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE entitlements ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_events ENABLE ROW LEVEL SECURITY;

-- Políticas para subscriptions
CREATE POLICY "Users can view their own subscriptions"
    ON subscriptions FOR SELECT
    USING (auth.uid() = profile_id);

CREATE POLICY "Service role can manage all subscriptions"
    ON subscriptions FOR ALL
    USING (auth.jwt() ->> 'role' = 'service_role');

-- Políticas para entitlements
CREATE POLICY "Users can view their own entitlements"
    ON entitlements FOR SELECT
    USING (auth.uid() = profile_id);

CREATE POLICY "Service role can manage all entitlements"
    ON entitlements FOR ALL
    USING (auth.jwt() ->> 'role' = 'service_role');

-- Políticas para webhook_events (apenas service role)
CREATE POLICY "Only service role can access webhook events"
    ON webhook_events FOR ALL
    USING (auth.jwt() ->> 'role' = 'service_role');

-- ============================================
-- COMENTÁRIOS
-- ============================================

COMMENT ON TABLE subscriptions IS 'Armazena assinaturas Stripe dos usuários';
COMMENT ON TABLE entitlements IS 'Fonte de verdade para permissões de acesso baseadas em planos';
COMMENT ON TABLE webhook_events IS 'Rastreamento de eventos Stripe processados (idempotência)';
COMMENT ON FUNCTION sync_entitlements_from_subscription IS 'Sincroniza entitlements baseado no plan_key e status da subscription';
