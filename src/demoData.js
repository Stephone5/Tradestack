// Demo mode data — used when ?demo=true is in the URL
// Simulates a real business (Peak Performance HVAC) with pre-seeded data

export const DEMO_PROFILE = {
  bizName: "Peak Performance HVAC",
  trade: "HVAC",
  location: "Austin, TX",
  yearsOp: "9",
  employees: "6",
  annualRev: "620000",
  cogs: "280000",
  opEx: "190000",
  netIncome: "150000",
  topService: "AC Installation & Repair",
  avgJobValue: "1800",
  painPoints: "Slow seasons in winter, chasing invoices, no repeat customer system",
  phoneNumber: "",
  timezone: "America/Chicago",
};

export const DEMO_CANVAS = {
  problem: "• Homeowners don't know who to trust for HVAC work\n• Emergency breakdowns cause stress and big unexpected costs\n• Most contractors don't follow up or build relationships",
  solution: "• Fast, transparent same-day service with upfront pricing\n• Annual maintenance plans that prevent emergencies\n• Friendly team that treats every home like their own",
  uvp: "• Austin's most trusted HVAC team — 400+ five-star reviews\n• Flat-rate pricing, no surprises\n• Maintenance plans that pay for themselves",
  unfair: "• 9 years of Austin-specific reputation and referral network\n• Exclusive supplier relationships for faster parts access\n• Owner on every job for the first year — personal accountability",
  segments: "• Homeowners aged 35-65 in established Austin neighborhoods\n• Property managers with 10+ units\n• Small commercial buildings under 10,000 sq ft",
  metrics: "• Close rate on inbound calls: ~68%\n• Average job value: $1,800\n• Repeat customer rate: 41%\n• Maintenance plan retention: 74%",
  channels: "• Google search + Google Business Profile\n• Referrals from past customers (biggest source)\n• Neighborhood apps like Nextdoor",
  revenue: "• Service calls and repairs (55%)\n• New system installations (30%)\n• Annual maintenance plans (15%)",
  cost: "• Labor: 3 full-time techs + 2 part-time ($210k/yr)\n• Parts and equipment ($70k/yr)\n• Trucks, fuel, insurance ($40k/yr)\n• Software, marketing, admin ($30k/yr)",
};

export const DEMO_SCORES = {
  problem:  { score: 72, preview: "Trust gap opportunity" },
  solution: { score: 68, preview: "Maintenance plan upside" },
  uvp:      { score: 81, preview: "Reviews underutilized" },
  unfair:   { score: 74, preview: "Referral system missing" },
  segments: { score: 63, preview: "Property mgr untapped" },
  metrics:  { score: 77, preview: "Close rate improvable" },
  channels: { score: 59, preview: "Referral program gap" },
  revenue:  { score: 55, preview: "Plans need growth" },
  cost:     { score: 70, preview: "Labor efficiency" },
};

export const DEMO_OPPORTUNITIES = [
  {
    id: "demo-opp-1",
    canvas_cell: "revenue",
    title: "Double your maintenance plan revenue",
    insight: "You're at 15% of revenue from maintenance plans but retaining 74% of plan customers — that's a strong product. Actively offering plans to your 55% service-call customers at close could realistically push plan revenue to 25-30%, adding $60,000-$90,000 in predictable annual income.",
    impact_label: "High",
    migrated: false,
    sort_order: 0,
  },
  {
    id: "demo-opp-2",
    canvas_cell: "channels",
    title: "Build a structured referral program",
    insight: "Referrals are your biggest source of new business but you have no formal system to encourage them. A simple $50 credit for every referral that books a job could increase referral volume by 30-40% with almost no cost — your existing happy customers are your best salespeople.",
    impact_label: "High",
    migrated: false,
    sort_order: 1,
  },
  {
    id: "demo-opp-3",
    canvas_cell: "segments",
    title: "Land 3 property management contracts",
    insight: "A single property manager with 20 units could be worth $36,000/year in maintenance and repair work. You already have the reputation — a targeted outreach to 10 Austin property managers with a custom multi-unit pricing sheet could close 2-3 accounts within 60 days.",
    impact_label: "High",
    migrated: false,
    sort_order: 2,
  },
  {
    id: "demo-opp-4",
    canvas_cell: "metrics",
    title: "Recover the 32% of calls you're not closing",
    insight: "At a 68% close rate on inbound calls, you're losing roughly 1 in 3 leads. A simple follow-up text 30 minutes after a no-close call — offering a $50 first-time discount — could recover 10-15% of those leads, adding an estimated $40,000+ in annual revenue.",
    impact_label: "Medium",
    migrated: false,
    sort_order: 3,
  },
  {
    id: "demo-opp-5",
    canvas_cell: "cost",
    title: "Reduce winter labor bleed with seasonal part-timers",
    insight: "Keeping 3 full-time techs through slow winter months costs roughly $35,000 in underutilized labor. Shifting one position to a seasonal contract role could save $12,000-$18,000 annually while maintaining surge capacity for summer.",
    impact_label: "Medium",
    migrated: false,
    sort_order: 4,
  },
];

export const DEMO_GOAL = {
  id: "demo-goal-1",
  title: "Double your maintenance plan revenue",
  estimated_value: 75000,
  status: "in_progress",
  sms_enabled: false,
  sort_order: 0,
};

export const DEMO_GOAL_STEPS = [
  { id: "demo-step-1", goal_id: "demo-goal-1", step_text: "Pull list of all service-call customers from last 2 years", status: "done", sort_order: 0, days_to_complete: 1 },
  { id: "demo-step-2", goal_id: "demo-goal-1", step_text: "Create a one-page maintenance plan offer sheet with pricing", status: "done", sort_order: 1, days_to_complete: 2 },
  { id: "demo-step-3", goal_id: "demo-goal-1", step_text: "Train techs to offer the plan at close of every service call", status: "in_progress", sort_order: 2, days_to_complete: 3 },
  { id: "demo-step-4", goal_id: "demo-goal-1", step_text: "Send a text offer to the last 100 service customers", status: "not_started", sort_order: 3, days_to_complete: 7 },
  { id: "demo-step-5", goal_id: "demo-goal-1", step_text: "Track plan sign-ups weekly and adjust pitch as needed", status: "not_started", sort_order: 4, days_to_complete: 30 },
];
