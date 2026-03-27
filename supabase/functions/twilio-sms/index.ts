// TradeStack â Twilio Outbound SMS Edge Function
// Called when a user enables SMS on a goal.
// Also called by sms-daily-digest to send the 8pm digest.

const TWILIO_ACCOUNT_SID = Deno.env.get('TWILIO_ACCOUNT_SID')!;
const TWILIO_AUTH_TOKEN   = Deno.env.get('TWILIO_AUTH_TOKEN')!;
const TWILIO_PHONE        = Deno.env.get('TWILIO_PHONE_NUMBER')!;

const corsHeaders = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

export async function sendSMS(to: string, body: string): Promise<boolean> {
  const url  = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`;
  const auth = btoa(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`);

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type':  'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({ From: TWILIO_PHONE, To: to, Body: body }).toString(),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error('Twilio send error:', err);
    return false;
  }
  return true;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { to, body } = await req.json();
    if (!to || !body) {
      return new Response(JSON.stringify({ error: 'Missing to or body' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const success = await sendSMS(to, body);
    return new Response(JSON.stringify({ success }), {
      status: success ? 200 : 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
