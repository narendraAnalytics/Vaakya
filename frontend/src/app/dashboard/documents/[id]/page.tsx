'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/client'

// ── Types ────────────────────────────────────────────────────────────────────

type RiskFlag = { severity: string; description: string; clause?: string }

type HitlPayload = {
  draft: string
  review_score: number
  confidence_score: number
  low_confidence: boolean
  review_issues: string[]
  loop_count: number
  document_type: string
  parties: Array<{ name: string; role: string }>
  max_loops_reached: boolean
  risk_flags: RiskFlag[]
  risk_summary: { total: number; critical: number; high: number; critical_flags: RiskFlag[] }
}

type StatusResponse = {
  document_id: string
  status: string
  document_type: string
  review_score: number
  loop_count: number
  hitl_payload: HitlPayload | null
  hitl_approved: boolean
  vault_id: string
  esign_status: string
  obligations_count: number
  errors: string[]
  draft_preview: string
}

// ── Agent definitions ─────────────────────────────────────────────────────────

const AGENTS = [
  { key: 'arambha',       name: 'Arambha',       telugu: 'ఆరంభ', icon: '🎯', role: 'Intake & Classify' },
  { key: 'rachana',       name: 'Rachana',        telugu: 'రచన',  icon: '✏️', role: 'Draft Generation' },
  { key: 'parisheelanam', name: 'Parisheelanam',  telugu: 'పరిశీలనం', icon: '🔍', role: 'Review & Score' },
  { key: 'jokhim',        name: 'Jokhim',         telugu: 'జోఖిమ్', icon: '🛡️', role: 'Risk Flagging' },
  { key: 'sahee',         name: 'Sahee',          telugu: 'సహీ',  icon: '✍️', role: 'Sign & Deliver' },
  { key: 'sruthi',        name: 'Sruthi',         telugu: 'శ్రుతి', icon: '📅', role: 'Obligation Tracker' },
]

function inferAgentStates(d: StatusResponse): Record<string, 'done' | 'active' | 'waiting'> {
  const s = d.status
  const completed = s === 'completed'
  const hitl = s === 'awaiting_approval'

  const arambhaDone  = d.review_score > 0 || d.loop_count > 0 || hitl || completed
  const rachanaDone  = (d.review_score > 0 && d.loop_count > 0) || hitl || completed
  const reviewDone   = d.review_score >= 75 || hitl || completed
  const jokhimDone   = reviewDone
  const saheeDone    = !!d.vault_id || completed
  const sruthiDone   = d.obligations_count > 0 || completed

  function state(done: boolean, prev: boolean): 'done' | 'active' | 'waiting' {
    if (done) return 'done'
    if (prev) return 'active'
    return 'waiting'
  }

  return {
    arambha:       state(arambhaDone, true),
    rachana:       state(rachanaDone, arambhaDone),
    parisheelanam: state(reviewDone,  rachanaDone),
    jokhim:        state(jokhimDone,  rachanaDone),
    sahee:         state(saheeDone,   hitl || completed),
    sruthi:        state(sruthiDone,  saheeDone),
  }
}

// ── Styles ────────────────────────────────────────────────────────────────────

const STYLES = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  @keyframes pulseGlow {
    0%,100% { box-shadow: 0 4px 22px rgba(30,168,81,0.38), 0 2px 6px rgba(30,168,81,0.18); }
    50%      { box-shadow: 0 6px 36px rgba(30,168,81,0.6), 0 0 52px rgba(30,168,81,0.18); }
  }
  @keyframes dotBlink { 0%,100% { opacity:1; } 50% { opacity:0.28; } }
  @keyframes spin { from { transform:rotate(0deg); } to { transform:rotate(360deg); } }
  @keyframes fadeIn { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
  .agent-card { transition: all 0.3s; border-radius: 18px; padding: 18px 16px; display: flex; flex-direction: column; align-items: center; gap: 10px; text-align: center; }
  .agent-done  { background: #F0FBF4; border: 1.5px solid #1EA851; }
  .agent-active { background: linear-gradient(135deg,#E8F7EE,#F2FEF4); border: 1.5px solid #1EA851; animation: pulseGlow 2.4s ease-in-out infinite; }
  .agent-waiting { background: #FAFAFA; border: 1.5px solid rgba(26,92,53,0.1); opacity: 0.6; }
  .approve-btn { cursor: pointer; transition: all 0.2s; border: none; }
  .approve-btn:hover { transform: translateY(-2px); }
  .page-main::-webkit-scrollbar { width: 4px; }
  .page-main::-webkit-scrollbar-track { background: transparent; }
  .page-main::-webkit-scrollbar-thumb { background: rgba(26,92,53,0.18); border-radius: 100px; }
  .risk-chip { display: inline-flex; align-items: center; gap: 5px; padding: 4px 11px; border-radius: 100px; font-size: 11.5px; font-weight: 700; }
  .fade-in { animation: fadeIn 0.4s ease-out both; }
  @media (max-width: 900px) {
    .agents-row { flex-wrap: wrap !important; }
    .agent-card { flex: 0 0 calc(50% - 8px) !important; }
    .hitl-cols { flex-direction: column !important; }
  }
`

// ── Component ─────────────────────────────────────────────────────────────────

export default function DocumentProgressPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()

  const [pollData, setPollData] = useState<StatusResponse | null>(null)
  const [pageStatus, setPageStatus] = useState<'loading' | 'processing' | 'awaiting_approval' | 'completed' | 'error'>('loading')
  const [warming, setWarming] = useState(false)
  const [approving, setApproving] = useState(false)
  const [showRevision, setShowRevision] = useState(false)
  const [feedback, setFeedback] = useState('')
  const [approveError, setApproveError] = useState('')
  const [expandedRisks, setExpandedRisks] = useState(false)

  const tokenRef = useRef<string | null>(null)
  const pollRef  = useRef<ReturnType<typeof setInterval> | null>(null)
  const warmRef  = useRef<ReturnType<typeof setTimeout> | null>(null)

  const stopPolling = useCallback(() => {
    if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null }
    if (warmRef.current) { clearTimeout(warmRef.current);  warmRef.current  = null }
  }, [])

  const fetchStatus = useCallback(async () => {
    if (!tokenRef.current) return
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/document/${id}/status`, {
        headers: { Authorization: `Bearer ${tokenRef.current}` },
      })
      if (res.status === 503 || res.status === 502) { setWarming(true); return }
      setWarming(false)
      if (!res.ok) { setPageStatus('error'); stopPolling(); return }
      const data: StatusResponse = await res.json()
      setPollData(data)
      if (data.status === 'completed' || data.status === 'awaiting_approval') {
        setPageStatus(data.status as 'completed' | 'awaiting_approval')
        if (data.status === 'completed') stopPolling()
      } else {
        setPageStatus('processing')
      }
    } catch {
      // Network hiccup — keep polling
    }
  }, [id, stopPolling])

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getSession().then(({ data: { session } }) => {
      tokenRef.current = session?.access_token ?? null
      if (!tokenRef.current) { router.replace('/auth/login'); return }
      // Warm-up warning if first fetch is slow
      warmRef.current = setTimeout(() => setWarming(true), 6000)
      fetchStatus()
      pollRef.current = setInterval(fetchStatus, 3000)
    })
    return () => stopPolling()
  }, [fetchStatus, router, stopPolling])

  async function handleApprove(approved: boolean) {
    if (!tokenRef.current || approving) return
    setApproving(true); setApproveError('')
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/document/${id}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tokenRef.current}` },
        body: JSON.stringify({ approved, feedback: approved ? '' : feedback }),
      })
      if (!res.ok) {
        const e = await res.json().catch(() => ({}))
        setApproveError(e?.detail || 'Could not submit. Try again.')
        setApproving(false); return
      }
      setShowRevision(false); setFeedback('')
      setPageStatus('processing')
      if (!pollRef.current) {
        pollRef.current = setInterval(fetchStatus, 3000)
      }
    } catch {
      setApproveError('Network error. Try again.')
    } finally {
      setApproving(false)
    }
  }

  // ── Render helpers ──────────────────────────────────────────────────────────

  const agentStates = pollData ? inferAgentStates(pollData) : null
  const docType = pollData?.document_type || 'Legal Document'
  const hp = pollData?.hitl_payload

  function scoreColor(s: number) {
    if (s >= 90) return '#1A5C35'
    if (s >= 75) return '#B07010'
    return '#C03030'
  }
  function scoreBg(s: number) {
    if (s >= 90) return '#E0F5E8'
    if (s >= 75) return '#FFF0D8'
    return '#FFE8E8'
  }
  function severityColor(sev: string) {
    const s = sev.toLowerCase()
    if (s === 'critical') return { color: '#C03030', bg: '#FFE8E8' }
    if (s === 'high')     return { color: '#B07010', bg: '#FFF0D8' }
    if (s === 'medium')   return { color: '#5A7AB0', bg: '#EAE8F5' }
    return { color: '#4A6858', bg: '#E0F5E8' }
  }

  // ── Loading screen ──────────────────────────────────────────────────────────

  if (pageStatus === 'loading' && !pollData) {
    return (
      <>
        <style dangerouslySetInnerHTML={{ __html: STYLES }} />
        <div style={{ minHeight: '100vh', background: '#FEF9EF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16, fontFamily: '"Plus Jakarta Sans", sans-serif' }}>
          <div style={{ width: 48, height: 48, border: '3.5px solid rgba(30,168,81,0.2)', borderTopColor: '#1EA851', borderRadius: '50%', animation: 'spin 0.9s linear infinite' }} />
          <div style={{ fontSize: 16, fontWeight: 600, color: '#0F2D1F' }}>Starting agents…</div>
          {warming && <div style={{ fontSize: 13, color: '#7B9A8A', textAlign: 'center', maxWidth: 320, lineHeight: 1.6 }}>Backend is warming up (free tier). This takes up to 30 seconds on first request — please wait.</div>}
        </div>
      </>
    )
  }

  // ── Error screen ────────────────────────────────────────────────────────────

  if (pageStatus === 'error') {
    return (
      <>
        <style dangerouslySetInnerHTML={{ __html: STYLES }} />
        <div style={{ minHeight: '100vh', background: '#FEF9EF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16, fontFamily: '"Plus Jakarta Sans", sans-serif', padding: 24 }}>
          <div style={{ fontSize: 48 }}>⚠️</div>
          <div style={{ fontSize: 18, fontWeight: 800, color: '#0F2D1F' }}>Something went wrong</div>
          <div style={{ fontSize: 13.5, color: '#7B9A8A', textAlign: 'center', maxWidth: 360 }}>
            {pollData?.errors?.[0] || 'Could not load document status. The document may still be processing.'}
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <button onClick={() => { setPageStatus('loading'); fetchStatus() }} style={{ padding: '11px 22px', background: 'linear-gradient(135deg,#1A5C35,#1EA851)', color: '#fff', borderRadius: 12, border: 'none', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>Retry</button>
            <a href="/dashboard" style={{ padding: '11px 22px', background: '#FDFCF8', color: '#2C4A38', borderRadius: 12, border: '1.5px solid rgba(26,92,53,0.14)', fontWeight: 600, fontSize: 14, textDecoration: 'none', display: 'flex', alignItems: 'center' }}>← Dashboard</a>
          </div>
        </div>
      </>
    )
  }

  // ── Main layout ─────────────────────────────────────────────────────────────

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: STYLES }} />
      <div style={{ minHeight: '100vh', background: '#FEF9EF', fontFamily: '"Plus Jakarta Sans", sans-serif' }}>

        {/* Header */}
        <div style={{ background: '#FDFCF8', borderBottom: '1px solid rgba(26,92,53,0.09)', padding: '16px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 10, boxShadow: '0 1px 8px rgba(26,92,53,0.06)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <a href="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 13, fontWeight: 600, color: '#2C4A38', textDecoration: 'none', background: '#EAF5EE', padding: '7px 14px', borderRadius: 100, border: '1px solid rgba(26,92,53,0.12)' }}>← Dashboard</a>
            <div>
              <div style={{ fontSize: 16, fontWeight: 800, color: '#0F2D1F', letterSpacing: -0.4 }}>{docType}</div>
              <div style={{ fontSize: 11.5, color: '#8BAA96', marginTop: 1 }}>Document ID: {id}</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {pageStatus === 'processing' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 7, background: '#E0F5E8', border: '1px solid rgba(30,168,81,0.22)', borderRadius: 100, padding: '6px 14px' }}>
                <div style={{ width: 7, height: 7, background: '#1EA851', borderRadius: '50%', animation: 'dotBlink 1.6s ease-in-out infinite' }} />
                <span style={{ fontSize: 12, fontWeight: 700, color: '#1A5C35' }}>AGENTS WORKING</span>
              </div>
            )}
            {pageStatus === 'awaiting_approval' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 7, background: '#FFF0D8', border: '1px solid rgba(180,112,16,0.22)', borderRadius: 100, padding: '6px 14px' }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: '#B07010' }}>⏸ AWAITING YOUR REVIEW</span>
              </div>
            )}
            {pageStatus === 'completed' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 7, background: '#E0F5E8', border: '1px solid rgba(30,168,81,0.3)', borderRadius: 100, padding: '6px 14px' }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: '#1A5C35' }}>✅ COMPLETED</span>
              </div>
            )}
          </div>
        </div>

        <div className="page-main" style={{ maxWidth: 1100, margin: '0 auto', padding: '28px 24px 60px' }}>

          {/* ── Agent Pipeline ── */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#5A7A68', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 14 }}>Agent Pipeline</div>
            <div className="agents-row" style={{ display: 'flex', gap: 12 }}>
              {AGENTS.map((agent, i) => {
                const state = agentStates?.[agent.key] ?? 'waiting'
                const isParallel = agent.key === 'jokhim'
                return (
                  <div key={agent.key} style={{ flex: 1, position: 'relative' }}>
                    {isParallel && (
                      <div style={{ position: 'absolute', top: -10, left: '50%', transform: 'translateX(-50%)', fontSize: 9.5, fontWeight: 700, color: '#8BAA96', letterSpacing: 0.5, whiteSpace: 'nowrap', background: '#FEF9EF', padding: '0 4px' }}>PARALLEL</div>
                    )}
                    <div className={`agent-card agent-${state}`}>
                      <div style={{ fontSize: 34, lineHeight: 1 }}>{agent.icon}</div>
                      <div>
                        <div style={{ fontSize: 13.5, fontWeight: 800, color: '#0F2D1F', lineHeight: 1.2 }}>{agent.name}</div>
                        <div style={{ fontSize: 11, color: '#8BAA96', marginTop: 1 }}>{agent.telugu}</div>
                      </div>
                      <div style={{ fontSize: 11.5, color: '#5A7A68', fontWeight: 500 }}>{agent.role}</div>

                      {/* State indicator */}
                      {state === 'done' && (
                        <div style={{ fontSize: 11, fontWeight: 700, color: '#1A5C35', background: '#E0F5E8', padding: '3px 10px', borderRadius: 100 }}>✅ Done</div>
                      )}
                      {state === 'active' && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, fontWeight: 700, color: '#1A5C35' }}>
                          <div style={{ width: 6, height: 6, background: '#1EA851', borderRadius: '50%', animation: 'dotBlink 1s ease-in-out infinite' }} />
                          Working…
                        </div>
                      )}
                      {state === 'waiting' && (
                        <div style={{ fontSize: 11, fontWeight: 600, color: '#A8C4B4' }}>⏳ Waiting</div>
                      )}

                      {/* Extra info badges */}
                      {agent.key === 'rachana' && pollData && pollData.loop_count > 1 && (
                        <div style={{ fontSize: 10, fontWeight: 700, color: '#B07010', background: '#FFF0D8', padding: '2px 8px', borderRadius: 100 }}>Loop {pollData.loop_count}/3</div>
                      )}
                      {agent.key === 'parisheelanam' && pollData && pollData.review_score > 0 && (
                        <div style={{ fontSize: 10, fontWeight: 700, color: scoreColor(pollData.review_score), background: scoreBg(pollData.review_score), padding: '2px 8px', borderRadius: 100 }}>Score: {pollData.review_score}/100</div>
                      )}

                      {/* Connector arrow (except last) */}
                    </div>
                    {i < AGENTS.length - 1 && (
                      <div style={{ position: 'absolute', right: -10, top: '50%', transform: 'translateY(-50%)', zIndex: 2, fontSize: 14, color: 'rgba(26,92,53,0.3)' }}>›</div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* ── Status Bar ── */}
          <div style={{ background: '#FDFCF8', borderRadius: 16, border: '1px solid rgba(26,92,53,0.09)', padding: '16px 22px', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 14 }}>
            {pageStatus === 'processing' && (
              <>
                <div style={{ width: 22, height: 22, border: '2.5px solid rgba(30,168,81,0.2)', borderTopColor: '#1EA851', borderRadius: '50%', animation: 'spin 0.9s linear infinite', flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#0F2D1F' }}>Agents are working on your document…</div>
                  <div style={{ fontSize: 12, color: '#7B9A8A', marginTop: 2 }}>This page updates automatically every 3 seconds. You can leave and come back.</div>
                </div>
              </>
            )}
            {warming && pageStatus === 'processing' && (
              <div style={{ fontSize: 12.5, color: '#B07010', background: '#FFF0D8', borderRadius: 10, padding: '8px 14px', fontWeight: 500, marginLeft: 'auto' }}>⏱ Backend warming up — hang tight…</div>
            )}
            {pageStatus === 'awaiting_approval' && (
              <>
                <div style={{ fontSize: 24 }}>📋</div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#0F2D1F' }}>Your document is ready for review</div>
                  <div style={{ fontSize: 12, color: '#7B9A8A', marginTop: 2 }}>Review the draft, check risk flags, then approve or request a revision below.</div>
                </div>
              </>
            )}
            {pageStatus === 'completed' && (
              <>
                <div style={{ fontSize: 24 }}>🎉</div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#0F2D1F' }}>Document generated successfully!</div>
                  <div style={{ fontSize: 12, color: '#7B9A8A', marginTop: 2 }}>Your document has been saved to the Legal Vault.</div>
                </div>
              </>
            )}
          </div>

          {/* ── HITL Review Panel ── */}
          {pageStatus === 'awaiting_approval' && hp && (
            <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 18, marginBottom: 24 }}>

              {/* Scores + risk summary row */}
              <div className="hitl-cols" style={{ display: 'flex', gap: 16 }}>

                {/* Review score */}
                <div style={{ flex: 1, background: '#FDFCF8', borderRadius: 18, border: '1px solid rgba(26,92,53,0.09)', padding: '20px 22px' }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#5A7A68', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12 }}>Review Score</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div style={{ fontSize: 40, fontWeight: 800, color: scoreColor(hp.review_score), lineHeight: 1 }}>{hp.review_score}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ height: 8, background: '#EAF5EE', borderRadius: 100, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${hp.review_score}%`, background: `linear-gradient(90deg,${scoreColor(hp.review_score)},#1EA851)`, borderRadius: 100, transition: 'width 0.6s ease' }} />
                      </div>
                      <div style={{ fontSize: 11, color: '#7B9A8A', marginTop: 5 }}>
                        {hp.review_score >= 90 ? 'Excellent' : hp.review_score >= 75 ? 'Good — meets threshold' : 'Below threshold — revision recommended'}
                      </div>
                    </div>
                  </div>
                  {hp.low_confidence && (
                    <div style={{ marginTop: 12, fontSize: 12, color: '#B07010', background: '#FFF0D8', borderRadius: 8, padding: '8px 12px', fontWeight: 500 }}>⚠️ Low confidence ({Math.round(hp.confidence_score * 100)}%) — manual review advised</div>
                  )}
                  {hp.max_loops_reached && (
                    <div style={{ marginTop: 8, fontSize: 12, color: '#C03030', background: '#FFE8E8', borderRadius: 8, padding: '8px 12px', fontWeight: 500 }}>⚠️ Max revision loops reached — score below 75</div>
                  )}
                </div>

                {/* Risk summary */}
                <div style={{ flex: 1, background: '#FDFCF8', borderRadius: 18, border: '1px solid rgba(26,92,53,0.09)', padding: '20px 22px' }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#5A7A68', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12 }}>Risk Summary</div>
                  <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                    <span className="risk-chip" style={{ background: '#FFE8E8', color: '#C03030' }}>🚨 {hp.risk_summary.critical} Critical</span>
                    <span className="risk-chip" style={{ background: '#FFF0D8', color: '#B07010' }}>⚠️ {hp.risk_summary.high} High</span>
                    <span className="risk-chip" style={{ background: '#EAE8F5', color: '#5A7AB0' }}>📊 {hp.risk_summary.total} Total</span>
                  </div>
                  {hp.risk_summary.critical > 0 && (
                    <div style={{ marginTop: 12 }}>
                      <div style={{ fontSize: 11.5, fontWeight: 700, color: '#C03030', marginBottom: 6 }}>Critical flags:</div>
                      {hp.risk_summary.critical_flags.map((f, i) => (
                        <div key={i} style={{ fontSize: 12, color: '#4A2828', background: '#FFF4F4', borderRadius: 8, padding: '7px 11px', marginBottom: 5, lineHeight: 1.5 }}>{f.description}</div>
                      ))}
                    </div>
                  )}
                  {hp.review_issues.length > 0 && (
                    <div style={{ marginTop: 12 }}>
                      <div style={{ fontSize: 11.5, fontWeight: 700, color: '#5A7A68', marginBottom: 6 }}>Review issues:</div>
                      {hp.review_issues.slice(0, 3).map((issue, i) => (
                        <div key={i} style={{ fontSize: 12, color: '#4A6858', background: '#F5FAF6', borderRadius: 8, padding: '6px 10px', marginBottom: 4, lineHeight: 1.5 }}>• {issue}</div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Parties */}
              {hp.parties.length > 0 && (
                <div style={{ background: '#FDFCF8', borderRadius: 18, border: '1px solid rgba(26,92,53,0.09)', padding: '18px 22px' }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#5A7A68', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10 }}>Parties</div>
                  <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                    {hp.parties.map((p, i) => (
                      <div key={i} style={{ background: '#EAF5EE', borderRadius: 12, padding: '8px 14px' }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: '#0F2D1F' }}>{p.name}</div>
                        <div style={{ fontSize: 11, color: '#7B9A8A', marginTop: 2 }}>{p.role}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Full risk flags (collapsible) */}
              {hp.risk_flags.length > 0 && (
                <div style={{ background: '#FDFCF8', borderRadius: 18, border: '1px solid rgba(26,92,53,0.09)', overflow: 'hidden' }}>
                  <button onClick={() => setExpandedRisks(r => !r)} style={{ width: '100%', padding: '16px 22px', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', textAlign: 'left' }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#0F2D1F' }}>🛡️ All Risk Flags ({hp.risk_flags.length})</span>
                    <span style={{ fontSize: 14, color: '#5A7A68' }}>{expandedRisks ? '▲' : '▼'}</span>
                  </button>
                  {expandedRisks && (
                    <div style={{ padding: '0 22px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {hp.risk_flags.map((f, i) => {
                        const sc = severityColor(f.severity)
                        return (
                          <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', padding: '10px 12px', background: '#F9FCF9', borderRadius: 10 }}>
                            <span className="risk-chip" style={{ background: sc.bg, color: sc.color, flexShrink: 0 }}>{f.severity}</span>
                            <div>
                              <div style={{ fontSize: 13, color: '#0F2D1F', lineHeight: 1.5 }}>{f.description}</div>
                              {f.clause && <div style={{ fontSize: 11.5, color: '#7B9A8A', marginTop: 3 }}>Clause: {f.clause}</div>}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* Draft preview */}
              <div style={{ background: '#FDFCF8', borderRadius: 18, border: '1px solid rgba(26,92,53,0.09)', padding: '20px 22px' }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#5A7A68', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12 }}>Draft Preview</div>
                <textarea
                  readOnly
                  value={hp.draft}
                  style={{ width: '100%', height: 280, padding: '13px 15px', background: '#F5FAF6', border: '1.5px solid rgba(26,92,53,0.1)', borderRadius: 12, fontFamily: '"Plus Jakarta Sans", sans-serif', fontSize: 13, color: '#0F2D1F', resize: 'vertical', lineHeight: 1.7 }}
                />
              </div>

              {/* Approve / Revise */}
              {approveError && <div style={{ fontSize: 12.5, color: '#C03030', background: '#FFE8E8', borderRadius: 10, padding: '10px 14px', fontWeight: 500 }}>⚠️ {approveError}</div>}

              {!showRevision ? (
                <div style={{ display: 'flex', gap: 14 }}>
                  <button
                    className="approve-btn"
                    onClick={() => handleApprove(true)}
                    disabled={approving}
                    style={{ flex: 1, padding: '16px 24px', background: 'linear-gradient(135deg,#1A5C35,#1EA851)', color: '#fff', borderRadius: 14, fontSize: 15, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, opacity: approving ? 0.7 : 1 }}
                  >
                    {approving ? <><span style={{ width: 16, height: 16, border: '2.5px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.75s linear infinite' }} /> Processing…</> : <>✅ Approve & Generate PDF</>}
                  </button>
                  <button
                    className="approve-btn"
                    onClick={() => setShowRevision(true)}
                    style={{ flex: 1, padding: '16px 24px', background: '#FDFCF8', color: '#2C4A38', borderRadius: 14, fontSize: 15, fontWeight: 700, border: '1.5px solid rgba(26,92,53,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
                  >
                    ✏️ Request Revision
                  </button>
                </div>
              ) : (
                <div style={{ background: '#FDFCF8', borderRadius: 18, border: '1px solid rgba(26,92,53,0.09)', padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#0F2D1F' }}>What should the agents change?</div>
                  <textarea
                    value={feedback}
                    onChange={e => setFeedback(e.target.value)}
                    placeholder="e.g. Strengthen the confidentiality clause, add a 6-month non-compete, and include a specific arbitration clause under Indian law…"
                    style={{ width: '100%', minHeight: 90, padding: '12px 14px', background: '#F5FAF6', border: '1.5px solid rgba(26,92,53,0.13)', borderRadius: 12, fontFamily: 'inherit', fontSize: 13.5, color: '#0F2D1F', resize: 'vertical', lineHeight: 1.65 }}
                  />
                  <div style={{ display: 'flex', gap: 10 }}>
                    <button
                      className="approve-btn"
                      onClick={() => handleApprove(false)}
                      disabled={approving || !feedback.trim()}
                      style={{ flex: 1, padding: '13px 20px', background: 'linear-gradient(135deg,#1A5C35,#1EA851)', color: '#fff', borderRadius: 12, fontSize: 14, fontWeight: 700, border: 'none', opacity: (approving || !feedback.trim()) ? 0.6 : 1, cursor: (approving || !feedback.trim()) ? 'not-allowed' : 'pointer' }}
                    >
                      {approving ? 'Submitting…' : 'Send for Revision'}
                    </button>
                    <button onClick={() => { setShowRevision(false); setFeedback('') }} style={{ padding: '13px 20px', background: '#FDFCF8', color: '#7B9A8A', borderRadius: 12, fontSize: 14, fontWeight: 600, border: '1.5px solid rgba(26,92,53,0.12)', cursor: 'pointer' }}>Cancel</button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── Final Result ── */}
          {pageStatus === 'completed' && pollData && (
            <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              {/* Success banner */}
              <div style={{ background: 'linear-gradient(135deg,#E0F5E8,#C8E8D0)', borderRadius: 20, border: '1.5px solid rgba(30,168,81,0.3)', padding: '28px 28px', display: 'flex', alignItems: 'center', gap: 20 }}>
                <div style={{ fontSize: 52, lineHeight: 1 }}>🎉</div>
                <div>
                  <div style={{ fontSize: 20, fontWeight: 800, color: '#0F2D1F', letterSpacing: -0.5 }}>{pollData.document_type} — Done!</div>
                  <div style={{ fontSize: 13, color: '#5A7A68', marginTop: 4 }}>All 6 agents completed. Document saved to your Legal Vault.</div>
                  {pollData.obligations_count > 0 && (
                    <div style={{ fontSize: 12.5, color: '#1A5C35', fontWeight: 600, marginTop: 6 }}>📅 {pollData.obligations_count} obligation{pollData.obligations_count !== 1 ? 's' : ''} tracked by Sruthi</div>
                  )}
                </div>
              </div>

              {/* Draft preview */}
              {pollData.draft_preview && (
                <div style={{ background: '#FDFCF8', borderRadius: 18, border: '1px solid rgba(26,92,53,0.09)', padding: '20px 22px' }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#5A7A68', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12 }}>Document Preview</div>
                  <div style={{ fontSize: 13.5, color: '#0F2D1F', lineHeight: 1.75, whiteSpace: 'pre-wrap' }}>{pollData.draft_preview}</div>
                </div>
              )}

              {/* Actions */}
              <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
                {pollData.vault_id && (
                  <button
                    onClick={async () => {
                      const res = await fetch(
                        `${process.env.NEXT_PUBLIC_API_URL}/vault/${pollData.vault_id}`,
                        { headers: { Authorization: `Bearer ${tokenRef.current}` } }
                      )
                      if (res.ok) {
                        const data = await res.json()
                        if (data.pdf_url) window.open(data.pdf_url, '_blank')
                      }
                    }}
                    style={{ flex: 1, minWidth: 180, padding: '15px 22px', background: 'linear-gradient(135deg,#1A5C35,#1EA851)', color: '#fff', borderRadius: 14, fontSize: 15, fontWeight: 700, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: '0 4px 18px rgba(30,168,81,0.3)' }}
                  >
                    📥 Download PDF
                  </button>
                )}
                <a href="/dashboard" style={{ flex: 1, minWidth: 180, padding: '15px 22px', background: '#FDFCF8', color: '#2C4A38', borderRadius: 14, fontSize: 14, fontWeight: 700, border: '1.5px solid rgba(26,92,53,0.16)', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  ← Back to Dashboard
                </a>
                <a href="/dashboard" style={{ flex: 1, minWidth: 180, padding: '15px 22px', background: '#EAF5EE', color: '#1A5C35', borderRadius: 14, fontSize: 14, fontWeight: 700, border: '1.5px solid rgba(26,92,53,0.16)', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  ✨ Create Another
                </a>
              </div>
            </div>
          )}

        </div>
      </div>
    </>
  )
}
