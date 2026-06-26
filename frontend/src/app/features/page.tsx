'use client';

export default function FeaturesPage() {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,400;0,500;0,600;0,700;0,800;1,700;1,800&family=Playfair+Display:ital,wght@1,700;1,800&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html, body { font-family: 'Plus Jakarta Sans', sans-serif; background: #FFF8F0; color: #2D1200; overflow-x: hidden; }
        @keyframes softFloat  { 0%,100%{transform:translateY(0)}  50%{transform:translateY(-16px)} }
        @keyframes softFloat2 { 0%,100%{transform:translateY(-8px) rotate(-3deg)} 50%{transform:translateY(10px) rotate(3deg)} }
        @keyframes fadeInUp   { from{opacity:0;transform:translateY(28px)} to{opacity:1;transform:translateY(0)} }
        @keyframes pulse      { 0%,100%{opacity:.7;transform:scale(1)} 50%{opacity:1;transform:scale(1.06)} }
        .fcard { transition: transform .25s ease, box-shadow .25s ease; cursor: default; }
        .fcard:hover { transform: translateY(-6px); }
        .capcard { transition: transform .22s ease, box-shadow .22s ease; cursor: default; }
        .capcard:hover { transform: translateY(-4px); box-shadow: 0 12px 32px rgba(240,84,60,.12) !important; }
        .agent-wrap { transition: transform .2s ease; cursor: default; }
        .agent-wrap:hover { transform: scale(1.08); }
        .cta-pill { transition: transform .2s ease, box-shadow .2s ease; cursor: pointer; border: none; }
        .cta-pill:hover { transform: translateY(-2px); box-shadow: 0 12px 36px rgba(240,84,60,.35) !important; }
        .cta-outline { transition: all .2s ease; cursor: pointer; }
        .cta-outline:hover { background: rgba(240,84,60,.06) !important; }
        @media (max-width: 960px) {
          .feature-grid { grid-template-columns: repeat(2,1fr) !important; }
          .cap-grid     { grid-template-columns: repeat(3,1fr) !important; }
          .agents-row   { flex-wrap: wrap !important; gap: 32px !important; justify-content: center !important; }
          .hero-decos   { display: none !important; }
        }
        @media (max-width: 640px) {
          .feature-grid { grid-template-columns: 1fr !important; }
          .cap-grid     { grid-template-columns: repeat(2,1fr) !important; }
          .cta-banner   { flex-direction: column !important; text-align: center !important; }
          .cta-buttons  { justify-content: center !important; }
        }
      `}} />

      <div style={{ minHeight: '100vh', background: 'linear-gradient(145deg,#FFF8F0 0%,#FFFAF5 25%,#FFF5EF 55%,#FFF8F5 80%,#FFFAF0 100%)', position: 'relative', overflowX: 'hidden', fontFamily: "'Plus Jakarta Sans', sans-serif", color: '#2D1200' }}>

        {/* ── BACKGROUND MESH ── */}
        <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', overflow: 'hidden', zIndex: 0 }}>
          <div style={{ position: 'absolute', top: -180, right: -120, width: 720, height: 720, background: 'radial-gradient(circle,rgba(255,195,140,.26) 0%,transparent 65%)', animation: 'softFloat 11s ease-in-out infinite' }} />
          <div style={{ position: 'absolute', top: '28%', left: -160, width: 620, height: 620, background: 'radial-gradient(circle,rgba(255,155,170,.2) 0%,transparent 62%)', animation: 'softFloat 14s ease-in-out infinite reverse' }} />
          <div style={{ position: 'absolute', bottom: -120, left: '28%', width: 700, height: 560, background: 'radial-gradient(circle,rgba(255,215,100,.18) 0%,transparent 66%)', animation: 'softFloat 12s ease-in-out infinite' }} />
          <div style={{ position: 'absolute', top: '55%', right: '4%', width: 420, height: 420, background: 'radial-gradient(circle,rgba(240,84,60,.09) 0%,transparent 65%)' }} />
          <div style={{ position: 'absolute', top: '7%', right: '14%', width: 210, height: 185, backgroundImage: 'radial-gradient(circle,rgba(240,84,60,.18) 1.5px,transparent 1.5px)', backgroundSize: '20px 20px' }} />
          <div style={{ position: 'absolute', top: '44%', left: '6%', width: 165, height: 145, backgroundImage: 'radial-gradient(circle,rgba(245,159,11,.2) 1.2px,transparent 1.2px)', backgroundSize: '18px 18px' }} />
          <div style={{ position: 'absolute', bottom: '22%', right: '7%', width: 145, height: 125, backgroundImage: 'radial-gradient(circle,rgba(244,63,110,.16) 1.2px,transparent 1.2px)', backgroundSize: '16px 16px' }} />
        </div>

        {/* ═══════════ HEADER ═══════════ */}
        <header style={{ position: 'sticky', top: 0, zIndex: 100, backdropFilter: 'blur(22px)', WebkitBackdropFilter: 'blur(22px)', background: 'rgba(255,248,240,.88)', borderBottom: '1px solid rgba(240,84,60,.1)' }}>
          <div style={{ maxWidth: 1240, margin: '0 auto', padding: '0 48px', height: 68, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <a href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
              <div style={{ width: 38, height: 38, background: 'linear-gradient(135deg,#FFE8CC,#FFCFA0)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 10px rgba(245,159,11,.25)' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2L4 6v6c0 5.5 3.5 10.7 8 12 4.5-1.3 8-6.5 8-12V6L12 2z" fill="#F59F0B" />
                  <path d="M9 12l2 2 4-4" stroke="#FFF8F0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div>
                <div style={{ fontSize: 18, fontWeight: 800, color: '#2D1200', letterSpacing: '-.5px', lineHeight: 1.1 }}>VAAKYA</div>
                <div style={{ fontSize: 10, fontWeight: 500, color: '#9A6040', letterSpacing: '.2px', lineHeight: 1 }}>AI Legal for Indian SMBs</div>
              </div>
            </a>
            <a href="/" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13.5, fontWeight: 600, color: '#F0543C', textDecoration: 'none', padding: '8px 18px', border: '1.5px solid rgba(240,84,60,.25)', borderRadius: 100, background: 'rgba(240,84,60,.04)' }}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M9 2L4 7L9 12" stroke="#F0543C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Back to Home
            </a>
          </div>
        </header>

        {/* ═══════════ HERO ═══════════ */}
        <section style={{ position: 'relative', zIndex: 1, padding: '72px 48px 56px', maxWidth: 1240, margin: '0 auto' }}>
          <div style={{ position: 'relative', textAlign: 'center' }}>
            <div style={{ position: 'absolute', top: -24, left: 'calc(50% - 260px)', fontSize: 20, opacity: .5, color: '#F59F0B', animation: 'softFloat 4s ease-in-out infinite' }}>✦</div>
            <div style={{ position: 'absolute', top: 8, right: 'calc(50% - 255px)', fontSize: 14, opacity: .4, color: '#F0543C', animation: 'softFloat 5.5s ease-in-out infinite reverse' }}>✦</div>
            <div style={{ position: 'absolute', bottom: -8, left: 'calc(50% - 190px)', fontSize: 10, opacity: .35, color: '#F43F6E', animation: 'softFloat 7s ease-in-out infinite' }}>✦</div>

            {/* Badge */}
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 9, background: 'linear-gradient(135deg,rgba(245,159,11,.1),rgba(240,84,60,.09))', border: '1.5px solid rgba(240,84,60,.24)', borderRadius: 100, padding: '7px 22px', marginBottom: 30, animation: 'fadeInUp .6s ease both' }}>
              <span style={{ fontSize: 11, color: '#F59F0B', fontWeight: 700 }}>✦</span>
              <span style={{ fontSize: 12.5, fontWeight: 700, letterSpacing: '.8px', background: 'linear-gradient(135deg,#F59F0B,#F0543C)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>POWERFUL FEATURES</span>
              <span style={{ fontSize: 11, color: '#F59F0B', fontWeight: 700 }}>✦</span>
            </div>

            {/* Heading row + side decorations */}
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 22, animation: 'fadeInUp .7s ease .1s both' }}>

              {/* LEFT: Stacked document illustration */}
              <div className="hero-decos" style={{ position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)', animation: 'softFloat 8s ease-in-out infinite', opacity: .92 }}>
                <div style={{ position: 'relative', width: 165, height: 188 }}>
                  <div style={{ position: 'absolute', bottom: 0, left: 0, width: 124, height: 155, background: 'linear-gradient(135deg,#FFE0B0,#FFD090)', borderRadius: 11, transform: 'rotate(-9deg)', boxShadow: '0 6px 22px rgba(245,159,11,.2)' }} />
                  <div style={{ position: 'absolute', bottom: 9, left: 9, width: 124, height: 155, background: 'linear-gradient(135deg,#FFF0D8,#FFE4B8)', borderRadius: 11, transform: 'rotate(-4deg)', boxShadow: '0 4px 16px rgba(245,159,11,.14)' }}>
                    <div style={{ position: 'absolute', top: 28, left: 14, right: 14, height: 2.5, background: 'rgba(240,84,60,.22)', borderRadius: 2 }} />
                    <div style={{ position: 'absolute', top: 44, left: 14, right: 14, height: 2.5, background: 'rgba(240,84,60,.22)', borderRadius: 2 }} />
                    <div style={{ position: 'absolute', top: 60, left: 14, width: '55%', height: 2.5, background: 'rgba(240,84,60,.18)', borderRadius: 2 }} />
                  </div>
                  <div style={{ position: 'absolute', bottom: 18, left: 18, width: 124, height: 155, background: 'linear-gradient(135deg,#FFF8F0,#FFF2E4)', borderRadius: 11, boxShadow: '0 4px 22px rgba(240,84,60,.1)' }}>
                    <div style={{ position: 'absolute', top: 26, left: 14, right: 14, height: 2.5, background: 'rgba(245,159,11,.28)', borderRadius: 2 }} />
                    <div style={{ position: 'absolute', top: 42, left: 14, right: 14, height: 2.5, background: 'rgba(245,159,11,.28)', borderRadius: 2 }} />
                    <div style={{ position: 'absolute', top: 58, left: 14, width: '62%', height: 2.5, background: 'rgba(245,159,11,.22)', borderRadius: 2 }} />
                    <div style={{ position: 'absolute', top: 74, left: 14, right: 14, height: 2.5, background: 'rgba(245,159,11,.18)', borderRadius: 2 }} />
                    <div style={{ position: 'absolute', bottom: 22, left: 14, right: 14, height: 1.5, background: 'rgba(240,84,60,.32)' }} />
                  </div>
                  <div style={{ position: 'absolute', bottom: -10, right: 2, width: 46, height: 46, borderRadius: '50%', background: 'linear-gradient(135deg,#F59F0B,#F0543C)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 18px rgba(240,84,60,.38)', animation: 'pulse 3s ease-in-out infinite' }}>
                    <svg width="18" height="18" viewBox="0 0 20 20" fill="none"><path d="M10 1L11.8 6.5H17.5L12.9 9.8L14.8 15.3L10 12L5.2 15.3L7.1 9.8L2.5 6.5H8.2L10 1Z" fill="#FFF8F0" opacity=".95" /></svg>
                  </div>
                </div>
              </div>

              {/* HEADING */}
              <h1 style={{ fontSize: 'clamp(36px,5vw,66px)', fontWeight: 800, lineHeight: 1.1, letterSpacing: '-2.5px', color: '#2D1200', maxWidth: 700, textAlign: 'center' }}>
                Everything You Need.<br />
                One <em style={{ fontFamily: "'Playfair Display', serif", fontStyle: 'italic', fontWeight: 700, background: 'linear-gradient(135deg,#F0543C 0%,#F43F6E 55%,#F59F0B 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Intelligent</em> Platform.
              </h1>

              {/* RIGHT: Gavel illustration */}
              <div className="hero-decos" style={{ position: 'absolute', right: 0, top: '50%', transform: 'translateY(-50%)', animation: 'softFloat2 9s ease-in-out infinite', opacity: .9 }}>
                <div style={{ position: 'relative', width: 165, height: 188 }}>
                  <div style={{ position: 'absolute', top: 12, left: 12, width: 142, height: 142, borderRadius: '50%', border: '2px dashed rgba(240,84,60,.2)' }} />
                  <div style={{ position: 'absolute', top: 22, left: 22, width: 122, height: 122, borderRadius: '50%', border: '1.5px solid rgba(245,159,11,.18)' }} />
                  <div style={{ position: 'absolute', top: 50, left: 50, width: 82, height: 82, borderRadius: '50%', background: 'rgba(245,159,11,.08)' }} />
                  <div style={{ position: 'absolute', top: 16, right: 10, width: 78, height: 28, background: 'linear-gradient(135deg,#FDDC9E,#F59F0B)', borderRadius: 8, transform: 'rotate(-38deg)', boxShadow: '0 4px 14px rgba(245,159,11,.38)' }} />
                  <div style={{ position: 'absolute', top: 68, left: 14, width: 11, height: 88, background: 'linear-gradient(180deg,#F59F0B,#D97706)', borderRadius: 6, transform: 'rotate(-38deg)', transformOrigin: 'top center', boxShadow: '0 4px 12px rgba(245,159,11,.25)' }} />
                  <div style={{ position: 'absolute', bottom: 18, right: 16, width: 26, height: 26, borderRadius: '50%', background: 'rgba(240,84,60,.14)' }} />
                  <div style={{ position: 'absolute', bottom: 10, right: 48, width: 15, height: 15, borderRadius: '50%', background: 'rgba(245,159,11,.22)' }} />
                  <div style={{ position: 'absolute', top: 10, left: 10, width: 18, height: 18, borderRadius: '50%', background: 'rgba(244,63,110,.18)' }} />
                </div>
              </div>
            </div>

            {/* Subtitle */}
            <p style={{ fontSize: 17, fontWeight: 400, color: '#8A5030', maxWidth: 548, margin: '0 auto', lineHeight: 1.68, animation: 'fadeInUp .7s ease .2s both' }}>
              Vaakya combines 8 specialized AI agents to handle your entire legal document lifecycle — from draft to dispute resolution.
            </p>
          </div>
        </section>

        {/* ═══════════ FEATURE CARDS 3×2 ═══════════ */}
        <section style={{ position: 'relative', zIndex: 1, padding: '8px 48px 80px', maxWidth: 1240, margin: '0 auto' }}>
          <div className="feature-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 22 }}>

            {/* CARD 1: AI Contract Drafting */}
            <div className="fcard" style={{ position: 'relative', background: 'rgba(255,252,244,.9)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', border: '1.5px solid rgba(245,159,11,.22)', borderRadius: 28, padding: '28px 28px 72px', boxShadow: '0 4px 26px rgba(245,159,11,.08),0 1px 4px rgba(0,0,0,.04)', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(148deg,rgba(255,244,210,.45),transparent 58%)', pointerEvents: 'none', borderRadius: 28 }} />
              <div style={{ position: 'absolute', top: 14, right: 14, width: 82, height: 72, backgroundImage: 'radial-gradient(circle,rgba(245,159,11,.18) 1.3px,transparent 1.3px)', backgroundSize: '12px 12px' }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: 11, marginBottom: 16, position: 'relative', zIndex: 1 }}>
                <div style={{ width: 50, height: 50, borderRadius: 14, background: 'linear-gradient(135deg,#FFF0CC,#FFE0A0)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 14px rgba(245,159,11,.28)', flexShrink: 0 }}>
                  <svg width="23" height="23" viewBox="0 0 24 24" fill="none"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" stroke="#F59F0B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" stroke="#F59F0B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </div>
                <div>
                  <div style={{ fontSize: 10, fontWeight: 600, color: '#B07020', letterSpacing: '.7px', textTransform: 'uppercase', marginBottom: 2 }}>POWERED BY</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#D97706' }}>Rachana</div>
                </div>
              </div>
              <h3 style={{ fontSize: 20, fontWeight: 800, color: '#2D1200', marginBottom: 9, letterSpacing: '-.4px', position: 'relative', zIndex: 1 }}>AI Contract Drafting</h3>
              <p style={{ fontSize: 13.5, color: '#7A4A2A', lineHeight: 1.62, marginBottom: 15, position: 'relative', zIndex: 1 }}>Describe your contract in plain English and get a complete, enforceable legal document in seconds.</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, position: 'relative', zIndex: 1 }}>
                {[['12+ document types supported'], ['Indian law compliant clauses'], ['7-point consistency check']].map(([text]) => (
                  <div key={text} style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                    <div style={{ width: 18, height: 18, borderRadius: '50%', background: 'rgba(245,159,11,.15)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 5l2 2 4-4" stroke="#D97706" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    </div>
                    <span style={{ fontSize: 13, color: '#5A3820' }}>{text}</span>
                  </div>
                ))}
              </div>
              <button className="cta-pill" style={{ position: 'absolute', bottom: 22, right: 22, width: 44, height: 44, borderRadius: '50%', background: 'linear-gradient(135deg,#F59F0B,#D97706)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 16px rgba(245,159,11,.42)' }}>
                <svg width="17" height="17" viewBox="0 0 17 17" fill="none"><path d="M3.5 8.5H13.5M9.5 4.5L13.5 8.5L9.5 12.5" stroke="#FFF8F0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </button>
            </div>

            {/* CARD 2: PDF Review & Redline */}
            <div className="fcard" style={{ position: 'relative', background: 'rgba(245,255,250,.9)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', border: '1.5px solid rgba(5,150,105,.18)', borderRadius: 28, padding: '28px 28px 72px', boxShadow: '0 4px 26px rgba(5,150,105,.07),0 1px 4px rgba(0,0,0,.04)', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(148deg,rgba(204,255,230,.38),transparent 58%)', pointerEvents: 'none', borderRadius: 28 }} />
              <div style={{ position: 'absolute', top: 14, right: 14, width: 82, height: 72, backgroundImage: 'radial-gradient(circle,rgba(5,150,105,.18) 1.3px,transparent 1.3px)', backgroundSize: '12px 12px' }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: 11, marginBottom: 16, position: 'relative', zIndex: 1 }}>
                <div style={{ width: 50, height: 50, borderRadius: 14, background: 'linear-gradient(135deg,#C8FCEC,#A4F0D8)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 14px rgba(5,150,105,.24)', flexShrink: 0 }}>
                  <svg width="23" height="23" viewBox="0 0 24 24" fill="none"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" stroke="#059669" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /><polyline points="14,2 14,8 20,8" stroke="#059669" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /><line x1="16" y1="13" x2="8" y2="13" stroke="#059669" strokeWidth="2" strokeLinecap="round" /><line x1="16" y1="17" x2="8" y2="17" stroke="#059669" strokeWidth="2" strokeLinecap="round" /></svg>
                </div>
                <div>
                  <div style={{ fontSize: 10, fontWeight: 600, color: '#057850', letterSpacing: '.7px', textTransform: 'uppercase', marginBottom: 2 }}>POWERED BY</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#059669' }}>Arambha + Samjoota</div>
                </div>
              </div>
              <h3 style={{ fontSize: 20, fontWeight: 800, color: '#2D1200', marginBottom: 9, letterSpacing: '-.4px', position: 'relative', zIndex: 1 }}>PDF Review &amp; Redline</h3>
              <p style={{ fontSize: 13.5, color: '#7A4A2A', lineHeight: 1.62, marginBottom: 15, position: 'relative', zIndex: 1 }}>Upload any contract and get clause-by-clause analysis with redlines, suggestions, and negotiation playbook.</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, position: 'relative', zIndex: 1 }}>
                {[['16+ document types supported'], ['Accept / Reject / Counter advice'], ['Fallback & walkaway positions']].map(([text]) => (
                  <div key={text} style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                    <div style={{ width: 18, height: 18, borderRadius: '50%', background: 'rgba(5,150,105,.14)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 5l2 2 4-4" stroke="#059669" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    </div>
                    <span style={{ fontSize: 13, color: '#5A3820' }}>{text}</span>
                  </div>
                ))}
              </div>
              <button className="cta-pill" style={{ position: 'absolute', bottom: 22, right: 22, width: 44, height: 44, borderRadius: '50%', background: 'linear-gradient(135deg,#10B981,#059669)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 16px rgba(5,150,105,.38)' }}>
                <svg width="17" height="17" viewBox="0 0 17 17" fill="none"><path d="M3.5 8.5H13.5M9.5 4.5L13.5 8.5L9.5 12.5" stroke="#F5FFF9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </button>
            </div>

            {/* CARD 3: AI Risk Detection */}
            <div className="fcard" style={{ position: 'relative', background: 'rgba(255,244,248,.9)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', border: '1.5px solid rgba(244,63,110,.18)', borderRadius: 28, padding: '28px 28px 72px', boxShadow: '0 4px 26px rgba(244,63,110,.07),0 1px 4px rgba(0,0,0,.04)', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(148deg,rgba(255,210,230,.38),transparent 58%)', pointerEvents: 'none', borderRadius: 28 }} />
              <div style={{ position: 'absolute', top: 14, right: 14, width: 82, height: 72, backgroundImage: 'radial-gradient(circle,rgba(244,63,110,.18) 1.3px,transparent 1.3px)', backgroundSize: '12px 12px' }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: 11, marginBottom: 16, position: 'relative', zIndex: 1 }}>
                <div style={{ width: 50, height: 50, borderRadius: 14, background: 'linear-gradient(135deg,#FFD0E4,#FFB4CC)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 14px rgba(244,63,110,.28)', flexShrink: 0 }}>
                  <svg width="23" height="23" viewBox="0 0 24 24" fill="none"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="#F43F6E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /><path d="M12 8v4" stroke="#F43F6E" strokeWidth="2" strokeLinecap="round" /><circle cx="12" cy="15" r="1.2" fill="#F43F6E" /></svg>
                </div>
                <div>
                  <div style={{ fontSize: 10, fontWeight: 600, color: '#B03060', letterSpacing: '.7px', textTransform: 'uppercase', marginBottom: 2 }}>POWERED BY</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#F43F6E' }}>Jokhim</div>
                </div>
              </div>
              <h3 style={{ fontSize: 20, fontWeight: 800, color: '#2D1200', marginBottom: 9, letterSpacing: '-.4px', position: 'relative', zIndex: 1 }}>AI Risk Detection</h3>
              <p style={{ fontSize: 13.5, color: '#7A4A2A', lineHeight: 1.62, marginBottom: 15, position: 'relative', zIndex: 1 }}>Detect legal, financial, and operational risks before you sign. Get a risk score and actionable recommendations.</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, position: 'relative', zIndex: 1 }}>
                {[['7 risk categories'], ['0–100 risk scoring'], ['Live Indian law research']].map(([text]) => (
                  <div key={text} style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                    <div style={{ width: 18, height: 18, borderRadius: '50%', background: 'rgba(244,63,110,.13)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 5l2 2 4-4" stroke="#F43F6E" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    </div>
                    <span style={{ fontSize: 13, color: '#5A3820' }}>{text}</span>
                  </div>
                ))}
              </div>
              <button className="cta-pill" style={{ position: 'absolute', bottom: 22, right: 22, width: 44, height: 44, borderRadius: '50%', background: 'linear-gradient(135deg,#F43F6E,#E11D48)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 16px rgba(244,63,110,.4)' }}>
                <svg width="17" height="17" viewBox="0 0 17 17" fill="none"><path d="M3.5 8.5H13.5M9.5 4.5L13.5 8.5L9.5 12.5" stroke="#FFF5F8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </button>
            </div>

            {/* CARD 4: Reflexion Review Loop */}
            <div className="fcard" style={{ position: 'relative', background: 'rgba(255,248,240,.9)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', border: '1.5px solid rgba(234,88,12,.2)', borderRadius: 28, padding: '28px 28px 72px', boxShadow: '0 4px 26px rgba(234,88,12,.07),0 1px 4px rgba(0,0,0,.04)', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(148deg,rgba(255,224,190,.38),transparent 58%)', pointerEvents: 'none', borderRadius: 28 }} />
              <div style={{ position: 'absolute', top: 14, right: 14, width: 82, height: 72, backgroundImage: 'radial-gradient(circle,rgba(234,88,12,.18) 1.3px,transparent 1.3px)', backgroundSize: '12px 12px' }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: 11, marginBottom: 16, position: 'relative', zIndex: 1 }}>
                <div style={{ width: 50, height: 50, borderRadius: 14, background: 'linear-gradient(135deg,#FFE4C8,#FFC8A0)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 14px rgba(234,88,12,.28)', flexShrink: 0 }}>
                  <svg width="23" height="23" viewBox="0 0 24 24" fill="none"><polyline points="1,4 1,10 7,10" stroke="#EA580C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /><path d="M3.51 15a9 9 0 102.13-9.36L1 10" stroke="#EA580C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </div>
                <div>
                  <div style={{ fontSize: 10, fontWeight: 600, color: '#A04010', letterSpacing: '.7px', textTransform: 'uppercase', marginBottom: 2 }}>POWERED BY</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#EA580C' }}>Parisheelanam ↔ Rachana</div>
                </div>
              </div>
              <h3 style={{ fontSize: 20, fontWeight: 800, color: '#2D1200', marginBottom: 9, letterSpacing: '-.4px', position: 'relative', zIndex: 1 }}>Reflexion Review Loop</h3>
              <p style={{ fontSize: 13.5, color: '#7A4A2A', lineHeight: 1.62, marginBottom: 15, position: 'relative', zIndex: 1 }}>Self-improving drafts that review and redraft until quality meets the threshold.</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, position: 'relative', zIndex: 1 }}>
                {[['6 quality dimensions'], ['8 red flag checks'], ['Up to 3 improvement cycles']].map(([text]) => (
                  <div key={text} style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                    <div style={{ width: 18, height: 18, borderRadius: '50%', background: 'rgba(234,88,12,.13)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 5l2 2 4-4" stroke="#EA580C" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    </div>
                    <span style={{ fontSize: 13, color: '#5A3820' }}>{text}</span>
                  </div>
                ))}
              </div>
              <button className="cta-pill" style={{ position: 'absolute', bottom: 22, right: 22, width: 44, height: 44, borderRadius: '50%', background: 'linear-gradient(135deg,#F59F0B,#EA580C)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 16px rgba(234,88,12,.4)' }}>
                <svg width="17" height="17" viewBox="0 0 17 17" fill="none"><path d="M3.5 8.5H13.5M9.5 4.5L13.5 8.5L9.5 12.5" stroke="#FFF8F0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </button>
            </div>

            {/* CARD 5: Negotiation Intelligence */}
            <div className="fcard" style={{ position: 'relative', background: 'rgba(244,255,250,.9)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', border: '1.5px solid rgba(14,168,130,.18)', borderRadius: 28, padding: '28px 28px 72px', boxShadow: '0 4px 26px rgba(14,168,130,.07),0 1px 4px rgba(0,0,0,.04)', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(148deg,rgba(192,255,234,.38),transparent 58%)', pointerEvents: 'none', borderRadius: 28 }} />
              <div style={{ position: 'absolute', top: 14, right: 14, width: 82, height: 72, backgroundImage: 'radial-gradient(circle,rgba(14,168,130,.18) 1.3px,transparent 1.3px)', backgroundSize: '12px 12px' }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: 11, marginBottom: 16, position: 'relative', zIndex: 1 }}>
                <div style={{ width: 50, height: 50, borderRadius: 14, background: 'linear-gradient(135deg,#C4F8E8,#98F0D4)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 14px rgba(14,168,130,.24)', flexShrink: 0 }}>
                  <svg width="23" height="23" viewBox="0 0 24 24" fill="none"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" stroke="#0EA882" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /><circle cx="9" cy="7" r="4" stroke="#0EA882" strokeWidth="2" /><path d="M23 21v-2a4 4 0 00-3-3.87" stroke="#0EA882" strokeWidth="2" strokeLinecap="round" /><path d="M16 3.13a4 4 0 010 7.75" stroke="#0EA882" strokeWidth="2" strokeLinecap="round" /></svg>
                </div>
                <div>
                  <div style={{ fontSize: 10, fontWeight: 600, color: '#0A8060', letterSpacing: '.7px', textTransform: 'uppercase', marginBottom: 2 }}>POWERED BY</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#0EA882' }}>Samjoota</div>
                </div>
              </div>
              <h3 style={{ fontSize: 20, fontWeight: 800, color: '#2D1200', marginBottom: 9, letterSpacing: '-.4px', position: 'relative', zIndex: 1 }}>Negotiation Intelligence</h3>
              <p style={{ fontSize: 13.5, color: '#7A4A2A', lineHeight: 1.62, marginBottom: 15, position: 'relative', zIndex: 1 }}>AI-powered negotiation playbook with smart redlines and counter strategies to win every deal.</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, position: 'relative', zIndex: 1 }}>
                {[['Smart redline diff'], ['Fallback & walkaway strategy'], ['Leverage scoring']].map(([text]) => (
                  <div key={text} style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                    <div style={{ width: 18, height: 18, borderRadius: '50%', background: 'rgba(14,168,130,.13)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 5l2 2 4-4" stroke="#0EA882" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    </div>
                    <span style={{ fontSize: 13, color: '#5A3820' }}>{text}</span>
                  </div>
                ))}
              </div>
              <button className="cta-pill" style={{ position: 'absolute', bottom: 22, right: 22, width: 44, height: 44, borderRadius: '50%', background: 'linear-gradient(135deg,#0EA882,#059669)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 16px rgba(14,168,130,.38)' }}>
                <svg width="17" height="17" viewBox="0 0 17 17" fill="none"><path d="M3.5 8.5H13.5M9.5 4.5L13.5 8.5L9.5 12.5" stroke="#F0FFF8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </button>
            </div>

            {/* CARD 6: Obligation Tracking & Disputes */}
            <div className="fcard" style={{ position: 'relative', background: 'rgba(255,252,238,.9)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', border: '1.5px solid rgba(217,119,6,.18)', borderRadius: 28, padding: '28px 28px 72px', boxShadow: '0 4px 26px rgba(217,119,6,.07),0 1px 4px rgba(0,0,0,.04)', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(148deg,rgba(255,236,190,.38),transparent 58%)', pointerEvents: 'none', borderRadius: 28 }} />
              <div style={{ position: 'absolute', top: 14, right: 14, width: 82, height: 72, backgroundImage: 'radial-gradient(circle,rgba(217,119,6,.18) 1.3px,transparent 1.3px)', backgroundSize: '12px 12px' }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: 11, marginBottom: 16, position: 'relative', zIndex: 1 }}>
                <div style={{ width: 50, height: 50, borderRadius: 14, background: 'linear-gradient(135deg,#FEECCC,#FEDD9C)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 14px rgba(217,119,6,.28)', flexShrink: 0 }}>
                  <svg width="23" height="23" viewBox="0 0 24 24" fill="none"><rect x="3" y="4" width="18" height="18" rx="2" stroke="#D97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /><line x1="16" y1="2" x2="16" y2="6" stroke="#D97706" strokeWidth="2" strokeLinecap="round" /><line x1="8" y1="2" x2="8" y2="6" stroke="#D97706" strokeWidth="2" strokeLinecap="round" /><line x1="3" y1="10" x2="21" y2="10" stroke="#D97706" strokeWidth="2" strokeLinecap="round" /><circle cx="8" cy="15" r="1.3" fill="#D97706" /><circle cx="12" cy="15" r="1.3" fill="#D97706" /><circle cx="16" cy="15" r="1.3" fill="#D97706" /></svg>
                </div>
                <div>
                  <div style={{ fontSize: 10, fontWeight: 600, color: '#A07010', letterSpacing: '.7px', textTransform: 'uppercase', marginBottom: 2 }}>POWERED BY</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#D97706' }}>Sruthi + Vivada</div>
                </div>
              </div>
              <h3 style={{ fontSize: 20, fontWeight: 800, color: '#2D1200', marginBottom: 9, letterSpacing: '-.4px', position: 'relative', zIndex: 1 }}>Obligation Tracking &amp; Disputes</h3>
              <p style={{ fontSize: 13.5, color: '#7A4A2A', lineHeight: 1.62, marginBottom: 15, position: 'relative', zIndex: 1 }}>Track obligations, get reminders, and resolve disputes with AI-powered legal insights.</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, position: 'relative', zIndex: 1 }}>
                {[['Auto reminders & alerts'], ['Dispute summary in 26 seconds'], ['Clause-backed recommendations']].map(([text]) => (
                  <div key={text} style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                    <div style={{ width: 18, height: 18, borderRadius: '50%', background: 'rgba(217,119,6,.13)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 5l2 2 4-4" stroke="#D97706" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    </div>
                    <span style={{ fontSize: 13, color: '#5A3820' }}>{text}</span>
                  </div>
                ))}
              </div>
              <button className="cta-pill" style={{ position: 'absolute', bottom: 22, right: 22, width: 44, height: 44, borderRadius: '50%', background: 'linear-gradient(135deg,#F59F0B,#D97706)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 16px rgba(217,119,6,.4)' }}>
                <svg width="17" height="17" viewBox="0 0 17 17" fill="none"><path d="M3.5 8.5H13.5M9.5 4.5L13.5 8.5L9.5 12.5" stroke="#FFF8F0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </button>
            </div>

          </div>
        </section>

        {/* ═══════════ 8 AI AGENTS ═══════════ */}
        <section style={{ position: 'relative', zIndex: 1, padding: '16px 48px 80px', maxWidth: 1240, margin: '0 auto' }}>
          <div style={{ background: 'rgba(255,252,244,.82)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)', border: '1.5px solid rgba(245,159,11,.16)', borderRadius: 32, padding: '56px 56px 52px', boxShadow: '0 8px 48px rgba(245,159,11,.08)', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: -60, right: -60, width: 300, height: 300, background: 'radial-gradient(circle,rgba(240,84,60,.1) 0%,transparent 65%)', pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', bottom: -40, left: -40, width: 260, height: 260, background: 'radial-gradient(circle,rgba(245,159,11,.1) 0%,transparent 65%)', pointerEvents: 'none' }} />

            <div style={{ textAlign: 'center', marginBottom: 44 }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                <div style={{ width: 40, height: 1.5, background: 'linear-gradient(to right,transparent,rgba(245,159,11,.5))' }} />
                <span style={{ fontSize: 11, fontWeight: 700, color: '#F59F0B', letterSpacing: '.8px', textTransform: 'uppercase' }}>✦ The 8 AI Agents of Vaakya ✦</span>
                <div style={{ width: 40, height: 1.5, background: 'linear-gradient(to left,transparent,rgba(245,159,11,.5))' }} />
              </div>
              <h2 style={{ fontSize: 28, fontWeight: 800, color: '#2D1200', letterSpacing: '-.6px', marginBottom: 8 }}>The 8 AI Agents of Vaakya</h2>
              <p style={{ fontSize: 14.5, color: '#8A5030', fontWeight: 400 }}>Each agent specializes in a critical part of the legal lifecycle.</p>
            </div>

            <div style={{ position: 'relative', marginBottom: 44 }}>
              {/* Connecting dotted line */}
              <div style={{ position: 'absolute', top: 40, left: 'calc(12.5% - 22px)', right: 'calc(12.5% - 22px)', height: 3, background: 'repeating-linear-gradient(to right,rgba(245,159,11,.55) 0,rgba(245,159,11,.55) 8px,transparent 8px,transparent 18px)', zIndex: 0 }} />
              <div className="agents-row" style={{ display: 'flex', justifyContent: 'space-between', gap: 0, position: 'relative', zIndex: 1 }}>

                {[
                  { name: 'Arambha', role: 'Intake & Routing', num: '01', bg: 'linear-gradient(135deg,#FFF0CC,#F59F0B)', shadow: 'rgba(245,159,11,.38)', badge: '#D97706', icon: <svg width="26" height="26" viewBox="0 0 24 24" fill="none"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" stroke="#FFF8F0" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /><circle cx="12" cy="7" r="4" stroke="#FFF8F0" strokeWidth="2.2" /></svg> },
                  { name: 'Rachana', role: 'Contract Drafting', num: '02', bg: 'linear-gradient(135deg,#FFE4D8,#F0543C)', shadow: 'rgba(240,84,60,.38)', badge: '#D63C28', icon: <svg width="26" height="26" viewBox="0 0 24 24" fill="none"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" stroke="#FFF8F0" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" stroke="#FFF8F0" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg> },
                  { name: 'Parisheelanam', role: 'Quality Review', num: '03', bg: 'linear-gradient(135deg,#FFE8CC,#EA580C)', shadow: 'rgba(234,88,12,.38)', badge: '#C04A08', icon: <svg width="26" height="26" viewBox="0 0 24 24" fill="none"><polyline points="1,4 1,10 7,10" stroke="#FFF8F0" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /><path d="M3.51 15a9 9 0 102.13-9.36L1 10" stroke="#FFF8F0" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg> },
                  { name: 'Jokhim', role: 'Risk Detection', num: '04', bg: 'linear-gradient(135deg,#FFD4E4,#F43F6E)', shadow: 'rgba(244,63,110,.38)', badge: '#D02055', icon: <svg width="26" height="26" viewBox="0 0 24 24" fill="none"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="#FFF8F0" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /><path d="M12 8v4" stroke="#FFF8F0" strokeWidth="2.2" strokeLinecap="round" /><circle cx="12" cy="15" r="1.3" fill="#FFF8F0" /></svg> },
                  { name: 'Samjoota', role: 'Negotiation & Redlines', num: '05', bg: 'linear-gradient(135deg,#C4F8E8,#0EA882)', shadow: 'rgba(14,168,130,.38)', badge: '#0B8A64', icon: <svg width="26" height="26" viewBox="0 0 24 24" fill="none"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" stroke="#FFF8F0" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /><circle cx="9" cy="7" r="4" stroke="#FFF8F0" strokeWidth="2.2" /><path d="M23 21v-2a4 4 0 00-3-3.87" stroke="#FFF8F0" strokeWidth="2.2" strokeLinecap="round" /><path d="M16 3.13a4 4 0 010 7.75" stroke="#FFF8F0" strokeWidth="2.2" strokeLinecap="round" /></svg> },
                  { name: 'Sahee', role: 'Sign & Deliver', num: '06', bg: 'linear-gradient(135deg,#FEF0CC,#D97706)', shadow: 'rgba(217,119,6,.38)', badge: '#B06005', icon: <svg width="26" height="26" viewBox="0 0 24 24" fill="none"><polyline points="20,6 9,17 4,12" stroke="#FFF8F0" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></svg> },
                  { name: 'Sruthi', role: 'Obligation Tracker', num: '07', bg: 'linear-gradient(135deg,#CCF4E4,#059669)', shadow: 'rgba(5,150,105,.38)', badge: '#047850', icon: <svg width="26" height="26" viewBox="0 0 24 24" fill="none"><rect x="3" y="4" width="18" height="18" rx="2" stroke="#FFF8F0" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /><line x1="16" y1="2" x2="16" y2="6" stroke="#FFF8F0" strokeWidth="2.2" strokeLinecap="round" /><line x1="8" y1="2" x2="8" y2="6" stroke="#FFF8F0" strokeWidth="2.2" strokeLinecap="round" /><line x1="3" y1="10" x2="21" y2="10" stroke="#FFF8F0" strokeWidth="2.2" strokeLinecap="round" /></svg> },
                  { name: 'Vivada', role: 'Dispute Resolution', num: '08', bg: 'linear-gradient(135deg,#FFD8D8,#E11D48)', shadow: 'rgba(225,29,72,.38)', badge: '#B81535', icon: <svg width="26" height="26" viewBox="0 0 24 24" fill="none"><path d="M12 2L3 7l9 5 9-5-9-5z" stroke="#FFF8F0" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /><path d="M3 17l9 5 9-5" stroke="#FFF8F0" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /><path d="M3 12l9 5 9-5" stroke="#FFF8F0" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg> },
                ].map((agent) => (
                  <div key={agent.num} className="agent-wrap" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, width: '12.5%' }}>
                    <div style={{ position: 'relative' }}>
                      <div style={{ width: 64, height: 64, borderRadius: '50%', background: agent.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 6px 20px ${agent.shadow}` }}>
                        {agent.icon}
                      </div>
                      <div style={{ position: 'absolute', bottom: -8, left: '50%', transform: 'translateX(-50%)', fontSize: 9, fontWeight: 800, color: '#FFF8F0', background: agent.badge, borderRadius: 100, padding: '2px 7px', whiteSpace: 'nowrap', letterSpacing: '.3px' }}>{agent.num}</div>
                    </div>
                    <div style={{ textAlign: 'center', marginTop: 6 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: '#2D1200', marginBottom: 2 }}>{agent.name}</div>
                      <div style={{ fontSize: 11, color: '#9A6040', fontWeight: 400 }}>{agent.role}</div>
                    </div>
                  </div>
                ))}

              </div>
            </div>

            <div style={{ textAlign: 'center' }}>
              <a href="/auth/login" className="cta-pill" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, fontSize: 15, fontWeight: 700, color: '#FFF8F0', fontFamily: "'Plus Jakarta Sans', sans-serif", padding: '14px 34px', background: 'linear-gradient(135deg,#F0543C,#F43F6E)', borderRadius: 100, boxShadow: '0 8px 28px rgba(240,84,60,.32)', letterSpacing: '-.1px', textDecoration: 'none' }}>
                Explore How It Works
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8H13M9 4L13 8L9 12" stroke="#FFF8F0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </a>
            </div>
          </div>
        </section>

        {/* ═══════════ MORE CAPABILITIES ═══════════ */}
        <section style={{ position: 'relative', zIndex: 1, padding: '0 48px 80px', maxWidth: 1240, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 36 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 16, marginBottom: 12 }}>
              <div style={{ height: 1.5, width: 50, background: 'linear-gradient(to right,transparent,rgba(240,84,60,.4))' }} />
              <h2 style={{ fontSize: 24, fontWeight: 800, color: '#2D1200', letterSpacing: '-.5px' }}>More Capabilities Built for SMBs</h2>
              <div style={{ height: 1.5, width: 50, background: 'linear-gradient(to left,transparent,rgba(240,84,60,.4))' }} />
            </div>
          </div>
          <div className="cap-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(6,1fr)', gap: 16 }}>

            <div className="capcard" style={{ background: 'rgba(255,252,244,.9)', backdropFilter: 'blur(18px)', WebkitBackdropFilter: 'blur(18px)', border: '1.5px solid rgba(245,159,11,.18)', borderRadius: 22, padding: '22px 18px 24px', boxShadow: '0 3px 18px rgba(245,159,11,.07)', textAlign: 'left' }}>
              <div style={{ width: 42, height: 42, borderRadius: 12, background: 'linear-gradient(135deg,#FFF0CC,#FFDD88)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12, boxShadow: '0 3px 12px rgba(245,159,11,.22)' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><rect x="3" y="11" width="18" height="11" rx="2" stroke="#D97706" strokeWidth="2" strokeLinecap="round" /><path d="M7 11V7a5 5 0 0110 0v4" stroke="#D97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#2D1200', marginBottom: 6, lineHeight: 1.3 }}>Secure Legal Vault</div>
              <div style={{ fontSize: 11.5, color: '#8A5030', lineHeight: 1.55 }}>Bank-grade encryption with role-based access and audit logs.</div>
            </div>

            <div className="capcard" style={{ background: 'rgba(244,255,250,.9)', backdropFilter: 'blur(18px)', WebkitBackdropFilter: 'blur(18px)', border: '1.5px solid rgba(14,168,130,.16)', borderRadius: 22, padding: '22px 18px 24px', boxShadow: '0 3px 18px rgba(14,168,130,.06)', textAlign: 'left' }}>
              <div style={{ width: 42, height: 42, borderRadius: 12, background: 'linear-gradient(135deg,#C4F8E8,#98F0D4)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12, boxShadow: '0 3px 12px rgba(14,168,130,.22)' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><line x1="12" y1="1" x2="12" y2="23" stroke="#0EA882" strokeWidth="2" strokeLinecap="round" /><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" stroke="#0EA882" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#2D1200', marginBottom: 6, lineHeight: 1.3 }}>Live Indian Law Research</div>
              <div style={{ fontSize: 11.5, color: '#8A5030', lineHeight: 1.55 }}>Real-time search across 12M+ legal clauses. Always current.</div>
            </div>

            <div className="capcard" style={{ background: 'rgba(255,244,248,.9)', backdropFilter: 'blur(18px)', WebkitBackdropFilter: 'blur(18px)', border: '1.5px solid rgba(244,63,110,.16)', borderRadius: 22, padding: '22px 18px 24px', boxShadow: '0 3px 18px rgba(244,63,110,.06)', textAlign: 'left' }}>
              <div style={{ width: 42, height: 42, borderRadius: 12, background: 'linear-gradient(135deg,#FFD0E4,#FFB4CC)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12, boxShadow: '0 3px 12px rgba(244,63,110,.22)' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><polygon points="12,2 2,7 12,12 22,7" stroke="#F43F6E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /><polyline points="2,17 12,22 22,17" stroke="#F43F6E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /><polyline points="2,12 12,17 22,12" stroke="#F43F6E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#2D1200', marginBottom: 6, lineHeight: 1.3 }}>Semantic Clause Library</div>
              <div style={{ fontSize: 11.5, color: '#8A5030', lineHeight: 1.55 }}>Industry-first vector search across 12M+ legal clauses.</div>
            </div>

            <div className="capcard" style={{ background: 'rgba(255,248,240,.9)', backdropFilter: 'blur(18px)', WebkitBackdropFilter: 'blur(18px)', border: '1.5px solid rgba(234,88,12,.16)', borderRadius: 22, padding: '22px 18px 24px', boxShadow: '0 3px 18px rgba(234,88,12,.06)', textAlign: 'left' }}>
              <div style={{ width: 42, height: 42, borderRadius: 12, background: 'linear-gradient(135deg,#FFE4C8,#FFCCA0)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12, boxShadow: '0 3px 12px rgba(234,88,12,.22)' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><line x1="18" y1="20" x2="18" y2="10" stroke="#EA580C" strokeWidth="2" strokeLinecap="round" /><line x1="12" y1="20" x2="12" y2="4" stroke="#EA580C" strokeWidth="2" strokeLinecap="round" /><line x1="6" y1="20" x2="6" y2="14" stroke="#EA580C" strokeWidth="2" strokeLinecap="round" /></svg>
              </div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#2D1200', marginBottom: 6, lineHeight: 1.3 }}>Analytics Dashboard</div>
              <div style={{ fontSize: 11.5, color: '#8A5030', lineHeight: 1.55 }}>Track risk trends, contract health, and legal savings in real time.</div>
            </div>

            <div className="capcard" style={{ background: 'rgba(245,255,250,.9)', backdropFilter: 'blur(18px)', WebkitBackdropFilter: 'blur(18px)', border: '1.5px solid rgba(5,150,105,.16)', borderRadius: 22, padding: '22px 18px 24px', boxShadow: '0 3px 18px rgba(5,150,105,.06)', textAlign: 'left' }}>
              <div style={{ width: 42, height: 42, borderRadius: 12, background: 'linear-gradient(135deg,#C8FCEC,#A4F0D8)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12, boxShadow: '0 3px 12px rgba(5,150,105,.22)' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" stroke="#059669" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /><polyline points="7,10 12,15 17,10" stroke="#059669" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /><line x1="12" y1="15" x2="12" y2="3" stroke="#059669" strokeWidth="2" strokeLinecap="round" /></svg>
              </div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#2D1200', marginBottom: 6, lineHeight: 1.3 }}>One-Click Download</div>
              <div style={{ fontSize: 11.5, color: '#8A5030', lineHeight: 1.55 }}>DOCX, PDF, and e-sign ready documents in one click.</div>
            </div>

            <div className="capcard" style={{ background: 'rgba(255,252,238,.9)', backdropFilter: 'blur(18px)', WebkitBackdropFilter: 'blur(18px)', border: '1.5px solid rgba(217,119,6,.16)', borderRadius: 22, padding: '22px 18px 24px', boxShadow: '0 3px 18px rgba(217,119,6,.06)', textAlign: 'left' }}>
              <div style={{ width: 42, height: 42, borderRadius: 12, background: 'linear-gradient(135deg,#FEECCC,#FEDD9C)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12, boxShadow: '0 3px 12px rgba(217,119,6,.22)' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="#D97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /><polyline points="9,12 11,14 15,10" stroke="#D97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#2D1200', marginBottom: 6, lineHeight: 1.3 }}>Enterprise Security</div>
              <div style={{ fontSize: 11.5, color: '#8A5030', lineHeight: 1.55 }}>RLS, encrypted storage, private cloud ready, 99.9% uptime.</div>
            </div>

          </div>
        </section>

        {/* ═══════════ CTA BANNER ═══════════ */}
        <section style={{ position: 'relative', zIndex: 1, padding: '0 48px 80px', maxWidth: 1240, margin: '0 auto' }}>
          <div className="cta-banner" style={{ position: 'relative', borderRadius: 32, background: 'linear-gradient(135deg,#FFF0DC 0%,#FFE8CC 30%,#FFD8D8 65%,#FFF0F0 100%)', border: '1.5px solid rgba(240,84,60,.18)', boxShadow: '0 12px 56px rgba(240,84,60,.12)', overflow: 'hidden', padding: '56px 64px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 48 }}>
            <div style={{ position: 'absolute', top: -80, right: -80, width: 380, height: 380, background: 'radial-gradient(circle,rgba(245,159,11,.18) 0%,transparent 65%)', pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', bottom: -60, left: -60, width: 300, height: 300, background: 'radial-gradient(circle,rgba(240,84,60,.12) 0%,transparent 65%)', pointerEvents: 'none' }} />

            {/* Left illustration */}
            <div style={{ flexShrink: 0, position: 'relative', zIndex: 1, animation: 'softFloat 8s ease-in-out infinite' }}>
              <div style={{ position: 'relative', width: 148, height: 168 }}>
                <div style={{ position: 'absolute', bottom: 0, left: 0, width: 115, height: 145, background: 'linear-gradient(135deg,#FFD8B0,#FFBF88)', borderRadius: 12, transform: 'rotate(-8deg)', boxShadow: '0 8px 24px rgba(240,84,60,.18)' }} />
                <div style={{ position: 'absolute', bottom: 12, left: 12, width: 115, height: 145, background: 'linear-gradient(135deg,#FFF4E8,#FFEAD0)', borderRadius: 12, transform: 'rotate(-3deg)', boxShadow: '0 4px 16px rgba(245,159,11,.15)' }}>
                  <div style={{ position: 'absolute', top: 28, left: 14, right: 14, height: 2.5, background: 'rgba(240,84,60,.25)', borderRadius: 2 }} />
                  <div style={{ position: 'absolute', top: 44, left: 14, right: 14, height: 2.5, background: 'rgba(240,84,60,.25)', borderRadius: 2 }} />
                  <div style={{ position: 'absolute', top: 60, left: 14, width: '60%', height: 2.5, background: 'rgba(240,84,60,.2)', borderRadius: 2 }} />
                  <div style={{ position: 'absolute', top: 76, left: 14, right: 14, height: 2.5, background: 'rgba(240,84,60,.18)', borderRadius: 2 }} />
                </div>
                <div style={{ position: 'absolute', bottom: 22, left: 22, width: 115, height: 145, background: 'linear-gradient(135deg,#FFFAF5,#FFF4EC)', borderRadius: 12, boxShadow: '0 4px 20px rgba(240,84,60,.1)' }}>
                  <div style={{ position: 'absolute', top: 26, left: 14, right: 14, height: 2.5, background: 'rgba(245,159,11,.3)', borderRadius: 2 }} />
                  <div style={{ position: 'absolute', top: 42, left: 14, right: 14, height: 2.5, background: 'rgba(245,159,11,.3)', borderRadius: 2 }} />
                  <div style={{ position: 'absolute', top: 58, left: 14, width: '65%', height: 2.5, background: 'rgba(245,159,11,.25)', borderRadius: 2 }} />
                  <div style={{ position: 'absolute', top: 74, left: 14, right: 14, height: 2.5, background: 'rgba(245,159,11,.2)', borderRadius: 2 }} />
                  <div style={{ position: 'absolute', bottom: 20, left: 14, right: 14, height: 1.5, background: 'rgba(240,84,60,.3)' }} />
                </div>
                <div style={{ position: 'absolute', bottom: -10, right: -6, width: 48, height: 48, borderRadius: '50%', background: 'linear-gradient(135deg,#F0543C,#E11D48)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 6px 20px rgba(240,84,60,.4)' }}>
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M10 1L12 7H18L13 10.5L15 16.5L10 13L5 16.5L7 10.5L2 7H8L10 1Z" fill="#FFF8F0" opacity=".95" /></svg>
                </div>
              </div>
            </div>

            {/* Right content */}
            <div style={{ flex: 1, position: 'relative', zIndex: 1 }}>
              <h2 style={{ fontSize: 'clamp(26px,3.2vw,42px)', fontWeight: 800, color: '#2D1200', lineHeight: 1.18, letterSpacing: '-1.2px', marginBottom: 14 }}>
                Ready to <em style={{ fontFamily: "'Playfair Display', serif", fontStyle: 'italic', fontWeight: 700, background: 'linear-gradient(135deg,#F0543C,#F43F6E)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Transform</em><br />
                Your Legal Workflow?
              </h2>
              <p style={{ fontSize: 15.5, color: '#8A5030', lineHeight: 1.65, marginBottom: 28, maxWidth: 440 }}>Join 1,000+ Indian SMBs who trust Vaakya for their legal needs. No lawyers. No delays. Just results.</p>
              <div className="cta-buttons" style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap', marginBottom: 24 }}>
                <a href="/auth/login" className="cta-pill" style={{ display: 'inline-flex', alignItems: 'center', gap: 9, fontSize: 15, fontWeight: 700, color: '#FFF8F0', fontFamily: "'Plus Jakarta Sans', sans-serif", padding: '14px 30px', background: 'linear-gradient(135deg,#F0543C,#F43F6E)', borderRadius: 100, boxShadow: '0 8px 28px rgba(240,84,60,.34)', letterSpacing: '-.1px', textDecoration: 'none' }}>
                  Start Your Free Trial
                  <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><path d="M2.5 7.5H12.5M8.5 3.5L12.5 7.5L8.5 11.5" stroke="#FFF8F0" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </a>
                <a href="/auth/login" className="cta-outline" style={{ display: 'inline-flex', alignItems: 'center', gap: 9, fontSize: 15, fontWeight: 700, color: '#F0543C', fontFamily: "'Plus Jakarta Sans', sans-serif", padding: '13px 28px', background: 'rgba(255,248,240,.6)', border: '2px solid rgba(240,84,60,.35)', borderRadius: 100, letterSpacing: '-.1px', textDecoration: 'none' }}>
                  Book a Demo
                  <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><path d="M2.5 7.5H12.5M8.5 3.5L12.5 7.5L8.5 11.5" stroke="#F0543C" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </a>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
                {[['Join 1,000+ Indian SMBs'], ['No credit card required'], ['14-day free trial']].map(([text]) => (
                  <div key={text} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ width: 16, height: 16, borderRadius: '50%', background: 'rgba(5,150,105,.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <svg width="9" height="9" viewBox="0 0 9 9" fill="none"><path d="M1.5 4.5l2 2 4-4" stroke="#059669" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    </div>
                    <span style={{ fontSize: 12, color: '#7A4A2A', fontWeight: 500 }}>{text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Footer spacer */}
        <div style={{ height: 32 }} />

      </div>
    </>
  );
}
