'use client'

import { ALL_AGENTS } from '@/lib/agents'

const STYLES = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  .agent-card { transition: transform 0.22s, box-shadow 0.22s; }
  .agent-card:hover { transform: translateY(-5px); box-shadow: 0 16px 48px rgba(26,92,53,0.16) !important; }
  .back-btn { transition: all 0.18s; text-decoration: none; }
  .back-btn:hover { background: #E0F5E8 !important; color: #1A5C35 !important; }
  .agent-img { transition: transform 0.3s; }
  .agent-card:hover .agent-img { transform: scale(1.06); }
`

const LLM_LABEL: Record<string, { label: string; color: string; bg: string }> = {
  'llama-3.3-70b-versatile': { label: '70B · Reasoning', color: '#5A3AB0', bg: '#EDE8F5' },
  'llama-3.1-8b-instant':    { label: '8B · Fast',       color: '#1A5C35', bg: '#E0F5E8' },
  'Tool-based':              { label: 'Tool-based',       color: '#B07010', bg: '#FFF0D8' },
}

export default function AgentsPage() {
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
          <span style={{ fontSize: 17, fontWeight: 800, color: '#0F2D1F', letterSpacing: -0.4 }}>AI Agents</span>
          <span style={{ fontSize: 13, color: '#8BAA96', marginLeft: 10 }}>Your legal intelligence team</span>
        </div>
        <div style={{ marginLeft: 'auto', background: '#E8F5D0', border: '1px solid rgba(78,138,16,0.22)', borderRadius: 100, padding: '5px 14px', fontSize: 12, fontWeight: 700, color: '#4D8A10' }}>
          8 Agents Active
        </div>
      </div>

      <div style={{ maxWidth: 1060, margin: '0 auto', padding: '36px 24px' }}>

        {/* Hero */}
        <div style={{ textAlign: 'center', marginBottom: 44 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#1EA851', letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 10 }}>Powered by Groq + LangGraph</div>
          <h1 style={{ fontSize: 32, fontWeight: 900, color: '#0F2D1F', letterSpacing: -1.2, marginBottom: 12 }}>
            Meet the Vaakya Team
          </h1>
          <p style={{ fontSize: 15, color: '#5A7A68', maxWidth: 520, margin: '0 auto', lineHeight: 1.65 }}>
            8 specialized AI agents work in parallel to draft, review, risk-flag, negotiate and deliver your legal documents — all under Indian Contract Act 1872.
          </p>
        </div>

        {/* Pipeline flow badge */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginBottom: 40, flexWrap: 'wrap' }}>
          {['New Document', 'Redline Review', 'Dispute Resolution'].map((flow, i) => (
            <div key={flow} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              {i > 0 && <div style={{ width: 20, height: 1, background: 'rgba(26,92,53,0.2)' }} />}
              <div style={{ padding: '6px 14px', background: '#fff', border: '1.5px solid rgba(26,92,53,0.15)', borderRadius: 100, fontSize: 12.5, fontWeight: 600, color: '#2C4A38', boxShadow: '0 2px 8px rgba(26,92,53,0.06)' }}>
                {flow}
              </div>
            </div>
          ))}
        </div>

        {/* Agent grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
          {ALL_AGENTS.map(agent => {
            const llmMeta = LLM_LABEL[agent.llm] ?? { label: agent.llm, color: '#5A7AB0', bg: '#EAE8F5' }
            return (
              <div
                key={agent.key}
                className="agent-card"
                style={{ background: '#fff', borderRadius: 20, border: '1px solid rgba(26,92,53,0.09)', boxShadow: '0 4px 20px rgba(26,92,53,0.07)', overflow: 'hidden' }}
              >
                {/* Green accent top border */}
                <div style={{ height: 4, background: 'linear-gradient(90deg,#1A5C35,#1EA851)' }} />

                {/* Avatar */}
                <div style={{ padding: '24px 24px 16px', display: 'flex', alignItems: 'flex-start', gap: 16 }}>
                  <div style={{ width: 72, height: 72, borderRadius: 16, overflow: 'hidden', border: '2px solid rgba(26,92,53,0.12)', flexShrink: 0, background: '#F0FAF3' }}>
                    <img
                      src={agent.avatarUrl}
                      alt={agent.name}
                      className="agent-img"
                      style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                    />
                  </div>
                  <div style={{ flex: 1, minWidth: 0, paddingTop: 4 }}>
                    <div style={{ fontSize: 18, fontWeight: 800, color: '#0F2D1F', letterSpacing: -0.4, lineHeight: 1.1 }}>
                      {agent.name}
                    </div>
                    <div style={{ fontSize: 13, color: '#8BAA96', marginTop: 2, fontStyle: 'italic' }}>
                      {agent.telugu}
                    </div>
                    <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
                      <div style={{ fontSize: 11.5, fontWeight: 700, padding: '3px 9px', borderRadius: 100, background: '#E0F5E8', color: '#1A5C35' }}>
                        {agent.icon} {agent.role}
                      </div>
                      {agent.tavily && (
                        <div style={{ fontSize: 11, fontWeight: 700, padding: '3px 9px', borderRadius: 100, background: '#FFF0D8', color: '#B07010' }}>
                          🔍 Tavily
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div style={{ padding: '0 24px 20px' }}>
                  <p style={{ fontSize: 13, color: '#4A6A58', lineHeight: 1.6 }}>
                    {agent.description}
                  </p>
                </div>

                {/* Footer */}
                <div style={{ borderTop: '1px solid rgba(26,92,53,0.07)', padding: '12px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#FDFCF8' }}>
                  <div style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 100, background: llmMeta.bg, color: llmMeta.color }}>
                    {llmMeta.label}
                  </div>
                  <div style={{ display: 'flex', gap: 4 }}>
                    {agent.flows.map(f => (
                      <div key={f} style={{ fontSize: 10.5, fontWeight: 600, padding: '2px 8px', borderRadius: 100, background: 'rgba(26,92,53,0.07)', color: '#5A7A68' }}>
                        {f === 'new_doc' ? 'New Doc' : f === 'redline' ? 'Redline' : 'Dispute'}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Footer note */}
        <div style={{ textAlign: 'center', marginTop: 48, padding: '24px', background: '#fff', borderRadius: 16, border: '1px solid rgba(26,92,53,0.09)', boxShadow: '0 2px 12px rgba(26,92,53,0.05)' }}>
          <div style={{ fontSize: 13, color: '#5A7A68', lineHeight: 1.7 }}>
            All agents operate on <strong style={{ color: '#1A5C35' }}>Indian Contract Act 1872</strong> by default ·
            HITL checkpoint mandatory before any document is signed ·
            Max 3 review loops between Rachana ↔ Parisheelanam
          </div>
        </div>
      </div>
    </div>
  )
}
