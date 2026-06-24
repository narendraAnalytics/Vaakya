'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/client'

type Party = { name: string; role?: string }

type VaultDoc = {
  id: string
  document_type: string
  document_title: string
  parties: Party[]
  updated_at: string
  esign_status: string
  final_pdf_url: string
  vault_summary: string
}

function getStatusBadge(status: string) {
  if (status === 'completed' || status === 'pending_signature') return { label: '✅ Completed', color: '#1A5C35', bg: '#E0F5E8' }
  if (status === 'reviewing' || status === 'hitl_pending' || status === 'awaiting_approval') return { label: '🔍 Reviewing', color: '#B07010', bg: '#FFF0D8' }
  if (status === 'risk_flagged') return { label: '⚠️ Risk Flagged', color: '#C03030', bg: '#FFE8E8' }
  return { label: '⏳ Processing', color: '#5A7AB0', bg: '#EAE8F5' }
}

export default function VaultDocumentPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [doc, setDoc] = useState<VaultDoc | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [downloading, setDownloading] = useState(false)

  useEffect(() => {
    async function load() {
      try {
        const supabase = createClient()
        await supabase.auth.refreshSession()
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) { router.replace('/auth/login'); return }

        const { data, error: qErr } = await supabase
          .from('vault_documents')
          .select('id, document_type, document_title, parties, updated_at, esign_status, final_pdf_url, vault_summary')
          .eq('id', id)
          .eq('user_id', session.user.id)
          .single()

        if (qErr || !data) {
          setError(qErr ? `Query error: ${qErr.message}` : 'Document not found.')
          setLoading(false)
          return
        }
        setDoc({
          id: data.id as string,
          document_type: (data.document_type as string) || 'Document',
          document_title: (data.document_title as string) || '',
          parties: (data.parties as Party[]) || [],
          updated_at: (data.updated_at as string) || '',
          esign_status: (data.esign_status as string) || 'processing',
          final_pdf_url: (data.final_pdf_url as string) || '',
          vault_summary: (data.vault_summary as string) || '',
        })
      } catch {
        setError('Failed to load document.')
      }
      setLoading(false)
    }
    load()
  }, [id, router])

  async function handleDownloadPdf() {
    if (!doc) return
    setDownloading(true)
    try {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      const token = session?.access_token
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/vault/${doc.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) throw new Error(`Server error ${res.status}`)
      const json = await res.json()
      const pdfUrl = json.pdf_url || json.final_pdf_url
      if (pdfUrl) {
        window.open(pdfUrl, '_blank')
      } else {
        alert('PDF is still being generated. Please try again in a moment.')
      }
    } catch (e) {
      alert(`Could not download PDF: ${e instanceof Error ? e.message : 'Unknown error'}. Please try again.`)
    }
    setDownloading(false)
  }

  const badge = doc ? getStatusBadge(doc.esign_status) : null
  const dateStr = doc?.updated_at
    ? new Date(doc.updated_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })
    : ''

  return (
    <div style={{ minHeight: '100vh', background: '#FEF9EF', fontFamily: '"Plus Jakarta Sans", sans-serif', padding: '32px 24px' }}>
      <div style={{ maxWidth: 720, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <button
            onClick={() => router.push('/dashboard')}
            style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '8px 16px', background: '#FDFCF8', border: '1.5px solid rgba(26,92,53,0.14)', borderRadius: 100, fontSize: 13, fontWeight: 600, color: '#2C4A38', cursor: 'pointer' }}
          >
            ← Back
          </button>
          <h1 style={{ fontSize: 20, fontWeight: 800, color: '#0F2D1F', letterSpacing: -0.5 }}>Document Details</h1>
        </div>

        {loading && (
          <div style={{ background: '#FDFCF8', borderRadius: 20, border: '1px solid rgba(26,92,53,0.09)', padding: '48px 24px', textAlign: 'center', color: '#7B9A8A', fontSize: 14 }}>
            Loading document…
          </div>
        )}

        {error && (
          <div style={{ background: '#FFE8E8', borderRadius: 16, border: '1px solid rgba(192,48,48,0.2)', padding: '20px 24px', color: '#C03030', fontSize: 14, fontWeight: 600 }}>
            ⚠️ {error}
          </div>
        )}

        {doc && (
          <>
            {/* Main card */}
            <div style={{ background: '#FDFCF8', borderRadius: 22, border: '1px solid rgba(26,92,53,0.09)', boxShadow: '0 4px 28px rgba(26,92,53,0.07)', padding: '28px 28px 24px', display: 'flex', flexDirection: 'column', gap: 22 }}>

              {/* Doc type + status */}
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{ width: 52, height: 52, background: 'linear-gradient(135deg,#D0EDD8,#B8E0C4)', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, flexShrink: 0, boxShadow: '0 2px 8px rgba(26,92,53,0.1)' }}>📄</div>
                  <div>
                    <h2 style={{ fontSize: 18, fontWeight: 800, color: '#0F2D1F', letterSpacing: -0.4, lineHeight: 1.2 }}>
                      {doc.document_title || doc.document_type || 'Untitled Document'}
                    </h2>
                    <div style={{ fontSize: 12, color: '#8BAA96', marginTop: 2 }}>{doc.document_type}</div>
                    <div style={{ fontSize: 12, color: '#8BAA96', marginTop: 3 }}>{dateStr}</div>
                  </div>
                </div>
                {badge && (
                  <span style={{ fontSize: 12, fontWeight: 700, color: badge.color, background: badge.bg, padding: '5px 14px', borderRadius: 100, flexShrink: 0 }}>{badge.label}</span>
                )}
              </div>

              <div style={{ height: 1, background: 'rgba(26,92,53,0.08)' }} />

              {/* Parties */}
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#8BAA96', letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 10 }}>Parties</div>
                {doc.parties.length === 0 ? (
                  <div style={{ fontSize: 13.5, color: '#A5BFB4', fontStyle: 'italic' }}>No party information available</div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {doc.parties.map((p, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 32, height: 32, background: '#E0F5E8', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: '#1A5C35', flexShrink: 0 }}>{p.name?.[0]?.toUpperCase() || '?'}</div>
                        <div>
                          <div style={{ fontSize: 13.5, fontWeight: 600, color: '#0F2D1F' }}>{p.name}</div>
                          {p.role && <div style={{ fontSize: 11.5, color: '#8BAA96' }}>{p.role}</div>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div style={{ height: 1, background: 'rgba(26,92,53,0.08)' }} />

              {/* Vault summary */}
              {doc.vault_summary && (
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#8BAA96', letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 6 }}>Summary</div>
                  <div style={{ fontSize: 13.5, color: '#2C4A38', lineHeight: 1.6 }}>{doc.vault_summary}</div>
                </div>
              )}

              <div style={{ height: 1, background: 'rgba(26,92,53,0.08)' }} />

              {/* Actions */}
              <div>
                <button
                  onClick={handleDownloadPdf}
                  disabled={downloading}
                  style={{ width: '100%', padding: '14px 20px', background: downloading ? '#A8C4B4' : 'linear-gradient(135deg,#1A5C35,#1EA851)', color: '#fff', border: 'none', borderRadius: 14, fontSize: 15, fontWeight: 700, cursor: downloading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 9 }}
                >
                  {downloading ? '⏳ Getting link…' : '📥 Download PDF'}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
