import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from './supabaseClient';
import LandingPage from './components/LandingPage';

// ââ HELPERS ââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
function jp(text) {
  try { return JSON.parse(text.replace(/```json\n?|```\n?/g,"").trim()); }
  catch { return null; }
}

async function callEdge(fn, body, session) {
  const { data, error } = await supabase.functions.invoke(fn, { body });
  if (error) throw new Error(error.message);
  return data;
}

// ââ CANVAS CELL DEFINITIONS ââââââââââââââââââââââââââââââââââââââââââââââââ
const CELLS = [
  { k:"problem",   l:"Problem" },
  { k:"solution",  l:"Solution" },
  { k:"uvp",       l:"Unique Value Prop" },
  { k:"unfair",    l:"Unfair Advantage" },
  { k:"segments",  l:"Customer Segments" },
  { k:"metrics",   l:"Key Metrics" },
  { k:"channels",  l:"Channels" },
  { k:"revenue",   l:"Revenue Streams" },
  { k:"cost",      l:"Cost Structure" },
];

// ââ STYLES âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@600;700;800&family=Barlow:wght@300;400;500&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
html{-webkit-text-size-adjust:100%;}
body{background:#0e0e0e;}
.app{min-height:100vh;background:#0e0e0e;color:#e8e0d4;font-family:'Barlow',sans-serif;font-weight:300;}

/* HEADER */
.hdr{background:#141414;border-bottom:2px solid #f5a623;padding:0 1rem;display:flex;align-items:center;justify-content:space-between;height:52px;position:sticky;top:0;z-index:100;}
.logo{font-family:'Barlow Condensed',sans-serif;font-weight:800;font-size:1.3rem;letter-spacing:.08em;text-transform:uppercase;color:#f5a623;}
.logo span{color:#e8e0d4;}
.biz-tag{font-family:'Barlow Condensed',sans-serif;font-size:.7rem;font-weight:600;letter-spacing:.1em;text-transform:uppercase;color:#666;max-width:150px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
.hdr-right{display:flex;align-items:center;gap:.5rem;}
.premium-badge{font-family:'Barlow Condensed',sans-serif;font-size:.6rem;font-weight:700;letter-spacing:.12em;text-transform:uppercase;background:#f5a623;color:#0e0e0e;padding:.18rem .5rem;border-radius:2px;}

/* TABS */
.tabs{display:flex;background:#111;border-bottom:1px solid #222;overflow-x:auto;-webkit-overflow-scrolling:touch;scrollbar-width:none;}
.tabs::-webkit-scrollbar{display:none;}
.tab{padding:.8rem 1rem;font-family:'Barlow Condensed',sans-serif;font-weight:600;font-size:.72rem;letter-spacing:.12em;text-transform:uppercase;color:#555;cursor:pointer;border:none;border-bottom:3px solid transparent;background:none;white-space:nowrap;flex-shrink:0;margin-bottom:-1px;transition:color .15s,border-color .15s;-webkit-tap-highlight-color:transparent;}
.tab:hover{color:#aaa;}
.tab.on{color:#f5a623;border-bottom-color:#f5a623;}
.tab:disabled{opacity:.3;cursor:not-allowed;}
.tab-lock{font-size:.55rem;margin-left:.25rem;opacity:.5;}

/* PAGE */
.pg{padding:1rem;padding-bottom:5rem;}
@media(min-width:768px){.pg{padding:1.5rem 2rem;padding-bottom:5rem;}}

/* GRID */
.g2{display:grid;grid-template-columns:1fr;gap:.9rem;}
.g3{display:grid;grid-template-columns:1fr;gap:.75rem;}
.full{grid-column:1/-1;}
@media(min-width:540px){.g2{grid-template-columns:1fr 1fr;gap:1.1rem;}.g3{grid-template-columns:repeat(3,1fr);}}

/* SECTION TITLE */
.stitle{font-family:'Barlow Condensed',sans-serif;font-weight:800;font-size:1rem;letter-spacing:.1em;text-transform:uppercase;color:#e8e0d4;margin-bottom:.9rem;display:flex;align-items:center;gap:.6rem;}
.stitle::after{content:'';flex:1;height:1px;background:#222;}
.divider{height:1px;background:#1e1e1e;margin:1.1rem 0;}

/* FORM */
.fg{display:flex;flex-direction:column;gap:.3rem;}
label{font-family:'Barlow Condensed',sans-serif;font-size:.68rem;font-weight:700;letter-spacing:.16em;text-transform:uppercase;color:#888;}
input,select,textarea{background:#1a1a1a;border:1px solid #2a2a2a;color:#e8e0d4;padding:.7rem .85rem;font-family:'Barlow',sans-serif;font-size:1rem;font-weight:400;outline:none;border-radius:3px;width:100%;-webkit-appearance:none;appearance:none;transition:border-color .15s;}
input:focus,select:focus,textarea:focus{border-color:#f5a623;}
textarea{resize:vertical;min-height:80px;}
.btn{font-family:'Barlow Condensed',sans-serif;font-weight:700;font-size:.8rem;letter-spacing:.14em;text-transform:uppercase;padding:.8rem 1.5rem;border:none;cursor:pointer;border-radius:3px;touch-action:manipulation;transition:all .15s;-webkit-tap-highlight-color:transparent;}
.bp{background:#f5a623;color:#0e0e0e;width:100%;}
.bp:hover{background:#ffc04a;}
.bp:disabled{background:#333;color:#555;cursor:not-allowed;}
.bg{background:transparent;color:#888;border:1px solid #333;}
.bg:hover{border-color:#555;color:#aaa;}
@media(min-width:540px){.bp{width:auto;}}
.form-end{display:flex;justify-content:stretch;margin-top:1.1rem;}
@media(min-width:540px){.form-end{justify-content:flex-end;}}

/* CANVAS */
.canvas{display:grid;grid-template-columns:1fr;gap:2px;background:#222;border:1px solid #222;}
@media(min-width:560px){.canvas{grid-template-columns:repeat(3,1fr);}}
@media(min-width:900px){.canvas{grid-template-columns:repeat(5,1fr);}}
.cc{background:#141414;padding:.85rem;min-height:100px;display:flex;flex-direction:column;gap:.4rem;}
.cc-top{display:flex;justify-content:space-between;align-items:center;margin-bottom:.3rem;}
.cc-lbl{font-family:'Barlow Condensed',sans-serif;font-size:.62rem;font-weight:700;letter-spacing:.18em;text-transform:uppercase;color:#f5a623;}
.cc-val{font-size:.82rem;line-height:1.55;color:#ccc;white-space:pre-wrap;flex:1;outline:none;background:transparent;border:none;border-bottom:1px solid transparent;width:100%;resize:none;font-family:'Barlow',sans-serif;font-weight:300;transition:border-color .15s;min-height:60px;}
.cc-val:focus{border-bottom-color:#f5a623;}

/* SCORE BADGE */
.score-badge{font-family:'Barlow Condensed',sans-serif;font-size:.68rem;font-weight:700;letter-spacing:.06em;padding:.15rem .38rem;border-radius:2px;cursor:pointer;white-space:nowrap;flex-shrink:0;border:none;transition:all .15s;}
.score-hi{background:#1a3a2a;color:#4caf82;}
.score-md{background:#3a2f1a;color:#f5a623;}
.score-lo{background:#3a1a1a;color:#e05252;}
.score-none{background:#222;color:#555;}

/* SCORE TOOLTIP */
.score-tip{position:fixed;background:#1a1a1a;border:1px solid #333;padding:.65rem .85rem;border-radius:3px;font-size:.78rem;line-height:1.5;color:#ccc;max-width:240px;z-index:200;pointer-events:none;}
.score-tip strong{color:#f5a623;font-family:'Barlow Condensed',sans-serif;font-size:.65rem;letter-spacing:.1em;text-transform:uppercase;display:block;margin-bottom:.2rem;}

/* FIN CARDS */
.fc{background:#141414;border:1px solid #222;padding:.9rem;border-radius:3px;}
.fc-lbl{font-family:'Barlow Condensed',sans-serif;font-size:.63rem;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:#666;margin-bottom:.25rem;}
.fc-val{font-family:'Barlow Condensed',sans-serif;font-size:1.6rem;font-weight:700;line-height:1;}
.pos{color:#4caf82;}.neg{color:#e05252;}.neu{color:#e8e0d4;}
.fc-sub{font-size:.7rem;color:#555;margin-top:.2rem;}

/* LOADING */
.loader{display:flex;flex-direction:column;align-items:center;justify-content:center;padding:3rem 1rem;gap:.65rem;color:#555;}
.lbar{width:140px;height:2px;background:#222;position:relative;overflow:hidden;}
.lbar::after{content:'';position:absolute;left:-50%;width:50%;height:100%;background:#f5a623;animation:lslide 1.2s infinite;}
@keyframes lslide{from{left:-50%;}to{left:100%;}}
.llbl{font-family:'Barlow Condensed',sans-serif;font-size:.68rem;font-weight:700;letter-spacing:.18em;text-transform:uppercase;}
.empty{text-align:center;padding:2.5rem 1rem;color:#444;font-size:.88rem;line-height:1.6;}
.regen{display:flex;justify-content:flex-end;margin-top:.65rem;}

/* OPPORTUNITY CARDS */
.opp-section{margin-bottom:1.5rem;}
.opp-section-title{font-family:'Barlow Condensed',sans-serif;font-size:.68rem;font-weight:700;letter-spacing:.16em;text-transform:uppercase;color:#555;margin-bottom:.5rem;}
.opp-card{background:#141414;border:1px solid #222;border-radius:3px;padding:.95rem;margin-bottom:.5rem;transition:border-color .15s;}
.opp-card:hover{border-color:#333;}
.opp-card-top{display:flex;justify-content:space-between;align-items:flex-start;gap:.5rem;margin-bottom:.5rem;}
.opp-title{font-family:'Barlow Condensed',sans-serif;font-weight:700;font-size:.95rem;color:#e8e0d4;line-height:1.2;}
.opp-impact{font-family:'Barlow Condensed',sans-serif;font-size:.58rem;font-weight:700;letter-spacing:.1em;text-transform:uppercase;padding:.15rem .4rem;border-radius:2px;flex-shrink:0;}
.imp-H{background:#1a3a2a;color:#4caf82;}.imp-M{background:#3a2f1a;color:#f5a623;}.imp-M{background:#222;color:#666;}
.opp-insight{font-size:.82rem;line-height:1.55;color:#999;margin-bottom:.75rem;}
.opp-cta{font-family:'Barlow Condensed',sans-serif;font-weight:700;font-size:.72rem;letter-spacing:.1em;text-transform:uppercase;background:transparent;border:1px solid #f5a623;color:#f5a623;padding:.5rem 1rem;border-radius:3px;cursor:pointer;transition:all .15s;}
.opp-cta:hover{background:#f5a623;color:#0e0e0e;}
.opp-migrated{text-align:center;padding:.65rem;color:#4caf82;font-family:'Barlow Condensed',sans-serif;font-size:.75rem;font-weight:700;letter-spacing:.1em;text-transform:uppercase;border:1px solid #1a3a2a;background:#0e1e16;border-radius:3px;animation:fadein .3s ease;}
@keyframes fadein{from{opacity:0;}to{opacity:1;}}

/* GOALS */
.money-unlocked{background:#141414;border:1px solid #1a3a2a;border-radius:3px;padding:.85rem 1rem;margin-bottom:1.25rem;display:flex;justify-content:space-between;align-items:center;}
.mu-label{font-family:'Barlow Condensed',sans-serif;font-size:.68rem;font-weight:700;letter-spacing:.16em;text-transform:uppercase;color:#4caf82;}
.mu-value{font-family:'Barlow Condensed',sans-serif;font-size:1.5rem;font-weight:700;color:#4caf82;}
.goal-card{background:#141414;border:1px solid #222;border-radius:3px;padding:.95rem;margin-bottom:.75rem;transition:opacity .3s;}
.goal-card.completed{opacity:.45;}
.goal-top{display:flex;justify-content:space-between;align-items:flex-start;gap:.5rem;margin-bottom:.65rem;}
.goal-title-input{font-family:'Barlow Condensed',sans-serif;font-weight:700;font-size:1rem;color:#e8e0d4;background:transparent;border:none;border-bottom:1px solid transparent;outline:none;width:100%;transition:border-color .15s;}
.goal-title-input:focus{border-bottom-color:#f5a623;}
.goal-title-input.completed{text-decoration:line-through;color:#555;}
.goal-meta{display:flex;align-items:center;gap:.6rem;flex-wrap:wrap;margin-bottom:.75rem;}
.goal-status{font-family:'Barlow Condensed',sans-serif;font-size:.6rem;font-weight:700;letter-spacing:.1em;text-transform:uppercase;padding:.15rem .4rem;border-radius:2px;}
.gs-ns{background:#222;color:#666;}.gs-ip{background:#2a2a1a;color:#f5a623;}.gs-done{background:#1a3a2a;color:#4caf82;}
.goal-value-wrap{display:flex;align-items:center;gap:.3rem;}
.goal-value-label{font-family:'Barlow Condensed',sans-serif;font-size:.6rem;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:#555;}
.goal-value-input{font-family:'Barlow Condensed',sans-serif;font-size:.8rem;font-weight:700;color:#4caf82;background:transparent;border:none;border-bottom:1px solid transparent;outline:none;width:80px;transition:border-color .15s;}
.goal-value-input:focus{border-bottom-color:#4caf82;}
.goal-steps{border-top:1px solid #1e1e1e;padding-top:.65rem;margin-top:.3rem;}
.step-row{display:flex;align-items:flex-start;gap:.5rem;margin-bottom:.5rem;}
.step-check{width:18px;height:18px;min-width:18px;border:1px solid #333;border-radius:2px;background:transparent;cursor:pointer;display:flex;align-items:center;justify-content:center;margin-top:.1rem;transition:all .15s;font-size:.7rem;color:#4caf82;}
.step-check.done{border-color:#4caf82;background:#0e1e16;}
.step-check.ip{border-color:#f5a623;}
.step-text-input{flex:1;background:transparent;border:none;border-bottom:1px solid transparent;outline:none;color:#ccc;font-family:'Barlow',sans-serif;font-size:.83rem;font-weight:300;transition:border-color .15s;padding-bottom:.1rem;}
.step-text-input:focus{border-bottom-color:#333;}
.step-time{font-family:'Barlow Condensed',sans-serif;font-size:.6rem;color:#444;letter-spacing:.06em;white-space:nowrap;}
.sms-toggle-row{display:flex;align-items:center;justify-content:space-between;border-top:1px solid #1e1e1e;padding-top:.65rem;margin-top:.5rem;}
.sms-toggle-label{font-family:'Barlow Condensed',sans-serif;font-size:.65rem;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:#555;}
.toggle{position:relative;display:inline-block;width:36px;height:20px;}
.toggle input{opacity:0;width:0;height:0;}
.toggle-slider{position:absolute;cursor:pointer;inset:0;background:#222;border-radius:20px;transition:.2s;}
.toggle-slider:before{content:'';position:absolute;width:14px;height:14px;left:3px;bottom:3px;background:#555;border-radius:50%;transition:.2s;}
.toggle input:checked + .toggle-slider{background:#f5a623;}
.toggle input:checked + .toggle-slider:before{transform:translateX(16px);background:#0e0e0e;}

/* PREMIUM GATE */
.premium-gate{background:#141414;border:1px solid #2a2a1a;border-radius:3px;padding:2rem 1.5rem;text-align:center;margin-top:1rem;}
.pg-eyebrow{font-family:'Barlow Condensed',sans-serif;font-size:.65rem;font-weight:700;letter-spacing:.2em;text-transform:uppercase;color:#f5a623;margin-bottom:.6rem;}
.pg-title{font-family:'Barlow Condensed',sans-serif;font-weight:800;font-size:1.4rem;letter-spacing:.04em;text-transform:uppercase;color:#e8e0d4;margin-bottom:.5rem;}
.pg-sub{font-size:.85rem;color:#777;line-height:1.6;max-width:340px;margin:0 auto 1.25rem;}
.pg-price{font-family:'Barlow Condensed',sans-serif;font-size:.78rem;color:#555;margin-top:.5rem;}

/* BLUR GATE (free-user preview) */
.blur-gate-wrap{position:relative;overflow:hidden;border-radius:3px;}
.blur-gate-content{filter:blur(7px) brightness(.7);pointer-events:none;user-select:none;min-height:320px;}
.blur-gate-overlay{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:.9rem;background:rgba(14,14,14,.45);padding:1.5rem;text-align:center;}
.blur-gate-eyebrow{font-family:'Barlow Condensed',sans-serif;font-size:.62rem;font-weight:700;letter-spacing:.22em;text-transform:uppercase;color:#f5a623;}
.blur-gate-title{font-family:'Barlow Condensed',sans-serif;font-weight:800;font-size:1.25rem;letter-spacing:.04em;text-transform:uppercase;color:#e8e0d4;line-height:1.15;}
.blur-gate-sub{font-size:.8rem;color:#aaa;line-height:1.55;max-width:300px;}
.blur-gate-price{font-family:'Barlow Condensed',sans-serif;font-size:.72rem;color:#555;}

/* CUSTOMER SERVICE BUBBLE */
.cs-bubble{position:fixed;bottom:1.25rem;right:1.25rem;z-index:300;}
.cs-btn{width:48px;height:48px;background:#f5a623;border:none;border-radius:50%;cursor:pointer;display:flex;align-items:center;justify-content:center;font-family:'Barlow Condensed',sans-serif;font-weight:800;font-size:.75rem;letter-spacing:.06em;color:#0e0e0e;box-shadow:0 2px 12px rgba(0,0,0,.4);transition:all .15s;}
.cs-btn:hover{background:#ffc04a;transform:scale(1.05);}
.cs-panel{position:fixed;bottom:4.5rem;right:1.25rem;width:300px;max-width:calc(100vw - 2.5rem);background:#141414;border:1px solid #2a2a2a;border-radius:3px;display:flex;flex-direction:column;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.5);z-index:300;}
.cs-header{background:#111;padding:.65rem .85rem;border-bottom:1px solid #1e1e1e;display:flex;justify-content:space-between;align-items:center;}
.cs-title{font-family:'Barlow Condensed',sans-serif;font-size:.75rem;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:#e8e0d4;}
.cs-close{background:transparent;border:none;color:#555;cursor:pointer;font-size:1rem;line-height:1;padding:0;}
.cs-messages{flex:1;overflow-y:auto;padding:.75rem;display:flex;flex-direction:column;gap:.5rem;max-height:260px;min-height:120px;}
.cs-msg{padding:.5rem .7rem;border-radius:3px;font-size:.8rem;line-height:1.5;max-width:85%;}
.cs-msg.user{background:#1a1a1a;color:#ccc;align-self:flex-end;border:1px solid #2a2a2a;}
.cs-msg.assistant{background:#1a2a1a;color:#ccc;align-self:flex-start;border:1px solid #1e2e1e;}
.cs-input-row{display:flex;border-top:1px solid #1e1e1e;background:#111;}
.cs-input{flex:1;background:transparent;border:none;outline:none;padding:.65rem .75rem;font-family:'Barlow',sans-serif;font-size:.83rem;color:#e8e0d4;}
.cs-send{background:transparent;border:none;border-left:1px solid #1e1e1e;padding:0 .75rem;cursor:pointer;font-family:'Barlow Condensed',sans-serif;font-size:.7rem;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:#f5a623;transition:color .15s;}
.cs-send:hover{color:#ffc04a;}
.cs-send:disabled{color:#333;cursor:not-allowed;}

/* MISC */
.save-indicator{font-family:'Barlow Condensed',sans-serif;font-size:.6rem;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:#4caf82;animation:fadein .3s ease;}
.err{font-size:.78rem;color:#e05252;margin-top:.3rem;}
`;

// ââ MAIN APP âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
export default function App() {

  // ââ AUTH ââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
  const [session,      setSession]      = useState(null);
  const [authLoading,  setAuthLoading]  = useState(true);

  // ââ PREMIUM âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
  const [isPremium,    setIsPremium]    = useState(false);

  // ââ NAV âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
  const [tab,          setTab]          = useState("input");

  // ââ BUSINESS PROFILE ââââââââââââââââââââââââââââââââââââââââââââââââââââ
  const [p, setP] = useState({
    bizName:"", trade:"", location:"", yearsOp:"", employees:"",
    annualRev:"", cogs:"", opEx:"", netIncome:"",
    topService:"", avgJobValue:"", painPoints:"",
    phoneNumber:"", timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "America/New_York"
  });
  const [submitted,    setSubmitted]    = useState(false);
  const [saving,       setSaving]       = useState(false);

  // ââ CANVAS ââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
  const [canvas,       setCanvas]       = useState({});
  const [canvasScores, setCanvasScores] = useState({});
  const [cLoading,     setCLoading]     = useState(false);
  const [scoreTooltip, setScoreTooltip] = useState(null); // {key, x, y}

  // ââ OPPORTUNITIES ââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
  const [opps,         setOpps]         = useState([]);
  const [oppLoading,   setOppLoading]   = useState(false);
  const [migratedMsg,  setMigratedMsg]  = useState({}); // {oppId: true}

  // ââ GOALS ââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
  const [goals,        setGoals]        = useState([]);
  const [goalSteps,    setGoalSteps]    = useState({}); // {goalId: [steps]}

  // ââ CUSTOMER SERVICE âââââââââââââââââââââââââââââââââââââââââââââââââââââ
  const [csOpen,       setCsOpen]       = useState(false);
  const [csMessages,   setCsMessages]   = useState([]);
  const [csInput,      setCsInput]      = useState("");
  const [csLoading,    setCsLoading]    = useState(false);
  const csEndRef = useRef(null);

  // ââ STRIPE CHECKOUT ââââââââââââââââââââââââââââââââââââââââââââââââââââââ
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutError,   setCheckoutError]   = useState(null);
  const [pendingUpgrade,  setPendingUpgrade]  = useState(false);

  const handleUpgrade = async () => {
    if (isPremium) { setCheckoutError('You already have an active Premium subscription.'); return; }
    setCheckoutLoading(true);
    setCheckoutError(null);
    try {
      sessionStorage.setItem('ts_pre_checkout_tab', tab);
      const data = await callEdge('create-checkout', {}, session);
      if (data?.url) {
        window.location.href = data.url;
        return;
      }
      if (data?.error === 'Already subscribed') {
        setIsPremium(true);
        setCheckoutError('You already have an active subscription! Refreshing...');
        setCheckoutLoading(false);
        return;
      }
      setCheckoutError(data?.error || 'Could not start checkout. Please try again.');
    } catch(e) {
      console.error('Checkout error:', e);
      setCheckoutError('Could not connect to payment service. Please try again.');
    }
    setCheckoutLoading(false);
  };

  // ââ CHECKOUT RETURN: poll for subscription activation ââââââââââââââââââ
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('checkout') !== 'success') return;
    window.history.replaceState(null, '', window.location.pathname);
    const savedTab = sessionStorage.getItem('ts_pre_checkout_tab');
    if (savedTab) { setTab(savedTab); sessionStorage.removeItem('ts_pre_checkout_tab'); }
    if (!session) return;
    loadSubscription();
    let attempts = 0;
    const poll = setInterval(async () => {
      attempts++;
      const { data } = await supabase.from('subscriptions')
        .select('status').eq('user_id', session.user.id).maybeSingle();
      if (data?.status === 'active') {
        setIsPremium(true);
        clearInterval(poll);
      }
      if (attempts >= 15) clearInterval(poll);
    }, 2000);
    return () => clearInterval(poll);
  }, [session]);

  // ââ AUTO-SWITCH returning users to canvas tab âââââââââââââââââââââââââ
  // (auto-switch removed — input tab is always accessible)

  // ââ MANAGE BILLING (Stripe portal) ââââââââââââââââââââââââââââââââââââ
  const [billingLoading, setBillingLoading] = useState(false);
  const handleManageBilling = async () => {
    setBillingLoading(true);
    try {
      const data = await callEdge('manage-billing', {}, session);
      if (data?.url) {
        window.location.href = data.url;
        return;
      }
    } catch(e) {
      console.error('Billing portal error:', e);
      alert('Could not open billing portal. Please try again.');
    }
    setBillingLoading(false);
  };

  // ââ COMPUTED âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
  const moneyUnlocked = goals
    .filter(g => g.status === "completed")
    .reduce((sum, g) => sum + (parseFloat(g.estimated_value) || 0), 0);

  const gross = p.annualRev && p.cogs
    ? (parseFloat(p.annualRev) - parseFloat(p.cogs)).toFixed(0)
    : null;
  const gm = gross && p.annualRev
    ? ((parseFloat(gross) / parseFloat(p.annualRev)) * 100).toFixed(1)
    : null;
  const nm = p.netIncome && p.annualRev
    ? ((parseFloat(p.netIncome) / parseFloat(p.annualRev)) * 100).toFixed(1)
    : null;

  // ââ AUTH LISTENER ââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
  useEffect(() => {
    const hashHasToken = window.location.hash.includes('access_token');
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, s) => {
      setSession(s);
      if (hashHasToken) {
        if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') setAuthLoading(false);
      } else {
        setAuthLoading(false);
      }
      if (s && hashHasToken) window.history.replaceState(null,'',window.location.pathname);
    });
    const t = setTimeout(() => setAuthLoading(false), 4000);
    return () => { subscription.unsubscribe(); clearTimeout(t); };
  }, []);

  // ââ LOAD ALL USER DATA ON LOGIN ââââââââââââââââââââââââââââââââââââââââââ
  useEffect(() => {
    if (!session) return;
    (async () => {
      await loadProfile();
      await loadSubscription();
      await loadCanvas();
      loadOpportunities();
      loadGoals();
      loadCSHistory();
    })();
  }, [session]);

  async function loadProfile() {
    const { data, error } = await supabase.from('businesses')
      .select('*').eq('user_id', session.user.id).maybeSingle();
    if (error) { console.error('loadProfile error:', error); return; }
    if (data) {
      setP({
        bizName:     data.biz_name    || "",
        trade:       data.trade       || "",
        location:    data.location    || "",
        yearsOp:     data.years_op    || "",
        employees:   data.employees   || "",
        annualRev:   data.annual_rev  || "",
        cogs:        data.cogs        || "",
        opEx:        data.op_ex       || "",
        netIncome:   data.net_income  || "",
        topService:  data.top_service || "",
        avgJobValue: data.avg_job_val || "",
        painPoints:  data.pain_points || "",
        phoneNumber: data.phone_number|| "",
        timezone:    data.timezone    || Intl.DateTimeFormat().resolvedOptions().timeZone,
      });
      setSubmitted(true);
    }
  }

  async function loadSubscription() {
    const { data } = await supabase.from('subscriptions')
      .select('status').eq('user_id', session.user.id).single();
    setIsPremium(data?.status === 'active');
  }

  async function loadCanvas() {
    const { data } = await supabase.from('canvas_cells')
      .select('*').eq('user_id', session.user.id);
    if (data?.length) {
      const cells = {}, scores = {};
      data.forEach(row => {
        cells[row.cell_key]  = row.content;
        scores[row.cell_key] = { score: row.score, preview: row.score_preview };
      });
      setCanvas(cells);
      setCanvasScores(scores);
    }
  }

  async function loadOpportunities() {
    const { data } = await supabase.from('opportunities')
      .select('*').eq('user_id', session.user.id)
      .eq('migrated', false).order('sort_order');
    setOpps(data || []);
  }

  async function loadGoals() {
    const { data: gData } = await supabase.from('goals')
      .select('*').eq('user_id', session.user.id).order('sort_order');
    if (!gData) return;
    setGoals(gData);
    const stepsMap = {};
    await Promise.all(gData.map(async g => {
      const { data: sData } = await supabase.from('goal_steps')
        .select('*').eq('goal_id', g.id).order('sort_order');
      stepsMap[g.id] = sData || [];
    }));
    setGoalSteps(stepsMap);
  }

  async function loadCSHistory() {
    const { data } = await supabase.from('cs_conversations')
      .select('role,content').eq('user_id', session.user.id)
      .order('created_at').limit(40);
    if (data?.length) setCsMessages(data);
  }

  // ââ AUTH ACTIONS âââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin }
    });
    if (error) console.error('Login error:', error.message);
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setP({ bizName:"",trade:"",location:"",yearsOp:"",employees:"",
           annualRev:"",cogs:"",opEx:"",netIncome:"",topService:"",
           avgJobValue:"",painPoints:"",phoneNumber:"",
           timezone: Intl.DateTimeFormat().resolvedOptions().timeZone });
    setSubmitted(false); setCanvas({}); setCanvasScores({});
    setOpps([]); setGoals([]); setGoalSteps({});
    setCsMessages([]); setTab("input"); setIsPremium(false);
  };

  // ââ SAVE PROFILE âââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
  const saveProfile = useCallback(async () => {
    if (!session) return;
    setSaving(true);
    await supabase.from('businesses').upsert({
      user_id:      session.user.id,
      biz_name:     p.bizName,
      trade:        p.trade,
      location:     p.location,
      years_op:     parseInt(p.yearsOp)      || null,
      employees:    parseInt(p.employees)    || null,
      annual_rev:   parseFloat(p.annualRev)  || null,
      cogs:         parseFloat(p.cogs)       || null,
      op_ex:        parseFloat(p.opEx)       || null,
      net_income:   parseFloat(p.netIncome)  || null,
      top_service:  p.topService,
      avg_job_val:  parseFloat(p.avgJobValue)|| null,
      pain_points:  p.painPoints,
      phone_number: p.phoneNumber,
      timezone:     p.timezone,
      updated_at:   new Date().toISOString(),
    }, { onConflict: 'user_id' });
    setSaving(false);
  }, [session, p]);

  // ââ CONTEXT STRING FOR AI âââââââââââââââââââââââââââââââââââââââââââââââââ
  const ctx = () => `Business:${p.bizName}
Trade:${p.trade}
Location:${p.location}
Years:${p.yearsOp}
Employees:${p.employees}
Revenue:$${p.annualRev}
COGS:$${p.cogs}
OpEx:$${p.opEx}
NetIncome:$${p.netIncome}
TopService:${p.topService}
AvgJobValue:$${p.avgJobValue}
PainPoints:${p.painPoints}`;

  // ââ GENERATE CANVAS âââââââââââââââââââââââââââââââââââââââââââââââââââââââ
  const genCanvas = async () => {
    setCLoading(true);
    try {
      const data = await callEdge('claude-proxy', {
        system: `You are a business strategist for small trades businesses. Return ONLY valid JSON with keys: problem,solution,uvp,unfair,segments,metrics,channels,revenue,cost. Each value: 2-4 bullet points using the bullet character. Max 400 chars per value. No markdown.`,
        user: `Build a lean canvas for this business:\n${ctx()}`
      }, session);
      const parsed = jp(data?.text || '{}');
      if (!parsed) { setCLoading(false); return; }
      setCanvas(parsed);
      // Save all cells to Supabase
      const rows = CELLS.map(c => ({
        user_id:    session.user.id,
        cell_key:   c.k,
        content:    parsed[c.k] || '',
        updated_at: new Date().toISOString(),
      }));
      await supabase.from('canvas_cells').upsert(rows, { onConflict: 'user_id,cell_key' });
      // Score the canvas
      genScores(parsed);
      // Generate opportunities too
      genOpportunities(parsed);
    } catch(e) { console.error('Canvas error:', e); }
    setCLoading(false);
  };

  // ââ GENERATE CANVAS SCORES ââââââââââââââââââââââââââââââââââââââââââââââââ
  const genScores = async (canvasData) => {
    try {
      const data = await callEdge('claude-proxy', {
        system: `You are a lean canvas analyst. Score each canvas cell 0-100 based on: (1) how optimized the content is, (2) integration with other cells, (3) specificity and actionability. Return ONLY valid JSON: {"problem":{"score":75,"preview":"Cut labor costs"},...} â one entry per cell key. The preview is 3-5 words describing the top opportunity linked to this cell.`,
        user: `Score this lean canvas:\n${JSON.stringify(canvasData)}\n\nBusiness context:\n${ctx()}`
      }, session);
      const parsed = jp(data?.text || '{}');
      if (!parsed) return;
      setCanvasScores(parsed);
      // Persist scores
      const rows = Object.entries(parsed).map(([k, v]) => ({
        user_id:       session.user.id,
        cell_key:      k,
        score:         v.score,
        score_preview: v.preview,
        updated_at:    new Date().toISOString(),
      }));
      await supabase.from('canvas_cells').upsert(rows, { onConflict: 'user_id,cell_key' });
    } catch(e) { console.error('Score error:', e); }
  };

  // ââ GENERATE OPPORTUNITIES ââââââââââââââââââââââââââââââââââââââââââââââââ
  const genOpportunities = async (canvasData) => {
    setOppLoading(true);
    try {
      const data = await callEdge('claude-proxy', {
        system: `You are a revenue and efficiency consultant for small trades businesses. Analyze this lean canvas and generate opportunity cards. Return ONLY valid JSON array: [{"canvas_cell":"problem","title":"string","insight":"string (2-3 sentences, specific and actionable)","impact_label":"High"|"Medium"|"Low"}]. Generate at least 2 cards per relevant canvas cell. Be specific to the trade, numbers, and pain points. Focus on the 20% actions that drive 80% of results.`,
        user: `Generate opportunities for this business:\n${ctx()}\n\nLean Canvas:\n${JSON.stringify(canvasData)}`
      }, session);
      const parsed = jp(data?.text || '[]');
      if (!Array.isArray(parsed)) { setOppLoading(false); return; }
      // Delete old non-migrated opportunities first
      await supabase.from('opportunities')
        .delete().eq('user_id', session.user.id).eq('migrated', false);
      // Insert new ones
      const rows = parsed.map((opp, i) => ({
        user_id:      session.user.id,
        canvas_cell:  opp.canvas_cell,
        title:        opp.title,
        insight:      opp.insight,
        impact_label: opp.impact_label || 'Medium',
        migrated:     false,
        sort_order:   i,
      }));
      const { data: inserted } = await supabase.from('opportunities')
        .insert(rows).select();
      setOpps(inserted || []);
    } catch(e) { console.error('Opp error:', e); }
    setOppLoading(false);
  };

  // ââ SUBMIT PROFILE ââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
  const submit = async () => {
    setSubmitted(true);
    setTab("canvas");
    await saveProfile();
    await genCanvas();
  };

  // ââ SAVE CANVAS CELL EDIT âââââââââââââââââââââââââââââââââââââââââââââââââ
  const saveCanvasCell = useCallback(async (key, value) => {
    setCanvas(prev => ({ ...prev, [key]: value }));
    await supabase.from('canvas_cells').upsert({
      user_id:    session.user.id,
      cell_key:   key,
      content:    value,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id,cell_key' });
  }, [session]);

  // ââ MIGRATE OPPORTUNITY â GOAL ââââââââââââââââââââââââââââââââââââââââââââ
  const migrateToGoal = async (opp) => {
    setMigratedMsg(prev => ({ ...prev, [opp.id]: true }));
    // Mark migrated in DB
    await supabase.from('opportunities')
      .update({ migrated: true, migrated_at: new Date().toISOString() })
      .eq('id', opp.id);
    // Estimate dollar value with AI
    let estValue = 0;
    try {
      const data = await callEdge('claude-proxy', {
        system: `You are a financial analyst for small trades businesses. Estimate the annual dollar value of implementing this opportunity. Return ONLY valid JSON: {"estimated_annual_value": 5000, "reasoning": "one sentence"}`,
        user: `Opportunity: ${opp.title}\nInsight: ${opp.insight}\n\nBusiness context:\n${ctx()}`
      }, session);
      const parsed = jp(data?.text || '{}');
      estValue = parsed?.estimated_annual_value || 0;
    } catch(e) { console.error('Value estimate error:', e); }
    // Create goal
    const { data: goal } = await supabase.from('goals').insert({
      user_id:          session.user.id,
      opportunity_id:   opp.id,
      title:            opp.title,
      estimated_value:  estValue,
      status:           'not_started',
      sms_enabled:      false,
      sort_order:       goals.length,
    }).select().single();
    if (!goal) return;
    // Generate steps with AI
    try {
      const data = await callEdge('claude-proxy', {
        system: `You are an execution coach for small business owners. Generate 3-6 specific, actionable steps to achieve this goal. Return ONLY valid JSON array: [{"step_text":"string","time_estimate":"string (e.g. 2 hours, 1 day, 1 week)"}]`,
        user: `Goal: ${opp.title}\nContext: ${opp.insight}\n\nBusiness:\n${ctx()}`
      }, session);
      const steps = jp(data?.text || '[]');
      if (Array.isArray(steps)) {
        const rows = steps.map((s, i) => ({
          goal_id:       goal.id,
          user_id:       session.user.id,
          step_text:     s.step_text,
          time_estimate: s.time_estimate,
          status:        'not_started',
          sort_order:    i,
        }));
        const { data: insertedSteps } = await supabase.from('goal_steps')
          .insert(rows).select();
        setGoalSteps(prev => ({ ...prev, [goal.id]: insertedSteps || [] }));
      }
    } catch(e) { console.error('Steps error:', e); }
    setGoals(prev => [...prev, goal]);
    // Remove from local opps after delay
    setTimeout(() => {
      setOpps(prev => prev.filter(o => o.id !== opp.id));
      setMigratedMsg(prev => { const n = {...prev}; delete n[opp.id]; return n; });
    }, 2000);
  };

  // ââ UPDATE GOAL STEP STATUS âââââââââââââââââââââââââââââââââââââââââââââââ
  const cycleStepStatus = async (goalId, stepId, currentStatus) => {
    const next = currentStatus === 'not_started' ? 'in_progress'
               : currentStatus === 'in_progress' ? 'done'
               : 'not_started';
    await supabase.from('goal_steps')
      .update({ status: next, updated_at: new Date().toISOString() }).eq('id', stepId);
    setGoalSteps(prev => ({
      ...prev,
      [goalId]: (prev[goalId]||[]).map(s => s.id === stepId ? {...s, status: next} : s)
    }));
    // If all steps done â auto-complete the goal
    const updatedSteps = (goalSteps[goalId]||[]).map(s => s.id === stepId ? {...s, status: next} : s);
    if (updatedSteps.length > 0 && updatedSteps.every(s => s.status === 'done')) {
      await completeGoal(goalId);
    } else {
      // Update goal status to in_progress if any step done
      const anyDone = updatedSteps.some(s => s.status !== 'not_started');
      if (anyDone) {
        await supabase.from('goals')
          .update({ status: 'in_progress', updated_at: new Date().toISOString() })
          .eq('id', goalId);
        setGoals(prev => prev.map(g => g.id === goalId ? {...g, status:'in_progress'} : g));
      }
    }
  };

  const completeGoal = async (goalId) => {
    await supabase.from('goals').update({
      status: 'completed',
      completed_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }).eq('id', goalId);
    setGoals(prev => prev.map(g => g.id === goalId ? {...g, status:'completed', completed_at: new Date().toISOString()} : g));
  };

  // ââ UPDATE GOAL FIELD âââââââââââââââââââââââââââââââââââââââââââââââââââââ
  const updateGoalField = async (goalId, field, value) => {
    setGoals(prev => prev.map(g => g.id === goalId ? {...g, [field]: value} : g));
    await supabase.from('goals')
      .update({ [field]: value, updated_at: new Date().toISOString() }).eq('id', goalId);
  };

  // ââ UPDATE STEP TEXT ââââââââââââââââââââââââââââââââââââââââââââââââââââââ
  const updateStepText = async (goalId, stepId, value) => {
    setGoalSteps(prev => ({
      ...prev,
      [goalId]: (prev[goalId]||[]).map(s => s.id === stepId ? {...s, step_text: value} : s)
    }));
    await supabase.from('goal_steps')
      .update({ step_text: value, updated_at: new Date().toISOString() }).eq('id', stepId);
  };

  // ââ TOGGLE SMS FOR GOAL âââââââââââââââââââââââââââââââââââââââââââââââââââ
  const toggleGoalSMS = async (goalId, current) => {
    if (!p.phoneNumber) {
      alert("Add your phone number in the Input tab first to enable SMS reminders.");
      return;
    }
    await updateGoalField(goalId, 'sms_enabled', !current);
  };

  // ââ CUSTOMER SERVICE ââââââââââââââââââââââââââââââââââââââââââââââââââââââ
  useEffect(() => {
    csEndRef.current?.scrollIntoView({ behavior:'smooth' });
  }, [csMessages]);

  const sendCS = async () => {
    if (!csInput.trim() || csLoading) return;
    const userMsg = { role:'user', content: csInput.trim() };
    setCsMessages(prev => [...prev, userMsg]);
    setCsInput("");
    setCsLoading(true);
    await supabase.from('cs_conversations').insert({ ...userMsg, user_id: session.user.id });
    try {
      const history = [...csMessages, userMsg].map(m => ({ role: m.role, content: m.content }));
      const data = await callEdge('claude-proxy', {
        system: `You are the TradeStack customer service assistant. You ONLY answer questions about how to use TradeStack â the business intelligence app. If asked anything else, say: "I'm not sure about that, but I'm here to help you get the most out of TradeStack. What can I help you with?"

TradeStack has 4 tabs:
- Input: Enter your business info and financials. Hit "Save & Analyze" to generate your canvas and opportunities.
- Canvas: Your 9-cell lean canvas. Each cell has a score badge (0-100). Premium users can click a badge to jump to the related opportunity.
- Opportunities: AI-generated action cards based on your canvas. Premium feature. Click "Make it a Goal" to move a card to your Goals tab.
- Goals: Track goals moved from Opportunities. Each goal has AI-generated steps, a dollar value estimate, and an SMS daily reminder toggle.

Keep replies short, friendly, and helpful. No emojis.`,
        user: csInput.trim(),
        history: history.slice(-10)
      }, session);
      const assistantMsg = { role:'assistant', content: data?.text || "I'm not sure about that. What else can I help you with?" };
      setCsMessages(prev => [...prev, assistantMsg]);
      await supabase.from('cs_conversations').insert({ ...assistantMsg, user_id: session.user.id });
    } catch(e) {
      const errMsg = { role:'assistant', content:"Sorry, I'm having trouble connecting right now. Try again in a moment." };
      setCsMessages(prev => [...prev, errMsg]);
    }
    setCsLoading(false);
  };

  // ââ SCORE BADGE HELPERS âââââââââââââââââââââââââââââââââââââââââââââââââââ
  const scoreClass = (score) => {
    if (score == null) return 'score-none';
    if (score >= 70) return 'score-hi';
    if (score >= 40) return 'score-md';
    return 'score-lo';
  };

  const handleScoreBadgeClick = (e, cellKey) => {
    const s = canvasScores[cellKey];
    if (!s?.score) return;
    if (!isPremium) {
      const rect = e.target.getBoundingClientRect();
      setScoreTooltip({ key: cellKey, x: rect.left, y: rect.bottom + 6 });
      setTimeout(() => setScoreTooltip(null), 3000);
    } else {
      setTab("opportunities");
    }
  };

  // ââ GROUPED OPPORTUNITIES âââââââââââââââââââââââââââââââââââââââââââââââââ
  const groupedOpps = CELLS.reduce((acc, c) => {
    const cards = opps.filter(o => o.canvas_cell === c.k);
    if (cards.length) acc[c.k] = { label: c.l, cards };
    return acc;
  }, {});

  // ââ RENDER ââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
  if (authLoading) return (
    <>
      <style>{CSS}</style>
      <div className="app">
        <div className="hdr"><div className="logo">Trade<span>Stack</span></div></div>
        <div style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',minHeight:'80vh',gap:'.65rem'}}>
          <div className="lbar"/><div className="llbl" style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:'.68rem',fontWeight:700,letterSpacing:'.18em',textTransform:'uppercase',color:'#555'}}>Loading</div>
        </div>
      </div>
    </>
  );

  if (!session) return <LandingPage onSignIn={signInWithGoogle} />;

  const TABS = [
    { id:"input",         l:"Input" },
    { id:"canvas",        l:"Canvas",        lock:!submitted },
    { id:"opportunities", l:"Opportunities", lock:!submitted, premium:true },
    { id:"goals",         l:"Goals",         lock:!submitted, premium:true },
  ];

  return (
    <>
      <style>{CSS}</style>
      <div className="app" onClick={() => scoreTooltip && setScoreTooltip(null)}>

        {/* HEADER */}
        <div className="hdr">
          <div className="logo">Trade<span>Stack</span></div>
          <div className="hdr-right">
            {isPremium && <span className="premium-badge">Premium</span>}
            {submitted && <div className="biz-tag">{p.bizName}</div>}
            <button className="btn bg" style={{padding:'.4rem .85rem',fontSize:'.65rem'}} onClick={signOut}>Sign Out</button>
          </div>
        </div>

        {/* TABS */}
        <div className="tabs">
          {TABS.map(t => (
            <button
              key={t.id}
              className={`tab ${tab===t.id?"on":""}`}
              disabled={!!t.lock}
              onClick={() => !t.lock && setTab(t.id)}
            >
              {t.l}
              {t.lock && <span className="tab-lock">lock</span>}
              {!t.lock && t.premium && !isPremium && <span className="tab-lock">pro</span>}
            </button>
          ))}
        </div>

        <div className="pg">

          {/* ââ INPUT TAB ââââââââââââââââââââââââââââââââââââââââââââââââ */}
          {tab==="input" && <>
            <div className="stitle">Your Business</div>
            <div className="g2">
              <div className="fg">
                <label>Business Name</label>
                <input value={p.bizName} onChange={e=>setP(v=>({...v,bizName:e.target.value}))} placeholder="e.g. Garcia Electric LLC"/>
              </div>
              <div className="fg">
                <label>Trade / Specialty</label>
                <input value={p.trade} onChange={e=>setP(v=>({...v,trade:e.target.value}))} placeholder="e.g. Electrical, Plumbing, HVAC..."/>
              </div>
              <div className="fg">
                <label>City / Region</label>
                <input value={p.location} onChange={e=>setP(v=>({...v,location:e.target.value}))} placeholder="e.g. Austin, TX"/>
              </div>
              <div className="fg">
                <label>Years Operating</label>
                <input type="number" inputMode="numeric" value={p.yearsOp} onChange={e=>setP(v=>({...v,yearsOp:e.target.value}))} placeholder="7"/>
              </div>
              <div className="fg">
                <label>Employees</label>
                <input type="number" inputMode="numeric" value={p.employees} onChange={e=>setP(v=>({...v,employees:e.target.value}))} placeholder="4"/>
              </div>
              <div className="fg">
                <label>Top Service</label>
                <input value={p.topService} onChange={e=>setP(v=>({...v,topService:e.target.value}))} placeholder="e.g. Drain cleaning"/>
              </div>
              <div className="fg">
                <label>Avg Job Value ($)</label>
                <input type="number" inputMode="numeric" value={p.avgJobValue} onChange={e=>setP(v=>({...v,avgJobValue:e.target.value}))} placeholder="1200"/>
              </div>
              <div className="fg">
                <label>Phone Number (for SMS reminders)</label>
                <input type="tel" inputMode="tel" value={p.phoneNumber} onChange={e=>setP(v=>({...v,phoneNumber:e.target.value}))} placeholder="+1 555 000 0000"/>
              </div>
            </div>

            <div className="divider"/>
            <div className="stitle">Financials (Annual)</div>
            <div className="g2">
              <div className="fg">
                <label>Annual Revenue ($)</label>
                <input type="number" inputMode="numeric" value={p.annualRev} onChange={e=>setP(v=>({...v,annualRev:e.target.value}))} placeholder="420000"/>
              </div>
              <div className="fg">
                <label>Cost of Goods ($)</label>
                <input type="number" inputMode="numeric" value={p.cogs} onChange={e=>setP(v=>({...v,cogs:e.target.value}))} placeholder="180000"/>
                <span style={{fontSize:'.68rem',color:'#555',lineHeight:1.4}}>Direct job costs: materials, subcontractors, labor per job. What you spend to deliver the work.</span>
              </div>
              <div className="fg">
                <label>Operating Expenses ($)</label>
                <input type="number" inputMode="numeric" value={p.opEx} onChange={e=>setP(v=>({...v,opEx:e.target.value}))} placeholder="95000"/>
                <span style={{fontSize:'.68rem',color:'#555',lineHeight:1.4}}>Overhead costs to run the business: insurance, truck payments, software, office, owner salary.</span>
              </div>
              <div className="fg">
                <label>Net Income ($)</label>
                <input type="number" inputMode="numeric" value={p.netIncome} onChange={e=>setP(v=>({...v,netIncome:e.target.value}))} placeholder="145000"/>
              </div>
              <div className="fg full">
                <label>Biggest Pain Points</label>
                <textarea value={p.painPoints} onChange={e=>setP(v=>({...v,painPoints:e.target.value}))} placeholder="Chasing invoices, no-shows, slow seasons..."/>
              </div>
            </div>

            {!isPremium && submitted && (
              <div style={{background:'#141414',border:'1px solid #2a2a1a',borderRadius:'3px',padding:'.85rem 1rem',marginTop:'1rem',display:'flex',justifyContent:'space-between',alignItems:'center',gap:'1rem',flexWrap:'wrap'}}>
                <div>
                  <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:'.65rem',fontWeight:700,letterSpacing:'.16em',textTransform:'uppercase',color:'#f5a623',marginBottom:'.2rem'}}>Upgrade to Premium</div>
                  <div style={{fontSize:'.8rem',color:'#666'}}>Unlock Opportunities, Goals, and SMS reminders. $9.98/month.</div>
                  {checkoutError && <div style={{fontSize:'.75rem',color:'#e05252',marginTop:'.3rem'}}>{checkoutError}</div>}
                </div>
                <button className="btn bp" style={{width:'auto',whiteSpace:'nowrap'}} onClick={handleUpgrade} disabled={checkoutLoading}>{checkoutLoading ? 'Redirecting...' : 'Upgrade â $9.98/mo'}</button>
              </div>
            )}

            <div className="form-end" style={{gap:'.75rem',flexWrap:'wrap'}}>
              {submitted && (
                <button className="btn bg" onClick={saveProfile} disabled={saving}>
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              )}
              <button
                className="btn bp"
                onClick={submit}
                disabled={!p.bizName || !p.trade || !p.annualRev}
              >
                {submitted ? 'Re-analyze' : 'Save & Analyze'}
              </button>
            </div>
          </>}

          {/* ââ CANVAS TAB âââââââââââââââââââââââââââââââââââââââââââââââ */}
          {tab==="canvas" && <>
            <div className="stitle">Lean Canvas â {p.bizName}</div>
            {cLoading
              ? <div className="loader"><div className="lbar"/><div className="llbl">Building your canvas...</div></div>
              : <>
                  <div className="canvas">
                    {CELLS.map(c => {
                      const score = canvasScores[c.k];
                      return (
                        <div key={c.k} className="cc">
                          <div className="cc-top">
                            <div className="cc-lbl">{c.l}</div>
                            {score?.score != null && (
                              <button
                                className={`score-badge ${scoreClass(score.score)}`}
                                onClick={(e) => { e.stopPropagation(); handleScoreBadgeClick(e, c.k); }}
                                title={isPremium ? "View opportunity" : "Upgrade to see opportunity"}
                              >
                                {score.score}
                              </button>
                            )}
                          </div>
                          <textarea
                            className="cc-val"
                            value={canvas[c.k] || ''}
                            maxLength={400}
                            onChange={e => saveCanvasCell(c.k, e.target.value)}
                            placeholder="â"
                          />
                        </div>
                      );
                    })}
                  </div>
                </>
            }

            {/* Score tooltip for free users */}
            {scoreTooltip && (
              <div className="score-tip" style={{top: scoreTooltip.y, left: Math.min(scoreTooltip.x, window.innerWidth - 260)}}>
                <strong>Score {canvasScores[scoreTooltip.key]?.score}</strong>
                {canvasScores[scoreTooltip.key]?.preview && <span style={{color:'#aaa'}}>{canvasScores[scoreTooltip.key].preview}...</span>}
                <div style={{marginTop:'.35rem',color:'#f5a623',fontFamily:"'Barlow Condensed',sans-serif",fontSize:'.65rem',letterSpacing:'.1em',textTransform:'uppercase'}}>Upgrade to see full opportunity</div>
              </div>
            )}
          </>}

          {/* ââ OPPORTUNITIES TAB ââââââââââââââââââââââââââââââââââââââââ */}
          {tab==="opportunities" && <>
            {!isPremium
              ? <div className="blur-gate-wrap">
                  <div className="blur-gate-content">
                    {/* Placeholder cards that look real but are blurred */}
                    {[
                      {label:"Revenue Streams", cards:[
                        {title:"Introduce a recurring maintenance contract", impact:"High", insight:"Trades businesses with annual service agreements generate 30â40% more predictable revenue. A simple $299/yr inspection contract sold to your top 20 existing customers could add $6,000+ in guaranteed annual income with minimal extra labor."},
                        {title:"Add a premium response tier for urgent calls", impact:"Medium", insight:"Customers who need same-day service will pay a 20â40% premium without hesitation. Creating a 'Priority Response' offering for $150/call positions you above competitors and captures high-margin emergency revenue."},
                      ]},
                      {label:"Problem", cards:[
                        {title:"Address your highest-volume pain point first", impact:"High", insight:"Based on your inputs, your top pain point is costing you time and money every week. Solving even 50% of this friction could free up 5+ hours per week and improve your close rate on repeat business."},
                      ]},
                      {label:"Key Metrics", cards:[
                        {title:"Track job profitability by service type", impact:"Medium", insight:"Most trade business owners don't know which jobs actually make money after labor and materials. Tracking gross profit per job type for 30 days usually reveals one service that accounts for 60%+ of real profit."},
                      ]},
                    ].map((group) => (
                      <div key={group.label} className="opp-section">
                        <div className="opp-section-title">{group.label}</div>
                        {group.cards.map((opp, i) => (
                          <div key={i} className="opp-card">
                            <div className="opp-card-top">
                              <div className="opp-title">{opp.title}</div>
                              <div className={`opp-impact imp-${opp.impact[0]}`}>{opp.impact}</div>
                            </div>
                            <div className="opp-insight">{opp.insight}</div>
                            <button className="opp-cta">Make it a Goal</button>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                  <div className="blur-gate-overlay">
                    <div className="blur-gate-eyebrow">Premium Feature</div>
                    <div className="blur-gate-title">See What Matters<br/>For Your Business</div>
                    <div className="blur-gate-sub">AI-generated opportunities built from your actual canvas â showing exactly where 20% of effort drives 80% of results.</div>
                    <button className="btn bp" style={{width:'auto'}} onClick={handleUpgrade} disabled={checkoutLoading}>{checkoutLoading ? 'Redirecting...' : 'Upgrade â $9.98/mo'}</button>
                    {checkoutError && <div style={{fontSize:'.72rem',color:'#e05252'}}>{checkoutError}</div>}
                    <div className="blur-gate-price">Cancel anytime. Instant access.</div>
                  </div>
                </div>
              : oppLoading
                ? <div className="loader"><div className="lbar"/><div className="llbl">Generating opportunities...</div></div>
                : Object.keys(groupedOpps).length === 0
                  ? <div className="empty">
                      <p>No opportunities yet.</p>
                      <p style={{marginTop:'.5rem'}}>Go to the Input tab and hit "Save & Analyze" to generate your first set.</p>
                    </div>
                  : <>
                      {Object.entries(groupedOpps).map(([key, group]) => (
                        <div key={key} className="opp-section">
                          <div className="opp-section-title">{group.label}</div>
                          {group.cards.map(opp => (
                            <div key={opp.id} className="opp-card">
                              {migratedMsg[opp.id]
                                ? <div className="opp-migrated">This became a goal â check the Goals tab</div>
                                : <>
                                    <div className="opp-card-top">
                                      <div className="opp-title">{opp.title}</div>
                                      <div className={`opp-impact imp-${opp.impact_label?.[0]||'M'}`}>{opp.impact_label}</div>
                                    </div>
                                    <div className="opp-insight">{opp.insight}</div>
                                    <button className="opp-cta" onClick={() => migrateToGoal(opp)}>Make it a Goal</button>
                                  </>
                              }
                            </div>
                          ))}
                        </div>
                      ))}
                    </>
            }
          </>}

          {/* ââ GOALS TAB ââââââââââââââââââââââââââââââââââââââââââââââââ */}
          {tab==="goals" && <>
            {!isPremium
              ? <div className="blur-gate-wrap">
                  <div className="blur-gate-content">
                    {/* Placeholder goal cards that look real but are blurred */}
                    <div className="money-unlocked">
                      <span className="mu-label">Money Unlocked</span>
                      <span className="mu-value">$18,500</span>
                    </div>
                    {[
                      {title:"Introduce a recurring maintenance contract", status:"In Progress", value:9200, steps:[
                        {text:"Draft a simple 1-page service agreement template", time:"2 hours", done:true},
                        {text:"Identify your top 20 repeat customers to offer first", time:"1 hour", done:true},
                        {text:"Call or text each customer with the offer", time:"3 hours", done:false},
                        {text:"Set up auto-renewal reminders in your calendar", time:"30 min", done:false},
                      ]},
                      {title:"Track job profitability by service type", status:"Not Started", value:9300, steps:[
                        {text:"Create a simple spreadsheet with job type, revenue, material cost, and hours", time:"1 hour", done:false},
                        {text:"Log every job for 30 days", time:"ongoing", done:false},
                        {text:"Review results and identify your most profitable service", time:"1 hour", done:false},
                      ]},
                    ].map((goal, i) => (
                      <div key={i} className="goal-card">
                        <div className="goal-top">
                          <input className="goal-title-input" value={goal.title} readOnly/>
                        </div>
                        <div className="goal-meta">
                          <span className={`goal-status ${goal.status==='In Progress'?'gs-ip':'gs-ns'}`}>{goal.status}</span>
                          <div className="goal-value-wrap">
                            <span className="goal-value-label">Est. Value</span>
                            <span style={{color:'#4caf82',fontSize:'.8rem'}}>$</span>
                            <input className="goal-value-input" type="number" value={goal.value} readOnly/>
                            <span className="goal-value-label">/yr</span>
                          </div>
                        </div>
                        <div className="goal-steps">
                          {goal.steps.map((step, j) => (
                            <div key={j} className="step-row">
                              <button className={`step-check ${step.done?'done':''}`}>{step.done?'done':''}</button>
                              <input className="step-text-input" value={step.text} readOnly style={{textDecoration:step.done?'line-through':''}}/>
                              <span className="step-time">{step.time}</span>
                            </div>
                          ))}
                        </div>
                        <div className="sms-toggle-row">
                          <span className="sms-toggle-label">Daily SMS Reminder (8pm)</span>
                          <label className="toggle"><input type="checkbox" readOnly/><span className="toggle-slider"/></label>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="blur-gate-overlay">
                    <div className="blur-gate-eyebrow">Premium Feature</div>
                    <div className="blur-gate-title">Turn Insight<br/>Into Action</div>
                    <div className="blur-gate-sub">AI-generated step-by-step plans with time estimates and dollar values. Optional daily SMS reminders at 8pm to keep you moving.</div>
                    <button className="btn bp" style={{width:'auto'}} onClick={handleUpgrade} disabled={checkoutLoading}>{checkoutLoading ? 'Redirecting...' : 'Upgrade â $9.98/mo'}</button>
                    {checkoutError && <div style={{fontSize:'.72rem',color:'#e05252'}}>{checkoutError}</div>}
                    <div className="blur-gate-price">Cancel anytime. Instant access.</div>
                  </div>
                </div>
              : <>
                  {/* Money Unlocked */}
                  <div className="money-unlocked">
                    <span className="mu-label">Money Unlocked</span>
                    <span className="mu-value">${moneyUnlocked.toLocaleString()}</span>
                  </div>

                  {goals.length === 0
                    ? <div className="empty">
                        <p>No goals yet.</p>
                        <p style={{marginTop:'.5rem'}}>Go to the Opportunities tab and click "Make it a Goal" on any card.</p>
                      </div>
                    : <>
                        {/* Active goals first */}
                        {[...goals]
                          .sort((a,b) => {
                            if (a.status==='completed' && b.status!=='completed') return 1;
                            if (a.status!=='completed' && b.status==='completed') return -1;
                            return a.sort_order - b.sort_order;
                          })
                          .map(goal => {
                            const steps = goalSteps[goal.id] || [];
                            const statusLabel = goal.status==='completed' ? 'Completed'
                              : goal.status==='in_progress' ? 'In Progress'
                              : 'Not Started';
                            const statusClass = goal.status==='completed' ? 'gs-done'
                              : goal.status==='in_progress' ? 'gs-ip'
                              : 'gs-ns';
                            return (
                              <div key={goal.id} className={`goal-card ${goal.status==='completed'?'completed':''}`}>
                                <div className="goal-top">
                                  <input
                                    className={`goal-title-input ${goal.status==='completed'?'completed':''}`}
                                    value={goal.title}
                                    onChange={e => updateGoalField(goal.id, 'title', e.target.value)}
                                  />
                                </div>
                                <div className="goal-meta">
                                  <span className={`goal-status ${statusClass}`}>{statusLabel}</span>
                                  <div className="goal-value-wrap">
                                    <span className="goal-value-label">Est. Value</span>
                                    <span style={{color:'#4caf82',fontSize:'.8rem'}}>$</span>
                                    <input
                                      className="goal-value-input"
                                      type="number"
                                      value={goal.estimated_value || 0}
                                      onChange={e => updateGoalField(goal.id, 'estimated_value', parseFloat(e.target.value)||0)}
                                    />
                                    <span className="goal-value-label">/yr</span>
                                  </div>
                                </div>

                                {/* Steps */}
                                {steps.length > 0 && (
                                  <div className="goal-steps">
                                    {steps.map(step => (
                                      <div key={step.id} className="step-row">
                                        <button
                                          className={`step-check ${step.status==='done'?'done':step.status==='in_progress'?'ip':''}`}
                                          onClick={() => cycleStepStatus(goal.id, step.id, step.status)}
                                        >
                                          {step.status==='done' ? 'done' : step.status==='in_progress' ? '...' : ''}
                                        </button>
                                        <input
                                          className="step-text-input"
                                          value={step.step_text}
                                          onChange={e => updateStepText(goal.id, step.id, e.target.value)}
                                          style={{ textDecoration: step.status==='done'?'line-through':'' }}
                                        />
                                        {step.time_estimate && <span className="step-time">{step.time_estimate}</span>}
                                      </div>
                                    ))}
                                  </div>
                                )}

                                {/* SMS Toggle */}
                                <div className="sms-toggle-row">
                                  <span className="sms-toggle-label">Daily SMS Reminder (8pm)</span>
                                  <label className="toggle">
                                    <input
                                      type="checkbox"
                                      checked={!!goal.sms_enabled}
                                      onChange={() => toggleGoalSMS(goal.id, goal.sms_enabled)}
                                    />
                                    <span className="toggle-slider"/>
                                  </label>
                                </div>
                              </div>
                            );
                          })}
                      </>
                  }

                  {/* Cancel Premium */}
                  <div style={{marginTop:'2rem',paddingTop:'1rem',borderTop:'1px solid #1e1e1e',textAlign:'center'}}>
                    <button
                      className="btn bg"
                      style={{fontSize:'.65rem',padding:'.4rem 1rem',color:'#555'}}
                      onClick={handleManageBilling}
                      disabled={billingLoading}
                    >
                      {billingLoading ? 'Opening...' : 'Manage Subscription'}
                    </button>
                  </div>
                </>
            }
          </>}

        </div>{/* end .pg */}

        {/* ââ CUSTOMER SERVICE BUBBLE ââââââââââââââââââââââââââââââââââââ */}
        <div className="cs-bubble">
          {csOpen && (
            <div className="cs-panel">
              <div className="cs-header">
                <span className="cs-title">TradeStack Support</span>
                <button className="cs-close" onClick={() => setCsOpen(false)}>close</button>
              </div>
              <div className="cs-messages">
                {csMessages.length === 0 && (
                  <div className="cs-msg assistant">Hi, how can I help you use TradeStack today?</div>
                )}
                {csMessages.map((m, i) => (
                  <div key={i} className={`cs-msg ${m.role}`}>{m.content}</div>
                ))}
                {csLoading && <div className="cs-msg assistant" style={{color:'#555'}}>...</div>}
                <div ref={csEndRef}/>
              </div>
              <div className="cs-input-row">
                <input
                  className="cs-input"
                  value={csInput}
                  onChange={e => setCsInput(e.target.value)}
                  onKeyDown={e => e.key==='Enter' && sendCS()}
                  placeholder="Ask a question..."
                  disabled={csLoading}
                />
                <button className="cs-send" onClick={sendCS} disabled={csLoading||!csInput.trim()}>Send</button>
              </div>
            </div>
          )}
          <button className="cs-btn" onClick={() => setCsOpen(v => !v)}>
            {csOpen ? 'close' : 'help'}
          </button>
        </div>

      </div>
    </>
  );
}
