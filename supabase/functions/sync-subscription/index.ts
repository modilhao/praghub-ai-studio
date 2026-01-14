// Supabase Edge Function: Sincronização Manual de Subscription
// Deploy: supabase functions deploy sync-subscription

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

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      {
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Busca subscription do usuário no banco
    const { data: existingSubscription } = await supabase
      .from('subscriptions')
      .select('stripe_subscription_id, stripe_customer_id')
      .eq('profile_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    let stripeSubscription;
    let customerId: string;

    if (existingSubscription?.stripe_subscription_id) {
      // Se já existe no banco, busca no Stripe
      stripeSubscription = await stripe.subscriptions.retrieve(
        existingSubscription.stripe_subscription_id,
        { expand: ['items.data.price.product'] }
      );
      customerId = typeof stripeSubscription.customer === 'string'
        ? stripeSubscription.customer
        : stripeSubscription.customer.id;
    } else {
      // Se não existe no banco, busca customer no Stripe e depois subscriptions
      // Primeiro, tenta encontrar customer_id no banco
      let foundCustomerId = existingSubscription?.stripe_customer_id;

      // Se não tem customer_id, busca no Stripe pelo email
      if (!foundCustomerId) {
        const customers = await stripe.customers.list({
          email: user.email,
          limit: 1,
        });
        
        if (customers.data.length === 0) {
          return new Response(
            JSON.stringify({ error: 'No customer found in Stripe. Please complete a checkout first.' }),
            {
              status: 404,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            }
          );
        }

        foundCustomerId = customers.data[0].id;
      }

      // Busca subscriptions ativas do customer
      const subscriptions = await stripe.subscriptions.list({
        customer: foundCustomerId,
        status: 'all',
        limit: 1,
      });

      if (subscriptions.data.length === 0) {
        return new Response(
          JSON.stringify({ error: 'No active subscription found in Stripe' }),
          {
            status: 404,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      stripeSubscription = subscriptions.data[0];
      customerId = foundCustomerId;
    }

    const priceId = stripeSubscription.items.data[0]?.price.id;
    if (!priceId) {
      throw new Error('No price found');
    }

    const planKey = PRICE_TO_PLAN_MAP[priceId];
    if (!planKey) {
      throw new Error(`Unknown price_id: ${priceId}`);
    }

    // Sincroniza
    const { error: syncError } = await supabase
      .from('subscriptions')
      .upsert({
        profile_id: user.id,
        stripe_customer_id: customerId,
        stripe_subscription_id: stripeSubscription.id,
        plan_key: planKey,
        status: stripeSubscription.status as any,
        current_period_start: new Date(stripeSubscription.current_period_start * 1000).toISOString(),
        current_period_end: new Date(stripeSubscription.current_period_end * 1000).toISOString(),
        cancel_at_period_end: stripeSubscription.cancel_at_period_end || false,
        canceled_at: stripeSubscription.canceled_at
          ? new Date(stripeSubscription.canceled_at * 1000).toISOString()
          : null,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'stripe_subscription_id',
      });

    if (syncError) {
      throw syncError;
    }

    // Sincroniza entitlements
    const { error: entitlementsError } = await supabase.rpc('sync_entitlements_from_subscription', {
      p_profile_id: user.id,
      p_plan_key: planKey,
      p_status: stripeSubscription.status,
    });

    if (entitlementsError) {
      throw entitlementsError;
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Subscription synchronized' }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error: any) {
    console.error('Error syncing subscription:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
