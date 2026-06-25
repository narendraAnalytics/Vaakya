'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/client'

type DisputeDoc = {
  id: string
  document_type: string
  parties: Array<{ name: string; role?: string }>
  created_at: string
  status: string
}

function formatDate(dateStr: string): string {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

const STYLES = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  .dispute-card { transition: transform 0.18s, box-shadow 0.18s; cursor: pointer; }
  .dispute-card:hover { transform: translateY(-2px); box-shadow: 0 8px 28px rgba(26,92,53,0.12) !important; }
  .back-btn { transition: all 0.18s; text-decoration: none; }
  .back-btn:hover { background: #E0F5E8 !important; color: #1A5C35 !important; }
`

const VIVADA_FEATURES = [
  { icon: '📚', title: '7 Dispute Playbooks', desc: 'NDA, Lease, Vendor, Freelancer, Employment, Partnership, MSA/SaaS, Loan' },
  { icon: '💰', title: 'Damages Calculation', desc: 'Principal · interest · penalties · consequential damages' },
  { icon: '⏳', title: 'Limitation Period Analyser', desc: 'SAFE / URGENT / EXPIRED status under Limitation Act 1963' },
  { icon: '🤝', title: 'Settlement Recommendations', desc: 'With ₹ floor and success probability (HIGH / MEDIUM / LOW)' },
  { icon: '🔍', title: 'Evidence Matrix', desc: 'Structured list of required documents with importance scoring' },
  { icon: '🌐', title: 'Indian Law Research', desc: 'Vivada uses Tavily to search relevant Indian case law in real-time' },
]

export default function DisputesPage() {
  const router = useRouter()
  const [docs, setDocs] = useState<DisputeDoc[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }

      await supabase.auth.refreshSession()
      const { data: rows } = await supabase
        .from('vault_documents')
        .select('id, document_type, parties, updated_at, esign_status')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false })

      // Filter by dispute sub_graph — stored in vault_documents or infer from document_type
      // Using all docs for now since sub_graph field may not be in vault_documents
      const disputeDocs = (rows ?? []).filter(r =>
        String(r.document_type || '').toLowerCase().includes('dispute') ||
        String(r.document_type || '').toLowerCase().includes('vivada')
      )

      setDocs(disputeDocs.map(row => ({
        id: row.id as string,
        document_type: (row.document_type as string) || 'Dispute Analysis',
        parties: (row.parties as Array<{ name: string; role?: string }>) || [],
        created_at: (row.updated_at as string) || '',
        status: (row.esign_status as string) || 'completed',
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
          <span style={{ fontSize: 17, fontWeight: 800, color: '#0F2D1F', letterSpacing: -0.4 }}>Disputes</span>
          <span style={{ fontSize: 13, color: '#8BAA96', marginLeft: 10 }}>Powered by Vivada agent</span>
        </div>
      </div>

      <div style={{ maxWidth: 860, margin: '0 auto', padding: '28px 24px' }}>

        {/* Vivada capability cards */}
        <div style={{ background: '#fff', border: '1px solid rgba(26,92,53,0.09)', borderRadius: 20, padding: '24px', marginBottom: 28, boxShadow: '0 4px 20px rgba(26,92,53,0.06)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, overflow: 'hidden', border: '2px solid rgba(26,92,53,0.12)', flexShrink: 0 }}>
              <img
                src="https://res.cloudinary.com/dkqbzwicr/image/upload/v1782235257/vivadadisputeresolver_w5ecmr.png"
                alt="Vivada"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 800, color: '#0F2D1F' }}>Vivada · వివాద</div>
              <div style={{ fontSize: 12, color: '#8BAA96' }}>Dispute Resolution Agent · llama-3.3-70b-versatile + Tavily</div>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 12 }}>
            {VIVADA_FEATURES.map(f => (
              <div key={f.title} style={{ background: '#FDFCF8', border: '1px solid rgba(26,92,53,0.08)', borderRadius: 12, padding: '12px 14px' }}>
                <div style={{ fontSize: 16, marginBottom: 5 }}>{f.icon}</div>
                <div style={{ fontSize: 12.5, fontWeight: 700, color: '#0F2D1F', marginBottom: 3 }}>{f.title}</div>
                <div style={{ fontSize: 11.5, color: '#8BAA96', lineHeight: 1.5 }}>{f.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* How to start */}
        <div style={{ background: 'linear-gradient(135deg, rgba(26,92,53,0.06), rgba(30,168,81,0.04))', border: '1.5px dashed rgba(26,92,53,0.2)', borderRadius: 16, padding: '20px 24px', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 20 }}>
          <div style={{ fontSize: 32, flexShrink: 0 }}>⚖️</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#0F2D1F', marginBottom: 4 }}>Start a Dispute Analysis</div>
            <div style={{ fontSize: 13, color: '#5A7A68', lineHeight: 1.6 }}>
              Go to Dashboard → Upload PDF / DOCX → select the <strong>dispute</strong> flow. Vivada analyses the contract, calculates damages and recommends next steps.
            </div>
          </div>
          <a href="/dashboard" style={{ flexShrink: 0, display: 'inline-flex', alignItems: 'center', gap: 7, background: 'linear-gradient(135deg,#1A5C35,#1EA851)', color: '#fff', borderRadius: 12, padding: '10px 20px', fontSize: 13, fontWeight: 700, textDecoration: 'none' }}>
            Go →
          </a>
        </div>

        {/* Dispute history */}
        {!loading && docs.length > 0 && (
          <>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#5A7A68', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 0.8 }}>Previous Analyses</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {docs.map(doc => (
                <div
                  key={doc.id}
                  className="dispute-card"
                  onClick={() => router.push(`/dashboard/documents/${doc.id}`)}
                  style={{ background: '#fff', borderRadius: 14, border: '1px solid rgba(26,92,53,0.09)', boxShadow: '0 2px 10px rgba(26,92,53,0.05)', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 14 }}
                >
                  <span style={{ fontSize: 22, flexShrink: 0 }}>🏛️</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#0F2D1F', marginBottom: 2 }}>{doc.document_type}</div>
                    <div style={{ fontSize: 12, color: '#8BAA96' }}>{formatDate(doc.created_at)}</div>
                  </div>
                  <div style={{ fontSize: 13, color: '#1A5C35', fontWeight: 600 }}>View Analysis →</div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
