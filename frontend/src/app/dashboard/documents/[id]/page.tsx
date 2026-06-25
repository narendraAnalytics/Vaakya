'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import MarkdownRenderer from '@/components/MarkdownRenderer'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/client'
import { ALL_AGENTS } from '@/lib/agents'

// ── Types ─────────────────────────────────────────────────────────────────────

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
  sub_graph: 'new_doc' | 'redline' | 'dispute'
  document_type: string
  review_score: number
  risk_score: number
  loop_count: number
  hitl_payload: HitlPayload | null
  hitl_approved: boolean
  vault_id: string
  esign_status: string
  obligations_count: number
  obligations?: Array<{
    party: string
    obligation_type: string
    action: string
    deadline: string
    deadline_type: string
    deadline_days: number
    deadline_date: string
    reminder_schedule: string[]
    estimated_penalty: string
    consequence: string
    priority: string
    clause_reference: string
  }>
  errors: string[]
  draft_preview: string
  dispute_summary?: string
  negotiation_redlines?: Array<{
    clause_reference: string
    current_text: string
    recommendation: string
    counter_proposal: string
    risk_level: string
    reason: string
    business_impact: string
    legal_impact: string
    negotiation_priority: string
    deal_breaker: boolean
    suggested_redline: string
    fallback_position: string
    walkaway_position: string
  }>
}

// ── State inference ───────────────────────────────────────────────────────────

function inferAgentStates(d: StatusResponse): Record<string, 'done' | 'active' | 'waiting'> {
  const sg = d.sub_graph ?? 'new_doc'
  const hitl = d.status === 'awaiting_approval'
  const completed = d.status === 'completed'

  function state(done: boolean, prev: boolean): 'done' | 'active' | 'waiting' {
    if (done) return 'done'
    if (prev) return 'active'
    return 'waiting'
  }

  if (sg === 'new_doc') {
    const arambhaDone  = d.review_score > 0 || d.loop_count > 0 || hitl || completed
    const rachanaDone  = (d.review_score > 0 && d.loop_count > 0) || hitl || completed
    const reviewDone   = d.review_score >= 75 || hitl || completed
    const jokhimDone   = reviewDone
    const saheeDone    = !!d.vault_id || completed
    const sruthiDone   = d.obligations_count > 0 || completed
    return {
      arambha:       state(arambhaDone, true),
      rachana:       state(rachanaDone, arambhaDone),
      parisheelanam: state(reviewDone,  rachanaDone),
      jokhim:        state(jokhimDone,  rachanaDone),
      sahee:         state(saheeDone,   d.hitl_approved || completed),
      sruthi:        state(sruthiDone,  saheeDone),
    }
  }

  if (sg === 'redline') {
    const arambhaDone  = d.loop_count > 0 || hitl || completed
    const parallelDone = hitl || completed
    const saheeDone    = !!d.vault_id || completed
    return {
      arambha:  state(arambhaDone,  true),
      samjoota: state(parallelDone, arambhaDone),
      jokhim:   state(parallelDone, arambhaDone),
      sahee:    state(saheeDone,    d.hitl_approved || completed),
    }
  }

  const arambhaDone = hitl || completed
  const vivadaDone  = hitl || completed
  const saheeDone   = !!d.vault_id || completed
  return {
    arambha: state(arambhaDone, true),
    vivada:  state(vivadaDone,  arambhaDone),
    sahee:   state(saheeDone,   d.hitl_approved || completed),
  }
}

// ── Agent messages (unchanged) ────────────────────────────────────────────────

const AGENT_MESSAGES: Record<string, string[]> = {
  arambha:       ['Reading your request…', 'Identifying contract type…', 'Extracting party names…', 'Determining jurisdiction…', 'Classifying document…'],
  rachana:       ['Loading clause library…', 'Structuring contract sections…', 'Drafting legal provisions…', 'Applying Indian Contract Act 1872…', 'Writing standard clauses…', 'Composing agreement terms…'],
  parisheelanam: ['Reviewing draft clauses…', 'Checking compliance requirements…', 'Scoring contract quality…', 'Identifying missing provisions…', 'Computing confidence score…', 'Verifying clause completeness…'],
  jokhim:        ['Scanning for liability risks…', 'Checking auto-renewal traps…', 'Reviewing IP ownership clauses…', 'Assessing penalty provisions…', 'Searching Indian law database…', 'Flagging jurisdiction concerns…'],
  samjoota:      ['Comparing with standard terms…', 'Flagging unfavorable clauses…', 'Drafting counter-proposals…', 'Analysing redline changes…', 'Negotiating clause positions…'],
  vivada:        ['Searching case law references…', 'Identifying applicable provisions…', 'Drafting dispute summary…', 'Preparing legal notice…', 'Analysing dispute clauses…'],
  sahee:         ['Generating PDF document…', 'Uploading to secure vault…', 'Creating signed URL…', 'Saving to Legal Vault…'],
  sruthi:        ['Extracting payment dates…', 'Identifying renewal milestones…', 'Tracking SLA obligations…', 'Setting deadline reminders…', 'Logging contract obligations…'],
}

type LogEntry = { key: string; name: string; icon: string; summary: string; ts: number }

function getDoneSummary(key: string, d: StatusResponse): string {
  const hp = d.hitl_payload
  switch (key) {
    case 'arambha':       return d.document_type ? `Classified: ${d.document_type} · ${d.hitl_payload?.parties?.length ?? 0} parties` : 'Document classified'
    case 'rachana':       return d.loop_count === 0 ? 'Draft ready — initial pass' : `Draft ready — revised · loop ${d.loop_count}/3`
    case 'parisheelanam': return d.review_score > 0 ? `Score ${d.review_score}/100 — ${d.review_score >= 90 ? 'Excellent' : d.review_score >= 75 ? 'Good' : 'Needs work'}` : 'Review complete'
    case 'jokhim':        return hp ? `${hp.risk_summary.total} risk flag${hp.risk_summary.total !== 1 ? 's' : ''} identified` : 'Risk analysis complete'
    case 'samjoota': {
      const redlines = d.negotiation_redlines ?? []
      const db = redlines.filter(r => r.deal_breaker).length
      return redlines.length > 0
        ? `${redlines.length} clause${redlines.length !== 1 ? 's' : ''} reviewed${db > 0 ? ` · ⚠ ${db} deal-breaker${db !== 1 ? 's' : ''}` : ''}`
        : 'Redline & counter-proposals ready'
    }
    case 'vivada':        return 'Dispute analysis complete'
    case 'sahee':         return 'PDF generated & saved to vault'
    case 'sruthi':        return `${d.obligations_count} obligation${d.obligations_count !== 1 ? 's' : ''} tracked`
    default:              return 'Complete'
  }
}

// ── Styles ────────────────────────────────────────────────────────────────────

const STYLES = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  @keyframes spin        { from { transform:rotate(0deg); }  to { transform:rotate(360deg); } }
  @keyframes blink       { 0%,100% { opacity:1; } 50% { opacity:0.22; } }
  @keyframes cardGlow    { 0%,100% { box-shadow:0 0 0 0 rgba(30,168,81,0); } 50% { box-shadow:0 0 0 8px rgba(30,168,81,0.13),0 6px 28px rgba(30,168,81,0.14); } }
  @keyframes cardGoldGlow{ 0%,100% { box-shadow:0 0 0 0 rgba(200,160,16,0); } 50% { box-shadow:0 0 0 8px rgba(200,160,16,0.16),0 6px 24px rgba(200,160,16,0.12); } }
  @keyframes avatarRing  { 0%,100% { outline-color:rgba(30,168,81,0.3); } 50% { outline-color:rgba(30,168,81,0.78); } }
  @keyframes connFlow    { 0% { background-position:0 0; } 100% { background-position:0 40px; } }
  @keyframes msgFade     { from { opacity:0; transform:translateY(4px); } to { opacity:1; transform:translateY(0); } }
  @keyframes logSlide    { from { opacity:0; transform:translateX(-10px); } to { opacity:1; transform:translateX(0); } }
  @keyframes particle    { 0%,100% { transform:translateY(0) scale(1); opacity:.45; } 50% { transform:translateY(-18px) scale(1.25); opacity:.75; } }
  @keyframes tavilyIn    { from { opacity:0; transform:scale(0.95) translateY(-4px); } to { opacity:1; transform:scale(1) translateY(0); } }
  @keyframes successPop  { 0% { transform:scale(0.9); opacity:0; } 100% { transform:scale(1); opacity:1; } }
  @keyframes fadeIn      { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
  @keyframes sweep       { 0%{left:0%;width:0%} 50%{left:0%;width:100%} 100%{left:100%;width:0%} }

  .agent-card   { border-radius:18px; padding:16px 20px; display:flex; align-items:center; gap:14px; transition:all 0.32s; }
  .node-done    { background:linear-gradient(135deg,#F0FBF4,#E8F7EE); border:1.5px solid rgba(30,168,81,0.42); }
  .node-active  { background:linear-gradient(135deg,#E4F6EC,#D5F0E0); border:1.5px solid #1EA851; animation:cardGlow 2.4s ease-in-out infinite; }
  .node-waiting { background:#FDFCF8; border:1.5px solid rgba(26,92,53,0.1); opacity:0.62; }
  .node-pending { background:linear-gradient(135deg,#FFFBE8,#FFF4B8); border:1.5px solid rgba(200,160,16,0.52); animation:cardGoldGlow 2.4s ease-in-out infinite; }

  .avatar-active { outline:3px solid rgba(30,168,81,0.45); outline-offset:2.5px; animation:avatarRing 1.9s ease-in-out infinite; }

  .cl { width:2.5px; border-radius:2px; }
  .connector-done    { background:#1EA851; }
  .connector-active  { background:repeating-linear-gradient(to bottom,#1EA851 0,#1EA851 8px,#A8DFB8 8px,#A8DFB8 16px); background-size:2.5px 16px; animation:connFlow 0.9s linear infinite; }
  .connector-waiting { background:repeating-linear-gradient(to bottom,rgba(180,210,195,0.42) 0,rgba(180,210,195,0.42) 5px,transparent 5px,transparent 10px); }

  .pipe-green { background:#1EA851 !important; }
  .pipe-gray  { background:rgba(180,210,195,0.32) !important; }
  .arr-g { color:#1EA851; }
  .arr-m { color:rgba(180,210,195,0.42); }

  .log-entry { border-radius:11px; transition:background 0.14s; animation:logSlide 0.4s ease-out both; cursor:default; }
  .log-entry:hover { background:#EFF8F2 !important; }
  .tavily-panel { animation:tavilyIn 0.35s ease-out both; }
  .fade-in { animation:fadeIn 0.4s ease-out both; }
  .completed-banner { animation:successPop 0.5s cubic-bezier(0.34,1.56,0.64,1) both; }
  .approve-btn { cursor:pointer; transition:all 0.2s; border:none; }
  .approve-btn:hover { transform:translateY(-2px); }
  .risk-chip { display:inline-flex; align-items:center; gap:5px; padding:4px 11px; border-radius:100px; font-size:11.5px; font-weight:700; }
  .scr::-webkit-scrollbar { width:3px; }
  .scr::-webkit-scrollbar-track { background:transparent; }
  .scr::-webkit-scrollbar-thumb { background:rgba(26,92,53,0.18); border-radius:100px; }
  @media (max-width:1060px) { .mgrid { grid-template-columns:1fr 360px !important; } }
  @media (max-width:820px)  { .mgrid { grid-template-columns:1fr !important; } .right-panel { position:static !important; } .hitl-cols { flex-direction:column !important; } }
`

// ── Component ─────────────────────────────────────────────────────────────────

export default function DocumentProgressPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()

  const [pollData, setPollData]       = useState<StatusResponse | null>(null)
  const [pageStatus, setPageStatus]   = useState<'loading' | 'processing' | 'awaiting_approval' | 'completed' | 'error'>('loading')
  const [warming, setWarming]         = useState(false)
  const [approving, setApproving]     = useState(false)
  const [showRevision, setShowRevision] = useState(false)
  const [feedback, setFeedback]       = useState('')
  const [approveError, setApproveError] = useState('')
  const [expandedRisks, setExpandedRisks] = useState(false)
  const [msgTick, setMsgTick]         = useState(0)
  const [activityLog, setActivityLog] = useState<LogEntry[]>([])

  const tokenRef      = useRef<string | null>(null)
  const pollRef       = useRef<ReturnType<typeof setInterval> | null>(null)
  const warmRef       = useRef<ReturnType<typeof setTimeout> | null>(null)
  const prevStatesRef = useRef<Record<string, string>>({})

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

      const newStates = inferAgentStates(data)
      const newEntries: LogEntry[] = []
      for (const [key, newState] of Object.entries(newStates)) {
        if (newState === 'done' && prevStatesRef.current[key] !== 'done') {
          const def = ALL_AGENTS.find(a => a.key === key)
          if (def) newEntries.push({ key, name: def.name, icon: def.icon, summary: getDoneSummary(key, data), ts: Date.now() })
        }
      }
      if (newEntries.length > 0) setActivityLog(log => [...log, ...newEntries])
      prevStatesRef.current = newStates

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
      warmRef.current = setTimeout(() => setWarming(true), 6000)
      fetchStatus()
      pollRef.current = setInterval(fetchStatus, 3000)
    })
    return () => stopPolling()
  }, [fetchStatus, router, stopPolling])

  useEffect(() => {
    if (pageStatus !== 'processing') return
    const t = setInterval(() => setMsgTick(n => n + 1), 2500)
    return () => clearInterval(t)
  }, [pageStatus])

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
      if (!pollRef.current) pollRef.current = setInterval(fetchStatus, 3000)
    } catch {
      setApproveError('Network error. Try again.')
    } finally {
      setApproving(false)
    }
  }

  // ── Derived values ────────────────────────────────────────────────────────

  const agentStates = pollData ? inferAgentStates(pollData) : null
  const subGraph    = pollData?.sub_graph ?? 'new_doc'
  const AGENTS      = ALL_AGENTS.filter(a => a.flows.includes(subGraph))
  const docType     = pollData?.document_type || 'Legal Document'
  const hp          = pollData?.hitl_payload

  const hitlState: 'pending' | 'done' | 'waiting' =
    pageStatus === 'awaiting_approval' ? 'pending' :
    (pageStatus === 'completed' || pollData?.hitl_approved) ? 'done' : 'waiting'

  const parallelDone =
    subGraph === 'new_doc' ? (agentStates?.parisheelanam === 'done' && agentStates?.jokhim === 'done') :
    subGraph === 'redline' ? (agentStates?.samjoota === 'done' && agentStates?.jokhim === 'done') : false

  const parallelActive =
    subGraph === 'new_doc' ? (agentStates?.parisheelanam !== 'waiting' || agentStates?.jokhim !== 'waiting') :
    subGraph === 'redline' ? (agentStates?.samjoota !== 'waiting' || agentStates?.jokhim !== 'waiting') : false

  const branchPipe = parallelActive ? 'pipe-green' : 'pipe-gray'
  const mergePipe  = parallelDone  ? 'pipe-green' : 'pipe-gray'
  const mergeArrow = parallelDone  ? '#1EA851' : 'rgba(180,210,195,0.42)'

  function connCls(fromKey: string, toKey: string): string {
    if (!agentStates) return 'connector-waiting'
    const to = agentStates[toKey] ?? 'waiting'
    const from = agentStates[fromKey] ?? 'waiting'
    if (to === 'done') return 'connector-done'
    if (from === 'done') return 'connector-active'
    return 'connector-waiting'
  }
  function arrCls(fromKey: string, toKey: string): string {
    if (!agentStates) return 'arr-m'
    return (agentStates[fromKey] === 'done' || agentStates[toKey] === 'done') ? 'arr-g' : 'arr-m'
  }

  const preHitlConn = hitlState !== 'waiting' ? 'connector-done' :
    (subGraph === 'dispute' ? agentStates?.vivada === 'done' : parallelDone) ? 'connector-active' :
    'connector-waiting'

  const hitlToSaheeConn = agentStates?.sahee === 'done' ? 'connector-done' :
    hitlState === 'done' ? 'connector-active' : 'connector-waiting'

  function scoreColor(s: number) { return s >= 90 ? '#1A5C35' : s >= 75 ? '#B07010' : '#C03030' }
  function scoreBg(s: number)    { return s >= 90 ? '#E0F5E8' : s >= 75 ? '#FFF0D8' : '#FFE8E8' }
  function riskScoreColor(s: number) { return s >= 80 ? '#1A5C35' : s >= 50 ? '#B07010' : '#C03030' }
  function riskScoreLabel(s: number) { return s >= 80 ? 'Low Risk' : s >= 50 ? 'Medium Risk' : 'High Risk' }
  function severityColor(sev: string) {
    const s = sev.toLowerCase()
    if (s === 'critical') return { color: '#C03030', bg: '#FFE8E8' }
    if (s === 'high')     return { color: '#B07010', bg: '#FFF0D8' }
    if (s === 'medium')   return { color: '#5A7AB0', bg: '#EAE8F5' }
    return { color: '#4A6858', bg: '#E0F5E8' }
  }

  const riskLevel = hp?.risk_summary
    ? hp.risk_summary.critical > 0 ? { label: 'High',   color: '#C03030', dot: '#C03030' }
    : hp.risk_summary.high > 0     ? { label: 'Medium', color: '#B07010', dot: '#E8C840' }
    : { label: 'Low', color: '#1A5C35', dot: '#1EA851' }
    : null

  const gaugeScore    = pollData?.review_score ?? 0
  const gaugeOffset   = Math.round(207 * (1 - gaugeScore / 100))
  const estCompletion = (() => {
    if (pageStatus === 'completed')         return 'Complete!'
    if (pageStatus === 'awaiting_approval') return 'Awaiting Review'
    if (!agentStates)                       return '~4 min'
    const done = Object.values(agentStates).filter(s => s === 'done').length
    if (done === 0) return '~4 min'
    if (done <= 2)  return '~2 min 30s'
    if (done <= 4)  return '~1 min'
    return '~30s'
  })()

  // ── Agent card renderer ───────────────────────────────────────────────────

  function AgentNode({ agentKey, size = 'large' }: { agentKey: string; size?: 'large' | 'small' }) {
    const agent = ALL_AGENTS.find(a => a.key === agentKey)!
    const st    = agentStates?.[agentKey] ?? 'waiting'
    const av    = size === 'large' ? 52 : 44
    const showTavily = agent.tavily && (st === 'active' || st === 'done')
    const cardCls = st === 'done' ? 'agent-card node-done' : st === 'active' ? 'agent-card node-active' : 'agent-card node-waiting'

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div className={cardCls}>
          {/* Avatar */}
          <img
            src={agent.avatarUrl}
            alt={agent.name}
            className={st === 'active' ? 'avatar-active' : ''}
            style={{ width: av, height: av, borderRadius: '50%', objectFit: 'cover', flexShrink: 0, boxShadow: '0 3px 14px rgba(26,92,53,0.15)' }}
          />
          {/* Text */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: size === 'large' ? 13.5 : 12.5, fontWeight: 800, color: '#0F2D1F', letterSpacing: -0.3 }}>
              {agent.name} Agent
            </div>
            <div style={{ fontSize: size === 'large' ? 11.5 : 11, color: '#7B9A8A', marginTop: 1 }}>{agent.role}</div>
            {st === 'active' && (
              <div key={msgTick} style={{ fontSize: 11, color: '#1A5C35', marginTop: 4, animation: 'msgFade 0.35s ease both' }}>
                {(AGENT_MESSAGES[agent.key] ?? ['Processing…'])[msgTick % (AGENT_MESSAGES[agent.key]?.length ?? 1)]}
              </div>
            )}
            {st === 'done' && pollData && (
              <div style={{ fontSize: 11, color: '#5A7A68', marginTop: 3 }}>
                {getDoneSummary(agent.key, pollData)}
              </div>
            )}
          </div>
          {/* Status badge */}
          {st === 'done' && (
            <div style={{ width: 30, height: 30, background: 'linear-gradient(135deg,#1A5C35,#1EA851)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FEF9EF', fontSize: 15, flexShrink: 0, boxShadow: '0 2px 10px rgba(26,92,53,0.28)' }}>✓</div>
          )}
          {st === 'active' && (
            <div style={{ width: 24, height: 24, border: '3px solid rgba(30,168,81,0.18)', borderTopColor: '#1EA851', borderRadius: '50%', animation: 'spin 0.8s linear infinite', flexShrink: 0 }} />
          )}
          {st === 'waiting' && (
            <div style={{ fontSize: 11.5, color: '#C8DAD0', fontWeight: 600, flexShrink: 0 }}>⏳ Waiting</div>
          )}
        </div>
        {/* Tavily search panel */}
        {showTavily && (
          <div className="tavily-panel" style={{ background: 'linear-gradient(135deg,#E8F7EE,#D4EEE0)', border: '1.5px solid rgba(30,168,81,0.32)', borderRadius: 13, padding: '11px 14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 6 }}>
              <div style={{ width: 7, height: 7, background: '#1EA851', borderRadius: '50%', animation: st === 'active' ? 'blink 1s ease-in-out infinite' : 'none', opacity: st === 'done' ? 0.55 : 1 }} />
              <span style={{ fontSize: 10.5, fontWeight: 800, color: '#1A5C35', letterSpacing: 0.3 }}>{st === 'active' ? 'TAVILY SEARCH ACTIVE' : 'TAVILY SEARCH COMPLETE'}</span>
              <div style={{ marginLeft: 'auto', background: '#C8E8D0', color: '#1A5C35', fontSize: 9.5, fontWeight: 700, padding: '2px 8px', borderRadius: 100, border: '1px solid rgba(26,92,53,0.2)' }}>🔍 Legal DB</div>
            </div>
            <div style={{ fontSize: 10.5, color: '#3A6A4E', lineHeight: 1.55 }}>
              {st === 'active' ? 'Searching Indian laws, regulations, case law & legal precedents…' : 'Indian law database consulted — risk flags sourced from legal precedents'}
            </div>
          </div>
        )}
      </div>
    )
  }

  function Connector({ cls, height = 28 }: { cls: string; height?: number }) {
    const arrowColor = cls === 'connector-done' || cls === 'connector-active' ? '#1EA851' : 'rgba(180,210,195,0.42)'
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '2px 0' }}>
        <div className={`cl ${cls}`} style={{ height }} />
        <div style={{ fontSize: 10, lineHeight: 1, marginTop: -1, color: arrowColor }}>▼</div>
      </div>
    )
  }

  function ParallelSection({ leftKey, rightKey }: { leftKey: string; rightKey: string }) {
    return (
      <>
        {/* Short stem before fork */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '2px 0' }}>
          <div className={`cl ${branchPipe === 'pipe-green' ? 'connector-active' : 'connector-waiting'}`} style={{ height: 18 }} />
        </div>
        {/* Fork */}
        <div style={{ position: 'relative', height: 56, width: '100%' }}>
          <div className={branchPipe} style={{ position: 'absolute', left: '50%', top: 0, width: 2.5, height: 28, borderRadius: '2px 2px 0 0', transform: 'translateX(-50%)' }} />
          <div className={branchPipe} style={{ position: 'absolute', left: '24%', right: '24%', top: 27, height: 2.5 }} />
          <div className={branchPipe} style={{ position: 'absolute', left: '24%', top: 27, width: 2.5, height: 29, borderRadius: '0 0 2px 2px', transform: 'translateX(-50%)' }} />
          <div className={branchPipe} style={{ position: 'absolute', right: '24%', top: 27, width: 2.5, height: 29, borderRadius: '0 0 2px 2px', transform: 'translateX(50%)' }} />
          <div style={{ position: 'absolute', top: 32, left: '50%', transform: 'translateX(-50%)', background: '#F5F9F0', border: '1px solid rgba(26,92,53,0.12)', borderRadius: 100, padding: '2px 11px', fontSize: 9.5, fontWeight: 700, color: '#8BAA96', letterSpacing: 0.5, whiteSpace: 'nowrap' }}>PARALLEL</div>
        </div>
        {/* Parallel cards */}
        <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
          <div style={{ flex: 1 }}><AgentNode agentKey={leftKey} size="small" /></div>
          <div style={{ flex: 1 }}><AgentNode agentKey={rightKey} size="small" /></div>
        </div>
        {/* Merge */}
        <div style={{ position: 'relative', height: 56, width: '100%', marginTop: 8 }}>
          <div className={mergePipe} style={{ position: 'absolute', left: '24%', top: 0, width: 2.5, height: 28, borderRadius: '2px 2px 0 0', transform: 'translateX(-50%)' }} />
          <div className={mergePipe} style={{ position: 'absolute', right: '24%', top: 0, width: 2.5, height: 28, borderRadius: '2px 2px 0 0', transform: 'translateX(50%)' }} />
          <div className={mergePipe} style={{ position: 'absolute', left: '24%', right: '24%', top: 27, height: 2.5 }} />
          <div className={mergePipe} style={{ position: 'absolute', left: '50%', top: 27, width: 2.5, height: 29, borderRadius: '0 0 2px 2px', transform: 'translateX(-50%)' }} />
          <div style={{ position: 'absolute', left: '50%', top: 51, transform: 'translateX(-50%)', fontSize: 10, lineHeight: 1, color: mergeArrow }}>▼</div>
        </div>
      </>
    )
  }

  function HitlNode() {
    const cardCls = hitlState === 'pending' ? 'agent-card node-pending' : hitlState === 'done' ? 'agent-card node-done' : 'agent-card node-waiting'
    return (
      <div className={cardCls}>
        <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'linear-gradient(135deg,#FFEE90,#E8C050)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, flexShrink: 0, boxShadow: '0 3px 14px rgba(200,130,0,0.2)' }}>👥</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13.5, fontWeight: 800, color: '#0F2D1F', letterSpacing: -0.3 }}>HITL Approval</div>
          <div style={{ fontSize: 11.5, color: '#7B9A8A', marginTop: 1 }}>Human-in-the-Loop Review</div>
          {hitlState === 'pending' && <div style={{ fontSize: 11, color: '#A07810', marginTop: 3, fontWeight: 500 }}>Your review & approval is required</div>}
          {hitlState === 'done'    && <div style={{ fontSize: 11, color: '#1A5C35', marginTop: 3, fontWeight: 500 }}>Approved ✓ — proceeding to signing</div>}
        </div>
        {hitlState === 'pending' && <div style={{ background: 'linear-gradient(135deg,#F5E870,#E8C848)', color: '#7A5000', fontSize: 11.5, fontWeight: 800, padding: '5px 14px', borderRadius: 100, flexShrink: 0, border: '1px solid rgba(200,160,0,0.3)' }}>Pending</div>}
        {hitlState === 'done'    && <div style={{ width: 30, height: 30, background: 'linear-gradient(135deg,#1A5C35,#1EA851)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FEF9EF', fontSize: 15, flexShrink: 0 }}>✓</div>}
        {hitlState === 'waiting' && <div style={{ fontSize: 11.5, color: '#C8DAD0', fontWeight: 600, flexShrink: 0 }}>⏳ Waiting</div>}
      </div>
    )
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

      {/* Background botanical decorations */}
      <div style={{ position: 'fixed', top: 0, right: 0, pointerEvents: 'none', zIndex: 0, opacity: 0.55 }}>
        <svg width="200" height="230" viewBox="0 0 200 230" fill="none">
          <path d="M160 210C160 210 70 162 74 78C78-6 184 8 184 88C184 164 160 210 160 210Z" fill="rgba(30,168,81,0.14)" />
          <path d="M160 210C160 210 148 124 154 72C160 20 180 46 180 84" stroke="rgba(30,168,81,0.26)" strokeWidth="2.8" fill="none" />
          <path d="M154 100C154 100 178 110 196 130" stroke="rgba(30,168,81,0.16)" strokeWidth="1.6" fill="none" />
          <path d="M152 138C152 138 174 146 188 168" stroke="rgba(30,168,81,0.12)" strokeWidth="1.4" fill="none" />
        </svg>
      </div>
      <div style={{ position: 'fixed', bottom: 30, left: 10, pointerEvents: 'none', zIndex: 0, opacity: 0.38, transform: 'rotate(175deg)' }}>
        <svg width="120" height="148" viewBox="0 0 200 230" fill="none">
          <path d="M160 210C160 210 70 162 74 78C78-6 184 8 184 88C184 164 160 210 160 210Z" fill="rgba(30,168,81,0.16)" />
          <path d="M160 210C160 210 148 124 154 72C160 20 180 46 180 84" stroke="rgba(30,168,81,0.22)" strokeWidth="2.8" fill="none" />
        </svg>
      </div>
      {/* Sparkle particles */}
      <div style={{ position: 'fixed', top: 180, right: 300, width: 8, height: 8, background: '#E8C84A', borderRadius: '50%', animation: 'particle 3.6s ease-in-out infinite', pointerEvents: 'none', zIndex: 0 }} />
      <div style={{ position: 'fixed', top: 340, right: 148, width: 5, height: 5, background: '#1EA851', borderRadius: '50%', animation: 'particle 4.3s ease-in-out infinite 1.1s', pointerEvents: 'none', zIndex: 0 }} />
      <div style={{ position: 'fixed', top: 560, left: 300, width: 6, height: 6, background: '#E8C84A', borderRadius: '50%', animation: 'particle 3.9s ease-in-out infinite 0.5s', pointerEvents: 'none', zIndex: 0 }} />
      <div style={{ position: 'fixed', top: 430, right: 420, width: 4, height: 4, background: '#8CE8A8', borderRadius: '50%', animation: 'particle 5.1s ease-in-out infinite 2.1s', pointerEvents: 'none', zIndex: 0 }} />

      <div style={{ minHeight: '100vh', background: '#FEF9EF', fontFamily: '"Plus Jakarta Sans", sans-serif', position: 'relative' }}>

        {/* ── Header ── */}
        <div style={{ position: 'relative', zIndex: 2, maxWidth: 1440, margin: '0 auto', padding: '44px 56px 0' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 24, flexWrap: 'wrap' }}>
            {/* Left: title + live badge */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 6 }}>
                <a href="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 13, fontWeight: 600, color: '#2C4A38', textDecoration: 'none', background: '#EAF5EE', padding: '7px 14px', borderRadius: 100, border: '1px solid rgba(26,92,53,0.12)' }}>← Dashboard</a>
                <h1 style={{ fontSize: 24, fontWeight: 800, color: '#0F2D1F', letterSpacing: -0.8, lineHeight: 1.1 }}>{docType}</h1>
                {pageStatus === 'processing' && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7, background: '#E0F5E8', border: '1px solid rgba(30,168,81,0.32)', borderRadius: 100, padding: '5px 14px', flexShrink: 0 }}>
                    <div style={{ width: 7, height: 7, background: '#1EA851', borderRadius: '50%', animation: 'blink 1.6s ease-in-out infinite' }} />
                    <span style={{ fontSize: 11.5, fontWeight: 800, color: '#1A5C35', letterSpacing: 0.3 }}>LIVE</span>
                  </div>
                )}
                {pageStatus === 'awaiting_approval' && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7, background: '#FFF0D8', border: '1px solid rgba(180,112,16,0.32)', borderRadius: 100, padding: '5px 14px', flexShrink: 0 }}>
                    <span style={{ fontSize: 11.5, fontWeight: 800, color: '#B07010' }}>⏸ AWAITING REVIEW</span>
                  </div>
                )}
                {pageStatus === 'completed' && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7, background: '#E0F5E8', border: '1px solid rgba(30,168,81,0.3)', borderRadius: 100, padding: '5px 14px', flexShrink: 0 }}>
                    <span style={{ fontSize: 11.5, fontWeight: 800, color: '#1A5C35' }}>✅ COMPLETED</span>
                  </div>
                )}
              </div>
              <p style={{ fontSize: 13, color: '#7B9A8A', fontWeight: 400 }}>8 Specialized AI Agents working on your legal document</p>
            </div>
            {/* Right: Est. completion + Doc ID */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 22, background: '#FDFCF8', border: '1px solid rgba(26,92,53,0.09)', borderRadius: 18, padding: '14px 24px', boxShadow: '0 2px 14px rgba(26,92,53,0.06)', flexShrink: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
                <div style={{ width: 38, height: 38, background: 'linear-gradient(135deg,#E0F5E8,#C8E8D0)', borderRadius: 11, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>⏱</div>
                <div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: '#A8C4B4', textTransform: 'uppercase', letterSpacing: 0.6 }}>Est. Completion</div>
                  <div style={{ fontSize: 16, fontWeight: 800, color: '#0F2D1F', letterSpacing: -0.5, marginTop: 1 }}>{estCompletion}</div>
                </div>
              </div>
              <div style={{ width: 1, height: 36, background: 'rgba(26,92,53,0.1)' }} />
              <div>
                <div style={{ fontSize: 10, fontWeight: 700, color: '#A8C4B4', textTransform: 'uppercase', letterSpacing: 0.6 }}>Document ID</div>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#0F2D1F', marginTop: 1, letterSpacing: -0.2, maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{id}</div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Main 2-col grid ── */}
        <div className="mgrid" style={{ position: 'relative', zIndex: 2, maxWidth: 1440, margin: '0 auto', padding: '28px 56px 80px', display: 'grid', gridTemplateColumns: '1fr 430px', gap: 36, alignItems: 'start' }}>

          {/* ════ LEFT: Workflow + panels ════ */}
          <div>
            <div style={{ marginBottom: 20 }}>
              <h2 style={{ fontSize: 16, fontWeight: 800, color: '#0F2D1F', letterSpacing: -0.4 }}>AI Agents Workflow</h2>
              <p style={{ fontSize: 12, color: '#7B9A8A', marginTop: 3 }}>Specialized agents collaborating on your {docType}</p>
            </div>

            {/* ── Vertical workflow graph ── */}
            <div style={{ maxWidth: 560, display: 'flex', flexDirection: 'column' }}>

              {/* new_doc flow */}
              {subGraph === 'new_doc' && (
                <>
                  <AgentNode agentKey="arambha" />
                  <Connector cls={connCls('arambha', 'rachana')} />
                  <AgentNode agentKey="rachana" />
                  <ParallelSection leftKey="parisheelanam" rightKey="jokhim" />
                  {/* stem after merge */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '1px 0' }}>
                    <div className={`cl ${preHitlConn}`} style={{ height: 6 }} />
                  </div>
                  <HitlNode />
                  <Connector cls={hitlToSaheeConn} />
                  <AgentNode agentKey="sahee" />
                  <Connector cls={connCls('sahee', 'sruthi')} />
                  <AgentNode agentKey="sruthi" />

                  {/* ── Other workflows — greyed ── */}
                  <div style={{ marginTop: 22, borderTop: '1px dashed rgba(26,92,53,0.15)', paddingTop: 18 }}>
                    <div style={{ fontSize: 10.5, fontWeight: 700, color: '#A5BFB4', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 14, textAlign: 'center' }}>
                      Available in other workflows
                    </div>
                    <div style={{ opacity: 0.42, pointerEvents: 'none' }}>
                      <AgentNode agentKey="samjoota" />
                    </div>
                    <div style={{ textAlign: 'center', fontSize: 11, color: '#8BAA96', marginBottom: 14, marginTop: -2 }}>
                      📄 Triggers when you <strong>Upload a PDF</strong> (Redline Review flow)
                    </div>
                    <div style={{ opacity: 0.42, pointerEvents: 'none' }}>
                      <AgentNode agentKey="vivada" />
                    </div>
                    <div style={{ textAlign: 'center', fontSize: 11, color: '#8BAA96', marginTop: -2 }}>
                      ⚖️ Triggers when you <strong>Raise a Dispute</strong> (Dispute flow)
                    </div>
                  </div>
                </>
              )}

              {/* redline flow */}
              {subGraph === 'redline' && (
                <>
                  <AgentNode agentKey="arambha" />
                  <ParallelSection leftKey="samjoota" rightKey="jokhim" />
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '1px 0' }}>
                    <div className={`cl ${preHitlConn}`} style={{ height: 6 }} />
                  </div>
                  <HitlNode />
                  <Connector cls={hitlToSaheeConn} />
                  <AgentNode agentKey="sahee" />
                </>
              )}

              {/* dispute flow */}
              {subGraph === 'dispute' && (
                <>
                  <AgentNode agentKey="arambha" />
                  <Connector cls={connCls('arambha', 'vivada')} />
                  <AgentNode agentKey="vivada" />
                  <Connector cls={preHitlConn} />
                  <HitlNode />
                  <Connector cls={hitlToSaheeConn} />
                  <AgentNode agentKey="sahee" />
                </>
              )}

              {/* Completed banner */}
              {pageStatus === 'completed' && (
                <div className="completed-banner" style={{ marginTop: 20, background: 'linear-gradient(135deg,#E0F5E8,#C4E8D4)', border: '1.5px solid rgba(30,168,81,0.38)', borderRadius: 20, padding: '26px 28px', textAlign: 'center' }}>
                  <div style={{ fontSize: 36, marginBottom: 8 }}>🎉</div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: '#0F2D1F', letterSpacing: -0.5, marginBottom: 5 }}>Document Complete!</div>
                  <div style={{ fontSize: 13, color: '#5A7A68', marginBottom: 16 }}>All 8 specialized AI agents completed. Saved to Legal Vault.</div>
                  <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
                    <a href="/dashboard" style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '11px 22px', background: 'linear-gradient(135deg,#1A5C35,#1EA851)', color: '#F0FFF6', borderRadius: 100, textDecoration: 'none', fontSize: 13.5, fontWeight: 700, boxShadow: '0 3px 14px rgba(26,92,53,0.28)' }}>← Dashboard</a>
                    {pollData?.vault_id && (
                      <a
                        href={`/api/download/${pollData.vault_id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ padding: '11px 22px', background: '#FDFCF8', color: '#1A5C35', border: '1.5px solid rgba(26,92,53,0.2)', borderRadius: 100, fontSize: 13.5, fontWeight: 600, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6 }}
                      >📥 Download PDF</a>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* ── HITL Review Panel ── */}
            {pageStatus === 'awaiting_approval' && hp && (
              <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 18, marginTop: 28 }}>
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
                    {hp.low_confidence && <div style={{ marginTop: 12, fontSize: 12, color: '#B07010', background: '#FFF0D8', borderRadius: 8, padding: '8px 12px', fontWeight: 500 }}>⚠️ Low confidence ({Math.round(hp.confidence_score * 100)}%) — manual review advised</div>}
                    {hp.max_loops_reached && <div style={{ marginTop: 8, fontSize: 12, color: '#C03030', background: '#FFE8E8', borderRadius: 8, padding: '8px 12px', fontWeight: 500 }}>⚠️ Max revision loops reached — score below 75</div>}
                  </div>
                  {/* Risk summary */}
                  <div style={{ flex: 1, background: '#FDFCF8', borderRadius: 18, border: '1px solid rgba(26,92,53,0.09)', padding: '20px 22px' }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#5A7A68', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12 }}>Risk Summary</div>
                    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                      <span className="risk-chip" style={{ background: '#FFE8E8', color: '#C03030' }}>🚨 {hp.risk_summary.critical} Critical</span>
                      <span className="risk-chip" style={{ background: '#FFF0D8', color: '#B07010' }}>⚠️ {hp.risk_summary.high} High</span>
                      <span className="risk-chip" style={{ background: '#EAE8F5', color: '#5A7AB0' }}>📊 {hp.risk_summary.total} Total</span>
                      {pollData?.risk_score !== undefined && (
                        <span className="risk-chip" style={{ background: scoreBg(pollData.risk_score), color: riskScoreColor(pollData.risk_score) }}>
                          🛡️ Score {pollData.risk_score}/100
                        </span>
                      )}
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

                {/* Risk flags collapsible */}
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
                  <div
                    aria-label="Document draft preview"
                    role="region"
                    style={{ width: '100%', maxHeight: 420, overflowY: 'auto', background: '#F5FAF6', border: '1.5px solid rgba(26,92,53,0.1)', borderRadius: 12, padding: '16px 18px', scrollbarWidth: 'thin', scrollbarColor: 'rgba(26,92,53,0.18) transparent' }}
                  >
                    <MarkdownRenderer content={hp.draft} />
                  </div>
                </div>

                {/* Approve / Revise */}
                {approveError && <div style={{ fontSize: 12.5, color: '#C03030', background: '#FFE8E8', borderRadius: 10, padding: '10px 14px', fontWeight: 500 }}>⚠️ {approveError}</div>}
                {!showRevision ? (
                  <div style={{ display: 'flex', gap: 14 }}>
                    <button className="approve-btn" onClick={() => handleApprove(true)} disabled={approving}
                      style={{ flex: 1, padding: '16px 24px', background: 'linear-gradient(135deg,#1A5C35,#1EA851)', color: '#fff', borderRadius: 14, fontSize: 15, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, opacity: approving ? 0.7 : 1 }}>
                      {approving ? <><span style={{ width: 16, height: 16, border: '2.5px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.75s linear infinite' }} /> Processing…</> : <>✅ Approve & Generate PDF</>}
                    </button>
                    <button className="approve-btn" onClick={() => setShowRevision(true)}
                      style={{ flex: 1, padding: '16px 24px', background: '#FDFCF8', color: '#2C4A38', borderRadius: 14, fontSize: 15, fontWeight: 700, border: '1.5px solid rgba(26,92,53,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                      ✏️ Request Revision
                    </button>
                  </div>
                ) : (
                  <div style={{ background: '#FDFCF8', borderRadius: 18, border: '1px solid rgba(26,92,53,0.09)', padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#0F2D1F' }}>What should the agents change?</div>
                    <textarea value={feedback} onChange={e => setFeedback(e.target.value)} aria-label="Revision feedback"
                      placeholder="e.g. Strengthen the confidentiality clause, add a 6-month non-compete…"
                      style={{ width: '100%', minHeight: 90, padding: '12px 14px', background: '#F5FAF6', border: '1.5px solid rgba(26,92,53,0.13)', borderRadius: 12, fontFamily: 'inherit', fontSize: 13.5, color: '#0F2D1F', resize: 'vertical', lineHeight: 1.65 }} />
                    <div style={{ display: 'flex', gap: 10 }}>
                      <button className="approve-btn" onClick={() => handleApprove(false)} disabled={approving || !feedback.trim()}
                        style={{ flex: 1, padding: '13px 20px', background: 'linear-gradient(135deg,#1A5C35,#1EA851)', color: '#fff', borderRadius: 12, fontSize: 14, fontWeight: 700, border: 'none', opacity: (approving || !feedback.trim()) ? 0.6 : 1, cursor: (approving || !feedback.trim()) ? 'not-allowed' : 'pointer' }}>
                        {approving ? 'Submitting…' : 'Send for Revision'}
                      </button>
                      <button onClick={() => { setShowRevision(false); setFeedback('') }}
                        style={{ padding: '13px 20px', background: '#FDFCF8', color: '#7B9A8A', borderRadius: 12, fontSize: 14, fontWeight: 600, border: '1.5px solid rgba(26,92,53,0.12)', cursor: 'pointer' }}>Cancel</button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ── Final Result (completed) ── */}
            {pageStatus === 'completed' && pollData && pollData.draft_preview && (
              <div className="fade-in" style={{ marginTop: 28, background: '#FDFCF8', borderRadius: 18, border: '1px solid rgba(26,92,53,0.09)', padding: '20px 22px' }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#5A7A68', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12 }}>Document Preview</div>
                <MarkdownRenderer content={pollData.draft_preview} />
              </div>
            )}

            {/* ── Dispute Analysis (dispute sub-graph) ── */}
            {pollData?.sub_graph === 'dispute' && pollData?.dispute_summary && (
              <div className="fade-in" style={{ marginTop: 28, background: '#FFFFFF', borderRadius: 18, border: '1.5px solid #D4E8DC', padding: '24px 26px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
                  <span style={{ fontSize: 18 }}>⚖️</span>
                  <span style={{ fontSize: 14, fontWeight: 700, color: '#0F2D1F' }}>Dispute Analysis</span>
                  <span style={{ marginLeft: 'auto', fontSize: 11, fontWeight: 700, color: '#1A5C35', background: '#E0F5E8', borderRadius: 20, padding: '3px 10px' }}>Vivada</span>
                </div>
                <MarkdownRenderer content={pollData.dispute_summary} />
              </div>
            )}

            {/* ── Redline Analysis (redline sub-graph) ── */}
            {pollData?.sub_graph === 'redline' && pollData?.negotiation_redlines && pollData.negotiation_redlines.length > 0 && (() => {
              const redlines = pollData.negotiation_redlines!
              const dealBreakers = redlines.filter(r => r.deal_breaker).length
              const score = Math.max(0, 100 - redlines.reduce((acc, r) => acc + (r.deal_breaker ? 20 : r.business_impact === 'CRITICAL' || r.business_impact === 'HIGH' ? 10 : r.business_impact === 'MEDIUM' ? 5 : 0), 0))
              const p1 = redlines.filter(r => r.negotiation_priority === 'P1').length
              const sorted = [...redlines].sort((a, b) => {
                const pri: Record<string, number> = { P1: 0, P2: 1, P3: 2 }
                return (pri[a.negotiation_priority] ?? 2) - (pri[b.negotiation_priority] ?? 2)
              })
              function impactColor(impact: string) {
                const i = impact.toUpperCase()
                if (i === 'CRITICAL') return { color: '#C03030', bg: '#FFE8E8', border: '#E09090' }
                if (i === 'HIGH')     return { color: '#B07010', bg: '#FFF0D8', border: '#E0B870' }
                if (i === 'MEDIUM')   return { color: '#5A7AB0', bg: '#EAE8F5', border: '#A8B8DC' }
                return { color: '#1A5C35', bg: '#E0F5E8', border: '#7BC89A' }
              }
              return (
                <div className="fade-in" style={{ marginTop: 28, background: '#FFFFFF', borderRadius: 18, border: '1.5px solid #D4E8DC', padding: '24px 26px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                    <span style={{ fontSize: 18 }}>🤝</span>
                    <span style={{ fontSize: 14, fontWeight: 700, color: '#0F2D1F' }}>Redline Analysis</span>
                    <span style={{ marginLeft: 'auto', fontSize: 11, fontWeight: 700, color: '#1A5C35', background: '#E0F5E8', borderRadius: 20, padding: '3px 10px' }}>Samjoota · {redlines.length}</span>
                  </div>
                  {/* Summary row */}
                  <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 16 }}>
                    <span className="risk-chip" style={{ background: score >= 70 ? '#E0F5E8' : score >= 40 ? '#FFF0D8' : '#FFE8E8', color: score >= 70 ? '#1A5C35' : score >= 40 ? '#B07010' : '#C03030' }}>
                      Score {score}/100
                    </span>
                    {dealBreakers > 0 && (
                      <span className="risk-chip" style={{ background: '#FFE8E8', color: '#C03030' }}>🚨 {dealBreakers} deal-breaker{dealBreakers !== 1 ? 's' : ''}</span>
                    )}
                    {p1 > 0 && (
                      <span className="risk-chip" style={{ background: '#FFF0D8', color: '#B07010' }}>P1: {p1} must-fix</span>
                    )}
                  </div>
                  {/* Clause cards */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {sorted.map((r, i) => {
                      const ic = impactColor(r.business_impact)
                      return (
                        <div key={i} style={{ background: '#F7FBF8', borderRadius: 10, padding: '12px 14px', borderLeft: `3px solid ${ic.border}` }}>
                          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 6 }}>
                            <span style={{ fontSize: 12, fontWeight: 700, color: '#0F2D1F', flex: 1, lineHeight: 1.4 }}>{r.clause_reference || `Clause ${i + 1}`}</span>
                            {r.deal_breaker && <span className="risk-chip" style={{ background: '#FFE8E8', color: '#C03030', flexShrink: 0 }}>🚨 Deal-Breaker</span>}
                            <span className="risk-chip" style={{ background: ic.bg, color: ic.color, flexShrink: 0 }}>{r.negotiation_priority} · {r.business_impact}</span>
                          </div>
                          {r.current_text && (
                            <div style={{ fontSize: 11.5, color: '#7B9A8A', background: '#F0F4F2', borderRadius: 6, padding: '5px 9px', marginBottom: 6, fontStyle: 'italic', lineHeight: 1.5 }}>
                              "{r.current_text.slice(0, 140)}{r.current_text.length > 140 ? '…' : ''}"
                            </div>
                          )}
                          <div style={{ fontSize: 11.5, color: '#4A6858', lineHeight: 1.55, marginBottom: r.suggested_redline || r.fallback_position ? 6 : 0 }}>{r.reason}</div>
                          {r.suggested_redline && (
                            <div style={{ background: '#F5FFF8', border: '1px solid rgba(26,92,53,0.12)', borderRadius: 7, padding: '7px 10px', marginBottom: 5, fontFamily: 'monospace', fontSize: 11 }}>
                              {r.suggested_redline.split('\n').map((line, li) => (
                                <div key={li} style={{ color: line.startsWith('+') ? '#1A5C35' : line.startsWith('-') ? '#C03030' : '#5A7A68', lineHeight: 1.6 }}>{line}</div>
                              ))}
                            </div>
                          )}
                          {(r.fallback_position || r.walkaway_position) && (
                            <div style={{ fontSize: 10.5, color: '#7B9A8A', lineHeight: 1.6, marginTop: 4 }}>
                              {r.fallback_position && <div><span style={{ fontWeight: 700, color: '#B07010' }}>Fallback:</span> {r.fallback_position}</div>}
                              {r.walkaway_position && <div><span style={{ fontWeight: 700, color: '#C03030' }}>Walk away:</span> {r.walkaway_position}</div>}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })()}

            {/* ── Obligations (shown post-completion when Sruthi extracted obligations) ── */}
            {pollData?.obligations && pollData.obligations.length > 0 && (
              <div className="fade-in" style={{ marginTop: 28, background: '#FFFFFF', borderRadius: 18, border: '1.5px solid #D4E8DC', padding: '24px 26px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
                  <span style={{ fontSize: 18 }}>📅</span>
                  <span style={{ fontSize: 14, fontWeight: 700, color: '#0F2D1F' }}>Obligations & Deadlines</span>
                  <span style={{ marginLeft: 'auto', fontSize: 11, fontWeight: 700, color: '#1A5C35', background: '#E0F5E8', borderRadius: 20, padding: '3px 10px' }}>Sruthi · {pollData.obligations.length}</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {pollData.obligations.map((obl, i) => (
                    <div key={i} style={{ background: '#F7FBF8', borderRadius: 10, padding: '12px 14px', borderLeft: `3px solid ${obl.priority === 'HIGH' ? '#C03030' : obl.priority === 'MEDIUM' ? '#B07010' : '#1A5C35'}` }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, marginBottom: 4 }}>
                        <span style={{ fontSize: 12.5, fontWeight: 600, color: '#0F2D1F', lineHeight: 1.4 }}>{obl.action}</span>
                        <span style={{ fontSize: 10, fontWeight: 700, color: obl.priority === 'HIGH' ? '#C03030' : obl.priority === 'MEDIUM' ? '#B07010' : '#1A5C35', background: obl.priority === 'HIGH' ? '#FFE8E8' : obl.priority === 'MEDIUM' ? '#FFF0D8' : '#E0F5E8', borderRadius: 6, padding: '2px 7px', whiteSpace: 'nowrap', flexShrink: 0 }}>{obl.priority}</span>
                      </div>
                      <div style={{ fontSize: 11, color: '#5A7A68', marginBottom: obl.estimated_penalty ? 4 : 0 }}>
                        <span style={{ fontWeight: 600 }}>📅 {obl.deadline}</span>
                        {obl.deadline_days > 0 && <span style={{ marginLeft: 6, color: '#8BAA96' }}>({obl.deadline_days}d)</span>}
                        {obl.clause_reference && <span style={{ marginLeft: 8, color: '#A8C4B4' }}>{obl.clause_reference}</span>}
                      </div>
                      {obl.estimated_penalty && <div style={{ fontSize: 10.5, color: '#C03030', fontWeight: 500 }}>⚠ {obl.estimated_penalty}</div>}
                      {obl.reminder_schedule && obl.reminder_schedule.length > 0 && (
                        <div style={{ marginTop: 5, display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                          {obl.reminder_schedule.map((r, j) => (
                            <span key={j} style={{ fontSize: 9.5, background: '#EAF4EE', color: '#3A6B4A', borderRadius: 4, padding: '1px 6px' }}>{r.replace(/_/g, ' ')}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ════ RIGHT: Sticky panel ════ */}
          <div className="right-panel" style={{ position: 'sticky', top: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* ── Live Agent Activity ── */}
            <div style={{ background: '#FDFCF8', borderRadius: 20, border: '1px solid rgba(26,92,53,0.09)', boxShadow: '0 4px 22px rgba(26,92,53,0.06)', overflow: 'hidden' }}>
              <div style={{ padding: '16px 20px 12px', borderBottom: '1px solid rgba(26,92,53,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                  <span style={{ fontSize: 15 }}>💚</span>
                  <h3 style={{ fontSize: 15, fontWeight: 800, color: '#0F2D1F', letterSpacing: -0.3 }}>Live Agent Activity</h3>
                </div>
                {pageStatus === 'processing' && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#E0F5E8', borderRadius: 100, padding: '4px 11px', border: '1px solid rgba(30,168,81,0.22)' }}>
                    <div style={{ width: 6, height: 6, background: '#1EA851', borderRadius: '50%', animation: 'blink 1.6s ease-in-out infinite' }} />
                    <span style={{ fontSize: 11, fontWeight: 700, color: '#1A5C35' }}>Live</span>
                  </div>
                )}
              </div>
              <div className="scr" style={{ maxHeight: 232, overflowY: 'auto', padding: '8px 14px 12px' }}>
                {activityLog.length === 0 ? (
                  <div style={{ padding: '22px 0', textAlign: 'center' }}>
                    <div style={{ fontSize: 26, marginBottom: 7 }}>⏳</div>
                    <div style={{ fontSize: 12, color: '#A8C4B4', fontWeight: 500 }}>Agents starting up…</div>
                  </div>
                ) : (
                  [...activityLog].reverse().map((entry) => (
                    <div key={`${entry.key}-${entry.ts}`} className="log-entry" style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '9px 8px', borderBottom: '1px solid rgba(26,92,53,0.05)' }}>
                      <div style={{ fontSize: 10.5, color: '#A8C4B4', fontWeight: 600, flexShrink: 0, minWidth: 76, paddingTop: 1.5 }}>
                        {new Date(entry.ts).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })}
                      </div>
                      <div style={{ width: 28, height: 28, background: '#EAF5EE', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, flexShrink: 0 }}>{entry.icon}</div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 12.5, fontWeight: 700, color: '#0F2D1F', lineHeight: 1.3 }}>{entry.name} completed</div>
                        <div style={{ fontSize: 11.5, color: '#7B9A8A', marginTop: 2, lineHeight: 1.4 }}>{entry.summary}</div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* ── Document Summary ── */}
            <div style={{ background: '#FDFCF8', borderRadius: 20, border: '1px solid rgba(26,92,53,0.09)', boxShadow: '0 4px 22px rgba(26,92,53,0.06)', padding: '18px 20px' }}>
              <h3 style={{ fontSize: 15, fontWeight: 800, color: '#0F2D1F', letterSpacing: -0.3, marginBottom: 16 }}>{pollData?.sub_graph === 'dispute' ? 'Dispute Summary' : 'Document Summary'}</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 16, alignItems: 'start' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
                  <div>
                    <div style={{ fontSize: 10, fontWeight: 700, color: '#A8C4B4', textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 3 }}>Document Type</div>
                    <div style={{ fontSize: 15, fontWeight: 800, color: '#0F2D1F' }}>{docType}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 10, fontWeight: 700, color: '#A8C4B4', textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 3 }}>Jurisdiction</div>
                    <div style={{ fontSize: 13.5, fontWeight: 700, color: '#0F2D1F' }}>{pollData?.hitl_payload?.parties?.[0] ? 'India' : '—'}</div>
                  </div>
                  {hp?.parties && hp.parties.length > 0 && (
                    <div>
                      <div style={{ fontSize: 10, fontWeight: 700, color: '#A8C4B4', textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 3 }}>Parties</div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#0F2D1F', lineHeight: 1.55 }}>
                        {hp.parties.map(p => p.name).join('\n')}
                      </div>
                    </div>
                  )}
                </div>
                {/* Score gauge */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, flexShrink: 0 }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: '#A8C4B4', textTransform: 'uppercase', letterSpacing: 0.6, textAlign: 'center', marginBottom: 4 }}>Review Score</div>
                  <div style={{ position: 'relative', width: 80, height: 80 }}>
                    <svg width="80" height="80" viewBox="0 0 80 80">
                      <circle cx="40" cy="40" r="33" fill="none" stroke="#E0F5E8" strokeWidth="7.5" />
                      <circle cx="40" cy="40" r="33" fill="none" stroke="#1EA851" strokeWidth="7.5"
                        strokeDasharray="207" strokeDashoffset={gaugeOffset} strokeLinecap="round"
                        transform="rotate(-90 40 40)" style={{ transition: 'stroke-dashoffset 1.2s ease' }} />
                    </svg>
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ fontSize: 21, fontWeight: 800, color: '#0F2D1F', lineHeight: 1 }}>{gaugeScore > 0 ? gaugeScore : '—'}</span>
                      {gaugeScore > 0 && <span style={{ fontSize: 9, color: '#7B9A8A', fontWeight: 600, lineHeight: 1 }}>/100</span>}
                    </div>
                  </div>
                </div>
              </div>

              {/* Risk + confidence + obligations */}
              <div style={{ marginTop: 14, paddingTop: 13, borderTop: '1px solid rgba(26,92,53,0.07)', display: 'flex', flexDirection: 'column', gap: 10 }}>
                {riskLevel && (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 11.5, fontWeight: 600, color: '#7B9A8A' }}>Risk Level</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                      <div style={{ width: 9, height: 9, background: riskLevel.dot, borderRadius: '50%', boxShadow: `0 0 0 2px ${riskLevel.dot}40` }} />
                      <span style={{ fontSize: 13, fontWeight: 700, color: '#0F2D1F' }}>{riskLevel.label}</span>
                    </div>
                  </div>
                )}
                {gaugeScore > 0 && (
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 5 }}>
                      <span style={{ fontSize: 11.5, fontWeight: 600, color: '#7B9A8A' }}>Quality Score</span>
                      <span style={{ fontSize: 13.5, fontWeight: 800, color: '#0F2D1F' }}>{gaugeScore}%</span>
                    </div>
                    <div style={{ height: 7, background: '#E8F5EE', borderRadius: 100, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${gaugeScore}%`, background: 'linear-gradient(90deg,#1A5C35,#1EA851)', borderRadius: 100, transition: 'width 1.4s ease' }} />
                    </div>
                  </div>
                )}
                {pollData?.risk_score !== undefined && pollData.risk_score < 100 && (
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 5 }}>
                      <span style={{ fontSize: 11.5, fontWeight: 600, color: '#7B9A8A' }}>Risk Score</span>
                      <span style={{ fontSize: 13.5, fontWeight: 800, color: riskScoreColor(pollData.risk_score) }}>
                        {pollData.risk_score} <span style={{ fontSize: 10, fontWeight: 600, color: '#A8C4B4' }}>· {riskScoreLabel(pollData.risk_score)}</span>
                      </span>
                    </div>
                    <div style={{ height: 7, background: '#E8F5EE', borderRadius: 100, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${pollData.risk_score}%`, background: `linear-gradient(90deg,${riskScoreColor(pollData.risk_score)},${pollData.risk_score >= 80 ? '#1EA851' : pollData.risk_score >= 50 ? '#E8C840' : '#E05050'})`, borderRadius: 100, transition: 'width 1.4s ease' }} />
                    </div>
                  </div>
                )}
                {pollData && (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 11.5, fontWeight: 600, color: '#7B9A8A' }}>Obligations Identified</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#0F2D1F' }}>{pollData.obligations_count}</span>
                  </div>
                )}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 11.5, fontWeight: 600, color: '#7B9A8A' }}>Est. Completion</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#0F2D1F' }}>{estCompletion}</span>
                </div>
              </div>
            </div>

            {/* ── HITL info card ── */}
            <div style={{ background: 'linear-gradient(135deg,#FFFBE4,#FFF4B0)', borderRadius: 20, border: '1.5px solid rgba(200,160,16,0.32)', boxShadow: '0 4px 22px rgba(200,160,16,0.08)', padding: '18px 20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 13, marginBottom: 11 }}>
                <div style={{ width: 46, height: 46, background: 'linear-gradient(135deg,#FFEC80,#E8C050)', borderRadius: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, boxShadow: '0 3px 12px rgba(200,140,0,0.18)' }}>👥</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14.5, fontWeight: 800, color: '#6A4A00', letterSpacing: -0.3 }}>Human-in-the-Loop</div>
                  <div style={{ fontSize: 11.5, color: '#9A7820', marginTop: 1, fontWeight: 500 }}>Your approval is required after processing</div>
                </div>
                {hitlState === 'pending' && <div style={{ background: 'linear-gradient(135deg,#F0E060,#E0B840)', color: '#6A4A00', fontSize: 11, fontWeight: 800, padding: '5px 13px', borderRadius: 100, flexShrink: 0, border: '1px solid rgba(200,150,0,0.28)' }}>Pending</div>}
                {hitlState === 'done'    && <div style={{ background: '#E0F5E8', color: '#1A5C35', fontSize: 11, fontWeight: 800, padding: '5px 13px', borderRadius: 100, flexShrink: 0 }}>Approved ✓</div>}
                {hitlState === 'waiting' && <div style={{ background: 'rgba(200,160,16,0.12)', color: '#9A7820', fontSize: 11, fontWeight: 700, padding: '5px 13px', borderRadius: 100, flexShrink: 0 }}>Waiting</div>}
              </div>
              <p style={{ fontSize: 12.5, color: '#7A6020', lineHeight: 1.62 }}>We will notify you when the document is ready for your review. You can approve or request revisions before final signing and delivery.</p>
            </div>

            {/* Warming notice */}
            {warming && pageStatus === 'processing' && (
              <div style={{ fontSize: 12.5, color: '#B07010', background: '#FFF0D8', borderRadius: 12, padding: '10px 14px', fontWeight: 500, border: '1px solid rgba(180,112,16,0.18)' }}>⏱ Backend warming up (free tier) — this can take up to 30s. Hang tight…</div>
            )}
          </div>

        </div>
      </div>
    </>
  )
}
