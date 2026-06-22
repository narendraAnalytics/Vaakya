'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/client';

const LOGO_URL =
  'https://res.cloudinary.com/dkqbzwicr/image/upload/v1782139407/logovaakya_dqmskw.png';

export default function OnboardingPage() {
  const router = useRouter();
  const supabase = createClient();

  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) {
        router.replace('/auth/login');
      } else if (data.user.user_metadata?.username) {
        router.replace('/');
      } else {
        setCheckingSession(false);
      }
    });
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = username.trim();
    if (!trimmed) { setError('Please enter a name.'); return; }
    if (trimmed.length < 2) { setError('Name must be at least 2 characters.'); return; }

    setError('');
    setLoading(true);
    try {
      const { error: err } = await supabase.auth.updateUser({
        data: { username: trimmed },
      });
      if (err) { setError(err.message); return; }
      await supabase.auth.refreshSession();
      router.replace('/');
    } finally {
      setLoading(false);
    }
  }

  if (checkingSession) return null;

  return (
    <>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html, body {
          font-family: var(--font-plus-jakarta), 'Plus Jakarta Sans', sans-serif;
          background: #FEF9EF;
          color: #0F2D1F;
        }
        .auth-input {
          width: 100%;
          padding: 13px 16px;
          border: 1.5px solid rgba(44,74,56,0.25);
          border-radius: 12px;
          font-size: 15px;
          font-family: inherit;
          color: #0F2D1F;
          background: #FDFAF4;
          outline: none;
          transition: border-color 0.18s, box-shadow 0.18s;
        }
        .auth-input:focus {
          border-color: #1A5C35;
          box-shadow: 0 0 0 3px rgba(26,92,53,0.1);
        }
        .auth-input::placeholder { color: #9AB5A5; }
        .auth-btn {
          width: 100%;
          padding: 14px;
          background: #1A5C35;
          color: #F0FFF6;
          border: none;
          border-radius: 100px;
          font-size: 15.5px;
          font-weight: 700;
          font-family: inherit;
          cursor: pointer;
          transition: all 0.2s;
          letter-spacing: -0.2px;
        }
        .auth-btn:hover:not(:disabled) { background: #144A2A; transform: translateY(-1px); box-shadow: 0 6px 20px rgba(26,92,53,0.3); }
        .auth-btn:disabled { opacity: 0.65; cursor: not-allowed; }
      `}</style>

      <main style={{
        minHeight: '100vh',
        background: '#FEF9EF',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
      }}>
        {/* Background blobs */}
        <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', overflow: 'hidden', zIndex: 0 }}>
          <div style={{ position: 'absolute', top: -120, right: -100, width: 600, height: 600, background: 'radial-gradient(ellipse at 60% 40%, #C8E8CC 0%, #EBF7E5 50%, transparent 72%)', borderRadius: '50%', opacity: 0.8 }} />
          <div style={{ position: 'absolute', bottom: -80, left: -60, width: 400, height: 400, background: 'radial-gradient(ellipse at 30% 70%, #B8DFC0 0%, transparent 62%)', borderRadius: '50%', opacity: 0.6 }} />
        </div>

        {/* Card */}
        <div style={{
          position: 'relative',
          zIndex: 1,
          background: 'rgba(255,255,255,0.92)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderRadius: 24,
          padding: '48px 44px',
          width: '100%',
          maxWidth: 440,
          boxShadow: '0 4px 40px rgba(26,92,53,0.10), 0 1px 4px rgba(26,92,53,0.06)',
          border: '1px solid rgba(26,92,53,0.08)',
        }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 36, justifyContent: 'center' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={LOGO_URL} alt="Vaakya" style={{ width: 40, height: 40, objectFit: 'contain' }} />
            <span style={{ fontSize: 22, fontWeight: 800, color: '#0F2D1F', letterSpacing: '-0.5px' }}>VAAKYA</span>
          </div>

          {/* Welcome badge */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center',
            background: '#E0F5E8', border: '1px solid rgba(30,168,81,0.22)',
            borderRadius: 100, padding: '7px 18px', width: 'fit-content', margin: '0 auto 20px',
          }}>
            <span style={{ fontSize: 16 }}>🎉</span>
            <span style={{ fontSize: 12.5, fontWeight: 700, color: '#1A5C35' }}>You&apos;re in!</span>
          </div>

          <h1 style={{ fontSize: 26, fontWeight: 800, color: '#0F2D1F', letterSpacing: '-1px', marginBottom: 8, textAlign: 'center' }}>
            What should we call you?
          </h1>
          <p style={{ fontSize: 14.5, color: '#7B9A8A', textAlign: 'center', marginBottom: 32, lineHeight: 1.5 }}>
            We&apos;ll use this to personalise your experience
          </p>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#2C4A38', marginBottom: 7 }}>
                Your name
              </label>
              <input
                className="auth-input"
                type="text"
                placeholder="e.g. Priya, Raj, Arjun…"
                value={username}
                onChange={e => setUsername(e.target.value)}
                required
                autoFocus
                autoComplete="name"
              />
            </div>

            {error && (
              <div style={{
                padding: '11px 15px', borderRadius: 10,
                background: '#FFF0F0', border: '1px solid rgba(220,50,50,0.2)',
                fontSize: 13.5, color: '#B91C1C', lineHeight: 1.5,
              }}>
                {error}
              </div>
            )}

            <button className="auth-btn" type="submit" disabled={loading} style={{ marginTop: 4 }}>
              {loading ? 'Saving…' : 'Continue to Vaakya →'}
            </button>
          </form>
        </div>
      </main>
    </>
  );
}
