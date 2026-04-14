import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from './supabaseClient';
import LandingPage from './components/LandingPage';
import { DEMO_PROFILE, DEMO_CANVAS, DEMO_SCORES, DEMO_OPPORTUNITIES, DEMO_GOAL, DEMO_GOAL_STEPS } from './demoData';



// -- HELPERS ----------------------------------------------------------------
function jp(text) {
  try { return JSON.parse(text.replace(/```json\n?|```\n?/g,"").trim()); }
  catch { return null; }
}

async function callEdge(fn, body, session) {
  const res = await fetch(
    `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/${fn}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session?.access_token || ''}`,
        'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
      },
      body: JSON.stringify(body),
    }
  );
  let json;
  try { json = await res.json(); } catch { json = {}; }
  if (!res.ok) throw new Error(json.error || `Edge function error (${res.status})`);
  return json;
}

// -- CANVAS CELL DEFINITIONS ------------------------------------------------
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

// -- STYLES -----------------------------------------------------------------
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@600;700;800&family=Barlow:wght@300;400;500&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
html{-webkit-text-size-adjust:100%;}
body{background:#0e0e0e;}
*{scrollbar-width:none;-ms-overflow-style:none;}
*::-webkit-scrollbar{display:none;}
.app{min-height:100vh;background:#0e0e0e;color:#e8e0d4;font-family:'Barlow',sans-serif;font-weight:300;}

/* HEADER */
.hdr{background:#141414;border-bottom:2px solid #f5a623;padding:0 1rem;display:flex;align-items:center;justify-content:space-between;height:52px;position:sticky;top:0;z-index:100;}
.hdr-tagline{font-family:'Barlow Condensed',sans-serif;font-weight:700;font-size:clamp(.6rem,2.5vw,1.2rem);letter-spacing:.06em;text-transform:uppercase;color:#e8e0d4;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;text-align:right;}
.hdr-tagline .ai{color:#f5a623;}
.logo{font-family:'Barlow Condensed',sans-serif;font-weight:800;font-size:1.5rem;letter-spacing:.08em;text-transform:uppercase;color:#f5a623;white-space:nowrap;flex-shrink:0;}
.logo span{color:#e8e0d4;}
.biz-tag{font-family:'Barlow Condensed',sans-serif;font-size:.8rem;font-weight:600;letter-spacing:.1em;text-transform:uppercase;color:#666;max-width:150px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
.hdr-right{display:flex;align-items:center;gap:.5rem;}
.premium-badge{font-family:'Barlow Condensed',sans-serif;font-size:.72rem;font-weight:700;letter-spacing:.12em;text-transform:uppercase;background:#f5a623;color:#0e0e0e;padding:.18rem .5rem;border-radius:2px;}

/* TABS */
.tabs{display:flex;background:#111;border-bottom:1px solid #222;overflow-x:auto;-webkit-overflow-scrolling:touch;scrollbar-width:none;}
.tabs::-webkit-scrollbar{display:none;}
.tab{padding:.8rem 1rem;font-family:'Barlow Condensed',sans-serif;font-weight:600;font-size:.82rem;letter-spacing:.12em;text-transform:uppercase;color:#555;cursor:pointer;border:none;border-bottom:3px solid transparent;background:none;white-space:nowrap;flex-shrink:0;margin-bottom:-1px;transition:color .15s,border-color .15s;-webkit-tap-highlight-color:transparent;}
.tab:hover{color:#aaa;}
.tab.on{color:#f5a623;border-bottom-color:#f5a623;}
.tab:disabled{opacity:.3;cursor:not-allowed;}
.tab-lock{font-size:.65rem;margin-left:.25rem;opacity:.5;}

/* PAGE */
.pg{padding:1rem;padding-bottom:5rem;}
@media(min-width:768px){.pg{padding:1.5rem 2rem;padding-bottom:5rem;}}

/* GRID */
.g2{display:grid;grid-template-columns:1fr;gap:.9rem;}
.g3{display:grid;grid-template-columns:1fr;gap:.75rem;}
.full{grid-column:1/-1;}
@media(min-width:540px){.g2{grid-template-columns:1fr 1fr;gap:1.1rem;}.g3{grid-template-columns:repeat(3,1fr);}}

/* SECTION TITLE */
.stitle{font-family:'Barlow Condensed',sans-serif;font-weight:800;font-size:1.15rem;letter-spacing:.1em;text-transform:uppercase;color:#e8e0d4;margin-bottom:.9rem;display:flex;align-items:center;gap:.6rem;}
.stitle::after{content:'';flex:1;height:1px;background:#222;}
.divider{height:1px;background:#1e1e1e;margin:1.1rem 0;}

/* FORM */
.fg{display:flex;flex-direction:column;gap:.3rem;}
label{font-family:'Barlow Condensed',sans-serif;font-size:.78rem;font-weight:700;letter-spacing:.16em;text-transform:uppercase;color:#888;}
input,select,textarea{background:#1a1a1a;border:1px solid #2a2a2a;color:#e8e0d4;padding:.7rem .85rem;font-family:'Barlow',sans-serif;font-size:1.05rem;font-weight:400;outline:none;border-radius:3px;width:100%;-webkit-appearance:none;appearance:none;transition:border-color .15s;}
input:focus,select:focus,textarea:focus{border-color:#f5a623;}
textarea{resize:vertical;min-height:80px;}
.btn{font-family:'Barlow Condensed',sans-serif;font-weight:700;font-size:.92rem;letter-spacing:.14em;text-transform:uppercase;padding:.8rem 1.5rem;border:none;cursor:pointer;border-radius:3px;touch-action:manipulation;transition:all .15s;-webkit-tap-highlight-color:transparent;}
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
.cc-lbl{font-family:'Barlow Condensed',sans-serif;font-size:.75rem;font-weight:700;letter-spacing:.18em;text-transform:uppercase;color:#f5a623;}
.cc-val{font-size:.95rem;line-height:1.55;color:#ccc;white-space:pre-wrap;flex:1;outline:none;background:transparent;border:none;border-bottom:1px solid transparent;width:100%;resize:none;font-family:'Barlow',sans-serif;font-weight:300;transition:border-color .15s;min-height:60px;}
.cc-val:focus{border-bottom-color:#f5a623;}
.cc-preview{font-family:'Barlow Condensed',sans-serif;font-size:.68rem;font-weight:600;letter-spacing:.1em;text-transform:uppercase;color:#555;margin-bottom:.15rem;}

/* SCORE BADGE */
.score-badge{font-family:'Barlow Condensed',sans-serif;font-size:.78rem;font-weight:700;letter-spacing:.06em;padding:.15rem .38rem;border-radius:2px;cursor:pointer;white-space:nowrap;flex-shrink:0;border:none;transition:all .15s;}
.score-hi{background:#1a3a2a;color:#4caf82;}
.score-md{background:#3a2f1a;color:#f5a623;}
.score-lo{background:#3a1a1a;color:#e05252;}
.score-none{background:#222;color:#555;}

/* SCORE TOOLTIP */
.score-tip{position:fixed;background:#1a1a1a;border:1px solid #333;padding:.65rem .85rem;border-radius:3px;font-size:.88rem;line-height:1.5;color:#ccc;max-width:240px;z-index:200;pointer-events:none;}
.score-tip strong{color:#f5a623;font-family:'Barlow Condensed',sans-serif;font-size:.75rem;letter-spacing:.1em;text-transform:uppercase;display:block;margin-bottom:.2rem;}

/* FIN CARDS */
.fc{background:#141414;border:1px solid #222;padding:.9rem;border-radius:3px;}
.fc-lbl{font-family:'Barlow Condensed',sans-serif;font-size:.75rem;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:#666;margin-bottom:.25rem;}
.fc-val{font-family:'Barlow Condensed',sans-serif;font-size:1.8rem;font-weight:700;line-height:1;}
.pos{color:#4caf82;}.neg{color:#e05252;}.neu{color:#e8e0d4;}
.fc-sub{font-size:.8rem;color:#555;margin-top:.2rem;}

/* LEGAL MODAL */
.legal-overlay{position:fixed;inset:0;background:rgba(0,0,0,.88);z-index:500;display:flex;align-items:center;justify-content:center;padding:1rem;}
.legal-modal{background:#141414;border:1px solid #2a2a2a;border-top:3px solid #f5a623;border-radius:3px;max-width:560px;width:100%;max-height:88vh;display:flex;flex-direction:column;}
.legal-modal-hd{padding:1.1rem 1.5rem .8rem;border-bottom:1px solid #1e1e1e;flex-shrink:0;}
.legal-modal-title{font-family:'Barlow Condensed',sans-serif;font-weight:800;font-size:1.1rem;letter-spacing:.1em;text-transform:uppercase;color:#f5a623;}
.legal-modal-body{padding:1rem 1.5rem;overflow-y:auto;flex:1;}
.legal-modal-body h3{font-family:'Barlow Condensed',sans-serif;font-weight:700;font-size:.72rem;letter-spacing:.16em;text-transform:uppercase;color:#888;margin:1rem 0 .3rem;}
.legal-modal-body h3:first-child{margin-top:0;}
.legal-modal-body p{font-size:.88rem;color:#666;line-height:1.65;}
.legal-modal-ft{padding:.75rem 1.5rem 1.1rem;border-top:1px solid #1e1e1e;display:flex;flex-direction:column;gap:.5rem;flex-shrink:0;}

/* AI DISCLAIMER BANNER */
.ai-disclaimer{text-align:center;padding:.4rem 1rem;background:#111;border-bottom:1px solid #1a1a1a;font-family:'Barlow Condensed',sans-serif;font-size:.62rem;font-weight:600;letter-spacing:.11em;text-transform:uppercase;color:#555;}

/* LEGAL FOOTER LINK */
.legal-pg-link{display:block;text-align:center;padding:2.5rem 0 .25rem;font-family:'Barlow Condensed',sans-serif;font-size:.62rem;font-weight:600;letter-spacing:.12em;text-transform:uppercase;color:#444;background:none;border:none;cursor:pointer;width:100%;}
.legal-pg-link:hover{color:#888;}

/* LOADING */
.loader{display:flex;flex-direction:column;align-items:center;justify-content:center;padding:3rem 1rem;gap:.65rem;color:#555;}
.lbar{width:140px;height:2px;background:#222;position:relative;overflow:hidden;}
.lbar::after{content:'';position:absolute;left:-50%;width:50%;height:100%;background:#f5a623;animation:lslide 1.2s infinite;}
@keyframes lslide{from{left:-50%;}to{left:100%;}}
.llbl{font-family:'Barlow Condensed',sans-serif;font-size:.78rem;font-weight:700;letter-spacing:.18em;text-transform:uppercase;}
.empty{text-align:center;padding:2.5rem 1rem;color:#444;font-size:1rem;line-height:1.6;}
.regen{display:flex;justify-content:flex-end;margin-top:.65rem;}

/* OPPORTUNITY CARDS */
.opp-section{margin-bottom:1.5rem;}
.opp-section-title{font-family:'Barlow Condensed',sans-serif;font-size:.78rem;font-weight:700;letter-spacing:.16em;text-transform:uppercase;color:#555;margin-bottom:.5rem;}
.opp-card{background:#141414;border:1px solid #222;border-radius:3px;padding:.95rem;margin-bottom:.5rem;transition:border-color .15s;}
.opp-card:hover{border-color:#333;}
.opp-card-top{display:flex;justify-content:space-between;align-items:flex-start;gap:.5rem;margin-bottom:.5rem;}
.opp-title{font-family:'Barlow Condensed',sans-serif;font-weight:700;font-size:1.05rem;color:#e8e0d4;line-height:1.2;}
.opp-impact{font-family:'Barlow Condensed',sans-serif;font-size:.7rem;font-weight:700;letter-spacing:.1em;text-transform:uppercase;padding:.15rem .4rem;border-radius:2px;flex-shrink:0;}
.imp-H{background:#1a3a2a;color:#4caf82;}.imp-M{background:#3a2f1a;color:#f5a623;}.imp-L{background:#222;color:#666;}
.opp-insight{font-size:.92rem;line-height:1.55;color:#999;margin-bottom:.75rem;}
.opp-cta{font-family:'Barlow Condensed',sans-serif;font-weight:700;font-size:.82rem;letter-spacing:.1em;text-transform:uppercase;background:transparent;border:1px solid #f5a623;color:#f5a623;padding:.5rem 1rem;border-radius:3px;cursor:pointer;transition:all .15s;}
.opp-cta:hover{background:#f5a623;color:#0e0e0e;}
.opp-migrated{text-align:center;padding:.65rem;color:#4caf82;font-family:'Barlow Condensed',sans-serif;font-size:.85rem;font-weight:700;letter-spacing:.1em;text-transform:uppercase;border:1px solid #1a3a2a;background:#0e1e16;border-radius:3px;animation:fadein .3s ease;}
@keyframes fadein{from{opacity:0;}to{opacity:1;}}

/* GOALS */
.money-unlocked{background:#141414;border:1px solid #1a3a2a;border-radius:3px;padding:.85rem 1rem;margin-bottom:1.25rem;display:flex;justify-content:space-between;align-items:center;}
.mu-label{font-family:'Barlow Condensed',sans-serif;font-size:.78rem;font-weight:700;letter-spacing:.16em;text-transform:uppercase;color:#4caf82;}
.mu-value{font-family:'Barlow Condensed',sans-serif;font-size:1.7rem;font-weight:700;color:#4caf82;}
.days-hint{font-family:'Barlow',sans-serif;font-size:.75rem;font-weight:300;color:#444;margin-bottom:1rem;line-height:1.4;}
.goal-card{background:#141414;border:1px solid #222;border-radius:3px;padding:.95rem;margin-bottom:.75rem;transition:opacity .3s;}
.goal-card.completed{opacity:.45;}
.goal-top{display:flex;justify-content:space-between;align-items:flex-start;gap:.5rem;margin-bottom:.65rem;}
.goal-title-input{font-family:'Barlow Condensed',sans-serif;font-weight:700;font-size:1.1rem;color:#e8e0d4;background:transparent;border:none;border-bottom:1px solid transparent;outline:none;width:100%;transition:border-color .15s;}
.goal-title-input:focus{border-bottom-color:#f5a623;}
.goal-title-input.completed{text-decoration:line-through;color:#555;}
.goal-meta{display:flex;align-items:center;gap:.6rem;flex-wrap:wrap;margin-bottom:.75rem;}
.goal-status{font-family:'Barlow Condensed',sans-serif;font-size:.72rem;font-weight:700;letter-spacing:.1em;text-transform:uppercase;padding:.15rem .4rem;border-radius:2px;}
.gs-ns{background:#222;color:#666;}.gs-ip{background:#2a2a1a;color:#f5a623;}.gs-done{background:#1a3a2a;color:#4caf82;}
.goal-value-wrap{display:flex;align-items:center;gap:.3rem;}
.goal-value-label{font-family:'Barlow Condensed',sans-serif;font-size:.72rem;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:#555;}
.goal-value-input{font-family:'Barlow Condensed',sans-serif;font-size:.92rem;font-weight:700;color:#4caf82;background:transparent;border:none;border-bottom:1px solid transparent;outline:none;width:80px;transition:border-color .15s;}
.goal-value-input:focus{border-bottom-color:#4caf82;}
.goal-steps{border-top:1px solid #1e1e1e;padding-top:.65rem;margin-top:.3rem;}
.step-row{display:flex;align-items:flex-start;gap:.5rem;margin-bottom:.5rem;}
.step-check{width:20px;height:20px;min-width:20px;border:1px solid #333;border-radius:2px;background:transparent;cursor:pointer;display:flex;align-items:center;justify-content:center;margin-top:.1rem;transition:all .15s;font-size:.8rem;color:#4caf82;}
.step-check.done{border-color:#4caf82;background:#0e1e16;}
.step-check.ip{border-color:#f5a623;}
.step-text-input{flex:1;background:transparent;border:none;border-bottom:1px solid transparent;outline:none;color:#ccc;font-family:'Barlow',sans-serif;font-size:.95rem;font-weight:300;transition:border-color .15s;padding-bottom:.1rem;}
.step-text-input:focus{border-bottom-color:#333;}
.step-time{font-family:'Barlow Condensed',sans-serif;font-size:.72rem;color:#444;letter-spacing:.06em;white-space:nowrap;}
.step-days-input{width:3.2rem;background:transparent;border:none;border-bottom:1px solid #333;outline:none;color:#666;font-family:'Barlow Condensed',sans-serif;font-size:.78rem;text-align:center;padding-bottom:.1rem;}
.step-days-input:focus{border-bottom-color:#f5a623;color:#ccc;}
.step-days-input::placeholder{color:#444;}
.sms-toggle-row{display:flex;align-items:center;justify-content:space-between;border-top:1px solid #1e1e1e;padding-top:.65rem;margin-top:.5rem;}
.sms-toggle-label{font-family:'Barlow Condensed',sans-serif;font-size:.78rem;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:#555;}
.toggle{position:relative;display:inline-block;width:36px;height:20px;}
.toggle input{opacity:0;width:0;height:0;}
.toggle-slider{position:absolute;cursor:pointer;inset:0;background:#222;border-radius:20px;transition:.2s;}
.toggle-slider:before{content:'';position:absolute;width:14px;height:14px;left:3px;bottom:3px;background:#555;border-radius:50%;transition:.2s;}
.toggle input:checked + .toggle-slider{background:#f5a623;}
.toggle input:checked + .toggle-slider:before{transform:translateX(16px);background:#0e0e0e;}

/* PREMIUM GATE */
.premium-gate{background:#141414;border:1px solid #2a2a1a;border-radius:3px;padding:2rem 1.5rem;text-align:center;margin-top:1rem;}
.pg-eyebrow{font-family:'Barlow Condensed',sans-serif;font-size:.75rem;font-weight:700;letter-spacing:.2em;text-transform:uppercase;color:#f5a623;margin-bottom:.6rem;}
.pg-title{font-family:'Barlow Condensed',sans-serif;font-weight:800;font-size:1.6rem;letter-spacing:.04em;text-transform:uppercase;color:#e8e0d4;margin-bottom:.5rem;}
.pg-sub{font-size:.95rem;color:#777;line-height:1.6;max-width:340px;margin:0 auto 1.25rem;}
.pg-price{font-family:'Barlow Condensed',sans-serif;font-size:.88rem;color:#555;margin-top:.5rem;}

/* BLUR GATE (free-user preview) */
.blur-gate-wrap{position:relative;overflow:hidden;border-radius:3px;}
.blur-gate-content{filter:blur(7px) brightness(.7);pointer-events:none;user-select:none;min-height:320px;}
.blur-gate-overlay{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:.9rem;background:rgba(14,14,14,.45);padding:1.5rem;text-align:center;}
.blur-gate-eyebrow{font-family:'Barlow Condensed',sans-serif;font-size:.75rem;font-weight:700;letter-spacing:.22em;text-transform:uppercase;color:#f5a623;}
.blur-gate-title{font-family:'Barlow Condensed',sans-serif;font-weight:800;font-size:1.4rem;letter-spacing:.04em;text-transform:uppercase;color:#e8e0d4;line-height:1.15;}
.blur-gate-sub{font-size:.92rem;color:#aaa;line-height:1.55;max-width:300px;}
.blur-gate-price{font-family:'Barlow Condensed',sans-serif;font-size:.82rem;color:#555;}

/* CONTACT SUPPORT BUBBLE */
.cs-bubble{position:fixed;bottom:1.25rem;right:1.25rem;z-index:300;}
.cs-btn{width:48px;height:48px;background:#f5a623;border:none;border-radius:50%;cursor:pointer;display:flex;align-items:center;justify-content:center;font-family:'Barlow Condensed',sans-serif;font-weight:800;font-size:.85rem;letter-spacing:.06em;color:#0e0e0e;box-shadow:0 2px 12px rgba(0,0,0,.4);transition:all .15s;}
.cs-btn:hover{background:#ffc04a;transform:scale(1.05);}
.cs-panel{position:fixed;bottom:4.5rem;right:1.25rem;width:300px;max-width:calc(100vw - 2.5rem);background:#141414;border:1px solid #2a2a2a;border-radius:3px;display:flex;flex-direction:column;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.5);z-index:300;}
.cs-header{background:#111;padding:.65rem .85rem;border-bottom:1px solid #1e1e1e;display:flex;justify-content:space-between;align-items:center;}
.cs-title{font-family:'Barlow Condensed',sans-serif;font-size:.85rem;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:#e8e0d4;}
.cs-close{background:transparent;border:none;color:#555;cursor:pointer;font-size:1rem;line-height:1;padding:0;}
.cs-form{padding:.75rem .85rem;display:flex;flex-direction:column;gap:.6rem;}
.cs-field{background:#1a1a1a;border:1px solid #2a2a2a;border-radius:3px;padding:.55rem .7rem;font-family:'Barlow',sans-serif;font-size:.92rem;color:#e8e0d4;outline:none;width:100%;box-sizing:border-box;}
.cs-field:focus{border-color:#f5a623;}
.cs-field::placeholder{color:#555;}
.cs-textarea{resize:vertical;min-height:80px;line-height:1.5;}
.cs-submit{background:#f5a623;border:none;border-radius:3px;padding:.55rem;cursor:pointer;font-family:'Barlow Condensed',sans-serif;font-size:.85rem;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:#0e0e0e;transition:background .15s;}
.cs-submit:hover{background:#ffc04a;}
.cs-submit:disabled{background:#333;color:#555;cursor:not-allowed;}

/* MISC */
.save-indicator{font-family:'Barlow Condensed',sans-serif;font-size:.72rem;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:#4caf82;animation:fadein .3s ease;}
.err{font-size:.88rem;color:#e05252;margin-top:.3rem;}
`;

// -- MAIN APP ---------------------------------------------------------------
export default function App() {

  // -- AUTH ----------------------------------------------------------------
  const [session,      setSession]      = useState(null);
  const [authLoading,  setAuthLoading]  = useState(true);

  // -- PREMIUM -------------------------------------------------------------
  const [isPremium,    setIsPremium]    = useState(false);

  // -- NAV -----------------------------------------------------------------
  const [tab,          setTab]          = useState("input");

  // -- BUSINESS PROFILE ----------------------------------------------------
  const [p, setP] = useState({
    bizName:"", trade:"", location:"", yearsOp:"", employees:"",
    annualRev:"", cogs:"", opEx:"", netIncome:"",
    topService:"", painPoints:"",
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "America/New_York"
  });
  const [submitted,    setSubmitted]    = useState(false);
  const [fullySubmitted, setFullySubmitted] = useState(false);
  const [saving,       setSaving]       = useState(false);
  const [autoSaved,    setAutoSaved]    = useState(false);
  const [saveError,    setSaveError]    = useState(null);
  const profileLoaded  = useRef(false);
  const canvasEdited   = useRef(false);  // true only when user manually edits a canvas cell
  const justMigrated   = useRef(null);   // canvas_cell key of the opp just migrated
  const [regeneratingOpp, setRegeneratingOpp] = useState(null);
  const [enrichingGoals, setEnrichingGoals] = useState(new Set()); // goal IDs being enriched by AI // opp id being regenerated

  // -- CANVAS --------------------------------------------------------------
  const [canvas,       setCanvas]       = useState({});
  const [canvasScores, setCanvasScores] = useState({});
  const [cLoading,     setCLoading]     = useState(false);
  const [scoreLoading, setScoreLoading] = useState(false);
  const [scoreTooltip, setScoreTooltip] = useState(null); // {key, x, y}

  // -- OPPORTUNITIES --------------------------------------------------------
  const [opps,         setOpps]         = useState([]);
  const [oppLoading,   setOppLoading]   = useState(false);
  const [oppLoading2,   setOppLoading2]   = useState(false);
  const [migratedMsg,  setMigratedMsg]  = useState({}); // {oppId: true}

  // -- GOALS ----------------------------------------------------------------
  const [goals,        setGoals]        = useState([]);
  const [goalSteps,    setGoalSteps]    = useState({}); // {goalId: [steps]}

  // -- CONTACT SUPPORT ------------------------------------------------------
  const [csOpen,       setCsOpen]       = useState(false);
  const [csSubject,    setCsSubject]    = useState("");
  const [csBody,       setCsBody]       = useState("");
  const [csSending,    setCsSending]    = useState(false);
  const [csSent,       setCsSent]       = useState(false);

  // -- STRIPE CHECKOUT ------------------------------------------------------
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutError,   setCheckoutError]   = useState(null);
  const [pendingUpgrade,  setPendingUpgrade]  = useState(false);
  const [legalAcknowledged, setLegalAcknowledged] = useState(false);
  const [showLegalModal,    setShowLegalModal]    = useState(false); // false | 'upgrade' | 'view'

  const startCheckout = async () => {
    setCheckoutLoading(true);
    setCheckoutError(null);
    try {
      sessionStorage.setItem('ts_pre_checkout_tab', tab);
      const data = await callEdge('create-checkout', {}, session);
      if (data?.url) { window.location.href = data.url; return; }
      if (data?.error === 'Already subscribed') {
        setIsPremium(true);
        setCheckoutError('You already have an active subscription! Refreshing...');
        setCheckoutLoading(false);
        return;
      }
      setCheckoutError(data?.error || 'Could not start checkout. Please try again.');
    } catch(e) {
      console.error('Checkout error:', e);
      setCheckoutError(e.message || 'Could not connect to payment service. Please try again.');
    }
    setCheckoutLoading(false);
  };

  const handleUpgrade = async () => {
    if (isPremium) { setCheckoutError('You already have an active Premium subscription.'); return; }
    if (!legalAcknowledged) { setShowLegalModal('upgrade'); return; }
    await startCheckout();
  };

  const acceptLegal = async () => {
    const { error } = await supabase.from('businesses')
      .update({ legal_acknowledged_at: new Date().toISOString() })
      .eq('user_id', session.user.id);
    if (!error) setLegalAcknowledged(true);
    setShowLegalModal(false);
    await startCheckout();
  };

  // -- CHECKOUT RETURN: poll for subscription activation ------------------
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

  // (auto-switch removed -- input tab is always accessible)

  // -- MANAGE BILLING (Stripe portal) ------------------------------------
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

  // -- COMPUTED -------------------------------------------------------------
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

  // -- AUTH LISTENER --------------------------------------------------------
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

  // -- LOAD ALL USER DATA ON LOGIN ------------------------------------------
  useEffect(() => {
    if (!session) return;
    (async () => {
      await loadProfile();
      await loadSubscription();
      await loadCanvas();
      loadOpportunities();
      loadGoals();
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
        painPoints:  data.pain_points || "",
        timezone:    data.timezone    || Intl.DateTimeFormat().resolvedOptions().timeZone,
      });
      setSubmitted(true);
      // Returning user: unlock tabs if their profile + canvas is already complete
      const profileComplete = !!(data.biz_name && data.trade && data.annual_rev);
      if (profileComplete) setFullySubmitted(true);
      if (data.legal_acknowledged_at) setLegalAcknowledged(true);
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
      setSubmitted(true);
      setFullySubmitted(true);
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


  // -- AUTH ACTIONS ---------------------------------------------------------
  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin, queryParams: { prompt: 'select_account' } }
    });
    if (error) console.error('Login error:', error.message);
  };

  const signOut = async () => {
    await supabase.auth.signOut({ scope: 'global' });
    profileLoaded.current = false;
    setSession(null);
    setP({ bizName:"",trade:"",location:"",yearsOp:"",employees:"",
           annualRev:"",cogs:"",opEx:"",netIncome:"",topService:"",
           painPoints:"",
           timezone: Intl.DateTimeFormat().resolvedOptions().timeZone });
    setSubmitted(false); setFullySubmitted(false); setCanvas({}); setCanvasScores({});
    setOpps([]); setGoals([]); setGoalSteps({});
    setCsSubject(""); setCsBody(""); setCsSent(false); setTab("input"); setIsPremium(false);
  };

  // -- SAVE PROFILE ---------------------------------------------------------
  const saveProfile = useCallback(async () => {
    if (!session) return false;
    setSaving(true);
    const { error } = await supabase.from('businesses').upsert({
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
      pain_points:  p.painPoints,
      timezone:     p.timezone,
      updated_at:   new Date().toISOString(),
    }, { onConflict: 'user_id' });
    setSaving(false);
    if (error) { console.error('saveProfile upsert failed:', JSON.stringify(error)); setSaveError(error.message || JSON.stringify(error)); return false; }
    setSaveError(null);
    return true;
  }, [session, p]);

  // -- AUTO-SAVE PROFILE (debounced) -----------------------------------------
  useEffect(() => {
    if (!session) return;
    // Skip the initial load from DB
    if (!profileLoaded.current) { profileLoaded.current = true; return; }
    // Don't auto-save if nothing meaningful is entered
    if (!p.bizName && !p.trade && !p.annualRev) return;
    const timer = setTimeout(async () => {
      const ok = await saveProfile();
      if (ok) { setAutoSaved(true); setTimeout(() => setAutoSaved(false), 2000); }
    }, 1500);
    return () => clearTimeout(timer);
  }, [session, p, saveProfile]);

  // -- AUTO-REGEN OPPORTUNITIES + SCORES (debounced 8s after canvas EDIT) --------
  // ONLY fires when user manually edits a canvas cell, NOT on page load or tab switch.
  useEffect(() => {
    if (!session || !submitted) return;
    if (!canvasEdited.current) return; // Skip unless user actually edited canvas
    const hasContent = CELLS.some(c => canvas[c.k]);
    if (!hasContent) return;
    const timer = setTimeout(() => {
      canvasEdited.current = false;
      genOpportunities(canvas);
    }, 8000);
    return () => {
      clearTimeout(timer);
      // Do NOT reset canvasEdited here - let it persist so the next effect run picks it up
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canvas, session, submitted]);

  // -- SAFETY NET: generate opportunities for FIRST-TIME users only -------------
  // Only fires once ever: user has zero opps, zero goals, and has canvas content.
  // After first generation, this never fires again.
  useEffect(() => {
    if (tab !== 'opportunities' && tab !== 'goals') return;
    if (!session || !submitted) return;
    if (oppLoading) return;
    if (opps.length > 0) return;
    if (goals.length > 0) return; // User migrated before - not a new user
    const hasContent = CELLS.some(c => canvas[c.k]);
    if (!hasContent) return;
    genOpportunities(canvas);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, session, submitted, oppLoading, opps.length, goals.length]);


  // -- CONTEXT STRING FOR AI -------------------------------------------------
  const ctx = () => `Business:${IS_DEMO ? p.bizName : p.bizName}
Trade:${p.trade}
Location:${p.location}
Years:${p.yearsOp}
Employees:${p.employees}
Revenue:$${p.annualRev}
COGS:$${p.cogs}
OpEx:$${p.opEx}
NetIncome:$${p.netIncome}
TopService:${p.topService}
PainPoints:${p.painPoints}`;

  // -- GENERATE CANVAS -------------------------------------------------------
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
      // Generate opportunities first, then scores chain automatically
      genOpportunities(parsed);
    } catch(e) { console.error('Canvas error:', e); }
    setCLoading(false);
  };

  // -- GENERATE CANVAS SCORES ------------------------------------------------
  // Scores are derived from opportunities + input data. Never called independently.
  const genScores = async (canvasData, opportunities = []) => {
    setScoreLoading(true);
    try {
      const data = await callEdge('claude-proxy', {
        system: `You are a lean canvas analyst. Score each canvas cell 0-100 based on: (1) how many high-impact opportunities were generated from this cell, (2) how well the content aligns with the generated opportunities, (3) specificity and actionability. Return ONLY valid JSON: {"problem":{"score":75,"preview":"Cut labor costs"},...} -- one entry per cell key. The preview is 3-5 words describing the top opportunity linked to this cell.`,
        user: `Score this lean canvas:\n${JSON.stringify(canvasData)}\n\nBusiness context:\n${ctx()}\n\nGenerated opportunities:\n${JSON.stringify(opportunities)}`
      }, session);
      const parsed = jp(data?.text || '{}');
      if (!parsed) { setScoreLoading(false); return; }
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
    setScoreLoading(false);
  };

  // -- GENERATE OPPORTUNITIES ------------------------------------------------
  const genOpportunities = async (canvasData) => {
    setOppLoading(true);
    setOppLoading2(false);
    setCanvasScores({});
    const BATCH1 = ['problem','solution','uvp','unfair'];
    const BATCH2 = ['segments','metrics','channels','revenue','cost'];

    const buildRows = (parsed, allowed, offset) =>
      (Array.isArray(parsed) ? parsed : [])
        .filter(o => allowed.includes(o.canvas_cell))
        .map((opp, i) => ({
          user_id: session.user.id, canvas_cell: opp.canvas_cell,
          title: opp.title, insight: opp.insight,
          impact_label: opp.impact_label || 'Medium',
          migrated: false, sort_order: offset + i,
        }));

    const gapFill = async (inserted, cellKeys, offset) => {
      const counts = {};
      cellKeys.forEach(k => { counts[k] = 0; });
      inserted.forEach(o => { if (counts[o.canvas_cell] !== undefined) counts[o.canvas_cell]++; });
      const missing = cellKeys.filter(k => counts[k] < 2);
      if (missing.length === 0) return inserted;
      let all = [...inserted];
      const fills = await Promise.all(missing.map(async k => {
        const have = inserted.filter(o => o.canvas_cell === k);
        const needed = 2 - have.length;
        try {
          const fd = await callEdge('claude-proxy', {
            system: `Generate exactly ${needed} opportunity card(s) for the "${k}" canvas area showing how this business can make more money or stop wasting money there. Return ONLY valid JSON array: [{"canvas_cell":"${k}","title":"string","insight":"string","impact_label":"High"|"Medium"|"Low"}].`,
            user: `${ctx()}\n\nCanvas "${k}": ${canvasData[k] || ''}`
          }, session);
          const fp = jp(fd?.text || '[]');
          if (!Array.isArray(fp)) return [];
          const fr = fp.slice(0, needed).map((opp, i) => ({
            user_id: session.user.id, canvas_cell: k,
            title: opp.title, insight: opp.insight,
            impact_label: opp.impact_label || 'Medium',
            migrated: false, sort_order: offset + all.length + i,
          }));
          const { data: fi } = await supabase.from('opportunities').insert(fr).select();
          return fi || [];
        } catch(e) { return []; }
      }));
      fills.forEach(r => { all = [...all, ...r]; });
      return all;
    };

    try {
      await supabase.from('opportunities')
        .delete().eq('user_id', session.user.id).eq('migrated', false);

      // BATCH 1: problem, solution, uvp, unfair
      const b1data = await callEdge('claude-proxy', {
        system: `You are a revenue and efficiency consultant for small trades businesses. For EACH of these 4 canvas cells - problem, solution, uvp, unfair - generate exactly 2 opportunity cards. Every card must show how this owner can make more money or stop wasting money in that area. Use the canvas content and financial data. Reference actual numbers where possible. Return ONLY valid JSON array: [{"canvas_cell":"problem","title":"string","insight":"string (2-3 sentences, specific and actionable)","impact_label":"High"|"Medium"|"Low"}]. You MUST return exactly 2 cards for each of the 4 cells.`,
        user: `${ctx()}\n\nLean Canvas:\n${JSON.stringify(canvasData)}`
      }, session);
      const b1rows = buildRows(jp(b1data?.text || '[]'), BATCH1, 0);
      const { data: b1raw } = b1rows.length > 0
        ? await supabase.from('opportunities').insert(b1rows).select()
        : { data: [] };
      let b1opps = await gapFill(b1raw || [], BATCH1, 0);
      setOpps(b1opps);
      setOppLoading(false);
      setOppLoading2(true);
      genScores(canvasData, b1opps); // Partial scores for first 4 cells

      // BATCH 2: segments, metrics, channels, revenue, cost
      const b2data = await callEdge('claude-proxy', {
        system: `You are a revenue and efficiency consultant for small trades businesses. For EACH of these 5 canvas cells - segments, metrics, channels, revenue, cost - generate exactly 2 opportunity cards. Every card must show how this owner can make more money or stop wasting money in that area. Use the canvas content and financial data. Reference actual numbers where possible. Return ONLY valid JSON array: [{"canvas_cell":"segments","title":"string","insight":"string (2-3 sentences, specific and actionable)","impact_label":"High"|"Medium"|"Low"}]. You MUST return exactly 2 cards for each of the 5 cells.`,
        user: `${ctx()}\n\nLean Canvas:\n${JSON.stringify(canvasData)}`
      }, session);
      const b2rows = buildRows(jp(b2data?.text || '[]'), BATCH2, b1opps.length);
      const { data: b2raw } = b2rows.length > 0
        ? await supabase.from('opportunities').insert(b2rows).select()
        : { data: [] };
      let b2opps = await gapFill(b2raw || [], BATCH2, b1opps.length);
      const allOpps = [...b1opps, ...b2opps];
      setOpps(allOpps);
      setOppLoading2(false);
      genScores(canvasData, allOpps); // Final scores for all 9 cells

    } catch(e) {
      console.error('Opp error:', e);
      setOppLoading(false);
      setOppLoading2(false);
    }
    setOppLoading(false);
  };

  // -- REFILL OPPORTUNITIES FOR A SINGLE CELL (after migration) ---------------
  // Generates just enough (max 2) new opps to bring a cell back to 2.
  const refillCellOpps = async (cellKey, canvasData) => {
    const remaining = opps.filter(o => o.canvas_cell === cellKey && !o.migrated);
    const needed = 2 - remaining.length;
    if (needed <= 0) return;
    const existingTitles = remaining.map(o => o.title);
    try {
      const data = await callEdge('claude-proxy', {
        system: `You are a revenue and efficiency consultant for small trades businesses. Generate exactly ${needed} new opportunity card(s) for the "${cellKey}" canvas cell. Return ONLY valid JSON array: [{"canvas_cell":"${cellKey}","title":"string","insight":"string (2-3 sentences, specific and actionable)","impact_label":"High"|"Medium"|"Low"}]. Do NOT duplicate these existing opportunities: ${JSON.stringify(existingTitles)}. Be specific to the trade.`,
        user: `Generate ${needed} replacement opportunity card(s) for the "${cellKey}" cell:\n${ctx()}\n\nCanvas cell content: ${canvasData[cellKey] || ''}\n\nFull canvas:\n${JSON.stringify(canvasData)}`
      }, session);
      const parsed = jp(data?.text || '[]');
      if (!Array.isArray(parsed) || parsed.length === 0) return;
      const rows = parsed.slice(0, needed).map((opp, i) => ({
        user_id:      session.user.id,
        canvas_cell:  cellKey,
        title:        opp.title,
        insight:      opp.insight,
        impact_label: opp.impact_label || 'Medium',
        migrated:     false,
        sort_order:   opps.length + i,
      }));
      const { data: inserted } = await supabase.from('opportunities')
        .insert(rows).select();
      if (inserted) setOpps(prev => [...prev, ...inserted]);
    } catch(e) { console.error('Refill error:', e); }
  };

  // -- SUBMIT PROFILE --------------------------------------------------------
  const submit = async () => {
    setSubmitted(true);
    setFullySubmitted(true);
    setTab("canvas");
    await saveProfile();
    // Save canvas cells to Supabase
    const rows = CELLS.map(c => ({
      user_id:    session.user.id,
      cell_key:   c.k,
      content:    canvas[c.k] || '',
      updated_at: new Date().toISOString(),
    }));
    await supabase.from('canvas_cells').upsert(rows, { onConflict: 'user_id,cell_key' });
    // Generate opportunities first, then scores chain automatically
    genOpportunities(canvas);
  };

  // -- SAVE CANVAS CELL EDIT -------------------------------------------------
  const saveCanvasCell = useCallback(async (key, value) => {
    canvasEdited.current = true;
    setCanvas(prev => ({ ...prev, [key]: value }));
    await supabase.from('canvas_cells').upsert({
      user_id:    session.user.id,
      cell_key:   key,
      content:    value,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id,cell_key' });
  }, [session]);

  // -- MIGRATE OPPORTUNITY -> GOAL (non-blocking) --------------------------------
  const migrateToGoal = async (opp) => {
    if (migratedMsg[opp.id]) return; // Guard against double-click
    setMigratedMsg(prev => ({ ...prev, [opp.id]: true }));
    // Mark migrated in DB immediately
    await supabase.from('opportunities')
      .update({ migrated: true, migrated_at: new Date().toISOString() })
      .eq('id', opp.id);
    // Create goal right away with $0 placeholder - user sees instant feedback
    const { data: goal } = await supabase.from('goals').insert({
      user_id:          session.user.id,
      opportunity_id:   opp.id,
      title:            opp.title,
      estimated_value:  0,
      status:           'not_started',
      sms_enabled:      false,
      sort_order:       goals.length,
    }).select().single();
    if (goal) {
      setGoals(prev => [...prev, goal]);
      // Remove opp from local state after brief delay
      setTimeout(() => {
        const cellKey = opp.canvas_cell;
        setOpps(prev => {
          const updated = prev.filter(o => o.id !== opp.id);
          const cellRemaining = updated.filter(o => o.canvas_cell === cellKey && !o.migrated);
          if (cellRemaining.length < 2) {
            refillCellOpps(cellKey, canvas);
          }
          return updated;
        });
        setMigratedMsg(prev => { const n = {...prev}; delete n[opp.id]; return n; });
      }, 1500);
      setEnrichingGoals(prev => new Set([...prev, goal.id]));
      (async () => {
        try {
          const valData = await callEdge('claude-proxy', {
            system: `You are a financial analyst for small trades businesses. Estimate the annual dollar value of implementing this opportunity. Return ONLY valid JSON: {"estimated_annual_value": 5000, "reasoning": "one sentence"}`,
            user: `Opportunity: ${opp.title}\nInsight: ${opp.insight}\n\nBusiness context:\n${ctx()}`
          }, session);
          const parsed = jp(valData?.text || '{}');
          const estValue = parsed?.estimated_annual_value || 0;
          if (estValue > 0) {
            await supabase.from('goals').update({ estimated_value: estValue }).eq('id', goal.id);
            setGoals(prev => prev.map(g => g.id === goal.id ? {...g, estimated_value: estValue} : g));
          }
        } catch(e) { console.error('Value estimate error:', e); }
        try {
          const stepsData = await callEdge('claude-proxy', {
            system: `You are an execution coach for small business owners. Generate 3-6 specific, actionable steps to achieve this goal. Return ONLY valid JSON array: [{"step_text":"string"}]`,
            user: `Goal: ${opp.title}\nContext: ${opp.insight}\n\nBusiness:\n${ctx()}`
          }, session);
          const steps = jp(stepsData?.text || '[]');
          if (Array.isArray(steps) && steps.length > 0) {
            const rows = steps.map((s, i) => ({
              goal_id: goal.id, user_id: session.user.id,
              step_text: s.step_text, status: 'not_started', sort_order: i,
            }));
            const { data: insertedSteps } = await supabase.from('goal_steps').insert(rows).select();
            setGoalSteps(prev => ({ ...prev, [goal.id]: insertedSteps || [] }));
          }
        } catch(e) { console.error('Steps error:', e); }
        setEnrichingGoals(prev => { const n = new Set(prev); n.delete(goal.id); return n; });
      })();
    }
  };

  // -- REGENERATE SINGLE OPPORTUNITY -------------------------------------------
  const regenerateSingleOpp = async (opp) => {
    if (regeneratingOpp) return; // One at a time
    setRegeneratingOpp(opp.id);
    try {
      // Delete just this one opp
      await supabase.from('opportunities').delete().eq('id', opp.id);
      // Generate one replacement for the same cell
      const existingTitles = opps.filter(o => o.canvas_cell === opp.canvas_cell && o.id !== opp.id).map(o => o.title);
      const data = await callEdge('claude-proxy', {
        system: `You are a revenue and efficiency consultant for small trades businesses. Generate exactly 1 new opportunity card for the "${opp.canvas_cell}" canvas cell. Return ONLY valid JSON array: [{"canvas_cell":"${opp.canvas_cell}","title":"string","insight":"string (2-3 sentences, specific and actionable)","impact_label":"High"|"Medium"|"Low"}]. Do NOT duplicate these existing opportunities: ${JSON.stringify(existingTitles)}. Be specific to the trade.`,
        user: `Generate 1 replacement opportunity for the "${opp.canvas_cell}" cell:\n${ctx()}\n\nCanvas cell content: ${canvas[opp.canvas_cell] || ''}\n\nFull canvas:\n${JSON.stringify(canvas)}`
      }, session);
      const parsed = jp(data?.text || '[]');
      if (Array.isArray(parsed) && parsed.length > 0) {
        const row = {
          user_id: session.user.id, canvas_cell: opp.canvas_cell,
          title: parsed[0].title, insight: parsed[0].insight,
          impact_label: parsed[0].impact_label || 'Medium',
          migrated: false, sort_order: opp.sort_order,
        };
        const { data: inserted } = await supabase.from('opportunities').insert(row).select().single();
        if (inserted) setOpps(prev => prev.map(o => o.id === opp.id ? inserted : o));
      }
    } catch(e) { console.error('Regenerate error:', e); }
    setRegeneratingOpp(null);
  };

  // -- UPDATE GOAL STEP STATUS -----------------------------------------------
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
    // If all steps done -> auto-complete the goal
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

  // -- UPDATE GOAL FIELD -----------------------------------------------------
  const updateGoalField = async (goalId, field, value) => {
    setGoals(prev => prev.map(g => g.id === goalId ? {...g, [field]: value} : g));
    await supabase.from('goals')
      .update({ [field]: value, updated_at: new Date().toISOString() }).eq('id', goalId);
  };

  // -- UPDATE STEP TEXT ------------------------------------------------------
  const updateStepText = async (goalId, stepId, value) => {
    setGoalSteps(prev => ({
      ...prev,
      [goalId]: (prev[goalId]||[]).map(s => s.id === stepId ? {...s, step_text: value} : s)
    }));
    await supabase.from('goal_steps')
      .update({ step_text: value, updated_at: new Date().toISOString() }).eq('id', stepId);
  };

  // -- UPDATE STEP DAYS ------------------------------------------------------
  const updateStepDays = async (goalId, stepId, value) => {
    const days = value === '' ? null : parseInt(value, 10) || null;
    setGoalSteps(prev => ({
      ...prev,
      [goalId]: (prev[goalId]||[]).map(s => s.id === stepId ? {...s, days_to_complete: days} : s)
    }));
    await supabase.from('goal_steps')
      .update({ days_to_complete: days, updated_at: new Date().toISOString() }).eq('id', stepId);
  };

  // -- TOGGLE SMS FOR GOAL ---------------------------------------------------
  const toggleGoalSMS = async (goalId, current) => {
    await updateGoalField(goalId, 'sms_enabled', !current);
  };

  // -- CONTACT SUPPORT -------------------------------------------------------
  const sendSupport = async () => {
    if (!csBody.trim() || csSending) return;
    setCsSending(true);
    try {
      await callEdge('support-notify', {
        subject: csSubject.trim(),
        message: csBody.trim(),
      }, session);
      setCsSent(true);
      setCsSubject("");
      setCsBody("");
    } catch(e) {
      console.error('Support form error:', e);
    }
    setCsSending(false);
  };

  // -- SCORE BADGE HELPERS ---------------------------------------------------
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

  // -- GROUPED OPPORTUNITIES -------------------------------------------------
  const groupedOpps = CELLS.reduce((acc, c) => {
    acc[c.k] = { label: c.l, cards: opps.filter(o => o.canvas_cell === c.k) };
    return acc;
  }, {});

  // -- RENDER ----------------------------------------------------------------
  if (authLoading) return (
    <>
      <style>{CSS}</style>
      <div className="app">
        <div className="hdr"><div className="logo">Trade<span>Stack</span></div></div>
        <div style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',minHeight:'80vh',gap:'.65rem'}}>
          <div className="lbar"/><div className="llbl" style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:'.78rem',fontWeight:700,letterSpacing:'.18em',textTransform:'uppercase',color:'#555'}}>Loading</div>
        </div>
      </div>
    </>
  );

  if (!session) return <LandingPage onSignIn={signInWithGoogle} />;

  const TABS = [
    { id:"input",         l:"Input" },
    { id:"canvas",        l:"Canvas",        lock:!fullySubmitted },
    { id:"opportunities", l:"Opportunities", lock:!fullySubmitted || oppLoading || oppLoading2 || opps.length === 0, premium:true, loading: oppLoading || oppLoading2 },
    { id:"goals",         l:"Goals",         lock:!fullySubmitted, premium:true },
  ];

  return (
    <>
      <style>{CSS}</style>
      <div className="app" onClick={() => scoreTooltip && setScoreTooltip(null)}>

        {/* HEADER */}
        <div className="hdr">
          <div className="logo">Trade<span>Stack</span></div>
          <div className="hdr-tagline">Obt<span className="ai">ai</span>n what others overlook.</div>
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
              {t.lock && !t.loading && <span className="tab-lock">lock</span>}
              {t.loading && <span className="tab-lock" style={{background:'#f5a623',color:'#000'}}>...</span>}
              {!t.lock && !t.loading && t.premium && !isPremium && <span className="tab-lock">pro</span>}
            </button>
          ))}
        </div>

        {/* AI DISCLAIMER BANNER - all tabs except input */}
        {tab !== "input" && (
          <div className="ai-disclaimer">AI-GENERATED CONTENT - NOT LEGAL OR FINANCIAL ADVICE.</div>
        )}

        <div className="pg">

          {/* -- INPUT TAB ------------------------------------------------ */}
          {tab==="input" && <>
            <div className="stitle">Your Business{autoSaved && <span className="save-indicator" style={{marginLeft:'.5rem',fontSize:'.72rem'}}>Saved</span>}</div>
            {saveError && <div style={{background:'#2a1010',border:'1px solid #e05252',borderRadius:'3px',padding:'.6rem .85rem',marginBottom:'.75rem',fontSize:'.85rem',color:'#e05252',fontFamily:"'Barlow',sans-serif"}}>Save error: {saveError}</div>}
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

            </div>

            <div className="divider"/>
            <div className="stitle">Business Model</div>
            <div className="g2">
              {CELLS.map(c => (
                <div className="fg full" key={c.k}>
                  <label>{c.l}</label>
                  <textarea rows={2} value={canvas[c.k] || ''} onChange={e => saveCanvasCell(c.k, e.target.value)} placeholder={{
                    problem:"What problem does your business solve for customers?",
                    solution:"How do you solve it? What service/product do you deliver?",
                    uvp:"What makes you different from competitors?",
                    unfair:"What advantage is hard for others to copy? (reputation, licenses, location...)",
                    segments:"Who are your ideal customers? (homeowners, property managers...)",
                    metrics:"How do you measure success? (close rate, avg ticket, repeat %...)",
                    channels:"How do customers find you? (referrals, Google, yard signs...)",
                    revenue:"How do you make money? (service calls, contracts, maintenance plans...)",
                    cost:"What are your biggest costs? (labor, materials, trucks, insurance...)"
                  }[c.k] || ''}/>
                </div>
              ))}
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
                <span style={{fontSize:'.78rem',color:'#555',lineHeight:1.4}}>Direct job costs: materials, subcontractors, labor per job. What you spend to deliver the work.</span>
              </div>
              <div className="fg">
                <label>Operating Expenses ($)</label>
                <input type="number" inputMode="numeric" value={p.opEx} onChange={e=>setP(v=>({...v,opEx:e.target.value}))} placeholder="95000"/>
                <span style={{fontSize:'.78rem',color:'#555',lineHeight:1.4}}>Overhead costs to run the business: insurance, truck payments, software, office, owner salary.</span>
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

            {!isPremium && fullySubmitted && (
              <div style={{background:'#141414',border:'1px solid #2a2a1a',borderRadius:'3px',padding:'.85rem 1rem',marginTop:'1rem',display:'flex',justifyContent:'space-between',alignItems:'center',gap:'1rem',flexWrap:'wrap'}}>
                <div>
                  <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:'.75rem',fontWeight:700,letterSpacing:'.16em',textTransform:'uppercase',color:'#f5a623',marginBottom:'.2rem'}}>7-Day Free Trial</div>
                  <div style={{fontSize:'.92rem',color:'#666'}}>Unlock Opportunities, Goals, and SMS reminders. Free for 7 days, then $9.98/month.</div>
                  {checkoutError && <div style={{fontSize:'.85rem',color:'#e05252',marginTop:'.3rem'}}>{checkoutError}</div>}
                </div>
                <button className="btn bp" style={{width:'auto',whiteSpace:'nowrap'}} onClick={handleUpgrade} disabled={checkoutLoading}>{checkoutLoading ? 'Redirecting...' : 'Start 7-Day Free Trial'}</button>
              </div>
            )}

            <div className="form-end" style={{gap:'.75rem',flexWrap:'wrap'}}>

              <button
                className="btn bp"
                onClick={submit}
                disabled={!p.bizName || !p.trade || !p.location || !p.yearsOp || !p.employees || !p.topService || !p.annualRev || !p.cogs || !p.opEx || !p.netIncome || !p.painPoints || !CELLS.every(c => canvas[c.k]?.trim()) || oppLoading}
              >
                {oppLoading ? 'Building your strategy. Wait ~45 seconds.' : fullySubmitted ? 'View Canvas' : 'Save & View Canvas'}
              </button>
            </div>
            {(!p.bizName || !p.trade || !p.location || !p.yearsOp || !p.employees || !p.topService || !p.annualRev || !p.cogs || !p.opEx || !p.netIncome || !p.painPoints || !CELLS.every(c => canvas[c.k]?.trim())) && <p style={{fontSize:'.78rem',color:'#888',marginTop:'.5rem',textAlign:'right'}}>Fill in all fields above to continue.</p>}
          </>}

          {/* -- CANVAS TAB ----------------------------------------------- */}
          {tab==="canvas" && <>
            <div className="stitle">Lean Canvas - {p.bizName}{(oppLoading || oppLoading2) && <span className="save-indicator" style={{marginLeft:'.5rem',fontSize:'.72rem',color:'#f5a623'}}>Analyzing opportunities. Wait ~30 seconds.</span>}{!oppLoading && !oppLoading2 && scoreLoading && <span className="save-indicator" style={{marginLeft:'.5rem',fontSize:'.72rem',color:'#888'}}>Scoring your canvas. Wait ~15 seconds.</span>}</div>
            <div className="canvas">
              {CELLS.map(c => (
                <div key={c.k} className="cc">
                  <div className="cc-top">
                    <div className="cc-lbl">{c.l}</div>
                    <button
                      className={`score-badge ${scoreClass(canvasScores[c.k]?.score)}`}
                      onClick={e => handleScoreBadgeClick(e, c.k)}
                    >
                      {canvasScores[c.k]?.score ?? '--'}
                    </button>
                  </div>
                  {canvasScores[c.k]?.preview && <div className="cc-preview">{canvasScores[c.k].preview}</div>}
                  <textarea
                    className="cc-val"
                    value={canvas[c.k] || ''}
                    maxLength={400}
                    onChange={e => saveCanvasCell(c.k, e.target.value)}
                    placeholder="Click to enter..."
                  />
                </div>
              ))}
            </div>
          </>}

          {/* -- OPPORTUNITIES TAB ---------------------------------------- */}
          {tab==="opportunities" && <>
            {!isPremium
              ? <div className="blur-gate-wrap">
                  <div className="blur-gate-content">
                    {/* Placeholder cards that look real but are blurred */}
                    {[
                      {label:"Revenue Streams", cards:[
                        {title:"Introduce a recurring maintenance contract", impact:"High", insight:"Trades businesses with annual service agreements generate 30-40% more predictable revenue. A simple $299/yr inspection contract sold to your top 20 existing customers could add $6,000+ in guaranteed annual income with minimal extra labor."},
                        {title:"Add a premium response tier for urgent calls", impact:"Medium", insight:"Customers who need same-day service will pay a 20-40% premium without hesitation. Creating a 'Priority Response' offering for $150/call positions you above competitors and captures high-margin emergency revenue."},
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
                    <div className="blur-gate-sub">AI-generated opportunities built from your actual canvas - showing exactly where 20% of effort drives 80% of results.</div>
                    <button className="btn bp" style={{width:'auto'}} onClick={handleUpgrade} disabled={checkoutLoading}>{checkoutLoading ? 'Redirecting...' : 'Start 7-Day Free Trial'}</button>
                    {checkoutError && <div style={{fontSize:'.85rem',color:'#e05252'}}>{checkoutError}</div>}
                    <div className="blur-gate-price">Cancel anytime. Instant access.</div>
                  </div>
                </div>
              : oppLoading
                ? <div className="loader"><div className="lbar"/><div className="llbl">Your Chief Strategy Officer is writing up his report. Wait ~30 seconds.</div></div>
                : <>
                      {Object.entries(groupedOpps).map(([key, group]) => (
                        <div key={key} className="opp-section">
                          <div className="opp-section-title">{group.label}</div>
                          {group.cards.map(opp => (
                            <div key={opp.id} className="opp-card">
                              {migratedMsg[opp.id]
                                ? <div className="opp-migrated">This became a goal - check the Goals tab</div>
                                : <>
                                    <div className="opp-card-top">
                                      <div className="opp-title">{opp.title}</div>
                                      <div className={`opp-impact imp-${opp.impact_label?.[0]||'M'}`}>{opp.impact_label}</div>
                                    </div>
                                    <div className="opp-insight">{opp.insight}</div>
                                    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginTop:'.5rem'}}>
                                      <button className="opp-cta" onClick={() => migrateToGoal(opp)} disabled={!!migratedMsg[opp.id]}>Make it a Goal</button>
                                      <button onClick={() => regenerateSingleOpp(opp)} disabled={regeneratingOpp === opp.id} style={{background:'none',border:'1px solid #555',color:'#888',padding:'.25rem .6rem',borderRadius:'4px',fontSize:'.72rem',cursor:'pointer'}}>{regeneratingOpp === opp.id ? 'Refreshing...' : 'Regenerate'}</button>
                                    </div>
                                  </>
                              }
                            </div>
                          ))}
                        </div>
                      ))}
                        {oppLoading2 && <div className="loader" style={{marginTop:'1rem'}}><div className="lbar"/><div className="llbl">Finishing the last 5 sections. Wait ~30 seconds more.</div></div>}
                    </>
            }
          </>}

          {/* -- GOALS TAB ------------------------------------------------ */}
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
                            <span style={{color:'#4caf82',fontSize:'.92rem'}}>$</span>
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
                    <button className="btn bp" style={{width:'auto'}} onClick={handleUpgrade} disabled={checkoutLoading}>{checkoutLoading ? 'Redirecting...' : 'Start 7-Day Free Trial'}</button>
                    {checkoutError && <div style={{fontSize:'.85rem',color:'#e05252'}}>{checkoutError}</div>}
                    <div className="blur-gate-price">Cancel anytime. Instant access.</div>
                  </div>
                </div>
              : <>
                  {/* Money Unlocked */}
                  <div className="money-unlocked">
                    <span className="mu-label">Money Unlocked</span>
                    <span className="mu-value">${moneyUnlocked.toLocaleString()}</span>
                  </div>
                  <p className="days-hint">Enter the number of days (X) from the previous step you would like to receive a text reminder for that goal.</p>

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
                              <div key={goal.id} className={`goal-card ${goal.status==='completed'?'completed':''}`} style={{position:'relative'}}>
                    {enrichingGoals.has(goal.id) && <div style={{position:'absolute',inset:0,background:'rgba(20,18,15,0.85)',display:'flex',alignItems:'center',justifyContent:'center',borderRadius:'12px',zIndex:2}}><div style={{textAlign:'center',color:'#e8e0d4'}}><div style={{color:'#f5a623',fontSize:'1rem',marginBottom:'.3rem'}}>Building your goal</div><div style={{fontSize:'.8rem',color:'#888'}}>Wait ~20 seconds for steps and value estimate.</div></div></div>}
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
                                    <span style={{color:'#4caf82',fontSize:'.92rem'}}>$</span>
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
                                        <input
                                          className="step-days-input"
                                          type="number"
                                          min="1"
                                          placeholder="X"
                                          value={step.days_to_complete ?? ''}
                                          onChange={e => updateStepDays(goal.id, step.id, e.target.value)}
                                        />
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

                </>
            }
          </>}

          {/* Bottom bar - visible on all tabs */}
          <div style={{marginTop:'2rem',paddingTop:'1rem',borderTop:'1px solid #1e1e1e',display:'flex',alignItems:'center',justifyContent:'center',gap:'1rem',flexWrap:'wrap'}}>
            {isPremium && <span className="premium-badge">Premium</span>}
            <button
              className="btn bg"
              style={{fontSize:'.75rem',padding:'.4rem 1rem',color:'#555'}}
              onClick={handleManageBilling}
              disabled={billingLoading}
            >
              {billingLoading ? 'Opening...' : 'Manage Subscription'}
            </button>
            <button className="btn bg" style={{padding:'.4rem .85rem',fontSize:'.75rem'}} onClick={signOut}>Sign Out</button>
          </div>

          {/* LEGAL LINK */}
          <button className="legal-pg-link" onClick={() => setShowLegalModal('view')}>Legal</button>

        </div>{/* end .pg */}

        {/* -- CONTACT SUPPORT BUBBLE ------------------------------------- */}
        <div className="cs-bubble">
          {csOpen && (
            <div className="cs-panel">
              <div className="cs-header">
                <span className="cs-title">Contact Support</span>
                <button className="cs-close" onClick={() => { setCsOpen(false); setCsSent(false); }}>close</button>
              </div>
              <div className="cs-form" style={{padding:'1.25rem .85rem',textAlign:'center'}}>
                <p style={{color:'#888',fontSize:'.88rem',lineHeight:1.55,marginBottom:'.75rem'}}>Have a question? Email us directly and we'll get back to you shortly.</p>
                <a
                  href="mailto:s.barton.ok@gmail.com"
                  style={{color:'#f5a623',fontFamily:"'Barlow Condensed',sans-serif",fontWeight:700,fontSize:'.95rem',letterSpacing:'.04em',textDecoration:'none',wordBreak:'break-all'}}
                >
                  s.barton.ok@gmail.com
                </a>
              </div>
            </div>
          )}
          <button className="cs-btn" onClick={() => setCsOpen(v => !v)}>
            {csOpen ? 'close' : 'help'}
          </button>
        </div>

      </div>

      {/* -- LEGAL MODAL ------------------------------------------------- */}
      {showLegalModal && (
        <div className="legal-overlay" onClick={() => setShowLegalModal(false)}>
          <div className="legal-modal" onClick={e => e.stopPropagation()}>
            <div className="legal-modal-hd">
              <div className="legal-modal-title">AI Disclaimer + Terms of Use</div>
            </div>
            <div className="legal-modal-body">
              <p>TradeStack uses artificial intelligence to analyze your business data and generate insights, recommendations, and financial estimates. Please read the following before continuing.</p>
              <h3>Not Professional Advice</h3>
              <p>All content generated by TradeStack - including opportunity cards, financial estimates, goal plans, canvas scores, and any other analysis - is produced by AI and is for informational purposes only. It does not constitute professional legal, financial, accounting, or business advice.</p>
              <h3>AI Can Make Mistakes</h3>
              <p>Artificial intelligence can produce inaccurate, incomplete, or misleading information. TradeStack does not guarantee the accuracy or reliability of any AI-generated content.</p>
              <h3>Seek Professional Guidance</h3>
              <p>Before acting on any recommendation, estimate, or suggestion provided by TradeStack, consult a qualified professional - including a licensed attorney, certified financial advisor, or accountant.</p>
              <h3>Limitation of Liability</h3>
              <p>By using TradeStack, you agree that TradeStack and its operators are not liable for any loss, damage, or harm - including financial loss, business decisions made in reliance on AI output, data loss, or inaccuracies - arising from your use of this service.</p>
              <h3>No Legal Action</h3>
              <p>You agree not to bring any legal claim against TradeStack, its owners, operators, or affiliates based on the accuracy, completeness, or reliability of AI-generated content, any recommendation made, or any loss incurred while using the service.</p>
            </div>
            <div className="legal-modal-ft">
              {showLegalModal === 'upgrade' && (
                <button className="btn bp" onClick={acceptLegal}>I Understand and Agree - Continue to Checkout</button>
              )}
              <button className="btn bg" onClick={() => setShowLegalModal(false)}>
                {showLegalModal === 'upgrade' ? 'Cancel' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}

    </>
  );
}

