// Supabase Edge Function: Stripe Webhook Handler
// Deploy: supabase functions deploy stripe-webhook

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import Stripe from 'https://esm.sh/stripe@14.21.0?target=deno';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2023-10-16',
  httpClient: Stripe.createFetchHttpClient(),
});

// SUPABASE_URL está disponível automaticamente nas Edge Functions
const supabaseUrl = Deno.env.get('SUPABASE_URL') || Deno.env.get('SUPABASE_PROJECT_URL') || '';
// SERVICE_ROLE_KEY é configurada como secret (sem prefixo SUPABASE_)
const supabaseServiceKey = Deno.env.get('SERVICE_ROLE_KEY') || Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET') || '';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Mapeamento de Price IDs do Stripe para plan_key
// ATUALIZADO: Price IDs de TESTE do Stripe (Janeiro 2025)
const PRICE_TO_PLAN_MAP: Record<string, 'directory' | 'directory_academy' | 'premium'> = {
  'price_1SpTBFJULNOvBzJ46Hf2TCJK': 'directory',           // Diretório: R$ 149,00 (TESTE)
  'price_1SpTBGJULNOvBzJ4ZEmSu0zk': 'directory_academy',   // Diretório + Academia: R$ 249,00 (TESTE)
  'price_1SpTBGJULNOvBzJ4P3WdhYfN': 'premium',             // Premium: R$ 479,00 (TESTE)
  // Price IDs de produção (mantidos para compatibilidade)
  'price_1Sp9iDJULNOvBzJ4rHEy276L': 'directory',           // Diretório: R$ 149,00 (PRODUÇÃO)
  'price_1Sp9irJULNOvBzJ4peDiLsfv': 'directory_academy',   // Diretório + Academia: R$ 249,00 (PRODUÇÃO)
  'price_1Sp9kcJULNOvBzJ492cQGIWE': 'premium',             // Premium: R$ 479,00 (PRODUÇÃO)
};

serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const signature = req.headers.get('stripe-signature');
  if (!signature) {
    return new Response(JSON.stringify({ error: 'Missing stripe-signature' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const body = await req.text();
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return new Response(
      JSON.stringify({ error: `Webhook Error: ${err.message}` }),
      {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  const stripeEventId = event.id;
  const eventType = event.type;

  // Verifica idempotência
  const { data: existingEvent } = await supabase
    .from('webhook_events')
    .select('id')
    .eq('stripe_event_id', stripeEventId)
    .single();

  if (existingEvent) {
    console.log(`Event ${stripeEventId} already processed, skipping`);
    return new Response(JSON.stringify({ received: true, alreadyProcessed: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  let subscriptionId: string | null = null;
  let success = false;
  let errorMessage: string | undefined;

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.mode === 'subscription' && session.subscription) {
          subscriptionId = typeof session.subscription === 'string' 
            ? session.subscription 
            : session.subscription.id;
          await processSubscriptionEvent(subscriptionId);
        }
        success = true;
        break;
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        subscriptionId = subscription.id;
        await processSubscriptionEvent(subscriptionId);
        success = true;
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        subscriptionId = subscription.id;
        await processSubscriptionDeletion(subscriptionId);
        success = true;
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        if (invoice.subscription) {
          subscriptionId = typeof invoice.subscription === 'string'
            ? invoice.subscription
            : invoice.subscription.id;
          await processSubscriptionEvent(subscriptionId);
        }
        success = true;
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        if (invoice.subscription) {
          subscriptionId = typeof invoice.subscription === 'string'
            ? invoice.subscription
            : invoice.subscription.id;
          // Marca como past_due mas mantém entitlements (grace period)
          await processSubscriptionEvent(subscriptionId, 'past_due');
        }
        success = true;
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
        success = true; // Não é erro, apenas não processamos
    }
  } catch (error: any) {
    console.error('Error processing webhook:', error);
    success = false;
    errorMessage = error.message;
  }

  // Registra evento como processado
  await supabase.from('webhook_events').insert({
    stripe_event_id: stripeEventId,
    event_type: eventType,
    subscription_id: subscriptionId,
    success,
    error_message: errorMessage,
  });

  return new Response(
    JSON.stringify({ received: true, processed: success }),
    {
      status: success ? 200 : 500,
      headers: { 'Content-Type': 'application/json' },
    }
  );
});

/**
 * Processa evento de subscription (created/updated)
 */
async function processSubscriptionEvent(
  subscriptionId: string,
  forceStatus?: string
): Promise<void> {
  // Busca subscription no Stripe
  const subscription = await stripe.subscriptions.retrieve(subscriptionId, {
    expand: ['items.data.price.product'],
  });

  const customerId = typeof subscription.customer === 'string'
    ? subscription.customer
    : subscription.customer.id;

  // Determina plan_key do price_id
  const priceId = subscription.items.data[0]?.price.id;
  if (!priceId) {
    throw new Error(`No price found for subscription ${subscriptionId}`);
  }

  const planKey = PRICE_TO_PLAN_MAP[priceId];
  if (!planKey) {
    throw new Error(`Unknown price_id: ${priceId}. Update PRICE_TO_PLAN_MAP.`);
  }

  const status = forceStatus || subscription.status;

  // Busca profile_id pelo customer_id
  const { data: existingSub, error: fetchError } = await supabase
    .from('subscriptions')
    .select('profile_id')
    .eq('stripe_customer_id', customerId)
    .single();

  if (fetchError && fetchError.code !== 'PGRST116') {
    throw fetchError;
  }

  // Se não existe subscription, precisa criar customer primeiro
  // Isso deve ser feito no checkout, mas como fallback:
  if (!existingSub) {
    // Tenta buscar pelo metadata do customer
    const customer = await stripe.customers.retrieve(customerId);
    if (typeof customer === 'object' && !customer.deleted && customer.metadata?.profile_id) {
      // Usa profile_id do metadata
      const profileId = customer.metadata.profile_id;
      await syncSubscription(profileId, customerId, subscriptionId, planKey, status, subscription);
    } else {
      throw new Error(`Profile not found for customer ${customerId}`);
    }
  } else {
    await syncSubscription(
      existingSub.profile_id,
      customerId,
      subscriptionId,
      planKey,
      status,
      subscription
    );
  }
}

/**
 * Sincroniza subscription no banco
 */
async function syncSubscription(
  profileId: string,
  customerId: string,
  subscriptionId: string,
  planKey: 'directory' | 'directory_academy' | 'premium',
  status: string,
  subscription: Stripe.Subscription
): Promise<void> {
  // Upsert subscription
  const { error: subError } = await supabase
    .from('subscriptions')
    .upsert({
      profile_id: profileId,
      stripe_customer_id: customerId,
      stripe_subscription_id: subscriptionId,
      plan_key: planKey,
      status: status as any,
      current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
      current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
      cancel_at_period_end: subscription.cancel_at_period_end || false,
      canceled_at: subscription.canceled_at
        ? new Date(subscription.canceled_at * 1000).toISOString()
        : null,
      updated_at: new Date().toISOString(),
    }, {
      onConflict: 'stripe_subscription_id',
    });

  if (subError) {
    throw subError;
  }

  // Sincroniza entitlements
  const { error: entitlementsError } = await supabase.rpc('sync_entitlements_from_subscription', {
    p_profile_id: profileId,
    p_plan_key: planKey,
    p_status: status,
  });

  if (entitlementsError) {
    throw entitlementsError;
  }
}

/**
 * Processa cancelamento de subscription
 */
async function processSubscriptionDeletion(subscriptionId: string): Promise<void> {
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('profile_id')
    .eq('stripe_subscription_id', subscriptionId)
    .single();

  if (!subscription) {
    console.warn(`Subscription ${subscriptionId} not found in DB, skipping deletion`);
    return;
  }

  // Atualiza status
  await supabase
    .from('subscriptions')
    .update({
      status: 'canceled',
      canceled_at: new Date().toISOString(),
    })
    .eq('stripe_subscription_id', subscriptionId);

  // Revoga entitlements
  await supabase.rpc('sync_entitlements_from_subscription', {
    p_profile_id: subscription.profile_id,
    p_plan_key: 'directory',
    p_status: 'canceled',
  });
}
