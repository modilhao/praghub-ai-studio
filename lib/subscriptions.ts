import { supabase } from './supabase';
import type { Subscription, Entitlements, PlanKey, SubscriptionStatus } from '../types';

/**
 * Busca a subscription ativa de um perfil
 */
export async function getActiveSubscription(profileId: string): Promise<Subscription | null> {
  const { data, error } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('profile_id', profileId)
    .in('status', ['active', 'trialing'])
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    if (error.code === 'PGRST116') {
      // Nenhuma subscription encontrada
      return null;
    }
    // Erro 406 pode indicar que a tabela não existe ou RLS está bloqueando
    if (error.code === 'PGRST301' || error.status === 406) {
      console.warn('Tabela subscriptions pode não existir ou RLS está bloqueando. Execute scripts/EPIC_01_CREATE_TABLES.sql');
      return null;
    }
    console.error('Error fetching subscription:', error);
    throw error;
  }

  // Se data é null (nenhum registro encontrado), retorna null
  if (!data) {
    return null;
  }

  return mapSubscriptionFromDB(data);
}

/**
 * Busca entitlements de um perfil
 */
export async function getEntitlements(profileId: string): Promise<Entitlements | null> {
  const { data, error } = await supabase
    .from('entitlements')
    .select('*')
    .eq('profile_id', profileId)
    .maybeSingle();

  if (error) {
    if (error.code === 'PGRST116') {
      // Nenhum entitlement encontrado - retorna defaults
      return {
        profileId,
        directoryAccess: false,
        academyAccess: false,
        premiumDiscounts: false,
        basicSiteIncluded: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    }
    // Erro 406 pode indicar que a tabela não existe ou RLS está bloqueando
    if (error.code === 'PGRST301' || error.status === 406) {
      console.warn('Tabela entitlements pode não existir ou RLS está bloqueando. Execute scripts/EPIC_01_CREATE_TABLES.sql');
      // Retorna defaults em caso de erro
      return {
        profileId,
        directoryAccess: false,
        academyAccess: false,
        premiumDiscounts: false,
        basicSiteIncluded: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    }
    console.error('Error fetching entitlements:', error);
    throw error;
  }

  // Se data é null (nenhum registro encontrado), retorna defaults
  if (!data) {
    return {
      profileId,
      directoryAccess: false,
      academyAccess: false,
      premiumDiscounts: false,
      basicSiteIncluded: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  return mapEntitlementsFromDB(data);
}

/**
 * Sincroniza subscription do Stripe para o DB
 * Esta função deve ser chamada pelo webhook ou manualmente
 */
export async function syncSubscriptionFromStripe(
  stripeSubscriptionId: string,
  stripeData: {
    customerId: string;
    status: string;
    planKey: PlanKey;
    currentPeriodStart: number;
    currentPeriodEnd: number;
    cancelAtPeriodEnd?: boolean;
    canceledAt?: number;
  }
): Promise<void> {
  // Primeiro, busca o profile_id pelo stripe_customer_id
  const { data: existingSub } = await supabase
    .from('subscriptions')
    .select('profile_id')
    .eq('stripe_customer_id', stripeData.customerId)
    .single();

  if (!existingSub) {
    throw new Error(`Profile not found for customer ${stripeData.customerId}`);
  }

  const profileId = existingSub.profile_id;

  // Upsert subscription
  const { error: subError } = await supabase
    .from('subscriptions')
    .upsert({
      profile_id: profileId,
      stripe_customer_id: stripeData.customerId,
      stripe_subscription_id: stripeSubscriptionId,
      plan_key: stripeData.planKey,
      status: stripeData.status as SubscriptionStatus,
      current_period_start: new Date(stripeData.currentPeriodStart * 1000).toISOString(),
      current_period_end: new Date(stripeData.currentPeriodEnd * 1000).toISOString(),
      cancel_at_period_end: stripeData.cancelAtPeriodEnd || false,
      canceled_at: stripeData.canceledAt 
        ? new Date(stripeData.canceledAt * 1000).toISOString() 
        : null,
      updated_at: new Date().toISOString(),
    }, {
      onConflict: 'stripe_subscription_id',
    });

  if (subError) {
    console.error('Error syncing subscription:', subError);
    throw subError;
  }

  // Sincroniza entitlements usando a função SQL
  const { error: entitlementsError } = await supabase.rpc('sync_entitlements_from_subscription', {
    p_profile_id: profileId,
    p_plan_key: stripeData.planKey,
    p_status: stripeData.status,
  });

  if (entitlementsError) {
    console.error('Error syncing entitlements:', entitlementsError);
    throw entitlementsError;
  }
}

/**
 * Remove subscription e revoga entitlements
 */
export async function cancelSubscription(stripeSubscriptionId: string): Promise<void> {
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('profile_id')
    .eq('stripe_subscription_id', stripeSubscriptionId)
    .single();

  if (!subscription) {
    throw new Error(`Subscription not found: ${stripeSubscriptionId}`);
  }

  // Atualiza status para canceled
  const { error: updateError } = await supabase
    .from('subscriptions')
    .update({
      status: 'canceled',
      canceled_at: new Date().toISOString(),
    })
    .eq('stripe_subscription_id', stripeSubscriptionId);

  if (updateError) {
    throw updateError;
  }

  // Revoga entitlements
  const { error: entitlementsError } = await supabase.rpc('sync_entitlements_from_subscription', {
    p_profile_id: subscription.profile_id,
    p_plan_key: 'directory', // Qualquer plano, status canceled vai revogar
    p_status: 'canceled',
  });

  if (entitlementsError) {
    throw entitlementsError;
  }
}

/**
 * Verifica se um evento webhook já foi processado (idempotência)
 */
export async function isWebhookEventProcessed(stripeEventId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('webhook_events')
    .select('id')
    .eq('stripe_event_id', stripeEventId)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('Error checking webhook event:', error);
    return false; // Em caso de erro, processa para não perder eventos
  }

  return !!data;
}

/**
 * Registra evento webhook como processado
 */
export async function markWebhookEventProcessed(
  stripeEventId: string,
  eventType: string,
  subscriptionId: string | null,
  success: boolean,
  errorMessage?: string
): Promise<void> {
  const { error } = await supabase
    .from('webhook_events')
    .insert({
      stripe_event_id: stripeEventId,
      event_type: eventType,
      subscription_id: subscriptionId,
      success,
      error_message: errorMessage || null,
    });

  if (error) {
    console.error('Error marking webhook event as processed:', error);
    // Não lança erro para não interromper o fluxo principal
  }
}

// ============================================
// Helpers: Mapeamento DB → TypeScript
// ============================================

function mapSubscriptionFromDB(data: any): Subscription {
  return {
    id: data.id,
    profileId: data.profile_id,
    stripeCustomerId: data.stripe_customer_id,
    stripeSubscriptionId: data.stripe_subscription_id,
    planKey: data.plan_key,
    status: data.status,
    currentPeriodStart: data.current_period_start,
    currentPeriodEnd: data.current_period_end,
    cancelAtPeriodEnd: data.cancel_at_period_end,
    canceledAt: data.canceled_at,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
}

function mapEntitlementsFromDB(data: any): Entitlements {
  return {
    profileId: data.profile_id,
    directoryAccess: data.directory_access,
    academyAccess: data.academy_access,
    premiumDiscounts: data.premium_discounts,
    basicSiteIncluded: data.basic_site_included,
    lastSyncedAt: data.last_synced_at,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
}
