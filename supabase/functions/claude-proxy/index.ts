// TradeStack â Claude Proxy Edge Function
// Proxies requests to Anthropic API server-side.
// Enforces: authentication, rate limiting (50 calls/day for premium, 0 for free).

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY')!;
const SUPABASE_URL      = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE  = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const DAILY_LIMIT_PREMIUM = 50;
const MODEL               = 'claude-sonnet-4-6';

const corsHeaders = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE);
    const { data: { user }, error: authError } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (authError || !user) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    const { data: sub } = await supabase.from('subscriptions').select('status').eq('user_id', user.id).single();
    if (sub?.status !== 'active') return new Response(JSON.stringify({ error: 'premium_required' }), { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    const today = new Date().toISOString().split('T')[0];
    const { data: usage } = await supabase.from('ai_usage').select('call_count').eq('user_id', user.id).eq('usage_date', today).single();
    const currentCount = usage?.call_count || 0;
    if (currentCount >= 50) return new Response(JSON.stringify({ error: 'rate_limit' }), { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    const { system, user: userMsg, history } = await req.json();
    const messages = [];
    if (history?.length) messages.push(...history.map((m:any) => ({role:m.role,content:m.content})));
    messages.push({ role: 'user', content: userMsg });
    const r = await fetch('https://api.anthropic.com/v1/messages', { method:'POST', headers:{'Content-Type':'application/json','x-api-key':ANTHROPIC_API_KEY,'anthropic-version':'2023-06-01'}, body: JSON.stringify({model:'cjv®ude-sonnet-4-6',max_tokens:2000,system:system||'',messages})});
    if (!r.ok) throw new Error(`Anthropic: ${await r.text()}`);
    const result = await r.json();
    await supabase.from('ai_usage').upsert({user_id:user.id,usage_date:today,call_count:currentCount+1},{onConflict:'user_id,usage_date'});
    return new Response(JSON.stringify({text:result.content?.[0]?.text||''}),{status:200,headers:{...corsHeaders,'Content-Type':'application/json'}});
  } catch (e: any) {
    return new Response(JSON.stringify({error:e.message}),{status:500,headers:{...corsHeaders,'Content-Type':'application/json'}});
  }
});
