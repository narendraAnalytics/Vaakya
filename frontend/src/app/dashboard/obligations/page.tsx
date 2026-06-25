'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/client'

type Obligation = {
  id: string
  document_id: string
  document_type: string
  party: string
  obligation_type: string
  action: string
  deadline: string
  deadline_days: number
  deadline_date: string
  priority: string
  clause_reference: string
  estimated_penalty: string
  reminder_schedule: string[]
  consequence: string
}

type DocChip = { id: string; type: string; count: number }

const PRIORITY_STYLE: Record<string, { color: string; bg: string; border: string }> = {
  HIGH:   { color: '#C03030', bg: '#FFF2F2', border: '#FFB3B3' },
  MEDIUM: { color: '#B07010', bg: '#FFFBF0', border: '#FFD580' },
  LOW:    { color: '#1A5C35', bg: '#F0FAF3', border: '#A3D9B0' },
}

function getDocIcon(type: string): string {
  const t = (type || '').toLowerCase()
  if (t.includes('nda') || t.includes('non-disclosure')) return '📋'
  if (t.includes('employment')) return '👔'
  if (t.includes('vendor') || t.includes('supplier')) return '🤝'
  if (t.includes('partnership')) return '🏢'
  if (t.includes('lease') || t.includes('rental')) return '🏠'
  if (t.includes('freelance') || t.includes('service')) return '💼'
  if (t.includes('loan')) return '💰'
  if (t.includes('msa') || t.includes('master service')) return '🗂️'
  if (t.includes('ip assignment')) return '💡'
  if (t.includes('legal notice')) return '⚖️'
  if (t.includes('privacy')) return '🔒'
  if (t.includes('terms')) return '📜'
  return '📄'
}

const STYLES = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  .ob-card { transition: box-shadow 0.18s; }
  .ob-card:hover { box-shadow: 0 6px 24px rgba(26,92,53,0.11) !important; }
  .back-btn { transition: all 0.18s; text-decoration: none; }
  .back-btn:hover { background: #E0F5E8 !important; color: #1A5C35 !important; }
  .doc-chip { transition: all 0.15s; cursor: pointer; user-select: none; }
  .doc-chip:hover { box-shadow: 0 2px 8px rgba(26,92,53,0.15) !important; }
  .priority-chip { transition: all 0.15s; cursor: pointer; user-select: none; }
  .view-link { transition: all 0.15s; text-decoration: none; }
  .view-link:hover { background: #1A5C35 !important; color: #fff !important; }
`

export default function ObligationsPage() {
  const router = useRouter()
  const [obligations, setObligations] = useState<Obligation[]>([])
  const [loading, setLoading] = useState(true)
  const [priorityFilter, setPriorityFilter] = useState<string>('All')
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }

      await supabase.auth.refreshSession()
      const { data: rows } = await supabase
        .from('obligations')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      setObligations((rows ?? []) as Obligation[])
      setLoading(false)
    }
    load()
  }, [router])

  // Derive unique documents from obligations (no extra DB call)
  const docMap = new Map<string, DocChip>()
  obligations.forEach(o => {
    if (o.document_id) {
      if (!docMap.has(o.document_id)) {
        docMap.set(o.document_id, { id: o.document_id, type: o.document_type || 'Document', count: 0 })
      }
      docMap.get(o.document_id)!.count++
    }
  })
  const docs = Array.from(docMap.values())
  const multiDoc = docs.length > 1

  const filtered = obligations.filter(o =>
    (selectedDocId === null || o.document_id === selectedDocId) &&
    (priorityFilter === 'All' || o.priority === priorityFilter)
  )

  const highCount = filtered.filter(o => o.priority === 'HIGH').length
  const medCount = filtered.filter(o => o.priority === 'MEDIUM').length

  const activeDocLabel = selectedDocId
    ? (docMap.get(selectedDocId)?.type ?? 'Document')
    : `All Documents (${obligations.length})`

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
          <span style={{ fontSize: 17, fontWeight: 800, color: '#0F2D1F', letterSpacing: -0.4 }}>Obligations & Deadlines</span>
          <span style={{ fontSize: 13, color: '#8BAA96', marginLeft: 10 }}>Tracked by Sruthi agent</span>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
          {highCount > 0 && <div style={{ background: '#FFE8E8', color: '#C03030', fontSize: 12, fontWeight: 700, padding: '5px 12px', borderRadius: 100 }}>⚠ {highCount} High</div>}
          {medCount > 0 && <div style={{ background: '#FFF0D8', color: '#B07010', fontSize: 12, fontWeight: 700, padding: '5px 12px', borderRadius: 100 }}>{medCount} Medium</div>}
        </div>
      </div>

      <div style={{ maxWidth: 860, margin: '0 auto', padding: '28px 24px' }}>

        {/* Info strip */}
        <div style={{ background: '#fff', border: '1px solid rgba(26,92,53,0.1)', borderRadius: 14, padding: '14px 20px', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 14 }}>
          <span style={{ fontSize: 26 }}>📅</span>
          <div>
            <div style={{ fontSize: 13.5, fontWeight: 700, color: '#0F2D1F' }}>Sruthi extracts all contractual obligations automatically</div>
            <div style={{ fontSize: 12, color: '#8BAA96', marginTop: 2 }}>Deadlines, reminder schedules, penalty estimates and clause references — all in one place</div>
          </div>
        </div>

        {!loading && obligations.length > 0 && (
          <>
            {/* Document selector — only shown when 2+ documents */}
            {multiDoc && (
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#8BAA96', letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 8 }}>Filter by Document</div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {/* All Documents chip */}
                  <div
                    className="doc-chip"
                    onClick={() => setSelectedDocId(null)}
                    style={{
                      padding: '8px 16px', borderRadius: 100, fontSize: 13, fontWeight: 600,
                      background: selectedDocId === null ? '#1A5C35' : '#fff',
                      color: selectedDocId === null ? '#fff' : '#2C4A38',
                      border: `1.5px solid ${selectedDocId === null ? '#1A5C35' : 'rgba(26,92,53,0.18)'}`,
                      boxShadow: '0 1px 4px rgba(26,92,53,0.07)',
                    }}
                  >
                    All Documents
                    <span style={{ marginLeft: 6, fontSize: 11, fontWeight: 700, background: selectedDocId === null ? 'rgba(255,255,255,0.25)' : '#E0F5E8', color: selectedDocId === null ? '#fff' : '#1A5C35', padding: '1px 7px', borderRadius: 100 }}>
                      {obligations.length}
                    </span>
                  </div>

                  {/* Per-document chips */}
                  {docs.map(doc => (
                    <div
                      key={doc.id}
                      className="doc-chip"
                      onClick={() => setSelectedDocId(doc.id)}
                      style={{
                        padding: '8px 16px', borderRadius: 100, fontSize: 13, fontWeight: 600,
                        background: selectedDocId === doc.id ? '#1A5C35' : '#fff',
                        color: selectedDocId === doc.id ? '#fff' : '#2C4A38',
                        border: `1.5px solid ${selectedDocId === doc.id ? '#1A5C35' : 'rgba(26,92,53,0.18)'}`,
                        boxShadow: '0 1px 4px rgba(26,92,53,0.07)',
                        display: 'flex', alignItems: 'center', gap: 6,
                      }}
                    >
                      <span>{getDocIcon(doc.type)}</span>
                      <span style={{ maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{doc.type}</span>
                      <span style={{ fontSize: 11, fontWeight: 700, background: selectedDocId === doc.id ? 'rgba(255,255,255,0.25)' : '#E0F5E8', color: selectedDocId === doc.id ? '#fff' : '#1A5C35', padding: '1px 7px', borderRadius: 100 }}>
                        {doc.count}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Priority filters */}
            <div style={{ display: 'flex', gap: 6, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
              <span style={{ fontSize: 12, color: '#8BAA96', fontWeight: 600, marginRight: 2 }}>Priority:</span>
              {['All', 'HIGH', 'MEDIUM', 'LOW'].map(p => (
                <div
                  key={p}
                  className="priority-chip"
                  onClick={() => setPriorityFilter(p)}
                  style={{
                    padding: '6px 13px', borderRadius: 100, fontSize: 12.5, fontWeight: 600,
                    background: priorityFilter === p ? '#1A5C35' : '#E8F3EC',
                    color: priorityFilter === p ? '#fff' : '#2C4A38',
                  }}
                >
                  {p === 'All' ? 'All' : `${p === 'HIGH' ? '🔴' : p === 'MEDIUM' ? '🟡' : '🟢'} ${p}`}
                </div>
              ))}

              {/* Result count */}
              <span style={{ marginLeft: 'auto', fontSize: 12, color: '#8BAA96', fontWeight: 500 }}>
                {filtered.length} obligation{filtered.length !== 1 ? 's' : ''} · {activeDocLabel}
              </span>
            </div>
          </>
        )}

        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: '#8BAA96', fontSize: 14 }}>Loading obligations…</div>
        ) : obligations.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>📋</div>
            <div style={{ fontSize: 17, fontWeight: 700, color: '#0F2D1F', marginBottom: 8 }}>No obligations tracked yet</div>
            <div style={{ fontSize: 13, color: '#8BAA96', marginBottom: 24 }}>Obligations are extracted by Sruthi after a document completes the new document pipeline.</div>
            <a href="/dashboard" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'linear-gradient(135deg,#1A5C35,#1EA851)', color: '#fff', borderRadius: 12, padding: '11px 24px', fontSize: 14, fontWeight: 700, textDecoration: 'none' }}>
              ✏️ Create Document
            </a>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 0', color: '#8BAA96', fontSize: 14 }}>
            No obligations match this filter.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {filtered.map((ob, i) => {
              const ps = PRIORITY_STYLE[ob.priority] ?? PRIORITY_STYLE.LOW
              return (
                <div key={`${ob.id}-${i}`} className="ob-card" style={{ background: '#fff', borderRadius: 16, border: `1px solid rgba(26,92,53,0.09)`, borderLeft: `4px solid ${ps.border}`, boxShadow: '0 2px 12px rgba(26,92,53,0.05)', padding: '18px 22px' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 8 }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 14.5, fontWeight: 700, color: '#0F2D1F', marginBottom: 4 }}>{ob.action}</div>
                      <div style={{ fontSize: 12, color: '#8BAA96' }}>
                        {ob.party && <span>{ob.party} · </span>}
                        {ob.obligation_type && <span style={{ textTransform: 'capitalize' }}>{ob.obligation_type.replace(/_/g, ' ')} · </span>}
                        {ob.clause_reference && <span style={{ fontStyle: 'italic' }}>{ob.clause_reference}</span>}
                      </div>

                      {/* Document tag — shown in "All Documents" view */}
                      {selectedDocId === null && multiDoc && ob.document_type && (
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, marginTop: 6, background: '#F0FAF3', border: '1px solid rgba(26,92,53,0.12)', borderRadius: 100, padding: '2px 10px', fontSize: 11.5, fontWeight: 600, color: '#2C4A38' }}>
                          {getDocIcon(ob.document_type)} {ob.document_type}
                        </div>
                      )}
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6, flexShrink: 0 }}>
                      <div style={{ fontSize: 12, fontWeight: 700, padding: '4px 11px', borderRadius: 100, background: ps.bg, color: ps.color }}>
                        {ob.priority}
                      </div>
                      {ob.document_id && (
                        <a
                          href={`/dashboard/documents/${ob.document_id}`}
                          className="view-link"
                          style={{ fontSize: 11.5, fontWeight: 600, padding: '4px 10px', borderRadius: 8, background: '#F5FAF6', color: '#1A5C35', border: '1px solid rgba(26,92,53,0.14)' }}
                        >
                          View Doc →
                        </a>
                      )}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: ob.estimated_penalty || (ob.reminder_schedule?.length > 0) ? 10 : 0 }}>
                    {ob.deadline && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ fontSize: 14 }}>🗓</span>
                        <span style={{ fontSize: 12.5, color: '#4A6A58', fontWeight: 600 }}>
                          {ob.deadline}{ob.deadline_days ? ` (${ob.deadline_days}d)` : ''}
                        </span>
                      </div>
                    )}
                    {ob.deadline_date && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ fontSize: 12, color: '#8BAA96' }}>Due: {ob.deadline_date}</span>
                      </div>
                    )}
                  </div>

                  {ob.estimated_penalty && (
                    <div style={{ background: '#FFF2F2', border: '1px solid #FFB3B3', borderRadius: 8, padding: '7px 12px', marginBottom: 8, fontSize: 12, color: '#C03030', fontWeight: 600 }}>
                      ⚠ Estimated penalty: {ob.estimated_penalty}
                    </div>
                  )}

                  {ob.reminder_schedule?.length > 0 && (
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      {ob.reminder_schedule.map((r, ri) => (
                        <div key={ri} style={{ fontSize: 11, fontWeight: 600, padding: '3px 9px', borderRadius: 100, background: '#EAF5EE', color: '#2C6E49' }}>
                          🔔 {r}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
