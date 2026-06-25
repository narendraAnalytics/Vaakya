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
      return { label: '✅ Completed', color: '#1A5C35', bg: '#E0F5E8' }
    case 'reviewing':
    case 'hitl_pending':
    case 'pending_review':
    case 'awaiting_approval':
      return { label: '🔍 Reviewing', color: '#B07010', bg: '#FFF0D8' }
    case 'risk_flagged':
      return { label: '⚠️ Risks', color: '#C03030', bg: '#FFE8E8' }
    default:
      return { label: '⏳ Processing', color: '#5A7AB0', bg: '#EAE8F5' }
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

const STYLES = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  .doc-card { transition: transform 0.18s, box-shadow 0.18s; cursor: pointer; }
  .doc-card:hover { transform: translateY(-2px); box-shadow: 0 8px 32px rgba(26,92,53,0.13) !important; }
  .back-btn { transition: all 0.18s; cursor: pointer; text-decoration: none; }
  .back-btn:hover { background: #E0F5E8 !important; color: #1A5C35 !important; }
  .search-input:focus { border-color: rgba(30,168,81,0.5) !important; box-shadow: 0 0 0 3px rgba(30,168,81,0.09) !important; outline: none; }
  .filter-chip { transition: all 0.15s; cursor: pointer; user-select: none; }
  .filter-chip:hover { background: #C8E8D0 !important; color: #0F2D1F !important; }
  .filter-chip.active { background: #1A5C35 !important; color: #fff !important; }
`

const STATUS_FILTERS = ['All', 'Completed', 'Reviewing', 'Processing', 'Risk']

export default function DocumentsPage() {
  const router = useRouter()
  const [docs, setDocs] = useState<Doc[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')

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
    const matchSearch = !search || d.document_type.toLowerCase().includes(search.toLowerCase()) ||
      d.parties.some(p => p.name.toLowerCase().includes(search.toLowerCase()))
    const matchStatus = statusFilter === 'All' ||
      (statusFilter === 'Completed' && (d.status === 'completed' || d.status === 'pending_signature')) ||
      (statusFilter === 'Reviewing' && (d.status === 'reviewing' || d.status === 'hitl_pending' || d.status === 'awaiting_approval' || d.status === 'pending_review')) ||
      (statusFilter === 'Processing' && (d.status === 'processing' || d.status === 'pending' || d.status === 'generating')) ||
      (statusFilter === 'Risk' && d.status === 'risk_flagged')
    return matchSearch && matchStatus
  })

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
          <span style={{ fontSize: 17, fontWeight: 800, color: '#0F2D1F', letterSpacing: -0.4 }}>Documents</span>
          <span style={{ fontSize: 13, color: '#8BAA96', marginLeft: 10 }}>All your legal documents</span>
        </div>
        <div style={{ marginLeft: 'auto', background: '#E0F5E8', border: '1px solid rgba(30,168,81,0.22)', borderRadius: 100, padding: '5px 14px', fontSize: 12, fontWeight: 700, color: '#1A5C35' }}>
          {docs.length} document{docs.length !== 1 ? 's' : ''}
        </div>
      </div>

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '28px 24px' }}>

        {/* Search + filters */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 22, flexWrap: 'wrap', alignItems: 'center' }}>
          <input
            className="search-input"
            type="text"
            placeholder="Search by document type or party name…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ flex: 1, minWidth: 220, padding: '10px 16px', background: '#fff', border: '1.5px solid rgba(26,92,53,0.13)', borderRadius: 12, fontFamily: 'inherit', fontSize: 13.5, color: '#0F2D1F', transition: 'border-color 0.18s, box-shadow 0.18s' }}
          />
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {STATUS_FILTERS.map(f => (
              <div
                key={f}
                className={`filter-chip${statusFilter === f ? ' active' : ''}`}
                onClick={() => setStatusFilter(f)}
                style={{ padding: '7px 14px', borderRadius: 100, fontSize: 12.5, fontWeight: 600, background: statusFilter === f ? '#1A5C35' : '#E8F3EC', color: statusFilter === f ? '#fff' : '#2C4A38', border: '1.5px solid transparent' }}
              >
                {f}
              </div>
            ))}
          </div>
        </div>

        {/* Document list */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: '#8BAA96', fontSize: 14 }}>
            Loading documents…
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>📄</div>
            <div style={{ fontSize: 17, fontWeight: 700, color: '#0F2D1F', marginBottom: 8 }}>
              {docs.length === 0 ? 'No documents yet' : 'No documents match your filter'}
            </div>
            <div style={{ fontSize: 13, color: '#8BAA96', marginBottom: 24 }}>
              {docs.length === 0 ? 'Create your first legal document from the dashboard.' : 'Try a different search or filter.'}
            </div>
            {docs.length === 0 && (
              <a href="/dashboard" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'linear-gradient(135deg,#1A5C35,#1EA851)', color: '#fff', borderRadius: 12, padding: '11px 24px', fontSize: 14, fontWeight: 700, textDecoration: 'none' }}>
                ✏️ Create Document
              </a>
            )}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {filtered.map(doc => {
              const badge = getStatusBadge(doc.status)
              const parties = doc.parties.map(p => p.name).filter(Boolean).join(' · ') || '—'
              return (
                <div
                  key={doc.id}
                  className="doc-card"
                  onClick={() => router.push(`/dashboard/documents/${doc.id}`)}
                  style={{ background: '#fff', borderRadius: 16, border: '1px solid rgba(26,92,53,0.09)', boxShadow: '0 2px 12px rgba(26,92,53,0.05)', padding: '18px 22px', display: 'flex', alignItems: 'center', gap: 16 }}
                >
                  <div style={{ width: 46, height: 46, background: '#F0FAF3', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>
                    {getDocIcon(doc.document_type)}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14.5, fontWeight: 700, color: '#0F2D1F', marginBottom: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {doc.document_type || 'Document'}
                    </div>
                    <div style={{ fontSize: 12, color: '#8BAA96', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {parties} · {formatDate(doc.created_at)}
                    </div>
                  </div>
                  <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, padding: '4px 11px', borderRadius: 100, background: badge.bg, color: badge.color }}>
                      {badge.label}
                    </div>
                    <div style={{ fontSize: 18, color: '#A8C4B4' }}>→</div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
