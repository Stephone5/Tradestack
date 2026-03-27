// TradeStack â Stripe Webhook Edge Function
// Handles subscription lifecycle events from Stripe.
// Registered in Stripe Dashboard > Developers > Webhooks.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import Stripe from 'https://esm.sh/stripe@14?target=deno';

const STRIPE_SECRET          = Deno.env.get('STRIPE_SECRET_KEY')!;
const STRIPE_WEBHOOK_SECRET  = Deno.env.get('STRIPE_WEBHOOK_SECRET')!;
const SUPABASE_URL            = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE        = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const stripe   = new Stripe(STRIPE_SECRET, { apiVersion: '2024-06-20', httpClient: Stripe.createFetchHttpClient() });
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE);

const corsHeaders = { 'Access-Control-Allow-Origin':'*', 'Access-Control-Allow-Headers':'authorization,x-client-info,apikey,content-type,stripe-signature' };

Deno.serve(async (req) => {
  if (req.method==='OPTIONS') return new Response('ok',{headers:corsHeaders});
  const body=await req.text();
  const sign=req.headers.get('stripe-signature');
  if (!sign) return new Response('Missing signature',{status:400});
  let event:Stripe.Event;
  try{ event=await stripe.webhooks.constructEventAsync(body,sign,STRIPE_WEBHOOK_SECRET); }catch(e:any){ return new Response(`Webhook error: ${e.message}`,{status:400}); }
  try{
    switch(event.type){
      case 'checkout.session.completed':{
        const s=event.data.object as Stripe.Checkout.Session;
        if(s.metadata?.user_id) await supabase.from('subscriptions').upsert({user_id:s.metadata.user_id,stripe_customer_id:s.customer,stripe_subscription_id:s.subscription,status:'active',updated_at:new Date().toISOString()},{onConflict:'user_id'});
        break;
      }
      case 'customer.subscription.updated':{
        const sub=event.data.object as Stripe.Subscription;
        const st=sub.status==='active'?'active':sub.status==='canceled'?'canceled':'past_due';
        await supabase.from('subscriptions').update({status:st,current_period_end:new Date(sub.current_period_end*1000).toISOString(),updated_at:new Date().toISOString()}).eq('stripe_subscription_id',sub.id);
        break;
      }
      case 'customer.subscription.deleted':{
        const sub=event.data.object as Stripe.Subscription;
        await supabase.from('subscriptions').update({status:'canceled',updated_at:new Date().toISOString()}).eq('stripe_subscription_id',sub.id);
        break;
      }
      case 'invoice.payment_failed':{
        const inv=event.data.object as Stripe.Invoice;
        await supabase.from('subscriptions').update({status:'past_due',updated_at:new Date().toISOString()}).eq('stripe_subscription_id',inv.subscription);
        break;
      }
    }
    return new Response(JSON.stringify({received:true}),{status:200,headers:{...corsHeaders,'Content-Type':'application/json'}});
  }catch(err:any){
    return new Response(JSON.stringify({error:err.message}),{status:500,headers:{...corsHeaders,'Content-Type':'application/json'}});
  }
});
