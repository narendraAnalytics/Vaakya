'use client';

import { useState } from 'react';

const FAQS = [
  {
    question: 'Can I change my plan anytime?',
    answer:
      'Yes! You can upgrade, downgrade, or cancel your plan at any time from your account settings. Changes take effect immediately with prorated billing — no penalties, no hassle.',
  },
  {
    question: 'What happens after my document limit is reached?',
    answer:
      'Once you reach your monthly limit, you can upgrade your plan instantly to continue. Your existing documents remain fully accessible and downloadable at all times.',
  },
  {
    question: 'Do unused documents roll over to the next month?',
    answer:
      'Document credits reset at the start of each billing cycle. We recommend choosing a plan that comfortably covers your typical monthly usage to avoid interruptions.',
  },
  {
    question: 'Is my data secure and private?',
    answer:
      'Absolutely. All documents are encrypted with 256-bit AES encryption, stored on secure Indian servers compliant with Indian data protection laws, and never shared with any third party.',
  },
  {
    question: 'Is GST included in the displayed price?',
    answer:
      'GST (18%) is added at checkout on top of the displayed prices. Every paid plan automatically generates a proper GST invoice you can use for business accounting and tax filing.',
  },
];

export default function PricingPage() {
  const [billing, setBilling] = useState<'monthly' | 'yearly'>('monthly');
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const isYearly = billing === 'yearly';
  const proPrice = isYearly ? '₹165' : '₹199';
  const plusPrice = isYearly ? '₹497' : '₹599';
  const proPer = isYearly ? 'billed ₹1,980/year' : 'billed monthly';
  const plusPer = isYearly ? 'billed ₹5,964/year' : 'billed monthly';

  const monthlyBg = !isYearly ? 'linear-gradient(135deg,#FF6B35,#F59F0B)' : 'transparent';
  const monthlyColor = !isYearly ? '#FFF8F0' : '#7A5030';
  const monthlyShadow = !isYearly ? '0 4px 16px rgba(255,107,53,.35)' : 'none';
  const yearlyBg = isYearly ? 'linear-gradient(135deg,#FF6B35,#F59F0B)' : 'transparent';
  const yearlyColor = isYearly ? '#FFF8F0' : '#7A5030';
  const yearlyShadow = isYearly ? '0 4px 16px rgba(255,107,53,.35)' : 'none';

  const checkIcon = (
    <div style={{ width: 22, height: 22, borderRadius: '50%', background: 'linear-gradient(135deg,#A8E8C8,#5CD99A)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <svg width="11" height="11" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
    </div>
  );

  const proCheckIcon = (
    <div style={{ width: 22, height: 22, borderRadius: '50%', background: 'linear-gradient(135deg,#FF8C42,#F59F0B)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 2px 8px rgba(245,159,11,.35)' }}>
      <svg width="11" height="11" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
    </div>
  );

  const crossIcon = (
    <div style={{ width: 22, height: 22, borderRadius: '50%', background: 'rgba(200,180,165,.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 2l6 6M8 2l-6 6" stroke="#9A7050" strokeWidth="1.8" strokeLinecap="round" /></svg>
    </div>
  );

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html, body { font-family: 'Plus Jakarta Sans', sans-serif; background: #FFF8F0; color: #2D1200; overflow-x: hidden; }

        @keyframes softFloat  { 0%,100%{transform:translateY(0)}    50%{transform:translateY(-18px)} }
        @keyframes softFloat2 { 0%,100%{transform:translateY(-6px)} 50%{transform:translateY(10px)}  }
        @keyframes fadeInUp   { from{opacity:0;transform:translateY(28px)} to{opacity:1;transform:translateY(0)} }
        @keyframes pulse      { 0%,100%{opacity:.75;transform:scale(1)} 50%{opacity:1;transform:scale(1.07)} }
        @keyframes orbGlow    { 0%,100%{box-shadow:0 0 28px 8px rgba(255,145,70,.28)} 50%{box-shadow:0 0 48px 16px rgba(255,180,80,.38)} }
        @keyframes shimmerBg  { 0%{background-position:200% center} 100%{background-position:-200% center} }

        .kpi-card   { transition: transform .25s ease, box-shadow .25s ease; cursor: default; }
        .kpi-card:hover { transform: translateY(-6px); box-shadow: 0 18px 48px rgba(240,84,60,.13) !important; }
        .pc         { transition: transform .28s ease, box-shadow .28s ease; }
        .pc:hover   { transform: translateY(-8px); }
        .pc-pro     { transition: transform .28s ease, box-shadow .28s ease; }
        .pc-pro:hover { transform: translateY(-28px); }
        .btn-orange { transition: transform .2s ease, box-shadow .2s ease; cursor: pointer; }
        .btn-orange:hover { transform: translateY(-2px); box-shadow: 0 12px 36px rgba(240,84,60,.38) !important; }
        .btn-outline-o { transition: background .18s ease, color .18s ease; cursor: pointer; }
        .btn-outline-o:hover { background: rgba(240,84,60,.08) !important; }
        .btn-outline-g { transition: background .18s ease, color .18s ease; cursor: pointer; }
        .btn-outline-g:hover { background: rgba(34,168,96,.08) !important; }
        .faq-row    { transition: background .18s ease; cursor: pointer; }
        .faq-row:hover { background: rgba(245,159,11,.06) !important; }
        .trust-badge { transition: transform .22s ease; cursor: default; }
        .trust-badge:hover { transform: translateY(-4px); }
        .btn-home { transition: background .18s ease, color .18s ease; cursor: pointer; }
        .btn-home:hover { background: rgba(240,84,60,.08) !important; }

        @media (max-width: 1020px) {
          .hero-grid { flex-direction: column !important; }
          .hero-right-wrap { width: 100% !important; max-width: 440px !important; margin: 0 auto !important; }
          .cards-row { flex-direction: column !important; align-items: center !important; }
          .pc, .pc-pro { width: 100% !important; max-width: 380px !important; transform: none !important; }
          .pc-pro { margin-top: 0 !important; }
          .faq-cta-grid { flex-direction: column !important; }
        }
        @media (max-width: 640px) {
          .kpi-grid { grid-template-columns: repeat(2,1fr) !important; }
          .trust-row { flex-wrap: wrap !important; gap: 14px !important; }
        }
      ` }} />

      <div style={{ minHeight: '100vh', background: 'linear-gradient(150deg,#FFF8F0 0%,#FFFAF4 30%,#FFF5EE 65%,#FFF8F2 100%)', position: 'relative', overflow: 'hidden' }}>

        {/* AMBIENT MESH BACKGROUND */}
        <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', overflow: 'hidden', zIndex: 0 }}>
          <div style={{ position: 'absolute', top: -200, right: -150, width: 780, height: 780, background: 'radial-gradient(circle,rgba(255,180,100,.22) 0%,rgba(255,200,140,.12) 40%,transparent 68%)', animation: 'softFloat 12s ease-in-out infinite' }} />
          <div style={{ position: 'absolute', top: '30%', left: -180, width: 660, height: 660, background: 'radial-gradient(circle,rgba(255,140,160,.18) 0%,transparent 65%)', animation: 'softFloat 15s ease-in-out infinite reverse' }} />
          <div style={{ position: 'absolute', bottom: -140, left: '25%', width: 720, height: 600, background: 'radial-gradient(circle,rgba(255,210,90,.15) 0%,transparent 65%)', animation: 'softFloat 13s ease-in-out infinite' }} />
          <div style={{ position: 'absolute', top: '52%', right: '5%', width: 460, height: 460, background: 'radial-gradient(circle,rgba(255,120,80,.1) 0%,transparent 65%)' }} />
          <div style={{ position: 'absolute', top: '8%', right: '16%', width: 210, height: 185, backgroundImage: 'radial-gradient(circle,rgba(240,84,60,.18) 1.5px,transparent 1.5px)', backgroundSize: '20px 20px' }} />
          <div style={{ position: 'absolute', top: '45%', left: '6%', width: 165, height: 145, backgroundImage: 'radial-gradient(circle,rgba(245,159,11,.2) 1.2px,transparent 1.2px)', backgroundSize: '18px 18px' }} />
          <div style={{ position: 'absolute', bottom: '24%', right: '8%', width: 145, height: 125, backgroundImage: 'radial-gradient(circle,rgba(244,63,110,.16) 1.2px,transparent 1.2px)', backgroundSize: '16px 16px' }} />
        </div>

        {/* HEADER */}
        <header style={{ position: 'sticky', top: 0, zIndex: 200, backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)', background: 'rgba(255,248,240,.85)', borderBottom: '1px solid rgba(240,84,60,.1)' }}>
          <div style={{ maxWidth: 1240, margin: '0 auto', padding: '0 48px', height: 68, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            {/* Logo */}
            <a href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
              <div style={{ width: 40, height: 40, background: 'linear-gradient(135deg,#FFE8CC,#FFCFA0)', borderRadius: 11, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 3px 12px rgba(245,159,11,.28)' }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M12 2L4 6v6c0 5.5 3.5 10.7 8 12 4.5-1.3 8-6.5 8-12V6L12 2z" fill="#F59F0B" /><path d="M9 12l2 2 4-4" stroke="#FFF8F0" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </div>
              <div>
                <div style={{ fontSize: 19, fontWeight: 800, color: '#2D1200', letterSpacing: '-.5px', lineHeight: 1.1 }}>VAAKYA</div>
                <div style={{ fontSize: 10, fontWeight: 600, color: '#B08060', letterSpacing: '.3px', lineHeight: 1 }}>AI Legal for Indian SMBs</div>
              </div>
            </a>
            {/* Home button */}
            <a href="/" className="btn-home" style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '9px 20px', borderRadius: 100, border: '1.5px solid rgba(240,84,60,.35)', background: 'rgba(240,84,60,.04)', color: '#F0543C', fontSize: 13.5, fontWeight: 700, textDecoration: 'none', letterSpacing: '-.1px' }}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M9 12L4 7l5-5" stroke="#F0543C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
              Home
            </a>
          </div>
        </header>

        {/* HERO */}
        <section style={{ position: 'relative', zIndex: 1, padding: '80px 48px 56px', maxWidth: 1240, margin: '0 auto' }}>
          <div className="hero-grid" style={{ display: 'flex', alignItems: 'center', gap: 64 }}>

            {/* LEFT copy */}
            <div style={{ flex: 1, minWidth: 0, animation: 'fadeInUp .65s ease both' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 9, background: 'linear-gradient(135deg,rgba(245,159,11,.1),rgba(240,84,60,.09))', border: '1.5px solid rgba(240,84,60,.24)', borderRadius: 100, padding: '7px 22px', marginBottom: 28 }}>
                <span style={{ fontSize: 11, color: '#F59F0B' }}>✦</span>
                <span style={{ fontSize: 12.5, fontWeight: 700, letterSpacing: '.7px', background: 'linear-gradient(135deg,#F59F0B,#F0543C)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>TRANSPARENT PRICING</span>
                <span style={{ fontSize: 11, color: '#F59F0B' }}>✦</span>
              </div>
              <h1 style={{ fontSize: 'clamp(38px,5vw,66px)', fontWeight: 800, lineHeight: 1.08, letterSpacing: '-2.5px', color: '#2D1200', marginBottom: 22 }}>
                Simple Pricing<br />for Every{' '}
                <span style={{ fontFamily: "'Dancing Script', cursive", fontWeight: 700, fontSize: '1.12em', letterSpacing: '-1px', background: 'linear-gradient(135deg,#FF6B35 0%,#F43F6E 60%,#F59F0B 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Business</span>
              </h1>
              <p style={{ fontSize: 17, lineHeight: 1.72, color: '#7A5030', maxWidth: 480, marginBottom: 36, fontWeight: 400 }}>
                AI-powered legal automation that grows with you — from your first contract to your hundredth. No lawyers. No complexity. Just results.
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
                {['No Credit Card', 'Cancel Anytime', 'GST Invoice'].map((label) => (
                  <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg,#FFE0CC,#FFCFB0)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13 }}>✓</div>
                    <span style={{ fontSize: 13.5, fontWeight: 600, color: '#2D1200' }}>{label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* RIGHT illustration */}
            <div className="hero-right-wrap" style={{ flex: '0 0 480px', position: 'relative', animation: 'fadeInUp .75s ease .15s both' }}>
              <div style={{ position: 'absolute', inset: -30, background: 'radial-gradient(ellipse at 50% 60%,rgba(255,155,80,.22) 0%,rgba(255,180,120,.12) 40%,transparent 70%)', borderRadius: '50%', animation: 'orbGlow 4s ease-in-out infinite' }} />
              <div style={{ position: 'absolute', top: '12%', left: '2%', fontSize: 22, color: '#F59F0B', animation: 'softFloat 5s ease-in-out infinite', opacity: 0.7 }}>✦</div>
              <div style={{ position: 'absolute', top: '18%', right: '6%', fontSize: 14, color: '#F43F6E', animation: 'softFloat 6.5s ease-in-out infinite reverse', opacity: 0.6 }}>✦</div>
              <div style={{ position: 'absolute', bottom: '22%', left: '8%', fontSize: 12, color: '#F0543C', animation: 'softFloat 4.5s ease-in-out infinite', opacity: 0.55 }}>✦</div>
              <div style={{ position: 'absolute', top: '6%', right: '20%', width: 18, height: 18, borderRadius: '50%', background: 'linear-gradient(135deg,#FFB38A,#F59F0B)', animation: 'softFloat2 7s ease-in-out infinite', boxShadow: '0 4px 14px rgba(245,159,11,.4)' }} />
              <div style={{ position: 'absolute', bottom: '16%', right: '4%', width: 14, height: 14, borderRadius: '50%', background: 'linear-gradient(135deg,#F43F6E,#F0543C)', animation: 'softFloat 8s ease-in-out infinite reverse', boxShadow: '0 3px 10px rgba(244,63,110,.4)' }} />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="https://res.cloudinary.com/dkqbzwicr/image/upload/v1782534674/pricingicon_l7femk.png" alt="Vaakya Pricing" style={{ width: '100%', maxWidth: 480, position: 'relative', zIndex: 1, filter: 'drop-shadow(0 24px 48px rgba(240,84,60,.18)) drop-shadow(0 8px 20px rgba(245,159,11,.15))', animation: 'softFloat 9s ease-in-out infinite' }} />
            </div>
          </div>
        </section>

        {/* KPI CARDS */}
        <section style={{ position: 'relative', zIndex: 1, padding: '0 48px 64px', maxWidth: 1240, margin: '0 auto' }}>
          <div className="kpi-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 20 }}>
            {[
              { border: 'rgba(245,159,11,.22)', shadow: 'rgba(245,159,11,.1)', iconBg: 'linear-gradient(135deg,#FFEDD0,#FFD48A)', iconShadow: 'rgba(245,159,11,.3)', icon: <svg width="26" height="26" viewBox="0 0 26 26" fill="none"><text x="3" y="20" fontSize="18" fill="#F59F0B">₹</text></svg>, value: 'Save 95%', label: 'vs Lawyer Fees' },
              { border: 'rgba(240,84,60,.2)', shadow: 'rgba(240,84,60,.1)', iconBg: 'linear-gradient(135deg,#FFE0D4,#FFBFAA)', iconShadow: 'rgba(240,84,60,.28)', icon: <svg width="26" height="26" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="#F0543C" strokeWidth="2" /><path d="M12 7v5l3 3" stroke="#F0543C" strokeWidth="2" strokeLinecap="round" /></svg>, value: 'Minutes', label: 'Not Days or Weeks' },
              { border: 'rgba(34,168,96,.22)', shadow: 'rgba(34,168,96,.1)', iconBg: 'linear-gradient(135deg,#D4F5E4,#A8E8C8)', iconShadow: 'rgba(34,168,96,.28)', icon: <svg width="26" height="26" viewBox="0 0 24 24" fill="none"><path d="M12 2L4 6v6c0 5.5 3.5 10.7 8 12 4.5-1.3 8-6.5 8-12V6L12 2z" fill="#22A860" opacity=".25" /><path d="M12 2L4 6v6c0 5.5 3.5 10.7 8 12 4.5-1.3 8-6.5 8-12V6L12 2z" stroke="#22A860" strokeWidth="1.8" fill="none" /><path d="M9 12l2 2 4-4" stroke="#22A860" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>, value: '100% Secure', label: 'Private & Encrypted' },
              { border: 'rgba(244,63,110,.2)', shadow: 'rgba(244,63,110,.1)', iconBg: 'linear-gradient(135deg,#FFDDE8,#FFB8CC)', iconShadow: 'rgba(244,63,110,.28)', icon: <svg width="26" height="26" viewBox="0 0 24 24" fill="none"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" stroke="#F43F6E" strokeWidth="2" strokeLinecap="round" /><circle cx="9" cy="7" r="4" stroke="#F43F6E" strokeWidth="2" /><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" stroke="#F43F6E" strokeWidth="2" strokeLinecap="round" /></svg>, value: '10,000+', label: 'Indian SMBs Trust Us' },
            ].map((kpi, i) => (
              <div key={i} className="kpi-card" style={{ background: 'rgba(255,248,240,.92)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', border: `1.5px solid ${kpi.border}`, borderRadius: 24, padding: '24px 22px', boxShadow: `0 4px 24px ${kpi.shadow},0 1px 4px rgba(0,0,0,.04)`, display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{ width: 54, height: 54, borderRadius: 16, background: kpi.iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: `0 4px 16px ${kpi.iconShadow}` }}>{kpi.icon}</div>
                <div>
                  <div style={{ fontSize: 19, fontWeight: 800, color: '#2D1200', lineHeight: 1.1 }}>{kpi.value}</div>
                  <div style={{ fontSize: 12, fontWeight: 500, color: '#8A6040', marginTop: 3, lineHeight: 1.3 }}>{kpi.label}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* BILLING TOGGLE */}
        <section style={{ position: 'relative', zIndex: 1, padding: '0 48px 52px', textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(255,240,224,.9)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', border: '1.5px solid rgba(245,159,11,.22)', borderRadius: 100, padding: 5, boxShadow: '0 4px 20px rgba(245,159,11,.12)' }}>
              <button onClick={() => setBilling('monthly')} style={{ padding: '10px 28px', borderRadius: 100, border: 'none', fontFamily: 'inherit', fontSize: 14.5, fontWeight: 700, cursor: 'pointer', transition: 'all .22s ease', outline: 'none', background: monthlyBg, color: monthlyColor, boxShadow: monthlyShadow }}>Monthly</button>
              <button onClick={() => setBilling('yearly')} style={{ padding: '10px 28px', borderRadius: 100, border: 'none', fontFamily: 'inherit', fontSize: 14.5, fontWeight: 700, cursor: 'pointer', transition: 'all .22s ease', outline: 'none', background: yearlyBg, color: yearlyColor, boxShadow: yearlyShadow }}>Yearly</button>
            </div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: 'linear-gradient(135deg,rgba(34,168,96,.12),rgba(34,168,96,.08))', border: '1.5px solid rgba(34,168,96,.28)', borderRadius: 100, padding: '5px 16px' }}>
              <span style={{ fontSize: 16 }}>🎉</span>
              <span style={{ fontSize: 12.5, fontWeight: 700, color: '#22A860' }}>Save 17% with yearly billing</span>
            </div>
          </div>
        </section>

        {/* PRICING CARDS */}
        <section style={{ position: 'relative', zIndex: 1, padding: '0 48px 80px', maxWidth: 1200, margin: '0 auto' }}>
          <div className="cards-row" style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: 22 }}>

            {/* FREE */}
            <div className="pc" style={{ flex: '0 0 340px', background: 'rgba(255,250,244,.95)', backdropFilter: 'blur(22px)', WebkitBackdropFilter: 'blur(22px)', border: '1.8px solid rgba(245,159,11,.28)', borderRadius: 30, padding: '36px 32px 32px', boxShadow: '0 8px 36px rgba(245,159,11,.1),0 2px 8px rgba(0,0,0,.05)', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: -60, right: -40, width: 180, height: 180, background: 'radial-gradient(circle,rgba(255,220,140,.22) 0%,transparent 65%)', pointerEvents: 'none' }} />
              <div style={{ width: 52, height: 52, borderRadius: 16, background: 'linear-gradient(135deg,#FFEDD0,#FFD48A)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20, boxShadow: '0 4px 16px rgba(245,159,11,.25)' }}>
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none"><path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17 5.8 21.3l2.4-7.4L2 9.4h7.6L12 2z" fill="#F59F0B" opacity=".9" /></svg>
              </div>
              <div style={{ fontSize: 22, fontWeight: 800, color: '#2D1200', marginBottom: 4 }}>Free</div>
              <div style={{ fontSize: 13, fontWeight: 500, color: '#9A7050', marginBottom: 20 }}>Perfect for trying Vaakya</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 6 }}>
                <span style={{ fontSize: 48, fontWeight: 800, color: '#2D1200', letterSpacing: -2, lineHeight: 1 }}>₹0</span>
                <span style={{ fontSize: 15, fontWeight: 500, color: '#9A7050' }}>/month</span>
              </div>
              <div style={{ fontSize: 12.5, color: '#B09070', marginBottom: 28, minHeight: 18 }}>Always free, forever</div>
              <div style={{ height: 1, background: 'linear-gradient(to right,transparent,rgba(245,159,11,.25),transparent)', marginBottom: 24 }} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 32 }}>
                {[
                  { icon: checkIcon, label: '2 Documents / Month', bold: true },
                  { icon: checkIcon, label: 'AI Contract Drafting' },
                  { icon: checkIcon, label: 'AI Document Review' },
                  { icon: checkIcon, label: 'PDF Download' },
                  { icon: checkIcon, label: '12 Document Templates' },
                  { icon: checkIcon, label: 'Basic Legal Vault' },
                  { icon: checkIcon, label: 'Email Support' },
                ].map((f, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
                    {f.icon}
                    <span style={{ fontSize: 13.5, fontWeight: f.bold ? 600 : 500, color: f.bold ? '#2D1200' : '#4A3020' }}>{f.label}</span>
                  </div>
                ))}
                {['Risk Detection', 'Negotiation AI', 'Obligation Tracker', 'E-Sign'].map((label) => (
                  <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 11, opacity: 0.42 }}>
                    {crossIcon}
                    <span style={{ fontSize: 13, fontWeight: 500, color: '#9A7050', textDecoration: 'line-through', textDecorationColor: 'rgba(154,112,80,.4)' }}>{label}</span>
                  </div>
                ))}
              </div>
              <button className="btn-outline-o" style={{ width: '100%', padding: 15, borderRadius: 16, border: '2px solid #F0543C', background: 'rgba(240,84,60,.04)', color: '#F0543C', fontFamily: 'inherit', fontSize: 15, fontWeight: 700, letterSpacing: '-.1px' }}>Get Started Free</button>
              <div style={{ textAlign: 'center', marginTop: 10, fontSize: 12, color: '#B09070', fontWeight: 500 }}>No credit card required.</div>
            </div>

            {/* PRO (FEATURED) */}
            <div className="pc-pro" style={{ flex: '0 0 380px', position: 'relative', transform: 'translateY(-20px)' }}>
              <div style={{ background: 'linear-gradient(135deg,#FF6B35,#F59F0B,#F43F6E,#FF6B35)', backgroundSize: '300% 300%', padding: 2.5, borderRadius: 33, boxShadow: '0 0 40px rgba(255,107,53,.3),0 0 80px rgba(245,159,11,.15),0 16px 60px rgba(240,84,60,.22)', animation: 'shimmerBg 3s linear infinite' }}>
                <div style={{ background: 'rgba(255,248,240,.98)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)', borderRadius: 30, padding: '52px 36px 36px', position: 'relative', overflow: 'hidden' }}>
                  <div style={{ position: 'absolute', top: -80, right: -50, width: 240, height: 240, background: 'radial-gradient(circle,rgba(255,180,80,.2) 0%,transparent 65%)', pointerEvents: 'none' }} />
                  <div style={{ position: 'absolute', top: 22, left: '50%', transform: 'translateX(-50%)', display: 'inline-flex', alignItems: 'center', gap: 7, background: 'linear-gradient(135deg,#FF6B35,#F59F0B)', borderRadius: 100, padding: '6px 18px', boxShadow: '0 4px 18px rgba(255,107,53,.4)' }}>
                    <span style={{ fontSize: 12 }}>⭐</span>
                    <span style={{ fontSize: 11.5, fontWeight: 800, color: '#FFF8F0', letterSpacing: '.8px' }}>MOST POPULAR</span>
                  </div>
                  <div style={{ width: 56, height: 56, borderRadius: 18, background: 'linear-gradient(135deg,#FF8C42,#F0543C)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20, boxShadow: '0 6px 22px rgba(240,84,60,.38)' }}>
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill="#FFF8F0" opacity=".95" /></svg>
                  </div>
                  <div style={{ fontSize: 24, fontWeight: 800, color: '#2D1200', marginBottom: 4 }}>Pro</div>
                  <div style={{ fontSize: 13, fontWeight: 500, color: '#9A7050', marginBottom: 20 }}>For freelancers &amp; growing SMBs</div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 6 }}>
                    <span style={{ fontSize: 52, fontWeight: 800, letterSpacing: -2.5, lineHeight: 1, background: 'linear-gradient(135deg,#FF6B35,#F59F0B)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>{proPrice}</span>
                    <span style={{ fontSize: 15, fontWeight: 500, color: '#9A7050' }}>/month</span>
                  </div>
                  <div style={{ fontSize: 12.5, color: '#B09070', marginBottom: 28, minHeight: 18 }}>{proPer}</div>
                  <div style={{ height: 1, background: 'linear-gradient(to right,transparent,rgba(255,107,53,.3),transparent)', marginBottom: 24 }} />
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 36 }}>
                    {[
                      { label: '25 Documents / Month', bold: true },
                      { label: 'Everything in Free' },
                      { label: 'AI Risk Detection' },
                      { label: 'AI Negotiation Suggestions' },
                      { label: 'Obligation Tracking' },
                      { label: 'Secure Legal Vault' },
                      { label: 'E-Sign Ready' },
                      { label: 'Priority Email Support' },
                      { label: 'All 12 Document Types' },
                      { label: 'All 8 AI Agents' },
                    ].map((f, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
                        {proCheckIcon}
                        <span style={{ fontSize: 13.5, fontWeight: f.bold ? 700 : 500, color: f.bold ? '#2D1200' : '#4A3020' }}>{f.label}</span>
                      </div>
                    ))}
                  </div>
                  <button className="btn-orange" style={{ width: '100%', padding: 16, borderRadius: 16, border: 'none', background: 'linear-gradient(135deg,#FF6B35,#F59F0B)', color: '#FFF8F0', fontFamily: 'inherit', fontSize: 15.5, fontWeight: 800, letterSpacing: '-.1px', boxShadow: '0 8px 28px rgba(255,107,53,.38)' }}>Start Pro →</button>
                  <div style={{ textAlign: 'center', marginTop: 10, fontSize: 12, color: '#B09070', fontWeight: 500 }}>Cancel anytime.</div>
                </div>
              </div>
            </div>

            {/* PLUS */}
            <div className="pc" style={{ flex: '0 0 340px', background: 'rgba(255,250,244,.95)', backdropFilter: 'blur(22px)', WebkitBackdropFilter: 'blur(22px)', border: '1.8px solid rgba(34,168,96,.3)', borderRadius: 30, padding: '36px 32px 32px', boxShadow: '0 8px 36px rgba(34,168,96,.12),0 2px 8px rgba(0,0,0,.05)', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: -60, right: -40, width: 200, height: 200, background: 'radial-gradient(circle,rgba(34,168,96,.12) 0%,transparent 65%)', pointerEvents: 'none' }} />
              <div style={{ width: 52, height: 52, borderRadius: 16, background: 'linear-gradient(135deg,#C8F5E0,#7AE0B4)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20, boxShadow: '0 4px 16px rgba(34,168,96,.3)' }}>
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none"><path d="M12 2L4 6v6c0 5.5 3.5 10.7 8 12 4.5-1.3 8-6.5 8-12V6L12 2z" fill="#22A860" opacity=".35" /><path d="M12 2L4 6v6c0 5.5 3.5 10.7 8 12 4.5-1.3 8-6.5 8-12V6L12 2z" stroke="#22A860" strokeWidth="1.8" fill="none" /><path d="M8.5 12l2.5 2.5 4.5-5" stroke="#22A860" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </div>
              <div style={{ fontSize: 22, fontWeight: 800, color: '#2D1200', marginBottom: 4 }}>Plus</div>
              <div style={{ fontSize: 13, fontWeight: 500, color: '#9A7050', marginBottom: 20 }}>For businesses that scale</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 6 }}>
                <span style={{ fontSize: 48, fontWeight: 800, color: '#22A860', letterSpacing: -2, lineHeight: 1 }}>{plusPrice}</span>
                <span style={{ fontSize: 15, fontWeight: 500, color: '#9A7050' }}>/month</span>
              </div>
              <div style={{ fontSize: 12.5, color: '#B09070', marginBottom: 28, minHeight: 18 }}>{plusPer}</div>
              <div style={{ height: 1, background: 'linear-gradient(to right,transparent,rgba(34,168,96,.28),transparent)', marginBottom: 24 }} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 32 }}>
                {[
                  { label: 'Unlimited Documents', bold: true },
                  { label: 'Everything in Pro' },
                  { label: 'Unlimited AI Reviews' },
                  { label: 'Unlimited Risk Analysis' },
                  { label: 'Unlimited Negotiation' },
                  { label: 'Dispute Resolution' },
                  { label: 'WhatsApp Alerts' },
                  { label: 'Team Workspace (3 Users)' },
                  { label: 'API Access', badge: 'Coming Soon' },
                  { label: 'Premium Support' },
                ].map((f, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
                    {checkIcon}
                    <span style={{ fontSize: 13.5, fontWeight: f.bold ? 700 : 500, color: f.bold ? '#2D1200' : '#4A3020' }}>
                      {f.label}{f.badge && <span style={{ fontSize: 11, color: '#B09070', fontWeight: 600 }}> ({f.badge})</span>}
                    </span>
                  </div>
                ))}
              </div>
              <button className="btn-outline-g" style={{ width: '100%', padding: 15, borderRadius: 16, border: '2px solid #22A860', background: 'rgba(34,168,96,.05)', color: '#22A860', fontFamily: 'inherit', fontSize: 15, fontWeight: 700, letterSpacing: '-.1px' }}>Upgrade to Plus</button>
              <div style={{ textAlign: 'center', marginTop: 10, fontSize: 12, color: '#B09070', fontWeight: 500 }}>Cancel anytime.</div>
            </div>

          </div>
        </section>

        {/* TRUST BAR */}
        <section style={{ position: 'relative', zIndex: 1, padding: '0 48px 88px', maxWidth: 1100, margin: '0 auto' }}>
          <div className="trust-row" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 32, background: 'rgba(255,248,240,.9)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', border: '1.5px solid rgba(245,159,11,.2)', borderRadius: 24, padding: '28px 40px', boxShadow: '0 4px 24px rgba(245,159,11,.08)' }}>
            {[
              { emoji: '🎁', bg: 'linear-gradient(135deg,#FFE4CC,#FFCC99)', shadow: 'rgba(245,159,11,.25)', label: 'No Credit Card Required' },
              { emoji: '🔓', bg: 'linear-gradient(135deg,#FFD4E0,#FFB4C4)', shadow: 'rgba(244,63,110,.25)', label: 'Cancel Anytime' },
              { emoji: '🔒', bg: 'linear-gradient(135deg,#C8F5E0,#7AE0B4)', shadow: 'rgba(34,168,96,.28)', label: 'Secure Payments' },
              { emoji: '🧾', bg: 'linear-gradient(135deg,#FFE8CC,#FFD48A)', shadow: 'rgba(245,159,11,.28)', label: 'GST Invoice Included' },
            ].flatMap((badge, i, arr) => [
              <div key={badge.label} className="trust-badge" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 46, height: 46, borderRadius: '50%', background: badge.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 20, boxShadow: `0 3px 12px ${badge.shadow}` }}>{badge.emoji}</div>
                <span style={{ fontSize: 13.5, fontWeight: 700, color: '#2D1200', whiteSpace: 'nowrap' }}>{badge.label}</span>
              </div>,
              i < arr.length - 1 ? <div key={`sep-${i}`} style={{ width: 1, height: 36, background: 'linear-gradient(to bottom,transparent,rgba(245,159,11,.25),transparent)' }} /> : null,
            ])}
          </div>
        </section>

        {/* FAQ + CTA */}
        <section style={{ position: 'relative', zIndex: 1, padding: '0 48px 100px', maxWidth: 1240, margin: '0 auto' }}>
          <div className="faq-cta-grid" style={{ display: 'flex', gap: 40, alignItems: 'flex-start' }}>

            {/* FAQ */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'linear-gradient(135deg,rgba(245,159,11,.1),rgba(240,84,60,.08))', border: '1.5px solid rgba(240,84,60,.2)', borderRadius: 100, padding: '6px 18px', marginBottom: 24 }}>
                <span style={{ fontSize: 12, fontWeight: 700, background: 'linear-gradient(135deg,#F59F0B,#F0543C)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', letterSpacing: '.6px' }}>FAQ</span>
              </div>
              <h2 style={{ fontSize: 32, fontWeight: 800, color: '#2D1200', letterSpacing: '-1.2px', marginBottom: 10, lineHeight: 1.15 }}>Frequently Asked<br />Questions</h2>
              <p style={{ fontSize: 14.5, color: '#8A6040', marginBottom: 36, lineHeight: 1.65 }}>Everything you need to know about Vaakya pricing.</p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 0, border: '1.5px solid rgba(245,159,11,.2)', borderRadius: 22, overflow: 'hidden', background: 'rgba(255,248,240,.9)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)' }}>
                {FAQS.map((faq, i) => {
                  const isOpen = openFaq === i;
                  return (
                    <div key={i} style={{ borderBottom: i < FAQS.length - 1 ? '1px solid rgba(245,159,11,.15)' : 'none' }}>
                      <div className="faq-row" onClick={() => setOpenFaq(isOpen ? null : i)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', gap: 16, background: 'rgba(255,252,246,.5)' }}>
                        <span style={{ fontSize: 14.5, fontWeight: 700, color: '#2D1200', lineHeight: 1.4, flex: 1 }}>{faq.question}</span>
                        <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'linear-gradient(135deg,rgba(245,159,11,.15),rgba(240,84,60,.12))', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'transform .3s ease', transform: isOpen ? 'rotate(45deg)' : 'rotate(0deg)' }}>
                          <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M6.5 1v11M1 6.5h11" stroke="#F0543C" strokeWidth="2" strokeLinecap="round" /></svg>
                        </div>
                      </div>
                      <div style={{ maxHeight: isOpen ? 220 : 0, opacity: isOpen ? 1 : 0, overflow: 'hidden', transition: 'all 0.35s cubic-bezier(0.4,0,0.2,1)' }}>
                        <div style={{ padding: '0 24px 20px', fontSize: 14, lineHeight: 1.72, color: '#7A5030' }}>{faq.answer}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* CTA Banner */}
            <div style={{ flex: '0 0 420px', position: 'relative', borderRadius: 30, overflow: 'hidden', background: 'linear-gradient(145deg,#FFF0E0,#FFE4CC,#FFECD4)', border: '1.8px solid rgba(245,159,11,.28)', boxShadow: '0 12px 48px rgba(245,159,11,.16),0 4px 16px rgba(240,84,60,.1)', padding: '44px 36px 36px' }}>
              <div style={{ position: 'absolute', top: -60, right: -60, width: 220, height: 220, background: 'radial-gradient(circle,rgba(255,145,70,.22) 0%,transparent 65%)', pointerEvents: 'none' }} />
              <div style={{ position: 'absolute', bottom: -40, left: -40, width: 180, height: 180, background: 'radial-gradient(circle,rgba(244,63,110,.12) 0%,transparent 65%)', pointerEvents: 'none' }} />

              {/* Illustration */}
              <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: 12, marginBottom: 28, position: 'relative', zIndex: 1 }}>
                <div style={{ position: 'relative', width: 80, animation: 'softFloat2 7s ease-in-out infinite' }}>
                  <div style={{ width: 62, height: 78, background: 'linear-gradient(145deg,#FFE4B0,#FFD080)', borderRadius: 8, transform: 'rotate(-8deg)', position: 'absolute', bottom: 0, left: 0, boxShadow: '0 4px 14px rgba(245,159,11,.28)' }} />
                  <div style={{ width: 62, height: 78, background: 'linear-gradient(145deg,#FFF0D0,#FFE4A8)', borderRadius: 8, transform: 'rotate(-3deg)', position: 'absolute', bottom: 5, left: 5, boxShadow: '0 3px 12px rgba(245,159,11,.2)' }}>
                    <div style={{ margin: '12px 10px 0', height: 2, background: 'rgba(240,84,60,.25)', borderRadius: 2 }} />
                    <div style={{ margin: '7px 10px 0', height: 2, background: 'rgba(240,84,60,.2)', borderRadius: 2 }} />
                  </div>
                  <div style={{ width: 62, height: 78, background: 'linear-gradient(145deg,#FFFAF0,#FFF4E0)', borderRadius: 8, position: 'absolute', bottom: 10, left: 10, boxShadow: '0 3px 14px rgba(240,84,60,.12)' }}>
                    <div style={{ margin: '12px 10px 0', height: 2, background: 'rgba(245,159,11,.35)', borderRadius: 2 }} />
                    <div style={{ margin: '7px 10px 0', height: 2, background: 'rgba(245,159,11,.28)', borderRadius: 2 }} />
                    <div style={{ margin: '7px 10px 0', height: 2, background: 'rgba(245,159,11,.22)', borderRadius: 2 }} />
                  </div>
                </div>
                <div style={{ animation: 'softFloat 6s ease-in-out infinite', marginBottom: 8 }}>
                  <div style={{ width: 52, height: 60, background: 'linear-gradient(145deg,#FF8C42,#F0543C)', borderRadius: '50% 50% 44% 44% / 48% 48% 52% 52%', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 6px 22px rgba(240,84,60,.38)' }}>
                    <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><path d="M5 11l4 4 8-8" stroke="#FFF8F0" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  </div>
                </div>
                <div style={{ animation: 'softFloat2 8s ease-in-out infinite reverse', marginBottom: 4 }}>
                  <div style={{ width: 14, height: 62, background: 'linear-gradient(180deg,#2D1200,#5A3010)', borderRadius: '7px 7px 3px 3px', position: 'relative', boxShadow: '0 4px 16px rgba(45,18,0,.35)' }}>
                    <div style={{ position: 'absolute', bottom: -8, left: '50%', transform: 'translateX(-50%)', width: 0, height: 0, borderLeft: '7px solid transparent', borderRight: '7px solid transparent', borderTop: '12px solid #F59F0B' }} />
                    <div style={{ position: 'absolute', top: 8, left: 2, right: 2, height: 2, background: 'rgba(255,200,100,.45)', borderRadius: 1 }} />
                    <div style={{ position: 'absolute', top: 14, left: 2, right: 2, height: 1.5, background: 'rgba(255,200,100,.3)', borderRadius: 1 }} />
                  </div>
                </div>
                <div style={{ animation: 'softFloat 10s ease-in-out infinite' }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 36, lineHeight: 1 }}>🌿</div>
                    <div style={{ width: 30, height: 22, background: 'linear-gradient(145deg,#E8E8EC,#D4D4DC)', borderRadius: '6px 6px 8px 8px', margin: '0 auto', boxShadow: '0 2px 8px rgba(0,0,0,.12)' }} />
                  </div>
                </div>
              </div>

              <div style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
                <h3 style={{ fontSize: 24, fontWeight: 800, color: '#2D1200', letterSpacing: '-1px', marginBottom: 12, lineHeight: 1.2 }}>Ready to Transform<br />Your Legal Workflow?</h3>
                <p style={{ fontSize: 14, color: '#7A5030', lineHeight: 1.65, marginBottom: 28 }}>Join thousands of Indian SMBs already saving time and money with AI-powered legal automation.</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <button className="btn-orange" style={{ padding: '15px 24px', borderRadius: 14, border: 'none', background: 'linear-gradient(135deg,#FF6B35,#F59F0B)', color: '#FFF8F0', fontFamily: 'inherit', fontSize: 15, fontWeight: 800, boxShadow: '0 8px 26px rgba(255,107,53,.38)', letterSpacing: '-.1px' }}>Start Free Today →</button>
                  <button className="btn-outline-o" style={{ padding: '14px 24px', borderRadius: 14, border: '2px solid rgba(240,84,60,.45)', background: 'rgba(255,248,240,.6)', color: '#F0543C', fontFamily: 'inherit', fontSize: 14.5, fontWeight: 700 }}>Book a Demo</button>
                </div>
                <div style={{ marginTop: 18, fontSize: 12, color: '#B09070', fontWeight: 500 }}>No credit card · Cancel anytime · GST invoice included</div>
              </div>
            </div>

          </div>
        </section>

        {/* FOOTER */}
        <footer style={{ position: 'relative', zIndex: 1, borderTop: '1px solid rgba(245,159,11,.15)', padding: '32px 48px', textAlign: 'center' }}>
          <div style={{ maxWidth: 1240, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
              <div style={{ width: 32, height: 32, background: 'linear-gradient(135deg,#FFE8CC,#FFCFA0)', borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none"><path d="M12 2L4 6v6c0 5.5 3.5 10.7 8 12 4.5-1.3 8-6.5 8-12V6L12 2z" fill="#F59F0B" /><path d="M9 12l2 2 4-4" stroke="#FFF8F0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </div>
              <span style={{ fontSize: 15, fontWeight: 800, color: '#2D1200', letterSpacing: '-.3px' }}>VAAKYA</span>
            </div>
            <div style={{ fontSize: 13, color: '#B09070' }}>© 2025 Vaakya. AI Legal for Indian SMBs. All rights reserved.</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#B09070' }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#22A860', display: 'inline-block', animation: 'pulse 2.5s ease-in-out infinite' }} />
              All systems operational
            </div>
          </div>
        </footer>

      </div>
    </>
  );
}
