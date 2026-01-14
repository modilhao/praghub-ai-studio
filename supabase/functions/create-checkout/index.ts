// Supabase Edge Function: Criar Checkout Session
// Deploy: supabase functions deploy create-checkout

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import Stripe from 'https://esm.sh/stripe@14.21.0?target=deno';

// Valida variáveis de ambiente obrigatórias
const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY');
// SUPABASE_URL está disponível automaticamente nas Edge Functions
const supabaseUrl = Deno.env.get('SUPABASE_URL') || Deno.env.get('SUPABASE_PROJECT_URL') || '';
// SERVICE_ROLE_KEY é configurada como secret (sem prefixo SUPABASE_)
const supabaseServiceKey = Deno.env.get('SERVICE_ROLE_KEY') || Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
const appUrl = Deno.env.get('APP_BASE_URL') || 'http://localhost:3000';

if (!stripeSecretKey) {
  console.error('STRIPE_SECRET_KEY não configurada. Configure com: supabase secrets set STRIPE_SECRET_KEY=sk_...');
}

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('SUPABASE_URL (automático) ou SERVICE_ROLE_KEY não configuradas.');
  console.error('Configure SERVICE_ROLE_KEY com: supabase secrets set SERVICE_ROLE_KEY=eyJ...');
}

const stripe = new Stripe(stripeSecretKey || '', {
  apiVersion: '2023-10-16',
  httpClient: Stripe.createFetchHttpClient(),
});

const supabase = createClient(supabaseUrl || '', supabaseServiceKey || '');

// Mapeamento de plan_key para Stripe Price ID
const PLAN_TO_PRICE_MAP: Record<string, string> = {
  directory: Deno.env.get('STRIPE_PRICE_DIRECTORY') || '',
  directory_academy: Deno.env.get('STRIPE_PRICE_DIRECTORY_ACADEMY') || '',
  premium: Deno.env.get('STRIPE_PRICE_PREMIUM') || '',
};

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight
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
    // Valida configuração
    if (!stripeSecretKey) {
      return new Response(
        JSON.stringify({ 
          error: 'Stripe não configurado. STRIPE_SECRET_KEY não encontrada. Configure com: supabase secrets set STRIPE_SECRET_KEY=sk_...' 
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Extrai token de autenticação
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

    // Busca profile_id
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      return new Response(
        JSON.stringify({ error: 'Profile not found' }),
        {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Lê body
    const { planKey } = await req.json();

    if (!planKey || !PLAN_TO_PRICE_MAP[planKey]) {
      return new Response(
        JSON.stringify({ error: 'Invalid plan key' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const priceId = PLAN_TO_PRICE_MAP[planKey];
    
    if (!priceId) {
      return new Response(
        JSON.stringify({ 
          error: `Price ID não configurado para o plano ${planKey}. Configure STRIPE_PRICE_${planKey.toUpperCase()} como secret.` 
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Busca ou cria customer no Stripe
    let customerId: string;

    const { data: existingSub } = await supabase
      .from('subscriptions')
      .select('stripe_customer_id')
      .eq('profile_id', profile.id)
      .maybeSingle();

    if (existingSub?.stripe_customer_id) {
      customerId = existingSub.stripe_customer_id;
    } else {
      // Cria novo customer
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: {
          profile_id: profile.id,
        },
      });
      customerId = customer.id;
    }

    // Cria checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${appUrl}/#/planos?session_id={CHECKOUT_SESSION_ID}&success=true`,
      cancel_url: `${appUrl}/#/planos?canceled=true`,
      metadata: {
        profile_id: profile.id,
        plan_key: planKey,
      },
      subscription_data: {
        metadata: {
          profile_id: profile.id,
          plan_key: planKey,
        },
      },
    });

    return new Response(
      JSON.stringify({
        sessionId: session.id,
        url: session.url,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error: any) {
    console.error('Error creating checkout session:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
