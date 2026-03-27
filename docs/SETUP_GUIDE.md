# TradeStack â Deployment Setup Guide
_Complete this once after the codebase is pushed to GitHub._

---

## Step 1 â Run the Database Schema in Supabase

1. Go to https://supabase.com/dashboard/project/bhwrhvzyjoykquxbaveu/sql
2. Open a new SQL query
3. Copy the entire contents of `supabase/schema.sql`
4. Paste and click "Run"
5. All 7 tables will be created with Row Level Security enabled

---

## Step 2 â Set Supabase Edge Function Secrets

Go to https://supabase.com/dashboard/project/bhwrhvzyjoykquxbaveu/settings/vault

Add each of these secrets:

| Secret Name | Value |
|---|---|
| `ANTHROPIC_API_KEY` | Your Anthropic API key |
| `STRIPE_SECRET_KEY` | Your Stripe secret key (from Stripe Dashboard â Developers â API keys) |
| `STRIPE_PRICE_ID` | `price_...` (get from Stripe Dashboard) |
| `STRIPE_WEBHOOK_SECRET` | Generated in Step 4 below |
| `TWILIO_ACCOUNT_SID` | Your Twilio Account SID (from Twilio Console) |
| `TWILIO_AUTH_TOKEN` | Your Twilio auth token |
| `TWILIO_PHONE_NUMBER` | Your Twilio phone number (e.g. +1XXXXXXXXXX) |
| `SUPABASE_SERVICE_ROLE_KEY` | Your service role key |
| `APP_URL` | `https://tradestack.biz` |

---

## Step 3 â Deploy Edge Functions via Supabase CLI

Install Supabase CLI if not already installed:
```bash
npm install -g supabase
```

Login and link the project:
```bash
supabase login
supabase link --project-ref bhwrhvzyjoykquxbaveu
```

Deploy all functions:
```bash
supabase functions deploy claude-proxy
supabase functions deploy stripe-webhook
supabase functions deploy create-checkout
supabase functions deploy twilio-sms
supabase functions deploy twilio-inbound
supabase functions deploy sms-daily-digest
```

---

## Step 4 â Register Stripe Webhook

1. Go to https://dashboard.stripe.com/webhooks
2. Click "Add endpoint"
3. URL: `https://bhwrhvzyjoykquxbaveu.supabase.co/functions/v1/stripe-webhook`
4. Events to listen for:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_failed`
5. Copy the "Signing secret" (starts with `whsec_`)
6. Add it as `STRIPE_WEBHOOK_SECRET` in Supabase secrets (Step 2)

---

## Step 5 â Get Your Stripe Price ID

You gave me the Product ID (`prod_UDllmC4RmC0FCX`) but I need the Price ID:

1. Go to https://dashboard.stripe.com/products
2. Click on your TradeStack product
3. In the Pricing table, copy the Price ID (starts with `price_`)
4. Add it as `STRIPE_PRICE_ID` in Supabase secrets (Step 2)
5. Also update `.env` file: `VITE_STRIPE_PRICE_ID=price_...`

---

## Step 6 â Register Twilio Inbound Webhook

1. Go to https://console.twilio.com/us1/develop/phone-numbers/manage/incoming
2. Click on your number (+1 478 443 6117)
3. Under "Messaging Configuration" â "A message comes in"
4. Set URL to: `https://bhwrhvzyjoykquxbaveu.supabase.co/functions/v1/twilio-inbound`
5. Method: HTTP POST
6. Save

---

## Step 7 â Schedule the Daily SMS Digest

1. Go to https://supabase.com/dashboard/project/bhwrhvzyjoykquxbaveu/functions
2. Find `sms-daily-digest`
3. Set schedule: `0 * * * *` (runs every hour, sends only to users where it's 8pm local time)

---

## Step 8 â Connect Vercel

1. Go to https://vercel.com
2. Import the GitHub repo: `Stephone5/Tradestack`
3. Framework: Vite
4. Add environment variables (from `.env` file):
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_STRIPE_PUBLISHABLE_KEY`
   - `VITE_STRIPE_PRICE_ID`
5. Set custom domain: `tradestack.biz`
6. Enable auto-deploy on push to main

---

## Step 9 â Configure Google OAuth in Supabase

1. Go to https://supabase.com/dashboard/project/bhwrhvzyjoykquxbaveu/auth/providers
2. Enable Google provider
3. Add redirect URL: `https://tradestack.biz`
4. Add localhost for dev: `http://localhost:5173`

---

## Checklist

- [ ] Schema SQL run in Supabase
- [ ] All 9 Edge Function secrets set
- [ ] All 5 Edge Functions deployed
- [ ] Stripe webhook registered + `STRIPE_WEBHOOK_SECRET` added
- [ ] Stripe Price ID retrieved + set in secrets and .env
- [ ] Twilio inbound webhook registered
- [ ] SMS daily digest scheduled (`0 * * * *`)
- [ ] Vercel connected to repo + env vars set + domain pointed
- [ ] Google OAuth enabled in Supabase auth settings
- [ ] End-to-end test: login â input â canvas â opportunity â goal â SMS
