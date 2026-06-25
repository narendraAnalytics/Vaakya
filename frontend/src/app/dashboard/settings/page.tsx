'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/client'

const STYLES = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  .back-btn { transition: all 0.18s; text-decoration: none; }
  .back-btn:hover { background: #E0F5E8 !important; color: #1A5C35 !important; }
  .settings-section { transition: box-shadow 0.18s; }
  .settings-section:hover { box-shadow: 0 6px 24px rgba(26,92,53,0.09) !important; }
  .logout-btn { transition: all 0.18s; cursor: pointer; border: none; }
  .logout-btn:hover { background: #C03030 !important; color: #fff !important; }
`

const STACK_INFO = [
  { label: 'AI Orchestration', value: 'LangGraph 0.2+' },
  { label: 'Reasoning LLM', value: 'llama-3.3-70b-versatile (Groq)' },
  { label: 'Routing LLM', value: 'llama-3.1-8b-instant (Groq)' },
  { label: 'Legal Search', value: 'Tavily — Indian case law' },
  { label: 'Database', value: 'Supabase PostgreSQL + pgvector' },
  { label: 'Embeddings', value: 'BAAI/bge-small-en-v1.5' },
  { label: 'Jurisdiction', value: 'Indian Contract Act 1872 (default)' },
]

export default function SettingsPage() {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }

      setEmail(user.email ?? '')
      setUsername(
        user.user_metadata?.username ||
        user.email?.split('@')[0] ||
        'User'
      )
      setLoading(false)
    }
    load()
  }, [router])

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/auth/login')
  }

  const initial = username[0]?.toUpperCase() || '?'

  return (
    <div style={{ minHeight: '100vh', background: '#FEF9EF', fontFamily: "'Inter', 'Segoe UI', sans-serif" }}>
      <style dangerouslySetInnerHTML={{ __html: STYLES }} />

      {/* Top bar */}
      <div style={{ background: '#fff', borderBottom: '1px solid rgba(26,92,53,0.09)', padding: '14px 28px', display: 'flex', alignItems: 'center', gap: 16, position: 'sticky', top: 0, zIndex: 10, boxShadow: '0 2px 12px rgba(26,92,53,0.05)' }}>
        <a href="/dashboard" className="back-btn" style={{ display: 'flex', alignItems: 'center', gap: 7, background: '#F5FAF6', border: '1.5px solid rgba(26,92,53,0.14)', borderRadius: 100, padding: '8px 16px', fontSize: 13, fontWeight: 600, color: '#2C4A38' }}>
          ← Back to Dashboard
        </a>
        <div style={{ width: 1, height: 24, background: 'rgba(26,92,53,0.12)' }} />
        <div>
          <span style={{ fontSize: 17, fontWeight: 800, color: '#0F2D1F', letterSpacing: -0.4 }}>Settings</span>
          <span style={{ fontSize: 13, color: '#8BAA96', marginLeft: 10 }}>Account & preferences</span>
        </div>
      </div>

      <div style={{ maxWidth: 700, margin: '0 auto', padding: '28px 24px' }}>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: '#8BAA96', fontSize: 14 }}>Loading…</div>
        ) : (
          <>
            {/* Profile card */}
            <div className="settings-section" style={{ background: '#fff', borderRadius: 20, border: '1px solid rgba(26,92,53,0.09)', boxShadow: '0 4px 20px rgba(26,92,53,0.07)', padding: '28px', marginBottom: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#8BAA96', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 16 }}>Account</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
                <div style={{ width: 60, height: 60, background: 'linear-gradient(135deg,#1A5C35,#1EA851)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 800, color: '#fff', flexShrink: 0, boxShadow: '0 4px 16px rgba(26,92,53,0.25)' }}>
                  {initial}
                </div>
                <div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: '#0F2D1F', marginBottom: 4 }}>{username}</div>
                  <div style={{ fontSize: 13, color: '#8BAA96' }}>{email}</div>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: '#E8F5D0', borderRadius: 100, padding: '3px 12px', marginTop: 8, fontSize: 11.5, fontWeight: 700, color: '#4D8A10' }}>
                    ✦ Pro Plan
                  </div>
                </div>
              </div>
            </div>

            {/* Legal workspace info */}
            <div className="settings-section" style={{ background: '#fff', borderRadius: 20, border: '1px solid rgba(26,92,53,0.09)', boxShadow: '0 4px 20px rgba(26,92,53,0.07)', padding: '24px', marginBottom: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#8BAA96', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 16 }}>Workspace</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {[
                  { label: 'Default Jurisdiction', value: 'India (Indian Contract Act 1872)' },
                  { label: 'HITL Checkpoint', value: 'Mandatory — all documents require approval' },
                  { label: 'Max Review Loops', value: '3 (Rachana ↔ Parisheelanam)' },
                  { label: 'Min Review Score', value: '75 / 100 before proceeding' },
                  { label: 'Document Storage', value: 'Supabase Storage (private bucket)' },
                ].map(row => (
                  <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '11px 0', borderBottom: '1px solid rgba(26,92,53,0.06)', gap: 16 }}>
                    <span style={{ fontSize: 13, color: '#5A7A68', fontWeight: 500 }}>{row.label}</span>
                    <span style={{ fontSize: 13, color: '#0F2D1F', fontWeight: 600, textAlign: 'right' }}>{row.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Tech stack */}
            <div className="settings-section" style={{ background: '#fff', borderRadius: 20, border: '1px solid rgba(26,92,53,0.09)', boxShadow: '0 4px 20px rgba(26,92,53,0.07)', padding: '24px', marginBottom: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#8BAA96', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 16 }}>About Vaakya</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                <span style={{ fontSize: 22 }}>వాక్య</span>
                <div>
                  <div style={{ fontSize: 13.5, fontWeight: 700, color: '#0F2D1F' }}>Autonomous Legal Document Factory</div>
                  <div style={{ fontSize: 12, color: '#8BAA96' }}>For Indian SMBs · 8 AI agents · LangGraph + Groq</div>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {STACK_INFO.map(row => (
                  <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '9px 0', borderBottom: '1px solid rgba(26,92,53,0.06)', gap: 16 }}>
                    <span style={{ fontSize: 12.5, color: '#8BAA96' }}>{row.label}</span>
                    <span style={{ fontSize: 12.5, color: '#2C4A38', fontWeight: 600, textAlign: 'right' }}>{row.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Logout */}
            <div className="settings-section" style={{ background: '#fff', borderRadius: 20, border: '1px solid rgba(26,92,53,0.09)', boxShadow: '0 4px 20px rgba(26,92,53,0.07)', padding: '24px' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#8BAA96', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 16 }}>Session</div>
              <button
                className="logout-btn"
                onClick={handleLogout}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#FFE8E8', color: '#C03030', borderRadius: 12, padding: '10px 20px', fontSize: 13.5, fontWeight: 700, fontFamily: 'inherit', transition: 'all 0.18s' }}
              >
                Sign Out
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
