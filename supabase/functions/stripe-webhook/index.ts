// TradeStack — Stripe Webhook Edge Function
// Handles subscription lifecycle events from Stripe.
// Registered in Stripe Dashboard > Developers > Webhooks.

import { createClient } from 'npm:@supabase/supabase-js@2';
import Stripe from 'npm:stripe@14';

const STRIPE_SECRET          = Deno.env.get('STRIPE_SECRET_KEY');
const STRIPE_WEBHOOK_SECRET  = Deno.env.get('STRIPE_WEBHOOK_SECRET');
const SUPABASE_URL           = Deno.env.get('SUPABASE_URL');
const SUPABASE_SERVICE       = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

// ── BOOT-TIME VALIDATION ───────────────────────────────────────────────────
console.log('[stripe-webhook] Boot check:',
  'STRIPE_SECRET_KEY:', STRIPE_SECRET ? 'SET' : 'MISSING',
  'STRIPE_WEBHOOK_SECRET:', STRIPE_WEBHOOK_SECRET ? 'SET' : 'MISSING',
  'SUPABASE_URL:', SUPABASE_URL ? 'SET' : 'MISSING',
  'SUPABASE_SERVICE_ROLE_KEY:', SUPABASE_SERVICE ? 'SET' : 'MISSING',
);

const stripe   = new Stripe(STRIPE_SECRET!, { apiVersion: '2024-06-20', httpClient: Stripe.createFetchHttpClient() });
const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE!);

// SubtleCryptoProvider is REQUIRED for Deno / non-Node environments.
// Without this, constructEventAsync silently fails because Node's crypto module
// is not available in Deno, causing 100% webhook signature verification failures.
const cryptoProvider = Stripe.createSubtleCryptoProvider();

const corsHeaders = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, stripe-signature',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  // ── HEALTH CHECK (GET) ──────────────────────────────────────────────────
  if (req.method === 'GET') {
    return new Response(JSON.stringify({
      status: 'ok',
      secrets: {
        STRIPE_SECRET_KEY:       STRIPE_SECRET ? 'SET' : 'MISSING',
        STRIPE_WEBHOOK_SECRET:   STRIPE_WEBHOOK_SECRET ? 'SET' : 'MISSING',
        SUPABASE_URL:            SUPABASE_URL ? 'SET' : 'MISSING',
        SUPABASE_SERVICE_ROLE_KEY: SUPABASE_SERVICE ? 'SET' : 'MISSING',
      },
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const body      = await req.text();
  const signature = req.headers.get('stripe-signature');

  if (!signature) {
    console.error('[stripe-webhook] Missing stripe-signature header');
    return new Response('Missing signature', { status: 400 });
  }

  if (!STRIPE_WEBHOOK_SECRET) {
    console.error('[stripe-webhook] STRIPE_WEBHOOK_SECRET is not set — cannot verify webhook');
    return new Response(JSON.stringify({ error: 'Webhook secret not configured' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  let event;
  try {
    // The 5th arg (cryptoProvider) is CRITICAL for Deno.
    // Without it, signature verification fails with a crypto error.
    event = await stripe.webhooks.constructEventAsync(
      body,
      signature,
      STRIPE_WEBHOOK_SECRET,
      undefined,       // tolerance (use default)
      cryptoProvider   // REQUIRED for Deno/Edge environments
    );
  } catch (err) {
    console.error('[stripe-webhook] Signature verification failed:', err.message);
    return new Response('Webhook error: ' + err.message, { status: 400 });
  }

  try {
    console.log('[stripe-webhook] Processing event:', event.type, event.id);

    switch (event.type) {

      case 'checkout.session.completed': {
        const session = event.data.object;
        const userId  = session.metadata?.user_id;
        console.log('[stripe-webhook] checkout.session.completed — user_id:', userId,
          'customer:', session.customer, 'subscription:', session.subscription);
        if (!userId) {
          console.error('[stripe-webhook] checkout.session.completed — NO user_id in metadata, skipping');
          break;
        }
        const { data, error } = await supabase.from('subscriptions').upsert({
          user_id:                 userId,
          stripe_customer_id:      session.customer,
          stripe_subscription_id:  session.subscription,
          status:                  'active',
          current_period_end:      null,
          updated_at:              new Date().toISOString(),
        }, { onConflict: 'user_id' });
        if (error) {
          console.error('[stripe-webhook] checkout.session.completed — Supabase upsert FAILED:', JSON.stringify(error));
          return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }
        console.log('[stripe-webhook] checkout.session.completed — subscription activated for user', userId);
        break;
      }

      case 'customer.subscription.updated': {
        const sub    = event.data.object;
        const status = (sub.status === 'active' || sub.status === 'trialing') ? 'active'
                     : sub.status === 'canceled' ? 'canceled'
                     : 'past_due';
        console.log('[stripe-webhook] customer.subscription.updated — sub:', sub.id, 'status:', status);
        const { error } = await supabase.from('subscriptions')
          .update({
            status,
            current_period_end: sub.current_period_end ? new Date(sub.current_period_end * 1000).toISOString() : null,
            updated_at:         new Date().toISOString(),
          })
          .eq('stripe_subscription_id', sub.id);
        if (error) {
          console.error('[stripe-webhook] customer.subscription.updated — Supabase update FAILED:', JSON.stringify(error));
          return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const sub = event.data.object;
        console.log('[stripe-webhook] customer.subscription.deleted — sub:', sub.id);
        const { error } = await supabase.from('subscriptions')
          .update({ status: 'canceled', updated_at: new Date().toISOString() })
          .eq('stripe_subscription_id', sub.id);
        if (error) {
          console.error('[stripe-webhook] customer.subscription.deleted — Supabase update FAILED:', JSON.stringify(error));
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object;
        console.log('[stripe-webhook] invoice.payment_failed — sub:', invoice.subscription);
        const { error } = await supabase.from('subscriptions')
          .update({ status: 'past_due', updated_at: new Date().toISOString() })
          .eq('stripe_subscription_id', invoice.subscription);
        if (error) {
          console.error('[stripe-webhook] invoice.payment_failed — Supabase update FAILED:', JSON.stringify(error));
        }
        break;
      }

      default:
        console.log('[stripe-webhook] Unhandled event type:', event.type);
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (err) {
    console.error('[stripe-webhook] Handler error:', err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
