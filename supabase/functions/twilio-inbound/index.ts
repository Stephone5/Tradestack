// TradeStack â Twilio Inbound SMS Handler
// Registered as the webhook URL in Twilio Console > Phone Numbers > your number > Messaging.
// URL: https://bhwrhvzyjoykquxbaveu.supabase.co/functions/v1/twilio-inbound
//
// Reply format:
//   1 = No (step stays not_started)
//   2 = In Progress
//   3 = Done

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL     = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase         = createClient(SUPABASE_URL, SUPABASE_SERVICE);

Deno.serve(async (req) => {
  try {
    const body = await req.text();
    const params = new URLSearchParams(body);
    const from   = params.get('From') || '';
    const msg    = (params.get('Body') || '').trim();

    // Normalize the phone number â strip all non-digits for matching
    const normalize = (p: string) => p.replace(/\D/g, '');
    const fromNorm  = normalize(from);

    // Find user by phone number
    const { data: biz } = await supabase.from('businesses')
      .select('user_id, phone_number').order('updated_at', { ascending: false });

    const match = biz?.find(b => normalize(b.phone_number || '') === fromNorm);
    if (!match) {
      return twimlResponse("We couldn't find your account. Sign up at tradestack.biz");
    }

    const userId = match.user_id;
    const choice = msg.trim();

    // Map reply to status
    const statusMap: Record<string, string> = {
      '1': 'not_started',
      '2': 'in_progress',
      '3': 'done',
    };
    const newStatus = statusMap[choice];
    if (!newStatus) {
      return twimlResponse("Reply 1 (No), 2 (In Progress), or 3 (Done) to update your goal step.");
    }

    // Find the most recent pending step for this user with SMS enabled
    const { data: goals } = await supabase.from('goals')
      .select('id, title')
      .eq('user_id', userId)
      .eq('sms_enabled', true)
      .neq('status', 'completed');

    if (!goals?.length) {
      return twimlResponse("No active SMS-enabled goals found. Enable SMS on a goal in the app.");
    }

    // Find the first non-done step across those goals
    let updatedStep = null;
    let parentGoal  = null;

    for (const goal of goals) {
      const { data: steps } = await supabase.from('goal_steps')
        .select('*').eq('goal_id', goal.id)
        .neq('status', 'done').order('sort_order').limit(1);
      if (steps?.length) {
        updatedStep = steps[0];
        parentGoal  = goal;
        break;
      }
    }

    if (!updatedStep || !parentGoal) {
      return twimlResponse("All your goal steps are complete. Great work!");
    }

    // Update the step
    await supabase.from('goal_steps')
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq('id', updatedStep.id);

    // Check if all steps for this goal are now done â auto-complete goal
    const { data: allSteps } = await supabase.from('goal_steps')
      .select('status').eq('goal_id', parentGoal.id);

    const allDone = allSteps?.every(s => s.id === updatedStep.id ? newStatus === 'done' : s.status === 'done');

    if (allDone) {
      await supabase.from('goals').update({
        status:       'completed',
        completed_at: new Date().toISOString(),
        updated_at:   new Date().toISOString(),
      }).eq('id', parentGoal.id);

      // Get updated money unlocked total
      const { data: completedGoals } = await supabase.from('goals')
        .select('estimated_value')
        .eq('user_id', userId)
        .eq('status', 'completed');
      const total = completedGoals?.reduce((sum, g) => sum + (parseFloat(g.estimated_value)||0), 0) || 0;

      return twimlResponse(
        `Goal complete: "${parentGoal.title}". Your Money Unlocked total is now $${total.toLocaleString()}. Keep it up!`
      );
    }

    const statusLabels: Record<string, string> = {
      not_started: 'marked as skipped',
      in_progress: 'marked as in progress',
      done: 'marked as done',
    };
    return twimlResponse(`Step "${updatedStep.step_text.slice(0, 60)}" ${statusLabels[newStatus]}. Open TradeStack to see your progress.`);

  } catch (err: any) {
    console.error('Inbound SMS error:', err);
    return twimlResponse("Something went wrong. Try again or visit tradestack.biz.");
  }
});

function twimlResponse(message: string): Response {
  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?><Response><Message>${message}</Message></Response>`,
    { status: 200, headers: { 'Content-Type': 'text/xml' } }
  );
}
