'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

const VIDEO_URL =
  'https://res.cloudinary.com/dkqbzwicr/video/upload/v1782572837/intovideo_yumicd.webm';

export default function IntroPage() {
  const router = useRouter();
  const vidRef = useRef<HTMLVideoElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const [muted, setMuted] = useState(true);

  useEffect(() => {
    const vid = vidRef.current;
    if (!vid) return;
    vid.loop = true;
    vid.muted = true;
    vid.play().catch(() => {});
    vid.addEventListener('ended', () => { vid.currentTime = 0; vid.play().catch(() => {}); });

    const unmute = () => {
      if (vid.muted) {
        vid.muted = false;
        setMuted(false);
      }
    };
    document.addEventListener('click', unmute, { once: true });
    return () => document.removeEventListener('click', unmute);
  }, []);

  function enterSite() {
    sessionStorage.setItem('vaakya_intro_seen', 'true');
    const root = rootRef.current;
    if (root) {
      root.style.transition = 'opacity 0.6s ease';
      root.style.opacity = '0';
      setTimeout(() => router.replace('/'), 600);
    } else {
      router.replace('/');
    }
  }

  function toggleMute() {
    const vid = vidRef.current;
    if (!vid) return;
    vid.muted = !vid.muted;
    setMuted(vid.muted);
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,400;0,500;0,600;0,700;0,800;1,400&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html, body { height: 100%; overflow: hidden; }

        @keyframes pulseRing1 {
          0% { transform: scale(1); opacity: 0.55; }
          100% { transform: scale(2.2); opacity: 0; }
        }
        @keyframes pulseRing2 {
          0% { transform: scale(1); opacity: 0.38; }
          100% { transform: scale(2.8); opacity: 0; }
        }
        @keyframes pulseRing3 {
          0% { transform: scale(1); opacity: 0.22; }
          100% { transform: scale(3.4); opacity: 0; }
        }
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(28px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes floatY {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-8px); }
        }
        @keyframes rotateSlow {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes orbFloat1 {
          0%,100% { transform: translate(0, 0) scale(1); }
          33%      { transform: translate(40px, -30px) scale(1.06); }
          66%      { transform: translate(-20px, 20px) scale(0.96); }
        }
        @keyframes orbFloat2 {
          0%,100% { transform: translate(0, 0) scale(1); }
          40%      { transform: translate(-50px, 25px) scale(1.04); }
          70%      { transform: translate(30px, -18px) scale(0.98); }
        }

        .enter-btn {
          cursor: pointer;
          transition: transform 0.22s ease, box-shadow 0.22s ease;
        }
        .enter-btn:hover {
          transform: scale(1.07) !important;
          box-shadow: 0 0 80px rgba(30,168,81,0.7), 0 0 40px rgba(245,159,11,0.4) !important;
        }
        .enter-btn:active { transform: scale(0.97) !important; }

        .mute-btn {
          cursor: pointer;
          transition: all 0.18s;
          opacity: 0.75;
        }
        .mute-btn:hover { opacity: 1; }
      ` }} />

      {/* Full-screen wrapper */}
      <div
        ref={rootRef}
        style={{
          position: 'fixed', inset: 0, overflow: 'hidden', zIndex: 9999,
          background: '#0D2B18', fontFamily: "'Plus Jakarta Sans', sans-serif",
        }}
      >
        {/* Video background */}
        <video
          ref={vidRef}
          autoPlay
          muted
          loop
          playsInline
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: 1 }}
        >
          <source src={VIDEO_URL} type="video/webm" />
        </video>

        {/* Overlays */}
        <div style={{ position: 'absolute', inset: 0, zIndex: 2, background: 'rgba(10,38,18,0.35)' }} />
        <div style={{ position: 'absolute', inset: 0, zIndex: 3, background: 'radial-gradient(ellipse at center, transparent 28%, rgba(5,20,10,0.55) 100%)' }} />
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 220, zIndex: 3, background: 'linear-gradient(to bottom, rgba(8,30,14,0.70) 0%, transparent 100%)' }} />
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 260, zIndex: 3, background: 'linear-gradient(to top, rgba(8,30,14,0.78) 0%, transparent 100%)' }} />
        {/* Amber glow bottom-right */}
        <div style={{ position: 'absolute', bottom: -120, right: -80, width: 600, height: 500, zIndex: 3, background: 'radial-gradient(ellipse at 60% 70%, rgba(245,159,11,0.18) 0%, transparent 65%)', pointerEvents: 'none' }} />
        {/* Green glow top-left */}
        <div style={{ position: 'absolute', top: -80, left: -60, width: 500, height: 400, zIndex: 3, background: 'radial-gradient(ellipse at 30% 30%, rgba(30,168,81,0.14) 0%, transparent 65%)', pointerEvents: 'none' }} />

        {/* Floating orb accents */}
        <div style={{ position: 'absolute', top: '18%', left: '8%', width: 200, height: 200, zIndex: 3, borderRadius: '50%', background: 'radial-gradient(circle, rgba(30,168,81,0.13) 0%, transparent 70%)', animation: 'orbFloat1 9s ease-in-out infinite', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '22%', right: '10%', width: 260, height: 260, zIndex: 3, borderRadius: '50%', background: 'radial-gradient(circle, rgba(245,159,11,0.11) 0%, transparent 70%)', animation: 'orbFloat2 11s ease-in-out infinite', pointerEvents: 'none' }} />

        {/* Rotating ring top-right */}
        <div style={{ position: 'absolute', top: -60, right: -60, width: 320, height: 320, zIndex: 3, border: '1px solid rgba(30,168,81,0.12)', borderRadius: '50%', animation: 'rotateSlow 22s linear infinite', pointerEvents: 'none' }}>
          <div style={{ position: 'absolute', top: 20, left: 20, right: 20, bottom: 20, border: '1px solid rgba(245,159,11,0.10)', borderRadius: '50%' }} />
        </div>
        {/* Rotating ring bottom-left */}
        <div style={{ position: 'absolute', bottom: -80, left: -80, width: 380, height: 380, zIndex: 3, border: '1px solid rgba(30,168,81,0.08)', borderRadius: '50%', animation: 'rotateSlow 30s linear infinite reverse', pointerEvents: 'none' }} />

        {/* Dot grid */}
        <div style={{ position: 'absolute', inset: 0, zIndex: 3, backgroundImage: 'radial-gradient(circle, rgba(30,168,81,0.12) 1px, transparent 1px)', backgroundSize: '44px 44px', pointerEvents: 'none' }} />

        {/* Enter button — bottom center */}
        <div
          style={{
            position: 'absolute', bottom: '10%', left: 0, right: 0,
            zIndex: 10, display: 'flex', justifyContent: 'center',
            animation: 'fadeSlideUp 1s 0.6s ease both', opacity: 0,
          }}
        >
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {/* Pulse rings */}
            <div style={{ position: 'absolute', width: 88, height: 88, borderRadius: '50%', background: 'rgba(30,168,81,0.28)', animation: 'pulseRing1 2.4s ease-out infinite' }} />
            <div style={{ position: 'absolute', width: 88, height: 88, borderRadius: '50%', background: 'rgba(30,168,81,0.18)', animation: 'pulseRing2 2.4s 0.5s ease-out infinite' }} />
            <div style={{ position: 'absolute', width: 88, height: 88, borderRadius: '50%', background: 'rgba(30,168,81,0.10)', animation: 'pulseRing3 2.4s 1s ease-out infinite' }} />

            {/* Button */}
            <button
              className="enter-btn"
              onClick={enterSite}
              style={{
                position: 'relative', zIndex: 2,
                display: 'flex', alignItems: 'center', gap: 14,
                padding: '20px 52px', borderRadius: 100, border: 'none', cursor: 'pointer',
                background: 'linear-gradient(135deg, #1EA851 0%, #16A34A 40%, #F59F0B 100%)',
                color: '#FFF8F0',
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontSize: 18, fontWeight: 800, letterSpacing: '-0.3px',
                boxShadow: '0 0 70px rgba(30,168,81,0.55), 0 8px 36px rgba(0,0,0,0.28)',
                animation: 'floatY 3.5s ease-in-out infinite',
              }}
            >
              <span>Enter Vaakya</span>
              <svg width="21" height="21" viewBox="0 0 20 20" fill="none">
                <path d="M3 10H17M11 4L17 10L11 16" stroke="#FFF8F0" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </div>

        {/* Mute toggle — bottom-right */}
        <button
          className="mute-btn"
          onClick={toggleMute}
          style={{
            position: 'absolute', bottom: 24, right: 28, zIndex: 20,
            background: 'rgba(255,248,240,0.12)', border: '1px solid rgba(255,248,240,0.2)',
            borderRadius: '50%', width: 44, height: 44,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', backdropFilter: 'blur(10px)',
          }}
          aria-label={muted ? 'Unmute' : 'Mute'}
        >
          {muted ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M11 5L6 9H2v6h4l5 4V5z" fill="rgba(255,248,240,0.85)" />
              <line x1="23" y1="9" x2="17" y2="15" stroke="rgba(255,248,240,0.85)" strokeWidth="1.8" strokeLinecap="round" />
              <line x1="17" y1="9" x2="23" y2="15" stroke="rgba(255,248,240,0.85)" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M11 5L6 9H2v6h4l5 4V5z" fill="rgba(255,248,240,0.85)" />
              <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" stroke="rgba(255,248,240,0.85)" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          )}
        </button>
      </div>
    </>
  );
}
