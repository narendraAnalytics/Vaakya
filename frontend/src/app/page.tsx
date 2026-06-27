'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/client';

const LOGO_URL =
  'https://res.cloudinary.com/dkqbzwicr/image/upload/v1782139407/logovaakya_dqmskw.png';
const VIDEO_URL =
  'https://res.cloudinary.com/dkqbzwicr/video/upload/v1782139728/vaakyavideo_orngvn.webm';

export default function LandingPage() {
  const [username, setUsername] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      const name = data.user?.user_metadata?.username ?? null;
      setUsername(name);
      if (name) {
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/health`).catch(() => {});
      }
    });
  }, []);
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Caveat:wght@700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html, body {
          font-family: var(--font-plus-jakarta), 'Plus Jakarta Sans', sans-serif;
          background: #F5F3EE;
          color: #1A4A30;
          overflow-x: hidden;
        }
        .nav-link { transition: color 0.18s; }
        .nav-link:hover { color: #1A5C35 !important; }
        .cta-primary { transition: all 0.2s; }
        .cta-primary:hover { background: #144A2A !important; box-shadow: 0 6px 24px rgba(26,92,53,0.35) !important; transform: translateY(-1px); }
        .cta-secondary { transition: color 0.18s; }
        .cta-secondary:hover { color: #144A2A !important; }
        .login-btn { transition: all 0.18s; }
        .login-btn:hover { border-color: #1A5C35 !important; color: #1A5C35 !important; }

        @media (max-width: 1060px) {
          .nav-links-row { display: none !important; }
          .nav-container { padding: 0 24px !important; }
        }
        @media (max-width: 900px) {
          .hero-grid    { flex-direction: column !important; }
          .hero-left    { flex: none !important; width: 100% !important; padding-left: 24px !important; padding-right: 24px !important; padding-top: 100px !important; padding-bottom: 40px !important; }
          .hero-right   { flex: none !important; width: 100% !important; height: 360px !important; margin-right: 0 !important; align-self: auto !important; }
          .hero-headline { font-size: 38px !important; letter-spacing: -1.5px !important; }
          .hero-stats-row { flex-wrap: wrap !important; gap: 16px !important; }
          .stat-divider { display: none !important; }
          .hero-ctas    { flex-wrap: wrap !important; }
          .stats-row    { flex-wrap: wrap !important; gap: 20px !important; justify-content: center !important; }
          .stat-vdiv    { display: none !important; }
          .stat-item    { flex: 0 0 calc(50% - 10px) !important; }
          .trust-bar    { flex-wrap: wrap !important; gap: 8px !important; justify-content: center !important; left: 16px !important; right: 16px !important; }
          .trust-divider { display: none !important; }
        }
        @media (min-width: 901px) and (max-width: 1200px) {
          .hero-headline { font-size: 46px !important; }
          .hero-left     { padding-right: 32px !important; }
        }
      `}</style>

      <main style={{ background: '#F5F3EE' }}>

        {/* ═══════════ HERO SECTION — navbar lives inside, merged ═══════════ */}
        <section style={{ position: 'relative', minHeight: '100vh', overflow: 'hidden', background: '#F5F3EE' }}>

          {/* ── Transparent Navbar — absolute, overlays hero, no background ── */}
          <header style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 50 }}>
            <div
              className="nav-container"
              style={{
                maxWidth: 1300,
                margin: '0 auto',
                padding: '0 48px',
                height: 72,
                display: 'flex',
                alignItems: 'center',
              }}
            >
              {/* Logo */}
              <a
                href="#"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 11,
                  textDecoration: 'none',
                  flexShrink: 0,
                  marginRight: 52,
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={LOGO_URL}
                  alt="Vaakya"
                  style={{ width: 44, height: 44, objectFit: 'contain' }}
                />
                <span
                  style={{
                    fontSize: 26,
                    fontWeight: 700,
                    fontFamily: "'Caveat', cursive",
                    letterSpacing: '0.5px',
                    background: 'linear-gradient(135deg, #1A5C35 0%, #2E8B57 45%, #C47900 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}
                >
                  Vaakya
                </span>
              </a>

              {/* Nav links */}
              <nav
                className="nav-links-row"
                style={{ display: 'flex', alignItems: 'center', gap: 36, flex: 1 }}
              >
                {[
                  { label: 'Features', href: username ? '/features' : '/auth/login' },
                  { label: 'How It Works', href: username ? '/how-it-works' : '/auth/login' },
                  { label: 'Documents', href: username ? '/dashboard/documents' : '/auth/login' },
                  { label: 'Pricing', href: username ? '/pricing' : '/auth/login' },
                ].map((item) => (
                  <a
                    key={item.label}
                    href={item.href}
                    className="nav-link"
                    style={{
                      fontSize: 14.5,
                      fontWeight: 500,
                      color: '#2C4A38',
                      textDecoration: 'none',
                    }}
                  >
                    {item.label}
                  </a>
                ))}
                <a
                  href="#"
                  className="nav-link"
                  style={{
                    fontSize: 14.5,
                    fontWeight: 500,
                    color: '#2C4A38',
                    textDecoration: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                  }}
                >
                  Resources
                  <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
                    <path d="M2.5 4L5.5 7L8.5 4" stroke="#2C4A38" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </a>
              </nav>

              {/* Auth buttons */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0, marginLeft: 'auto' }}>
                {username ? (
                  <>
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: 8,
                      background: '#D4ECD8', border: '1px solid rgba(26,92,53,0.18)',
                      borderRadius: 100, padding: '7px 16px',
                    }}>
                      <div style={{ width: 24, height: 24, borderRadius: '50%', background: '#1A5C35', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#F0FFF6', flexShrink: 0 }}>
                        {username[0].toUpperCase()}
                      </div>
                      <span style={{ fontSize: 13.5, fontWeight: 600, color: '#1A5C35' }}>
                        Welcome, {username}
                      </span>
                    </div>
                    <button
                      onClick={async () => { const s = createClient(); await s.auth.signOut(); window.location.reload(); }}
                      style={{ fontSize: 13.5, fontWeight: 500, color: '#7B9A8A', background: 'none', border: 'none', cursor: 'pointer', padding: '4px 8px' }}
                    >
                      Sign out
                    </button>
                  </>
                ) : (
                  <a
                    href="/auth/login"
                    className="login-btn"
                    style={{
                      fontSize: 14.5, fontWeight: 500, color: '#2C4A38',
                      textDecoration: 'none', padding: '8px 20px',
                      border: '1.5px solid rgba(44,74,56,0.28)', borderRadius: 100,
                    }}
                  >
                    Login
                  </a>
                )}
              </div>
            </div>
          </header>

          {/* ── Background organic shapes ── */}
          <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: -150, right: -180, width: 900, height: 900, background: 'radial-gradient(ellipse at 58% 38%, #C2D8CA 0%, #CCDDD4 25%, #E0EDE6 50%, transparent 72%)', borderRadius: '50%', opacity: 0.95 }} />
            <div style={{ position: 'absolute', top: '10%', right: '8%', width: 540, height: 540, background: 'radial-gradient(ellipse at 50% 50%, #CCDDD4 0%, transparent 65%)', opacity: 0.55 }} />
            <div style={{ position: 'absolute', bottom: -80, left: -60, width: 420, height: 420, background: 'radial-gradient(ellipse at 30% 72%, #AACAB6 0%, #BCDAC8 28%, transparent 62%)', borderRadius: '50%', opacity: 0.7 }} />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(145deg, #F5F3EE 35%, rgba(220,234,226,0.5) 100%)' }} />
            <div style={{ position: 'absolute', top: '7%', right: '20%', width: 220, height: 180, backgroundImage: 'radial-gradient(circle, #3D8055 1.4px, transparent 1.4px)', backgroundSize: '22px 22px', opacity: 0.09 }} />
            <div style={{ position: 'absolute', top: '45%', right: '5%', width: 160, height: 140, backgroundImage: 'radial-gradient(circle, #3D8055 1.2px, transparent 1.2px)', backgroundSize: '18px 18px', opacity: 0.07 }} />
          </div>

          {/* ── Hero grid ── */}
          <div
            className="hero-grid"
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              minHeight: '100vh',
              position: 'relative',
              zIndex: 1,
            }}
          >
            {/* LEFT: copy */}
            <div
              className="hero-left"
              style={{
                flex: '0 0 50%',
                paddingLeft: 'max(48px, calc((100vw - 1300px) / 2 + 48px))',
                paddingRight: 60,
                paddingTop: 120,
                paddingBottom: 60,
                display: 'flex',
                flexDirection: 'column',
                gap: 28,
              }}
            >
              {/* Badge pill */}
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 9,
                  background: '#D4ECD8',
                  border: '1px solid rgba(30,168,81,0.22)',
                  borderRadius: 100,
                  padding: '7px 18px',
                  width: 'fit-content',
                  boxShadow: '0 1px 6px rgba(26,92,53,0.07)',
                }}
              >
                <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
                  <path d="M7 0.5L8.55 5.2L13.5 6.5L8.55 7.8L7 12.5L5.45 7.8L0.5 6.5L5.45 5.2L7 0.5Z" fill="#1EA851" />
                </svg>
                <span style={{ fontSize: 12.5, fontWeight: 700, color: '#1A5C35', letterSpacing: '0.1px' }}>AI-Powered</span>
                <span style={{ width: 3, height: 3, background: '#8DC9A0', borderRadius: '50%', flexShrink: 0, display: 'inline-block' }} />
                <span style={{ fontSize: 12.5, fontWeight: 500, color: '#2C5C3E' }}>8 Legal Agents</span>
                <span style={{ width: 3, height: 3, background: '#8DC9A0', borderRadius: '50%', flexShrink: 0, display: 'inline-block' }} />
                <span style={{ fontSize: 12.5, fontWeight: 500, color: '#2C5C3E' }}>Built for Indian SMBs</span>
              </div>

              {/* Headline */}
              <h1
                className="hero-headline"
                style={{
                  fontSize: 'clamp(40px, 4.6vw, 62px)',
                  fontWeight: 800,
                  lineHeight: 1.08,
                  letterSpacing: '-2.5px',
                  color: '#1A5C35',
                }}
              >
                Legal Documents.<br />
                <span style={{ color: '#C47900' }}>Zero Lawyers.</span><br />
                <span style={{ color: '#1EA851' }}>100% Peace of Mind.</span>
              </h1>

              {/* Subtext */}
              <p
                style={{
                  fontSize: 16.5,
                  lineHeight: 1.72,
                  color: '#4A6858',
                  maxWidth: 460,
                  fontWeight: 400,
                }}
              >
                Create, review, manage and protect your contracts in minutes with India&apos;s first autonomous legal platform for small businesses.
              </p>

              {/* Mini stats row */}
              <div className="hero-stats-row" style={{ display: 'flex', alignItems: 'center', gap: 22 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 44, height: 44, background: 'linear-gradient(140deg, #D4ECD8, #BDDAC6)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0, boxShadow: '0 2px 8px rgba(26,92,53,0.12)' }}>₹</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <span style={{ fontSize: 12.5, fontWeight: 700, color: '#0F2D1F', lineHeight: 1.2 }}>Up to 95% Cheaper</span>
                    <span style={{ fontSize: 11.5, color: '#7B9A8A' }}>than Lawyers</span>
                  </div>
                </div>
                <div className="stat-divider" style={{ width: 1, height: 38, background: 'linear-gradient(to bottom, transparent, #C8DDD2, transparent)' }} />
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 44, height: 44, background: 'linear-gradient(140deg, #D4ECD8, #BDDAC6)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0, boxShadow: '0 2px 8px rgba(26,92,53,0.12)' }}>⚡</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <span style={{ fontSize: 12.5, fontWeight: 700, color: '#0F2D1F', lineHeight: 1.2 }}>Documents Ready</span>
                    <span style={{ fontSize: 11.5, color: '#7B9A8A' }}>in Under 4 Minutes</span>
                  </div>
                </div>
                <div className="stat-divider" style={{ width: 1, height: 38, background: 'linear-gradient(to bottom, transparent, #C8DDD2, transparent)' }} />
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 44, height: 44, background: 'linear-gradient(140deg, #D4ECD8, #BDDAC6)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0, boxShadow: '0 2px 8px rgba(26,92,53,0.12)' }}>🛡️</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <span style={{ fontSize: 12.5, fontWeight: 700, color: '#0F2D1F', lineHeight: 1.2 }}>94% Risk Detection</span>
                    <span style={{ fontSize: 11.5, color: '#7B9A8A' }}>Powered by AI</span>
                  </div>
                </div>
              </div>

              {/* CTA buttons */}
              <div className="hero-ctas" style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
                <a
                  href={username ? '/dashboard' : '/auth/login'}
                  className="cta-primary"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 9,
                    background: '#1A5C35',
                    color: '#F0FFF6',
                    fontSize: 15.5,
                    fontWeight: 700,
                    padding: '15px 28px',
                    borderRadius: 100,
                    textDecoration: 'none',
                    letterSpacing: '-0.2px',
                    boxShadow: '0 4px 20px rgba(26,92,53,0.28), 0 1px 4px rgba(26,92,53,0.15)',
                  }}
                >
                  Create Your First Document Free
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M2 8H14M10 4L14 8L10 12" stroke="#F0FFF6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </a>
                <a
                  href="#"
                  className="cta-secondary"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 11,
                    color: '#1A5C35',
                    fontSize: 15.5,
                    fontWeight: 600,
                    textDecoration: 'none',
                    padding: '15px 4px',
                  }}
                >
                  <span
                    style={{
                      width: 38,
                      height: 38,
                      background: '#D4ECD8',
                      border: '1.5px solid rgba(30,168,81,0.28)',
                      borderRadius: '50%',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      boxShadow: '0 2px 8px rgba(26,92,53,0.1)',
                    }}
                  >
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <path d="M4 2.5L9.5 6L4 9.5V2.5Z" fill="#1A5C35" />
                    </svg>
                  </span>
                  See How It Works
                </a>
              </div>

              {/* Trust note */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                <svg width="17" height="17" viewBox="0 0 17 17" fill="none">
                  <circle cx="8.5" cy="8.5" r="7.5" fill="#E0F5E8" stroke="#B8E0C4" strokeWidth="1.2" />
                  <path d="M5.5 8.5L7.5 10.5L11.5 6.5" stroke="#1EA851" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span style={{ fontSize: 13, color: '#7B9A8A', fontWeight: 400 }}>No Credit Card Required</span>
                <span style={{ width: 3, height: 3, background: '#C8DDD2', borderRadius: '50%', display: 'inline-block' }} />
                <span style={{ fontSize: 13, color: '#7B9A8A', fontWeight: 400 }}>Cancel Anytime</span>
              </div>
            </div>

            {/* RIGHT: Video with seamless blend */}
            <div
              className="hero-right"
              style={{
                flex: 1,
                position: 'relative',
                alignSelf: 'stretch',
                overflow: 'hidden',
              }}
            >
              <video
                autoPlay
                muted
                loop
                playsInline
                style={{
                  position: 'absolute',
                  inset: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                }}
              >
                <source src={VIDEO_URL} type="video/webm" />
              </video>

              {/* Left edge: heaviest fade */}
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, #F5F3EE 0%, rgba(245,243,238,0.88) 12%, rgba(245,243,238,0.5) 28%, rgba(245,243,238,0.15) 48%, transparent 65%)', pointerEvents: 'none', zIndex: 3 }} />
              {/* Top edge */}
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, #F5F3EE 0%, rgba(245,243,238,0.7) 10%, rgba(245,243,238,0.2) 24%, transparent 40%)', pointerEvents: 'none', zIndex: 3 }} />
              {/* Bottom edge */}
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, #F5F3EE 0%, rgba(245,243,238,0.7) 8%, rgba(245,243,238,0.15) 22%, transparent 38%)', pointerEvents: 'none', zIndex: 3 }} />
              {/* Right edge (soft) */}
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to left, rgba(240,250,244,0.4) 0%, transparent 28%)', pointerEvents: 'none', zIndex: 3 }} />
              {/* Warm tint */}
              <div style={{ position: 'absolute', inset: 0, background: 'rgba(200,230,208,0.1)', mixBlendMode: 'multiply', pointerEvents: 'none', zIndex: 2 }} />

              {/* Trust pills */}
              <div
                className="trust-bar"
                style={{
                  position: 'absolute',
                  bottom: 28,
                  left: 56,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  zIndex: 5,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 12, fontWeight: 600, color: '#1A5C35', background: 'rgba(245,243,238,0.88)', padding: '7px 15px', borderRadius: 100, border: '1px solid rgba(26,92,53,0.14)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)', boxShadow: '0 2px 8px rgba(26,92,53,0.08)', whiteSpace: 'nowrap' }}>
                  🇮🇳 <span>Built for Indian Laws</span>
                </div>
                <div className="trust-divider" style={{ width: 1, height: 18, background: 'rgba(26,92,53,0.18)' }} />
                <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 12, fontWeight: 600, color: '#1A5C35', background: 'rgba(245,243,238,0.88)', padding: '7px 15px', borderRadius: 100, border: '1px solid rgba(26,92,53,0.14)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)', boxShadow: '0 2px 8px rgba(26,92,53,0.08)', whiteSpace: 'nowrap' }}>
                  🔒 <span>Secure &amp; Encrypted</span>
                </div>
                <div className="trust-divider" style={{ width: 1, height: 18, background: 'rgba(26,92,53,0.18)' }} />
                <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 12, fontWeight: 600, color: '#1A5C35', background: 'rgba(245,243,238,0.88)', padding: '7px 15px', borderRadius: 100, border: '1px solid rgba(26,92,53,0.14)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)', boxShadow: '0 2px 8px rgba(26,92,53,0.08)', whiteSpace: 'nowrap' }}>
                  🛡️ <span>Private &amp; Confidential</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════ STATS BAR ═══════════ */}
        <section
          style={{
            background: 'linear-gradient(to bottom, #EEF0EB, #E6E8E2)',
            padding: '28px 48px',
            borderTop: '1px solid rgba(26,92,53,0.08)',
          }}
        >
          <div
            className="stats-row"
            style={{
              maxWidth: 1300,
              margin: '0 auto',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 16,
            }}
          >
            <div className="stat-item" style={{ display: 'flex', alignItems: 'center', gap: 18, flex: 1 }}>
              <div style={{ width: 56, height: 56, background: 'linear-gradient(140deg, #CCDDD4, #B4CCC0)', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, flexShrink: 0, boxShadow: '0 3px 12px rgba(26,92,53,0.12)' }}>👥</div>
              <div>
                <div style={{ fontSize: 30, fontWeight: 800, color: '#1A4A30', letterSpacing: '-1.2px', lineHeight: 1 }}>2,500+</div>
                <div style={{ fontSize: 12.5, fontWeight: 500, color: '#7B9A8A', marginTop: 4 }}>SMBs Trust Vaakya</div>
              </div>
            </div>

            <div className="stat-vdiv" style={{ width: 1, height: 52, background: 'linear-gradient(to bottom, transparent, #B8D4C0, transparent)', flexShrink: 0 }} />

            <div className="stat-item" style={{ display: 'flex', alignItems: 'center', gap: 18, flex: 1 }}>
              <div style={{ width: 56, height: 56, background: 'linear-gradient(140deg, #CCDDD4, #B4CCC0)', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, flexShrink: 0, boxShadow: '0 3px 12px rgba(26,92,53,0.12)' }}>📄</div>
              <div>
                <div style={{ fontSize: 30, fontWeight: 800, color: '#1A4A30', letterSpacing: '-1.2px', lineHeight: 1 }}>25,000+</div>
                <div style={{ fontSize: 12.5, fontWeight: 500, color: '#7B9A8A', marginTop: 4 }}>Documents Created</div>
              </div>
            </div>

            <div className="stat-vdiv" style={{ width: 1, height: 52, background: 'linear-gradient(to bottom, transparent, #B8D4C0, transparent)', flexShrink: 0 }} />

            <div className="stat-item" style={{ display: 'flex', alignItems: 'center', gap: 18, flex: 1 }}>
              <div style={{ width: 56, height: 56, background: 'linear-gradient(140deg, #CCDDD4, #B4CCC0)', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, flexShrink: 0, boxShadow: '0 3px 12px rgba(26,92,53,0.12)' }}>💰</div>
              <div>
                <div style={{ fontSize: 30, fontWeight: 800, color: '#1A4A30', letterSpacing: '-1.2px', lineHeight: 1 }}>₹12Cr+</div>
                <div style={{ fontSize: 12.5, fontWeight: 500, color: '#7B9A8A', marginTop: 4 }}>Saved for SMBs</div>
              </div>
            </div>

            <div className="stat-vdiv" style={{ width: 1, height: 52, background: 'linear-gradient(to bottom, transparent, #B8D4C0, transparent)', flexShrink: 0 }} />

            <div className="stat-item" style={{ display: 'flex', alignItems: 'center', gap: 18, flex: 1 }}>
              <div style={{ width: 56, height: 56, background: 'linear-gradient(140deg, #CCDDD4, #B4CCC0)', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, flexShrink: 0, boxShadow: '0 3px 12px rgba(26,92,53,0.12)' }}>⚡</div>
              <div>
                <div style={{ fontSize: 30, fontWeight: 800, color: '#1A4A30', letterSpacing: '-1.2px', lineHeight: 1 }}>94%</div>
                <div style={{ fontSize: 12.5, fontWeight: 500, color: '#7B9A8A', marginTop: 4 }}>Risk Detection Accuracy</div>
              </div>
            </div>

            <div className="stat-vdiv" style={{ width: 1, height: 52, background: 'linear-gradient(to bottom, transparent, #B8D4C0, transparent)', flexShrink: 0 }} />

            <div className="stat-item" style={{ display: 'flex', alignItems: 'center', gap: 18, flex: 1 }}>
              <div style={{ width: 56, height: 56, background: 'linear-gradient(140deg, #CCDDD4, #B4CCC0)', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, flexShrink: 0, boxShadow: '0 3px 12px rgba(26,92,53,0.12)' }}>⏱</div>
              <div>
                <div style={{ fontSize: 30, fontWeight: 800, color: '#1A4A30', letterSpacing: '-1.2px', lineHeight: 1 }}>4 Min</div>
                <div style={{ fontSize: 12.5, fontWeight: 500, color: '#7B9A8A', marginTop: 4 }}>Avg. Document Time</div>
              </div>
            </div>
          </div>
        </section>

      </main>
    </>
  );
}
