import { useState } from "react";
import { DEMO_PROFILE, DEMO_CANVAS, DEMO_SCORES, DEMO_OPPORTUNITIES, DEMO_GOAL, DEMO_GOAL_STEPS } from '../demoData';

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

export default function DemoApp() {
  const [tab, setTab] = useState("input");
  const [goal, setGoal] = useState(DEMO_GOAL);
  const [steps, setSteps] = useState(DEMO_GOAL_STEPS);
  const [migratedOpp, setMigratedOpp] = useState(null);

  const moneyUnlocked = goal.status === "completed" ? parseFloat(goal.estimated_value) : 0;

  const cycleStep = (stepId) => {
    setSteps(prev => prev.map(s => {
      if (s.id !== stepId) return s;
      const next = s.status === 'not_started' ? 'in_progress'
                 : s.status === 'in_progress' ? 'done'
                 : 'not_started';
      return { ...s, status: next };
    }));
  };

  const makeGoal = (opp) => {
    setMigratedOpp(opp.id);
  };

  const scoreClass = (score) => {
    if (score == null) return 'score-none';
    if (score >= 70) return 'score-hi';
    if (score >= 40) return 'score-md';
    return 'score-lo';
  };

  return (
    <div className="app">
      <div className="hdr">
        <div className="logo">Trade<span>Stack</span></div>
        <div className="hdr-tagline">Obt<span className="ai">ai</span>n what others overlook.</div>
        <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:'.72rem',fontWeight:700,letterSpacing:'.12em',textTransform:'uppercase',color:'#f5a623',background:'rgba(245,166,35,0.15)',padding:'.2rem .5rem',borderRadius:'2px'}}>DEMO</div>
      </div>

      <div className="tabs">
        {["input","canvas","opportunities","goals"].map((t, i) => (
          <button key={t} className={`tab ${tab===t?"on":""}`} onClick={() => setTab(t)}>
            {["Input","Canvas","Opportunities","Goals"][i]}
          </button>
        ))}
      </div>

      <div className="pg">

        {/* INPUT TAB */}
        {tab === "input" && <>
          <div className="stitle">Your Business</div>
          <div className="g2">
            {[
              ["Business Name", DEMO_PROFILE.bizName],
              ["Trade / Specialty", DEMO_PROFILE.trade],
              ["City / Region", DEMO_PROFILE.location],
              ["Years Operating", DEMO_PROFILE.yearsOp],
              ["Employees", DEMO_PROFILE.employees],
              ["Top Service", DEMO_PROFILE.topService],
              ["Avg Job Value ($)", DEMO_PROFILE.avgJobValue],
            ].map(([label, value]) => (
              <div className="fg" key={label}>
                <label>{label}</label>
                <input readOnly value={value}/>
              </div>
            ))}
          </div>
          <div className="divider"/>
          <div className="stitle">Financials (Annual)</div>
          <div className="g2">
            {[
              ["Annual Revenue ($)", DEMO_PROFILE.annualRev],
              ["Cost of Goods ($)", DEMO_PROFILE.cogs],
              ["Operating Expenses ($)", DEMO_PROFILE.opEx],
              ["Net Income ($)", DEMO_PROFILE.netIncome],
            ].map(([label, value]) => (
              <div className="fg" key={label}>
                <label>{label}</label>
                <input readOnly value={value}/>
              </div>
            ))}
            <div className="fg full">
              <label>Biggest Pain Points</label>
              <textarea readOnly rows={2} value={DEMO_PROFILE.painPoints}/>
            </div>
          </div>
        </>}

        {/* CANVAS TAB */}
        {tab === "canvas" && <>
          <div className="stitle">Lean Canvas — {DEMO_PROFILE.bizName}</div>
          <div className="canvas">
            {CELLS.map(c => (
              <div key={c.k} className="cc">
                <div className="cc-top">
                  <div className="cc-lbl">{c.l}</div>
                  <button className={`score-badge ${scoreClass(DEMO_SCORES[c.k]?.score)}`}>
                    {DEMO_SCORES[c.k]?.score ?? '--'}
                  </button>
                </div>
                {DEMO_SCORES[c.k]?.preview && <div className="cc-preview">{DEMO_SCORES[c.k].preview}</div>}
                <textarea className="cc-val" readOnly value={DEMO_CANVAS[c.k] || ''} />
              </div>
            ))}
          </div>
        </>}

        {/* OPPORTUNITIES TAB */}
        {tab === "opportunities" && <>
          {DEMO_OPPORTUNITIES.map(opp => (
            <div key={opp.id} className="opp-card" style={{marginBottom:'.75rem'}}>
              {migratedOpp === opp.id
                ? <div className="opp-migrated">Added to Goals — check the Goals tab</div>
                : <>
                    <div className="opp-card-top">
                      <div className="opp-title">{opp.title}</div>
                      <div className={`opp-impact imp-${opp.impact_label?.[0]||'M'}`}>{opp.impact_label}</div>
                    </div>
                    <div className="opp-insight">{opp.insight}</div>
                    <button className="opp-cta" onClick={() => makeGoal(opp)}>Make it a Goal</button>
                  </>
              }
            </div>
          ))}
        </>}

        {/* GOALS TAB */}
        {tab === "goals" && <>
          <div className="money-unlocked">
            <span className="mu-label">Money Unlocked</span>
            <span className="mu-value">${moneyUnlocked.toLocaleString()}</span>
          </div>
          <div className="goal-card">
            <div className="goal-top">
              <input className="goal-title-input" readOnly value={goal.title}/>
            </div>
            <div className="goal-meta">
              <span className="goal-status gs-ip">In Progress</span>
              <div className="goal-value-wrap">
                <span className="goal-value-label">Est. Value</span>
                <span style={{color:'#4caf82',fontSize:'.92rem'}}>$</span>
                <input className="goal-value-input" readOnly type="number" value={goal.estimated_value}/>
                <span className="goal-value-label">/yr</span>
              </div>
            </div>
            <div className="goal-steps">
              {steps.map(step => (
                <div key={step.id} className="step-row">
                  <button
                    className={`step-check ${step.status==='done'?'done':step.status==='in_progress'?'ip':''}`}
                    onClick={() => cycleStep(step.id)}
                  >
                    {step.status==='done' ? '✓' : step.status==='in_progress' ? '...' : ''}
                  </button>
                  <input
                    className="step-text-input"
                    readOnly
                    value={step.step_text}
                    style={{textDecoration: step.status==='done'?'line-through':''}}
                  />
                </div>
              ))}
            </div>
          </div>
        </>}

      </div>
    </div>
  );
}
