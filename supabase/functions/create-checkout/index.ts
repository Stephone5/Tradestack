// TradeStack â Create Stripe Checkout Session
// Called by frontend when user clicks "Upgrade". Returns a Stripe-hosted checkout URL.
// REQUIRED: Set STRIPE_PRICE_ID in Supabase secrets once you have the Price ID.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import Stripe from 'https://esm.sh/stripe@14?target=deno';

const STRIPE_SECRET   = Deno.env.get('STRIPE_SECRET_KEY')!;
const STRIPE_PRICE_ID = Deno.env.get('STRIPE_PRICE_ID')!;
const SUPABASE_URL    = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const APP_URL         = Deno.env.get('APP_URL') || 'https://tradestack.biz';
const stripe=new Stripe(STRIPE_SECRET,{apiVersion:'2024-06-20',httpClient:Stripe.createFetchHttpClient()});
const supabase=createClient(SUPABASE_URL,SUPABASE_SERVICE);
const corsHeaders={'Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'authorization,x-client-info,apikey,content-type'};
Deno.serve(async(req)=>{
  if(req.method==='OPTIONS')return new Response('ok',{headers:corsHeaders});
  try{
    const auth=req.headers.get('Authorization');
    if(!auth)return new Response(JSON.stringify({error:'Unauthorized'}),{status:401,headers:{...corsHeaders,'Content-Type':'application/json'}});
    const{data:{user},error}=await supabase.auth.getUser(auth.replace('Bearer ',''));
    if(error||!user)return new Response(JSON.stringify({error:'Unauthorized'}),{status:401,headers:{...corsHeaders,'Content-Type':'application/json'}});
    const{data:sub}=await supabase.from('subscriptions').select('status,stripe_customer_id').eq('user_id',user.id).single();
    if(sub?.status==='active')return new Response(JSON.stringify({error:'Already subscribed'}),{status:400,headers:{...corsHeaders,'Content-Type':'application/json'}});
    let cId=sub?.stripe_customer_id;
    if(!cId){const c=await stripe.customers.create({email:user.email,metadata:{user_id:user.id}});cId=c.id;}
    const ses=await stripe.checkout.sessions.create({customer:cId,mode:'subscription',line_items:[{price:STRIPE_PRICE_ID,quantity:1}],success_url:`${APP_URL}/?checkout=success`,cancel_url:`${APP_URL}/?checkout=canceled`,metadata:{user_id:user.id},subscription_data:{metadata:{user_id:user.id}}});
    return new Response(JSON.stringify({url:ses.url}),{status:200,headers:{...corsHeaders,'Content-Type':'application/json'}});
  }catch(err:any){return new Response(JSON.stringify({error:err.message}),{status:500,headers:{...corsHeaders,'Content-Type':'application/json'}});}
});
