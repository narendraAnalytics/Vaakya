'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/client'

type VaultDoc = {
  id: string
  document_type: string
  parties: Array<{ name: string; role?: string }>
  created_at: string
  status: string
  final_pdf_url: string
}

function getDocIcon(type: string): string {
  const t = type.toLowerCase()
  if (t.includes('nda')) return '📋'
  if (t.includes('employment')) return '👔'
  if (t.includes('vendor') || t.includes('supplier')) return '🤝'
  if (t.includes('partnership')) return '🏢'
  if (t.includes('lease') || t.includes('rental')) return '🏠'
  if (t.includes('freelance') || t.includes('service')) return '💼'
  if (t.includes('loan')) return '💰'
  if (t.includes('privacy')) return '🔒'
  return '📄'
}

function formatDate(dateStr: string): string {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

const STYLES = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  .vault-card { transition: transform 0.18s, box-shadow 0.18s; }
  .vault-card:hover { transform: translateY(-2px); box-shadow: 0 8px 32px rgba(26,92,53,0.13) !important; }
  .back-btn { transition: all 0.18s; text-decoration: none; }
  .back-btn:hover { background: #E0F5E8 !important; color: #1A5C35 !important; }
  .dl-btn { transition: all 0.18s; text-decoration: none; }
  .dl-btn:hover { background: #1A5C35 !important; color: #fff !important; }
`

export default function VaultPage() {
  const router = useRouter()
  const [docs, setDocs] = useState<VaultDoc[]>([])
  const [loading, setLoading] = useState(true)

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
        .in('esign_status', ['completed', 'pending_signature'])
        .order('updated_at', { ascending: false })

      setDocs((rows ?? []).map(row => ({
        id: row.id as string,
        document_type: (row.document_type as string) || 'Document',
        parties: (row.parties as Array<{ name: string; role?: string }>) || [],
        created_at: (row.updated_at as string) || '',
        status: (row.esign_status as string) || 'completed',
        final_pdf_url: (row.final_pdf_url as string) || '',
      })))
      setLoading(false)
    }
    load()
  }, [router])

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
          <span style={{ fontSize: 17, fontWeight: 800, color: '#0F2D1F', letterSpacing: -0.4 }}>Legal Vault</span>
          <span style={{ fontSize: 13, color: '#8BAA96', marginLeft: 10 }}>Completed & signed documents</span>
        </div>
        <div style={{ marginLeft: 'auto', background: '#E0F5E8', border: '1px solid rgba(30,168,81,0.22)', borderRadius: 100, padding: '5px 14px', fontSize: 12, fontWeight: 700, color: '#1A5C35' }}>
          {docs.length} sealed
        </div>
      </div>

      <div style={{ maxWidth: 860, margin: '0 auto', padding: '28px 24px' }}>

        {/* Security strip */}
        <div style={{ background: '#fff', border: '1px solid rgba(26,92,53,0.1)', borderRadius: 14, padding: '14px 20px', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 14 }}>
          <span style={{ fontSize: 26 }}>🔐</span>
          <div>
            <div style={{ fontSize: 13.5, fontWeight: 700, color: '#0F2D1F' }}>Secure · Encrypted · Indian Contract Act 1872</div>
            <div style={{ fontSize: 12, color: '#8BAA96', marginTop: 2 }}>Documents stored in Supabase Storage · PDFs available for download at any time</div>
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: '#8BAA96', fontSize: 14 }}>Loading vault…</div>
        ) : docs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🔒</div>
            <div style={{ fontSize: 17, fontWeight: 700, color: '#0F2D1F', marginBottom: 8 }}>Vault is empty</div>
            <div style={{ fontSize: 13, color: '#8BAA96', marginBottom: 24 }}>Completed documents will appear here once agents finish and you approve.</div>
            <a href="/dashboard" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'linear-gradient(135deg,#1A5C35,#1EA851)', color: '#fff', borderRadius: 12, padding: '11px 24px', fontSize: 14, fontWeight: 700, textDecoration: 'none' }}>
              ✏️ Create Document
            </a>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {docs.map(doc => (
              <div key={doc.id} className="vault-card" style={{ background: '#fff', borderRadius: 16, border: '1px solid rgba(26,92,53,0.09)', boxShadow: '0 2px 12px rgba(26,92,53,0.05)', padding: '18px 22px', display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{ width: 46, height: 46, background: '#F0FAF3', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>
                  {getDocIcon(doc.document_type)}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14.5, fontWeight: 700, color: '#0F2D1F', marginBottom: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {doc.document_type}
                  </div>
                  <div style={{ fontSize: 12, color: '#8BAA96' }}>
                    {doc.parties.map(p => p.name).filter(Boolean).join(' · ') || '—'} · {formatDate(doc.created_at)}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                  <div
                    style={{ fontSize: 12.5, fontWeight: 600, padding: '7px 14px', borderRadius: 10, background: '#F0FAF3', color: '#1A5C35', border: '1px solid rgba(26,92,53,0.13)', cursor: 'pointer' }}
                    onClick={() => window.open(`/dashboard/documents/${doc.id}`, '_blank')}
                  >
                    View →
                  </div>
                  {doc.final_pdf_url && (
                    <a
                      href={`/api/download/${doc.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="dl-btn"
                      style={{ fontSize: 12.5, fontWeight: 600, padding: '7px 14px', borderRadius: 10, background: '#E0F5E8', color: '#1A5C35', border: '1.5px solid rgba(26,92,53,0.18)' }}
                    >
                      ⬇ PDF
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
