// TradeStack — Claude Proxy Edge Function
// Proxies requests to Anthropic API server-side.
// Enforces: authentication, rate limiting (50 calls/day for premium, 0 for free).

import { createClient } from 'npm:@supabase/supabase-js@2';

const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY') || '';
const SUPABASE_URL      = Deno.env.get('SUPABASE_URL') || '';
const SUPABASE_SERVICE  = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

const DAILY_LIMIT_FREE    = 20;
const DAILY_LIMIT_PREMIUM = 100;
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
    // ── AUTH: verify user JWT ──────────────────────────────────────────────
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE);
    const { data: { user }, error: authError } =
      await supabase.auth.getUser(authHeader.replace('Bearer ', ''));

    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // ── SUBSCRIPTION CHECK (for rate limit tier, not hard block) ─────────
    const { data: sub } = await supabase.from('subscriptions')
      .select('status').eq('user_id', user.id).single();
    const isPremium = sub?.status === 'active';
    const dailyLimit = isPremium ? DAILY_LIMIT_PREMIUM : DAILY_LIMIT_FREE;

    // ── RATE LIMITING ────────────────────────────────────────────────────
    const today = new Date().toISOString().split('T')[0];
    const { data: usage } = await supabase.from('ai_usage')
      .select('call_count').eq('user_id', user.id).eq('usage_date', today).single();
    const currentCount = usage?.call_count || 0;

    if (currentCount >= dailyLimit) {
      return new Response(JSON.stringify({
        error: 'rate_limit',
        message: `Daily limit of ${dailyLimit} AI requests reached. Resets at midnight.`
      }), {
        status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // ── PARSE REQUEST ────────────────────────────────────────────────────
    const { system, user: userMsg, history } = await req.json();

    // ── CALL ANTHROPIC ───────────────────────────────────────────────────
    const messages = [];
    if (history?.length) {
      messages.push(...history.map((m) => ({ role: m.role, content: m.content })));
    }
    messages.push({ role: 'user', content: userMsg });

    const anthropicRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type':    'application/json',
        'x-api-key':       ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model:      MODEL,
        max_tokens: 2000,
        system:     system || '',
        messages,
      }),
    });

    if (!anthropicRes.ok) {
      const err = await anthropicRes.text();
      throw new Error(`Anthropic error: ${err}`);
    }

    const result = await anthropicRes.json();
    const text   = result.content?.[0]?.text || '';

    // ── INCREMENT USAGE COUNTER ──────────────────────────────────────────
    await supabase.from('ai_usage').upsert({
      user_id:    user.id,
      usage_date: today,
      call_count: currentCount + 1,
    }, { onConflict: 'user_id,usage_date' });

    return new Response(JSON.stringify({ text }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
