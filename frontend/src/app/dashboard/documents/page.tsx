'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/client'

type Doc = {
  id: string
  document_type: string
  parties: Array<{ name: string; role?: string }>
  created_at: string
  status: string
  final_pdf_url: string
}

function getDocIcon(type: string): string {
  const t = type.toLowerCase()
  if (t.includes('nda') || t.includes('non-disclosure')) return '📋'
  if (t.includes('employment')) return '👔'
  if (t.includes('vendor') || t.includes('supplier')) return '🤝'
  if (t.includes('partnership')) return '🏢'
  if (t.includes('lease') || t.includes('rental')) return '🏠'
  if (t.includes('freelance')) return '💼'
  if (t.includes('service')) return '⚙️'
  if (t.includes('consulting')) return '🧠'
  if (t.includes('msa') || t.includes('master service')) return '🗂️'
  if (t.includes('ip assignment') || t.includes('intellectual property')) return '💡'
  if (t.includes('loan')) return '💰'
  if (t.includes('legal notice')) return '⚖️'
  if (t.includes('privacy')) return '🔒'
  if (t.includes('terms')) return '📜'
  if (t.includes('dispute')) return '🏛️'
  return '📄'
}

function getStatusBadge(status: string): { label: string; color: string; bg: string } {
  switch (status) {
    case 'completed':
    case 'pending_signature':
      return { label: '✅ Completed', color: '#0A7A5A', bg: 'rgba(14,168,130,.12)' }
    case 'reviewing':
    case 'hitl_pending':
    case 'pending_review':
    case 'awaiting_approval':
      return { label: '🔍 Reviewing', color: '#B07010', bg: 'rgba(245,159,11,.12)' }
    case 'risk_flagged':
      return { label: '⚠️ Risks', color: '#C03030', bg: 'rgba(244,63,110,.1)' }
    default:
      return { label: '⏳ Processing', color: '#EA580C', bg: 'rgba(234,88,12,.1)' }
  }
}

function formatDate(dateStr: string): string {
  if (!dateStr) return '—'
  const date = new Date(dateStr)
  const now = new Date()
  const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
  if (diffDays === 0) return `Today, ${date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}`
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays} days ago`
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

const HERO_IMG = 'https://res.cloudinary.com/dkqbzwicr/image/upload/v1782485019/documentimage_ntcop7.png'

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,400;0,500;0,600;0,700;0,800;1,700&family=Dancing+Script:wght@700&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html, body { font-family: 'Plus Jakarta Sans', sans-serif; background: #FFF8F0; color: #2D1200; overflow-x: hidden; }
  @keyframes floatA  { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-14px)} }
  @keyframes floatB  { 0%,100%{transform:translateY(-6px) rotate(-2deg)} 50%{transform:translateY(10px) rotate(2deg)} }
  @keyframes pulse   { 0%,100%{opacity:.7;transform:scale(1)} 50%{opacity:1;transform:scale(1.07)} }
  @keyframes fadeUp  { from{opacity:0;transform:translateY(22px)} to{opacity:1;transform:translateY(0)} }
  @keyframes shimmer { 0%{background-position:-300% center} 100%{background-position:300% center} }
  .hov { transition:transform .2s,box-shadow .2s; cursor:pointer; }
  .hov:hover { transform:translateY(-4px); }
  .hov-sm { transition:transform .18s,box-shadow .18s; cursor:pointer; }
  .hov-sm:hover { transform:translateY(-2px); }
  .chip { transition:all .18s; cursor:pointer; border:none; font-family:'Plus Jakarta Sans',sans-serif; }
  .chip.active { background:linear-gradient(135deg,#F59F0B,#F0543C) !important; color:#FFF8F0 !important; box-shadow:0 3px 14px rgba(245,159,11,.3) !important; }
  .chip:hover { transform:scale(1.04); }
  .gen-btn { border:none; cursor:pointer; font-family:'Plus Jakarta Sans',sans-serif; transition:transform .2s,box-shadow .2s; }
  .gen-btn:hover { transform:translateY(-2px); box-shadow:0 10px 28px rgba(240,84,60,.4) !important; }
  .lib-row { display:flex; align-items:center; justify-content:space-between; padding:10px 0; border-bottom:1px solid rgba(245,159,11,.12); transition:background .14s; cursor:pointer; }
  .lib-row:last-child { border-bottom:none; }
  .lib-row:hover { background:rgba(245,159,11,.06); padding-left:4px; border-radius:8px; }
  .tmpl-card { transition:transform .2s,box-shadow .2s; cursor:pointer; }
  .tmpl-card:hover { transform:translateY(-3px); }
  .biz-card { transition:transform .2s,box-shadow .2s; cursor:pointer; }
  .biz-card:hover { transform:translateY(-4px); }
  .feat-doc-card { transition:transform .2s,box-shadow .2s; cursor:pointer; border:1.5px solid transparent; }
  .feat-doc-card:hover { transform:translateY(-4px); border-color:rgba(245,159,11,.3) !important; }
  .feat-doc-card.selected { border-color:rgba(240,84,60,.4) !important; box-shadow:0 8px 28px rgba(240,84,60,.12) !important; }
  .doc-row { transition:transform .18s,box-shadow .18s; cursor:pointer; }
  .doc-row:hover { transform:translateY(-2px); box-shadow:0 8px 28px rgba(245,159,11,.12) !important; }
  .back-pill { transition:all .18s; text-decoration:none; }
  .back-pill:hover { background:rgba(240,84,60,.08) !important; }
  @media(max-width:1100px){
    .hero-flex{flex-direction:column !important;}
    .feat-grid{grid-template-columns:repeat(2,1fr) !important;}
    .biz-grid{grid-template-columns:repeat(3,1fr) !important;}
  }
  @media(max-width:700px){
    .feat-grid{grid-template-columns:1fr !important;}
    .biz-grid{grid-template-columns:1fr !important;}
    .lib-grid{grid-template-columns:1fr !important;}
  }
`

const CAT_FILTERS = ['All', 'Contracts', 'HR', 'Business', 'Legal', 'Compliance']

function matchesCategory(type: string, cat: string): boolean {
  const t = type.toLowerCase()
  if (cat === 'All') return true
  if (cat === 'Contracts') return t.includes('nda') || t.includes('vendor') || t.includes('supplier') || t.includes('service') || t.includes('msa') || t.includes('master service') || t.includes('non-disclosure')
  if (cat === 'HR') return t.includes('employment') || t.includes('freelance') || t.includes('contractor') || t.includes('ip assignment') || t.includes('intellectual property')
  if (cat === 'Business') return t.includes('partnership') || t.includes('loan') || t.includes('lease') || t.includes('rental')
  if (cat === 'Legal') return t.includes('legal notice') || t.includes('privacy') || t.includes('terms')
  if (cat === 'Compliance') return t.includes('privacy') || t.includes('terms') || t.includes('compliance')
  return true
}

const FEAT_DOCS = [
  {
    title: 'NDA / Confidentiality Agreement',
    desc: 'Protect your ideas, data, and business information.',
    time: '1–2 min',
    gradient: ['#FFF0CC', '#F59F0B'],
    badgeBg: 'linear-gradient(135deg,rgba(245,159,11,.18),rgba(240,84,60,.12))',
    badgeBorder: 'rgba(245,159,11,.3)',
    badgeColor: '#D97706',
    pulseBg: '#F59F0B',
    btnGrad: 'linear-gradient(135deg,#F59F0B,#EA580C)',
    btnShadow: 'rgba(245,159,11,.35)',
    cardBg: 'rgba(255,252,244,.92)',
    cardShadow: 'rgba(245,159,11,.08)',
    glowBg: 'radial-gradient(circle,rgba(245,159,11,.18) 0%,transparent 70%)',
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="#FFF8F0" strokeWidth="2" strokeLinecap="round"/>
        <path d="M9 12l2 2 4-4" stroke="#FFF8F0" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    features: ['AI Drafting', 'Risk Detection', 'E-sign Compatible', 'Obligation Tracking', 'Secure Vault'],
    avgTime: '1 min 20 sec',
  },
  {
    title: 'Vendor / Supplier Agreement',
    desc: 'Manage vendor relationships with clear terms.',
    time: '2–3 min',
    gradient: ['#FFE4D8', '#F0543C'],
    badgeBg: 'linear-gradient(135deg,rgba(240,84,60,.16),rgba(244,63,110,.1))',
    badgeBorder: 'rgba(240,84,60,.28)',
    badgeColor: '#D03020',
    pulseBg: '#F0543C',
    btnGrad: 'linear-gradient(135deg,#F0543C,#F43F6E)',
    btnShadow: 'rgba(240,84,60,.38)',
    cardBg: 'rgba(255,248,238,.95)',
    cardShadow: 'rgba(240,84,60,.12)',
    glowBg: 'radial-gradient(circle,rgba(240,84,60,.16) 0%,transparent 70%)',
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" stroke="#FFF8F0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="9" cy="7" r="4" stroke="#FFF8F0" strokeWidth="2"/>
        <path d="M23 21v-2a4 4 0 00-3-3.87" stroke="#FFF8F0" strokeWidth="2"/>
        <path d="M16 3.13a4 4 0 010 7.75" stroke="#FFF8F0" strokeWidth="2"/>
      </svg>
    ),
    features: ['AI Drafting', 'Risk Detection', 'Negotiation Ready', 'E-sign Compatible', 'Obligation Tracking'],
    avgTime: '1 min 48 sec',
  },
  {
    title: 'Employment Contract',
    desc: 'Comprehensive employment agreements made simple.',
    time: '2–3 min',
    gradient: ['#C4F8E8', '#0EA882'],
    badgeBg: 'linear-gradient(135deg,rgba(14,168,130,.16),rgba(5,150,105,.1))',
    badgeBorder: 'rgba(14,168,130,.28)',
    badgeColor: '#0A7A5A',
    pulseBg: '#0EA882',
    btnGrad: 'linear-gradient(135deg,#0EA882,#059669)',
    btnShadow: 'rgba(14,168,130,.38)',
    cardBg: 'rgba(244,255,250,.92)',
    cardShadow: 'rgba(14,168,130,.07)',
    glowBg: 'radial-gradient(circle,rgba(14,168,130,.16) 0%,transparent 70%)',
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" stroke="#FFF8F0" strokeWidth="2" strokeLinecap="round"/>
        <circle cx="12" cy="7" r="4" stroke="#FFF8F0" strokeWidth="2"/>
      </svg>
    ),
    features: ['AI Drafting', 'Risk Detection', 'E-sign Compatible', 'Obligation Tracking', 'Secure Vault'],
    avgTime: '2 min 05 sec',
  },
  {
    title: 'Service Agreement / SOW',
    desc: 'Define scope, deliverables & payment terms clearly.',
    time: '2–3 min',
    gradient: ['#FFE4C8', '#EA580C'],
    badgeBg: 'linear-gradient(135deg,rgba(234,88,12,.16),rgba(245,159,11,.1))',
    badgeBorder: 'rgba(234,88,12,.28)',
    badgeColor: '#B04008',
    pulseBg: '#EA580C',
    btnGrad: 'linear-gradient(135deg,#EA580C,#D97706)',
    btnShadow: 'rgba(234,88,12,.38)',
    cardBg: 'rgba(255,248,240,.92)',
    cardShadow: 'rgba(234,88,12,.07)',
    glowBg: 'radial-gradient(circle,rgba(234,88,12,.16) 0%,transparent 70%)',
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" stroke="#FFF8F0" strokeWidth="2" strokeLinecap="round"/>
        <polyline points="14,2 14,8 20,8" stroke="#FFF8F0" strokeWidth="2" strokeLinecap="round"/>
        <line x1="16" y1="13" x2="8" y2="13" stroke="#FFF8F0" strokeWidth="2" strokeLinecap="round"/>
        <line x1="16" y1="17" x2="8" y2="17" stroke="#FFF8F0" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    ),
    features: ['AI Drafting', 'Risk Detection', 'Negotiation Ready', 'E-sign Compatible', 'Obligation Tracking'],
    avgTime: '1 min 55 sec',
  },
]

const CHECK_ICON = (
  <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
    <path d="M1.5 4l1.5 1.5 3.5-3.5" stroke="#FFF8F0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

const CHEVRON_RIGHT = (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <path d="M5 3L9 7L5 11" stroke="#C07040" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

export default function DocumentsPage() {
  const router = useRouter()
  const [docs, setDocs] = useState<Doc[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [catFilter, setCatFilter] = useState('All')
  const [selectedFeat, setSelectedFeat] = useState(1)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }
      await supabase.auth.refreshSession()
      const { data: rows } = await supabase
        .from('vault_documents')
        .select('id, document_type, parties, updated_at, esign_status, final_pdf_url')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false })
        .limit(50)
      setDocs((rows ?? []).map(row => ({
        id: row.id as string,
        document_type: (row.document_type as string) || 'Document',
        parties: (row.parties as Array<{ name: string; role?: string }>) || [],
        created_at: (row.updated_at as string) || '',
        status: (row.esign_status as string) || 'processing',
        final_pdf_url: (row.final_pdf_url as string) || '',
      })))
      setLoading(false)
    }
    load()
  }, [router])

  const filtered = docs.filter(d => {
    const matchSearch = !search ||
      d.document_type.toLowerCase().includes(search.toLowerCase()) ||
      d.parties.some(p => p.name.toLowerCase().includes(search.toLowerCase()))
    return matchSearch && matchesCategory(d.document_type, catFilter)
  })

  const feat = FEAT_DOCS[selectedFeat]

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(155deg,#FFF8F0 0%,#FFFAF5 25%,#FFF5EE 55%,#FFF8F5 80%,#FFFAF0 100%)', fontFamily: "'Plus Jakarta Sans', sans-serif", overflowX: 'hidden', position: 'relative' }}>
      <style dangerouslySetInnerHTML={{ __html: STYLES }} />

      {/* ── AMBIENT BG ── */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', overflow: 'hidden', zIndex: 0 }}>
        <div style={{ position: 'absolute', top: -180, right: -120, width: 700, height: 700, background: 'radial-gradient(circle,rgba(255,195,130,.28) 0%,transparent 65%)', animation: 'floatA 12s ease-in-out infinite' }} />
        <div style={{ position: 'absolute', top: '30%', left: -160, width: 620, height: 620, background: 'radial-gradient(circle,rgba(255,150,165,.2) 0%,transparent 62%)', animation: 'floatA 15s ease-in-out infinite reverse' }} />
        <div style={{ position: 'absolute', bottom: -80, left: '28%', width: 680, height: 540, background: 'radial-gradient(circle,rgba(255,218,100,.16) 0%,transparent 66%)' }} />
        <div style={{ position: 'absolute', top: '8%', right: '14%', width: 200, height: 180, backgroundImage: 'radial-gradient(circle,rgba(240,84,60,.14) 1.4px,transparent 1.4px)', backgroundSize: '20px 20px' }} />
        <div style={{ position: 'absolute', top: '45%', left: '5%', width: 155, height: 140, backgroundImage: 'radial-gradient(circle,rgba(245,159,11,.18) 1.2px,transparent 1.2px)', backgroundSize: '18px 18px' }} />
        <div style={{ position: 'absolute', bottom: '20%', right: '6%', width: 135, height: 115, backgroundImage: 'radial-gradient(circle,rgba(244,63,110,.14) 1.2px,transparent 1.2px)', backgroundSize: '16px 16px' }} />
      </div>

      {/* ── HEADER ── */}
      <header style={{ position: 'sticky', top: 0, zIndex: 100, backdropFilter: 'blur(22px)', WebkitBackdropFilter: 'blur(22px)', background: 'rgba(255,248,240,.9)', borderBottom: '1px solid rgba(240,84,60,.1)' }}>
        <div style={{ maxWidth: 1240, margin: '0 auto', padding: '0 48px', height: 66, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 38, height: 38, background: 'linear-gradient(135deg,#FFE8CC,#FFCFA0)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 10px rgba(245,159,11,.25)' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L4 6v6c0 5.5 3.5 10.7 8 12 4.5-1.3 8-6.5 8-12V6L12 2z" fill="#F59F0B"/>
                <path d="M9 12l2 2 4-4" stroke="#FFF8F0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div>
              <div style={{ fontSize: 18, fontWeight: 800, color: '#2D1200', letterSpacing: -.5, lineHeight: 1.1 }}>VAAKYA</div>
              <div style={{ fontSize: 10, fontWeight: 500, color: '#9A6040', letterSpacing: .2 }}>AI Legal for Indian SMBs</div>
            </div>
          </div>
          <a href="/dashboard" className="back-pill" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13.5, fontWeight: 600, color: '#F0543C', padding: '8px 18px', border: '1.5px solid rgba(240,84,60,.25)', borderRadius: 100, background: 'rgba(240,84,60,.04)' }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M9 2L4 7L9 12" stroke="#F0543C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            Back to Dashboard
          </a>
        </div>
      </header>

      {/* ── HERO ── */}
      <section style={{ position: 'relative', zIndex: 1, maxWidth: 1240, margin: '0 auto', padding: '60px 48px 48px' }}>
        <div className="hero-flex" style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
          <div style={{ flex: 1, minWidth: 0, animation: 'fadeUp .7s ease both' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'linear-gradient(135deg,rgba(245,159,11,.12),rgba(240,84,60,.09))', border: '1.5px solid rgba(240,84,60,.24)', borderRadius: 100, padding: '6px 18px', marginBottom: 24 }}>
              <span style={{ fontSize: 10, color: '#F59F0B', fontWeight: 700 }}>✦</span>
              <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: .7, background: 'linear-gradient(135deg,#F59F0B,#F0543C)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>AI-POWERED LEGAL DOCUMENTS</span>
              <span style={{ fontSize: 10, color: '#F59F0B', fontWeight: 700 }}>✦</span>
            </div>
            <h1 style={{ fontSize: 'clamp(34px,4.8vw,62px)', fontWeight: 800, lineHeight: 1.08, letterSpacing: -2.5, color: '#2D1200', marginBottom: 18 }}>
              Legal Documents for<br/>
              Every{' '}
              <span style={{ fontFamily: "'Dancing Script', cursive", fontWeight: 700, fontSize: 'clamp(38px,5.2vw,68px)', letterSpacing: 0, background: 'linear-gradient(135deg,#F59F0B 0%,#F0543C 55%,#F43F6E 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Business</span> Need
            </h1>
            <p style={{ fontSize: 16.5, color: '#8A5030', lineHeight: 1.7, maxWidth: 480, marginBottom: 32, fontWeight: 400 }}>
              Create, review, negotiate, and manage business agreements in minutes with AI-powered legal automation.
            </p>
            <div style={{ display: 'flex', gap: 13, flexWrap: 'wrap' }}>
              <div className="hov-sm" style={{ background: 'rgba(255,252,244,.92)', backdropFilter: 'blur(18px)', border: '1.5px solid rgba(245,159,11,.24)', borderRadius: 18, padding: '13px 17px', display: 'flex', alignItems: 'center', gap: 12, boxShadow: '0 3px 16px rgba(245,159,11,.1)' }}>
                <div style={{ width: 42, height: 42, borderRadius: '50%', background: 'linear-gradient(135deg,#FFF0CC,#F59F0B)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 3px 12px rgba(245,159,11,.38)' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="#FFF8F0" strokeWidth="2"/><polyline points="12,6 12,12 16,14" stroke="#FFF8F0" strokeWidth="2" strokeLinecap="round"/></svg>
                </div>
                <div><div style={{ fontSize: 19, fontWeight: 800, color: '#D97706', letterSpacing: -.6, lineHeight: 1.1 }}>2 Min</div><div style={{ fontSize: 10.5, fontWeight: 500, color: '#9A6040', lineHeight: 1.35 }}>Average Draft<br/>Generation</div></div>
              </div>
              <div className="hov-sm" style={{ background: 'rgba(255,244,248,.92)', backdropFilter: 'blur(18px)', border: '1.5px solid rgba(244,63,110,.2)', borderRadius: 18, padding: '13px 17px', display: 'flex', alignItems: 'center', gap: 12, boxShadow: '0 3px 16px rgba(244,63,110,.08)' }}>
                <div style={{ width: 42, height: 42, borderRadius: '50%', background: 'linear-gradient(135deg,#FFD0E4,#F43F6E)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 3px 12px rgba(244,63,110,.38)' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="#FFF8F0" strokeWidth="2" strokeLinecap="round"/><path d="M9 12l2 2 4-4" stroke="#FFF8F0" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </div>
                <div><div style={{ fontSize: 19, fontWeight: 800, color: '#E11D48', letterSpacing: -.6, lineHeight: 1.1 }}>94%</div><div style={{ fontSize: 10.5, fontWeight: 500, color: '#9A6040', lineHeight: 1.35 }}>Risk Detection<br/>Accuracy</div></div>
              </div>
              <div className="hov-sm" style={{ background: 'rgba(244,255,250,.92)', backdropFilter: 'blur(18px)', border: '1.5px solid rgba(14,168,130,.18)', borderRadius: 18, padding: '13px 17px', display: 'flex', alignItems: 'center', gap: 12, boxShadow: '0 3px 16px rgba(14,168,130,.08)' }}>
                <div style={{ width: 42, height: 42, borderRadius: '50%', background: 'linear-gradient(135deg,#C4F8E8,#0EA882)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 3px 12px rgba(14,168,130,.38)' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M4 6h16M4 10h16M4 14h10" stroke="#FFF8F0" strokeWidth="2.2" strokeLinecap="round"/></svg>
                </div>
                <div><div style={{ fontSize: 19, fontWeight: 800, color: '#0EA882', letterSpacing: -.6, lineHeight: 1.1 }}>50+</div><div style={{ fontSize: 10.5, fontWeight: 500, color: '#9A6040', lineHeight: 1.35 }}>Pre-built Legal<br/>Clause Library</div></div>
              </div>
              <div className="hov-sm" style={{ background: 'rgba(255,248,240,.92)', backdropFilter: 'blur(18px)', border: '1.5px solid rgba(234,88,12,.18)', borderRadius: 18, padding: '13px 17px', display: 'flex', alignItems: 'center', gap: 12, boxShadow: '0 3px 16px rgba(234,88,12,.08)' }}>
                <div style={{ width: 42, height: 42, borderRadius: '50%', background: 'linear-gradient(135deg,#FFE4C8,#EA580C)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 3px 12px rgba(234,88,12,.38)' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" stroke="#FFF8F0" strokeWidth="2"/><circle cx="9" cy="7" r="4" stroke="#FFF8F0" strokeWidth="2"/><path d="M23 21v-2a4 4 0 00-3-3.87" stroke="#FFF8F0" strokeWidth="2"/><path d="M16 3.13a4 4 0 010 7.75" stroke="#FFF8F0" strokeWidth="2"/></svg>
                </div>
                <div><div style={{ fontSize: 19, fontWeight: 800, color: '#EA580C', letterSpacing: -.6, lineHeight: 1.1 }}>8</div><div style={{ fontSize: 10.5, fontWeight: 500, color: '#9A6040', lineHeight: 1.35 }}>AI Agents<br/>Working for You</div></div>
              </div>
            </div>
          </div>
          <div style={{ flex: '0 0 420px', display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'floatA 9s ease-in-out infinite' }}>
            <img src={HERO_IMG} alt="Legal Documents Illustration" style={{ width: 420, maxWidth: '100%', filter: 'drop-shadow(0 20px 48px rgba(245,159,11,.22))', borderRadius: 12 }} />
          </div>
        </div>
      </section>

      {/* ── SEARCH + FILTERS ── */}
      <section style={{ position: 'relative', zIndex: 1, maxWidth: 1240, margin: '0 auto', padding: '0 48px 36px' }}>
        <div style={{ background: 'rgba(255,252,244,.9)', backdropFilter: 'blur(20px)', border: '1.5px solid rgba(245,159,11,.18)', borderRadius: 24, padding: '18px 22px', boxShadow: '0 4px 22px rgba(245,159,11,.08)', display: 'flex', alignItems: 'center', gap: 18, flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 220, display: 'flex', alignItems: 'center', gap: 11, background: 'rgba(255,248,240,.9)', border: '1.5px solid rgba(240,84,60,.16)', borderRadius: 14, padding: '11px 16px' }}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none"><circle cx="11" cy="11" r="8" stroke="#C07040" strokeWidth="2.2"/><path d="M21 21l-4.35-4.35" stroke="#C07040" strokeWidth="2.2" strokeLinecap="round"/></svg>
            <input
              type="text"
              placeholder="Search documents..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ flex: 1, border: 'none', background: 'transparent', fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 14, color: '#2D1200', outline: 'none' }}
            />
            <span style={{ fontSize: 11, fontWeight: 600, color: '#C07040', background: 'rgba(245,159,11,.12)', padding: '3px 9px', borderRadius: 8 }}>12 types</span>
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {CAT_FILTERS.map(f => (
              <button
                key={f}
                className={`chip${catFilter === f ? ' active' : ''}`}
                onClick={() => setCatFilter(f)}
                style={{ padding: '9px 18px', borderRadius: 100, fontSize: 13, fontWeight: catFilter === f ? 700 : 600, background: catFilter === f ? 'linear-gradient(135deg,#F59F0B,#F0543C)' : 'rgba(255,248,240,.9)', border: catFilter === f ? 'none' : '1.5px solid rgba(240,84,60,.18)', color: catFilter === f ? '#FFF8F0' : '#7A4A2A', cursor: 'pointer' }}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── YOUR DOCUMENTS ── */}
      {!loading && (
        <section style={{ position: 'relative', zIndex: 1, maxWidth: 1240, margin: '0 auto', padding: '0 48px 40px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 28, height: 28, borderRadius: 8, background: 'linear-gradient(135deg,#FFF0CC,#F59F0B)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" stroke="#FFF8F0" strokeWidth="2.2"/></svg>
              </div>
              <h2 style={{ fontSize: 20, fontWeight: 800, color: '#2D1200', letterSpacing: -.4 }}>Your Documents</h2>
            </div>
            <div style={{ background: 'rgba(245,159,11,.12)', border: '1px solid rgba(245,159,11,.25)', borderRadius: 100, padding: '4px 14px', fontSize: 12, fontWeight: 700, color: '#D97706' }}>
              {docs.length} document{docs.length !== 1 ? 's' : ''}
            </div>
          </div>

          {docs.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px 0', background: 'rgba(255,252,244,.92)', borderRadius: 24, border: '1.5px solid rgba(245,159,11,.15)' }}>
              <div style={{ fontSize: 44, marginBottom: 14 }}>📄</div>
              <div style={{ fontSize: 17, fontWeight: 700, color: '#2D1200', marginBottom: 8 }}>No documents yet</div>
              <div style={{ fontSize: 13, color: '#9A6040', marginBottom: 22 }}>Create your first legal document from the dashboard.</div>
              <button className="gen-btn" onClick={() => router.push('/dashboard')} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 14, fontWeight: 700, color: '#FFF8F0', padding: '11px 26px', background: 'linear-gradient(135deg,#F59F0B,#F0543C)', borderRadius: 100, boxShadow: '0 6px 22px rgba(240,84,60,.3)' }}>
                ✏️ Create Document
              </button>
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0', background: 'rgba(255,252,244,.92)', borderRadius: 24, border: '1.5px solid rgba(245,159,11,.15)' }}>
              <div style={{ fontSize: 13, color: '#9A6040' }}>No documents match your search or filter.</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {filtered.map(doc => {
                const badge = getStatusBadge(doc.status)
                const parties = doc.parties.map(p => p.name).filter(Boolean).join(' · ') || '—'
                return (
                  <div
                    key={doc.id}
                    className="doc-row"
                    onClick={() => router.push(`/dashboard/documents/${doc.id}`)}
                    style={{ background: 'rgba(255,252,244,.95)', borderRadius: 16, border: '1.5px solid rgba(245,159,11,.18)', boxShadow: '0 3px 16px rgba(245,159,11,.08)', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 14 }}
                  >
                    <div style={{ width: 44, height: 44, background: 'rgba(245,159,11,.1)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>
                      {getDocIcon(doc.document_type)}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: '#2D1200', marginBottom: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{doc.document_type}</div>
                      <div style={{ fontSize: 11.5, color: '#9A6040', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{parties} · {formatDate(doc.created_at)}</div>
                    </div>
                    <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ fontSize: 11.5, fontWeight: 700, padding: '4px 11px', borderRadius: 100, background: badge.bg, color: badge.color }}>{badge.label}</div>
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M5 3L11 8L5 13" stroke="#C07040" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </section>
      )}

      {/* ── FEATURED DOCUMENTS + PREVIEW PANEL ── */}
      <section style={{ position: 'relative', zIndex: 1, maxWidth: 1240, margin: '0 auto', padding: '0 48px 48px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 22 }}>

          {/* LEFT: Featured docs */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
              <span style={{ fontSize: 18 }}>✦</span>
              <h2 style={{ fontSize: 20, fontWeight: 800, color: '#2D1200', letterSpacing: -.4 }}>Featured Documents</h2>
            </div>
            <div className="feat-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14 }}>
              {FEAT_DOCS.map((fd, idx) => (
                <div
                  key={idx}
                  className={`feat-doc-card hov${selectedFeat === idx ? ' selected' : ''}`}
                  onClick={() => setSelectedFeat(idx)}
                  style={{ background: fd.cardBg, backdropFilter: 'blur(18px)', borderRadius: 24, padding: '18px 16px 16px', boxShadow: `0 4px 20px ${fd.cardShadow}`, position: 'relative', overflow: 'hidden' }}
                >
                  <div style={{ position: 'absolute', top: 0, right: 0, width: 70, height: 60, background: fd.glowBg }} />
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: fd.badgeBg, border: `1px solid ${fd.badgeBorder}`, borderRadius: 100, padding: '3px 10px', marginBottom: 12 }}>
                    <div style={{ width: 5, height: 5, borderRadius: '50%', background: fd.pulseBg, animation: 'pulse 2s ease-in-out infinite' }} />
                    <span style={{ fontSize: 9.5, fontWeight: 700, color: fd.badgeColor, letterSpacing: .4 }}>AI POWERED</span>
                  </div>
                  <div style={{ width: 56, height: 56, borderRadius: 16, background: `linear-gradient(135deg,${fd.gradient[0]},${fd.gradient[1]})`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12, boxShadow: `0 4px 14px ${fd.btnShadow}` }}>
                    {fd.icon}
                  </div>
                  <h3 style={{ fontSize: 13.5, fontWeight: 800, color: '#2D1200', marginBottom: 6, lineHeight: 1.3 }}>{fd.title}</h3>
                  <p style={{ fontSize: 11.5, color: '#8A5030', lineHeight: 1.55, marginBottom: 12 }}>{fd.desc}</p>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="#9A6040" strokeWidth="2"/><polyline points="12,6 12,12 16,14" stroke="#9A6040" strokeWidth="2" strokeLinecap="round"/></svg>
                      <span style={{ fontSize: 10.5, color: '#9A6040', fontWeight: 500 }}>{fd.time}</span>
                    </div>
                    <button className="gen-btn" onClick={e => { e.stopPropagation(); router.push('/dashboard') }} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '7px 14px', background: fd.btnGrad, color: '#FFF8F0', borderRadius: 100, fontSize: 11.5, fontWeight: 700, boxShadow: `0 3px 12px ${fd.btnShadow}` }}>
                      Generate
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 5H8M5 2L8 5L5 8" stroke="#FFF8F0" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT: Document Preview Panel */}
          <div style={{ flex: '0 0 258px', background: 'rgba(255,252,244,.96)', backdropFilter: 'blur(22px)', border: '1.5px solid rgba(240,84,60,.22)', borderRadius: 28, padding: 22, boxShadow: '0 8px 32px rgba(240,84,60,.1)', position: 'sticky', top: 86 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#9A6040', marginBottom: 14, letterSpacing: .2 }}>Document Preview</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
              <div style={{ width: 44, height: 44, borderRadius: 13, background: `linear-gradient(135deg,${feat.gradient[0]},${feat.gradient[1]})`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: `0 3px 12px ${feat.btnShadow}` }}>
                {feat.icon}
              </div>
              <div style={{ fontSize: 14.5, fontWeight: 800, color: '#2D1200', lineHeight: 1.25 }}>{feat.title}</div>
            </div>
            <p style={{ fontSize: 12, color: '#8A5030', lineHeight: 1.6, marginBottom: 14 }}>{feat.desc}</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 7, marginBottom: 16 }}>
              {feat.features.map(f => (
                <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 16, height: 16, borderRadius: '50%', background: 'linear-gradient(135deg,#C4F8E8,#0EA882)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{CHECK_ICON}</div>
                  <span style={{ fontSize: 12, color: '#5A3820', fontWeight: 500 }}>{f}</span>
                </div>
              ))}
            </div>
            <div style={{ background: 'rgba(255,248,240,.9)', border: '1.5px solid rgba(245,159,11,.18)', borderRadius: 14, padding: '12px 14px', marginBottom: 14, display: 'flex', flexDirection: 'column', gap: 9 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg,#FFF0CC,#F59F0B)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="#FFF8F0" strokeWidth="2.2"/><polyline points="12,6 12,12 16,14" stroke="#FFF8F0" strokeWidth="2.2" strokeLinecap="round"/></svg>
                </div>
                <div><div style={{ fontSize: 9.5, color: '#9A6040', fontWeight: 500 }}>Average Generation Time</div><div style={{ fontSize: 13, fontWeight: 800, color: '#D97706' }}>{feat.avgTime}</div></div>
              </div>
              <div style={{ height: 1, background: 'rgba(245,159,11,.14)' }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg,#FFE4C8,#EA580C)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" stroke="#FFF8F0" strokeWidth="2.2"/></svg>
                </div>
                <div><div style={{ fontSize: 9.5, color: '#9A6040', fontWeight: 500 }}>Supported Languages</div><div style={{ fontSize: 11.5, fontWeight: 700, color: '#EA580C' }}>English · <span style={{ fontSize: 10.5, color: '#9A6040', fontWeight: 400 }}>Coming Soon: ಕನ್ನಡ | हिंदी</span></div></div>
              </div>
            </div>
            <button className="gen-btn" onClick={() => router.push('/dashboard')} style={{ width: '100%', padding: 13, background: 'linear-gradient(135deg,#F59F0B,#F0543C)', color: '#FFF8F0', borderRadius: 14, fontSize: 13.5, fontWeight: 700, marginBottom: 9, boxShadow: '0 6px 22px rgba(240,84,60,.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              Generate This Document
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 7H12M8 3L12 7L8 11" stroke="#FFF8F0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
            <button style={{ width: '100%', padding: 11, background: 'transparent', border: '1.5px solid rgba(240,84,60,.3)', color: '#F0543C', borderRadius: 14, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: "'Plus Jakarta Sans', sans-serif", display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, transition: 'all .2s' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="#F0543C" strokeWidth="2"/><circle cx="12" cy="12" r="3" stroke="#F0543C" strokeWidth="2"/></svg>
              Preview Template
            </button>
          </div>
        </div>
      </section>

      {/* ── COMPLETE DOCUMENT LIBRARY ── */}
      <section style={{ position: 'relative', zIndex: 1, maxWidth: 1240, margin: '0 auto', padding: '0 48px 52px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
          <div style={{ width: 28, height: 28, borderRadius: 8, background: 'linear-gradient(135deg,#FFE4D8,#F0543C)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" stroke="#FFF8F0" strokeWidth="2.2"/></svg>
          </div>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: '#2D1200', letterSpacing: -.4 }}>Complete Document Library</h2>
        </div>
        <div className="lib-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16 }}>
          {/* Business Contracts */}
          <div style={{ background: 'rgba(255,252,244,.92)', backdropFilter: 'blur(18px)', border: '1.5px solid rgba(245,159,11,.2)', borderRadius: 24, padding: '22px 20px', boxShadow: '0 4px 20px rgba(245,159,11,.08)' }}>
            <div style={{ fontSize: 13.5, fontWeight: 800, color: '#D97706', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}><div style={{ width: 8, height: 8, borderRadius: '50%', background: '#F59F0B' }} />Business Contracts</div>
            <div>
              {[['NDA / Confidentiality Agreement','Protect sensitive information','rgba(245,159,11,.12)','#D97706'],['Vendor / Supplier Agreement','Manage vendor relationships','rgba(240,84,60,.1)','#F0543C'],['Service Agreement / SOW','Define deliverables & payments','rgba(234,88,12,.1)','#EA580C'],['MSA (Master Service Agreement)','Long-term service relationships','rgba(217,119,6,.1)','#D97706']].map(([name, sub, bg, stroke]) => (
                <div key={name} className="lib-row">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                    <div style={{ width: 28, height: 28, borderRadius: 8, background: bg as string, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" stroke={stroke as string} strokeWidth="2.2"/></svg>
                    </div>
                    <div><div style={{ fontSize: 12, fontWeight: 700, color: '#2D1200' }}>{name}</div><div style={{ fontSize: 10.5, color: '#9A6040' }}>{sub}</div></div>
                  </div>
                  {CHEVRON_RIGHT}
                </div>
              ))}
            </div>
          </div>
          {/* HR & Employment */}
          <div style={{ background: 'rgba(255,248,240,.92)', backdropFilter: 'blur(18px)', border: '1.5px solid rgba(234,88,12,.18)', borderRadius: 24, padding: '22px 20px', boxShadow: '0 4px 20px rgba(234,88,12,.07)' }}>
            <div style={{ fontSize: 13.5, fontWeight: 800, color: '#EA580C', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}><div style={{ width: 8, height: 8, borderRadius: '50%', background: '#EA580C' }} />HR &amp; Employment</div>
            <div>
              {[['Employment Contract','Hire with confidence','rgba(234,88,12,.1)','#EA580C'],['Freelancer / Contractor Agreement','Work with independent talent','rgba(245,159,11,.1)','#F59F0B'],['IP Assignment Agreement','Assign intellectual property rights','rgba(240,84,60,.1)','#F0543C']].map(([name, sub, bg, stroke]) => (
                <div key={name} className="lib-row">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                    <div style={{ width: 28, height: 28, borderRadius: 8, background: bg as string, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" stroke={stroke as string} strokeWidth="2.2"/><circle cx="12" cy="7" r="4" stroke={stroke as string} strokeWidth="2.2"/></svg>
                    </div>
                    <div><div style={{ fontSize: 12, fontWeight: 700, color: '#2D1200' }}>{name}</div><div style={{ fontSize: 10.5, color: '#9A6040' }}>{sub}</div></div>
                  </div>
                  {CHEVRON_RIGHT}
                </div>
              ))}
            </div>
          </div>
          {/* Property & Finance */}
          <div style={{ background: 'rgba(244,255,250,.92)', backdropFilter: 'blur(18px)', border: '1.5px solid rgba(14,168,130,.18)', borderRadius: 24, padding: '22px 20px', boxShadow: '0 4px 20px rgba(14,168,130,.07)' }}>
            <div style={{ fontSize: 13.5, fontWeight: 800, color: '#0EA882', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}><div style={{ width: 8, height: 8, borderRadius: '50%', background: '#0EA882' }} />Property &amp; Finance</div>
            <div>
              {[['Lease / Rental Agreement','Commercial or residential use','rgba(14,168,130,.1)','#0EA882'],['Loan / Promissory Note','Record loans and repayment terms','rgba(5,150,105,.1)','#059669']].map(([name, sub, bg, stroke]) => (
                <div key={name} className="lib-row">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                    <div style={{ width: 28, height: 28, borderRadius: 8, background: bg as string, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" stroke={stroke as string} strokeWidth="2.2"/></svg>
                    </div>
                    <div><div style={{ fontSize: 12, fontWeight: 700, color: '#2D1200' }}>{name}</div><div style={{ fontSize: 10.5, color: '#9A6040' }}>{sub}</div></div>
                  </div>
                  {CHEVRON_RIGHT}
                </div>
              ))}
            </div>
          </div>
          {/* Business Operations */}
          <div style={{ background: 'rgba(255,252,244,.92)', backdropFilter: 'blur(18px)', border: '1.5px solid rgba(217,119,6,.18)', borderRadius: 24, padding: '22px 20px', boxShadow: '0 4px 20px rgba(217,119,6,.07)' }}>
            <div style={{ fontSize: 13.5, fontWeight: 800, color: '#D97706', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}><div style={{ width: 8, height: 8, borderRadius: '50%', background: '#D97706' }} />Business Operations</div>
            <div>
              {[['Partnership Deed','Define commercial or profit sharing','rgba(217,119,6,.1)','#D97706'],['Demand / Legal Notice','Issue formal legal notices','rgba(244,63,110,.1)','#F43F6E'],['Privacy Policy / Terms of Service','Build trust & ensure compliance','rgba(234,88,12,.1)','#EA580C']].map(([name, sub, bg, stroke]) => (
                <div key={name} className="lib-row">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                    <div style={{ width: 28, height: 28, borderRadius: 8, background: bg as string, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke={stroke as string} strokeWidth="2.2"/></svg>
                    </div>
                    <div><div style={{ fontSize: 12, fontWeight: 700, color: '#2D1200' }}>{name}</div><div style={{ fontSize: 10.5, color: '#9A6040' }}>{sub}</div></div>
                  </div>
                  {CHEVRON_RIGHT}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── AI CAPABILITIES TABLE ── */}
      <section style={{ position: 'relative', zIndex: 1, maxWidth: 1240, margin: '0 auto', padding: '0 48px 52px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
          <span style={{ fontSize: 18 }}>✦</span>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: '#2D1200', letterSpacing: -.4 }}>AI Capabilities Across All Documents</h2>
        </div>
        <div style={{ background: 'rgba(255,252,244,.92)', backdropFilter: 'blur(20px)', border: '1.5px solid rgba(245,159,11,.18)', borderRadius: 24, overflow: 'hidden', boxShadow: '0 4px 22px rgba(245,159,11,.08)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr 1fr 1fr 1fr 1fr 1fr 1fr', background: 'rgba(255,248,240,.95)', borderBottom: '1.5px solid rgba(245,159,11,.15)', padding: '14px 22px', gap: 8, alignItems: 'center' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#9A6040', letterSpacing: .4, textTransform: 'uppercase' as const }}>Document Type</div>
            {[['#D97706','AI Drafting'],['#EA580C','AI Review'],['#F43F6E','Risk Detection'],['#0EA882','Negotiation Intel'],['#059669','E-sign Ready'],['#D97706','Obligation Tracking'],['#F0543C','Secure Vault']].map(([color, label]) => (
              <div key={label} style={{ fontSize: 10.5, fontWeight: 700, color, textAlign: 'center' as const, display: 'flex', flexDirection: 'column' as const, alignItems: 'center', gap: 2 }}>
                <div style={{ width: 18, height: 18, borderRadius: '50%', background: `rgba(${color === '#D97706' ? '217,119,6' : color === '#EA580C' ? '234,88,12' : color === '#F43F6E' ? '244,63,110' : color === '#0EA882' ? '14,168,130' : color === '#059669' ? '5,150,105' : color === '#F0543C' ? '240,84,60' : '217,119,6'},.12)`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 2 }}>
                  <svg width="9" height="9" viewBox="0 0 24 24" fill="none"><polyline points="20,6 9,17 4,12" stroke={color} strokeWidth="2.8" strokeLinecap="round"/></svg>
                </div>
                {label}
              </div>
            ))}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr 1fr 1fr 1fr 1fr 1fr 1fr', padding: '18px 22px', gap: 8, alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
              <div style={{ width: 40, height: 40, borderRadius: 12, background: 'linear-gradient(135deg,#FFF0CC,#F59F0B)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 3px 10px rgba(245,159,11,.25)' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" stroke="#FFF8F0" strokeWidth="2.2"/><polyline points="14,2 14,8 20,8" stroke="#FFF8F0" strokeWidth="2.2"/></svg>
              </div>
              <div><div style={{ fontSize: 13, fontWeight: 700, color: '#2D1200' }}>All 12 Document Types</div><div style={{ fontSize: 11, color: '#9A6040' }}>Fully supported with AI automation</div></div>
            </div>
            {[0,1,2,3,4,5,6].map(i => (
              <div key={i} style={{ display: 'flex', justifyContent: 'center' }}>
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg,#C4F8E8,#0EA882)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(14,168,130,.3)' }}>
                  <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M2 6.5l3 3 6-6" stroke="#FFF8F0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── POPULAR TEMPLATES ── */}
      <section style={{ position: 'relative', zIndex: 1, maxWidth: 1240, margin: '0 auto', padding: '0 48px 52px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
          <span style={{ fontSize: 18 }}>🔥</span>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: '#2D1200', letterSpacing: -.4 }}>Popular Templates</h2>
        </div>
        <div style={{ display: 'flex', gap: 14, overflowX: 'auto', paddingBottom: 8, scrollbarWidth: 'none' as const }}>
          {[
            { title: 'Startup NDA', sub: 'Protect your startup', time: '1–2 min', grad: ['#FFF0CC','#F59F0B'], border: 'rgba(245,159,11,.2)', shadow: 'rgba(245,159,11,.08)', boxShadow: 'rgba(245,159,11,.28)' },
            { title: 'Software Dev Agreement', sub: 'For tech & product teams', time: '2–3 min', grad: ['#FFE4C8','#EA580C'], border: 'rgba(234,88,12,.18)', shadow: 'rgba(234,88,12,.07)', boxShadow: 'rgba(234,88,12,.28)' },
            { title: 'Employment Offer Letter', sub: 'Professional offer letters', time: '1–2 min', grad: ['#C4F8E8','#0EA882'], border: 'rgba(14,168,130,.18)', shadow: 'rgba(14,168,130,.07)', boxShadow: 'rgba(14,168,130,.28)' },
            { title: 'SaaS Master Agreement', sub: 'SaaS business ready', time: '2–3 min', grad: ['#FFF0CC','#D97706'], border: 'rgba(245,159,11,.2)', shadow: 'rgba(245,159,11,.08)', boxShadow: 'rgba(217,119,6,.28)' },
            { title: 'Vendor Contract', sub: 'Manage suppliers', time: '2–3 min', grad: ['#FFD0E4','#F43F6E'], border: 'rgba(244,63,110,.18)', shadow: 'rgba(244,63,110,.07)', boxShadow: 'rgba(244,63,110,.28)' },
            { title: 'Office Lease Agreement', sub: 'For office spaces', time: '2–3 min', grad: ['#FFE4D8','#F0543C'], border: 'rgba(240,84,60,.18)', shadow: 'rgba(240,84,60,.07)', boxShadow: 'rgba(240,84,60,.28)' },
          ].map(t => (
            <div key={t.title} className="tmpl-card" onClick={() => router.push('/dashboard')} style={{ flex: '0 0 170px', background: 'rgba(255,252,244,.92)', backdropFilter: 'blur(18px)', border: `1.5px solid ${t.border}`, borderRadius: 20, padding: '18px 16px', boxShadow: `0 3px 16px ${t.shadow}` }}>
              <div style={{ width: 40, height: 40, borderRadius: 12, background: `linear-gradient(135deg,${t.grad[0]},${t.grad[1]})`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 11, boxShadow: `0 3px 10px ${t.boxShadow}` }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" stroke="#FFF8F0" strokeWidth="2.2"/></svg>
              </div>
              <div style={{ fontSize: 13, fontWeight: 800, color: '#2D1200', marginBottom: 4 }}>{t.title}</div>
              <div style={{ fontSize: 11, color: '#8A5030', marginBottom: 9 }}>{t.sub}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="#9A6040" strokeWidth="2"/><polyline points="12,6 12,12 16,14" stroke="#9A6040" strokeWidth="2" strokeLinecap="round"/></svg>
                <span style={{ fontSize: 10.5, color: '#9A6040', fontWeight: 500 }}>{t.time}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── DOCUMENT SOLUTIONS ── */}
      <section style={{ position: 'relative', zIndex: 1, maxWidth: 1240, margin: '0 auto', padding: '0 48px 52px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
          <div style={{ width: 28, height: 28, borderRadius: 8, background: 'linear-gradient(135deg,#FFE4C8,#EA580C)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" stroke="#FFF8F0" strokeWidth="2.2"/></svg>
          </div>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: '#2D1200', letterSpacing: -.4 }}>Document Solutions for Every Business</h2>
        </div>
        <div className="biz-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 14 }}>
          {[
            { name: 'IT Company', sub: 'Software, SaaS, IT Services', color: '#D97706', grad: ['#FFF0CC','#F59F0B'], shadow: 'rgba(245,159,11,.3)', glow: 'rgba(245,159,11,.18)', bg: 'rgba(255,252,244,.92)', border: 'rgba(245,159,11,.2)', boxShadow: 'rgba(245,159,11,.08)', badgeBg: 'rgba(245,159,11,.12)', dotGrad: ['#F59F0B','#F0543C'], items: ['NDA','MSA','SOW','Employment Contracts'] },
            { name: 'Manufacturing', sub: 'Production, FMCG, Logistics', color: '#EA580C', grad: ['#FFE4C8','#EA580C'], shadow: 'rgba(234,88,12,.3)', glow: 'rgba(234,88,12,.16)', bg: 'rgba(255,248,240,.92)', border: 'rgba(234,88,12,.18)', boxShadow: 'rgba(234,88,12,.07)', badgeBg: 'rgba(234,88,12,.12)', dotGrad: ['#EA580C','#D97706'], items: ['Vendor Agreements','Lease Agreements','Service Contracts','Partnership Deeds'] },
            { name: 'Healthcare', sub: 'Hospitals, Clinics, Labs', color: '#0EA882', grad: ['#C4F8E8','#0EA882'], shadow: 'rgba(14,168,130,.3)', glow: 'rgba(14,168,130,.16)', bg: 'rgba(244,255,250,.92)', border: 'rgba(14,168,130,.18)', boxShadow: 'rgba(14,168,130,.07)', badgeBg: 'rgba(14,168,130,.12)', dotGrad: ['#0EA882','#059669'], items: ['Patient Privacy Policy','Vendor Contracts','Employment Contracts','Service Agreements'] },
            { name: 'Digital Agency', sub: 'Marketing, Design, Creative', color: '#F43F6E', grad: ['#FFD0E4','#F43F6E'], shadow: 'rgba(244,63,110,.3)', glow: 'rgba(244,63,110,.14)', bg: 'rgba(255,244,248,.92)', border: 'rgba(244,63,110,.18)', boxShadow: 'rgba(244,63,110,.07)', badgeBg: 'rgba(244,63,110,.12)', dotGrad: ['#F43F6E','#E11D48'], items: ['SOW','NDA','Freelancer Contracts','IP Assignment'] },
            { name: 'Startup', sub: 'Early Stage Businesses', color: '#F0543C', grad: ['#FFE4D8','#F0543C'], shadow: 'rgba(240,84,60,.3)', glow: 'rgba(240,84,60,.14)', bg: 'rgba(255,252,244,.92)', border: 'rgba(240,84,60,.18)', boxShadow: 'rgba(240,84,60,.07)', badgeBg: 'rgba(240,84,60,.12)', dotGrad: ['#F0543C','#F43F6E'], items: ['NDA','Founder Agreements','Employee Contracts','Investor Documents'] },
          ].map(b => (
            <div key={b.name} className="biz-card" style={{ background: b.bg, backdropFilter: 'blur(18px)', border: `1.5px solid ${b.border}`, borderRadius: 24, padding: '20px 18px 18px', boxShadow: `0 4px 18px ${b.boxShadow}`, position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: -20, right: -20, width: 80, height: 80, background: `radial-gradient(circle,${b.glow} 0%,transparent 70%)` }} />
              <div style={{ width: 42, height: 42, borderRadius: 13, background: `linear-gradient(135deg,${b.grad[0]},${b.grad[1]})`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 10, boxShadow: `0 3px 12px ${b.shadow}` }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><rect x="2" y="3" width="20" height="14" rx="2" stroke="#FFF8F0" strokeWidth="2.2"/><line x1="8" y1="21" x2="16" y2="21" stroke="#FFF8F0" strokeWidth="2.2" strokeLinecap="round"/><line x1="12" y1="17" x2="12" y2="21" stroke="#FFF8F0" strokeWidth="2.2" strokeLinecap="round"/></svg>
              </div>
              <div style={{ fontSize: 14, fontWeight: 800, color: b.color, marginBottom: 3 }}>{b.name}</div>
              <div style={{ fontSize: 11, color: '#9A6040', marginBottom: 12 }}>{b.sub}</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 5, marginBottom: 12 }}>
                {b.items.map(item => (
                  <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ width: 14, height: 14, borderRadius: '50%', background: 'rgba(14,168,130,.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <svg width="7" height="7" viewBox="0 0 8 8" fill="none"><path d="M1.5 4l1.5 1.5 3.5-3.5" stroke="#0EA882" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </div>
                    <span style={{ fontSize: 11.5, color: '#5A3820' }}>{item}</span>
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 10, color: '#9A6040', fontWeight: 500 }}>Avg. 2–3 min</span>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: b.badgeBg, borderRadius: 100, padding: '3px 8px' }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: `linear-gradient(135deg,${b.dotGrad[0]},${b.dotGrad[1]})` }} />
                  <span style={{ fontSize: 9.5, fontWeight: 700, color: b.color }}>8 AI Agents</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── WHY CHOOSE VAAKYA ── */}
      <section style={{ position: 'relative', zIndex: 1, maxWidth: 1240, margin: '0 auto', padding: '0 48px 52px' }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
            <div style={{ height: 1.5, width: 40, background: 'linear-gradient(to right,transparent,rgba(240,84,60,.4))' }} />
            <span style={{ fontSize: 11, fontWeight: 700, color: '#F59F0B', letterSpacing: .8, textTransform: 'uppercase' as const }}>✦ Why Vaakya ✦</span>
            <div style={{ height: 1.5, width: 40, background: 'linear-gradient(to left,transparent,rgba(240,84,60,.4))' }} />
          </div>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: '#2D1200', letterSpacing: -.5 }}>Why Choose Vaakya for Your Legal Documents?</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16 }}>
          {[
            { title: 'Indian Law Ready', desc: 'Every document is built with Indian laws, regulations & best practices.', grad: ['#FFF0CC','#F59F0B'], shadow: 'rgba(245,159,11,.35)', border: 'rgba(245,159,11,.2)', boxShadow: 'rgba(245,159,11,.08)', bg: 'rgba(255,252,244,.92)' },
            { title: 'AI-Powered Intelligence', desc: 'Multiple AI agents ensure accuracy, compliance & risk-free documents.', grad: ['#FFE4C8','#EA580C'], shadow: 'rgba(234,88,12,.35)', border: 'rgba(234,88,12,.18)', boxShadow: 'rgba(234,88,12,.07)', bg: 'rgba(255,248,240,.92)' },
            { title: 'E-sign & Share Instantly', desc: 'Generate, sign, and share legally binding documents instantly.', grad: ['#C4F8E8','#0EA882'], shadow: 'rgba(14,168,130,.35)', border: 'rgba(14,168,130,.18)', boxShadow: 'rgba(14,168,130,.07)', bg: 'rgba(244,255,250,.92)' },
            { title: 'Track & Stay Compliant', desc: 'Never miss deadlines with smart obligation tracking & alerts.', grad: ['#FEECCC','#D97706'], shadow: 'rgba(217,119,6,.35)', border: 'rgba(217,119,6,.18)', boxShadow: 'rgba(217,119,6,.07)', bg: 'rgba(255,252,238,.92)' },
          ].map(w => (
            <div key={w.title} className="hov" style={{ background: w.bg, backdropFilter: 'blur(18px)', border: `1.5px solid ${w.border}`, borderRadius: 26, padding: '24px 20px', boxShadow: `0 4px 20px ${w.boxShadow}`, textAlign: 'center' as const }}>
              <div style={{ width: 52, height: 52, borderRadius: '50%', background: `linear-gradient(135deg,${w.grad[0]},${w.grad[1]})`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px', boxShadow: `0 4px 16px ${w.shadow}` }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M3 6h18M3 12h18M3 18h12" stroke="#FFF8F0" strokeWidth="2.2" strokeLinecap="round"/></svg>
              </div>
              <h3 style={{ fontSize: 14, fontWeight: 800, color: '#2D1200', marginBottom: 8 }}>{w.title}</h3>
              <p style={{ fontSize: 12, color: '#8A5030', lineHeight: 1.6 }}>{w.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA BANNER ── */}
      <section style={{ position: 'relative', zIndex: 1, maxWidth: 1240, margin: '0 auto', padding: '0 48px 72px' }}>
        <div style={{ position: 'relative', borderRadius: 32, background: 'linear-gradient(135deg,#FFF0DC 0%,#FFE8CC 30%,#FFD8D8 65%,#FFF0F0 100%)', border: '1.5px solid rgba(240,84,60,.18)', boxShadow: '0 12px 56px rgba(240,84,60,.12)', overflow: 'hidden', padding: '52px 60px', display: 'flex', alignItems: 'center', gap: 48 }}>
          <div style={{ position: 'absolute', top: -80, right: -80, width: 380, height: 380, background: 'radial-gradient(circle,rgba(245,159,11,.18) 0%,transparent 65%)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', bottom: -60, left: -60, width: 300, height: 300, background: 'radial-gradient(circle,rgba(240,84,60,.12) 0%,transparent 65%)', pointerEvents: 'none' }} />
          <div style={{ flexShrink: 0, position: 'relative', zIndex: 1, animation: 'floatA 8s ease-in-out infinite' }}>
            <img src={HERO_IMG} alt="Documents" style={{ width: 180, filter: 'drop-shadow(0 12px 28px rgba(245,159,11,.3))' }} />
          </div>
          <div style={{ flex: 1, position: 'relative', zIndex: 1 }}>
            <h2 style={{ fontSize: 'clamp(24px,3vw,40px)', fontWeight: 800, color: '#2D1200', lineHeight: 1.2, letterSpacing: -1.2, marginBottom: 12 }}>
              Need a document that<br/>isn&apos;t listed?
            </h2>
            <p style={{ fontSize: 15, color: '#8A5030', lineHeight: 1.65, marginBottom: 24, maxWidth: 440 }}>Our AI can create custom agreements tailored to your specific business needs.</p>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 26 }}>
              {['Custom Clauses Just for You','AI Reviewed & Risk Checked','Legally Sound & Compliant','Ready in Minutes'].map(chip => (
                <div key={chip} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(255,248,240,.7)', border: '1px solid rgba(245,159,11,.25)', borderRadius: 100, padding: '6px 14px' }}>
                  <div style={{ width: 14, height: 14, borderRadius: '50%', background: 'rgba(14,168,130,.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{CHECK_ICON}</div>
                  <span style={{ fontSize: 11.5, color: '#7A4A2A', fontWeight: 600 }}>{chip}</span>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
              <button className="gen-btn" onClick={() => router.push('/dashboard')} style={{ display: 'inline-flex', alignItems: 'center', gap: 9, fontSize: 15, fontWeight: 700, color: '#FFF8F0', padding: '14px 30px', background: 'linear-gradient(135deg,#F59F0B,#F0543C)', borderRadius: 100, boxShadow: '0 8px 28px rgba(240,84,60,.3)', letterSpacing: -.1 }}>
                Start Creating Now
                <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><path d="M2.5 7.5H12.5M8.5 3.5L12.5 7.5L8.5 11.5" stroke="#FFF8F0" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </button>
              <button style={{ display: 'inline-flex', alignItems: 'center', gap: 9, fontSize: 15, fontWeight: 700, color: '#F0543C', padding: '13px 28px', background: 'rgba(255,248,240,.7)', border: '2px solid rgba(240,84,60,.35)', borderRadius: 100, letterSpacing: -.1, cursor: 'pointer', fontFamily: "'Plus Jakarta Sans', sans-serif", transition: 'all .2s' }}>
                Book a Demo
              </button>
            </div>
          </div>
        </div>
      </section>

      <div style={{ height: 32 }} />
    </div>
  )
}
