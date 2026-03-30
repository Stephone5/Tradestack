import { createClient } from 'npm:@supabase/supabase-js@2';
import twilio from 'npm:twilio@4';

const SUPABASE_URL    = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const TWILIO_SID      = Deno.env.get('TWILIO_ACCOUNT_SID')!;
const TWILIO_TOKEN    = Deno.env.get('TWILIO_AUTH_TOKEN')!;
const TWILIO_FROM     = Deno.env.get('TWILIO_PHONE_NUMBER')!;
const STEPHEN_PHONE   = '+14058769250';

const corsHeaders = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE);

    // Verify user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    const { data: { user }, error: authError } =
      await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { subject, message } = await req.json();
    if (!message?.trim()) {
      return new Response(JSON.stringify({ error: 'Message required' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Look up user's phone number from their business profile
    const { data: biz } = await supabase
      .from('businesses')
      .select('phoneNumber')
      .eq('user_id', user.id)
      .single();
    const userPhone = biz?.phoneNumber || null;

    // Save to support_messages
    await supabase.from('support_messages').insert({
      user_id:    user.id,
      email:      user.email,
      subject:    subject?.trim() || '(no subject)',
      message:    message.trim(),
      user_phone: userPhone,
    });

    // Send SMS notification to Stephen
    const lines = [
      'TradeStack Support',
      `From: ${user.email}`,
      subject?.trim() ? `Re: ${subject.trim()}` : null,
      '',
      message.trim(),
      userPhone
        ? `\nReply to this text to respond to the user.`
        : `\n(User has no phone on file — reply will not reach them via SMS.)`,
    ].filter(l => l !== null).join('\n');

    const client = twilio(TWILIO_SID, TWILIO_TOKEN);
    await client.messages.create({ body: lines, from: TWILIO_FROM, to: STEPHEN_PHONE });

    return new Response(JSON.stringify({ ok: true }), {
      status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (err) {
    console.error('support-notify error:', err.message);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
