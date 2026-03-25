import { useState, useEffect } from "react";
import { supabase } from './supabaseClient';
import LandingPage from './components/LandingPage';

async function callClaude(system, user) {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": import.meta.env.VITE_ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
      "anthropic-dangerous-direct-browser-access": "true",
    },
    body: JSON.stringify({ model:"claude-sonnet-4-20250514", max_tokens:1000, system, messages:[{role:"user",content:user}] }),
  });
  return (await res.json()).content?.[0]?.text || "";
}
function jp(text) {
  try { return JSON.parse(text.replace(/```json\n?|```\n?/g,"").trim()); } catch { return null; }
}

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@600;700;800&family=Barlow:wght@300;400;500&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
html{-webkit-text-size-adjust:100%;}
body{background:#0e0e0e;}
.app{min-height:100vh;background:#0e0e0e;color:#e8e0d4;font-family:'Barlow',sans-serif;font-weight:300;}
.hdr{background:#141414;border-bottom:2px solid #f5a623;padding:0 1rem;display:flex;align-items:center;justify-content:space-between;height:52px;position:sticky;top:0;z-index:100;}
.logo{font-family:'Barlow Condensed',sans-serif;font-weight:800;font-size:1.3rem;letter-spacing:.08em;text-transform:uppercase;color:#f5a623;}
.logo span{color:#e8e0d4;}
.tagline{font-family:'Barlow Condensed',sans-serif;font-weight:700;font-size:.75rem;letter-spacing:.1em;text-transform:uppercase;color:#888;margin-left:1rem;display:none;}
.tagline-ai{color:#f5a623;}
@media(min-width:768px){.tagline{display:inline;}}
.biz-tag{font-family:'Barlow Condensed',sans-serif;font-size:.7rem;font-weight:600;letter-spacing:.1em;text-transform:uppercase;color:#666;max-width:150px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
.tabs{display:flex;background:#111;border-bottom:1px solid #222;overflow-x:auto;-webkit-overflow-scrolling:touch;scrollbar-width:none;}
.tabs::-webkit-scrollbar{display:none;}
.tab{padding:.8rem 1rem;font-family:'Barlow Condensed',sans-serif;font-weight:600;font-size:.72rem;letter-spacing:.12em;text-transform:uppercase;color:#555;cursor:pointer;border:none;border-bottom:3px solid transparent;background:none;white-space:nowrap;flex-shrink:0;margin-bottom:-1px;transition:color .15s,border-color .15s;-webkit-tap-highlight-color:transparent;}
.tab:hover{color:#aaa;}
.tab.on{color:#f5a623;border-bottom-color:#f5a623;}
.tab:disabled{opacity:.3;cursor:not-allowed;}
.pg{padding:1rem;}
.g2{display:grid;grid-template-columns:1fr;gap:.9rem;}
.g3{display:grid;grid-template-columns:1fr;gap:.75rem;}
.full{grid-column:1/-1;}
@media(min-width:540px){.g2{grid-template-columns:1fr 1fr;gap:1.1rem;}.g3{grid-template-columns:repeat(3,1fr);}}
@media(min-width:768px){.pg{padding:1.5rem 2rem;}}
.stitle{font-family:'Barlow Condensed',sans-serif;font-weight:800;font-size:1rem;letter-spacing:.1em;text-transform:uppercase;color:#e8e0d4;margin-bottom:.9rem;display:flex;align-items:center;gap:.6rem;}
.stitle::after{content:'';flex:1;height:1px;background:#222;}
.divider{height:1px;background:#1e1e1e;margin:1.1rem 0;}
.fg{display:flex;flex-direction:column;gap:.3rem;}
label{font-family:'Barlow Condensed',sans-serif;font-size:.68rem;font-weight:700;letter-spacing:.16em;text-transform:uppercase;color:#888;}
input,select,textarea{background:#1a1a1a;border:1px solid #2a2a2a;color:#e8e0d4;padding:.7rem .85rem;font-family:'Barlow',sans-serif;font-size:1rem;font-weight:400;outline:none;border-radius:3px;width:100%;-webkit-appearance:none;appearance:none;transition:border-color .15s;}
input:focus,select:focus,textarea:focus{border-color:#f5a623;}
select{background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='%23888'/%3E%3C/svg%3E");background-repeat:no-repeat;background-position:right .8rem center;padding-right:2rem;}
select option{background:#1a1a1a;}
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
.canvas{display:grid;grid-template-columns:1fr;gap:2px;background:#222;border:1px solid #222;}
@media(min-width:560px){.canvas{grid-template-columns:repeat(3,1fr);}}
@media(min-width:900px){.canvas{grid-template-columns:repeat(5,1fr);}}
.cc{background:#141414;padding:.85rem;min-height:90px;}
.cc-lbl{font-family:'Barlow Condensed',sans-serif;font-size:.62rem;font-weight:700;letter-spacing:.18em;text-transform:uppercase;color:#f5a623;margin-bottom:.45rem;}
.cc-val{font-size:.8rem;line-height:1.5;color:#bbb;white-space:pre-wrap;}
.fc{background:#141414;border:1px solid #222;padding:.9rem;border-radius:3px;}
.fc-lbl{font-family:'Barlow Condensed',sans-serif;font-size:.63rem;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:#666;margin-bottom:.25rem;}
.fc-val{font-family:'Barlow Condensed',sans-serif;font-size:1.6rem;font-weight:700;line-height:1;}
.pos{color:#4caf82;}.neg{color:#e05252;}.neu{color:#e8e0d4;}
.fc-sub{font-size:.7rem;color:#555;margin-top:.2rem;}
.ib{background:#141414;border-left:3px solid #f5a623;padding:.8rem .95rem;margin-bottom:.6rem;border-radius:0 3px 3px 0;}
.ib.rd{border-left-color:#e05252;}.ib.gr{border-left-color:#4caf82;}
.ib-type{font-family:'Barlow Condensed',sans-serif;font-size:.6rem;font-weight:700;letter-spacing:.16em;text-transform:uppercase;margin-bottom:.25rem;}
.drain{color:#e05252;}.opp{color:#4caf82;}
.ib-text{font-size:.8rem;line-height:1.55;color:#ccc;}
.loader{display:flex;flex-direction:column;align-items:center;justify-content:center;padding:3rem 1rem;gap:.65rem;color:#555;}
.lbar{width:140px;height:2px;background:#222;position:relative;overflow:hidden;}
.lbar::after{content:'';position:absolute;left:-50%;width:50%;height:100%;background:#f5a623;animation:lslide 1.2s infinite;}
@keyframes lslide{from{left:-50%;}to{left:100%;}}
.llbl{font-family:'Barlow Condensed',sans-serif;font-size:.68rem;font-weight:700;letter-spacing:.18em;text-transform:uppercase;}
.empty{text-align:center;padding:2.5rem 1rem;color:#444;}
.regen{display:flex;justify-content:flex-end;margin-top:.65rem;}
.login-wrap{display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:80vh;gap:1.25rem;padding:2rem 1rem;text-align:center;}
.footer-tagline{text-align:center;padding:2rem 1rem;margin-top:3rem;border-top:1px solid #222;}
.footer-tagline-text{font-family:'Barlow Condensed',sans-serif;font-weight:700;font-size:.9rem;letter-spacing:.12em;text-transform:uppercase;color:#666;}
.footer-tagline-ai{color:#f5a623;}
@keyframes pulse{0%,100%{opacity:1;}50%{opacity:.2;}}
`;

const CELLS = [
  {k:"problem",l:"Problem"},{k:"solution",l:"Solution"},{k:"uvp",l:"Unique Value Prop"},
  {k:"unfair",l:"Unfair Advantage"},{k:"segments",l:"Customer Segments"},
  {k:"metrics",l:"Key Metrics"},{k:"channels",l:"Channels"},
  {k:"revenue",l:"Revenue Streams"},{k:"cost",l:"Cost Structure"},
];

export default function App() {
  const [tab,setTab]                   = useState("setup");
  const [p,setP]                       = useState({bizName:"",trade:"",location:"",yearsOp:"",employees:"",annualRev:"",cogs:"",opEx:"",netIncome:"",topService:"",avgJobValue:"",painPoints:""});
  const [submitted,setSubmitted]       = useState(false);
  const [canvas,setCanvas]             = useState({});
  const [cLoading,setCLoading]         = useState(false);
  const [insights,setInsights]         = useState([]);
  const [iLoading,setILoading]         = useState(false);
  const [comps,setComps]               = useState([]);
  const [compLoading,setCompLoading]   = useState(false);
  const [session,setSession]           = useState(null);
  const [authLoading,setAuthLoading]   = useState(true);

  useEffect(() => {
    const hashHasToken = window.location.hash.includes('access_token');
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        if (hashHasToken) {
          if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') setAuthLoading(false);
        } else {
          setAuthLoading(false);
        }
        if (session && hashHasToken) window.history.replaceState(null, '', window.location.pathname);
      }
    );
    const timeout = setTimeout(() => setAuthLoading(false), 4000);
    return () => { subscription.unsubscribe(); clearTimeout(timeout); };
  }, []);

  useEffect(() => {
    if (!session) return;
    supabase.from('businesses').select('*')
      .eq('user_id', session.user.id).single()
      .then(({ data }) => {
        if (data) {
          setP({
            bizName:    data.biz_name    || "",
            trade:      data.trade       || "",
            location:   data.location    || "",
            yearsOp:    data.years_op    || "",
            employees:  data.employees   || "",
            annualRev:  data.annual_rev  || "",
            cogs:       data.cogs        || "",
            opEx:       data.op_ex       || "",
            netIncome:  data.net_income  || "",
            topService: data.top_service || "",
            avgJobValue:data.avg_job_val || "",
            painPoints: data.pain_points || "",
          });
          setSubmitted(true);
        }
      });
  }, [session]);

  const ctx = () => `Business:${p.bizName}\nTrade:${p.trade}\nLocation:${p.location}\nYears:${p.yearsOp}\nEmployees:${p.employees}\nRevenue:$${p.annualRev}\nCOGS:$${p.cogs}\nOpEx:$${p.opEx}\nNetIncome:$${p.netIncome}\nTopService:${p.topService}\nAvgJob:$${p.avgJobValue}\nPains:${p.painPoints}`;
  const set = k => e => setP(v=>({...v,[k]:e.target.value}));

  const genCanvas = async () => {
    setCLoading(true);
    const r = await callClaude(`You are a business strategist. Return ONLY JSON with keys: problem,solution,uvp,unfair,segments,metrics,channels,revenue,cost. Values: 2-4 bullet points using •. No markdown.`,`Canvas for:\n${ctx()}`);
    setCanvas(jp(r)||{});
    setCLoading(false);
  };
  const genInsights = async () => {
    setILoading(true);
    const r = await callClaude(`Hard-nosed financial advisor. Return ONLY JSON array: [{type:"drain"|"opportunity",title:string,detail:string}] 4-6 items. Blunt and specific.`,`Analyze:\n${ctx()}`);
    setInsights(jp(r)||[]);
    setILoading(false);
  };

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin }
    });
    if (error) console.error('Login error:', error.message);
  };

  const saveProfile = async () => {
    if (!session) return;
    const { error } = await supabase.from('businesses').upsert({
      user_id:     session.user.id,
      biz_name:    p.bizName,
      trade:       p.trade,
      location:    p.location,
      years_op:    parseInt(p.yearsOp)    || null,
      employees:   parseInt(p.employees)  || null,
      annual_rev:  parseFloat(p.annualRev)|| null,
      cogs:        parseFloat(p.cogs)     || null,
      op_ex:       parseFloat(p.opEx)     || null,
      net_income:  parseFloat(p.netIncome)|| null,
      top_service: p.topService,
      avg_job_val: parseFloat(p.avgJobValue)|| null,
      pain_points: p.painPoints,
      updated_at:  new Date().toISOString(),
    }, { onConflict: 'user_id' });
    if (error) console.error('Save error:', error.message);
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setP({bizName:"",trade:"",location:"",yearsOp:"",employees:"",annualRev:"",cogs:"",opEx:"",netIncome:"",topService:"",avgJobValue:"",painPoints:""});
    setSubmitted(false);
    setCanvas({});
    setInsights([]);
    setComps([]);
    setTab("setup");
  };

  const submit = async () => {
    setSubmitted(true);
    setTab("canvas");
    await saveProfile();
    await genCanvas();
  };

  useEffect(()=>{ if(tab==="financial"&&insights.length===0&&submitted) genInsights(); },[tab]);

  const gross = p.annualRev&&p.cogs ? (parseFloat(p.annualRev)-parseFloat(p.cogs)).toFixed(0) : null;
  const gm    = gross&&p.annualRev  ? ((parseFloat(gross)/parseFloat(p.annualRev))*100).toFixed(1) : null;
  const nm    = p.netIncome&&p.annualRev ? ((parseFloat(p.netIncome)/parseFloat(p.annualRev))*100).toFixed(1) : null;

  if (authLoading) return (
    <>
      <style>{CSS}</style>
      <div className="app">
        <div className="hdr"><div className="logo">Trade<span>Stack</span></div></div>
        <div className="login-wrap">
          <div className="loader"><div className="lbar"/><div className="llbl">Loading...</div></div>
        </div>
      </div>
    </>
  );

  if (!session) return <LandingPage onSignIn={signInWithGoogle} />;

  return (
    <>
      <style>{CSS}</style>
      <div className="app">
        <div className="hdr">
          <div style={{display:'flex',alignItems:'center'}}>
            <div className="logo">Trade<span>Stack</span></div>
            <div className="tagline">Obt<span className="tagline-ai">ai</span>n what others overlook</div>
          </div>
          <div style={{display:'flex',alignItems:'center',gap:'.75rem'}}>
            {submitted && <div className="biz-tag">{p.bizName}</div>}
            <button className="btn bg" style={{padding:'.4rem .85rem',fontSize:'.65rem'}} onClick={signOut}>Sign Out</button>
          </div>
        </div>

        <div className="tabs">
          {[{id:"setup",l:"Setup"},{id:"canvas",l:"Canvas",lock:!submitted},{id:"financial",l:"Financials",lock:!submitted}].map(t=>(
            <button key={t.id} className={`tab ${tab===t.id?"on":""}`} disabled={!!t.lock} onClick={()=>!t.lock&&setTab(t.id)}>{t.l}</button>
          ))}
        </div>

        <div className="pg">
          {tab==="setup"&&<>
            <div className="stitle">Your Business</div>
            <div className="g2">
              <div className="fg"><label>Business Name</label><input value={p.bizName} onChange={set("bizName")} placeholder="e.g. Garcia Electric LLC"/></div>
              <div className="fg"><label>Trade / Specialty</label><input value={p.trade} onChange={set("trade")} placeholder="e.g. Plumbing, HVAC, Electrical..."/></div>
              <div className="fg"><label>City / Region</label><input value={p.location} onChange={set("location")} placeholder="e.g. Austin, TX"/></div>
              <div className="fg"><label>Years Operating</label><input type="number" inputMode="numeric" value={p.yearsOp} onChange={set("yearsOp")} placeholder="7"/></div>
              <div className="fg"><label>Employees</label><input type="number" inputMode="numeric" value={p.employees} onChange={set("employees")} placeholder="4"/></div>
              <div className="fg"><label>Top Service</label><input value={p.topService} onChange={set("topService")} placeholder="e.g. Drain cleaning"/></div>
              <div className="fg"><label>Avg Job Value ($)</label><input type="number" inputMode="numeric" value={p.avgJobValue} onChange={set("avgJobValue")} placeholder="1200"/></div>
            </div>
            <div className="divider"/>
            <div className="stitle">Financials (Annual)</div>
            <div className="g2">
              <div className="fg"><label>Annual Revenue ($)</label><input type="number" inputMode="numeric" value={p.annualRev} onChange={set("annualRev")} placeholder="420000"/></div>
              <div className="fg"><label>Cost of Goods ($)</label><input type="number" inputMode="numeric" value={p.cogs} onChange={set("cogs")} placeholder="180000"/></div>
              <div className="fg"><label>Operating Expenses ($)</label><input type="number" inputMode="numeric" value={p.opEx} onChange={set("opEx")} placeholder="95000"/></div>
              <div className="fg"><label>Net Income ($)</label><input type="number" inputMode="numeric" value={p.netIncome} onChange={set("netIncome")} placeholder="145000"/></div>
              <div className="fg full"><label>Biggest Pain Points</label><textarea value={p.painPoints} onChange={set("painPoints")} placeholder="Chasing invoices, no-shows, slow seasons..."/></div>
            </div>
            <div className="form-end"><button className="btn bp" onClick={submit} disabled={!p.bizName||!p.trade||!p.annualRev}>Generate My Profile</button></div>
          </>}

          {tab==="canvas"&&<>
            <div className="stitle">Lean Canvas — {p.bizName}</div>
            {cLoading
              ? <div className="loader"><div className="lbar"/><div className="llbl">Building canvas...</div></div>
              : <><div className="canvas">{CELLS.map(c=><div key={c.k} className="cc"><div className="cc-lbl">{c.l}</div><div className="cc-val">{canvas[c.k]||<span style={{color:"#333"}}>—</span>}</div></div>)}</div>
                  <div className="regen"><button className="btn bg" onClick={genCanvas}>Regenerate</button></div></>}
          </>}

          {tab==="financial"&&<>
            <div className="stitle">Financial Health</div>
            <div className="g3">
              <div className="fc"><div className="fc-lbl">Revenue</div><div className="fc-val neu">${parseInt(p.annualRev||0).toLocaleString()}</div><div className="fc-sub">Top line</div></div>
              <div className="fc"><div className="fc-lbl">Gross Profit</div><div className={`fc-val ${parseFloat(gross)>0?"pos":"neg"}`}>${parseInt(gross||0).toLocaleString()}</div><div className="fc-sub">{gm}% margin</div></div>
              <div className="fc"><div className="fc-lbl">Net Income</div><div className={`fc-val ${parseFloat(p.netIncome)>0?"pos":"neg"}`}>${parseInt(p.netIncome||0).toLocaleString()}</div><div className="fc-sub">{nm}% net</div></div>
            </div>
            <div className="stitle">Drains & Opportunities</div>
            {iLoading
              ? <div className="loader"><div className="lbar"/><div className="llbl">Analyzing...</div></div>
              : insights.length===0
                ? <div className="empty"><p>No analysis yet</p></div>
                : <>{insights.map((ins,i)=>(
                    <div key={i} className={`ib ${ins.type==="drain"?"rd":"gr"}`}>
                      <div className={`ib-type ${ins.type==="drain"?"drain":"opp"}`}>{ins.type==="drain"?"Drain":"Opportunity"} — {ins.title}</div>
                      <div className="ib-text">{ins.detail}</div>
                    </div>
                  ))}
                  <div className="regen"><button className="btn bg" onClick={genInsights}>Refresh</button></div></>}
          </>}
        </div>

        <div className="footer-tagline">
          <div className="footer-tagline-text">Obt<span className="footer-tagline-ai">ai</span>n what others overlook</div>
        </div>
      </div>
    </>
  );
}