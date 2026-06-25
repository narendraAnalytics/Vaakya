'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/client'

type Doc = {
  document_type: string
  status: string
  created_at: string
}

function formatSavings(amount: number): string {
  if (amount === 0) return '₹0'
  if (amount < 1000) return `₹${amount}`
  if (amount < 100000) return `₹${(amount / 1000).toFixed(1)}k`
  return `₹${(amount / 100000).toFixed(1)}L`
}

const STYLES = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  .kpi-card { transition: transform 0.18s, box-shadow 0.18s; }
  .kpi-card:hover { transform: translateY(-3px); box-shadow: 0 10px 32px rgba(26,92,53,0.13) !important; }
  .back-btn { transition: all 0.18s; text-decoration: none; }
  .back-btn:hover { background: #E0F5E8 !important; color: #1A5C35 !important; }
`

export default function AnalyticsPage() {
  const router = useRouter()
  const [docs, setDocs] = useState<Doc[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }

      await supabase.auth.refreshSession()
      const { data: rows } = await supabase
        .from('vault_documents')
        .select('document_type, esign_status, updated_at')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false })

      setDocs((rows ?? []).map(r => ({
        document_type: (r.document_type as string) || '',
        status: (r.esign_status as string) || 'processing',
        created_at: (r.updated_at as string) || '',
      })))
      setLoading(false)
    }
    load()
  }, [router])

  const total = docs.length
  const completed = docs.filter(d => d.status === 'completed' || d.status === 'pending_signature').length
  const reviewing = docs.filter(d => ['reviewing', 'hitl_pending', 'pending_review', 'awaiting_approval'].includes(d.status)).length
  const risks = docs.filter(d => d.status === 'risk_flagged').length
  const processing = docs.filter(d => ['processing', 'pending', 'generating'].includes(d.status)).length
  const savings = formatSavings(completed * 5000)

  // Top document types
  const typeCounts: Record<string, number> = {}
  docs.forEach(d => {
    const t = d.document_type || 'Unknown'
    typeCounts[t] = (typeCounts[t] || 0) + 1
  })
  const topTypes = Object.entries(typeCounts).sort((a, b) => b[1] - a[1]).slice(0, 6)
  const maxCount = topTypes[0]?.[1] ?? 1

  const KPI = [
    { icon: '📄', label: 'Total Documents', value: String(total), color: '#5A7AB0', bg: '#EAE8F5' },
    { icon: '✅', label: 'Completed', value: String(completed), color: '#1A5C35', bg: '#E0F5E8' },
    { icon: '🔍', label: 'In Review', value: String(reviewing), color: '#B07010', bg: '#FFF0D8' },
    { icon: '⚠️', label: 'Risk Flagged', value: String(risks), color: '#C03030', bg: '#FFE8E8' },
    { icon: '⏳', label: 'Processing', value: String(processing), color: '#5A7AB0', bg: '#EAE8F5' },
    { icon: '💰', label: 'Est. Savings', value: savings, color: '#1A5C35', bg: '#E0F5E8' },
  ]

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
          <span style={{ fontSize: 17, fontWeight: 800, color: '#0F2D1F', letterSpacing: -0.4 }}>Analytics</span>
          <span style={{ fontSize: 13, color: '#8BAA96', marginLeft: 10 }}>Your legal workspace overview</span>
        </div>
      </div>

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '28px 24px' }}>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: '#8BAA96', fontSize: 14 }}>Loading analytics…</div>
        ) : (
          <>
            {/* KPI grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 14, marginBottom: 28 }}>
              {KPI.map(k => (
                <div key={k.label} className="kpi-card" style={{ background: '#fff', borderRadius: 16, border: '1px solid rgba(26,92,53,0.09)', boxShadow: '0 3px 16px rgba(26,92,53,0.07)', padding: '20px 22px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                    <div style={{ width: 36, height: 36, background: k.bg, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>{k.icon}</div>
                    <span style={{ fontSize: 12.5, fontWeight: 600, color: '#8BAA96' }}>{k.label}</span>
                  </div>
                  <div style={{ fontSize: 28, fontWeight: 900, color: k.color, letterSpacing: -1 }}>{k.value}</div>
                </div>
              ))}
            </div>

            {/* Completion rate bar */}
            {total > 0 && (
              <div style={{ background: '#fff', borderRadius: 20, border: '1px solid rgba(26,92,53,0.09)', boxShadow: '0 4px 20px rgba(26,92,53,0.06)', padding: '24px', marginBottom: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                  <span style={{ fontSize: 14, fontWeight: 700, color: '#0F2D1F' }}>Completion Rate</span>
                  <span style={{ fontSize: 20, fontWeight: 900, color: '#1A5C35' }}>{Math.round((completed / total) * 100)}%</span>
                </div>
                <div style={{ height: 10, background: '#F0FAF3', borderRadius: 100, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${(completed / total) * 100}%`, background: 'linear-gradient(90deg,#1A5C35,#1EA851)', borderRadius: 100, transition: 'width 0.6s ease' }} />
                </div>
                <div style={{ display: 'flex', gap: 16, marginTop: 10, fontSize: 12, color: '#8BAA96' }}>
                  <span><span style={{ color: '#1A5C35', fontWeight: 600 }}>{completed}</span> completed</span>
                  <span><span style={{ color: '#B07010', fontWeight: 600 }}>{reviewing}</span> reviewing</span>
                  <span><span style={{ color: '#C03030', fontWeight: 600 }}>{risks}</span> risk flagged</span>
                  <span><span style={{ color: '#5A7AB0', fontWeight: 600 }}>{processing}</span> processing</span>
                </div>
              </div>
            )}

            {/* Document type breakdown */}
            {topTypes.length > 0 && (
              <div style={{ background: '#fff', borderRadius: 20, border: '1px solid rgba(26,92,53,0.09)', boxShadow: '0 4px 20px rgba(26,92,53,0.06)', padding: '24px' }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#0F2D1F', marginBottom: 18 }}>Document Types</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {topTypes.map(([type, count]) => (
                    <div key={type}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                        <span style={{ fontSize: 13, color: '#2C4A38', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>{type}</span>
                        <span style={{ fontSize: 12.5, fontWeight: 700, color: '#1A5C35', marginLeft: 12, flexShrink: 0 }}>{count}</span>
                      </div>
                      <div style={{ height: 7, background: '#F0FAF3', borderRadius: 100, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${(count / maxCount) * 100}%`, background: 'linear-gradient(90deg,#1A5C35,#1EA851)', borderRadius: 100 }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Empty state */}
            {total === 0 && (
              <div style={{ textAlign: 'center', padding: '60px 0' }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>📊</div>
                <div style={{ fontSize: 17, fontWeight: 700, color: '#0F2D1F', marginBottom: 8 }}>No data yet</div>
                <div style={{ fontSize: 13, color: '#8BAA96', marginBottom: 24 }}>Create your first document to see analytics.</div>
                <a href="/dashboard" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'linear-gradient(135deg,#1A5C35,#1EA851)', color: '#fff', borderRadius: 12, padding: '11px 24px', fontSize: 14, fontWeight: 700, textDecoration: 'none' }}>
                  ✏️ Get Started
                </a>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
