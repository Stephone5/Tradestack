-- TradeStack â Supabase Schema
-- Run this in Supabase Dashboard > SQL Editor
-- 2026-03-26

-- âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
-- BUSINESSES (user profile + financials)
-- âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
create table if not exists businesses (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid references auth.users(id) on delete cascade unique not null,
  biz_name      text,
  trade         text,
  location      text,
  years_op      int,
  employees     int,
  annual_rev    numeric,
  cogs          numeric,
  op_ex         numeric,
  net_income    numeric,
  top_service   text,
  avg_job_val   numeric,
  pain_points   text,
  phone_number  text,
  timezone      text default 'America/New_York',
  updated_at    timestamptz default now()
);

alter table businesses enable row level security;

create policy "Users can read own business"
  on businesses for select using (auth.uid() = user_id);

create policy "Users can insert own business"
  on businesses for insert with check (auth.uid() = user_id);

create policy "Users can update own business"
  on businesses for update using (auth.uid() = user_id);

-- âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
-- CANVAS CELLS (lean canvas content + AI scores)
-- âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
create table if not exists canvas_cells (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid references auth.users(id) on delete cascade not null,
  cell_key        text not null,  -- problem, solution, uvp, unfair, segments, metrics, channels, revenue, cost
  content         text default '',
  score           int,            -- 0-100
  score_preview   text,           -- first 3 words of linked opportunity title
  generated_at    timestamptz,
  updated_at      timestamptz default now(),
  unique(user_id, cell_key)
);

alter table canvas_cells enable row level security;

create policy "Users can manage own canvas"
  on canvas_cells for all using (auth.uid() = user_id);

-- âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
-- OPPORTUNITIES (AI-generated cards per canvas cell)
-- âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
create table if not exists opportunities (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid references auth.users(id) on delete cascade not null,
  canvas_cell   text not null,   -- which cell this came from
  title         text not null,
  insight       text,
  impact_label  text default 'Medium',  -- High / Medium / Low
  migrated      boolean default false,
  migrated_at   timestamptz,
  sort_order    int default 0,
  created_at    timestamptz default now()
);

alter table opportunities enable row level security;

create policy "Users can manage own opportunities"
  on opportunities for all using (auth.uid() = user_id);

-- âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
-- GOALS (migrated from opportunities)
-- âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
create table if not exists goals (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid references auth.users(id) on delete cascade not null,
  opportunity_id    uuid references opportunities(id) on delete set null,
  title             text not null,
  estimated_value   numeric default 0,
  status            text default 'not_started',  -- not_started / in_progress / completed
  sms_enabled       boolean default false,
  completed_at      timestamptz,
  sort_order        int default 0,
  created_at        timestamptz default now(),
  updated_at        timestamptz default now()
);

alter table goals enable row level security;

create policy "Users can manage own goals"
  on goals for all using (auth.uid() = user_id);

-- âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
-- GOAL STEPS
-- âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
create table if not exists goal_steps (
  id              uuid primary key default gen_random_uuid(),
  goal_id         uuid references goals(id) on delete cascade not null,
  user_id         uuid references auth.users(id) on delete cascade not null,
  step_text       text not null,
  time_estimate   text,           -- "2 hours", "1 day", etc.
  status          text default 'not_started',  -- not_started / in_progress / done
  sort_order      int default 0,
  updated_at      timestamptz default now()
);

alter table goal_steps enable row level security;

create policy "Users can manage own goal steps"
  on goal_steps for all using (auth.uid() = user_id);

-- âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
-- SUBSCRIPTIONS (Stripe premium status)
-- âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
create table if not exists subscriptions (
  id                       uuid primary key default gen_random_uuid(),
  user_id                  uuid references auth.users(id) on delete cascade unique not null,
  stripe_customer_id       text,
  stripe_subscription_id   text,
  status                   text default 'free',  -- free / active / canceled / past_due
  current_period_end       timestamptz,
  created_at               timestamptz default now(),
  updated_at               timestamptz default now()
);

alter table subscriptions enable row level security;

create policy "Users can read own subscription"
  on subscriptions for select using (auth.uid() = user_id);

-- Service role can update subscription (for Stripe webhook)
create policy "Service role can manage subscriptions"
  on subscriptions for all using (auth.role() = 'service_role');

-- âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
-- CUSTOMER SERVICE CONVERSATIONS
-- âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
create table if not exists cs_conversations (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references auth.users(id) on delete cascade not null,
  role        text not null,   -- user / assistant
  content     text not null,
  created_at  timestamptz default now()
);

alter table cs_conversations enable row level security;

create policy "Users can manage own cs conversations"
  on cs_conversations for all using (auth.uid() = user_id);

-- âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
-- AI USAGE RATE LIMITING
-- âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
create table if not exists ai_usage (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references auth.users(id) on delete cascade not null,
  usage_date  date not null default current_date,
  call_count  int default 0,
  unique(user_id, usage_date)
);

alter table ai_usage enable row level security;

create policy "Users can read own usage"
  on ai_usage for select using (auth.uid() = user_id);

create policy "Service role can manage usage"
  on ai_usage for all using (auth.role() = 'service_role');

-- âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
-- HELPER FUNCTION: auto-update updated_at
-- âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger businesses_updated_at before update on businesses
  for each row execute function update_updated_at();

create trigger goals_updated_at before update on goals
  for each row execute function update_updated_at();

create trigger goal_steps_updated_at before update on goal_steps
  for each row execute function update_updated_at();

create trigger subscriptions_updated_at before update on subscriptions
  for each row execute function update_updated_at();
