'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/client'
import type { VaultDocument } from './page'

const LOGO_URL = 'https://res.cloudinary.com/dkqbzwicr/image/upload/v1782139407/logovaakya_dqmskw.png'
const AGENTS_URL = 'https://res.cloudinary.com/dkqbzwicr/image/upload/v1782195234/agentsimage_svo9wa.png'

type Props = {
  username: string
  documents: VaultDocument[]
}

function formatSavings(amount: number): string {
  if (amount === 0) return '₹0'
  if (amount < 1000) return `₹${amount}`
  if (amount < 100000) return `₹${(amount / 1000).toFixed(1)}k`
  return `₹${(amount / 100000).toFixed(1)}L`
}

function getDocIcon(type: string): string {
  const t = type.toLowerCase()
  if (t.includes('nda') || t.includes('non-disclosure')) return '📋'
  if (t.includes('employment')) return '👔'
  if (t.includes('vendor') || t.includes('supplier')) return '🤝'
  if (t.includes('partnership')) return '🏢'
  if (t.includes('lease') || t.includes('rental')) return '🏠'
  if (t.includes('freelance')) return '💼'
  if (t.includes('mou') || t.includes('memorandum')) return '📝'
  if (t.includes('shareholder')) return '📊'
  if (t.includes('consulting')) return '🧠'
  if (t.includes('service')) return '⚙️'
  if (t.includes('msa') || t.includes('master service')) return '🗂️'
  if (t.includes('ip assignment') || t.includes('intellectual property')) return '💡'
  if (t.includes('loan')) return '💰'
  if (t.includes('legal notice') || t.includes('notice')) return '⚖️'
  if (t.includes('privacy policy') || t.includes('privacy')) return '🔒'
  if (t.includes('terms of service') || t.includes('terms')) return '📜'
  return '📄'
}

function getStatusBadge(status: string): { label: string; color: string; bg: string } {
  switch (status) {
    case 'completed':
    case 'pending_signature':
      return { label: '✅ Completed', color: '#1A5C35', bg: '#E0F5E8' }
    case 'reviewing':
    case 'hitl_pending':
    case 'pending_review':
    case 'awaiting_approval':
      return { label: '🔍 Reviewing', color: '#B07010', bg: '#FFF0D8' }
    case 'risk_flagged':
      return { label: '⚠️ Risks', color: '#C03030', bg: '#FFE8E8' }
    case 'generating':
    case 'pending':
      return { label: '⏳ Processing', color: '#5A7AB0', bg: '#EAE8F5' }
    default:
      return { label: '⏳ Processing', color: '#5A7AB0', bg: '#EAE8F5' }
  }
}

function formatDocDate(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  if (diffDays === 0) {
    return `Today, ${date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}`
  }
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays} days ago`
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
}

const STYLES = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  @keyframes pulseGlow {
    0%,100% { box-shadow: 0 4px 22px rgba(30,168,81,0.38), 0 2px 6px rgba(30,168,81,0.18); }
    50%      { box-shadow: 0 6px 36px rgba(30,168,81,0.6),  0 0 52px rgba(30,168,81,0.18); }
  }
  @keyframes dotBlink {
    0%,100% { opacity: 1; } 50% { opacity: 0.28; }
  }
  @keyframes spin {
    from { transform: rotate(0deg); } to { transform: rotate(360deg); }
  }

  .db-sidebar { transition: width 0.22s cubic-bezier(.4,0,.2,1), min-width 0.22s cubic-bezier(.4,0,.2,1); }
  .db-sidebar.collapsed { width: 72px !important; min-width: 72px !important; }
  .db-sidebar.collapsed .sidebar-lbl { display: none !important; }
  .db-sidebar.collapsed .nav-badge { display: none !important; }
  .db-sidebar.collapsed .sidebar-section-lbl { display: none !important; }

  .nav-item { transition: background 0.15s, transform 0.12s; cursor: pointer; }
  .nav-item:hover { background: rgba(26,92,53,0.09) !important; transform: translateX(3px); }
  .nav-active { background: linear-gradient(135deg,#1A5C35,#1EA851) !important; transform: none !important; }
  .nav-active:hover { transform: none !important; }

  .tab-btn { cursor: pointer; transition: all 0.18s; user-select: none; }
  .tab-active  { background: #fff !important; color: #1A5C35 !important; font-weight: 700 !important; box-shadow: 0 2px 12px rgba(26,92,53,0.12) !important; }
  .tab-inactive { color: #90ADA0 !important; font-weight: 500 !important; }
  .tab-inactive:hover { color: #1A5C35 !important; background: rgba(255,255,255,0.5) !important; }

  .gen-btn { cursor: pointer; transition: all 0.22s; animation: pulseGlow 2.8s ease-in-out infinite; border: none; }
  .gen-btn:hover { transform: translateY(-2px); box-shadow: 0 10px 40px rgba(30,168,81,0.58) !important; }
  .gen-btn:active { transform: translateY(0); }

  .kpi-card { transition: transform 0.2s, box-shadow 0.2s; cursor: pointer; }
  .kpi-card:hover { transform: translateY(-4px); box-shadow: 0 10px 32px rgba(26,92,53,0.13) !important; }

  .doc-row { transition: background 0.13s; cursor: pointer; }
  .doc-row:hover { background: #F0FAF3 !important; }

  .alert-item { transition: background 0.13s; cursor: pointer; border-radius: 14px; }
  .alert-item:hover { background: #EFF8F2 !important; }

  .quick-chip { transition: all 0.18s; cursor: pointer; user-select: none; }
  .quick-chip:hover { background: #C8E8D0 !important; color: #0F2D1F !important; transform: scale(1.03); }

  .upload-zone { transition: all 0.2s; cursor: pointer; }
  .upload-zone:hover { border-color: rgba(30,168,81,0.55) !important; background: #EDFAF2 !important; }

  .db-main::-webkit-scrollbar { width: 4px; }
  .db-main::-webkit-scrollbar-track { background: transparent; }
  .db-main::-webkit-scrollbar-thumb { background: rgba(26,92,53,0.18); border-radius: 100px; }

  select:focus, textarea:focus { border-color: rgba(30,168,81,0.5) !important; box-shadow: 0 0 0 3px rgba(30,168,81,0.09) !important; outline: none; }
  select, textarea { outline: none; transition: border-color 0.18s, box-shadow 0.18s; }

  .toggle-btn { background: none; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; border-radius: 8px; transition: background 0.15s; }
  .toggle-btn:hover { background: rgba(26,92,53,0.09); }

  @media (max-width: 1120px) {
    .db-sidebar { width: 72px !important; min-width: 72px !important; }
    .sidebar-lbl { display: none !important; }
    .nav-badge { display: none !important; }
    .sidebar-section-lbl { display: none !important; }
  }
  @media (max-width: 840px) {
    .db-sidebar { display: none !important; }
    .db-main { padding: 16px !important; }
    .hero-row { flex-direction: column !important; }
    .agent-panel { width: 100% !important; min-width: 0 !important; max-width: 100% !important; }
    .kpi-row { flex-wrap: wrap !important; }
    .kpi-card { flex: 0 0 calc(50% - 8px) !important; }
    .activity-row { flex-direction: column !important; }
    .alerts-col { width: 100% !important; min-width: 0 !important; }
  }
`

export default function DashboardClient({ username, documents }: Props) {
  const router = useRouter()
  const [collapsed, setCollapsed] = useState(false)
  const [tab, setTab] = useState<'text' | 'upload'>('text')
  const [generating, setGenerating] = useState(false)
  const [docType, setDocType] = useState('')
  const [docText, setDocText] = useState('')
  const [docTextEmpty, setDocTextEmpty] = useState(false)
  const [genError, setGenError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploadFile, setUploadFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const [dragOver, setDragOver] = useState(false)
  const [greeting, setGreeting] = useState('Good morning')
  const [dateStr, setDateStr] = useState('')

  useEffect(() => {
    const h = new Date().getHours()
    setGreeting(h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening')
    setDateStr(new Date().toLocaleDateString('en-IN', {
      weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
    }))
  }, [])

  const displayName = username.includes('@') ? username.split('@')[0] : username
  const initial = displayName[0]?.toUpperCase() || '?'
  const totalDocs = documents.length
  const FREE_PLAN_LIMIT = 2
  const now = new Date()
  const monthlyDocCount = documents.filter(d => {
    if (!d.created_at) return false
    const c = new Date(d.created_at)
    return c.getFullYear() === now.getFullYear() && c.getMonth() === now.getMonth()
  }).length
  const docsRemaining = Math.max(0, FREE_PLAN_LIMIT - monthlyDocCount)
  const limitReached = monthlyDocCount >= FREE_PLAN_LIMIT
  const savings = formatSavings(totalDocs * 5000)
  const riskCount = documents.filter(
    d => d.status === 'risk_flagged' || (d.risk_flags && d.risk_flags.length > 0)
  ).length
  const recentDocs = documents.slice(0, 5)

  // Derive alerts from real documents
  const alerts = documents.slice(0, 4).map(doc => {
    if (doc.status === 'risk_flagged' || (doc.risk_flags && doc.risk_flags.length > 0)) {
      return {
        icon: '🚨', iconBg: '#FFE0E0',
        title: `Risk in ${doc.document_type}`,
        sub: 'Review flagged risk clauses',
        level: 'High Risk', levelColor: '#C03030',
      }
    }
    if (doc.status === 'completed' || doc.status === 'pending_signature') {
      return {
        icon: '✅', iconBg: '#E0F5E8',
        title: `${doc.document_type || 'Document'} completed`,
        sub: `AI agents finished — ready to review`,
        level: 'Done', levelColor: '#1A5C35',
      }
    }
    if (doc.status === 'hitl_pending' || doc.status === 'pending_review' || doc.status === 'awaiting_approval') {
      return {
        icon: '🔍', iconBg: '#FFF0D0',
        title: `${doc.document_type || 'Document'} awaiting approval`,
        sub: 'HITL checkpoint — your review needed',
        level: 'Action Required', levelColor: '#C07010',
      }
    }
    return {
      icon: '⏳', iconBg: '#EAE8F5',
      title: `${doc.document_type || 'Document'} processing`,
      sub: 'AI agents working on your document',
      level: 'In Progress', levelColor: '#5A7AB0',
    }
  })

  async function handleUpload() {
    if (uploading || !uploadFile) return
    setUploading(true)
    setUploadError('')
    try {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      const token = session?.access_token
      const form = new FormData()
      form.append('file', uploadFile)
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/document/upload`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: form,
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        setUploadError(err?.detail || 'Upload failed. Please try again.')
        setUploading(false)
        return
      }
      const { document_id } = await res.json()
      router.push(`/dashboard/documents/${document_id}`)
    } catch {
      setUploadError('Network error. Check your connection and try again.')
      setUploading(false)
    }
  }

  async function handleGenerate() {
    if (generating) return
    if (limitReached) return
    if (!docText.trim()) { setDocTextEmpty(true); return }
    setDocTextEmpty(false)
    setGenerating(true)
    setGenError('')
    try {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      const token = session?.access_token
      const prompt = docType ? `Document Type: ${docType}\n\n${docText}` : docText
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/document/new`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ request: prompt, input_mode: 'text' }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        setGenError(err?.detail || 'Failed to start generation. Please try again.')
        setGenerating(false)
        return
      }
      const { document_id } = await res.json()
      router.push(`/dashboard/documents/${document_id}`)
    } catch {
      setGenError('Network error. Check your connection and try again.')
      setGenerating(false)
    }
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: STYLES }} />
      <div style={{ display: 'flex', width: '100%', height: '100vh', background: '#FEF9EF', overflow: 'hidden', position: 'relative', fontFamily: '"Plus Jakarta Sans", sans-serif' }}>

        {/* ══ SIDEBAR ══ */}
        <aside
          className={`db-sidebar${collapsed ? ' collapsed' : ''}`}
          style={{ width: 252, minWidth: 252, background: 'linear-gradient(175deg,#F3FCF5 0%,#E8F7EE 100%)', borderRight: '1.5px solid rgba(26,92,53,0.09)', display: 'flex', flexDirection: 'column', height: '100vh', overflowY: 'auto', flexShrink: 0, zIndex: 20 }}
        >
          {/* Logo + toggle */}
          <div style={{ padding: '20px 16px 14px', borderBottom: '1px solid rgba(26,92,53,0.08)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 11, minWidth: 0 }}>
              <div style={{ width: 40, height: 40, background: '#E0F5E8', borderRadius: 11, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0, boxShadow: '0 2px 10px rgba(26,92,53,0.14)' }}>
                <img src={LOGO_URL} style={{ width: 33, height: 33, objectFit: 'contain' }} alt="Vaakya" />
              </div>
              <div className="sidebar-lbl" style={{ minWidth: 0 }}>
                <div style={{ fontSize: 15.5, fontWeight: 800, color: '#0F2D1F', letterSpacing: -0.5, lineHeight: 1.1 }}>VAAKYA</div>
                <div style={{ fontSize: 10, fontWeight: 500, color: '#8BAA96', letterSpacing: 0.4, marginTop: 2 }}>Legal AI Platform</div>
              </div>
            </div>
            <button className="toggle-btn" onClick={() => setCollapsed(c => !c)} style={{ width: 30, height: 30, color: '#5A7A68', flexShrink: 0 }} title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}>
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                {collapsed
                  ? <path d="M4 9h10M9 4l5 5-5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  : <path d="M14 9H4M9 14l-5-5 5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                }
              </svg>
            </button>
          </div>

          {/* Nav */}
          <nav style={{ flex: 1, padding: '14px 10px', display: 'flex', flexDirection: 'column', gap: 3, overflowY: 'auto' }}>
            <div className="sidebar-section-lbl" style={{ fontSize: 10, fontWeight: 700, color: '#A8C4B4', letterSpacing: 1.1, padding: '6px 10px 3px', textTransform: 'uppercase' }}>Workspace</div>

            {[
              { icon: '🏠', label: 'Dashboard', active: true, badge: null, route: '/dashboard' },
              { icon: '📄', label: 'Documents', active: false, badge: totalDocs > 0 ? String(totalDocs) : null, badgeStyle: { background: '#E0F5E8', color: '#1A5C35' }, route: '/dashboard/documents' },
              { icon: '🤖', label: 'AI Agents', active: false, badge: '8', badgeStyle: { background: '#E8F5D0', color: '#4D8A10' }, route: '/dashboard/agents' },
              { icon: '🔒', label: 'Legal Vault', active: false, badge: null, route: '/dashboard/vault' },
            ].map(item => (
              <div key={item.label} className={`nav-item${item.active ? ' nav-active' : ''}`} onClick={() => router.push(item.route)} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 13px', borderRadius: 12 }}>
                <span style={{ fontSize: 17, flexShrink: 0 }}>{item.icon}</span>
                <span className="sidebar-lbl" style={{ fontSize: 13.5, fontWeight: item.active ? 600 : 500, color: item.active ? '#fff' : '#2C4A38', flex: 1 }}>{item.label}</span>
                {item.badge && (
                  <span className="sidebar-lbl nav-badge" style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 100, flexShrink: 0, ...item.badgeStyle }}>{item.badge}</span>
                )}
              </div>
            ))}

            <div className="sidebar-section-lbl" style={{ fontSize: 10, fontWeight: 700, color: '#A8C4B4', letterSpacing: 1.1, padding: '12px 10px 3px', textTransform: 'uppercase' }}>Legal Ops</div>

            {[
              { icon: '📅', label: 'Obligations', route: '/dashboard/obligations' },
              { icon: '⚖️', label: 'Disputes', route: '/dashboard/disputes' },
              { icon: '📊', label: 'Analytics', route: '/dashboard/analytics' },
            ].map(item => (
              <div key={item.label} className="nav-item" onClick={() => router.push(item.route)} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 13px', borderRadius: 12 }}>
                <span style={{ fontSize: 17, flexShrink: 0 }}>{item.icon}</span>
                <span className="sidebar-lbl" style={{ fontSize: 13.5, fontWeight: 500, color: '#2C4A38' }}>{item.label}</span>
              </div>
            ))}
          </nav>

          {/* Bottom */}
          <div style={{ padding: '10px 10px 14px', borderTop: '1px solid rgba(26,92,53,0.08)', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <div className="nav-item" onClick={() => router.push('/dashboard/settings')} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '9px 13px', borderRadius: 12 }}>
              <span style={{ fontSize: 17, flexShrink: 0 }}>⚙️</span>
              <span className="sidebar-lbl" style={{ fontSize: 13.5, fontWeight: 500, color: '#2C4A38' }}>Settings</span>
            </div>
            <div className="nav-item" style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '10px 13px', marginTop: 4, borderTop: '1px solid rgba(26,92,53,0.08)', borderRadius: 12 }}>
              <div style={{ width: 34, height: 34, background: 'linear-gradient(135deg,#1A5C35,#1EA851)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 800, color: '#fff', flexShrink: 0, boxShadow: '0 2px 8px rgba(26,92,53,0.25)' }}>{initial}</div>
              <div className="sidebar-lbl" style={{ minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#0F2D1F', lineHeight: 1.2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{displayName}</div>
                <div style={{ fontSize: 11, color: '#8BAA96', marginTop: 1 }}>Free Plan 🌱</div>
              </div>
            </div>
          </div>
        </aside>

        {/* ══ MAIN ══ */}
        <main className="db-main" style={{ flex: 1, overflowY: 'auto', padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: 18, maxHeight: '100vh', position: 'relative' }}>

          {/* Leaf accents */}
          <div style={{ position: 'fixed', top: 40, right: 60, opacity: 0.45, pointerEvents: 'none', zIndex: 0 }}>
            <svg width="90" height="110" viewBox="0 0 90 110" fill="none">
              <path d="M45 105C45 105 5 80 8 38C11-4 82 2 82 45C82 78 45 105 45 105Z" fill="rgba(30,168,81,0.13)" />
              <path d="M45 105C45 105 38 60 44 32C50 4 68 16 68 38" stroke="rgba(30,168,81,0.28)" strokeWidth="1.8" fill="none" />
              <path d="M44 42C44 42 56 48 66 60" stroke="rgba(30,168,81,0.18)" strokeWidth="1.2" fill="none" />
              <path d="M44 62C44 62 54 66 62 78" stroke="rgba(30,168,81,0.13)" strokeWidth="1" fill="none" />
            </svg>
          </div>
          <div style={{ position: 'fixed', bottom: 60, right: 40, opacity: 0.35, pointerEvents: 'none', zIndex: 0, transform: 'rotate(160deg)' }}>
            <svg width="70" height="88" viewBox="0 0 90 110" fill="none">
              <path d="M45 105C45 105 5 80 8 38C11-4 82 2 82 45C82 78 45 105 45 105Z" fill="rgba(30,168,81,0.12)" />
              <path d="M45 105C45 105 38 60 44 32C50 4 68 16 68 38" stroke="rgba(30,168,81,0.22)" strokeWidth="1.8" fill="none" />
            </svg>
          </div>

          {/* ── Welcome Row ── */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0, position: 'relative', zIndex: 1 }}>
            <div>
              <h1 style={{ fontSize: 22, fontWeight: 800, color: '#0F2D1F', letterSpacing: -0.8, lineHeight: 1.2 }}>
                {greeting}, {displayName} 👋
              </h1>
              <p style={{ fontSize: 13, color: '#7B9A8A', marginTop: 3 }}>
                {totalDocs === 0
                  ? 'Your legal workspace is ready — create your first document above.'
                  : <>Your legal workspace is active — <span style={{ color: '#C07010', fontWeight: 600 }}>{totalDocs} document{totalDocs !== 1 ? 's' : ''} in vault</span>.</>
                }
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
              {dateStr && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 7, background: '#FDFCF8', border: '1px solid rgba(26,92,53,0.1)', borderRadius: 100, padding: '8px 16px', boxShadow: '0 1px 4px rgba(26,92,53,0.05)' }}>
                  <span style={{ fontSize: 14 }}>📅</span>
                  <span style={{ fontSize: 13, fontWeight: 500, color: '#2C4A38' }}>{dateStr}</span>
                </div>
              )}
              <div style={{ position: 'relative', width: 40, height: 40, background: '#FDFCF8', border: '1px solid rgba(26,92,53,0.1)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 1px 4px rgba(26,92,53,0.05)', flexShrink: 0 }}>
                <span style={{ fontSize: 18 }}>🔔</span>
                {alerts.length > 0 && <div style={{ position: 'absolute', top: 8, right: 8, width: 7, height: 7, background: '#E84545', borderRadius: '50%', border: '1.5px solid #FDFCF8' }} />}
              </div>
              <a href="/" style={{ display: 'flex', alignItems: 'center', gap: 7, background: '#FDFCF8', border: '1.5px solid rgba(26,92,53,0.14)', borderRadius: 100, padding: '8px 16px', fontSize: 13, fontWeight: 600, color: '#2C4A38', textDecoration: 'none', boxShadow: '0 1px 4px rgba(26,92,53,0.05)', transition: 'all 0.18s' }}>
                ← Home
              </a>
            </div>
          </div>

          {/* ── Free Plan Banner ── */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, background: 'linear-gradient(135deg, rgba(30,168,81,0.07) 0%, rgba(192,112,16,0.06) 100%)', border: '1px solid rgba(30,168,81,0.18)', borderRadius: 16, padding: '14px 20px', flexShrink: 0, position: 'relative', zIndex: 1 }}>
            {/* Icon */}
            <div style={{ width: 40, height: 40, background: 'linear-gradient(135deg,#1A5C35,#1EA851)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 2px 10px rgba(26,92,53,0.22)' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M12 22C12 22 3 16 3 9C3 5.13 7.03 2 12 2C16.97 2 21 5.13 21 9C21 16 12 22 12 22Z" fill="rgba(255,255,255,0.9)" />
                <path d="M12 22C12 22 10 14 12 8C14 2 18 5 18 9" stroke="rgba(26,92,53,0.5)" strokeWidth="1.4" fill="none" strokeLinecap="round" />
              </svg>
            </div>
            {/* Text */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                <span style={{ fontSize: 14, fontWeight: 800, color: '#0F2D1F', letterSpacing: -0.3 }}>You&apos;re on the Free Plan</span>
                <span style={{ fontSize: 11, fontWeight: 700, color: limitReached ? '#C03030' : '#C07010', background: limitReached ? 'rgba(192,48,48,0.1)' : 'rgba(192,112,16,0.12)', border: `1px solid ${limitReached ? 'rgba(192,48,48,0.25)' : 'rgba(192,112,16,0.22)'}`, borderRadius: 100, padding: '2px 10px', letterSpacing: 0.2 }}>{monthlyDocCount}/2 used this month</span>
              </div>
              <p style={{ fontSize: 12.5, color: '#7B9A8A', margin: 0, lineHeight: 1.5 }}>
                {limitReached
                  ? 'You\'ve used all 2 documents this month. Your limit resets on the 1st. Upgrade to Pro for unlimited access.'
                  : docsRemaining === 1
                    ? '1 document remaining this month. Upgrade to Pro for unlimited documents, e-signatures, and priority processing.'
                    : '2 documents per month included. Upgrade anytime to unlock unlimited documents, e-signatures, and priority processing.'}
              </p>
            </div>
            {/* CTA */}
            <a href="#" style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'linear-gradient(135deg,#1A5C35,#1EA851)', color: '#fff', fontSize: 13, fontWeight: 700, padding: '9px 20px', borderRadius: 100, textDecoration: 'none', flexShrink: 0, boxShadow: '0 2px 12px rgba(26,92,53,0.28)', letterSpacing: 0.1, whiteSpace: 'nowrap' }}>
              Upgrade to Pro →
            </a>
          </div>

          {/* ── Hero Workspace Row ── */}
          <div className="hero-row" style={{ display: 'flex', gap: 18, flexShrink: 0, position: 'relative', zIndex: 1 }}>

            {/* Workspace card */}
            <div style={{ flex: 1, background: '#FDFCF8', borderRadius: 22, border: '1px solid rgba(26,92,53,0.09)', boxShadow: '0 4px 28px rgba(26,92,53,0.07),0 1px 3px rgba(26,92,53,0.04)', padding: 24, display: 'flex', flexDirection: 'column', gap: 15 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
                <div>
                  <h2 style={{ fontSize: 17, fontWeight: 800, color: '#0F2D1F', letterSpacing: -0.4, lineHeight: 1.2 }}>Create Legal Document</h2>
                  <p style={{ fontSize: 12, color: '#8BAA96', marginTop: 2, fontWeight: 400 }}>AI-powered · Ready in under 4 minutes</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 7, background: '#E0F5E8', border: '1px solid rgba(30,168,81,0.22)', borderRadius: 100, padding: '5px 13px' }}>
                  <div style={{ width: 7, height: 7, background: '#1EA851', borderRadius: '50%', animation: 'dotBlink 1.6s ease-in-out infinite' }} />
                  <span style={{ fontSize: 11.5, fontWeight: 700, color: '#1A5C35', letterSpacing: 0.1 }}>AI Ready</span>
                </div>
              </div>

              {/* Tabs */}
              <div style={{ display: 'flex', background: '#EAF5EE', borderRadius: 13, padding: 4, gap: 4, flexShrink: 0 }}>
                <div
                  className={`tab-btn ${tab === 'text' ? 'tab-active' : 'tab-inactive'}`}
                  onClick={() => setTab('text')}
                  style={{ flex: 1, textAlign: 'center', padding: '9px 14px', borderRadius: 10, fontSize: 13.5, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
                >
                  <span>✏️</span><span>By Text</span>
                </div>
                <div
                  className={`tab-btn ${tab === 'upload' ? 'tab-active' : 'tab-inactive'}`}
                  onClick={() => setTab('upload')}
                  style={{ flex: 1, textAlign: 'center', padding: '9px 14px', borderRadius: 10, fontSize: 13.5, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
                >
                  <span>📎</span><span>Upload PDF / DOCX</span>
                </div>
              </div>

              {/* ── Limit-reached overlay ── */}
              {limitReached && (
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, background: 'rgba(192,112,16,0.08)', border: '1.5px solid rgba(192,112,16,0.28)', borderRadius: 14, padding: '16px 18px' }}>
                  <div style={{ fontSize: 22, lineHeight: 1, flexShrink: 0, marginTop: 1 }}>⛔</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13.5, fontWeight: 800, color: '#7A3A00', marginBottom: 4 }}>Monthly limit reached — {monthlyDocCount}/{FREE_PLAN_LIMIT} documents used</div>
                    <div style={{ fontSize: 12.5, color: '#9A6020', lineHeight: 1.55, marginBottom: 12 }}>
                      You&apos;ve created {monthlyDocCount} document{monthlyDocCount !== 1 ? 's' : ''} this month. Your free plan resets on the 1st of next month. Upgrade to Pro for unlimited documents, priority AI processing, and e-signatures.
                    </div>
                    <a href="#" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'linear-gradient(135deg,#1A5C35,#1EA851)', color: '#fff', fontSize: 12.5, fontWeight: 700, padding: '8px 18px', borderRadius: 100, textDecoration: 'none', boxShadow: '0 2px 10px rgba(26,92,53,0.25)', letterSpacing: 0.1 }}>
                      Upgrade to Pro →
                    </a>
                  </div>
                </div>
              )}

              {/* ── 1-remaining warning ── */}
              {docsRemaining === 1 && !limitReached && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(192,112,16,0.07)', border: '1px solid rgba(192,112,16,0.22)', borderRadius: 10, padding: '10px 14px' }}>
                  <span style={{ fontSize: 15, flexShrink: 0 }}>⚠️</span>
                  <span style={{ fontSize: 12.5, color: '#9A6020', fontWeight: 600 }}>1 document remaining this month on your Free Plan.</span>
                </div>
              )}

              {/* By Text */}
              {tab === 'text' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 700, color: '#5A7A68', letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 7, display: 'block' }}>Document Type</label>
                    <select value={docType} onChange={e => setDocType(e.target.value)} style={{ width: '100%', padding: '11px 40px 11px 15px', background: '#F5FAF6', border: '1.5px solid rgba(26,92,53,0.13)', borderRadius: 12, fontFamily: 'inherit', fontSize: 14, color: '#0F2D1F', cursor: 'pointer', appearance: 'none', backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16' fill='none'%3E%3Cpath d='M3 6l5 5 5-5' stroke='%231A5C35' stroke-width='1.8' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 13px center', backgroundSize: 16 }}>
                      <option value="">Select document type…</option>
                      <option>NDA (Non-Disclosure Agreement)</option>
                      <option>Service Agreement</option>
                      <option>Employment Contract</option>
                      <option>Vendor / Supplier Agreement</option>
                      <option>Partnership Deed</option>
                      <option>Lease / Rental Agreement</option>
                      <option>Freelance Contract</option>
                      <option>MOU (Memorandum of Understanding)</option>
                      <option>Shareholder Agreement</option>
                      <option>Consulting Agreement</option>
                      <option>MSA (Master Service Agreement)</option>
                      <option>IP Assignment Agreement</option>
                      <option>Loan Agreement</option>
                      <option>Legal Notice</option>
                      <option>Privacy Policy</option>
                      <option>Terms of Service</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: 11, fontWeight: 700, color: '#5A7A68', letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 7, display: 'block' }}>Describe Your Document</label>
                    <textarea
                      value={docText}
                      onChange={e => { setDocText(e.target.value); if (e.target.value.trim()) setDocTextEmpty(false) }}
                      style={{ width: '100%', minHeight: 110, padding: '13px 15px', background: '#F5FAF6', border: docTextEmpty ? '1.5px solid #E84545' : '1.5px solid rgba(26,92,53,0.13)', borderRadius: 12, fontFamily: 'inherit', fontSize: 13.5, color: '#0F2D1F', resize: 'vertical', lineHeight: 1.65 }}
                      placeholder="e.g. Create a 2-year NDA between my startup HealthTech Pvt Ltd and an AI vendor in Bangalore. Include confidentiality terms, exclusions, and Indian jurisdiction clauses…"
                    />
                    {docTextEmpty && <div style={{ fontSize: 12, color: '#E84545', marginTop: 4, fontWeight: 500 }}>Please describe your document before generating.</div>}
                  </div>

                  <div>
                    <div style={{ fontSize: 11, fontWeight: 600, color: '#8BAA96', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.4 }}>Quick Start</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
                      {['📝 NDA for software project', '👔 Hire a developer', '🤝 Vendor agreement NET-30', '🏢 Partnership deed'].map(chip => (
                        <span key={chip} className="quick-chip" style={{ fontSize: 12, fontWeight: 500, color: '#1A5C35', background: '#E0F5E8', border: '1px solid rgba(26,92,53,0.14)', padding: '6px 13px', borderRadius: 100 }}>{chip}</span>
                      ))}
                    </div>
                  </div>

                  {genError && <div style={{ fontSize: 12.5, color: '#C03030', background: '#FFE8E8', border: '1px solid rgba(192,48,48,0.2)', borderRadius: 10, padding: '10px 14px', fontWeight: 500 }}>⚠️ {genError}</div>}
                  <button className="gen-btn" onClick={handleGenerate} disabled={generating || limitReached} style={{ width: '100%', padding: '15px 24px', background: 'linear-gradient(135deg,#1A5C35 0%,#1EA851 100%)', color: '#fff', fontFamily: 'inherit', fontSize: 15, fontWeight: 700, borderRadius: 14, letterSpacing: -0.1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, opacity: limitReached ? 0.45 : 1, cursor: limitReached ? 'not-allowed' : 'pointer' }}>
                    {generating ? (
                      <>
                        <span style={{ display: 'inline-block', width: 17, height: 17, border: '2.5px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.75s linear infinite' }} />
                        <span>Generating Document…</span>
                      </>
                    ) : (
                      <>
                        <span>✨</span>
                        <span>Generate with AI Agents</span>
                        <svg width="17" height="17" viewBox="0 0 17 17" fill="none"><path d="M2.5 8.5H14.5M10.5 4.5L14.5 8.5L10.5 12.5" stroke="rgba(255,255,255,0.8)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
                      </>
                    )}
                  </button>
                </div>
              )}

              {/* Upload */}
              {tab === 'upload' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, flex: 1 }}>
                  {/* Hidden file input */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf"
                    style={{ display: 'none' }}
                    onChange={e => {
                      const f = e.target.files?.[0] ?? null
                      setUploadFile(f)
                      setUploadError('')
                      e.target.value = ''
                    }}
                  />

                  {/* Drop zone */}
                  <div
                    className="upload-zone"
                    onClick={() => !uploadFile && fileInputRef.current?.click()}
                    onDragOver={e => { e.preventDefault(); setDragOver(true) }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={e => {
                      e.preventDefault(); setDragOver(false)
                      const f = e.dataTransfer.files[0]
                      if (f?.type === 'application/pdf') { setUploadFile(f); setUploadError('') }
                      else setUploadError('Only PDF files are supported.')
                    }}
                    style={{ border: `2px dashed ${dragOver ? '#1EA851' : 'rgba(26,92,53,0.22)'}`, borderRadius: 18, padding: uploadFile ? '20px 24px' : '36px 24px', textAlign: 'center', background: dragOver ? '#EDFAF2' : '#F5FAF6', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, cursor: uploadFile ? 'default' : 'pointer', transition: 'all 0.18s' }}
                  >
                    {!uploadFile ? (
                      <>
                        <div style={{ width: 64, height: 64, background: 'linear-gradient(135deg,#E0F5E8,#C8E8D0)', borderRadius: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, boxShadow: '0 4px 14px rgba(26,92,53,0.12)' }}>📎</div>
                        <div>
                          <div style={{ fontSize: 15, fontWeight: 700, color: '#0F2D1F', marginBottom: 4 }}>Drop your PDF here</div>
                          <div style={{ fontSize: 13, color: '#7B9A8A' }}>or click to browse</div>
                        </div>
                        <div
                          onClick={e => { e.stopPropagation(); fileInputRef.current?.click() }}
                          style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '9px 20px', background: '#E0F5E8', borderRadius: 100, fontSize: 13.5, fontWeight: 600, color: '#1A5C35', border: '1.5px solid rgba(30,168,81,0.25)', cursor: 'pointer' }}
                        >
                          Browse Files
                        </div>
                        <div style={{ fontSize: 11.5, color: '#A5BFB4' }}>PDF only · Max 10 MB</div>
                      </>
                    ) : (
                      /* File selected state */
                      <div style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, background: '#E8F7EE', border: '1.5px solid rgba(26,92,53,0.18)', borderRadius: 12, padding: '12px 16px' }}>
                        <span style={{ fontSize: 28 }}>📄</span>
                        <div style={{ flex: 1, minWidth: 0, textAlign: 'left' }}>
                          <div style={{ fontSize: 13.5, fontWeight: 700, color: '#0F2D1F', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{uploadFile.name}</div>
                          <div style={{ fontSize: 12, color: '#6A9A7A', marginTop: 2 }}>{(uploadFile.size / 1024).toFixed(0)} KB · PDF</div>
                        </div>
                        <button
                          onClick={e => { e.stopPropagation(); setUploadFile(null); setUploadError('') }}
                          style={{ width: 28, height: 28, borderRadius: '50%', border: '1px solid rgba(26,92,53,0.2)', background: '#fff', color: '#5A7A68', fontSize: 16, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
                        >×</button>
                      </div>
                    )}
                  </div>

                  {/* Feature tags */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
                    {['✅ Instant AI Review', '🛡️ Risk Detection', '✏️ Smart Redlining'].map(tag => (
                      <span key={tag} style={{ fontSize: 11.5, fontWeight: 600, color: '#1A5C35', background: '#E0F5E8', padding: '4px 12px', borderRadius: 100 }}>{tag}</span>
                    ))}
                  </div>

                  {/* Error */}
                  {uploadError && (
                    <div style={{ fontSize: 12.5, color: '#C03030', background: '#FFE8E8', border: '1px solid rgba(192,48,48,0.2)', borderRadius: 10, padding: '10px 14px', fontWeight: 500 }}>⚠️ {uploadError}</div>
                  )}

                  {/* Upload button — only when file selected */}
                  {uploadFile && (
                    <button
                      className="gen-btn"
                      onClick={handleUpload}
                      disabled={uploading || limitReached}
                      style={{ width: '100%', padding: '15px 24px', background: (uploading || limitReached) ? 'rgba(26,92,53,0.5)' : 'linear-gradient(135deg,#1A5C35 0%,#1EA851 100%)', color: '#fff', fontFamily: 'inherit', fontSize: 15, fontWeight: 700, borderRadius: 14, letterSpacing: -0.1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, cursor: (uploading || limitReached) ? 'not-allowed' : 'pointer', border: 'none', opacity: limitReached ? 0.45 : 1 }}
                    >
                      {uploading ? (
                        <>
                          <span style={{ display: 'inline-block', width: 17, height: 17, border: '2.5px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.75s linear infinite' }} />
                          <span>Uploading…</span>
                        </>
                      ) : (
                        <>
                          <span>📤</span>
                          <span>Upload & Analyze with AI</span>
                          <svg width="17" height="17" viewBox="0 0 17 17" fill="none"><path d="M2.5 8.5H14.5M10.5 4.5L14.5 8.5L10.5 12.5" stroke="rgba(255,255,255,0.8)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
                        </>
                      )}
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Agent Panel */}
            <div className="agent-panel" style={{ width: 410, minWidth: 410, background: 'linear-gradient(155deg,#F2FEF4 0%,#E8F7EE 40%,#FEF9EF 100%)', borderRadius: 22, border: '1px solid rgba(26,92,53,0.09)', boxShadow: '0 4px 28px rgba(26,92,53,0.07),0 1px 3px rgba(26,92,53,0.04)', overflow: 'hidden', display: 'flex', flexDirection: 'column', position: 'relative' }}>
              <div style={{ position: 'absolute', top: -10, right: -10, opacity: 0.55, pointerEvents: 'none' }}>
                <svg width="80" height="96" viewBox="0 0 90 110" fill="none"><path d="M45 105C45 105 5 80 8 38C11-4 82 2 82 45C82 78 45 105 45 105Z" fill="rgba(30,168,81,0.18)" /><path d="M45 105C45 105 38 60 44 32C50 4 68 16 68 38" stroke="rgba(30,168,81,0.3)" strokeWidth="2" fill="none" /></svg>
              </div>
              <div style={{ padding: '20px 22px 10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0, position: 'relative', zIndex: 2 }}>
                <div>
                  <h3 style={{ fontSize: 15.5, fontWeight: 800, color: '#0F2D1F', letterSpacing: -0.3 }}>Vaakya AI Agents</h3>
                  <p style={{ fontSize: 11.5, color: '#8BAA96', marginTop: 2 }}>8 specialized legal agents working in sequence</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'linear-gradient(135deg,#E0F5E8,#C8E8D0)', border: '1px solid rgba(30,168,81,0.28)', borderRadius: 100, padding: '5px 12px', boxShadow: '0 2px 8px rgba(26,92,53,0.1)' }}>
                  <div style={{ width: 6, height: 6, background: '#1EA851', borderRadius: '50%', animation: 'dotBlink 1.6s ease-in-out infinite' }} />
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#1A5C35' }}>LIVE</span>
                </div>
              </div>
              <div style={{ flex: 1, padding: '0 10px 12px', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', zIndex: 2 }}>
                <img src={AGENTS_URL} alt="Vaakya 8 AI Legal Agents" style={{ width: '100%', height: 'auto', display: 'block', borderRadius: 14, boxShadow: '0 4px 20px rgba(26,92,53,0.08)' }} />
              </div>
            </div>
          </div>

          {/* ── KPI Cards ── */}
          <div className="kpi-row" style={{ display: 'flex', gap: 14, flexShrink: 0, position: 'relative', zIndex: 1 }}>
            {[
              {
                icon: '📄', iconBg: 'linear-gradient(135deg,#D0EDD8,#B8E0C4)', iconShadow: 'rgba(26,92,53,0.1)',
                badge: totalDocs > 0 ? `↑ ${totalDocs} total` : 'None yet',
                badgeBg: '#E0F5E8', badgeColor: '#1A5C35',
                value: String(totalDocs), label: 'Documents Created',
              },
              {
                icon: '💰', iconBg: 'linear-gradient(135deg,#FFF0C0,#FFE090)', iconShadow: 'rgba(180,130,0,0.12)',
                badge: 'vs. lawyers', badgeBg: '#FFF8D8', badgeColor: '#B8900A',
                value: savings, label: 'Total Savings',
              },
              {
                icon: '📅', iconBg: 'linear-gradient(135deg,#FFE8CC,#FFD0A0)', iconShadow: 'rgba(180,100,0,0.1)',
                badge: 'Coming soon', badgeBg: '#FFF0D8', badgeColor: '#B07010',
                value: '0', label: 'Active Obligations',
              },
              {
                icon: '🛡️', iconBg: 'linear-gradient(135deg,#FFD8D8,#FFB8B8)', iconShadow: 'rgba(180,0,0,0.09)',
                badge: riskCount > 0 ? `${riskCount} flagged` : 'All clear',
                badgeBg: riskCount > 0 ? '#FFE8E8' : '#E0F5E8',
                badgeColor: riskCount > 0 ? '#C03030' : '#1A5C35',
                value: String(riskCount), label: 'Risk Alerts',
              },
            ].map(card => (
              <div key={card.label} className="kpi-card" style={{ flex: 1, background: '#FDFCF8', borderRadius: 18, border: '1px solid rgba(26,92,53,0.08)', boxShadow: '0 2px 14px rgba(26,92,53,0.06)', padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 13 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ width: 44, height: 44, background: card.iconBg, borderRadius: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, boxShadow: `0 2px 8px ${card.iconShadow}` }}>{card.icon}</div>
                  <div style={{ background: card.badgeBg, color: card.badgeColor, fontSize: 10.5, fontWeight: 700, padding: '3px 9px', borderRadius: 100 }}>{card.badge}</div>
                </div>
                <div>
                  <div style={{ fontSize: 30, fontWeight: 800, color: '#0F2D1F', letterSpacing: -1.4, lineHeight: 1.1 }}>{card.value}</div>
                  <div style={{ fontSize: 12, fontWeight: 500, color: '#7B9A8A', marginTop: 3 }}>{card.label}</div>
                </div>
              </div>
            ))}
          </div>

          {/* ── Activity Row ── */}
          <div className="activity-row" style={{ display: 'flex', gap: 18, paddingBottom: 28, position: 'relative', zIndex: 1 }}>

            {/* Recent Documents */}
            <div style={{ flex: 1, background: '#FDFCF8', borderRadius: 20, border: '1px solid rgba(26,92,53,0.08)', boxShadow: '0 2px 14px rgba(26,92,53,0.05)', overflow: 'hidden' }}>
              <div style={{ padding: '18px 22px 13px', borderBottom: '1px solid rgba(26,92,53,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <h3 style={{ fontSize: 15, fontWeight: 800, color: '#0F2D1F', letterSpacing: -0.3 }}>Recent Documents</h3>
                <span style={{ fontSize: 12.5, fontWeight: 600, color: '#1A5C35', cursor: 'pointer' }}>View All →</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.4fr 1fr 1.3fr 70px', padding: '8px 22px', background: '#F5FAF6', borderBottom: '1px solid rgba(26,92,53,0.06)' }}>
                {['Document', 'Party', 'Date', 'Status', 'Action'].map(h => (
                  <span key={h} style={{ fontSize: 10.5, fontWeight: 700, color: '#7B9A8A', textTransform: 'uppercase', letterSpacing: 0.5 }}>{h}</span>
                ))}
              </div>

              {recentDocs.length === 0 ? (
                <div style={{ padding: '32px 22px', textAlign: 'center' }}>
                  <div style={{ fontSize: 32, marginBottom: 10 }}>📂</div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#0F2D1F', marginBottom: 4 }}>No documents yet</div>
                  <div style={{ fontSize: 12.5, color: '#7B9A8A' }}>Create your first document using the workspace above.</div>
                </div>
              ) : recentDocs.map((doc, i) => {
                const badge = getStatusBadge(doc.status)
                const party = doc.parties?.[0]?.name ?? '—'
                return (
                  <div key={doc.id} className="doc-row" style={{ display: 'grid', gridTemplateColumns: '2fr 1.4fr 1fr 1.3fr 70px', padding: '12px 22px', alignItems: 'center', borderBottom: i < recentDocs.length - 1 ? '1px solid rgba(26,92,53,0.05)' : 'none' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 32, height: 32, background: '#E0F5E8', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, flexShrink: 0 }}>{getDocIcon(doc.document_type)}</div>
                      <span style={{ fontSize: 13.5, fontWeight: 600, color: '#0F2D1F', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{doc.document_type}</span>
                    </div>
                    <span style={{ fontSize: 12.5, color: '#4A6858', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{party}</span>
                    <span style={{ fontSize: 12, color: '#7B9A8A' }}>{formatDocDate(doc.created_at)}</span>
                    <div><span style={{ fontSize: 11, fontWeight: 700, color: badge.color, background: badge.bg, padding: '3px 10px', borderRadius: 100 }}>{badge.label}</span></div>
                    <a href={(doc.status === 'completed' || doc.status === 'pending_signature') ? `/dashboard/vault/${doc.id}` : `/dashboard/documents/${doc.id}`} style={{ fontSize: 12.5, fontWeight: 600, color: '#1A5C35', cursor: 'pointer', textDecoration: 'none' }}>View</a>
                  </div>
                )
              })}
            </div>

            {/* Legal Alerts */}
            <div className="alerts-col" style={{ width: 300, minWidth: 300, background: '#FDFCF8', borderRadius: 20, border: '1px solid rgba(26,92,53,0.08)', boxShadow: '0 2px 14px rgba(26,92,53,0.05)', overflow: 'hidden', flexShrink: 0 }}>
              <div style={{ padding: '18px 20px 13px', borderBottom: '1px solid rgba(26,92,53,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <h3 style={{ fontSize: 15, fontWeight: 800, color: '#0F2D1F', letterSpacing: -0.3 }}>Legal Alerts</h3>
                {alerts.length > 0 && (
                  <div style={{ width: 22, height: 22, background: '#FFE0D0', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11.5, fontWeight: 800, color: '#C04010' }}>{alerts.length}</div>
                )}
              </div>
              <div style={{ padding: '10px 14px', display: 'flex', flexDirection: 'column', gap: 3 }}>
                {alerts.length === 0 ? (
                  <div style={{ padding: '32px 10px', textAlign: 'center' }}>
                    <div style={{ fontSize: 32, marginBottom: 10 }}>🟢</div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#0F2D1F', marginBottom: 4 }}>No alerts</div>
                    <div style={{ fontSize: 12, color: '#7B9A8A' }}>Everything looks good. Alerts will appear here as your documents are processed.</div>
                  </div>
                ) : alerts.map((alert, i) => (
                  <div key={i} className="alert-item" style={{ display: 'flex', gap: 11, padding: '11px 10px', alignItems: 'flex-start' }}>
                    <div style={{ width: 36, height: 36, background: alert.iconBg, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>{alert.icon}</div>
                    <div>
                      <div style={{ fontSize: 12.5, fontWeight: 700, color: '#0F2D1F', lineHeight: 1.35 }}>{alert.title}</div>
                      <div style={{ fontSize: 11.5, color: '#7B9A8A', marginTop: 2, lineHeight: 1.4 }}>{alert.sub}</div>
                      <div style={{ fontSize: 11, fontWeight: 700, color: alert.levelColor, marginTop: 5 }}>{alert.level}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </main>
      </div>
    </>
  )
}
