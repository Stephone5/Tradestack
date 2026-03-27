// TradeStack — Manage Billing (Stripe Customer Portal)
// Returns a URL to the Stripe billing portal where users can cancel/manage subscriptions.

import { createClient } from 'npm:@supabase/supabase-js@2';
import Stripe from 'npm:stripe@14';

const STRIPE_SECRET   = Deno.env.get('STRIPE_SECRET_KEY');
const SUPABASE_URL    = Deno.env.get('SUPABASE_URL');
const SUPABASE_SERVICE = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
const APP_URL         = Deno.env.get('APP_URL') || 'https://tradestack.biz';

const stripe   = new Stripe(STRIPE_SECRET, { apiVersion: '2024-06-20', httpClient: Stripe.createFetchHttpClient() });
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE);

const corsHeaders = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Verify user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const { data: { user }, error } =
      await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (error || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Get subscription with Stripe customer ID
    const { data: sub } = await supabase.from('subscriptions')
      .select('stripe_customer_id').eq('user_id', user.id).single();

    if (!sub?.stripe_customer_id) {
      return new Response(JSON.stringify({ error: 'No subscription found' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Create Stripe billing portal session
    const portalSession = await stripe.billingPortal.sessions.create({
      customer:   sub.stripe_customer_id,
      return_url: APP_URL,
    });

    return new Response(JSON.stringify({ url: portalSession.url }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
