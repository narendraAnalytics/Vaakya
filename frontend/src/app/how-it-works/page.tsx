'use client';

export default function HowItWorksPage() {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,400;0,500;0,600;0,700;0,800;1,700&family=Playfair+Display:ital,wght@1,700;1,800&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html, body { font-family: 'Plus Jakarta Sans', sans-serif; background: #FFF8F0; color: #2D1200; overflow-x: hidden; }

        @keyframes floatA  { 0%,100%{transform:translateY(0px) rotate(0deg)}  50%{transform:translateY(-18px) rotate(2deg)} }
        @keyframes floatB  { 0%,100%{transform:translateY(-8px) rotate(-2deg)} 50%{transform:translateY(10px) rotate(3deg)} }
        @keyframes pulse   { 0%,100%{opacity:.65;transform:scale(1)} 50%{opacity:1;transform:scale(1.08)} }
        @keyframes fadeUp  { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
        @keyframes dashFlow { to { stroke-dashoffset: -32; } }
        @keyframes shimmer { 0%{background-position:-300% center} 100%{background-position:300% center} }
        @keyframes spin    { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }

        .hiw-hover-lift { transition: transform .22s ease, box-shadow .22s ease; cursor: pointer; }
        .hiw-hover-lift:hover { transform: translateY(-5px); }
        .hiw-wf-card { transition: transform .2s ease, box-shadow .2s ease; }
        .hiw-wf-card:hover { transform: translateY(-3px); box-shadow: 0 10px 32px rgba(240,84,60,.1) !important; }
        .hiw-agent-node { transition: transform .18s ease; cursor: default; }
        .hiw-agent-node:hover { transform: scale(1.1); }
        .hiw-cta-btn { border: none; cursor: pointer; transition: transform .2s ease, box-shadow .2s ease; font-family: 'Plus Jakarta Sans', sans-serif; }
        .hiw-cta-btn:hover { transform: translateY(-2px); box-shadow: 0 14px 38px rgba(240,84,60,.36) !important; }

        @media (max-width: 960px) {
          .hiw-hero-grid { flex-direction: column !important; }
          .hiw-hero-illo { display: none !important; }
          .hiw-workflow-cols { flex-direction: column !important; }
          .hiw-agents-row { flex-wrap: wrap !important; justify-content: center !important; }
          .hiw-pow-grid { grid-template-columns: repeat(2,1fr) !important; }
          .hiw-kpi-row { flex-wrap: wrap !important; }
        }
        @media (max-width: 640px) {
          .hiw-tab-row { flex-direction: column !important; }
          .hiw-pow-grid { grid-template-columns: 1fr !important; }
          .hiw-cta-banner { flex-direction: column !important; text-align: center !important; }
        }
      ` }} />

      <div style={{ minHeight: '100vh', background: 'linear-gradient(155deg,#FFF8F0 0%,#FFFAF5 28%,#FFF5EF 55%,#FFF8F5 78%,#FFFAF0 100%)', position: 'relative', overflowX: 'hidden' }}>

        {/* AMBIENT BG */}
        <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', overflow: 'hidden', zIndex: 0 }}>
          <div style={{ position: 'absolute', top: -200, right: -150, width: 760, height: 760, background: 'radial-gradient(circle,rgba(255,195,140,.28) 0%,transparent 65%)', animation: 'floatA 12s ease-in-out infinite' }} />
          <div style={{ position: 'absolute', top: '32%', left: -180, width: 640, height: 640, background: 'radial-gradient(circle,rgba(255,155,170,.2) 0%,transparent 62%)', animation: 'floatA 15s ease-in-out infinite reverse' }} />
          <div style={{ position: 'absolute', bottom: -100, left: '30%', width: 720, height: 560, background: 'radial-gradient(circle,rgba(255,220,100,.16) 0%,transparent 66%)', animation: 'floatA 13s ease-in-out infinite' }} />
          <div style={{ position: 'absolute', top: '7%', right: '16%', width: 200, height: 175, backgroundImage: 'radial-gradient(circle,rgba(240,84,60,.16) 1.4px,transparent 1.4px)', backgroundSize: '20px 20px' }} />
          <div style={{ position: 'absolute', top: '46%', left: '5%', width: 160, height: 140, backgroundImage: 'radial-gradient(circle,rgba(245,159,11,.2) 1.2px,transparent 1.2px)', backgroundSize: '18px 18px' }} />
          <div style={{ position: 'absolute', bottom: '18%', right: '6%', width: 140, height: 120, backgroundImage: 'radial-gradient(circle,rgba(244,63,110,.15) 1.2px,transparent 1.2px)', backgroundSize: '16px 16px' }} />
        </div>

        {/* HEADER */}
        <header style={{ position: 'sticky', top: 0, zIndex: 100, backdropFilter: 'blur(22px)', WebkitBackdropFilter: 'blur(22px)', background: 'rgba(255,248,240,.88)', borderBottom: '1px solid rgba(240,84,60,.1)' }}>
          <div style={{ maxWidth: 1240, margin: '0 auto', padding: '0 48px', height: 68, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <a href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
              <div style={{ width: 38, height: 38, background: 'linear-gradient(135deg,#FFE8CC,#FFCFA0)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 10px rgba(245,159,11,.25)' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M12 2L4 6v6c0 5.5 3.5 10.7 8 12 4.5-1.3 8-6.5 8-12V6L12 2z" fill="#F59F0B"/><path d="M9 12l2 2 4-4" stroke="#FFF8F0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </div>
              <div>
                <div style={{ fontSize: 18, fontWeight: 800, color: '#2D1200', letterSpacing: '-.5px', lineHeight: 1.1 }}>VAAKYA</div>
                <div style={{ fontSize: 10, fontWeight: 500, color: '#9A6040', letterSpacing: '.2px' }}>AI Legal for Indian SMBs</div>
              </div>
            </a>
            <a href="/" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13.5, fontWeight: 600, color: '#F0543C', textDecoration: 'none', padding: '8px 18px', border: '1.5px solid rgba(240,84,60,.25)', borderRadius: 100, background: 'rgba(240,84,60,.04)' }}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M9 2L4 7L9 12" stroke="#F0543C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              Back to Home
            </a>
          </div>
        </header>

        {/* HERO */}
        <section style={{ position: 'relative', zIndex: 1, maxWidth: 1240, margin: '0 auto', padding: '64px 48px 48px' }}>
          <div className="hiw-hero-grid" style={{ display: 'flex', alignItems: 'center', gap: 48 }}>

            {/* LEFT: Copy */}
            <div style={{ flex: 1, minWidth: 0, animation: 'fadeUp .7s ease both' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 9, background: 'linear-gradient(135deg,rgba(245,159,11,.1),rgba(240,84,60,.09))', border: '1.5px solid rgba(240,84,60,.24)', borderRadius: 100, padding: '7px 22px', marginBottom: 28 }}>
                <span style={{ fontSize: 11, color: '#F59F0B', fontWeight: 700 }}>✦</span>
                <span style={{ fontSize: 12.5, fontWeight: 700, letterSpacing: '.7px', background: 'linear-gradient(135deg,#F59F0B,#F0543C)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>8 AI AGENTS · END-TO-END LEGAL</span>
                <span style={{ fontSize: 11, color: '#F59F0B', fontWeight: 700 }}>✦</span>
              </div>

              <h1 style={{ fontSize: 'clamp(38px,5vw,70px)', fontWeight: 800, lineHeight: 1.07, letterSpacing: '-2.5px', color: '#2D1200', marginBottom: 20 }}>
                How <em style={{ fontFamily: "'Playfair Display',serif", fontStyle: 'italic', fontWeight: 800, background: 'linear-gradient(135deg,#F0543C 0%,#F43F6E 50%,#F59F0B 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Vaakya</em> Works
              </h1>

              <p style={{ fontSize: 17, color: '#8A5030', lineHeight: 1.7, maxWidth: 480, marginBottom: 36, fontWeight: 400 }}>
                From your request to a signed, secure contract — 8 AI agents work together to handle everything accurately, intelligently, and autonomously.
              </p>

              {/* KPI Row */}
              <div className="hiw-kpi-row" style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                <div className="hiw-hover-lift" style={{ background: 'rgba(255,252,244,.9)', backdropFilter: 'blur(18px)', border: '1.5px solid rgba(245,159,11,.22)', borderRadius: 20, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 14, boxShadow: '0 3px 18px rgba(245,159,11,.09)' }}>
                  <div style={{ width: 46, height: 46, borderRadius: '50%', background: 'linear-gradient(135deg,#FFF0CC,#F59F0B)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 4px 14px rgba(245,159,11,.35)' }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="#FFF8F0" strokeWidth="2"/><polyline points="12,6 12,12 16,14" stroke="#FFF8F0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </div>
                  <div>
                    <div style={{ fontSize: 22, fontWeight: 800, color: '#D97706', letterSpacing: '-.8px', lineHeight: 1.1 }}>2 Min</div>
                    <div style={{ fontSize: 11, fontWeight: 500, color: '#9A6040', lineHeight: 1.4 }}>Average Draft<br/>Generation</div>
                  </div>
                </div>

                <div className="hiw-hover-lift" style={{ background: 'rgba(255,244,248,.9)', backdropFilter: 'blur(18px)', border: '1.5px solid rgba(244,63,110,.2)', borderRadius: 20, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 14, boxShadow: '0 3px 18px rgba(244,63,110,.08)' }}>
                  <div style={{ width: 46, height: 46, borderRadius: '50%', background: 'linear-gradient(135deg,#FFD0E4,#F43F6E)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 4px 14px rgba(244,63,110,.35)' }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="#FFF8F0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M9 12l2 2 4-4" stroke="#FFF8F0" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </div>
                  <div>
                    <div style={{ fontSize: 22, fontWeight: 800, color: '#E11D48', letterSpacing: '-.8px', lineHeight: 1.1 }}>94%</div>
                    <div style={{ fontSize: 11, fontWeight: 500, color: '#9A6040', lineHeight: 1.4 }}>Risk Detection<br/>Accuracy</div>
                  </div>
                </div>

                <div className="hiw-hover-lift" style={{ background: 'rgba(244,255,250,.9)', backdropFilter: 'blur(18px)', border: '1.5px solid rgba(14,168,130,.18)', borderRadius: 20, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 14, boxShadow: '0 3px 18px rgba(14,168,130,.08)' }}>
                  <div style={{ width: 46, height: 46, borderRadius: '50%', background: 'linear-gradient(135deg,#C4F8E8,#0EA882)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 4px 14px rgba(14,168,130,.35)' }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M4 6h16M4 10h16M4 14h10" stroke="#FFF8F0" strokeWidth="2.2" strokeLinecap="round"/></svg>
                  </div>
                  <div>
                    <div style={{ fontSize: 22, fontWeight: 800, color: '#0EA882', letterSpacing: '-.8px', lineHeight: 1.1 }}>50+</div>
                    <div style={{ fontSize: 11, fontWeight: 500, color: '#9A6040', lineHeight: 1.4 }}>Pre-built Legal<br/>Clause Library</div>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT: Cloudinary illustration */}
            <div className="hiw-hero-illo" style={{ flex: '0 0 400px', display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'floatA 9s ease-in-out infinite' }}>
              <img
                src="https://res.cloudinary.com/dkqbzwicr/image/upload/v1782475954/howitworks_uofngv.png"
                alt="How Vaakya Works"
                style={{ width: '100%', maxWidth: 380, objectFit: 'contain' }}
              />
            </div>

          </div>
        </section>

        {/* CHOOSE YOUR WORKFLOW */}
        <section style={{ position: 'relative', zIndex: 1, maxWidth: 1240, margin: '0 auto', padding: '16px 48px 40px' }}>
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
              <div style={{ height: 1.5, width: 44, background: 'linear-gradient(to right,transparent,rgba(240,84,60,.4))' }} />
              <span style={{ fontSize: 11, fontWeight: 700, color: '#F59F0B', letterSpacing: '.8px', textTransform: 'uppercase' }}>✦ Choose Your Workflow ✦</span>
              <div style={{ height: 1.5, width: 44, background: 'linear-gradient(to left,transparent,rgba(240,84,60,.4))' }} />
            </div>
            <h2 style={{ fontSize: 30, fontWeight: 800, color: '#2D1200', letterSpacing: '-.7px' }}>Choose Your Workflow</h2>
          </div>

          <div className="hiw-tab-row" style={{ display: 'flex', gap: 16, justifyContent: 'center' }}>
            {/* Tab 1 */}
            <div className="hiw-hover-lift" style={{ flex: 1, maxWidth: 340, background: 'rgba(255,252,244,.95)', border: '2px solid rgba(245,159,11,.5)', borderRadius: 22, padding: '22px 24px', display: 'flex', alignItems: 'center', gap: 16, boxShadow: '0 4px 18px rgba(245,159,11,.18)' }}>
              <div style={{ width: 48, height: 48, borderRadius: 14, background: 'linear-gradient(135deg,#FFF0CC,#F59F0B)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 3px 12px rgba(245,159,11,.35)' }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" stroke="#FFF8F0" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" stroke="#FFF8F0" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 800, color: '#D97706', marginBottom: 3 }}>Create New Contract</div>
                <div style={{ fontSize: 12, color: '#8A5030', fontWeight: 400 }}>Draft a new contract from scratch</div>
              </div>
            </div>

            {/* Tab 2 */}
            <div className="hiw-hover-lift" style={{ flex: 1, maxWidth: 340, background: 'rgba(255,248,240,.85)', border: '1.5px solid rgba(240,84,60,.2)', borderRadius: 22, padding: '22px 24px', display: 'flex', alignItems: 'center', gap: 16, boxShadow: '0 2px 12px rgba(240,84,60,.06)' }}>
              <div style={{ width: 48, height: 48, borderRadius: 14, background: 'linear-gradient(135deg,#FFE4C8,#EA580C)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 3px 12px rgba(234,88,12,.3)' }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" stroke="#FFF8F0" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/><polyline points="14,2 14,8 20,8" stroke="#FFF8F0" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/><line x1="16" y1="13" x2="8" y2="13" stroke="#FFF8F0" strokeWidth="2" strokeLinecap="round"/><line x1="16" y1="17" x2="8" y2="17" stroke="#FFF8F0" strokeWidth="2" strokeLinecap="round"/></svg>
              </div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 800, color: '#EA580C', marginBottom: 3 }}>Review Existing Contract</div>
                <div style={{ fontSize: 12, color: '#8A5030', fontWeight: 400 }}>Upload and review contracts</div>
              </div>
            </div>

            {/* Tab 3 */}
            <div className="hiw-hover-lift" style={{ flex: 1, maxWidth: 340, background: 'rgba(255,248,240,.85)', border: '1.5px solid rgba(244,63,110,.18)', borderRadius: 22, padding: '22px 24px', display: 'flex', alignItems: 'center', gap: 16, boxShadow: '0 2px 12px rgba(244,63,110,.05)' }}>
              <div style={{ width: 48, height: 48, borderRadius: 14, background: 'linear-gradient(135deg,#FFD0E4,#F43F6E)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 3px 12px rgba(244,63,110,.3)' }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M12 2L3 7l9 5 9-5-9-5z" stroke="#FFF8F0" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/><path d="M3 17l9 5 9-5" stroke="#FFF8F0" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/><path d="M3 12l9 5 9-5" stroke="#FFF8F0" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 800, color: '#E11D48', marginBottom: 3 }}>Resolve Dispute</div>
                <div style={{ fontSize: 12, color: '#8A5030', fontWeight: 400 }}>Resolve disputes and generate notices</div>
              </div>
            </div>
          </div>
        </section>

        {/* WORKFLOW AREA */}
        <section style={{ position: 'relative', zIndex: 1, maxWidth: 1240, margin: '0 auto', padding: '0 48px 72px' }}>
          <div className="hiw-workflow-cols" style={{ display: 'flex', gap: 22, alignItems: 'flex-start' }}>

            {/* LEFT: New Contract Workflow */}
            <div style={{ flex: '0 0 55%', background: 'rgba(255,252,244,.9)', backdropFilter: 'blur(22px)', border: '1.5px solid rgba(245,159,11,.22)', borderRadius: 28, padding: 30, boxShadow: '0 6px 32px rgba(245,159,11,.08)', overflow: 'hidden', position: 'relative' }}>
              <div style={{ position: 'absolute', top: -40, right: -40, width: 200, height: 200, background: 'radial-gradient(circle,rgba(245,159,11,.12) 0%,transparent 65%)', pointerEvents: 'none' }} />

              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 26 }}>
                <div style={{ width: 12, height: 12, borderRadius: '50%', background: 'linear-gradient(135deg,#F59F0B,#D97706)', boxShadow: '0 0 10px rgba(245,159,11,.6)' }} />
                <span style={{ fontSize: 15, fontWeight: 800, color: '#2D1200', letterSpacing: '-.3px' }}>New Contract Workflow</span>
              </div>

              {/* Row 1: Arambha → Rachana → Parisheelanam → Reflexion */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginBottom: 8, overflowX: 'auto', paddingBottom: 4 }}>
                {/* Arambha */}
                <div className="hiw-wf-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 7, flexShrink: 0 }}>
                  <div style={{ position: 'relative' }}>
                    <div style={{ width: 54, height: 54, borderRadius: '50%', background: 'linear-gradient(135deg,#FFF0CC,#F59F0B)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 16px rgba(245,159,11,.38)' }}>
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" stroke="#FFF8F0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><circle cx="12" cy="7" r="4" stroke="#FFF8F0" strokeWidth="2"/></svg>
                    </div>
                    <div style={{ position: 'absolute', top: -6, right: -6, width: 18, height: 18, borderRadius: '50%', background: '#F59F0B', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 8, fontWeight: 800, color: '#FFF8F0' }}>01</div>
                  </div>
                  <div style={{ textAlign: 'center' }}><div style={{ fontSize: 11.5, fontWeight: 700, color: '#2D1200' }}>Arambha</div><div style={{ fontSize: 10, color: '#8A5030' }}>Intake &amp; Classification</div></div>
                </div>
                <div style={{ flexShrink: 0, padding: '0 8px', marginBottom: 22 }}>
                  <svg width="28" height="16" viewBox="0 0 28 16" fill="none"><path d="M2 8H24M18 3L24 8L18 13" stroke="#F59F0B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="5,3"><animate attributeName="stroke-dashoffset" from="0" to="-32" dur="1.4s" repeatCount="indefinite"/></path></svg>
                </div>
                {/* Rachana */}
                <div className="hiw-wf-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 7, flexShrink: 0 }}>
                  <div style={{ position: 'relative' }}>
                    <div style={{ width: 54, height: 54, borderRadius: '50%', background: 'linear-gradient(135deg,#FFE4D8,#F0543C)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 16px rgba(240,84,60,.38)' }}>
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" stroke="#FFF8F0" strokeWidth="2" strokeLinecap="round"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" stroke="#FFF8F0" strokeWidth="2" strokeLinecap="round"/></svg>
                    </div>
                    <div style={{ position: 'absolute', top: -6, right: -6, width: 18, height: 18, borderRadius: '50%', background: '#F0543C', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 8, fontWeight: 800, color: '#FFF8F0' }}>02</div>
                  </div>
                  <div style={{ textAlign: 'center' }}><div style={{ fontSize: 11.5, fontWeight: 700, color: '#2D1200' }}>Rachana</div><div style={{ fontSize: 10, color: '#8A5030' }}>AI Drafting</div></div>
                </div>
                <div style={{ flexShrink: 0, padding: '0 8px', marginBottom: 22 }}>
                  <svg width="28" height="16" viewBox="0 0 28 16" fill="none"><path d="M2 8H24M18 3L24 8L18 13" stroke="#F0543C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="5,3"><animate attributeName="stroke-dashoffset" from="0" to="-32" dur="1.4s" repeatCount="indefinite"/></path></svg>
                </div>
                {/* Parisheelanam */}
                <div className="hiw-wf-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 7, flexShrink: 0 }}>
                  <div style={{ position: 'relative' }}>
                    <div style={{ width: 54, height: 54, borderRadius: '50%', background: 'linear-gradient(135deg,#FFE8CC,#EA580C)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 16px rgba(234,88,12,.38)' }}>
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><polyline points="1,4 1,10 7,10" stroke="#FFF8F0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M3.51 15a9 9 0 102.13-9.36L1 10" stroke="#FFF8F0" strokeWidth="2" strokeLinecap="round"/></svg>
                    </div>
                    <div style={{ position: 'absolute', top: -6, right: -6, width: 18, height: 18, borderRadius: '50%', background: '#EA580C', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 8, fontWeight: 800, color: '#FFF8F0' }}>03</div>
                  </div>
                  <div style={{ textAlign: 'center' }}><div style={{ fontSize: 11.5, fontWeight: 700, color: '#2D1200' }}>Parisheelanam</div><div style={{ fontSize: 10, color: '#8A5030' }}>Quality Review</div></div>
                </div>
                <div style={{ flexShrink: 0, padding: '0 8px', marginBottom: 22 }}>
                  <svg width="28" height="16" viewBox="0 0 28 16" fill="none"><path d="M2 8H24M18 3L24 8L18 13" stroke="#EA580C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="5,3"><animate attributeName="stroke-dashoffset" from="0" to="-32" dur="1.4s" repeatCount="indefinite"/></path></svg>
                </div>
                {/* Reflexion Loop */}
                <div className="hiw-wf-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 7, flexShrink: 0 }}>
                  <div style={{ position: 'relative' }}>
                    <div style={{ width: 54, height: 54, borderRadius: '50%', background: 'linear-gradient(135deg,#FFD0E4,#F43F6E)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 16px rgba(244,63,110,.38)' }}>
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" stroke="#FFF8F0" strokeWidth="2" strokeLinecap="round"/></svg>
                    </div>
                    <div style={{ position: 'absolute', top: -6, right: -6, width: 18, height: 18, borderRadius: '50%', background: '#F43F6E', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 8, fontWeight: 800, color: '#FFF8F0' }}>04</div>
                  </div>
                  <div style={{ textAlign: 'center' }}><div style={{ fontSize: 11.5, fontWeight: 700, color: '#2D1200' }}>Reflexion Loop</div><div style={{ fontSize: 10, color: '#8A5030' }}>Self-Improving Review</div></div>
                </div>
              </div>

              {/* Row 2: Parisheelanam Final + Parallel + Jokhim */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginBottom: 8, paddingLeft: 12 }}>
                {/* 05A */}
                <div className="hiw-wf-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 7, flexShrink: 0 }}>
                  <div style={{ position: 'relative' }}>
                    <div style={{ width: 54, height: 54, borderRadius: '50%', background: 'linear-gradient(135deg,#C4F8E8,#0EA882)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 16px rgba(14,168,130,.38)' }}>
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><polyline points="20,6 9,17 4,12" stroke="#FFF8F0" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </div>
                    <div style={{ position: 'absolute', top: -6, right: -6, width: 22, height: 18, borderRadius: 10, background: '#0EA882', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 7.5, fontWeight: 800, color: '#FFF8F0' }}>05A</div>
                  </div>
                  <div style={{ textAlign: 'center' }}><div style={{ fontSize: 11.5, fontWeight: 700, color: '#2D1200' }}>Parisheelanam</div><div style={{ fontSize: 10, color: '#8A5030' }}>Final Review</div></div>
                </div>
                <div style={{ flexShrink: 0, padding: '0 8px', marginBottom: 22 }}>
                  <svg width="28" height="16" viewBox="0 0 28 16" fill="none"><path d="M2 8H24M18 3L24 8L18 13" stroke="#0EA882" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="5,3"><animate attributeName="stroke-dashoffset" from="0" to="-32" dur="1.4s" repeatCount="indefinite"/></path></svg>
                </div>
                {/* 05B */}
                <div className="hiw-wf-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 7, flexShrink: 0 }}>
                  <div style={{ position: 'relative' }}>
                    <div style={{ width: 54, height: 54, borderRadius: '50%', background: 'linear-gradient(135deg,#FEECCC,#D97706)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 16px rgba(217,119,6,.38)' }}>
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><line x1="6" y1="3" x2="6" y2="21" stroke="#FFF8F0" strokeWidth="2.2" strokeLinecap="round"/><line x1="18" y1="3" x2="18" y2="21" stroke="#FFF8F0" strokeWidth="2.2" strokeLinecap="round"/><polyline points="3,9 6,6 9,9" stroke="#FFF8F0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><polyline points="15,9 18,6 21,9" stroke="#FFF8F0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </div>
                    <div style={{ position: 'absolute', top: -6, right: -6, width: 22, height: 18, borderRadius: 10, background: '#D97706', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 7.5, fontWeight: 800, color: '#FFF8F0' }}>05B</div>
                  </div>
                  <div style={{ textAlign: 'center' }}><div style={{ fontSize: 11.5, fontWeight: 700, color: '#2D1200' }}>Parallel</div><div style={{ fontSize: 10, color: '#8A5030' }}>Processing</div></div>
                </div>
                <div style={{ flexShrink: 0, padding: '0 8px', marginBottom: 22 }}>
                  <svg width="28" height="16" viewBox="0 0 28 16" fill="none"><path d="M2 8H24M18 3L24 8L18 13" stroke="#D97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="5,3"><animate attributeName="stroke-dashoffset" from="0" to="-32" dur="1.4s" repeatCount="indefinite"/></path></svg>
                </div>
                {/* 05C Jokhim */}
                <div className="hiw-wf-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 7, flexShrink: 0 }}>
                  <div style={{ position: 'relative' }}>
                    <div style={{ width: 54, height: 54, borderRadius: '50%', background: 'linear-gradient(135deg,#FFD4E4,#E11D48)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 16px rgba(225,29,72,.38)' }}>
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="#FFF8F0" strokeWidth="2" strokeLinecap="round"/><path d="M12 8v4" stroke="#FFF8F0" strokeWidth="2" strokeLinecap="round"/><circle cx="12" cy="15" r="1.2" fill="#FFF8F0"/></svg>
                    </div>
                    <div style={{ position: 'absolute', top: -6, right: -6, width: 22, height: 18, borderRadius: 10, background: '#E11D48', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 7.5, fontWeight: 800, color: '#FFF8F0' }}>05C</div>
                  </div>
                  <div style={{ textAlign: 'center' }}><div style={{ fontSize: 11.5, fontWeight: 700, color: '#2D1200' }}>Jokhim</div><div style={{ fontSize: 10, color: '#8A5030' }}>Risk Scan</div></div>
                </div>
              </div>

              {/* Row 3: Human Approval → Sahee → Sruthi → Done */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginBottom: 0 }}>
                {/* Human Approval */}
                <div className="hiw-wf-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 7, flexShrink: 0 }}>
                  <div style={{ position: 'relative' }}>
                    <div style={{ width: 54, height: 54, borderRadius: '50%', background: 'linear-gradient(135deg,#FFF0CC,#F59F0B)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 16px rgba(245,159,11,.38)' }}>
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" stroke="#FFF8F0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><circle cx="12" cy="7" r="4" stroke="#FFF8F0" strokeWidth="2"/></svg>
                    </div>
                    <div style={{ position: 'absolute', top: -6, right: -6, width: 18, height: 18, borderRadius: '50%', background: '#F59F0B', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 8, fontWeight: 800, color: '#FFF8F0' }}>06</div>
                  </div>
                  <div style={{ textAlign: 'center' }}><div style={{ fontSize: 11.5, fontWeight: 700, color: '#2D1200' }}>Human Approval</div><div style={{ fontSize: 10, color: '#8A5030' }}>Review &amp; Approve</div></div>
                </div>
                <div style={{ flexShrink: 0, padding: '0 8px', marginBottom: 22 }}>
                  <svg width="28" height="16" viewBox="0 0 28 16" fill="none"><path d="M2 8H24M18 3L24 8L18 13" stroke="#F59F0B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="5,3"><animate attributeName="stroke-dashoffset" from="0" to="-32" dur="1.4s" repeatCount="indefinite"/></path></svg>
                </div>
                {/* Sahee */}
                <div className="hiw-wf-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 7, flexShrink: 0 }}>
                  <div style={{ position: 'relative' }}>
                    <div style={{ width: 54, height: 54, borderRadius: '50%', background: 'linear-gradient(135deg,#FEF0CC,#D97706)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 16px rgba(217,119,6,.38)' }}>
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><polyline points="20,6 9,17 4,12" stroke="#FFF8F0" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </div>
                    <div style={{ position: 'absolute', top: -6, right: -6, width: 18, height: 18, borderRadius: '50%', background: '#D97706', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 8, fontWeight: 800, color: '#FFF8F0' }}>07</div>
                  </div>
                  <div style={{ textAlign: 'center' }}><div style={{ fontSize: 11.5, fontWeight: 700, color: '#2D1200' }}>Sahee</div><div style={{ fontSize: 10, color: '#8A5030' }}>Generate PDF</div></div>
                </div>
                <div style={{ flexShrink: 0, padding: '0 8px', marginBottom: 22 }}>
                  <svg width="28" height="16" viewBox="0 0 28 16" fill="none"><path d="M2 8H24M18 3L24 8L18 13" stroke="#D97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="5,3"><animate attributeName="stroke-dashoffset" from="0" to="-32" dur="1.4s" repeatCount="indefinite"/></path></svg>
                </div>
                {/* Sruthi */}
                <div className="hiw-wf-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 7, flexShrink: 0 }}>
                  <div style={{ position: 'relative' }}>
                    <div style={{ width: 54, height: 54, borderRadius: '50%', background: 'linear-gradient(135deg,#CCF4E4,#059669)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 16px rgba(5,150,105,.38)' }}>
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><rect x="3" y="4" width="18" height="18" rx="2" stroke="#FFF8F0" strokeWidth="2"/><line x1="16" y1="2" x2="16" y2="6" stroke="#FFF8F0" strokeWidth="2" strokeLinecap="round"/><line x1="8" y1="2" x2="8" y2="6" stroke="#FFF8F0" strokeWidth="2" strokeLinecap="round"/><line x1="3" y1="10" x2="21" y2="10" stroke="#FFF8F0" strokeWidth="2"/></svg>
                    </div>
                    <div style={{ position: 'absolute', top: -6, right: -6, width: 18, height: 18, borderRadius: '50%', background: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 8, fontWeight: 800, color: '#FFF8F0' }}>08</div>
                  </div>
                  <div style={{ textAlign: 'center' }}><div style={{ fontSize: 11.5, fontWeight: 700, color: '#2D1200' }}>Sruthi</div><div style={{ fontSize: 10, color: '#8A5030' }}>Track Obligations</div></div>
                </div>
                <div style={{ flexShrink: 0, padding: '0 8px', marginBottom: 22 }}>
                  <svg width="28" height="16" viewBox="0 0 28 16" fill="none"><path d="M2 8H24M18 3L24 8L18 13" stroke="#059669" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="5,3"><animate attributeName="stroke-dashoffset" from="0" to="-32" dur="1.4s" repeatCount="indefinite"/></path></svg>
                </div>
                {/* Done */}
                <div className="hiw-wf-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 7, flexShrink: 0 }}>
                  <div style={{ width: 54, height: 54, borderRadius: '50%', background: 'linear-gradient(135deg,#FFECD2,#F59F0B,#F0543C)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 18px rgba(245,159,11,.45)', animation: 'pulse 2.8s ease-in-out infinite' }}>
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M20 6L9 17l-5-5" stroke="#FFF8F0" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </div>
                  <div style={{ textAlign: 'center' }}><div style={{ fontSize: 11.5, fontWeight: 700, color: '#F0543C' }}>Done</div><div style={{ fontSize: 10, color: '#8A5030' }}>Live &amp; Tracked</div></div>
                </div>
              </div>
            </div>

            {/* RIGHT: Review + Dispute stacked */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 20 }}>

              {/* Review Existing Contract */}
              <div style={{ background: 'rgba(255,248,240,.9)', backdropFilter: 'blur(20px)', border: '1.5px solid rgba(234,88,12,.2)', borderRadius: 24, padding: 22, boxShadow: '0 4px 22px rgba(234,88,12,.07)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18 }}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'linear-gradient(135deg,#EA580C,#F59F0B)', boxShadow: '0 0 8px rgba(234,88,12,.6)' }} />
                  <span style={{ fontSize: 13, fontWeight: 800, color: '#2D1200' }}>Review Existing Contract</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14, flexWrap: 'wrap' }}>
                  <div style={{ background: 'rgba(255,252,244,.95)', border: '1.5px solid rgba(245,159,11,.25)', borderRadius: 14, padding: '10px 12px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, minWidth: 68, boxShadow: '0 2px 10px rgba(245,159,11,.09)' }}>
                    <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg,#FFF0CC,#F59F0B)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(245,159,11,.35)' }}><svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" stroke="#FFF8F0" strokeWidth="2.2"/><polyline points="14,2 14,8 20,8" stroke="#FFF8F0" strokeWidth="2.2"/></svg></div>
                    <div style={{ fontSize: 9.5, fontWeight: 700, color: '#2D1200', textAlign: 'center', lineHeight: 1.3 }}>Upload<br/>PDF</div>
                  </div>
                  <svg width="20" height="12" viewBox="0 0 20 12" fill="none"><path d="M2 6H18M13 2L18 6L13 10" stroke="#F59F0B" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  <div style={{ background: 'rgba(255,252,244,.95)', border: '1.5px solid rgba(240,84,60,.22)', borderRadius: 14, padding: '10px 12px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, minWidth: 68, boxShadow: '0 2px 10px rgba(240,84,60,.08)' }}>
                    <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg,#FFE4D8,#F0543C)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(240,84,60,.35)' }}><svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" stroke="#FFF8F0" strokeWidth="2.2"/><circle cx="12" cy="7" r="4" stroke="#FFF8F0" strokeWidth="2.2"/></svg></div>
                    <div style={{ fontSize: 9.5, fontWeight: 700, color: '#2D1200', textAlign: 'center', lineHeight: 1.3 }}>Arambha<br/>Intake</div>
                  </div>
                  <svg width="20" height="12" viewBox="0 0 20 12" fill="none"><path d="M2 6H18M13 2L18 6L13 10" stroke="#F0543C" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <div style={{ background: 'rgba(244,255,250,.95)', border: '1.5px solid rgba(14,168,130,.2)', borderRadius: 12, padding: '7px 10px', display: 'flex', alignItems: 'center', gap: 7, boxShadow: '0 2px 8px rgba(14,168,130,.08)' }}>
                      <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'linear-gradient(135deg,#C4F8E8,#0EA882)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><svg width="11" height="11" viewBox="0 0 24 24" fill="none"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" stroke="#FFF8F0" strokeWidth="2.2"/><circle cx="9" cy="7" r="4" stroke="#FFF8F0" strokeWidth="2.2"/><path d="M23 21v-2a4 4 0 00-3-3.87" stroke="#FFF8F0" strokeWidth="2.2"/></svg></div>
                      <div style={{ fontSize: 9, fontWeight: 700, color: '#2D1200' }}>Samjoota<br/><span style={{ color: '#8A5030', fontWeight: 400 }}>Negotiation</span></div>
                    </div>
                    <div style={{ background: 'rgba(255,244,248,.95)', border: '1.5px solid rgba(244,63,110,.18)', borderRadius: 12, padding: '7px 10px', display: 'flex', alignItems: 'center', gap: 7, boxShadow: '0 2px 8px rgba(244,63,110,.07)' }}>
                      <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'linear-gradient(135deg,#FFD4E4,#F43F6E)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><svg width="11" height="11" viewBox="0 0 24 24" fill="none"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="#FFF8F0" strokeWidth="2.2"/></svg></div>
                      <div style={{ fontSize: 9, fontWeight: 700, color: '#2D1200' }}>Jokhim<br/><span style={{ color: '#8A5030', fontWeight: 400 }}>Risk Analysis</span></div>
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  <div style={{ background: 'rgba(255,252,244,.95)', border: '1.5px solid rgba(217,119,6,.22)', borderRadius: 14, padding: '10px 12px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, minWidth: 68 }}>
                    <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg,#FEECCC,#D97706)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" stroke="#FFF8F0" strokeWidth="2.2"/><circle cx="12" cy="7" r="4" stroke="#FFF8F0" strokeWidth="2.2"/></svg></div>
                    <div style={{ fontSize: 9.5, fontWeight: 700, color: '#2D1200', textAlign: 'center', lineHeight: 1.3 }}>Human<br/>Review</div>
                  </div>
                  <svg width="20" height="12" viewBox="0 0 20 12" fill="none"><path d="M2 6H18M13 2L18 6L13 10" stroke="#D97706" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  <div style={{ background: 'rgba(245,255,250,.95)', border: '1.5px solid rgba(5,150,105,.18)', borderRadius: 14, padding: '10px 12px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, minWidth: 68 }}>
                    <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg,#C8FCEC,#059669)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><svg width="14" height="14" viewBox="0 0 24 24" fill="none"><polyline points="20,6 9,17 4,12" stroke="#FFF8F0" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg></div>
                    <div style={{ fontSize: 9.5, fontWeight: 700, color: '#2D1200', textAlign: 'center', lineHeight: 1.3 }}>Sahee<br/>PDF</div>
                  </div>
                  <svg width="20" height="12" viewBox="0 0 20 12" fill="none"><path d="M2 6H18M13 2L18 6L13 10" stroke="#059669" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  <div style={{ background: 'rgba(255,252,244,.95)', border: '1.5px solid rgba(245,159,11,.22)', borderRadius: 14, padding: '10px 12px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, minWidth: 68 }}>
                    <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg,#FFF0CC,#F59F0B)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><svg width="14" height="14" viewBox="0 0 24 24" fill="none"><rect x="3" y="11" width="18" height="11" rx="2" stroke="#FFF8F0" strokeWidth="2"/><path d="M7 11V7a5 5 0 0110 0v4" stroke="#FFF8F0" strokeWidth="2"/></svg></div>
                    <div style={{ fontSize: 9.5, fontWeight: 700, color: '#2D1200', textAlign: 'center', lineHeight: 1.3 }}>Legal<br/>Vault</div>
                  </div>
                </div>
              </div>

              {/* Dispute Resolution */}
              <div style={{ background: 'rgba(255,244,248,.9)', backdropFilter: 'blur(20px)', border: '1.5px solid rgba(244,63,110,.18)', borderRadius: 24, padding: 22, boxShadow: '0 4px 22px rgba(244,63,110,.06)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18 }}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'linear-gradient(135deg,#F43F6E,#E11D48)', boxShadow: '0 0 8px rgba(244,63,110,.6)' }} />
                  <span style={{ fontSize: 13, fontWeight: 800, color: '#2D1200' }}>Dispute Resolution Workflow</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                  <div style={{ background: 'rgba(255,252,244,.95)', border: '1.5px solid rgba(240,84,60,.2)', borderRadius: 14, padding: '10px 12px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, minWidth: 68 }}>
                    <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg,#FFE4D8,#F0543C)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" stroke="#FFF8F0" strokeWidth="2.2"/><polyline points="14,2 14,8 20,8" stroke="#FFF8F0" strokeWidth="2.2"/></svg></div>
                    <div style={{ fontSize: 9.5, fontWeight: 700, color: '#2D1200', textAlign: 'center', lineHeight: 1.3 }}>Select<br/>Contract</div>
                  </div>
                  <svg width="20" height="12" viewBox="0 0 20 12" fill="none"><path d="M2 6H18M13 2L18 6L13 10" stroke="#F43F6E" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  <div style={{ background: 'rgba(255,244,248,.95)', border: '1.5px solid rgba(244,63,110,.2)', borderRadius: 14, padding: '10px 12px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, minWidth: 68 }}>
                    <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg,#FFD8D8,#E11D48)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M12 2L3 7l9 5 9-5-9-5z" stroke="#FFF8F0" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/><path d="M3 17l9 5 9-5" stroke="#FFF8F0" strokeWidth="2" strokeLinecap="round"/><path d="M3 12l9 5 9-5" stroke="#FFF8F0" strokeWidth="2" strokeLinecap="round"/></svg></div>
                    <div style={{ fontSize: 9.5, fontWeight: 700, color: '#2D1200', textAlign: 'center', lineHeight: 1.3 }}>Vivada<br/>Dispute</div>
                  </div>
                  <svg width="20" height="12" viewBox="0 0 20 12" fill="none"><path d="M2 6H18M13 2L18 6L13 10" stroke="#E11D48" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  <div style={{ background: 'rgba(255,248,240,.95)', border: '1.5px solid rgba(234,88,12,.2)', borderRadius: 14, padding: '10px 12px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, minWidth: 68 }}>
                    <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg,#FFE8CC,#EA580C)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" stroke="#FFF8F0" strokeWidth="2.2"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" stroke="#FFF8F0" strokeWidth="2"/></svg></div>
                    <div style={{ fontSize: 9.5, fontWeight: 700, color: '#2D1200', textAlign: 'center', lineHeight: 1.3 }}>Generate<br/>Notice</div>
                  </div>
                  <svg width="20" height="12" viewBox="0 0 20 12" fill="none"><path d="M2 6H18M13 2L18 6L13 10" stroke="#EA580C" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  <div style={{ background: 'rgba(244,255,250,.95)', border: '1.5px solid rgba(5,150,105,.18)', borderRadius: 14, padding: '10px 12px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, minWidth: 68 }}>
                    <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg,#CCF4E4,#059669)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><svg width="14" height="14" viewBox="0 0 24 24" fill="none"><line x1="22" y1="2" x2="11" y2="13" stroke="#FFF8F0" strokeWidth="2.2" strokeLinecap="round"/><polygon points="22,2 15,22 11,13 2,9 22,2" stroke="#FFF8F0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg></div>
                    <div style={{ fontSize: 9.5, fontWeight: 700, color: '#2D1200', textAlign: 'center', lineHeight: 1.3 }}>PDF<br/>Sent</div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* MEET THE 8 AI AGENTS */}
        <section style={{ position: 'relative', zIndex: 1, maxWidth: 1240, margin: '0 auto', padding: '0 48px 72px' }}>
          <div style={{ background: 'rgba(255,252,244,.88)', backdropFilter: 'blur(24px)', border: '1.5px solid rgba(245,159,11,.16)', borderRadius: 32, padding: '52px 52px 46px', boxShadow: '0 8px 48px rgba(245,159,11,.08)', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: -50, right: -50, width: 280, height: 280, background: 'radial-gradient(circle,rgba(240,84,60,.1) 0%,transparent 65%)', pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', bottom: -40, left: -40, width: 240, height: 240, background: 'radial-gradient(circle,rgba(245,159,11,.1) 0%,transparent 65%)', pointerEvents: 'none' }} />

            <div style={{ textAlign: 'center', marginBottom: 40 }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                <div style={{ width: 40, height: 1.5, background: 'linear-gradient(to right,transparent,rgba(245,159,11,.5))' }} />
                <span style={{ fontSize: 11, fontWeight: 700, color: '#F59F0B', letterSpacing: '.8px', textTransform: 'uppercase' }}>✦ Meet the AI Agents ✦</span>
                <div style={{ width: 40, height: 1.5, background: 'linear-gradient(to left,transparent,rgba(245,159,11,.5))' }} />
              </div>
              <h2 style={{ fontSize: 28, fontWeight: 800, color: '#2D1200', letterSpacing: '-.6px', marginBottom: 7 }}>Meet the 8 AI Agents of Vaakya</h2>
              <p style={{ fontSize: 14, color: '#8A5030' }}>Each agent specializes in a critical part of the legal lifecycle.</p>
            </div>

            {/* Agents strip */}
            <div style={{ position: 'relative', marginBottom: 40 }}>
              <div style={{ position: 'absolute', top: 32, left: 'calc(6.25% + 8px)', right: 'calc(6.25% + 8px)', height: 3, background: 'repeating-linear-gradient(to right,rgba(245,159,11,.55) 0,rgba(245,159,11,.55) 8px,transparent 8px,transparent 18px)', zIndex: 0 }} />
              <div className="hiw-agents-row" style={{ display: 'flex', justifyContent: 'space-between', position: 'relative', zIndex: 1, gap: 0 }}>
                {[
                  { num: '01', bg: 'linear-gradient(135deg,#FFF0CC,#F59F0B)', shadow: 'rgba(245,159,11,.4)', badge: '#D97706', label: 'Arambha', sub: 'Intake & Routing', icon: <svg width="26" height="26" viewBox="0 0 24 24" fill="none"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" stroke="#FFF8F0" strokeWidth="2.2"/><circle cx="12" cy="7" r="4" stroke="#FFF8F0" strokeWidth="2.2"/></svg> },
                  { num: '02', bg: 'linear-gradient(135deg,#FFE4D8,#F0543C)', shadow: 'rgba(240,84,60,.4)', badge: '#D63C28', label: 'Rachana', sub: 'Contract Drafting', icon: <svg width="26" height="26" viewBox="0 0 24 24" fill="none"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" stroke="#FFF8F0" strokeWidth="2.2"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" stroke="#FFF8F0" strokeWidth="2.2"/></svg> },
                  { num: '03', bg: 'linear-gradient(135deg,#FFE8CC,#EA580C)', shadow: 'rgba(234,88,12,.4)', badge: '#C04A08', label: 'Parisheelanam', sub: 'Quality Review', icon: <svg width="26" height="26" viewBox="0 0 24 24" fill="none"><polyline points="1,4 1,10 7,10" stroke="#FFF8F0" strokeWidth="2.2"/><path d="M3.51 15a9 9 0 102.13-9.36L1 10" stroke="#FFF8F0" strokeWidth="2.2"/></svg> },
                  { num: '04', bg: 'linear-gradient(135deg,#FFD4E4,#F43F6E)', shadow: 'rgba(244,63,110,.4)', badge: '#D02055', label: 'Jokhim', sub: 'Risk Detection', icon: <svg width="26" height="26" viewBox="0 0 24 24" fill="none"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="#FFF8F0" strokeWidth="2.2"/><path d="M12 8v4" stroke="#FFF8F0" strokeWidth="2.2"/><circle cx="12" cy="15" r="1.3" fill="#FFF8F0"/></svg> },
                  { num: '05', bg: 'linear-gradient(135deg,#C4F8E8,#0EA882)', shadow: 'rgba(14,168,130,.4)', badge: '#0B8A64', label: 'Samjoota', sub: 'Negotiation & Redlines', icon: <svg width="26" height="26" viewBox="0 0 24 24" fill="none"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" stroke="#FFF8F0" strokeWidth="2.2"/><circle cx="9" cy="7" r="4" stroke="#FFF8F0" strokeWidth="2.2"/><path d="M23 21v-2a4 4 0 00-3-3.87" stroke="#FFF8F0" strokeWidth="2.2"/><path d="M16 3.13a4 4 0 010 7.75" stroke="#FFF8F0" strokeWidth="2.2"/></svg> },
                  { num: '06', bg: 'linear-gradient(135deg,#FEF0CC,#D97706)', shadow: 'rgba(217,119,6,.4)', badge: '#B06005', label: 'Sahee', sub: 'Sign & Deliver', icon: <svg width="26" height="26" viewBox="0 0 24 24" fill="none"><polyline points="20,6 9,17 4,12" stroke="#FFF8F0" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg> },
                  { num: '07', bg: 'linear-gradient(135deg,#CCF4E4,#059669)', shadow: 'rgba(5,150,105,.4)', badge: '#047850', label: 'Sruthi', sub: 'Obligation Tracker', icon: <svg width="26" height="26" viewBox="0 0 24 24" fill="none"><rect x="3" y="4" width="18" height="18" rx="2" stroke="#FFF8F0" strokeWidth="2.2"/><line x1="16" y1="2" x2="16" y2="6" stroke="#FFF8F0" strokeWidth="2.2"/><line x1="8" y1="2" x2="8" y2="6" stroke="#FFF8F0" strokeWidth="2.2"/><line x1="3" y1="10" x2="21" y2="10" stroke="#FFF8F0" strokeWidth="2.2"/></svg> },
                  { num: '08', bg: 'linear-gradient(135deg,#FFD8D8,#E11D48)', shadow: 'rgba(225,29,72,.4)', badge: '#B81535', label: 'Vivada', sub: 'Dispute Resolution', icon: <svg width="26" height="26" viewBox="0 0 24 24" fill="none"><path d="M12 2L3 7l9 5 9-5-9-5z" stroke="#FFF8F0" strokeWidth="2.2"/><path d="M3 17l9 5 9-5" stroke="#FFF8F0" strokeWidth="2.2"/><path d="M3 12l9 5 9-5" stroke="#FFF8F0" strokeWidth="2.2"/></svg> },
                ].map((agent) => (
                  <div key={agent.num} className="hiw-agent-node" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, width: '12.5%' }}>
                    <div style={{ position: 'relative' }}>
                      <div style={{ width: 64, height: 64, borderRadius: '50%', background: agent.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 6px 20px ${agent.shadow}` }}>{agent.icon}</div>
                      <div style={{ position: 'absolute', bottom: -8, left: '50%', transform: 'translateX(-50%)', fontSize: 8, fontWeight: 800, color: '#FFF8F0', background: agent.badge, borderRadius: 100, padding: '2px 6px' }}>{agent.num}</div>
                    </div>
                    <div style={{ textAlign: 'center', marginTop: 6 }}>
                      <div style={{ fontSize: 12.5, fontWeight: 700, color: '#2D1200', marginBottom: 2 }}>{agent.label}</div>
                      <div style={{ fontSize: 10.5, color: '#9A6040' }}>{agent.sub}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ textAlign: 'center' }}>
              <a href="/dashboard/agents" className="hiw-cta-btn" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, fontSize: 15, fontWeight: 700, color: '#FFF8F0', padding: '14px 34px', background: 'linear-gradient(135deg,#F0543C,#F43F6E)', borderRadius: 100, boxShadow: '0 8px 28px rgba(240,84,60,.3)', letterSpacing: '-.1px', textDecoration: 'none' }}>
                Explore All Agents
                <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><path d="M2.5 7.5H12.5M8.5 3.5L12.5 7.5L8.5 11.5" stroke="#FFF8F0" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </a>
            </div>
          </div>
        </section>

        {/* POWERING INTELLIGENT LEGAL WORKFLOWS */}
        <section style={{ position: 'relative', zIndex: 1, maxWidth: 1240, margin: '0 auto', padding: '0 48px 72px' }}>
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
              <div style={{ height: 1.5, width: 44, background: 'linear-gradient(to right,transparent,rgba(240,84,60,.4))' }} />
              <span style={{ fontSize: 11, fontWeight: 700, color: '#F59F0B', letterSpacing: '.8px', textTransform: 'uppercase' }}>✦ Intelligent Workflows ✦</span>
              <div style={{ height: 1.5, width: 44, background: 'linear-gradient(to left,transparent,rgba(240,84,60,.4))' }} />
            </div>
            <h2 style={{ fontSize: 28, fontWeight: 800, color: '#2D1200', letterSpacing: '-.6px' }}>Powering Intelligent Legal Workflows</h2>
          </div>

          <div className="hiw-pow-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 20 }}>
            {/* Card 1: Parallel AI */}
            <div className="hiw-hover-lift" style={{ background: 'rgba(255,252,244,.92)', backdropFilter: 'blur(20px)', border: '1.5px solid rgba(245,159,11,.2)', borderRadius: 26, padding: '26px 22px 28px', boxShadow: '0 4px 22px rgba(245,159,11,.08)', overflow: 'hidden', position: 'relative' }}>
              <div style={{ position: 'absolute', top: 0, right: 0, width: 90, height: 80, backgroundImage: 'radial-gradient(circle,rgba(245,159,11,.18) 1.3px,transparent 1.3px)', backgroundSize: '12px 12px' }} />
              <div style={{ marginBottom: 16, position: 'relative', zIndex: 1 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, background: 'rgba(255,248,240,.9)', border: '1.5px solid rgba(245,159,11,.2)', borderRadius: 14, padding: '12px 14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ width: 22, height: 22, borderRadius: '50%', background: 'linear-gradient(135deg,#FFF0CC,#F59F0B)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><svg width="10" height="10" viewBox="0 0 24 24" fill="none"><polyline points="20,6 9,17 4,12" stroke="#FFF8F0" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg></div>
                    <div style={{ flex: 1, height: 5, background: 'linear-gradient(to right,rgba(245,159,11,.5),rgba(240,84,60,.3))', borderRadius: 3 }} />
                    <div style={{ width: 22, height: 22, borderRadius: '50%', background: 'linear-gradient(135deg,#FFE4D8,#F0543C)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><svg width="10" height="10" viewBox="0 0 24 24" fill="none"><polyline points="20,6 9,17 4,12" stroke="#FFF8F0" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg></div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ width: 22, height: 22, borderRadius: '50%', background: 'linear-gradient(135deg,#C4F8E8,#0EA882)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><svg width="10" height="10" viewBox="0 0 24 24" fill="none"><polyline points="20,6 9,17 4,12" stroke="#FFF8F0" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg></div>
                    <div style={{ flex: 1, height: 5, background: 'linear-gradient(to right,rgba(14,168,130,.5),rgba(245,159,11,.3))', borderRadius: 3 }} />
                    <div style={{ width: 22, height: 22, borderRadius: '50%', background: 'linear-gradient(135deg,#FFD4E4,#F43F6E)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><svg width="10" height="10" viewBox="0 0 24 24" fill="none"><polyline points="20,6 9,17 4,12" stroke="#FFF8F0" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg></div>
                  </div>
                </div>
              </div>
              <h3 style={{ fontSize: 15, fontWeight: 800, color: '#2D1200', marginBottom: 8, letterSpacing: '-.3px' }}>Parallel AI Processing</h3>
              <p style={{ fontSize: 12.5, color: '#8A5030', lineHeight: 1.6 }}>Multiple agents work at the same time to deliver faster results with higher accuracy.</p>
            </div>

            {/* Card 2: Human-in-the-Loop */}
            <div className="hiw-hover-lift" style={{ background: 'rgba(255,244,248,.92)', backdropFilter: 'blur(20px)', border: '1.5px solid rgba(244,63,110,.18)', borderRadius: 26, padding: '26px 22px 28px', boxShadow: '0 4px 22px rgba(244,63,110,.07)', overflow: 'hidden', position: 'relative' }}>
              <div style={{ position: 'absolute', top: 0, right: 0, width: 90, height: 80, backgroundImage: 'radial-gradient(circle,rgba(244,63,110,.16) 1.3px,transparent 1.3px)', backgroundSize: '12px 12px' }} />
              <div style={{ marginBottom: 16, position: 'relative', zIndex: 1 }}>
                <div style={{ background: 'rgba(255,248,240,.9)', border: '1.5px solid rgba(244,63,110,.18)', borderRadius: 14, padding: '12px 14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 7 }}>
                    <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg,#FFD0E4,#F43F6E)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" stroke="#FFF8F0" strokeWidth="2.2"/><circle cx="12" cy="7" r="4" stroke="#FFF8F0" strokeWidth="2.2"/></svg></div>
                    <div style={{ fontSize: 10, fontWeight: 700, color: '#2D1200' }}>You</div>
                  </div>
                  <div style={{ height: 4, background: 'rgba(244,63,110,.15)', borderRadius: 2, marginBottom: 5 }} />
                  <div style={{ height: 4, background: 'rgba(244,63,110,.12)', borderRadius: 2, width: '75%', marginBottom: 9 }} />
                  <div style={{ display: 'flex', gap: 6 }}>
                    <div style={{ flex: 1, padding: 5, background: 'linear-gradient(135deg,rgba(14,168,130,.18),rgba(14,168,130,.08))', border: '1px solid rgba(14,168,130,.3)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><svg width="10" height="10" viewBox="0 0 24 24" fill="none"><polyline points="20,6 9,17 4,12" stroke="#0EA882" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg></div>
                    <div style={{ flex: 1, padding: 5, background: 'rgba(240,84,60,.08)', border: '1px solid rgba(240,84,60,.25)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><svg width="10" height="10" viewBox="0 0 24 24" fill="none"><line x1="18" y1="6" x2="6" y2="18" stroke="#F0543C" strokeWidth="3" strokeLinecap="round"/><line x1="6" y1="6" x2="18" y2="18" stroke="#F0543C" strokeWidth="3" strokeLinecap="round"/></svg></div>
                  </div>
                </div>
              </div>
              <h3 style={{ fontSize: 15, fontWeight: 800, color: '#2D1200', marginBottom: 8, letterSpacing: '-.3px' }}>Human-in-the-Loop</h3>
              <p style={{ fontSize: 12.5, color: '#8A5030', lineHeight: 1.6 }}>You review, suggest changes, and approve before final delivery.</p>
            </div>

            {/* Card 3: Secure by Design */}
            <div className="hiw-hover-lift" style={{ background: 'rgba(244,255,250,.92)', backdropFilter: 'blur(20px)', border: '1.5px solid rgba(14,168,130,.18)', borderRadius: 26, padding: '26px 22px 28px', boxShadow: '0 4px 22px rgba(14,168,130,.07)', overflow: 'hidden', position: 'relative' }}>
              <div style={{ position: 'absolute', top: 0, right: 0, width: 90, height: 80, backgroundImage: 'radial-gradient(circle,rgba(14,168,130,.16) 1.3px,transparent 1.3px)', backgroundSize: '12px 12px' }} />
              <div style={{ marginBottom: 16, position: 'relative', zIndex: 1 }}>
                <div style={{ background: 'rgba(248,255,252,.9)', border: '1.5px solid rgba(14,168,130,.2)', borderRadius: 14, padding: '16px 14px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 8 }}>
                  <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'linear-gradient(135deg,#C4F8E8,#0EA882)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 14px rgba(14,168,130,.35)', animation: 'pulse 3s ease-in-out infinite' }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><rect x="3" y="11" width="18" height="11" rx="2" stroke="#FFF8F0" strokeWidth="2.2"/><path d="M7 11V7a5 5 0 0110 0v4" stroke="#FFF8F0" strokeWidth="2.2"/></svg>
                  </div>
                  <div style={{ display: 'flex', gap: 4 }}>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#0EA882', opacity: .9 }} />
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#F59F0B', opacity: .8 }} />
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#F0543C', opacity: .7 }} />
                  </div>
                </div>
              </div>
              <h3 style={{ fontSize: 15, fontWeight: 800, color: '#2D1200', marginBottom: 8, letterSpacing: '-.3px' }}>Secure by Design</h3>
              <p style={{ fontSize: 12.5, color: '#8A5030', lineHeight: 1.6 }}>Bank-grade encryption, private storage, and role-based access keep your data 100% protected.</p>
            </div>

            {/* Card 4: Track & Manage */}
            <div className="hiw-hover-lift" style={{ background: 'rgba(255,248,240,.92)', backdropFilter: 'blur(20px)', border: '1.5px solid rgba(234,88,12,.18)', borderRadius: 26, padding: '26px 22px 28px', boxShadow: '0 4px 22px rgba(234,88,12,.07)', overflow: 'hidden', position: 'relative' }}>
              <div style={{ position: 'absolute', top: 0, right: 0, width: 90, height: 80, backgroundImage: 'radial-gradient(circle,rgba(234,88,12,.16) 1.3px,transparent 1.3px)', backgroundSize: '12px 12px' }} />
              <div style={{ marginBottom: 16, position: 'relative', zIndex: 1 }}>
                <div style={{ background: 'rgba(255,252,245,.9)', border: '1.5px solid rgba(234,88,12,.18)', borderRadius: 14, padding: '12px 14px' }}>
                  <div style={{ fontSize: 9, fontWeight: 700, color: '#EA580C', marginBottom: 8, letterSpacing: '.3px' }}>CONTRACT HEALTH</div>
                  <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 36 }}>
                    <div style={{ flex: 1, background: 'linear-gradient(to top,rgba(245,159,11,.6),rgba(245,159,11,.2))', borderRadius: 3, height: '55%' }} />
                    <div style={{ flex: 1, background: 'linear-gradient(to top,rgba(240,84,60,.6),rgba(240,84,60,.2))', borderRadius: 3, height: '75%' }} />
                    <div style={{ flex: 1, background: 'linear-gradient(to top,rgba(14,168,130,.6),rgba(14,168,130,.2))', borderRadius: 3, height: '90%' }} />
                    <div style={{ flex: 1, background: 'linear-gradient(to top,rgba(245,159,11,.6),rgba(245,159,11,.2))', borderRadius: 3, height: '65%' }} />
                    <div style={{ flex: 1, background: 'linear-gradient(to top,rgba(240,84,60,.6),rgba(240,84,60,.2))', borderRadius: 3, height: '100%' }} />
                    <div style={{ flex: 1, background: 'linear-gradient(to top,rgba(14,168,130,.6),rgba(14,168,130,.2))', borderRadius: 3, height: '80%' }} />
                  </div>
                </div>
              </div>
              <h3 style={{ fontSize: 15, fontWeight: 800, color: '#2D1200', marginBottom: 8, letterSpacing: '-.3px' }}>Track. Manage. Stay Ahead.</h3>
              <p style={{ fontSize: 12.5, color: '#8A5030', lineHeight: 1.6 }}>Track obligations, get reminders, and never miss an important date again.</p>
            </div>
          </div>
        </section>

        {/* CTA BANNER */}
        <section style={{ position: 'relative', zIndex: 1, maxWidth: 1240, margin: '0 auto', padding: '0 48px 80px' }}>
          <div className="hiw-cta-banner" style={{ position: 'relative', borderRadius: 32, background: 'linear-gradient(135deg,#FFF0DC 0%,#FFE8CC 30%,#FFD8D8 65%,#FFF0F0 100%)', border: '1.5px solid rgba(240,84,60,.18)', boxShadow: '0 12px 56px rgba(240,84,60,.12)', overflow: 'hidden', padding: '56px 64px', display: 'flex', alignItems: 'center', gap: 52 }}>
            <div style={{ position: 'absolute', top: -80, right: -80, width: 380, height: 380, background: 'radial-gradient(circle,rgba(245,159,11,.18) 0%,transparent 65%)', pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', bottom: -60, left: -60, width: 300, height: 300, background: 'radial-gradient(circle,rgba(240,84,60,.12) 0%,transparent 65%)', pointerEvents: 'none' }} />

            {/* Scale illustration */}
            <div style={{ flexShrink: 0, position: 'relative', zIndex: 1, animation: 'floatA 8s ease-in-out infinite' }}>
              <div style={{ position: 'relative', width: 148, height: 160 }}>
                <div style={{ position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: 90, height: 10, background: 'linear-gradient(135deg,#FFE0A0,#F59F0B)', borderRadius: 5, boxShadow: '0 4px 14px rgba(245,159,11,.4)' }} />
                <div style={{ position: 'absolute', bottom: 10, left: '50%', transform: 'translateX(-50%)', width: 8, height: 80, background: 'linear-gradient(180deg,#F59F0B,#D97706)', borderRadius: 4 }} />
                <div style={{ position: 'absolute', bottom: 86, left: '50%', transform: 'translateX(-50%)', width: 110, height: 8, background: 'linear-gradient(135deg,#F59F0B,#EA580C)', borderRadius: 4, boxShadow: '0 2px 10px rgba(245,159,11,.35)' }} />
                <div style={{ position: 'absolute', bottom: 62, left: 6, width: 36, height: 20, background: 'linear-gradient(135deg,#FFF0CC,#F59F0B)', borderRadius: 10, boxShadow: '0 3px 12px rgba(245,159,11,.4)' }}>
                  <div style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', width: 1.5, height: 14, background: '#D97706' }} />
                </div>
                <div style={{ position: 'absolute', bottom: 58, right: 6, width: 36, height: 20, background: 'linear-gradient(135deg,#FFE4D8,#F0543C)', borderRadius: 10, boxShadow: '0 3px 12px rgba(240,84,60,.4)' }}>
                  <div style={{ position: 'absolute', top: -16, left: '50%', transform: 'translateX(-50%)', width: 1.5, height: 18, background: '#D63C28' }} />
                </div>
                <div style={{ position: 'absolute', top: 0, right: 0, width: 44, height: 44, borderRadius: '50%', background: 'linear-gradient(135deg,rgba(245,159,11,.2),rgba(240,84,60,.15))', display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'pulse 3s ease-in-out infinite' }}>
                  <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><path d="M11 1L13 7H19L14 10.5L16 16.5L11 13L6 16.5L8 10.5L3 7H9L11 1Z" fill="#F59F0B" opacity=".8"/></svg>
                </div>
              </div>
            </div>

            {/* Content */}
            <div style={{ flex: 1, position: 'relative', zIndex: 1 }}>
              <h2 style={{ fontSize: 'clamp(26px,3.2vw,42px)', fontWeight: 800, color: '#2D1200', lineHeight: 1.18, letterSpacing: '-1.2px', marginBottom: 14 }}>
                Ready to <em style={{ fontFamily: "'Playfair Display',serif", fontStyle: 'italic', fontWeight: 800, background: 'linear-gradient(135deg,#F0543C,#F43F6E)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Transform</em><br/>Your Legal Workflow?
              </h2>
              <p style={{ fontSize: 15.5, color: '#8A5030', lineHeight: 1.65, marginBottom: 28, maxWidth: 420 }}>Join 1,000+ Indian SMBs who trust Vaakya for their legal needs.</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap', marginBottom: 22 }}>
                <a href="/dashboard" className="hiw-cta-btn" style={{ display: 'inline-flex', alignItems: 'center', gap: 9, fontSize: 15, fontWeight: 700, color: '#FFF8F0', padding: '14px 30px', background: 'linear-gradient(135deg,#F0543C,#F43F6E)', borderRadius: 100, boxShadow: '0 8px 28px rgba(240,84,60,.32)', letterSpacing: '-.1px', textDecoration: 'none' }}>
                  Start Your Free Trial
                  <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><path d="M2.5 7.5H12.5M8.5 3.5L12.5 7.5L8.5 11.5" stroke="#FFF8F0" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </a>
                <a href="/auth/login" style={{ display: 'inline-flex', alignItems: 'center', gap: 9, fontSize: 15, fontWeight: 700, color: '#F0543C', padding: '13px 28px', background: 'rgba(255,248,240,.7)', border: '2px solid rgba(240,84,60,.35)', borderRadius: 100, letterSpacing: '-.1px', textDecoration: 'none' }}>
                  Book a Demo
                  <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><path d="M2.5 7.5H12.5M8.5 3.5L12.5 7.5L8.5 11.5" stroke="#F0543C" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </a>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 18, flexWrap: 'wrap', marginBottom: 32 }}>
                {['14-Day Free Trial', 'No Credit Card Required', 'Cancel Anytime'].map((item, i) => (
                  <span key={item} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    {i > 0 && <span style={{ width: 3, height: 3, borderRadius: '50%', background: 'rgba(240,84,60,.35)', display: 'inline-block' }} />}
                    <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ width: 16, height: 16, borderRadius: '50%', background: 'rgba(5,150,105,.15)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}><svg width="9" height="9" viewBox="0 0 9 9" fill="none"><path d="M1.5 4.5l2 2 4-4" stroke="#059669" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg></span>
                      <span style={{ fontSize: 12, color: '#7A4A2A', fontWeight: 500 }}>{item}</span>
                    </span>
                  </span>
                ))}
              </div>

              {/* Site logo footer */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingTop: 20, borderTop: '1px solid rgba(240,84,60,.12)' }}>
                <div style={{ width: 32, height: 32, background: 'linear-gradient(135deg,#FFE8CC,#FFCFA0)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(245,159,11,.22)' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M12 2L4 6v6c0 5.5 3.5 10.7 8 12 4.5-1.3 8-6.5 8-12V6L12 2z" fill="#F59F0B"/><path d="M9 12l2 2 4-4" stroke="#FFF8F0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 800, color: '#2D1200', letterSpacing: '-.3px', lineHeight: 1.1 }}>VAAKYA</div>
                  <div style={{ fontSize: 9.5, fontWeight: 500, color: '#9A6040' }}>AI Legal for Indian SMBs</div>
                </div>
                <img
                  src="https://res.cloudinary.com/dkqbzwicr/image/upload/v1782475954/howitworks_uofngv.png"
                  alt=""
                  aria-hidden="true"
                  style={{ width: 48, height: 48, objectFit: 'contain', marginLeft: 8, opacity: 0.7 }}
                />
              </div>
            </div>
          </div>
        </section>

        <div style={{ height: 32 }} />
      </div>
    </>
  );
}
