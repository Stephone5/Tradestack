const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;600;700;800&family=Barlow:wght@300;400;500&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
html{-webkit-text-size-adjust:100%;scroll-behavior:smooth;}
body{background:#0e0e0e;}

.lp{background:#0e0e0e;color:#e8e0d4;font-family:'Barlow',sans-serif;font-weight:300;line-height:1.7;min-height:100vh;}

/* NAV */
.lp-nav{position:sticky;top:0;z-index:100;background:#0e0e0e;border-bottom:1px solid #1a1a1a;padding:.9rem 1.5rem;display:flex;align-items:center;justify-content:space-between;}
.lp-logo{font-family:'Barlow Condensed',sans-serif;font-weight:800;font-size:1.15rem;letter-spacing:.1em;text-transform:uppercase;color:#f5a623;}
.lp-logo span{color:#e8e0d4;}
.lp-nav-btn{font-family:'Barlow Condensed',sans-serif;font-weight:700;font-size:.72rem;letter-spacing:.14em;text-transform:uppercase;color:#0e0e0e;background:#f5a623;border:none;padding:.55rem 1.2rem;cursor:pointer;border-radius:2px;transition:background .15s;}
.lp-nav-btn:hover{background:#ffc04a;}

/* LAYOUT */
.lp-section{padding:5rem 1.5rem;border-bottom:1px solid #1a1a1a;}
.lp-section--alt{background:#111;}
.lp-section--tight{padding:3.5rem 1.5rem;border-bottom:1px solid #1a1a1a;}
.lp-inner{max-width:680px;margin:0 auto;}
.lp-inner--wide{max-width:900px;margin:0 auto;}

/* TYPE */
.lp-eyebrow{font-family:'Barlow Condensed',sans-serif;font-size:.65rem;font-weight:700;letter-spacing:.22em;text-transform:uppercase;color:#f5a623;margin-bottom:1.1rem;}
.lp-h1{font-family:'Barlow Condensed',sans-serif;font-weight:800;font-size:clamp(2.2rem,6vw,3.6rem);line-height:1.05;letter-spacing:.01em;text-transform:uppercase;color:#e8e0d4;margin-bottom:1.4rem;}
.lp-h1 span{color:#f5a623;}
.lp-h2{font-family:'Barlow Condensed',sans-serif;font-weight:800;font-size:clamp(1.4rem,4vw,2rem);line-height:1.15;letter-spacing:.03em;text-transform:uppercase;color:#e8e0d4;margin-bottom:1.1rem;}
.lp-h3{font-family:'Barlow Condensed',sans-serif;font-weight:700;font-size:.78rem;letter-spacing:.16em;text-transform:uppercase;color:#f5a623;margin-bottom:.4rem;}
.lp-p{font-size:.95rem;color:#888;margin-bottom:1rem;line-height:1.7;}
.lp-p:last-child{margin-bottom:0;}
.lp-p strong{color:#e8e0d4;font-weight:500;}

/* HERO */
.lp-hero{padding:6rem 1.5rem 5rem;border-bottom:1px solid #1a1a1a;}
.lp-hero-sub{font-size:1.05rem;color:#888;max-width:540px;margin-bottom:2.2rem;line-height:1.65;}
.lp-cta{display:inline-block;font-family:'Barlow Condensed',sans-serif;font-weight:700;font-size:.85rem;letter-spacing:.14em;text-transform:uppercase;color:#0e0e0e;background:#f5a623;border:none;padding:1rem 2rem;cursor:pointer;border-radius:2px;transition:background .15s;text-align:center;}
.lp-cta:hover{background:#ffc04a;}
.lp-cta--wide{width:100%;}
.lp-cta--ghost{background:transparent;color:#555;border:1px solid #2a2a2a;color:#555;}
.lp-cta--ghost:hover{border-color:#444;color:#888;background:transparent;}
.lp-hero-note{margin-top:.85rem;font-size:.72rem;color:#444;letter-spacing:.06em;}

/* GUIDE BAR */
.lp-bar{width:2.5rem;height:3px;background:#f5a623;margin-bottom:1.5rem;}

/* STEPS */
.lp-steps{margin-top:2.5rem;display:flex;flex-direction:column;}
.lp-step{display:grid;grid-template-columns:3.5rem 1fr;gap:0 1.25rem;padding:1.75rem 0;border-top:1px solid #1a1a1a;}
.lp-step:last-child{border-bottom:1px solid #1a1a1a;}
.lp-step-num{font-family:'Barlow Condensed',sans-serif;font-weight:800;font-size:2rem;color:#222;line-height:1;padding-top:.15rem;}

/* PLANS */
.lp-plans-grid{display:grid;grid-template-columns:1fr;gap:1px;background:#1e1e1e;margin-top:2.5rem;}
@media(min-width:600px){.lp-plans-grid{grid-template-columns:1fr 1fr;}}
.lp-plan{background:#0e0e0e;padding:2rem 1.75rem;}
.lp-plan--premium{background:#111;border-top:3px solid #f5a623;}
.lp-plan-label{font-family:'Barlow Condensed',sans-serif;font-weight:800;font-size:.78rem;letter-spacing:.18em;text-transform:uppercase;color:#555;margin-bottom:.25rem;}
.lp-plan--premium .lp-plan-label{color:#f5a623;}
.lp-plan-price{font-family:'Barlow Condensed',sans-serif;font-weight:800;font-size:1.8rem;color:#e8e0d4;margin-bottom:1.5rem;line-height:1;}
.lp-plan-price span{font-size:.75rem;font-weight:400;color:#555;letter-spacing:.06em;}
.lp-plan-items{list-style:none;display:flex;flex-direction:column;gap:.7rem;margin-bottom:1.5rem;}
.lp-plan-items li{font-size:.85rem;color:#777;padding-left:1.1rem;position:relative;line-height:1.4;}
.lp-plan-items li::before{content:'\\2014';position:absolute;left:0;color:#333;}
.lp-plan--premium .lp-plan-items li{color:#bbb;}
.lp-plan--premium .lp-plan-items li::before{color:#f5a623;}
.lp-plan-note{font-size:.75rem;color:#555;font-style:italic;line-height:1.5;margin-bottom:1.25rem;}

/* STAKES */
.lp-stakes-quote{border-left:3px solid #e05252;padding:1.1rem 1.25rem;margin-bottom:1.5rem;background:#0f0d0d;}

/* FINAL CTA */
.lp-final{text-align:center;padding:6rem 1.5rem;background:#111;}
.lp-final .lp-p{max-width:420px;margin:0 auto 2rem;}

/* FOOTER */
.lp-footer{background:#0e0e0e;border-top:1px solid #1a1a1a;padding:1.75rem 1.5rem;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:.75rem;}
.lp-footer-logo{font-family:'Barlow Condensed',sans-serif;font-weight:800;font-size:.9rem;letter-spacing:.1em;text-transform:uppercase;color:#333;}
.lp-footer-logo span{color:#2a2a2a;}
.lp-footer-note{font-size:.65rem;color:#333;letter-spacing:.08em;}
`;

export default function LandingPage({ onSignIn }) {
  return (
    <>
      <style>{CSS}</style>
      <div className="lp">

        {/* NAV */}
        <nav className="lp-nav">
          <div className="lp-logo">Trade<span>Stack</span></div>
          <button className="lp-nav-btn" onClick={onSignIn}>Sign Up / Login</button>
        </nav>

        {/* HERO */}
        <section className="lp-hero">
          <div className="lp-inner">
            <div className="lp-eyebrow">Business Intelligence for Small Business</div>
            <h1 className="lp-h1">You work too hard<br/>to not know <span>where your<br/>money goes.</span></h1>
            <p className="lp-hero-sub">Most small business owners have no idea which 20% of their effort produces 80% of their results. TradeStack finds it {'\u2014'} in minutes, not months.</p>
            <button className="lp-cta" onClick={onSignIn}>Sign Up / Login</button>
            <p className="lp-hero-note">No credit card required. Takes about three minutes to set up.</p>
          </div>
        </section>

        {/* PROBLEM */}
        <section className="lp-section">
          <div className="lp-inner">
            <div className="lp-eyebrow">The Problem</div>
            <h2 className="lp-h2">You didn't start a business to spend your evenings lost in numbers you can't make sense of.</h2>
            <p className="lp-p">You know something's off. Maybe margins feel thin. Maybe revenue looks fine on paper but the account never quite catches up. Maybe you've thought about getting strategic {'\u2014'} a real plan, not just survival mode {'\u2014'} but between the jobs, the calls, the invoices, and the people, there's never a clean hour to think.</p>
            <p className="lp-p">And now everyone's talking about AI. Another thing to learn. Another thing to fall behind on.</p>
            <p className="lp-p"><strong>You're not behind. You just haven't had the right tool yet.</strong></p>
          </div>
        </section>

        {/* GUIDE */}
        <section className="lp-section lp-section--alt">
          <div className="lp-inner">
            <div className="lp-eyebrow">The Guide</div>
            <div className="lp-bar"></div>
            <h2 className="lp-h2">TradeStack was built for exactly where you are.</h2>
            <p className="lp-p">We took the strategy frameworks that consultants charge thousands of dollars to deliver and made them work from the numbers you already know. No jargon. No three-day workshops. No MBA required.</p>
            <p className="lp-p">You enter what you know. We show you what it means. You decide what to do about it.</p>
            <p className="lp-p"><strong>That's it.</strong></p>
          </div>
        </section>

        {/* PLAN */}
        <section className="lp-section">
          <div className="lp-inner--wide">
            <div className="lp-eyebrow">The Process</div>
            <h2 className="lp-h2">Three steps. That's the whole process.</h2>
            <div className="lp-steps">
              <div className="lp-step">
                <div className="lp-step-num">01</div>
                <div>
                  <div className="lp-h3">Enter your numbers</div>
                  <p className="lp-p">Takes about three minutes. Business basics, a few financial figures, what you sell and what it costs you. Nothing you don't already know.</p>
                </div>
              </div>
              <div className="lp-step">
                <div className="lp-step-num">02</div>
                <div>
                  <div className="lp-h3">See your business clearly</div>
                  <p className="lp-p">TradeStack builds your Lean Canvas {'\u2014'} a single-page picture of your entire business strategy. Every section is scored. Every score points to something real: a leak, a gap, or an opportunity waiting to be taken.</p>
                </div>
              </div>
              <div className="lp-step">
                <div className="lp-step-num">03</div>
                <div>
                  <div className="lp-h3">Take action on what actually matters</div>
                  <p className="lp-p">See exactly where money is leaking and where growth is waiting. Pick what to fix. TradeStack turns it into a step-by-step plan with time estimates and SMS check-ins to keep you moving {'\u2014'} one action at a time.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FREE VS PREMIUM */}
        <section className="lp-section--tight lp-section--alt">
          <div className="lp-inner--wide">
            <div className="lp-eyebrow">Pricing</div>
            <h2 className="lp-h2">Start free. Upgrade when you're ready.</h2>
            <div className="lp-plans-grid">
              <div className="lp-plan">
                <div className="lp-plan-label">Free {'\u2014'} Always</div>
                <div className="lp-plan-price">$0 <span>/ forever</span></div>
                <ul className="lp-plan-items">
                  <li>Your Lean Canvas, built from your numbers</li>
                  <li>A full picture of your business strategy in one place</li>
                  <li>Edit and refine every section yourself</li>
                  <li>See your scores {'\u2014'} and know something's there</li>
                </ul>
                <button className="lp-cta lp-cta--wide lp-cta--ghost" onClick={onSignIn}>Sign Up / Login</button>
              </div>
              <div className="lp-plan lp-plan--premium">
                <div className="lp-plan-label">Premium</div>
                <div className="lp-plan-price">$9.98 <span>/ month</span></div>
                <ul className="lp-plan-items">
                  <li>Every money leak in your business, named and ranked</li>
                  <li>Every revenue opportunity you haven't touched yet</li>
                  <li>Each opportunity converted into a step-by-step action plan</li>
                  <li>AI-estimated dollar value on every fix and every opportunity</li>
                  <li>Daily SMS check-ins so your goals don't die in a tab</li>
                  <li>A running total of money saved and revenue unlocked</li>
                </ul>
                <p className="lp-plan-note">Most users find more than their subscription cost in the first week.</p>
                <button className="lp-cta lp-cta--wide" onClick={onSignIn}>Start Premium</button>
              </div>
            </div>
          </div>
        </section>

        {/* STAKES */}
        <section className="lp-section">
          <div className="lp-inner">
            <div className="lp-eyebrow">The Cost of Not Knowing</div>
            <div className="lp-stakes-quote">
              <p className="lp-p" style={{marginBottom:0}}>Every month you operate without a clear picture is a month you work harder than you need to. Money leaks quietly. Margins erode. Growth opportunities sit right next to you, unrecognized.</p>
            </div>
            <p className="lp-p">The businesses that pull ahead aren't always the ones that work more. They're the ones that know which work matters.</p>
            <p className="lp-p"><strong>That clarity is no longer reserved for businesses with a CFO or a consultant on retainer. It's what TradeStack is for.</strong></p>
          </div>
        </section>

        {/* FINAL CTA */}
        <section className="lp-final">
          <div className="lp-inner">
            <div className="lp-eyebrow">Get Started</div>
            <h2 className="lp-h2">Your business has answers in it.<br/>Let's find them.</h2>
            <p className="lp-p">Free to start. No credit card. Three minutes to your Lean Canvas.</p>
            <button className="lp-cta" onClick={onSignIn}>Sign Up / Login</button>
          </div>
        </section>

        {/* FOOTER */}
        <footer className="lp-footer">
          <div className="lp-footer-logo">Trade<span>Stack</span></div>
          <div className="lp-footer-note">tradestack.biz</div>
        </footer>

      </div>
    </>
  );
}
