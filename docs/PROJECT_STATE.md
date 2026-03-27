# TradeStack — Project State
_Updated: 2026-03-27 (late evening) | Status: PHASE 1 IN PROGRESS_

---

## OPEN REQUESTS (resolve these first)

_These are things Stephen has asked for that have not been completed. Do not start new features until these are addressed or explicitly deprioritized by Stephen._

| # | Request | Date Asked | Status | Notes |
|---|---------|------------|--------|-------|
| 1 | Enlarge all text on main site | Mar 25 | **DONE** | ~50 font-size changes (~15-20% increase) applied to App.jsx. Pushed to GitHub (commit 952f5d11). Vercel auto-deployed. Verified live Mar 27 late evening. |
| 2 | Confirm: no emojis on main site by design | Mar 25 | **DONE** | Confirmed to Stephen: no emojis is by design per DECISIONS_LOG ("Zero graphics or emojis anywhere in the product"). |
| 3 | Fix Vercel build (encoding corruption) | Mar 26 | **DONE** | Clean App.jsx pushed to GitHub via browser chunk method. Vercel deployed successfully. Verified live on tradestack.biz Mar 27 evening. |
| 4 | Establish memory/protection system for project | Mar 27 | **DONE** | CLAUDE.md created, PROJECT_STATE restructured. |
| 5 | Remove AI from Canvas tab | Mar 27 | **DONE** | Canvas is now pure user-editable textareas. No genCanvas(), no score badges, no AI loading screen. |
| 6 | Fix input-to-canvas data flow | Mar 27 | **DONE** | Business Model section (9 textareas) restored to Input tab. Values flow to Canvas via shared state. |
| 7 | Fix corrupted characters on loading screen | Mar 27 | **DONE** | All non-ASCII chars stripped from App.jsx. Pure ASCII file (69228 bytes). |

---

## BLOCKING ISSUES

- ~~**Vercel build failing:**~~ RESOLVED Mar 27. Clean App.jsx pushed to GitHub. Vercel build succeeds. Site live at tradestack.biz.
- **Supabase schema not confirmed as run:** `schema.sql` file exists but no confirmation it was executed against the Supabase database.

---

## Current Phase

**PHASE 1: FOUNDATION — INFRASTRUCTURE SETUP**

All credentials received on Mar 26. Backend infrastructure largely configured: 6 Edge Functions written and deployed, Supabase secrets set, Stripe product + webhook configured, Vercel env vars set, Google OAuth confirmed.

### Phase 1 Checklist

- [ ] Set up Supabase schema (all tables per ARCHITECTURE.md) — schema.sql exists, needs to be confirmed as run
- [ ] Enable Row Level Security on all tables — included in schema.sql
- [x] Set up Supabase Edge Functions (6 deployed + active, Mar 26)
- [x] Configure Vercel deployment (project exists, env vars set, auto-deploys, Mar 26)
- [x] Fix Vercel build (encoding corruption — RESOLVED Mar 27)
- [ ] Point tradestack.biz custom domain to Vercel
- [x] Move Anthropic API key to Edge Function env only (Mar 26)
- [x] Set up Stripe product + webhook endpoint (Mar 26)
- [ ] Set Twilio inbound webhook (manual step — Stephen must do in Twilio Console)
- [ ] Schedule SMS daily digest cron (`0 * * * *` in Supabase)

### Manual Steps Waiting on Stephen

1. **Twilio inbound webhook:** Go to Twilio Console → Phone Numbers → `+14784436117` → set webhook URL to `https://bhwrhvzyjoykquxbaveu.supabase.co/functions/v1/twilio-inbound`
2. **SMS daily digest cron:** Schedule in Supabase dashboard (`0 * * * *`)
3. **Verify tradestack.biz domain** points to Vercel

---

## Progress History

| Date | What happened |
|------|---------------|
| Mar 24 | App.jsx restored to GitHub (commit `442ed95`, 939 lines). Initial planning session — all major architecture and product decisions made. |
| Mar 25 | App.jsx encoding fix + font brightening (commit `4d5173c`). StoryBrand landing page created as `src/components/LandingPage.jsx` (commit `b104b6b`). App.jsx updated to show landing page as sign-in gate. 6 decisions logged. |
| Mar 26 | App.jsx expanded to 1099 lines. 6 Supabase Edge Functions created + deployed. All secrets configured. Stripe product confirmed. Vercel env vars updated. SETUP_GUIDE.md created. Vercel build broke (encoding). |
| Mar 27 | Memory/protection system created: CLAUDE.md, PROJECT_STATE restructured. Evening: 3 bug fixes deployed — removed AI from Canvas (now user-editable textareas), restored Business Model section to Input tab, stripped all non-ASCII chars from App.jsx. Clean push to GitHub via browser chunk method. Vercel build + deploy confirmed live. Late evening: Text enlargement (~50 font-size changes, ~15-20% increase) pushed to GitHub (commit 952f5d11). Vercel auto-deployed. Verified live on tradestack.biz. All 7 open requests now resolved. |

---

## Credentials Checklist

| # | Item | Status |
|---|------|--------|
| 1 | Stripe Publishable Key (`pk_live_...`) | Received — in .env |
| 2 | Stripe Secret Key (`sk_live_...`) | Received — in Supabase secrets |
| 3 | Stripe Price ID (`price_1TFKEEIeiH9jvG6ADl2pM9ud`) | Confirmed — $9.98/mo |
| 4 | Twilio Account SID (`ACf81bfe17...`) | Received — in Supabase secrets |
| 5 | Twilio Auth Token | Received — in Supabase secrets |
| 6 | Twilio Phone Number (`+14784436117`) | Received — in Supabase secrets |
| 7 | Supabase Service Role Key | Auto-provided by Supabase runtime |
| 8 | Supabase URL | Confirmed — `bhwrhvzyjoykquxbaveu.supabase.co` |
| 9 | Supabase Anon Key | Confirmed — in .env |
| 10 | Anthropic API Key | Received — in Supabase secrets |
| 11 | Hosting: Vercel account connected to repo | Connected — auto-deploys on push |

---

## Build Order (remaining phases)

### Phase 2: Component Refactor
- [ ] Break App.jsx into modular components (one per tab + shared)
- [ ] Build shared: Header, TabBar, ScoreBadge, LoadingBar
- [ ] Build Tab 1: Input (free text trade field, auto-save to Supabase)
- [ ] Build Tab 2: Lean Canvas (editable cells, score badges, premium gate)
- [ ] Build Tab 3: Opportunities (3 sections, cards, select → goal flow, migration animation)
- [ ] Build Tab 4: Goals (editable goals, steps with time estimates, SMS toggle, Money Unlocked tracker)
- [ ] Build Customer Service floating bubble

### Phase 3: AI Integration
- [ ] Money Leak Agent system prompt + canvas scoring
- [ ] Revenue Growth Agent system prompt + canvas scoring
- [ ] Customer Service Agent system prompt
- [ ] Canvas score generation (scores + 3-word previews per cell)
- [ ] Dollar value estimation at goal migration
- [ ] Goal step plan generation (AI, with time estimates)

### Phase 4: Premium + Stripe
- [ ] Stripe checkout flow (from upgrade button)
- [ ] Stripe webhook → set is_premium in Supabase
- [ ] Premium gate enforcement on Tab 3, Tab 4
- [ ] Score badge behavior: free vs. premium click handling
- [ ] Rate limiting in Claude proxy Edge Function

### Phase 5: SMS System
- [ ] Twilio outbound SMS (Edge Function)
- [ ] Twilio inbound webhook (reply handler)
- [ ] Daily digest cron (8pm local timezone per user)
- [ ] Goal step status update on reply (No / In Progress / Done)
- [ ] Auto-complete goal on final step Done
- [ ] Money Unlocked tracker update on completion
- [ ] Phone number requirement before SMS toggle

### Phase 6: Admin Dashboard
- [ ] Extend existing tradestack-admin with agent chat interfaces
- [ ] Admin chat: Money Leak Agent, Revenue Growth Agent, Customer Service Agent
- [ ] Customer service conversation viewer
- [ ] User data overview

### Phase 7: Polish + Hardening
- [ ] Delete Account feature
- [ ] Mobile-first layout audit (all 4 tabs)
- [ ] Loading states, empty states, error states
- [ ] Full flow test: login → input → canvas → opportunities → goals → SMS
- [ ] Stripe test mode → live mode switch
- [ ] Rate limit testing

---

## Component Map (target state)

```
src/
  App.jsx                    — Auth gate, tab router, global state
  supabaseClient.js          — Supabase client (unchanged)
  context/
    AppContext.jsx            — Global state: user, premium status, business data
  components/
    shared/
      Header.jsx
      TabBar.jsx
      ScoreBadge.jsx
      LoadingBar.jsx
      PremiumGate.jsx
    tabs/
      TabInput.jsx
      TabCanvas.jsx
      TabOpportunities.jsx
      TabGoals.jsx
    agents/
      CustomerServiceBubble.jsx
  hooks/
    useBusinessData.js        — Load/save business profile
    useCanvas.js              — Canvas state + AI generation
    useOpportunities.js       — Opportunity card state + migration
    useGoals.js               — Goal state + step management
    usePremium.js             — Stripe subscription status

supabase/
  functions/
    claude-proxy/             — Claude API proxy + rate limiting (deployed)
    stripe-webhook/           — Payment event handler (deployed)
    create-checkout/          — Stripe checkout session creator (deployed)
    twilio-sms/               — Outbound SMS sender (deployed)
    twilio-inbound/           — Reply handler (deployed)
    sms-daily-digest/         — Daily cron (deployed)
```

---

## Known Refactors Required in Existing Code

1. **`App.jsx` line 5-16:** Direct Anthropic API call from browser → replace with Edge Function call
2. **`App.jsx` line 348-351:** Trade type dropdown → replace with free text input
3. **`App.jsx` line 336:** 4-tab config needs updating (remove competitors, add opportunities + goals)
4. **`App.jsx` line 371-376:** Canvas cells are read-only → make editable (contentEditable or textarea)
5. **`App.jsx` line 213 model:** `claude-sonnet-4-20250514` → update to `claude-sonnet-4-6`
6. **No premium gating exists** → must build from scratch
7. **No goal system exists** → must build from scratch
8. **No SMS system exists** → must build from scratch
9. **No score badges exist** → must build from scratch
10. **No agent system exists** → must build from scratch

---

## Risks & Watch Points

- **Encoding corruption on GitHub push:** Has burned us twice. Always verify file integrity after pushing. Use direct Write/Edit tools when possible, not Chrome-based injection.
- **SMS timezone handling:** Must store user timezone at input time. Don't rely on browser timezone at send time.
- **Twilio daily digest:** Cron needs to handle users across many timezones — group sends by hour bucket.
- **Google OAuth redirect:** Supabase auth redirect must point to tradestack.biz production URL and localhost for dev.
- **Stripe webhook signature verification:** Must verify webhook signatures in Edge Function.
- **RLS on admin queries:** Admin dashboard uses service role key — ensure it never leaks to frontend.
- **Card regeneration on Input update:** Must debounce or require explicit "re-analyze" button press.
