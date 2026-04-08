import { useState } from "react";

// -- DEMO DATA --------------------------------------------------------------
const DEMO_PROFILE = {
  bizName: "Centre County Lawn & Landscape",
  trade: "Lawn Care & Landscaping",
  location: "State College, PA",
  yearsOp: "7",
  employees: "5",
  annualRev: "480,000",
  cogs: "210,000",
  opEx: "145,000",
  netIncome: "125,000",
  topService: "Lawn maintenance & spring/fall cleanups",
  avgJobValue: "850",
  painPoints: "Slow winters, chasing invoices, hard to grow past current team size",
};

const DEMO_CANVAS = {
  problem:  "• Homeowners don't know who to trust for quality lawn care\n• Seasonal slowdowns create cash flow gaps every winter\n• Customers switch providers easily when price is the only differentiator",
  solution: "• Consistent, reliable crew with the same faces every visit\n• Seasonal service packages that smooth income year-round\n• Communication and follow-up that most competitors skip",
  uvp:      "• State College's most consistent lawn care team — 200+ local reviews\n• Package pricing with no surprise add-ons\n• Crew that shows up when they say they will",
  unfair:   "• 7 years of local reputation and word-of-mouth in Centre County\n• Owner on-site for every new client's first visit\n• Relationships with local property managers built over years",
  segments: "• Homeowners aged 35-65 in established State College neighborhoods\n• Property managers handling 5+ residential units\n• Small commercial lots and HOAs",
  metrics:  "• Close rate on inbound calls: ~65%\n• Average job value: $850\n• Repeat customer rate: 58%\n• Seasonal package retention: 67%",
  channels: "• Google search + Google Business Profile\n• Word of mouth and neighbor referrals\n• Yard signs and local Facebook groups",
  revenue:  "• Recurring mowing/maintenance (60%)\n• Spring/fall cleanups (20%)\n• Mulching, edging, one-time jobs (20%)",
  cost:     "• Labor: 4 full-time crew + 1 part-time ($155k/yr)\n• Equipment, fuel, maintenance ($45k/yr)\n• Insurance, vehicle payments ($28k/yr)\n• Marketing, software, admin ($17k/yr)",
};

const DEMO_SCORES = {
  problem:  { score: 68, preview: "Trust + retention gap" },
  solution: { score: 71, preview: "Package upsell potential" },
  uvp:      { score: 79, preview: "Reviews underused" },
  unfair:   { score: 73, preview: "Referral system missing" },
  segments: { score: 61, preview: "Prop mgr untapped" },
  metrics:  { score: 75, preview: "Close rate improvable" },
  channels: { score: 57, preview: "Referral program gap" },
  revenue:  { score: 62, preview: "Recurring plan growth" },
  cost:     { score: 69, preview: "Winter labor bleed" },
};

const DEMO_OPPORTUNITIES = [
  {
    id: "demo-opp-1",
    canvas_cell: "revenue",
    title: "Turn one-time cleanup customers into recurring contracts",
    impact: "High",
    insight: "60% of your revenue comes from recurring maintenance but your cleanup customers aren't being converted. A simple offer at the end of every spring cleanup — a discounted recurring package — could convert 20-30% of those jobs into year-round contracts, adding $40,000–$60,000 in predictable annual revenue.",
  },
  {
    id: "demo-opp-2",
    canvas_cell: "channels",
    title: "Build a structured referral program",
    impact: "High",
    insight: "Word of mouth is your biggest channel but there's no system behind it. A $50 account credit for every referral that books a job could increase referral volume by 30-40%. Your 58% repeat customer base is your best sales force — they just need a reason to talk.",
  },
  {
    id: "demo-opp-3",
    canvas_cell: "segments",
    title: "Land 2-3 property management contracts",
    impact: "High",
    insight: "A single property manager with 10 units could be worth $15,000–$25,000 per year in recurring maintenance. You already have the reputation. A targeted pitch to 10 local property managers with a custom multi-unit pricing sheet could close 2-3 accounts within 60 days.",
  },
  {
    id: "demo-opp-4",
    canvas_cell: "metrics",
    title: "Recover the 35% of calls you're not closing",
    impact: "Medium",
    insight: "At a 65% close rate, you're losing roughly 1 in 3 inbound leads. A follow-up text within an hour of a no-close call — offering a first-time discount or free estimate — could recover 10-15% of those, adding an estimated $25,000+ in annual revenue.",
  },
  {
    id: "demo-opp-5",
    canvas_cell: "cost",
    title: "Cut winter labor costs with a seasonal crew model",
    impact: "Medium",
    insight: "Keeping a full crew through slow winter months costs roughly $25,000 in underutilized labor. Shifting one position to a seasonal role could save $10,000–$15,000 annually while keeping surge capacity for the spring rush.",
  },
];

const DEMO_GOAL = {
  id: "demo-goal-1",
  title: "Turn cleanup customers into recurring contracts",
  estimated_value: 52000,
  status: "in_progress",
  sms_enabled: false,
};

const DEMO_GOAL_STEPS = [
  { id: "s1", step_text: "Pull list of all one-time cleanup customers from last 2 seasons", status: "done",        days_to_complete: 1  },
  { id: "s2", step_text: "Create a simple recurring package offer sheet with 3 pricing tiers",  status: "done",        days_to_complete: 2  },
  { id: "s3", step_text: "Text or call every cleanup customer with the offer",                   status: "in_progress", days_to_complete: 5  },
  { id: "s4", step_text: "Train crew to mention the package at end of every cleanup job",        status: "not_started", days_to_complete: 3  },
  { id: "s5", step_text: "Track sign-ups weekly and adjust pricing as needed",                   status: "not_started", days_to_complete: 30 },
];

const CELLS = [
  { k: "problem",  l: "Problem" },
  { k: "solution", l: "Solution" },
  { k: "uvp",      l: "Unique Value Prop" },
  { k: "unfair",   l: "Unfair Advantage" },
  { k: "segments", l: "Customer Segments" },
  { k: "metrics",  l: "Key Metrics" },
  { k: "channels", l: "Channels" },
  { k: "revenue",  l: "Revenue Streams" },
  { k: "cost",     l: "Cost Structure" },
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

/* FIN CARDS */
.fc{background:#141414;border:1px solid #222;padding:.9rem;border-radius:3px;}
.fc-lbl{font-family:'Barlow Condensed',sans-serif;font-size:.75rem;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:#666;margin-bottom:.25rem;}
.fc-val{font-family:'Barlow Condensed',sans-serif;font-size:1.8rem;font-weight:700;line-height:1;}
.pos{color:#4caf82;}.neg{color:#e05252;}.neu{color:#e8e0d4;}
.fc-sub{font-size:.8rem;color:#555;margin-top:.2rem;}

/* AI DISCLAIMER BANNER */
.ai-disclaimer{text-align:center;padding:.4rem 1rem;background:#111;border-bottom:1px solid #1a1a1a;font-family:'Barlow Condensed',sans-serif;font-size:.62rem;font-weight:600;letter-spacing:.11em;text-transform:uppercase;color:#555;}

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

/* GOALS */
.money-unlocked{background:#141414;border:1px solid #1a3a2a;border-radius:3px;padding:.85rem 1rem;margin-bottom:1.25rem;display:flex;justify-content:space-between;align-items:center;}
.mu-label{font-family:'Barlow Condensed',sans-serif;font-size:.78rem;font-weight:700;letter-spacing:.16em;text-transform:uppercase;color:#4caf82;}
.mu-value{font-family:'Barlow Condensed',sans-serif;font-size:1.7rem;font-weight:700;color:#4caf82;}
.goal-card{background:#141414;border:1px solid #222;border-radius:3px;padding:.95rem;margin-bottom:.75rem;}
.goal-top{display:flex;justify-content:space-between;align-items:flex-start;gap:.5rem;margin-bottom:.65rem;}
.goal-title-input{font-family:'Barlow Condensed',sans-serif;font-weight:700;font-size:1.1rem;color:#e8e0d4;background:transparent;border:none;border-bottom:1px solid transparent;outline:none;width:100%;}
.goal-meta{display:flex;align-items:center;gap:.6rem;flex-wrap:wrap;margin-bottom:.75rem;}
.goal-status{font-family:'Barlow Condensed',sans-serif;font-size:.72rem;font-weight:700;letter-spacing:.1em;text-transform:uppercase;padding:.15rem .4rem;border-radius:2px;}
.gs-ns{background:#222;color:#666;}.gs-ip{background:#2a2a1a;color:#f5a623;}.gs-done{background:#1a3a2a;color:#4caf82;}
.goal-value-wrap{display:flex;align-items:center;gap:.3rem;}
.goal-value-label{font-family:'Barlow Condensed',sans-serif;font-size:.72rem;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:#555;}
.goal-value-input{font-family:'Barlow Condensed',sans-serif;font-size:.92rem;font-weight:700;color:#4caf82;background:transparent;border:none;outline:none;width:80px;}
.goal-steps{border-top:1px solid #1e1e1e;padding-top:.65rem;margin-top:.3rem;}
.step-row{display:flex;align-items:flex-start;gap:.5rem;margin-bottom:.5rem;}
.step-check{width:20px;height:20px;min-width:20px;border:1px solid #333;border-radius:2px;background:transparent;display:flex;align-items:center;justify-content:center;margin-top:.1rem;font-size:.8rem;color:#4caf82;cursor:default;}
.step-check.done{border-color:#4caf82;background:#0e1e16;}
.step-check.ip{border-color:#f5a623;}
.step-text-input{flex:1;background:transparent;border:none;outline:none;color:#ccc;font-family:'Barlow',sans-serif;font-size:.95rem;font-weight:300;padding-bottom:.1rem;}
.step-time{font-family:'Barlow Condensed',sans-serif;font-size:.72rem;color:#444;letter-spacing:.06em;white-space:nowrap;}
.sms-toggle-row{display:flex;align-items:center;justify-content:space-between;border-top:1px solid #1e1e1e;padding-top:.65rem;margin-top:.5rem;}
.sms-toggle-label{font-family:'Barlow Condensed',sans-serif;font-size:.78rem;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:#555;}
.toggle{position:relative;display:inline-block;width:36px;height:20px;}
.toggle input{opacity:0;width:0;height:0;}
.toggle-slider{position:absolute;cursor:pointer;inset:0;background:#222;border-radius:20px;transition:.2s;}
.toggle-slider:before{content:'';position:absolute;width:14px;height:14px;left:3px;bottom:3px;background:#555;border-radius:50%;transition:.2s;}
.toggle input:checked + .toggle-slider{background:#f5a623;}
.toggle input:checked + .toggle-slider:before{transform:translateX(16px);background:#0e0e0e;}

/* DEMO TOUR TOOLTIP */
.demo-tip{position:fixed;top:52px;left:0;right:0;z-index:600;background:#1a1a1a;border-bottom:2px solid #f5a623;box-shadow:0 4px 24px rgba(0,0,0,.5);max-height:33vh;overflow-y:auto;animation:slidedown .2s ease;}
@keyframes slidedown{from{transform:translateY(-100%);}to{transform:translateY(0);}}
.demo-tip-inner{padding:.85rem 1rem .75rem;max-width:600px;margin:0 auto;}
.demo-tip-eyebrow{font-family:'Barlow Condensed',sans-serif;font-size:.6rem;font-weight:700;letter-spacing:.22em;text-transform:uppercase;color:#f5a623;margin-bottom:.3rem;}
.demo-tip-title{font-family:'Barlow Condensed',sans-serif;font-weight:800;font-size:1rem;letter-spacing:.04em;text-transform:uppercase;color:#e8e0d4;margin-bottom:.4rem;line-height:1.15;}
.demo-tip-body{font-size:.82rem;color:#888;line-height:1.6;margin-bottom:.65rem;}
.demo-tip-row{display:flex;align-items:center;gap:.75rem;}
.demo-badge{font-family:'Barlow Condensed',sans-serif;font-size:.65rem;font-weight:700;letter-spacing:.14em;text-transform:uppercase;background:#c0392b;color:#fff;padding:.16rem .48rem;border-radius:2px;margin-left:.6rem;vertical-align:middle;}

/* MISC */
@keyframes fadein{from{opacity:0;}to{opacity:1;}}
`;

export default function Demo() {
  const [tab, setTab] = useState("input");
  const [activeTip, setActiveTip] = useState("input");
  // Track which tabs have already shown their tooltip
  const [seen, setSeen] = useState({ input: false, canvas: false, opportunities: false, goals: false });

  const scoreClass = (score) => {
    if (score == null) return "score-none";
    if (score >= 70) return "score-hi";
    if (score >= 40) return "score-md";
    return "score-lo";
  };

  const groupedOpps = CELLS.reduce((acc, c) => {
    acc[c.k] = { label: c.l, cards: DEMO_OPPORTUNITIES.filter(o => o.canvas_cell === c.k) };
    return acc;
  }, {});

  const goToTab = (newTab) => {
    setTab(newTab);
    // Only show tooltip if this tab hasn't been seen yet
    if (!seen[newTab]) {
      setActiveTip(newTab);
    } else {
      setActiveTip(null);
    }
  };

  const dismissTip = () => {
    setSeen(prev => ({ ...prev, [tab]: true }));
    setActiveTip(null);
  };

  // -- TOUR TIPS ----------------------------------------------------------
  const TIPS = {
    input: {
      eyebrow: "Step 1 of 4 — Input",
      title: "This is where it starts.",
      body: "Every business owner fills in their details here — what they do, where they are, and their financials. In the real app, you'd enter your own numbers. TradeStack's AI reads this and builds everything else from it. We've filled this in for Centre County Lawn & Landscape so you can see what comes next.",
    },
    canvas: {
      eyebrow: "Step 2 of 4 — Canvas",
      title: "Your Lean Canvas — scored by AI.",
      body: "TradeStack maps your inputs to a Lean Canvas and scores each section. The AI grades how strong your strategy is and where the biggest opportunities are hiding. In the real app, this builds in about 45 seconds.",
    },
    opportunities: {
      eyebrow: "Step 3 of 4 — Opportunities",
      title: "Where the money is.",
      body: "AI-generated cards from your canvas and financials — showing exactly where you can make more money or stop wasting it. In the real app, these are fully personalized to YOUR business. Click 'Make it a Goal' on any card.",
    },
    goals: {
      eyebrow: "Step 4 of 4 — Goals",
      title: "From insight to action.",
      body: "TradeStack's AI builds a step-by-step action plan with time estimates and dollar values — takes about 20 seconds to generate. Track each step, mark them complete, enable daily SMS reminders at 8pm. The 'Money Unlocked' counter grows as you complete goals.",
    },
  };

  const currentTip = activeTip ? TIPS[activeTip] : null;

  const TABS = [
    { id: "input",         l: "Input" },
    { id: "canvas",        l: "Canvas" },
    { id: "opportunities", l: "Opportunities" },
    { id: "goals",         l: "Goals" },
  ];

  return (
    <>
      <style>{CSS}</style>
      <div className="app">

        {/* HEADER */}
        <div className="hdr">
          <div style={{ display: "flex", alignItems: "center", gap: ".75rem" }}>
            <button
              onClick={() => window.location.href = "/"}
              style={{
                background: "transparent",
                border: "none",
                color: "#666",
                cursor: "pointer",
                fontFamily: "'Barlow Condensed',sans-serif",
                fontSize: ".72rem",
                fontWeight: 700,
                letterSpacing: ".1em",
                textTransform: "uppercase",
                padding: 0,
                transition: "color .15s",
              }}
              onMouseEnter={e => e.target.style.color = "#e8e0d4"}
              onMouseLeave={e => e.target.style.color = "#666"}
            >
              ← Back to TradeStack
            </button>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: ".6rem" }}>
            <div className="logo">Trade<span>Stack</span></div>
            <span className="demo-badge">Demo Mode</span>
          </div>
          <div className="hdr-tagline" style={{ fontSize: ".7rem" }}>
            {DEMO_PROFILE.bizName}
          </div>
        </div>

        {/* TABS */}
        <div className="tabs">
          {TABS.map(t => (
            <button
              key={t.id}
              className={`tab ${tab === t.id ? "on" : ""}`}
              onClick={() => goToTab(t.id)}
            >
              {t.l}
            </button>
          ))}
        </div>

        {/* AI DISCLAIMER */}
        {tab !== "input" && (
          <div className="ai-disclaimer">AI-GENERATED CONTENT — NOT LEGAL OR FINANCIAL ADVICE.</div>
        )}

        <div className="pg">

          {/* -- INPUT TAB -------------------------------------------------- */}
          {tab === "input" && (
            <>
              <div className="stitle">Your Business</div>
              <div className="g2">
                <div className="fg">
                  <label>Business Name</label>
                  <input value={DEMO_PROFILE.bizName} readOnly />
                </div>
                <div className="fg">
                  <label>Trade / Specialty</label>
                  <input value={DEMO_PROFILE.trade} readOnly />
                </div>
                <div className="fg">
                  <label>City / Region</label>
                  <input value={DEMO_PROFILE.location} readOnly />
                </div>
                <div className="fg">
                  <label>Years Operating</label>
                  <input value={DEMO_PROFILE.yearsOp} readOnly />
                </div>
                <div className="fg">
                  <label>Employees</label>
                  <input value={DEMO_PROFILE.employees} readOnly />
                </div>
                <div className="fg">
                  <label>Top Service</label>
                  <input value={DEMO_PROFILE.topService} readOnly />
                </div>
                <div className="fg">
                  <label>Avg Job Value ($)</label>
                  <input value={DEMO_PROFILE.avgJobValue} readOnly />
                </div>
                <div className="fg">
                  <label>Phone Number (for SMS reminders)</label>
                  <input value="" readOnly placeholder="Not set in demo" />
                </div>
              </div>

              <div className="divider" />
              <div className="stitle">Business Model</div>
              <div className="g2">
                {CELLS.map(c => (
                  <div className="fg full" key={c.k}>
                    <label>{c.l}</label>
                    <textarea rows={3} value={DEMO_CANVAS[c.k] || ""} readOnly />
                  </div>
                ))}
              </div>

              <div className="divider" />
              <div className="stitle">Financials (Annual)</div>
              <div className="g2">
                <div className="fg">
                  <label>Annual Revenue ($)</label>
                  <input value={DEMO_PROFILE.annualRev} readOnly />
                </div>
                <div className="fg">
                  <label>Cost of Goods ($)</label>
                  <input value={DEMO_PROFILE.cogs} readOnly />
                </div>
                <div className="fg">
                  <label>Operating Expenses ($)</label>
                  <input value={DEMO_PROFILE.opEx} readOnly />
                </div>
                <div className="fg">
                  <label>Net Income ($)</label>
                  <input value={DEMO_PROFILE.netIncome} readOnly />
                </div>
                <div className="fg full">
                  <label>Biggest Pain Points</label>
                  <textarea value={DEMO_PROFILE.painPoints} readOnly />
                </div>
              </div>

              <div style={{ marginTop: "1.5rem", textAlign: "center" }}>
                <a
                  href="https://tradestack.biz"
                  style={{
                    display: "inline-block",
                    fontFamily: "'Barlow Condensed',sans-serif",
                    fontWeight: 700,
                    fontSize: ".88rem",
                    letterSpacing: ".14em",
                    textTransform: "uppercase",
                    background: "#f5a623",
                    color: "#0e0e0e",
                    padding: ".85rem 2rem",
                    borderRadius: "3px",
                    textDecoration: "none",
                    transition: "background .15s",
                  }}
                >
                  Try TradeStack Free →
                </a>
              </div>
            </>
          )}

          {/* -- CANVAS TAB ------------------------------------------------- */}
          {tab === "canvas" && (
            <>
              <div className="stitle">Lean Canvas — {DEMO_PROFILE.bizName}</div>
              <div className="canvas">
                {CELLS.map(c => (
                  <div key={c.k} className="cc">
                    <div className="cc-top">
                      <div className="cc-lbl">{c.l}</div>
                      <button
                        className={`score-badge ${scoreClass(DEMO_SCORES[c.k]?.score)}`}
                        style={{ cursor: "default" }}
                      >
                        {DEMO_SCORES[c.k]?.score ?? "--"}
                      </button>
                    </div>
                    {DEMO_SCORES[c.k]?.preview && (
                      <div className="cc-preview">{DEMO_SCORES[c.k].preview}</div>
                    )}
                    <textarea
                      className="cc-val"
                      value={DEMO_CANVAS[c.k] || ""}
                      readOnly
                    />
                  </div>
                ))}
              </div>

              <div style={{ marginTop: "1.5rem", textAlign: "center" }}>
                <a
                  href="https://tradestack.biz"
                  style={{
                    display: "inline-block",
                    fontFamily: "'Barlow Condensed',sans-serif",
                    fontWeight: 700,
                    fontSize: ".88rem",
                    letterSpacing: ".14em",
                    textTransform: "uppercase",
                    background: "#f5a623",
                    color: "#0e0e0e",
                    padding: ".85rem 2rem",
                    borderRadius: "3px",
                    textDecoration: "none",
                  }}
                >
                  Try TradeStack Free →
                </a>
              </div>
            </>
          )}

          {/* -- OPPORTUNITIES TAB ------------------------------------------ */}
          {tab === "opportunities" && (
            <>
              {Object.entries(groupedOpps).map(([key, group]) =>
                group.cards.length === 0 ? null : (
                  <div key={key} className="opp-section">
                    <div className="opp-section-title">{group.label}</div>
                    {group.cards.map(opp => (
                      <div key={opp.id} className="opp-card">
                        <div className="opp-card-top">
                          <div className="opp-title">{opp.title}</div>
                          <div className={`opp-impact imp-${opp.impact[0]}`}>{opp.impact}</div>
                        </div>
                        <div className="opp-insight">{opp.insight}</div>
                        <button
                          className="opp-cta"
                          onClick={() => goToTab("goals")}
                        >
                          Make it a Goal
                        </button>
                      </div>
                    ))}
                  </div>
                )
              )}

              <div style={{ marginTop: "1.5rem", textAlign: "center" }}>
                <a
                  href="https://tradestack.biz"
                  style={{
                    display: "inline-block",
                    fontFamily: "'Barlow Condensed',sans-serif",
                    fontWeight: 700,
                    fontSize: ".88rem",
                    letterSpacing: ".14em",
                    textTransform: "uppercase",
                    background: "#f5a623",
                    color: "#0e0e0e",
                    padding: ".85rem 2rem",
                    borderRadius: "3px",
                    textDecoration: "none",
                  }}
                >
                  Try TradeStack Free →
                </a>
              </div>
            </>
          )}

          {/* -- GOALS TAB -------------------------------------------------- */}
          {tab === "goals" && (
            <>
              <div className="money-unlocked">
                <span className="mu-label">Money Unlocked</span>
                <span className="mu-value">$0</span>
              </div>

              <div className="goal-card">
                <div className="goal-top">
                  <input
                    className="goal-title-input"
                    value={DEMO_GOAL.title}
                    readOnly
                  />
                </div>
                <div className="goal-meta">
                  <span className="goal-status gs-ip">In Progress</span>
                  <div className="goal-value-wrap">
                    <span className="goal-value-label">Est. Value</span>
                    <span style={{ color: "#4caf82", fontSize: ".92rem" }}>$</span>
                    <input
                      className="goal-value-input"
                      type="text"
                      value="52,000"
                      readOnly
                    />
                    <span className="goal-value-label">/yr</span>
                  </div>
                </div>

                <div className="goal-steps">
                  {DEMO_GOAL_STEPS.map(step => (
                    <div key={step.id} className="step-row">
                      <div className={`step-check ${step.status === "done" ? "done" : step.status === "in_progress" ? "ip" : ""}`}>
                        {step.status === "done" ? "✓" : step.status === "in_progress" ? "…" : ""}
                      </div>
                      <input
                        className="step-text-input"
                        value={step.step_text}
                        readOnly
                        style={{ textDecoration: step.status === "done" ? "line-through" : "none", color: step.status === "done" ? "#555" : "#ccc" }}
                      />
                      <span className="step-time">{step.days_to_complete}d</span>
                    </div>
                  ))}
                </div>

                <div className="sms-toggle-row">
                  <span className="sms-toggle-label">Daily SMS Reminder (8pm)</span>
                  <label className="toggle">
                    <input type="checkbox" readOnly defaultChecked={false} />
                    <span className="toggle-slider" />
                  </label>
                </div>
              </div>

              <div style={{ marginTop: "1.5rem", textAlign: "center" }}>
                <a
                  href="https://tradestack.biz"
                  style={{
                    display: "inline-block",
                    fontFamily: "'Barlow Condensed',sans-serif",
                    fontWeight: 700,
                    fontSize: ".88rem",
                    letterSpacing: ".14em",
                    textTransform: "uppercase",
                    background: "#f5a623",
                    color: "#0e0e0e",
                    padding: ".85rem 2rem",
                    borderRadius: "3px",
                    textDecoration: "none",
                  }}
                >
                  Try TradeStack Free →
                </a>
              </div>
            </>
          )}

        </div>{/* end .pg */}
      </div>

      {/* -- TOUR TOOLTIP --------------------------------------------------- */}
      {currentTip && (
        <div className="demo-tip">
          <div className="demo-tip-inner">
            <div className="demo-tip-eyebrow">{currentTip.eyebrow}</div>
            <div className="demo-tip-title">{currentTip.title}</div>
            <div className="demo-tip-body">{currentTip.body}</div>
            <div className="demo-tip-row">
              <button
                className="btn bp"
                style={{ width: "auto", fontSize: ".78rem", padding: ".5rem 1.25rem" }}
                onClick={dismissTip}
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
