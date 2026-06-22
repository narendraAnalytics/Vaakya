'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/client';

const LOGO_URL =
  'https://res.cloudinary.com/dkqbzwicr/image/upload/v1782139407/logovaakya_dqmskw.png';

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) router.replace('/');
      else setCheckingSession(false);
    });
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const toMsg = (err: { message?: string; name?: string; code?: string; status?: number } | null) => {
      console.error('[Vaakya Auth]', JSON.stringify(err));
      const msg = err?.message;
      if (!msg || msg === '{}') return 'Something went wrong. Please check your credentials and try again.';
      return msg;
    };

    try {
      if (mode === 'signup') {
        const { error: err } = await supabase.auth.signUp({ email, password });
        if (err) { setError(toMsg(err)); return; }
        setError('Check your email to confirm your account, then sign in.');
        setMode('signin');
        return;
      }

      const { data, error: err } = await supabase.auth.signInWithPassword({ email, password });
      if (err) { setError(toMsg(err)); return; }

      const username = data.user?.user_metadata?.username;
      router.replace(username ? '/' : '/onboarding');
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
        .toggle-link { color: #1A5C35; font-weight: 600; cursor: pointer; text-decoration: underline; }
        .toggle-link:hover { color: #144A2A; }
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
          <a href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', marginBottom: 36, justifyContent: 'center' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={LOGO_URL} alt="Vaakya" style={{ width: 40, height: 40, objectFit: 'contain' }} />
            <span style={{ fontSize: 22, fontWeight: 800, color: '#0F2D1F', letterSpacing: '-0.5px' }}>VAAKYA</span>
          </a>

          {/* Heading */}
          <h1 style={{ fontSize: 26, fontWeight: 800, color: '#0F2D1F', letterSpacing: '-1px', marginBottom: 6, textAlign: 'center' }}>
            {mode === 'signin' ? 'Welcome back' : 'Create your account'}
          </h1>
          <p style={{ fontSize: 14.5, color: '#7B9A8A', textAlign: 'center', marginBottom: 32, lineHeight: 1.5 }}>
            {mode === 'signin'
              ? 'Sign in to manage your legal documents'
              : 'Start creating legal documents in minutes'}
          </p>

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#2C4A38', marginBottom: 7 }}>
                Email address
              </label>
              <input
                className="auth-input"
                type="email"
                placeholder="you@company.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#2C4A38', marginBottom: 7 }}>
                Password
              </label>
              <input
                className="auth-input"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                minLength={6}
              />
            </div>

            {error && (
              <div style={{
                padding: '11px 15px',
                borderRadius: 10,
                background: error.startsWith('Check') ? '#E0F5E8' : '#FFF0F0',
                border: `1px solid ${error.startsWith('Check') ? 'rgba(26,92,53,0.2)' : 'rgba(220,50,50,0.2)'}`,
                fontSize: 13.5,
                color: error.startsWith('Check') ? '#1A5C35' : '#B91C1C',
                lineHeight: 1.5,
              }}>
                {error}
              </div>
            )}

            <button className="auth-btn" type="submit" disabled={loading} style={{ marginTop: 4 }}>
              {loading ? 'Please wait…' : mode === 'signin' ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          {/* Toggle */}
          <p style={{ textAlign: 'center', fontSize: 14, color: '#7B9A8A', marginTop: 24 }}>
            {mode === 'signin' ? "Don't have an account? " : 'Already have an account? '}
            <span className="toggle-link" onClick={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); setError(''); }}>
              {mode === 'signin' ? 'Sign up free' : 'Sign in'}
            </span>
          </p>
        </div>

        {/* Footer */}
        <p style={{ marginTop: 24, fontSize: 12.5, color: '#9AB5A5', textAlign: 'center', position: 'relative', zIndex: 1 }}>
          By continuing you agree to Vaakya&apos;s Terms of Service
        </p>
      </main>
    </>
  );
}
