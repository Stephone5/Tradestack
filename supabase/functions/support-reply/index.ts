import { createClient } from 'npm:@supabase/supabase-js@2';
import twilio from 'npm:twilio@4';

const SUPABASE_URL    = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const TWILIO_SID      = Deno.env.get('TWILIO_ACCOUNT_SID')!;
const TWILIO_TOKEN    = Deno.env.get('TWILIO_AUTH_TOKEN')!;
const TWILIO_FROM     = Deno.env.get('TWILIO_PHONE_NUMBER')!;
const STEPHEN_PHONE   = '+14058769250';

// Twilio calls this endpoint when a text is sent TO the TradeStack number.
// If the sender is Stephen, route his reply to the most recent unreplied user.
Deno.serve(async (req) => {
  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE);

    // Twilio sends webhook as URL-encoded form data
    const text  = await req.text();
    const params = new URLSearchParams(text);
    const from  = (params.get('From') || '').replace(/\s/g, '');
    const body  = (params.get('Body') || '').trim();

    // Only process messages from Stephen's number
    if (from !== STEPHEN_PHONE.replace(/\s/g, '') || !body) {
      return new Response('<Response/>', { headers: { 'Content-Type': 'text/xml' } });
    }

    // Find the most recent unreplied support message that has a user phone
    const { data: pending } = await supabase
      .from('support_messages')
      .select('id, user_phone, email')
      .not('user_phone', 'is', null)
      .is('replied_at', null)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    const client = twilio(TWILIO_SID, TWILIO_TOKEN);

    if (!pending?.user_phone) {
      // Let Stephen know there's nothing to reply to
      await client.messages.create({
        body: 'No pending support messages with a phone number on file.',
        from: TWILIO_FROM,
        to:   STEPHEN_PHONE,
      });
      return new Response('<Response/>', { headers: { 'Content-Type': 'text/xml' } });
    }

    // Send Stephen's reply to the user
    await client.messages.create({
      body: `TradeStack Support: ${body}`,
      from: TWILIO_FROM,
      to:   pending.user_phone,
    });

    // Mark message as replied
    await supabase
      .from('support_messages')
      .update({ replied_at: new Date().toISOString(), reply_text: body })
      .eq('id', pending.id);

    return new Response('<Response/>', { headers: { 'Content-Type': 'text/xml' } });

  } catch (err) {
    console.error('support-reply error:', err.message);
    return new Response('<Response/>', { headers: { 'Content-Type': 'text/xml' } });
  }
});
