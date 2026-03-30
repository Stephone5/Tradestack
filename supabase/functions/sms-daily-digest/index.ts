// TradeStack — SMS Daily Digest Cron
// Runs every hour. Sends the 8pm local-time digest to users who have SMS-enabled goals.
// Schedule this in Supabase Dashboard > Edge Functions > Schedules: "0 * * * *"
//
// For each user with SMS-enabled goals:
//   - Check if current hour = 20 (8pm) in their timezone
//   - Send one digest SMS listing active steps across all SMS-enabled goals
//   - Reply instructions: 1=No, 2=In Progress, 3=Done (applies to first pending step)

import { createClient } from 'npm:@supabase/supabase-js@2';

const SUPABASE_URL      = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE  = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const TWILIO_ACCOUNT_SID = Deno.env.get('TWILIO_ACCOUNT_SID')!;
const TWILIO_AUTH_TOKEN   = Deno.env.get('TWILIO_AUTH_TOKEN')!;
const TWILIO_PHONE        = Deno.env.get('TWILIO_PHONE_NUMBER')!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE);

async function sendSMS(to: string, body: string): Promise<void> {
  const url  = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`;
  const auth = btoa(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`);
  await fetch(url, {
    method: 'POST',
    headers: { 'Authorization': `Basic ${auth}`, 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ From: TWILIO_PHONE, To: to, Body: body }).toString(),
  });
}

Deno.serve(async (_req) => {
  try {
    const now = new Date();

    // Get all users who have at least one SMS-enabled, non-completed goal
    const { data: goals } = await supabase.from('goals')
      .select('user_id, id, title')
      .eq('sms_enabled', true)
      .neq('status', 'completed');

    if (!goals?.length) {
      return new Response(JSON.stringify({ sent: 0 }), { status: 200 });
    }

    // Get unique user IDs
    const userIds = [...new Set(goals.map(g => g.user_id))];

    // Get business info (phone + timezone) for each user
    const { data: businesses } = await supabase.from('businesses')
      .select('user_id, phone_number, timezone, biz_name')
      .in('user_id', userIds);

    let sent = 0;

    for (const biz of businesses || []) {
      if (!biz.phone_number) continue;

      // Check if it's 8pm in this user's timezone
      const userHour = parseInt(
        new Intl.DateTimeFormat('en-US', {
          timeZone: biz.timezone || 'America/New_York',
          hour: 'numeric',
          hour12: false,
        }).format(now)
      );

      if (userHour !== 20) continue; // Not 8pm for this user, skip

      // Get their SMS-enabled goals
      const userGoals = goals.filter(g => g.user_id === biz.user_id);

      // Get pending steps for each goal
      const stepLines: string[] = [];
      for (const goal of userGoals) {
        const { data: steps } = await supabase.from('goal_steps')
          .select('step_text, status, days_to_complete')
          .eq('goal_id', goal.id)
          .neq('status', 'done')
          .order('sort_order')
          .limit(2);

        if (steps?.length) {
          stepLines.push(`[${goal.title.slice(0, 30)}]`);
          steps.forEach(s => {
            const time = s.days_to_complete ? ` (${s.days_to_complete}d)` : '';
            stepLines.push(`- ${s.step_text.slice(0, 60)}${time}`);
          });
        }
      }

      if (!stepLines.length) continue;

      const message = [
        `TradeStack Daily — ${now.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}`,
        '',
        ...stepLines,
        '',
        'Reply: 1=No  2=In Progress  3=Done',
      ].join('\n');

      await sendSMS(biz.phone_number, message);
      sent++;
    }

    return new Response(JSON.stringify({ sent }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (err: any) {
    console.error('Daily digest error:', err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
});
